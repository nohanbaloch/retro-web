/**
 * Process Scheduler
 * Manages process execution and resource allocation
 */

export class Scheduler {
    constructor(kernel) {
        this.kernel = kernel;
        this.queue = [];
        this.running = false;
    }

    /**
     * Schedule a process for execution
     */
    schedule(pid, task) {
        this.queue.push({ pid, task, timestamp: Date.now() });
        
        if (!this.running) {
            this.run();
        }
    }

    /**
     * Run scheduler loop
     */
    async run() {
        this.running = true;

        while (this.queue.length > 0) {
            const { pid, task } = this.queue.shift();
            
            const process = this.kernel.getProcess(pid);
            if (!process || process.suspended) {
                continue;
            }

            try {
                await task();
            } catch (error) {
                console.error(`[SCHEDULER] Task failed for PID ${pid}:`, error);
                this.kernel.emit('process:error', { pid, error });
            }
        }

        this.running = false;
    }

    /**
     * Clear all scheduled tasks for a process
     */
    clearProcess(pid) {
        this.queue = this.queue.filter(item => item.pid !== pid);
    }
}
