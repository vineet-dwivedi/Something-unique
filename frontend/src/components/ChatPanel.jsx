import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Terminal, CheckCircle2, Loader2, Code } from 'lucide-react';

export default function ChatPanel({ 
  messages, 
  onSendMessage, 
  isGenerating, 
  streamLogs, 
  currentLog 
}) {
  const [inputPrompt, setInputPrompt] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamLogs, currentLog]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;
    onSendMessage(inputPrompt);
    setInputPrompt('');
  };

  const handleChipClick = (suggestion) => {
    if (isGenerating) return;
    onSendMessage(suggestion);
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message-item">
            <div className={`avatar ${msg.sender === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
              {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            <div className="message-content">
              {msg.text.split('\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}

        {/* SSE Stream Logs Box while AI is generating */}
        {isGenerating && (
          <div className="sse-stream-logs">
            <div className="stream-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner"></div>
                <span>AI Sandbox Agent Working...</span>
              </div>
              <span className="badge-glow" style={{ fontSize: '0.7rem' }}>SSE Live</span>
            </div>

            {streamLogs.map((log, idx) => (
              <div key={idx} className="stream-log-line">
                <CheckCircle2 className="log-icon" size={12} />
                <span>{log}</span>
              </div>
            ))}

            {currentLog && (
              <div className="stream-log-line" style={{ color: '#818cf8' }}>
                <Loader2 className="spin-icon" size={12} />
                <span>{currentLog}</span>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Input Area */}
      <div className="chat-input-box">
        <form onSubmit={handleSubmit} className="prompt-form">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI to generate or modify your frontend (e.g. Add dark mode, create responsive navbar...)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isGenerating}
          />
          <button 
            type="submit" 
            className="glass-button btn-primary send-btn"
            disabled={isGenerating || !inputPrompt.trim()}
          >
            {isGenerating ? <Loader2 className="spin-icon" size={18} /> : <Send size={18} />}
          </button>
        </form>

        <div className="prompt-suggestions">
          <button className="chip" onClick={() => handleChipClick("Add animations for winning moves, Improve UI with a dark theme")}>
            ✨ Dark Theme & Animations
          </button>
          <button className="chip" onClick={() => handleChipClick("Add a restart button for quick resets and responsive mobile layout")}>
            ⚡ Restart Button & Responsive Layout
          </button>
          <button className="chip" onClick={() => handleChipClick("Add interactive score counter with glassmorphic cards")}>
            🎨 Glassmorphic Score Cards
          </button>
        </div>
      </div>
    </div>
  );
}
