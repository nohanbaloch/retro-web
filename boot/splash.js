/**
 * Boot Splash Screen
 * Displays BIOS-style boot animation
 */

export class Splash {
  constructor(config) {
    this.config = config;
    this.container = document.getElementById("boot-container");
    this.currentLine = 0;
  }

  /**
   * Show splash screen with boot messages
   */
  async show() {
    this.container.innerHTML = "";
    this.container.style.backgroundColor = "#000000";
    this.container.style.color = "#00FF9C";
    this.container.style.fontFamily = "monospace";
    this.container.style.fontSize = "14px";
    this.container.style.padding = "20px";
    this.container.style.overflow = "auto";

    const bootMessages = [
      "Retro Web BIOS v1.0",
      "Copyright (C) Nohan Baloch",
      "",
      "[ OK ] Memory Check",
      "[ OK ] DOM Renderer",
      "[ OK ] IndexedDB Controller",
      "[ OK ] Input Subsystem",
      "[ OK ] Event Bus",
      "[ OK ] Security Module",
      "",
      "Loading kernel...",
    ];

    // Display messages line by line
    for (const message of bootMessages) {
      await this.printLine(message);
      await this.delay(this.config.simulatedLatency || 100);
    }

    // Show progress bar
    await this.showProgressBar();
  }

  /**
   * Print a single line to the splash screen
   */
  async printLine(text) {
    const line = document.createElement("div");
    line.textContent = text;
    line.style.marginBottom = "4px";
    this.container.appendChild(line);
    this.currentLine++;
  }

  /**
   * Show loading progress bar
   */
  async showProgressBar() {
    const progressContainer = document.createElement("div");
    progressContainer.style.cssText = `
            position: absolute;
            bottom: 30%;
            left: 50%;
            transform: translateX(-50%);
            width: 40%;
        `;

    const progressBar = document.createElement("div");
    progressBar.style.cssText = `
            width: 100%;
            height: 6px;
            background: #333;
            border: 1px solid #00FF9C;
            position: relative;
            overflow: hidden;
        `;

    const progressFill = document.createElement("div");
    progressFill.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(to right, #00FF9C, #00AA66);
            transition: width 0.3s ease;
        `;

    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);
    this.container.appendChild(progressContainer);

    // Animate progress
    const steps = this.config.progressSteps || 7;
    for (let i = 1; i <= steps; i++) {
      await this.delay(200);
      progressFill.style.width = `${(i / steps) * 100}%`;
    }

    await this.delay(300);
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
