import { useState, useRef } from 'react';
import { RotateCw, Lock, Copy, Check, Monitor, Tablet, Smartphone } from 'lucide-react';
import ThreadLine from './ThreadLine';

export default function PreviewPanel({ previewUrl }) {
  const [viewport, setViewport] = useState('desktop'); // desktop, tablet, mobile
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef(null);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
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
          <button className="square-action-btn" onClick={handleRefresh} title="Reload Preview">
            <RotateCw size={13} />
          </button>
        </div>

        <div className="url-input-box">
          <Lock className="lock-icon" size={11} />
          <span className="url-text">{previewUrl || 'http://localhost/preview'}</span>
          <button
            onClick={handleCopyUrl}
            className="copy-url-btn"
            title="Copy Preview URL"
            aria-label="Copy Preview URL"
          >
            {copied ? <Check size={12} color="var(--thread-sage)" /> : <Copy size={12} />}
          </button>
        </div>

        <div className="viewport-controls">
          <button
            className={`vp-btn ${viewport === 'desktop' ? 'active' : ''}`}
            onClick={() => setViewport('desktop')}
            title="Desktop View (Full Width)"
          >
            <Monitor size={13} />
          </button>
          <button
            className={`vp-btn ${viewport === 'tablet' ? 'active' : ''}`}
            onClick={() => setViewport('tablet')}
            title="Tablet View (768px)"
          >
            <Tablet size={13} />
          </button>
          <button
            className={`vp-btn ${viewport === 'mobile' ? 'active' : ''}`}
            onClick={() => setViewport('mobile')}
            title="Mobile View (375px)"
          >
            <Smartphone size={13} />
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
            <div className="thread-arc-spinner">
              <ThreadLine variant="knot" active={true} color="var(--thread-weld)" width={28} height={28} />
            </div>
            <p className="placeholder-copy">Waiting on the sandbox preview stream…</p>
          </div>
        )}
      </div>
    </div>
  );
}
