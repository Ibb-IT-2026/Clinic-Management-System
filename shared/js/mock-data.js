/**
 * Mock Data Initializer (Seed Data)
 * Dental Clinic Management System
 */

const MockData = {
    patients: [
        {
            id: 1,
            name: "أحمد محمد المنصوري",
            gender: "ذكر",
            pregnancy: null,
            phone: "0551234567",
            chronicDisease: "نعم",
            diseaseDetails: "سكري - ضغط دم",
            registrationDate: "2024-01-15",
            isDeleted: false,
            notes: "مريض منتظم، يحتاج متابعة دورية للثة"
        },
        {
            id: 2,
            name: "سارة خالد الشمري",
            gender: "أنثى",
            pregnancy: "لا",
            phone: "0509876543",
            chronicDisease: "لا",
            diseaseDetails: "",
            registrationDate: "2024-02-10",
            isDeleted: false,
            notes: "جلسات تبييض وتنظيف دوري"
        },
        {
            id: 3,
            name: "محمد علي الغامدي",
            gender: "ذكر",
            pregnancy: null,
            phone: "0541122334",
            chronicDisease: "نعم",
            diseaseDetails: "حساسية بنسلين",
            registrationDate: "2024-02-05",
            isDeleted: false,
            notes: "علاج عصب للضرس العلوي"
        },
        {
            id: 4,
            name: "نورة فهد القحطاني",
            gender: "أنثى",
            pregnancy: "نعم",
            phone: "0563344556",
            chronicDisease: "لا",
            diseaseDetails: "",
            registrationDate: "2024-03-01",
            isDeleted: false,
            notes: "حامل في الشهر الخامس، فحص روتيني وتجنب الأشعة"
        },
        {
            id: 5,
            name: "عبدالله يوسف العتيبي",
            gender: "ذكر",
            pregnancy: null,
            phone: "0598877665",
            chronicDisease: "لا",
            diseaseDetails: "",
            registrationDate: "2024-03-12",
            isDeleted: false,
            notes: "تركيب تقويم أسنان"
        }
    ],

    appointments: [
        {
            id: 1,
            patientId: 1,
            patientName: "أحمد محمد المنصوري",
            date: "2024-03-18",
            time: "10:30",
            type: "تنظيف وتلميع",
            totalAmount: 250,
            paidAmount: 250,
            remainingAmount: 0,
            status: "مكتمل",
            returnVisit: "لا",
            notes: "تم إزالة الجير بنجاح"
        },
        {
            id: 2,
            patientId: 2,
            patientName: "سارة خالد الشمري",
            date: "2024-03-18",
            time: "11:30",
            type: "كشف وتشخيص",
            totalAmount: 150,
            paidAmount: 150,
            remainingAmount: 0,
            status: "مكتمل",
            returnVisit: "نعم",
            returnDate: "2024-04-01",
            returnType: "متابعة تبييض",
            notes: "تحتاج جلسة إضافية للتبييض"
        },
        {
            id: 3,
            patientId: 3,
            patientName: "محمد علي الغامدي",
            date: "2024-03-18",
            time: "14:00",
            type: "حشو تجميلي",
            totalAmount: 500,
            paidAmount: 300,
            remainingAmount: 200,
            status: "جزئي",
            returnVisit: "لا",
            notes: "تم دفع دفعة أولى والمتبقي في الجلسة القادمة"
        },
        {
            id: 4,
            patientId: 1,
            patientName: "أحمد محمد المنصوري",
            date: "2024-03-19",
            time: "16:30",
            type: "قلع ضرس العقل",
            totalAmount: 800,
            paidAmount: 0,
            remainingAmount: 800,
            status: "غير مدفوع",
            returnVisit: "لا",
            notes: "موعد مؤكد بعد إجراء الأشعة"
        },
        {
            id: 5,
            patientId: 4,
            patientName: "نورة فهد القحطاني",
            date: "2024-03-20",
            time: "09:00",
            type: "كشف دوري",
            totalAmount: 150,
            paidAmount: 150,
            remainingAmount: 0,
            status: "مكتمل",
            returnVisit: "لا",
            notes: "صحة اللثة جيدة"
        },
        {
            id: 6,
            patientId: 5,
            patientName: "عبدالله يوسف العتيبي",
            date: "2024-03-21",
            time: "17:00",
            type: "شد تقويم",
            totalAmount: 400,
            paidAmount: 400,
            remainingAmount: 0,
            status: "مكتمل",
            returnVisit: "نعم",
            returnDate: "2024-04-21",
            returnType: "جلسة شد شهرية",
            notes: "تعديل السلك العلوي"
        }
    ],

    settings: {
        clinicName: "عيادة د. علي محمد لطب وجراحة الأسنان",
        doctorName: "د. علي محمد",
        currency: "ريال",
        phone: "0112345678"
    }
};

window.MockData = MockData;
