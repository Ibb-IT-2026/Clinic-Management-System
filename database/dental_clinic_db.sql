CREATE DATABASE IF NOT EXISTS dental_clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dental_clinic_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    gender ENUM('ذكر', 'أنثى') DEFAULT 'ذكر',
    is_pregnant BOOLEAN DEFAULT FALSE,
    has_chronic_diseases BOOLEAN DEFAULT FALSE,
    chronic_diseases TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    visit_date DATETIME NOT NULL,
    visit_type VARCHAR(100),
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    remaining_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- إدخال مستخدم افتراضي
-- اسم المستخدم: admin, كلمة المرور: admin
INSERT INTO users (username, password_hash)
SELECT 'admin', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm' 
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
