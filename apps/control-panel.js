/**
 * Control Panel Application
 * System configuration and settings
 */

class ControlPanel {
    constructor() {
        this.windowManager = null;
        this.vfs = null;
        this.windowId = null;
        this.currentView = 'home'; // home, system, display, users, programs
    }

    /**
     * Initialize with system references
     */
    init(windowManager, vfs) {
        this.windowManager = windowManager;
        this.vfs = vfs;
    }

    /**
     * Open Control Panel window
     */
    open() {
        if (!this.windowManager) {
            console.error('[ControlPanel] WindowManager not initialized');
            return;
        }

        // If already open, focus it
        if (this.windowId && document.getElementById(this.windowId)) {
            this.windowManager.focusWindow(this.windowId);
            return;
        }

        const win = this.windowManager.createWindow({
            title: 'Control Panel',
            width: 700,
            height: 500,
            x: 100 + Math.random() * 50,
            y: 80 + Math.random() * 50,
            icon: '⚙️',
            content: this.createControlPanelHTML()
        });

        this.windowId = win.id;
        this.currentView = 'home';
        
        // Remove default padding
        const contentArea = win.element.querySelector('.window-content');
        if (contentArea) {
            contentArea.style.padding = '0';
        }

        this.setupEventListeners(win.id);
        this.renderView(win.id, 'home'); // Initial render

        return win;
    }

    /**
     * Create Control Panel HTML Skeleton
     */
    createControlPanelHTML() {
        return `
            <div class="control-panel-container" style="display: flex; height: 100%; font-family: 'Tahoma', sans-serif;">
                <!-- Sidebar -->
                <div class="cp-sidebar" style="width: 200px; background: linear-gradient(180deg, #748AFF 0%, #4057D3 100%); color: white; padding: 20px 15px; display: flex; flex-direction: column;">
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 20px;">Control Panel</div>
                    
                    <div id="cp-sidebar-links">
                        <div class="cp-link" data-view="home" style="padding: 5px 0; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                            <span>🏠</span> Home
                        </div>
                        <div style="margin-top: 20px; font-size: 11px; opacity: 0.8; line-height: 1.5;">
                            Use the Control Panel to change settings and customize the functionality of your computer.
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="cp-content" style="flex: 1; background: #fff; display: flex; flex-direction: column; overflow: hidden;">
                    <!-- Navigation Bar -->
                    <div style="padding: 10px 20px; border-bottom: 1px solid #ccc; background: #f5f5f5; display: flex; align-items: center;">
                        <span style="font-weight: bold;">Address</span>
                        <div style="margin-left: 10px; flex: 1; border: 1px solid #7F9DB9; padding: 3px; background: #fff; font-size: 11px;">
                            Control Panel
                        </div>
                    </div>

                    <!-- View Area -->
                    <div id="cp-view-area" style="flex: 1; overflow-y: auto; padding: 20px;">
                        Loading...
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup Event Listeners
     */
    setupEventListeners(windowId) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        const sidebarLinks = windowEl.querySelectorAll('.cp-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.renderView(windowId, link.dataset.view);
            });
        });
    }

    /**
     * Render specific view
     */
    renderView(windowId, view) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        const viewArea = windowEl.querySelector('#cp-view-area');
        this.currentView = view;

        // Clean event listeners if needed (not implemented here)
        
        switch (view) {
            case 'home':
                this.renderHome(viewArea, windowId);
                break;
            case 'system':
                this.renderSystem(viewArea);
                break;
            case 'display':
                this.renderDisplay(viewArea);
                break;
            case 'users':
                this.renderUsers(viewArea);
                break;
            case 'programs':
                this.renderPrograms(viewArea);
                break;
            default:
                viewArea.innerHTML = 'View not found';
        }
    }

    /**
     * Render Home View (Category View)
     */
    renderHome(container, windowId) {
        const categories = [
            { id: 'system', name: 'System', icon: '💻', desc: 'View system information and settings' },
            { id: 'display', name: 'Appearance and Themes', icon: '🎨', desc: 'Change the look of your desktop' },
            { id: 'users', name: 'User Accounts', icon: '👤', desc: 'Change user account settings' },
            { id: 'programs', name: 'Add or Remove Programs', icon: '📦', desc: 'Install or remove programs' },
        ];

        let html = `
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 20px;">Pick a category</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        `;

        categories.forEach(cat => {
            html += `
                <div class="cp-category-item" data-view="${cat.id}" style="display: flex; gap: 10px; cursor: pointer; padding: 10px; border-radius: 4px;">
                    <div style="font-size: 32px;">${cat.icon}</div>
                    <div>
                        <div style="font-weight: bold; font-size: 12px; color: #003399; margin-bottom: 4px;">${cat.name}</div>
                        <div style="font-size: 11px; color: #666;">${cat.desc}</div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

        // Add listeners
        container.querySelectorAll('.cp-category-item').forEach(item => {
            item.addEventListener('click', () => {
                this.renderView(windowId, item.dataset.view);
            });
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f0f0f0';
                item.querySelector('div[style*="font-weight"]').style.textDecoration = 'underline';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
                item.querySelector('div[style*="font-weight"]').style.textDecoration = 'none';
            });
        });
    }

    /**
     * Render System Information
     */
    renderSystem(container) {
        const config = window.RetroWeb?.config?.system || { 
            name: 'Retro Web', 
            version: 'Unknown', 
            build: 'Unknown', 
            copyright: 'Nohan Baloch' 
        };

        container.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                System Properties
            </div>
            
            <div style="display: flex; gap: 20px;">
                <div style="font-size: 64px;">💻</div>
                <div>
                    <div style="font-weight: bold; margin-bottom: 10px;">System:</div>
                    <div style="margin-left: 20px; font-size: 12px; line-height: 1.6;">
                        ${config.name}<br>
                        Version ${config.version}<br>
                        Build ${config.build}<br>
                        &copy; ${config.copyright}
                    </div>

                    <div style="font-weight: bold; margin: 15px 0 10px 0;">Computer:</div>
                    <div style="margin-left: 20px; font-size: 12px; line-height: 1.6;">
                        Browser-based Virtual Machine<br>
                        User-Agent: ${navigator.userAgent.split(')')[0]})}<br>
                        Screen: ${window.screen.width} x ${window.screen.height}
                    </div>
                </div>
            </div>

            <div style="margin-top: 30px; text-align: right;">
                <button class="back-btn" style="padding: 5px 20px;">Back</button>
            </div>
        `;

        this.addBackButton(container);
    }

    /**
     * Render Display Settings (Themes)
     */
    /**
     * Render Display Settings (Themes & Resolution)
     */
    renderDisplay(container) {
        container.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                Display Properties
            </div>

            <div style="background: #efefef; padding: 20px; border: 1px solid #ccc; text-align: center; margin-bottom: 20px;">
                <div style="width: 200px; height: 150px; background: #3a6ea5; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white;">
                    Preview
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-weight: bold; font-size: 12px;">Theme:</label>
                    <select id="theme-select" style="width: 200px; padding: 4px;">
                        <option value="windows-xp">Windows XP</option>
                        <option value="classic">Windows 98</option>
                    </select>
                </div>

                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-weight: bold; font-size: 12px;">Screen Resolution:</label>
                    <select id="resolution-select" style="width: 200px; padding: 4px;">
                        <option value="fullscreen">Full Screen (Default)</option>
                        <option value="1280x960">1280 by 960 pixels</option>
                        <option value="1024x768">1024 by 768 pixels</option>
                        <option value="800x600">800 by 600 pixels</option>
                        <option value="640x480">640 by 480 pixels</option>
                    </select>
                </div>
            </div>

             <div style="margin-top: 30px; text-align: right;">
                <button class="back-btn" style="padding: 5px 20px;">Back</button>
            </div>
        `;

        this.addBackButton(container);

        // Theme Listener
        const themeSelect = container.querySelector('#theme-select');
        // Set current value based on current stylesheet
        const currentTheme = document.getElementById('theme-style').getAttribute('href').includes('classic') ? 'classic' : 'windows-xp';
        themeSelect.value = currentTheme;

        themeSelect.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        // Resolution Listener
        const resSelect = container.querySelector('#resolution-select');
        // Determine current resolution state (simple check)
        const desktopContainer = document.getElementById('desktop-container');
        if (desktopContainer.style.width === '100%') {
             resSelect.value = 'fullscreen';
        } else if (desktopContainer.style.width) {
             resSelect.value = `${parseInt(desktopContainer.style.width)}x${parseInt(desktopContainer.style.height)}`;
        }

        resSelect.addEventListener('change', (e) => {
            this.changeResolution(e.target.value);
        });
    }

    /**
     * Change System Theme
     */
    changeTheme(themeName) {
        const themeLink = document.getElementById('theme-style');
        if (themeLink) {
            themeLink.href = `ui/themes/${themeName}.css`;
            console.log(`[ControlPanel] Theme changed to: ${themeName}`);
        }
    }

    /**
     * Change Screen Resolution (Simulation)
     */
    changeResolution(res) {
        const container = document.getElementById('desktop-container');
        if (!container) return;

        if (res === 'fullscreen') {
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.position = '';
            container.style.top = '';
            container.style.left = '';
            container.style.transform = '';
            container.style.border = 'none';
            document.body.style.backgroundColor = '';
        } else {
            const [width, height] = res.split('x');
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            
            // Center on screen
            container.style.position = 'absolute';
            container.style.top = '50%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.border = '20px solid #111'; // Monitor bezel
            container.style.boxShadow = '0 0 50px rgba(0,0,0,0.5)';
            
            document.body.style.backgroundColor = '#000'; // Letterboxing
        }
        
        console.log(`[ControlPanel] Resolution changed to: ${res}`);
    }

     /**
     * Render User Accounts
     */
     renderUsers(container) {
        container.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                 User Accounts
            </div>

             <div style="display: flex; gap: 20px; align-items: center;">
                <div style="font-size: 48px; background: #efefef; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">👤</div>
                <div>
                     <div style="font-weight: bold; font-size: 14px;">User</div>
                     <div style="color: #666; font-size: 12px;">Computer Administrator</div>
                     <div style="color: #666; font-size: 12px; margin-top: 4px;">Password protected</div>
                </div>
            </div>

            <div style="margin-top: 20px; font-size: 12px;">
                 <p>To change your password or picture, please imagine doing so, as this feature is currently read-only.</p>
            </div>

             <div style="margin-top: 30px; text-align: right;">
                <button class="back-btn" style="padding: 5px 20px;">Back</button>
            </div>
        `;
        this.addBackButton(container);
    }

    /**
     * Render Add/Remove Programs
     */
    renderPrograms(container) {
        const programs = [
             { name: 'File Explorer', size: '2.4 MB' },
             { name: 'Notepad', size: '0.5 MB' },
             { name: 'Paint', size: '1.2 MB' },
             { name: 'Terminal', size: '0.8 MB' },
        ];

        let html = `
            <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                 Add or Remove Programs
            </div>
            
            <div style="border: 1px solid #ccc; bg: white; height: 300px; overflow-y: auto;">
        `;

        programs.forEach(prog => {
             html += `
                <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="font-size: 20px;">📦</span>
                        <span style="font-weight: bold; font-size: 12px;">${prog.name}</span>
                    </div>
                    <span style="font-size: 11px; color: #666;">${prog.size}</span>
                </div>
             `;
        });

        html += `</div>
             <div style="margin-top: 10px; text-align: right;">
                <button class="back-btn" style="padding: 5px 20px;">Back</button>
            </div>
        `;
        container.innerHTML = html;
        this.addBackButton(container);
    }

    addBackButton(container) {
        const btn = container.querySelector('.back-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                this.renderView(this.windowId, 'home');
            });
        }
    }
}

// Create global instance
const controlPanel = new ControlPanel();

// Export
export { ControlPanel, controlPanel };
