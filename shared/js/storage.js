/**
 * ==========================================================================
 * Storage Manager (Client-Side Data Access Layer / Repository)
 * Replaces Backend API & SQL Database using localStorage
 * ==========================================================================
 */

const StorageManager = {
    KEYS: {
        PATIENTS: 'dental_clinic_patients_v2',
        APPOINTMENTS: 'dental_clinic_appointments_v2',
        SETTINGS: 'dental_clinic_settings_v2'
    },

    /**
     * Initialize storage with Seed Data if empty
     */
    init: function () {
        if (!localStorage.getItem(this.KEYS.PATIENTS)) {
            const seedPatients = (typeof MockData !== 'undefined') ? MockData.patients : [];
            localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(seedPatients));
        }

        if (!localStorage.getItem(this.KEYS.APPOINTMENTS)) {
            const seedAppointments = (typeof MockData !== 'undefined') ? MockData.appointments : [];
            localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(seedAppointments));
        }

        if (!localStorage.getItem(this.KEYS.SETTINGS)) {
            const seedSettings = (typeof MockData !== 'undefined') ? MockData.settings : { clinicName: "عيادة د. علي محمد" };
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(seedSettings));
        }
    },

    // ==========================================
    // Patients CRUD Operations
    // ==========================================
    getPatients: function (includeDeleted = false) {
        this.init();
        try {
            const list = JSON.parse(localStorage.getItem(this.KEYS.PATIENTS)) || [];
            if (includeDeleted) return list;
            return list.filter(p => !p.isDeleted);
        } catch (e) {
            console.error("Storage Error reading patients:", e);
            return [];
        }
    },

    getPatientById: function (id) {
        const patients = this.getPatients(true);
        return patients.find(p => p.id === parseInt(id)) || null;
    },

    savePatient: function (patientData) {
        this.init();
        const patients = this.getPatients(true);
        let savedItem = null;

        if (patientData.id) {
            // Update existing
            const index = patients.findIndex(p => p.id === parseInt(patientData.id));
            if (index !== -1) {
                patients[index] = {
                    ...patients[index],
                    ...patientData,
                    id: parseInt(patientData.id)
                };
                savedItem = patients[index];
            } else {
                throw new Error("المريض غير موجود");
            }
        } else {
            // Create new
            const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id || 0)) + 1 : 1;
            savedItem = {
                ...patientData,
                id: newId,
                registrationDate: patientData.registrationDate || new Date().toISOString().split('T')[0],
                isDeleted: false
            };
            patients.push(savedItem);
        }

        localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(patients));
        return savedItem;
    },

    deletePatient: function (id) {
        this.init();
        const patients = this.getPatients(true);
        const index = patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            patients[index].isDeleted = true;
            localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(patients));
            return true;
        }
        return false;
    },

    restorePatient: function (id) {
        this.init();
        const patients = this.getPatients(true);
        const index = patients.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            patients[index].isDeleted = false;
            localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(patients));
            return true;
        }
        return false;
    },

    // ==========================================
    // Appointments CRUD Operations
    // ==========================================
    getAppointments: function () {
        this.init();
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.APPOINTMENTS)) || [];
        } catch (e) {
            console.error("Storage Error reading appointments:", e);
            return [];
        }
    },

    getAppointmentById: function (id) {
        const apps = this.getAppointments();
        return apps.find(a => a.id === parseInt(id)) || null;
    },

    getAppointmentsByPatient: function (patientId) {
        const apps = this.getAppointments();
        return apps.filter(a => a.patientId === parseInt(patientId));
    },

    saveAppointment: function (appointmentData) {
        this.init();
        const apps = this.getAppointments();
        let savedItem = null;

        // Ensure patient name is bound
        const patient = this.getPatientById(appointmentData.patientId);
        const patientName = patient ? patient.name : (appointmentData.patientName || 'مريض غير معروف');

        // Numeric calculations
        const total = parseFloat(appointmentData.totalAmount) || 0;
        const paid = parseFloat(appointmentData.paidAmount) || 0;
        const remaining = Math.max(0, total - paid);

        let status = 'جزئي';
        if (paid === 0) status = 'غير مدفوع';
        if (paid >= total && total > 0) status = 'مكتمل';

        if (appointmentData.id) {
            // Update
            const index = apps.findIndex(a => a.id === parseInt(appointmentData.id));
            if (index !== -1) {
                apps[index] = {
                    ...apps[index],
                    ...appointmentData,
                    id: parseInt(appointmentData.id),
                    patientName: patientName,
                    totalAmount: total,
                    paidAmount: paid,
                    remainingAmount: remaining,
                    status: appointmentData.status || status
                };
                savedItem = apps[index];
            } else {
                throw new Error("الموعد غير موجود");
            }
        } else {
            // Create
            const newId = apps.length > 0 ? Math.max(...apps.map(a => a.id || 0)) + 1 : 1;
            savedItem = {
                ...appointmentData,
                id: newId,
                patientName: patientName,
                totalAmount: total,
                paidAmount: paid,
                remainingAmount: remaining,
                status: appointmentData.status || status,
                createdAt: new Date().toISOString()
            };
            apps.push(savedItem);
        }

        localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(apps));
        return savedItem;
    },

    deleteAppointment: function (id) {
        this.init();
        const apps = this.getAppointments();
        const filtered = apps.filter(a => a.id !== parseInt(id));
        if (filtered.length !== apps.length) {
            localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(filtered));
            return true;
        }
        return false;
    },

    // ==========================================
    // Analytics & Financial Aggregations
    // ==========================================
    getDashboardStats: function () {
        const patients = this.getPatients(false);
        const appointments = this.getAppointments();
        const todayStr = new Date().toISOString().split('T')[0];

        const todayApps = appointments.filter(a => a.date === todayStr);

        let totalIncome = 0;
        let totalDebt = 0;
        let completedCount = 0;
        let unpaidCount = 0;
        let partialCount = 0;

        appointments.forEach(a => {
            const paid = parseFloat(a.paidAmount) || 0;
            const remaining = parseFloat(a.remainingAmount) || 0;
            totalIncome += paid;
            totalDebt += remaining;

            if (a.status === 'مكتمل') completedCount++;
            else if (a.status === 'غير مدفوع') unpaidCount++;
            else if (a.status === 'جزئي') partialCount++;
        });

        return {
            totalPatients: patients.length,
            todayAppointmentsCount: todayApps.length,
            todayAppointmentsList: todayApps,
            totalIncome: totalIncome,
            totalDebt: totalDebt,
            totalAppointmentsCount: appointments.length,
            completedCount: completedCount,
            unpaidCount: unpaidCount,
            partialCount: partialCount
        };
    },

    // ==========================================
    // Backup & Restore
    // ==========================================
    exportBackup: function () {
        const backupData = {
            system: 'DentalClinicSE',
            version: '2.0',
            exportDate: new Date().toISOString(),
            patients: this.getPatients(true),
            appointments: this.getAppointments(),
            settings: JSON.parse(localStorage.getItem(this.KEYS.SETTINGS) || '{}')
        };
        return JSON.stringify(backupData, null, 2);
    },

    importBackup: function (jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.patients || !data.appointments) {
                throw new Error("هيكل ملف النسخة الاحتياطية غير متطابق");
            }
            localStorage.setItem(this.KEYS.PATIENTS, JSON.stringify(data.patients));
            localStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
            if (data.settings) {
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
            }
            return { success: true, countPatients: data.patients.length, countAppointments: data.appointments.length };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    resetToDefaults: function () {
        localStorage.removeItem(this.KEYS.PATIENTS);
        localStorage.removeItem(this.KEYS.APPOINTMENTS);
        localStorage.removeItem(this.KEYS.SETTINGS);
        this.init();
    }
};

// Initialize Storage Immediately
StorageManager.init();
window.StorageManager = StorageManager;
