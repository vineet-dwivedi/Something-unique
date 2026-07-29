import { createFiles, listFiles, readFiles, updateFiles } from "./tools.js";
import { fileSelectionSchema, updatePlanSchema } from "./agent.schemas.js";
import {
    extractFileContents,
    formatFileContents,
    formatFileList,
    mergeUnique,
    normalizeAvailableFiles,
    normalizePath,
    pickHeuristicFiles
} from "./agent.helpers.js";

const UI_TASK_PATTERN = /(ui|frontend|front-end|design|style|theme|landing|dashboard|website|web app|page|screen|layout|responsive|mobile|desktop|button|card|hero|navbar|header|footer|animation|transition|hover|modern|premium|elegant|polished|redesign)/i;

function isUiTask(task) {
    return UI_TASK_PATTERN.test(String(task));
}

function buildUiDesignBrief() {
    return (
        `Design guidance:\n` +
        `- Create a polished, impressive frontend instead of a default starter-template look.\n` +
        `- Use strong visual hierarchy, custom spacing, and a clear layout rhythm.\n` +
        `- Prefer a distinctive color palette, layered backgrounds, gradients, or subtle texture when appropriate.\n` +
        `- Add subtle animation and motion only where it improves the experience: gentle fades, small entrance reveals, hover transitions, focus states, and light micro-interactions.\n` +
        `- Keep motion restrained and tasteful; do not make the UI feel busy or flashy.\n` +
        `- Make the layout responsive for desktop and mobile.\n` +
        `- Avoid generic boilerplate styling, flat white-on-gray starter screens, and copy-paste demo layouts.\n` +
        `- Preserve functionality while upgrading the visual polish.\n`
    );
}

function expandTaskForUi(task) {
    const rawTask = String(task ?? "").trim();

    if (!rawTask || !isUiTask(rawTask)) {
        return rawTask;
    }

    return `${rawTask}\n\n${buildUiDesignBrief()}`;
}

function buildFileSelectionPrompt(task, availableFiles) {
    const enrichedTask = expandTaskForUi(task);

    // Ask for a minimal file shortlist before we spend tokens reading file contents.
    return (
        `You are helping edit a codebase.\n\n` +
        `Task: ${enrichedTask}\n\n` +
        `Choose the smallest useful set of files to inspect next.\n` +
        `Return JSON with a top-level key named "files" containing the selected file paths.\n` +
        `Only return files that appear in the list below, and keep the set focused on files likely to affect the task.\n\n` +
        `Available files:\n${formatFileList(availableFiles)}\n`
    );
}

function buildUpdatePrompt(task, fileContents) {
    const enrichedTask = expandTaskForUi(task);

    // Give the model full file text so it can return complete replacement files.
    return (
        `You are editing files to satisfy the following task:\n\n` +
        `Task: ${enrichedTask}\n\n` +
        `Here are the relevant files and their full contents:\n\n` +
        `${formatFileContents(fileContents)}\n\n` +
        `Return JSON with a top-level key named "updates" containing the file updates.\n` +
        `Return only the files that need changes.\n` +
        `If the task requires a brand new file, include it here too.\n` +
        `For each file, return the full new content, not a diff.\n` +
        `Keep the edits minimal and focused on the task.\n`
    );
}

async function selectFilesToRead({ task, model, availableFiles }) {
    // Use structured output so we only get file paths back from the model.
    const selectionModel = model.withStructuredOutput(fileSelectionSchema, {
        method: "jsonMode",
        name: "file_selection"
    });

    const selection = await selectionModel.invoke(buildFileSelectionPrompt(task, availableFiles));
    // Add a small heuristic set so obvious files are still read even if the model misses them.
    const heuristicFiles = pickHeuristicFiles(task, availableFiles);

    const selectedFiles = mergeUnique([
        ...heuristicFiles,
        ...(selection?.files ?? [])
    ]).filter((file) => availableFiles.includes(file));

    if (selectedFiles.length > 0) {
        return selectedFiles;
    }

    return heuristicFiles.length > 0
        ? heuristicFiles
        : availableFiles.slice(0, Math.min(4, availableFiles.length));
}

async function planUpdates({ task, model, fileContents }) {
    // Ask for whole-file replacements so the write step stays simple.
    const planningModel = model.withStructuredOutput(updatePlanSchema, {
        method: "jsonMode",
        name: "update_plan"
    });

    const plan = await planningModel.invoke(buildUpdatePrompt(task, fileContents));

    return (plan?.updates ?? []).filter((update) => {
        return typeof update?.file === "string" && typeof update?.content === "string" && update.content.trim().length > 0;
    });
}

async function applyUpdates({ updates, fileContents, availableFileSet }) {
    const applied = [];

    for (const update of updates) {
        const targetFile = normalizePath(update.file);
        const currentContent = fileContents.get(targetFile);
        // If the file is already identical, skip the write instead of touching it.
        const fileExists = availableFileSet.has(targetFile);

        if (currentContent !== undefined && currentContent === update.content) {
            console.log(`[agent] skipping unchanged file: ${targetFile}`);
            continue;
        }

        if (!fileExists) {
            // New path: create the file through the create-files endpoint.
            console.log(`[agent] creating: ${targetFile}`);
            await createFiles.invoke({
                files: [{
                    file: targetFile,
                    content: update.content
                }]
            });
        } else {
            // Existing path: update the file in place.
            console.log(`[agent] updating: ${targetFile}`);
            await updateFiles.invoke({
                file: targetFile,
                content: update.content
            });
        }

        applied.push(targetFile);
    }

    return applied;
}

export async function runAgent({ task, model }) {
    console.log(`[agent] task: ${task}`);

    // Start with the workspace file list so we know what can be read or updated.
    const availableFiles = normalizeAvailableFiles(await listFiles.invoke({}));
    if (availableFiles.length === 0) {
        console.log("[agent] no files discovered");
        return;
    }

    const availableFileSet = new Set(availableFiles);
    console.log(`[agent] discovered ${availableFiles.length} files`);

    // Read only the files that look relevant to the task.
    const filesToRead = await selectFilesToRead({ task, model, availableFiles });
    if (filesToRead.length === 0) {
        console.log("[agent] no files selected to read");
        return;
    }

    console.log(`[agent] reading: ${filesToRead.join(", ")}`);
    const readResult = await readFiles.invoke({
        files: filesToRead
    });

    // Flatten the API response into a file -> content map for the planner.
    const fileContents = extractFileContents(readResult);
    console.log(`[agent] loaded ${fileContents.size} file contents`);

    // Turn the file contents into a list of concrete edits.
    const updates = await planUpdates({ task, model, fileContents });
    if (updates.length === 0) {
        console.log("[agent] model returned no updates");
        return;
    }

    // Write each edit with the correct endpoint based on whether the file already exists.
    const applied = await applyUpdates({ updates, fileContents, availableFileSet });
    if (applied.length === 0) {
        console.log("[agent] nothing changed after comparison");
        return;
    }

    console.log(`[agent] updated files: ${applied.join(", ")}`);
}
