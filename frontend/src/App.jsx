import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ChatPanel from './components/ChatPanel';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import PreviewPanel from './components/PreviewPanel';
import TerminalPanel from './components/TerminalPanel';
import {
  startSandbox,
  listFiles,
  readFile,
  updateFile,
  invokeAiStream
} from './services/api';
import { MessageSquare, FolderTree } from 'lucide-react';

// ─── Theme helpers ────────────────────────────────────────────
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('knit-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export default function App() {
  // ── Theme ──────────────────────────────────────────────────
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem('knit-theme', theme); } catch {}
  }, [theme]);

  const handleToggleTheme = (event) => {
    // Fallback if browser doesn't support View Transitions or if triggered without coordinate event
    if (!document.startViewTransition) {
      setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      return;
    }

    // Capture click coordinates or default to center of the viewport
    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const isDark = theme === 'dark';

    const transition = document.startViewTransition(() => {
      setTheme(isDark ? 'light' : 'dark');
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 450,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      );
    });
  };


  // ── Sandbox state ─────────────────────────────────────────
  const [sandboxData, setSandboxData] = useState(null);
  const [loadingSandbox, setLoadingSandbox] = useState(false);

  // ── Layout & UI controls ──────────────────────────────────
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [layoutMode, setLayoutMode] = useState('split');
  const [terminalOpen, setTerminalOpen] = useState(true);

  // ── File management ───────────────────────────────────────
  const [fileList, setFileList] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [unsavedFiles, setUnsavedFiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // ── Chat & AI Generation ──────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamLogs, setStreamLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState('');

  // ── Sandbox handlers ─────────────────────────────────────
  const handleStartSandbox = async () => {
    setLoadingSandbox(true);
    try {
      const data = await startSandbox();
      setSandboxData(data);
      setMessages([
        {
          sender: 'ai',
          text: `Sandbox ready! (${data.sandboxId?.substring(0, 8)}…)\n\nWhat would you like to build? Describe your frontend idea and I'll start writing code.`,
        },
      ]);
      const files = await listFiles(data.agentUrl);
      setFileList(files);
      const defaultFile = files.find((f) => f.includes('App.jsx')) || files[0];
      if (defaultFile) await loadAndOpenFile(data.agentUrl, defaultFile);
    } catch (err) {
      console.error('Error starting sandbox:', err);
    } finally {
      setLoadingSandbox(false);
    }
  };

  const handleNewSandbox = () => {
    if (window.confirm('Start a fresh sandbox? Your current session will end.')) {
      setSandboxData(null);
      setFileList([]);
      setOpenTabs([]);
      setActiveFile(null);
      setFileContents({});
      setUnsavedFiles({});
      setMessages([]);
    }
  };

  // ── File helpers ─────────────────────────────────────────
  const loadAndOpenFile = async (agentUrl, filePath) => {
    if (!openTabs.includes(filePath)) {
      setOpenTabs((prev) => [...prev, filePath]);
    }
    setActiveFile(filePath);
    if (fileContents[filePath] === undefined) {
      const content = await readFile(agentUrl, filePath);
      setFileContents((prev) => ({ ...prev, [filePath]: content }));
    }
  };

  const handleSelectFile = (filePath) => {
    if (sandboxData?.agentUrl) loadAndOpenFile(sandboxData.agentUrl, filePath);
  };

  const handleCloseTab = (filePath) => {
    const nextTabs = openTabs.filter((t) => t !== filePath);
    setOpenTabs(nextTabs);
    if (activeFile === filePath) {
      setActiveFile(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : null);
    }
  };

  const handleContentChange = (filePath, newContent) => {
    setFileContents((prev) => ({ ...prev, [filePath]: newContent }));
    setUnsavedFiles((prev) => ({ ...prev, [filePath]: true }));
  };

  const handleSaveFile = async (filePath) => {
    if (!sandboxData?.agentUrl || !filePath) return;
    setIsSaving(true);
    try {
      await updateFile(sandboxData.agentUrl, filePath, fileContents[filePath] || '');
      setUnsavedFiles((prev) => ({ ...prev, [filePath]: false }));
    } catch (err) {
      console.error(`Error saving ${filePath}:`, err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshFiles = async () => {
    if (sandboxData?.agentUrl) {
      const files = await listFiles(sandboxData.agentUrl);
      setFileList(files);
    }
  };

  // ── AI Message handler ────────────────────────────────────
  const handleSendMessage = (userPrompt) => {
    if (!sandboxData) return;
    setMessages((prev) => [...prev, { sender: 'user', text: userPrompt }]);
    setIsGenerating(true);
    setStreamLogs([]);
    setCurrentLog('Connecting to AI agent…');

    invokeAiStream(userPrompt, sandboxData.sandboxId, {
      onLog: (logText) => {
        setStreamLogs((prev) => [...prev, logText]);
        setCurrentLog(logText);
      },
      onFinal: (finalText) => {
        setMessages((prev) => [...prev, { sender: 'ai', text: finalText }]);
      },
      onDone: async () => {
        setIsGenerating(false);
        setCurrentLog('');
        if (sandboxData?.agentUrl) {
          const updatedFiles = await listFiles(sandboxData.agentUrl);
          setFileList(updatedFiles);
          if (activeFile) {
            const freshContent = await readFile(sandboxData.agentUrl, activeFile);
            setFileContents((prev) => ({ ...prev, [activeFile]: freshContent }));
            setUnsavedFiles((prev) => ({ ...prev, [activeFile]: false }));
          }
        }
      },
      onError: (err) => {
        console.error('SSE Stream Error:', err);
        setIsGenerating(false);
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `Stream error: ${err?.message || String(err) || 'Unknown error'}` },
        ]);
      },
    });
  };

  // ── Render ────────────────────────────────────────────────

  if (!sandboxData) {
    return (
      <Hero
        onStartSandbox={handleStartSandbox}
        loading={loadingSandbox}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="app-container">
      <Header
        sandboxData={sandboxData}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        onNewSandbox={handleNewSandbox}
        terminalOpen={terminalOpen}
        setTerminalOpen={setTerminalOpen}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="main-workspace">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-tabs">
            <button
              className={`tab-item ${sidebarTab === 'chat' ? 'active' : ''}`}
              onClick={() => setSidebarTab('chat')}
            >
              <MessageSquare size={14} />
              <span>AI Prompt</span>
            </button>
            <button
              className={`tab-item ${sidebarTab === 'files' ? 'active' : ''}`}
              onClick={() => setSidebarTab('files')}
            >
              <FolderTree size={14} />
              <span>Explorer</span>
            </button>
          </div>

          <div className="sidebar-content">
            {sidebarTab === 'chat' ? (
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                streamLogs={streamLogs}
                currentLog={currentLog}
              />
            ) : (
              <FileExplorer
                files={fileList}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                onRefresh={handleRefreshFiles}
              />
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="content-area">
          <div className="split-container">
            <div className={`editor-section ${layoutMode === 'preview' ? 'hidden' : ''}`}>
              <CodeEditor
                openTabs={openTabs}
                activeFile={activeFile}
                onSelectTab={setActiveFile}
                onCloseTab={handleCloseTab}
                fileContents={fileContents}
                onContentChange={handleContentChange}
                onSaveFile={handleSaveFile}
                unsavedFiles={unsavedFiles}
                isSaving={isSaving}
              />
            </div>

            <div className={`preview-section ${layoutMode === 'code' ? 'hidden' : ''}`}>
              <PreviewPanel previewUrl={sandboxData.previewUrl} />
            </div>
          </div>

          <TerminalPanel
            agentUrl={sandboxData.agentUrl}
            isCollapsed={!terminalOpen}
            onToggleCollapse={() => setTerminalOpen(!terminalOpen)}
            theme={theme}
          />
        </main>
      </div>
    </div>
  );
}
