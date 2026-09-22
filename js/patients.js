/**
 * Patients Management Logic
 */

const PatientsManager = {
    init: async function () {
        await this.loadPatientsTable();
        this.bindEvents();
    },

    bindEvents: function () {
        // Search
        const searchBtn = document.getElementById('search-patient-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchPatients());
        }

        // Add Patient Button (Show Form)
        const addBtn = document.getElementById('add-patient-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.resetForm();
                document.getElementById('add-patient-form').style.display = 'block';
                document.getElementById('patient-alert').style.display = 'none';
                window.scrollTo(0, document.getElementById('add-patient-form').offsetTop);
            });
        }

        // Cancel Button
        const cancelBtn = document.getElementById('cancel-patient');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetForm();
                document.getElementById('add-patient-form').style.display = 'none';
            });
        }

        // Form Submit
        const form = document.getElementById('patient-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Conditional Fields
        document.querySelectorAll('input[name="gender"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const pregnancyField = document.getElementById('pregnancy-field');
                if (pregnancyField) {
                    pregnancyField.style.display = this.value === 'female' ? 'block' : 'none';
                }
            });
        });

        document.querySelectorAll('input[name="chronic-disease"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const detailsField = document.getElementById('disease-details-field');
                if (detailsField) {
                    detailsField.style.display = this.value === 'yes' ? 'block' : 'none';
                }
            });
        });

        // Empty Trash (Not implemented in backend strictly, but can define logic)
        // Leaving empty/hidden for now or implement bulk delete
        const emptyTrashBtn = document.getElementById('empty-trash-btn');
        if (emptyTrashBtn) {
            emptyTrashBtn.style.display = 'none'; // Hiding trash features for simplicty of migration as discussed (simple CRUD first)
        }
    },

    loadPatientsTable: async function () {
        const tableBody = document.getElementById('patients-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">جار التحميل...</td></tr>';

        try {
            const patients = await API.getPatients();
            // Checking if filtered active patients needed. API returns all? 
            // My API currently returns all. I will client-side filter if 'isDeleted' concept remains or just show all.
            // API mapping had 'isDeleted': false constant. So all are active.

            tableBody.innerHTML = '';

            patients.forEach(patient => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${patient.name}</td>
                    <td>${patient.gender}</td>
                    <td>${patient.phone}</td>
                    <td>${patient.chronicDisease === 'نعم' ? patient.diseaseDetails : 'لا'}</td>
                    <td>
                        <button class="btn btn-view" onclick="window.location.href='records.html?patientId=${patient.id}'" style="margin-left:5px;"><i class="fas fa-file-medical-alt"></i> التفاصيل</button>
                        <button class="btn btn-edit" onclick="PatientsManager.editPatient(${patient.id})"><i class="fas fa-edit"></i> تعديل</button>
                        <button class="btn btn-delete" onclick="PatientsManager.deletePatient(${patient.id})"><i class="fas fa-trash"></i> حذف</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Trash not fully supported in V1 API, hiding trash section
            const trashSection = document.getElementById('trash-section');
            if (trashSection) trashSection.style.display = 'none';

        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">فشل التحميل</td></tr>';
        }
    },

    loadTrashTable: function () {
        // Deprecated in this migration step
    },

    handleFormSubmit: async function (e) {
        e.preventDefault();
        const form = document.getElementById('patient-form');
        const isEdit = form.dataset.editingPatientId;

        const name = document.getElementById('patient-name').value.trim();
        const phone = document.getElementById('patient-phone').value.trim();

        // Validation: Check duplicates (Server side ideally, but client side check for UX)
        try {
            const patients = await API.getPatients();
            const exists = patients.find(p =>
                p.id != isEdit &&
                (p.name === name || p.phone === phone)
            );

            if (exists) {
                Utils.showAlert('هذا المريض موجود بالفعل (الاسم أو الهاتف)', 'danger', 'patient-alert');
                return;
            }

            const gender = document.querySelector('input[name="gender"]:checked').value === 'male' ? 'ذكر' : 'أنثى';
            const chronic = document.querySelector('input[name="chronic-disease"]:checked').value === 'yes' ? 'نعم' : 'لا';

            // Gather Data
            const patientData = {
                id: isEdit ? parseInt(isEdit) : null,
                name: name,
                phone: phone,
                gender: gender,
                chronicDisease: chronic,
                diseaseDetails: chronic === 'نعم' ? document.getElementById('disease-details').value : '',
                pregnancy: gender === 'أنثى' ? (document.querySelector('input[name="pregnancy"]:checked')?.value === 'yes' ? 'نعم' : 'لا') : null
            };

            await API.savePatient(patientData); // works for update too if ID present in data, handled by API

            if (isEdit) {
                Utils.showAlert('تم تحديث بيانات المريض بنجاح', 'success', 'patient-alert');
            } else {
                Utils.showAlert('تم إضافة المريض بنجاح', 'success', 'patient-alert');
            }

            this.loadPatientsTable();
            setTimeout(() => {
                document.getElementById('add-patient-form').style.display = 'none';
                this.resetForm();
            }, 1500);

        } catch (error) {
            Utils.showAlert('حدث خطأ', 'danger', 'patient-alert');
            console.error(error);
        }
    },

    editPatient: async function (id) {
        // Fetch fresh list or find from DOM cache? Fetching fresh is safer.
        const patients = await API.getPatients();
        const patient = patients.find(p => p.id === id);
        if (!patient) return;

        document.getElementById('patient-name').value = patient.name;
        document.getElementById('patient-phone').value = patient.phone;

        // Gender
        const genderVal = patient.gender === 'ذكر' ? 'male' : 'female';
        document.querySelector(`input[name="gender"][value="${genderVal}"]`).checked = true;
        // Trigger change to show pregnancy if female
        const pregField = document.getElementById('pregnancy-field');
        if (pregField) pregField.style.display = genderVal === 'female' ? 'block' : 'none';

        if (genderVal === 'female' && patient.pregnancy) {
            const pregVal = patient.pregnancy === 'نعم' ? 'yes' : 'no';
            document.querySelector(`input[name="pregnancy"][value="${pregVal}"]`).checked = true;
        }

        // Chronic
        const chronicVal = patient.chronicDisease === 'نعم' ? 'yes' : 'no';
        document.querySelector(`input[name="chronic-disease"][value="${chronicVal}"]`).checked = true;
        const chronicField = document.getElementById('disease-details-field');
        if (chronicField) chronicField.style.display = chronicVal === 'yes' ? 'block' : 'none';

        if (chronicVal === 'yes') {
            document.getElementById('disease-details').value = patient.diseaseDetails;
        }

        const form = document.getElementById('patient-form');
        form.dataset.editingPatientId = id;
        document.getElementById('patient-submit-btn').innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
        document.getElementById('patient-form-title').textContent = 'تعديل بيانات مريض';

        document.getElementById('add-patient-form').style.display = 'block';
        window.scrollTo(0, document.getElementById('add-patient-form').offsetTop);
    },

    resetForm: function () {
        const form = document.getElementById('patient-form');
        if (form) {
            form.reset();
            delete form.dataset.editingPatientId;
        }
        document.getElementById('patient-submit-btn').innerHTML = '<i class="fas fa-save"></i> حفظ المريض';
        document.getElementById('patient-form-title').textContent = 'إضافة مريض جديد';
        document.getElementById('disease-details-field').style.display = 'none';
        document.getElementById('pregnancy-field').style.display = 'none';
    },

    deletePatient: async function (id) { // Replaces moveToTrash
        if (confirm('هل أنت متأكد من حذف المريض؟')) {
            try {
                await API.deletePatient(id);
                this.loadPatientsTable();
            } catch (e) {
                alert('فشل الحذف');
            }
        }
    },

    // Trash functions removed for now as we don't have soft delete in backend V1

    searchPatients: function () {
        const query = document.getElementById('patient-search').value.toLowerCase();
        const rows = document.querySelectorAll('#patients-table-body tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    }
};

window.PatientsManager = PatientsManager;
