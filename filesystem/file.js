/**
 * File Class
 * Represents a file in the virtual filesystem
 */

import { mimeTypes } from './mime-types.js';

class File {
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.name = options.name || 'untitled.txt';
        this.path = options.path || '';
        this.type = 'file';
        this.parentId = options.parentId || null;
        this.content = options.content || '';
        this.size = options.size || 0;
        this.mimeType = options.mimeType || mimeTypes.getMimeType(this.name);
        
        // Timestamps
        const now = new Date();
        this.created = options.created || now;
        this.modified = options.modified || now;
        this.accessed = options.accessed || now;

        // Permissions
        this.permissions = options.permissions || {
            read: true,
            write: true,
            execute: false
        };

        // Attributes
        this.attributes = options.attributes || {
            hidden: false,
            system: false,
            readonly: false,
            archive: true
        };
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get file extension
     */
    getExtension() {
        return mimeTypes.getExtension(this.name);
    }

    /**
     * Get file icon
     */
    getIcon() {
        return mimeTypes.getIcon(this.name, false);
    }

    /**
     * Get file description
     */
    getDescription() {
        return mimeTypes.getDescription(this.name);
    }

    /**
     * Check if file is text-based
     */
    isText() {
        return mimeTypes.isText(this.name);
    }

    /**
     * Check if file is image
     */
    isImage() {
        return mimeTypes.isImage(this.name);
    }

    /**
     * Check if file is executable
     */
    isExecutable() {
        return mimeTypes.isExecutable(this.name);
    }

    /**
     * Update content and size
     */
    setContent(content) {
        this.content = content;
        this.size = this.calculateSize(content);
        this.modified = new Date();
        this.attributes.archive = true; // Mark as modified
    }

    /**
     * Calculate content size
     */
    calculateSize(content) {
        if (typeof content === 'string') {
            return new Blob([content]).size;
        } else if (content instanceof Blob) {
            return content.size;
        } else if (content instanceof ArrayBuffer) {
            return content.byteLength;
        }
        return 0;
    }

    /**
     * Get formatted size
     */
    getFormattedSize() {
        return this.formatBytes(this.size);
    }

    /**
     * Format bytes to human-readable string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Update accessed timestamp
     */
    markAccessed() {
        this.accessed = new Date();
    }

    /**
     * Clone file
     */
    clone() {
        return new File({
            name: this.name,
            path: this.path,
            parentId: this.parentId,
            content: this.content,
            size: this.size,
            mimeType: this.mimeType,
            created: new Date(this.created),
            modified: new Date(this.modified),
            accessed: new Date(this.accessed),
            permissions: { ...this.permissions },
            attributes: { ...this.attributes }
        });
    }

    /**
     * Serialize to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            path: this.path,
            type: this.type,
            parentId: this.parentId,
            content: this.content,
            size: this.size,
            mimeType: this.mimeType,
            created: this.created.toISOString(),
            modified: this.modified.toISOString(),
            accessed: this.accessed.toISOString(),
            permissions: this.permissions,
            attributes: this.attributes
        };
    }

    /**
     * Deserialize from plain object
     */
    static fromJSON(data) {
        return new File({
            id: data.id,
            name: data.name,
            path: data.path,
            parentId: data.parentId,
            content: data.content,
            size: data.size,
            mimeType: data.mimeType,
            created: new Date(data.created),
            modified: new Date(data.modified),
            accessed: new Date(data.accessed),
            permissions: data.permissions,
            attributes: data.attributes
        });
    }
}

export { File };
