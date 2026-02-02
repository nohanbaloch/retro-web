/**
 * Window Manager
 * Manages application windows, z-index, focus, and window operations
 */

class WindowManager {
    constructor() {
        this.windows = [];
        this.nextZIndex = 100;
        this.focusedWindow = null;
        this.container = null;
        
        this.initialize();
    }

    /**
     * Initialize window manager
     */
    initialize() {
        this.container = document.getElementById('window-layer');
        
        if (!this.container) {
            console.error('[WINDOW-MANAGER] Window layer container not found');
            return;
        }

        // Register with kernel
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.windowManager = this;
            console.log('[WINDOW-MANAGER] Initialized');
        }
    }

    /**
     * Create a new window
     */
    createWindow(config) {
        const {
            title = 'Untitled',
            width = 600,
            height = 400,
            x = 100,
            y = 100,
            resizable = true,
            minimizable = true,
            maximizable = true,
            content = ''
        } = config;

        const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const windowElement = this.buildWindowElement({
            windowId,
            title,
            width,
            height,
            x,
            y,
            resizable,
            minimizable,
            maximizable,
            content
        });

        this.container.appendChild(windowElement);

        const windowObj = {
            id: windowId,
            element: windowElement,
            title,
            state: 'normal',
            zIndex: this.nextZIndex++,
            bounds: { x, y, width, height },
            savedBounds: null,
            config
        };

        this.windows.push(windowObj);
        this.attachWindowEvents(windowObj);
        this.focus(windowId);

        return windowObj;
    }

    /**
     * Build window DOM element
     */
    buildWindowElement(config) {
        const { windowId, title, width, height, x, y, content } = config;

        const windowEl = document.createElement('div');
        windowEl.id = windowId;
        windowEl.className = 'window';
        windowEl.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            background: #ECE9D8;
            border: 2px solid #0054E3;
            box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
        `;

        // Title bar
        const titleBar = document.createElement('div');
        titleBar.className = 'window-titlebar';
        titleBar.style.cssText = `
            background: linear-gradient(to bottom, #0054E3, #0041C2);
            color: white;
            padding: 4px 8px;
            font-weight: bold;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            user-select: none;
        `;

        const titleText = document.createElement('span');
        titleText.textContent = title;
        titleBar.appendChild(titleText);

        // Window controls
        const controls = document.createElement('div');
        controls.className = 'window-controls';
        controls.style.cssText = 'display: flex; gap: 4px;';

        if (config.minimizable) {
            const minBtn = this.createControlButton('_', 'minimize');
            controls.appendChild(minBtn);
        }

        if (config.maximizable) {
            const maxBtn = this.createControlButton('□', 'maximize');
            controls.appendChild(maxBtn);
        }

        const closeBtn = this.createControlButton('×', 'close');
        controls.appendChild(closeBtn);

        titleBar.appendChild(controls);
        windowEl.appendChild(titleBar);

        // Content area
        const contentArea = document.createElement('div');
        contentArea.className = 'window-content';
        contentArea.style.cssText = `
            flex: 1;
            overflow: auto;
            padding: 8px;
            background: white;
        `;
        contentArea.innerHTML = content;

        windowEl.appendChild(contentArea);

        return windowEl;
    }

    /**
     * Create window control button
     */
    createControlButton(symbol, action) {
        const btn = document.createElement('button');
        btn.textContent = symbol;
        btn.dataset.action = action;
        btn.style.cssText = `
            width: 20px;
            height: 18px;
            border: 1px solid #fff;
            background: #ECE9D8;
            color: #000;
            font-size: 14px;
            line-height: 1;
            cursor: pointer;
            padding: 0;
        `;
        return btn;
    }

    /**
     * Attach event handlers to window
     */
    attachWindowEvents(windowObj) {
        const { element, id } = windowObj;
        const titleBar = element.querySelector('.window-titlebar');
        const controls = element.querySelectorAll('.window-controls button');

        // Focus on click
        element.addEventListener('mousedown', () => this.focus(id));

        // Dragging
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            
            isDragging = true;
            const bounds = element.getBoundingClientRect();
            dragOffset.x = e.clientX - bounds.left;
            dragOffset.y = e.clientY - bounds.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            windowObj.bounds.x = x;
            windowObj.bounds.y = y;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Control buttons
        controls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;

                switch (action) {
                    case 'minimize':
                        this.minimize(id);
                        break;
                    case 'maximize':
                        this.maximize(id);
                        break;
                    case 'close':
                        this.close(id);
                        break;
                }
            });
        });
    }

    /**
     * Focus a window
     */
    focus(windowId) {
        const windowObj = this.windows.find(w => w.id === windowId);
        if (!windowObj) return;

        // Update z-index
        windowObj.zIndex = this.nextZIndex++;
        windowObj.element.style.zIndex = windowObj.zIndex;

        // Update title bar styling
        this.windows.forEach(w => {
            const titleBar = w.element.querySelector('.window-titlebar');
            if (w.id === windowId) {
                titleBar.style.background = 'linear-gradient(to bottom, #0054E3, #0041C2)';
            } else {
                titleBar.style.background = 'linear-gradient(to bottom, #7A96DF, #5A76BF)';
            }
        });

        this.focusedWindow = windowObj;

        // Emit event
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.kernel.emit('window:focused', { windowId });
        }
    }

    /**
     * Minimize window
     */
    minimize(windowId) {
        const windowObj = this.windows.find(w => w.id === windowId);
        if (!windowObj) return;

        windowObj.element.style.display = 'none';
        windowObj.state = 'minimized';

        if (window.RetroWeb?.kernel) {
            window.RetroWeb.kernel.emit('window:minimized', { windowId });
        }
    }

    /**
     * Restore minimized window
     */
    restore(windowId) {
        const windowObj = this.windows.find(w => w.id === windowId);
        if (!windowObj) return;

        windowObj.element.style.display = 'flex';
        windowObj.state = 'normal';
        this.focus(windowId);

        if (window.RetroWeb?.kernel) {
            window.RetroWeb.kernel.emit('window:restored', { windowId });
        }
    }

    /**
     * Maximize/restore window
     */
    maximize(windowId) {
        const windowObj = this.windows.find(w => w.id === windowId);
        if (!windowObj) return;

        if (windowObj.state === 'maximized') {
            // Restore
            const { x, y, width, height } = windowObj.savedBounds;
            windowObj.element.style.left = `${x}px`;
            windowObj.element.style.top = `${y}px`;
            windowObj.element.style.width = `${width}px`;
            windowObj.element.style.height = `${height}px`;
            windowObj.state = 'normal';
        } else {
            // Maximize
            windowObj.savedBounds = { ...windowObj.bounds };
            windowObj.element.style.left = '0';
            windowObj.element.style.top = '0';
            windowObj.element.style.width = '100vw';
            windowObj.element.style.height = 'calc(100vh - 40px)';
            windowObj.state = 'maximized';
        }
    }

    /**
     * Close window
     */
    close(windowId) {
        const index = this.windows.findIndex(w => w.id === windowId);
        if (index === -1) return;

        const windowObj = this.windows[index];
        windowObj.element.remove();
        this.windows.splice(index, 1);

        if (window.RetroWeb?.kernel) {
            window.RetroWeb.kernel.emit('window:closed', { windowId });
        }
    }

    /**
     * Get window by ID
     */
    getWindow(windowId) {
        return this.windows.find(w => w.id === windowId);
    }
}

// Auto-initialize
const windowManager = new WindowManager();

export { WindowManager };
