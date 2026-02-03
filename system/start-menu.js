/**
 * Start Menu
 * Windows XP-style start menu with two-column layout
 */

class StartMenu {
    constructor() {
        this.container = document.getElementById('start-menu');
        this.isOpen = false;
        this.apps = [];
        this.initialize();
    }

    /**
     * Initialize start menu
     */
    initialize() {
        if (!this.container) {
            console.error('[START-MENU] Container not found');
            return;
        }

        this.render();
        this.registerDefaultApps();
        
        // Register with kernel
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.startMenu = this;
            console.log('[START-MENU] Initialized');
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target) && !e.target.closest('#start-button')) {
                this.close();
            }
        });
    }

    /**
     * Render start menu structure
     */
    render() {
        this.container.innerHTML = '';
        this.container.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 0;
            width: 400px;
            height: 500px;
            background: white;
            border: 2px solid #0831D9;
            border-bottom: none;
            box-shadow: 4px 4px 12px rgba(0,0,0,0.4);
            display: none;
            flex-direction: row;
            z-index: 10000;
            user-select: none;
        `;

        // Left panel (user info and frequently used)
        const leftPanel = this.createLeftPanel();
        this.container.appendChild(leftPanel);

        // Right panel (all programs, settings, power)
        const rightPanel = this.createRightPanel();
        this.container.appendChild(rightPanel);
    }

    /**
     * Create left panel
     */
    createLeftPanel() {
        const panel = document.createElement('div');
        panel.className = 'start-menu-left';
        panel.style.cssText = `
            width: 240px;
            background: white;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #D6D3CE;
        `;

        // User profile section
        const userSection = document.createElement('div');
        userSection.style.cssText = `
            padding: 12px;
            background: linear-gradient(to bottom, #5A7EDC 0%, #3C5FBF 100%);
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid #0831D9;
        `;

        const userIcon = document.createElement('div');
        userIcon.textContent = '👤';
        userIcon.style.cssText = `
            font-size: 32px;
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const userName = document.createElement('div');
        userName.innerHTML = `
            <div style="font-weight: bold; font-size: 13px;">User</div>
            <div style="font-size: 11px; opacity: 0.9;">Administrator</div>
        `;

        userSection.appendChild(userIcon);
        userSection.appendChild(userName);
        panel.appendChild(userSection);

        // Frequently used programs
        const frequentSection = document.createElement('div');
        frequentSection.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
        `;

        const frequentTitle = document.createElement('div');
        frequentTitle.textContent = 'Frequently Used';
        frequentTitle.style.cssText = `
            padding: 4px 12px;
            font-size: 10px;
            color: #666;
            font-weight: bold;
        `;
        frequentSection.appendChild(frequentTitle);

        // Add frequent apps
        const frequentApps = [
            { name: 'File Explorer', icon: '📁', action: 'explorer' },
            { name: 'Notepad', icon: '📝', action: 'notepad' },
            { name: 'Terminal', icon: '⌨️', action: 'terminal' },
            { name: 'Paint', icon: '🎨', action: 'paint' },
            { name: 'GitHub', icon: '🐙', action: 'github' }
        ];

        frequentApps.forEach(app => {
            const item = this.createMenuItem(app);
            frequentSection.appendChild(item);
        });

        panel.appendChild(frequentSection);

        // All Programs button
        const allProgramsBtn = this.createAllProgramsButton();
        panel.appendChild(allProgramsBtn);

        return panel;
    }

    /**
     * Create right panel
     */
    createRightPanel() {
        const panel = document.createElement('div');
        panel.className = 'start-menu-right';
        panel.style.cssText = `
            width: 160px;
            background: #D6E8F7;
            display: flex;
            flex-direction: column;
            padding: 8px 0;
        `;

        // System items
        const systemItems = [
            { name: 'My Computer', icon: '💻', action: 'mycomputer' },
            { name: 'My Documents', icon: '📄', action: 'mydocuments' },
            { name: 'Control Panel', icon: '⚙️', action: 'controlpanel' },
            { separator: true },
            { name: 'GitHub', icon: '🐙', action: 'github' },
            { name: 'Search', icon: '🔍', action: 'search' },
            { name: 'Help', icon: '❓', action: 'help' },
            { name: 'Run...', icon: '▶️', action: 'run' }
        ];

        systemItems.forEach(item => {
            if (item.separator) {
                const sep = document.createElement('div');
                sep.style.cssText = `
                    height: 1px;
                    background: #B8D0E8;
                    margin: 4px 8px;
                `;
                panel.appendChild(sep);
            } else {
                const menuItem = this.createMenuItem(item, true);
                panel.appendChild(menuItem);
            }
        });

        // Spacer
        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        panel.appendChild(spacer);

        // Power options
        const powerSection = document.createElement('div');
        powerSection.style.cssText = `
            border-top: 1px solid #B8D0E8;
            padding-top: 8px;
        `;

        const powerItems = [
            { name: 'Log Off', icon: '👋', action: 'logoff' },
            { name: 'Shut Down', icon: '⏻', action: 'shutdown' }
        ];

        powerItems.forEach(item => {
            const menuItem = this.createMenuItem(item, true);
            powerSection.appendChild(menuItem);
        });

        panel.appendChild(powerSection);

        return panel;
    }

    /**
     * Create menu item
     */
    createMenuItem(item, isRightPanel = false) {
        const menuItem = document.createElement('div');
        menuItem.className = 'start-menu-item';
        menuItem.style.cssText = `
            padding: 6px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            font-size: 11px;
            color: ${isRightPanel ? '#000' : '#000'};
        `;

        const icon = document.createElement('span');
        icon.textContent = item.icon;
        icon.style.cssText = `
            font-size: 16px;
            width: 20px;
            text-align: center;
        `;

        const name = document.createElement('span');
        name.textContent = item.name;
        name.style.flex = '1';

        menuItem.appendChild(icon);
        menuItem.appendChild(name);

        // Hover effect
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.background = isRightPanel ? '#C1D2EE' : '#ECE9D8';
        });
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = 'transparent';
        });

        // Click handler
        menuItem.addEventListener('click', () => {
            this.handleMenuItemClick(item.action);
        });

        return menuItem;
    }

    /**
     * Create All Programs button
     */
    createAllProgramsButton() {
        const button = document.createElement('div');
        button.style.cssText = `
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            font-size: 11px;
            border-top: 1px solid #D6D3CE;
            background: #ECE9D8;
        `;

        const icon = document.createElement('span');
        icon.textContent = '▶';
        icon.style.cssText = `
            font-size: 10px;
            width: 20px;
            text-align: center;
        `;

        const text = document.createElement('span');
        text.textContent = 'All Programs';
        text.style.fontWeight = 'bold';

        button.appendChild(icon);
        button.appendChild(text);

        button.addEventListener('mouseenter', () => {
            button.style.background = '#D6D3CE';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = '#ECE9D8';
        });

        button.addEventListener('click', () => {
            this.showAllPrograms();
        });

        return button;
    }

    /**
     * Handle menu item click
     */
    handleMenuItemClick(action) {
        console.log(`[START-MENU] Action: ${action}`);

        switch (action) {
            case 'explorer':
                this.launchApp('File Explorer', '📁');
                break;
            case 'notepad':
                this.launchApp('Notepad', '📝');
                break;
            case 'terminal':
                this.launchApp('Terminal', '⌨️');
                break;
            case 'paint':
                this.launchApp('Paint', '🎨');
                break;
            case 'controlpanel':
                this.launchApp('Control Panel', '⚙️');
                break;
            case 'github':
                window.open('https://github.com/nohanbaloch/retro-web', '_blank');
                break;
            case 'shutdown':
                this.handleShutdown();
                break;
            case 'logoff':
                this.handleLogoff();
                break;
            default:
                console.log(`[START-MENU] Action not implemented: ${action}`);
        }

        this.close();
    }

    /**
     * Launch an application
     */
    launchApp(name, icon) {
        // Check for real applications
        switch (name.toLowerCase()) {
            case 'notepad':
                if (window.RetroWeb?.notepad) {
                    window.RetroWeb.notepad.open();
                    return;
                }
                break;
            case 'terminal':
                if (window.RetroWeb?.terminal) {
                    window.RetroWeb.terminal.open();
                    return;
                }
                break;
            case 'paint':
                if (window.RetroWeb?.paint) {
                    window.RetroWeb.paint.open();
                    return;
                }
                break;
            case 'file explorer':
                if (window.RetroWeb?.explorer) {
                    window.RetroWeb.explorer.open('C:\\', 'My Computer');
                    return;
                }
                break;
            case 'control panel':
                if (window.RetroWeb?.controlPanel) {
                    window.RetroWeb.controlPanel.open();
                    return;
                }
                break;
        }

        // Fallback to placeholder window
        if (window.RetroWeb?.windowManager) {
            const win = window.RetroWeb.windowManager.createWindow({
                title: name,
                width: 600,
                height: 400,
                x: 100 + Math.random() * 100,
                y: 100 + Math.random() * 100,
                content: `<div style="padding: 20px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
                    <h2>${name}</h2>
                    <p>Application coming soon...</p>
                </div>`
            });

            // Emit event for taskbar
            if (window.RetroWeb?.kernel) {
                window.RetroWeb.kernel.emit('window:created', {
                    windowId: win.id,
                    title: name,
                    icon: icon
                });
            }
        }
    }

    /**
     * Handle shutdown
     */
    handleShutdown() {
        if (confirm('Are you sure you want to shut down Retro Web OS?')) {
            if (window.RetroWeb?.powerManager) {
                window.RetroWeb.powerManager.shutdown();
            } else {
                // Fallback: reload page
                window.location.reload();
            }
        }
    }

    /**
     * Handle logoff
     */
    handleLogoff() {
        if (confirm('Are you sure you want to log off?')) {
            window.location.reload();
        }
    }

    /**
     * Show all programs submenu
     */
    showAllPrograms() {
        console.log('[START-MENU] All Programs clicked');
        // TODO: Implement submenu
    }

    /**
     * Register default applications
     */
    registerDefaultApps() {
        this.apps = [
            { name: 'File Explorer', icon: '📁', category: 'System' },
            { name: 'Notepad', icon: '📝', category: 'Accessories' },
            { name: 'Terminal', icon: '⌨️', category: 'System' },
            { name: 'Paint', icon: '🎨', category: 'Accessories' },
            { name: 'Control Panel', icon: '⚙️', category: 'System' }
        ];
    }

    /**
     * Toggle start menu
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open start menu
     */
    open() {
        this.container.style.display = 'flex';
        this.container.style.animation = 'slideIn 200ms ease-out';
        this.isOpen = true;

        // Emit event
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.kernel.emit('startmenu:opened');
        }
    }

    /**
     * Close start menu
     */
    close() {
        this.container.style.animation = 'fadeOut 150ms ease-out';
        
        setTimeout(() => {
            this.container.style.display = 'none';
            this.isOpen = false;

            // Emit event
            if (window.RetroWeb?.kernel) {
                window.RetroWeb.kernel.emit('startmenu:closed');
            }
        }, 150);
    }

    /**
     * Add application to start menu
     */
    addApp(app) {
        this.apps.push(app);
    }

    /**
     * Remove application from start menu
     */
    removeApp(appName) {
        this.apps = this.apps.filter(app => app.name !== appName);
    }
}

// Auto-initialize
const startMenu = new StartMenu();

export { StartMenu };
