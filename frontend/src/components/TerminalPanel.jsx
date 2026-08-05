import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io } from 'socket.io-client';
import { Terminal as TermIcon, Trash2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

const getTerminalTheme = (themeName) => {
  const isDark = themeName === 'dark';
  return {
    background: isDark ? '#0e0d0c' : '#f0eeec',
    foreground: isDark ? '#f0ede9' : '#1a1714',
    cursor: isDark ? '#8db89e' : '#7a9e88',
    selectionBackground: isDark ? 'rgba(141, 184, 158, 0.25)' : 'rgba(122, 158, 136, 0.25)',
    black: isDark ? '#131210' : '#fafaf9',
    red: isDark ? '#d4918f' : '#c47b7b',
    green: isDark ? '#8db89e' : '#5a9068',
    yellow: isDark ? '#d4ab52' : '#b8943a',
    blue: isDark ? '#82aec9' : '#6b97b5',
    magenta: isDark ? '#c47b7b' : '#c47b7b',
    cyan: isDark ? '#82aec9' : '#6b97b5',
    white: isDark ? '#f0ede9' : '#1a1714'
  };
};

const MIN_HEIGHT = 100;
const MAX_HEIGHT_RATIO = 0.8;
const DEFAULT_HEIGHT = 220;

export default function TerminalPanel({ agentUrl, isCollapsed, onToggleCollapse, theme }) {
  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);

  // ── Resize via drag handle ───────────────────────────────
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e) => {
      const maxH = window.innerHeight * MAX_HEIGHT_RATIO;
      const newH = window.innerHeight - e.clientY;
      setHeight(Math.max(MIN_HEIGHT, Math.min(newH, maxH)));
    };

    const onUp = () => setIsDragging(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  // Refit xterm whenever height changes
  useEffect(() => {
    if (!isCollapsed) {
      requestAnimationFrame(() => {
        try { fitAddonRef.current?.fit(); } catch {}
      });
    }
  }, [height, isCollapsed]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create xterm terminal instance with dynamic pastel theme mapping
    const term = new Terminal({
      cursorBlink: true,
      theme: getTerminalTheme(theme),
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 13,
      lineHeight: 1.4,
      scrollback: 1000
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;35m🚀 Knit Dev Terminal Session Connected\x1b[0m');
    term.writeln('\x1b[90mSocket Event Channel: terminal-input / terminal-output\x1b[0m\r\n');

    // Connect Socket.io client to agentUrl
    if (agentUrl) {
      try {
        const socket = io(agentUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          timeout: 10000
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          term.writeln('\x1b[32m✔ Connected to agent socket backend\x1b[0m\r\n');
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
          term.writeln('\r\n\x1b[31m✖ Disconnected from socket backend\x1b[0m\r\n');
        });

        // Listen for terminal output from backend
        socket.on('terminal-output', (data) => {
          term.write(data);
        });

        // Listen for user input on xterm & send to socket
        term.onData((data) => {
          if (socket.connected) {
            socket.emit('terminal-input', data);
          } else {
            // Local fallback echo when socket is not active
            handleLocalFallbackInput(data, term);
          }
        });
      } catch (err) {
        console.warn('Socket connection error:', err);
        setIsConnected(false);
      }
    } else {
      term.onData((data) => handleLocalFallbackInput(data, term));
    }

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        // ignore resize during hidden transitions
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      term.dispose();
    };
  }, [agentUrl]);

  useEffect(() => {
    if (xtermInstance.current) {
      xtermInstance.current.options.theme = getTerminalTheme(theme);
    }
  }, [theme]);


  // Local fallback command line behavior when offline
  const currentLineRef = useRef('');
  const handleLocalFallbackInput = (data, term) => {
    if (data === '\r') {
      term.write('\r\n');
      const cmd = currentLineRef.current.trim();
      if (cmd === 'clear') {
        term.clear();
      } else if (cmd.length > 0) {
        term.writeln(`\x1b[33mCommand: ${cmd}\x1b[0m`);
        term.writeln('Output: [Knit Dev shell mode - command acknowledged]');
      }
      term.write('$ ');
      currentLineRef.current = '';
    } else if (data === '\u007F') {
      // Backspace
      if (currentLineRef.current.length > 0) {
        currentLineRef.current = currentLineRef.current.slice(0, -1);
        term.write('\b \b');
      }
    } else {
      currentLineRef.current += data;
      term.write(data);
    }
  };

  const handleClear = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
    }
  };

  const handleReconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  // Double-click the drag handle to reset to default height
  const handleDoubleClick = useCallback(() => {
    setHeight(DEFAULT_HEIGHT);
  }, []);

  const drawerStyle = isCollapsed
    ? {}
    : { height: `${height}px` };

  return (
    <div
      className={`terminal-drawer ${isCollapsed ? 'collapsed' : ''} ${isDragging ? 'is-resizing' : ''}`}
      style={drawerStyle}
    >
      {/* ── Resize drag handle ─ */}
      {!isCollapsed && (
        <div
          className="terminal-resize-handle"
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          title="Drag to resize · Double-click to reset"
        >
          <div className="resize-grip" />
        </div>
      )}

      <div className="terminal-header">
        <div className="terminal-title">
          <TermIcon size={14} />
          <span>Knit Dev Terminal (xterm.js)</span>
          <span className={`status-indicator ${isConnected ? '' : 'disconnected'}`}></span>
          <span style={{ fontSize: '0.72rem', color: isConnected ? '#6ee7b7' : '#fda4af' }}>
            {isConnected ? 'Connected' : 'Offline / Standby'}
          </span>
        </div>

        <div className="terminal-actions">
          <button className="term-action-btn" onClick={handleClear} title="Clear Terminal">
            <Trash2 size={13} />
          </button>
          <button className="term-action-btn" onClick={handleReconnect} title="Reconnect Socket">
            <RefreshCw size={13} />
          </button>
          <button className="term-action-btn" onClick={onToggleCollapse} title="Toggle Terminal Height">
            {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="terminal-body">
          <div ref={terminalRef} className="xterm" />
        </div>
      )}
    </div>
  );
}

