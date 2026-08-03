# 🎨 KnitDev Frontend Flow & Architecture

The KnitDev frontend is an interactive AI Sandbox IDE built with React and Vite. It provides a multi-pane workspace with a live code editor, preview iframe, AI chat prompt, and socket-connected terminal drawer.

---

## 🔄 User Interaction Flow

```
+------------------+       +-------------------+       +-----------------------+
|  User UI Prompt  | ----> |  POST /api/ai/    | ----> |  AI Orchestration     |
|  "Make a game"   |       |       invoke      |       |  (LangChain Agent)    |
+------------------+       +-------------------+       +-----------------------+
                                                                   |
                                                                   v
+------------------+       +-------------------+       +-----------------------+
| Live Preview     | <---- | Vite HMR Watcher  | <---- | Sandbox Agent         |
|  (*.preview...)  |       | (/workspace/src)  |       | (PATCH /update-files) |
+------------------+       +-------------------+       +-----------------------+
```

---

## ⚡ 4-Step Action Lifecycle

1. **Start Sandbox**: Invokes `startSandbox()` (`POST /api/sandbox/start`) to launch a K8s pod and retrieve preview/agent URLs.
2. **AI Stream Execution**: Invokes `invokeAiStream()` (`POST /api/ai/invoke`) to receive SSE events (`event: log`, `event: final`).
3. **Workspace File Update**: Invokes `updateFile()` (`PATCH /update-files`) to write updated React components directly to `/workspace/src/App.jsx`.
4. **Vite Hot Reload**: Vite dev server in the sandbox container automatically reloads the preview iframe.

---

## 🛠️ Key Issues Resolved

1. **502 Bad Gateway Preview**: Added `host: '0.0.0.0'`, `port: 5173`, `strictPort: true`, and `allowedHosts: true` to Vite config so K8s readiness probes succeed.
2. **Operation Abort Timeouts**: Increased proxy timeouts from 5s to 10 minutes in the router proxy.
3. **Router Crash on WS Upgrade**: Added safe function checks and try-catch handling in `server.on('upgrade')`.
4. **CORS Policy Error**: Added global CORS middleware to `ai-orchestration`.
5. **Invisible Code Changes**: Fixed `updateFile()` payload format from `{ files: [...] }` to `{ updates: [...] }` and added path normalization in `sandbox-agent`.
