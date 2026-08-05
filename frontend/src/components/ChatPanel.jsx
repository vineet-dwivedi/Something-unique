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
          <div key={index} className={`message-item ${msg.sender === 'user' ? 'user' : 'ai'}`}>
            <div className="message-header">
              {msg.sender === 'user' ? <User size={12} className="msg-icon" /> : <Sparkles size={12} className="msg-icon" />}
              <span className="sender-name">{msg.sender === 'user' ? 'You' : 'Assistant'}</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div className="spinner"></div>
                <span>Agent working…</span>
              </div>
              <span className="badge-glow" style={{ fontSize: '0.65rem' }}>Live</span>
            </div>

            {streamLogs.map((log, idx) => (
              <div key={idx} className="stream-log-line">
                <CheckCircle2 className="log-icon" size={10} />
                <span>{log}</span>
              </div>
            ))}

            {currentLog && (
              <div className="stream-log-line" style={{ color: 'var(--accent)' }}>
                <Loader2 className="spin-icon" size={10} />
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
            placeholder="ask ai to build…"
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
            className="send-btn"
            disabled={isGenerating || !inputPrompt.trim()}
          >
            {isGenerating ? <Loader2 className="spin-icon" size={15} /> : <Send size={15} />}
          </button>
        </form>

        <div className="prompt-suggestions">
          <button className="chip" onClick={() => handleChipClick("Add light and dark theme mode with animations")}>
            theme modes
          </button>
          <button className="chip" onClick={() => handleChipClick("Improve layout responsiveness and mobile accessibility")}>
            responsive layout
          </button>
          <button className="chip" onClick={() => handleChipClick("Add interactive states and subtle hover animations")}>
            interactive states
          </button>
        </div>
      </div>
    </div>
  );
}

