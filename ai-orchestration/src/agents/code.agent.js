import "dotenv/config";
import {ChatMistralAI} from "@langchain/mistralai";
import {listFiles, readFiles, updateFiles} from "./tools.js"
import {createAgent} from "langchain";

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API
});

const agent = createAgent({
    model,
    tools: {listFiles,readFiles,updateFiles}
})

agent.invoke({
    messages: [
        {
            role: "user",
            content: "update the theme of the project to light"
        }
    ]
})