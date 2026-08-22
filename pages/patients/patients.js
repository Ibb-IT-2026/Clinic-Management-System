/**
 * ==========================================================================
 * Patients Module Controller
 * Handles CRUD operations for patients with LocalStorage persistence
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    AuthGuard.protectPage('../../index.html');
    Utils.initGlobalHeader('../../index.html');

    PatientsController.init();
});

const PatientsController = {
    currentEditId: null,

    init: function () {
        this.loadPatientsTable();
        this.bindEvents();
    },

    bindEvents: function () {
        // Toggle Add Patient Form
        const showAddBtn = document.getElementById('show-add-patient-btn');
        const formSection = document.getElementById('patient-form-section');
        const cancelBtn = document.getElementById('cancel-patient-btn');

        if (showAddBtn && formSection) {
            showAddBtn.addEventListener('click', () => {
                this.resetForm();
                this.currentEditId = null;
                document.getElementById('form-title').textContent = 'إضافة مريض جديد';
                formSection.style.display = 'block';
                formSection.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (cancelBtn && formSection) {
            cancelBtn.addEventListener('click', () => {
                this.resetForm();
                formSection.style.display = 'none';
            });
        }

        // Gender change -> toggle pregnancy
        document.querySelectorAll('input[name="gender"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const pregBox = document.getElementById('pregnancy-conditional-box');
                if (pregBox) {
                    pregBox.style.display = e.target.value === 'أنثى' ? 'block' : 'none';
                }
            });
        });

        // Chronic Disease change -> toggle details
        document.querySelectorAll('input[name="chronic-disease"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const diseaseBox = document.getElementById('disease-conditional-box');
                if (diseaseBox) {
                    diseaseBox.style.display = e.target.value === 'نعم' ? 'block' : 'none';
                }
            });
        });

        // Search input
        const searchInput = document.getElementById('patient-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchPatients());
        }

        // Form Submit
        const form = document.getElementById('patient-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    },

    loadPatientsTable: function () {
        const tableBody = document.getElementById('patients-table-body');
        const countBadge = document.getElementById('total-patients-count');
        if (!tableBody) return;

        const patients = StorageManager.getPatients(false);

        if (countBadge) {
            countBadge.textContent = `${patients.length} مريض`;
        }

        if (patients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                        <i class="fas fa-user-slash" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        لا يوجد مرضى مسجلين حالياً. انقر على "إضافة مريض جديد" للبدء.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        patients.forEach(patient => {
            const hasChronic = patient.chronicDisease === 'نعم';
            html += `
                <tr id="patient-row-${patient.id}">
                    <td><strong>#${patient.id}</strong></td>
                    <td>
                        <div style="font-weight: 700;">${patient.name}</div>
                        ${patient.notes ? `<small style="color: var(--text-muted);">${patient.notes}</small>` : ''}
                    </td>
                    <td><i class="fas fa-phone-alt" style="color: var(--text-muted); font-size: 0.85rem;"></i> ${patient.phone}</td>
                    <td>${patient.gender} ${patient.gender === 'أنثى' && patient.pregnancy === 'نعم' ? '<span class="badge badge-warning">حامل</span>' : ''}</td>
                    <td>
                        ${hasChronic ? `<span class="badge badge-danger">${patient.diseaseDetails || 'نعم'}</span>` : '<span class="badge badge-success">سليم</span>'}
                    </td>
                    <td>${Utils.formatDate(patient.registrationDate)}</td>
                    <td>
                        <div class="patient-actions-cell">
                            <a href="../records/records.html?patientId=${patient.id}" class="btn btn-primary btn-sm" title="السجل الطبي">
                                <i class="fas fa-file-medical"></i> السجل
                            </a>
                            <button type="button" class="btn btn-warning btn-sm" onclick="PatientsController.editPatient(${patient.id})" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-danger btn-sm" onclick="PatientsController.deletePatient(${patient.id})" title="حذف">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
    },

    handleFormSubmit: function (e) {
        e.preventDefault();

        const name = document.getElementById('patient-name').value.trim();
        const phone = document.getElementById('patient-phone').value.trim();
        const genderInput = document.querySelector('input[name="gender"]:checked');
        const gender = genderInput ? genderInput.value : 'ذكر';

        let pregnancy = null;
        if (gender === 'أنثى') {
            const pregInput = document.querySelector('input[name="pregnancy"]:checked');
            pregnancy = pregInput ? pregInput.value : 'لا';
        }

        const chronicInput = document.querySelector('input[name="chronic-disease"]:checked');
        const chronicDisease = chronicInput ? chronicInput.value : 'لا';
        const diseaseDetails = chronicDisease === 'نعم' ? (document.getElementById('disease-details').value.trim() || 'أمراض مزمنة') : '';

        const registrationDate = document.getElementById('patient-reg-date').value || new Date().toISOString().split('T')[0];
        const notes = document.getElementById('patient-notes').value.trim();

        if (!name || !phone) {
            Utils.showToast('يرجى ملء الحقول الإلزامية', 'danger');
            return;
        }

        const patientData = {
            name,
            phone,
            gender,
            pregnancy,
            chronicDisease,
            diseaseDetails,
            registrationDate,
            notes
        };

        if (this.currentEditId) {
            patientData.id = this.currentEditId;
        }

        try {
            StorageManager.savePatient(patientData);
            Utils.showToast(this.currentEditId ? 'تم تحديث بيانات المريض بنجاح ✅' : 'تم إضافة المريض بنجاح ✅', 'success');

            this.resetForm();
            document.getElementById('patient-form-section').style.display = 'none';
            this.loadPatientsTable();
        } catch (err) {
            Utils.showToast('حدث خطأ أثناء حفظ البيانات', 'danger');
        }
    },

    editPatient: function (id) {
        const patient = StorageManager.getPatientById(id);
        if (!patient) return;

        this.currentEditId = patient.id;
        document.getElementById('form-title').textContent = `تعديل بيانات المريض: ${patient.name}`;

        document.getElementById('patient-name').value = patient.name || '';
        document.getElementById('patient-phone').value = patient.phone || '';
        document.getElementById('patient-reg-date').value = patient.registrationDate || '';
        document.getElementById('patient-notes').value = patient.notes || '';

        // Gender
        const genderMale = document.getElementById('gender-male');
        const genderFemale = document.getElementById('gender-female');
        if (patient.gender === 'أنثى') {
            if (genderFemale) genderFemale.checked = true;
            document.getElementById('pregnancy-conditional-box').style.display = 'block';
            if (patient.pregnancy === 'نعم') {
                document.getElementById('preg-yes').checked = true;
            } else {
                document.getElementById('preg-no').checked = true;
            }
        } else {
            if (genderMale) genderMale.checked = true;
            document.getElementById('pregnancy-conditional-box').style.display = 'none';
        }

        // Chronic
        if (patient.chronicDisease === 'نعم') {
            document.getElementById('chronic-yes').checked = true;
            document.getElementById('disease-conditional-box').style.display = 'block';
            document.getElementById('disease-details').value = patient.diseaseDetails || '';
        } else {
            document.getElementById('chronic-no').checked = true;
            document.getElementById('disease-conditional-box').style.display = 'none';
        }

        const formSection = document.getElementById('patient-form-section');
        formSection.style.display = 'block';
        formSection.scrollIntoView({ behavior: 'smooth' });
    },

    deletePatient: function (id) {
        const patient = StorageManager.getPatientById(id);
        if (!patient) return;

        if (confirm(`هل أنت متأكد من حذف المريض (${patient.name})؟`)) {
            StorageManager.deletePatient(id);
            Utils.showToast('تم حذف المريض بنجاح', 'info');
            this.loadPatientsTable();
        }
    },

    searchPatients: function () {
        const query = document.getElementById('patient-search-input').value.toLowerCase().trim();
        const rows = document.querySelectorAll('#patients-table-body tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    },

    resetForm: function () {
        const form = document.getElementById('patient-form');
        if (form) form.reset();
        this.currentEditId = null;
        document.getElementById('pregnancy-conditional-box').style.display = 'none';
        document.getElementById('disease-conditional-box').style.display = 'none';
        document.getElementById('patient-reg-date').value = new Date().toISOString().split('T')[0];
    }
};

window.PatientsController = PatientsController;
