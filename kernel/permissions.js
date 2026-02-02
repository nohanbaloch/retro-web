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
        if (!process || !process.permissions) {
            return false;
        }

        return process.permissions.includes(permission);
    }

    /**
     * Request permission for a process
     */
    async requestPermission(process, permission) {
        if (!this.availablePermissions.includes(permission)) {
            throw new Error(`Invalid permission: ${permission}`);
        }

        // In strict mode, show permission prompt
        if (this.config.requirePermissions) {
            const granted = await this.showPermissionPrompt(process.name, permission);
            
            if (granted) {
                process.permissions.push(permission);
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
        // TODO: Implement proper UI dialog
        // For now, use confirm dialog
        return confirm(
            `${appName} is requesting permission:\n\n${permission}\n\nAllow?`
        );
    }

    /**
     * Revoke permission from process
     */
    revokePermission(process, permission) {
        if (!process || !process.permissions) {
            return;
        }

        const index = process.permissions.indexOf(permission);
        if (index !== -1) {
            process.permissions.splice(index, 1);
        }
    }

    /**
     * Get all permissions for a process
     */
    getPermissions(process) {
        return process?.permissions || [];
    }
}
