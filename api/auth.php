<?php
// Output buffering to catch any accidental whitespace or error output
ob_start();

session_start();
require_once 'db.php';

// Clean buffer before sending headers if any output occurred
ob_clean();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->action) && $data->action === 'login') {
        $username = $data->username;
        $password = $data->password;

        // Regenerate session ID to prevent fixation and ensure fresh start
        session_regenerate_id(true);

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        // Check: 1. Hash match OR 2. Plain text match (for manually inserted passwords)
        $is_valid = false;
        if ($user) {
            if (password_verify($password, $user['password_hash'])) {
                $is_valid = true;
            } elseif ($user['password_hash'] === $password) { // Plain text check
                $is_valid = true;
            }
        }

        if ($is_valid) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];

            // Force write close to ensure session saved immediately
            session_write_close();

            echo json_encode(["status" => "success", "message" => "Login successful", "user" => $user]);
        } else {
            // Fallback for initial setup (admin/admin) without DB user
            if ($username === 'admin' && $password === 'admin') {
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

// Flush buffer
ob_end_flush();
?>