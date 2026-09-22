/**
 * Dark Mode Toggle
 */

const ThemeManager = {
    init: function () {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        this.updateButton(isDarkMode);

        // Bind toggle event
        const toggleBtn = document.getElementById('dark-mode-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    toggle: function () {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.updateButton(isDark);

        Utils.showAlert(isDark ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع الفاتح', 'info');
    },

    updateButton: function (isDark) {
        const btn = document.getElementById('dark-mode-toggle');
        if (btn) {
            const icon = btn.querySelector('i');
            if (isDark) {
                icon.className = 'fas fa-sun';
                btn.title = 'الوضع الفاتح';
            } else {
                icon.className = 'fas fa-moon';
                btn.title = 'الوضع الليلي';
            }
        }
    }
};

// Initialize after DOM load
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
