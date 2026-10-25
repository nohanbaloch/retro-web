import React, { useState } from 'react';

export default function ExplorerApp({ initialPath = 'C:\\', onOpenApp }) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [history, setHistory] = useState([initialPath]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const fileTree = {
    'C:\\': [
      { name: 'Documents and Settings', isDir: true, icon: '📁' },
      { name: 'Program Files', isDir: true, icon: '📁' },
      { name: 'WINDOWS', isDir: true, icon: '📁' },
      { name: 'boot.ini', isDir: false, icon: '📄', size: '211 bytes' },
    ],
    'C:\\Documents and Settings': [
      { name: 'Administrator', isDir: true, icon: '👤' },
      { name: 'All Users', isDir: true, icon: '📁' },
    ],
    'C:\\Documents and Settings\\Administrator': [
      { name: 'Desktop', isDir: true, icon: '🖥️' },
      { name: 'My Documents', isDir: true, icon: '📁' },
      { name: 'Favorites', isDir: true, icon: '⭐' },
    ],
    'C:\\Documents and Settings\\Administrator\\My Documents': [
      { name: 'My Pictures', isDir: true, icon: '🖼️' },
      { name: 'My Music', isDir: true, icon: '🎵' },
      { name: 'notes.txt', isDir: false, icon: '📝', size: '1.2 KB', app: 'notepad' },
      { name: 'drawing.bmp', isDir: false, icon: '🎨', size: '256 KB', app: 'paint' },
    ],
    'C:\\Program Files': [
      { name: 'Internet Explorer', isDir: true, icon: '🌐', app: 'ie' },
      { name: 'Windows Media Player', isDir: true, icon: '🎵', app: 'media' },
      { name: 'Accessories', isDir: true, icon: '📁' },
    ],
    'C:\\WINDOWS': [
      { name: 'system32', isDir: true, icon: '📁' },
      { name: 'explorer.exe', isDir: false, icon: '⚙️', size: '1.02 MB' },
      { name: 'notepad.exe', isDir: false, icon: '📝', size: '68 KB', app: 'notepad' },
      { name: 'cmd.exe', isDir: false, icon: '📟', size: '388 KB', app: 'terminal' },
    ],
  };

  const currentFiles = fileTree[currentPath] || [
    { name: 'Folder is empty', isDir: false, icon: 'ℹ️' },
  ];

  const navigateTo = (newPath) => {
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(newPath);
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
    setCurrentPath(newPath);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setCurrentPath(history[historyIdx - 1]);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setCurrentPath(history[historyIdx + 1]);
    }
  };

  const goUp = () => {
    if (currentPath === 'C:\\') return;
    const parts = currentPath.split('\\').filter(Boolean);
    parts.pop();
    const upPath = parts.length === 1 ? 'C:\\' : parts.join('\\');
    navigateTo(upPath);
  };

  const handleItemClick = (item) => {
    if (item.isDir) {
      const sep = currentPath.endsWith('\\') ? '' : '\\';
      const target = `${currentPath}${sep}${item.name}`;
      if (fileTree[target]) {
        navigateTo(target);
      } else {
        navigateTo(target);
      }
    } else if (item.app && onOpenApp) {
      onOpenApp(item.app);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Tahoma, sans-serif' }}>
      {/* Navigation Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ece9d8',
          borderBottom: '1px solid #d0ccb8',
          padding: '4px 8px',
          gap: '6px',
          fontSize: '11px',
        }}
      >
        <button
          onClick={goBack}
          disabled={historyIdx === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '2px 8px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            borderRadius: '2px',
            cursor: historyIdx > 0 ? 'pointer' : 'default',
            opacity: historyIdx > 0 ? 1 : 0.5,
          }}
        >
          <span>⬅️</span> Back
        </button>
        <button
          onClick={goForward}
          disabled={historyIdx >= history.length - 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '2px 8px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            borderRadius: '2px',
            cursor: historyIdx < history.length - 1 ? 'pointer' : 'default',
            opacity: historyIdx < history.length - 1 ? 1 : 0.5,
          }}
        >
          <span>➡️</span> Forward
        </button>
        <button
          onClick={goUp}
          disabled={currentPath === 'C:\\'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '2px 8px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            borderRadius: '2px',
            cursor: currentPath !== 'C:\\' ? 'pointer' : 'default',
            opacity: currentPath !== 'C:\\' ? 1 : 0.5,
          }}
        >
          <span>⬆️</span> Up
        </button>
      </div>

      {/* Address Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ece9d8',
          borderBottom: '1px solid #d0ccb8',
          padding: '3px 8px',
          gap: '8px',
          fontSize: '11px',
        }}
      >
        <span style={{ color: '#444' }}>Address</span>
        <div
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            border: '1px solid #716f64',
            padding: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>📁</span>
          <span style={{ fontSize: '11px', color: '#000000' }}>{currentPath}</span>
        </div>
      </div>

      {/* Main Split View */}
      <div style={{ flex: 1, display: 'flex', backgroundColor: '#ffffff', overflow: 'hidden' }}>
        {/* Left Side: XP Blue Task Pane */}
        <div
          style={{
            width: '180px',
            backgroundColor: '#6375d6',
            backgroundImage: 'linear-gradient(to bottom, #7ba0ea 0%, #6375d6 100%)',
            padding: '12px 8px',
            color: '#ffffff',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxSizing: 'border-box',
          }}
        >
          {/* File Tasks Box */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              padding: '6px',
              color: '#001a66',
            }}
          >
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '4px' }}>
              File & Folder Tasks
            </div>
            <div style={{ padding: '2px 0', cursor: 'pointer' }}>📁 Make a new folder</div>
            <div style={{ padding: '2px 0', cursor: 'pointer' }}>🌐 Publish to Web</div>
            <div style={{ padding: '2px 0', cursor: 'pointer' }}>🖨️ Share this folder</div>
          </div>

          {/* Other Places Box */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              padding: '6px',
              color: '#001a66',
            }}
          >
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '4px' }}>
              Other Places
            </div>
            <div onClick={() => navigateTo('C:\\Documents and Settings\\Administrator')} style={{ padding: '2px 0', cursor: 'pointer' }}>
              📁 My Computer
            </div>
            <div onClick={() => navigateTo('C:\\Documents and Settings\\Administrator\\My Documents')} style={{ padding: '2px 0', cursor: 'pointer' }}>
              📁 My Documents
            </div>
          </div>
        </div>

        {/* Right Side: Files & Folders Grid */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
            gridAutoRows: '80px',
            gap: '12px',
            alignContent: 'start',
            overflowY: 'auto',
          }}
        >
          {currentFiles.map((item, idx) => (
            <div
              key={idx}
              onDoubleClick={() => handleItemClick(item)}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '3px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '11px',
                wordBreak: 'break-word',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0ecff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>{item.icon}</div>
              <div style={{ color: '#000000', lineHeight: '1.2' }}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div
        style={{
          height: '20px',
          backgroundColor: '#ece9d8',
          borderTop: '1px solid #d0ccb8',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          fontSize: '11px',
          color: '#444444',
        }}
      >
        <span>{currentFiles.length} objects (Free space: 20.4 GB)</span>
      </div>
    </div>
  );
}
