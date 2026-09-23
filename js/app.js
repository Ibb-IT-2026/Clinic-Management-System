/**
 * Main Application Logic & Initialization
 */

const App = {
    init: function () {
        // Global: Update Clock
        setInterval(() => Utils.updateClock('current-time'), 1000);
        Utils.updateClock('current-time');

        // Logout Handler
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                    Auth.logout();
                }
            });
        }

        // Initialize Page Specific Logic
        this.initCurrentPage();
    },

    initCurrentPage: function () {
        const path = window.location.pathname;

        if (path.includes('dashboard.html') || path.endsWith('/')) {
            this.initDashboard();
        }
        else if (path.includes('patients.html')) {
            if (window.PatientsManager) PatientsManager.init();
        }
        else if (path.includes('appointments.html')) {
            if (window.AppointmentsManager) AppointmentsManager.init();
        }
        else if (path.includes('payments.html')) {
            if (window.PaymentsManager) PaymentsManager.init();
        }
        else if (path.includes('records.html')) {
            if (window.RecordsManager) RecordsManager.init();
        }
    },

    initDashboard: async function () {
        try {
            const stats = await API.getStats();

            // Total Patients
            const totalPatElem = document.getElementById('total-patients');
            if (totalPatElem) totalPatElem.textContent = stats.patients_count;

            // Today's Appointments - Counter
            const todayCounter = document.getElementById('today-appointments');
            if (todayCounter) todayCounter.textContent = stats.today_appointments;

            // Total Income (if element exists)
            // ...

            // Load list for today
            if (window.AppointmentsManager) await AppointmentsManager.loadTodayAppointments();

        } catch (e) {
            console.error("Dashboard Load Error", e);
        }
    }
};

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth (skip for login page)
    if (window.location.pathname.includes('/pages/')) {
        await Auth.requireAuth();
        App.init();
    } else {
        // Login Page Logic
        await Auth.redirectIfLoggedIn();

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                try {
                    console.log('Attempting login...');
                    if (await Auth.login(username, password)) {
                        window.location.href = window.location.pathname.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
                    } else {
                        alert('بيانات الدخول غير صحيحة');
                    }
                } catch (error) {
                    console.error('Login Error:', error);
                    alert('حدث خطأ أثناء تسجيل الدخول. هل تستخدم خادم محلي (localhost)؟\n التفاصيل: ' + error.message);
                }
            });
        }

        const forgotPasswordLink = document.getElementById('forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('لأسباب أمنية، يرجى مراجعة مسؤول النظام (أو تعديل قاعدة البيانات مباشرة) لإعادة تعيين كلمة المرور.');
            });
        }
    }
});
