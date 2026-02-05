/**
 * System Registry
 * Manages file associations and installed applications
 */

class Registry {
    constructor() {
        this.apps = new Map();
        this.associations = new Map();
        this.descriptors = new Map(); // id -> { importPath, globalName, title, permissions }
        this.running = new Map(); // pid -> { desc, app, process, sandbox, timer }
        this.initialize();
    }

    initialize() {
        // Register default apps
        this.registerApp('Notepad', {
            name: 'Notepad',
            icon: '📝',
            open: (path) => window.RetroWeb.notepad?.open(path)
        });

        this.registerApp('Paint', {
            name: 'Paint',
            icon: '🎨',
            open: (path) => window.RetroWeb.paint?.open(path)
        });
        
        // Register file associations
        this.registerAssociation(['txt', 'md', 'log', 'js', 'css', 'html', 'json', 'xml'], 'Notepad');
        this.registerAssociation(['png', 'jpg', 'jpeg', 'bmp', 'gif'], 'Paint');
        
        if (window.RetroWeb) {
            window.RetroWeb.registry = this;
            console.log('[REGISTRY] Initialized');
        }
    }

    /**
     * Register an app descriptor for lazy-loading
     * id: identifier (e.g., 'Notepad')
     * desc: { importPath, globalName, title, permissions }
     */
    registerDescriptor(id, desc) {
        this.descriptors.set(id, desc);
        console.log(`[REGISTRY] Descriptor registered: ${id}`);
    }

    /**
     * Launch an app by descriptor id or app id
     */
    async launch(idOrApp, ...args) {
        // Try descriptors first
        const id = idOrApp;
        let desc = this.descriptors.get(id);

        // Fallback: if an app was registered via registerApp, build a descriptor.
        if (!desc && this.apps.has(id)) {
            const appCfg = this.apps.get(id);
            desc = { importPath: appCfg.importPath, globalName: appCfg.globalName, title: appCfg.name, permissions: appCfg.permissions || [] };
        }

        if (!desc) {
            console.error(`[REGISTRY] No descriptor found for: ${id}`);
            return null;
        }

        // If already running, focus its window
        for (const [pid, entry] of this.running.entries()) {
            if (entry.desc === desc || entry.desc?.title === desc.title) {
                try {
                    const proc = entry.process;
                    if (proc && proc.window && window.RetroWeb?.windowManager) {
                        window.RetroWeb.windowManager.focus(proc.window.id);
                    }
                } catch (e) { /* ignore */ }
                return entry;
            }
        }

        try {
            // Dynamic import
            const module = await import(desc.importPath);
            // Try to get the app instance by globalName, fallback to first exported object
            let app = module[desc.globalName];
            // If not found, try case-insensitive match
            if (!app) {
                const altName = Object.keys(module).find(k => k.toLowerCase() === desc.globalName?.toLowerCase());
                if (altName) app = module[altName];
            }
            // If still not found, try to find a singleton instance (not a class)
            if (!app) {
                // Prefer exported objects that are not classes (i.e., have open/init methods)
                app = Object.values(module).find(obj => obj && typeof obj === 'object' && (typeof obj.open === 'function' || typeof obj.init === 'function'));
            }
            // As a last resort, fallback to first exported object
            if (!app) {
                app = module[Object.keys(module)[0]];
            }
            // If app is a class (constructor), this is a bug
            if (typeof app === 'function') {
                console.error(`[REGISTRY] App export is a class, not a singleton instance: ${desc.importPath}`);
                return null;
            }
            if (!app) {
                console.error(`[REGISTRY] App module loaded but no export found: ${desc.importPath}`);
                return null;
            }

            // Create process
            const process = window.RetroWeb.kernel.createProcess({ name: desc.title || id, permissions: desc.permissions || [] });

            // Create sandbox
            const { Sandbox } = await import('../security/sandbox.js');
            const sandbox = new Sandbox(window.RetroWeb.kernel, process.pid);


            // Init app with sandbox services and real VFS if needed
            if (typeof app.init === 'function') {
                try {
                    // Detect arity (number of expected arguments)
                    const argCount = app.init.length;
                    if (argCount >= 2) {
                        // Pass both real windowManager and real VFS
                        await app.init(window.RetroWeb?.windowManager, window.RetroWeb?.vfs);
                    } else {
                        // Pass only real windowManager
                        await app.init(window.RetroWeb?.windowManager);
                    }
                } catch (e) {
                    console.error(`[REGISTRY] App init() failed for ${desc.title}:`, e);
                }
            } else {
                console.error(`[REGISTRY] App instance missing init() method: ${desc.title}`);
            }

            // Open or run app entrypoint
            if (typeof app.open === 'function') {
                try {
                    app.open(...args);
                } catch (e) {
                    console.error(`[REGISTRY] App open() failed for ${desc.title}:`, e);
                }
            } else {
                console.error(`[REGISTRY] App instance missing open() method: ${desc.title}`);
            }

            // Expose globally if requested
            if (desc.globalName) window.RetroWeb[desc.globalName] = app;

            // Track running app with auto-terminate timer (5 minutes default)
            const AUTO_TERMINATE_MS = (window.RetroWeb?.config?.kernel?.autoTerminateMs) || 5 * 60 * 1000;
            const timer = setTimeout(() => {
                try { this.terminate(process.pid); } catch (e) { /* ignore */ }
            }, AUTO_TERMINATE_MS);

            this.running.set(process.pid, { desc, app, process, sandbox, timer });

            console.log(`[REGISTRY] Launched: ${desc.title} (PID: ${process.pid})`);

            return this.running.get(process.pid);
        } catch (err) {
            console.error('[REGISTRY] Launch failed:', err);
            return null;
        }
    }

    /**
     * Terminate a running app by PID
     */
    terminate(pid) {
        const entry = this.running.get(pid);
        if (!entry) return false;

        // Clear timer
        if (entry.timer) clearTimeout(entry.timer);

        try {
            // Try to call app-specific cleanup
            if (entry.app && entry.app.onTerminate) {
                try { entry.app.onTerminate(); } catch (e) { /* ignore */ }
            }

            // Terminate process via kernel
            window.RetroWeb.kernel.terminateProcess(pid);
        } catch (e) {
            console.warn('[REGISTRY] Error terminating process:', e);
        }

        // Remove global reference
        if (entry.desc && entry.desc.globalName && window.RetroWeb[entry.desc.globalName]) {
            try { delete window.RetroWeb[entry.desc.globalName]; } catch (e) { window.RetroWeb[entry.desc.globalName] = null; }
        }

        this.running.delete(pid);
        console.log(`[REGISTRY] Terminated PID ${pid}`);
        return true;
    }

    /**
     * Suspend a running app (soft suspend)
     */
    suspend(pid) {
        const entry = this.running.get(pid);
        if (!entry) return false;

        try {
            if (entry.app && entry.app.onSuspend) entry.app.onSuspend();
            window.RetroWeb.kernel.suspendProcess(pid);
            console.log(`[REGISTRY] Suspended PID ${pid}`);
            return true;
        } catch (e) {
            console.warn('[REGISTRY] Suspend failed:', e);
            return false;
        }
    }

    registerApp(id, config) {
        this.apps.set(id, config);
    }

    registerAssociation(extensions, appId) {
        if (!Array.isArray(extensions)) extensions = [extensions];
        extensions.forEach(ext => {
             const existing = this.associations.get(ext) || [];
             if (!existing.includes(appId)) {
                 existing.push(appId);
                 this.associations.set(ext, existing);
             }
        });
    }

    getAppsForFile(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const appIds = this.associations.get(ext) || [];
        return appIds.map(id => this.apps.get(id)).filter(app => app);
    }

    openWith(path, appId) {
        const app = this.apps.get(appId);
        if (app && app.open) {
            app.open(path);
        } else {
            console.error(`App ${appId} not found or invalid`);
        }
    }
}

export const registry = new Registry();
