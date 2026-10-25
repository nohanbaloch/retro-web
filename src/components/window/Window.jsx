import React, { useState, useEffect } from 'react';

export default function Window({
  window: win,
  isFocused,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onUpdateBounds,
  children,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  // Handle Dragging
  const handleTitleMouseDown = (e) => {
    if (e.button !== 0 || win.isMaximized) return; // Only left click and when not maximized
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        // Clamp so the window titlebar is always accessible
        const newX = Math.max(-win.width + 100, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragOffset.y));
        onUpdateBounds(win.id, { x: newX, y: newY, width: win.width, height: win.height });
      } else if (isResizing) {
        let newW = resizeStart.width;
        let newH = resizeStart.height;
        let newX = resizeStart.posX;
        let newY = resizeStart.posY;

        if (resizeDir.includes('e')) {
          newW = Math.max(260, resizeStart.width + (e.clientX - resizeStart.x));
        }
        if (resizeDir.includes('s')) {
          newH = Math.max(160, resizeStart.height + (e.clientY - resizeStart.y));
        }
        if (resizeDir.includes('w')) {
          const deltaX = e.clientX - resizeStart.x;
          if (resizeStart.width - deltaX >= 260) {
            newW = resizeStart.width - deltaX;
            newX = resizeStart.posX + deltaX;
          }
        }
        if (resizeDir.includes('n')) {
          const deltaY = e.clientY - resizeStart.y;
          if (resizeStart.height - deltaY >= 160) {
            newH = resizeStart.height - deltaY;
            newY = resizeStart.posY + deltaY;
          }
        }

        onUpdateBounds(win.id, { x: newX, y: newY, width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isResizing, resizeDir, resizeStart, win, onUpdateBounds]);

  const startResize = (e, dir) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus();
    setIsResizing(true);
    setResizeDir(dir);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: win.width,
      height: win.height,
      posX: win.x,
      posY: win.y,
    });
  };

  if (win.isMinimized) return null;

  const style = win.isMaximized
    ? {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100vw',
        height: 'calc(100vh - 30px)',
        zIndex: win.zIndex,
      }
    : {
        position: 'absolute',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex,
      };

  return (
    <div
      onMouseDown={onFocus}
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ece9d8',
        border: isFocused ? '3px solid #0055ea' : '3px solid #7697e7',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        boxShadow: isFocused
          ? '0 10px 30px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.25)'
          : '0 4px 12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
      }}
    >
      {/* Authentic XP Luna Blue Title Bar */}
      <div
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => onToggleMaximize(win.id)}
        style={{
          height: '28px',
          minHeight: '28px',
          background: isFocused
            ? 'linear-gradient(to bottom, #0058ee 0%, #3593ff 10%, #288eff 30%, #0055ea 50%, #0045d6 80%, #0037a5 100%)'
            : 'linear-gradient(to bottom, #7697e7 0%, #a2baf4 15%, #88a7ed 50%, #7697e7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 5px 0 8px',
          cursor: win.isMaximized ? 'default' : 'move',
          borderTopLeftRadius: '5px',
          borderTopRightRadius: '5px',
          color: isFocused ? '#ffffff' : '#d8e4fc',
          fontWeight: 'bold',
          fontSize: '12px',
          letterSpacing: '0.2px',
          textShadow: isFocused ? '1px 1px 2px rgba(0, 0, 0, 0.8)' : 'none',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span style={{ fontSize: '15px', filter: isFocused ? 'none' : 'grayscale(30%)' }}>
            {win.icon || '📄'}
          </span>
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '380px',
            }}
          >
            {win.title}
          </span>
        </div>

        {/* Window Control Buttons */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
        >
          {/* Minimize Button */}
          <button
            onClick={() => onMinimize(win.id)}
            title="Minimize"
            style={{
              width: '21px',
              height: '21px',
              background: 'linear-gradient(to bottom, #428bfa 0%, #2777ee 50%, #1558d0 100%)',
              border: '1px solid #ffffff',
              borderRadius: '3px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            onMouseDown={(e) => (e.currentTarget.style.filter = 'brightness(0.85)')}
            onMouseUp={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
          >
            _
          </button>

          {/* Maximize/Restore Button */}
          <button
            onClick={() => onToggleMaximize(win.id)}
            title={win.isMaximized ? 'Restore' : 'Maximize'}
            style={{
              width: '21px',
              height: '21px',
              background: 'linear-gradient(to bottom, #428bfa 0%, #2777ee 50%, #1558d0 100%)',
              border: '1px solid #ffffff',
              borderRadius: '3px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            onMouseDown={(e) => (e.currentTarget.style.filter = 'brightness(0.85)')}
            onMouseUp={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
          >
            {win.isMaximized ? '❐' : '□'}
          </button>

          {/* Close Button */}
          <button
            onClick={() => onClose(win.id)}
            title="Close"
            style={{
              width: '21px',
              height: '21px',
              background: 'linear-gradient(to bottom, #f05e46 0%, #e03b22 50%, #b82312 100%)',
              border: '1px solid #ffffff',
              borderRadius: '3px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            onMouseDown={(e) => (e.currentTarget.style.filter = 'brightness(0.85)')}
            onMouseUp={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Window Content Body */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          border: '1px solid #716f64',
          margin: '2px',
        }}
      >
        {children}
      </div>

      {/* Resize Handles (8 zones) */}
      {!win.isMaximized && (
        <>
          <div
            onMouseDown={(e) => startResize(e, 'e')}
            style={{ position: 'absolute', right: 0, top: 28, bottom: 8, width: '6px', cursor: 'e-resize' }}
          />
          <div
            onMouseDown={(e) => startResize(e, 'w')}
            style={{ position: 'absolute', left: 0, top: 28, bottom: 8, width: '6px', cursor: 'w-resize' }}
          />
          <div
            onMouseDown={(e) => startResize(e, 's')}
            style={{ position: 'absolute', bottom: 0, left: 8, right: 8, height: '6px', cursor: 's-resize' }}
          />
          <div
            onMouseDown={(e) => startResize(e, 'se')}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: '14px',
              height: '14px',
              cursor: 'se-resize',
              backgroundImage: 'radial-gradient(#888 1.5px, transparent 1.5px)',
              backgroundSize: '4px 4px',
              backgroundPosition: '2px 2px',
            }}
          />
          <div
            onMouseDown={(e) => startResize(e, 'sw')}
            style={{ position: 'absolute', left: 0, bottom: 0, width: '12px', height: '12px', cursor: 'sw-resize' }}
          />
        </>
      )}
    </div>
  );
}
