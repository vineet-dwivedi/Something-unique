import express from "express";
import morgan from "morgan";
import fs from "fs";

const WORKING_DIR = '/workspace' 

const app = express();
app.use(morgan('dev'));

app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Hello world",
        status: "success"
    })
})

app.get("/list-files",async (req,res) => {
    const files = await fs.promises.readdir(WORKING_DIR)
})

export default app;