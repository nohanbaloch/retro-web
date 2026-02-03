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
        this.activeModals = new Map(); // windowId -> maskElement
        
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
            customClass = '',
            isModal = false,
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
            maximizable: !isModal && maximizable,
            isModal,
            content
        });

        if (isModal) {
            this.createModalMask(windowId);
            windowElement.classList.add('modal-window');
        }

        this.container.appendChild(windowElement);

        const windowObj = {
            id: windowId,
            element: windowElement,
            title,
            state: 'normal',
            zIndex: this.nextZIndex++,
            bounds: { x, y, width, height },
            savedBounds: null,
            config,
            isResizing: false,
            isDragging: false
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
        const { windowId, title, width, height, x, y, content, resizable } = config;

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

        // Resize Handles
        if (resizable) {
            this.addResizeHandles(windowEl);
        }

        return windowEl;
    }

    /**
     * Add resize handles to window element
     */
    addResizeHandles(element) {
        const styles = {
            n: 'top: -3px; left: 0; width: 100%; height: 6px; cursor: n-resize;',
            s: 'bottom: -3px; left: 0; width: 100%; height: 6px; cursor: s-resize;',
            e: 'top: 0; right: -3px; height: 100%; width: 6px; cursor: e-resize;',
            w: 'top: 0; left: -3px; height: 100%; width: 6px; cursor: w-resize;',
            ne: 'top: -3px; right: -3px; width: 10px; height: 10px; cursor: ne-resize;',
            nw: 'top: -3px; left: -3px; width: 10px; height: 10px; cursor: nw-resize;',
            se: 'bottom: -3px; right: -3px; width: 10px; height: 10px; cursor: se-resize;',
            sw: 'bottom: -3px; left: -3px; width: 10px; height: 10px; cursor: sw-resize;'
        };

        Object.keys(styles).forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${dir}`;
            handle.style.cssText = `position: absolute; ${styles[dir]} z-index: 10;`;
            handle.dataset.dir = dir;
            element.appendChild(handle);
        });
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
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
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
        const resizeHandles = element.querySelectorAll('.resize-handle');

        // Focus on click
        element.addEventListener('mousedown', () => this.focus(id));

        // Dragging Logic
        let dragOffset = { x: 0, y: 0 };
        
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            if (windowObj.state === 'maximized') return; // Cannot drag maximized
            
            windowObj.isDragging = true;
            element.style.transition = 'none'; // Disable animation during drag
            const bounds = element.getBoundingClientRect();
            dragOffset.x = e.clientX - bounds.left;
            dragOffset.y = e.clientY - bounds.top;
        });

        // Resizing Logic
        let resizeData = { startX: 0, startY: 0, startW: 0, startH: 0, startLeft: 0, startTop: 0, dir: '' };

        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation(); // Don't trigger focus or drag
                windowObj.isResizing = true;
                element.style.transition = 'none';
                
                const rect = element.getBoundingClientRect();
                resizeData = {
                    startX: e.clientX,
                    startY: e.clientY,
                    startW: rect.width,
                    startH: rect.height,
                    startLeft: rect.left,
                    startTop: rect.top,
                    dir: handle.dataset.dir
                };
            });
        });

        // Global Mouse Move
        document.addEventListener('mousemove', (e) => {
            if (windowObj.isDragging) {
                e.preventDefault();
                let x = e.clientX - dragOffset.x;
                let y = e.clientY - dragOffset.y;

                // Snapping Logic
                const snapThreshold = 15;
                const screenW = window.innerWidth;
                const screenH = window.innerHeight; // Taskbar height calculation later if needed

                // Snap Left/Right
                if (Math.abs(x) < snapThreshold) x = 0;
                else if (Math.abs(x + windowObj.bounds.width - screenW) < snapThreshold) x = screenW - windowObj.bounds.width;

                // Snap Top/Bottom
                if (Math.abs(y) < snapThreshold) y = 0;
                else if (Math.abs(y + windowObj.bounds.height - (screenH - 40)) < snapThreshold) y = screenH - 40 - windowObj.bounds.height;

                element.style.left = `${x}px`;
                element.style.top = `${y}px`;

                windowObj.bounds.x = x;
                windowObj.bounds.y = y;
            }

            if (windowObj.isResizing) {
                e.preventDefault();
                const dx = e.clientX - resizeData.startX;
                const dy = e.clientY - resizeData.startY;
                const dir = resizeData.dir;

                const minW = 200;
                const minH = 150;

                let newW = resizeData.startW;
                let newH = resizeData.startH;
                let newLeft = resizeData.startLeft;
                let newTop = resizeData.startTop;

                if (dir.includes('e')) newW = Math.max(minW, resizeData.startW + dx);
                if (dir.includes('s')) newH = Math.max(minH, resizeData.startH + dy);
                
                if (dir.includes('w')) {
                    newW = Math.max(minW, resizeData.startW - dx);
                    if (newW !== minW) newLeft = resizeData.startLeft + dx;
                    else newLeft = resizeData.startLeft + (resizeData.startW - minW);
                }
                
                if (dir.includes('n')) {
                    newH = Math.max(minH, resizeData.startH - dy);
                    if (newH !== minH) newTop = resizeData.startTop + dy;
                    else newTop = resizeData.startTop + (resizeData.startH - minH);
                }

                element.style.width = `${newW}px`;
                element.style.height = `${newH}px`;
                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;

                windowObj.bounds = { x: newLeft, y: newTop, width: newW, height: newH };
            }
        });

        // Global Mouse Up
        document.addEventListener('mouseup', () => {
            if (windowObj.isDragging) {
                windowObj.isDragging = false;
                // Re-enable animation if needed (could set a timeout)
            }
            if (windowObj.isResizing) {
                windowObj.isResizing = false;
            }
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

        // Check for active modals
        if (this.activeModals.size > 0 && !this.activeModals.has(windowId)) {
            const activeModalId = [...this.activeModals.keys()].pop();
            this.flashWindow(activeModalId);
            return;
        }

        if (this.activeModals.has(windowId)) {
            const mask = this.activeModals.get(windowId);
            const maskZ = this.nextZIndex++;
            mask.style.zIndex = maskZ;
        }

        windowObj.zIndex = this.nextZIndex++;
        windowObj.element.style.zIndex = windowObj.zIndex;

        this.windows.forEach(w => {
            const titleBar = w.element.querySelector('.window-titlebar');
            if (w.id === windowId) {
                titleBar.style.background = 'linear-gradient(to bottom, #0054E3, #0041C2)';
            } else {
                titleBar.style.background = 'linear-gradient(to bottom, #7A96DF, #5A76BF)';
            }
        });

        this.focusedWindow = windowObj;

        if (window.RetroWeb?.kernel) {
            window.RetroWeb.kernel.emit('window:focused', { windowId });
        }
    }

    /**
     * Minimize window with animation
     */
    minimize(windowId) {
        const windowObj = this.windows.find(w => w.id === windowId);
        if (!windowObj) return;

        // Animate
        this.animateWindow(windowObj, {
            transform: 'translate(0, 100vh) scale(0.1)',
            opacity: '0'
        }, () => {
            windowObj.element.style.display = 'none';
            windowObj.state = 'minimized';
            windowObj.element.style.transform = ''; // Reset for restore
            windowObj.element.style.opacity = '';
        });

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
        // Start from minimized state visually
        windowObj.element.style.opacity = '0';
        windowObj.element.style.transform = 'translate(0, 20px) scale(0.8)';

        requestAnimationFrame(() => {
             this.animateWindow(windowObj, {
                transform: 'none',
                opacity: '1'
             }, () => {
                windowObj.state = 'normal';
                this.focus(windowId);
             });
        });

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

        // Toggle state
        if (windowObj.state === 'maximized') {
            // Restore
            const { x, y, width, height } = windowObj.savedBounds;
            
            this.animateWindow(windowObj, {
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                height: `${height}px`
            }, () => {
                windowObj.state = 'normal';
                windowObj.bounds = windowObj.savedBounds;
            });
        } else {
            // Maximize
            windowObj.savedBounds = { ...windowObj.bounds };
            
            this.animateWindow(windowObj, {
                left: '0',
                top: '0',
                width: '100%',
                height: 'calc(100vh - 40px)'
            }, () => {
                windowObj.state = 'maximized';
            });
        }
    }

    /**
     * Helper to animate window properties
     */
    animateWindow(windowObj, styles, callback) {
        windowObj.element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Apply styles
        Object.entries(styles).forEach(([key, value]) => {
            windowObj.element.style[key] = value;
        });

        // Cleanup after animation
        const handler = () => {
            windowObj.element.style.transition = '';
            windowObj.element.removeEventListener('transitionend', handler);
            if (callback) callback();
        };
        windowObj.element.addEventListener('transitionend', handler);
    }

    /**
     * Close window
     */
    close(windowId) {
        const index = this.windows.findIndex(w => w.id === windowId);
        if (index === -1) return;
        const windowObj = this.windows[index];
        
        // Use fade out animation
        this.animateWindow(windowObj, { opacity: '0', transform: 'scale(0.9)' }, () => {
            windowObj.element.remove();
            this.windows.splice(index, 1);
            if (this.activeModals.has(windowId)) {
                this.activeModals.get(windowId).remove();
                this.activeModals.delete(windowId);
            }
            if (window.RetroWeb?.kernel) {
                window.RetroWeb.kernel.emit('window:closed', { windowId });
            }
            if (windowObj.onClosed) {
                windowObj.onClosed();
            }
        });
    }

    /**
     * Get window by ID
     */
    getWindow(windowId) {
        return this.windows.find(w => w.id === windowId);
    }


    /**
     * Create modal mask
     */
    createModalMask(windowId) {
        const mask = document.createElement('div');
        mask.className = 'modal-mask';
        mask.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            pointer-events: auto;
        `;
        
        // Clicking mask focuses the modal
        mask.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.flashWindow(windowId);
            this.focus(windowId);
        });

        this.container.appendChild(mask);
        this.activeModals.set(windowId, mask);
    }

    /**
     * Flash window for visual feedback
     */
    flashWindow(windowId) {
        const win = this.getWindow(windowId);
        if (!win) return;
        const titleBar = win.element.querySelector('.window-titlebar');
        const originalBg = titleBar.style.background;
        titleBar.style.background = '#fff';
        setTimeout(() => {
            titleBar.style.background = originalBg;
            setTimeout(() => {
                titleBar.style.background = '#fff';
                setTimeout(() => {
                    titleBar.style.background = originalBg;
                }, 100);
            }, 100);
        }, 100);
    }

    /**
     * Center window on screen
     */
    centerWindow(windowId) {
        const win = this.getWindow(windowId);
        if (!win) return;
        const { width, height } = win.bounds;
        const x = (window.innerWidth - width) / 2;
        const y = (window.innerHeight - height) / 2;
        win.element.style.left = `${x}px`;
        win.element.style.top = `${y}px`;
        win.bounds.x = x;
        win.bounds.y = y;
        win.savedBounds = null;
    }

    /**
     * System Alert Dialog
     */
    alert(message, title = 'Alert') {
        return new Promise((resolve) => {
            const win = this.createWindow({
                title,
                width: 300,
                height: 150,
                minimizable: false,
                maximizable: false,
                resizable: false,
                isModal: true,
                content: `
                    <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box;">
                        <div style="flex: 1; display: flex; align-items: center; gap: 15px; padding: 10px;">
                            <div style="font-size: 32px;">⚠️</div>
                            <div style="font-size: 11px;">${message}</div>
                        </div>
                        <div style="display: flex; justify-content: center; margin-top: 10px;">
                            <button class="sys-btn" data-action="ok" style="min-width: 75px; padding: 4px;">OK</button>
                        </div>
                    </div>
                `
            });
            this.centerWindow(win.id);
            const btn = win.element.querySelector('[data-action="ok"]');
            btn.addEventListener('click', () => {
                this.close(win.id);
                resolve(true);
            });
            win.onClosed = () => resolve(true);
        });
    }

    /**
     * System Confirm Dialog
     */
    confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            const win = this.createWindow({
                title,
                width: 300,
                height: 150,
                minimizable: false,
                maximizable: false,
                resizable: false,
                isModal: true,
                content: `
                    <div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box;">
                        <div style="flex: 1; display: flex; align-items: center; gap: 15px; padding: 10px;">
                            <div style="font-size: 32px;">❓</div>
                            <div style="font-size: 11px;">${message}</div>
                        </div>
                        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
                            <button class="sys-btn" data-action="yes" style="min-width: 75px; padding: 4px;">Yes</button>
                            <button class="sys-btn" data-action="no" style="min-width: 75px; padding: 4px;">No</button>
                        </div>
                    </div>
                `
            });
            this.centerWindow(win.id);
            const handleResult = (result) => {
                this.close(win.id);
                resolve(result);
            };
            win.element.querySelector('[data-action="yes"]').addEventListener('click', () => handleResult(true));
            win.element.querySelector('[data-action="no"]').addEventListener('click', () => handleResult(false));
            win.onClosed = () => resolve(false);
        });
    }
}

// Auto-initialize
const windowManager = new WindowManager();

export { WindowManager };
