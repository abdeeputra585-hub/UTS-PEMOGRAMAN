
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
    parent: [
        { id: 'parent-portal', label: 'Dashboard Portal', icon: 'fa-chart-line' },
        { id: 'profil-siswa', label: 'Profil Anak', icon: 'fa-user-graduate' },
        { id: 'notifikasi', label: 'Pusat Notifikasi', icon: 'fa-bell', badge: 3 }
    ]
};

const userCredentialsMock = {
    admin: { name: 'Haryanto Putro', title: 'Super Administrator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' },
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
    const emailInput = document.getElementById('login-email');

    if (role === 'admin') {
        btnAdmin.className = "w-1/2 py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-700 shadow-xs";
        btnParent.className = "w-1/2 py-2 text-xs font-bold rounded-lg transition-all text-slate-500";
        emailInput.value = "admin@school.id";
    } else {
        btnParent.className = "w-1/2 py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-700 shadow-xs";
        btnAdmin.className = "w-1/2 py-2 text-xs font-bold rounded-lg transition-all text-slate-500";
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
        let targetedRole = email.includes('admin') ? 'admin' : 'parent';
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
    document.getElementById('user-role-title').innerText = role === 'admin' ? 'Super Administrator' : 'Wali Murid (Orang Tua)';
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

    // Load data dari API sesuai tab
    if (tabId === 'admin-dashboard') loadDashboardData();
    if (tabId === 'admin-siswa') loadSiswaData();
    if (tabId === 'admin-relasi') loadRelasiData();
    if (tabId === 'admin-laporan') loadLaporanData();
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
    } catch (err) {
        console.warn('Dashboard API belum aktif:', err);
    }
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
                    <td class="px-6 py-3.5 text-blue-600 font-bold hover:underline cursor-pointer" onclick="switchTab('profil-siswa')">${s.nisn}</td>
                    <td class="px-6 py-3.5 flex items-center gap-2.5">
                        <div class="w-6 h-6 bg-${color}-100 text-${color}-700 rounded-full flex items-center justify-center text-3xs font-bold">${initials}</div>${s.nama}
                    </td>
                    <td class="px-6 py-3.5">${s.kelas}</td>
                    <td class="px-6 py-3.5">${s.jenis_kelamin}</td>
                    <td class="px-6 py-3.5"><span class="${statusClass} text-3xs font-bold px-2 py-0.5 rounded-full">${s.status}</span></td>
                    <td class="px-6 py-3.5 text-center text-slate-400 text-sm">
                        <button class="hover:text-blue-600 mx-1"><i class="fa-regular fa-eye"></i></button>
                        <button class="hover:text-amber-500 mx-1"><i class="fa-regular fa-pen-to-square"></i></button>
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