/**
 * ==========================================================================
 * Common Utilities & UI Helpers
 * Toast notifications, Theme switcher, Live clock, and Global bindings
 * ==========================================================================
 */

const Utils = {
    /**
     * Display a modern floating toast notification
     * @param {string} message 
     * @param {'success'|'danger'|'warning'|'info'} type 
     * @param {number} durationMs 
     */
    showToast: function (message, type = 'info', durationMs = 3500) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;

        let iconName = 'info-circle';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'danger') iconName = 'exclamation-circle';
        if (type === 'warning') iconName = 'exclamation-triangle';

        toast.innerHTML = `
            <i class="fas fa-${iconName}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => toast.remove(), 320);
        }, durationMs);
    },

    /**
     * Format number as Arabic currency
     */
    formatCurrency: function (amount) {
        const num = parseFloat(amount) || 0;
        return num.toLocaleString('ar-SA') + ' ريال';
    },

    /**
     * Format date string nicely
     */
    formatDate: function (dateStr) {
        if (!dateStr) return 'غير محدد';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    },

    /**
     * Initialize Live Clock in header or dashboard
     */
    initLiveClock: function (elementId = 'current-time') {
        const el = document.getElementById(elementId);
        if (!el) return;

        const update = () => {
            const now = new Date();
            el.textContent = now.toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        };

        update();
        setInterval(update, 1000);
    },

    /**
     * Initialize global header event listeners (Logout button, user name)
     */
    initGlobalHeader: function (relativeLoginPath = '../../index.html') {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
                    AuthGuard.logout(relativeLoginPath);
                }
            });
        }

        const user = AuthGuard.getUser();
        if (user) {
            const nameEl = document.getElementById('header-user-name');
            if (nameEl) nameEl.textContent = user.name || user.username;
            const avatarEl = document.getElementById('header-user-avatar');
            if (avatarEl) avatarEl.textContent = user.avatar || (user.name ? user.name[0] : 'د');
        }
    }
};

/**
 * Dark Mode / Theme Manager
 */
const ThemeManager = {
    STORAGE_KEY: 'dental_clinic_theme_dark',

    init: function () {
        const isDark = localStorage.getItem(this.STORAGE_KEY) === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
        this.updateToggleButton(isDark);

        const toggleBtn = document.getElementById('dark-mode-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    toggle: function () {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem(this.STORAGE_KEY, isDark ? 'true' : 'false');
        this.updateToggleButton(isDark);
        Utils.showToast(isDark ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع الفاتح ☀️', 'info', 2000);
    },

    updateToggleButton: function (isDark) {
        const btn = document.getElementById('dark-mode-toggle');
        if (btn) {
            btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            btn.setAttribute('title', isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي');
        }
    }
};

// Auto-run theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

window.Utils = Utils;
window.ThemeManager = ThemeManager;
