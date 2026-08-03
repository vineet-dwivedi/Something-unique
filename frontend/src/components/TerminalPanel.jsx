import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io } from 'socket.io-client';
import { Terminal as TermIcon, Trash2, RefreshCw, ChevronUp, ChevronDown, Minimize2 } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel({ agentUrl, isCollapsed, onToggleCollapse }) {
  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create xterm terminal instance with soft pastel dark theme
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#0a0e17',
        foreground: '#f1f5f9',
        cursor: '#c084fc',
        selectionBackground: 'rgba(192, 132, 252, 0.3)',
        black: '#0f141c',
        red: '#fda4af',
        green: '#6ee7b7',
        yellow: '#fde047',
        blue: '#93c5fd',
        magenta: '#d8b4fe',
        cyan: '#bae6fd',
        white: '#f1f5f9'
      },
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

  return (
    <div className={`terminal-drawer ${isCollapsed ? 'collapsed' : ''}`}>
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
