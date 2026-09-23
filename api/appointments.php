<?php
require_once 'db.php';
require_once 'Services/AppointmentService.php';
require_once 'Validation/Validator.php';

$method = $_SERVER['REQUEST_METHOD'];
$appointmentService = new AppointmentService($pdo);
$validator = new Validator();

if ($method === 'GET') {
    echo json_encode($appointmentService->getAllAppointments());

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!$validator->validateAppointment($data)) {
        echo json_encode(["status" => "error", "message" => $validator->getFirstError()]);
        exit;
    }

    $id = $appointmentService->saveAppointment($data);
    if ($id) {
        echo json_encode(["status" => "success", "id" => $id]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}
?>