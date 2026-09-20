/**
 * ==========================================================================
 * Records & Reports Module Controller
 * Handles clinical history, patient profiles, and PDF report export
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    AuthGuard.protectPage('../../index.html');
    Utils.initGlobalHeader('../../index.html');

    RecordsController.init();
});

const RecordsController = {
    init: function () {
        this.loadPatientsRecordsList();
        this.bindEvents();

        // Check if a patientId is passed in URL
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('patientId');
        if (patientId) {
            this.showPatientHistory(parseInt(patientId));
        }
    },

    bindEvents: function () {
        // Search in records
        const searchInput = document.getElementById('records-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchPatientsRecords());
        }

        // Back button to patient list
        const backBtn = document.getElementById('back-to-patients-list-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showRecordsList());
        }
    },

    loadPatientsRecordsList: function () {
        const tableBody = document.getElementById('records-table-body');
        if (!tableBody) return;

        const patients = StorageManager.getPatients(false);
        const appointments = StorageManager.getAppointments();

        if (patients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                        <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        لا توجد سجلات مرضى مسجلة حالياً.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        patients.forEach(p => {
            const patientApps = appointments.filter(a => a.patientId === p.id);
            // Sort visits by date desc
            patientApps.sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastVisit = patientApps.length > 0 ? Utils.formatDate(patientApps[0].date) : 'لا توجد زيارات سابقة';

            html += `
                <tr id="record-row-${p.id}">
                    <td><strong>#${p.id}</strong></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.phone}</td>
                    <td>${p.gender}</td>
                    <td>${lastVisit} <span class="badge badge-info" style="font-size: 0.75rem;">${patientApps.length} زيارة</span></td>
                    <td>
                        <button type="button" class="btn btn-primary btn-sm" onclick="RecordsController.showPatientHistory(${p.id})">
                            <i class="fas fa-file-medical-alt"></i> عرض الملف الطبي
                        </button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    },

    showPatientHistory: function (patientId) {
        const patient = StorageManager.getPatientById(patientId);
        if (!patient) return;

        const appointments = StorageManager.getAppointmentsByPatient(patientId);
        appointments.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Switch visible containers
        document.getElementById('records-list-view').style.display = 'none';
        document.getElementById('patient-detail-view').style.display = 'block';

        // Fill Patient Profile Header
        document.getElementById('profile-patient-name').textContent = patient.name;
        document.getElementById('profile-patient-id').textContent = `رقم الملف: #${patient.id}`;
        document.getElementById('profile-avatar').textContent = patient.name[0] || 'م';

        // Fill Basic Info Grid
        document.getElementById('info-phone').textContent = patient.phone || 'غير متوفر';
        document.getElementById('info-gender').textContent = patient.gender || 'غير محدد';
        document.getElementById('info-pregnancy').textContent = patient.gender === 'أنثى' ? (patient.pregnancy || 'لا') : 'غير منطبق';
        document.getElementById('info-chronic').textContent = patient.chronicDisease === 'نعم' ? (patient.diseaseDetails || 'نعم') : 'سليم / لا يوجد';
        document.getElementById('info-reg-date').textContent = Utils.formatDate(patient.registrationDate);
        document.getElementById('info-notes').textContent = patient.notes || 'لا توجد ملاحظات سريرية خاصة مسجلة.';

        // Visits Table
        const visitsBody = document.getElementById('patient-visits-table-body');
        let totalBilled = 0;
        let totalPaid = 0;
        let totalRemaining = 0;

        if (appointments.length === 0) {
            visitsBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 25px; color: var(--text-muted);">
                        لم يتم تسجيل أي زيارات أو مواعيد لهذا المريض حتى الآن.
                    </td>
                </tr>
            `;
        } else {
            let vHtml = '';
            appointments.forEach(app => {
                const billed = parseFloat(app.totalAmount) || 0;
                const paid = parseFloat(app.paidAmount) || 0;
                const rem = parseFloat(app.remainingAmount) || 0;

                totalBilled += billed;
                totalPaid += paid;
                totalRemaining += rem;

                const statusClass = app.status === 'مكتمل' ? 'badge-success' : app.status === 'جزئي' ? 'badge-warning' : 'badge-danger';

                vHtml += `
                    <tr>
                        <td><strong>${Utils.formatDate(app.date)}</strong> <small>(${app.time || '10:00'})</small></td>
                        <td><strong>${app.type}</strong></td>
                        <td>${Utils.formatCurrency(billed)}</td>
                        <td style="color: var(--success);">${Utils.formatCurrency(paid)}</td>
                        <td style="color: ${rem > 0 ? 'var(--danger)' : 'var(--text-muted)'};">${Utils.formatCurrency(rem)}</td>
                        <td><span class="badge ${statusClass}">${app.status}</span></td>
                    </tr>
                `;
            });
            visitsBody.innerHTML = vHtml;
        }

        // Fill Financial Summary for Patient
        document.getElementById('patient-total-billed').textContent = Utils.formatCurrency(totalBilled);
        document.getElementById('patient-total-paid').textContent = Utils.formatCurrency(totalPaid);
        document.getElementById('patient-total-remaining').textContent = Utils.formatCurrency(totalRemaining);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    showRecordsList: function () {
        document.getElementById('patient-detail-view').style.display = 'none';
        document.getElementById('records-list-view').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    searchPatientsRecords: function () {
        const query = document.getElementById('records-search-input').value.toLowerCase().trim();
        const rows = document.querySelectorAll('#records-table-body tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    },

    /**
     * Generate and Download PDF Clinic Reports
     */
    generatePDFReport: function (period) {
        if (typeof html2pdf === 'undefined') {
            Utils.showToast('مكتبة تصدير PDF غير محملة. يرجى التحقق من اتصال الإنترنت', 'danger');
            return;
        }

        const now = new Date();
        let title = 'تقرير العيادة';
        let filterDate = new Date();

        if (period === 'daily') {
            title = `التقرير اليومي للعيادة (${now.toISOString().split('T')[0]})`;
            filterDate.setDate(now.getDate() - 1);
        } else if (period === 'weekly') {
            title = `التقرير الأسبوعي للعيادة (آخر 7 أيام)`;
            filterDate.setDate(now.getDate() - 7);
        } else if (period === 'monthly') {
            title = `التقرير الشهري للعيادة (آخر 30 يوم)`;
            filterDate.setDate(now.getDate() - 30);
        } else if (period === 'yearly') {
            title = `التقرير السنوي الشامل للعيادة`;
            filterDate.setFullYear(now.getFullYear() - 1);
        }

        const appointments = StorageManager.getAppointments();
        const patients = StorageManager.getPatients(false);

        const filteredApps = appointments.filter(a => new Date(a.date) >= filterDate);

        let income = 0;
        let debt = 0;
        filteredApps.forEach(a => {
            income += parseFloat(a.paidAmount) || 0;
            debt += parseFloat(a.remainingAmount) || 0;
        });

        // Construct Printable Report Element
        const reportDiv = document.createElement('div');
        reportDiv.style.padding = '30px';
        reportDiv.style.direction = 'rtl';
        reportDiv.style.fontFamily = 'Cairo, sans-serif';
        reportDiv.style.color = '#1e293b';

        reportDiv.innerHTML = `
            <div style="text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 25px;">
                <h1 style="color: #0d9488; margin-bottom: 5px;">عيادة د. علي محمد لطب وجراحة الأسنان</h1>
                <h2 style="font-size: 1.25rem; margin-bottom: 8px;">${title}</h2>
                <p style="color: #64748b; font-size: 0.9rem;">تاريخ استخراج التقرير: ${now.toLocaleString('ar-SA')}</p>
            </div>

            <div style="display: flex; justify-content: space-around; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 25px; text-align: center;">
                <div>
                    <div style="font-size: 0.85rem; color: #64748b;">إجمالي الإيراد</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #10b981;">${Utils.formatCurrency(income)}</div>
                </div>
                <div>
                    <div style="font-size: 0.85rem; color: #64748b;">المستحقات المتبقية</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #ef4444;">${Utils.formatCurrency(debt)}</div>
                </div>
                <div>
                    <div style="font-size: 0.85rem; color: #64748b;">عدد المواعيد</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #0d9488;">${filteredApps.length}</div>
                </div>
                <div>
                    <div style="font-size: 0.85rem; color: #64748b;">إجمالي المرضى</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #3b82f6;">${patients.length}</div>
                </div>
            </div>

            <h3 style="font-size: 1.1rem; margin-bottom: 12px; color: #0f172a;">تفاصيل العمليات والمواعيد</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="background: #f1f5f9; text-align: right;">
                        <th style="border: 1px solid #cbd5e1; padding: 10px;">التاريخ</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px;">اسم المريض</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px;">الإجراء</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px;">المبلغ</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px;">المدفوع</th>
                        <th style="border: 1px solid #cbd5e1; padding: 10px;">الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredApps.map(a => `
                        <tr>
                            <td style="border: 1px solid #e2e8f0; padding: 8px;">${Utils.formatDate(a.date)}</td>
                            <td style="border: 1px solid #e2e8f0; padding: 8px;">${a.patientName}</td>
                            <td style="border: 1px solid #e2e8f0; padding: 8px;">${a.type}</td>
                            <td style="border: 1px solid #e2e8f0; padding: 8px;">${Utils.formatCurrency(a.totalAmount)}</td>
                            <td style="border: 1px solid #e2e8f0; padding: 8px;">${Utils.formatCurrency(a.paidAmount)}</td>
                            <td style="border: 1px solid #e2e8f0; padding: 8px;">${a.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="margin-top: 40px; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 15px;">
                نظام إدارة عيادة الأسنان - مشروع مقرر هندسة البرمجيات
            </div>
        `;

        Utils.showToast('جاري إنشاء ملف PDF وتجهيز التقرير... ⏳', 'info');

        const opt = {
            margin: 0.5,
            filename: `dental_report_${period}_${now.toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(reportDiv).save().then(() => {
            Utils.showToast('تم تحميل التقرير بنجاح! 📄', 'success');
        });
    }
};

window.RecordsController = RecordsController;
