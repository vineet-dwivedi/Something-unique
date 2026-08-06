import React, { useState } from 'react';
import { Sparkles, Terminal, Zap, ArrowRight, Quote } from 'lucide-react';
import KnitLogo from './KnitLogo';

const FEATURES = [
  {
    icon: <Sparkles size={18} />,
    title: 'Describe. Build. Done.',
    body: 'Tell the AI what to build in plain English. Watch it scaffold, write, and wire up real code — live, in seconds.',
  },
  {
    icon: <Terminal size={18} />,
    title: 'A real shell. Always on.',
    body: 'A full xterm.js terminal connected over Socket.io. Run installs, scripts, and commands as if it\'s your own machine.',
  },
  {
    icon: <Zap size={18} />,
    title: 'See it. Right now.',
    body: 'Every keystroke reflected instantly in a hot-reloading preview pane. No builds. No waiting. Just your idea, alive.',
  },
];

export default function Hero({ onStartSandbox, loading, theme, onToggleTheme }) {
  const [projectTitle, setProjectTitle] = useState('');

  const handleLaunch = () => {
    onStartSandbox(projectTitle.trim() || 'My Project');
  };

  return (
    <div className="hero-screen">
      {/* Subtle ambient background */}
      <div className="hero-bg-pattern" aria-hidden="true">
        <div className="hero-blob" />
        <div className="hero-blob-2" />
      </div>

      {/* Fixed top nav */}
      <nav className="hero-nav">
        <div className="hero-brand">
          <KnitLogo size={28} />
          <span>Knit Dev</span>
        </div>

        <div className="hero-nav-actions">
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              // Sun icon
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              // Moon icon
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="hero-container">
        {/* Eyebrow */}
        <div className="hero-eyebrow">
          <Sparkles size={12} />
          <span>AI-Powered Sandbox — Now in Beta</span>
        </div>

        {/* Title */}
        <h1 className="hero-title">
          Your idea,{' '}
          <span className="title-accent">running</span>
          <br />
          in under a minute.
        </h1>

        {/* Scrollable Quotes Reel */}
        <div className="hero-scrollable-reel-container">
          <div className="scroll-hint">
            <span>Scroll to explore inspiration</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="scroll-arrow-animate">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
          <div className="hero-scrollable-reel">
            <div className="reel-card card-sage">
              <div className="card-top">
                <span className="card-num">01</span>
                <div className="card-icon-wrap"><Quote size={12} /></div>
              </div>
              <p className="card-quote">
                "Simplicity is subtraction of the obvious and addition of the meaningful."
              </p>
              <span className="card-author">— John Maeda</span>
            </div>
            
            <div className="reel-card card-sky">
              <div className="card-top">
                <span className="card-num">02</span>
                <div className="card-icon-wrap"><Quote size={12} /></div>
              </div>
              <p className="card-quote">
                "Details are not the details. They make the design."
              </p>
              <span className="card-author">— Charles Eames</span>
            </div>
            
            <div className="reel-card card-amber">
              <div className="card-top">
                <span className="card-num">03</span>
                <div className="card-icon-wrap"><Quote size={12} /></div>
              </div>
              <p className="card-quote">
                "The best way to predict the future is to invent it."
              </p>
              <span className="card-author">— Alan Kay</span>
            </div>
            
            <div className="reel-card card-rose">
              <div className="card-top">
                <span className="card-num">04</span>
                <div className="card-icon-wrap"><Quote size={12} /></div>
              </div>
              <p className="card-quote">
                "First, solve the problem. Then, write the code."
              </p>
              <span className="card-author">— John Johnson</span>
            </div>
          </div>
        </div>



        {/* CTA */}
        <div className="hero-cta">
          <div className="project-name-row">
            <input
              className="project-name-input"
              type="text"
              placeholder="Project name (e.g. Portfolio Site)"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleLaunch()}
              disabled={loading}
              maxLength={80}
              id="project-name-input"
            />
          </div>

          <button
            className="start-btn"
            onClick={handleLaunch}
            disabled={loading}
            id="start-sandbox-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                <span>Spinning up your sandbox…</span>
              </>
            ) : (
              <>
                <span>Launch Sandbox</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="cta-hint">
            <span>
              <span className="ticker-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', marginRight: '6px', animation: 'pulse 2s ease-in-out infinite' }} />
              Free while in beta · No credit card required
            </span>
          </p>
        </div>

        {/* Feature Cards */}
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feat-icon-wrap">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.body}</p>
            </div>
          ))}
        </div>

        {/* Ticker / social proof */}
        <div className="hero-ticker">
          <span>Built for builders who move fast</span>
          <span className="ticker-divider" />
          <span>Backed by live Socket.io streams</span>
          <span className="ticker-divider" />
          <span>No local setup ever</span>
        </div>
      </div>
    </div>
  );
}
