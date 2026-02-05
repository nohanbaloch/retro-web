/**
 * Notification Center
 * Manages system notifications and alerts
 */

class NotificationCenter {
    constructor() {
        this.container = document.getElementById('notification-center');
        this.notifications = [];
        this.initialize();
    }

    initialize() {
        if (!this.container) {
            console.error('[NOTIFICATION] Container not found');
            return;
        }

        this.setupContainerAndStyles();

        // Register with system
        if (window.RetroWeb) {
            window.RetroWeb.notificationCenter = this;
            console.log('[NOTIFICATION] Initialized');
        }
    }

    setupContainerAndStyles() {
        // Container Styles
        this.container.style.cssText = `
            position: fixed;
            bottom: 40px;
            right: 0;
            width: 320px;
            max-height: 80vh;
            overflow: visible;
            z-index: 100000;
            display: flex;
            flex-direction: column-reverse;
            padding: 10px;
            pointer-events: none;
            gap: 10px;
        `;

        // Add animations style block
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notifSlideIn {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes notifSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(120%); opacity: 0; }
            }
            .notif-btn:hover { background: #ddd; }
            .notif-btn:active { background: #ccc; }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show a notification
     * @param {Object} config - { title, message, icon, type, duration, actions }
     */
    show(config) {
        const id = Date.now().toString() + Math.floor(Math.random() * 1000);
        const notification = { id, ...config };
        
        this.createNotificationElement(notification);
        this.notifications.push(notification);

        // Auto dismiss
        const duration = config.duration !== undefined ? config.duration : 5000;
        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }

        return id;
    }

    /**
     * Dismiss a notification
     */
    dismiss(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        const el = document.getElementById(`notif-${id}`);
        if (el) {
            el.style.animation = 'notifSlideOut 0.3s forwards ease-in';
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 300);
        }

        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    /**
     * Create DOM element for notification
     */
    createNotificationElement(data) {
        const el = document.createElement('div');
        el.id = `notif-${data.id}`;
        
        // XP Style Balloon / Tooltip
        const bgColor = '#FFFFE1';
        const borderColor = '#000000';
        
        el.style.cssText = `
            pointer-events: auto;
            background: ${bgColor};
            border: 1px solid ${borderColor};
            border-radius: 5px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
            width: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: notifSlideIn 0.3s ease-out;
            font-family: 'Tahoma', sans-serif;
            font-size: 11px;
            color: black;
            position: relative;
        `;
        
        // Icon
        const iconHtml = data.icon ? `<span style="font-size: 16px;">${data.icon}</span>` : '';
        
        // Header
        const header = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; padding: 6px 8px 2px 8px;">
                <div style="display:flex; align-items:center; gap:8px; font-weight:bold;">
                    ${iconHtml}
                    <span>${data.title || 'Notification'}</span>
                </div>
                <div class="notif-close" style="cursor:pointer; font-weight:bold; color:#666; font-size: 14px; line-height: 10px;">×</div>
            </div>
        `;
        
        // Body
        const bodyContent = `
            <div style="padding: 2px 8px 8px 8px; line-height: 1.4;">
                ${data.message || ''}
            </div>
        `;
        
        // Actions
        let actionsHtml = '';
        if (data.actions && data.actions.length > 0) {
            actionsHtml = `<div style="padding: 6px; display:flex; gap:6px; justify-content:flex-end; background: rgba(0,0,0,0.05); border-top: 1px solid #ddd;">
                ${data.actions.map((act, idx) => `
                    <button class="notif-btn" data-idx="${idx}" style="
                        padding: 3px 10px; 
                        cursor: pointer; 
                        border: 1px solid #999; 
                        background: #f0f0f0; 
                        border-radius: 3px; 
                        font-family: inherit; 
                        font-size: 11px;
                    ">${act.label}</button>
                `).join('')}
            </div>`;
        }
        
        el.innerHTML = header + bodyContent + actionsHtml;
        
        // Attach Event Listeners
        const closeBtn = el.querySelector('.notif-close');
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.dismiss(data.id);
        };
        
        if (data.actions) {
            el.querySelectorAll('.notif-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const idx = btn.dataset.idx;
                    const action = data.actions[idx];
                    if (action.callback) action.callback();
                    this.dismiss(data.id);
                };
            });
        }
        
        if (data.onClick) {
            el.onclick = () => {
                data.onClick();
                this.dismiss(data.id);
            };
            el.style.cursor = 'pointer';
        }

        this.container.appendChild(el);
    }
}

// Auto-init
const notificationCenter = new NotificationCenter();
export { NotificationCenter, notificationCenter };
