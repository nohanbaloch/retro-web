/**
 * Taskbar
 * Windows XP-style taskbar with Start button, window buttons, system tray, and clock
 */

class Taskbar {
    constructor() {
        this.container = document.getElementById('taskbar');
        this.windowButtons = new Map();
        this.quickLaunchApps = [];
        this.initialize();
    }

    /**
     * Initialize taskbar
     */
    initialize() {
        if (!this.container) {
            console.error('[TASKBAR] Container not found');
            return;
        }

        this.render();
        this.attachEventListeners();
        this.startClock();

        // Register with kernel
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.taskbar = this;
            
            // Listen for window events
            window.RetroWeb.kernel.on('window:created', (data) => this.addWindowButton(data));
            window.RetroWeb.kernel.on('window:closed', (data) => this.removeWindowButton(data.windowId));
            window.RetroWeb.kernel.on('window:focused', (data) => this.updateActiveButton(data.windowId));
            window.RetroWeb.kernel.on('window:minimized', (data) => this.updateButtonState(data.windowId, 'minimized'));
            
            console.log('[TASKBAR] Initialized');
        }
    }

    /**
     * Render taskbar structure
     */
    render() {
        this.container.innerHTML = '';
        this.container.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(to bottom, #245EDC, #1941A5);
            border-top: 2px solid #0831D9;
            display: flex;
            align-items: center;
            padding: 0;
            z-index: 9999;
            user-select: none;
        `;

        // Start button
        const startButton = this.createStartButton();
        this.container.appendChild(startButton);

        // Quick launch area
        const quickLaunch = this.createQuickLaunch();
        this.container.appendChild(quickLaunch);

        // Window buttons area
        const windowArea = document.createElement('div');
        windowArea.id = 'taskbar-windows';
        windowArea.style.cssText = `
            flex: 1;
            display: flex;
            gap: 4px;
            padding: 0 4px;
            overflow-x: auto;
            overflow-y: hidden;
        `;
        windowArea.style.scrollbarWidth = 'none'; // Firefox
        windowArea.style.msOverflowStyle = 'none'; // IE/Edge
        this.container.appendChild(windowArea);

        // System tray
        const systemTray = this.createSystemTray();
        this.container.appendChild(systemTray);

        // Clock
        const clock = this.createClock();
        this.container.appendChild(clock);
    }

    /**
     * Create Start button
     */
    createStartButton() {
        const button = document.createElement('button');
        button.id = 'start-button';
        button.innerHTML = `
            <span style="font-weight: bold; font-style: italic; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                Start
            </span>
        `;
        button.style.cssText = `
            height: 36px;
            padding: 0 20px 0 8px;
            margin: 2px 4px;
            background: linear-gradient(to bottom, #3FA142, #2D8A2F);
            border: 1px solid #1E5E1F;
            border-radius: 0 18px 18px 0;
            color: white;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
            position: relative;
        `;

        // Windows logo (simplified)
        const logo = document.createElement('span');
        logo.innerHTML = '⊞';
        logo.style.cssText = `
            font-size: 20px;
            font-weight: bold;
            color: white;
        `;
        button.insertBefore(logo, button.firstChild);

        // Hover effect
        button.addEventListener('mouseenter', () => {
            button.style.background = 'linear-gradient(to bottom, #4FB14F, #3A9A3A)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'linear-gradient(to bottom, #3FA142, #2D8A2F)';
        });

        // Active state
        button.addEventListener('mousedown', () => {
            button.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3)';
        });
        button.addEventListener('mouseup', () => {
            button.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3)';
        });

        return button;
    }

    /**
     * Create quick launch area
     */
    createQuickLaunch() {
        const container = document.createElement('div');
        container.id = 'quick-launch';
        container.style.cssText = `
            display: flex;
            gap: 2px;
            padding: 0 8px;
            border-right: 1px solid rgba(255,255,255,0.2);
            margin-right: 4px;
        `;

        // Add some default quick launch icons (placeholders for now)
        const icons = ['🌐', '📁', '📝'];
        icons.forEach(icon => {
            const btn = document.createElement('button');
            btn.textContent = icon;
            btn.style.cssText = `
                width: 32px;
                height: 32px;
                background: rgba(255,255,255,0.1);
                border: 1px solid transparent;
                border-radius: 2px;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255,255,255,0.2)';
                btn.style.borderColor = 'rgba(255,255,255,0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255,255,255,0.1)';
                btn.style.borderColor = 'transparent';
            });
            
            container.appendChild(btn);
        });

        return container;
    }

    /**
     * Create system tray
     */
    createSystemTray() {
        const tray = document.createElement('div');
        tray.id = 'system-tray';
        tray.style.cssText = `
            display: flex;
            gap: 4px;
            padding: 0 8px;
            border-left: 1px solid rgba(255,255,255,0.2);
            align-items: center;
        `;

        // Add system icons
        const icons = ['🔊', '🌐', '🔔'];
        icons.forEach(icon => {
            const iconEl = document.createElement('span');
            iconEl.textContent = icon;
            iconEl.style.cssText = `
                font-size: 14px;
                cursor: pointer;
                padding: 4px;
                border-radius: 2px;
            `;
            
            iconEl.addEventListener('mouseenter', () => {
                iconEl.style.background = 'rgba(255,255,255,0.2)';
            });
            iconEl.addEventListener('mouseleave', () => {
                iconEl.style.background = 'transparent';
            });
            
            tray.appendChild(iconEl);
        });

        return tray;
    }

    /**
     * Create clock display
     */
    createClock() {
        const clock = document.createElement('div');
        clock.id = 'taskbar-clock';
        clock.style.cssText = `
            padding: 0 12px;
            color: white;
            font-size: 11px;
            text-align: center;
            min-width: 70px;
            cursor: pointer;
            border-radius: 2px;
        `;

        clock.addEventListener('mouseenter', () => {
            clock.style.background = 'rgba(255,255,255,0.2)';
        });
        clock.addEventListener('mouseleave', () => {
            clock.style.background = 'transparent';
        });

        this.clockElement = clock;
        this.updateClock();

        return clock;
    }

    /**
     * Add window button to taskbar
     */
    addWindowButton(data) {
        const { windowId, title, icon = '📄' } = data;
        
        const windowArea = document.getElementById('taskbar-windows');
        if (!windowArea) return;

        const button = document.createElement('button');
        button.id = `taskbar-btn-${windowId}`;
        button.dataset.windowId = windowId;
        button.style.cssText = `
            min-width: 160px;
            max-width: 200px;
            height: 32px;
            padding: 0 8px;
            background: linear-gradient(to bottom, #3C7DDE, #2456C1);
            border: 1px solid #0831D9;
            border-radius: 3px;
            color: white;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        `;

        // Icon
        const iconEl = document.createElement('span');
        iconEl.textContent = icon;
        iconEl.style.fontSize = '14px';
        button.appendChild(iconEl);

        // Title
        const titleEl = document.createElement('span');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
        `;
        button.appendChild(titleEl);

        // Click handler
        button.addEventListener('click', () => {
            this.handleWindowButtonClick(windowId);
        });

        windowArea.appendChild(button);
        this.windowButtons.set(windowId, button);
    }

    /**
     * Remove window button from taskbar
     */
    removeWindowButton(windowId) {
        const button = this.windowButtons.get(windowId);
        if (button) {
            button.remove();
            this.windowButtons.delete(windowId);
        }
    }

    /**
     * Update active window button
     */
    updateActiveButton(windowId) {
        // Reset all buttons
        this.windowButtons.forEach((button, id) => {
            if (id === windowId) {
                // Active state
                button.style.background = 'linear-gradient(to bottom, #ECE9D8, #D6D3CE)';
                button.style.color = '#000';
                button.style.borderColor = '#0831D9';
                button.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
            } else {
                // Inactive state
                button.style.background = 'linear-gradient(to bottom, #3C7DDE, #2456C1)';
                button.style.color = 'white';
                button.style.borderColor = '#0831D9';
                button.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.2)';
            }
        });
    }

    /**
     * Update button state (minimized, etc.)
     */
    updateButtonState(windowId, state) {
        const button = this.windowButtons.get(windowId);
        if (!button) return;

        if (state === 'minimized') {
            button.style.background = 'linear-gradient(to bottom, #3C7DDE, #2456C1)';
            button.style.color = 'white';
        }
    }

    /**
     * Handle window button click
     */
    handleWindowButtonClick(windowId) {
        if (window.RetroWeb?.windowManager) {
            const windowObj = window.RetroWeb.windowManager.getWindow(windowId);
            
            if (windowObj) {
                if (windowObj.state === 'minimized') {
                    // Restore window
                    window.RetroWeb.windowManager.restore(windowId);
                } else if (windowObj.element === window.RetroWeb.windowManager.focusedWindow?.element) {
                    // If already focused, minimize
                    window.RetroWeb.windowManager.minimize(windowId);
                } else {
                    // Focus window
                    window.RetroWeb.windowManager.focus(windowId);
                }
            }
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.toggleStartMenu();
            });
        }
    }

    /**
     * Toggle start menu
     */
    toggleStartMenu() {
        if (window.RetroWeb?.startMenu) {
            window.RetroWeb.startMenu.toggle();
        }
    }

    /**
     * Start clock update interval
     */
    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    /**
     * Update clock display
     */
    updateClock() {
        if (!this.clockElement) return;

        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        
        const time = `${hours}:${minutes}`;
        
        this.clockElement.innerHTML = `
            <div style="line-height: 1.2;">
                <div style="font-weight: bold;">${time}</div>
            </div>
        `;
    }

    /**
     * Show notification badge
     */
    showNotificationBadge(count) {
        const tray = document.getElementById('system-tray');
        if (!tray) return;

        let badge = tray.querySelector('.notification-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.style.cssText = `
                position: absolute;
                top: 4px;
                right: 4px;
                background: #E81123;
                color: white;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                font-size: 9px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            tray.style.position = 'relative';
            tray.appendChild(badge);
        }

        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Auto-initialize
const taskbar = new Taskbar();

export { Taskbar };
