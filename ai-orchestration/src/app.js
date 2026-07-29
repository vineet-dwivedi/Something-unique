import express from "express";
import morgan from "morgan";
import { createModel } from "./agents/agent.config.js";
import { runAgent } from "./agents/agent.workflow.js";

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/ai/healthz', (req,res)=>{
    res.status(200).json({status: 'ok'});
})

app.post('/api/ai/run', async (req, res) => {
    const task = String(req.body?.task ?? "").trim();
    const sandboxId = String(req.body?.sandboxId ?? "").trim();
    const apiBaseUrl = String(req.body?.apiBaseUrl ?? "").trim();

    if (!task) {
        return res.status(400).json({
            message: "Missing task"
        });
    }

    if (!sandboxId && !apiBaseUrl) {
        return res.status(400).json({
            message: "Provide either sandboxId or apiBaseUrl"
        });
    }

    try {
        const model = createModel();
        const resolvedApiBaseUrl = apiBaseUrl || `http://sandbox-service-${sandboxId}:3000`;
        const result = await runAgent({
            task,
            model,
            apiBaseUrl: resolvedApiBaseUrl
        });
        const createdFiles = result?.createdFiles ?? [];
        const updatedFiles = result?.updatedFiles ?? [];
        const changedFiles = [
            ...createdFiles.map((file) => ({ file, changeType: "created" })),
            ...updatedFiles.map((file) => ({ file, changeType: "updated" }))
        ];

        return res.status(200).json({
            message: "Agent run completed",
            sandboxId: sandboxId || null,
            changedFiles,
            createdFiles,
            updatedFiles
        });
    } catch (error) {
        return res.status(500).json({
            message: "Agent run failed",
            error: error.message
        });
    }
})

export default app;
