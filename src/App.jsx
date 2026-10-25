import React, { useState, useEffect, useRef } from 'react';
import Window from './components/window/Window.jsx';
import NotepadApp from './apps/NotepadApp.jsx';
import TerminalApp from './apps/TerminalApp.jsx';
import CalculatorApp from './apps/CalculatorApp.jsx';
import PaintApp from './apps/PaintApp.jsx';
import MinesweeperApp from './apps/MinesweeperApp.jsx';
import SolitaireApp from './apps/SolitaireApp.jsx';
import ExplorerApp from './apps/ExplorerApp.jsx';
import ControlPanelApp from './apps/ControlPanelApp.jsx';
import TaskManagerApp from './apps/TaskManagerApp.jsx';
import BrowserApp from './apps/BrowserApp.jsx';

export default function App() {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [allProgramsOpen, setAllProgramsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null); // 'accessories' | 'games' | 'system'
  const [currentTime, setCurrentTime] = useState('');
  const [windows, setWindows] = useState([]);
  const [focusedWinId, setFocusedWinId] = useState(null);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState(null);

  // Desktop selection rubberband state
  const [rubberband, setRubberband] = useState(null);
  const desktopRef = useRef(null);

  // App Configuration Registry
  const APP_CONFIGS = {
    notepad: { title: 'Untitled - Notepad', icon: '📝', defaultW: 640, defaultH: 440 },
    terminal: { title: 'Command Prompt', icon: '📟', defaultW: 660, defaultH: 420 },
    calc: { title: 'Calculator', icon: '🔢', defaultW: 290, defaultH: 310 },
    paint: { title: 'untitled - Paint', icon: '🎨', defaultW: 720, defaultH: 520 },
    minesweeper: { title: 'Minesweeper', icon: '💣', defaultW: 260, defaultH: 340 },
    solitaire: { title: 'Solitaire', icon: '🃏', defaultW: 680, defaultH: 480 },
    explorer: { title: 'My Computer', icon: '💻', defaultW: 760, defaultH: 480 },
    'control-panel': { title: 'Control Panel', icon: '⚙️', defaultW: 720, defaultH: 480 },
    'task-manager': { title: 'Windows Task Manager', icon: '📊', defaultW: 520, defaultH: 420 },
    ie: { title: 'Internet Explorer', icon: '🌐', defaultW: 820, defaultH: 540 },
  };

  // Open or focus an application
  const openApp = (appId, customTitle, customIcon) => {
    setStartMenuOpen(false);
    setAllProgramsOpen(false);
    setActiveSubmenu(null);

    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, zIndex: nextZIndex }
            : w
        )
      );
      setFocusedWinId(existing.id);
      setNextZIndex((z) => z + 1);
      return;
    }

    const cfg = APP_CONFIGS[appId] || {
      title: customTitle || 'Application',
      icon: customIcon || '📁',
      defaultW: 600,
      defaultH: 400,
    };
    const winId = `win-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const offset = (windows.length % 7) * 26;

    const newWindow = {
      id: winId,
      appId,
      title: customTitle || cfg.title,
      icon: customIcon || cfg.icon,
      x: Math.max(30, 80 + offset),
      y: Math.max(30, 50 + offset),
      width: cfg.defaultW,
      height: cfg.defaultH,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
    };

    setWindows((prev) => [...prev, newWindow]);
    setFocusedWinId(winId);
    setNextZIndex((z) => z + 1);
  };

  const closeWindow = (id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (focusedWinId === id) {
      const remaining = windows.filter((w) => w.id !== id && !w.isMinimized);
      if (remaining.length > 0) {
        setFocusedWinId(remaining[remaining.length - 1].id);
      } else {
        setFocusedWinId(null);
      }
    }
  };

  const minimizeWindow = (id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (focusedWinId === id) {
      const remaining = windows.filter((w) => w.id !== id && !w.isMinimized);
      if (remaining.length > 0) {
        setFocusedWinId(remaining[remaining.length - 1].id);
      } else {
        setFocusedWinId(null);
      }
    }
  };

  const toggleMaximizeWindow = (id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
    focusWindow(id);
  };

  const focusWindow = (id) => {
    setFocusedWinId(id);
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
      )
    );
    setNextZIndex((z) => z + 1);
  };

  const updateWindowBounds = (id, bounds) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...bounds } : w))
    );
  };

  // Keyboard shortcut: Alt+F4 to close focused window, Escape to close Start Menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        if (focusedWinId) closeWindow(focusedWinId);
      } else if (e.key === 'Escape') {
        setStartMenuOpen(false);
        setAllProgramsOpen(false);
        setActiveSubmenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedWinId, windows]);

  // System clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rubberband selection logic on desktop
  const handleDesktopMouseDown = (e) => {
    if (e.target === desktopRef.current || e.target.classList?.contains('desktop-bg')) {
      setSelectedDesktopIcon(null);
      setStartMenuOpen(false);
      setAllProgramsOpen(false);
      setActiveSubmenu(null);
      setRubberband({
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (rubberband) {
        setRubberband((prev) =>
          prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null
        );
      }
    };
    const handleMouseUp = () => setRubberband(null);

    if (rubberband) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [rubberband]);

  // Render application content based on appId
  const renderAppContent = (win) => {
    switch (win.appId) {
      case 'notepad':
        return <NotepadApp />;
      case 'terminal':
        return <TerminalApp onLaunchApp={openApp} />;
      case 'calc':
        return <CalculatorApp />;
      case 'paint':
        return <PaintApp />;
      case 'minesweeper':
        return <MinesweeperApp />;
      case 'solitaire':
        return <SolitaireApp />;
      case 'explorer':
        return <ExplorerApp onOpenApp={openApp} />;
      case 'control-panel':
        return <ControlPanelApp />;
      case 'task-manager':
        return <TaskManagerApp windows={windows} onCloseWindow={closeWindow} />;
      case 'ie':
        return <BrowserApp />;
      default:
        return (
          <div style={{ padding: '24px', textAlign: 'center', color: '#444' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>{win.icon}</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{win.title}</div>
            <div style={{ fontSize: '11px', marginTop: '6px' }}>Application ready</div>
          </div>
        );
    }
  };

  const desktopIcons = [
    { appId: 'explorer', name: 'My Computer', icon: '💻' },
    { appId: 'explorer', name: 'My Documents', icon: '📁' },
    { appId: 'explorer', name: 'Recycle Bin', icon: '🗑️' },
    { appId: 'notepad', name: 'Notepad', icon: '📝' },
    { appId: 'terminal', name: 'Command Prompt', icon: '📟' },
    { appId: 'paint', name: 'Paint', icon: '🎨' },
    { appId: 'calc', name: 'Calculator', icon: '🔢' },
    { appId: 'minesweeper', name: 'Minesweeper', icon: '💣' },
    { appId: 'solitaire', name: 'Solitaire', icon: '🃏' },
    { appId: 'control-panel', name: 'Control Panel', icon: '⚙️' },
  ];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        // Windows XP Bliss Wallpaper gradient with vibrant sky and soft clouds
        backgroundColor: '#245edb',
        backgroundImage: `
          radial-gradient(circle at 50% 120%, #469614 0%, #357a0e 25%, transparent 40%),
          radial-gradient(circle at 15% 110%, #68b42e 0%, #469614 30%, transparent 45%),
          radial-gradient(circle at 85% 115%, #469614 0%, #2f6c0d 25%, transparent 40%),
          radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
          linear-gradient(to bottom, #1d69d8 0%, #4a91ec 45%, #8cb9f7 70%, #bedafc 85%, #569e18 85%, #357a0e 100%)
        `,
      }}
      onMouseDown={handleDesktopMouseDown}
    >
      {/* Desktop Icon Grid */}
      <div
        ref={desktopRef}
        className="desktop-bg"
        style={{
          flex: 1,
          padding: '12px',
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(auto-fill, 84px)',
          gap: '12px 14px',
          alignContent: 'start',
          zIndex: 1,
        }}
      >
        {desktopIcons.map((item, idx) => {
          const isSelected = selectedDesktopIcon === idx;
          return (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDesktopIcon(idx);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openApp(item.appId, item.name, item.icon);
              }}
              style={{
                width: '74px',
                height: '78px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '3px',
                textAlign: 'center',
                padding: '3px',
                boxSizing: 'border-box',
                backgroundColor: isSelected ? 'rgba(49, 106, 197, 0.55)' : 'transparent',
                border: isSelected ? '1px dotted rgba(255, 255, 255, 0.8)' : '1px solid transparent',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '2px', filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))' }}>
                {item.icon}
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: '11px',
                  textShadow: '1px 1px 2px #000000, -1px -1px 2px #000000, 1px -1px 2px #000000, -1px 1px 2px #000000',
                  wordBreak: 'break-word',
                  lineHeight: '1.2',
                  padding: '1px 3px',
                  borderRadius: '2px',
                  backgroundColor: isSelected ? '#316ac5' : 'transparent',
                }}
              >
                {item.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rubberband Selection Box */}
      {rubberband && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(rubberband.startX, rubberband.currentX)}px`,
            top: `${Math.min(rubberband.startY, rubberband.currentY)}px`,
            width: `${Math.abs(rubberband.currentX - rubberband.startX)}px`,
            height: `${Math.abs(rubberband.currentY - rubberband.startY)}px`,
            backgroundColor: 'rgba(49, 106, 197, 0.3)',
            border: '1px solid #316ac5',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* Window Layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        {windows.map((win) => (
          <div key={win.id} style={{ pointerEvents: 'auto' }}>
            <Window
              window={win}
              isFocused={focusedWinId === win.id}
              onFocus={() => focusWindow(win.id)}
              onClose={closeWindow}
              onMinimize={minimizeWindow}
              onToggleMaximize={toggleMaximizeWindow}
              onUpdateBounds={updateWindowBounds}
            >
              {renderAppContent(win)}
            </Window>
          </div>
        ))}
      </div>

      {/* Start Menu Popup */}
      {startMenuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '0px',
            width: '380px',
            height: '480px',
            backgroundColor: '#ffffff',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            boxShadow: '3px -3px 18px rgba(0,0,0,0.45)',
            border: '2px solid #0055ea',
            borderTop: '2px solid #ff9900',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'visible',
          }}
        >
          {/* User Profile Header */}
          <div
            style={{
              height: '56px',
              background: 'linear-gradient(to right, #1d5ad6 0%, #4189f7 100%)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '12px',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '4px',
                border: '2px solid #ffffff',
                backgroundColor: '#d8e5fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              👤
            </div>
            <div
              style={{
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '15px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              Administrator
            </div>
          </div>

          {/* Start Menu 2-Column Body */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left Column: Pinned + Frequent Apps + All Programs */}
            <div
              style={{
                flex: 1.25,
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #d3d3d3',
              }}
            >
              {/* Apps List */}
              <div
                style={{
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  flex: 1,
                  overflowY: 'auto',
                }}
              >
                {/* Pinned Section */}
                {[
                  { appId: 'ie', name: 'Internet Explorer', desc: 'Browse the Web', icon: '🌐' },
                  { appId: 'explorer', name: 'Outlook Express', desc: 'E-mail', icon: '✉️' },
                ].map((prog) => (
                  <div
                    key={prog.name}
                    onClick={() => openApp(prog.appId, prog.name, prog.icon)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '5px 6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2f71eb';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#000000';
                    }}
                  >
                    <div style={{ fontSize: '22px' }}>{prog.icon}</div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{prog.name}</div>
                      <div style={{ fontSize: '10px', opacity: 0.75 }}>{prog.desc}</div>
                    </div>
                  </div>
                ))}

                {/* Separator */}
                <div style={{ height: '1px', backgroundColor: '#e2e2e2', margin: '4px 6px' }} />

                {/* Frequently used programs */}
                {[
                  { appId: 'notepad', name: 'Notepad', desc: 'Text Editor', icon: '📝' },
                  { appId: 'paint', name: 'Paint', desc: 'Drawing Program', icon: '🎨' },
                  { appId: 'terminal', name: 'Command Prompt', desc: 'Command Shell', icon: '📟' },
                  { appId: 'calc', name: 'Calculator', desc: 'Calculator', icon: '🔢' },
                  { appId: 'minesweeper', name: 'Minesweeper', desc: 'Classic Game', icon: '💣' },
                  { appId: 'solitaire', name: 'Solitaire', desc: 'Klondike Solitaire', icon: '🃏' },
                ].map((prog) => (
                  <div
                    key={prog.name}
                    onClick={() => openApp(prog.appId, prog.name, prog.icon)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2f71eb';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#000000';
                    }}
                  >
                    <div style={{ fontSize: '20px' }}>{prog.icon}</div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{prog.name}</div>
                      <div style={{ fontSize: '10px', opacity: 0.75 }}>{prog.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* The Iconic "All Programs ▶" Button */}
              <div
                onClick={() => setAllProgramsOpen(!allProgramsOpen)}
                onMouseEnter={() => setAllProgramsOpen(true)}
                style={{
                  height: '36px',
                  borderTop: '1px solid #d3d3d3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backgroundColor: allProgramsOpen ? '#2f71eb' : '#f5f5f5',
                  color: allProgramsOpen ? '#ffffff' : '#000000',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  boxShadow: 'inset 0 1px 0 #ffffff',
                  position: 'relative',
                }}
              >
                <span>All Programs</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: allProgramsOpen ? '#ffffff' : '#00aa00',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  ▶
                </span>
              </div>
            </div>

            {/* Right Column: System Places */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#d3e5fa',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '11px',
              }}
            >
              {[
                { name: 'My Documents', appId: 'explorer' },
                { name: 'My Recent Documents', appId: 'explorer' },
                { name: 'My Pictures', appId: 'explorer' },
                { name: 'My Music', appId: 'explorer' },
                { name: 'My Computer', appId: 'explorer' },
                { name: 'Control Panel', appId: 'control-panel' },
                { name: 'Task Manager', appId: 'task-manager' },
                { name: 'Run...', appId: 'terminal' },
              ].map((item) => (
                <div
                  key={item.name}
                  onClick={() => openApp(item.appId, item.name)}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#001a66',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d5ad6';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#001a66';
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          {/* Start Menu Footer */}
          <div
            style={{
              height: '42px',
              background: 'linear-gradient(to bottom, #4189f7, #1d5ad6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '0 12px',
              gap: '12px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            }}
          >
            <button
              onClick={() => {
                setStartMenuOpen(false);
                alert('Logging off Administrator session...');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🔑</span> Log Off
            </button>
            <button
              onClick={() => {
                setStartMenuOpen(false);
                if (confirm('Are you sure you want to shut down Retro Web OS?')) {
                  setWindows([]);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🔴</span> Turn Off Computer
            </button>
          </div>

          {/* "All Programs" Cascading Flyout Menu */}
          {allProgramsOpen && (
            <div
              onMouseLeave={() => {
                setAllProgramsOpen(false);
                setActiveSubmenu(null);
              }}
              style={{
                position: 'absolute',
                left: '215px',
                bottom: '36px',
                width: '210px',
                backgroundColor: '#ffffff',
                border: '1px solid #716f64',
                boxShadow: '3px 3px 12px rgba(0,0,0,0.35)',
                padding: '3px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 10000,
              }}
            >
              {/* Accessories folder item */}
              <div
                onMouseEnter={() => setActiveSubmenu('accessories')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  backgroundColor: activeSubmenu === 'accessories' ? '#316ac5' : 'transparent',
                  color: activeSubmenu === 'accessories' ? '#ffffff' : '#000000',
                  fontSize: '11px',
                }}
              >
                <span>📁 Accessories</span>
                <span>▶</span>
              </div>

              {/* Games folder item */}
              <div
                onMouseEnter={() => setActiveSubmenu('games')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  backgroundColor: activeSubmenu === 'games' ? '#316ac5' : 'transparent',
                  color: activeSubmenu === 'games' ? '#ffffff' : '#000000',
                  fontSize: '11px',
                }}
              >
                <span>📁 Games</span>
                <span>▶</span>
              </div>

              {/* System Tools folder item */}
              <div
                onMouseEnter={() => setActiveSubmenu('system')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  backgroundColor: activeSubmenu === 'system' ? '#316ac5' : 'transparent',
                  color: activeSubmenu === 'system' ? '#ffffff' : '#000000',
                  fontSize: '11px',
                }}
              >
                <span>📁 System Tools</span>
                <span>▶</span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#e0e0e0', margin: '2px 0' }} />

              {/* Standalone programs in All Programs */}
              {[
                { name: 'Internet Explorer', appId: 'ie', icon: '🌐' },
                { name: 'Windows Media Player', appId: 'explorer', icon: '🎵' },
              ].map((p) => (
                <div
                  key={p.name}
                  onClick={() => openApp(p.appId, p.name, p.icon)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#316ac5';
                    e.currentTarget.style.color = '#ffffff';
                    setActiveSubmenu(null);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#000000';
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </div>
              ))}

              {/* Submenu for Accessories */}
              {activeSubmenu === 'accessories' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: '0px',
                    width: '180px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #716f64',
                    boxShadow: '3px 3px 12px rgba(0,0,0,0.35)',
                    padding: '3px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    zIndex: 10001,
                  }}
                >
                  {[
                    { name: 'Calculator', appId: 'calc', icon: '🔢' },
                    { name: 'Command Prompt', appId: 'terminal', icon: '📟' },
                    { name: 'Notepad', appId: 'notepad', icon: '📝' },
                    { name: 'Paint', appId: 'paint', icon: '🎨' },
                  ].map((app) => (
                    <div
                      key={app.name}
                      onClick={() => openApp(app.appId, app.name, app.icon)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#316ac5';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#000000';
                      }}
                    >
                      <span>{app.icon}</span>
                      <span>{app.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submenu for Games */}
              {activeSubmenu === 'games' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: '28px',
                    width: '180px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #716f64',
                    boxShadow: '3px 3px 12px rgba(0,0,0,0.35)',
                    padding: '3px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    zIndex: 10001,
                  }}
                >
                  {[
                    { name: 'Minesweeper', appId: 'minesweeper', icon: '💣' },
                    { name: 'Solitaire', appId: 'solitaire', icon: '🃏' },
                  ].map((app) => (
                    <div
                      key={app.name}
                      onClick={() => openApp(app.appId, app.name, app.icon)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#316ac5';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#000000';
                      }}
                    >
                      <span>{app.icon}</span>
                      <span>{app.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submenu for System Tools */}
              {activeSubmenu === 'system' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: '56px',
                    width: '180px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #716f64',
                    boxShadow: '3px 3px 12px rgba(0,0,0,0.35)',
                    padding: '3px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    zIndex: 10001,
                  }}
                >
                  {[
                    { name: 'Task Manager', appId: 'task-manager', icon: '📊' },
                    { name: 'Control Panel', appId: 'control-panel', icon: '⚙️' },
                    { name: 'File Explorer', appId: 'explorer', icon: '💻' },
                  ].map((app) => (
                    <div
                      key={app.name}
                      onClick={() => openApp(app.appId, app.name, app.icon)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#316ac5';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#000000';
                      }}
                    >
                      <span>{app.icon}</span>
                      <span>{app.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Windows XP Taskbar */}
      <div
        style={{
          height: '30px',
          background: 'linear-gradient(to bottom, #245edb 0%, #3f8cf3 9%, #245edb 18%, #1941a5 92%, #1941a5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 9998,
          borderTop: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.3)',
        }}
      >
        {/* Left: Start Button + Quick Launch + Running Window Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', flex: 1, overflow: 'hidden' }}>
          {/* Iconic XP Green Start Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStartMenuOpen(!startMenuOpen);
            }}
            style={{
              height: '100%',
              padding: '0 18px 0 10px',
              background: startMenuOpen
                ? 'linear-gradient(to bottom, #2e7d32 0%, #1b5e20 100%)'
                : 'linear-gradient(to bottom, #388e3c 0%, #52b856 15%, #388e3c 50%, #2e7d32 85%, #1b5e20 100%)',
              border: 'none',
              borderTopRightRadius: '14px',
              borderBottomRightRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 2px 0 4px rgba(0,0,0,0.4)',
            }}
          >
            {/* Windows XP 4-color flag */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', width: '13px', height: '13px', transform: 'rotate(-5deg)' }}>
              <div style={{ backgroundColor: '#f25022', borderRadius: '1px' }} />
              <div style={{ backgroundColor: '#7fba00', borderRadius: '1px' }} />
              <div style={{ backgroundColor: '#00a4ef', borderRadius: '1px' }} />
              <div style={{ backgroundColor: '#ffb900', borderRadius: '1px' }} />
            </div>
            <span
              style={{
                color: '#ffffff',
                fontWeight: 'bold',
                fontStyle: 'italic',
                fontSize: '14px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                letterSpacing: '0.4px',
              }}
            >
              start
            </span>
          </button>

          {/* Quick Launch Icons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingLeft: '8px',
              paddingRight: '8px',
              borderLeft: '1px solid rgba(255,255,255,0.25)',
              borderRight: '1px solid rgba(0,0,0,0.25)',
              marginLeft: '4px',
            }}
          >
            {[
              { appId: 'ie', icon: '🌐', title: 'Internet Explorer' },
              { appId: 'explorer', icon: '📁', title: 'Windows Explorer' },
              { appId: 'notepad', icon: '📝', title: 'Notepad' },
              { appId: 'paint', icon: '🎨', title: 'Paint' },
            ].map((q, i) => (
              <span
                key={i}
                title={q.title}
                onClick={() => openApp(q.appId)}
                style={{
                  fontSize: '15px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '2px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {q.icon}
              </span>
            ))}
          </div>

          {/* Dynamic Window Tabs in Taskbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
              padding: '0 6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {windows.map((w) => {
              const isFocused = focusedWinId === w.id && !w.isMinimized;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    if (w.isMinimized) {
                      focusWindow(w.id);
                    } else if (focusedWinId === w.id) {
                      minimizeWindow(w.id);
                    } else {
                      focusWindow(w.id);
                    }
                  }}
                  style={{
                    height: '24px',
                    minWidth: '130px',
                    maxWidth: '180px',
                    padding: '0 8px',
                    background: isFocused
                      ? 'linear-gradient(to bottom, #1d4db8 0%, #163c94 100%)'
                      : 'linear-gradient(to bottom, #3c7dde 0%, #2456c1 100%)',
                    border: '1px solid #0831d9',
                    borderRadius: '3px',
                    color: '#ffffff',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isFocused
                      ? 'inset 1px 1px 2px rgba(0,0,0,0.6)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.3)',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{w.icon}</span>
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {w.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: System Tray & Clock */}
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(to bottom, #0c59b9 0%, #139ee9 20%, #18b5f3 40%, #0c59b9 100%)',
            borderLeft: '1px solid #104284',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ffffff',
            fontSize: '11px',
            boxShadow: 'inset 1px 0 1px rgba(0,0,0,0.3)',
          }}
        >
          <span title="Security Shield" style={{ cursor: 'pointer' }}>🛡️</span>
          <span title="Network" style={{ cursor: 'pointer' }}>📶</span>
          <span title="Volume" style={{ cursor: 'pointer' }}>🔊</span>
          <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>{currentTime}</span>
        </div>
      </div>
    </div>
  );
}
