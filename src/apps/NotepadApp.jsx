import React, { useState, useEffect } from 'react';

export default function NotepadApp({ initialText = '' }) {
  const [text, setText] = useState(
    initialText ||
      'Retro Web OS — Notepad\n\nWindows XP Edition running client-side with React + Vite.\nType notes or code here.'
  );
  const [wordWrap, setWordWrap] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  const lines = text.split('\n').length;
  const chars = text.length;

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenu(null);
    if (activeMenu) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [activeMenu]);

  const menuItemStyle = (menuKey) => ({
    padding: '2px 7px',
    cursor: 'pointer',
    backgroundColor: activeMenu === menuKey ? '#316ac5' : 'transparent',
    color: activeMenu === menuKey ? '#ffffff' : '#000000',
    borderRadius: '2px',
  });

  const dropdownItemStyle = {
    padding: '4px 20px',
    cursor: 'pointer',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'Tahoma, sans-serif',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Menu Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          backgroundColor: '#ece9d8',
          borderBottom: '1px solid #d0ccb8',
          padding: '2px 4px',
          fontSize: '11px',
          gap: '2px',
          position: 'relative',
        }}
      >
        {/* File Menu */}
        <div style={{ position: 'relative' }}>
          <div onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')} style={menuItemStyle('file')}>
            File
          </div>
          {activeMenu === 'file' && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #716f64',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                minWidth: '140px',
                zIndex: 1000,
                padding: '2px',
              }}
            >
              <div
                onClick={() => { setText(''); setActiveMenu(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#316ac5', e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000')}
              >
                <span>New</span>
                <span style={{ opacity: 0.6 }}>Ctrl+N</span>
              </div>
              <div
                onClick={() => { alert('File saved to Virtual Filesystem'); setActiveMenu(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#316ac5', e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000')}
              >
                <span>Save</span>
                <span style={{ opacity: 0.6 }}>Ctrl+S</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#d0ccb8', margin: '3px 0' }} />
              <div
                onClick={() => setActiveMenu(null)}
                style={dropdownItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#316ac5', e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000')}
              >
                Exit
              </div>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div style={{ position: 'relative' }}>
          <div onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')} style={menuItemStyle('edit')}>
            Edit
          </div>
          {activeMenu === 'edit' && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #716f64',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                minWidth: '140px',
                zIndex: 1000,
                padding: '2px',
              }}
            >
              <div
                onClick={() => { navigator.clipboard?.writeText(text); setActiveMenu(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#316ac5', e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000')}
              >
                <span>Copy All</span>
                <span style={{ opacity: 0.6 }}>Ctrl+C</span>
              </div>
              <div
                onClick={() => {
                  navigator.clipboard?.readText().then((clip) => {
                    if (clip) setText((t) => t + '\n' + clip);
                  });
                  setActiveMenu(null);
                }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#316ac5', e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000')}
              >
                <span>Paste</span>
                <span style={{ opacity: 0.6 }}>Ctrl+V</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#d0ccb8', margin: '3px 0' }} />
              <div
                onClick={() => { setText(''); setActiveMenu(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#316ac5', e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000')}
              >
                <span>Delete</span>
                <span style={{ opacity: 0.6 }}>Del</span>
              </div>
            </div>
          )}
        </div>

        {/* Format Menu */}
        <div style={{ position: 'relative' }}>
          <div onClick={() => setActiveMenu(activeMenu === 'format' ? null : 'format')} style={menuItemStyle('format')}>
            Format
          </div>
          {activeMenu === 'format' && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #716f64',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                minWidth: '140px',
                zIndex: 1000,
                padding: '2px',
              }}
            >
              <div
                onClick={() => { setWordWrap(!wordWrap); setActiveMenu(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#316ac5', e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000')}
              >
                <span>{wordWrap ? '✓ Word Wrap' : '  Word Wrap'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div style={{ position: 'relative' }}>
          <div onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')} style={menuItemStyle('help')}>
            Help
          </div>
          {activeMenu === 'help' && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #716f64',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                minWidth: '160px',
                zIndex: 1000,
                padding: '2px',
              }}
            >
              <div
                onClick={() => { alert('Notepad for Retro Web OS\nVersion 1.0 (Windows XP Edition)'); setActiveMenu(null); }}
                style={dropdownItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#316ac5', e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#000')}
              >
                About Notepad
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          outline: 'none',
          padding: '8px 10px',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '13px',
          lineHeight: '1.4',
          resize: 'none',
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflow: 'auto',
          boxSizing: 'border-box',
          color: '#000000',
        }}
      />

      {/* Status Bar */}
      <div
        style={{
          height: '20px',
          backgroundColor: '#ece9d8',
          borderTop: '1px solid #d0ccb8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 12px',
          fontSize: '11px',
          color: '#333333',
          gap: '24px',
        }}
      >
        <span>Ln {lines}, Col {chars}</span>
        <span>Windows (CRLF)</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
