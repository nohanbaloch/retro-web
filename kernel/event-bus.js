/**
 * Event Bus
 * Central event routing system for kernel and processes
 */

export class EventBus {
    constructor(kernel) {
        this.kernel = kernel;
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        this.listeners.get(eventName).push(callback);
    }

    /**
     * Unsubscribe from an event
     */
    off(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            return;
        }

        const callbacks = this.listeners.get(eventName);
        const index = callbacks.indexOf(callback);
        
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit an event
     */
    emit(eventName, data = {}) {
        if (!this.listeners.has(eventName)) {
            return;
        }

        const callbacks = this.listeners.get(eventName);
        
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EVENT-BUS] Error in event handler for ${eventName}:`, error);
            }
        });
    }

    /**
     * Subscribe to an event once
     */
    once(eventName, callback) {
        const wrappedCallback = (data) => {
            callback(data);
            this.off(eventName, wrappedCallback);
        };

        this.on(eventName, wrappedCallback);
    }

    /**
     * Clear all listeners for an event
     */
    clear(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get listener count for an event
     */
    listenerCount(eventName) {
        return this.listeners.get(eventName)?.length || 0;
    }
}
