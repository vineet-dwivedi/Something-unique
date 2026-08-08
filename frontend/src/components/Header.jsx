import { useState } from 'react';
import { Copy, PlusCircle, ExternalLink, Terminal as TerminalIcon } from 'lucide-react';
import KnitLogo from './KnitLogo';
import ThreadLine from './ThreadLine';

import { LogOut } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

export default function Header({
  user,
  onLogin,
  onLogout,
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

  const shortId = sandboxData?.sandboxId ? sandboxData.sandboxId.substring(0, 8) : '';

  return (
    <header className="top-header">
      {/* Accessibility Announcement for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {copied ? 'Sandbox ID copied to clipboard' : ''}
      </div>

      {/* ── Left Zone: Logo + Bracketed Mono Sandbox ID ── */}
      <div className="header-left">
        <div className="brand-logo">
          <KnitLogo size={22} />
          <span className="brand-title">Knit Dev</span>
        </div>

        {sandboxData && (
          <div className={`mono-sandbox-id ${copied ? 'is-copied' : ''}`}>
            <span className="id-bracket">[ sandbox-{shortId} ]</span>
            <button
              onClick={handleCopyId}
              title="Copy Sandbox ID"
              className="copy-id-btn"
              aria-label="Copy Sandbox ID"
            >
              {copied ? (
                <ThreadLine variant="knot" active={true} width={13} height={13} color="var(--thread-sage)" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Centre Zone: Segmented Layout Switcher + Terminal Toggle ── */}
      {sandboxData && (
        <div className="header-center">
          <div className="layout-segmented-control">
            {[
              { id: 'split', label: 'Split' },
              { id: 'code', label: 'Code' },
              { id: 'preview', label: 'Preview' },
            ].map(({ id, label }) => {
              const isActive = layoutMode === id;
              return (
                <button
                  key={id}
                  className={`segmented-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setLayoutMode(id)}
                  title={`${label} view`}
                >
                  <span className="btn-label">{label}</span>
                  {isActive && (
                    <ThreadLine
                      variant="sliding"
                      color="var(--thread-madder)"
                      className="tab-thread-line"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            className={`square-action-btn ${terminalOpen ? 'active-term' : ''}`}
            onClick={() => setTerminalOpen(!terminalOpen)}
            title="Toggle Terminal Drawer"
          >
            <TerminalIcon size={13} />
            <span className="btn-text">Terminal</span>
          </button>
        </div>
      )}

      {/* ── Right Zone: Preview Link, New, User Profile/Login, Theme Toggle ── */}
      <div className="header-right">
        {sandboxData?.previewUrl && (
          <a
            href={sandboxData.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="square-action-btn link-btn"
          >
            <ExternalLink size={12} />
            <span className="btn-text">Open Preview</span>
          </a>
        )}

        {sandboxData && (
          <button className="square-action-btn" onClick={onNewSandbox} title="New Sandbox">
            <PlusCircle size={13} />
            <span className="btn-text">New</span>
          </button>
        )}

        {/* User Auth Profile Badge or Login Button */}
        {user ? (
          <div className="user-profile-badge header-user-badge">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="user-avatar-img" />
            ) : (
              <span className="user-avatar-fallback">{user.name?.charAt(0) || 'U'}</span>
            )}
            <span className="user-name-text">{user.name || user.email}</span>
            <button 
              onClick={onLogout} 
              className="square-action-btn logout-btn" 
              title="Sign Out" 
              aria-label="Sign out"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <button onClick={onLogin} className="google-login-btn square-action-btn">
            <GoogleIcon />
            <span className="btn-text">Sign in</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle square-action-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
