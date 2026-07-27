import {config as loadEnv} from "dotenv";
import {ChatMistralAI} from "@langchain/mistralai";
import * as z from "zod";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {createFiles, listFiles, readFiles, updateFiles} from "./tools.js";

loadEnv({
    path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env")
});

const mistralApiKey = process.env.MISTRAL_API_KEY ?? process.env.MISTRAL_API_key;

if (!mistralApiKey) {
    throw new Error("Missing MISTRAL_API_KEY. Add it to ai-orchestration/.env before running the agent.");
}

const task = process.argv.slice(2).join(" ").trim() || "update the theme of the project to light";

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: mistralApiKey,
    temperature: 0
});

const fileSelectionItemSchema = z.object({
    file: z.string().describe("File path to create or update"),
    content: z.string().describe("Full new file content")
});

const fileSelectionSchema = z.object({
    files: z.array(z.string()).optional(),
    files_to_inspect: z.array(z.string()).optional(),
    paths: z.array(z.string()).optional()
}).transform((value) => {
    return {
        files: value.files ?? value.files_to_inspect ?? value.paths ?? []
    };
});

const updatePlanSchema = z.object({
    updates: z.union([
        z.array(fileSelectionItemSchema),
        z.record(z.string())
    ]).optional(),
    files_to_update: z.union([
        z.array(fileSelectionItemSchema),
        z.record(z.string())
    ]).optional(),
    changes: z.union([
        z.array(fileSelectionItemSchema),
        z.record(z.string())
    ]).optional()
}).transform((value) => {
    const normalizeUpdates = (candidate) => {
        if (Array.isArray(candidate)) {
            return candidate;
        }

        if (candidate && typeof candidate === "object") {
            return Object.entries(candidate).map(([file, content]) => {
                return {
                    file,
                    content
                };
            });
        }

        return [];
    };

    return {
        updates: normalizeUpdates(value.updates ?? value.files_to_update ?? value.changes)
    };
});

function normalizePath(filePath) {
    return filePath.replace(/^\/+/, "").replace(/\\/g, "/");
}

function normalizeAvailableFiles(result) {
    if (Array.isArray(result)) {
        return result.map(normalizePath);
    }

    if (result && Array.isArray(result.files)) {
        return result.files.map(normalizePath);
    }

    return [];
}

function buildPathLookup(files) {
    const lookup = new Map();
    for (const file of files) {
        lookup.set(normalizePath(file), file);
    }
    return lookup;
}

function pickHeuristicFiles(taskText, availableFiles) {
    const lowerTask = taskText.toLowerCase();
    const pick = [];
    const lookup = buildPathLookup(availableFiles);

    const addIfPresent = (candidate) => {
        const normalized = normalizePath(candidate);
        const match = lookup.get(normalized);
        if (match && !pick.includes(match)) {
            pick.push(match);
        }
    };

    const stylingTask = /(theme|dark|light|style|styles|css|ui|appearance|design)/i.test(lowerTask);

    if (stylingTask) {
        [
            "src/App.css",
            "src/index.css",
            "src/App.jsx",
            "src/main.jsx",
            "index.html"
        ].forEach(addIfPresent);
    } else {
        availableFiles
            .filter((file) => /\.(css|jsx|tsx|js|ts|html)$/i.test(file))
            .slice(0, 4)
            .forEach(addIfPresent);
    }

    return pick;
}

function mergeUnique(files) {
    return [...new Set(files.filter(Boolean))];
}

function formatFileList(files) {
    return files.map((file) => `- ${file}`).join("\n");
}

function extractFileContents(result) {
    const map = new Map();
    const entries = Array.isArray(result?.files) ? result.files : [];

    for (const entry of entries) {
        if (!entry || typeof entry !== "object") {
            continue;
        }

        for (const [rawPath, content] of Object.entries(entry)) {
            map.set(normalizePath(rawPath), String(content));
        }
    }

    return map;
}

function formatFileContents(fileContents) {
    return [...fileContents.entries()]
        .map(([file, content]) => `FILE: ${file}\n\`\`\`text\n${content}\n\`\`\``)
        .join("\n\n");
}

async function selectFilesToRead(availableFiles) {
    const selection = await model.withStructuredOutput(fileSelectionSchema, {
        method: "jsonMode",
        name: "file_selection"
    }).invoke(
        `You are helping edit a codebase.\n\n` +
        `Task: ${task}\n\n` +
        `Choose the smallest useful set of files to inspect next.\n` +
        `Return JSON with a top-level key named "files" containing the selected file paths.\n` +
        `Only return files that appear in the list below, and keep the set focused on files likely to affect the task.\n\n` +
        `Available files:\n${formatFileList(availableFiles)}\n`
    );

    const heuristicFiles = pickHeuristicFiles(task, availableFiles);
    const selectedFiles = mergeUnique([
        ...heuristicFiles,
        ...(selection?.files ?? [])
    ]).filter((file) => availableFiles.includes(file));

    if (selectedFiles.length > 0) {
        return selectedFiles;
    }

    return heuristicFiles.length > 0 ? heuristicFiles : availableFiles.slice(0, Math.min(4, availableFiles.length));
}

async function planUpdates(fileContents) {
    const plan = await model.withStructuredOutput(updatePlanSchema, {
        method: "jsonMode",
        name: "update_plan"
    }).invoke(
        `You are editing files to satisfy the following task:\n\n` +
        `Task: ${task}\n\n` +
        `Here are the relevant files and their full contents:\n\n` +
        `${formatFileContents(fileContents)}\n\n` +
        `Return JSON with a top-level key named "updates" containing the file updates.\n` +
        `Return only the files that need changes.\n` +
        `If the task requires a brand new file, include it here too.\n` +
        `For each file, return the full new content, not a diff.\n` +
        `Keep the edits minimal and focused on the task.\n`
    );

    return (plan?.updates ?? []).filter((update) => {
        return typeof update?.file === "string" && typeof update?.content === "string" && update.content.trim().length > 0;
    });
}

async function main() {
    console.log(`[agent] task: ${task}`);

    const availableFiles = normalizeAvailableFiles(await listFiles.invoke({}));
    const availableFileSet = new Set(availableFiles);
    console.log(`[agent] discovered ${availableFiles.length} files`);

    const filesToRead = await selectFilesToRead(availableFiles);
    console.log(`[agent] reading: ${filesToRead.join(", ")}`);

    const readResult = await readFiles.invoke({
        files: filesToRead
    });

    const fileContents = extractFileContents(readResult);
    console.log(`[agent] loaded ${fileContents.size} file contents`);

    const updates = await planUpdates(fileContents);
    if (updates.length === 0) {
        console.log("[agent] model returned no updates");
        return;
    }

    const applied = [];
    for (const update of updates) {
        const targetFile = normalizePath(update.file);
        const currentContent = fileContents.get(targetFile);
        const fileExists = availableFileSet.has(targetFile);

        if (currentContent !== undefined && currentContent === update.content) {
            console.log(`[agent] skipping unchanged file: ${targetFile}`);
            continue;
        }

        if (!fileExists) {
            console.log(`[agent] creating: ${targetFile}`);
            await createFiles.invoke({
                files: [{
                    file: targetFile,
                    content: update.content
                }]
            });
        } else {
            console.log(`[agent] updating: ${targetFile}`);
            await updateFiles.invoke({
                file: targetFile,
                content: update.content
            });
        }
        applied.push(targetFile);
    }

    if (applied.length === 0) {
        console.log("[agent] nothing changed after comparison");
        return;
    }

    console.log(`[agent] updated files: ${applied.join(", ")}`);
}

main().catch((error) => {
    console.error("[agent] failed:", error);
    process.exitCode = 1;
});
