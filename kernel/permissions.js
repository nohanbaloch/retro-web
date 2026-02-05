/**
 * Permission Engine
 * Manages app permissions and security policies
 */

export class PermissionEngine {
    constructor(config) {
        this.config = config;
        this.policies = new Map();
        this.initializeDefaultPolicies();
    }


    /**
     * Load saved permissions from storage
     */
    async loadTypes() {
       // Ideally read from VFS system/config/permissions.json
       // For now, use localStorage for persistence simplicity
       try {
           const saved = localStorage.getItem('retro_web_permissions');
           if (saved) {
               const parsed = JSON.parse(saved);
               // Convert to Map
               Object.entries(parsed).forEach(([appName, perms]) => {
                   this.policies.set(appName, perms);
               });
           }
       } catch (e) {
           console.warn('Failed to load permissions:', e);
       }
    }

    /**
     * Save permissions to storage
     */
    saveTypes() {
        try {
            const data = {};
            this.policies.forEach((perms, appName) => {
                data[appName] = perms;
            });
            localStorage.setItem('retro_web_permissions', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save permissions:', e);
        }
    }

    /**
     * Initialize default permission policies
     */
    initializeDefaultPolicies() {
        // Define available permissions
        this.availablePermissions = [
            'filesystem:read',
            'filesystem:write',
            'filesystem:delete',
            'network:fetch',
            'clipboard:read',
            'clipboard:write',
            'notifications:show',
            'system:shutdown',
            'system:restart',
            'processes:create',
            'processes:kill'
        ];
        
        // Dangerous permissions that trigger scary warnings
        this.dangerousPermissions = [
            'filesystem:delete',
            'system:shutdown',
            'processes:kill',
            'network:fetch'
        ];

        this.loadTypes();
    }

    /**
     * Validate permission array
     */
    validate(permissions) {
        if (!Array.isArray(permissions)) {
            return false;
        }

        // Check if all requested permissions are valid
        return permissions.every(perm => 
            this.availablePermissions.includes(perm)
        );
    }

    /**
     * Check if process has permission
     */
    hasPermission(process, permission) {
        if (!process) return false;
        
        // Check dynamic runtime permissions (in memory)
        if (process.permissions && process.permissions.includes(permission)) {
            return true;
        }

        // Check persistent policy
        const savedPerms = this.policies.get(process.name);
        if (savedPerms && savedPerms.includes(permission)) {
            // Optimistically update runtime to avoid repeated lookups? 
            // Better to keep sync
            if (process.permissions) process.permissions.push(permission);
            return true;
        }

        return false;
    }

    /**
     * Request permission for a process
     */
    async requestPermission(process, permission) {
        if (!this.availablePermissions.includes(permission)) {
            throw new Error(`Invalid permission: ${permission}`);
        }

        // Check if already persisted
        const savedPerms = this.policies.get(process.name) || [];
        if (savedPerms.includes(permission)) {
            if (!process.permissions.includes(permission)) {
                process.permissions.push(permission);
            }
            return true;
        }

        // In strict mode, show permission prompt
        if (this.config.requirePermissions) {
            const granted = await this.showPermissionPrompt(process.name, permission);
            
            if (granted) {
                process.permissions.push(permission);
                
                // Save persistence
                savedPerms.push(permission);
                this.policies.set(process.name, savedPerms);
                this.saveTypes();
            }
            
            return granted;
        }

        // Auto-grant in non-strict mode
        process.permissions.push(permission);
        return true;
    }

    /**
     * Show permission prompt to user
     */
    async showPermissionPrompt(appName, permission) {
        return new Promise((resolve) => {
            const wm = window.RetroWeb.windowManager;
            if (!wm) {
                return resolve(confirm(`${appName} requests: ${permission}. Allow?`));
            }

            // Check if dangerous
            const isDangerous = this.dangerousPermissions.includes(permission);
            const icon = isDangerous ? 'assets/icons/security-critical.png' : 'assets/icons/security-warning.png';
            const title = isDangerous ? 'CRITICAL SECURITY ALERT' : 'Security Alert';
            const color = isDangerous ? 'red' : 'orange';

            const content = `
                <div style="padding: 20px; text-align: center; font-family: 'Tahoma', sans-serif;">
                    <div style="margin-bottom: 20px;">
                         ${isDangerous ? '<div style="font-size:48px">⚠️</div>' : '<div style="font-size:48px">🛡️</div>'}
                    </div>
                    <h3 style="margin: 0 0 10px 0; color: ${color};">${title}</h3>
                    <p style="margin-bottom: 20px;">
                        <strong>${appName}</strong> is requesting permission:<br>
                        <code style="background: #eee; padding: 2px 5px; border-radius: 3px; font-weight:bold">${permission}</code>
                    </p>
                    ${isDangerous ? `<p style="color:red; font-size:11px; margin-bottom:15px;">Warning: This action could harm your system settings or data.</p>` : ''}
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <button id="perm-deny" style="padding: 5px 20px; min-width: 80px;">Deny</button>
                        <button id="perm-allow" style="padding: 5px 20px; min-width: 80px; font-weight: bold;">Allow</button>
                    </div>
                </div>
            `;

            const win = wm.createWindow({
                title: title,
                width: 380,
                height: isDangerous ? 300 : 260,
                resizable: false,
                icon: isDangerous ? '⚠️' : '🛡️',
                content: content,
                x: (window.innerWidth - 380) / 2,
                y: (window.innerHeight - 300) / 2
            });

            // Handle buttons
            const allowBtn = win.element.querySelector('#perm-allow');
            const denyBtn = win.element.querySelector('#perm-deny');

            const cleanup = () => {
                win.close();
            };

            allowBtn.onclick = () => {
                cleanup();
                resolve(true);
            };

            denyBtn.onclick = () => {
                cleanup();
                resolve(false);
            };

            const originalClose = win.close.bind(win);
            win.close = () => {
                originalClose();
                resolve(false);
            };
        });
    }

    /**
     * Revoke permission from process
     */
    revokePermission(process, permission) {
        if (!process) {
            // Could be revoking by name?
            return;
        }

        // Runtime
        if (process.permissions) {
            const index = process.permissions.indexOf(permission);
            if (index !== -1) {
                process.permissions.splice(index, 1);
            }
        }

        // Persistence
        const savedPerms = this.policies.get(process.name);
        if (savedPerms) {
            const index = savedPerms.indexOf(permission);
            if (index !== -1) {
                savedPerms.splice(index, 1);
                this.policies.set(process.name, savedPerms); // Update map
                this.saveTypes();
            }
        }
        
        console.log(`[SECURITY] Revoked ${permission} from ${process.name}`);
    }

    /**
     * Get all permissions for a process
     */
    getPermissions(process) {
        return process?.permissions || [];
    }
}
