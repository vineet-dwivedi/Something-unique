import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import sandboxRouter from "./routes/sandbox.routes.js";

const app = express();
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/sandbox/health",(req,res)=>{
    res.status(200).json({message:"Server is healthy!"})
})

app.use("/api/sandbox",sandboxRouter);

export default app;
