<?php
// ============================================
// EduGuardian - API Relasi Siswa-Wali
// GET    /api/relasi.php         → Daftar semua relasi
// POST   /api/relasi.php         → Tambah relasi baru
// DELETE /api/relasi.php?id=1    → Hapus relasi
// ============================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ======== GET: Daftar Relasi ========
    case 'GET':
        $sql = "SELECT r.id, r.tipe, r.status, r.created_at,
                       s.id as siswa_id, s.nisn, s.nama as siswa_nama,
                       w.id as wali_id, w.nama as wali_nama, w.email as wali_email
                FROM relasi r
                JOIN siswa s ON r.siswa_id = s.id
                JOIN wali w ON r.wali_id = w.id
                ORDER BY r.created_at DESC";
        $result = $conn->query($sql);

        $relasiList = [];
        while ($row = $result->fetch_assoc()) {
            $relasiList[] = $row;
        }

        // Hitung siswa yang belum punya relasi
        $siswaTanpaRelasi = $conn->query("SELECT COUNT(*) as t FROM siswa WHERE id NOT IN (SELECT DISTINCT siswa_id FROM relasi)")->fetch_assoc()['t'];

        sendResponse([
            'success' => true,
            'data' => $relasiList,
            'stats' => [
                'total_relasi' => count($relasiList),
                'siswa_tanpa_relasi' => (int)$siswaTanpaRelasi
            ]
        ]);
        break;

    // ======== POST: Tambah Relasi Baru ========
    case 'POST':
        $input = getJsonInput();

        if (empty($input['siswa_id']) || empty($input['wali_id']) || empty($input['tipe'])) {
            sendResponse(['success' => false, 'message' => 'siswa_id, wali_id, dan tipe wajib diisi'], 400);
        }

        $siswaId = (int)$input['siswa_id'];
        $waliId = (int)$input['wali_id'];
        $tipe = $conn->real_escape_string($input['tipe']);

        // Cek apakah siswa dan wali ada
        $cekSiswa = $conn->query("SELECT id, nama FROM siswa WHERE id = $siswaId");
        $cekWali = $conn->query("SELECT id, nama FROM wali WHERE id = $waliId");

        if ($cekSiswa->num_rows === 0) {
            sendResponse(['success' => false, 'message' => 'Siswa tidak ditemukan'], 404);
        }
        if ($cekWali->num_rows === 0) {
            sendResponse(['success' => false, 'message' => 'Wali tidak ditemukan'], 404);
        }

        $siswaData = $cekSiswa->fetch_assoc();
        $waliData = $cekWali->fetch_assoc();

        // Insert relasi
        $sql = "INSERT INTO relasi (siswa_id, wali_id, tipe, status) VALUES (?, ?, ?, 'Pending')";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iis", $siswaId, $waliId, $tipe);

        if ($stmt->execute()) {
            // Buat notifikasi otomatis
            $judulNotif = "Relasi Baru Ditambahkan";
            $pesanNotif = "Relasi baru antara siswa {$siswaData['nama']} dengan wali {$waliData['nama']} ({$tipe}) telah ditambahkan.";
            $sqlNotif = "INSERT INTO notifikasi (judul, pesan, tipe, user_id) VALUES (?, ?, 'info', 1)";
            $stmtNotif = $conn->prepare($sqlNotif);
            $stmtNotif->bind_param("ss", $judulNotif, $pesanNotif);
            $stmtNotif->execute();
            $stmtNotif->close();

            sendResponse([
                'success' => true,
                'message' => 'Relasi berhasil ditambahkan',
                'data' => [
                    'id' => $conn->insert_id,
                    'siswa_nama' => $siswaData['nama'],
                    'wali_nama' => $waliData['nama'],
                    'tipe' => $tipe,
                    'status' => 'Pending'
                ]
            ], 201);
        } else {
            sendResponse(['success' => false, 'message' => 'Gagal menambah relasi: ' . $stmt->error], 500);
        }
        $stmt->close();
        break;

    // ======== DELETE: Hapus Relasi ========
    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['success' => false, 'message' => 'ID relasi diperlukan'], 400);
        }

        $id = (int)$_GET['id'];
        $sql = "DELETE FROM relasi WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                sendResponse(['success' => true, 'message' => 'Relasi berhasil dihapus']);
            } else {
                sendResponse(['success' => false, 'message' => 'Relasi tidak ditemukan'], 404);
            }
        } else {
            sendResponse(['success' => false, 'message' => 'Gagal menghapus relasi: ' . $stmt->error], 500);
        }
        $stmt->close();
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
}

$conn->close();
?>
