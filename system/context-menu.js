/**
 * Context Menu Service
 * Provides a unified context menu system for the entire OS
 */

export class ContextMenu {
    constructor() {
        this.menus = new Map();
        this.activeMenu = null;
        this.init();
    }

    init() {
        // Global click handler to hide menus
        document.addEventListener('click', () => {
            this.hideAll();
        });

        // Prevent context menu on right-click (we'll handle our own)
        document.addEventListener('contextmenu', (e) => {
            // Prevent default for our custom context menu areas
            if (e.target.closest('#desktop') || e.target.closest('.desktop-icon') ||
                e.target.closest('.start-menu-item') || e.target.closest('.taskbar-btn')) {
                e.preventDefault();
            }
        });

        if (window.RetroWeb) {
            window.RetroWeb.contextMenu = this;
            console.log('[CONTEXT MENU] Service initialized');
        }
    }

    /**
     * Register a context menu for a specific target
     */
    registerMenu(targetId, menuConfig) {
        this.menus.set(targetId, menuConfig);
    }

    /**
     * Show context menu at position
     */
    showMenu(menuConfigOrTargetId, x, y, contextData = {}) {
        console.log('ContextMenu.showMenu called with:', menuConfigOrTargetId, x, y);
        this.hideAll();

        let menuConfig;
        if (typeof menuConfigOrTargetId === 'string') {
            // It's a targetId, look up the registered menu
            menuConfig = this.menus.get(menuConfigOrTargetId);
        } else {
            // It's a menuConfig object directly
            menuConfig = menuConfigOrTargetId;
        }

        if (!menuConfig) {
            console.log('No menu config found');
            return;
        }

        console.log('Creating menu with config:', menuConfig);
        const menu = this.createMenu(menuConfig, contextData);
        menu.id = `context-menu-${typeof menuConfigOrTargetId === 'string' ? menuConfigOrTargetId : 'dynamic'}`;
        menu.className = 'system-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: white;
            border: 1px solid #ccc;
            box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
            z-index: 10000;
            min-width: 180px;
            font-family: Tahoma, sans-serif;
            font-size: 11px;
            padding: 2px 0;
        `;

        document.body.appendChild(menu);
        this.activeMenu = menu;

        // Position menu within viewport
        this.adjustPosition(menu);

        // Setup event handlers
        this.setupMenuHandlers(menu, menuConfig, contextData);
    }

    /**
     * Create menu DOM element
     */
    createMenu(menuConfig, contextData) {
        const menu = document.createElement('div');

        menuConfig.items.forEach(item => {
            if (item.type === 'separator') {
                const separator = document.createElement('div');
                separator.style.cssText = `
                    height: 1px;
                    background: #ddd;
                    margin: 3px 0;
                `;
                menu.appendChild(separator);
            } else if (item.type === 'submenu') {
                const itemEl = this.createMenuItem(item, contextData);
                const submenu = document.createElement('div');
                submenu.className = 'submenu';
                submenu.style.cssText = `
                    display: none;
                    position: absolute;
                    left: 100%;
                    top: -2px;
                    background: white;
                    border: 1px solid #ccc;
                    box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
                    min-width: 180px;
                    z-index: 10001;
                    padding: 2px 0;
                `;

                item.submenu.forEach(subItem => {
                    const subItemEl = this.createMenuItem(subItem, contextData);
                    submenu.appendChild(subItemEl);
                });

                itemEl.appendChild(submenu);
                itemEl.style.position = 'relative';

                // Hover handlers for submenu
                itemEl.addEventListener('mouseenter', () => {
                    submenu.style.display = 'block';
                });
                itemEl.addEventListener('mouseleave', () => {
                    submenu.style.display = 'none';
                });

                menu.appendChild(itemEl);
            } else {
                const itemEl = this.createMenuItem(item, contextData);
                menu.appendChild(itemEl);
            }
        });

        return menu;
    }

    /**
     * Create individual menu item
     */
    createMenuItem(item, contextData) {
        const itemEl = document.createElement('div');
        itemEl.className = 'context-menu-item';
        itemEl.dataset.action = item.action;
        itemEl.style.cssText = `
            padding: 4px 24px 4px 32px;
            cursor: pointer;
            position: relative;
            white-space: nowrap;
        `;

        // Icon
        if (item.icon) {
            const iconEl = document.createElement('span');
            iconEl.textContent = item.icon;
            iconEl.style.cssText = `
                position: absolute;
                left: 6px;
                top: 4px;
                font-size: 12px;
            `;
            itemEl.appendChild(iconEl);
        }

        // Text
        const textEl = document.createElement('span');
        textEl.textContent = item.label;
        itemEl.appendChild(textEl);

        // Arrow for submenu
        if (item.type === 'submenu') {
            const arrowEl = document.createElement('span');
            arrowEl.textContent = '▶';
            arrowEl.style.cssText = `
                position: absolute;
                right: 6px;
                top: 4px;
                font-size: 10px;
            `;
            itemEl.appendChild(arrowEl);
        }

        // Hover effects
        itemEl.addEventListener('mouseenter', () => {
            itemEl.style.background = '#316AC5';
            itemEl.style.color = 'white';
        });
        itemEl.addEventListener('mouseleave', () => {
            itemEl.style.background = 'transparent';
            itemEl.style.color = 'black';
        });

        return itemEl;
    }

    /**
     * Setup menu event handlers
     */
    setupMenuHandlers(menu, menuConfig, contextData) {
        menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                if (menuConfig.onAction) {
                    menuConfig.onAction(action, contextData);
                }
                this.hideAll();
            });
        });
    }

    /**
     * Adjust menu position to stay within viewport
     */
    adjustPosition(menu) {
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (rect.right > viewportWidth) {
            menu.style.left = (viewportWidth - rect.width - 10) + 'px';
        }

        if (rect.bottom > viewportHeight) {
            menu.style.top = (viewportHeight - rect.height - 10) + 'px';
        }
    }

    /**
     * Hide all menus
     */
    hideAll() {
        if (this.activeMenu) {
            this.activeMenu.remove();
            this.activeMenu = null;
        }
    }

    // ==================== PREDEFINED MENUS ====================

    /**
     * Desktop context menu
     */
    getDesktopMenu() {
        return {
            items: [
                { label: 'View', icon: '👁️', type: 'submenu', submenu: [
                    { label: 'Large Icons', action: 'view-large' },
                    { label: 'Medium Icons', action: 'view-medium' },
                    { label: 'Small Icons', action: 'view-small' }
                ]},
                { label: 'Sort By', icon: '🔤', type: 'submenu', submenu: [
                    { label: 'Name', action: 'sort-name' },
                    { label: 'Type', action: 'sort-type' },
                    { label: 'Date Modified', action: 'sort-date' }
                ]},
                { type: 'separator' },
                { label: 'Refresh', icon: '🔄', action: 'refresh' },
                { label: 'New', icon: '📄', type: 'submenu', submenu: [
                    { label: 'Folder', action: 'new-folder' },
                    { label: 'Shortcut', action: 'new-shortcut' },
                    { label: 'Text Document', action: 'new-text' }
                ]},
                { type: 'separator' },
                { label: 'Properties', icon: 'ℹ️', action: 'properties' }
            ],
            onAction: (action, context) => {
                this.handleDesktopAction(action, context);
            }
        };
    }

    /**
     * Start Menu context menu
     */
    getStartMenuItem() {
        return {
            items: [
                { label: 'Open', icon: '📂', action: 'open' },
                { label: 'Run as Administrator', icon: '🛡️', action: 'run-admin' },
                { type: 'separator' },
                { label: 'Create Shortcut', icon: '🔗', action: 'shortcut' },
                { type: 'separator' },
                { label: 'Pin to Start Menu', icon: '📌', action: 'pin-start' },
                { label: 'Pin to Taskbar', icon: '📌', action: 'pin-taskbar' },
                { type: 'separator' },
                { label: 'Delete', icon: '🗑️', action: 'delete' },
                { label: 'Rename', icon: '✏️', action: 'rename' },
                { type: 'separator' },
                { label: 'Properties', icon: 'ℹ️', action: 'properties' }
            ],
            onAction: (action, context) => {
                this.handleStartMenuAction(action, context);
            }
        };
    }

    /**
     * Taskbar context menu
     */
    getTaskbarMenu() {
        return {
            items: [
                { label: 'Restore', icon: '🔳', action: 'restore' },
                { label: 'Minimize', icon: '➖', action: 'minimize' },
                { label: 'Maximize', icon: '🔳', action: 'maximize' },
                { type: 'separator' },
                { label: 'Close', icon: '❌', action: 'close' },
                { label: 'End Task', icon: '🛑', action: 'end-task' },
                { type: 'separator' },
                { label: 'Task Manager', icon: '📊', action: 'task-manager' }
            ],
            onAction: (action, context) => {
                this.handleTaskbarAction(action, context);
            }
        };
    }

    /**
     * File/Folder context menu
     */
    getFileMenu(fileType = 'file') {
        const items = [
            { label: 'Open', icon: '📂', action: 'open' },
            { label: 'Open With', icon: '📂', type: 'submenu', submenu: [
                { label: 'Notepad', action: 'open-notepad' },
                { label: 'Paint', action: 'open-paint' }
            ]},
            { type: 'separator' },
            { label: 'Cut', icon: '✂️', action: 'cut' },
            { label: 'Copy', icon: '📋', action: 'copy' },
            { label: 'Create Shortcut', icon: '🔗', action: 'shortcut' },
            { type: 'separator' },
            { label: 'Delete', icon: '🗑️', action: 'delete' },
            { label: 'Rename', icon: '✏️', action: 'rename' },
            { type: 'separator' },
            { label: 'Properties', icon: 'ℹ️', action: 'properties' }
        ];

        if (fileType === 'directory') {
            // Remove Open With for directories
            items.splice(1, 1);
        }

        return {
            items,
            onAction: (action, context) => {
                this.handleFileAction(action, context);
            }
        };
    }

    // ==================== ACTION HANDLERS ====================

    handleDesktopAction(action, context) {
        switch (action) {
            case 'refresh':
                // Refresh desktop
                if (window.RetroWeb?.desktop) {
                    window.RetroWeb.desktop.refresh();
                }
                break;
            case 'new-folder':
                if (window.RetroWeb?.desktop) {
                    window.RetroWeb.desktop.createNewFolder();
                }
                break;
            case 'new-shortcut':
                if (window.RetroWeb?.desktop) {
                    window.RetroWeb.desktop.createNewShortcut();
                }
                break;
            case 'new-text':
                if (window.RetroWeb?.desktop) {
                    window.RetroWeb.desktop.createNewTextFile();
                }
                break;
            case 'properties':
                // Show desktop properties
                break;
        }
    }

    handleStartMenuAction(action, context) {
        const appName = context.appName;
        const item = context.item;
        switch (action) {
            case 'open':
                if (window.RetroWeb?.startMenu) {
                    window.RetroWeb.startMenu.launchApp(appName);
                }
                break;
            case 'run-admin':
                // Run as admin (placeholder)
                alert('Run as Administrator not implemented yet');
                break;
            case 'pin-start':
                // Pin to start menu
                break;
            case 'pin-taskbar':
                // Pin to taskbar
                break;
            case 'delete':
                // Delete from start menu
                break;
            case 'rename':
                // Rename in start menu
                break;
            case 'properties':
                // Show properties
                break;
            case 'shortcut':
                // Create desktop shortcut
                if (window.RetroWeb?.startMenu && item) {
                    window.RetroWeb.startMenu.createDesktopShortcut(item);
                }
                break;
        }
    }

    handleTaskbarAction(action, context) {
        const windowId = context.windowId;
        switch (action) {
            case 'restore':
                if (window.RetroWeb?.windowManager) {
                    window.RetroWeb.windowManager.restore(windowId);
                }
                break;
            case 'minimize':
                if (window.RetroWeb?.windowManager) {
                    window.RetroWeb.windowManager.minimize(windowId);
                }
                break;
            case 'maximize':
                if (window.RetroWeb?.windowManager) {
                    window.RetroWeb.windowManager.maximize(windowId);
                }
                break;
            case 'close':
                if (window.RetroWeb?.windowManager) {
                    window.RetroWeb.windowManager.close(windowId);
                }
                break;
            case 'end-task':
                // End task (close window)
                if (window.RetroWeb?.windowManager) {
                    window.RetroWeb.windowManager.close(windowId);
                }
                break;
            case 'task-manager':
                if (window.RetroWeb?.taskManager) {
                    window.RetroWeb.taskManager.open();
                }
                break;
        }
    }

    handleFileAction(action, context) {
        const path = context.path;
        const type = context.type;

        switch (action) {
            case 'open':
                if (type === 'directory') {
                    if (window.RetroWeb?.explorer) {
                        window.RetroWeb.explorer.open(path);
                    }
                } else {
                    // Open file with default app
                    if (window.RetroWeb?.registry) {
                        window.RetroWeb.registry.openFile(path);
                    }
                }
                break;
            case 'open-notepad':
                if (window.RetroWeb?.registry) {
                    window.RetroWeb.registry.openWith(path, 'Notepad');
                }
                break;
            case 'open-paint':
                if (window.RetroWeb?.registry) {
                    window.RetroWeb.registry.openWith(path, 'Paint');
                }
                break;
            case 'cut':
                // Cut to clipboard
                break;
            case 'copy':
                // Copy to clipboard
                break;
            case 'shortcut':
                // Create desktop shortcut
                if (window.RetroWeb?.vfs && path) {
                    this.createDesktopShortcut(path, type);
                }
                break;
            case 'delete':
                // Delete file/folder
                break;
            case 'rename':
                // Rename file/folder
                break;
            case 'properties':
                // Show properties
                break;
        }
    }

    /**
     * Create desktop shortcut for a file/folder
     */
    async createDesktopShortcut(targetPath, targetType) {
        const vfs = window.RetroWeb?.vfs;
        if (!vfs) return;

        try {
            const fileName = targetPath.split('\\').pop();
            const shortcutName = prompt('Shortcut Name:', fileName);
            if (!shortcutName) return;

            const desktopPath = 'C:\\Documents and Settings\\User\\Desktop';
            const shortcutPath = `${desktopPath}\\${shortcutName}.lnk`;

            const shortcutData = {
                type: 'shortcut',
                name: shortcutName,
                target: targetPath,
                targetType: targetType,
                icon: targetType === 'directory' ? '📁' : '📄'
            };

            await vfs.createFile(shortcutPath, JSON.stringify(shortcutData, null, 2));

            // Refresh desktop
            if (window.RetroWeb?.desktop) {
                window.RetroWeb.desktop.refresh();
            }
        } catch (err) {
            alert(`Failed to create shortcut: ${err.message}`);
        }
    }
}

// Auto-initialize
const contextMenu = new ContextMenu();