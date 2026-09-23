/**
 * Records Management Logic
 */

const RecordsManager = {
    init: function () {
        this.loadRecordsPatients();
        this.bindEvents();

        // Check for patientId in URL
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('patientId');
        if (patientId) {
            this.viewPatientRecords(parseInt(patientId));
        }
    },

    bindEvents: function () {
        // Search
        const searchBtn = document.getElementById('search-records-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchRecords());
        }

        // Back Button
        const backBtn = document.getElementById('back-to-records');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.resetView());
        }
    },

    loadRecordsPatients: async function () {
        const tableBody = document.getElementById('records-patients-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">جار التحميل...</td></tr>';

        try {
            const [patients, appointments] = await Promise.all([
                API.getPatients(),
                API.getAppointments()
            ]);

            tableBody.innerHTML = '';

            // Filter deleted if needed, usually records should show all or active.
            // Following previous logic:

            patients.forEach(patient => {
                // Find last appointment
                const patientApps = appointments.filter(a => a.patientId === patient.id);
                const lastApp = patientApps.length > 0
                    ? patientApps.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                    : null;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${patient.name}</td>
                    <td>${patient.phone}</td>
                    <td>${patient.gender}</td>
                    <td>${lastApp ? lastApp.date : 'لا توجد زيارات'}</td>
                    <td>
                        <button class="btn btn-view" onclick="RecordsManager.viewPatientRecords(${patient.id})">
                            <i class="fas fa-history"></i> عرض السجل
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">فشل التحميل</td></tr>';
        }
    },

    viewPatientRecords: async function (patientId) {
        try {
            const [patients, appointments] = await Promise.all([
                API.getPatients(),
                API.getAppointments()
            ]);

            const patient = patients.find(p => p.id === patientId);
            if (!patient) return;

            // Toggle Views
            document.getElementById('patients-records-list').style.display = 'none';
            document.getElementById('back-button-container').style.display = 'block';
            document.getElementById('patient-records-info').style.display = 'block';
            document.getElementById('patient-visits').style.display = 'block';

            // Patient Info
            document.getElementById('selected-patient-name').textContent = patient.name;

            let basicInfoHtml = `
                <div class="info-item">
                    <span class="info-label">رقم الهاتف:</span>
                    <span>${patient.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">الجنس:</span>
                    <span>${patient.gender}</span>
                </div>
            `;

            if (patient.gender === 'أنثى') {
                basicInfoHtml += `
                    <div class="info-item">
                        <span class="info-label">حامل:</span>
                        <span>${patient.pregnancy || 'لا'}</span>
                    </div>
                `;
            }

            basicInfoHtml += `
                <div class="info-item">
                    <span class="info-label">أمراض مزمنة:</span>
                    <span>${patient.chronicDisease === 'نعم' ? patient.diseaseDetails : 'لا'}</span>
                </div>
            `;
            document.getElementById('patient-basic-info').innerHTML = basicInfoHtml;

            // Visits History
            const visitsBody = document.getElementById('visits-table-body');
            visitsBody.innerHTML = '';

            const patientApps = appointments.filter(a => a.patientId === patientId);

            // Sort by date desc
            patientApps.sort((a, b) => new Date(b.date) - new Date(a.date));

            let totalAmount = 0, totalPaid = 0, totalRemaining = 0;

            patientApps.forEach(app => {
                totalAmount += parseFloat(app.totalAmount); // Ensure number
                totalPaid += parseFloat(app.paidAmount);
                totalRemaining += parseFloat(app.remainingAmount);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${app.date}</td>
                    <td>${app.type}</td>
                    <td>${app.totalAmount} ريال</td>
                    <td>${app.paidAmount} ريال</td>
                    <td>${app.remainingAmount} ريال</td>
                    <td>
                        <span class="status-${PaymentsManager?.getStatusClass ? PaymentsManager.getStatusClass(app.status) : 'unpaid'}">
                            ${app.status}
                        </span>
                    </td>
                `;
                visitsBody.appendChild(row);
            });

            // Summary
            document.getElementById('total-amount-patient').textContent = totalAmount;
            document.getElementById('total-paid').textContent = totalPaid;
            document.getElementById('total-remaining').textContent = totalRemaining;

        } catch (e) {
            console.error("Failed to load details", e);
        }
    },

    resetView: function () {
        document.getElementById('back-button-container').style.display = 'none';
        document.getElementById('patient-records-info').style.display = 'none';
        document.getElementById('patient-visits').style.display = 'none';
        document.getElementById('patients-records-list').style.display = 'block';
    },

    searchRecords: function () {
        const query = document.getElementById('records-search').value.toLowerCase();
        const rows = document.querySelectorAll('#records-patients-table-body tr');
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const phone = row.cells[1].textContent;
            row.style.display = (name.includes(query) || phone.includes(query)) ? '' : 'none';
        });
    }
};

window.RecordsManager = RecordsManager;
