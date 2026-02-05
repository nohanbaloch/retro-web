/**
 * Clipboard System
 * Manages copy/paste operations across applications and tracks history.
 */

class Clipboard {
    constructor() {
        this.currentData = null; // { type: 'text'|'files', data: any, metadata: {} }
        this.history = [];
        this.maxHistory = 20;
        this.listeners = new Set();
        
        this.initialize();
    }

    initialize() {
        // Listen for system focus events to potentially sync with native clipboard?
        // Note: Browser restrictions prevent reading clipboard without user interaction.
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.clipboard = this;
            console.log('[CLIPBOARD] Initialized');
        }
    }

    /**
     * Write data to clipboard
     * @param {Object} item - { type, data, metadata }
     */
    async write(item) {
        const { type, data, metadata = {} } = item;
        
        this.currentData = {
            type,
            data,
            metadata,
            timestamp: Date.now()
        };

        this.addToHistory(this.currentData);

        // Sync with browser clipboard if text
        if (type === 'text') {
            try {
                await navigator.clipboard.writeText(data);
            } catch (e) {
                console.warn('[CLIPBOARD] Failed to sync with native clipboard:', e);
            }
        }

        this.notifyListeners();
    }

    /**
     * Read data from clipboard
     * @returns {Object|null}
     */
    async read() {
        // TODO: Try reading native clipboard text here if supported/allowed
        return this.currentData;
    }

    /**
     * Clear clipboard
     */
    clear() {
        this.currentData = null;
        this.notifyListeners();
    }

    /**
     * Add item to history
     */
    addToHistory(item) {
        // Avoid duplicates at the top
        if (this.history.length > 0) {
            const last = this.history[0];
            if (last.type === item.type && JSON.stringify(last.data) === JSON.stringify(item.data)) {
                return;
            }
        }
        
        this.history.unshift(item);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
    }

    /**
     * Get clipboard history
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Subscribe to changes
     */
    onChange(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentData));
    }
}

// Export singleton
export const clipboard = new Clipboard();
