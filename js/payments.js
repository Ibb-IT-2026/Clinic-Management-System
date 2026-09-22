/**
 * Payments Management Logic
 */

const PaymentsManager = {
    init: function () {
        this.loadPaymentsTable();
        this.bindEvents();
    },

    bindEvents: function () {
        const searchBtn = document.getElementById('search-payment-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchPayments());
        }
    },

    loadPaymentsTable: async function () {
        const tableBody = document.getElementById('payments-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center">جار التحميل...</td></tr>';

        try {
            // Need both appointments and patients (for numbers)
            // Using Promise.all for speed
            const [appointments, patients] = await Promise.all([
                API.getAppointments(),
                API.getPatients()
            ]);

            tableBody.innerHTML = '';

            let completedPaymentsCount = 0;
            let notPaidPayments = 0;
            let totalMoney = 0;

            appointments.forEach(app => {
                let status = app.status;

                if (status === 'مكتمل') completedPaymentsCount++;
                if (status === 'غير مدفوع') notPaidPayments++;
                totalMoney += app.paidAmount; // Note: Ensure number type in API response or cast

                const patient = patients.find(p => p.id === app.patientId);
                const phone = patient ? patient.phone : 'غير متوفر';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${app.patientName}</td>
                    <td>${phone}</td>
                    <td>${app.type}</td>
                    <td>${app.totalAmount} ريال</td>
                    <td>${app.paidAmount} ريال</td>
                    <td>${app.remainingAmount} ريال</td>
                    <td>
                        <span class="status-${this.getStatusClass(status)}">
                            ${status}
                        </span>
                    </td>
                    <td>${app.date}</td>
                `;
                tableBody.appendChild(row);
            });

            // Update Stats
            this.updateStats(totalMoney, completedPaymentsCount, notPaidPayments, appointments.length);

        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red">فشل التحميل</td></tr>';
        }
    },

    getStatusClass: function (status) {
        if (status === 'مكتمل') return 'paid';
        if (status === 'جزئي') return 'partial';
        if (status === 'غير مدفوع') return 'not-paid';
        return 'unpaid';
    },

    updateStats: function (totalMoney, completed, notPaid, totalCount) {
        const totalElem = document.getElementById('total-payments');
        if (totalElem) totalElem.textContent = totalCount;

        if (document.getElementById('completed-payments-count'))
            document.getElementById('completed-payments-count').textContent = completed;

        if (document.getElementById('not-paid-payments'))
            document.getElementById('not-paid-payments').textContent = notPaid;
    },

    searchPayments: function () {
        const query = document.getElementById('payment-search').value.toLowerCase();
        const rows = document.querySelectorAll('#payments-table-body tr');
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const phone = row.cells[1].textContent;
            row.style.display = (name.includes(query) || phone.includes(query)) ? '' : 'none';
        });
    }
};

window.PaymentsManager = PaymentsManager;
