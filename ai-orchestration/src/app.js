import express from "express";
import morgan from "morgan";
import agent from "./agents/code.agent.js";

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
        const resolvedApiBaseUrl = apiBaseUrl || `http://sandbox-service-${sandboxId}:3000`;
        const updatedFiles = [];
        const toolLogs = [];

        await agent.invoke({
            messages: [{
                role: "user",
                content: task
            }]
        }, {
            context: {
                apiBaseUrl: resolvedApiBaseUrl,
                projectId: sandboxId,
                updatedFiles,
                writer: (message) => {
                    toolLogs.push(String(message).trim());
                    console.log(`[agent-tool] ${String(message).trim()}`);
                }
            }
        });
        const uniqueUpdatedFiles = [...new Set(updatedFiles)];
        const createdFiles = [];
        const changedFiles = [
            ...createdFiles.map((file) => ({ file, changeType: "created" })),
            ...uniqueUpdatedFiles.map((file) => ({ file, changeType: "updated" }))
        ];

        return res.status(200).json({
            message: "Agent run completed",
            sandboxId: sandboxId || null,
            changedFiles,
            createdFiles,
            updatedFiles: uniqueUpdatedFiles
        });
    } catch (error) {
        return res.status(500).json({
            message: "Agent run failed",
            error: error.message
        });
    }
})

export default app;
