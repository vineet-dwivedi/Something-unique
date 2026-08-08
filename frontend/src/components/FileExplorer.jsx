import { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

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
    return <FileCode className="node-icon js-icon" size={14} />;
  }
  if (fileName.endsWith('.css') || fileName.endsWith('.scss')) {
    return <FileCode className="node-icon css-icon" size={14} />;
  }
  if (fileName.endsWith('.json')) {
    return <FileJson className="node-icon json-icon" size={14} />;
  }
  if (fileName.endsWith('.html')) {
    return <FileText className="node-icon html-icon" size={14} />;
  }
  if (fileName.endsWith('.png') || fileName.endsWith('.svg') || fileName.endsWith('.jpg')) {
    return <ImageIcon className="node-icon" size={14} />;
  }
  return <FileText className="node-icon" size={14} />;
}

function TreeNode({ node, activeFile, onSelectFile, level = 0 }) {
  const [open, setOpen] = useState(true);

  if (node.isDir) {
    const childrenArray = Object.values(node.children);
    return (
      <div className="tree-dir-node">
        <div
          className="tree-node dir-row"
          onClick={() => setOpen(!open)}
          style={{ paddingLeft: `${0.5 + level * 0.75}rem` }}
        >
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {open ? <FolderOpen className="node-icon folder-icon" size={14} /> : <Folder className="node-icon folder-icon" size={14} />}
          <span className="file-name">{node.name}</span>
        </div>

        {open && (
          <div className="tree-children-container">
            {/* Thin vertical thread linking parent to children */}
            <div
              className="vertical-thread-line"
              style={{ left: `${0.85 + level * 0.75}rem` }}
              aria-hidden="true"
            />
            {childrenArray.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                activeFile={activeFile}
                onSelectFile={onSelectFile}
                level={level + 1}
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
      className={`tree-node file-row ${isActive ? 'is-active-file' : ''}`}
      onClick={() => onSelectFile(node.path)}
      style={{ paddingLeft: `${1.2 + level * 0.75}rem` }}
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
        <span className="mono-title">[ FILES ]</span>
        <button
          onClick={onRefresh}
          className="square-action-btn btn-sm"
          title="Refresh File List"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          className="mono-search-input"
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
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
