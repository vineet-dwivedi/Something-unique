import { Router } from "express";
import axios from "axios";
import agent from "../agents/code.agent.js";
import { buildPuterFallback } from "../agents/puter.fallback.js";

const agentRouter = Router();

const MAX_ATTEMPTS = 2;          // 1 initial + 1 retry, then fall back to Puter
const BASE_BACKOFF_MS = 1500;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatus(error) {
    return error?.statusCode || error?.response?.status || null;
}

function isRetryableAgentError(error) {
    const status = getErrorStatus(error);
    const message = String(error?.message || "").toLowerCase();
    const name = String(error?.name || "").toLowerCase();

    return status === 429
        || status === 503
        || name.includes("timeouterror")
        || name.includes("aborted")
        || message.includes("timeout")
        || message.includes("aborted due to timeout")
        || message.includes("rate limit")
        || message.includes("too many requests")
        || message.includes("temporarily unavailable");
}

function extractFinalContent(lastState) {
    let finalContent = "";

    if (lastState?.messages?.length) {
        const msgs = lastState.messages;

        for (let i = msgs.length - 1; i >= 0; i--) {
            const m = msgs[i];
            const role = m.role ?? m._getType?.();
            if ((role === "ai" || role === "assistant") && !m.tool_calls?.length) {
                const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
                if (content && content.trim()) {
                    finalContent = content;
                    break;
                }
            }
        }

        if (!finalContent) {
            for (let i = msgs.length - 1; i >= 0; i--) {
                const m = msgs[i];
                const role = m.role ?? m._getType?.();
                if (role === "ai" || role === "assistant") {
                    const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
                    if (content && content.trim()) {
                        finalContent = content;
                        break;
                    }
                }
            }
        }
    }

    return finalContent;
}

async function runAgentWithRetry(candidateAgent, message, projectId, writer, label) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            if (attempt > 1) {
                writer(`Retrying ${label} request (${attempt}/${MAX_ATTEMPTS})...`);
            }

            const stream = await candidateAgent.stream(
                { messages: [{ role: "user", content: message }] },
                { context: { projectId, writer }, streamMode: "values" }
            );

            let lastState = null;
            for await (const state of stream) {
                lastState = state;
            }

            return extractFinalContent(lastState);
        } catch (error) {
            const retryable = isRetryableAgentError(error);

            if (!retryable || attempt === MAX_ATTEMPTS) {
                throw error;
            }

            const delayMs = BASE_BACKOFF_MS * (2 ** (attempt - 1));
            const retryLabel = `${Math.round(delayMs / 100) / 10}s`;
            writer(`${label} hit a rate limit. Retrying in ${retryLabel}...`);
            await sleep(delayMs);
        }
    }

    return "";
}

async function applyFallbackFiles(projectId, updates) {
    const baseUrl = `http://sandbox-service-${projectId}:3000`;
    const response = await axios.patch(
        `${baseUrl}/update-files`,
        { updates },
        { timeout: 45000 }
    );

    return response.data;
}

agentRouter.post("/invoke", async (req, res) => {
    const { message, projectId } = req.body;

    if (!message || !String(message).trim()) {
        return res.status(400).json({ error: "Message is required." });
    }

    res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    });

    res.flushHeaders?.();

    const writeEvent = (event, data) => {
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        const body = payload.split(/\r?\n/).map((line) => `data: ${line}`).join("\n");
        res.write(`${event ? `event: ${event}\n` : ""}${body}\n\n`);
    };

    const writer = (text) => writeEvent("log", String(text ?? "").trimEnd());

    try {
        let finalContent = "";

        try {
            finalContent = await runAgentWithRetry(agent, message, projectId, writer, "Mistral");
        } catch (error) {
            // Any Mistral failure (rate-limit, timeout, or generic) falls back to Puter
            const reason = isRetryableAgentError(error)
                ? "rate-limited or timed out"
                : "encountered an error";

            writer(`⚠️ Mistral ${reason} after ${MAX_ATTEMPTS} attempt(s).`);
            writer(`🔄 Falling back to Puter (Gemini)...`);
            writer(`⚡ Puter is now generating your project — this may take a moment...`);

            const fallbackBuild = await buildPuterFallback(message);
            await applyFallbackFiles(projectId, fallbackBuild.updates);

            finalContent =
                fallbackBuild.finalMessage ||
                fallbackBuild.summary ||
                "I have updated the project code in your sandbox! Check out the live preview.";
        }

        if (!finalContent) {
            finalContent = "I have updated the project code in your sandbox! Check out the live preview.";
        }

        writeEvent("final", finalContent);
        writeEvent("done", "[DONE]");
        res.end();
    } catch (error) {
        console.error("Error invoking agent:", error);
        const statusCode = getErrorStatus(error) || 500;
        const errorMessage = error?.message || "Failed to invoke agent";

        if (res.headersSent) {
            writeEvent("error", errorMessage);
            writeEvent("done", "[DONE]");
            res.end();
        } else {
            res.status(statusCode).json({ error: errorMessage });
        }
    }
});

export default agentRouter;
