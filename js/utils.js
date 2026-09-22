/**
 * Utility Functions
 */

const Utils = {
    // Show Alert
    // Show Alert (Legacy)
    showAlert: function (message, type = 'info', containerId = null) {
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-${type}">
                        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                        ${message}
                    </div>
                `;
                container.style.display = 'block';

                // Hide after 3 seconds
                setTimeout(() => {
                    container.style.display = 'none';
                }, 3000);
            }
        } else {
            this.showToast(message, type === 'danger' ? 'error' : type);
        }
    },

    // Show Toast Notification (Global)
    showToast: function (message, type = 'info') {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        const bgColor = type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db';
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';

        toast.className = `toast-msg fade-in`;
        toast.style.cssText = `
            background-color: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 250px;
            transform: translateX(-100%);
            animation: slideInLeft 0.3s forwards;
            font-size: 14px;
        `;

        toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;

        toastContainer.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    },

    // Format Date (YYYY-MM-DD -> DD/MM/YYYY) or similar if needed
    formatDate: function (dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    },

    // Update Live Clock
    updateClock: function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const now = new Date();
            element.textContent = now.toLocaleTimeString('ar-SA');
        }
    }
};
