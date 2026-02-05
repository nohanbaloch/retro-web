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
        // Inline styles removed - relying on CSS

        // Start button
        const startButton = this.createStartButton();
        this.container.appendChild(startButton);

        // Quick launch area
        const quickLaunch = this.createQuickLaunch();
        this.container.appendChild(quickLaunch);

        // Window buttons area
        const windowArea = document.createElement('div');
        windowArea.id = 'taskbar-windows';
        // Inline styles removed
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
            <span class="start-text">Start</span>
        `;
        
        // Windows logo (simplified)
        const logo = document.createElement('span');
        logo.className = 'start-logo';
        logo.innerHTML = '⊞';
        button.insertBefore(logo, button.firstChild);

        return button;
    }

    /**
     * Create quick launch area
     */
    createQuickLaunch() {
        const container = document.createElement('div');
        container.id = 'quick-launch';

        // Add some default quick launch icons
        const apps = [
            { icon: '🌐', name: 'Browser', action: 'browser' },
            { icon: '📁', name: 'Explorer', action: 'explorer' },
            { icon: '📝', name: 'Notepad', action: 'notepad' }
        ];

        apps.forEach(app => {
            const btn = document.createElement('button');
            btn.className = 'quick-launch-btn';
            btn.textContent = app.icon;
            btn.title = app.name;
            
            btn.addEventListener('click', () => {
                this.launchQuickApp(app.action);
            });
            
            container.appendChild(btn);
        });

        return container;
    }

    /**
     * Launch app from quick launch
     */
    launchQuickApp(action) {
        // Simple dispatcher
        switch (action) {
            case 'explorer':
                if (window.RetroWeb?.explorer) window.RetroWeb.explorer.open('C:\\', 'My Computer');
                break;
            case 'notepad':
                if (window.RetroWeb?.registry) window.RetroWeb.registry.launch('Notepad');
                else if (window.RetroWeb?.notepad) window.RetroWeb.notepad.open();
                break;
            case 'browser':
                // rudimentary or alert
                if (window.RetroWeb?.windowManager) {
                     window.RetroWeb.windowManager.createWindow({
                         title: 'Web Browser',
                         width: 800,
                         height: 600,
                         content: '<div style="padding:20px; text-align:center;">Internet not connected.</div>'
                     });
                }
                break;
        }
    }

    /**
     * Create system tray
     */
    createSystemTray() {
        const tray = document.createElement('div');
        tray.id = 'system-tray';

        // Add system icons
        const icons = ['🔊', '🌐', '🔔'];
        icons.forEach(icon => {
            const iconEl = document.createElement('span');
            iconEl.className = 'tray-icon';
            iconEl.textContent = icon;
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
        button.className = 'taskbar-btn';
        button.dataset.windowId = windowId;

        // Icon
        const iconEl = document.createElement('span');
        iconEl.textContent = icon;
        iconEl.className = 'btn-icon';
        button.appendChild(iconEl);

        // Title
        const titleEl = document.createElement('span');
        titleEl.textContent = title;
        titleEl.className = 'btn-title';
        titleEl.style.cssText = `
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
                button.classList.add('active');
            } else {
                button.classList.remove('active');
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
            button.classList.remove('active');
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
        // Delegate for start button since it might be re-rendered?
        // Actually we append it in render, so we can just attach to it there?
        // But `render` clears html.
        // Let's attach to container for delegation or re-attach in render?
        // createStartButton doesn't add listener.
        // Let's rely on delegation or re-attach.
        // Ideally render handles it.
        const startBtn = document.getElementById('start-button');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleStartMenu());
        } else {
            // Wait for render? Render is called in init.
            // If attachEventListeners is called after render, we good.
            setTimeout(() => {
                const btn = document.getElementById('start-button');
                if(btn) btn.addEventListener('click', () => this.toggleStartMenu());
            }, 0);
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
        
        const time = `${hours}:${minutes}`;
        
        this.clockElement.textContent = time;
    }
}

// Auto-initialize
const taskbar = new Taskbar();

export { Taskbar };
