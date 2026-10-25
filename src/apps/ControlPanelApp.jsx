import React, { useState } from 'react';

export default function ControlPanelApp() {
  const [selectedTheme, setSelectedTheme] = useState('windows-xp');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Tahoma, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          height: '48px',
          background: 'linear-gradient(to right, #0055ea, #3388ff)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '24px' }}>⚙️</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Control Panel</div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>Switch to Classic View or Configure Retro Web OS</div>
        </div>
      </div>

      {/* Body with category items */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#ece9d8' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '12px', color: '#001a66' }}>
          Pick a category
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            {
              title: 'Appearance and Themes',
              desc: 'Change the computer theme, desktop background or screen saver.',
              icon: '🎨',
            },
            {
              title: 'Network and Internet Connections',
              desc: 'Connect to the simulated Retro Web network.',
              icon: '🌐',
            },
            {
              title: 'User Accounts',
              desc: 'Change user settings and passwords for Administrator.',
              icon: '👤',
            },
            {
              title: 'Date, Time, Language, and Regional Options',
              desc: 'Change the date, time, and time zone for your system.',
              icon: '🕒',
            },
            {
              title: 'Performance and Maintenance',
              desc: 'See basic system specs, storage status and memory.',
              icon: '🖥️',
            },
            {
              title: 'Security Center',
              desc: 'Virtual sandbox policy and integrity checkers.',
              icon: '🛡️',
            },
          ].map((cat) => (
            <div
              key={cat.title}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0ccb8',
                borderRadius: '4px',
                padding: '12px',
                display: 'flex',
                gap: '12px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eef4ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <div style={{ fontSize: '32px' }}>{cat.icon}</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#002288', marginBottom: '4px' }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: '11px', color: '#555555', lineHeight: '1.3' }}>{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* System Info Box */}
        <div
          style={{
            marginTop: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid #716f64',
            padding: '12px',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>System Overview</div>
          <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
            <div><strong>OS:</strong> Microsoft Windows XP Professional (Retro Web OS Edition)</div>
            <div><strong>Kernel:</strong> Retro Kernel v1.0 (PID Supervisor, Event Bus)</div>
            <div><strong>Storage:</strong> IndexedDB Virtual Filesystem</div>
            <div><strong>Computer:</strong> Virtual x86 Compatible PC, 512 MB RAM</div>
          </div>
        </div>
      </div>
    </div>
  );
}
