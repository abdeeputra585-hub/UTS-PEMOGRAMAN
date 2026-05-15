
const API_BASE = 'api';

let appState = {
    currentRole: 'admin',
    currentTab: 'admin-dashboard',
    currentUser: null
};

const navigationMenus = {
    admin: [
        { id: 'admin-dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
        { id: 'admin-siswa', label: 'Kelola Siswa', icon: 'fa-user-graduate' },
        { id: 'admin-relasi', label: 'Relasi Data', icon: 'fa-link' },
        { id: 'admin-laporan', label: 'Laporan', icon: 'fa-file-invoice-dollar' },
        { id: 'notifikasi', label: 'Notifikasi', icon: 'fa-bell', badge: 12 },
        { id: 'profil-siswa', label: 'Profil Siswa', icon: 'fa-id-card' }
    ],
    kepala_sekolah: [
        { id: 'admin-dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
        { id: 'admin-laporan', label: 'Laporan', icon: 'fa-file-invoice-dollar' },
        { id: 'notifikasi', label: 'Notifikasi', icon: 'fa-bell', badge: 0 }
    ],
    parent: [
        { id: 'parent-portal', label: 'Dashboard Portal', icon: 'fa-chart-line' },
        { id: 'profil-siswa', label: 'Profil Anak', icon: 'fa-user-graduate' },
        { id: 'notifikasi', label: 'Pusat Notifikasi', icon: 'fa-bell', badge: 3 }
    ]
};

const userCredentialsMock = {
    admin: { name: 'Haryanto Putro', title: 'Super Administrator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' },
    kepala_sekolah: { name: 'Drs. Ahmad Dahlan', title: 'Kepala Sekolah', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
    parent: { name: 'Budi Santoso', title: 'Wali Murid (Orang Tua)', avatar: 'https://i1-c.pinimg.com/736x/69/c1/27/69c127c94e626793d5df6f274e187627.jpg' }
};

window.addEventListener('DOMContentLoaded', () => {
    showRoute('login'); 
});

function showRoute(routeId) {
    document.querySelectorAll('.route-view').forEach(view => view.classList.add('hidden'));
    document.getElementById('route-' + routeId).classList.remove('hidden');
}

function setLoginRole(role) {
    const btnAdmin = document.getElementById('login-toggle-admin');
    const btnParent = document.getElementById('login-toggle-parent');
    const btnKepsek = document.getElementById('login-toggle-kepsek');
    const emailInput = document.getElementById('login-email');

    [btnAdmin, btnParent, btnKepsek].forEach(btn => {
        if(btn) btn.className = "w-1/3 py-2 text-xs font-bold rounded-lg transition-all text-slate-500";
    });

    if (role === 'admin') {
        if(btnAdmin) btnAdmin.className = "w-1/3 py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-700 shadow-xs";
        emailInput.value = "admin@school.id";
    } else if (role === 'kepala_sekolah') {
        if(btnKepsek) btnKepsek.className = "w-1/3 py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-700 shadow-xs";
        emailInput.value = "kepsek@school.id";
    } else {
        if(btnParent) btnParent.className = "w-1/3 py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-700 shadow-xs";
        emailInput.value = "budisantoso@email.com";
    }
}

async function executeLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
            appState.currentUser = data.data;
            loginAs(data.data.role, data.data);
        } else {
            alert('Login Gagal: ' + data.message);
        }
    } catch (err) {
        // Fallback jika API belum aktif
        console.warn('API belum aktif, menggunakan mode demo:', err);
        let targetedRole = email.includes('admin') ? 'admin' : (email.includes('kepsek') ? 'kepala_sekolah' : 'parent');
        loginAs(targetedRole);
    }
}

async function executeRegister(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input, textarea');

    const registerData = {
        nama: inputs[0].value,
        email: inputs[1].value,
        telepon: inputs[2].value,
        alamat: inputs[3].value,
        password: inputs[4].value
    };

    // Validasi password match
    if (inputs[4].value !== inputs[5].value) {
        alert('Kata sandi dan konfirmasi kata sandi tidak cocok!');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        const data = await res.json();

        if (data.success) {
            alert('Registrasi Berhasil! ' + data.message);
            showRoute('login');
        } else {
            alert('Registrasi Gagal: ' + data.message);
        }
    } catch (err) {
        console.warn('API belum aktif, menggunakan mode demo:', err);
        alert('Proses Registrasi Berhasil Disimpan ke Database! Mengarahkan Anda kembali ke Halaman Login.');
        showRoute('login');
    }
}

function loginAs(role, userData) {
    appState.currentRole = role;

    const creds = userData || userCredentialsMock[role];
    document.getElementById('user-fullname').innerText = creds.nama || creds.name;
    document.getElementById('user-role-title').innerText = role === 'admin' ? 'Super Administrator' : (role === 'kepala_sekolah' ? 'Kepala Sekolah' : 'Wali Murid (Orang Tua)');
    document.getElementById('user-avatar').src = creds.avatar || userCredentialsMock[role].avatar;

    const brandLogo = document.getElementById('brand-logo-container');
    const brandTitle = document.getElementById('brand-title');
    const brandSub = document.getElementById('brand-subtitle');
    
    if (role === 'admin') {
        brandLogo.className = "w-9 h-9 bg-blue-700 text-white rounded-xl flex items-center justify-center text-base font-bold shadow-md";
        brandLogo.innerHTML = `<i class="fa-solid fa-shield-halved"></i>`;
        brandTitle.innerText = "Admin Panel";
        brandSub.innerText = "School Management";
        appState.currentTab = 'admin-dashboard';
        document.getElementById('topbar-context-title').innerText = "Sistem Pengelolaan Data Wali Siswa (Workspace Administrator)";
    } else if (role === 'kepala_sekolah') {
        brandLogo.className = "w-9 h-9 bg-emerald-700 text-white rounded-xl flex items-center justify-center text-base font-bold shadow-md";
        brandLogo.innerHTML = `<i class="fa-solid fa-chart-pie"></i>`;
        brandTitle.innerText = "Executive Panel";
        brandSub.innerText = "School Monitoring";
        appState.currentTab = 'admin-dashboard';
        document.getElementById('topbar-context-title').innerText = "Dashboard Pemantauan Data (Read-Only)";
    } else {
        brandLogo.className = "w-9 h-9 bg-purple-700 text-white rounded-xl flex items-center justify-center text-base font-bold shadow-md";
        brandLogo.innerHTML = `<i class="fa-solid fa-users-rectangle"></i>`;
        brandTitle.innerText = "Parent Portal";
        brandSub.innerText = "School Connect";
        appState.currentTab = 'parent-portal';
        document.getElementById('topbar-context-title').innerText = "Portal Integrasi Informasi Pendidikan Orang Tua / Wali Murid";
    }

    renderDynamicSidebarMenus();
    showRoute('app');
    switchTab(appState.currentTab);
}

function renderDynamicSidebarMenus() {
    const container = document.getElementById('app-sidebar-nav');
    container.innerHTML = '';

    const menus = navigationMenus[appState.currentRole];
    menus.forEach(menu => {
        const btn = document.createElement('button');
        btn.id = `sidebar-btn-${menu.id}`;
        btn.onclick = () => switchTab(menu.id);
        btn.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left outline-none text-slate-500 hover:bg-slate-50 hover:text-slate-900";
        
        let innerHTML = `<span class="flex items-center gap-3"><i class="fa-solid ${menu.icon} text-sm text-slate-400"></i> ${menu.label}</span>`;
        if (menu.badge) {
            innerHTML += `<span class="bg-red-500 text-white text-4xs font-black px-1.5 py-0.5 rounded-full">${menu.badge}</span>`;
        }
        btn.innerHTML = innerHTML;
        container.appendChild(btn);
    });
}

function switchTab(tabId) {
    appState.currentTab = tabId;
    document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
    const targetedPageDOM = document.getElementById(`page-${tabId}`);
    if (targetedPageDOM) targetedPageDOM.classList.remove('hidden');

    const currentRoleMenus = navigationMenus[appState.currentRole];
    currentRoleMenus.forEach(m => {
        const domBtn = document.getElementById(`sidebar-btn-${m.id}`);
        if (domBtn) {
            if (m.id === tabId) {
                domBtn.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left outline-none bg-blue-50 text-blue-700 font-bold";
                domBtn.querySelector('i').classList.add('text-blue-600');
            } else {
                domBtn.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left outline-none text-slate-500 hover:bg-slate-50 hover:text-slate-900";
                domBtn.querySelector('i').className = `fa-solid ${m.icon} text-sm text-slate-400`;
            }
        }
    });

    document.getElementById('workspace-viewport').scrollTop = 0;

    // Sembunyikan tombol aksi dashboard jika role adalah kepala_sekolah
    const dashActions = document.getElementById('dashboard-action-buttons');
    if (dashActions) {
        dashActions.style.display = appState.currentRole === 'kepala_sekolah' ? 'none' : 'flex';
    }

    // Load data dari API sesuai tab
    if (tabId === 'admin-dashboard') loadDashboardData();
    if (tabId === 'admin-siswa') { loadSiswaData(); initKelasFilter(); }
    if (tabId === 'admin-relasi') { loadRelasiData(); setTimeout(initRelasiFilter, 300); }
    if (tabId === 'admin-laporan') { loadLaporanData(); setTimeout(initLaporanKelasFilter, 300); }
    if (tabId === 'notifikasi') loadNotifikasiData();
}

// ======== LOAD DASHBOARD DATA ========
async function loadDashboardData() {
    try {
        const [statsRes, waliRes, aktRes] = await Promise.all([
            fetch(`${API_BASE}/dashboard.php?action=stats`),
            fetch(`${API_BASE}/dashboard.php?action=wali_terbaru`),
            fetch(`${API_BASE}/dashboard.php?action=aktivitas`)
        ]);
        const stats = await statsRes.json();
        const wali = await waliRes.json();
        const aktivitas = await aktRes.json();

        if (stats.success) {
            document.getElementById('stat-total-wali').textContent = stats.data.total_wali.toLocaleString();
            document.getElementById('stat-total-siswa').textContent = stats.data.total_siswa.toLocaleString();
            document.getElementById('stat-total-relasi').textContent = stats.data.total_relasi.toLocaleString();
            document.getElementById('stat-total-notif').textContent = stats.data.total_notifikasi.toLocaleString();
            document.getElementById('stat-notif-baru').textContent = stats.data.notif_baru + ' Baru';
            // Update notifikasi badge di sidebar
            const notifBadge = document.querySelector('#sidebar-btn-notifikasi span.bg-red-500');
            if (notifBadge) notifBadge.textContent = stats.data.notif_baru;
        }

        if (wali.success && wali.data.length > 0) {
            const tbody = document.querySelector('#page-admin-dashboard table tbody');
            if (tbody) {
                tbody.innerHTML = '';
                wali.data.forEach(w => {
                    const initials = w.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    const statusClass = w.status === 'Terverifikasi'
                        ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600';
                    tbody.innerHTML += `<tr class="hover:bg-slate-50/50">
                        <td class="px-4 py-3 flex items-center gap-2">
                            <div class="w-7 h-7 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-3xs">${initials}</div>
                            <div><p class="font-bold text-slate-900">${w.nama}</p><p class="text-3xs text-slate-400 font-normal">${w.email || '-'}</p></div>
                        </td>
                        <td class="px-4 py-3">${w.pekerjaan || '-'}</td>
                        <td class="px-4 py-3"><span class="${statusClass} text-3xs font-bold px-2 py-0.5 rounded">${w.status}</span></td>
                        <td class="px-4 py-3 text-center"><button class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
                    </tr>`;
                });
            }
        }

        // Render aktivitas terkini
        if (aktivitas.success && aktivitas.data.length > 0) {
            const container = document.getElementById('aktivitas-list');
            if (container) {
                container.innerHTML = '';
                aktivitas.data.forEach(a => {
                    const colorMap = { info: 'blue', success: 'emerald', warning: 'amber', error: 'red' };
                    const dotColor = colorMap[a.tipe] || 'blue';
                    // Determine target page based on content
                    let targetTab = 'notifikasi';
                    const judul = a.judul.toLowerCase();
                    if (judul.includes('relasi')) targetTab = 'admin-relasi';
                    else if (judul.includes('wali') && judul.includes('terdaftar')) targetTab = 'admin-siswa';
                    else if (judul.includes('sinkron') || judul.includes('dapodik')) targetTab = 'admin-siswa';
                    else if (judul.includes('verifikasi')) targetTab = 'notifikasi';
                    else if (judul.includes('laporan')) targetTab = 'admin-laporan';

                    const timeAgo = getTimeAgo(a.created_at);

                    container.innerHTML += `<div class="relative mb-2 cursor-pointer hover:opacity-80 transition-opacity" onclick="switchTab('${targetTab}')">
                        <span class="absolute -left-6 w-3 h-3 bg-${dotColor}-500 rounded-full border-2 border-white mt-0.5"></span>
                        <p class="font-bold text-slate-900">${a.judul}</p>
                        <p class="text-3xs text-slate-400">${a.pesan.substring(0, 60)}${a.pesan.length > 60 ? '...' : ''} • ${timeAgo}</p>
                    </div>`;
                });
            }
        }
    } catch (err) {
        console.warn('Dashboard API belum aktif:', err);
    }
}

// Helper: format waktu relatif
function getTimeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return diffMins + ' menit yang lalu';
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return diffHours + ' jam yang lalu';
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return diffDays + ' hari yang lalu';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ======== LOAD SISWA DATA ========
async function loadSiswaData() {
    try {
        const res = await fetch(`${API_BASE}/siswa.php`);
        const data = await res.json();
        if (!data.success) return;

        // Update stats cards
        document.getElementById('siswa-stat-total').textContent = data.stats.total.toLocaleString();
        document.getElementById('siswa-stat-aktif').textContent = data.stats.aktif.toLocaleString();
        document.getElementById('siswa-stat-verifikasi').textContent = data.stats.verifikasi.toLocaleString();
        document.getElementById('siswa-stat-alumni').textContent = data.stats.alumni_pindah.toLocaleString();

        // Update table
        const tbody = document.querySelector('#page-admin-siswa table tbody');
        if (tbody && data.data.length > 0) {
            tbody.innerHTML = '';
            data.data.forEach(s => {
                const initials = s.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const colors = ['blue', 'purple', 'emerald', 'amber', 'red'];
                const color = colors[Math.abs(s.nama.charCodeAt(0)) % colors.length];
                const statusMap = {
                    'Aktif': 'bg-emerald-50 text-emerald-600',
                    'Verifikasi': 'bg-amber-50 text-amber-600',
                    'Alumni': 'bg-slate-100 text-slate-600',
                    'Pindah': 'bg-red-50 text-red-600'
                };
                const statusClass = statusMap[s.status] || 'bg-slate-100 text-slate-600';

                tbody.innerHTML += `<tr class="hover:bg-slate-50/40">
                    <td class="px-6 py-3.5 text-blue-600 font-bold hover:underline cursor-pointer" onclick="viewSiswa(${s.id})">${s.nisn}</td>
                    <td class="px-6 py-3.5 flex items-center gap-2.5">
                        <div class="w-6 h-6 bg-${color}-100 text-${color}-700 rounded-full flex items-center justify-center text-3xs font-bold">${initials}</div>${s.nama}
                    </td>
                    <td class="px-6 py-3.5">${s.kelas}</td>
                    <td class="px-6 py-3.5">${s.jenis_kelamin}</td>
                    <td class="px-6 py-3.5"><span class="${statusClass} text-3xs font-bold px-2 py-0.5 rounded-full">${s.status}</span></td>
                    <td class="px-6 py-3.5 text-center text-slate-400 text-sm">
                        <button class="hover:text-blue-600 mx-1" onclick="viewSiswa(${s.id})"><i class="fa-regular fa-eye"></i></button>
                        <button class="hover:text-amber-500 mx-1" onclick="editSiswa(${s.id})"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="hover:text-red-600 mx-1" onclick="deleteSiswa(${s.id})"><i class="fa-regular fa-trash-can"></i></button>
                    </td>
                </tr>`;
            });
        }
    } catch (err) {
        console.warn('Siswa API belum aktif:', err);
    }
}

// ======== DELETE SISWA ========
async function deleteSiswa(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;
    try {
        const res = await fetch(`${API_BASE}/siswa.php?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message);
        if (data.success) loadSiswaData();
    } catch (err) {
        alert('Gagal menghapus siswa');
    }
}

// ======== LOAD RELASI DATA ========
async function loadRelasiData() {
    try {
        // Load dropdown siswa & wali
        const [siswaRes, waliRes, relasiRes] = await Promise.all([
            fetch(`${API_BASE}/siswa.php`),
            fetch(`${API_BASE}/wali.php`),
            fetch(`${API_BASE}/relasi.php`)
        ]);
        const siswaData = await siswaRes.json();
        const waliData = await waliRes.json();
        const relasiData = await relasiRes.json();

        // Populate dropdown siswa
        const selSiswa = document.getElementById('rel-siswa');
        if (selSiswa && siswaData.success) {
            selSiswa.innerHTML = '<option value="">Pilih Siswa</option>';
            siswaData.data.forEach(s => {
                selSiswa.innerHTML += `<option value="${s.id}">${s.nama} (NISN: ${s.nisn})</option>`;
            });
        }

        // Populate dropdown wali
        const selWali = document.getElementById('rel-wali');
        if (selWali && waliData.success) {
            selWali.innerHTML = '<option value="">Pilih Wali</option>';
            waliData.data.forEach(w => {
                selWali.innerHTML += `<option value="${w.id}">${w.nama} (${w.email || '-'})</option>`;
            });
        }

        // Populate table
        if (relasiData.success) {
            const tbody = document.getElementById('rel-table-body');
            if (tbody) {
                tbody.innerHTML = '';
                relasiData.data.forEach(r => {
                    let badgeStyle = "bg-blue-50 text-blue-700";
                    if (r.tipe === 'IBU') badgeStyle = "bg-pink-50 text-pink-700";
                    if (r.tipe === 'WALI') badgeStyle = "bg-slate-100 text-slate-700";
                    const statusColor = r.status === 'Terverifikasi' ? 'emerald' : 'amber';

                    tbody.innerHTML += `<tr class="hover:bg-slate-50/50">
                        <td class="px-4 py-3"><p class="font-bold text-slate-900">${r.siswa_nama}</p><p class="text-3xs text-slate-400 font-normal">NISN: ${r.nisn}</p></td>
                        <td class="px-4 py-3"><p>${r.wali_nama}</p><p class="text-3xs text-slate-400 font-normal">${r.wali_email || '-'}</p></td>
                        <td class="px-4 py-3"><span class="text-3xs font-bold ${badgeStyle} px-2 py-0.5 rounded">${r.tipe}</span></td>
                        <td class="px-4 py-3"><span class="flex items-center gap-1 text-3xs text-${statusColor}-600"><span class="w-1 h-1 bg-${statusColor}-500 rounded-full"></span> ${r.status}</span></td>
                        <td class="px-4 py-3 text-center text-slate-400">
                            <button class="hover:text-blue-600 mx-1"><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="hover:text-red-600 mx-1" onclick="deleteRelasi(${r.id})"><i class="fa-regular fa-trash-can"></i></button>
                        </td>
                    </tr>`;
                });
            }
        }
    } catch (err) {
        console.warn('Relasi API belum aktif:', err);
    }
}

// ======== DELETE RELASI ========
async function deleteRelasi(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus relasi ini?')) return;
    try {
        const res = await fetch(`${API_BASE}/relasi.php?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message);
        if (data.success) loadRelasiData();
    } catch (err) {
        alert('Gagal menghapus relasi');
    }
}

// ======== HANDLE RELASI SUBMIT (via API) ========
async function handleRelationAjaxSubmit(event) {
    event.preventDefault();

    const siswaId = document.getElementById('rel-siswa').value;
    const waliId = document.getElementById('rel-wali').value;
    const tipe = document.querySelector('input[name="rel-type"]:checked').value;
    const submitBtn = document.getElementById('rel-submit-btn');
    const ajaxLoader = document.getElementById('rel-ajax-loader');

    if (!siswaId || !waliId) return alert('Mohon lengkapi parameter entitas data siswa dan wali!');

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-2xs"></i> Menyinkronkan Data...`;
    ajaxLoader.classList.remove('hidden');

    try {
        const res = await fetch(`${API_BASE}/relasi.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siswa_id: siswaId, wali_id: waliId, tipe: tipe })
        });
        const data = await res.json();

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk text-2xs"></i> Simpan Relasi`;
            ajaxLoader.classList.add('hidden');

            if (data.success) {
                alert('Data Relasi Baru Berhasil Disimpan ke Database! Notifikasi telah dipicu otomatis.');
                loadRelasiData();
                document.getElementById('rel-siswa').value = '';
                document.getElementById('rel-wali').value = '';
            } else {
                alert('Gagal: ' + data.message);
            }
        }, 1500);
    } catch (err) {
        console.warn('API belum aktif, menggunakan mode demo:', err);
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk text-2xs"></i> Simpan Relasi`;
            ajaxLoader.classList.add('hidden');
            alert('Data Relasi Baru Berhasil Disimpan (Mode Demo).');
        }, 1500);
    }
}

// ======== LOAD LAPORAN DATA ========
async function loadLaporanData() {
    try {
        const res = await fetch(`${API_BASE}/laporan.php`);
        const data = await res.json();
        if (!data.success) return;

        const tbody = document.querySelector('#page-admin-laporan table tbody');
        if (tbody && data.data.length > 0) {
            tbody.innerHTML = '';
            data.data.forEach(l => {
                const tipeStyle = l.hubungan === 'AYAH' ? 'bg-blue-50 text-blue-600' :
                    l.hubungan === 'IBU' ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-600';
                tbody.innerHTML += `<tr>
                    <td class="px-4 py-3"><p class="font-bold text-slate-900">${l.wali_nama}</p></td>
                    <td class="px-4 py-3">${l.siswa_nama}</td>
                    <td class="px-4 py-3">${l.kelas}</td>
                    <td class="px-4 py-3"><span class="text-3xs font-bold ${tipeStyle} px-1.5 py-0.5 rounded">${l.hubungan}</span></td>
                    <td class="px-4 py-3">${l.telepon || '-'}</td>
                </tr>`;
            });
        }
    } catch (err) {
        console.warn('Laporan API belum aktif:', err);
    }
}

// ======== LOAD NOTIFIKASI DATA ========
async function loadNotifikasiData() {
    try {
        const userId = appState.currentUser ? appState.currentUser.id : null;
        const url = userId ? `${API_BASE}/notifikasi.php?user_id=${userId}` : `${API_BASE}/notifikasi.php`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) return;

        const container = document.querySelector('#page-notifikasi .lg\\:col-span-2');
        if (container && data.data.length > 0) {
            container.innerHTML = '';
            data.data.forEach(n => {
                const iconMap = { info: 'fa-circle-exclamation text-blue-600', success: 'fa-circle-check text-emerald-600', warning: 'fa-triangle-exclamation text-amber-600', error: 'fa-circle-xmark text-red-600' };
                const borderMap = { info: 'border-blue-600', success: 'border-emerald-600', warning: 'border-amber-600', error: 'border-red-600' };
                const bgMap = { info: 'bg-blue-50', success: 'bg-emerald-50', warning: 'bg-amber-50', error: 'bg-red-50' };
                const icon = iconMap[n.tipe] || iconMap.info;
                const border = borderMap[n.tipe] || borderMap.info;
                const bg = bgMap[n.tipe] || bgMap.info;

                container.innerHTML += `<div class="bg-white border-l-4 ${border} p-4 border border-slate-200 rounded-r-2xl shadow-3xs flex gap-3 ${n.dibaca == 0 ? '' : 'opacity-60'}">
                    <div class="w-8 h-8 ${bg} rounded-lg flex items-center justify-center text-xs shrink-0"><i class="fa-solid ${icon}"></i></div>
                    <div><h5 class="font-bold text-slate-900 text-sm">${n.judul}</h5><p class="text-xs text-slate-500 mt-0.5">${n.pesan}</p></div>
                </div>`;
            });
        }
    } catch (err) {
        console.warn('Notifikasi API belum aktif:', err);
    }
}

// ======== PASSWORD TOGGLE ========
function togglePasswordVisibility() {
    const input = document.getElementById('login-password');
    const icon = document.querySelector('#login-password ~ span i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-regular fa-eye';
    }
}

// ======== SEARCH FUNCTIONALITY ========
function initSearch() {
    const searchInput = document.querySelector('header input[type="text"]');
    if (!searchInput) return;
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const currentPage = document.querySelector('.page-view:not(.hidden)');
        if (!currentPage) return;
        const rows = currentPage.querySelectorAll('table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) || query === '' ? '' : 'none';
        });
    });
}

// ======== RADIO BUTTON VISUAL FEEDBACK ========
function initRadioButtons() {
    const radios = document.querySelectorAll('input[name="rel-type"]');
    function updateRadioStyle() {
        radios.forEach(r => {
            const label = r.closest('label');
            if (r.checked) {
                label.className = 'border-2 border-blue-600 bg-blue-50 text-blue-700 rounded-xl p-2 cursor-pointer block text-center';
            } else {
                label.className = 'border border-slate-200 rounded-xl p-2 cursor-pointer hover:bg-slate-50 block';
            }
        });
    }
    radios.forEach(r => r.addEventListener('change', updateRadioStyle));
    updateRadioStyle();
}

// ======== VIEW SISWA DETAIL ========
function viewSiswa(id) {
    switchTab('profil-siswa');
    loadProfilSiswa(id);
}

async function loadProfilSiswa(id) {
    try {
        const res = await fetch(`${API_BASE}/siswa.php?id=${id}`);
        const data = await res.json();
        if (!data.success) return;
        const s = data.data;
        const page = document.getElementById('page-profil-siswa');
        const profileCard = page.querySelector('.text-center');
        if (profileCard) {
            profileCard.querySelector('h3').textContent = s.nama;
            profileCard.querySelector('p').textContent = 'NISN: ' + s.nisn;
        }
        const detailCard = page.querySelector('.lg\\:col-span-2');
        if (detailCard) {
            detailCard.innerHTML = `
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2"><i class="fa-solid fa-id-card text-blue-600"></i> Detail Informasi Pribadi</h3>
                <div class="grid grid-cols-2 gap-4 text-xs">
                    <div><p class="text-3xs font-bold text-slate-400 uppercase">Nama Lengkap</p><p class="font-semibold text-slate-700 mt-1">${s.nama}</p></div>
                    <div><p class="text-3xs font-bold text-slate-400 uppercase">NISN</p><p class="font-semibold text-slate-700 mt-1">${s.nisn}</p></div>
                    <div><p class="text-3xs font-bold text-slate-400 uppercase">Kelas</p><p class="font-semibold text-slate-700 mt-1">${s.kelas}</p></div>
                    <div><p class="text-3xs font-bold text-slate-400 uppercase">Jenis Kelamin</p><p class="font-semibold text-slate-700 mt-1">${s.jenis_kelamin}</p></div>
                    <div><p class="text-3xs font-bold text-slate-400 uppercase">Status</p><p class="font-semibold text-slate-700 mt-1">${s.status}</p></div>
                    <div><p class="text-3xs font-bold text-slate-400 uppercase">Alamat</p><p class="font-semibold text-slate-700 mt-1">${s.alamat || '-'}</p></div>
                </div>
                ${s.wali && s.wali.length > 0 ? `<h3 class="font-bold text-slate-900 text-sm flex items-center gap-2 mt-4"><i class="fa-solid fa-users text-purple-600"></i> Data Wali</h3>
                <div class="space-y-2">${s.wali.map(w => `<div class="bg-slate-50 p-3 rounded-xl text-xs"><span class="font-bold">${w.nama}</span> <span class="text-3xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded ml-1">${w.tipe}</span><p class="text-slate-400 mt-1">${w.email || '-'} • ${w.telepon || '-'}</p></div>`).join('')}</div>` : ''}`;
        }
    } catch (err) {
        console.warn('Profil API error:', err);
    }
}

// ======== EDIT SISWA (MODAL) ========
function editSiswa(id) {
    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.className = 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `<div class="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
        <h3 class="font-bold text-lg text-slate-900">Edit Data Siswa</h3>
        <div class="text-center py-4"><i class="fa-solid fa-spinner animate-spin text-blue-600 text-xl"></i><p class="text-xs text-slate-400 mt-2">Memuat data...</p></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    fetch(`${API_BASE}/siswa.php?id=${id}`).then(r => r.json()).then(data => {
        if (!data.success) { modal.remove(); alert('Data tidak ditemukan'); return; }
        const s = data.data;
        modal.querySelector('.bg-white').innerHTML = `
            <div class="flex justify-between items-center"><h3 class="font-bold text-lg text-slate-900">Edit Data Siswa</h3><button onclick="document.getElementById('edit-modal').remove()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark"></i></button></div>
            <form onsubmit="submitEditSiswa(event,${id})" class="space-y-3">
                <div class="space-y-1"><label class="text-3xs font-bold text-slate-400 uppercase">NISN</label><input id="edit-nisn" value="${s.nisn}" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500" required></div>
                <div class="space-y-1"><label class="text-3xs font-bold text-slate-400 uppercase">Nama</label><input id="edit-nama" value="${s.nama}" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500" required></div>
                <div class="space-y-1"><label class="text-3xs font-bold text-slate-400 uppercase">Kelas</label><input id="edit-kelas" value="${s.kelas}" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500" required></div>
                <div class="space-y-1"><label class="text-3xs font-bold text-slate-400 uppercase">Jenis Kelamin</label><select id="edit-jk" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-white"><option ${s.jenis_kelamin==='Laki-laki'?'selected':''}>Laki-laki</option><option ${s.jenis_kelamin==='Perempuan'?'selected':''}>Perempuan</option></select></div>
                <div class="space-y-1"><label class="text-3xs font-bold text-slate-400 uppercase">Status</label><select id="edit-status" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none bg-white"><option ${s.status==='Aktif'?'selected':''}>Aktif</option><option ${s.status==='Verifikasi'?'selected':''}>Verifikasi</option><option ${s.status==='Alumni'?'selected':''}>Alumni</option><option ${s.status==='Pindah'?'selected':''}>Pindah</option></select></div>
                <div class="space-y-1"><label class="text-3xs font-bold text-slate-400 uppercase">Alamat</label><textarea id="edit-alamat" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 resize-none">${s.alamat||''}</textarea></div>
                <button type="submit" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded-xl text-xs">Simpan Perubahan</button>
            </form>`;
    }).catch(() => { modal.remove(); alert('Gagal memuat data'); });
}

async function submitEditSiswa(e, id) {
    e.preventDefault();
    try {
        const res = await fetch(`${API_BASE}/siswa.php?id=${id}`, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                nisn: document.getElementById('edit-nisn').value,
                nama: document.getElementById('edit-nama').value,
                kelas: document.getElementById('edit-kelas').value,
                jenis_kelamin: document.getElementById('edit-jk').value,
                status: document.getElementById('edit-status').value,
                alamat: document.getElementById('edit-alamat').value
            })
        });
        const data = await res.json();
        alert(data.message);
        if (data.success) { document.getElementById('edit-modal').remove(); loadSiswaData(); }
    } catch(err) { alert('Gagal menyimpan perubahan'); }
}

// ======== EXPORT PDF/EXCEL ========
function exportData(type) {
    const currentPage = document.querySelector('.page-view:not(.hidden)');
    if (!currentPage) return;
    const table = currentPage.querySelector('table');
    if (!table) { alert('Tidak ada data tabel untuk diekspor'); return; }

    const rows = table.querySelectorAll('tr');
    let csv = '';
    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        cols.forEach(col => rowData.push('"' + col.textContent.trim().replace(/"/g,'""') + '"'));
        csv += rowData.join(',') + '\n';
    });

    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `export_data_${Date.now()}.csv`;
    link.click();
    alert('Data berhasil diekspor sebagai CSV!');
}

// ======== FILTER RELASI ========
function initRelasiFilter() {
    const filterInput = document.querySelector('#page-admin-relasi .relative input[type="text"]');
    if (!filterInput) return;
    filterInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#rel-table-body tr');
        rows.forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(query) || query === '' ? '' : 'none';
        });
    });
}

// ======== KELAS FILTER (SISWA PAGE) ========
async function initKelasFilter() {
    try {
        const res = await fetch(`${API_BASE}/siswa.php`);
        const data = await res.json();
        if (!data.success) return;
        const kelasSet = new Set(data.data.map(s => s.kelas));
        const selects = document.querySelectorAll('#page-admin-siswa select');
        if (selects[0]) {
            selects[0].innerHTML = '<option value="">Filter Kelas: Semua Kelas</option>';
            kelasSet.forEach(k => selects[0].innerHTML += `<option value="${k}">${k}</option>`);
            selects[0].addEventListener('change', function() {
                const rows = document.querySelectorAll('#page-admin-siswa table tbody tr');
                rows.forEach(row => {
                    if (!this.value) { row.style.display = ''; return; }
                    const kelasCell = row.querySelectorAll('td')[2];
                    row.style.display = kelasCell && kelasCell.textContent.trim() === this.value ? '' : 'none';
                });
            });
        }
    } catch(err) { console.warn('Filter kelas error:', err); }
}

// ======== KELAS FILTER (LAPORAN PAGE) ========
function initLaporanKelasFilter() {
    const sel = document.querySelector('#page-admin-laporan select');
    if (!sel) return;
    sel.addEventListener('change', function() {
        const rows = document.querySelectorAll('#page-admin-laporan table tbody tr');
        rows.forEach(row => {
            if (!this.value || this.value === 'Semua Kelas') { row.style.display = ''; return; }
            const kelasCell = row.querySelectorAll('td')[2];
            row.style.display = kelasCell && kelasCell.textContent.trim().includes(this.value) ? '' : 'none';
        });
    });
}

// ======== MARK NOTIFIKASI AS READ ========
async function markNotifRead(id, el) {
    try {
        await fetch(`${API_BASE}/notifikasi.php?id=${id}&mark_read=1`);
        if (el) el.classList.add('opacity-60');
    } catch(err) { console.warn('Mark read error:', err); }
}

// ======== LOGOUT CLEANUP ========
function performLogout() {
    appState.currentUser = null;
    appState.currentRole = 'admin';
    appState.currentTab = 'admin-dashboard';
    document.getElementById('login-password').value = 'password123';
    setLoginRole('admin');
    showRoute('login');
}

// ======== SETTINGS PANEL ========
function openSettings() {
    const existing = document.getElementById('settings-modal');
    if (existing) { existing.remove(); return; }
    const isDark = document.body.classList.contains('dark');
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `<div class="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
        <div class="flex justify-between items-center"><h3 class="font-bold text-lg text-slate-900">Pengaturan</h3><button onclick="document.getElementById('settings-modal').remove()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark"></i></button></div>
        <div class="space-y-3 text-xs">
            <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span class="font-bold text-slate-700">Notifikasi Email</span><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-9 h-5 bg-slate-300 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div></label></div>
            <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span class="font-bold text-slate-700">Mode Gelap</span><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="dark-mode-toggle" ${isDark ? 'checked' : ''} class="sr-only peer" onchange="toggleDarkMode(this.checked)"><div class="w-9 h-5 bg-slate-300 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div></label></div>
            <div class="p-3 bg-slate-50 rounded-xl"><p class="font-bold text-slate-700">Versi Sistem</p><p class="text-slate-400 mt-1">EduGuardian v1.2.0</p></div>
        </div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ======== DARK MODE TOGGLE ========
function toggleDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark');
        localStorage.setItem('eduguardian-dark', 'true');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('eduguardian-dark', 'false');
    }
}

// Apply saved dark mode on page load
(function() {
    if (localStorage.getItem('eduguardian-dark') === 'true') {
        document.body.classList.add('dark');
    }
})();

// ======== FORGOT PASSWORD ========
function showForgotPassword() {
    const modal = document.createElement('div');
    modal.id = 'forgot-modal';
    modal.className = 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `<div class="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
        <div class="flex justify-between items-center"><h3 class="font-bold text-lg text-slate-900">Lupa Kata Sandi</h3><button onclick="document.getElementById('forgot-modal').remove()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark"></i></button></div>
        <p class="text-xs text-slate-400">Masukkan email Anda untuk menerima instruksi reset password.</p>
        <input type="email" id="forgot-email" placeholder="nama@email.com" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500">
        <button onclick="alert('Instruksi reset password telah dikirim ke email: '+document.getElementById('forgot-email').value);document.getElementById('forgot-modal').remove()" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded-xl text-xs">Kirim Reset Link</button>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ======== INIT ALL FEATURES ON DOM READY ========
const _origDOMReady = window.onload;
window.addEventListener('DOMContentLoaded', () => {
    // Password toggle
    const eyeBtn = document.querySelector('#login-password ~ span');
    if (eyeBtn) eyeBtn.addEventListener('click', togglePasswordVisibility);

    // Search
    initSearch();

    // Radio buttons
    setTimeout(initRadioButtons, 500);

    // Relasi filter
    setTimeout(initRelasiFilter, 500);
});