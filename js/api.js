/**
 * API Handler
 * Centralizes all fetch requests to the PHP backend
 */
const API = {
    // Dynamic BASE_URL depending on current folder depth
    BASE_URL: window.location.pathname.includes('/pages/') ? '../api' : 'api',

    async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.BASE_URL}/${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON:", text);
                throw new Error("الخادم لم يرجع بيانات صحيحة (JSON). ربما هناك خطأ في PHP أو أنك لا تستخدم localhost.");
            }
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    },

    // Auth
    async login(username, password) {
        return this.request('auth.php', 'POST', { action: 'login', username, password });
    },

    async logout() {
        return this.request('auth.php', 'POST', { action: 'logout' });
    },

    async checkSession() {
        return this.request('auth.php?action=check_session');
    },

    // Patients
    async getPatients() {
        return this.request('patients.php');
    },

    async savePatient(patientData) {
        return this.request('patients.php', 'POST', patientData);
    },

    async deletePatient(id) {
        return this.request('patients.php', 'POST', { action: 'delete', id });
    },

    // Appointments
    async getAppointments() {
        return this.request('appointments.php');
    },

    async saveAppointment(appointmentData) {
        return this.request('appointments.php', 'POST', appointmentData);
    },

    // Dashboard
    async getStats() {
        return this.request('dashboard.php');
    }
};

window.API = API;
