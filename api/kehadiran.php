<?php


require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $siswa_id = isset($_GET['siswa_id']) ? intval($_GET['siswa_id']) : null;
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($siswa_id) {
        if ($action === 'summary') {

            $sql = "SELECT status, COUNT(*) as total FROM kehadiran WHERE siswa_id = ? GROUP BY status";
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $stmt->bind_param("i", $siswa_id);
                $stmt->execute();
                $result = $stmt->get_result();
                
                $summary = [
                    'Hadir' => 0,
                    'Izin' => 0,
                    'Sakit' => 0,
                    'Alpa' => 0,
                    'Total' => 0
                ];
                
                while ($row = $result->fetch_assoc()) {
                    $summary[$row['status']] = intval($row['total']);
                    $summary['Total'] += intval($row['total']);
                }

                $history_sql = "SELECT tanggal, status, keterangan FROM kehadiran WHERE siswa_id = ? ORDER BY tanggal DESC LIMIT 5";
                $hist_stmt = $conn->prepare($history_sql);
                $history = [];
                if ($hist_stmt) {
                    $hist_stmt->bind_param("i", $siswa_id);
                    $hist_stmt->execute();
                    $hist_res = $hist_stmt->get_result();
                    while ($h = $hist_res->fetch_assoc()) {
                        $history[] = $h;
                    }
                }
                
                sendResponse([
                    'success' => true, 
                    'data' => [
                        'summary' => $summary,
                        'history' => $history
                    ]
                ]);
            } else {
                sendResponse(['success' => false, 'message' => 'Query error'], 500);
            }
        } else {

            $sql = "SELECT id, tanggal, status, keterangan, created_at FROM kehadiran WHERE siswa_id = ? ORDER BY tanggal DESC";
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $stmt->bind_param("i", $siswa_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $data = [];
                while ($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                sendResponse(['success' => true, 'data' => $data]);
            } else {
                sendResponse(['success' => false, 'message' => 'Query error'], 500);
            }
        }
    } else {
        sendResponse(['success' => false, 'message' => 'siswa_id wajib diisi'], 400);
    }
} else {
    sendResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}
