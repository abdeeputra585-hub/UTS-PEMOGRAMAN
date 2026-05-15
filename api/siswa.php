<?php

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        if (isset($_GET['id'])) {
            $id = (int)$_GET['id'];
            $sql = "SELECT s.*, 
                        GROUP_CONCAT(CONCAT(w.nama, '|', r.tipe, '|', w.email, '|', w.telepon) SEPARATOR ';;') as wali_info
                    FROM siswa s 
                    LEFT JOIN relasi r ON s.id = r.siswa_id 
                    LEFT JOIN wali w ON r.wali_id = w.id 
                    WHERE s.id = ?
                    GROUP BY s.id";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                sendResponse(['success' => false, 'message' => 'Siswa tidak ditemukan'], 404);
            }

            $siswa = $result->fetch_assoc();

            $waliList = [];
            if (!empty($siswa['wali_info'])) {
                $waliItems = explode(';;', $siswa['wali_info']);
                foreach ($waliItems as $item) {
                    $parts = explode('|', $item);
                    $waliList[] = [
                        'nama' => $parts[0] ?? '',
                        'tipe' => $parts[1] ?? '',
                        'email' => $parts[2] ?? '',
                        'telepon' => $parts[3] ?? ''
                    ];
                }
            }
            unset($siswa['wali_info']);
            $siswa['wali'] = $waliList;

            sendResponse(['success' => true, 'data' => $siswa]);
            $stmt->close();
        } else {
            $sql = "SELECT id, nisn, nama, kelas, jenis_kelamin, status, created_at FROM siswa ORDER BY created_at DESC";
            
            if (isset($_GET['kelas']) && !empty($_GET['kelas'])) {
                $kelas = $conn->real_escape_string($_GET['kelas']);
                $sql = "SELECT id, nisn, nama, kelas, jenis_kelamin, status, created_at FROM siswa WHERE kelas LIKE '%$kelas%' ORDER BY created_at DESC";
            }

            $result = $conn->query($sql);
            $siswaList = [];
            while ($row = $result->fetch_assoc()) {
                $siswaList[] = $row;
            }

            $totalAktif = $conn->query("SELECT COUNT(*) as t FROM siswa WHERE status='Aktif'")->fetch_assoc()['t'];
            $totalVerifikasi = $conn->query("SELECT COUNT(*) as t FROM siswa WHERE status='Verifikasi'")->fetch_assoc()['t'];
            $totalAlumni = $conn->query("SELECT COUNT(*) as t FROM siswa WHERE status IN ('Alumni','Pindah')")->fetch_assoc()['t'];

            sendResponse([
                'success' => true,
                'data' => $siswaList,
                'stats' => [
                    'total' => count($siswaList),
                    'aktif' => (int)$totalAktif,
                    'verifikasi' => (int)$totalVerifikasi,
                    'alumni_pindah' => (int)$totalAlumni
                ]
            ]);
        }
        break;

    case 'POST':
        $input = getJsonInput();

        if (empty($input['nisn']) || empty($input['nama']) || empty($input['kelas']) || empty($input['jenis_kelamin'])) {
            sendResponse(['success' => false, 'message' => 'NISN, nama, kelas, dan jenis kelamin wajib diisi'], 400);
        }

        $sql = "INSERT INTO siswa (nisn, nama, kelas, jenis_kelamin, status, alamat) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $status = $input['status'] ?? 'Aktif';
        $alamat = $input['alamat'] ?? '';
        $stmt->bind_param("ssssss", $input['nisn'], $input['nama'], $input['kelas'], $input['jenis_kelamin'], $status, $alamat);

        if ($stmt->execute()) {
            sendResponse([
                'success' => true,
                'message' => 'Siswa berhasil ditambahkan',
                'data' => ['id' => $conn->insert_id]
            ], 201);
        } else {
            sendResponse(['success' => false, 'message' => 'Gagal menambahkan siswa: ' . $stmt->error], 500);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            sendResponse(['success' => false, 'message' => 'ID siswa diperlukan'], 400);
        }

        $id = (int)$_GET['id'];
        $input = getJsonInput();

        $fields = [];
        $types = '';
        $values = [];

        if (isset($input['nisn'])) { $fields[] = "nisn = ?"; $types .= 's'; $values[] = $input['nisn']; }
        if (isset($input['nama'])) { $fields[] = "nama = ?"; $types .= 's'; $values[] = $input['nama']; }
        if (isset($input['kelas'])) { $fields[] = "kelas = ?"; $types .= 's'; $values[] = $input['kelas']; }
        if (isset($input['jenis_kelamin'])) { $fields[] = "jenis_kelamin = ?"; $types .= 's'; $values[] = $input['jenis_kelamin']; }
        if (isset($input['status'])) { $fields[] = "status = ?"; $types .= 's'; $values[] = $input['status']; }
        if (isset($input['alamat'])) { $fields[] = "alamat = ?"; $types .= 's'; $values[] = $input['alamat']; }

        if (empty($fields)) {
            sendResponse(['success' => false, 'message' => 'Tidak ada data yang diupdate'], 400);
        }

        $types .= 'i';
        $values[] = $id;

        $sql = "UPDATE siswa SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$values);

        if ($stmt->execute()) {
            sendResponse(['success' => true, 'message' => 'Data siswa berhasil diupdate']);
        } else {
            sendResponse(['success' => false, 'message' => 'Gagal update siswa: ' . $stmt->error], 500);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            sendResponse(['success' => false, 'message' => 'ID siswa diperlukan'], 400);
        }

        $id = (int)$_GET['id'];
        $sql = "DELETE FROM siswa WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                sendResponse(['success' => true, 'message' => 'Siswa berhasil dihapus']);
            } else {
                sendResponse(['success' => false, 'message' => 'Siswa tidak ditemukan'], 404);
            }
        } else {
            sendResponse(['success' => false, 'message' => 'Gagal menghapus siswa: ' . $stmt->error], 500);
        }
        $stmt->close();
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
}

$conn->close();
?>
