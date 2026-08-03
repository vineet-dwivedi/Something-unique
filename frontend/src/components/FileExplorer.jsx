import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  FileJson, 
  FileSpreadsheet, 
  Image as ImageIcon,
  ChevronRight, 
  ChevronDown, 
  Search,
  RefreshCw
} from 'lucide-react';

/**
 * Builds a hierarchical tree structure from flat file path strings
 */
function buildFileTree(files) {
  const root = {};

  files.forEach((filePath) => {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const parts = cleanPath.split('/');
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          isDir: index < parts.length - 1,
          children: {}
        };
      }
      current = current[part].children;
    });
  });

  return root;
}

function getFileIcon(fileName) {
  if (fileName.endsWith('.jsx') || fileName.endsWith('.js') || fileName.endsWith('.tsx') || fileName.endsWith('.ts')) {
    return <FileCode className="node-icon js-icon" size={16} />;
  }
  if (fileName.endsWith('.css') || fileName.endsWith('.scss')) {
    return <FileCode className="node-icon css-icon" size={16} />;
  }
  if (fileName.endsWith('.json')) {
    return <FileJson className="node-icon json-icon" size={16} />;
  }
  if (fileName.endsWith('.html')) {
    return <FileText className="node-icon html-icon" size={16} />;
  }
  if (fileName.endsWith('.png') || fileName.endsWith('.svg') || fileName.endsWith('.jpg')) {
    return <ImageIcon className="node-icon" size={16} />;
  }
  return <FileText className="node-icon" size={16} />;
}

function TreeNode({ node, activeFile, onSelectFile }) {
  const [open, setOpen] = useState(true);

  if (node.isDir) {
    const childrenArray = Object.values(node.children);
    return (
      <div>
        <div 
          className="tree-node"
          onClick={() => setOpen(!open)}
          style={{ paddingLeft: '0.75rem' }}
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {open ? <FolderOpen className="node-icon folder-icon" size={16} /> : <Folder className="node-icon folder-icon" size={16} />}
          <span className="file-name">{node.name}</span>
        </div>

        {open && (
          <div style={{ paddingLeft: '0.75rem' }}>
            {childrenArray.map((child) => (
              <TreeNode 
                key={child.path} 
                node={child} 
                activeFile={activeFile} 
                onSelectFile={onSelectFile} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = activeFile === node.path || activeFile === `/${node.path}`;

  return (
    <div 
      className={`tree-node ${isActive ? 'active' : ''}`}
      onClick={() => onSelectFile(node.path)}
      style={{ paddingLeft: '1.5rem' }}
    >
      {getFileIcon(node.name)}
      <span className="file-name">{node.name}</span>
    </div>
  );
}

export default function FileExplorer({ files, activeFile, onSelectFile, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;
    return files.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm]);

  const fileTree = useMemo(() => buildFileTree(filteredFiles), [filteredFiles]);
  const treeNodes = Object.values(fileTree);

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <span className="title">Sandbox Files</span>
        <button 
          onClick={onRefresh} 
          className="glass-button btn-sm" 
          title="Refresh File List"
          style={{ padding: '0.2rem 0.4rem' }}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="search-box">
        <input 
          type="text" 
          className="glass-input" 
          placeholder="Filter files..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="file-tree">
        {treeNodes.map((node) => (
          <TreeNode 
            key={node.path} 
            node={node} 
            activeFile={activeFile} 
            onSelectFile={onSelectFile} 
          />
        ))}
      </div>
    </div>
  );
}
