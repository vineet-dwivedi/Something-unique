import axios from 'axios';
import { tool } from "langchain"
import * as z from "zod";

function trimTrailingSlash(url) {
    return String(url ?? "").replace(/\/+$/, "");
}

function createHttpTool(handler) {
    return {
        invoke: handler
    };
}

function resolveToolBaseUrl(config) {
    const context = config?.context ?? {};
    const explicitBaseUrl = trimTrailingSlash(context.apiBaseUrl);

    if (explicitBaseUrl) {
        return explicitBaseUrl;
    }

    if (context.projectId) {
        return `http://sandbox-service-${context.projectId}:3000`;
    }

    throw new Error("Missing sandbox routing context. Provide apiBaseUrl or projectId.");
}

function getToolContext(config) {
    const context = config.context ?? {};

    if (!context.readCache) {
        context.readCache = new Map();
    }

    if (typeof context.readCacheVersion !== "number") {
        context.readCacheVersion = 0;
    }

    if (!Array.isArray(context.updatedFiles)) {
        context.updatedFiles = [];
    }

    return context;
}

export function createAgentTools(apiBaseUrl) {
    const baseUrl = trimTrailingSlash(apiBaseUrl);

    if (!baseUrl) {
        throw new Error("Missing sandbox agent base URL");
    }

    return {
        baseUrl,
        listFiles: createHttpTool(async () => {
            console.log(`[agent-tools] GET ${baseUrl}/list-files`);
            const response = await axios.get(`${baseUrl}/list-files`, {
                timeout: 50000
            });

            return response.data;
        }),
        readFiles: createHttpTool(async ({ files = [] }) => {
            const query = encodeURIComponent(files.join(","));
            console.log(`[agent-tools] GET ${baseUrl}/read-files`);
            const response = await axios.get(`${baseUrl}/read-files?files=${query}`, {
                timeout: 50000
            });

            return response.data;
        }),
        updateFiles: createHttpTool(async ({ file, content, files }) => {
            const updates = Array.isArray(files) ? files : [{ file, content }];
            console.log(`[agent-tools] PATCH ${baseUrl}/update-files: ${updates.map((update) => update.file).join(", ")}`);
            const response = await axios.patch(`${baseUrl}/update-files`, {
                updates
            }, {
                timeout: 50000
            });

            return response.data;
        }),
        createFiles: createHttpTool(async ({ files = [] }) => {
            console.log(`[agent-tools] POST ${baseUrl}/create-files: ${files.map((file) => file.file).join(", ")}`);
            const response = await axios.post(`${baseUrl}/create-files`, {
                files
            }, {
                timeout: 50000
            });

            return response.data;
        })
    };
}


export const listFiles = tool(
    async ({ }, config) => {

        const writer = config.context?.writer ?? (() => {});
        const baseUrl = resolveToolBaseUrl(config);

        writer("Listing files in project directory...\n");

        const response = await axios.get(`${baseUrl}/list-files`)

        writer("Files listed successfully. Files: " + response.data.files.join(",") + "\n");

        return JSON.stringify(response.data.files);
    },
    {
        name: "list_files",
        description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
        schema: z.object({})
    }
)

export const readFiles = tool(
    async ({ files = [] }, config) => {

        const writer = config.context?.writer ?? (() => {});
        const baseUrl = resolveToolBaseUrl(config);
        const context = getToolContext(config);
        const normalizedFiles = files.map((file) => String(file));
        const cacheKey = `${context.readCacheVersion}:${normalizedFiles.join(",")}`;

        if (context.readCache.has(cacheKey)) {
            writer("Reading files..." + normalizedFiles.join(",") + "\n");
            writer("Files read successfully.\n");
            return context.readCache.get(cacheKey);
        }

        writer("Reading files..." + normalizedFiles.join(",") + "\n");

        const response = await axios.get(`${baseUrl}/read-files?files=` + encodeURIComponent(normalizedFiles.join(",")))

        writer("Files read successfully.\n");
        const payload = JSON.stringify(response.data);
        context.readCache.set(cacheKey, payload);
        return payload;
    },
    {
        name: "read_files",
        description: "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        schema: z.object({
            files: z.array(z.string()).describe("The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later")
        })
    }
)

export const updateFiles = tool(
    async ({ files }, config) => {
        const writer = config.context?.writer ?? (() => {});
        const baseUrl = resolveToolBaseUrl(config);
        const context = getToolContext(config);

        writer("Updating files..." + files.map(f => f.file).join(",") + "\n");
        context.updatedFiles.push(...files.map((file) => file.file));
        context.readCacheVersion += 1;
        context.readCache.clear();


        const response = await axios.patch(`${baseUrl}/update-files`, {
            updates: files
        })

        writer("Files updated successfully.\n");


        return JSON.stringify(response.data.results);
    },
    {
        name: "update_files",
        description: "Update the contents of specified files. This is useful for making changes to files based on the requirements of the task at hand. this tool can also use to create new files by providing a new file name in the file field and the content to be added in the content field.",
        schema: z.object({
            files: z.array(z.object({
                file: z.string().describe("The relative path of the file from project workspace root, e.g. 'src/App.jsx' or 'src/components/Navbar.jsx'"),
                content: z.string().describe("The new content for the file, the content should support json format.")
            })).describe("The list of files to update and their new contents")
        })
    }
)
