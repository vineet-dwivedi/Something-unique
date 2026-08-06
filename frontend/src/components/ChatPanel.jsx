import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, CheckCircle2, Loader2 } from 'lucide-react';

// ─── Lightweight inline markdown renderer ────────────────────────────────────
// Handles: ### headings, **bold**, `inline code`, file paths, plain text
function renderInline(text) {
  // Split on bold (**...**) and inline code (`...`)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function MarkdownMessage({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H3 heading
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="md-h3">{renderInline(line.slice(4))}</h3>);
      i++;
      continue;
    }

    // H2 heading
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="md-h2">{renderInline(line.slice(3))}</h2>);
      i++;
      continue;
    }

    // H1 heading
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="md-h1">{renderInline(line.slice(2))}</h1>);
      i++;
      continue;
    }

    // Numbered list item  (e.g. "1. something")
    if (/^\d+\.\s/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(<li key={i}>{renderInline(lines[i].replace(/^\d+\.\s/, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="md-ol">{listItems}</ol>);
      continue;
    }

    // Bullet list item  (- or *)
    if (/^[-*]\s/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        listItems.push(<li key={i}>{renderInline(lines[i].replace(/^[-*]\s/, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="md-ul">{listItems}</ul>);
      continue;
    }

    // Blank line — spacer
    if (line.trim() === '') {
      elements.push(<div key={i} className="md-spacer" />);
      i++;
      continue;
    }

    // Plain paragraph
    elements.push(<p key={i} className="md-p">{renderInline(line)}</p>);
    i++;
  }

  return <div className="md-body">{elements}</div>;
}

// ─── ChatPanel ───────────────────────────────────────────────────────────────
export default function ChatPanel({
  messages,
  onSendMessage,
  isGenerating,
  streamLogs,
  currentLog,
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
              {msg.sender === 'user'
                ? <User size={12} className="msg-icon" />
                : <Sparkles size={12} className="msg-icon" />}
              <span className="sender-name">{msg.sender === 'user' ? 'You' : 'Assistant'}</span>
            </div>

            <div className="message-content">
              {msg.sender === 'ai'
                ? <MarkdownMessage text={msg.text} />
                : <p className="md-p">{msg.text}</p>
              }
            </div>
          </div>
        ))}

        {/* SSE Stream Logs while AI is generating */}
        {isGenerating && (
          <div className="sse-stream-logs">
            <div className="stream-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div className="spinner" />
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
          <button className="chip" onClick={() => handleChipClick('Add light and dark theme mode with animations')}>
            theme modes
          </button>
          <button className="chip" onClick={() => handleChipClick('Improve layout responsiveness and mobile accessibility')}>
            responsive layout
          </button>
          <button className="chip" onClick={() => handleChipClick('Add interactive states and subtle hover animations')}>
            interactive states
          </button>
        </div>
      </div>
    </div>
  );
}
