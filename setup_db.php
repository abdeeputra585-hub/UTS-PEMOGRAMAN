<?php
require_once __DIR__ . '/api/config.php';

$sql = "CREATE TABLE IF NOT EXISTS kehadiran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_id INT NOT NULL,
    tanggal DATE NOT NULL,
    status ENUM('Hadir', 'Izin', 'Sakit', 'Alpa') NOT NULL,
    keterangan VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
) ENGINE=InnoDB;";

if ($conn->query($sql) === TRUE) {
    echo "Tabel kehadiran berhasil dibuat atau sudah ada.\n";
    
    $res = $conn->query("SELECT COUNT(*) as count FROM kehadiran");
    $row = $res->fetch_assoc();
    if ($row['count'] == 0) {

        $insert = "INSERT INTO kehadiran (siswa_id, tanggal, status, keterangan) VALUES 
        (1, CURDATE() - INTERVAL 1 DAY, 'Hadir', ''),
        (1, CURDATE() - INTERVAL 2 DAY, 'Hadir', ''),
        (1, CURDATE() - INTERVAL 3 DAY, 'Sakit', 'Demam'),
        (1, CURDATE() - INTERVAL 4 DAY, 'Hadir', ''),
        (1, CURDATE() - INTERVAL 5 DAY, 'Hadir', ''),
        (2, CURDATE() - INTERVAL 1 DAY, 'Hadir', ''),
        (2, CURDATE() - INTERVAL 2 DAY, 'Izin', 'Acara keluarga'),
        (3, CURDATE() - INTERVAL 1 DAY, 'Alpa', ''),
        (4, CURDATE() - INTERVAL 1 DAY, 'Hadir', ''),
        (5, CURDATE() - INTERVAL 1 DAY, 'Hadir', ''),
        (6, CURDATE() - INTERVAL 1 DAY, 'Hadir', '')";
        
        if ($conn->query($insert) === TRUE) {
            echo "Data sampel kehadiran berhasil ditambahkan.\n";
        } else {
            echo "Gagal menambahkan data sampel: " . $conn->error . "\n";
        }
    }
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

$conn->close();
?>
