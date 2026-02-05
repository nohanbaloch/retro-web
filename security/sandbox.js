/**
 * Security Sandbox
 * Wraps system services to enforce permissions and isolation for processes.
 */

export class Sandbox {
    constructor(kernel, processId) {
        this.kernel = kernel;
        this.processId = processId;
        this.process = kernel.getProcess(processId);
        
        if (!this.process) {
            throw new Error(`Cannot create sandbox: Process ${processId} not found`);
        }
    }

    /**
     * Get sandboxed File System
     */
    get fileSystem() {
        const kernel = this.kernel;
        const pid = this.processId;
        const fs = window.RetroWeb.vfs;
        const permissions = kernel.permissions;
        const process = this.process;

        return new Proxy(fs, {
            get(target, prop) {
                // Allow non-function properties
                if (typeof target[prop] !== 'function') {
                    return target[prop];
                }

                // Intercept methods
                return async (...args) => {
                    // 1. CPU Throttling Check via Scheduler
                    await new Promise(resolve => {
                        kernel.scheduler.schedule(pid, resolve);
                    });

                    // 2. Memory Cost Simulation
                    // Base cost for any FS operation
                    kernel.allocateMemory(pid, 1024); // 1KB overhead

                    // Check permissions based on method name
                    let requiredPerm = null;

                    if (prop.startsWith('read') || prop === 'stat' || prop === 'search' || prop === 'list') {
                        requiredPerm = 'filesystem:read';
                    } else if (prop.startsWith('write') || prop === 'create') {
                        requiredPerm = 'filesystem:write';
                        // Calc write size cost
                        if (args[1] && typeof args[1] === 'string') {
                             kernel.allocateMemory(pid, args[1].length);
                        }
                    } else if (prop.startsWith('delete') || prop === 'remove') {
                        requiredPerm = 'filesystem:delete';
                    }

                    if (requiredPerm) {
                        const hasPerm = permissions.hasPermission(process, requiredPerm);
                        if (!hasPerm) {
                            // Try to request it
                            const granted = await permissions.requestPermission(process, requiredPerm);
                            if (!granted) {
                                throw new Error(`Permission denied: ${requiredPerm}`);
                            }
                        }
                    }

                    // Strict path checking (Sandboxing to /Home or special folders) could go here
                    // For now, just pass through
                    return target[prop].apply(target, args);
                };
            }
        });
    }

    /**
     * Get sandboxed Window Manager
     */
    get windowManager() {
        const wm = window.RetroWeb.windowManager;
        const kernel = this.kernel;
        const pid = this.processId;
        const process = this.process;

        return new Proxy(wm, {
            get(target, prop) {
                if (typeof target[prop] !== 'function') return target[prop];

                return (...args) => {
                    // CPU Throttle skipped for synchronous WindowManager calls to avoid breaking apps
                    // We can't await here without returning a Promise

                    // Ensure process tracks its windows
                    const result = target[prop].apply(target, args);
                    
                    if (prop === 'createWindow') {
                        // Memory Cost for Window (simulated 5MB)
                        kernel.allocateMemory(pid, 5 * 1024 * 1024);

                        // Associate window with process
                        if (result && result.id) {
                            process.window = result; // Track main window
                        }
                    }
                    return result;
                };
            }
        });
    }

    /**
     * Get isolated storage (localStorage/SessionStorage wrapper) if needed
     */
    
    /**
     * Execute code within sandbox (simulated)
     */
    evaluate(code) {
        // This would use iframe or similar for real isolation
        console.warn('Code evaluation not fully sandboxed in this environment.');
    }
}
