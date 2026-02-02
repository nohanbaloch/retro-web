/**
 * System Diagnostics
 * Validates system integrity before kernel load
 */

export class Diagnostics {
    constructor(config) {
        this.config = config;
        this.results = [];
    }

    /**
     * Run all diagnostic checks
     */
    async run() {
        console.log('[DIAGNOSTICS] Running system checks...');

        const checks = [
            this.checkLocalStorage(),
            this.checkIndexedDB(),
            this.checkDOM(),
            this.checkEventSystem(),
            this.checkModuleSupport(),
            this.checkPermissions()
        ];

        this.results = await Promise.all(checks);
        
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        console.log(`[DIAGNOSTICS] ${passed}/${total} checks passed`);
        
        return this.results;
    }

    /**
     * Check localStorage availability
     */
    async checkLocalStorage() {
        try {
            const testKey = '__retroweb_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            
            return {
                name: 'localStorage',
                passed: true,
                critical: false
            };
        } catch (error) {
            return {
                name: 'localStorage',
                passed: false,
                critical: false,
                error: error.message
            };
        }
    }

    /**
     * Check IndexedDB availability
     */
    async checkIndexedDB() {
        try {
            if (!window.indexedDB) {
                throw new Error('IndexedDB not supported');
            }
            
            return {
                name: 'IndexedDB',
                passed: true,
                critical: true
            };
        } catch (error) {
            return {
                name: 'IndexedDB',
                passed: false,
                critical: true,
                error: error.message
            };
        }
    }

    /**
     * Check DOM manipulation capabilities
     */
    async checkDOM() {
        try {
            const testDiv = document.createElement('div');
            testDiv.style.display = 'none';
            document.body.appendChild(testDiv);
            document.body.removeChild(testDiv);
            
            return {
                name: 'DOM Renderer',
                passed: true,
                critical: true
            };
        } catch (error) {
            return {
                name: 'DOM Renderer',
                passed: false,
                critical: true,
                error: error.message
            };
        }
    }

    /**
     * Check event system
     */
    async checkEventSystem() {
        try {
            const testEvent = new CustomEvent('test');
            window.dispatchEvent(testEvent);
            
            return {
                name: 'Event System',
                passed: true,
                critical: true
            };
        } catch (error) {
            return {
                name: 'Event System',
                passed: false,
                critical: true,
                error: error.message
            };
        }
    }

    /**
     * Check ES6 module support
     */
    async checkModuleSupport() {
        try {
            // If we're running, modules are supported
            return {
                name: 'ES6 Modules',
                passed: true,
                critical: true
            };
        } catch (error) {
            return {
                name: 'ES6 Modules',
                passed: false,
                critical: true,
                error: error.message
            };
        }
    }

    /**
     * Check required permissions
     */
    async checkPermissions() {
        try {
            // Check if we can access necessary APIs
            const hasPermissions = 
                typeof navigator !== 'undefined' &&
                typeof document !== 'undefined' &&
                typeof window !== 'undefined';
            
            return {
                name: 'Permissions',
                passed: hasPermissions,
                critical: true
            };
        } catch (error) {
            return {
                name: 'Permissions',
                passed: false,
                critical: true,
                error: error.message
            };
        }
    }
}
