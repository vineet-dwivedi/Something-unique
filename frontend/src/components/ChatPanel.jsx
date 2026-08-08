import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ThreadLine from './ThreadLine';

// ─── Lightweight inline markdown renderer ────────────────────────────────────
function renderInline(text) {
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

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="md-h3">{renderInline(line.slice(4))}</h3>);
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="md-h2">{renderInline(line.slice(3))}</h2>);
      i++;
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="md-h1">{renderInline(line.slice(2))}</h1>);
      i++;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(<li key={i}>{renderInline(lines[i].replace(/^\d+\.\s/, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="md-ol">{listItems}</ol>);
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        listItems.push(<li key={i}>{renderInline(lines[i].replace(/^[-*]\s/, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="md-ul">{listItems}</ul>);
      continue;
    }

    if (line.trim() === '') {
      elements.push(<div key={i} className="md-spacer" />);
      i++;
      continue;
    }

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
  const [hoveredChip, setHoveredChip] = useState(null);
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

  const totalSteps = streamLogs.length + (currentLog ? 1 : 0);
  const railProgress = totalSteps > 0 ? Math.min(1, streamLogs.length / (totalSteps || 1)) : 0;

  const suggestions = [
    'Add light and dark theme mode with animations',
    'Improve layout responsiveness and mobile accessibility',
    'Add interactive states and subtle hover animations',
  ];

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-item ${msg.sender === 'user' ? 'sender-user' : 'sender-knit'}`}
          >
            <div className="message-header">
              <span className="mono-sender-label">
                [ {msg.sender === 'user' ? 'YOU' : 'KNIT'} ]
              </span>
            </div>

            <div className="message-content">
              {msg.sender === 'ai' ? (
                <MarkdownMessage text={msg.text} />
              ) : (
                <p className="md-p">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {/* Live SSE Stream Log Rail Panel */}
        {isGenerating && (
          <div className="sse-stream-logs">
            <div className="stream-header">
              <span className="mono-stream-title">[ BUILD LOG — LIVE STREAM ]</span>
              <span className="mono-live-tag">LIVE</span>
            </div>

            <div className="stream-rail-wrapper">
              <ThreadLine
                variant="rail"
                color="var(--thread-weld)"
                progress={railProgress}
                className="log-rail"
              />

              <div className="stream-log-list">
                {streamLogs.map((log, idx) => (
                  <div key={idx} className="stream-log-line is-done">
                    <ThreadLine variant="knot" active={true} color="var(--thread-sage)" width={12} height={12} />
                    <span className="log-text">{log}</span>
                  </div>
                ))}

                {currentLog && (
                  <div className="stream-log-line is-in-progress">
                    <ThreadLine variant="knot" active={false} color="var(--thread-weld)" width={12} height={12} />
                    <span className="log-text building-text">{currentLog}</span>
                  </div>
                )}
              </div>
            </div>
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
            placeholder="Describe what you want to build in plain English..."
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
            title="Send prompt"
          >
            {isGenerating ? (
              <>
                <span className="mono-sending">KNITTING</span>
                <ThreadLine variant="border-stitch" color="var(--thread-weld)" />
              </>
            ) : (
              <Send size={14} />
            )}
          </button>
        </form>

        <div className="prompt-suggestions">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              className="suggestion-tag"
              onClick={() => handleChipClick(suggestion)}
              onMouseEnter={() => setHoveredChip(idx)}
              onMouseLeave={() => setHoveredChip(null)}
            >
              <span className="chip-label">{suggestion}</span>
              {hoveredChip === idx && (
                <ThreadLine
                  variant="underline"
                  color="var(--thread-madder)"
                  className="chip-underline"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
