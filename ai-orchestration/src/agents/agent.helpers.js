export function normalizePath(filePath = "") {
    // Force one relative-path style so reads, updates, and creates use the same key.
    return String(filePath).replace(/^\/+/, "").replace(/\\/g, "/");
}

export function normalizeAvailableFiles(result) {
    if (Array.isArray(result)) {
        return result.map(normalizePath).filter(Boolean);
    }

    if (result && Array.isArray(result.files)) {
        return result.files.map(normalizePath).filter(Boolean);
    }

    return [];
}

export function buildPathLookup(files) {
    const lookup = new Map();

    for (const file of files) {
        // Store the normalized path but keep the original value for tool calls.
        lookup.set(normalizePath(file), file);
    }

    return lookup;
}

export function pickHeuristicFiles(taskText, availableFiles) {
    const lowerTask = String(taskText).toLowerCase();
    const lookup = buildPathLookup(availableFiles);
    const selected = [];

    const addIfPresent = (candidate) => {
        const match = lookup.get(normalizePath(candidate));
        if (match && !selected.includes(match)) {
            selected.push(match);
        }
    };

    // Styling tasks usually live in app, entry, and stylesheet files.
    const stylingTask = /(theme|dark|light|style|styles|css|ui|appearance|design)/i.test(lowerTask);

    if (stylingTask) {
        ["src/App.css", "src/index.css", "src/App.jsx", "src/main.jsx", "index.html"].forEach(addIfPresent);
        return selected;
    }

    // For non-style work, grab a small code-focused slice first.
    availableFiles
        .filter((file) => /\.(css|jsx|tsx|js|ts|html)$/i.test(file))
        .slice(0, 4)
        .forEach(addIfPresent);

    return selected;
}

export function mergeUnique(files) {
    return [...new Set(files.filter(Boolean))];
}

export function formatFileList(files) {
    // Render the file list as a plain bullet block for the model prompt.
    return files.map((file) => `- ${file}`).join("\n");
}

export function extractFileContents(result) {
    const fileContents = new Map();
    const entries = Array.isArray(result?.files) ? result.files : [];

    for (const entry of entries) {
        if (!entry || typeof entry !== "object") {
            continue;
        }

        for (const [rawPath, content] of Object.entries(entry)) {
            // The read-files tool returns one object per file, so flatten it into a map.
            fileContents.set(normalizePath(rawPath), String(content));
        }
    }

    return fileContents;
}

export function formatFileContents(fileContents) {
    // Put each file in its own fenced block so the model can compare them cleanly.
    return [...fileContents.entries()]
        .map(([file, content]) => `FILE: ${file}\n\`\`\`text\n${content}\n\`\`\``)
        .join("\n\n");
}
