/**
 * Input Manager
 * Handles global keyboard shortcuts and input events
 */

class InputManager {
    constructor() {
        this.initialized = false;
        this.pressedKeys = new Set();
        this.init();
    }

    init() {
        if (this.initialized) return;

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Register with kernel
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.inputManager = this;
            console.log('[INPUT-MANAGER] Initialized');
        }

        this.initialized = true;
    }

    handleKeyDown(e) {
        this.pressedKeys.add(e.key);

        // Debug key logging
        // console.log('Key:', e.key, 'Ctrl:', e.ctrlKey, 'Alt:', e.altKey, 'Meta:', e.metaKey);

        // Windows Key (Meta) -> Start Menu
        if (e.key === 'Meta' && !this.pressedKeys.has('d') && !this.pressedKeys.has('e')) {
            e.preventDefault();
            this.toggleStartMenu();
            return;
        }

        // Win + D -> Show Desktop
        if ((e.key === 'd' || e.key === 'D') && e.metaKey) {
            e.preventDefault();
            this.showDesktop();
            return;
        }

        // Win + E -> File Explorer
        if ((e.key === 'e' || e.key === 'E') && e.metaKey) {
            e.preventDefault();
            this.openExplorer();
            return;
        }

        // Alt + F4 -> Close focused window
        if (e.key === 'F4' && e.altKey) {
            e.preventDefault();
            this.closeActiveWindow();
            return;
        }

        // Ctrl + Alt + Delete -> Task Manager
        // Note: This is often intercepted by OS, checking mostly for completeness
        if (e.key === 'Delete' && e.ctrlKey && e.altKey) {
            e.preventDefault(); // Likely won't work
            this.openTaskManager();
            return;
        }

        // Alt + Tab -> Switch Window
        // Note: Also often intercepted
        if (e.key === 'Tab' && e.altKey) {
            e.preventDefault();
            this.cycleWindowFocus();
            return;
        }
    }

    handleKeyUp(e) {
        this.pressedKeys.delete(e.key);
    }

    /**
     * Actions
     */

    toggleStartMenu() {
        if (window.RetroWeb?.startMenu) {
            window.RetroWeb.startMenu.toggle();
        }
    }

    showDesktop() {
        if (window.RetroWeb?.windowManager) {
            const wm = window.RetroWeb.windowManager;
            // Check if all minimized (simple heuristic)
            const allMinimized = wm.windows.every(w => w.state === 'minimized');
            
            if (allMinimized) {
                // Restore all (that were active? naive restore for now)
                wm.windows.forEach(w => wm.restore(w.id));
            } else {
                // Minimize all
                wm.windows.forEach(w => wm.minimize(w.id));
            }
        }
    }

    openExplorer() {
        if (window.RetroWeb?.explorer) {
            window.RetroWeb.explorer.open('C:\\', 'My Computer');
        }
    }

    closeActiveWindow() {
        if (window.RetroWeb?.windowManager) {
            const wm = window.RetroWeb.windowManager;
            if (wm.focusedWindow) {
                wm.close(wm.focusedWindow.id);
            }
        }
    }

    openTaskManager() {
        // Placeholder for Task Manager
        // Check if already open
        // For now just alert
        if (window.RetroWeb?.windowManager) {
            window.RetroWeb.windowManager.alert('Task Manager not yet implemented.', 'System Security');
        }
    }

    cycleWindowFocus() {
        if (window.RetroWeb?.windowManager) {
            const wm = window.RetroWeb.windowManager;
            const windows = wm.windows.filter(w => w.state !== 'minimized');
            if (windows.length < 2) return;

            // Sort by z-index logic or just cycle array?
            // Windows usually cycles "Most Recently Used".
            // WM active window is windows[length-1] maybe?
            // windowManager doesn't maintain MRU list explicitly besides zIndex.
            
            // Simple cycle: Find focused, pick next.
            const currentIndex = windows.findIndex(w => w === wm.focusedWindow);
            let nextIndex = (currentIndex + 1) % windows.length;
            if (nextIndex === -1) nextIndex = 0;

            wm.focus(windows[nextIndex].id);
        }
    }
}

// Auto-initialize (but we export it to be cleaner if loaded by bootloader)
// const inputManager = new InputManager(); // Bootloader will import it
export const inputManager = new InputManager();
