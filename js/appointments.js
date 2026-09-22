/**
 * Appointments Management Logic
 */

const AppointmentsManager = {
    init: async function () {
        if (document.getElementById('appointment-form')) {
            await this.populatePatientSelect();
            this.bindEvents();
            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('appointment-date');
            if (dateInput) {
                dateInput.value = today;
                dateInput.min = today;
            }
        }

        // If on Dashboard, load today's appointments
        if (document.getElementById('today-appointments-list')) {
            await this.loadTodayAppointments();
        }
    },

    bindEvents: function () {
        const form = document.getElementById('appointment-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Calculate Remaining
        ['total-amount', 'paid-amount'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.calculateRemaining());
        });

        // Return Visit Toggle
        document.querySelectorAll('input[name="return-visit"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const details = document.getElementById('return-details');
                if (details) {
                    if (this.value === 'yes') {
                        details.classList.add('active');
                    } else {
                        details.classList.remove('active');
                    }
                }
            });
        });

        // Reset
        document.getElementById('cancel-appointment')?.addEventListener('click', () => {
            form.reset();
            this.calculateRemaining();
            document.getElementById('return-details').classList.remove('active');
            const preview = document.getElementById('images-preview');
            if (preview) preview.innerHTML = '';
        });

        // Image Preview
        const imageInput = document.getElementById('appointment-images');
        if (imageInput) {
            imageInput.addEventListener('change', function (e) {
                const preview = document.getElementById('images-preview');
                preview.innerHTML = '';

                Array.from(this.files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const imgContainer = document.createElement('div');
                            imgContainer.style.position = 'relative';

                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.style.width = '100%';
                            img.style.height = '80px'; // Thumbnail height
                            img.style.objectFit = 'cover';
                            img.style.borderRadius = '4px';
                            img.style.border = '1px solid #ddd';

                            imgContainer.appendChild(img);
                            preview.appendChild(imgContainer);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            });
        }
    },

    populatePatientSelect: async function () {
        const select = document.getElementById('appointment-patient');
        if (!select) return;

        select.innerHTML = '<option value="">جار التحميل...</option>';
        try {
            const patients = await API.getPatients();
            select.innerHTML = '<option value="">اختر مريضاً</option>';

            patients.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.name} - ${p.phone}`;
                select.appendChild(option);
            });
        } catch (e) {
            select.innerHTML = '<option value="">فشل التحميل</option>';
        }
    },

    calculateRemaining: function () {
        const total = parseFloat(document.getElementById('total-amount').value) || 0;
        const paid = parseFloat(document.getElementById('paid-amount').value) || 0;
        const remaining = Math.max(0, total - paid);
        // Using setAttribute/value safely
        const remInput = document.getElementById('remaining-amount');
        if (remInput) remInput.value = remaining;
    },

    handleSubmit: async function (e) {
        e.preventDefault();

        const patientId = parseInt(document.getElementById('appointment-patient').value);
        if (!patientId) {
            alert('الرجاء اختيار مريض');
            return;
        }

        // We already have patientId, no need to fetch full patient object just for name if DB handles it, 
        // but the current logic might need valid checks.

        const total = parseFloat(document.getElementById('total-amount').value);
        const paid = parseFloat(document.getElementById('paid-amount').value);

        let status = 'جزئي';
        if (paid === 0) status = 'غير مدفوع';
        if (paid >= total) status = 'مكتمل';

        const returnVisitInput = document.querySelector('input[name="return-visit"]:checked');
        const returnVisit = returnVisitInput ? returnVisitInput.value : 'no';

        const appointment = {
            patientId: patientId,
            date: document.getElementById('appointment-date').value,
            type: document.getElementById('visit-type').value,
            totalAmount: total,
            paidAmount: paid,
            remainingAmount: Math.max(0, total - paid),
            status: status,
            returnVisit: returnVisit === 'yes' ? 'نعم' : 'لا'
        };

        if (returnVisit === 'yes') {
            appointment.returnDate = document.getElementById('return-date').value;
            appointment.returnType = document.getElementById('return-type').value;
        }

        try {
            await API.saveAppointment(appointment);
            alert('تم إضافة الموعد بنجاح');
            e.target.reset();
            this.calculateRemaining();
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ');
            console.error(error);
        }
    },

    loadTodayAppointments: async function () {
        const container = document.getElementById('today-appointments-list');
        if (!container) return;

        container.innerHTML = '<p style="text-align:center">جار التحميل...</p>';

        try {
            const appointments = await API.getAppointments();
            const today = new Date().toISOString().split('T')[0];
            const todayApps = appointments.filter(a => a.date === today);

            // Update Counter
            const counter = document.getElementById('today-appointments');
            if (counter) counter.textContent = todayApps.length;

            if (todayApps.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">لا توجد مواعيد لهذا اليوم</p>';
                return;
            }

            let html = '';
            todayApps.forEach(app => {
                html += `
                    <div class="appointment-item">
                        <div>
                            <strong>${app.patientName}</strong>
                            <p style="color: #666; margin-top: 5px;">${app.type}</p>
                        </div>
                        <div class="appointment-time">${app.date}</div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<p style="text-align:center;color:red">فشل تحميل المواعيد</p>';
        }
    }
};

window.AppointmentsManager = AppointmentsManager;
