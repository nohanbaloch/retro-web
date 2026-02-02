class PowerManager {
    constructor() {
        if (window.RetroWeb?.kernel) {
            window.RetroWeb.powerManager = this;
        }
    }
}
const powerManager = new PowerManager();
export { PowerManager };
