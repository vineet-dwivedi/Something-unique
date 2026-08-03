import React, { useState, useRef } from 'react';
import { 
  RefreshCw, 
  RotateCw, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Lock, 
  Copy, 
  Check 
} from 'lucide-react';

export default function PreviewPanel({ previewUrl }) {
  const [viewport, setViewport] = useState('desktop'); // desktop, tablet, mobile
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef(null);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleCopyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="preview-panel-container">
      {/* Address Bar & Browser Controls */}
      <div className="preview-address-bar">
        <div className="nav-controls">
          <button className="nav-btn" onClick={handleRefresh} title="Reload Preview">
            <RotateCw size={14} />
          </button>
        </div>

        <div className="url-input-box">
          <Lock className="lock-icon" size={12} />
          <span className="url-text">{previewUrl || 'http://localhost/preview'}</span>
          <button 
            onClick={handleCopyUrl} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
            title="Copy Preview URL"
          >
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
          </button>
        </div>

        <div className="viewport-controls">
          <button 
            className={`vp-btn ${viewport === 'desktop' ? 'active' : ''}`}
            onClick={() => setViewport('desktop')}
            title="Desktop View (Full Width)"
          >
            <Monitor size={14} />
          </button>
          <button 
            className={`vp-btn ${viewport === 'tablet' ? 'active' : ''}`}
            onClick={() => setViewport('tablet')}
            title="Tablet View (768px)"
          >
            <Tablet size={14} />
          </button>
          <button 
            className={`vp-btn ${viewport === 'mobile' ? 'active' : ''}`}
            onClick={() => setViewport('mobile')}
            title="Mobile View (375px)"
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {/* Preview Iframe Container */}
      <div className="preview-frame-wrapper">
        {previewUrl ? (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={previewUrl}
            title="Sandbox Live Preview"
            className={`preview-iframe ${viewport}`}
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          />
        ) : (
          <div className="iframe-placeholder">
            <RefreshCw className="spin-icon" size={28} />
            <p>Connecting to Sandbox Preview Stream...</p>
          </div>
        )}
      </div>
    </div>
  );
}
