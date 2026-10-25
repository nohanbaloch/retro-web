# AGENTS.md — Master Guide & Specification for Retro Web OS

> **Universal Agent Instruction File**  
> *Consolidated specification, architecture blueprint, agent operating rules, and development roadmap for Retro Web OS.*  
> *Applicable to all AI Coding Agents, Copilots, LLM Assistants, and Engineering Contributors.*

---

## 📑 Table of Contents
1. [Project Identity & Core Philosophy](#1-project-identity--core-philosophy)
2. [Agent Operating Rules & Behavioral Directives](#2-agent-operating-rules--behavioral-directives)
3. [System Architecture & Directory Specification](#3-system-architecture--directory-specification)
4. [Subsystem Technical Specifications](#4-subsystem-technical-specifications)
   - [4.1 Bootloader & Startup Sequence](#41-bootloader--startup-sequence)
   - [4.2 Kernel & Process Management](#42-kernel--process-management)
   - [4.3 Window Manager & Desktop Environment](#43-window-manager--desktop-environment)
   - [4.4 Virtual Filesystem (VFS)](#44-virtual-filesystem-vfs)
   - [4.5 Built-in Applications](#45-built-in-applications)
   - [4.6 Input System, Keyboard Shortcuts & Clipboard](#46-input-system-keyboard-shortcuts--clipboard)
   - [4.7 Notification System](#47-notification-system)
   - [4.8 Security, Sandboxing & Integrity Engine](#48-security-sandboxing--integrity-engine)
   - [4.9 Services & Registry](#49-services--registry)
   - [4.10 Power Management](#410-power-management)
   - [4.11 Plugin System & SDK](#411-plugin-system--sdk)
   - [4.12 UI, Themes & Visual Fidelity](#412-ui-themes--visual-fidelity)
   - [4.13 Configuration Specification (`os.config.json`)](#413-configuration-specification-osconfigjson)
5. [Complete Development Roadmap & Implementation Tracker](#5-complete-development-roadmap--implementation-tracker)
6. [Testing, Validation & Quality Assurance](#6-testing-validation--quality-assurance)
7. [Example Agent Prompts & Workflows](#7-example-agent-prompts--workflows)
8. [Repository & Contact Information](#8-repository--contact-information)

---

## 1. Project Identity & Core Philosophy

### Overview
**Retro Web OS** is an authentic, web-based operating system inspired by **Windows XP**, engineered entirely in **pure Vanilla JavaScript (ES6+ Modules), HTML5, and CSS3**. It runs entirely client-side inside modern web browsers without any third-party frameworks, bundlers, or runtimes.

### Core Non-Negotiable Tenets
1. **Not a Website — A Runtime Environment**: The browser is treated as bare-metal hardware. JavaScript functions as the operating system's native machine language, not as a cosmetic scripting assistant.
2. **Zero Frameworks Allowed**: The use of React, Vue, Angular, Svelte, TailwindCSS, Bootstrap, jQuery, or any other external UI/state framework or library is strictly forbidden. All DOM creation, event handling, and state machines must be crafted using native browser APIs.
3. **Architectural Modernity with Visual Nostalgia**: The visual interface faithfully recreates the iconic Windows XP experience (Luna Blue theme, classic start menu, authentic dialog boxes, pixel-perfect icons, classic sounds). Underneath, the architecture is clean, modern, modular, asynchronous, and strictly event-driven.
4. **Deterministic Behavior & Explicit State**: No hidden side effects or black-box abstractions. All system state transitions must be explicit, verifiable, reversible, and traceable through the Kernel and Event Bus.
5. **No Flat Files or Shortcuts**: Every script, stylesheet, asset, and test case must reside strictly within its designated OS subsystem directory.
6. **Final Directive**:
   > *"You are not building a demo. You are building a system. If something feels optional, it is not. If something feels hard, it is required. Build Retro Web as if browsers were the future hardware of civilization."*

---

## 2. Agent Operating Rules & Behavioral Directives

All AI agents, Copilots, and contributors MUST follow these mandatory rules:

### 🚫 Strict Prohibitions (What You Must NEVER Do)
- **NEVER** introduce, recommend, or import frontend frameworks (React, Vue, Angular, Svelte, Solid, etc.).
- **NEVER** introduce CSS frameworks or CSS-in-JS libraries (Tailwind, Bootstrap, Emotion, styled-components). Use vanilla CSS adhering to the design tokens in `ui/themes/windows-xp.css`.
- **NEVER** place files outside the established directory architecture or create unstructured flat root files.
- **NEVER** pollute the global `window` object with arbitrary variables or bypass module exports. Only OS-level singletons formally managed by the Bootloader/Kernel may be bound to `window` (e.g., `window.RetroWeb`).
- **NEVER** allow applications to communicate directly with one another or access foreign DOM structures outside their own window container.
- **NEVER** use browser-native `alert()`, `confirm()`, or `prompt()`. All alerts, warnings, and prompts must use Retro Web's modal/dialog and notification subsystem APIs.
- **NEVER** implement canvas-based window shells or non-semantic windowing. Windows must be structured DOM elements managed by `system/window-manager.js`.
- **NEVER** perform direct IndexedDB queries inside user-facing applications. All filesystem interactions must pass through `filesystem/vfs.js`.
- **NEVER** suppress fatal errors silently. Fatal system errors must trigger the simulated Blue Screen of Death (BSOD) subsystem.

### ✅ Mandatory Practices (What You Must ALWAYS Do)
- **ALWAYS** write native ES6+ module code using standard `import` and `export` syntax.
- **ALWAYS** adhere to the prescribed directory structure (`boot/`, `kernel/`, `system/`, `filesystem/`, `apps/`, `services/`, `security/`, `ui/`, `plugins/`, `test/`).
- **ALWAYS** route inter-process communication, system events, and state broadcasts through the `kernel/event-bus.js`.
- **ALWAYS** manage application lifecycles, processes, and permissions via `kernel/kernel.js` and `kernel/permissions.js`.
- **ALWAYS** isolate application execution within `security/sandbox.js`.
- **ALWAYS** manage window creation, z-index, drag, resize, minimize, maximize, and restoration via `system/window-manager.js`.
- **ALWAYS** utilize `filesystem/vfs.js` for file and directory CRUD operations, path resolution, and MIME-type handling.
- **ALWAYS** use `system/notification-center.js` for user notifications and system alerts.
- **ALWAYS** use `system/clipboard.js` for clipboard operations (text and virtual file copy/cut/paste).
- **ALWAYS** use `services/registry.js` for file type associations, default application handlers, and configuration keys.
- **ALWAYS** maintain authentic Windows XP visual styling, typography, color palettes, bevels, title bars, and button states.
- **ALWAYS** verify that any newly implemented feature or bug fix is testable via dedicated HTML test harness files in the `test/` folder.
- **ALWAYS** preserve existing documentation and code comments unrelated to your changes.

---

## 3. System Architecture & Directory Specification

The repository enforces a strict OS-level modular architecture:

```
retro-web/
├── boot/                        # BIOS simulation, bootloader & crash screen
│   ├── bootloader.js            # 7-stage system boot orchestrator
│   ├── splash.js                # BIOS & XP loading splash screen
│   ├── diagnostics.js           # Pre-boot hardware/integrity checks
│   └── bsod.js                  # Blue Screen of Death failure renderer
│
├── kernel/                      # Core operating system supervisor
│   ├── kernel.js                # Master OS supervisor & PID manager
│   ├── scheduler.js             # Process task scheduler & CPU throttler
│   ├── event-bus.js             # Pub/Sub Inter-Process Communication (IPC)
│   └── permissions.js           # Capability & security privilege engine
│
├── system/                      # User interface environment & system services
│   ├── window-manager.js        # Window state, stacking (z-index), dragging & snapping
│   ├── taskbar.js               # Start button, Quick Launch, active apps, system tray & live clock
│   ├── start-menu.js            # Two-column XP Start Menu with search & power options
│   ├── desktop.js               # Desktop icon grid (80px), multi-select & wallpaper
│   ├── context-menu.js          # Desktop, folder & icon right-click context menus
│   ├── input-manager.js         # Global hotkeys (Ctrl+Alt+Del, Alt+Tab, Win keys)
│   ├── notification-center.js   # Balloon tooltips, toasts & system alert queue
│   ├── task-manager.js          # Process listing, real-time CPU/memory charts & process killing
│   ├── file-explorer.js         # Full GUI Explorer (tree view, details, address bar)
│   ├── power-manager.js         # Power states (Boot, Restart, Shutdown, Sleep)
│   └── clipboard.js             # System-wide text & file clipboard manager
│
├── filesystem/                  # Virtual File System (VFS)
│   ├── vfs.js                   # Master VFS interface for high-level file operations
│   ├── storage.js               # IndexedDB persistent storage backend
│   ├── path-resolver.js         # Windows path normalization (e.g., C:\Documents and Settings)
│   ├── mime-types.js            # MIME type detection & default icon/handler mapping
│   ├── file.js                  # File node class (metadata, content, permissions)
│   ├── directory.js             # Directory node class (tree traversal, children)
│   ├── default-structure.js     # Initial Windows XP directory tree & seed files
│   ├── drivers.js               # Virtual hardware and drive abstraction
│   └── file-indexer.js          # Search indexer for VFS queries
│
├── apps/                        # Native built-in Windows applications
│   ├── file-explorer.js         # Explorer application wrapper (uses system/file-explorer)
│   ├── notepad.js               # Text editor with File/Edit/Format menus & autosave
│   ├── terminal.js              # Command prompt with 18+ DOS/Unix utilities
│   ├── paint.js                 # 2D canvas drawing tool with 32-color palette & tools
│   ├── control-panel.js         # Settings, theme picker, resolution & app manager
│   ├── task-manager.js          # Task manager application launcher
│   ├── calculator.js            # Standard calculator with arithmetic & memory keys
│   ├── minesweeper.js           # Classic XP Minesweeper game
│   └── solitaire.js             # Classic Klondike Solitaire card game
│
├── services/                    # System-level state & background services
│   ├── registry.js              # Windows Registry simulation (keys, file associations)
│   ├── settings.js              # User configuration & system preferences
│   ├── user-session.js          # User profiles, login states & session restoration
│   └── updater.js               # OS updates & patch simulation
│
├── security/                    # Security subsystem
│   ├── sandbox.js               # App execution proxy & DOM isolation
│   ├── policy-engine.js         # Policy evaluation for untrusted scripts
│   └── integrity-checker.js     # SHA-256 manifest & file checksum verification
│
├── plugins/                     # Extensibility & 3rd-party integration
│   └── plugin-sdk.js            # SDK for registering external apps and plugins
│
├── ui/                          # Visual styling and assets
│   ├── themes/
│   │   ├── windows-xp.css       # Authentic Luna Blue XP styling & system metrics
│   │   └── windows-98.css       # Classic Windows 98 alternate theme
│   ├── animations.css           # Window minimize/restore & UI transition animations
│   ├── icons/                   # System icon assets
│   └── fonts/                   # System typography
│
├── test/                        # Interactive test suites and test harness pages
│   ├── TEST.html                # Comprehensive system test runner
│   ├── PHASE2.html              # Phase 2 Desktop Environment showcase
│   ├── PHASE3.html              # Phase 3 VFS verification & storage testing
│   └── README.md                # Testing instructions & scenarios
│
├── index.html                   # Main application entry point & DOM bootstrap container
├── os.config.json               # System configuration parameters & resource limits
├── start-server.ps1             # Local development HTTP server (PowerShell)
└── AGENTS.md                    # This master instructions file
```

---

## 4. Subsystem Technical Specifications

### 4.1 Bootloader & Startup Sequence
- **7-Stage Boot Process**:
  1. `HARDWARE_INIT`: Verify browser capabilities (IndexedDB, ES6 Modules, Canvas, LocalStorage).
  2. `DIAGNOSTICS`: Execute system diagnostics via `boot/diagnostics.js`.
  3. `INTEGRITY_CHECK`: Verify critical core files using `security/integrity-checker.js`.
  4. `VFS_MOUNT`: Initialize `filesystem/storage.js` and mount default Windows directory tree.
  5. `KERNEL_INIT`: Instantiate `kernel/kernel.js`, initialize PID tables, process scheduler, and event bus.
  6. `SERVICE_START`: Start Registry, Settings, Clipboard, and Power Manager.
  7. `DESKTOP_LAUNCH`: Load Desktop environment, Window Manager, Taskbar, and Start Menu.
- **Splash Screen**: Realistic simulated BIOS POST screen transitioning into the Windows XP animated progress bar splash.
- **Crash Recovery & BSOD (`boot/bsod.js`)**: Any unhandled fatal exception in the boot chain or core kernel halts OS execution and renders an authentic full-screen Blue Screen of Death showing STOP codes, failing module name, and crash recovery instructions.

### 4.2 Kernel & Process Management
- **Central Authority**: The Kernel (`kernel/kernel.js`) maintains absolute control over all OS primitives. Applications cannot bypass the kernel.
- **Process Structure**: Each running app or background task is allocated a discrete process record:
  - `pid`: Unique integer process identifier.
  - `name`: Human-readable application name (e.g., `notepad.exe`).
  - `status`: Lifecycle state (`REGISTERED` → `LAUNCHED` → `RUNNING` → `SUSPENDED` → `TERMINATED`).
  - `windowId`: ID of the corresponding window managed by the Window Manager.
  - `memoryUsage`: Simulated memory allocation (MB) monitored by the scheduler.
  - `cpuUsage`: Calculated CPU timeslice percentage.
  - `permissions`: Set of approved system permissions.
- **Event Bus (`kernel/event-bus.js`)**: Decoupled publish/subscribe bus for IPC. Components publish events (e.g., `window:focus`, `file:saved`, `process:exit`) and subscribe with automatic teardown on process termination.
- **Task Scheduler (`kernel/scheduler.js`)**: Coordinates process execution slices, monitors resource limits, and enforces CPU/memory throttling as configured in `os.config.json`.
- **Permission System (`kernel/permissions.js`)**: Fine-grained capability checks (e.g., `vfs.read`, `vfs.write`, `system.power`, `network.fetch`). Prompts the user with authentic XP dialogs before granting dangerous permissions.

### 4.3 Window Manager & Desktop Environment
- **Window Manager (`system/window-manager.js`)**:
  - Full window lifecycle: Create, open, minimize, maximize, restore, close.
  - Stacking & Focus: Dynamic `z-index` management with visual state changes (active gradient title bar vs. inactive grayed title bar).
  - Geometry: Dragging with boundary constraints, edge/corner resizing, double-click title bar to maximize/restore.
  - Window Snapping: Snaps to screen edges within defined threshold (default: 20px).
  - Modal Dialogs: Modal windows block interaction with parent process windows until dismissed.
  - Keyboard Navigation: `Alt+Tab` graphical window switcher with icon previews; `Alt+F4` to close active window.
- **Taskbar (`system/taskbar.js`)**:
  - Classic green XP "Start" button with authentic hover/active bitmaps and gradient.
  - Quick Launch toolbar (Show Desktop, Internet Explorer, Notepad, File Explorer).
  - Dynamic taskbar window buttons reflecting open windows with running state, minimize toggle, and active state highlights.
  - System Tray: Status icons (volume, network, security shield) and live clock updating every second.
- **Start Menu (`system/start-menu.js`)**:
  - Authentic two-column layout: Left column for pinned and frequently used programs; right column for system folders (My Documents, My Pictures, My Computer, Control Panel, Search, Run).
  - Header with user profile avatar and username.
  - Footer with Log Off and Turn Off Computer (Shutdown) buttons.
  - "All Programs" cascading flyout submenu and integrated instant app search.
- **Desktop Grid (`system/desktop.js`)**:
  - Authentic 80px snap grid for desktop icons.
  - Single-click to select (blue bounding box highlight), double-click to execute associated application.
  - Drag-and-drop icon rearrangement and multi-select rubberband rectangle.
  - Desktop context menu (View, Arrange Icons By, Refresh, New Folder, New Text Document, Properties).

### 4.4 Virtual Filesystem (VFS)
- **Persistence**: Backed by browser IndexedDB (`filesystem/storage.js`) ensuring all files, directories, edits, and newly created files survive page reloads and browser restarts.
- **Directory Hierarchy**:
  - `C:\` (Root system drive)
  - `C:\Windows\` (System files, fonts, drivers)
  - `C:\Windows\System32\` (Core binaries and utilities)
  - `C:\Program Files\` (Installed applications)
  - `C:\Documents and Settings\Default User\Desktop\` (Desktop files and shortcuts)
  - `C:\Documents and Settings\Default User\My Documents\` (User documents)
  - `C:\Documents and Settings\Default User\My Documents\My Pictures\` (Images)
  - `C:\System Cache\` (Temporary cache storage)
- **Path Resolution (`filesystem/path-resolver.js`)**: Resolves relative paths (`.`, `..`), normalizes Windows backslashes, supports drive letters (`C:\`), and resolves environment variables.
- **MIME Types & Associations (`filesystem/mime-types.js` & `services/registry.js`)**:
  - `.txt`, `.log`, `.md` → Notepad (`apps/notepad.js`)
  - `.bmp`, `.png`, `.jpg` → Paint (`apps/paint.js`)
  - `.exe`, `.com` → Executable loader
  - Directories → File Explorer (`system/file-explorer.js`)
  - "Open With" context menu allowing users to choose an alternative program.
- **File CRUD Operations**: Asynchronous `createFile()`, `readFile()`, `writeFile()`, `deleteFile()`, `createDirectory()`, `readDirectory()`, `deleteDirectory()`, `copy()`, `move()`, and `search()`.

### 4.5 Built-in Applications
1. **File Explorer (`apps/file-explorer.js` / `system/file-explorer.js`)**:
   - Navigation: Back, Forward, Up, and editable Address Bar.
   - Views: Large Icons, List, and Details view (Name, Size, Type, Date Modified).
   - Sidebar: Tree-view navigation panel of the filesystem.
   - Context Menus: Full file operations (Cut, Copy, Paste, Delete, Rename, Properties).
   - Drag and drop support between folders and to/from the Desktop.
2. **Notepad (`apps/notepad.js`)**:
   - Menus: File (New, Open, Save, Save As, Exit), Edit (Undo, Cut, Copy, Paste, Delete, Select All), Format (Word Wrap, Font).
   - Integration: Direct reading and writing to VFS text files.
   - Autosave: 30-second interval automatic save to prevent data loss.
   - Status bar displaying line count, column count, and file encoding.
3. **Terminal (`apps/terminal.js`)**:
   - Authentic Command Prompt styling (`cmd.exe`).
   - Command history navigation (Up/Down arrow keys) and Tab auto-completion.
   - Built-in commands: `help`, `cls`/`clear`, `dir`/`ls`, `cd`, `pwd`, `mkdir`, `rmdir`, `type`/`cat`, `echo`, `touch`, `del`/`rm`, `date`, `whoami`, `ver`, `ps`, `kill`, `notepad`, `explorer`, `exit`.
4. **Paint (`apps/paint.js`)**:
   - Canvas-based raster drawing area (default 640x400 with resize handles).
   - Tool Palette: Free-form Select, Eraser, Fill with Color, Pick Color (Eyedropper), Pencil, Brush, Airbrush, Text, Line, Curve, Rectangle, Polygon, Ellipse, Rounded Rectangle.
   - 32-color classic Windows XP palette with custom color picker.
   - Operations: Undo/Redo history, Invert Colors, Flip/Rotate, Stretch/Skew.
   - VFS Integration: Open image files from VFS, save to VFS in PNG/BMP format.
5. **Control Panel (`apps/control-panel.js`)**:
   - System Information: OS version, build, simulated RAM, CPU, user profile.
   - Display Properties: Wallpaper selector, theme switcher (Windows XP Luna Blue, Windows 98 Classic), resolution simulator.
   - Security & Permissions: View and revoke application permissions.
   - Add/Remove Programs: View installed applications and simulated disk usage.
6. **Task Manager (`system/task-manager.js`)**:
   - Processes Tab: Active processes, PID, CPU usage %, Memory usage (MB), "End Process" button with confirmation.
   - Performance Tab: Real-time animated canvas line charts for CPU Usage History and Pagefile/Memory Usage.
   - Shortcut: Accessible instantly via `Ctrl+Alt+Del` or right-clicking the Taskbar.
7. **Calculator (`apps/calculator.js`)**:
   - Standard 4-function arithmetic operations (+, -, *, /), square root, percentage, reciprocal (1/x).
   - Memory functions: MC, MR, MS, M+.
   - Keyboard numpad input support.
8. **Minesweeper (`apps/minesweeper.js`)**:
   - Classic puzzle game with Beginner (9x9, 10 mines), Intermediate (16x16, 40 mines), and Expert (30x16, 99 mines) modes.
   - Interactive smiley face reset button, mine counter, and digital timer.
   - Left-click reveal, right-click flag/question mark, and dual-click chord reveal.
9. **Solitaire (`apps/solitaire.js`)**:
   - Classic Klondike Solitaire card game.
   - Drag-and-drop card movement, draw 1 or draw 3 modes, scoring, timer, and victory card cascade animation.

### 4.6 Input System, Keyboard Shortcuts & Clipboard
- **Global Shortcuts (`system/input-manager.js`)**:
  - `Ctrl + Alt + Delete`: Launch Task Manager.
  - `Alt + Tab`: Open and cycle through the window switcher overlay.
  - `Alt + F4`: Close the currently focused window.
  - `Win` / `Ctrl + Esc`: Toggle the Start Menu open/closed.
  - `Win + D`: Show/Hide Desktop (minimize/restore all open windows).
  - `Win + E`: Launch File Explorer navigating to `C:\`.
  - `F5`: Refresh active folder view / desktop icons.
- **Clipboard (`system/clipboard.js`)**:
  - Centralized OS clipboard supporting text snippets and virtual filesystem file references.
  - Standard `Ctrl+C` (Copy), `Ctrl+X` (Cut), and `Ctrl+V` (Paste) integrated across Desktop, File Explorer, and Notepad.

### 4.7 Notification System
- **Notification Center (`system/notification-center.js`)**:
  - Balloon notification popups sliding up from the System Tray.
  - Notification queue preventing overlapping alerts.
  - Supports notification titles, body text, severity icons (Info, Warning, Error), optional action buttons, and automatic dismiss timeouts.
  - Replaces all browser-native popups.

### 4.8 Security, Sandboxing & Integrity Engine
- **Proxy Sandbox (`security/sandbox.js`)**:
  - Application scripts run within a proxy-isolated execution context.
  - Restricts direct access to the global `document` and foreign window DOM nodes.
  - Restricts dangerous JavaScript primitives (`eval`, `Function`, `localStorage` direct access).
  - Enforces memory allocation caps (configured in `os.config.json`).
- **Policy Engine (`security/policy-engine.js`)**: Validates application manifests, requested capabilities, and permission access requests.
- **Integrity Checker (`security/integrity-checker.js`)**:
  - SHA-256 hash checks on critical OS system modules during boot.
  - Validates plugin and package manifests before installation.

### 4.9 Services & Registry
- **Registry (`services/registry.js`)**:
  - Simulated hierarchical Windows Registry (`HKEY_LOCAL_MACHINE`, `HKEY_CURRENT_USER`, `HKEY_CLASSES_ROOT`).
  - Stores file extension associations, default application handlers, system appearance settings, and user preferences.
- **User Session (`services/user-session.js`)**:
  - Manages active user profile, profile directories, recent documents list, and session state persistence.
- **Settings (`services/settings.js`)**: High-level API for querying and persisting user configuration options.

### 4.10 Power Management
- **Power Manager (`system/power-manager.js`)**:
  - Implements four formal OS power states:
    1. `BOOT`: Normal cold boot sequence.
    2. `RESTART`: Flushes unsaved caches, unmounts VFS, reboots kernel, and re-executes bootloader.
    3. `SHUTDOWN`: Closes all running processes with unsaved check prompts, flushes VFS buffers, and displays the classic screen: *"It is now safe to turn off your computer."*
    4. `SLEEP`: Suspends process scheduling, preserves volatile state, and displays sleep lock screen.

### 4.11 Plugin System & SDK
- **Plugin SDK (`plugins/plugin-sdk.js`)**:
  - Allows 3rd-party applications to register with Retro Web.
  - Standard plugin package manifest:
    ```json
    {
      "id": "com.developer.appname",
      "name": "My App",
      "version": "1.0.0",
      "icon": "app-icon.png",
      "permissions": ["vfs.read", "ui.window"],
      "entryPoint": "main.js"
    }
    ```
  - Hooks into Window Manager, Start Menu, File Associations, and Desktop Shortcuts.

### 4.12 UI, Themes & Visual Fidelity
- **Authentic Windows XP Styling (`ui/themes/windows-xp.css`)**:
  - Classic Luna Blue color palette: Title bar blues (`#0055ea` to `#0037a5`), Start button greens (`#388e3c`), Taskbar blues (`#245edb`).
  - Standard XP window borders, 3D bevels, minimize/maximize/close button glyphs with active press states.
  - Crisp typography using classic system fallbacks (Tahoma, Segoe UI, sans-serif).
  - Authentic animation curves for window minimize to taskbar and Start Menu slide-in (`ui/animations.css`).
- **Windows 98 Theme (`ui/themes/windows-98.css`)**: Classic gray bevels, teal desktop background (`#008080`), and retro 16-color icons.

### 4.13 Configuration Specification (`os.config.json`)
The central system configuration defines system constraints and behavior:
```json
{
  "system": {
    "name": "Retro Web",
    "version": "1.0.0",
    "build": "2026.02.03",
    "copyright": "Nohan Baloch"
  },
  "boot": {
    "splashDuration": 2000,
    "diagnosticsEnabled": true,
    "simulatedLatency": 150,
    "progressSteps": 7,
    "soundEnabled": false
  },
  "kernel": {
    "maxProcesses": 64,
    "eventQueueSize": 1000,
    "debugMode": false,
    "strictSandboxing": true,
    "totalMemoryMB": 256,
    "defaultProcessMemoryMB": 32,
    "cpuThrottleLimit": 100,
    "cpuThrottleDelay": 50
  },
  "display": {
    "defaultTheme": "windows-xp",
    "defaultResolution": "1024x768",
    "allowCustomThemes": true
  },
  "filesystem": {
    "storageBackend": "indexeddb",
    "maxFileSize": 52428800,
    "quotaWarningThreshold": 0.8
  },
  "security": {
    "requirePermissions": true,
    "allowPlugins": true,
    "verifySignatures": false
  },
  "ui": {
    "animationsEnabled": true,
    "transitionDuration": 300,
    "windowSnapThreshold": 20
  },
  "power": {
    "shutdownDelay": 1000,
    "sleepTimeout": 0,
    "autoSaveInterval": 30000
  }
}
```

---

## 5. Complete Development Roadmap & Implementation Tracker

### Current Status Overview
- **Completed Phases**: Phases 1, 2, 3, 4, 5, 6
- **Current Active Phase**: Phase 7 (Plugin System) & Phase 8 (Polish & Optimization)
- **Codebase Scale**: 36+ core files, ~6,000+ lines of pure JavaScript, 100% Windows XP visual fidelity.

---

### Phase 1: Foundation ✅ COMPLETE
- [x] **Bootloader**: 7-stage bootloader sequence (`boot/bootloader.js`)
- [x] **Splash Screen**: BIOS POST & animated Windows XP loading screen (`boot/splash.js`)
- [x] **System Diagnostics**: Hardware, storage, and feature verification (`boot/diagnostics.js`)
- [x] **BSOD System**: Blue Screen of Death crash screen with STOP codes (`boot/bsod.js`)
- [x] **Crash Logging**: Global error interception and crash dump logger
- [x] **Core Kernel**: Process lifecycle, PID management, and state tables (`kernel/kernel.js`)
- [x] **Event Bus**: Inter-process event broker (`kernel/event-bus.js`)
- [x] **Scheduler**: Round-robin task scheduling and time-slicing (`kernel/scheduler.js`)
- [x] **Permissions Engine**: Capability checks and security prompts (`kernel/permissions.js`)
- [x] **UI Theme Foundation**: Windows XP Luna Blue CSS styling (`ui/themes/windows-xp.css`)
- [x] **System Configuration**: Master configuration schema (`os.config.json`)

---

### Phase 2: Desktop Environment ✅ COMPLETE
- [x] **Taskbar**:
  - [x] Start button with authentic XP hover/press effects
  - [x] Quick Launch bar with icon shortcuts (IE, Explorer, Notepad)
  - [x] Dynamic window buttons with focus/minimize toggles
  - [x] System tray with volume, network, and status icons
  - [x] Real-time clock updating every second
  - [x] Notification badge support
- [x] **Start Menu**:
  - [x] Two-column XP layout (Pinned programs left, system locations right)
  - [x] User profile picture and username header
  - [x] Frequently used programs list
  - [x] Power options (Shutdown, Log Off) with modal prompt
  - [x] Smooth slide-in animation and click-outside-to-close behavior
  - [x] Search input box
  - [x] "All Programs" cascading flyout menu
- [x] **Desktop**:
  - [x] 80px snap-to-grid icon layout system
  - [x] Authentic Windows XP blue background (`#245edb`)
  - [x] Single-click icon selection highlight, double-click to launch
  - [x] Default icons: My Computer, My Documents, Recycle Bin, Notepad
  - [x] Right-click context menu (View, Sort, Refresh, New Folder, Properties)
  - [x] Rubberband multi-icon selection
  - [x] Desktop file shortcuts
- [x] **Window Manager Enhancements**:
  - [x] Smooth window dragging with boundary clamping
  - [x] Minimize, Maximize, Restore, and Close actions
  - [x] Stacking order (z-index) and focus management
  - [x] Active vs. Inactive window title bar styling
  - [x] Window edge and corner resizing
  - [x] Screen edge snapping (20px threshold)
  - [x] Alt+Tab window switcher overlay
  - [x] Minimize to taskbar / restore animations
  - [x] Modal dialog support (blocking parent window)

---

### Phase 3: Virtual Filesystem (VFS) ✅ COMPLETE
- [x] **VFS Core**:
  - [x] IndexedDB storage backend with persistent local database (`filesystem/storage.js`)
  - [x] Hierarchical directory tree structure (`filesystem/directory.js`)
  - [x] File node with name, size, type, timestamps, permissions (`filesystem/file.js`)
  - [x] MIME type detection for 30+ extensions (`filesystem/mime-types.js`)
  - [x] Path resolution with relative path parsing (`filesystem/path-resolver.js`)
  - [x] Default Windows XP directory structure seed (`filesystem/default-structure.js`)
  - [x] System Cache and User Profile directories
- [x] **File Operations**:
  - [x] Create file & Create directory
  - [x] Read file & Write file (text and binary base64)
  - [x] Delete file & Delete directory (recursive)
  - [x] Rename and Move files/folders
  - [x] Copy and Paste operations
  - [x] Recursive file search
- [x] **File Associations**:
  - [x] Registered file extensions in Registry
  - [x] Default application handlers
  - [x] "Open With" dialog selector
  - [x] Authentic file type icons

---

### Phase 4: Built-in Applications ✅ COMPLETE
- [x] **File Explorer (`apps/file-explorer.js`)**:
  - [x] Address bar with breadcrumbs and path editing
  - [x] Navigation toolbar: Back, Forward, Up, New Folder, Delete
  - [x] Tree view sidebar for directory hierarchy
  - [x] Icon View, List View, and Details View
  - [x] Status bar displaying file count and selected size
  - [x] Right-click context menus with Cut/Copy/Paste/Delete/Rename
  - [x] Drag-and-drop file movement
- [x] **Notepad (`apps/notepad.js`)**:
  - [x] Full text editing textarea with font formatting
  - [x] Menu bar: File, Edit, Format, Help
  - [x] Open and Save dialogs integrated with VFS
  - [x] 30-second background autosave
  - [x] Status bar showing line, column, and word count
  - [ ] Advanced encoding support (UTF-16, ANSI)
- [x] **Terminal (`apps/terminal.js`)**:
  - [x] Authentic XP Command Prompt UI (`cmd.exe`)
  - [x] History buffer with Up/Down arrow navigation
  - [x] 18+ built-in commands (`help`, `cls`, `dir`, `cd`, `pwd`, `mkdir`, `rmdir`, `type`, `echo`, `touch`, `del`, `date`, `whoami`, `ver`, `ps`, `kill`, `notepad`, `explorer`, `exit`)
  - [x] Basic tab completion
  - [x] VFS command integration
  - [ ] Advanced regex search in terminal
- [x] **Paint (`apps/paint.js`)**:
  - [x] 640x400 HTML5 canvas with zoom and resize handles
  - [x] 14 tools (Pencil, Brush, Eraser, Fill, Eyedropper, Line, Shapes)
  - [x] 32-color palette + custom RGB picker
  - [x] Brush size selector (1px to 50px)
  - [x] Undo and Redo history stack
  - [x] Image Flip (Horizontal/Vertical) and Invert Colors
  - [x] Save to and load from VFS
- [x] **Control Panel (`apps/control-panel.js`)**:
  - [x] System Information tab
  - [x] Theme picker (Windows XP vs. Windows 98)
  - [x] Display resolution switcher
  - [x] User configuration editor
  - [x] Installed applications manager
  - [x] About Windows dialog
- [x] **Calculator (`apps/calculator.js`)**:
  - [x] Standard arithmetic operations (+, -, *, /)
  - [x] Memory keys (MC, MR, MS, M+)
  - [x] Keyboard numpad support
  - [ ] Scientific calculator mode
- [x] **Minesweeper (`apps/minesweeper.js`)**:
  - [x] Classic board generator with Beginner, Intermediate, Expert
  - [x] Smiley face status button, timer, and mine counter
  - [x] High score tracking in LocalStorage
- [x] **Solitaire (`apps/solitaire.js`)**:
  - [x] Klondike Solitaire rules and card deck
  - [x] Drag-and-drop card staging
  - [x] Draw 1 / Draw 3 toggle
  - [x] Victory cascade card animation

---

### Phase 5: Advanced Features ✅ COMPLETE
- [x] **Task Manager (`system/task-manager.js`)**:
  - [x] Processes tab with PID, Name, CPU %, Memory (MB)
  - [x] Performance tab with real-time CPU and Memory canvas graphs
  - [x] End Process, Suspend, Resume controls
  - [x] System process protection (cannot kill PID 0 / Kernel)
  - [x] `Ctrl+Alt+Del` launch shortcut
- [x] **Input & Shortcuts (`system/input-manager.js`)**:
  - [x] `Ctrl+Alt+Del`, `Alt+Tab`, `Alt+F4`, `Win`, `Win+D`, `Win+E`
  - [ ] Advanced keyboard-only UI navigation
- [x] **Clipboard Subsystem (`system/clipboard.js`)**:
  - [x] Text copy/cut/paste across applications
  - [x] File copy/cut/paste between Explorer and Desktop
  - [ ] Clipboard history viewer
- [x] **Drag & Drop Subsystem**:
  - [x] Desktop icon drag & drop
  - [x] Explorer file drag & drop into folders
  - [x] Drop visual indicators
- [x] **Notification Center (`system/notification-center.js`)**:
  - [x] System tray balloon toasts
  - [x] Queue management and auto-dismissal
  - [x] Action button callbacks

---

### Phase 6: Security & Sandboxing ✅ COMPLETE
- [x] **Proxy Sandbox (`security/sandbox.js`)**:
  - [x] Process isolation via Proxy execution environment
  - [x] DOM access restriction (scoped to app window)
  - [x] Simulated memory allocation limits
  - [x] CPU timeslice rate limiting
- [x] **Permissions System**:
  - [x] Interactive XP permission prompt dialogs
  - [x] Persistent permission grant storage
  - [x] Permission revocation in Control Panel
  - [x] Visual warnings for high-risk capabilities
- [x] **Integrity Verification (`security/integrity-checker.js`)**:
  - [x] Manifest signature checks
  - [x] SHA-256 integrity verification of system files

---

### Phase 7: Plugin System 🚧 IN PROGRESS
- [ ] **Plugin SDK (`plugins/plugin-sdk.js`)**:
  - [ ] Plugin API documentation & reference
  - [ ] Plugin manifest validator
  - [ ] Plugin lifecycle hooks (`onLoad`, `onStart`, `onSuspend`, `onUnload`)
  - [ ] Permission declarations for plugins
- [ ] **Plugin Manager**:
  - [ ] Install plugins from URL or VFS package
  - [ ] Uninstall and disable plugins
  - [ ] Plugin settings panel in Control Panel

---

### Phase 8: Polish, Performance & Sound 📋 PLANNED
- [ ] **Performance Optimizations**:
  - [ ] Virtual DOM list rendering for large directories in Explorer
  - [ ] Dynamic lazy-loading of heavy application scripts
  - [ ] Comprehensive event listener and DOM cleanup on window close
- [ ] **Sound Subsystem**:
  - [ ] Synthesized or Web Audio API sound playback
  - [ ] Windows XP Startup sound
  - [ ] Shutdown and Logoff sounds
  - [ ] Critical Error, Exclamation, Asterisk, and Balloon notification chimes
  - [ ] Taskbar volume control slider
- [ ] **Accessibility & Themes**:
  - [x] Windows 98 Classic Theme (`ui/themes/windows-98.css`)
  - [ ] High Contrast accessibility theme
  - [ ] Font size scaling option in Control Panel
  - [ ] Theme editor tool

---

### Phase 9: Additional Applications 💡 FUTURE
- [ ] **Media Player**: Audio and video player supporting web formats (MP3, WAV, MP4, WebM) with playlists.
- [ ] **Image Viewer (`shimgvw.dll`)**: Dedicated Windows Picture and Fax Viewer with zoom and slideshow.
- [ ] **WordPad**: Rich text formatting editor supporting RTF and HTML documents.
- [ ] **Web Browser in Browser**: Sandboxed iframe-based mini-browser with URL bar and bookmarks.
- [ ] **System Restore**: Snapshot manager for VFS state backups and one-click rollback.

---

## 6. Testing, Validation & Quality Assurance

### Testing Infrastructure
All features must be validated using the dedicated test pages in `test/`:
- **`test/TEST.html`**: Core system test harness covering Bootloader, Kernel, Event Bus, VFS, and Permissions.
- **`test/PHASE2.html`**: Interactive desktop showcase covering Window Manager, Taskbar, Start Menu, Context Menus, and Drag-and-Drop.
- **`test/PHASE3.html`**: Dedicated Virtual Filesystem test harness executing automated CRUD, IndexedDB persistence, and MIME type tests.

### Validation Checklist Before Completing Any Agent Task
1. **Cold Boot Validation**: Open `index.html` via local web server (`powershell .\start-server.ps1` or browser) and ensure the 7-stage bootloader completes without errors.
2. **Console Error Free**: Open browser Developer Tools (`F12`); ensure zero unhandled exceptions, syntax errors, or 404 resource errors.
3. **Application Verification**: Launch every modified application from both the Start Menu and Desktop; test open, edit, save, minimize, maximize, and close.
4. **VFS Persistence Verification**: Create or edit a file, refresh the browser page, and verify the file content persists accurately in IndexedDB.
5. **Window Stacking & Focus**: Ensure newly clicked or created windows raise to the top (`z-index`) and receive active title bar styling.
6. **Task Manager Verification**: Press `Ctrl+Alt+Del`; ensure the process list updates accurately and that ending a process properly terminates its window.
7. **Crash / BSOD Verification**: Any intentional fatal error test must cleanly render the BSOD without crashing the host browser page.

### Browser Compatibility Matrix
| Browser | Target Support | Notes |
|:---|:---:|:---|
| **Google Chrome / Chromium** | ✅ 100% | Primary development and testing target |
| **Microsoft Edge** | ✅ 100% | Full feature and shortcut parity |
| **Mozilla Firefox** | ✅ 100% | Verified IndexedDB and CSS grid support |
| **Apple Safari** | ⚠️ 95% | Requires standard WebKit flex/grid compatibility |

---

## 7. Example Agent Prompts & Workflows

When directing AI agents to work on Retro Web, use specific, modular prompts referencing exact subsystem paths:

### Application Development
- *"Implement a new built-in app `apps/wordpad.js` that registers with `kernel/kernel.js`, provides File/Edit/Format menus, interacts with `filesystem/vfs.js`, and adds a shortcut to the Start Menu."*
- *"Add scientific calculator mode to `apps/calculator.js` with trigonometric, logarithmic, and power functions."*

### UI & Window Management
- *"Enhance `system/window-manager.js` to implement window cascading and tiling when right-clicking the Taskbar."*
- *"Add authentic sound chimes to `system/notification-center.js` using the Web Audio API without any external dependencies."*

### Virtual Filesystem & Storage
- *"Implement file compression simulation (.zip) in `filesystem/` supporting virtual folder archive and extraction."*
- *"Extend `filesystem/mime-types.js` to support audio files (.wav, .mp3) and associate them with the upcoming Media Player app."*

### Kernel & Security
- *"Refactor `security/sandbox.js` to enforce strict iframe-less memory quotas per process using the Task Scheduler rate limiter."*
- *"Add an automatic crash dump generator in `boot/bsod.js` that writes diagnostic logs to `C:\Windows\Minidump\` via VFS before rendering the BSOD."*

---

## 8. Repository & Contact Information

- **Repository**: [https://github.com/nohanbaloch/retro-web](https://github.com/nohanbaloch/retro-web)
- **Author & Maintainer**: **Nohan Baloch**
- **License**: MIT License (see [LICENSE](file:///c:/Workspace/Web/retro-web/LICENSE))
- **Environment**: Pure JavaScript (ES6+ Modules), HTML5, CSS3, IndexedDB. No npm packages, no build steps.
