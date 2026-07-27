import {config as loadEnv} from "dotenv";
import {ChatMistralAI} from "@langchain/mistralai";
import {listFiles, readFiles, updateFiles} from "./tools.js"
import {createAgent} from "langchain";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

loadEnv({
    path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env")
});

const mistralApiKey = process.env.MISTRAL_API_KEY ?? process.env.MISTRAL_API_key;

if (!mistralApiKey) {
    throw new Error("Missing MISTRAL_API_KEY. Add it to ai-orchestration/.env before running the agent.");
}

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: mistralApiKey
});

const agent = createAgent({
    model,
    tools: [listFiles, readFiles, updateFiles]
})

agent.invoke({
    messages: [
        {
            role: "user",
            content: "update the theme of the project to light"
        }
    ]
})
