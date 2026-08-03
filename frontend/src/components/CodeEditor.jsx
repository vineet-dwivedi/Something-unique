import React, { useEffect } from 'react';
import { Save, X, FileCode, Check } from 'lucide-react';

export default function CodeEditor({ 
  openTabs, 
  activeFile, 
  onSelectTab, 
  onCloseTab, 
  fileContents, 
  onContentChange, 
  onSaveFile,
  unsavedFiles,
  isSaving
}) {
  const currentContent = activeFile ? (fileContents[activeFile] ?? '') : '';
  const lines = currentContent.split('\n');
  const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeFile) {
          onSaveFile(activeFile);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, onSaveFile]);

  if (!activeFile) {
    return (
      <div className="code-editor-container" style={{ justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
        <FileCode size={48} style={{ opacity: 0.3 }} />
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Select a file from the explorer to open in code editor</p>
      </div>
    );
  }

  const isDirty = unsavedFiles[activeFile];

  return (
    <div className="code-editor-container">
      {/* File Tab Bar */}
      <div className="tab-bar">
        {openTabs.map((tabPath) => {
          const fileName = tabPath.split('/').pop();
          const isActive = tabPath === activeFile;
          const isTabDirty = unsavedFiles[tabPath];

          return (
            <div 
              key={tabPath} 
              className={`editor-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tabPath)}
            >
              <span>{fileName}</span>
              {isTabDirty && <span className="unsaved-dot" title="Unsaved changes"></span>}
              <span 
                className="close-tab-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tabPath);
                }}
              >
                <X size={12} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="filepath-label">{activeFile}</div>
        <div className="save-indicator">
          {isDirty ? (
            <span style={{ color: '#f59e0b', fontSize: '0.78rem' }}>• Unsaved changes</span>
          ) : (
            <span style={{ color: '#10b981', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Check size={12} /> Saved
            </span>
          )}
          <button 
            className="glass-button btn-sm btn-primary" 
            onClick={() => onSaveFile(activeFile)}
            disabled={!isDirty || isSaving}
            style={{ padding: '0.2rem 0.6rem', marginLeft: '0.5rem' }}
          >
            <Save size={12} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="editor-canvas-wrapper">
        <div className="line-numbers">
          {lineNumbers.map(num => (
            <div key={num}>{num}</div>
          ))}
        </div>
        <textarea
          className="code-textarea"
          value={currentContent}
          onChange={(e) => onContentChange(activeFile, e.target.value)}
          placeholder="// Code content..."
          spellCheck="false"
        />
      </div>
    </div>
  );
}
