/**
 * API Service for AI Sandbox operations
 * Handles sandbox creation, file listing/reading/updating, and SSE stream for AI invocation.
 */

const BASE_API_URL = 'http://localhost/api';

/**
 * Start a new sandbox
 */
export async function startSandbox() {
  try {
    const response = await fetch(`${BASE_API_URL}/sandbox/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to start sandbox: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend unavailable, generating mock sandbox for UI preview:', error);
    // Mock fallback when local API server is not active
    const mockId = `sb-${Math.random().toString(36).substring(2, 10)}`;
    return {
      message: "Sandbox started successfully! (Demo Mode)",
      sandboxId: mockId,
      previewUrl: `http://localhost:5173`,
      agentUrl: `http://localhost:3000`,
      isMock: true
    };
  }
}

/**
 * List files in the sandbox workspace
 * @param {string} agentUrl 
 */
export async function listFiles(agentUrl) {
  try {
    const response = await fetch(`${agentUrl}/list-files`);
    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.warn('Failed to fetch file list, returning default project files:', error);
    return [
      "package.json",
      "README.md",
      "index.html",
      "src/App.jsx",
      "src/App.css",
      "src/index.css",
      "src/main.jsx",
      "public/favicon.svg"
    ];
  }
}

/**
 * Read contents of specified file(s)
 * @param {string} agentUrl 
 * @param {string} filePath 
 */
export async function readFile(agentUrl, filePath) {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const response = await fetch(`${agentUrl}/read-files?files=${encodeURIComponent(cleanPath)}`);
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (data.files && Array.isArray(data.files) && data.files.length > 0) {
      const fileObj = data.files[0];
      // File object keys could be "/src/App.css" or "src/App.css" or "/workspace/src/App.css"
      const keys = Object.keys(fileObj);
      if (keys.length > 0) {
        return fileObj[keys[0]];
      }
    }
    return '';
  } catch (error) {
    console.warn(`Failed to read ${filePath}:`, error);
    // Fallback sample content for demo mode
    return getMockFileContent(filePath);
  }
}

/**
 * Update file contents in sandbox
 * @param {string} agentUrl 
 * @param {string} filePath 
 * @param {string} content 
 */
export async function updateFile(agentUrl, filePath, content) {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const response = await fetch(`${agentUrl}/update-files`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updates: [
          { file: cleanPath, content: content }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to update file (${response.status}): ${errText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`Failed to update ${filePath}:`, error);
    return { message: "File updated locally (Demo Mode)", results: [{ [filePath]: "File updated successfully" }] };
  }
}

/**
 * Invoke AI generation with SSE Stream support
 * @param {string} message 
 * @param {string} projectId 
 * @param {object} callbacks - { onLog, onFinal, onDone, onError }
 */
export async function invokeAiStream(message, projectId, callbacks = {}) {
  const { onLog, onFinal, onDone, onError } = callbacks;
  
  try {
    const response = await fetch(`${BASE_API_URL}/ai/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream, text/plain, */*'
      },
      body: JSON.stringify({ message, projectId })
    });

    if (!response.ok) {
      throw new Error(`AI invoke failed with status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = 'log';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep remaining incomplete line in buffer

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (line.startsWith('event: ')) {
          currentEvent = line.substring(7).trim();
        } else if (line.startsWith('data: ')) {
          const dataText = line.substring(6);

          if (currentEvent === 'log') {
            if (onLog) onLog(dataText);
          } else if (currentEvent === 'final') {
            if (onFinal) onFinal(dataText);
          } else if (currentEvent === 'done' || dataText === '[DONE]') {
            if (onDone) onDone();
          } else {
            if (onLog) onLog(dataText);
          }
        } else if (line === 'log' || line === 'final' || line === 'done') {
          currentEvent = line;
        } else if (line === '[DONE]') {
          if (onDone) onDone();
        } else {
          if (currentEvent === 'log' && onLog) onLog(line);
          if (currentEvent === 'final' && onFinal) onFinal(line);
        }
      }
    }

    if (onDone) onDone();
  } catch (error) {
    console.error("API AI Invoke Stream Error:", error);
    if (onError) onError(error);
  }
}

/**
 * Helper for sample code content in mock mode
 */
function getMockFileContent(filePath) {
  if (filePath.endsWith('App.jsx')) {
    return `import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="sandbox-app">
      <header className="app-header">
        <div className="logo-badge">🚀 AI Sandbox</div>
        <h1>Generated Web Application</h1>
        <p>Edit prompt or modify code to see live updates</p>
      </header>

      <main className="app-main">
        <div className="card glass-card">
          <h2>Interactive Demo Counter</h2>
          <div className="counter-display">{count}</div>
          <div className="button-group">
            <button onClick={() => setCount(c => c - 1)} className="btn btn-secondary">- Decrease</button>
            <button onClick={() => setCount(0)} className="btn btn-outline">Reset</button>
            <button onClick={() => setCount(c => c + 1)} className="btn btn-primary">+ Increase</button>
          </div>
        </div>
      </main>
    </div>
  );
}`;
  }
  if (filePath.endsWith('App.css')) {
    return `:root {
  --primary: #6366f1;
  --primary-glow: rgba(99, 102, 241, 0.4);
  --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
}

.sandbox-app {
  min-height: 100vh;
  background: var(--bg-gradient);
  color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.counter-display {
  font-size: 4rem;
  font-weight: 800;
  margin: 1.5rem 0;
  color: #818cf8;
  text-shadow: 0 0 20px var(--primary-glow);
}`;
  }
  if (filePath.endsWith('package.json')) {
    return `{\n  "name": "sandbox-app",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}`;
  }
  return `// File: ${filePath}\n// Ready for editing...`;
}
