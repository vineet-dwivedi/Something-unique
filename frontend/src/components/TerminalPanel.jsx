import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io } from 'socket.io-client';
import { Terminal as TermIcon, Trash2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import ThreadLine from './ThreadLine';
import '@xterm/xterm/css/xterm.css';

const getLoomTerminalTheme = (themeName) => {
  const isDark = themeName === 'dark';
  return {
    background: isDark ? '#14120F' : '#F3EEE3',
    foreground: isDark ? '#F2EDE4' : '#14120F',
    cursor: isDark ? '#C99A3E' : '#A67A2E',
    selectionBackground: isDark ? 'rgba(201, 154, 62, 0.25)' : 'rgba(166, 122, 46, 0.25)',
    black: isDark ? '#14120F' : '#F3EEE3',
    red: isDark ? '#C1452E' : '#A83A26',
    green: isDark ? '#7E9473' : '#5F7657',
    yellow: isDark ? '#C99A3E' : '#A67A2E',
    blue: isDark ? '#82aec9' : '#6b97b5',
    magenta: isDark ? '#C1452E' : '#A83A26',
    cyan: isDark ? '#7E9473' : '#5F7657',
    white: isDark ? '#F2EDE4' : '#14120F'
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

  // Resize via drag handle
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
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const currentLineRef = useRef('');

  const handleLocalFallbackInput = useCallback((data, term) => {
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
      if (currentLineRef.current.length > 0) {
        currentLineRef.current = currentLineRef.current.slice(0, -1);
        term.write('\b \b');
      }
    } else {
      currentLineRef.current += data;
      term.write(data);
    }
  }, []);

  // Refit xterm whenever height changes
  useEffect(() => {
    if (!isCollapsed) {
      requestAnimationFrame(() => {
        try { fitAddonRef.current?.fit(); } catch { /* ignore fit error */ }
      });
    }
  }, [height, isCollapsed]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: getLoomTerminalTheme(theme),
      fontFamily: "'Commit Mono', 'IBM Plex Mono', Consolas, monospace",
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

        socket.on('terminal-output', (data) => {
          term.write(data);
        });

        term.onData((data) => {
          if (socket.connected) {
            socket.emit('terminal-input', data);
          } else {
            handleLocalFallbackInput(data, term);
          }
        });
      } catch (err) {
        console.warn('Socket connection error:', err);
      }
    } else {
      term.onData((data) => handleLocalFallbackInput(data, term));
    }

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {
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
  }, [agentUrl, handleLocalFallbackInput, theme]);

  useEffect(() => {
    if (xtermInstance.current) {
      xtermInstance.current.options.theme = getLoomTerminalTheme(theme);
    }
  }, [theme]);

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

  const handleDoubleClick = useCallback(() => {
    setHeight(DEFAULT_HEIGHT);
  }, []);

  const drawerStyle = isCollapsed ? {} : { height: `${height}px` };

  return (
    <div
      className={`terminal-drawer ${isCollapsed ? 'collapsed' : ''} ${isDragging ? 'is-resizing' : ''}`}
      style={drawerStyle}
    >
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
          <TermIcon size={13} />
          <span className="title-text">Knit Dev Terminal</span>
          {/* Connection Status: Knot SVG supplementing text label */}
          <div className="terminal-status-badge">
            <ThreadLine
              variant="knot"
              active={isConnected}
              color={isConnected ? 'var(--thread-sage)' : 'var(--thread-madder)'}
              width={14}
              height={14}
            />
            <span className={`status-label ${isConnected ? 'is-connected' : 'is-offline'}`}>
              {isConnected ? 'Connected' : 'Offline / Standby'}
            </span>
          </div>
        </div>

        <div className="terminal-actions">
          <button className="square-action-btn" onClick={handleClear} title="Clear Terminal">
            <Trash2 size={12} />
          </button>
          <button className="square-action-btn" onClick={handleReconnect} title="Reconnect Socket">
            <RefreshCw size={12} />
          </button>
          <button className="square-action-btn" onClick={onToggleCollapse} title="Toggle Terminal Drawer">
            {isCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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
