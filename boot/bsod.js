/**
 * Blue Screen of Death (BSOD)
 * System-level error screen for fatal kernel failures
 */

export class BSOD {
    constructor() {
        this.container = document.getElementById('bsod-container');
        this.debugMode = window.RetroWeb?.config?.kernel?.debugMode || false;
    }

    /**
     * Display BSOD with error information
     */
    show(errorData) {
        const {
            errorCode = 'KERNEL_PANIC',
            failedModule = 'UNKNOWN',
            message = 'An unknown error occurred',
            stack = null
        } = errorData;

        // Lock the system
        this.lockSystem();

        // Generate memory address (simulated)
        const memoryAddress = this.generateMemoryAddress();

        // Build BSOD content
        this.container.innerHTML = this.buildBSODContent({
            errorCode,
            failedModule,
            memoryAddress,
            message,
            stack
        });

        // Apply BSOD styling
        this.applyBSODStyle();

        // Show container
        this.container.style.display = 'flex';

        // Log crash data
        this.logCrash(errorData);

        console.error('[BSOD] System halted:', errorData);
    }

    /**
     * Build BSOD HTML content
     */
    buildBSODContent({ errorCode, failedModule, memoryAddress, message, stack }) {
        let content = `
            <div style="
                font-family: 'Consolas', 'Courier New', monospace;
                color: #FFFFFF;
                padding: 40px;
                max-width: 800px;
                line-height: 1.6;
            ">
                <div style="margin-bottom: 30px;">
                    A problem has been detected and Retro Web has been shut down.
                </div>

                <div style="margin-bottom: 30px;">
                    <strong>ERROR CODE: ${errorCode}</strong><br>
                    FAILED MODULE: ${failedModule}<br>
                    MEMORY ADDRESS: ${memoryAddress}
                </div>

                <div style="margin-bottom: 30px; border-top: 1px solid #FFFFFF; padding-top: 20px;">
                    ${message}
                </div>

                <div style="margin-bottom: 30px;">
                    If this is the first time you have seen this Stop error screen,<br>
                    restart your Web OS. If this screen appears again, follow<br>
                    these steps:
                </div>

                <div style="margin-bottom: 30px; padding-left: 20px;">
                    • Close all running applications<br>
                    • Restart Retro Web<br>
                    • Check installed plugins<br>
                    • Clear browser cache and storage
                </div>
        `;

        // Add stack trace in debug mode
        if (this.debugMode && stack) {
            content += `
                <div style="
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #FFFFFF;
                    font-size: 11px;
                    opacity: 0.8;
                ">
                    <strong>DEBUG STACK TRACE:</strong><br>
                    <pre style="margin-top: 10px; white-space: pre-wrap;">${this.escapeHtml(stack)}</pre>
                </div>
            `;
        }

        content += `
                <div style="margin-top: 40px; font-weight: bold;">
                    SYSTEM HALTED
                </div>
            </div>
        `;

        return content;
    }

    /**
     * Apply BSOD visual styling
     */
    applyBSODStyle() {
        this.container.style.cssText = `
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #0000AA;
            color: #FFFFFF;
            z-index: 99999;
            justify-content: center;
            align-items: center;
            cursor: default;
        `;
    }

    /**
     * Lock system input
     */
    lockSystem() {
        // Disable keyboard
        document.addEventListener('keydown', this.preventInput, true);
        document.addEventListener('keyup', this.preventInput, true);
        document.addEventListener('keypress', this.preventInput, true);

        // Disable mouse clicks
        document.addEventListener('click', this.preventInput, true);
        document.addEventListener('contextmenu', this.preventInput, true);

        // Hide cursor
        document.body.style.cursor = 'none';
    }

    /**
     * Prevent all input events
     */
    preventInput(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    /**
     * Generate simulated memory address
     */
    generateMemoryAddress() {
        const hex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase();
        return `0x${hex.padStart(8, '0')}`;
    }

    /**
     * Log crash data to VFS
     */
    async logCrash(errorData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logEntry = {
            timestamp: new Date().toISOString(),
            errorCode: errorData.errorCode,
            failedModule: errorData.failedModule,
            message: errorData.message,
            stack: errorData.stack,
            kernelState: this.captureKernelState(),
            activePIDs: this.captureActivePIDs(),
            lastEvents: this.captureLastEvents()
        };

        // Store in localStorage as fallback (VFS might not be available)
        try {
            const logs = JSON.parse(localStorage.getItem('retroweb_crash_logs') || '[]');
            logs.push(logEntry);
            // Keep only last 10 crash logs
            if (logs.length > 10) logs.shift();
            localStorage.setItem('retroweb_crash_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('[BSOD] Failed to save crash log:', error);
        }
    }

    /**
     * Capture kernel state
     */
    captureKernelState() {
        if (!window.RetroWeb?.kernel) return null;
        
        return {
            processes: window.RetroWeb.kernel.processes?.length || 0,
            uptime: window.RetroWeb.kernel.uptime || 0
        };
    }

    /**
     * Capture active process IDs
     */
    captureActivePIDs() {
        if (!window.RetroWeb?.kernel?.processes) return [];
        
        return window.RetroWeb.kernel.processes.map(p => ({
            pid: p.pid,
            name: p.name,
            state: p.state
        }));
    }

    /**
     * Capture last events
     */
    captureLastEvents() {
        if (!window.RetroWeb?.kernel?.eventHistory) return [];
        
        return window.RetroWeb.kernel.eventHistory.slice(-50);
    }

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
