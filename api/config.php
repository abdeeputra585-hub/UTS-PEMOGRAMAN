<?php
// ============================================
// EduGuardian - Konfigurasi Koneksi Database
// ============================================

// Mencegah akses langsung via browser
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Konfigurasi Database MySQL
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');  // Default XAMPP tidak ada password
define('DB_NAME', 'eduguardian');

// Membuat koneksi ke MySQL
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Cek koneksi
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $conn->connect_error
    ]);
    exit();
}

// Set charset ke utf8mb4
$conn->set_charset("utf8mb4");

/**
 * Helper function untuk mengirim response JSON
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Helper function untuk mendapatkan input JSON dari request body
 */
function getJsonInput() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}
?>
