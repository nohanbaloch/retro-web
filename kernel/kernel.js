/**
 * Retro Web Kernel
 * Core system authority managing processes, events, and permissions
 */

import { Scheduler } from './scheduler.js';
import { EventBus } from './event-bus.js';
import { PermissionEngine } from './permissions.js';

export class Kernel {
    constructor(config) {
        this.config = config;
        this.processes = [];
        this.nextPID = 1;
        this.uptime = 0;
        this.state = 'INITIALIZING';
        this.eventHistory = [];
        
        // Core subsystems
        this.scheduler = null;
        this.eventBus = null;
        this.permissions = null;
    }

    /**
     * Initialize kernel and subsystems
     */
    async initialize() {
        console.log('[KERNEL] Initializing...');

        try {
            // Initialize event bus
            this.eventBus = new EventBus(this);
            
            // Initialize scheduler
            this.scheduler = new Scheduler(this);
            
            // Initialize permission engine
            this.permissions = new PermissionEngine(this.config);

            // Set up global error handler
            this.setupErrorHandler();

            // Start uptime counter
            this.startUptimeCounter();

            this.state = 'RUNNING';
            console.log('[KERNEL] Initialization complete');

            // Make kernel globally accessible
            window.RetroWeb = window.RetroWeb || {};
            window.RetroWeb.kernel = this;

        } catch (error) {
            this.state = 'FAILED';
            throw new Error('Kernel initialization failed: ' + error.message);
        }
    }

    /**
     * Create a new process
     */
    createProcess(processConfig) {
        const { name, executable, permissions = [], memory = {} } = processConfig;

        // Check process limit
        if (this.processes.length >= this.config.maxProcesses) {
            throw new Error('Maximum process limit reached');
        }

        // Allocate PID
        const pid = this.nextPID++;

        // Create process object
        const process = {
            pid,
            name,
            executable,
            permissions,
            memory,
            state: 'REGISTERED',
            createdAt: Date.now(),
            window: null,
            suspended: false
        };

        // Validate permissions
        if (!this.permissions.validate(permissions)) {
            throw new Error(`Invalid permissions for process ${name}`);
        }

        this.processes.push(process);
        this.emit('process:created', { pid, name });

        console.log(`[KERNEL] Process created: ${name} (PID: ${pid})`);
        return process;
    }

    /**
     * Terminate a process
     */
    terminateProcess(pid) {
        const processIndex = this.processes.findIndex(p => p.pid === pid);
        
        if (processIndex === -1) {
            throw new Error(`Process ${pid} not found`);
        }

        const process = this.processes[processIndex];
        
        // Clean up process resources
        if (process.window) {
            process.window.destroy();
        }

        this.processes.splice(processIndex, 1);
        this.emit('process:terminated', { pid, name: process.name });

        console.log(`[KERNEL] Process terminated: ${process.name} (PID: ${pid})`);
    }

    /**
     * Get process by PID
     */
    getProcess(pid) {
        return this.processes.find(p => p.pid === pid);
    }

    /**
     * Suspend a process
     */
    suspendProcess(pid) {
        const process = this.getProcess(pid);
        if (!process) {
            throw new Error(`Process ${pid} not found`);
        }

        process.suspended = true;
        process.state = 'SUSPENDED';
        this.emit('process:suspended', { pid });
    }

    /**
     * Resume a process
     */
    resumeProcess(pid) {
        const process = this.getProcess(pid);
        if (!process) {
            throw new Error(`Process ${pid} not found`);
        }

        process.suspended = false;
        process.state = 'RUNNING';
        this.emit('process:resumed', { pid });
    }

    /**
     * Emit kernel event
     */
    emit(eventName, data = {}) {
        if (this.eventBus) {
            this.eventBus.emit(eventName, data);
        }

        // Store in event history
        this.eventHistory.push({
            event: eventName,
            data,
            timestamp: Date.now()
        });

        // Limit event history size
        if (this.eventHistory.length > this.config.eventQueueSize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Subscribe to kernel events
     */
    on(eventName, callback) {
        if (this.eventBus) {
            this.eventBus.on(eventName, callback);
        }
    }

    /**
     * Set up global error handler
     */
    setupErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('[KERNEL] Uncaught error:', event.error);
            
            // Check if error is critical
            if (this.isCriticalError(event.error)) {
                this.panic(event.error);
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('[KERNEL] Unhandled promise rejection:', event.reason);
            
            if (this.isCriticalError(event.reason)) {
                this.panic(event.reason);
            }
        });
    }

    /**
     * Check if error is critical
     */
    isCriticalError(error) {
        // Define critical error patterns
        const criticalPatterns = [
            /kernel/i,
            /security/i,
            /permission/i,
            /filesystem.*corrupt/i
        ];

        const errorMessage = error?.message || String(error);
        return criticalPatterns.some(pattern => pattern.test(errorMessage));
    }

    /**
     * Kernel panic - trigger BSOD
     */
    panic(error) {
        console.error('[KERNEL] PANIC:', error);
        this.state = 'PANIC';

        // Stop all processes
        this.processes.forEach(p => {
            try {
                this.terminateProcess(p.pid);
            } catch (e) {
                // Ignore errors during panic
            }
        });

        // Trigger BSOD
        import('../boot/bsod.js').then(({ BSOD }) => {
            const bsod = new BSOD();
            bsod.show({
                errorCode: 'KERNEL_PANIC',
                failedModule: 'kernel.js',
                message: error.message || 'Critical kernel failure',
                stack: error.stack
            });
        });
    }

    /**
     * Start uptime counter
     */
    startUptimeCounter() {
        setInterval(() => {
            this.uptime++;
        }, 1000);
    }

    /**
     * Get system information
     */
    getSystemInfo() {
        return {
            state: this.state,
            uptime: this.uptime,
            processes: this.processes.length,
            maxProcesses: this.config.maxProcesses,
            version: window.RetroWeb?.config?.system?.version || 'unknown'
        };
    }
}
