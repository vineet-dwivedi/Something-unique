import axios from "axios";
import {tool} from "langchain";
import * as z from "zod";

export const listFiles = tool(async () => {
    console.log("[list-files] requesting directory listing");
    
    const response = await axios.get("http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost/list-files");

    return response.data.files;
},{
    name: "list-files",
    description: "List all files in the project directory. Use the relative paths it returns when reading or updating files.",
    schema: z.object({})
})

export const readFiles = tool(async ({ files }) => {
    console.log("[read-files] requesting:", files.join(", "));

    const response = await axios.get(
        "http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost/read-files/?files=" +
        encodeURIComponent(files.join(","))
    );

    return response.data;
},{
    name: "read-files",
    description: "Read the content of specified files using the relative paths returned by list-files.",
    schema: z.object({
        files: z.array(z.string().describe("The list files to read. These shouuld be files that were listed using the list-file tools or created later"))
    })
})
export const updateFiles = tool(async ({ file, content }) => {
    console.log("[update-files] writing:", file);

    const response = await axios.patch("http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost/update-files",{
        updates: [{ file, content }]
    })

    return response.data;
},{
        name: "update-files",
        description: "Update the contents of specified files using the same relative paths returned by list-files.",
        schema: z.object({
            file: z.string().describe("The relative path of the file to update"),
            content: z.string().describe("The new content for the file")
        }).describe("The list of files to update and their new contents")
})

export const createFiles = tool(async ({ files }) => {
    console.log("[create-files] creating:", files.map((file) => file.file).join(", "));

    const response = await axios.post("http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost/create-files", {
        files
    });

    return response.data;
},{
    name: "create-files",
    description: "Create new files using the same relative paths returned by list-files.",
    schema: z.object({
        files: z.array(z.object({
            file: z.string().describe("The relative path of the file to create"),
            content: z.string().describe("The full content of the file")
        }))
    })
})
