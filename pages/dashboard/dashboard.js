/**
 * ==========================================================================
 * Dashboard Page Controller
 * Handles live analytics, Chart.js graphs, today's schedule, and system backups
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Guard route: require login
    AuthGuard.protectPage('../../index.html');

    // 2. Initialize Common UI (Header info, live clock)
    Utils.initGlobalHeader('../../index.html');
    Utils.initLiveClock('current-time');

    // 3. Initialize Dashboard Metrics & Visuals
    DashboardController.init();
});

const DashboardController = {
    patientsChartInstance: null,
    appointmentsChartInstance: null,

    init: function () {
        this.loadStatistics();
        this.renderCharts();
        this.loadTodayAppointments();
        this.bindBackupEvents();
    },

    /**
     * Load numeric counts and metrics
     */
    loadStatistics: function () {
        const stats = StorageManager.getDashboardStats();

        const totalPatEl = document.getElementById('stat-total-patients');
        if (totalPatEl) totalPatEl.textContent = stats.totalPatients;

        const todayAppEl = document.getElementById('stat-today-appointments');
        if (todayAppEl) todayAppEl.textContent = stats.todayAppointmentsCount;

        const totalIncomeEl = document.getElementById('stat-total-income');
        if (totalIncomeEl) totalIncomeEl.textContent = stats.totalIncome.toLocaleString('ar-SA') + ' ر.س';

        const totalDebtEl = document.getElementById('stat-total-debt');
        if (totalDebtEl) totalDebtEl.textContent = stats.totalDebt.toLocaleString('ar-SA') + ' ر.س';
    },

    /**
     * Render Interactive Charts via Chart.js
     */
    renderCharts: function () {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js library not loaded yet');
            return;
        }

        this.renderMonthlyPatientsChart();
        this.renderAppointmentsStatusChart();
    },

    renderMonthlyPatientsChart: function () {
        const ctx = document.getElementById('patientsMonthlyChart');
        if (!ctx) return;

        const patients = StorageManager.getPatients(false);

        // Group counts by YYYY-MM
        const monthlyGroups = {};
        patients.forEach(p => {
            if (p.registrationDate) {
                const ym = p.registrationDate.substring(0, 7); // e.g. "2024-03"
                monthlyGroups[ym] = (monthlyGroups[ym] || 0) + 1;
            }
        });

        const sortedKeys = Object.keys(monthlyGroups).sort();
        // Fallback default months if new
        if (sortedKeys.length === 0) {
            sortedKeys.push('2024-01', '2024-02', '2024-03');
            monthlyGroups['2024-01'] = 1;
            monthlyGroups['2024-02'] = 2;
            monthlyGroups['2024-03'] = 3;
        }

        const labels = sortedKeys.map(k => {
            const parts = k.split('-');
            return `${parts[0]}/${parts[1]}`;
        });
        const data = sortedKeys.map(k => monthlyGroups[k]);

        if (this.patientsChartInstance) {
            this.patientsChartInstance.destroy();
        }

        this.patientsChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'المرضى الجدد المسجلين',
                    data: data,
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.12)',
                    tension: 0.35,
                    fill: true,
                    borderWidth: 3,
                    pointBackgroundColor: '#0d9488',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { font: { family: 'Cairo' } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { family: 'Cairo' } }
                    },
                    x: {
                        ticks: { font: { family: 'Cairo' } }
                    }
                }
            }
        });
    },

    renderAppointmentsStatusChart: function () {
        const ctx = document.getElementById('appointmentsStatusChart');
        if (!ctx) return;

        const stats = StorageManager.getDashboardStats();

        if (this.appointmentsChartInstance) {
            this.appointmentsChartInstance.destroy();
        }

        this.appointmentsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['مكتمل', 'جزئي', 'غير مدفوع'],
                datasets: [{
                    data: [
                        stats.completedCount || 1,
                        stats.partialCount || 1,
                        stats.unpaidCount || 1
                    ],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { family: 'Cairo' }, padding: 14 }
                    }
                }
            }
        });
    },

    /**
     * Load today's appointment schedule
     */
    loadTodayAppointments: function () {
        const container = document.getElementById('today-appointments-container');
        if (!container) return;

        const stats = StorageManager.getDashboardStats();
        const list = stats.todayAppointmentsList;

        if (!list || list.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info" style="margin: 0;">
                    <i class="fas fa-calendar-check"></i> لا توجد مواعيد مسجلة لتاريخ اليوم.
                </div>
            `;
            return;
        }

        let html = '<div class="today-schedule-list">';
        list.forEach(app => {
            const initial = app.patientName ? app.patientName[0] : 'م';
            html += `
                <div class="today-item">
                    <div class="today-patient-info">
                        <div class="today-avatar">${initial}</div>
                        <div class="today-meta">
                            <h4>${app.patientName}</h4>
                            <p><i class="fas fa-stethoscope"></i> ${app.type || 'كشف عيادة'}</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="badge ${this.getStatusBadgeClass(app.status)}">${app.status}</span>
                        <span class="today-time-badge">${app.time || '10:00'}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    getStatusBadgeClass: function (status) {
        if (status === 'مكتمل') return 'badge-success';
        if (status === 'جزئي') return 'badge-warning';
        return 'badge-danger';
    },

    /**
     * Bind system backup export and import
     */
    bindBackupEvents: function () {
        const exportBtn = document.getElementById('export-backup-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const jsonStr = StorageManager.exportBackup();
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dental_clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                Utils.showToast('تم تحميل ملف النسخة الاحتياطية بنجاح 💾', 'success');
            });
        }

        const importBtn = document.getElementById('import-backup-btn');
        const fileInput = document.getElementById('import-backup-file');

        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    if (confirm('تنبيه: استيراد النسخة الاحتياطية سيستبدل البيانات الحالية. هل تود المتابعة؟')) {
                        const res = StorageManager.importBackup(event.target.result);
                        if (res.success) {
                            Utils.showToast(`تم استعادة ${res.countPatients} مريض و ${res.countAppointments} موعد بنجاح!`, 'success');
                            setTimeout(() => window.location.reload(), 1200);
                        } else {
                            Utils.showToast(`فشل الاستيراد: ${res.error}`, 'danger');
                        }
                    }
                };
                reader.readAsText(file);
                e.target.value = '';
            });
        }
    }
};

window.DashboardController = DashboardController;
