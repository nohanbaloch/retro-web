/**
 * Directory Class
 * Represents a directory in the virtual filesystem
 */

import { mimeTypes } from './mime-types.js';

class Directory {
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.name = options.name || 'New Folder';
        this.path = options.path || '';
        this.type = 'directory';
        this.parentId = options.parentId || null;
        this.children = options.children || [];
        
        // Timestamps
        const now = new Date();
        this.created = options.created || now;
        this.modified = options.modified || now;
        this.accessed = options.accessed || now;

        // Permissions
        this.permissions = options.permissions || {
            read: true,
            write: true,
            execute: true // Execute for directories means "can list contents"
        };

        // Attributes
        this.attributes = options.attributes || {
            hidden: false,
            system: false,
            readonly: false
        };
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'dir_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get directory icon
     */
    getIcon() {
        return mimeTypes.folderIcon;
    }

    /**
     * Get directory description
     */
    getDescription() {
        return 'File Folder';
    }

    /**
     * Add child ID
     */
    addChild(childId) {
        if (!this.children.includes(childId)) {
            this.children.push(childId);
            this.modified = new Date();
        }
    }

    /**
     * Remove child ID
     */
    removeChild(childId) {
        const index = this.children.indexOf(childId);
        if (index !== -1) {
            this.children.splice(index, 1);
            this.modified = new Date();
        }
    }

    /**
     * Check if has children
     */
    hasChildren() {
        return this.children.length > 0;
    }

    /**
     * Get child count
     */
    getChildCount() {
        return this.children.length;
    }

    /**
     * Update accessed timestamp
     */
    markAccessed() {
        this.accessed = new Date();
    }

    /**
     * Clone directory (without children)
     */
    clone() {
        return new Directory({
            name: this.name,
            path: this.path,
            parentId: this.parentId,
            children: [...this.children],
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
            children: this.children,
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
        return new Directory({
            id: data.id,
            name: data.name,
            path: data.path,
            parentId: data.parentId,
            children: data.children || [],
            created: new Date(data.created),
            modified: new Date(data.modified),
            accessed: new Date(data.accessed),
            permissions: data.permissions,
            attributes: data.attributes
        });
    }
}

export { Directory };
