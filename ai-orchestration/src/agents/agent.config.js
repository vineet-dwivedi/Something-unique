import { config as loadEnv } from "dotenv";
import { ChatGoogle } from "@langchain/google";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_TASK = "update the theme of the project to light";
const MODEL_NAME = "gemini-3.6-flash";

// Load the root .env file before the agent tries to read the API key.
loadEnv({
    path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env")
});

export function loadAgentConfig(argv = process.argv.slice(2)) {
    return {
        task: argv.join(" ").trim() || DEFAULT_TASK,
        model: createModel()
    };
}

export function createModel() {
    // Accept the common capitalized and lowercase env key names.
    const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_API_key;

    if (!apiKey) {
        throw new Error("Missing GOOGLE_API_KEY. Add it to ai-orchestration/.env before running the agent.");
    }

    // Keep the model deterministic so the file edits stay stable.
    const model = new ChatGoogle({
        model: MODEL_NAME,
        apiKey,
        temperature: 0,
        maxOutputTokens: 12000
    });

    return model;
}
