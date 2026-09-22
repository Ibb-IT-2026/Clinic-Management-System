<?php
require_once 'db.php';
require_once 'Services/DashboardService.php';

$dashboardService = new DashboardService($pdo);
echo json_encode($dashboardService->getStats());
?>