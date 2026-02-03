/**
 * Path Resolution Utility
 * Handles Windows-style path parsing and manipulation
 */

class PathResolver {
    constructor() {
        this.separator = '\\';
        this.drives = ['C:', 'D:', 'E:'];
    }

    /**
     * Normalize a path (remove redundant separators, resolve . and ..)
     */
    normalize(path) {
        if (!path) return '';

        // Convert forward slashes to backslashes
        path = path.replace(/\//g, this.separator);

        // Remove duplicate separators
        path = path.replace(/\\+/g, this.separator);

        // Split into parts
        const parts = path.split(this.separator);
        const normalized = [];

        for (const part of parts) {
            if (part === '' || part === '.') {
                continue; // Skip empty and current directory
            } else if (part === '..') {
                // Go up one level (but not past root)
                if (normalized.length > 1) {
                    normalized.pop();
                }
            } else {
                normalized.push(part);
            }
        }

        // Rejoin with separator
        let result = normalized.join(this.separator);

        // Ensure drive letter format
        if (result.match(/^[A-Z]:$/i)) {
            result += this.separator;
        }

        return result || 'C:' + this.separator;
    }

    /**
     * Join multiple path segments
     */
    join(...segments) {
        const joined = segments.filter(s => s).join(this.separator);
        return this.normalize(joined);
    }

    /**
     * Get the directory name from a path
     */
    dirname(path) {
        path = this.normalize(path);
        const lastSep = path.lastIndexOf(this.separator);
        
        if (lastSep === -1) {
            return '.';
        }

        const dir = path.substring(0, lastSep);
        
        // If it's just a drive letter, add separator
        if (dir.match(/^[A-Z]:$/i)) {
            return dir + this.separator;
        }

        return dir || this.separator;
    }

    /**
     * Get the filename from a path
     */
    basename(path, ext = '') {
        path = this.normalize(path);
        const lastSep = path.lastIndexOf(this.separator);
        let name = lastSep === -1 ? path : path.substring(lastSep + 1);

        if (ext && name.endsWith(ext)) {
            name = name.substring(0, name.length - ext.length);
        }

        return name;
    }

    /**
     * Get the file extension
     */
    extname(path) {
        const name = this.basename(path);
        const lastDot = name.lastIndexOf('.');
        
        if (lastDot === -1 || lastDot === 0) {
            return '';
        }

        return name.substring(lastDot);
    }

    /**
     * Check if path is absolute
     */
    isAbsolute(path) {
        return /^[A-Z]:\\/i.test(path);
    }

    /**
     * Resolve a relative path to absolute
     */
    resolve(basePath, relativePath) {
        if (this.isAbsolute(relativePath)) {
            return this.normalize(relativePath);
        }

        return this.normalize(this.join(basePath, relativePath));
    }

    /**
     * Get the drive letter from a path
     */
    getDrive(path) {
        const match = path.match(/^([A-Z]:)/i);
        return match ? match[1].toUpperCase() : null;
    }

    /**
     * Check if path is root
     */
    isRoot(path) {
        path = this.normalize(path);
        return /^[A-Z]:\\?$/i.test(path);
    }

    /**
     * Get parent path
     */
    parent(path) {
        if (this.isRoot(path)) {
            return null;
        }
        return this.dirname(path);
    }

    /**
     * Split path into segments
     */
    split(path) {
        path = this.normalize(path);
        return path.split(this.separator).filter(s => s);
    }

    /**
     * Get relative path from one path to another
     */
    relative(from, to) {
        from = this.normalize(from);
        to = this.normalize(to);

        const fromParts = this.split(from);
        const toParts = this.split(to);

        // Find common base
        let i = 0;
        while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
            i++;
        }

        // Build relative path
        const upLevels = fromParts.length - i;
        const relativeParts = [];

        for (let j = 0; j < upLevels; j++) {
            relativeParts.push('..');
        }

        for (let j = i; j < toParts.length; j++) {
            relativeParts.push(toParts[j]);
        }

        return relativeParts.join(this.separator) || '.';
    }

    /**
     * Validate path format
     */
    isValid(path) {
        if (!path || typeof path !== 'string') {
            return false;
        }

        // Check for invalid characters
        const invalidChars = /[<>:"|?*]/;
        const pathWithoutDrive = path.replace(/^[A-Z]:/i, '');
        
        if (invalidChars.test(pathWithoutDrive)) {
            return false;
        }

        // Check if starts with valid drive letter
        if (!this.isAbsolute(path) && !path.startsWith('.')) {
            return false;
        }

        return true;
    }

    /**
     * Format path for display (shorten if too long)
     */
    format(path, maxLength = 50) {
        if (path.length <= maxLength) {
            return path;
        }

        const parts = this.split(path);
        if (parts.length <= 2) {
            return path;
        }

        const drive = parts[0];
        const filename = parts[parts.length - 1];
        const middle = '...';

        let formatted = drive + this.separator + middle + this.separator + filename;

        // Add more parts if we have room
        let i = parts.length - 2;
        while (i > 0 && formatted.length < maxLength) {
            const withPart = drive + this.separator + middle + this.separator + 
                           parts.slice(i).join(this.separator);
            if (withPart.length > maxLength) break;
            formatted = withPart;
            i--;
        }

        return formatted;
    }

    /**
     * Compare two paths for equality
     */
    equals(path1, path2) {
        return this.normalize(path1).toLowerCase() === 
               this.normalize(path2).toLowerCase();
    }

    /**
     * Check if path is a child of another path
     */
    isChildOf(childPath, parentPath) {
        childPath = this.normalize(childPath).toLowerCase();
        parentPath = this.normalize(parentPath).toLowerCase();

        if (!parentPath.endsWith(this.separator)) {
            parentPath += this.separator;
        }

        return childPath.startsWith(parentPath) && childPath !== parentPath;
    }
}

// Create singleton instance
const pathResolver = new PathResolver();

export { PathResolver, pathResolver };
