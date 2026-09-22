<?php
require_once 'db.php';
require_once 'Services/PatientService.php';
require_once 'Validation/Validator.php';

$method = $_SERVER['REQUEST_METHOD'];
$patientService = new PatientService($pdo);
$validator = new Validator();

if ($method === 'GET') {
    echo json_encode($patientService->getAllPatients());

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->action) && $data->action === 'delete') {
        if ($patientService->deletePatient($data->id)) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error"]);
        }
        exit;
    }

    if (!$validator->validatePatient($data)) {
        echo json_encode(["status" => "error", "message" => $validator->getFirstError()]);
        exit;
    }

    if ($patientService->savePatient($data)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
}
?>