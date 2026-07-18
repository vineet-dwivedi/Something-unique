import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/sandbox/health",(req,res)=>{
    res.status(200).json({message:"Server is healthy!"})
})

export default app;