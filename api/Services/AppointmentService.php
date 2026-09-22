<?php
class AppointmentService {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getAllAppointments() {
        $sql = "SELECT v.*, p.full_name as patient_name FROM visits v JOIN patients p ON v.patient_id = p.id ORDER BY v.visit_date DESC";
        $stmt = $this->pdo->query($sql);
        $visits = $stmt->fetchAll();

        return array_map(function ($v) {
            return [
                'id' => $v['id'],
                'patientId' => $v['patient_id'],
                'patientName' => $v['patient_name'],
                'date' => $v['visit_date'],
                'type' => $v['visit_type'],
                'totalAmount' => $v['total_amount'],
                'paidAmount' => $v['paid_amount'],
                'remainingAmount' => $v['remaining_amount'],
                'status' => $v['payment_status'],
                'returnVisit' => 'لا',
                'images' => []
            ];
        }, $visits);
    }

    public function saveAppointment($data) {
        $patientId = $data->patientId ?? null;
        $date = $data->date ?? '';
        $type = $data->type ?? '';
        $total = $data->totalAmount ?? 0;
        $paid = $data->paidAmount ?? 0;
        $remaining = $data->remainingAmount ?? 0;
        $status = $data->status ?? '';

        if (isset($data->id) && $data->id) {
            // Update logic here if needed
            return false;
        } else {
            $stmt = $this->pdo->prepare("INSERT INTO visits (patient_id, visit_date, visit_type, total_amount, paid_amount, remaining_amount, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $res = $stmt->execute([$patientId, $date, $type, $total, $paid, $remaining, $status]);
            
            if ($res) {
                return $this->pdo->lastInsertId();
            }
            return false;
        }
    }
}
?>
