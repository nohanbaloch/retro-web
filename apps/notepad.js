/**
 * Notepad Application
 * A simple text editor for Retro Web OS
 */

class Notepad {
    constructor() {
        this.windowManager = null;
        this.vfs = null;
        this.currentFile = null;
        this.isModified = false;
        this.windowId = null;
        this.autosaveInterval = null;
        this.autosaveEnabled = true;
        this.AUTOSAVE_DELAY = 30000; // 30 seconds
    }

    /**
     * Initialize with system references
     */
    init(windowManager, vfs) {
        this.windowManager = windowManager;
        this.vfs = vfs;
    }

    /**
     * Open Notepad window
     */
    open(filePath = null) {
        if (!this.windowManager) {
            console.error('[Notepad] WindowManager not initialized');
            return;
        }

        const win = this.windowManager.createWindow({
            title: 'Untitled - Notepad',
            width: 650,
            height: 450,
            x: 120 + Math.random() * 80,
            y: 80 + Math.random() * 60,
            content: this.createNotepadHTML()
        });

        this.windowId = win.id;
        
        // Remove default padding
        const contentArea = win.element.querySelector('.window-content');
        if (contentArea) {
            contentArea.style.padding = '0';
        }

        // Set up event listeners
        this.setupEventListeners(win.id);

        // Start autosave
        this.startAutosave(win.id);

        // If a file path was provided, open it
        if (filePath) {
            this.openFile(filePath);
        }

        return win;
    }

    /**
     * Create Notepad HTML
     */
    createNotepadHTML() {
        return `
            <div class="notepad-container" style="display: flex; flex-direction: column; height: 100%; background: white; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <!-- Menu Bar -->
                <div class="notepad-menubar" style="display: flex; background: #f0f0f0; border-bottom: 1px solid #ccc; font-size: 12px;">
                    <div class="menu-item" data-menu="file" style="padding: 4px 12px; cursor: pointer; position: relative;">
                        File
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); min-width: 150px; z-index: 1000;">
                            <div class="menu-option" data-action="new" style="padding: 6px 20px; cursor: pointer;">New</div>
                            <div class="menu-option" data-action="open" style="padding: 6px 20px; cursor: pointer;">Open...</div>
                            <div class="menu-option" data-action="save" style="padding: 6px 20px; cursor: pointer;">Save</div>
                            <div class="menu-option" data-action="saveas" style="padding: 6px 20px; cursor: pointer;">Save As...</div>
                            <div style="height: 1px; background: #ddd; margin: 4px 0;"></div>
                            <div class="menu-option" data-action="close" style="padding: 6px 20px; cursor: pointer;">Exit</div>
                        </div>
                    </div>
                    <div class="menu-item" data-menu="edit" style="padding: 4px 12px; cursor: pointer; position: relative;">
                        Edit
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); min-width: 150px; z-index: 1000;">
                            <div class="menu-option" data-action="cut" style="padding: 6px 20px; cursor: pointer;">Cut</div>
                            <div class="menu-option" data-action="copy" style="padding: 6px 20px; cursor: pointer;">Copy</div>
                            <div class="menu-option" data-action="paste" style="padding: 6px 20px; cursor: pointer;">Paste</div>
                            <div style="height: 1px; background: #ddd; margin: 4px 0;"></div>
                            <div class="menu-option" data-action="selectall" style="padding: 6px 20px; cursor: pointer;">Select All</div>
                            <div class="menu-option" data-action="find" style="padding: 6px 20px; cursor: pointer;">Find...</div>
                        </div>
                    </div>
                    <div class="menu-item" data-menu="format" style="padding: 4px 12px; cursor: pointer; position: relative;">
                        Format
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); min-width: 150px; z-index: 1000;">
                            <div class="menu-option" data-action="wordwrap" style="padding: 6px 20px; cursor: pointer;">✓ Word Wrap</div>
                            <div class="menu-option" data-action="font" style="padding: 6px 20px; cursor: pointer;">Font...</div>
                        </div>
                    </div>
                    <div class="menu-item" data-menu="help" style="padding: 4px 12px; cursor: pointer; position: relative;">
                        Help
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); min-width: 150px; z-index: 1000;">
                            <div class="menu-option" data-action="about" style="padding: 6px 20px; cursor: pointer;">About Notepad</div>
                        </div>
                    </div>
                </div>
                <!-- Text Area -->
                <textarea class="notepad-textarea" style="flex: 1; width: 100%; font-family: 'Courier New', Consolas, monospace; font-size: 14px; padding: 10px; border: none; resize: none; outline: none; line-height: 1.5;" placeholder="Start typing..."></textarea>
                <!-- Status Bar -->
                <div class="notepad-statusbar" style="display: flex; justify-content: space-between; padding: 4px 10px; background: #f0f0f0; border-top: 1px solid #ccc; font-size: 11px; color: #666;">
                    <span class="status-left">Ready</span>
                    <span class="status-right">Ln 1, Col 1</span>
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

        const container = windowEl.querySelector('.notepad-container');
        if (!container) return;

        const textarea = container.querySelector('.notepad-textarea');
        const menuItems = container.querySelectorAll('.menu-item');
        const menuOptions = container.querySelectorAll('.menu-option');

        // Menu item click - toggle dropdown
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = item.querySelector('.menu-dropdown');
                
                // Close all other dropdowns
                menuItems.forEach(i => {
                    if (i !== item) {
                        i.querySelector('.menu-dropdown').style.display = 'none';
                    }
                });

                // Toggle this dropdown
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });

            // Hover effect
            item.addEventListener('mouseenter', () => {
                item.style.background = '#E0E0E0';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });
        });

        // Menu option click
        menuOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = option.dataset.action;
                this.handleMenuAction(action, windowId);
                
                // Close all dropdowns
                menuItems.forEach(i => {
                    i.querySelector('.menu-dropdown').style.display = 'none';
                });
            });

            // Hover effect
            option.addEventListener('mouseenter', () => {
                option.style.background = '#0078D7';
                option.style.color = 'white';
            });
            option.addEventListener('mouseleave', () => {
                option.style.background = 'transparent';
                option.style.color = 'black';
            });
        });

        // Close dropdowns when clicking elsewhere
        document.addEventListener('click', () => {
            menuItems.forEach(i => {
                i.querySelector('.menu-dropdown').style.display = 'none';
            });
        });

        // Textarea events
        textarea.addEventListener('input', () => {
            this.isModified = true;
            this.updateTitle(windowId);
        });

        textarea.addEventListener('keyup', () => {
            this.updateCursorPosition(windowId);
        });

        textarea.addEventListener('click', () => {
            this.updateCursorPosition(windowId);
        });
    }

    /**
     * Handle menu actions
     */
    handleMenuAction(action, windowId) {
        switch (action) {
            case 'new':
                this.newFile(windowId);
                break;
            case 'open':
                this.showOpenDialog(windowId);
                break;
            case 'save':
                this.save(windowId);
                break;
            case 'saveas':
                this.showSaveDialog(windowId);
                break;
            case 'close':
                this.windowManager.close(windowId);
                break;
            case 'cut':
                document.execCommand('cut');
                break;
            case 'copy':
                document.execCommand('copy');
                break;
            case 'paste':
                document.execCommand('paste');
                break;
            case 'selectall':
                this.selectAll(windowId);
                break;
            case 'find':
                this.showFindDialog(windowId);
                break;
            case 'wordwrap':
                this.toggleWordWrap(windowId);
                break;
            case 'about':
                this.showAbout();
                break;
        }
    }

    /**
     * Create new file
     */
    newFile(windowId) {
        if (this.isModified) {
            if (!confirm('You have unsaved changes. Create new file anyway?')) {
                return;
            }
        }

        const windowEl = document.getElementById(windowId);
        const textarea = windowEl.querySelector('.notepad-textarea');
        textarea.value = '';
        this.currentFile = null;
        this.isModified = false;
        this.updateTitle(windowId);
        this.updateStatus(windowId, 'New file created');
    }

    /**
     * Show open dialog
     */
    async showOpenDialog(windowId) {
        const path = prompt('Enter file path to open:', 'C:\\Documents and Settings\\User\\My Documents\\');
        if (path) {
            await this.openFile(path, windowId);
        }
    }

    /**
     * Open a file
     */
    async openFile(filePath, windowId = this.windowId) {
        if (!this.vfs) {
            alert('Virtual filesystem not available');
            return;
        }

        try {
            const content = await this.vfs.readFile(filePath);
            const windowEl = document.getElementById(windowId);
            const textarea = windowEl.querySelector('.notepad-textarea');
            
            textarea.value = content;
            this.currentFile = filePath;
            this.isModified = false;
            this.updateTitle(windowId);
            this.updateStatus(windowId, `Opened: ${filePath}`);
        } catch (err) {
            alert(`Failed to open file: ${err.message}`);
            console.error('[Notepad] Open error:', err);
        }
    }

    /**
     * Save current file
     */
    async save(windowId) {
        if (this.currentFile) {
            await this.saveToFile(this.currentFile, windowId);
        } else {
            await this.showSaveDialog(windowId);
        }
    }

    /**
     * Show save dialog
     */
    async showSaveDialog(windowId) {
        const defaultPath = this.currentFile || 'C:\\Documents and Settings\\User\\My Documents\\untitled.txt';
        const path = prompt('Save file as:', defaultPath);
        if (path) {
            await this.saveToFile(path, windowId);
        }
    }

    /**
     * Save to file
     */
    async saveToFile(filePath, windowId) {
        if (!this.vfs) {
            alert('Virtual filesystem not available');
            return;
        }

        try {
            const windowEl = document.getElementById(windowId);
            const textarea = windowEl.querySelector('.notepad-textarea');
            
            await this.vfs.writeFile(filePath, textarea.value);
            this.currentFile = filePath;
            this.isModified = false;
            this.updateTitle(windowId);
            this.updateStatus(windowId, `Saved: ${filePath}`);
        } catch (err) {
            alert(`Failed to save file: ${err.message}`);
            console.error('[Notepad] Save error:', err);
        }
    }

    /**
     * Select all text
     */
    selectAll(windowId) {
        const windowEl = document.getElementById(windowId);
        const textarea = windowEl.querySelector('.notepad-textarea');
        textarea.select();
    }

    /**
     * Show find dialog
     */
    showFindDialog(windowId) {
        const searchTerm = prompt('Find:', '');
        if (searchTerm) {
            const windowEl = document.getElementById(windowId);
            const textarea = windowEl.querySelector('.notepad-textarea');
            const text = textarea.value;
            const index = text.indexOf(searchTerm);
            
            if (index !== -1) {
                textarea.setSelectionRange(index, index + searchTerm.length);
                textarea.focus();
                this.updateStatus(windowId, `Found: "${searchTerm}"`);
            } else {
                alert(`Cannot find "${searchTerm}"`);
            }
        }
    }

    /**
     * Toggle word wrap
     */
    toggleWordWrap(windowId) {
        const windowEl = document.getElementById(windowId);
        const textarea = windowEl.querySelector('.notepad-textarea');
        
        if (textarea.style.whiteSpace === 'nowrap') {
            textarea.style.whiteSpace = 'pre-wrap';
            textarea.style.overflowX = 'auto';
        } else {
            textarea.style.whiteSpace = 'nowrap';
            textarea.style.overflowX = 'scroll';
        }
    }

    /**
     * Show about dialog
     */
    showAbout() {
        alert('Notepad for Retro Web OS\nVersion 1.0\n\n© 2026 Nohan Baloch');
    }

    /**
     * Update window title
     */
    updateTitle(windowId) {
        const windowEl = document.getElementById(windowId);
        const titleBar = windowEl.querySelector('.window-titlebar span');
        
        let title = this.currentFile ? this.currentFile.split('\\').pop() : 'Untitled';
        if (this.isModified) {
            title = '*' + title;
        }
        title += ' - Notepad';
        
        if (titleBar) {
            titleBar.textContent = title;
        }
    }

    /**
     * Update cursor position in status bar
     */
    updateCursorPosition(windowId) {
        const windowEl = document.getElementById(windowId);
        const textarea = windowEl.querySelector('.notepad-textarea');
        const statusRight = windowEl.querySelector('.status-right');
        
        const text = textarea.value.substring(0, textarea.selectionStart);
        const lines = text.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        
        if (statusRight) {
            statusRight.textContent = `Ln ${line}, Col ${col}`;
        }
    }

    /**
     * Update status bar
     */
    updateStatus(windowId, message) {
        const windowEl = document.getElementById(windowId);
        const statusLeft = windowEl.querySelector('.status-left');
        
        if (statusLeft) {
            statusLeft.textContent = message;
        }
    }

    // ==================== AUTOSAVE ====================

    /**
     * Start autosave interval
     */
    startAutosave(windowId) {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }

        this.autosaveInterval = setInterval(() => {
            if (this.autosaveEnabled && this.isModified && this.currentFile) {
                this.autoSaveFile(windowId);
            }
        }, this.AUTOSAVE_DELAY);
    }

    /**
     * Stop autosave interval
     */
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }
    }

    /**
     * Perform autosave
     */
    async autoSaveFile(windowId) {
        if (!this.vfs || !this.currentFile) return;

        try {
            const windowEl = document.getElementById(windowId);
            if (!windowEl) {
                this.stopAutosave();
                return;
            }

            const textarea = windowEl.querySelector('.notepad-textarea');
            await this.vfs.writeFile(this.currentFile, textarea.value);
            
            this.isModified = false;
            this.updateTitle(windowId);
            this.updateStatus(windowId, `Autosaved: ${new Date().toLocaleTimeString()}`);
            console.log('[Notepad] Autosaved:', this.currentFile);
        } catch (err) {
            console.error('[Notepad] Autosave failed:', err);
        }
    }

    /**
     * Toggle autosave
     */
    toggleAutosave() {
        this.autosaveEnabled = !this.autosaveEnabled;
        return this.autosaveEnabled ? 'Autosave enabled' : 'Autosave disabled';
    }
}

// Create global instance
const notepad = new Notepad();

// Export
export { Notepad, notepad };
