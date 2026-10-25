# AGENTS.md — Master Guide & Specification for Retro Web OS

> **Universal Agent Instruction File**  
> *Consolidated specification, architecture blueprint, agent operating rules, and development roadmap for Retro Web OS.*  
> *Applicable to all AI Coding Agents, Copilots, LLM Assistants, and Engineering Contributors.*

---

## 📑 Table of Contents
1. [Project Identity & Core Philosophy](#1-project-identity--core-philosophy)
2. [Tech Stack & Framework Evolution (React + Vite)](#2-tech-stack--framework-evolution-react--vite)
3. [Agent Operating Rules & Behavioral Directives](#3-agent-operating-rules--behavioral-directives)
4. [System Architecture & Directory Specification](#4-system-architecture--directory-specification)
5. [Subsystem Technical Specifications](#5-subsystem-technical-specifications)
   - [5.1 Bootloader & Startup Sequence](#51-bootloader--startup-sequence)
   - [5.2 Kernel, Process Management & OS Context](#52-kernel-process-management--os-context)
   - [5.3 Window Manager & Desktop Environment](#53-window-manager--desktop-environment)
   - [5.4 Virtual Filesystem (VFS)](#54-virtual-filesystem-vfs)
   - [5.5 Built-in Applications (React Component Architecture)](#55-built-in-applications-react-component-architecture)
   - [5.6 Input System, Keyboard Shortcuts & Clipboard](#56-input-system-keyboard-shortcuts--clipboard)
   - [5.7 Notification System](#57-notification-system)
   - [5.8 Security, Sandboxing & Integrity Engine](#58-security-sandboxing--integrity-engine)
   - [5.9 Services & Registry](#59-services--registry)
   - [5.10 Power Management](#510-power-management)
   - [5.11 Plugin System & SDK](#511-plugin-system--sdk)
   - [5.12 UI, Themes & Visual Fidelity](#512-ui-themes--visual-fidelity)
   - [5.13 Configuration Specification (`os.config.json`)](#513-configuration-specification-osconfigjson)
6. [Complete Development Roadmap & Implementation Tracker](#6-complete-development-roadmap--implementation-tracker)
7. [Testing, Validation & Quality Assurance](#7-testing-validation--quality-assurance)
8. [Example Agent Prompts & Workflows](#8-example-agent-prompts--workflows)
9. [Repository & Contact Information](#9-repository--contact-information)

---

## 1. Project Identity & Core Philosophy

### Overview
**Retro Web OS** is an authentic, web-based operating system inspired by **Windows XP**, engineered using **React + Vite**, modern JavaScript (ES6+ Modules), HTML5, and pure CSS. It runs entirely client-side inside modern web browsers with high performance, instant hot-module replacement (HMR), and zero server-side runtime dependencies.

### Core Non-Negotiable Tenets
1. **Not a Website — A Runtime Environment**: The browser is treated as bare-metal hardware. The React component tree functions as the visual representation of active OS processes, while underlying headless services manage the Kernel, Virtual Filesystem (VFS), and process tables.
2. **Framework Standard: React + Vite**: The application UI is built with React (functional components, hooks, and React Context). Bundling, fast development serving, and production packaging are orchestrated by Vite.
3. **Vanilla CSS Design Tokens — No CSS Frameworks**: The visual interface faithfully recreates the iconic Windows XP experience (Luna Blue theme, classic start menu, authentic dialog boxes, pixel-perfect bevels, and icons). Styling is achieved through vanilla CSS (`ui/themes/windows-xp.css`). Third-party CSS frameworks (TailwindCSS, Bootstrap, Material UI, Chakra UI, Ant Design) remain strictly forbidden unless explicitly requested.
4. **Deterministic Behavior & Explicit State**: No hidden side effects or black-box state mutations. All system state transitions must be explicit, verifiable, reversible, and traceable through OS Context providers and the Event Bus.
5. **Architectural Separation of Concerns**: Core OS services (VFS, Kernel, Scheduler, Registry) remain headless and testable independently of the React view layer, which subscribes to OS state changes via dedicated React hooks (`useWindowManager`, `useProcessManager`, `useVFS`).
6. **Final Directive**:
   > *"You are not building a demo. You are building a system. If something feels optional, it is not. If something feels hard, it is required. Build Retro Web as if browsers were the future hardware of civilization."*

---

## 2. Tech Stack & Framework Evolution (React + Vite)

Retro Web OS utilizes a modern, client-side SPA architecture:

- **UI Library**: React 19+ (using functional components, hooks, React.memo, and React Context).
- **Build Tool & Dev Server**: Vite (fast ES-module bundling, instant HMR, optimized static production build).
- **Styling**: Vanilla CSS adhering to Windows XP design tokens (`ui/themes/windows-xp.css` and `ui/animations.css`).
- **Storage Engine**: Browser IndexedDB for full Virtual Filesystem persistence across reboots.
- **Language**: Modern ECMAScript (ES2023+ Modules).

---

## 3. Agent Operating Rules & Behavioral Directives

All AI agents, Copilots, and contributors MUST follow these mandatory rules:

### 🚫 Strict Prohibitions (What You Must NEVER Do)
- **NEVER** introduce external UI component kits or CSS frameworks (Material UI, Chakra, AntD, TailwindCSS, Bootstrap). Use vanilla CSS with XP design tokens.
- **NEVER** introduce alternative frontend frameworks (Vue, Angular, Svelte, Solid). React is the standard.
- **NEVER** place files outside the established directory architecture or create unstructured flat root files.
- **NEVER** pollute the global `window` object with arbitrary variables. Only OS-level singletons formally managed by the system may be attached (e.g., `window.RetroWeb`).
- **NEVER** allow applications to communicate directly with one another or manipulate foreign DOM nodes outside their window container.
- **NEVER** use browser-native `alert()`, `confirm()`, or `prompt()`. All alerts, warnings, and prompts must use Retro Web's modal/dialog and notification subsystem components.
- **NEVER** bypass the Virtual Filesystem (`useVFS` / `vfs.js`) to query IndexedDB directly within app components.
- **NEVER** suppress fatal errors silently. Fatal system errors must trigger the simulated Blue Screen of Death (BSOD) subsystem.

### ✅ Mandatory Practices (What You Must ALWAYS Do)
- **ALWAYS** write modern React functional components using clean React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`).
- **ALWAYS** adhere to the prescribed directory structure (`src/components/`, `src/apps/`, `src/context/`, `src/hooks/`, `src/core/`, `ui/`).
- **ALWAYS** route inter-process communication, system events, and state broadcasts through the OS Event Bus and React Context providers.
- **ALWAYS** manage application lifecycles, processes, and permissions via the Process Manager hook / Kernel API.
- **ALWAYS** manage window creation, z-index, drag, resize, minimize, maximize, and restoration via `useWindowManager`.
- **ALWAYS** utilize the VFS hooks/services for file and directory CRUD operations, path resolution, and MIME-type handling.
- **ALWAYS** use `NotificationCenter` for user notifications and system alerts.
- **ALWAYS** use `useClipboard` for clipboard operations (text and virtual file copy/cut/paste).
- **ALWAYS** use the Registry service for file type associations, default application handlers, and configuration keys.
- **ALWAYS** maintain authentic Windows XP visual styling, typography, color palettes, bevels, title bars, and button states.
- **ALWAYS** verify that any newly implemented feature or bug fix runs cleanly via `npm run dev` with zero console errors.
- **ALWAYS** preserve existing documentation and code comments unrelated to your changes.

---

## 4. System Architecture & Directory Specification

The repository enforces a structured React + Vite OS architecture:

```
retro-web/
├── index.html                   # Vite HTML entry point & root container
├── package.json                 # Project dependencies & scripts (React, Vite)
├── vite.config.js               # Vite configuration
├── os.config.json               # System configuration parameters & resource limits
├── start-server.ps1             # Optional local fallback server
│
├── src/                         # React Application Source
│   ├── main.jsx                 # React root bootstrap (createRoot)
│   ├── App.jsx                  # Master OS Shell (Boot -> Desktop -> BSOD)
│   │
│   ├── boot/                    # Bootloader & crash sequence
│   │   ├── Bootloader.jsx       # 7-stage boot orchestrator component
│   │   ├── SplashScreen.jsx     # BIOS POST & XP loading splash screen
│   │   ├── Diagnostics.js       # Pre-boot hardware/integrity checks
│   │   └── BsodScreen.jsx       # Blue Screen of Death failure renderer
│   │
│   ├── context/                 # Global OS React Context & State
│   │   ├── OSContext.jsx        # Master OS state provider (boots, power, theme)
│   │   ├── WindowContext.jsx    # Window stacking, positions, active states
│   │   └── ProcessContext.jsx   # Running processes, PIDs, lifecycle
│   │
│   ├── hooks/                   # React OS Custom Hooks
│   │   ├── useWindowManager.js  # Open, close, minimize, maximize, snap, focus
│   │   ├── useProcessManager.js # Launch, terminate, suspend, list processes
│   │   ├── useVFS.js            # Read, write, delete, search virtual files
│   │   ├── useNotifications.js  # Balloon tips & toast alerts queue
│   │   ├── useClipboard.js      # System-wide text & file copy/paste
│   │   └── useRegistry.js       # File associations & registry querying
│   │
│   ├── components/              # Desktop Environment Components
│   │   ├── desktop/
│   │   │   ├── Desktop.jsx      # 80px snap grid, wallpaper, multi-select
│   │   │   ├── DesktopIcon.jsx  # Individual icon with selection & double-click
│   │   │   └── Rubberband.jsx   # Drag-to-select rectangle
│   │   │
│   │   ├── taskbar/
│   │   │   ├── Taskbar.jsx      # Taskbar shell with XP gradients
│   │   │   ├── StartButton.jsx  # Classic green Start button with press states
│   │   │   ├── QuickLaunch.jsx  # Quick Launch shortcuts (IE, Explorer, Notepad)
│   │   │   ├── TaskbarTabs.jsx  # Open window buttons with active/minimize toggles
│   │   │   ├── SystemTray.jsx   # Volume, Network, Security icons
│   │   │   └── LiveClock.jsx    # Clock updating every second
│   │   │
│   │   ├── startmenu/
│   │   │   ├── StartMenu.jsx    # Two-column XP Start Menu
│   │   │   ├── UserHeader.jsx   # User avatar and username
│   │   │   ├── PinnedList.jsx   # Pinned and frequent apps
│   │   │   ├── SystemPlaces.jsx # My Documents, My Computer, Control Panel
│   │   │   └── PowerOptions.jsx # Shutdown & Log Off buttons
│   │   │
│   │   ├── window/
│   │   │   ├── WindowContainer.jsx # Stacking (z-index) & window overlay layer
│   │   │   ├── Window.jsx          # XP Window shell (title bar, buttons, resize, drag)
│   │   │   ├── TitleBar.jsx        # Active/Inactive gradient, icon, min/max/close
│   │   │   ├── ModalDialog.jsx     # Modal dialog shell blocking parent window
│   │   │   └── AltTabSwitcher.jsx  # Alt+Tab graphical window switcher
│   │   │
│   │   ├── common/
│   │   │   ├── ContextMenu.jsx     # Universal XP context menu
│   │   │   └── NotificationCenter.jsx # XP balloon tooltips & toast queue
│   │
│   ├── apps/                    # Built-in Applications (React Components)
│   │   ├── file-explorer/       # Full GUI Explorer (tree, address bar, details view)
│   │   ├── notepad/             # Text editor with menus & autosave
│   │   ├── terminal/            # Command prompt with 18+ DOS/Unix utilities
│   │   ├── paint/               # Canvas drawing tool with 32-color palette & tools
│   │   ├── control-panel/       # Settings, theme switcher, system info
│   │   ├── task-manager/        # Process listing, real-time CPU/memory charts
│   │   ├── calculator/          # Standard calculator with arithmetic & memory
│   │   ├── minesweeper/         # Classic XP Minesweeper game
│   │   └── solitaire/           # Classic Klondike Solitaire card game
│   │
│   └── core/                    # Headless Operating System Core
│       ├── kernel/              # Process supervisor, scheduler, event bus, permissions
│       ├── filesystem/          # VFS, IndexedDB backend, path resolver, MIME types
│       ├── services/            # Registry, user session, settings
│       └── security/            # Sandbox, policy engine, integrity checker
│
├── ui/                          # Visual Assets & Global Themes
│   ├── themes/
│   │   ├── windows-xp.css       # Authentic Luna Blue XP styling & system metrics
│   │   └── windows-98.css       # Classic Windows 98 alternate theme
│   ├── animations.css           # Window minimize/restore & UI transition animations
│   ├── icons/                   # System icon assets
│   └── fonts/                   # System typography
│
├── test/                        # Interactive test suites and test harness pages
└── AGENTS.md                    # This master instructions file
```

---

## 5. Subsystem Technical Specifications

### 5.1 Bootloader & Startup Sequence
- **7-Stage Boot Process**:
  1. `HARDWARE_INIT`: Verify browser capabilities (IndexedDB, ES6 Modules, Canvas, LocalStorage).
  2. `DIAGNOSTICS`: Execute system diagnostics via `Diagnostics.js`.
  3. `INTEGRITY_CHECK`: Verify critical core files using `integrity-checker.js`.
  4. `VFS_MOUNT`: Initialize `storage.js` and mount default Windows directory tree.
  5. `KERNEL_INIT`: Instantiate Kernel, initialize PID tables, process scheduler, and event bus.
  6. `SERVICE_START`: Start Registry, Settings, Clipboard, and Power Manager.
  7. `DESKTOP_LAUNCH`: Transition React root state from Bootloader to `<Desktop />`, `<Taskbar />`, and `<WindowContainer />`.
- **Splash Screen (`SplashScreen.jsx`)**: Simulated BIOS POST screen transitioning into the Windows XP animated progress bar splash.
- **Crash Recovery & BSOD (`BsodScreen.jsx`)**: Any unhandled fatal exception in the boot chain or core kernel halts OS execution and renders an authentic full-screen Blue Screen of Death showing STOP codes, failing module name, and crash recovery instructions.

### 5.2 Kernel, Process Management & OS Context
- **Central Authority**: The Kernel maintains absolute authority over process creation, termination, and resource accounting.
- **React Process Integration**: Each active application is registered in `ProcessContext`:
  - `pid`: Unique integer process identifier.
  - `name`: Human-readable application name (e.g., `notepad.exe`).
  - `status`: Lifecycle state (`REGISTERED` → `LAUNCHED` → `RUNNING` → `SUSPENDED` → `TERMINATED`).
  - `windowId`: Corresponding window ID managed by `WindowContext`.
  - `memoryUsage`: Simulated memory allocation (MB) monitored by the scheduler.
  - `cpuUsage`: Calculated CPU timeslice percentage.
  - `permissions`: Set of approved system permissions.
- **Event Bus**: Decoupled pub/sub event dispatcher for Inter-Process Communication (IPC). Components publish events (e.g., `window:focus`, `file:saved`, `process:exit`) and clean up subscriptions on component unmount.
- **Task Scheduler**: Coordinates process execution slices, monitors resource limits, and enforces CPU/memory throttling as configured in `os.config.json`.
- **Permission System**: Fine-grained capability checks (`vfs.read`, `vfs.write`, `system.power`, `network.fetch`). Prompts the user with authentic XP dialogs before granting dangerous permissions.

### 5.3 Window Manager & Desktop Environment
- **Window Manager (`WindowContainer.jsx` & `Window.jsx`)**:
  - Full window lifecycle: Create, open, minimize, maximize, restore, close.
  - Stacking & Focus: Dynamic `z-index` management with visual state changes (active gradient title bar vs. inactive grayed title bar).
  - Geometry: Dragging with boundary constraints, edge/corner resizing, double-click title bar to maximize/restore.
  - Window Snapping: Snaps to screen edges within defined threshold (default: 20px).
  - Modal Dialogs: Modal windows block interaction with parent process windows until dismissed.
  - Keyboard Navigation: `Alt+Tab` graphical window switcher with icon previews; `Alt+F4` to close active window.
- **Taskbar (`Taskbar.jsx`)**:
  - Classic green XP "Start" button with authentic hover/active bitmaps and gradient.
  - Quick Launch toolbar (Show Desktop, Internet Explorer, Notepad, File Explorer).
  - Dynamic taskbar window buttons reflecting open windows with running state, minimize toggle, and active state highlights.
  - System Tray: Status icons (volume, network, security shield) and live clock updating every second.
- **Start Menu (`StartMenu.jsx`)**:
  - Authentic two-column layout: Left column for pinned and frequently used programs; right column for system folders (My Documents, My Pictures, My Computer, Control Panel, Search, Run).
  - Header with user profile avatar and username.
  - Footer with Log Off and Turn Off Computer (Shutdown) buttons.
  - "All Programs" cascading flyout submenu and integrated instant app search.
- **Desktop Grid (`Desktop.jsx`)**:
  - Authentic 80px snap grid for desktop icons.
  - Single-click to select (blue bounding box highlight), double-click to execute associated application.
  - Drag-and-drop icon rearrangement and multi-select rubberband rectangle.
  - Desktop context menu (View, Arrange Icons By, Refresh, New Folder, New Text Document, Properties).

### 5.4 Virtual Filesystem (VFS)
- **Persistence**: Backed by browser IndexedDB (`src/core/filesystem/storage.js`) ensuring all files, directories, edits, and newly created files survive page reloads and browser restarts.
- **Directory Hierarchy**:
  - `C:\` (Root system drive)
  - `C:\Windows\` (System files, fonts, drivers)
  - `C:\Windows\System32\` (Core binaries and utilities)
  - `C:\Program Files\` (Installed applications)
  - `C:\Documents and Settings\Default User\Desktop\` (Desktop files and shortcuts)
  - `C:\Documents and Settings\Default User\My Documents\` (User documents)
  - `C:\Documents and Settings\Default User\My Documents\My Pictures\` (Images)
  - `C:\System Cache\` (Temporary cache storage)
- **Path Resolution**: Resolves relative paths (`.`, `..`), normalizes Windows backslashes, supports drive letters (`C:\`), and resolves environment variables.
- **MIME Types & Associations**:
  - `.txt`, `.log`, `.md` → Notepad
  - `.bmp`, `.png`, `.jpg` → Paint
  - `.exe`, `.com` → Executable loader
  - Directories → File Explorer
  - "Open With" context menu allowing users to choose an alternative program.
- **File CRUD Operations**: Asynchronous `createFile()`, `readFile()`, `writeFile()`, `deleteFile()`, `createDirectory()`, `readDirectory()`, `deleteDirectory()`, `copy()`, `move()`, and `search()`. Exposed to React via `useVFS()`.

### 5.5 Built-in Applications (React Component Architecture)
1. **File Explorer (`src/apps/file-explorer/`)**:
   - Navigation: Back, Forward, Up, and editable Address Bar.
   - Views: Large Icons, List, and Details view (Name, Size, Type, Date Modified).
   - Sidebar: Tree-view navigation panel of the filesystem.
   - Context Menus: Full file operations (Cut, Copy, Paste, Delete, Rename, Properties).
   - Drag and drop support between folders and to/from the Desktop.
2. **Notepad (`src/apps/notepad/`)**:
   - Menus: File (New, Open, Save, Save As, Exit), Edit (Undo, Cut, Copy, Paste, Delete, Select All), Format (Word Wrap, Font).
   - Integration: Direct reading and writing to VFS text files via `useVFS()`.
   - Autosave: 30-second interval automatic save to prevent data loss.
   - Status bar displaying line count, column count, and file encoding.
3. **Terminal (`src/apps/terminal/`)**:
   - Authentic Command Prompt styling (`cmd.exe`).
   - Command history navigation (Up/Down arrow keys) and Tab auto-completion.
   - Built-in commands: `help`, `cls`/`clear`, `dir`/`ls`, `cd`, `pwd`, `mkdir`, `rmdir`, `type`/`cat`, `echo`, `touch`, `del`/`rm`, `date`, `whoami`, `ver`, `ps`, `kill`, `notepad`, `explorer`, `exit`.
4. **Paint (`src/apps/paint/`)**:
   - Canvas-based raster drawing area (default 640x400 with resize handles).
   - Tool Palette: Free-form Select, Eraser, Fill with Color, Pick Color (Eyedropper), Pencil, Brush, Airbrush, Text, Line, Curve, Rectangle, Polygon, Ellipse, Rounded Rectangle.
   - 32-color classic Windows XP palette with custom color picker.
   - Operations: Undo/Redo history, Invert Colors, Flip/Rotate, Stretch/Skew.
   - VFS Integration: Open image files from VFS, save to VFS in PNG/BMP format.
5. **Control Panel (`src/apps/control-panel/`)**:
   - System Information: OS version, build, simulated RAM, CPU, user profile.
   - Display Properties: Wallpaper selector, theme switcher (Windows XP Luna Blue, Windows 98 Classic), resolution simulator.
   - Security & Permissions: View and revoke application permissions.
   - Add/Remove Programs: View installed applications and simulated disk usage.
6. **Task Manager (`src/apps/task-manager/`)**:
   - Processes Tab: Active processes, PID, CPU usage %, Memory usage (MB), "End Process" button with confirmation.
   - Performance Tab: Real-time animated canvas line charts for CPU Usage History and Pagefile/Memory Usage.
   - Shortcut: Accessible instantly via `Ctrl+Alt+Del` or right-clicking the Taskbar.
7. **Calculator (`src/apps/calculator/`)**:
   - Standard 4-function arithmetic operations (+, -, *, /), square root, percentage, reciprocal (1/x).
   - Memory functions: MC, MR, MS, M+.
   - Keyboard numpad input support.
8. **Minesweeper (`src/apps/minesweeper/`)**:
   - Classic puzzle game with Beginner (9x9, 10 mines), Intermediate (16x16, 40 mines), and Expert (30x16, 99 mines) modes.
   - Interactive smiley face reset button, mine counter, and digital timer.
   - Left-click reveal, right-click flag/question mark, and dual-click chord reveal.
9. **Solitaire (`src/apps/solitaire/`)**:
   - Classic Klondike Solitaire card game.
   - Drag-and-drop card movement, draw 1 or draw 3 modes, scoring, timer, and victory card cascade animation.

### 5.6 Input System, Keyboard Shortcuts & Clipboard
- **Global Shortcuts (`useInputManager`)**:
  - `Ctrl + Alt + Delete`: Launch Task Manager.
  - `Alt + Tab`: Open and cycle through the window switcher overlay.
  - `Alt + F4`: Close the currently focused window.
  - `Win` / `Ctrl + Esc`: Toggle the Start Menu open/closed.
  - `Win + D`: Show/Hide Desktop (minimize/restore all open windows).
  - `Win + E`: Launch File Explorer navigating to `C:\`.
  - `F5`: Refresh active folder view / desktop icons.
- **Clipboard (`useClipboard`)**:
  - Centralized OS clipboard supporting text snippets and virtual filesystem file references.
  - Standard `Ctrl+C` (Copy), `Ctrl+X` (Cut), and `Ctrl+V` (Paste) integrated across Desktop, File Explorer, and Notepad.

### 5.7 Notification System
- **Notification Center (`NotificationCenter.jsx`)**:
  - Balloon notification popups sliding up from the System Tray.
  - Notification queue preventing overlapping alerts.
  - Supports notification titles, body text, severity icons (Info, Warning, Error), optional action buttons, and automatic dismiss timeouts.
  - Replaces all browser-native popups.

### 5.8 Security, Sandboxing & Integrity Engine
- **Proxy Sandbox**:
  - Application scripts run within an isolated execution context.
  - Restricts direct access to the global `document` and foreign window DOM nodes.
  - Restricts dangerous JavaScript primitives (`eval`, `Function`, `localStorage` direct access).
  - Enforces memory allocation caps (configured in `os.config.json`).
- **Policy Engine**: Validates application manifests, requested capabilities, and permission access requests.
- **Integrity Checker**: SHA-256 hash checks on critical OS system modules during boot.

### 5.9 Services & Registry
- **Registry (`src/core/services/registry.js`)**:
  - Simulated hierarchical Windows Registry (`HKEY_LOCAL_MACHINE`, `HKEY_CURRENT_USER`, `HKEY_CLASSES_ROOT`).
  - Stores file extension associations, default application handlers, system appearance settings, and user preferences.
- **User Session**: Manages active user profile, profile directories, recent documents list, and session state persistence.
- **Settings**: High-level API for querying and persisting user configuration options.

### 5.10 Power Management
- **Power States**:
  1. `BOOT`: Normal cold boot sequence.
  2. `RESTART`: Flushes unsaved caches, unmounts VFS, reboots kernel, and re-executes bootloader.
  3. `SHUTDOWN`: Closes all running processes with unsaved check prompts, flushes VFS buffers, and displays the classic screen: *"It is now safe to turn off your computer."*
  4. `SLEEP`: Suspends process scheduling, preserves volatile state, and displays sleep lock screen.

### 5.11 Plugin System & SDK
- **Plugin SDK**:
  - Allows 3rd-party React applications to register with Retro Web.
  - Standard plugin package manifest:
    ```json
    {
      "id": "com.developer.appname",
      "name": "My App",
      "version": "1.0.0",
      "icon": "app-icon.png",
      "permissions": ["vfs.read", "ui.window"],
      "entryPoint": "main.jsx"
    }
    ```
  - Hooks into Window Manager, Start Menu, File Associations, and Desktop Shortcuts.

### 5.12 UI, Themes & Visual Fidelity
- **Authentic Windows XP Styling (`ui/themes/windows-xp.css`)**:
  - Classic Luna Blue color palette: Title bar blues (`#0055ea` to `#0037a5`), Start button greens (`#388e3c`), Taskbar blues (`#245edb`).
  - Standard XP window borders, 3D bevels, minimize/maximize/close button glyphs with active press states.
  - Crisp typography using classic system fallbacks (Tahoma, Segoe UI, sans-serif).
  - Authentic animation curves for window minimize to taskbar and Start Menu slide-in (`ui/animations.css`).
- **Windows 98 Theme (`ui/themes/windows-98.css`)**: Classic gray bevels, teal desktop background (`#008080`), and retro 16-color icons.

### 5.13 Configuration Specification (`os.config.json`)
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

## 6. Complete Development Roadmap & Implementation Tracker

### Current Status Overview
- **Completed Phases**: Phases 1, 2, 3, 4, 5, 6
- **Current Active Phase**: Phase 10 (React + Vite Modernization Transition) & Phase 7 (Plugin System)
- **Visual Fidelity Target**: 100% Windows XP authentic aesthetics with modern React architecture.

---

### Phase 1: Foundation ✅ COMPLETE
- [x] Bootloader with 7-stage sequence
- [x] BIOS-style splash screen
- [x] System diagnostics
- [x] BSOD implementation
- [x] Error handling and crash logging
- [x] Core kernel with process management
- [x] Event bus for inter-process communication
- [x] Process scheduler & permission engine
- [x] Windows XP Luna Blue theme styling

### Phase 2: Desktop Environment ✅ COMPLETE
- [x] Taskbar with Start button, Quick Launch, active window buttons, system tray, and live clock
- [x] Two-column XP Start Menu with search and power options
- [x] Desktop 80px snap-to-grid, selection highlight, rubberband multi-select, and shortcuts
- [x] Window Manager: drag, resize, minimize, maximize, restore, z-index, edge snapping, Alt+Tab

### Phase 3: Virtual Filesystem (VFS) ✅ COMPLETE
- [x] IndexedDB storage backend
- [x] Directory tree & file nodes (metadata, permissions, timestamps)
- [x] Path resolution with relative path parsing
- [x] MIME type detection for 30+ extensions
- [x] File operations: create, read, write, delete, move, copy, paste, search
- [x] File type associations and "Open With" dialog

### Phase 4: Built-in Applications ✅ COMPLETE
- [x] File Explorer (icon/details view, address bar, navigation, status bar, context menu)
- [x] Notepad (text editing, menus, VFS integration, 30s autosave)
- [x] Terminal (authentic cmd.exe prompt, history, 18+ DOS commands, tab completion)
- [x] Paint (canvas, 14 tools, 32-color palette, resize, flip, VFS integration)
- [x] Control Panel (system info, theme selector, display settings, app manager)
- [x] Calculator (standard arithmetic & memory functions)
- [x] Minesweeper (Beginner, Intermediate, Expert modes)
- [x] Solitaire (Klondike card game with victory cascade)

### Phase 5: Advanced Features ✅ COMPLETE
- [x] Task Manager (Processes and real-time CPU/Memory Performance tabs, process kill)
- [x] Global shortcuts (`Ctrl+Alt+Del`, `Alt+Tab`, `Alt+F4`, `Win`, `Win+D`, `Win+E`)
- [x] Clipboard system (text and file copy/cut/paste across apps)
- [x] Drag & Drop (desktop icons, Explorer files, folder drop zones)
- [x] Notification Center (balloon toasts, alert queue)

### Phase 6: Security & Sandboxing ✅ COMPLETE
- [x] Proxy Sandbox (process isolation, DOM access restrictions)
- [x] Permission system prompts & persistence
- [x] SHA-256 integrity checks and manifest verification

### Phase 10: React + Vite Modernization Transition 🚧 IN PROGRESS
- [x] Scaffold `package.json` with React 19+ and Vite
- [x] Configure `vite.config.js` with `@vitejs/plugin-react`
- [x] Define React architecture in `AGENTS.md`
- [ ] Implement `src/main.jsx` and `src/App.jsx`
- [ ] Implement `OSContext`, `WindowContext`, and `ProcessContext`
- [ ] Migrate `Desktop`, `Taskbar`, `StartMenu`, and `WindowContainer` to React components
- [ ] Wrap built-in apps into React application modules
- [ ] Connect `useVFS` and `useWindowManager` hooks to underlying OS core

---

## 7. Testing, Validation & Quality Assurance

### Development Server & Build
- **Local Dev Server**: Run `npm run dev` to launch Vite on `http://localhost:5173`.
- **Production Build**: Run `npm run build` to validate TypeScript/JSX syntax and generate optimized static assets.
- **Preview**: Run `npm run preview` to inspect the production bundle.

### Validation Checklist
1. **Zero Console Errors**: Ensure no unhandled exceptions, missing React keys, or broken imports in the browser console.
2. **Cold Boot Sequence**: Ensure the bootloader sequence completes smoothly from BIOS POST into the React Desktop.
3. **Window Mechanics**: Test dragging, corner resizing, active title bar gradients, minimize to taskbar, and restore.
4. **VFS Persistence**: Save a file in Notepad or Paint, refresh the browser, and ensure the file is retained in IndexedDB.
5. **Shortcuts & Alt+Tab**: Verify `Ctrl+Alt+Del` opens Task Manager and `Alt+Tab` cycles through open windows.

---

## 8. Example Agent Prompts & Workflows

When directing AI agents to build or enhance features in Retro Web:

- *"Implement `<WordPad />` in `src/apps/wordpad/` as a React component with rich text editing, File/Edit/Format menus, and `useVFS` integration."*
- *"Refactor `src/components/window/Window.jsx` to support dynamic boundary clamping and smooth maximize/restore transitions using React refs."*
- *"Create a custom hook `src/hooks/useSound.js` using the Web Audio API to play authentic Windows XP startup and balloon notification sounds without external audio assets."*
- *"Add scientific calculator functions (sin, cos, tan, log, pow) to `src/apps/calculator/Calculator.jsx`."*

---

## 9. Repository & Contact Information

- **Repository**: [https://github.com/nohanbaloch/retro-web](https://github.com/nohanbaloch/retro-web)
- **Author & Maintainer**: **Nohan Baloch**
- **License**: MIT License (see [LICENSE](file:///c:/Workspace/Web/retro-web/LICENSE))
- **Tech Stack**: React 19+, Vite, Vanilla CSS, IndexedDB.
