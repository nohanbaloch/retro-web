/**
 * IndexedDB Storage Backend for Virtual Filesystem
 * Handles persistent storage of files and directories
 */

class Storage {
    constructor() {
        this.dbName = 'RetroWebOS';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize the IndexedDB database
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('[Storage] IndexedDB initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object store for filesystem entries
                if (!db.objectStoreNames.contains('entries')) {
                    const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
                    entryStore.createIndex('path', 'path', { unique: true });
                    entryStore.createIndex('parentId', 'parentId', { unique: false });
                    entryStore.createIndex('name', 'name', { unique: false });
                    entryStore.createIndex('type', 'type', { unique: false });
                }

                // Create object store for metadata
                if (!db.objectStoreNames.contains('metadata')) {
                    const metaStore = db.createObjectStore('metadata', { keyPath: 'key' });
                }

                console.log('[Storage] Database schema created');
            };
        });
    }

    /**
     * Create a new entry (file or directory)
     */
    async createEntry(entry) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');
            const request = store.add(entry);

            request.onsuccess = () => {
                resolve(entry);
            };

            request.onerror = () => {
                reject(new Error(`Failed to create entry: ${entry.path}`));
            };
        });
    }

    /**
     * Read an entry by path
     */
    async getEntryByPath(path) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const index = store.index('path');
            const request = index.get(path);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(new Error(`Failed to read entry: ${path}`));
            };
        });
    }

    /**
     * Read an entry by ID
     */
    async getEntryById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(new Error(`Failed to read entry: ${id}`));
            };
        });
    }

    /**
     * Update an existing entry
     */
    async updateEntry(entry) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');
            const request = store.put(entry);

            request.onsuccess = () => {
                resolve(entry);
            };

            request.onerror = () => {
                reject(new Error(`Failed to update entry: ${entry.path}`));
            };
        });
    }

    /**
     * Delete an entry by ID
     */
    async deleteEntry(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error(`Failed to delete entry: ${id}`));
            };
        });
    }

    /**
     * Get all children of a directory
     */
    async getChildren(parentId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const index = store.index('parentId');
            const request = index.getAll(parentId);

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(new Error(`Failed to get children of: ${parentId}`));
            };
        });
    }

    /**
     * Get all entries (for debugging/admin)
     */
    async getAllEntries() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(new Error('Failed to get all entries'));
            };
        });
    }

    /**
     * Clear all entries (for reset/testing)
     */
    async clearAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries', 'metadata'], 'readwrite');
            
            const entriesStore = transaction.objectStore('entries');
            const metadataStore = transaction.objectStore('metadata');
            
            const clearEntries = entriesStore.clear();
            const clearMetadata = metadataStore.clear();

            transaction.oncomplete = () => {
                console.log('[Storage] All data cleared');
                resolve();
            };

            transaction.onerror = () => {
                reject(new Error('Failed to clear database'));
            };
        });
    }

    /**
     * Set metadata value
     */
    async setMetadata(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['metadata'], 'readwrite');
            const store = transaction.objectStore('metadata');
            const request = store.put({ key, value });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error(`Failed to set metadata: ${key}`));
            };
        });
    }

    /**
     * Get metadata value
     */
    async getMetadata(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['metadata'], 'readonly');
            const store = transaction.objectStore('metadata');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };

            request.onerror = () => {
                reject(new Error(`Failed to get metadata: ${key}`));
            };
        });
    }

    /**
     * Search entries by name pattern
     */
    async searchByName(pattern) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();

            request.onsuccess = () => {
                const entries = request.result || [];
                const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
                const matches = entries.filter(entry => regex.test(entry.name));
                resolve(matches);
            };

            request.onerror = () => {
                reject(new Error('Failed to search entries'));
            };
        });
    }
}

export { Storage };
