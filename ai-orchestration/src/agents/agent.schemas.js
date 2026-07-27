import * as z from "zod";

// The model sometimes returns slightly different shapes, so keep the schema loose.
const fileUpdateSchema = z.object({
    file: z.string().describe("File path to create or update"),
    content: z.string().describe("Full new file content")
});

function normalizeUpdateEntries(candidate) {
    if (Array.isArray(candidate)) {
        return candidate;
    }

    if (candidate && typeof candidate === "object") {
        // Convert { "file.ts": "content" } into the same array shape we apply later.
        return Object.entries(candidate).map(([file, content]) => ({
            file,
            content
        }));
    }

    return [];
}

export const fileSelectionSchema = z.object({
    files: z.array(z.string()).optional(),
    files_to_inspect: z.array(z.string()).optional(),
    paths: z.array(z.string()).optional()
}).transform((value) => ({
    // Accept several key names, then collapse them into one predictable field.
    files: value.files ?? value.files_to_inspect ?? value.paths ?? []
}));

export const updatePlanSchema = z.object({
    updates: z.union([z.array(fileUpdateSchema), z.record(z.string())]).optional(),
    files_to_update: z.union([z.array(fileUpdateSchema), z.record(z.string())]).optional(),
    changes: z.union([z.array(fileUpdateSchema), z.record(z.string())]).optional()
}).transform((value) => ({
    // The workflow always reads from `updates`, even if the model used a different key.
    updates: normalizeUpdateEntries(value.updates ?? value.files_to_update ?? value.changes)
}));
