import { useState, useEffect } from 'react';
import KnitLogo from './KnitLogo';
import ThreadLine from './ThreadLine';

// Supported stack: React + Tailwind/CSS — landing pages & component UIs
const STARTER_TEMPLATES = [
  {
    label: 'Landing Page',
    value: 'Landing page — hero, features, CTA',
    tag: 'react + tailwind',
    hint: 'Hero, features, CTA sections',
  },
  {
    label: 'Portfolio Site',
    value: 'Portfolio site — about, projects, contact',
    tag: 'react + css',
    hint: 'About, projects, contact',
  },
  {
    label: 'Marketing Page',
    value: 'Marketing page — pricing, testimonials, FAQ',
    tag: 'react + tailwind',
    hint: 'Pricing, testimonials, FAQ',
  },
  {
    label: 'Component UI',
    value: 'UI component showcase — cards, buttons, forms',
    tag: 'react + css',
    hint: 'Cards, buttons, forms',
  },
];

const FEATURES = [
  {
    tag: '[ ai ]',
    title: 'Say it once.',
    body: 'Describe your landing page or UI in plain English. Knit Dev writes React + Tailwind/CSS code — if the primary model rate-limits, it fails over automatically so your build never stalls.',
  },
  {
    tag: '[ stack ]',
    title: 'React + Tailwind, wired up.',
    body: 'Every sandbox ships a pre-configured React + Tailwind (or plain CSS) environment. No boilerplate decisions — just describe the page and watch it appear.',
  },
  {
    tag: '[ preview ]',
    title: 'Live as you describe.',
    body: 'Every change reflected instantly through a hot-reloading iframe. No build step between your words and seeing the result render.',
  },
];

const TEMPLATE_ICONS = [
  // Landing Page — layout/columns
  (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">
      <rect x="3" y="3" width="18" height="5" />
      <rect x="3" y="11" width="10" height="10" />
      <rect x="16" y="11" width="5" height="10" />
    </svg>
  ),
  // Portfolio Site — person card
  (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  ),
  // Marketing Page — megaphone / growth chart
  (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">
      <polyline points="22 7 13 16 8 11 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  // Component UI — layers / stack
  (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">
      <polygon points="12 2 22 8.5 12 15 2 8.5" />
      <polyline points="2 15.5 12 22 22 15.5" />
      <polyline points="2 12 12 18.5 22 12" />
    </svg>
  ),
];

import { LogOut } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

export default function Hero({ user, onLogin, onLogout, onStartSandbox, loading, theme, onToggleTheme }) {
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [eyebrowHovered, setEyebrowHovered] = useState(false);
  const [showHeadlineAccent, setShowHeadlineAccent] = useState(false);
  const [arrowLaunched, setArrowLaunched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHeadlineAccent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleLaunch = () => {
    setArrowLaunched(true);
    setTimeout(() => setArrowLaunched(false), 600);
    onStartSandbox(projectTitle.trim() || 'My Project');
  };

  const handleSelectTemplate = (template, index) => {
    setProjectTitle(template.value);
    setSelectedTemplate(index);
  };

  return (
    <div className="hero-screen">
      {/* ── Ambient Fixed Loom Grid & Woven Threads ── */}
      <div className="hero-grid-bg" aria-hidden="true">
        <svg className="woven-threads-svg" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M -100 200 C 300 150, 700 350, 1100 180 C 1300 100, 1500 250, 1600 200"
            stroke="var(--thread-madder)"
            strokeWidth="1.2"
            strokeDasharray="8 6"
            className="ambient-thread thread-1"
          />
          <path
            d="M -50 500 C 400 650, 800 450, 1200 600 C 1400 680, 1550 520, 1650 580"
            stroke="var(--thread-weld)"
            strokeWidth="1"
            strokeDasharray="6 8"
            className="ambient-thread thread-2"
          />
          <path
            d="M 100 -50 C 250 300, 600 200, 850 700 C 1000 900, 1300 800, 1500 950"
            stroke="var(--thread-sage)"
            strokeWidth="1.2"
            strokeDasharray="12 6"
            className="ambient-thread thread-3"
          />
        </svg>
      </div>

      {/* ── Nav Bar ── */}
      <nav className="hero-nav">
        <div className="hero-brand">
          <KnitLogo size={26} />
          <span className="brand-name">Knit Dev</span>
        </div>

        <div className="hero-nav-actions">
          {user ? (
            <div className="user-profile-badge">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar-img" />
              ) : (
                <span className="user-avatar-fallback">{user.name?.charAt(0) || 'U'}</span>
              )}
              <span className="user-name-text">{user.name || user.email}</span>
              <button 
                onClick={onLogout} 
                className="logout-btn square-btn" 
                title="Sign Out" 
                aria-label="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="google-login-btn">
              <GoogleIcon />
              <span>Sign in</span>
            </button>
          )}

          <button
            className="theme-toggle square-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Main Hero Content ── */}
      <main className="hero-container">
        {/* 1. Eyebrow */}
        <div
          className="hero-eyebrow"
          onMouseEnter={() => setEyebrowHovered(true)}
          onMouseLeave={() => setEyebrowHovered(false)}
        >
          <span className="eyebrow-text">
            [ <span className="square-indicator" /> SANDBOX ENGINE — ONLINE ]
          </span>
          {eyebrowHovered && (
            <ThreadLine
              variant="underline"
              color="var(--thread-sage)"
              className="eyebrow-thread"
            />
          )}
        </div>

        {/* 2. Display Headline */}
        <h1 className="hero-title">
          Describe the app.
          <br />
          Watch it come{' '}
          <span className="title-accent-wrap">
            <span className="title-accent">together</span>
            {showHeadlineAccent && (
              <ThreadLine
                variant="underline"
                color="var(--thread-madder)"
                className="headline-thread"
              />
            )}
          </span>
          .
        </h1>

        {/* 3. CTA — Command Bar Launch Form */}
        <div className="hero-cta-section">
          <div className="launch-command-bar">
            <input
              className="project-name-input"
              type="text"
              placeholder="Project name (e.g. expense-tracker-api)"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleLaunch()}
              disabled={loading}
              maxLength={80}
              id="project-name-input"
            />

            <button
              className="launch-btn"
              onClick={handleLaunch}
              disabled={loading}
              id="start-sandbox-btn"
            >
              {loading ? (
                <>
                  <span>Knitting your sandbox…</span>
                  <ThreadLine variant="border-stitch" color="var(--thread-madder)" />
                </>
              ) : (
                <span className="btn-content">
                  <span>Knit it</span>
                  <svg
                    className={`launch-arrow-icon${arrowLaunched ? ' arrow-launched' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" className="arrow-stem" />
                    <polyline points="12 5 19 12 12 19" className="arrow-head" />
                  </svg>
                </span>
              )}
            </button>
          </div>

          <p className="cta-hint">
            <span className="static-square-dot" />
            <span>Free in beta · No credit card needed</span>
          </p>
        </div>

        {/* 4. Starter Template Strip */}
        <div className="starter-template-section">
          <div className="template-strip-header">
            <span className="mono-label">[ STARTER TEMPLATES ]</span>
          </div>
          <div className="starter-strip">
            {STARTER_TEMPLATES.map((tmpl, idx) => {
              const isSelected = selectedTemplate === idx;
              return (
                <button
                  key={tmpl.label}
                  className={`template-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelectTemplate(tmpl, idx)}
                >
                  <span className="tmpl-icon">{TEMPLATE_ICONS[idx]}</span>
                  <span className="tmpl-body">
                    <span className="tmpl-name">{tmpl.label}</span>
                    <span className="tmpl-hint">{tmpl.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {/* Shared horizontal thread running beneath cards */}
          <div className="strip-thread-rail" aria-hidden="true">
            <ThreadLine
              variant="sliding"
              color={selectedTemplate !== null ? 'var(--thread-madder)' : 'var(--border-thread-strong)'}
            />
          </div>
        </div>

        {/* 5. Feature Cards */}
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.tag}>
              <span className="card-tag">{f.tag}</span>
              <h3 className="card-title">{f.title}</h3>
              <p className="card-body">{f.body}</p>
            </div>
          ))}
        </div>

        {/* 6. Footer / Ticker */}
        <footer className="hero-footer">
          <span className="footer-status-line">knit-dev v0.9 · status</span>
        </footer>
      </main>
    </div>
  );
}
