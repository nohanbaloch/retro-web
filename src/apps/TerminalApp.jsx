import React, { useState, useRef, useEffect } from 'react';

export default function TerminalApp({ onLaunchApp }) {
  const [history, setHistory] = useState([
    'Microsoft Windows XP [Version 5.1.2600]',
    '(C) Copyright 1985-2001 Microsoft Corp.',
    'Retro Web OS Terminal Edition',
    '',
    'Type "help" for a list of available commands.',
    '',
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [cmdIndex, setCmdIndex] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmed = input.trim();
      const newHistory = [...history, `C:\\Documents and Settings\\Administrator> ${input}`];

      if (trimmed.length > 0) {
        setCmdHistory((prev) => [...prev, trimmed]);
        setCmdIndex(-1);

        const args = trimmed.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
          case 'help':
            newHistory.push(
              'For more information on a specific command, type HELP command-name',
              '  CALC        Starts the Calculator application.',
              '  CLS         Clears the screen.',
              '  DATE        Displays or sets the date.',
              '  DIR         Displays a list of files and subdirectories in a directory.',
              '  ECHO        Displays messages.',
              '  EXIT        Quits the CMD.EXE program (command interpreter).',
              '  HELP        Provides Help information for Windows commands.',
              '  IPCONFIG    Displays IP configuration.',
              '  MINESWEEPER Starts the Minesweeper game.',
              '  NOTEPAD     Starts the Notepad text editor.',
              '  PAINT       Starts the Paint graphics program.',
              '  SOLITAIRE   Starts the Solitaire card game.',
              '  SYSTEMINFO  Displays machine specific properties and configuration.',
              '  TASKMGR     Starts the Windows Task Manager.',
              '  VER         Displays the Windows version.',
              '  WHOAMI      Displays the current user name.'
            );
            break;
          case 'cls':
          case 'clear':
            setHistory([]);
            setInput('');
            return;
          case 'ver':
            newHistory.push('Microsoft Windows XP [Version 5.1.2600.RetroWeb]');
            break;
          case 'dir':
            newHistory.push(
              ' Volume in drive C has no label.',
              ' Volume Serial Number is 4C21-89B2',
              ' Directory of C:\\Documents and Settings\\Administrator',
              '',
              '10/25/2026  05:00 AM    <DIR>          .',
              '10/25/2026  05:00 AM    <DIR>          ..',
              '10/25/2026  05:00 AM    <DIR>          Desktop',
              '10/25/2026  05:00 AM    <DIR>          My Documents',
              '10/25/2026  05:00 AM    <DIR>          Favorites',
              '10/25/2026  05:00 AM             1,024 boot.ini',
              '               1 File(s)          1,024 bytes',
              '               5 Dir(s)   20,480,000,000 bytes free'
            );
            break;
          case 'ipconfig':
            newHistory.push(
              'Windows IP Configuration',
              '',
              'Ethernet adapter Local Area Connection:',
              '   Connection-specific DNS Suffix  . : localdomain',
              '   IP Address. . . . . . . . . . . . : 192.168.1.105',
              '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
              '   Default Gateway . . . . . . . . . : 192.168.1.1'
            );
            break;
          case 'systeminfo':
            newHistory.push(
              'Host Name:                 RETRO-PC',
              'OS Name:                   Microsoft Windows XP Professional',
              'OS Version:                5.1.2600 Service Pack 3 Build 2600',
              'System Manufacturer:       Retro Web Technologies',
              'System Type:               X86-based PC',
              'Processor(s):              1 Processor(s) Installed.',
              '                           [01]: x86 Family 15 Model 2 Stepping 9 ~3.0 GHz',
              'Total Physical Memory:     512 MB',
              'Available Physical Memory: 344 MB'
            );
            break;
          case 'date':
            newHistory.push(`The current date is: ${new Date().toLocaleDateString()}`);
            break;
          case 'whoami':
            newHistory.push('RETRO-PC\\Administrator');
            break;
          case 'echo':
            newHistory.push(args.slice(1).join(' '));
            break;
          case 'notepad':
            newHistory.push('Starting Notepad...');
            if (onLaunchApp) onLaunchApp('notepad');
            break;
          case 'calc':
            newHistory.push('Starting Calculator...');
            if (onLaunchApp) onLaunchApp('calc');
            break;
          case 'paint':
            newHistory.push('Starting Paint...');
            if (onLaunchApp) onLaunchApp('paint');
            break;
          case 'minesweeper':
            newHistory.push('Starting Minesweeper...');
            if (onLaunchApp) onLaunchApp('minesweeper');
            break;
          case 'solitaire':
            newHistory.push('Starting Solitaire...');
            if (onLaunchApp) onLaunchApp('solitaire');
            break;
          case 'taskmgr':
            newHistory.push('Starting Task Manager...');
            if (onLaunchApp) onLaunchApp('task-manager');
            break;
          default:
            newHistory.push(
              `'${cmd}' is not recognized as an internal or external command, operable program or batch file.`
            );
            break;
        }
      }

      setHistory(newHistory);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      if (cmdHistory.length > 0) {
        const nextIdx = cmdIndex === -1 ? cmdHistory.length - 1 : Math.max(0, cmdIndex - 1);
        setCmdIndex(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (cmdIndex !== -1) {
        const nextIdx = cmdIndex + 1;
        if (nextIdx < cmdHistory.length) {
          setCmdIndex(nextIdx);
          setInput(cmdHistory[nextIdx]);
        } else {
          setCmdIndex(-1);
          setInput('');
        }
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        flex: 1,
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: "'Lucida Console', 'Consolas', monospace",
        fontSize: '12px',
        padding: '8px 10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        lineHeight: '1.4',
        boxSizing: 'border-box',
      }}
    >
      {history.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre-wrap' }}>
          {line}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>
          C:\Documents and Settings\Administrator&gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            padding: 0,
            caretColor: '#ffffff',
          }}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
