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

export default function App() {
  // Sandbox state
  const [sandboxData, setSandboxData] = useState(null);
  const [loadingSandbox, setLoadingSandbox] = useState(false);

  // Layout & UI controls
  const [sidebarTab, setSidebarTab] = useState('chat'); // 'chat' | 'files'
  const [layoutMode, setLayoutMode] = useState('split'); // 'split' | 'code' | 'preview'
  const [terminalOpen, setTerminalOpen] = useState(true);

  // File management
  const [fileList, setFileList] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [unsavedFiles, setUnsavedFiles] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Chat & AI Generation state
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamLogs, setStreamLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState('');

  // Start Sandbox handler
  const handleStartSandbox = async () => {
    setLoadingSandbox(true);
    try {
      const data = await startSandbox();
      setSandboxData(data);

      // Initialize welcome chat
      setMessages([
        {
          sender: 'ai',
          text: `Welcome! Sandbox ${data.sandboxId} initialized successfully. What frontend application or component would you like me to generate?`
        }
      ]);

      // Load file tree
      const files = await listFiles(data.agentUrl);
      setFileList(files);

      // Default open src/App.jsx or first file
      const defaultFile = files.find(f => f.includes('App.jsx')) || files[0];
      if (defaultFile) {
        await loadAndOpenFile(data.agentUrl, defaultFile);
      }
    } catch (err) {
      console.error('Error starting sandbox:', err);
    } finally {
      setLoadingSandbox(false);
    }
  };

  // Reset/New Sandbox
  const handleNewSandbox = () => {
    if (window.confirm("Are you sure you want to start a new sandbox container?")) {
      setSandboxData(null);
      setFileList([]);
      setOpenTabs([]);
      setActiveFile(null);
      setFileContents({});
      setUnsavedFiles({});
      setMessages([]);
    }
  };

  // Helper to load file content and activate tab
  const loadAndOpenFile = async (agentUrl, filePath) => {
    if (!openTabs.includes(filePath)) {
      setOpenTabs(prev => [...prev, filePath]);
    }
    setActiveFile(filePath);

    if (fileContents[filePath] === undefined) {
      const content = await readFile(agentUrl, filePath);
      setFileContents(prev => ({ ...prev, [filePath]: content }));
    }
  };

  const handleSelectFile = (filePath) => {
    if (sandboxData?.agentUrl) {
      loadAndOpenFile(sandboxData.agentUrl, filePath);
    }
  };

  const handleCloseTab = (filePath) => {
    const nextTabs = openTabs.filter(t => t !== filePath);
    setOpenTabs(nextTabs);
    if (activeFile === filePath) {
      setActiveFile(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : null);
    }
  };

  const handleContentChange = (filePath, newContent) => {
    setFileContents(prev => ({ ...prev, [filePath]: newContent }));
    setUnsavedFiles(prev => ({ ...prev, [filePath]: true }));
  };

  const handleSaveFile = async (filePath) => {
    if (!sandboxData?.agentUrl || !filePath) return;
    setIsSaving(true);
    try {
      const content = fileContents[filePath] || '';
      await updateFile(sandboxData.agentUrl, filePath, content);
      setUnsavedFiles(prev => ({ ...prev, [filePath]: false }));
    } catch (err) {
      console.error(`Error saving ${filePath}:`, err);
    } finally {
      setIsSaving(false);
    }
  };

  // Refresh file list from sandbox
  const handleRefreshFiles = async () => {
    if (sandboxData?.agentUrl) {
      const files = await listFiles(sandboxData.agentUrl);
      setFileList(files);
    }
  };

  // AI Prompt submission
  const handleSendMessage = (userPrompt) => {
    if (!sandboxData) return;

    const newMessages = [...messages, { sender: 'user', text: userPrompt }];
    setMessages(newMessages);
    setIsGenerating(true);
    setStreamLogs([]);
    setCurrentLog('Initiating stream connection...');

    invokeAiStream(
      userPrompt,
      sandboxData.sandboxId,
      {
        onLog: (logText) => {
          setStreamLogs(prev => [...prev, logText]);
          setCurrentLog(logText);
        },
        onFinal: (finalText) => {
          setMessages(prev => [...prev, { sender: 'ai', text: finalText }]);
        },
        onDone: async () => {
          setIsGenerating(false);
          setCurrentLog('');
          // Refresh file list & reload active file content
          if (sandboxData?.agentUrl) {
            const updatedFiles = await listFiles(sandboxData.agentUrl);
            setFileList(updatedFiles);
            if (activeFile) {
              const freshContent = await readFile(sandboxData.agentUrl, activeFile);
              setFileContents(prev => ({ ...prev, [activeFile]: freshContent }));
              setUnsavedFiles(prev => ({ ...prev, [activeFile]: false }));
            }
          }
        },
        onError: (err) => {
          console.error('SSE Stream Error:', err);
          setIsGenerating(false);
          setMessages(prev => [...prev, { sender: 'ai', text: `Error connecting to AI service stream: ${err?.message || String(err) || 'Unknown error'}` }]);
        }
      }
    );
  };

  // Render Hero landing screen if no active sandbox
  if (!sandboxData) {
    return <Hero onStartSandbox={handleStartSandbox} loading={loadingSandbox} />;
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        sandboxData={sandboxData}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        onNewSandbox={handleNewSandbox}
        terminalOpen={terminalOpen}
        setTerminalOpen={setTerminalOpen}
      />

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-tabs">
            <button 
              className={`tab-item ${sidebarTab === 'chat' ? 'active' : ''}`}
              onClick={() => setSidebarTab('chat')}
            >
              <MessageSquare size={15} />
              <span>AI Prompt</span>
            </button>
            <button 
              className={`tab-item ${sidebarTab === 'files' ? 'active' : ''}`}
              onClick={() => setSidebarTab('files')}
            >
              <FolderTree size={15} />
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

        {/* Content Area (Code + Wide Preview) */}
        <main className="content-area">
          <div className="split-container">
            {/* Code Editor (40%) */}
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

            {/* Wide Preview Panel (60%) */}
            <div className={`preview-section ${layoutMode === 'code' ? 'hidden' : ''}`}>
              <PreviewPanel previewUrl={sandboxData.previewUrl} />
            </div>
          </div>

          {/* Bottom Socket.io Terminal Drawer */}
          <TerminalPanel
            agentUrl={sandboxData.agentUrl}
            isCollapsed={!terminalOpen}
            onToggleCollapse={() => setTerminalOpen(!terminalOpen)}
          />
        </main>
      </div>
    </div>
  );
}
