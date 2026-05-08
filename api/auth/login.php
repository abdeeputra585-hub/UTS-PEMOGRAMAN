<?php
// ============================================
// EduGuardian - API Login
// Method: POST
// Body: { "email": "...", "password": "..." }
// ============================================

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
}

$input = getJsonInput();

// Validasi input
if (empty($input['email']) || empty($input['password'])) {
    sendResponse(['success' => false, 'message' => 'Email dan password wajib diisi'], 400);
}

$email = $conn->real_escape_string($input['email']);
$password = $input['password'];

// Cari user berdasarkan email
$sql = "SELECT id, email, password, role, nama, avatar FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(['success' => false, 'message' => 'Email tidak ditemukan'], 401);
}

$user = $result->fetch_assoc();

// Verifikasi password
if (!password_verify($password, $user['password'])) {
    sendResponse(['success' => false, 'message' => 'Password salah'], 401);
}

// Login berhasil - kirim data user (tanpa password)
unset($user['password']);

sendResponse([
    'success' => true,
    'message' => 'Login berhasil',
    'data' => $user
]);

$stmt->close();
$conn->close();
?>
