import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createPods } from "./kubernetes/pod.js";
import { createService } from "./kubernetes/service.js";
import { v7 as uuid } from "uuid";

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/sandbox/health",(req,res)=>{
    res.status(200).json({message:"Server is healthy!"})
})

app.post("/api/sandbox/start", async (req,res)=>{
    const sandboxId = uuid();
    const baseDomain = process.env.SANDBOX_BASE_DOMAIN || "127.0.0.1.nip.io";
    await Promise.all([
        createPods(sandboxId),
        createService(sandboxId)
    ])

    return res.status(200).json({
        message: "Sandbox started successfully!",
        sandboxId,
        previewUrl: `http://${sandboxId}.preview.${baseDomain}`,
        agentUrl: `http://${sandboxId}.agent.${baseDomain}`
    });
});

export default app;
