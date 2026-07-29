import { config as loadEnv } from "dotenv";
import { ChatMistralAI } from "@langchain/mistralai";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_TASK = "update the theme of the project to light";
const MODEL_NAME = "mistral-medium-latest";

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
    const apiKey = process.env.MISTRAL_API_KEY ?? process.env.MISTRAL_API_key;

    if (!apiKey) {
        throw new Error("Missing MISTRAL_API_KEY. Add it to ai-orchestration/.env before running the agent.");
    }

    // Keep the model deterministic so the file edits stay stable.
    const model = new ChatMistralAI({
        model: MODEL_NAME,
        apiKey,
        temperature: 0
    });

    return model;
}
