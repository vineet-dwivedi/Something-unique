import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

// All agent file operations go through the sandbox bridge at this base URL.
const API_BASE_URL = "http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost";

export const listFiles = tool(async () => {
    // Ask the bridge for the current relative file list.
    console.log("[list-files] requesting directory listing");

    const response = await axios.get(`${API_BASE_URL}/list-files`);
    return response.data.files;
}, {
    name: "list-files",
    description: "List all files in the project directory. Use the relative paths it returns when reading or updating files.",
    schema: z.object({})
});

export const readFiles = tool(async ({ files }) => {
    // Read multiple files in one request so the agent only fetches what it needs.
    console.log("[read-files] requesting:", files.join(", "));

    const response = await axios.get(
        `${API_BASE_URL}/read-files/?files=${encodeURIComponent(files.join(","))}`
    );

    return response.data;
}, {
    name: "read-files",
    description: "Read the content of specified files using the relative paths returned by list-files.",
    schema: z.object({
        files: z.array(z.string().describe("The list files to read. These should be files that were listed using the list-files tool or created later"))
    })
});

export const updateFiles = tool(async ({ file, content }) => {
    // Send one full replacement file body for an existing path.
    console.log("[update-files] writing:", file);

    const response = await axios.patch(`${API_BASE_URL}/update-files`, {
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

export const createFiles = tool(async ({ files }) => {
    // Create new files in a single request when the path does not exist yet.
    console.log("[create-files] creating:", files.map((file) => file.file).join(", "));

    const response = await axios.post(`${API_BASE_URL}/create-files`, {
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
