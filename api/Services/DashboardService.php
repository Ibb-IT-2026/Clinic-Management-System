<?php
class DashboardService {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getStats() {
        $stats = [];

        // Total Patients
        $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM patients");
        $stats['patients_count'] = $stmt->fetch()['count'];

        // Today's Appointments
        $today = date('Y-m-d');
        $stmt = $this->pdo->prepare("SELECT COUNT(*) as count FROM visits WHERE visit_date = ?");
        $stmt->execute([$today]);
        $stats['today_appointments'] = $stmt->fetch()['count'];

        // Financials (Total Income from paid_amount)
        $stmt = $this->pdo->query("SELECT SUM(paid_amount) as total FROM visits");
        $stats['total_income'] = $stmt->fetch()['total'] ?? 0;

        return $stats;
    }
}
?>
