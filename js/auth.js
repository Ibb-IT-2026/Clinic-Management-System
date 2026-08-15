/**
 * Authentication Handling
 */

const Auth = {
    // Check if user is logged in
    async checkLogin() {
        try {
            const res = await API.checkSession();
            return res.status === 'logged_in';
        } catch (e) {
            return false;
        }
    },

    // Login
    async login(username, password) {
        const res = await API.login(username, password);
        return res.status === 'success';
    },

    // Logout
    async logout() {
        await API.logout();
        window.location.href = 'index.html';
    },

    // Redirect if not logged in
    async requireAuth() {
        const isLoggedIn = await this.checkLogin();
        if (!isLoggedIn) {
            window.location.href = 'index.html';
        }
    },

    // Redirect if already logged in (for login page)
    async redirectIfLoggedIn() {
        const isLoggedIn = await this.checkLogin();
        if (isLoggedIn) {
            window.location.href = 'dashboard.html';
        }
    }
};
