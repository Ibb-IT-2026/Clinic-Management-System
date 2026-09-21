# نظام إدارة عيادة الأسنان 🦷 (Dental Clinic Management System)

## وصف مختصر
نظام ويب متكامل يهدف إلى حل مشكلة الإدارة اليدوية لعيادات الأسنان. يوفر النظام واجهة سهلة الاستخدام لتسجيل المرضى، إدارة المواعيد، متابعة المدفوعات، واستعراض إحصائيات العيادة بشكل فوري.

## أعضاء الفريق
- العضو الأول (Team Coordinator & Repo Maintainer): [اسم الطالب الأول]
- العضو الثاني (Requirements Owner & Frontend Dev): [اسم الطالب الثاني]
- العضو الثالث (Backend Dev & Reviewer): [اسم الطالب الثالث]

## التقنيات المستخدمة
- **الواجهة الأمامية:** HTML5, CSS3, Vanilla JavaScript
- **الواجهة الخلفية:** PHP (Vanilla)
- **قاعدة البيانات:** MySQL
- **أدوات العمل الجماعي:** Git, GitHub, GitHub Projects (Kanban)

## هيكلية المشروع (Project Structure)
```text
Clinic-Management-System-2/
├── api/                     # الواجهة الخلفية (Backend - PHP)
│   ├── Services/            # طبقة الخدمات (Business Logic)
│   ├── Validation/          # طبقة التحقق من صحة البيانات
│   ├── appointments.php     # مسار واجهة برمجة التطبيقات للمواعيد
│   ├── auth.php             # مسار واجهة برمجة التطبيقات للمصادقة
│   ├── dashboard.php        # مسار واجهة برمجة التطبيقات للوحة التحكم
│   ├── db.php               # إعدادات الاتصال بقاعدة البيانات
│   └── patients.php         # مسار واجهة برمجة التطبيقات للمرضى
├── database/                # ملفات قاعدة البيانات
│   └── dental_clinic_db.sql # النسخة الاحتياطية لقاعدة البيانات
├── docs/                    # مجلد التوثيق
│   └── SRS.md               # وثيقة المتطلبات (SRS)
├── js/                      # ملفات الجافاسكريبت (Frontend Logic)
│   ├── api.js               # التعامل مع الـ API
│   ├── app.js               # ملف النظام الأساسي
│   ├── appointments.js      # منطق المواعيد
│   ├── auth.js              # منطق المصادقة
│   ├── backup_manager.js    # إدارة النسخ الاحتياطية
│   ├── dark-mode.js         # الوضع الليلي
│   ├── dashboard_charts.js  # مخططات لوحة التحكم
│   ├── patients.js          # منطق إدارة المرضى
│   ├── payments.js          # منطق المدفوعات
│   ├── records.js           # منطق السجلات الطبية
│   ├── reports.js           # التقارير
│   └── utils.js             # وظائف مساعدة عامة
├── pages/                   # صفحات النظام (HTML)
│   ├── appointments.html    # صفحة المواعيد
│   ├── dashboard.html       # لوحة التحكم
│   ├── patients.html        # صفحة المرضى
│   ├── payments.html        # صفحة المدفوعات
│   └── records.html         # صفحة السجلات الطبية
├── styles/                  # ملفات التنسيق (CSS)
│   ├── components.css       # تنسيقات المكونات (الأزرار، النوافذ، الخ)
│   ├── forms.css            # تنسيقات النماذج
│   ├── layout.css           # تخطيط الصفحة الأساسي
│   ├── main.css             # التنسيقات العامة
│   ├── print.css            # تنسيقات الطباعة
│   ├── responsive.css       # التنسيقات المتجاوبة مع الشاشات
│   └── variables.css        # متغيرات الألوان والخطوط (CSS Variables)
├── .gitignore               # الملفات المستثناة من تتبع Git
├── AI_Log.md                # سجل استخدام الذكاء الاصطناعي
├── index.html               # الصفحة الرئيسية (صفحة تسجيل الدخول)
├── Project_Tasks_Plan.md    # خطة المهام
├── Project_Tasks_Plan2.doc  # خطة المهام (نسخة Word)
├── README.md                # ملف التعليمات الحالي
└── taskمهام.md              # تفاصيل المهام
```

## المهارات والمفاهيم الهندسية المطبقة (Software Engineering Skills)
تم تطبيق أحدث معايير هندسة البرمجيات المعمارية على المشروع لضمان استدامته (Maintainability) وقابليته للتوسع:
1. **MVC Architecture & Thin Controllers:** تم تفريغ ملفات الـ Controllers (مثل `patients.php`) من منطق الأعمال (Business Logic)، بحيث أصبحت مسؤولة فقط عن استقبال الطلب (HTTP Request) وتوجيهه.
2. **Service Layer:** تم استحداث مجلد `Services` لفصل منطق الأعمال والتعامل مع قاعدة البيانات في فئات (Classes) مستقلة مثل `PatientService.php`.
3. **Dependency Injection (DI):** تم التخلص من الترابط القوي (Tight Coupling) عن طريق تمرير كائن قاعدة البيانات `$pdo` عبر دالة البناء `__construct` للـ Services بدلاً من استدعائه عشوائياً.
4. **Validation Layer & SOLID Principles:** تطبيقاً لمبدأ المسؤولية الواحدة (Single Responsibility Principle - SRP)، تم نقل كافة عمليات التحقق من صحة المدخلات إلى كلاس مركزي منفصل `Validator.php` للحفاظ على نظافة الـ Controllers والـ Services.
5. **Requirements Engineering:** تم صياغة متطلبات المشروع بصيغة قصص المستخدم (User Stories) وحالات الحافة (Edge Cases) في وثيقة `SRS.md`.
6. **Agile Workflow:** تم استخدام Git Branches و Pull Requests و لوحة Kanban لضمان تكامل العمل وتطبيق المراجعات (Code Reviews).

## وثائق المشروع
- [وثيقة المتطلبات (Mini-SRS)](docs/SRS.md)
- [سجل استخدام الذكاء الاصطناعي (AI Log)](AI_Log.md)
- [خطة توزيع المهام](Project_Tasks_Plan.md)

## طريقة العمل المعتمدة (Git Workflow)
يستخدم الفريق الأدوات التالية لإدارة العمل:
1. **GitHub Issues:** لتحويل كل متطلب إلى مهمة قابلة للتتبع.
2. **Branches:** إنشاء فرع مستقل (`feature/issue-name`) لكل مهمة لتجنب التعارض.
3. **Pull Requests:** دمج التغييرات لا يتم إلا عبر فتح PR ومراجعته من قبل عضو آخر في الفريق (Code Review).

## 🚀 طريقة تشغيل المشروع محلياً

1. **تثبيت الخادم المحلي:** قم بتحميل وتثبيت [XAMPP](https://www.apachefriends.org/).
2. **نقل الملفات:** انسخ مجلد المشروع `Clinic-Management-System-2` وضعه في المسار `C:\xampp\htdocs\`.
3. **تشغيل الخادم:** افتح لوحة تحكم XAMPP وشغل `Apache` و `MySQL`.
4. **تهيئة قاعدة البيانات:**
   - انتقل إلى `http://localhost/phpmyadmin`
   - أنشئ قاعدة بيانات جديدة باسم `dental_clinic_db` بترميز `utf8mb4_unicode_ci`.
   - قم باستيراد الملف `dental_clinic_db.sql` الموجود في مجلد `database/`.
5. **تسجيل الدخول:**
   - انتقل إلى `http://localhost/Clinic-Management-System-2`
   - استخدم بيانات الدخول الافتراضية:
     - **اسم المستخدم:** `admin`
     - **كلمة المرور:** `admin`
