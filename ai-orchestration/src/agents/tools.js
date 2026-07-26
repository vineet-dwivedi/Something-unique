import axios from "axios";
import {tool} from "langchain";
import * as z from "zod";

export const listFiles = tool(async({ })=>{
    const response = await axios.get("http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost/list-files");

    return response.data.files;
},{
    name: "list-files",
    description: "List all files in the project directory. This is useful for understanding what files are available to work with.",
    inputSchema: z.object({})
})

export const readFiles = tool(async ({files: []})=> {
    const response = await axios.get("http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost/read-files/?files=" + files.json(","))

    return JSON.stringify(response.data);
},{
    name: "read-files",
    description: "Read the content of specified files. This is useful for understanding the content of files that are relevant to the task at hand",
    inputSchema: z.object({
        files: z.array(z.string().describe("The list files to read. These shouuld be files that were listed using the list-file tools or created later"))
    })
})
export const updateFiles = tool(async ({files})=>{
    async ({files})=>{
        const response = await axios.post("http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost/update-files",{
            updates: files 
        })
        return JSON.stringify(response.data.results)
    }
},{
        name: "update-files",
        description: "Update the contents of specified files. This is useful for making changes to files based on the requirements of the task at hand. This tool can also use to create new files by providing a new file name in the file field and the content to be added in the content field.",
        inputSchema: z.object({
            file: z.string().describe("The absolute path of the file to update"),
            content: z.string().describe("The new content for the file")
        }).describe("The list of files to update and their new contents")
})