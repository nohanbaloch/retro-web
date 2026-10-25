import React, { useRef, useState, useEffect } from 'react';

const COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
  '#804000', '#408080', '#8080ff', '#004080', '#8000ff', '#ff8040', '#ff8080', '#ff0080',
];

export default function PaintApp() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('pencil'); // 'pencil' | 'eraser' | 'brush'
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDraw = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);

    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setPos({ x, y });

    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Tahoma, sans-serif' }}>
      {/* Tool & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ece9d8',
          borderBottom: '1px solid #d0ccb8',
          padding: '4px 8px',
          gap: '8px',
          fontSize: '11px',
        }}
      >
        <button
          onClick={() => setTool('pencil')}
          style={{
            padding: '2px 8px',
            backgroundColor: tool === 'pencil' ? '#c0d2ec' : '#ece9d8',
            border: '1px solid #716f64',
            cursor: 'pointer',
            borderRadius: '2px',
          }}
        >
          ✏️ Pencil
        </button>
        <button
          onClick={() => setTool('brush')}
          style={{
            padding: '2px 8px',
            backgroundColor: tool === 'brush' ? '#c0d2ec' : '#ece9d8',
            border: '1px solid #716f64',
            cursor: 'pointer',
            borderRadius: '2px',
          }}
        >
          🖌️ Brush
        </button>
        <button
          onClick={() => setTool('eraser')}
          style={{
            padding: '2px 8px',
            backgroundColor: tool === 'eraser' ? '#c0d2ec' : '#ece9d8',
            border: '1px solid #716f64',
            cursor: 'pointer',
            borderRadius: '2px',
          }}
        >
          🧹 Eraser
        </button>
        <button
          onClick={clearCanvas}
          style={{
            padding: '2px 8px',
            backgroundColor: '#ece9d8',
            border: '1px solid #716f64',
            cursor: 'pointer',
            borderRadius: '2px',
          }}
        >
          🗑️ Clear
        </button>

        {/* Size Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
          <span>Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            style={{ width: '70px', height: '12px' }}
          />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#808080',
          overflow: 'auto',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.4)',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          }}
        />
      </div>

      {/* Color Palette Footer */}
      <div
        style={{
          height: '42px',
          backgroundColor: '#ece9d8',
          borderTop: '1px solid #d0ccb8',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: '12px',
        }}
      >
        {/* Selected Color Box */}
        <div
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: color,
            border: '2px inset #999',
            boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
          }}
        />

        {/* Color Palette Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 14px)',
            gridTemplateRows: 'repeat(2, 14px)',
            gap: '2px',
          }}
        >
          {COLORS.map((c) => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: c,
                border: '1px solid #555',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            />
          ))}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#555' }}>
          {pos.x}, {pos.y}px
        </div>
      </div>
    </div>
  );
}
