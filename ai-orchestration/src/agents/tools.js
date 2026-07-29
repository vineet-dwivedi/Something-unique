import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

function normalizeBaseUrl(apiBaseUrl) {
    const baseUrl = String(apiBaseUrl ?? "").trim();

    if (!baseUrl) {
        throw new Error("Missing agent API base URL.");
    }

    return baseUrl.replace(/\/+$/, "");
}

export function createAgentTools(apiBaseUrl) {
    // All agent file operations go through the sandbox bridge for one sandbox.
    const baseUrl = normalizeBaseUrl(apiBaseUrl);

    const listFiles = tool(async () => {
        // Ask the bridge for the current relative file list.
        console.log("[list-files] requesting directory listing");

        const response = await axios.get(`${baseUrl}/list-files`);
        return response.data.files;
    }, {
        name: "list-files",
        description: "List all files in the project directory. Use the relative paths it returns when reading or updating files.",
        schema: z.object({})
    });

    const readFiles = tool(async ({ files }) => {
        // Read multiple files in one request so the agent only fetches what it needs.
        console.log("[read-files] requesting:", files.join(", "));

        const response = await axios.get(
            `${baseUrl}/read-files/?files=${encodeURIComponent(files.join(","))}`
        );

        return response.data;
    }, {
        name: "read-files",
        description: "Read the content of specified files using the relative paths returned by list-files.",
        schema: z.object({
            files: z.array(z.string().describe("The list files to read. These should be files that were listed using the list-files tool or created later"))
        })
    });

    const updateFiles = tool(async ({ file, content }) => {
        // Send one full replacement file body for an existing path.
        console.log("[update-files] writing:", file);

        const response = await axios.patch(`${baseUrl}/update-files`, {
            updates: [{ file, content }]
        });

        return response.data;
    }, {
        name: "update-files",
        description: "Update the contents of specified files using the same relative paths returned by list-files.",
        schema: z.object({
            file: z.string().describe("The relative path of the file to update"),
            content: z.string().describe("The new content for the file")
        }).describe("The list of files to update and their new contents")
    });

    const createFiles = tool(async ({ files }) => {
        // Create new files in a single request when the path does not exist yet.
        console.log("[create-files] creating:", files.map((file) => file.file).join(", "));

        const response = await axios.post(`${baseUrl}/create-files`, {
            files
        });

        return response.data;
    }, {
        name: "create-files",
        description: "Create new files using the same relative paths returned by list-files.",
        schema: z.object({
            files: z.array(z.object({
                file: z.string().describe("The relative path of the file to create"),
                content: z.string().describe("The full content of the file")
            }))
        })
    });

    return {
        baseUrl,
        listFiles,
        readFiles,
        updateFiles,
        createFiles
    };
}
