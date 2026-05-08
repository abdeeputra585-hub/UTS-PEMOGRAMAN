<?php
// ============================================
// EduGuardian - API Notifikasi
// GET /api/notifikasi.php              → Semua notifikasi
// GET /api/notifikasi.php?user_id=1    → Notifikasi per user
// ============================================

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
}

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

if ($userId) {
    $sql = "SELECT id, judul, pesan, tipe, dibaca, created_at FROM notifikasi WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $sql = "SELECT n.id, n.judul, n.pesan, n.tipe, n.dibaca, n.created_at, u.nama as user_nama 
            FROM notifikasi n 
            LEFT JOIN users u ON n.user_id = u.id 
            ORDER BY n.created_at DESC";
    $result = $conn->query($sql);
}

$notifList = [];
while ($row = $result->fetch_assoc()) {
    $notifList[] = $row;
}

$belumDibaca = 0;
foreach ($notifList as $n) {
    if ($n['dibaca'] == 0) $belumDibaca++;
}

sendResponse([
    'success' => true,
    'data' => $notifList,
    'belum_dibaca' => $belumDibaca,
    'total' => count($notifList)
]);

if (isset($stmt)) $stmt->close();
$conn->close();
?>
