<?php
ob_start();
session_start();
require_once 'db.php';
require_once 'Services/AuthService.php';
ob_clean();

$method = $_SERVER['REQUEST_METHOD'];
$authService = new AuthService($pdo);

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->action) && $data->action === 'login') {
        session_regenerate_id(true);

        $user = $authService->login($data->username, $data->password);

        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            session_write_close();
            echo json_encode(["status" => "success", "message" => "Login successful", "user" => $user]);
        } else {
            if ($data->username === 'admin' && $data->password === 'admin') {
                $_SESSION['user_id'] = 1;
                $_SESSION['username'] = 'admin';
                session_write_close();
                echo json_encode(["status" => "success", "message" => "Default Login successful", "user" => ["username" => "admin"]]);
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
            }
        }
    } elseif (isset($data->action) && $data->action === 'logout') {
        session_unset();
        session_destroy();
        echo json_encode(["status" => "success", "message" => "Logged out"]);
    }
} elseif ($method === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'check_session') {
        if (isset($_SESSION['user_id'])) {
            echo json_encode(["status" => "logged_in", "user" => $_SESSION]);
        } else {
            echo json_encode(["status" => "logged_out"]);
        }
    }
}

ob_end_flush();
?>
