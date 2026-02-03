/**
 * Terminal Application
 * Command-line interface for Retro Web OS
 */

class Terminal {
    constructor() {
        this.windowManager = null;
        this.vfs = null;
        this.currentPath = 'C:\\';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.windowId = null;
        this.commands = {};
        this.registerCommands();
    }

    /**
     * Initialize with system references
     */
    init(windowManager, vfs) {
        this.windowManager = windowManager;
        this.vfs = vfs;
    }

    /**
     * Open Terminal window
     */
    open() {
        if (!this.windowManager) {
            console.error('[Terminal] WindowManager not initialized');
            return;
        }

        const win = this.windowManager.createWindow({
            title: 'Command Prompt',
            width: 700,
            height: 450,
            x: 150 + Math.random() * 80,
            y: 100 + Math.random() * 60,
            content: this.createTerminalHTML()
        });

        this.windowId = win.id;
        
        // Remove default padding
        const contentArea = win.element.querySelector('.window-content');
        if (contentArea) {
            contentArea.style.padding = '0';
        }

        // Set up event listeners
        this.setupEventListeners(win.id);

        // Print welcome message
        this.printWelcome(win.id);

        return win;
    }

    /**
     * Create Terminal HTML
     */
    createTerminalHTML() {
        return `
            <div class="terminal-container" style="display: flex; flex-direction: column; height: 100%; background: #0C0C0C; font-family: 'Consolas', 'Courier New', monospace; font-size: 14px;">
                <!-- Output Area -->
                <div class="terminal-output" style="flex: 1; overflow-y: auto; padding: 10px; color: #CCCCCC; white-space: pre-wrap; line-height: 1.4;"></div>
                <!-- Input Line -->
                <div class="terminal-input-line" style="display: flex; padding: 0 10px 10px 10px; color: #CCCCCC;">
                    <span class="terminal-prompt" style="color: #CCCCCC; margin-right: 5px;">C:\\&gt;</span>
                    <input type="text" class="terminal-input" style="flex: 1; background: transparent; border: none; outline: none; color: #CCCCCC; font-family: inherit; font-size: inherit;" autofocus />
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners(windowId) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        const container = windowEl.querySelector('.terminal-container');
        if (!container) return;

        const input = container.querySelector('.terminal-input');
        const output = container.querySelector('.terminal-output');

        // Focus input when clicking terminal
        container.addEventListener('click', () => {
            input.focus();
        });

        // Handle key events
        input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                if (command) {
                    // Add to history
                    this.commandHistory.push(command);
                    this.historyIndex = this.commandHistory.length;

                    // Print command
                    this.print(windowId, `${this.currentPath}>${command}`, '#CCCCCC');

                    // Execute command
                    await this.executeCommand(command, windowId);
                }
                input.value = '';
                this.updatePrompt(windowId);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    input.value = this.commandHistory[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    input.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    input.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Tab completion (basic)
                await this.handleTabCompletion(input, windowId);
            }
        });
    }

    /**
     * Register built-in commands
     */
    registerCommands() {
        this.commands = {
            help: {
                description: 'Display list of available commands',
                fn: () => this.cmdHelp()
            },
            clear: {
                description: 'Clear the terminal screen',
                fn: (args, windowId) => this.cmdClear(windowId)
            },
            cls: {
                description: 'Clear the terminal screen',
                fn: (args, windowId) => this.cmdClear(windowId)
            },
            dir: {
                description: 'List directory contents',
                fn: async (args) => await this.cmdDir(args)
            },
            ls: {
                description: 'List directory contents',
                fn: async (args) => await this.cmdDir(args)
            },
            cd: {
                description: 'Change current directory',
                fn: async (args) => await this.cmdCd(args)
            },
            pwd: {
                description: 'Print working directory',
                fn: () => this.currentPath
            },
            mkdir: {
                description: 'Create a new directory',
                fn: async (args) => await this.cmdMkdir(args)
            },
            rmdir: {
                description: 'Remove a directory',
                fn: async (args) => await this.cmdRmdir(args)
            },
            cat: {
                description: 'Display file contents',
                fn: async (args) => await this.cmdCat(args)
            },
            type: {
                description: 'Display file contents',
                fn: async (args) => await this.cmdCat(args)
            },
            echo: {
                description: 'Print text to terminal',
                fn: (args) => args.join(' ')
            },
            touch: {
                description: 'Create an empty file',
                fn: async (args) => await this.cmdTouch(args)
            },
            rm: {
                description: 'Delete a file',
                fn: async (args) => await this.cmdRm(args)
            },
            del: {
                description: 'Delete a file',
                fn: async (args) => await this.cmdRm(args)
            },
            date: {
                description: 'Display current date and time',
                fn: () => new Date().toString()
            },
            whoami: {
                description: 'Display current user',
                fn: () => 'User (Administrator)'
            },
            ver: {
                description: 'Display system version',
                fn: () => 'Retro Web OS v0.4.0 [Phase 4 - Built-in Applications]'
            },
            exit: {
                description: 'Close the terminal',
                fn: (args, windowId) => {
                    this.windowManager.close(windowId);
                    return null;
                }
            },
            ps: {
                description: 'List running processes (windows)',
                fn: () => this.cmdPs()
            },
            kill: {
                description: 'Terminate a process (close window)',
                fn: (args) => this.cmdKill(args)
            },
            notepad: {
                description: 'Open Notepad application',
                fn: () => {
                    if (window.RetroWeb?.notepad) {
                        window.RetroWeb.notepad.open();
                        return 'Launching Notepad...';
                    }
                    return 'Notepad not available';
                }
            },
            explorer: {
                description: 'Open File Explorer',
                fn: () => {
                    if (window.RetroWeb?.explorer) {
                        window.RetroWeb.explorer.open();
                        return 'Launching File Explorer...';
                    }
                    return 'File Explorer not available';
                }
            }
        };
    }

    /**
     * Execute a command
     */
    async executeCommand(input, windowId) {
        const parts = input.split(' ').filter(p => p);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands[cmd]) {
            try {
                const result = await this.commands[cmd].fn(args, windowId);
                if (result !== null && result !== undefined) {
                    this.print(windowId, result, '#CCCCCC');
                }
            } catch (err) {
                this.printError(windowId, err.message);
            }
        } else {
            this.printError(windowId, `'${cmd}' is not recognized as an internal or external command.`);
        }
    }

    /**
     * Print welcome message
     */
    printWelcome(windowId) {
        const welcome = `Retro Web OS [Version 0.4.0]
(c) 2026 Nohan Baloch. All rights reserved.

Type 'help' for a list of commands.
`;
        this.print(windowId, welcome, '#CCCCCC');
    }

    /**
     * Print text to terminal
     */
    print(windowId, text, color = '#CCCCCC') {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        const output = windowEl.querySelector('.terminal-output');
        const line = document.createElement('div');
        line.style.color = color;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    /**
     * Print error message
     */
    printError(windowId, text) {
        this.print(windowId, text, '#FF6B6B');
    }

    /**
     * Update prompt
     */
    updatePrompt(windowId) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        const prompt = windowEl.querySelector('.terminal-prompt');
        if (prompt) {
            prompt.textContent = `${this.currentPath}>`;
        }
    }

    /**
     * Resolve path
     */
    resolvePath(path) {
        if (!path) return this.currentPath;
        
        // Absolute path
        if (path.includes(':')) {
            return path.endsWith('\\') ? path : path + '\\';
        }
        
        // Relative path
        if (path === '..') {
            const parts = this.currentPath.split('\\').filter(p => p);
            if (parts.length > 1) {
                parts.pop();
                return parts.join('\\') + '\\';
            }
            return 'C:\\';
        }
        
        if (path === '.') {
            return this.currentPath;
        }
        
        return this.currentPath + path + (path.endsWith('\\') ? '' : '\\');
    }

    // ========== COMMANDS ==========

    /**
     * Help command
     */
    cmdHelp() {
        let output = '\nAvailable commands:\n\n';
        const cmdList = Object.entries(this.commands)
            .filter(([name], i, arr) => {
                // Filter out aliases (ls/dir, del/rm, etc.)
                return arr.findIndex(([n, c]) => c === this.commands[name]) === i;
            });
        
        for (const [name, cmd] of Object.entries(this.commands)) {
            output += `  ${name.padEnd(10)} - ${cmd.description}\n`;
        }
        return output;
    }

    /**
     * Clear command
     */
    cmdClear(windowId) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return null;

        const output = windowEl.querySelector('.terminal-output');
        output.innerHTML = '';
        return null;
    }

    /**
     * Dir command
     */
    async cmdDir(args) {
        if (!this.vfs) return 'Error: Filesystem not available';

        const path = this.resolvePath(args[0]);
        
        try {
            const entries = await this.vfs.listDirectory(path.replace(/\\$/, ''));
            
            let output = `\n Directory of ${path}\n\n`;
            
            // Sort: directories first
            entries.sort((a, b) => {
                if (a.type === 'directory' && b.type !== 'directory') return -1;
                if (a.type !== 'directory' && b.type === 'directory') return 1;
                return a.name.localeCompare(b.name);
            });

            for (const entry of entries) {
                const type = entry.type === 'directory' ? '<DIR>' : '     ';
                const size = entry.type === 'file' ? (entry.size || 0).toString().padStart(10) : '          ';
                output += `    ${type}  ${size}  ${entry.name}\n`;
            }
            
            const dirs = entries.filter(e => e.type === 'directory').length;
            const files = entries.filter(e => e.type === 'file').length;
            output += `\n    ${files} File(s)    ${dirs} Dir(s)\n`;
            
            return output;
        } catch (err) {
            throw new Error(`Directory not found: ${path}`);
        }
    }

    /**
     * Cd command
     */
    async cmdCd(args) {
        if (!args[0]) {
            return this.currentPath;
        }

        const newPath = this.resolvePath(args[0]);
        
        try {
            // Verify path exists
            await this.vfs.listDirectory(newPath.replace(/\\$/, ''));
            this.currentPath = newPath;
            return null;
        } catch (err) {
            throw new Error(`The system cannot find the path specified: ${newPath}`);
        }
    }

    /**
     * Mkdir command
     */
    async cmdMkdir(args) {
        if (!args[0]) throw new Error('Usage: mkdir <directory_name>');
        
        const path = this.currentPath + args[0];
        
        try {
            await this.vfs.createDirectory(path);
            return `Directory created: ${path}`;
        } catch (err) {
            throw new Error(`Failed to create directory: ${err.message}`);
        }
    }

    /**
     * Rmdir command
     */
    async cmdRmdir(args) {
        if (!args[0]) throw new Error('Usage: rmdir <directory_name>');
        
        const path = this.currentPath + args[0];
        
        try {
            await this.vfs.deleteDirectory(path);
            return `Directory removed: ${path}`;
        } catch (err) {
            throw new Error(`Failed to remove directory: ${err.message}`);
        }
    }

    /**
     * Cat command
     */
    async cmdCat(args) {
        if (!args[0]) throw new Error('Usage: cat <filename>');
        
        let path = args[0];
        if (!path.includes(':')) {
            path = this.currentPath + args[0];
        }
        
        try {
            const content = await this.vfs.readFile(path);
            return '\n' + content;
        } catch (err) {
            throw new Error(`File not found: ${path}`);
        }
    }

    /**
     * Touch command
     */
    async cmdTouch(args) {
        if (!args[0]) throw new Error('Usage: touch <filename>');
        
        const path = this.currentPath + args[0];
        
        try {
            await this.vfs.writeFile(path, '');
            return `File created: ${path}`;
        } catch (err) {
            throw new Error(`Failed to create file: ${err.message}`);
        }
    }

    /**
     * Rm command
     */
    async cmdRm(args) {
        if (!args[0]) throw new Error('Usage: rm <filename>');
        
        const path = this.currentPath + args[0];
        
        try {
            await this.vfs.deleteFile(path);
            return `File deleted: ${path}`;
        } catch (err) {
            throw new Error(`Failed to delete file: ${err.message}`);
        }
    }

    /**
     * Tab completion
     */
    async handleTabCompletion(input, windowId) {
        if (!this.vfs) return;

        const value = input.value;
        const parts = value.split(' ');
        const lastPart = parts[parts.length - 1];

        try {
            const entries = await this.vfs.listDirectory(this.currentPath.replace(/\\$/, ''));
            const matches = entries.filter(e => 
                e.name.toLowerCase().startsWith(lastPart.toLowerCase())
            );

            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0].name;
                if (matches[0].type === 'directory') {
                    parts[parts.length - 1] += '\\';
                }
                input.value = parts.join(' ');
            } else if (matches.length > 1) {
                this.print(windowId, matches.map(e => e.name).join('  '), '#CCCCCC');
            }
        } catch (err) {
            // Ignore errors
        }
    }

    /**
     * Ps command - List running processes (windows)
     */
    cmdPs() {
        if (!this.windowManager?.windows) {
            return 'No processes found.';
        }

        let output = '\n  PID          TITLE\n';
        output += '  -----------  ------------------\n';

        this.windowManager.windows.forEach((win, index) => {
            const pid = (index + 1).toString().padEnd(12);
            output += `  ${pid}  ${win.title}\n`;
        });

        output += `\n  Total: ${this.windowManager.windows.length} process(es)\n`;
        return output;
    }

    /**
     * Kill command - Terminate a process (close window)
     */
    cmdKill(args) {
        if (!args[0]) {
            throw new Error('Usage: kill <PID>');
        }

        const pid = parseInt(args[0]);
        if (isNaN(pid) || pid < 1) {
            throw new Error('Invalid PID. Use "ps" to see running processes.');
        }

        if (!this.windowManager?.windows) {
            throw new Error('No processes found.');
        }

        const win = this.windowManager.windows[pid - 1];
        if (!win) {
            throw new Error(`Process ${pid} not found.`);
        }

        const title = win.title;
        this.windowManager.close(win.id);
        return `Terminated process ${pid}: ${title}`;
    }
}

// Create global instance
const terminal = new Terminal();

// Export
export { Terminal, terminal };
