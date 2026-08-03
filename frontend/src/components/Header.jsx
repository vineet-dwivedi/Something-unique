import React, { useState } from 'react';
import { 
  Box, 
  Terminal as TerminalIcon, 
  Play, 
  Copy, 
  Check, 
  Layout, 
  Code, 
  Eye, 
  PlusCircle, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Header({ 
  sandboxData, 
  layoutMode, 
  setLayoutMode, 
  onNewSandbox,
  terminalOpen,
  setTerminalOpen
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (sandboxData?.sandboxId) {
      navigator.clipboard.writeText(sandboxData.sandboxId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="brand-logo">
          <div className="logo-icon">
            <Sparkles size={16} />
          </div>
          <span>Knit Dev</span>
        </div>

        {sandboxData && (
          <div className="badge-glow">
            <span className="pulse-dot"></span>
            <span>Active Sandbox: {sandboxData.sandboxId?.substring(0, 8)}...</span>
            <button 
              onClick={handleCopyId} 
              title="Copy Sandbox ID"
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {copied ? <Check size={12} color="#6ee7b7" /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>

      {sandboxData && (
        <div className="header-center">
          <div className="layout-switcher">
            <button 
              className={`layout-btn ${layoutMode === 'split' ? 'active' : ''}`}
              onClick={() => setLayoutMode('split')}
              title="Split View (Code & Wide Preview)"
            >
              <Layout size={14} />
              <span>Split</span>
            </button>
            <button 
              className={`layout-btn ${layoutMode === 'code' ? 'active' : ''}`}
              onClick={() => setLayoutMode('code')}
              title="Code Focus Mode"
            >
              <Code size={14} />
              <span>Code</span>
            </button>
            <button 
              className={`layout-btn ${layoutMode === 'preview' ? 'active' : ''}`}
              onClick={() => setLayoutMode('preview')}
              title="Preview Focus Mode"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          </div>

          <button 
            className={`glass-button btn-sm ${terminalOpen ? 'btn-primary' : ''}`}
            onClick={() => setTerminalOpen(!terminalOpen)}
            title="Toggle Socket.io Terminal"
            style={{ marginLeft: '0.75rem' }}
          >
            <TerminalIcon size={14} />
            <span>Terminal</span>
          </button>
        </div>
      )}

      <div className="header-right">
        {sandboxData?.previewUrl && (
          <a 
            href={sandboxData.previewUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-button btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={13} />
            <span>Open Preview</span>
          </a>
        )}

        <button className="glass-button btn-sm btn-primary" onClick={onNewSandbox}>
          <PlusCircle size={14} />
          <span>New Sandbox</span>
        </button>
      </div>
    </header>
  );
}
