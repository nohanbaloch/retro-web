/**
 * File Explorer
 * Windows XP-style file explorer with navigation
 */

class FileExplorer {
    constructor(windowManager, vfs) {
        this.windowManager = windowManager;
        this.vfs = vfs;
        this.windows = new Map(); // windowId -> explorer state
    }

    /**
     * Open a new explorer window
     */
    async open(initialPath = 'C:\\', title = 'My Computer') {
        // Create window first to get ID
        const win = this.windowManager.createWindow({
            title: title,
            width: 700,
            height: 500,
            x: 100 + Math.random() * 100,
            y: 80 + Math.random() * 80,
            content: '<div style="color: #888; padding: 20px;">Loading...</div>'
        });

        const state = {
            currentPath: initialPath,
            history: [initialPath],
            historyIndex: 0,
            windowId: win.id
        };

        this.windows.set(win.id, state);

        // Now update the window content with the proper explorer HTML
        const contentArea = win.element.querySelector('.window-content');
        if (contentArea) {
            contentArea.innerHTML = this.createExplorerHTML(state);
            contentArea.style.padding = '0'; // Remove default padding
        }

        // Set up context menu
        this.setupContextMenu(win.id);

        // Load initial content
        await this.loadTreeView(win.id);
        await this.navigateTo(win.id, initialPath, false);
        
        // Setup Drag & Drop
        this.setupDragAndDrop(win.id);

        return win;
    }

    /**
     * Create the explorer HTML structure
     */
    createExplorerHTML(state) {
        return `
            <div class="explorer-container" data-window-id="${state.windowId}" style="display: flex; flex-direction: column; height: 100%; background: white; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <!-- Toolbar -->
                <div class="explorer-toolbar" style="display: flex; align-items: center; padding: 4px 8px; background: linear-gradient(to bottom, #FAFAFA 0%, #E8E8E8 100%); border-bottom: 1px solid #ccc;">
                    <button onclick="window.RetroWeb.explorer.goBack('${state.windowId}')" style="padding: 4px 8px; margin-right: 2px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="Back">◀</button>
                    <button onclick="window.RetroWeb.explorer.goForward('${state.windowId}')" style="padding: 4px 8px; margin-right: 2px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="Forward">▶</button>
                    <button onclick="window.RetroWeb.explorer.goUp('${state.windowId}')" style="padding: 4px 8px; margin-right: 8px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="Up">⬆</button>
                    <div style="width: 1px; height: 20px; background: #ccc; margin: 0 8px;"></div>
                    <button onclick="window.RetroWeb.explorer.newFolder('${state.windowId}')" style="padding: 4px 8px; margin-right: 2px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="New Folder">📁+</button>
                    <button onclick="window.RetroWeb.explorer.deleteSelected('${state.windowId}')" style="padding: 4px 8px; margin-right: 2px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="Delete">🗑️</button>
                    <button onclick="window.RetroWeb.explorer.renameSelected('${state.windowId}')" style="padding: 4px 8px; margin-right: 8px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="Rename">✏️</button>
                    <div style="width: 1px; height: 20px; background: #ccc; margin: 0 8px;"></div>
                    <button onclick="window.RetroWeb.explorer.setViewMode('${state.windowId}', 'icons')" style="padding: 4px 8px; margin-right: 2px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="Icons View">🔲</button>
                    <button onclick="window.RetroWeb.explorer.setViewMode('${state.windowId}', 'list')" style="padding: 4px 8px; margin-right: 2px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="List View">📋</button>
                    <button onclick="window.RetroWeb.explorer.setViewMode('${state.windowId}', 'details')" style="padding: 4px 8px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="Details View">📊</button>
                    <div style="flex: 1;"></div>
                    <button onclick="window.RetroWeb.explorer.refresh('${state.windowId}')" style="padding: 4px 8px; cursor: pointer; border: 1px solid #aaa; border-radius: 3px; background: linear-gradient(to bottom, #fff 0%, #e0e0e0 100%);" title="Refresh">🔄</button>
                </div>
                <!-- Address Bar -->
                <div class="explorer-addressbar" style="display: flex; align-items: center; padding: 4px 8px; background: #f5f5f5; border-bottom: 1px solid #ddd;">
                    <span style="margin-right: 8px; font-size: 12px; color: #666;">Address:</span>
                    <div id="addressbar-${state.windowId}" style="flex: 1; display: flex; align-items: center; background: white; border: 1px solid #7A96DF; padding: 3px 8px; font-size: 12px;">
                        <span style="margin-right: 6px;">📁</span>
                        <span class="address-path">${state.currentPath}</span>
                    </div>
                </div>
                <!-- Main Body (Tree + Content) -->
                <div class="explorer-body" style="display: flex; flex: 1; overflow: hidden;">
                    <!-- Tree View -->
                    <div id="explorer-tree-${state.windowId}" class="explorer-tree" style="width: 200px; border-right: 1px solid #ccc; overflow: auto; background: white; padding: 5px; font-size: 12px;">
                        <div style="color: #888;">Loading tree...</div>
                    </div>
                    
                    <!-- Content Area -->
                    <div id="explorer-content-${state.windowId}" class="explorer-content" data-view-mode="icons" style="flex: 1; overflow: auto; padding: 10px; background: white;">
                        <div style="color: #888;">Loading...</div>
                    </div>
                </div>
                <!-- Status Bar -->
                <div id="explorer-status-${state.windowId}" class="explorer-status" style="padding: 4px 8px; background: #f0f0f0; border-top: 1px solid #ccc; font-size: 11px; color: #666;">
                    Ready
                </div>
            </div>
            <!-- Context Menu (hidden by default) -->
            <div id="context-menu-${state.windowId}" class="explorer-context-menu" style="display: none; position: fixed; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); z-index: 10000; min-width: 150px; font-size: 12px;">
                <div class="ctx-item" data-action="open" style="padding: 6px 20px; cursor: pointer;">Open</div>
                <div style="height: 1px; background: #ddd; margin: 2px 0;"></div>
                <div class="ctx-item" data-action="cut" style="padding: 6px 20px; cursor: pointer;">Cut</div>
                <div class="ctx-item" data-action="copy" style="padding: 6px 20px; cursor: pointer;">Copy</div>
                <div class="ctx-item" data-action="paste" style="padding: 6px 20px; cursor: pointer;">Paste</div>
                <div style="height: 1px; background: #ddd; margin: 2px 0;"></div>
                <div class="ctx-item" data-action="delete" style="padding: 6px 20px; cursor: pointer;">Delete</div>
                <div class="ctx-item" data-action="rename" style="padding: 6px 20px; cursor: pointer;">Rename</div>
                <div style="height: 1px; background: #ddd; margin: 2px 0;"></div>
                <div class="ctx-item" data-action="newfolder" style="padding: 6px 20px; cursor: pointer;">New Folder</div>
                <div class="ctx-item" data-action="properties" style="padding: 6px 20px; cursor: pointer;">Properties</div>
            </div>
        `;
    }

    /**
     * Navigate to a path
     */
    async navigateTo(windowId, path, addToHistory = true) {
        const state = this.windows.get(windowId);
        if (!state) return;

        try {
            const entries = await this.vfs.listDirectory(path);
            
            // Update state
            state.currentPath = path;
            
            if (addToHistory) {
                // Remove forward history
                state.history = state.history.slice(0, state.historyIndex + 1);
                state.history.push(path);
                state.historyIndex = state.history.length - 1;
            }

            // Update address bar
            this.updateAddressBar(windowId, path);
            
            // Update content
            this.updateContent(windowId, entries);
            
            // Update status bar
            this.updateStatusBar(windowId, entries);
            
            // Update window title
            const pathParts = path.split('\\').filter(p => p);
            const title = pathParts.length > 0 ? pathParts[pathParts.length - 1] || 'Local Disk (C:)' : 'My Computer';
            this.updateWindowTitle(windowId, title);
            this.updateTreeSelection(windowId, path);

        } catch (err) {
            console.error('[Explorer] Navigation failed:', err);
            this.showError(windowId, `Cannot access ${path}`);
        }
    }

    /**
     * Update address bar
     */
    updateAddressBar(windowId, path) {
        const addressBar = document.getElementById(`addressbar-${windowId}`);
        if (addressBar) {
            const pathSpan = addressBar.querySelector('.address-path');
            if (pathSpan) {
                pathSpan.textContent = path;
            }
        }
    }

    /**
     * Update content area
     */
    updateContent(windowId, entries) {
        const state = this.windows.get(windowId);
        const viewMode = state?.viewMode || 'icons';
        const contentEl = document.getElementById(`explorer-content-${windowId}`);
        if (!contentEl) return;

        if (entries.length === 0) {
            contentEl.innerHTML = '<div style="color: #888; padding: 20px;">This folder is empty.</div>';
            return;
        }

        // Sort: folders first, then files
        const sorted = entries.sort((a, b) => {
            if (a.type === 'directory' && b.type !== 'directory') return -1;
            if (a.type !== 'directory' && b.type === 'directory') return 1;
            return a.name.localeCompare(b.name);
        });

        // Render based on view mode
        if (viewMode === 'list') {
            this.renderListView(windowId, sorted, contentEl);
        } else if (viewMode === 'details') {
            this.renderDetailsView(windowId, sorted, contentEl);
        } else {
            // Default: Icons view
            const html = sorted.map(entry => {
                const icon = entry.type === 'directory' ? '📁' : this.getFileIcon(entry.name);
                const isFolder = entry.type === 'directory';
                
                return `
                    <div class="explorer-item" 
                         draggable="true"
                         ondragstart="window.RetroWeb.explorer.handleDragStart(event, '${entry.name}', '${entry.type}', '${windowId}')"
                         ondragover="window.RetroWeb.explorer.handleDragOver(event)"
                         ondrop="if('${entry.type}' === 'directory') window.RetroWeb.explorer.handleDrop(event, '${windowId}', '${state.currentPath}${entry.name}\\\\')"
                         data-name="${entry.name}"
                         data-type="${entry.type}"
                         ondblclick="window.RetroWeb.explorer.handleItemDblClick('${windowId}', '${entry.name}', '${entry.type}')"
                         onclick="window.RetroWeb.explorer.selectItem('${windowId}', '${entry.name}', '${entry.type}')"
                         oncontextmenu="window.RetroWeb.explorer.showContextMenu(event, '${windowId}', '${entry.name}', '${entry.type}')"
                         style="display: inline-block; vertical-align: top; width: 80px; height: 80px; margin: 5px; padding: 5px; text-align: center; cursor: pointer; border-radius: 3px;"
                         onmouseover="if(!this.style.background || this.style.background === 'transparent') this.style.background='#E8F4FC'" 
                         onmouseout="if(this.style.background !== 'rgb(204, 232, 255)') this.style.background='transparent'">
                        <div style="font-size: 36px; line-height: 1;">${icon}</div>
                        <div style="font-size: 11px; margin-top: 4px; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis; max-height: 28px; line-height: 14px;">${entry.name}</div>
                    </div>
                `;
            }).join('');

            contentEl.innerHTML = html;
        }
    }

    /**
     * Update status bar
     */
    updateStatusBar(windowId, entries) {
        const statusEl = document.getElementById(`explorer-status-${windowId}`);
        if (statusEl) {
            const folders = entries.filter(e => e.type === 'directory').length;
            const files = entries.filter(e => e.type === 'file').length;
            statusEl.textContent = `${entries.length} object(s)` + 
                (folders > 0 ? ` (${folders} folder${folders > 1 ? 's' : ''})` : '') +
                (files > 0 ? ` (${files} file${files > 1 ? 's' : ''})` : '');
        }
    }

    /**
     * Update window title
     */
    updateWindowTitle(windowId, title) {
        // Find window element by ID directly
        const windowEl = document.getElementById(windowId);
        if (windowEl) {
            const titleBar = windowEl.querySelector('.window-titlebar');
            if (titleBar) {
                // The title is in a span, which is the first child
                const titleSpan = titleBar.querySelector('span');
                if (titleSpan) {
                    titleSpan.textContent = title;
                }
            }
        }
        
        // Also update in window manager
        if (this.windowManager.windows) {
            const win = this.windowManager.windows.find(w => w.id === windowId);
            if (win) {
                win.title = title;
            }
        }
    }

    /**
     * Go back in history
     */
    goBack(windowId) {
        const state = this.windows.get(windowId);
        if (!state || state.historyIndex <= 0) return;
        
        state.historyIndex--;
        this.navigateTo(windowId, state.history[state.historyIndex], false);
    }

    /**
     * Go forward in history
     */
    goForward(windowId) {
        const state = this.windows.get(windowId);
        if (!state || state.historyIndex >= state.history.length - 1) return;
        
        state.historyIndex++;
        this.navigateTo(windowId, state.history[state.historyIndex], false);
    }

    /**
     * Go up one directory
     */
    async goUp(windowId) {
        const state = this.windows.get(windowId);
        if (!state) return;

        const currentPath = state.currentPath;
        
        // Don't go up from root
        if (currentPath === 'C:\\' || currentPath === 'C:') return;
        
        // Get parent path
        const parts = currentPath.split('\\').filter(p => p);
        parts.pop();
        const parentPath = parts.length === 1 ? parts[0] + '\\' : parts.join('\\');
        
        await this.navigateTo(windowId, parentPath);
    }

    /**
     * Refresh current folder
     */
    async refresh(windowId) {
        const state = this.windows.get(windowId);
        if (!state) return;
        
        await this.navigateTo(windowId, state.currentPath, false);
    }

    /**
     * Open a file
     */
    async openFile(windowId, path) {
        try {
            const content = await this.vfs.readFile(path);
            const name = path.split('\\').pop();
            
            // Create a new window for the file
            this.windowManager.createWindow({
                title: name,
                width: 600,
                height: 450,
                x: 200 + Math.random() * 50,
                y: 150 + Math.random() * 50,
                content: `
                    <div style="padding: 0; background: white; height: 100%; display: flex; flex-direction: column;">
                        <div style="display: flex; align-items: center; padding: 8px; background: #f0f0f0; border-bottom: 1px solid #ccc;">
                            <span style="font-size: 16px; margin-right: 8px;">📄</span>
                            <span style="font-size: 12px; font-weight: bold;">${name}</span>
                        </div>
                        <textarea style="flex: 1; width: 100%; font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; border: none; resize: none; outline: none;" readonly>${this.escapeHTML(content)}</textarea>
                    </div>
                `
            });
        } catch (err) {
            console.error('[Explorer] Failed to open file:', err);
        }
    }

    /**
     * Show error message
     */
    showError(windowId, message) {
        const contentEl = document.getElementById(`explorer-content-${windowId}`);
        if (contentEl) {
            contentEl.innerHTML = `<div style="color: #c00; padding: 20px;">❌ ${message}</div>`;
        }
    }

    /**
     * Get file icon based on extension
     */
    getFileIcon(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const iconMap = {
            'txt': '📄', 'log': '📄', 'md': '📝',
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'bmp': '🖼️',
            'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵',
            'mp4': '🎬', 'avi': '🎬', 'mkv': '🎬',
            'zip': '📦', 'rar': '📦', '7z': '📦',
            'exe': '⚙️', 'ini': '⚙️', 'dll': '⚙️',
            'pdf': '📕', 'doc': '📘', 'docx': '📘',
            'xls': '📊', 'xlsx': '📊',
            'html': '🌐', 'css': '🎨', 'js': '📜'
        };
        return iconMap[ext] || '📄';
    }

    /**
     * Escape HTML
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==================== FILE OPERATIONS ====================

    /**
     * Create new folder
     */
    async newFolder(windowId) {
        const state = this.windows.get(windowId);
        if (!state) return;

        const name = prompt('Enter folder name:', 'New Folder');
        if (!name) return;

        try {
            const path = state.currentPath + name;
            await this.vfs.createDirectory(path);
            await this.refresh(windowId);
            this.updateStatusMessage(windowId, `Created folder: ${name}`);
        } catch (err) {
            alert(`Failed to create folder: ${err.message}`);
        }
    }

    /**
     * Delete selected item
     */
    async deleteSelected(windowId) {
        const state = this.windows.get(windowId);
        if (!state || !state.selectedItem) {
            alert('Please select an item to delete.');
            return;
        }

        const item = state.selectedItem;
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        try {
            const path = state.currentPath + item.name;
            if (item.type === 'directory') {
                await this.vfs.deleteDirectory(path);
            } else {
                await this.vfs.deleteFile(path);
            }
            state.selectedItem = null;
            await this.refresh(windowId);
            this.updateStatusMessage(windowId, `Deleted: ${item.name}`);
        } catch (err) {
            alert(`Failed to delete: ${err.message}`);
        }
    }

    /**
     * Rename selected item
     */
    async renameSelected(windowId) {
        const state = this.windows.get(windowId);
        if (!state || !state.selectedItem) {
            alert('Please select an item to rename.');
            return;
        }

        const item = state.selectedItem;
        const newName = prompt('Enter new name:', item.name);
        if (!newName || newName === item.name) return;

        try {
            const oldPath = state.currentPath + item.name;
            const newPath = state.currentPath + newName;
            await this.vfs.moveFile(oldPath, newPath);
            state.selectedItem = null;
            await this.refresh(windowId);
            this.updateStatusMessage(windowId, `Renamed to: ${newName}`);
        } catch (err) {
            alert(`Failed to rename: ${err.message}`);
        }
    }

    /**
     * Update status bar with custom message
     */
    updateStatusMessage(windowId, message) {
        const statusEl = document.getElementById(`explorer-status-${windowId}`);
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    // ==================== VIEW MODES ====================

    /**
     * Set view mode (icons, list, details)
     */
    setViewMode(windowId, mode) {
        const state = this.windows.get(windowId);
        if (!state) return;

        state.viewMode = mode;
        const contentEl = document.getElementById(`explorer-content-${windowId}`);
        if (contentEl) {
            contentEl.dataset.viewMode = mode;
        }
        this.refresh(windowId);
    }

    /**
     * Render list view
     */
    renderListView(windowId, entries, contentEl) {
        contentEl.innerHTML = entries.map(entry => {
            const icon = entry.type === 'directory' ? '📁' : this.getFileIcon(entry.name);
            return `
                <div class="explorer-item list-item" 
                     draggable="true"
                     ondragstart="window.RetroWeb.explorer.handleDragStart(event, '${entry.name}', '${entry.type}', '${windowId}')"
                     ondragover="window.RetroWeb.explorer.handleDragOver(event)"
                     ondrop="if('${entry.type}' === 'directory') window.RetroWeb.explorer.handleDrop(event, '${windowId}', '${this.windows.get(windowId).currentPath}${entry.name}\\\\')"
                     data-name="${entry.name}" 
                     data-type="${entry.type}"
                     style="display: flex; align-items: center; padding: 4px 8px; cursor: pointer; border-radius: 3px;"
                     ondblclick="window.RetroWeb.explorer.handleItemDblClick('${windowId}', '${entry.name}', '${entry.type}')"
                     onclick="window.RetroWeb.explorer.selectItem('${windowId}', '${entry.name}', '${entry.type}')"
                     oncontextmenu="window.RetroWeb.explorer.showContextMenu(event, '${windowId}', '${entry.name}', '${entry.type}')">
                    <span style="font-size: 14px; margin-right: 8px;">${icon}</span>
                    <span style="font-size: 12px;">${entry.name}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Render details view
     */
    renderDetailsView(windowId, entries, contentEl) {
        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #f0f0f0; border-bottom: 1px solid #ccc;">
                        <th style="text-align: left; padding: 6px 10px;">Name</th>
                        <th style="text-align: left; padding: 6px 10px;">Type</th>
                        <th style="text-align: right; padding: 6px 10px;">Size</th>
                    </tr>
                </thead>
                <tbody>
        `;

        entries.forEach(entry => {
            const icon = entry.type === 'directory' ? '📁' : this.getFileIcon(entry.name);
            const type = entry.type === 'directory' ? 'File Folder' : this.getFileType(entry.name);
            const size = entry.type === 'directory' ? '' : this.formatSize(entry.size || 0);

            html += `
                <tr class="explorer-item details-row" 
                    draggable="true"
                    ondragstart="window.RetroWeb.explorer.handleDragStart(event, '${entry.name}', '${entry.type}', '${windowId}')"
                    ondragover="window.RetroWeb.explorer.handleDragOver(event)"
                    ondrop="if('${entry.type}' === 'directory') window.RetroWeb.explorer.handleDrop(event, '${windowId}', '${this.windows.get(windowId).currentPath}${entry.name}\\\\')"
                    data-name="${entry.name}" 
                    data-type="${entry.type}"
                    style="cursor: pointer;"
                    ondblclick="window.RetroWeb.explorer.handleItemDblClick('${windowId}', '${entry.name}', '${entry.type}')"
                    onclick="window.RetroWeb.explorer.selectItem('${windowId}', '${entry.name}', '${entry.type}')"
                    oncontextmenu="window.RetroWeb.explorer.showContextMenu(event, '${windowId}', '${entry.name}', '${entry.type}')">
                    <td style="padding: 4px 10px;"><span style="margin-right: 6px;">${icon}</span>${entry.name}</td>
                    <td style="padding: 4px 10px;">${type}</td>
                    <td style="padding: 4px 10px; text-align: right;">${size}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        contentEl.innerHTML = html;
    }

    /**
     * Get file type description
     */
    getFileType(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const typeMap = {
            'txt': 'Text Document', 'log': 'Log File', 'md': 'Markdown Document',
            'jpg': 'JPEG Image', 'jpeg': 'JPEG Image', 'png': 'PNG Image', 'gif': 'GIF Image',
            'mp3': 'MP3 Audio', 'wav': 'WAV Audio',
            'mp4': 'MP4 Video', 'avi': 'AVI Video',
            'zip': 'ZIP Archive', 'rar': 'RAR Archive',
            'exe': 'Application', 'dll': 'DLL File',
            'pdf': 'PDF Document', 'doc': 'Word Document', 'docx': 'Word Document',
            'xls': 'Excel Spreadsheet', 'xlsx': 'Excel Spreadsheet',
            'html': 'HTML Document', 'css': 'Stylesheet', 'js': 'JavaScript File'
        };
        return typeMap[ext] || `${ext?.toUpperCase() || ''} File`;
    }

    /**
     * Format file size
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // ==================== SELECTION & CONTEXT MENU ====================

    /**
     * Select an item
     */
    selectItem(windowId, name, type) {
        const state = this.windows.get(windowId);
        if (!state) return;

        // Remove previous selection highlight
        const contentEl = document.getElementById(`explorer-content-${windowId}`);
        contentEl?.querySelectorAll('.explorer-item').forEach(item => {
            item.style.background = 'transparent';
        });

        // Highlight selected item
        const selectedEl = contentEl?.querySelector(`[data-name="${name}"]`);
        if (selectedEl) {
            selectedEl.style.background = '#CCE8FF';
        }

        state.selectedItem = { name, type };
    }

    /**
     * Setup context menu
     */
    setupContextMenu(windowId) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        // Hide context menu on click elsewhere
        document.addEventListener('click', () => {
            this.hideContextMenu(windowId);
        });

        // Setup context menu item handlers
        setTimeout(() => {
            const contextMenu = document.getElementById(`context-menu-${windowId}`);
            if (!contextMenu) return;

            contextMenu.querySelectorAll('.ctx-item').forEach(item => {
                item.addEventListener('mouseenter', () => {
                    item.style.background = '#0078D7';
                    item.style.color = 'white';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'transparent';
                    item.style.color = 'black';
                });
                item.addEventListener('click', () => {
                    this.handleContextMenuAction(windowId, item.dataset.action);
                });
            });
        }, 100);
    }

    /**
     * Show context menu
     */
    showContextMenu(event, windowId, name, type) {
        event.preventDefault();
        event.stopPropagation();

        // Select the item first
        this.selectItem(windowId, name, type);

        const contextMenu = document.getElementById(`context-menu-${windowId}`);
        if (!contextMenu) return;

        contextMenu.style.display = 'block';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    }

    /**
     * Hide context menu
     */
    hideContextMenu(windowId) {
        const contextMenu = document.getElementById(`context-menu-${windowId}`);
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }

    /**
     * Handle context menu action
     */
    async handleContextMenuAction(windowId, action) {
        const state = this.windows.get(windowId);
        if (!state) return;

        this.hideContextMenu(windowId);

        switch (action) {
            case 'open':
                if (state.selectedItem) {
                    this.handleItemDblClick(windowId, state.selectedItem.name, state.selectedItem.type);
                }
                break;
            case 'cut':
                if (state.selectedItem) {
                    this.clipboard = {
                        action: 'cut',
                        path: state.currentPath + state.selectedItem.name,
                        type: state.selectedItem.type
                    };
                    this.updateStatusMessage(windowId, `Cut: ${state.selectedItem.name}`);
                }
                break;
            case 'copy':
                if (state.selectedItem) {
                    this.clipboard = {
                        action: 'copy',
                        path: state.currentPath + state.selectedItem.name,
                        type: state.selectedItem.type
                    };
                    this.updateStatusMessage(windowId, `Copied: ${state.selectedItem.name}`);
                }
                break;
            case 'paste':
                await this.pasteItem(windowId);
                break;
            case 'delete':
                await this.deleteSelected(windowId);
                break;
            case 'rename':
                await this.renameSelected(windowId);
                break;
            case 'newfolder':
                await this.newFolder(windowId);
                break;
            case 'properties':
                this.showProperties(windowId);
                break;
        }
    }

    /**
     * Paste item from clipboard
     */
    async pasteItem(windowId) {
        if (!this.clipboard) {
            alert('Nothing to paste.');
            return;
        }

        const state = this.windows.get(windowId);
        if (!state) return;

        try {
            const sourceName = this.clipboard.path.split('\\').pop();
            const destPath = state.currentPath + sourceName;

            if (this.clipboard.action === 'copy') {
                await this.vfs.copyFile(this.clipboard.path, destPath);
            } else if (this.clipboard.action === 'cut') {
                await this.vfs.moveFile(this.clipboard.path, destPath);
                this.clipboard = null;
            }
            
            await this.refresh(windowId);
            this.updateStatusMessage(windowId, `Pasted: ${sourceName}`);
        } catch (err) {
            alert(`Failed to paste: ${err.message}`);
        }
    }

    /**
     * Show properties dialog
     */
    showProperties(windowId) {
        const state = this.windows.get(windowId);
        if (!state || !state.selectedItem) {
            alert('Please select an item.');
            return;
        }

        const item = state.selectedItem;
        alert(`Properties:\n\nName: ${item.name}\nType: ${item.type === 'directory' ? 'Folder' : 'File'}\nLocation: ${state.currentPath}`);
    }

    /**
     * Handle item double-click (wrapper for navigation)
     */
    handleItemDblClick(windowId, name, type) {
        const state = this.windows.get(windowId);
        if (!state) return;

        if (type === 'directory') {
            const newPath = state.currentPath + name + '\\';
            this.navigateTo(windowId, newPath);
        } else {
            this.openFile(windowId, state.currentPath, name);
        }
    }

    // ==================== TREE VIEW ====================

    /**
     * Load tree view
     */
    async loadTreeView(windowId) {
        const treeEl = document.getElementById(`explorer-tree-${windowId}`);
        if (!treeEl) return;

        // Clear tree
        treeEl.innerHTML = '';

        // Add Root (C:)
        const rootNode = document.createElement('div');
        rootNode.className = 'tree-node';
        rootNode.style.paddingLeft = '0px';
        rootNode.innerHTML = `
            <div class="tree-row" style="display: flex; align-items: center; padding: 2px; cursor: pointer;" 
                 onclick="window.RetroWeb.explorer.navigateTo('${windowId}', 'C:\\\\')"
                 data-path="C:\\">
                <span class="tree-toggle" style="width: 16px; text-align: center; cursor: pointer; margin-right: 4px;" onclick="window.RetroWeb.explorer.toggleNode(event, '${windowId}', 'C:\\\\')">➖</span>
                <span style="margin-right: 4px;">💻</span>
                <span>Local Disk (C:)</span>
            </div>
            <div class="tree-children" id="tree-children-${windowId}-C" style="padding-left: 16px;"></div>
        `;
        treeEl.appendChild(rootNode);

        // Load initial children for C:
        await this.expandNode(windowId, 'C:\\');
    }

    /**
     * Toggle tree node expansion
     */
    async toggleNode(event, windowId, path) {
        if (event) event.stopPropagation();
        
        const childrenContainer = document.getElementById(`tree-children-${windowId}-${path.replace(/\\/g, '')}`);
        const toggleBtn = event.target;

        if (childrenContainer.style.display === 'none') {
            childrenContainer.style.display = 'block';
            toggleBtn.textContent = '➖';
            await this.expandNode(windowId, path);
        } else {
            childrenContainer.style.display = 'none';
            toggleBtn.textContent = '➕';
        }
    }

    /**
     * Expand tree node
     */
    async expandNode(windowId, path) {
        const childrenContainer = document.getElementById(`tree-children-${windowId}-${path.replace(/\\/g, '')}`);
        if (!childrenContainer) return;

        // If already loaded, just return (unless we want to refresh)
        if (childrenContainer.hasChildNodes()) return;

        try {
            const entries = await this.vfs.listDirectory(path);
            const folders = entries.filter(e => e.type === 'directory').sort((a, b) => a.name.localeCompare(b.name));

            if (folders.length === 0) {
                // No children
                const row = childrenContainer.parentElement.querySelector('.tree-row');
                const toggle = row.querySelector('.tree-toggle');
                toggle.style.opacity = '0'; // Hide toggle but keep spacing
                return;
            }

            folderLoop: for (const folder of folders) {
                const folderPath = path + folder.name + '\\';
                const safeId = folderPath.replace(/\\/g, '');
                
                const node = document.createElement('div');
                node.className = 'tree-node';
                node.innerHTML = `
                    <div class="tree-row" style="display: flex; align-items: center; padding: 2px; cursor: pointer;" 
                         onclick="window.RetroWeb.explorer.navigateTo('${windowId}', '${folderPath.replace(/\\/g, '\\\\')}')"
                         data-path="${folderPath}">
                        <span class="tree-toggle" style="width: 16px; text-align: center; cursor: pointer; margin-right: 4px;" onclick="window.RetroWeb.explorer.toggleNode(event, '${windowId}', '${folderPath.replace(/\\/g, '\\\\')}')">➕</span>
                        <span style="margin-right: 4px;">📁</span>
                        <span>${folder.name}</span>
                    </div>
                    <div class="tree-children" id="tree-children-${windowId}-${safeId}" style="display: none; padding-left: 16px;"></div>
                `;
                
                // DnD for tree nodes
                const row = node.querySelector('.tree-row');
                row.addEventListener('dragover', (e) => this.handleDragOver(e));
                row.addEventListener('drop', (e) => this.handleDrop(e, windowId, folderPath));

                childrenContainer.appendChild(node);
            }
        } catch (err) {
            console.error('Failed to expand node:', err);
        }
    }

    /**
     * Update tree selection
     */
    updateTreeSelection(windowId, path) {
        const treeEl = document.getElementById(`explorer-tree-${windowId}`);
        if (!treeEl) return;

        // Remove old selection
        const oldSelected = treeEl.querySelector('.tree-selected');
        if (oldSelected) {
            oldSelected.style.background = 'transparent';
            oldSelected.style.color = 'black';
            oldSelected.classList.remove('tree-selected');
        }

        // Find new selection
        // We might need to ensure the path to this node is expanded. 
        // For simple implementation, we assume basic interaction.
        const rows = treeEl.querySelectorAll('.tree-row');
        for (const row of rows) {
            if (row.dataset.path === path) {
                row.style.background = '#316AC5';
                row.style.color = 'white';
                row.classList.add('tree-selected');
                break;
            }
        }
    }

    // ==================== DRAG & DROP ====================

    /**
     * Setup drag and drop for a window
     */
    setupDragAndDrop(windowId) {
        const contentEl = document.getElementById(`explorer-content-${windowId}`);
        if (!contentEl) return;

        // Container drop zone (dropping into current folder's whitespace)
        contentEl.addEventListener('dragover', (e) => this.handleDragOver(e));
        contentEl.addEventListener('drop', (e) => {
             // If dropping on whitespace, dropping into current folder? 
             // Usually drag and drop moves TO a folder. 
             // If dropping into empty space of current folder, it does nothing unless dragging from *another* folder.
             // For now, let's implement dropping ON folders.
             e.preventDefault();
        });
    }

    /**
     * Handle drag start
     */
    handleDragStart(e, name, type, windowId) {
        const state = this.windows.get(windowId);
        if (!state) return;

        const path = state.currentPath + name;
        e.dataTransfer.setData('text/plain', JSON.stringify({
            path: path,
            name: name,
            type: type
        }));
        e.dataTransfer.effectAllowed = 'move';
        
        // Add visual feedback class if needed
    }

    /**
     * Handle drag over
     */
    handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        // Add highlight visual if target is a folder
    }

    /**
     * Handle drop
     */
    async handleDrop(e, windowId, targetPath) {
        e.preventDefault();
        e.stopPropagation();

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const srcPath = data.path;
            const destPath = targetPath + data.name;

            if (srcPath === destPath) return; // Dropped on self/parent?
            if (targetPath.startsWith(srcPath)) return; // Can't move into self

            console.log(`[Explorer] Moving ${srcPath} -> ${destPath}`);

            if (data.type === 'directory' || data.type === 'file') {
                 await this.vfs.moveFile(srcPath, destPath);
            }
            
            // Refresh
            await this.refresh(windowId);
            // Refresh tree if needed (brute force reload for now)
            await this.loadTreeView(windowId);

            this.updateStatusMessage(windowId, `Moved: ${data.name}`);

        } catch (err) {
            console.error('Drop failed:', err);
            // alert('Move failed: ' + err.message);
        }
    }
}

// Export
export { FileExplorer };
