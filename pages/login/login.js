/**
 * Login Page Controller
 * Handles credentials validation, remember-me persistence, and dashboard redirect
 */

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect straight to dashboard
    AuthGuard.redirectIfAuth('pages/dashboard/dashboard.html');

    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeInput = document.getElementById('remember-me');
    const errorAlert = document.getElementById('login-error-alert');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = rememberMeInput ? rememberMeInput.checked : true;

            if (!username || !password) {
                showError('يرجى إدخال اسم المستخدم وكلمة المرور');
                return;
            }

            const result = AuthGuard.login(username, password, rememberMe);

            if (result.success) {
                Utils.showToast('تم تسجيل الدخول بنجاح! جاري التوجيه...', 'success');
                setTimeout(() => {
                    window.location.href = 'pages/dashboard/dashboard.html';
                }, 600);
            } else {
                showError(result.message || 'بيانات الدخول غير صحيحة');
            }
        });
    }

    function showError(msg) {
        if (errorAlert) {
            errorAlert.textContent = msg;
            errorAlert.style.display = 'flex';
        } else {
            Utils.showToast(msg, 'danger');
        }
    }
});
