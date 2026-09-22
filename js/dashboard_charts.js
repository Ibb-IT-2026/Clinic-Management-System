/**
 * Dashboard Charts Logic
 * Uses Chart.js to render analytics
 */

const DashboardCharts = {
    init: function () {
        // Wait for DataManager and Chart library
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        this.renderPatientsChart();
        this.renderAppointmentsChart();
    },

    renderPatientsChart: function () {
        const ctx = document.getElementById('patientsChart');
        if (!ctx) return;

        const patients = API.getPatients().filter(p => !p.isDeleted);

        // Group by month
        const months = {};
        patients.forEach(p => {
            if (p.registrationDate) {
                const date = new Date(p.registrationDate);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months[key] = (months[key] || 0) + 1;
            }
        });

        // Sort keys
        const sortedKeys = Object.keys(months).sort();
        const data = sortedKeys.map(k => months[k]);
        const labels = sortedKeys.map(k => {
            const [y, m] = k.split('-');
            return `${y}/${m}`; // Format as YYYY/MM
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'المرضى الجدد',
                    data: data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'تسجيل المرضى شهرياً'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    renderAppointmentsChart: function () {
        const ctx = document.getElementById('appointmentsChart');
        if (!ctx) return;

        const appointments = API.getAppointments();

        // Group by status
        const stats = {
            'مكتمل': 0,
            'مؤكد': 0,
            'ملغى': 0,
            'غير مدفوع': 0
        };

        appointments.forEach(app => {
            if (stats.hasOwnProperty(app.status)) {
                stats[app.status]++;
            } else {
                // Handle others or map to 'others'
            }
        });

        const data = Object.values(stats);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['مكتمل', 'مؤكد', 'ملغى', 'غير مدفوع'],
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#2ecc71', // Green for Completed
                        '#3498db', // Blue for Confirmed
                        '#e74c3c', // Red for Cancelled
                        '#f39c12'  // Orange for Unpaid
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'حالة المواعيد'
                    }
                }
            }
        });
    }
};

// Initialize after load
document.addEventListener('DOMContentLoaded', () => {
    // Try to init immediately if scripts loaded, or wait
    DashboardCharts.init();
});
