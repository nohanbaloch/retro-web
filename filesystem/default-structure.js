/**
 * Default Directory Structure
 * Creates the initial Windows XP-style folder structure
 */

import { Directory } from './directory.js';
import { File } from './file.js';

class DefaultStructure {
    constructor() {
        this.structure = [];
    }

    /**
     * Create the default Windows XP directory structure
     */
    create() {
        const structure = [];

        // Root directory (C:\)
        const root = new Directory({
            id: 'root_c',
            name: 'C:',
            path: 'C:\\',
            parentId: null,
            attributes: { system: true }
        });
        structure.push(root);

        // Documents and Settings
        const docsAndSettings = this.createDir('docs_settings', 'Documents and Settings', 'C:\\Documents and Settings', 'root_c');
        structure.push(docsAndSettings);

        // User folder
        const userFolder = this.createDir('user_folder', 'User', 'C:\\Documents and Settings\\User', 'docs_settings');
        structure.push(userFolder);

        // Desktop
        const desktop = this.createDir('desktop', 'Desktop', 'C:\\Documents and Settings\\User\\Desktop', 'user_folder');
        structure.push(desktop);

        // My Documents
        const myDocuments = this.createDir('my_documents', 'My Documents', 'C:\\Documents and Settings\\User\\My Documents', 'user_folder');
        structure.push(myDocuments);

        // My Pictures
        const myPictures = this.createDir('my_pictures', 'My Pictures', 'C:\\Documents and Settings\\User\\My Documents\\My Pictures', 'my_documents');
        structure.push(myPictures);

        // My Music
        const myMusic = this.createDir('my_music', 'My Music', 'C:\\Documents and Settings\\User\\My Documents\\My Music', 'my_documents');
        structure.push(myMusic);

        // My Videos
        const myVideos = this.createDir('my_videos', 'My Videos', 'C:\\Documents and Settings\\User\\My Documents\\My Videos', 'my_documents');
        structure.push(myVideos);

        // Start Menu
        const startMenu = this.createDir('start_menu', 'Start Menu', 'C:\\Documents and Settings\\User\\Start Menu', 'user_folder');
        structure.push(startMenu);

        // Application Data
        const appData = this.createDir('app_data', 'Application Data', 'C:\\Documents and Settings\\User\\Application Data', 'user_folder', { hidden: true });
        structure.push(appData);

        // Program Files
        const programFiles = this.createDir('program_files', 'Program Files', 'C:\\Program Files', 'root_c', { system: true });
        structure.push(programFiles);

        // Windows
        const windows = this.createDir('windows', 'Windows', 'C:\\Windows', 'root_c', { system: true });
        structure.push(windows);

        // System32
        const system32 = this.createDir('system32', 'System32', 'C:\\Windows\\System32', 'windows', { system: true });
        structure.push(system32);

        // Temp
        const temp = this.createDir('temp', 'Temp', 'C:\\Windows\\Temp', 'windows', { hidden: true });
        structure.push(temp);

        // System Cache
        const systemCache = this.createDir('system_cache', 'Cache', 'C:\\Windows\\Cache', 'windows', { system: true, hidden: true });
        structure.push(systemCache);

        // User Config
        const userConfig = this.createDir('user_config', 'Config', 'C:\\Documents and Settings\\User\\Config', 'user_folder', { hidden: false });
        structure.push(userConfig);

        // Recycle Bin
        const recycleBin = this.createDir('recycle_bin', 'Recycle Bin', 'C:\\Recycle Bin', 'root_c', { system: true, hidden: true });
        structure.push(recycleBin);

        // Update parent-child relationships
        root.children = ['docs_settings', 'program_files', 'windows', 'recycle_bin'];
        docsAndSettings.children = ['user_folder'];
        userFolder.children = ['desktop', 'my_documents', 'start_menu', 'app_data', 'user_config'];
        myDocuments.children = ['my_pictures', 'my_music', 'my_videos'];
        windows.children = ['system32', 'temp', 'system_cache'];

        // Add sample files
        structure.push(...this.createSampleFiles());

        return structure;
    }

    /**
     * Helper to create a directory
     */
    createDir(id, name, path, parentId, attributes = {}) {
        return new Directory({
            id,
            name,
            path,
            parentId,
            attributes: {
                hidden: attributes.hidden || false,
                system: attributes.system || false,
                readonly: false
            }
        });
    }

    /**
     * Create sample files for demonstration
     */
    createSampleFiles() {
        const files = [];

        // Welcome file on Desktop
        const welcomeFile = new File({
            id: 'welcome_txt',
            name: 'Welcome.txt',
            path: 'C:\\Documents and Settings\\User\\Desktop\\Welcome.txt',
            parentId: 'desktop',
            content: `Welcome to Retro Web OS!

This is a fully functional web-based operating system inspired by Windows XP.

Features:
- Virtual filesystem with persistent storage
- Desktop environment with taskbar and start menu
- Window management (drag, minimize, maximize, close)
- Built-in applications (coming soon!)

Try the following:
1. Double-click icons on the desktop
2. Click the Start button to open the menu
3. Create and manage files
4. Explore the filesystem

Enjoy your nostalgic journey!

© 2026 Nohan Baloch`,
            mimeType: 'text/plain'
        });
        welcomeFile.size = welcomeFile.calculateSize(welcomeFile.content);
        files.push(welcomeFile);

        // README in My Documents
        const readmeFile = new File({
            id: 'readme_txt',
            name: 'README.txt',
            path: 'C:\\Documents and Settings\\User\\My Documents\\README.txt',
            parentId: 'my_documents',
            content: `My Documents Folder

This folder is designed to store your personal documents, pictures, music, and videos.

Subfolders:
- My Pictures: Store your images here
- My Music: Store your audio files here
- My Videos: Store your video files here

You can create new folders and organize your files as you like.`,
            mimeType: 'text/plain'
        });
        readmeFile.size = readmeFile.calculateSize(readmeFile.content);
        files.push(readmeFile);

        // System info file
        const systemInfo = new File({
            id: 'system_info',
            name: 'system.ini',
            path: 'C:\\Windows\\system.ini',
            parentId: 'windows',
            content: `[System]
OS=Retro Web OS
Version=0.3.0
Build=Phase 3
Architecture=Web
Kernel=JavaScript

[Boot]
BootDevice=IndexedDB
FileSystem=VFS

[Display]
Theme=Windows XP
Resolution=Auto

[User]
Name=User
Profile=C:\\Documents and Settings\\User`,
            mimeType: 'text/plain',
            attributes: {
                hidden: false,
                system: true,
                readonly: true,
                archive: false
            }
        });
        systemInfo.size = systemInfo.calculateSize(systemInfo.content);
        files.push(systemInfo);

        // Update parent directories to include these files
        return files;
    }

    /**
     * Get special folder paths
     */
    getSpecialFolders() {
        return {
            root: 'C:\\',
            desktop: 'C:\\Documents and Settings\\User\\Desktop',
            myDocuments: 'C:\\Documents and Settings\\User\\My Documents',
            myPictures: 'C:\\Documents and Settings\\User\\My Documents\\My Pictures',
            myMusic: 'C:\\Documents and Settings\\User\\My Documents\\My Music',
            myVideos: 'C:\\Documents and Settings\\User\\My Documents\\My Videos',
            startMenu: 'C:\\Documents and Settings\\User\\Start Menu',
            appData: 'C:\\Documents and Settings\\User\\Application Data',
            programFiles: 'C:\\Program Files',
            windows: 'C:\\Windows',
            system32: 'C:\\Windows\\System32',
            temp: 'C:\\Windows\\Temp',
            systemCache: 'C:\\Windows\\Cache',
            userConfig: 'C:\\Documents and Settings\\User\\Config',
            recycleBin: 'C:\\Recycle Bin'
        };
    }

    /**
     * Get special folder IDs
     */
    getSpecialFolderIds() {
        return {
            root: 'root_c',
            desktop: 'desktop',
            myDocuments: 'my_documents',
            myPictures: 'my_pictures',
            myMusic: 'my_music',
            myVideos: 'my_videos',
            startMenu: 'start_menu',
            appData: 'app_data',
            programFiles: 'program_files',
            windows: 'windows',
            system32: 'system32',
            temp: 'temp',
            recycleBin: 'recycle_bin'
        };
    }
}

// Create singleton instance
const defaultStructure = new DefaultStructure();

export { DefaultStructure, defaultStructure };
