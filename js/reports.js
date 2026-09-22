/**
 * Reports Manager
 * Handles generating and exporting PDF reports
 */

const ReportsManager = {
    generatePDF: function (period) {
        const { startDate, endDate, title } = this.getDateRange(period);
        const reportData = this.getReportData(startDate, endDate);

        // Create Report HTML Structure (Hidden)
        const element = document.createElement('div');
        element.style.padding = '20px';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.direction = 'rtl';
        element.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
                <h1 style="margin: 0;">عيادة الأسنان - د. علي محمد</h1>
                <h2 style="margin: 5px 0; color: #555;">${title}</h2>
                <p>الفترة: ${Utils.formatDate(startDate)} - ${Utils.formatDate(endDate)}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="background-color: #eee; padding: 10px;">ملخص العمليات المالية</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f9f9f9;">إجمالي الدخل</th>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f9f9f9;">الديون المتبقية</th>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f9f9f9;">عدد المواعيد</th>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${reportData.totalIncome} ريال</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${reportData.totalDebt} ريال</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${reportData.count}</td>
                    </tr>
                </table>
            </div>

            <div>
                <h3 style="background-color: #eee; padding: 10px;">تفاصيل المواعيد</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #333; color: white;">
                            <th style="padding: 8px; border: 1px solid #333;">التاريخ</th>
                            <th style="padding: 8px; border: 1px solid #333;">المريض</th>
                            <th style="padding: 8px; border: 1px solid #333;">النوع</th>
                            <th style="padding: 8px; border: 1px solid #333;">المبلغ</th>
                            <th style="padding: 8px; border: 1px solid #333;">المدفوع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.rows.map(row => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${Utils.formatDate(row.date)}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.patientName}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.type}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.totalAmount}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.paidAmount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
                تم استخراج التقرير بتاريخ: ${new Date().toLocaleString('ar-SA')}
            </div>
        `;

        // Generate PDF
        const opt = {
            margin: 0.5,
            filename: `report_${period}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // Check if library loaded
        if (typeof html2pdf === 'undefined') {
            Utils.showAlert('مكتبة PDF غير محملة. تأكد من الاتصال بالإنترنت.', 'danger');
            return;
        }

        Utils.showToast('جاري إنشاء التقرير...', 'info');
        html2pdf().set(opt).from(element).save().then(() => {
            Utils.showToast('تم تحميل التقرير بنجاح', 'success');
        });
    },

    getDateRange: function (period) {
        const today = new Date();
        let start = new Date(today);
        let end = new Date(today);
        let title = '';

        switch (period) {
            case 'daily':
                title = 'التقرير اليومي';
                // Start and end are already today
                break;
            case 'weekly':
                title = 'التقرير الأسبوعي';
                const day = today.getDay(); // 0 (Sun) to 6 (Sat)
                // Assuming week starts on Saturday (common in Arab world) or Sunday? Defaulting to Sunday start for standard JS
                // Let's make it last 7 days including today for simplicity, or current week
                start.setDate(today.getDate() - 7);
                break;
            case 'monthly':
                title = 'التقرير الشهري';
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'yearly':
                title = 'التقرير السنوي';
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
        }

        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            title: title
        };
    },

    getReportData: function (startDate, endDate) {
        const appointments = API.getAppointments();
        const filtered = appointments.filter(app => {
            return app.date >= startDate && app.date <= endDate;
        });

        let totalIncome = 0;
        let totalDebt = 0;

        filtered.forEach(app => {
            totalIncome += parseFloat(app.paidAmount || 0);
            totalDebt += parseFloat(app.remainingAmount || 0);
        });

        return {
            rows: filtered,
            totalIncome: totalIncome,
            totalDebt: totalDebt,
            count: filtered.length
        };
    }
};

window.ReportsManager = ReportsManager;
