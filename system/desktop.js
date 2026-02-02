/**
 * Desktop Manager
 * Manages desktop icons, background, and context menus
 */

class Desktop {
    constructor() {
        this.container = document.getElementById('desktop');
        this.icons = [];
        this.gridSize = 80;
        this.iconPositions = new Map();
        this.initialize();
    }

    /**
     * Initialize desktop
     */
    initialize() {
        if (!this.container) {
            console.error('[DESKTOP] Container not found');
            return;
        }

        this.setupDesktop();
        this.createDefaultIcons();
        this.attachEventListeners();

        // Register with kernel
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.desktop = this;
            console.log('[DESKTOP] Initialized');
        }
    }

    /**
     * Setup desktop styling
     */
    setupDesktop() {
        this.container.style.cssText = `
            width: 100%;
            height: 100%;
            background: #5A7EDC;
            position: relative;
            overflow: hidden;
        `;
    }

    /**
     * Create default desktop icons
     */
    createDefaultIcons() {
        const defaultIcons = [
            { name: 'My Computer', icon: '💻', x: 0, y: 0, action: 'mycomputer' },
            { name: 'My Documents', icon: '📁', x: 0, y: 1, action: 'mydocuments' },
            { name: 'Recycle Bin', icon: '🗑️', x: 0, y: 2, action: 'recyclebin' },
            { name: 'Notepad', icon: '📝', x: 0, y: 3, action: 'notepad' }
        ];

        defaultIcons.forEach(iconData => {
            this.addIcon(iconData);
        });
    }

    /**
     * Add icon to desktop
     */
    addIcon(iconData) {
        const { name, icon, x, y, action } = iconData;

        const iconElement = document.createElement('div');
        iconElement.className = 'desktop-icon';
        iconElement.dataset.action = action;
        
        const posX = x * this.gridSize + 10;
        const posY = y * this.gridSize + 10;

        iconElement.style.cssText = `
            position: absolute;
            left: ${posX}px;
            top: ${posY}px;
            width: ${this.gridSize - 10}px;
            height: ${this.gridSize}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            user-select: none;
            padding: 8px;
            border-radius: 4px;
        `;

        // Icon image
        const iconImg = document.createElement('div');
        iconImg.textContent = icon;
        iconImg.style.cssText = `
            font-size: 32px;
            margin-bottom: 4px;
        `;

        // Icon label
        const iconLabel = document.createElement('div');
        iconLabel.textContent = name;
        iconLabel.style.cssText = `
            font-size: 11px;
            color: white;
            text-align: center;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            word-wrap: break-word;
            max-width: 100%;
        `;

        iconElement.appendChild(iconImg);
        iconElement.appendChild(iconLabel);

        // Hover effect
        iconElement.addEventListener('mouseenter', () => {
            iconElement.style.background = 'rgba(255,255,255,0.2)';
        });
        iconElement.addEventListener('mouseleave', () => {
            if (!iconElement.classList.contains('selected')) {
                iconElement.style.background = 'transparent';
            }
        });

        // Double-click to open
        iconElement.addEventListener('dblclick', () => {
            this.handleIconAction(action, name, icon);
        });

        // Single click to select
        iconElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectIcon(iconElement);
        });

        this.container.appendChild(iconElement);
        this.icons.push({
            element: iconElement,
            name,
            icon,
            action,
            x,
            y
        });

        this.iconPositions.set(`${x},${y}`, iconElement);
    }

    /**
     * Select an icon
     */
    selectIcon(iconElement) {
        // Deselect all icons
        this.icons.forEach(icon => {
            icon.element.classList.remove('selected');
            icon.element.style.background = 'transparent';
        });

        // Select this icon
        iconElement.classList.add('selected');
        iconElement.style.background = 'rgba(49,106,197,0.5)';
        iconElement.style.border = '1px dotted white';
    }

    /**
     * Handle icon action
     */
    handleIconAction(action, name, icon) {
        console.log(`[DESKTOP] Opening: ${name}`);

        switch (action) {
            case 'mycomputer':
                this.openMyComputer();
                break;
            case 'mydocuments':
                this.openMyDocuments();
                break;
            case 'recyclebin':
                this.openRecycleBin();
                break;
            case 'notepad':
                this.launchApp('Notepad', '📝');
                break;
            default:
                this.launchApp(name, icon);
        }
    }

    /**
     * Open My Computer
     */
    openMyComputer() {
        if (window.RetroWeb?.windowManager) {
            const win = window.RetroWeb.windowManager.createWindow({
                title: 'My Computer',
                width: 700,
                height: 500,
                x: 150,
                y: 100,
                content: `
                    <div style="padding: 20px;">
                        <h2 style="margin-top: 0;">💻 My Computer</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 20px; margin-top: 20px;">
                            <div style="text-align: center; cursor: pointer;">
                                <div style="font-size: 48px;">💾</div>
                                <div style="font-size: 11px; margin-top: 8px;">Local Disk (C:)</div>
                            </div>
                            <div style="text-align: center; cursor: pointer;">
                                <div style="font-size: 48px;">📀</div>
                                <div style="font-size: 11px; margin-top: 8px;">CD Drive (D:)</div>
                            </div>
                            <div style="text-align: center; cursor: pointer;">
                                <div style="font-size: 48px;">📁</div>
                                <div style="font-size: 11px; margin-top: 8px;">Documents</div>
                            </div>
                        </div>
                    </div>
                `
            });

            this.emitWindowCreated(win.id, 'My Computer', '💻');
        }
    }

    /**
     * Open My Documents
     */
    openMyDocuments() {
        if (window.RetroWeb?.windowManager) {
            const win = window.RetroWeb.windowManager.createWindow({
                title: 'My Documents',
                width: 600,
                height: 400,
                x: 200,
                y: 150,
                content: `
                    <div style="padding: 20px;">
                        <h2 style="margin-top: 0;">📁 My Documents</h2>
                        <p>Your documents folder is empty.</p>
                    </div>
                `
            });

            this.emitWindowCreated(win.id, 'My Documents', '📁');
        }
    }

    /**
     * Open Recycle Bin
     */
    openRecycleBin() {
        if (window.RetroWeb?.windowManager) {
            const win = window.RetroWeb.windowManager.createWindow({
                title: 'Recycle Bin',
                width: 500,
                height: 350,
                x: 250,
                y: 200,
                content: `
                    <div style="padding: 20px;">
                        <h2 style="margin-top: 0;">🗑️ Recycle Bin</h2>
                        <p>Recycle Bin is empty.</p>
                    </div>
                `
            });

            this.emitWindowCreated(win.id, 'Recycle Bin', '🗑️');
        }
    }

    /**
     * Launch an application
     */
    launchApp(name, icon) {
        if (window.RetroWeb?.windowManager) {
            const win = window.RetroWeb.windowManager.createWindow({
                title: name,
                width: 600,
                height: 400,
                x: 100 + Math.random() * 100,
                y: 100 + Math.random() * 100,
                content: `
                    <div style="padding: 20px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
                        <h2>${name}</h2>
                        <p>Application content will be implemented here.</p>
                    </div>
                `
            });

            this.emitWindowCreated(win.id, name, icon);
        }
    }

    /**
     * Emit window created event
     */
    emitWindowCreated(windowId, title, icon) {
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.kernel.emit('window:created', {
                windowId,
                title,
                icon
            });
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Click on desktop to deselect icons
        this.container.addEventListener('click', () => {
            this.icons.forEach(icon => {
                icon.element.classList.remove('selected');
                icon.element.style.background = 'transparent';
                icon.element.style.border = 'none';
            });
        });

        // Right-click context menu (placeholder)
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            console.log('[DESKTOP] Context menu at', e.clientX, e.clientY);
            // TODO: Implement context menu
        });
    }

    /**
     * Remove icon from desktop
     */
    removeIcon(name) {
        const index = this.icons.findIndex(icon => icon.name === name);
        if (index !== -1) {
            this.icons[index].element.remove();
            this.icons.splice(index, 1);
        }
    }
}

// Auto-initialize
const desktop = new Desktop();

export { Desktop };
