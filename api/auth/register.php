<?php
// ============================================
// EduGuardian - API Register (Orang Tua/Wali)
// Method: POST
// Body: { "nama": "...", "email": "...", "telepon": "...", "alamat": "...", "password": "..." }
// ============================================

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
}

$input = getJsonInput();

// Validasi input
if (empty($input['nama']) || empty($input['email']) || empty($input['password'])) {
    sendResponse(['success' => false, 'message' => 'Nama, email, dan password wajib diisi'], 400);
}

$nama     = $conn->real_escape_string($input['nama']);
$email    = $conn->real_escape_string($input['email']);
$telepon  = $conn->real_escape_string($input['telepon'] ?? '');
$alamat   = $conn->real_escape_string($input['alamat'] ?? '');
$password = password_hash($input['password'], PASSWORD_DEFAULT);

// Cek apakah email sudah terdaftar
$checkSql = "SELECT id FROM users WHERE email = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    sendResponse(['success' => false, 'message' => 'Email sudah terdaftar'], 409);
}
$checkStmt->close();

// Mulai transaction
$conn->begin_transaction();

try {
    // 1. Insert ke tabel users
    $sqlUser = "INSERT INTO users (email, password, role, nama) VALUES (?, ?, 'parent', ?)";
    $stmtUser = $conn->prepare($sqlUser);
    $stmtUser->bind_param("sss", $email, $password, $nama);
    $stmtUser->execute();
    $userId = $conn->insert_id;
    $stmtUser->close();

    // 2. Insert ke tabel wali
    $sqlWali = "INSERT INTO wali (user_id, nama, email, telepon, alamat, status) VALUES (?, ?, ?, ?, ?, 'Pending')";
    $stmtWali = $conn->prepare($sqlWali);
    $stmtWali->bind_param("issss", $userId, $nama, $email, $telepon, $alamat);
    $stmtWali->execute();
    $stmtWali->close();

    // 3. Buat notifikasi untuk admin
    $judulNotif = "Wali Siswa Baru Terdaftar";
    $pesanNotif = "$nama telah mendaftar sebagai wali siswa baru. Silakan verifikasi data.";
    $sqlNotif = "INSERT INTO notifikasi (judul, pesan, tipe, user_id) VALUES (?, ?, 'info', 1)";
    $stmtNotif = $conn->prepare($sqlNotif);
    $stmtNotif->bind_param("ss", $judulNotif, $pesanNotif);
    $stmtNotif->execute();
    $stmtNotif->close();

    $conn->commit();

    sendResponse([
        'success' => true,
        'message' => 'Registrasi berhasil! Silakan login dengan akun Anda.',
        'data' => ['user_id' => $userId]
    ], 201);

} catch (Exception $e) {
    $conn->rollback();
    sendResponse(['success' => false, 'message' => 'Registrasi gagal: ' . $e->getMessage()], 500);
}

$conn->close();
?>
