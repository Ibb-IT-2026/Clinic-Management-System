/**
 * ==========================================================================
 * Appointments Module Controller
 * Handles booking appointments, dynamic patient dropdown, real-time fee calculation
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    AuthGuard.protectPage('../../index.html');
    Utils.initGlobalHeader('../../index.html');

    AppointmentsController.init();
});

const AppointmentsController = {
    currentEditId: null,

    init: function () {
        this.populatePatientsDropdown();
        this.setDefaultDateTime();
        this.bindEvents();
        this.loadAppointmentsTable();
    },

    populatePatientsDropdown: function () {
        const select = document.getElementById('appointment-patient-id');
        if (!select) return;

        const patients = StorageManager.getPatients(false);
        select.innerHTML = '<option value="">-- اختر مريضاً من القائمة --</option>';

        patients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `#${p.id} - ${p.name} (${p.phone})`;
            select.appendChild(opt);
        });
    },

    setDefaultDateTime: function () {
        const dateInput = document.getElementById('appointment-date');
        const timeInput = document.getElementById('appointment-time');

        const today = new Date().toISOString().split('T')[0];
        if (dateInput && !dateInput.value) {
            dateInput.value = today;
            dateInput.min = today;
        }

        if (timeInput && !timeInput.value) {
            timeInput.value = "10:00";
        }
    },

    bindEvents: function () {
        // Form calculations
        const totalInput = document.getElementById('total-amount');
        const paidInput = document.getElementById('paid-amount');

        if (totalInput && paidInput) {
            totalInput.addEventListener('input', () => this.calculateFinancials());
            paidInput.addEventListener('input', () => this.calculateFinancials());
        }

        // Return visit toggle
        document.querySelectorAll('input[name="return-visit"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const box = document.getElementById('return-visit-details-box');
                if (box) {
                    box.style.display = e.target.value === 'نعم' ? 'block' : 'none';
                }
            });
        });

        // Form Submit
        const form = document.getElementById('appointment-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Cancel / Reset Button
        const cancelBtn = document.getElementById('cancel-appointment-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // Search in Appointments
        const searchInput = document.getElementById('appointment-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchAppointments());
        }
    },

    calculateFinancials: function () {
        const total = parseFloat(document.getElementById('total-amount').value) || 0;
        const paid = parseFloat(document.getElementById('paid-amount').value) || 0;
        const remaining = Math.max(0, total - paid);

        const remInput = document.getElementById('remaining-amount');
        if (remInput) {
            remInput.value = remaining;
        }

        const statusBadge = document.getElementById('calc-status-badge');
        if (statusBadge) {
            if (total === 0) {
                statusBadge.textContent = 'كشف مجاني';
                statusBadge.className = 'badge badge-info';
            } else if (paid >= total) {
                statusBadge.textContent = 'مكتمل الدفع';
                statusBadge.className = 'badge badge-success';
            } else if (paid === 0) {
                statusBadge.textContent = 'غير مدفوع';
                statusBadge.className = 'badge badge-danger';
            } else {
                statusBadge.textContent = 'دفع جزئي';
                statusBadge.className = 'badge badge-warning';
            }
        }
    },

    handleFormSubmit: function (e) {
        e.preventDefault();

        const patientId = document.getElementById('appointment-patient-id').value;
        if (!patientId) {
            Utils.showToast('يرجى اختيار مريض من القائمة', 'danger');
            return;
        }

        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const type = document.getElementById('visit-type').value;
        const totalAmount = parseFloat(document.getElementById('total-amount').value) || 0;
        const paidAmount = parseFloat(document.getElementById('paid-amount').value) || 0;
        const notes = document.getElementById('appointment-notes').value.trim();

        const returnVisitInput = document.querySelector('input[name="return-visit"]:checked');
        const returnVisit = returnVisitInput ? returnVisitInput.value : 'لا';

        const returnDate = returnVisit === 'نعم' ? document.getElementById('return-date').value : '';
        const returnType = returnVisit === 'نعم' ? document.getElementById('return-type').value : '';

        const appointmentData = {
            patientId: parseInt(patientId),
            date,
            time,
            type,
            totalAmount,
            paidAmount,
            notes,
            returnVisit,
            returnDate,
            returnType
        };

        if (this.currentEditId) {
            appointmentData.id = this.currentEditId;
        }

        try {
            StorageManager.saveAppointment(appointmentData);
            Utils.showToast(this.currentEditId ? 'تم تحديث بيانات الموعد بنجاح 🗓️' : 'تم حجز الموعد بنجاح 🗓️', 'success');

            this.resetForm();
            this.loadAppointmentsTable();
        } catch (err) {
            Utils.showToast('حدث خطأ أثناء حفظ الموعد', 'danger');
        }
    },

    loadAppointmentsTable: function () {
        const tableBody = document.getElementById('appointments-table-body');
        if (!tableBody) return;

        const appointments = StorageManager.getAppointments();

        // Sort appointments by date desc
        appointments.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (appointments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">
                        <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        لا توجد مواعيد مسجلة حالياً.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        appointments.forEach(app => {
            const statusClass = app.status === 'مكتمل' ? 'badge-success' : app.status === 'جزئي' ? 'badge-warning' : 'badge-danger';

            html += `
                <tr id="app-row-${app.id}">
                    <td><strong>#${app.id}</strong></td>
                    <td><strong>${app.patientName}</strong></td>
                    <td>${app.type}</td>
                    <td>${Utils.formatDate(app.date)} <small style="color: var(--text-muted);">(${app.time || '10:00'})</small></td>
                    <td>${Utils.formatCurrency(app.totalAmount)}</td>
                    <td>${Utils.formatCurrency(app.paidAmount)}</td>
                    <td><span class="badge ${statusClass}">${app.status}</span></td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button type="button" class="btn btn-warning btn-sm" onclick="AppointmentsController.editAppointment(${app.id})" title="تعديل الموعد">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-danger btn-sm" onclick="AppointmentsController.deleteAppointment(${app.id})" title="حذف">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    },

    editAppointment: function (id) {
        const app = StorageManager.getAppointmentById(id);
        if (!app) return;

        this.currentEditId = app.id;
        document.getElementById('appointment-form-title').textContent = `تعديل الموعد رقم #${app.id} - ${app.patientName}`;

        document.getElementById('appointment-patient-id').value = app.patientId;
        document.getElementById('appointment-date').value = app.date;
        document.getElementById('appointment-time').value = app.time || '10:00';
        document.getElementById('visit-type').value = app.type;
        document.getElementById('total-amount').value = app.totalAmount;
        document.getElementById('paid-amount').value = app.paidAmount;
        document.getElementById('appointment-notes').value = app.notes || '';

        this.calculateFinancials();

        if (app.returnVisit === 'نعم') {
            document.getElementById('return-yes').checked = true;
            document.getElementById('return-visit-details-box').style.display = 'block';
            document.getElementById('return-date').value = app.returnDate || '';
            document.getElementById('return-type').value = app.returnType || '';
        } else {
            document.getElementById('return-no').checked = true;
            document.getElementById('return-visit-details-box').style.display = 'none';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteAppointment: function (id) {
        if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
            StorageManager.deleteAppointment(id);
            Utils.showToast('تم حذف الموعد بنجاح', 'info');
            this.loadAppointmentsTable();
        }
    },

    searchAppointments: function () {
        const query = document.getElementById('appointment-search-input').value.toLowerCase().trim();
        const rows = document.querySelectorAll('#appointments-table-body tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    },

    resetForm: function () {
        const form = document.getElementById('appointment-form');
        if (form) form.reset();
        this.currentEditId = null;
        document.getElementById('appointment-form-title').textContent = 'حجز موعد عيادة جديد';
        document.getElementById('return-visit-details-box').style.display = 'none';
        this.setDefaultDateTime();
        this.calculateFinancials();
    }
};

window.AppointmentsController = AppointmentsController;
