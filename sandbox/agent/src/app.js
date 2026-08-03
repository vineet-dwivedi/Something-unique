import express from "express";
import morgan from "morgan";
import fs from "fs";
import cors from "cors";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import pty from "node-pty";
import os from "os";

const WORKING_DIR = '/workspace' 

const app = express();
const httpServer = http.createServer(app);

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const io = new Server(httpServer,{
    perMessageDeflate: false,
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
})

/**
 * @route GET /
 * @description health check endpoint for the agent service.
 */
app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Hello world",
        status: "success"
    })
})

const shell = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : 'bash');

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: "/workspace",
    env: process.env
});

ptyProcess.onData((data) => {
    io.emit('terminal-output', data);
});

ptyProcess.onExit(({ exitCode, signal }) => {
    console.log(`PTY process exited with code ${exitCode} and signal ${signal}`);
    io.emit('terminal-exit', { exitCode, signal });
});

io.on("connection",(socket)=>{
    console.log(`Client connected: ${socket.id}`);

    socket.on("terminal-input",(data)=>{
        ptyProcess.write(data);
    });

    socket.on("disconnect",()=>{
        console.log(`Client disconnected: ${socket.id}`);
    });
});

function resolveWorkspacePath(file) {
    let clean = String(file || '').trim();
    if (clean.startsWith('/workspace/')) {
        clean = clean.substring('/workspace/'.length);
    } else if (clean.startsWith('workspace/')) {
        clean = clean.substring('workspace/'.length);
    } else if (clean.startsWith('/app/')) {
        clean = clean.substring('/app/'.length);
    } else if (clean.startsWith('app/')) {
        clean = clean.substring('app/'.length);
    }
    if (clean.startsWith('/')) {
        clean = clean.slice(1);
    }
    return path.join(WORKING_DIR, clean);
}

/**
 * @route GET /list-files
 * @description lists all files and folders in the working directory. Returns a JSON object with the top-level entries in the workspace.
 */
app.get("/list-files",async (req,res) => {
    const listFiles = async (dir,baseDir) =>{
        const entries = await fs.promises.readdir(dir, {withFileTypes: true});
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir,entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            //Exclude certain directories
            if(entry.isDirectory() && ['node_modules', '.git', 'dist'].includes(entry.name)){
                continue;
            }

            if(entry.isDirectory()){
                files.push(...await listFiles(fullPath, baseDir));
            }else {
                files.push(relativePath);
            }
        }

        return files;
    }
    
    try{
        const files = await listFiles(WORKING_DIR,WORKING_DIR);
        res.status(200).json({
            message: 'Files listed directory',
            files,
        })
    } catch (err){
        res.status(500).json({
            message: `Error listing files ${err.message}`,
            status: 'error'
        })
    }

})

/**
 * @route GET /read-files
 * @description reads one or more files passed through the query string and returns their contents.
 */
app.get("/read-files",async (req,res)=>{
    const files = req.query.files;

    if(!files) {
        return res.status(400).json({
            message: 'No files specified in query param',
            status: 'error'
        })
    }

    const fileList = files.split(',');

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = resolveWorkspacePath(file);
        try{
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return {
                [filePath.replace(WORKING_DIR, '')]: content,
            }
        } catch (err){
            return {
                [filePath.replace(WORKING_DIR, '')]: `Error reading file: ${err.message}`,
            }
        }
    }));

    res.status(200).json({
        message: 'File contents',
        files: results
    })
})

/**
 * @route PATCH /update-files
 * @description updates existing files with the provided content payload.
 */
app.patch("/update-files", async (req, res) => {
    const rawUpdates = req.body.updates || req.body.files;

    if (!rawUpdates || !Array.isArray(rawUpdates)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected a JSON object with an "updates" or "files" property containing an array.',
            status: 'error'
        });
    }

    try {
        const results = await Promise.all(rawUpdates.map(async (update) => {
            let file = update.file;
            let content = update.content;

            if (!file && typeof update === 'object') {
                const keys = Object.keys(update);
                if (keys.length > 0) {
                    file = keys[0];
                    content = update[keys[0]];
                }
            }

            const filePath = resolveWorkspacePath(file);

            try {
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                await fs.promises.writeFile(filePath, content ?? '', 'utf-8');
                return {
                    [filePath]: 'File updated successfully',
                };
            } catch (err) {
                return {
                    [filePath]: `Error updating file: ${err.message}`,
                };
            }
        }));

        res.status(200).json({
            message: "File update results",
            results
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
});

/**
 * @route POST /create-files
 * @description creates new files from the request body payload.
 */
app.post("/create-files", async (req,res)=>{
    const files = req.body.files;

    if(!files || !Array.isArray(files)){
        return res.status(400).json({
            message: 'Invalid request body. Expected a JSON object with a "files" property.',
            status: 'error'
        });
    }

    const results = await Promise.all(files.map(async (fileObj) =>{
        let file = fileObj.file;
        let content = fileObj.content;

        if (!file && typeof fileObj === 'object') {
            const keys = Object.keys(fileObj);
            if (keys.length > 0) {
                file = keys[0];
                content = fileObj[keys[0]];
            }
        }

        const filePath = resolveWorkspacePath(file);
        try{
            await fs.promises.mkdir(path.dirname(filePath), {recursive: true});
            await fs.promises.writeFile(filePath, content ?? '', 'utf-8');
            return {
                [filePath]: 'File created successfully',
            }
        } catch (err) {
            return {
                [filePath]: `Error creating file: ${err.message}`,
            }
        }
    }))

    res.status(200).json({
        message: 'File creation results',
        results,
    });
})

export default httpServer;
