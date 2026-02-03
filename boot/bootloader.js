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
      "../system/window-manager.js",
      "../system/desktop.js",
      "../system/taskbar.js",
      "../system/start-menu.js",
      "../system/notification-center.js",
      "../system/power-manager.js",
      "../services/settings.js",
      "../services/user-session.js",
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

      // Initialize built-in applications
      try {
        const { notepad } = await import("../apps/notepad.js");
        notepad.init(window.RetroWeb.windowManager, window.RetroWeb.vfs);
        window.RetroWeb.notepad = notepad;
        console.log("[BOOTLOADER] Notepad initialized");

        const { terminal } = await import("../apps/terminal.js");
        terminal.init(window.RetroWeb.windowManager, window.RetroWeb.vfs);
        window.RetroWeb.terminal = terminal;
        console.log("[BOOTLOADER] Terminal initialized");
      } catch (error) {
        console.warn("[BOOTLOADER] Some apps failed to load:", error);
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
