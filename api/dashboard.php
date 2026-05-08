<?php
// ============================================
// EduGuardian - API Dashboard
// Method: GET
// Query: ?action=stats | ?action=wali_terbaru | ?action=aktivitas
// ============================================

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
}

$action = $_GET['action'] ?? 'stats';

switch ($action) {

    // ---- Statistik Dashboard ----
    case 'stats':
        $totalWali = $conn->query("SELECT COUNT(*) as total FROM wali")->fetch_assoc()['total'];
        $totalSiswa = $conn->query("SELECT COUNT(*) as total FROM siswa")->fetch_assoc()['total'];
        $totalRelasi = $conn->query("SELECT COUNT(*) as total FROM relasi")->fetch_assoc()['total'];
        $totalNotifikasi = $conn->query("SELECT COUNT(*) as total FROM notifikasi")->fetch_assoc()['total'];
        $notifBaru = $conn->query("SELECT COUNT(*) as total FROM notifikasi WHERE dibaca = 0")->fetch_assoc()['total'];

        sendResponse([
            'success' => true,
            'data' => [
                'total_wali' => (int)$totalWali,
                'total_siswa' => (int)$totalSiswa,
                'total_relasi' => (int)$totalRelasi,
                'total_notifikasi' => (int)$totalNotifikasi,
                'notif_baru' => (int)$notifBaru
            ]
        ]);
        break;

    // ---- Wali Terbaru (untuk tabel dashboard) ----
    case 'wali_terbaru':
        $limit = $_GET['limit'] ?? 5;
        $sql = "SELECT id, nama, email, pekerjaan, status, created_at FROM wali ORDER BY created_at DESC LIMIT ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $limit);
        $stmt->execute();
        $result = $stmt->get_result();

        $waliList = [];
        while ($row = $result->fetch_assoc()) {
            $waliList[] = $row;
        }

        sendResponse([
            'success' => true,
            'data' => $waliList
        ]);
        $stmt->close();
        break;

    // ---- Aktivitas Terkini ----
    case 'aktivitas':
        $sql = "SELECT id, judul, pesan, tipe, created_at FROM notifikasi ORDER BY created_at DESC LIMIT 5";
        $result = $conn->query($sql);

        $aktivitas = [];
        while ($row = $result->fetch_assoc()) {
            $aktivitas[] = $row;
        }

        sendResponse([
            'success' => true,
            'data' => $aktivitas
        ]);
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Action tidak valid'], 400);
}

$conn->close();
?>
