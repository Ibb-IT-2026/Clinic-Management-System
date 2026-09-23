<?php
class PatientService {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getAllPatients() {
        $stmt = $this->pdo->query("SELECT * FROM patients ORDER BY created_at DESC");
        $patients = $stmt->fetchAll();

        return array_map(function ($p) {
            return [
                'id' => $p['id'],
                'name' => $p['full_name'],
                'phone' => $p['phone'],
                'gender' => $p['gender'],
                'pregnancy' => $p['is_pregnant'] ? 'نعم' : 'لا',
                'chronicDisease' => $p['has_chronic_diseases'] ? 'نعم' : 'لا',
                'diseaseDetails' => $p['chronic_diseases'],
                'registrationDate' => $p['created_at'],
                'isDeleted' => false
            ];
        }, $patients);
    }

    public function deletePatient($id) {
        $stmt = $this->pdo->prepare("DELETE FROM patients WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function savePatient($data) {
        $name = trim($data->name ?? '');
        $phone = trim($data->phone ?? '');
        $gender = $data->gender ?? 'ذكر';
        $is_pregnant = (isset($data->pregnancy) && $data->pregnancy === 'نعم');
        $has_chronic = (isset($data->chronicDisease) && $data->chronicDisease === 'نعم');
        $diseases = $data->diseaseDetails ?? '';

        if (isset($data->id) && $data->id) {
            $stmt = $this->pdo->prepare("UPDATE patients SET full_name=?, phone=?, gender=?, is_pregnant=?, has_chronic_diseases=?, chronic_diseases=? WHERE id=?");
            return $stmt->execute([$name, $phone, $gender, $is_pregnant, $has_chronic, $diseases, $data->id]);
        } else {
            $stmt = $this->pdo->prepare("INSERT INTO patients (full_name, phone, gender, is_pregnant, has_chronic_diseases, chronic_diseases) VALUES (?, ?, ?, ?, ?, ?)");
            return $stmt->execute([$name, $phone, $gender, $is_pregnant, $has_chronic, $diseases]);
        }
    }
}
?>
