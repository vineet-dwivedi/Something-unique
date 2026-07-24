import express from "express";
import morgan from "morgan";
import fs from "fs";
import cors from "cors";

const WORKING_DIR = '/workspace' 

const app = express();
app.use(morgan('dev'));
app.use(cors())

app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Hello world",
        status: "success"
    })
})

app.get("/list-files",async (req,res) => {
    const elements = await fs.promises.readdir(WORKING_DIR)

    res.status(200).json({
        message: 'Elements in working directory',
        elements
    })
})

app.get("read-files",async (req,res)=>{
    const files = req.query.files;

    if(!files) {
        return res.status(400).json({
            message: 'No files specified in query param',
            status: 'error'
        })
    }

    const fileList = files.split(',');

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = `${WORKING_DIR}/$(file)`;
        try{
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return {
                [filePath]: content,
            }
        } catch (err){
            return {
                [filePath]: `Error reading file: ${err.message}`,
            }
        }
    }));

    res.status(200).json({
        message: 'File contents',
        files: results
    })
})

export default app;