import React, { useState } from 'react';

export default function SolitaireApp() {
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const resetGame = () => {
    setScore(0);
    setMoves(0);
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#008000',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Tahoma, sans-serif',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Top Controls & Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '12px',
          textShadow: '1px 1px 1px #000000',
        }}
      >
        <button
          onClick={resetGame}
          style={{
            padding: '3px 12px',
            backgroundColor: '#ece9d8',
            border: '2px outset #ffffff',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          Deal New Game
        </button>
        <div>Score: {score}</div>
        <div>Moves: {moves}</div>
      </div>

      {/* Top Area: Stock, Waste, and Foundations */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        {/* Stock & Waste */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Deck Pile */}
          <div
            onClick={() => setMoves((m) => m + 1)}
            style={{
              width: '56px',
              height: '80px',
              backgroundColor: '#1b4d3e',
              border: '2px solid #ffffff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '24px',
              boxShadow: '1px 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            🂠
          </div>
          {/* Waste Pile */}
          <div
            style={{
              width: '56px',
              height: '80px',
              backgroundColor: '#ffffff',
              border: '1px solid #000000',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff0000',
              fontWeight: 'bold',
              boxShadow: '1px 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ fontSize: '16px' }}>K ♥</span>
          </div>
        </div>

        {/* 4 Foundations */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['♠', '♥', '♦', '♣'].map((suit, i) => (
            <div
              key={i}
              style={{
                width: '56px',
                height: '80px',
                border: '2px dashed rgba(255,255,255,0.4)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '24px',
              }}
            >
              {suit}
            </div>
          ))}
        </div>
      </div>

      {/* Tableau (7 Columns) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
        {[
          { label: 'A ♠', color: '#000000' },
          { label: 'Q ♦', color: '#ff0000' },
          { label: 'J ♣', color: '#000000' },
          { label: '10 ♥', color: '#ff0000' },
          { label: '9 ♠', color: '#000000' },
          { label: '8 ♦', color: '#ff0000' },
          { label: '7 ♣', color: '#000000' },
        ].map((card, i) => (
          <div
            key={i}
            onClick={() => { setMoves((m) => m + 1); setScore((s) => s + 5); }}
            style={{
              width: '56px',
              height: '80px',
              backgroundColor: '#ffffff',
              border: '1px solid #000000',
              borderRadius: '4px',
              padding: '4px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: card.color,
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '1px 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            <div>{card.label}</div>
            <div style={{ textAlign: 'center', fontSize: '20px' }}>{card.label.slice(-1)}</div>
            <div style={{ textAlign: 'right' }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
