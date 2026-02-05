/**
 * Retro Web Bootloader
 * Responsible for system initialization and boot sequence
 */

import { Splash } from "./splash.js";
import { Diagnostics } from "./diagnostics.js";

class Bootloader {
  constructor() {
    this.config = null;
    this.bootStage = "POWER_ON";
    this.startTime = Date.now();
    this.errors = [];
  }

  /**
   * Main boot entry point
   */
  async boot() {
    try {
      console.log("[BOOTLOADER] System power on");

      // Stage 1: Load configuration
      await this.loadConfiguration();

      // Stage 2: Display splash screen
      await this.showSplash();

      // Stage 3: Run diagnostics
      await this.runDiagnostics();

      // Stage 4: Load kernel
      await this.loadKernel();

      // Stage 5: Initialize services
      await this.initializeServices();

      // Stage 6: Restore user session
      await this.restoreSession();

      // Stage 7: Launch desktop
      await this.launchDesktop();

      console.log(
        `[BOOTLOADER] Boot completed in ${Date.now() - this.startTime}ms`,
      );
    } catch (error) {
      console.error("[BOOTLOADER] Fatal boot error:", error);
      this.handleFatalError(error);
    }
  }

  /**
   * Load system configuration
   */
  async loadConfiguration() {
    this.bootStage = "CONFIG_LOAD";

    try {
      const response = await fetch("/os.config.json");
      this.config = await response.json();
      window.RetroWeb = window.RetroWeb || {};
      window.RetroWeb.config = this.config;

      console.log("[BOOTLOADER] Configuration loaded");
    } catch (error) {
      throw new Error("Failed to load system configuration: " + error.message);
    }
  }

  /**
   * Display splash screen
   */
  async showSplash() {
    this.bootStage = "SPLASH";

    const splash = new Splash(this.config.boot);
    await splash.show();
  }

  /**
   * Run system diagnostics
   */
  async runDiagnostics() {
    this.bootStage = "DIAGNOSTICS";

    const diagnostics = new Diagnostics(this.config);
    const results = await diagnostics.run();

    // Check for critical failures
    const criticalFailures = results.filter((r) => r.critical && !r.passed);
    if (criticalFailures.length > 0) {
      throw new Error(
        "Critical diagnostic failures: " +
          criticalFailures.map((f) => f.name).join(", "),
      );
    }
  }

  /**
   * Load and initialize kernel
   */
  async loadKernel() {
    this.bootStage = "KERNEL_LOAD";

    try {
      const { Kernel } = await import("../kernel/kernel.js");
      window.RetroWeb.kernel = new Kernel(this.config.kernel);
      await window.RetroWeb.kernel.initialize();

      console.log("[BOOTLOADER] Kernel initialized");
    } catch (error) {
      throw new Error("Kernel initialization failed: " + error.message);
    }
  }

  /**
   * Initialize system services
   */
  async initializeServices() {
    this.bootStage = "SERVICE_INIT";

    const services = [
      "../system/clipboard.js",
      "../system/window-manager.js",
      "../system/desktop.js",
      "../system/taskbar.js",
      "../system/start-menu.js",
      "../system/input-manager.js",
      "../system/notification-center.js",
      "../system/power-manager.js",
      "../system/context-menu.js",
      "../services/settings.js",
      "../services/user-session.js",
      "../services/registry.js",
    ];

    for (const servicePath of services) {
      try {
        await import(servicePath);
        console.log(`[BOOTLOADER] Loaded: ${servicePath}`);
      } catch (error) {
        console.warn(`[BOOTLOADER] Failed to load ${servicePath}:`, error);
      }
    }


    // Initialize VFS separately with kernel reference
    try {
      const { VFS } = await import("../filesystem/vfs.js");
      window.RetroWeb.vfs = new VFS(window.RetroWeb.kernel);
      await window.RetroWeb.vfs.initialize();
      console.log("[BOOTLOADER] VFS initialized");

      // Initialize File Explorer
      const { FileExplorer } = await import("../system/file-explorer.js");
      window.RetroWeb.explorer = new FileExplorer(
      window.RetroWeb.windowManager,
      window.RetroWeb.vfs
      );
      console.log("[BOOTLOADER] File Explorer initialized");

      // Initialize Control Panel as a system service
      try {
      const { controlPanel } = await import("../apps/control-panel.js");
      if (controlPanel && typeof controlPanel.init === 'function') {
        await controlPanel.init(window.RetroWeb.windowManager, window.RetroWeb.vfs);
      }
      window.RetroWeb.controlPanel = controlPanel;
      console.log("[BOOTLOADER] Control Panel initialized as system service");
      } catch (error) {
      console.error("[BOOTLOADER] Control Panel failed to load as system service:", error);
      }

      // Initialize built-in applications (other than Control Panel)
      const { Sandbox } = await import("../security/sandbox.js");

      const initApp = async (name, importPath, config = {}) => {
        try {
          const module = await import(importPath);
          const globalName = config.globalName || name.toLowerCase();
          let app = module[globalName]; 
          // Fallback: search for an export that looks like an app instance
          if (!app) {
            for (const key of Object.keys(module)) {
               const candidate = module[key];
               if (candidate && typeof candidate === 'object' && typeof candidate.init === 'function') {
                 app = candidate;
                 break;
               }
            }
          }
          // Fallback: Use first export (legacy behavior, but dangerous)
          if (!app) {
            app = module[Object.keys(module)[0]];
          }
          if (!app) throw new Error('No valid application instance found in module');
          // Register process
          const process = window.RetroWeb.kernel.createProcess({
            name: config.title || name,
            type: 'system',
            permissions: config.permissions || []
          });
          // Create Sandbox
          const sandbox = new Sandbox(window.RetroWeb.kernel, process.pid);
          // Init app with sandboxed services
          if (app.init) {
            await app.init(sandbox.windowManager, sandbox.fileSystem);
          }
          // Store reference (legacy/global access)
          window.RetroWeb[globalName] = app;
          console.log(`[BOOTLOADER] ${name} initialized (PID: ${process.pid})`);
        } catch (error) {
          console.error(`[BOOTLOADER] ${name} failed to load. Details:`, error);
          // Fallback: Try to register globally anyway so it might partially work/be debuggable
          try {
            const module = await import(importPath);
            const app = module[config.globalName || name.toLowerCase()] || module[Object.keys(module)[0]];
            if (app) window.RetroWeb[config.globalName || name.toLowerCase()] = app;
          } catch (e) { console.error('Fallback failed', e); }
        }
      };

        // Register app descriptors (lazy-load on demand)
        if (window.RetroWeb?.registry) {
        window.RetroWeb.registry.registerDescriptor('Notepad', {
          importPath: '../apps/notepad.js',
          globalName: 'notepad',
          title: 'Notepad',
          permissions: ['filesystem:read', 'filesystem:write']
        });

        window.RetroWeb.registry.registerDescriptor('Terminal', {
          importPath: '../apps/terminal.js',
          globalName: 'terminal',
          title: 'Terminal',
          permissions: ['filesystem:read', 'filesystem:write', 'filesystem:delete', 'processes:create', 'processes:kill']
        });

        window.RetroWeb.registry.registerDescriptor('Paint', {
          importPath: '../apps/paint.js',
          globalName: 'paint',
          title: 'Paint',
          permissions: ['filesystem:read', 'filesystem:write']
        });


        window.RetroWeb.registry.registerDescriptor('Calculator', {
          importPath: '../apps/calculator.js',
          globalName: 'calculator',
          title: 'Calculator',
          permissions: []
        });

        window.RetroWeb.registry.registerDescriptor('Minesweeper', {
          importPath: '../apps/minesweeper.js',
          globalName: 'minesweeper',
          title: 'Minesweeper',
          permissions: []
        });

        window.RetroWeb.registry.registerDescriptor('Solitaire', {
          importPath: '../apps/solitaire.js',
          globalName: 'solitaire',
          title: 'Solitaire',
          permissions: []
        });
        }
    } catch (error) {
      console.error("[BOOTLOADER] VFS initialization failed:", error);
      throw new Error("Virtual filesystem initialization failed: " + error.message);
    }
  }

  /**
   * Restore user session
   */
  async restoreSession() {
    this.bootStage = "USER_SESSION";

    if (window.RetroWeb.services?.userSession) {
      await window.RetroWeb.services.userSession.restore();
    }
  }

  /**
   * Launch desktop environment
   */
  async launchDesktop() {
    this.bootStage = "DESKTOP_READY";

    // Hide boot container
    const bootContainer = document.getElementById("boot-container");
    const desktopContainer = document.getElementById("desktop-container");

    // Fade transition
    bootContainer.style.transition = "opacity 500ms";
    bootContainer.style.opacity = "0";

    setTimeout(() => {
      bootContainer.style.display = "none";
      desktopContainer.style.display = "block";

      // Initialize desktop
      if (window.RetroWeb.kernel) {
        window.RetroWeb.kernel.emit("desktop:ready");
      }
    }, 500);
  }

  /**
   * Handle fatal boot errors
   */
  handleFatalError(error) {
    console.error("[BOOTLOADER] Triggering BSOD");

    // Load BSOD module
    import("../boot/bsod.js").then(({ BSOD }) => {
      const bsod = new BSOD();
      bsod.show({
        errorCode: "KERNEL_PANIC",
        failedModule: this.bootStage,
        message: error.message,
        stack: error.stack,
      });
    });
  }
}

// Auto-start boot sequence
const bootloader = new Bootloader();
bootloader.boot();
