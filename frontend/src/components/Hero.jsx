import React from 'react';
import { Play, Sparkles, Terminal, Code2, Cpu, Rocket } from 'lucide-react';

export default function Hero({ onStartSandbox, loading }) {
  return (
    <div className="hero-screen">
      <div className="bg-glow-orb"></div>

      <div className="hero-container">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>Next-Gen AI Sandbox Environment</span>
        </div>

        <h1 className="hero-title">
          Build & Preview Web Apps <br />
          <span className="gradient-text">Powered by AI & Real-Time Socket</span>
        </h1>

        <p className="hero-description">
          Create an instant isolated sandbox container. Prompt the AI assistant to write code, inspect files in real-time, test terminal commands with socket.io, and preview live updates instantly.
        </p>

        <div className="hero-action-card">
          <button 
            className="glass-button btn-primary start-btn" 
            onClick={onStartSandbox}
            disabled={loading}
          >
            {loading ? (
              <>
                <Sparkles className="spin-icon" size={20} />
                <span>Initializing Sandbox Container...</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>Start Sandbox</span>
              </>
            )}
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <div className="feat-icon">
              <Sparkles size={20} />
            </div>
            <h4>AI Code Generator</h4>
            <p>Stream real-time SSE updates as the AI lists, reads, and writes project files.</p>
          </div>

          <div className="feature-item">
            <div className="feat-icon">
              <Terminal size={20} />
            </div>
            <h4>Live Socket Terminal</h4>
            <p>Full xterm.js shell access connected via Socket.io for immediate CLI interaction.</p>
          </div>

          <div className="feature-item">
            <div className="feat-icon">
              <Rocket size={20} />
            </div>
            <h4>Wide Instant Preview</h4>
            <p>Continuous hot-reloading preview iframe running on isolated sandbox domains.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
