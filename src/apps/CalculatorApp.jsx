import React, { useState, useEffect } from 'react';

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState(null);
  const [op, setOp] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevVal(null);
    setOp(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const performOp = (nextOp) => {
    const inputValue = parseFloat(display);

    if (prevVal === null) {
      setPrevVal(inputValue);
    } else if (op) {
      const currentValue = prevVal || 0;
      let result = currentValue;

      if (op === '+') result = currentValue + inputValue;
      else if (op === '-') result = currentValue - inputValue;
      else if (op === '*') result = currentValue * inputValue;
      else if (op === '/') result = inputValue !== 0 ? currentValue / inputValue : 'Cannot divide by zero';

      setPrevVal(result);
      setDisplay(String(result));
    }

    setWaitingForOperand(true);
    setOp(nextOp);
  };

  const handleEqual = () => {
    if (!op || prevVal === null) return;
    performOp(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(parseInt(e.key, 10));
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        performOp(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
      } else if (e.key === 'Escape') {
        clearAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, prevVal, op, waitingForOperand]);

  const btnBase = {
    flex: 1,
    height: '28px',
    backgroundColor: '#ece9d8',
    border: '1px solid #716f64',
    borderRadius: '2px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #a09d8d, 1px 1px 1px rgba(0,0,0,0.15)',
    userSelect: 'none',
    outline: 'none',
  };

  const blueBtn = {
    ...btnBase,
    color: '#000080',
  };

  const redBtn = {
    ...btnBase,
    color: '#b81414',
  };

  return (
    <div
      style={{
        backgroundColor: '#ece9d8',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        userSelect: 'none',
        fontFamily: 'Tahoma, sans-serif',
      }}
    >
      {/* Menu Bar */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#ece9d8',
          borderBottom: '1px solid #d0ccb8',
          padding: '2px 6px',
          gap: '8px',
          fontSize: '11px',
        }}
      >
        <span style={{ cursor: 'pointer', padding: '1px 4px' }}>Edit</span>
        <span style={{ cursor: 'pointer', padding: '1px 4px' }}>View</span>
        <span style={{ cursor: 'pointer', padding: '1px 4px' }}>Help</span>
      </div>

      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
        {/* Beveled Sunken Display */}
        <div
          style={{
            height: '36px',
            backgroundColor: '#ffffff',
            border: '2px solid #716f64',
            borderRightColor: '#ffffff',
            borderBottomColor: '#ffffff',
            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 8px',
            fontSize: '18px',
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 'bold',
            color: '#000000',
            overflow: 'hidden',
          }}
        >
          {display}
        </div>

        {/* Clear / Backspace Row */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div
            style={{
              width: '42px',
              height: '28px',
              border: '1px solid #716f64',
              backgroundColor: '#ece9d8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              color: memory !== 0 ? '#b81414' : '#888',
              boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #a09d8d',
            }}
          >
            {memory !== 0 ? 'M' : ''}
          </div>
          <button style={redBtn} onClick={() => setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'))}>
            Backspace
          </button>
          <button style={redBtn} onClick={clearEntry}>
            CE
          </button>
          <button style={redBtn} onClick={clearAll}>
            C
          </button>
        </div>

        {/* Main Keypad */}
        <div style={{ display: 'flex', flex: 1, gap: '6px' }}>
          {/* Left Column: Memory */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '42px', gap: '4px' }}>
            <button style={redBtn} onClick={() => setMemory(0)}>MC</button>
            <button style={redBtn} onClick={() => setDisplay(String(memory))}>MR</button>
            <button style={redBtn} onClick={() => setMemory(parseFloat(display))}>MS</button>
            <button style={redBtn} onClick={() => setMemory(memory + parseFloat(display))}>M+</button>
          </div>

          {/* Right Columns: Digits & Operations */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
              <button style={blueBtn} onClick={() => inputDigit(7)}>7</button>
              <button style={blueBtn} onClick={() => inputDigit(8)}>8</button>
              <button style={blueBtn} onClick={() => inputDigit(9)}>9</button>
              <button style={redBtn} onClick={() => performOp('/')}>/</button>
              <button style={blueBtn} onClick={() => setDisplay(String(Math.sqrt(parseFloat(display))))}>sqrt</button>
            </div>
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
              <button style={blueBtn} onClick={() => inputDigit(4)}>4</button>
              <button style={blueBtn} onClick={() => inputDigit(5)}>5</button>
              <button style={blueBtn} onClick={() => inputDigit(6)}>6</button>
              <button style={redBtn} onClick={() => performOp('*')}>*</button>
              <button style={blueBtn} onClick={() => performOp('%')}>%</button>
            </div>
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
              <button style={blueBtn} onClick={() => inputDigit(1)}>1</button>
              <button style={blueBtn} onClick={() => inputDigit(2)}>2</button>
              <button style={blueBtn} onClick={() => inputDigit(3)}>3</button>
              <button style={redBtn} onClick={() => performOp('-')}>-</button>
              <button style={blueBtn} onClick={() => setDisplay(String(1 / parseFloat(display)))}>1/x</button>
            </div>
            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
              <button style={blueBtn} onClick={() => inputDigit(0)}>0</button>
              <button style={blueBtn} onClick={() => setDisplay(String(-parseFloat(display)))}>+/-</button>
              <button style={blueBtn} onClick={inputDecimal}>.</button>
              <button style={redBtn} onClick={() => performOp('+')}>+</button>
              <button style={redBtn} onClick={handleEqual}>=</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
