import { useEffect } from 'react';
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
      <div className="code-editor-container empty-editor-state">
        <FileCode size={36} className="empty-icon" />
        <p className="empty-state-copy">No file open. Pick one from Explorer to start editing.</p>
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
              <span className="tab-name">{fileName}</span>
              {isTabDirty && <span className="unsaved-weld-dot" title="Unsaved changes" />}
              <button
                className="close-tab-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tabPath);
                }}
                aria-label={`Close tab ${fileName}`}
              >
                <X size={11} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="filepath-label">{activeFile}</div>
        <div className="save-indicator">
          {isDirty ? (
            <span className="status-unsaved">• Unsaved changes</span>
          ) : (
            <span className="status-saved">
              <Check size={12} /> Saved
            </span>
          )}
          <button
            className="square-action-btn save-btn"
            onClick={() => onSaveFile(activeFile)}
            disabled={!isDirty || isSaving}
            title="Save file (Ctrl+S)"
          >
            <Save size={12} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="editor-canvas-wrapper">
        <div className="line-numbers">
          {lineNumbers.map((num) => (
            <div key={num} className="line-num">{num}</div>
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
