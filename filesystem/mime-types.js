/**
 * MIME Type Detection and File Associations
 * Maps file extensions to MIME types and default applications
 */

class MimeTypes {
    constructor() {
        // MIME type mappings
        this.types = {
            // Text files
            '.txt': 'text/plain',
            '.log': 'text/plain',
            '.md': 'text/markdown',
            '.json': 'application/json',
            '.xml': 'application/xml',
            '.html': 'text/html',
            '.htm': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.ts': 'text/typescript',

            // Documents
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.rtf': 'application/rtf',

            // Images
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.ico': 'image/x-icon',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',

            // Audio
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.wma': 'audio/x-ms-wma',

            // Video
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska',
            '.mov': 'video/quicktime',
            '.wmv': 'video/x-ms-wmv',
            '.flv': 'video/x-flv',

            // Archives
            '.zip': 'application/zip',
            '.rar': 'application/x-rar-compressed',
            '.7z': 'application/x-7z-compressed',
            '.tar': 'application/x-tar',
            '.gz': 'application/gzip',

            // Executables
            '.exe': 'application/x-msdownload',
            '.dll': 'application/x-msdownload',
            '.bat': 'application/x-bat',
            '.cmd': 'application/x-bat',
            '.com': 'application/x-msdownload',

            // Other
            '.bin': 'application/octet-stream',
            '.dat': 'application/octet-stream'
        };

        // Icon associations (emoji for now)
        this.icons = {
            // Text
            'text/plain': '📄',
            'text/markdown': '📝',
            'application/json': '📋',
            'text/html': '🌐',
            'text/css': '🎨',
            'text/javascript': '📜',

            // Documents
            'application/pdf': '📕',
            'application/msword': '📘',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
            'application/vnd.ms-excel': '📊',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
            'application/vnd.ms-powerpoint': '📽️',

            // Images
            'image/jpeg': '🖼️',
            'image/png': '🖼️',
            'image/gif': '🖼️',
            'image/bmp': '🖼️',
            'image/svg+xml': '🎨',

            // Audio
            'audio/mpeg': '🎵',
            'audio/wav': '🎵',
            'audio/ogg': '🎵',

            // Video
            'video/mp4': '🎬',
            'video/x-msvideo': '🎬',
            'video/quicktime': '🎬',

            // Archives
            'application/zip': '📦',
            'application/x-rar-compressed': '📦',
            'application/x-7z-compressed': '📦',

            // Executables
            'application/x-msdownload': '⚙️',
            'application/x-bat': '⚙️',

            // Default
            'application/octet-stream': '📎'
        };

        // Default application associations
        this.defaultApps = {
            'text/plain': 'notepad',
            'text/markdown': 'notepad',
            'application/json': 'notepad',
            'text/html': 'notepad',
            'text/css': 'notepad',
            'text/javascript': 'notepad',
            'image/jpeg': 'paint',
            'image/png': 'paint',
            'image/gif': 'paint',
            'image/bmp': 'paint',
            'application/pdf': 'reader',
            'application/x-msdownload': 'execute',
            'application/x-bat': 'terminal'
        };

        // Folder icon
        this.folderIcon = '📁';
    }

    /**
     * Get MIME type from file extension
     */
    getMimeType(filename) {
        const ext = this.getExtension(filename);
        return this.types[ext] || 'application/octet-stream';
    }

    /**
     * Get file extension from filename
     */
    getExtension(filename) {
        if (!filename || typeof filename !== 'string') {
            return '';
        }

        const lastDot = filename.lastIndexOf('.');
        if (lastDot === -1 || lastDot === 0) {
            return '';
        }

        return filename.substring(lastDot).toLowerCase();
    }

    /**
     * Get icon for file
     */
    getIcon(filename, isDirectory = false) {
        if (isDirectory) {
            return this.folderIcon;
        }

        const mimeType = this.getMimeType(filename);
        return this.icons[mimeType] || this.icons['application/octet-stream'];
    }

    /**
     * Get default application for file
     */
    getDefaultApp(filename) {
        const mimeType = this.getMimeType(filename);
        return this.defaultApps[mimeType] || null;
    }

    /**
     * Check if file is text-based
     */
    isText(filename) {
        const mimeType = this.getMimeType(filename);
        return mimeType.startsWith('text/') || 
               mimeType === 'application/json' ||
               mimeType === 'application/xml';
    }

    /**
     * Check if file is image
     */
    isImage(filename) {
        const mimeType = this.getMimeType(filename);
        return mimeType.startsWith('image/');
    }

    /**
     * Check if file is audio
     */
    isAudio(filename) {
        const mimeType = this.getMimeType(filename);
        return mimeType.startsWith('audio/');
    }

    /**
     * Check if file is video
     */
    isVideo(filename) {
        const mimeType = this.getMimeType(filename);
        return mimeType.startsWith('video/');
    }

    /**
     * Check if file is executable
     */
    isExecutable(filename) {
        const ext = this.getExtension(filename);
        return ['.exe', '.bat', '.cmd', '.com'].includes(ext);
    }

    /**
     * Check if file is archive
     */
    isArchive(filename) {
        const mimeType = this.getMimeType(filename);
        return mimeType.includes('zip') || 
               mimeType.includes('rar') ||
               mimeType.includes('7z') ||
               mimeType.includes('tar') ||
               mimeType.includes('gzip');
    }

    /**
     * Get file type category
     */
    getCategory(filename) {
        if (this.isText(filename)) return 'text';
        if (this.isImage(filename)) return 'image';
        if (this.isAudio(filename)) return 'audio';
        if (this.isVideo(filename)) return 'video';
        if (this.isExecutable(filename)) return 'executable';
        if (this.isArchive(filename)) return 'archive';
        return 'other';
    }

    /**
     * Get human-readable file type description
     */
    getDescription(filename) {
        const ext = this.getExtension(filename);
        const mimeType = this.getMimeType(filename);

        const descriptions = {
            '.txt': 'Text Document',
            '.log': 'Log File',
            '.md': 'Markdown Document',
            '.json': 'JSON File',
            '.xml': 'XML Document',
            '.html': 'HTML Document',
            '.css': 'CSS Stylesheet',
            '.js': 'JavaScript File',
            '.pdf': 'PDF Document',
            '.doc': 'Word Document',
            '.docx': 'Word Document',
            '.xls': 'Excel Spreadsheet',
            '.xlsx': 'Excel Spreadsheet',
            '.jpg': 'JPEG Image',
            '.jpeg': 'JPEG Image',
            '.png': 'PNG Image',
            '.gif': 'GIF Image',
            '.bmp': 'Bitmap Image',
            '.mp3': 'MP3 Audio',
            '.wav': 'WAV Audio',
            '.mp4': 'MP4 Video',
            '.avi': 'AVI Video',
            '.zip': 'ZIP Archive',
            '.rar': 'RAR Archive',
            '.exe': 'Application',
            '.bat': 'Batch File'
        };

        return descriptions[ext] || 'File';
    }

    /**
     * Register custom MIME type
     */
    register(extension, mimeType, icon = null, defaultApp = null) {
        if (!extension.startsWith('.')) {
            extension = '.' + extension;
        }

        this.types[extension.toLowerCase()] = mimeType;

        if (icon) {
            this.icons[mimeType] = icon;
        }

        if (defaultApp) {
            this.defaultApps[mimeType] = defaultApp;
        }
    }
}

// Create singleton instance
const mimeTypes = new MimeTypes();

export { MimeTypes, mimeTypes };
