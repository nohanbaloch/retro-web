/**
 * Task Manager - Windows XP Style
 * System process monitoring and management tool
 */

class TaskManager {
    constructor() {
        this.windowManager = null;
        this.kernel = null;
        this.windowId = null;
        this.updateInterval = null;
        this.currentTab = 'processes';
        this.processes = [];
        this.systemStats = {
            cpu: 0,
            memory: 0,
            uptime: 0
        };

        this.initialize();
    }

    /**
     * Initialize Task Manager service
     */
    initialize() {
        // Register with kernel as system process
        if (window.RetroWeb?.kernel) {
            this.kernel = window.RetroWeb.kernel;
            this.windowManager = window.RetroWeb.windowManager;

            // Register as system service
            window.RetroWeb.taskManager = this;

            // Listen for process events
            this.kernel.on('process:created', (data) => this.onProcessCreated(data));
            this.kernel.on('process:terminated', (data) => this.onProcessTerminated(data));
            this.kernel.on('process:suspended', (data) => this.onProcessSuspended(data));
            this.kernel.on('process:resumed', (data) => this.onProcessResumed(data));

            // Listen for window events to associate with processes
            this.kernel.on('window:created', (data) => this.onWindowCreated(data));
            this.kernel.on('window:closed', (data) => this.onWindowClosed(data));

            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();

            console.log('[TASK-MANAGER] Initialized as system service');
        }
    }

    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Alt + Del
            if (e.ctrlKey && e.altKey && e.key === 'Delete') {
                e.preventDefault();
                this.open();
            }
        });
    }

    /**
     * Open Task Manager window
     */
    open() {
        if (!this.windowManager) {
            console.error('[TaskManager] WindowManager not initialized');
            return;
        }

        // If already open, focus it
        if (this.windowId && document.getElementById(this.windowId)) {
            this.windowManager.focusWindow(this.windowId);
            return;
        }

        const win = this.windowManager.createWindow({
            title: 'Windows Task Manager',
            width: 600,
            height: 500,
            x: 150,
            y: 100,
            icon: '📊',
            resizable: true,
            minimizable: true,
            maximizable: true,
            content: this.createTaskManagerHTML()
        });

        this.windowId = win.id;

        // Create a system process for Task Manager
        if (this.kernel) {
            try {
                const process = this.kernel.createProcess({
                    name: 'Task Manager',
                    executable: 'task-manager.js',
                    permissions: ['system', 'terminate', 'suspend', 'inspect'],
                    type: 'system'
                });
                // Associate the window with this process
                process.windowId = win.id;
                console.log(`[TaskManager] Created system process (PID: ${process.pid})`);
            } catch (error) {
                console.warn('[TaskManager] Could not create system process:', error);
            }
        }

        // Remove default padding
        const contentArea = win.element.querySelector('.window-content');
        if (contentArea) {
            contentArea.style.padding = '0';
        }

        this.setupEventListeners(win.id);
        this.startUpdates();

        return win;
    }

    /**
     * Create Task Manager HTML
     */
    createTaskManagerHTML() {
        return `
            <div class="task-manager" style="display: flex; flex-direction: column; height: 100%; font-family: 'Tahoma', sans-serif; font-size: 11px;">
                <!-- Menu Bar -->
                <div class="tm-menu-bar" style="background: #f5f5f5; border-bottom: 1px solid #ccc; padding: 2px;">
                    <span style="font-weight: bold;">File</span>
                    <span style="margin-left: 20px; font-weight: bold;">Options</span>
                    <span style="margin-left: 20px; font-weight: bold;">View</span>
                    <span style="margin-left: 20px; font-weight: bold;">Help</span>
                </div>

                <!-- Tab Bar -->
                <div class="tm-tabs" style="background: #f5f5f5; border-bottom: 1px solid #ccc; display: flex;">
                    <div class="tm-tab ${this.currentTab === 'processes' ? 'active' : ''}" data-tab="processes" style="padding: 8px 15px; cursor: pointer; border: 1px solid transparent; border-bottom: none;">
                        Processes
                    </div>
                    <div class="tm-tab ${this.currentTab === 'performance' ? 'active' : ''}" data-tab="performance" style="padding: 8px 15px; cursor: pointer; border: 1px solid transparent; border-bottom: none;">
                        Performance
                    </div>
                    <div class="tm-tab ${this.currentTab === 'networking' ? 'active' : ''}" data-tab="networking" style="padding: 8px 15px; cursor: pointer; border: 1px solid transparent; border-bottom: none;">
                        Networking
                    </div>
                    <div class="tm-tab ${this.currentTab === 'users' ? 'active' : ''}" data-tab="users" style="padding: 8px 15px; cursor: pointer; border: 1px solid transparent; border-bottom: none;">
                        Users
                    </div>
                </div>

                <!-- Content Area -->
                <div class="tm-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                    <!-- Processes Tab -->
                    <div class="tm-tab-content" data-tab="processes" style="display: ${this.currentTab === 'processes' ? 'flex' : 'none'}; flex-direction: column; height: 100%;">
                        <div class="tm-processes-header" style="padding: 8px; background: #f5f5f5; border-bottom: 1px solid #ccc; display: flex; align-items: center;">
                            <span style="font-weight: bold;">Image Name</span>
                            <span style="margin-left: 120px; font-weight: bold;">PID</span>
                            <span style="margin-left: 60px; font-weight: bold;">CPU</span>
                            <span style="margin-left: 60px; font-weight: bold;">Memory</span>
                        </div>
                        <div class="tm-processes-list" style="flex: 1; overflow-y: auto; background: #fff;">
                            <div class="tm-loading" style="padding: 20px; text-align: center;">Loading processes...</div>
                        </div>
                    </div>

                    <!-- Performance Tab -->
                    <div class="tm-tab-content" data-tab="performance" style="display: ${this.currentTab === 'performance' ? 'flex' : 'none'}; flex-direction: column; height: 100%;">
                        <div class="tm-performance-charts" style="flex: 1; padding: 20px; display: flex; gap: 20px;">
                            <div class="tm-chart" style="flex: 1;">
                                <div style="font-weight: bold; margin-bottom: 10px;">CPU Usage</div>
                                <div class="tm-cpu-chart" style="height: 150px; background: #f0f0f0; border: 1px solid #ccc; position: relative;">
                                    <div class="tm-cpu-bar" style="height: 100%; width: 0%; background: #00ff00; transition: width 0.5s;"></div>
                                    <div class="tm-cpu-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold;">0%</div>
                                </div>
                            </div>
                            <div class="tm-chart" style="flex: 1;">
                                <div style="font-weight: bold; margin-bottom: 10px;">Memory Usage</div>
                                <div class="tm-memory-chart" style="height: 150px; background: #f0f0f0; border: 1px solid #ccc; position: relative;">
                                    <div class="tm-memory-bar" style="height: 100%; width: 0%; background: #0080ff; transition: width 0.5s;"></div>
                                    <div class="tm-memory-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold;">0%</div>
                                </div>
                            </div>
                        </div>
                        <div class="tm-performance-stats" style="padding: 10px; background: #f5f5f5; border-top: 1px solid #ccc;">
                            <div>Uptime: <span class="tm-uptime">00:00:00</span></div>
                            <div>Processes: <span class="tm-process-count">0</span></div>
                        </div>
                    </div>

                    <!-- Networking Tab -->
                    <div class="tm-tab-content" data-tab="networking" style="display: ${this.currentTab === 'networking' ? 'flex' : 'none'}; align-items: center; justify-content: center; height: 100%;">
                        <div style="text-align: center; color: #666;">
                            <div style="font-size: 24px; margin-bottom: 10px;">🌐</div>
                            <div>Network monitoring not available</div>
                        </div>
                    </div>

                    <!-- Users Tab -->
                    <div class="tm-tab-content" data-tab="users" style="display: ${this.currentTab === 'users' ? 'flex' : 'none'}; align-items: center; justify-content: center; height: 100%;">
                        <div style="text-align: center; color: #666;">
                            <div style="font-size: 24px; margin-bottom: 10px;">👤</div>
                            <div>User management not available</div>
                        </div>
                    </div>
                </div>

                <!-- Status Bar -->
                <div class="tm-status-bar" style="background: #f5f5f5; border-top: 1px solid #ccc; padding: 4px 8px; font-size: 10px;">
                    Processes: <span class="tm-status-processes">0</span> |
                    CPU Usage: <span class="tm-status-cpu">0%</span> |
                    Memory Usage: <span class="tm-status-memory">0%</span>
                </div>
            </div>
        `;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners(windowId) {
        const windowElement = document.getElementById(windowId);
        if (!windowElement) return;

        // Tab switching
        const tabs = windowElement.querySelectorAll('.tm-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab, windowId);
            });
        });

        // Context menu for processes
        const processesList = windowElement.querySelector('.tm-processes-list');
        if (processesList) {
            processesList.addEventListener('contextmenu', (e) => {
                const processItem = e.target.closest('.tm-process-item');
                if (processItem) {
                    e.preventDefault();
                    this.showProcessContextMenu(e, processItem.dataset.pid);
                }
            });
        }
    }

    /**
     * Switch tabs
     */
    switchTab(tabName, windowId) {
        this.currentTab = tabName;

        const windowElement = document.getElementById(windowId);
        if (!windowElement) return;

        // Update tab styles
        const tabs = windowElement.querySelectorAll('.tm-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
                tab.style.background = '#fff';
                tab.style.borderColor = '#ccc';
            } else {
                tab.classList.remove('active');
                tab.style.background = '#f5f5f5';
                tab.style.borderColor = 'transparent';
            }
        });

        // Show/hide content
        const contents = windowElement.querySelectorAll('.tm-tab-content');
        contents.forEach(content => {
            content.style.display = content.dataset.tab === tabName ? 'flex' : 'none';
        });
    }

    /**
     * Start periodic updates
     */
    startUpdates() {
        this.updateData();
        this.updateInterval = setInterval(() => {
            this.updateData();
        }, 2000); // Update every 2 seconds
    }

    /**
     * Stop updates
     */
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Update all data
     */
    updateData() {
        if (!this.kernel) return;

        // Update processes
        this.processes = [...this.kernel.processes];

        // Calculate system stats
        this.updateSystemStats();

        // Update UI
        this.updateUI();
    }

    /**
     * Update system statistics
     */
    updateSystemStats() {
        if (!this.kernel) return;

        const processes = this.kernel.processes;
        const totalMemory = this.kernel.totalMemory;
        const usedMemory = this.kernel.usedMemory;

        // CPU usage simulation (simplified)
        this.systemStats.cpu = Math.min(100, processes.length * 5 + Math.random() * 20);

        // Memory usage
        this.systemStats.memory = totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0;

        // Uptime
        this.systemStats.uptime = Math.floor((Date.now() - (this.kernel.uptime || Date.now())) / 1000);
    }

    /**
     * Update UI with current data
     */
    updateUI() {
        if (!this.windowId || !document.getElementById(this.windowId)) return;

        const windowElement = document.getElementById(this.windowId);

        // Update processes list
        if (this.currentTab === 'processes') {
            this.updateProcessesList(windowElement);
        }

        // Update performance charts
        if (this.currentTab === 'performance') {
            this.updatePerformanceCharts(windowElement);
        }

        // Update status bar
        this.updateStatusBar(windowElement);
    }

    /**
     * Update processes list
     */
    updateProcessesList(windowElement) {
        const processesList = windowElement.querySelector('.tm-processes-list');
        if (!processesList) return;

        const html = this.processes.map(process => {
            const cpuUsage = Math.floor(Math.random() * 10); // Simulated CPU usage
            const memoryUsage = process.memoryUsage || 0;
            const memoryMB = (memoryUsage / (1024 * 1024)).toFixed(1);

            return `
                <div class="tm-process-item" data-pid="${process.pid}" style="display: flex; align-items: center; padding: 2px 8px; border-bottom: 1px solid #f0f0f0; cursor: pointer;">
                    <div style="width: 120px; overflow: hidden; text-overflow: ellipsis;">${process.name}</div>
                    <div style="width: 60px; text-align: center;">${process.pid}</div>
                    <div style="width: 60px; text-align: center;">${cpuUsage}%</div>
                    <div style="width: 60px; text-align: center;">${memoryMB} MB</div>
                </div>
            `;
        }).join('');

        processesList.innerHTML = html || '<div style="padding: 20px; text-align: center; color: #666;">No processes running</div>';
    }

    /**
     * Update performance charts
     */
    updatePerformanceCharts(windowElement) {
        // CPU chart
        const cpuBar = windowElement.querySelector('.tm-cpu-bar');
        const cpuText = windowElement.querySelector('.tm-cpu-text');
        if (cpuBar && cpuText) {
            const cpuPercent = Math.round(this.systemStats.cpu);
            cpuBar.style.width = `${cpuPercent}%`;
            cpuText.textContent = `${cpuPercent}%`;
        }

        // Memory chart
        const memoryBar = windowElement.querySelector('.tm-memory-bar');
        const memoryText = windowElement.querySelector('.tm-memory-text');
        if (memoryBar && memoryText) {
            const memoryPercent = Math.round(this.systemStats.memory);
            memoryBar.style.width = `${memoryPercent}%`;
            memoryText.textContent = `${memoryPercent}%`;
        }

        // Stats
        const uptimeElement = windowElement.querySelector('.tm-uptime');
        const processCountElement = windowElement.querySelector('.tm-process-count');

        if (uptimeElement) {
            const uptime = this.systemStats.uptime;
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            uptimeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        if (processCountElement) {
            processCountElement.textContent = this.processes.length;
        }
    }

    /**
     * Update status bar
     */
    updateStatusBar(windowElement) {
        const processesElement = windowElement.querySelector('.tm-status-processes');
        const cpuElement = windowElement.querySelector('.tm-status-cpu');
        const memoryElement = windowElement.querySelector('.tm-status-memory');

        if (processesElement) processesElement.textContent = this.processes.length;
        if (cpuElement) cpuElement.textContent = `${Math.round(this.systemStats.cpu)}%`;
        if (memoryElement) memoryElement.textContent = `${Math.round(this.systemStats.memory)}%`;
    }

    /**
     * Show context menu for process
     */
    showProcessContextMenu(event, pid) {
        const process = this.kernel.getProcess(parseInt(pid));
        if (!process) return;

        const menuItems = [
            {
                label: 'End Process',
                action: () => this.endProcess(pid),
                enabled: process.type !== 'system' && process.permissions.includes('terminate')
            },
            {
                label: 'Suspend',
                action: () => this.suspendProcess(pid),
                enabled: process.permissions.includes('suspend') && process.state !== 'SUSPENDED'
            },
            {
                label: 'Resume',
                action: () => this.resumeProcess(pid),
                enabled: process.permissions.includes('suspend') && process.state === 'SUSPENDED'
            },
            { type: 'separator' },
            {
                label: 'Go to Process',
                action: () => this.goToProcess(pid),
                enabled: !!process.windowId
            }
        ];

        if (window.RetroWeb?.contextMenu) {
            window.RetroWeb.contextMenu.showMenu(menuItems, event.clientX, event.clientY, { pid });
        }
    }

    /**
     * End a process
     */
    endProcess(pid) {
        try {
            this.kernel.terminateProcess(parseInt(pid));
        } catch (error) {
            console.error('[TaskManager] Failed to end process:', error);
        }
    }

    /**
     * Suspend a process
     */
    suspendProcess(pid) {
        try {
            this.kernel.suspendProcess(parseInt(pid));
        } catch (error) {
            console.error('[TaskManager] Failed to suspend process:', error);
        }
    }

    /**
     * Resume a process
     */
    resumeProcess(pid) {
        try {
            this.kernel.resumeProcess(parseInt(pid));
        } catch (error) {
            console.error('[TaskManager] Failed to resume process:', error);
        }
    }

    /**
     * Go to process window
     */
    goToProcess(pid) {
        const process = this.kernel.getProcess(parseInt(pid));
        if (process && process.windowId && this.windowManager) {
            this.windowManager.focusWindow(process.windowId);
        }
    }

    /**
     * Event handlers for process changes
     */
    onProcessCreated(data) {
        console.log('[TaskManager] Process created:', data);
        this.updateData();
    }

    onProcessTerminated(data) {
        console.log('[TaskManager] Process terminated:', data);
        this.updateData();
    }

    onProcessSuspended(data) {
        console.log('[TaskManager] Process suspended:', data);
        this.updateData();
    }

    onProcessResumed(data) {
        console.log('[TaskManager] Process resumed:', data);
        this.updateData();
    }

    onWindowCreated(data) {
        // Associate window with the most recently created process that doesn't have a window
        const processesWithoutWindows = this.kernel.processes.filter(p => !p.windowId);
        if (processesWithoutWindows.length > 0) {
            // Associate with the last process created
            const process = processesWithoutWindows[processesWithoutWindows.length - 1];
            process.windowId = data.windowId;
            console.log(`[TaskManager] Associated window ${data.windowId} with process ${process.name} (PID: ${process.pid})`);
        }
     

    onWindowClosed(data) {
        // Find process associated with this window and terminate it
        const process = this.kernel.processes.find(p => p.windowId === data.windowId);
        if (process && process.type !== 'system') {
            try {
                this.kernel.terminateProcess(process.pid);
                console.log(`[TaskManager] Terminated process ${process.name} (PID: ${process.pid}) due to window close`);
            } catch (error) {
                console.warn('[TaskManager] Could not terminate process:', error);
            }
        }
        this.updateData();
    }   this.updateData();
    }

    /**
     * Clean up when window closes
     */
    destroy() {
        this.stopUpdates();
        this.windowId = null;
    }
}

// Initialize Task Manager as global service
window.RetroWeb = window.RetroWeb || {};
window.RetroWeb.taskManager = new TaskManager();

export { TaskManager };