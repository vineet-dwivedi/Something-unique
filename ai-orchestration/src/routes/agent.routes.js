import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    const { message, projectId } = req.body;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    });

    res.flushHeaders?.();

    const writeEvent = (event, data) => {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        const body = payload.split(/\r?\n/).map((line) => `data: ${line}`).join('\n');
        res.write(`${event ? `event: ${event}\n` : ''}${body}\n\n`);
    };

    const writer = (text) => writeEvent("log", String(text ?? "").trimEnd());

    try {
        const stream = await agent.stream(
            { messages: [ { role: "user", content: message } ] },
            { context: { projectId, writer }, streamMode: "values" }
        );

        let lastState = null;
        for await (const state of stream) {
            lastState = state;
        }

        if (lastState?.messages?.length) {
            const msgs = lastState.messages;
            for (let i = msgs.length - 1; i >= 0; i--) {
                const m = msgs[i];
                const role = m.role ?? m._getType?.();
                if ((role === 'ai' || role === 'assistant') && !m.tool_calls?.length) {
                    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
                    writeEvent("final", content);
                    break;
                }
            }
        }

        writeEvent("done", "[DONE]");
        res.end();
    } catch (error) {
        console.error("Error invoking agent:", error);
        if (res.headersSent) {
            writeEvent("error", error.message || "Failed to invoke agent");
            res.end();
        } else {
            res.status(500).json({ error: "Failed to invoke agent" });
        }
    }
});

export default agentRouter;
