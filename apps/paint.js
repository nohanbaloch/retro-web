/**
 * Paint Application
 * A drawing application for Retro Web OS
 */

class Paint {
    constructor() {
        this.windowManager = null;
        this.vfs = null;
        this.windowId = null;
        this.canvas = null;
        this.ctx = null;
        
        // Drawing state
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentTool = 'pencil';
        this.currentColor = '#000000';
        this.secondaryColor = '#FFFFFF';
        this.brushSize = 2;
        
        // History for undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // Shape drawing
        this.shapeStartX = 0;
        this.shapeStartY = 0;
        this.tempCanvas = null;
        
        // Current file
        this.currentFile = null;
        this.isModified = false;
    }

    /**
     * Initialize with system references
     */
    init(windowManager, vfs) {
        this.windowManager = windowManager;
        this.vfs = vfs;
    }

    /**
     * Open Paint window
     */
    open() {
        if (!this.windowManager) {
            console.error('[Paint] WindowManager not initialized');
            return;
        }

        const win = this.windowManager.createWindow({
            title: 'Untitled - Paint',
            width: 850,
            height: 600,
            x: 80 + Math.random() * 60,
            y: 50 + Math.random() * 40,
            content: this.createPaintHTML()
        });

        this.windowId = win.id;
        
        // Remove default padding
        const contentArea = win.element.querySelector('.window-content');
        if (contentArea) {
            contentArea.style.padding = '0';
            contentArea.style.overflow = 'hidden';
        }

        // Initialize canvas
        this.initCanvas(win.id);
        
        // Set up event listeners
        this.setupEventListeners(win.id);

        return win;
    }

    /**
     * Create Paint HTML
     */
    createPaintHTML() {
        return `
            <div class="paint-container" style="display: flex; flex-direction: column; height: 100%; background: #C0C0C0; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <!-- Menu Bar -->
                <div class="paint-menubar" style="display: flex; background: #f0f0f0; border-bottom: 1px solid #999; font-size: 12px;">
                    <div class="menu-item" data-menu="file" style="padding: 4px 12px; cursor: pointer; position: relative;">
                        File
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); min-width: 120px; z-index: 1000;">
                            <div class="menu-option" data-action="new" style="padding: 6px 20px; cursor: pointer;">New</div>
                            <div class="menu-option" data-action="open" style="padding: 6px 20px; cursor: pointer;">Open...</div>
                            <div class="menu-option" data-action="save" style="padding: 6px 20px; cursor: pointer;">Save</div>
                            <div class="menu-option" data-action="saveas" style="padding: 6px 20px; cursor: pointer;">Save As...</div>
                            <div style="height: 1px; background: #ddd; margin: 4px 0;"></div>
                            <div class="menu-option" data-action="close" style="padding: 6px 20px; cursor: pointer;">Exit</div>
                        </div>
                    </div>
                    <div class="menu-item" data-menu="edit" style="padding: 4px 12px; cursor: pointer; position: relative;">
                        Edit
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); min-width: 120px; z-index: 1000;">
                            <div class="menu-option" data-action="undo" style="padding: 6px 20px; cursor: pointer;">Undo</div>
                            <div class="menu-option" data-action="redo" style="padding: 6px 20px; cursor: pointer;">Redo</div>
                            <div style="height: 1px; background: #ddd; margin: 4px 0;"></div>
                            <div class="menu-option" data-action="clear" style="padding: 6px 20px; cursor: pointer;">Clear All</div>
                        </div>
                    </div>
                    <div class="menu-item" data-menu="image" style="padding: 4px 12px; cursor: pointer; position: relative;">
                        Image
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); min-width: 120px; z-index: 1000;">
                            <div class="menu-option" data-action="resize" style="padding: 6px 20px; cursor: pointer;">Resize...</div>
                            <div class="menu-option" data-action="flip-h" style="padding: 6px 20px; cursor: pointer;">Flip Horizontal</div>
                            <div class="menu-option" data-action="flip-v" style="padding: 6px 20px; cursor: pointer;">Flip Vertical</div>
                        </div>
                    </div>
                    <div class="menu-item" data-menu="help" style="padding: 4px 12px; cursor: pointer; position: relative;">
                        Help
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); min-width: 120px; z-index: 1000;">
                            <div class="menu-option" data-action="about" style="padding: 6px 20px; cursor: pointer;">About Paint</div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div style="display: flex; flex: 1; overflow: hidden;">
                    <!-- Tool Palette -->
                    <div class="paint-toolbox" style="width: 60px; background: #C0C0C0; border-right: 1px solid #808080; padding: 5px; display: flex; flex-direction: column; gap: 2px;">
                        <div class="tool-btn selected" data-tool="pencil" title="Pencil" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #808080; background: #fff; font-size: 14px;">✏️</div>
                        <div class="tool-btn" data-tool="brush" title="Brush" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #808080; background: #C0C0C0; font-size: 14px;">🖌️</div>
                        <div class="tool-btn" data-tool="eraser" title="Eraser" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #808080; background: #C0C0C0; font-size: 14px;">🧽</div>
                        <div class="tool-btn" data-tool="fill" title="Fill" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #808080; background: #C0C0C0; font-size: 14px;">🪣</div>
                        <div class="tool-btn" data-tool="eyedropper" title="Color Picker" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #808080; background: #C0C0C0; font-size: 14px;">💧</div>
                        <div style="height: 1px; background: #808080; margin: 4px 0;"></div>
                        <div class="tool-btn" data-tool="line" title="Line" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #808080; background: #C0C0C0; font-size: 14px;">╱</div>
                        <div class="tool-btn" data-tool="rectangle" title="Rectangle" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #808080; background: #C0C0C0; font-size: 14px;">▢</div>
                        <div class="tool-btn" data-tool="ellipse" title="Ellipse" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #808080; background: #C0C0C0; font-size: 14px;">◯</div>
                        
                        <!-- Brush Size -->
                        <div style="margin-top: 10px; font-size: 10px; text-align: center;">Size</div>
                        <input type="range" class="brush-size" min="1" max="50" value="2" style="width: 50px;" title="Brush Size">
                        <div class="size-display" style="font-size: 10px; text-align: center;">2px</div>
                    </div>

                    <!-- Canvas Area -->
                    <div class="paint-canvas-area" style="flex: 1; overflow: auto; background: #808080; padding: 10px;">
                        <canvas class="paint-canvas" width="640" height="400" style="background: white; cursor: crosshair; box-shadow: 2px 2px 5px rgba(0,0,0,0.3);"></canvas>
                    </div>
                </div>

                <!-- Color Palette -->
                <div class="paint-colorbar" style="display: flex; align-items: center; padding: 5px 10px; background: #C0C0C0; border-top: 1px solid #808080;">
                    <!-- Current Colors -->
                    <div style="position: relative; width: 30px; height: 30px; margin-right: 10px;">
                        <div class="secondary-color" style="position: absolute; right: 0; bottom: 0; width: 20px; height: 20px; background: #FFFFFF; border: 1px solid #808080;"></div>
                        <div class="primary-color" style="position: absolute; left: 0; top: 0; width: 20px; height: 20px; background: #000000; border: 1px solid #808080;"></div>
                    </div>
                    
                    <!-- Color Palette -->
                    <div class="color-palette" style="display: flex; flex-wrap: wrap; gap: 1px;">
                        ${this.generateColorPalette()}
                    </div>
                </div>

                <!-- Status Bar -->
                <div class="paint-statusbar" style="display: flex; justify-content: space-between; padding: 4px 10px; background: #f0f0f0; border-top: 1px solid #ccc; font-size: 11px; color: #666;">
                    <span class="status-left">Ready</span>
                    <span class="status-right">640 x 400</span>
                </div>
            </div>
        `;
    }

    /**
     * Generate color palette HTML
     */
    generateColorPalette() {
        const colors = [
            '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
            '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF',
            '#C0C0C0', '#808080', '#FF8080', '#FFFF80', '#80FF80', '#80FFFF', '#8080FF', '#FF80FF',
            '#404040', '#004040', '#804000', '#408000', '#004080', '#400080', '#804080', '#408040'
        ];

        return colors.map(color => `
            <div class="color-swatch" data-color="${color}" 
                 style="width: 16px; height: 16px; background: ${color}; border: 1px solid #808080; cursor: pointer;"
                 title="${color}"></div>
        `).join('');
    }

    /**
     * Initialize canvas
     */
    initCanvas(windowId) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        this.canvas = windowEl.querySelector('.paint-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set white background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save initial state
        this.saveToHistory();
        
        // Create temp canvas for shape preview
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.width = this.canvas.width;
        this.tempCanvas.height = this.canvas.height;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners(windowId) {
        const windowEl = document.getElementById(windowId);
        if (!windowEl) return;

        const container = windowEl.querySelector('.paint-container');
        if (!container) return;

        // Menu handling
        const menuItems = container.querySelectorAll('.menu-item');
        const menuOptions = container.querySelectorAll('.menu-option');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = item.querySelector('.menu-dropdown');
                
                menuItems.forEach(i => {
                    if (i !== item) {
                        i.querySelector('.menu-dropdown').style.display = 'none';
                    }
                });

                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });

            item.addEventListener('mouseenter', () => item.style.background = '#E0E0E0');
            item.addEventListener('mouseleave', () => item.style.background = 'transparent');
        });

        menuOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMenuAction(option.dataset.action, windowId);
                menuItems.forEach(i => i.querySelector('.menu-dropdown').style.display = 'none');
            });

            option.addEventListener('mouseenter', () => {
                option.style.background = '#0078D7';
                option.style.color = 'white';
            });
            option.addEventListener('mouseleave', () => {
                option.style.background = 'transparent';
                option.style.color = 'black';
            });
        });

        document.addEventListener('click', () => {
            menuItems.forEach(i => i.querySelector('.menu-dropdown').style.display = 'none');
        });

        // Tool selection
        const toolBtns = container.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => {
                    b.style.background = '#C0C0C0';
                    b.classList.remove('selected');
                });
                btn.style.background = '#FFFFFF';
                btn.classList.add('selected');
                this.currentTool = btn.dataset.tool;
                this.updateStatus(windowId, `Tool: ${this.currentTool}`);
            });
        });

        // Brush size
        const brushSize = container.querySelector('.brush-size');
        const sizeDisplay = container.querySelector('.size-display');
        brushSize.addEventListener('input', () => {
            this.brushSize = parseInt(brushSize.value);
            sizeDisplay.textContent = `${this.brushSize}px`;
        });

        // Color palette
        const colorSwatches = container.querySelectorAll('.color-swatch');
        const primaryColor = container.querySelector('.primary-color');
        const secondaryColor = container.querySelector('.secondary-color');

        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                this.currentColor = swatch.dataset.color;
                primaryColor.style.background = this.currentColor;
            });
            swatch.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.secondaryColor = swatch.dataset.color;
                secondaryColor.style.background = this.secondaryColor;
            });
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e, windowId));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e, windowId));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e, windowId));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e, windowId));
    }

    /**
     * Get canvas coordinates
     */
    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(e, windowId) {
        const coords = this.getCanvasCoords(e);
        this.isDrawing = true;
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.shapeStartX = coords.x;
        this.shapeStartY = coords.y;

        // Handle fill tool
        if (this.currentTool === 'fill') {
            this.floodFill(coords.x, coords.y, this.currentColor);
            this.saveToHistory();
            this.isModified = true;
            return;
        }

        // Handle eyedropper
        if (this.currentTool === 'eyedropper') {
            const pixel = this.ctx.getImageData(coords.x, coords.y, 1, 1).data;
            this.currentColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            const windowEl = document.getElementById(windowId);
            windowEl.querySelector('.primary-color').style.background = this.currentColor;
            return;
        }

        // For shapes, save current canvas state
        if (['line', 'rectangle', 'ellipse'].includes(this.currentTool)) {
            const tempCtx = this.tempCanvas.getContext('2d');
            tempCtx.drawImage(this.canvas, 0, 0);
        }

        // Start drawing for pencil/brush
        if (['pencil', 'brush', 'eraser'].includes(this.currentTool)) {
            this.ctx.beginPath();
            this.ctx.moveTo(coords.x, coords.y);
        }
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(e, windowId) {
        const coords = this.getCanvasCoords(e);
        
        // Update status with coordinates
        this.updateStatusRight(windowId, `${Math.round(coords.x)}, ${Math.round(coords.y)}`);

        if (!this.isDrawing) return;

        if (['pencil', 'brush', 'eraser'].includes(this.currentTool)) {
            this.draw(coords.x, coords.y);
        } else if (['line', 'rectangle', 'ellipse'].includes(this.currentTool)) {
            this.previewShape(coords.x, coords.y);
        }

        this.lastX = coords.x;
        this.lastY = coords.y;
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(e, windowId) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (['line', 'rectangle', 'ellipse'].includes(this.currentTool)) {
            const coords = this.getCanvasCoords(e);
            this.drawShape(this.shapeStartX, this.shapeStartY, coords.x, coords.y);
        }

        this.saveToHistory();
        this.isModified = true;
        this.updateTitle(windowId);
    }

    /**
     * Draw with current tool
     */
    draw(x, y) {
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        if (this.currentTool === 'eraser') {
            this.ctx.strokeStyle = '#FFFFFF';
        } else if (this.currentTool === 'brush') {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.brushSize * 2;
        } else {
            this.ctx.strokeStyle = this.currentColor;
        }

        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    /**
     * Preview shape while drawing
     */
    previewShape(x, y) {
        // Restore canvas from temp
        this.ctx.drawImage(this.tempCanvas, 0, 0);
        
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.beginPath();

        if (this.currentTool === 'line') {
            this.ctx.moveTo(this.shapeStartX, this.shapeStartY);
            this.ctx.lineTo(x, y);
        } else if (this.currentTool === 'rectangle') {
            this.ctx.rect(this.shapeStartX, this.shapeStartY, x - this.shapeStartX, y - this.shapeStartY);
        } else if (this.currentTool === 'ellipse') {
            const centerX = (this.shapeStartX + x) / 2;
            const centerY = (this.shapeStartY + y) / 2;
            const radiusX = Math.abs(x - this.shapeStartX) / 2;
            const radiusY = Math.abs(y - this.shapeStartY) / 2;
            this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        }

        this.ctx.stroke();
    }

    /**
     * Draw final shape
     */
    drawShape(x1, y1, x2, y2) {
        // Restore canvas from temp first
        this.ctx.drawImage(this.tempCanvas, 0, 0);
        
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.beginPath();

        if (this.currentTool === 'line') {
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
        } else if (this.currentTool === 'rectangle') {
            this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
        } else if (this.currentTool === 'ellipse') {
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            const radiusX = Math.abs(x2 - x1) / 2;
            const radiusY = Math.abs(y2 - y1) / 2;
            this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        }

        this.ctx.stroke();
    }

    /**
     * Flood fill algorithm
     */
    floodFill(startX, startY, fillColor) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        startX = Math.floor(startX);
        startY = Math.floor(startY);
        
        const startPos = (startY * this.canvas.width + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];

        // Parse fill color
        const fillRgb = this.hexToRgb(fillColor);
        if (!fillRgb) return;

        // Don't fill if same color
        if (startR === fillRgb.r && startG === fillRgb.g && startB === fillRgb.b) return;

        const stack = [[startX, startY]];
        const visited = new Set();

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) continue;

            const pos = (y * this.canvas.width + x) * 4;
            
            if (data[pos] !== startR || data[pos + 1] !== startG || data[pos + 2] !== startB) continue;

            visited.add(key);
            data[pos] = fillRgb.r;
            data[pos + 1] = fillRgb.g;
            data[pos + 2] = fillRgb.b;
            data[pos + 3] = 255;

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        if (hex.startsWith('rgb')) {
            const match = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
            }
        }
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // ==================== HISTORY (UNDO/REDO) ====================

    /**
     * Save current state to history
     */
    saveToHistory() {
        // Remove any redo states
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Save canvas state
        this.history.push(this.canvas.toDataURL());
        this.historyIndex++;

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    /**
     * Undo last action
     */
    undo(windowId) {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory(windowId);
            this.updateStatus(windowId, 'Undo');
        }
    }

    /**
     * Redo last undone action
     */
    redo(windowId) {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory(windowId);
            this.updateStatus(windowId, 'Redo');
        }
    }

    /**
     * Restore canvas from history
     */
    restoreFromHistory(windowId) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.history[this.historyIndex];
    }

    // ==================== MENU ACTIONS ====================

    /**
     * Handle menu actions
     */
    handleMenuAction(action, windowId) {
        switch (action) {
            case 'new':
                this.newImage(windowId);
                break;
            case 'open':
                this.showOpenDialog(windowId);
                break;
            case 'save':
                this.save(windowId);
                break;
            case 'saveas':
                this.showSaveDialog(windowId);
                break;
            case 'close':
                this.windowManager.close(windowId);
                break;
            case 'undo':
                this.undo(windowId);
                break;
            case 'redo':
                this.redo(windowId);
                break;
            case 'clear':
                this.clearCanvas(windowId);
                break;
            case 'resize':
                this.showResizeDialog(windowId);
                break;
            case 'flip-h':
                this.flipHorizontal(windowId);
                break;
            case 'flip-v':
                this.flipVertical(windowId);
                break;
            case 'about':
                this.showAbout();
                break;
        }
    }

    /**
     * Create new image
     */
    newImage(windowId) {
        if (this.isModified) {
            if (!confirm('You have unsaved changes. Create new image anyway?')) {
                return;
            }
        }

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.currentFile = null;
        this.isModified = false;
        this.history = [];
        this.historyIndex = -1;
        this.saveToHistory();
        this.updateTitle(windowId);
        this.updateStatus(windowId, 'New image created');
    }

    /**
     * Clear canvas
     */
    clearCanvas(windowId) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveToHistory();
        this.isModified = true;
        this.updateStatus(windowId, 'Canvas cleared');
    }

    /**
     * Show resize dialog
     */
    showResizeDialog(windowId) {
        const width = prompt('Enter new width:', this.canvas.width);
        if (!width) return;
        
        const height = prompt('Enter new height:', this.canvas.height);
        if (!height) return;

        this.resizeCanvas(parseInt(width), parseInt(height), windowId);
    }

    /**
     * Resize canvas
     */
    resizeCanvas(width, height, windowId) {
        // Store current image
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Resize
        this.canvas.width = width;
        this.canvas.height = height;
        this.tempCanvas.width = width;
        this.tempCanvas.height = height;
        
        // Fill with white
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, width, height);
        
        // Restore image data
        this.ctx.putImageData(imageData, 0, 0);
        
        this.saveToHistory();
        this.isModified = true;
        this.updateStatusRight(windowId, `${width} x ${height}`);
        this.updateStatus(windowId, `Resized to ${width}x${height}`);
    }

    /**
     * Flip horizontal
     */
    flipHorizontal(windowId) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(this.canvas, -this.canvas.width, 0);
        this.ctx.restore();
        this.saveToHistory();
        this.updateStatus(windowId, 'Flipped horizontally');
    }

    /**
     * Flip vertical
     */
    flipVertical(windowId) {
        this.ctx.save();
        this.ctx.scale(1, -1);
        this.ctx.drawImage(this.canvas, 0, -this.canvas.height);
        this.ctx.restore();
        this.saveToHistory();
        this.updateStatus(windowId, 'Flipped vertically');
    }

    // ==================== FILE OPERATIONS ====================

    /**
     * Show open dialog
     */
    async showOpenDialog(windowId) {
        alert('Open functionality would require loading image files from VFS.\nThis feature is under development.');
    }

    /**
     * Save current file
     */
    async save(windowId) {
        if (this.currentFile) {
            await this.saveToFile(this.currentFile, windowId);
        } else {
            await this.showSaveDialog(windowId);
        }
    }

    /**
     * Show save dialog
     */
    async showSaveDialog(windowId) {
        const defaultPath = this.currentFile || 'C:\\Documents and Settings\\User\\My Documents\\My Pictures\\untitled.png';
        const path = prompt('Save image as:', defaultPath);
        if (path) {
            await this.saveToFile(path, windowId);
        }
    }

    /**
     * Save to file
     */
    async saveToFile(filePath, windowId) {
        if (!this.vfs) {
            alert('Virtual filesystem not available');
            return;
        }

        try {
            // Get canvas data as base64
            const dataUrl = this.canvas.toDataURL('image/png');
            
            // Save to VFS (storing as data URL for now)
            await this.vfs.writeFile(filePath, dataUrl);
            this.currentFile = filePath;
            this.isModified = false;
            this.updateTitle(windowId);
            this.updateStatus(windowId, `Saved: ${filePath}`);
        } catch (err) {
            alert(`Failed to save file: ${err.message}`);
            console.error('[Paint] Save error:', err);
        }
    }

    /**
     * Show about dialog
     */
    showAbout() {
        alert('Paint for Retro Web OS\nVersion 1.0\n\n© 2026 Nohan Baloch');
    }

    // ==================== UI UPDATES ====================

    /**
     * Update window title
     */
    updateTitle(windowId) {
        const windowEl = document.getElementById(windowId);
        const titleBar = windowEl?.querySelector('.window-titlebar span');
        
        let title = this.currentFile ? this.currentFile.split('\\').pop() : 'Untitled';
        if (this.isModified) {
            title = '*' + title;
        }
        title += ' - Paint';
        
        if (titleBar) {
            titleBar.textContent = title;
        }
    }

    /**
     * Update status bar (left)
     */
    updateStatus(windowId, message) {
        const windowEl = document.getElementById(windowId);
        const statusLeft = windowEl?.querySelector('.status-left');
        
        if (statusLeft) {
            statusLeft.textContent = message;
        }
    }

    /**
     * Update status bar (right)
     */
    updateStatusRight(windowId, message) {
        const windowEl = document.getElementById(windowId);
        const statusRight = windowEl?.querySelector('.status-right');
        
        if (statusRight) {
            statusRight.textContent = message;
        }
    }
}

// Create global instance
const paint = new Paint();

// Export
export { Paint, paint };
