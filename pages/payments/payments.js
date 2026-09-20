/**
 * ==========================================================================
 * Payments Module Controller
 * Handles financial overview, debt settlement, receipt generation, and filters
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    AuthGuard.protectPage('../../index.html');
    Utils.initGlobalHeader('../../index.html');

    PaymentsController.init();
});

const PaymentsController = {
    currentFilter: 'all',

    init: function () {
        this.loadFinancialSummary();
        this.loadPaymentsTable();
        this.bindEvents();
    },

    bindEvents: function () {
        // Search
        const searchInput = document.getElementById('payment-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterAndSearch());
        }

        // Filter pills
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-status');
                this.filterAndSearch();
            });
        });

        // Close Modal
        const closeModalBtn = document.getElementById('close-receipt-modal');
        const modal = document.getElementById('receipt-modal');
        if (closeModalBtn && modal) {
            closeModalBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    },

    loadFinancialSummary: function () {
        const stats = StorageManager.getDashboardStats();

        const totalIncomeEl = document.getElementById('hero-total-income');
        if (totalIncomeEl) totalIncomeEl.textContent = stats.totalIncome.toLocaleString('ar-SA') + ' ر.س';

        const totalDebtEl = document.getElementById('hero-total-debt');
        if (totalDebtEl) totalDebtEl.textContent = stats.totalDebt.toLocaleString('ar-SA') + ' ر.س';

        const completedCountEl = document.getElementById('hero-completed-count');
        if (completedCountEl) completedCountEl.textContent = stats.completedCount;

        const unpaidCountEl = document.getElementById('hero-unpaid-count');
        if (unpaidCountEl) unpaidCountEl.textContent = (stats.unpaidCount + stats.partialCount);
    },

    loadPaymentsTable: function () {
        const tableBody = document.getElementById('payments-table-body');
        if (!tableBody) return;

        const appointments = StorageManager.getAppointments();
        appointments.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (appointments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">
                        <i class="fas fa-file-invoice" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        لا توجد سجلات مالية بعد.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        appointments.forEach(app => {
            const statusClass = app.status === 'مكتمل' ? 'badge-success' : app.status === 'جزئي' ? 'badge-warning' : 'badge-danger';
            const hasDebt = parseFloat(app.remainingAmount) > 0;

            html += `
                <tr data-status="${app.status}" id="payment-row-${app.id}">
                    <td><strong>#${app.id}</strong></td>
                    <td><strong>${app.patientName}</strong></td>
                    <td>${app.type}</td>
                    <td>${Utils.formatDate(app.date)}</td>
                    <td>${Utils.formatCurrency(app.totalAmount)}</td>
                    <td style="color: var(--success); font-weight: 700;">${Utils.formatCurrency(app.paidAmount)}</td>
                    <td style="color: ${hasDebt ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: 700;">${Utils.formatCurrency(app.remainingAmount)}</td>
                    <td><span class="badge ${statusClass}">${app.status}</span></td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            ${hasDebt ? `
                                <button type="button" class="btn btn-primary btn-sm" onclick="PaymentsController.settlePayment(${app.id})" title="سداد الدفعة المتبقية">
                                    <i class="fas fa-money-bill-wave"></i> سداد
                                </button>
                            ` : ''}
                            <button type="button" class="btn btn-outline btn-sm" onclick="PaymentsController.printReceipt(${app.id})" title="سند قبض / فاتورة">
                                <i class="fas fa-receipt"></i> سند
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    },

    filterAndSearch: function () {
        const query = document.getElementById('payment-search-input').value.toLowerCase().trim();
        const rows = document.querySelectorAll('#payments-table-body tr');

        rows.forEach(row => {
            const status = row.getAttribute('data-status');
            const text = row.textContent.toLowerCase();

            const matchesFilter = (this.currentFilter === 'all') || (status === this.currentFilter);
            const matchesSearch = text.includes(query);

            row.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
        });
    },

    settlePayment: function (id) {
        const app = StorageManager.getAppointmentById(id);
        if (!app) return;

        const remaining = parseFloat(app.remainingAmount) || 0;
        const addAmountStr = prompt(`المبلغ المتبقي على المريض (${app.patientName}) هو: ${remaining} ريال.\nأدخل المبلغ المراد تحصيله الآن:`, remaining);

        if (addAmountStr === null) return;

        const addAmount = parseFloat(addAmountStr);
        if (isNaN(addAmount) || addAmount <= 0) {
            Utils.showToast('يرجى إدخال مبلغ صحيح', 'danger');
            return;
        }

        const newPaid = (parseFloat(app.paidAmount) || 0) + addAmount;
        app.paidAmount = Math.min(app.totalAmount, newPaid);
        app.remainingAmount = Math.max(0, app.totalAmount - app.paidAmount);
        app.status = app.paidAmount >= app.totalAmount ? 'مكتمل' : 'جزئي';

        StorageManager.saveAppointment(app);
        Utils.showToast('تم تسجيل الدفعة وتحديث الحساب بنجاح 💵', 'success');

        this.loadFinancialSummary();
        this.loadPaymentsTable();
    },

    printReceipt: function (id) {
        const app = StorageManager.getAppointmentById(id);
        if (!app) return;

        const modal = document.getElementById('receipt-modal');
        const container = document.getElementById('receipt-print-area');

        container.innerHTML = `
            <div style="text-align: center; border-bottom: 2px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                <h2 style="color: var(--primary-color); margin-bottom: 4px;"><i class="fas fa-tooth"></i> عيادة د. علي محمد لطب الأسنان</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem;">سند قبض وفاتورة علاجية إلكترونية</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); margin-top: 10px;">
                    <span>رقم السند: <strong>#REC-${app.id}</strong></span>
                    <span>التاريخ: <strong>${Utils.formatDate(app.date)}</strong></span>
                </div>
            </div>

            <div class="receipt-box">
                <p style="margin-bottom: 8px;"><strong>اسم المريض:</strong> ${app.patientName}</p>
                <p style="margin-bottom: 8px;"><strong>نوع الإجراء الطبي:</strong> ${app.type}</p>
                <hr style="border: 0; border-top: 1px dashed var(--border-color); margin: 12px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span>المبلغ الإجمالي للخدمة:</span>
                    <strong>${Utils.formatCurrency(app.totalAmount)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--success);">
                    <span>المبلغ المسدد:</span>
                    <strong>${Utils.formatCurrency(app.paidAmount)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: ${app.remainingAmount > 0 ? 'var(--danger)' : 'var(--text-muted)'}; font-size: 1.1rem;">
                    <span>المبلغ المتبقي:</span>
                    <strong>${Utils.formatCurrency(app.remainingAmount)}</strong>
                </div>
            </div>

            <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 15px;">
                <p>شكراً لزيارتكم عيادتنا! تمنياتنا لكم بالصحة والعافية دائماً.</p>
            </div>
        `;

        if (modal) modal.style.display = 'flex';
    },

    executePrint: function () {
        window.print();
    }
};

window.PaymentsController = PaymentsController;
