<?php
// ============================================
// EduGuardian - API Wali
// GET /api/wali.php         → Daftar semua wali
// GET /api/wali.php?id=1    → Detail satu wali
// ============================================

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
}

if (isset($_GET['id'])) {
    // Detail satu wali
    $id = (int)$_GET['id'];
    $sql = "SELECT w.*, u.email as user_email, u.role 
            FROM wali w 
            LEFT JOIN users u ON w.user_id = u.id 
            WHERE w.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendResponse(['success' => false, 'message' => 'Wali tidak ditemukan'], 404);
    }

    sendResponse(['success' => true, 'data' => $result->fetch_assoc()]);
    $stmt->close();

} else {
    // Daftar semua wali
    $sql = "SELECT w.id, w.nama, w.email, w.telepon, w.pekerjaan, w.status, w.created_at 
            FROM wali w 
            ORDER BY w.created_at DESC";
    $result = $conn->query($sql);

    $waliList = [];
    while ($row = $result->fetch_assoc()) {
        $waliList[] = $row;
    }

    sendResponse([
        'success' => true,
        'data' => $waliList,
        'total' => count($waliList)
    ]);
}

$conn->close();
?>
