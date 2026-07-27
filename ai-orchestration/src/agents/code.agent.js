import { loadAgentConfig } from "./agent.config.js";
import { runAgent } from "./agent.workflow.js";

// Build the model and task from CLI args and the .env file.
const { task, model } = loadAgentConfig();

try {
    // Run one full edit cycle and let the process exit nonzero on failure.
    await runAgent({ task, model });
} catch (error) {
    console.error("[agent] failed:", error);
    process.exitCode = 1;
}
