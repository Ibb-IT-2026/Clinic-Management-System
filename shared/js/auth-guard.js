/**
 * ==========================================================================
 * Authentication Guard & Session Controller
 * Manages user login state and route protection
 * ==========================================================================
 */

const AuthGuard = {
    SESSION_KEY: 'dental_clinic_auth_user',

    /**
     * Check if current user is authenticated
     */
    isAuthenticated: function () {
        const user = localStorage.getItem(this.SESSION_KEY) || sessionStorage.getItem(this.SESSION_KEY);
        return !!user;
    },

    /**
     * Get current user object
     */
    getUser: function () {
        const userStr = localStorage.getItem(this.SESSION_KEY) || sessionStorage.getItem(this.SESSION_KEY);
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Perform login (Client-Side Simulation with Demo Credentials)
     */
    login: function (username, password, rememberMe = true) {
        // Any non-empty credentials or default 'admin'
        if (username.trim().length > 0 && password.trim().length > 0) {
            const userObj = {
                username: username.trim(),
                name: "د. علي محمد",
                role: "طبيب أسنان رئيسي",
                avatar: "د.ع",
                loginTime: new Date().toISOString()
            };

            const targetStorage = rememberMe ? localStorage : sessionStorage;
            targetStorage.setItem(this.SESSION_KEY, JSON.stringify(userObj));
            return { success: true, user: userObj };
        }
        return { success: false, message: "يرجى إدخال اسم المستخدم وكلمة المرور" };
    },

    /**
     * Logout and return to login page
     */
    logout: function (relativeLoginPath = '../../index.html') {
        localStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.SESSION_KEY);
        window.location.href = relativeLoginPath;
    },

    /**
     * Protect internal pages: redirects to login if unauthenticated
     */
    protectPage: function (relativeLoginPath = '../../index.html') {
        if (!this.isAuthenticated()) {
            window.location.href = relativeLoginPath;
        }
    },

    /**
     * If already logged in, redirect away from login page to dashboard
     */
    redirectIfAuth: function (relativeDashboardPath = 'pages/dashboard/dashboard.html') {
        if (this.isAuthenticated()) {
            window.location.href = relativeDashboardPath;
        }
    }
};

window.AuthGuard = AuthGuard;
