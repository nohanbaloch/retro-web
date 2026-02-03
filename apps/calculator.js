/**
 * Calculator Application
 * Classic Windows XP-style Calculator
 */
class Calculator {
    constructor() {
        this.windowManager = null;
        this.windowId = null;
        this.state = {
            display: '0',
            memory: 0,
            lastOperator: null,
            operand: null,
            newEntry: true,
            history: [] // For potential history tape if needed
        };
    }

    /**
     * Initialize with system services
     */
    init(windowManager) {
        this.windowManager = windowManager;
    }

    /**
     * Open Calculator window
     */
    open() {
        if (!this.windowManager) {
            console.error('[CALCULATOR] Window Manager not initialized');
            return;
        }

        // Create window
        const win = this.windowManager.createWindow({
            title: 'Calculator',
            width: 260,
            height: 320,
            resizable: false,
            maximizable: false,
            content: this.getHtmlContent()
        });

        this.windowId = win.id;
        this.attachEventListeners(win.element);
    }

    /**
     * Get HTML content
     */
    getHtmlContent() {
        return `
            <div class="calculator" style="padding: 10px; background: #ECE9D8; height: 100%; display: flex; flex-direction: column; gap: 8px;">
                <div class="calc-display-container" style="background: white; border: 1px solid #7F9DB9; padding: 4px; margin-bottom: 6px; text-align: right;">
                    <input type="text" id="calc-display" value="0" readonly 
                        style="width: 100%; border: none; text-align: right; font-family: 'Tahoma', sans-serif; font-size: 20px; outline: none;">
                </div>
                
                <div class="calc-grid" style="display: grid; grid-template-columns: repeat(4, 1fr) 0.8fr; gap: 4px; flex: 1;">
                    <!-- Memory & Clear Row -->
                    <button class="calc-btn mc-btn" data-action="MC" style="color: red;">MC</button>
                    <button class="calc-btn mr-btn" data-action="MR" style="color: red;">MR</button>
                    <button class="calc-btn ms-btn" data-action="MS" style="color: red;">MS</button>
                    <button class="calc-btn mplus-btn" data-action="M+" style="color: red;">M+</button>
                    <!-- Extra space or clear buttons could go elsewhere in standard layout, trying to fit XP style -->
                    <!-- Standard XP layout is slightly different, adapting for grid -->
                </div>

                <div style="display: flex; gap: 6px;">
                    <!-- Left side: Memory and special -->
                    <div style="display: flex; flex-direction: column; gap: 4px; width: 40px;">
                        <button class="calc-btn small" data-action="MC" style="color: red;">MC</button>
                        <button class="calc-btn small" data-action="MR" style="color: red;">MR</button>
                        <button class="calc-btn small" data-action="MS" style="color: red;">MS</button>
                        <button class="calc-btn small" data-action="M+" style="color: red;">M+</button>
                    </div>

                    <!-- Right side: Number pad and operators -->
                    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
                        <!-- Top Row: Back, CE, C -->
                        <button class="calc-btn" data-action="back" style="grid-column: span 1; color: blue;">←</button>
                        <button class="calc-btn" data-action="CE" style="color: blue;">CE</button>
                        <button class="calc-btn" data-action="C" style="color: blue;">C</button>
                        <button class="calc-btn" data-action="sqrt" style="color: blue;">√</button>

                        <!-- 7 8 9 / -->
                        <button class="calc-btn num" data-val="7">7</button>
                        <button class="calc-btn num" data-val="8">8</button>
                        <button class="calc-btn num" data-val="9">9</button>
                        <button class="calc-btn op" data-action="/">/</button>

                        <!-- 4 5 6 * -->
                        <button class="calc-btn num" data-val="4">4</button>
                        <button class="calc-btn num" data-val="5">5</button>
                        <button class="calc-btn num" data-val="6">6</button>
                        <button class="calc-btn op" data-action="*">*</button>

                        <!-- 1 2 3 - -->
                        <button class="calc-btn num" data-val="1">1</button>
                        <button class="calc-btn num" data-val="2">2</button>
                        <button class="calc-btn num" data-val="3">3</button>
                        <button class="calc-btn op" data-action="-">-</button>

                        <!-- 0 . + = -->
                        <button class="calc-btn num" data-val="0">0</button>
                        <button class="calc-btn" data-action="neg">+/-</button>
                        <button class="calc-btn" data-action="dot">.</button>
                        <button class="calc-btn op" data-action="+">+</button>
                        <button class="calc-btn op" data-action="=" style="grid-column: span 4; margin-top: 2px;">=</button>
                    </div>
                </div>
                
                <style>
                    .calc-btn {
                        font-family: 'Tahoma', sans-serif;
                        font-size: 12px;
                        padding: 4px;
                        border: 1px solid #003c74;
                        background: linear-gradient(to bottom, #fff 0%, #ece9d8 100%);
                        border-radius: 2px;
                        cursor: pointer;
                        min-height: 28px;
                    }
                    .calc-btn:active {
                        background: #d4d4d4;
                        border: 1px solid #000;
                    }
                    .calc-btn.num {
                        color: blue;
                        font-weight: bold;
                    }
                    .calc-btn.op {
                        color: red;
                    }
                    .calc-btn.small {
                        font-size: 10px;
                    }
                </style>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners(element) {
        const display = element.querySelector('#calc-display');
        const buttons = element.querySelectorAll('button');

        buttons.forEach(btn => {
            btn.onclick = () => {
                if (btn.dataset.val) {
                    this.handleNumber(btn.dataset.val);
                } else if (btn.dataset.action) {
                    this.handleAction(btn.dataset.action);
                }
                this.updateDisplay(display);
            };
        });

        // Add keyboard support
        const keyHandler = (e) => {
            /* Basic keyboard support logic */
        };
        // Ideally we attach to window keydown but filter by focused window. 
        // For now, click only to keep it simple and encapsulated.
    }

    /**
     * Handle number input
     */
    handleNumber(num) {
        if (this.state.newEntry) {
            this.state.display = num;
            this.state.newEntry = false;
        } else {
            if (this.state.display === '0') this.state.display = num;
            else this.state.display += num;
        }
    }

    /**
     * Handle actions
     */
    handleAction(action) {
        switch (action) {
            case 'C':
                this.state.display = '0';
                this.state.operand = null;
                this.state.lastOperator = null;
                this.state.newEntry = true;
                break;
            case 'CE':
                this.state.display = '0';
                this.state.newEntry = true;
                break;
            case 'back':
                if (this.state.display.length > 1) {
                    this.state.display = this.state.display.slice(0, -1);
                } else {
                    this.state.display = '0';
                    this.state.newEntry = true;
                }
                break;
            case 'dot':
                if (!this.state.display.includes('.')) {
                    this.state.display += '.';
                    this.state.newEntry = false;
                }
                break;
            case 'neg':
                this.state.display = (parseFloat(this.state.display) * -1).toString();
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                this.handleOperator(action);
                break;
            case '=':
                this.calculate();
                this.state.lastOperator = null;
                this.state.operand = null;
                this.state.newEntry = true;
                break;
            case 'sqrt':
                this.state.display = Math.sqrt(parseFloat(this.state.display)).toString();
                this.state.newEntry = true;
                break;
            case 'MC':
                this.state.memory = 0;
                break;
            case 'MR':
                this.state.display = this.state.memory.toString();
                this.state.newEntry = true;
                break;
            case 'MS':
                this.state.memory = parseFloat(this.state.display);
                this.state.newEntry = true;
                break;
            case 'M+':
                this.state.memory += parseFloat(this.state.display);
                this.state.newEntry = true;
                break;
        }
    }

    /**
     * Handle operators
     */
    handleOperator(op) {
        if (this.state.lastOperator && !this.state.newEntry) {
            this.calculate();
        }
        this.state.operand = parseFloat(this.state.display);
        this.state.lastOperator = op;
        this.state.newEntry = true;
    }

    /**
     * Perform calculation
     */
    calculate() {
        if (this.state.lastOperator === null || this.state.operand === null) return;

        const current = parseFloat(this.state.display);
        let result = 0;

        switch (this.state.lastOperator) {
            case '+': result = this.state.operand + current; break;
            case '-': result = this.state.operand - current; break;
            case '*': result = this.state.operand * current; break;
            case '/': 
                if (current === 0) result = 'Error';
                else result = this.state.operand / current; 
                break;
        }

        this.state.display = result.toString();
        this.state.operand = null;
    }

    /**
     * Update display
     */
    updateDisplay(element) {
        if (this.state.display.length > 12) {
             // Basic truncation/exponential notation could happen here
             // For now just substring
             element.value = this.state.display.substring(0, 15);
        } else {
            element.value = this.state.display;
        }
    }
}

export const calculator = new Calculator();
