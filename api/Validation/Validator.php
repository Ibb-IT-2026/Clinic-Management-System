<?php
class Validator {
    private $errors = [];

    public function validatePatient($data) {
        $name = trim($data->name ?? '');
        if (empty($name) || mb_strlen($name) < 3) {
            $this->errors[] = "اسم المريض مطلوب ويجب أن يكون 3 أحرف على الأقل.";
        }
        return empty($this->errors);
    }

    public function validateAppointment($data) {
        $patientId = $data->patientId ?? null;
        $date = $data->date ?? '';
        if (empty($patientId) || empty($date)) {
            $this->errors[] = "يجب تحديد المريض وتاريخ الموعد قبل الحفظ.";
        }
        return empty($this->errors);
    }

    public function getErrors() {
        return $this->errors;
    }

    public function getFirstError() {
        return $this->errors[0] ?? "حدث خطأ في التحقق من البيانات.";
    }
}
?>
