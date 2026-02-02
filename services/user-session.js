class UserSession {
    async restore() {
        console.log('[USER-SESSION] Session restored');
    }
}
const userSession = new UserSession();
if (window.RetroWeb) {
    window.RetroWeb.services = window.RetroWeb.services || {};
    window.RetroWeb.services.userSession = userSession;
}
export { UserSession };
