import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  Copy,
  Check,
  Layout,
  Code,
  Eye,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import KnitLogo from './KnitLogo';

// Sun / Moon SVG icons inline (no extra dep)
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Header({
  sandboxData,
  layoutMode,
  setLayoutMode,
  onNewSandbox,
  terminalOpen,
  setTerminalOpen,
  theme,
  onToggleTheme,
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
      {/* ── Brand + Status ── */}
      <div className="header-left">
        <div className="brand-logo">
          <KnitLogo size={28} />
          <span>Knit Dev</span>
        </div>

        {sandboxData && (
          <div className="badge-glow">
            <span className="pulse-dot" />
            <span>Sandbox: {sandboxData.sandboxId?.substring(0, 8)}…</span>
            <button
              onClick={handleCopyId}
              title="Copy Sandbox ID"
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0' }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>
          </div>
        )}
      </div>

      {/* ── Layout Switcher + Terminal Toggle ── */}
      {sandboxData && (
        <div className="header-center">
          <div className="layout-switcher">
            {[
              { id: 'split', icon: <Layout size={13} />, label: 'Split' },
              { id: 'code',  icon: <Code size={13} />,   label: 'Code'  },
              { id: 'preview', icon: <Eye size={13} />,  label: 'Preview' },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                className={`layout-btn ${layoutMode === id ? 'active' : ''}`}
                onClick={() => setLayoutMode(id)}
                title={`${label} view`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            className={`btn btn-sm ${terminalOpen ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTerminalOpen(!terminalOpen)}
            title="Toggle Terminal"
          >
            <TerminalIcon size={13} />
            <span>Terminal</span>
          </button>
        </div>
      )}

      {/* ── Right Actions ── */}
      <div className="header-right">
        {sandboxData?.previewUrl && (
          <a
            href={sandboxData.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={12} />
            <span>Open Preview</span>
          </a>
        )}

        {sandboxData && (
          <button className="btn btn-ghost btn-sm" onClick={onNewSandbox}>
            <PlusCircle size={13} />
            <span>New</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
