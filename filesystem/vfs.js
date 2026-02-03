/**
 * Virtual Filesystem (VFS)
 * Main coordinator for filesystem operations
 */

import { Storage } from './storage.js';
import { File } from './file.js';
import { Directory } from './directory.js';
import { pathResolver } from './path-resolver.js';
import { mimeTypes } from './mime-types.js';
import { defaultStructure } from './default-structure.js';

class VFS {
    constructor(kernel = null) {
        this.kernel = kernel;
        this.storage = new Storage();
        this.initialized = false;
        this.cache = new Map(); // Path -> Entry cache
    }

    /**
     * Initialize the filesystem
     */
    async initialize() {
        try {
            console.log('[VFS] Initializing virtual filesystem...');

            // Initialize storage backend
            await this.storage.initialize();

            // Check if filesystem already exists
            const isInitialized = await this.storage.getMetadata('initialized');

            if (!isInitialized) {
                console.log('[VFS] First boot detected, creating default structure...');
                await this.createDefaultStructure();
                await this.storage.setMetadata('initialized', true);
                await this.storage.setMetadata('version', '1.0');
            } else {
                console.log('[VFS] Filesystem already initialized, loading...');
            }

            // Build cache
            await this.buildCache();

            this.initialized = true;
            this.emit('fs:initialized', { drives: ['C:'] });
            console.log('[VFS] Filesystem ready');

            return true;
        } catch (error) {
            console.error('[VFS] Initialization failed:', error);
            this.emit('fs:error', { operation: 'initialize', error: error.message });
            throw error;
        }
    }

    /**
     * Create default directory structure
     */
    async createDefaultStructure() {
        const entries = defaultStructure.create();
        
        for (const entry of entries) {
            await this.storage.createEntry(entry.toJSON());
        }

        console.log(`[VFS] Created ${entries.length} default entries`);
    }

    /**
     * Build path cache for faster lookups
     */
    async buildCache() {
        const entries = await this.storage.getAllEntries();
        this.cache.clear();

        for (const entry of entries) {
            this.cache.set(entry.path, entry);
        }

        console.log(`[VFS] Cache built with ${this.cache.size} entries`);
    }

    /**
     * Create a new file
     */
    async createFile(path, content = '', options = {}) {
        try {
            path = pathResolver.normalize(path);

            // Check if file already exists
            if (await this.exists(path)) {
                throw new Error(`File already exists: ${path}`);
            }

            // Get parent directory
            const parentPath = pathResolver.dirname(path);
            const parentEntry = await this.getEntry(parentPath);

            if (!parentEntry || parentEntry.type !== 'directory') {
                throw new Error(`Parent directory not found: ${parentPath}`);
            }

            // Create file
            const file = new File({
                name: pathResolver.basename(path),
                path: path,
                parentId: parentEntry.id,
                content: content,
                ...options
            });

            file.size = file.calculateSize(content);

            // Save to storage
            await this.storage.createEntry(file.toJSON());

            // Update parent directory
            const parent = Directory.fromJSON(parentEntry);
            parent.addChild(file.id);
            await this.storage.updateEntry(parent.toJSON());

            // Update cache
            this.cache.set(path, file.toJSON());
            this.cache.set(parentPath, parent.toJSON());

            this.emit('fs:file:created', { path, file: file.toJSON() });
            console.log(`[VFS] File created: ${path}`);

            return file.toJSON();
        } catch (error) {
            console.error('[VFS] Create file failed:', error);
            this.emit('fs:error', { operation: 'createFile', path, error: error.message });
            throw error;
        }
    }

    /**
     * Read file content
     */
    async readFile(path) {
        try {
            path = pathResolver.normalize(path);
            const entry = await this.getEntry(path);

            if (!entry) {
                throw new Error(`File not found: ${path}`);
            }

            if (entry.type !== 'file') {
                throw new Error(`Not a file: ${path}`);
            }

            // Update accessed time
            const file = File.fromJSON(entry);
            file.markAccessed();
            await this.storage.updateEntry(file.toJSON());
            this.cache.set(path, file.toJSON());

            this.emit('fs:file:read', { path });
            return file.content;
        } catch (error) {
            console.error('[VFS] Read file failed:', error);
            this.emit('fs:error', { operation: 'readFile', path, error: error.message });
            throw error;
        }
    }

    /**
     * Write content to file
     */
    async writeFile(path, content) {
        try {
            path = pathResolver.normalize(path);
            const entry = await this.getEntry(path);

            if (!entry) {
                // File doesn't exist, create it
                return await this.createFile(path, content);
            }

            if (entry.type !== 'file') {
                throw new Error(`Not a file: ${path}`);
            }

            // Update file
            const file = File.fromJSON(entry);
            file.setContent(content);
            
            await this.storage.updateEntry(file.toJSON());
            this.cache.set(path, file.toJSON());

            this.emit('fs:file:written', { path, size: file.size });
            console.log(`[VFS] File written: ${path}`);

            return file.toJSON();
        } catch (error) {
            console.error('[VFS] Write file failed:', error);
            this.emit('fs:error', { operation: 'writeFile', path, error: error.message });
            throw error;
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(path) {
        try {
            path = pathResolver.normalize(path);
            const entry = await this.getEntry(path);

            if (!entry) {
                throw new Error(`File not found: ${path}`);
            }

            if (entry.type !== 'file') {
                throw new Error(`Not a file: ${path}`);
            }

            // Remove from parent directory
            const parentPath = pathResolver.dirname(path);
            const parentEntry = await this.getEntry(parentPath);
            
            if (parentEntry) {
                const parent = Directory.fromJSON(parentEntry);
                parent.removeChild(entry.id);
                await this.storage.updateEntry(parent.toJSON());
                this.cache.set(parentPath, parent.toJSON());
            }

            // Delete file
            await this.storage.deleteEntry(entry.id);
            this.cache.delete(path);

            this.emit('fs:file:deleted', { path });
            console.log(`[VFS] File deleted: ${path}`);

            return true;
        } catch (error) {
            console.error('[VFS] Delete file failed:', error);
            this.emit('fs:error', { operation: 'deleteFile', path, error: error.message });
            throw error;
        }
    }

    /**
     * Create a new directory
     */
    async createDirectory(path) {
        try {
            path = pathResolver.normalize(path);

            // Check if directory already exists
            if (await this.exists(path)) {
                throw new Error(`Directory already exists: ${path}`);
            }

            // Get parent directory
            const parentPath = pathResolver.dirname(path);
            const parentEntry = await this.getEntry(parentPath);

            if (!parentEntry || parentEntry.type !== 'directory') {
                throw new Error(`Parent directory not found: ${parentPath}`);
            }

            // Create directory
            const dir = new Directory({
                name: pathResolver.basename(path),
                path: path,
                parentId: parentEntry.id
            });

            // Save to storage
            await this.storage.createEntry(dir.toJSON());

            // Update parent directory
            const parent = Directory.fromJSON(parentEntry);
            parent.addChild(dir.id);
            await this.storage.updateEntry(parent.toJSON());

            // Update cache
            this.cache.set(path, dir.toJSON());
            this.cache.set(parentPath, parent.toJSON());

            this.emit('fs:directory:created', { path });
            console.log(`[VFS] Directory created: ${path}`);

            return dir.toJSON();
        } catch (error) {
            console.error('[VFS] Create directory failed:', error);
            this.emit('fs:error', { operation: 'createDirectory', path, error: error.message });
            throw error;
        }
    }

    /**
     * List directory contents
     */
    async listDirectory(path) {
        try {
            path = pathResolver.normalize(path);
            const entry = await this.getEntry(path);

            if (!entry) {
                throw new Error(`Directory not found: ${path}`);
            }

            if (entry.type !== 'directory') {
                throw new Error(`Not a directory: ${path}`);
            }

            // Get children
            const children = await this.storage.getChildren(entry.id);

            // Update accessed time
            const dir = Directory.fromJSON(entry);
            dir.markAccessed();
            await this.storage.updateEntry(dir.toJSON());
            this.cache.set(path, dir.toJSON());

            this.emit('fs:directory:listed', { path, count: children.length });

            return children;
        } catch (error) {
            console.error('[VFS] List directory failed:', error);
            this.emit('fs:error', { operation: 'listDirectory', path, error: error.message });
            throw error;
        }
    }

    /**
     * Delete a directory
     */
    async deleteDirectory(path, recursive = false) {
        try {
            path = pathResolver.normalize(path);
            const entry = await this.getEntry(path);

            if (!entry) {
                throw new Error(`Directory not found: ${path}`);
            }

            if (entry.type !== 'directory') {
                throw new Error(`Not a directory: ${path}`);
            }

            const dir = Directory.fromJSON(entry);

            // Check if directory has children
            if (dir.hasChildren() && !recursive) {
                throw new Error(`Directory not empty: ${path}`);
            }

            // Delete children recursively if needed
            if (recursive && dir.hasChildren()) {
                const children = await this.storage.getChildren(dir.id);
                for (const child of children) {
                    if (child.type === 'directory') {
                        await this.deleteDirectory(child.path, true);
                    } else {
                        await this.deleteFile(child.path);
                    }
                }
            }

            // Remove from parent directory
            const parentPath = pathResolver.dirname(path);
            const parentEntry = await this.getEntry(parentPath);
            
            if (parentEntry) {
                const parent = Directory.fromJSON(parentEntry);
                parent.removeChild(entry.id);
                await this.storage.updateEntry(parent.toJSON());
                this.cache.set(parentPath, parent.toJSON());
            }

            // Delete directory
            await this.storage.deleteEntry(entry.id);
            this.cache.delete(path);

            this.emit('fs:directory:deleted', { path });
            console.log(`[VFS] Directory deleted: ${path}`);

            return true;
        } catch (error) {
            console.error('[VFS] Delete directory failed:', error);
            this.emit('fs:error', { operation: 'deleteDirectory', path, error: error.message });
            throw error;
        }
    }

    /**
     * Check if path exists
     */
    async exists(path) {
        path = pathResolver.normalize(path);
        const entry = await this.getEntry(path);
        return entry !== null;
    }

    /**
     * Get entry information
     */
    async getInfo(path) {
        path = pathResolver.normalize(path);
        return await this.getEntry(path);
    }

    /**
     * Get entry type (file or directory)
     */
    async getType(path) {
        const entry = await this.getInfo(path);
        return entry ? entry.type : null;
    }

    /**
     * Get entry from cache or storage
     */
    async getEntry(path) {
        path = pathResolver.normalize(path);

        // Check cache first
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        // Fetch from storage
        const entry = await this.storage.getEntryByPath(path);
        
        if (entry) {
            this.cache.set(path, entry);
        }

        return entry;
    }

    /**
     * Rename file or directory
     */
    async rename(oldPath, newPath) {
        try {
            oldPath = pathResolver.normalize(oldPath);
            newPath = pathResolver.normalize(newPath);

            const entry = await this.getEntry(oldPath);
            if (!entry) {
                throw new Error(`Entry not found: ${oldPath}`);
            }

            // Update entry
            entry.name = pathResolver.basename(newPath);
            entry.path = newPath;
            entry.modified = new Date().toISOString();

            await this.storage.updateEntry(entry);

            // Update cache
            this.cache.delete(oldPath);
            this.cache.set(newPath, entry);

            this.emit('fs:file:renamed', { oldPath, newPath });
            console.log(`[VFS] Renamed: ${oldPath} -> ${newPath}`);

            return entry;
        } catch (error) {
            console.error('[VFS] Rename failed:', error);
            this.emit('fs:error', { operation: 'rename', path: oldPath, error: error.message });
            throw error;
        }
    }

    /**
     * Copy file
     */
    async copyFile(srcPath, destPath) {
        try {
            const content = await this.readFile(srcPath);
            const srcInfo = await this.getInfo(srcPath);
            
            await this.createFile(destPath, content, {
                mimeType: srcInfo.mimeType,
                permissions: srcInfo.permissions,
                attributes: { ...srcInfo.attributes, archive: true }
            });

            this.emit('fs:file:copied', { srcPath, destPath });
            console.log(`[VFS] Copied: ${srcPath} -> ${destPath}`);

            return true;
        } catch (error) {
            console.error('[VFS] Copy file failed:', error);
            this.emit('fs:error', { operation: 'copyFile', path: srcPath, error: error.message });
            throw error;
        }
    }

    /**
     * Move file
     */
    async moveFile(srcPath, destPath) {
        try {
            await this.copyFile(srcPath, destPath);
            await this.deleteFile(srcPath);

            this.emit('fs:file:moved', { srcPath, destPath });
            console.log(`[VFS] Moved: ${srcPath} -> ${destPath}`);

            return true;
        } catch (error) {
            console.error('[VFS] Move file failed:', error);
            this.emit('fs:error', { operation: 'moveFile', path: srcPath, error: error.message });
            throw error;
        }
    }

    /**
     * Search for files
     */
    async search(pattern, directory = 'C:\\') {
        try {
            const results = await this.storage.searchByName(pattern);
            
            // Filter by directory if specified
            if (directory !== 'C:\\') {
                directory = pathResolver.normalize(directory);
                return results.filter(entry => 
                    pathResolver.isChildOf(entry.path, directory) || 
                    pathResolver.equals(entry.path, directory)
                );
            }

            return results;
        } catch (error) {
            console.error('[VFS] Search failed:', error);
            this.emit('fs:error', { operation: 'search', error: error.message });
            throw error;
        }
    }

    /**
     * Get special folder paths
     */
    getSpecialFolders() {
        return defaultStructure.getSpecialFolders();
    }

    /**
     * Emit event through kernel
     */
    emit(event, data) {
        if (this.kernel && this.kernel.emit) {
            this.kernel.emit(event, data);
        }
    }

    /**
     * Reset filesystem (for testing)
     */
    async reset() {
        await this.storage.clearAll();
        this.cache.clear();
        this.initialized = false;
        console.log('[VFS] Filesystem reset');
    }
}

export { VFS };
