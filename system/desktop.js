/**
 * Desktop Manager
 * Manages desktop icons, background, and context menus
 */

class Desktop {
    constructor() {
        this.container = document.getElementById('desktop');
        this.icons = [];
        this.gridSize = 80;
        this.iconPositions = new Map();
        this.selectedIcons = new Set();
        this.initialize();
    }

    /**
     * Initialize desktop
     */
    initialize() {
        if (!this.container) {
            console.error('[DESKTOP] Container not found');
            return;
        }

        this.setupDesktop();
        this.attachEventListeners();

        // Register with kernel
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.desktop = this;
            console.log('[DESKTOP] Initialized');

            // Listen for VFS initialization to load icons
            window.RetroWeb.kernel.on('fs:initialized', () => this.refresh());
            // Also refresh if files change
            window.RetroWeb.kernel.on('fs:file:created', () => this.refresh());
            window.RetroWeb.kernel.on('fs:file:deleted', () => this.refresh());
        }
        
        // Initial load if VFS already ready
        if (window.RetroWeb?.vfs?.initialized) {
            this.refresh();
        }
    }

    /**
     * Setup desktop styling
     */
    setupDesktop() {
        // Styling is mostly CSS now, but ensuring container is ready
        this.container.innerHTML = '';
        
        // Close context menu on click anywhere
        document.addEventListener('click', (e) => {
            const menu = document.querySelector('.context-menu');
            if (menu && !menu.contains(e.target)) {
                menu.remove();
            }
        });
    }

    /**
     * Refresh desktop icons
     */
    async refresh() {
        // Clear existing icons
        this.container.innerHTML = '';
        this.icons = [];
        this.iconPositions.clear();
        this.selectedIcons.clear();

        // 1. Add System Icons
        this.addSystemIcons();

        // 2. Add User Files from VFS
        if (window.RetroWeb?.vfs) {
            try {
                const desktopPath = 'C:\\Documents and Settings\\User\\Desktop';
                const files = await window.RetroWeb.vfs.listDirectory(desktopPath);
                
                files.forEach((file, index) => {
                    // Calculate position (start after system icons)
                    // System icons take x=0 column usually
                    // Let's simple grid fill: x=0, y=0..N. Then x=1..
                    
                    // Simple distinct positioning:
                    // We need a smart placer.
                    const pos = this.findNextPosition();
                    
                    this.addIcon({
                        name: file.name,
                        icon: this.getFileIcon(file.name),
                        x: pos.x,
                        y: pos.y,
                        action: 'file',
                        path: file.path,
                        type: file.type
                    });
                });
            } catch (e) {
                console.warn('[DESKTOP] Failed to load desktop files:', e);
            }
        }
    }

    /**
     * Find next available grid position
     */
    findNextPosition() {
        let x = 0;
        let y = 0;
        const maxY = Math.floor(this.container.clientHeight / this.gridSize);

        while (this.iconPositions.has(`${x},${y}`)) {
            y++;
            if (y >= maxY) {
                y = 0;
                x++;
            }
        }
        return { x, y };
    }

    /**
     * Add System Icons
     */
    addSystemIcons() {
        const defaultIcons = [
            { name: 'My Computer', icon: '💻', action: 'mycomputer' },
            { name: 'My Documents', icon: '📁', action: 'mydocuments' },
            { name: 'Recycle Bin', icon: '🗑️', action: 'recyclebin' }
        ];

        defaultIcons.forEach(iconData => {
            const pos = this.findNextPosition();
            this.addIcon({ ...iconData, x: pos.x, y: pos.y });
        });
    }

    /**
     * Add icon to desktop
     */
    addIcon(iconData) {
        const { name, icon, x, y, action, path, type } = iconData;

        const iconElement = document.createElement('div');
        iconElement.className = 'desktop-icon';
        iconElement.dataset.action = action;
        if (path) iconElement.dataset.path = path;
        
        const posX = x * this.gridSize + 10;
        const posY = y * this.gridSize + 10;

        iconElement.style.cssText = `
            position: absolute;
            left: ${posX}px;
            top: ${posY}px;
            width: ${this.gridSize - 10}px;
            height: ${this.gridSize}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
        `;

        // Icon image
        const iconImg = document.createElement('div');
        iconImg.textContent = icon;
        iconImg.style.cssText = `
            font-size: 32px;
            margin-bottom: 4px;
        `;

        // Icon label
        const iconLabel = document.createElement('div');
        iconLabel.textContent = name;
        iconLabel.style.cssText = `
            font-size: 11px;
            color: white;
            text-align: center;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            word-wrap: break-word;
            max-width: 100%;
        `;

        iconElement.appendChild(iconImg);
        iconElement.appendChild(iconLabel);

        // Hover effect
        iconElement.addEventListener('mouseenter', () => {
            if (!iconElement.classList.contains('selected')) {
                iconElement.style.background = 'rgba(255,255,255,0.2)';
            }
        });
        iconElement.addEventListener('mouseleave', () => {
            if (!iconElement.classList.contains('selected')) {
                iconElement.style.background = 'transparent';
            }
        });

        // Double-click to open
        iconElement.addEventListener('dblclick', () => {
            this.handleIconAction(action, name, icon, path, type);
        });

        // Single click to select
        iconElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectIcon(iconElement, e.ctrlKey || e.metaKey);
        });

        // Context Menu
        iconElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.selectIcon(iconElement, false); // Select on right click
            this.showIconContextMenu(e.clientX, e.clientY, iconData);
        });

        this.container.appendChild(iconElement);
        this.icons.push({
            element: iconElement,
            name,
            path,
            type
        });

        this.iconPositions.set(`${x},${y}`, iconElement);
    }

    /**
     * Get icon based on filename
     */
    getFileIcon(filename) {
        if (filename.endsWith('.txt')) return '📄';
        if (filename.endsWith('.js')) return '📜';
        if (filename.endsWith('.css')) return '🎨';
        if (filename.endsWith('.md')) return '📝';
        if (filename.indexOf('.') === -1) return '📁'; // folder
        return '📄';
    }

    /**
     * Select an icon
     */
    selectIcon(iconElement, multiSelect) {
        if (!multiSelect) {
            // Deselect all others
            this.icons.forEach(icon => {
                icon.element.classList.remove('selected');
                icon.element.style.background = 'transparent';
                icon.element.style.border = 'none';
            });
            this.selectedIcons.clear();
        }

        // Toggle if multi, otherwise set
        if (multiSelect && iconElement.classList.contains('selected')) {
            iconElement.classList.remove('selected');
            iconElement.style.background = 'transparent';
            iconElement.style.border = 'none';
            this.selectedIcons.delete(iconElement);
        } else {
            iconElement.classList.add('selected');
            iconElement.style.background = 'rgba(49,106,197,0.5)';
            iconElement.style.border = '1px dotted white';
            this.selectedIcons.add(iconElement);
        }
    }

    /**
     * Handle icon action
     */
    handleIconAction(action, name, icon, path, type) {
        console.log(`[DESKTOP] Opening: ${name}`);

        switch (action) {
            case 'mycomputer':
                this.openExplorer('C:\\', 'My Computer');
                break;
            case 'mydocuments':
                this.openExplorer('C:\\Documents and Settings\\User\\My Documents', 'My Documents');
                break;
            case 'recyclebin':
                this.openExplorer('C:\\Recycle Bin', 'Recycle Bin');
                break;
            case 'file':
                if (type === 'directory') {
                    this.openExplorer(path, name);
                } else {
                    // Open file (assumes Notepad for now for text)
                    if (window.RetroWeb?.notepad) {
                        window.RetroWeb.notepad.openFile(path);
                    }
                }
                break;
        }
    }

    /**
     * Open File Explorer with path
     */
    async openExplorer(path, title) {
        if (window.RetroWeb?.explorer) {
            await window.RetroWeb.explorer.open(path, title);
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Desktop context menu
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showDesktopContextMenu(e.clientX, e.clientY);
        });
        
        // Remove context menu on click
        document.addEventListener('click', () => {
             const menu = document.querySelector('.context-menu');
             if(menu) menu.remove();
        });
    }

    /**
     * Show Desktop Context Menu
     */
    showDesktopContextMenu(x, y) {
        const items = [
            { label: 'Refresh', action: () => this.refresh() },
            { separator: true },
            { label: 'New Folder', action: () => this.createNewItem('folder') },
            { label: 'New Text Document', action: () => this.createNewItem('file') },
            { separator: true },
            { label: 'Properties', action: () => this.showProperties() }
        ];
        this.renderContextMenu(x, y, items);
    }

    /**
     * Show Icon Context Menu
     */
    showIconContextMenu(x, y, iconData) {
        const items = [
            { label: 'Open', action: () => this.handleIconAction(iconData.action, iconData.name, iconData.icon, iconData.path, iconData.type) },
            { separator: true },
            { label: 'Delete', action: () => this.deleteItem(iconData) },
            { label: 'Rename', action: () => this.renameItem(iconData) },
            { separator: true },
            { label: 'Properties', action: () => alert(`Properties: ${iconData.name}`) }
        ];

        // Filter for system icons (cannot delete My Computer easily here without hiding)
        if (!iconData.path) {
            // System icon
            // items.splice(2, 2); // remove Delete/Rename
        }

        this.renderContextMenu(x, y, items);
    }

    /**
     * Render Context Menu DOM
     */
    renderContextMenu(x, y, items) {
        // Remove existing
        const existing = document.querySelector('.context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        items.forEach(item => {
            if (item.separator) {
                const sep = document.createElement('div');
                sep.className = 'context-menu-separator';
                menu.appendChild(sep);
            } else {
                const el = document.createElement('div');
                el.className = 'context-menu-item';
                el.textContent = item.label;
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menu.remove();
                    if (item.action) item.action();
                });
                menu.appendChild(el);
            }
        });

        document.body.appendChild(menu);
    }

    /**
     * Create New Item
     */
    async createNewItem(type) {
        const desktopPath = 'C:\\Documents and Settings\\User\\Desktop';
        const vfs = window.RetroWeb.vfs;
        if (!vfs) return;

        if (type === 'folder') {
            const name = prompt('Folder Name:', 'New Folder');
            if (name) {
                await vfs.createDirectory(`${desktopPath}\\${name}`);
            }
        } else if (type === 'file') {
            const name = prompt('File Name:', 'New Text Document.txt');
            if (name) {
                await vfs.createFile(`${desktopPath}\\${name}`, '');
            }
        }
    }

    /**
     * Delete Item
     */
    async deleteItem(iconData) {
        if (!iconData.path) {
            alert('Cannot delete system icon.');
            return;
        }

        if (confirm(`Are you sure you want to delete ${iconData.name}?`)) {
            await window.RetroWeb.vfs.deleteFile(iconData.path).catch(async () => {
                 await window.RetroWeb.vfs.deleteDirectory(iconData.path);
            });
        }
    }

    /**
     * Rename Item
     */
    async renameItem(iconData) {
        if (!iconData.path) return;
        
        const newName = prompt('Rename to:', iconData.name);
        if (newName && newName !== iconData.name) {
             const parent = iconData.path.substring(0, iconData.path.lastIndexOf('\\'));
             await window.RetroWeb.vfs.rename(iconData.path, `${parent}\\${newName}`);
        }
    }

    /**
     * Show Properties
     */
    showProperties() {
        if (window.RetroWeb?.controlPanel) {
            window.RetroWeb.controlPanel.open();
        }
    }
}

// Auto-initialize
const desktop = new Desktop();

export { Desktop };
