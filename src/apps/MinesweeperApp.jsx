import React, { useState, useEffect } from 'react';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

export default function MinesweeperApp() {
  const [grid, setGrid] = useState([]);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [flags, setFlags] = useState(0);
  const [timer, setTimer] = useState(0);
  const [face, setFace] = useState('🙂');
  const [isPressingCell, setIsPressingCell] = useState(false);

  const initGame = () => {
    let board = [];
    for (let r = 0; r < ROWS; r++) {
      let row = [];
      for (let c = 0; c < COLS; c++) {
        row.push({ r, c, isMine: false, isOpen: false, isFlag: false, count: 0 });
      }
      board.push(row);
    }

    let placed = 0;
    while (placed < MINES) {
      let r = Math.floor(Math.random() * ROWS);
      let c = Math.floor(Math.random() * COLS);
      if (!board[r][c].isMine) {
        board[r][c].isMine = true;
        placed++;
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              let nr = r + dr;
              let nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
                count++;
              }
            }
          }
          board[r][c].count = count;
        }
      }
    }

    setGrid(board);
    setStatus('playing');
    setFlags(0);
    setTimer(0);
    setFace('🙂');
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => setTimer((t) => Math.min(999, t + 1)), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const revealCell = (r, c) => {
    if (status !== 'playing' || grid[r][c].isOpen || grid[r][c].isFlag) return;

    let newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

    if (newGrid[r][c].isMine) {
      for (let row of newGrid) {
        for (let cell of row) {
          if (cell.isMine) cell.isOpen = true;
        }
      }
      setGrid(newGrid);
      setStatus('lost');
      setFace('😵');
      return;
    }

    const flood = (cr, cc) => {
      if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) return;
      if (newGrid[cr][cc].isOpen || newGrid[cr][cc].isFlag || newGrid[cr][cc].isMine) return;

      newGrid[cr][cc].isOpen = true;
      if (newGrid[cr][cc].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            flood(cr + dr, cc + dc);
          }
        }
      }
    };

    flood(r, c);

    let unrevealed = 0;
    for (let row of newGrid) {
      for (let cell of row) {
        if (!cell.isOpen && !cell.isMine) unrevealed++;
      }
    }

    setGrid(newGrid);
    if (unrevealed === 0) {
      setStatus('won');
      setFace('😎');
    }
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault();
    if (status !== 'playing' || grid[r][c].isOpen) return;

    let newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    newGrid[r][c].isFlag = !newGrid[r][c].isFlag;
    setGrid(newGrid);
    setFlags((prev) => (newGrid[r][c].isFlag ? prev + 1 : prev - 1));
  };

  const getNumberColor = (num) => {
    switch (num) {
      case 1: return '#0000ff';
      case 2: return '#008000';
      case 3: return '#ff0000';
      case 4: return '#000080';
      case 5: return '#800000';
      case 6: return '#008080';
      default: return '#000000';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#c0c0c0',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        fontFamily: 'Tahoma, sans-serif',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer beveled frame */}
      <div
        style={{
          border: '3px solid #808080',
          borderRightColor: '#ffffff',
          borderBottomColor: '#ffffff',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header Display */}
        <div
          style={{
            width: '218px',
            height: '38px',
            border: '2px solid #808080',
            borderRightColor: '#ffffff',
            borderBottomColor: '#ffffff',
            backgroundColor: '#c0c0c0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 6px',
            marginBottom: '8px',
            boxSizing: 'border-box',
          }}
        >
          {/* Mine counter */}
          <div
            style={{
              backgroundColor: '#000000',
              color: '#ff0000',
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: '900',
              fontSize: '20px',
              padding: '1px 4px',
              border: '1px solid #808080',
            }}
          >
            {String(Math.max(0, MINES - flags)).padStart(3, '0')}
          </div>

          {/* Reset Face */}
          <button
            onClick={initGame}
            style={{
              width: '26px',
              height: '26px',
              fontSize: '16px',
              border: '2px solid #ffffff',
              borderRightColor: '#7b7b7b',
              borderBottomColor: '#7b7b7b',
              backgroundColor: '#c0c0c0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: 'inset 1px 1px 0 #ffffff',
            }}
          >
            {status === 'playing' ? (isPressingCell ? '😮' : '🙂') : face}
          </button>

          {/* Timer */}
          <div
            style={{
              backgroundColor: '#000000',
              color: '#ff0000',
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: '900',
              fontSize: '20px',
              padding: '1px 4px',
              border: '1px solid #808080',
            }}
          >
            {String(timer).padStart(3, '0')}
          </div>
        </div>

        {/* Minesweeper Grid */}
        <div
          onMouseDown={() => setIsPressingCell(true)}
          onMouseUp={() => setIsPressingCell(false)}
          onMouseLeave={() => setIsPressingCell(false)}
          style={{
            border: '3px solid #808080',
            borderRightColor: '#ffffff',
            borderBottomColor: '#ffffff',
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 24px)`,
            gap: '1px',
            backgroundColor: '#7b7b7b',
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: cell.isOpen ? '#bdbdbd' : '#c0c0c0',
                  border: cell.isOpen
                    ? '1px solid #7b7b7b'
                    : '2px solid #ffffff',
                  borderRightColor: cell.isOpen ? '#7b7b7b' : '#7b7b7b',
                  borderBottomColor: cell.isOpen ? '#7b7b7b' : '#7b7b7b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  color: cell.count ? getNumberColor(cell.count) : 'inherit',
                }}
              >
                {cell.isOpen ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.count > 0 ? (
                    cell.count
                  ) : (
                    ''
                  )
                ) : cell.isFlag ? (
                  '🚩'
                ) : (
                  ''
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
