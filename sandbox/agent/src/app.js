import express from "express";
import morgan from "morgan";
import fs from "fs";
import cors from "cors";
import path from "path";

const WORKING_DIR = '/workspace' 

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

/**
 * @route GET /list-files
 * @description lists all files and folders in the working directory. Returns a JSON object with the top-level entries in the workspace.
 * - eg, {
 *    "message": "Elements in working directory",
 *    "elements": ["file1.txt", "src", "README.md"]
 * }
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
 * - eg, /read-files?files=file1.txt,src/file2.txt
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
        const filePath = path.join(WORKING_DIR, file);
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
 * - eg, {
 *    "updates": [
 *      { "file": "file1.txt", "content": "new content" },
 *      { "file": "src/file2.txt", "content": "updated content" }
 *    ]
 * }
 */
app.patch("/update-files", async (req, res) => {
    // 1. Destructure "updates" from req.body
    const { updates } = req.body;

    // 2. Validate that "updates" exists and IS an array
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected a JSON object with an "updates" property containing an array of file updates.',
            status: 'error'
        });
    } // <-- Close the if statement HERE!

    // 3. Process the file updates
    try {
        const results = await Promise.all(updates.map(async (update) => {
            const { file, content } = update;
            const filePath = path.join(WORKING_DIR, file);

            try {
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                await fs.promises.writeFile(filePath, content, 'utf-8');
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
 * - eg, {
 *    "files": [
 *      { "file": "file1.txt", "content": "hello" },
 *      { "file": "src/file2.txt", "content": "world" }
 *    ]
 * }
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
        const {file,content} = fileObj;
        const filePath = path.join(WORKING_DIR, file);
        try{
            await fs.promises.mkdir(path.dirname(filePath), {recursive: true});
            await fs.promises.writeFile(filePath, content, 'utf-8');
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

export default app;
