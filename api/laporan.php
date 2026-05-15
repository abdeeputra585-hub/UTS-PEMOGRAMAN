<?php

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
}

$kelas = isset($_GET['kelas']) ? $conn->real_escape_string($_GET['kelas']) : null;

$sql = "SELECT w.nama as wali_nama, w.telepon,
               s.nama as siswa_nama, s.kelas,
               r.tipe as hubungan, r.status
        FROM relasi r
        JOIN siswa s ON r.siswa_id = s.id
        JOIN wali w ON r.wali_id = w.id";

if ($kelas) {
    $sql .= " WHERE s.kelas LIKE '%$kelas%'";
}

$sql .= " ORDER BY s.kelas, s.nama";

$result = $conn->query($sql);

$laporanList = [];
while ($row = $result->fetch_assoc()) {
    $laporanList[] = $row;
}

sendResponse([
    'success' => true,
    'data' => $laporanList,
    'total' => count($laporanList)
]);

$conn->close();
?>
