import axios from "axios";
import {tool} from "langchain";
import * as z from "zod";

export const listFiles = tool(async({ })=>{
    const response = await axios.get("http://019f9d83-c5d0-77d8-895d-511838a6df0d.agent.localhost/list-files");

    return response.data.files;
},{
    name: "list-files",
    description: "List all files in the project directory. This is useful for understanding what files are available to work with."
})