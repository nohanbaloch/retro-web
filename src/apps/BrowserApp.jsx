import React, { useState } from 'react';

export default function BrowserApp() {
  const [url, setUrl] = useState('https://en.wikipedia.org');
  const [currentUrl, setCurrentUrl] = useState('https://en.wikipedia.org');

  const handleGo = (e) => {
    e.preventDefault();
    let target = url;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }
    setCurrentUrl(target);
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
          onClick={() => {}}
          style={{
            padding: '2px 8px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          ⬅️ Back
        </button>
        <button
          onClick={() => {}}
          style={{
            padding: '2px 8px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          ➡️ Forward
        </button>
        <button
          onClick={() => setCurrentUrl(currentUrl)}
          style={{
            padding: '2px 8px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
        <button
          onClick={() => { setUrl('https://en.wikipedia.org'); setCurrentUrl('https://en.wikipedia.org'); }}
          style={{
            padding: '2px 8px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          🏠 Home
        </button>
      </div>

      {/* Address Bar */}
      <form
        onSubmit={handleGo}
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
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            border: '1px solid #716f64',
            padding: '2px 6px',
            fontSize: '11px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 10px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            borderRadius: '2px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          <span style={{ color: '#00aa00' }}>➔</span> Go
        </button>
      </form>

      {/* Browser Viewport */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', position: 'relative' }}>
        <iframe
          src={currentUrl}
          title="Internet Explorer"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>

      {/* Status Bar */}
      <div
        style={{
          height: '20px',
          backgroundColor: '#ece9d8',
          borderTop: '1px solid #d0ccb8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          fontSize: '11px',
          color: '#444444',
        }}
      >
        <span>Done</span>
        <span>🌐 Internet</span>
      </div>
    </div>
  );
}
