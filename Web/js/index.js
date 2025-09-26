
/*******************
  FE main JS for BE at http://localhost:5000/api
  - CRUD pages for Patients, Doctors, Rooms, Appointments,
    MedicalRecords, Prescriptions (with Drugs), Tests, MedicalImages
  - Auth: register / login (JWT stored in localStorage)
********************/

const API_BASE = "http://localhost:5232/api";
document.getElementById('api-url').innerText = API_BASE;

let state = {
    token: localStorage.getItem('token') || null,
    currentUser: localStorage.getItem('username') || null
};

// set auth header helper
function authHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (state.token) h['Authorization'] = 'Bearer ' + state.token;
    return h;
}

/* ---------- Routing / Render ---------- */
function showPage(page) {
    console.log('showPage called with:', page, 'Token:', state.token, 'User:', state.currentUser); // Debug
    const logged = !!state.currentUser; // Dùng currentUser thay vì token
    document.getElementById('btn-login').style.display = logged ? 'none' : '';
    document.getElementById('btn-register').style.display = logged ? 'none' : '';
    document.getElementById('user-info').style.display = logged ? '' : 'none';
    if (logged) document.getElementById('username').innerText = state.currentUser || '';

    // Ẩn nav nếu chưa login
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = logged ? '' : 'none';

    // Nếu chưa login, chỉ cho phép login/register
    if (!logged && page !== 'login' && page !== 'register') {
        console.log('Redirecting to not logged in');
        renderNotLoggedIn();
        return;
    }

    // route
    console.log('Rendering page:', page);
    switch (page) {
        case 'dashboard': renderDashboard(); break;
        case 'patients': renderPatients(); break;
        case 'doctors': renderDoctors(); break;
        case 'rooms': renderRooms(); break;
        case 'appointments': renderAppointments(); break;
        case 'medicalrecords': renderMedicalRecords(); break;
        case 'prescriptions': renderPrescriptions(); break;
        case 'tests': renderTests(); break;
        case 'images': renderImages(); break;
        case 'login': renderLogin(); break;
        case 'register': renderRegister(); break;
        default: renderDashboard(); break;
    }
}

function renderNotLoggedIn() {
    const root = document.getElementById('content');
    root.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, 'Bạn chưa đăng nhập'));
    card.appendChild(el('p', {}, 'Vui lòng đăng nhập để truy cập chức năng quản lý.'));
    card.appendChild(el('button', {
        class: 'btn primary',
        on: { click: () => showPage('login') }
    }, 'Đi đến Đăng nhập'));
    root.appendChild(card);
}

// initial
if (state.currentUser) {
    showPage('dashboard');
} else {
    showPage('login');
}

/* ---------- Utilities ---------- */
function el(tag, attrs = {}, inner = '') {
    const e = document.createElement(tag);
    for (const k in attrs) {
        if (k === 'on') { Object.entries(attrs.on).forEach(([ev, fn]) => e.addEventListener(ev, fn)); continue; }
        if (k === 'html') { e.innerHTML = attrs[k]; continue; }
        e.setAttribute(k, attrs[k]);
    }
    if (inner) e.innerHTML = inner;
    return e;
}

async function apiFetch(path, opts = {}) {
    const headers = opts.headers || {};
    if (!headers['Content-Type'] && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
    const res = await fetch(API_BASE + path, { ...opts, headers });
    if (res.status === 401) {
        alert('Unauthorized - please login again');
        logout();
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'API error ' + res.status);
    }
    // try parse JSON, else return text
    const txt = await res.text();
    try { return JSON.parse(txt); } catch (e) { return txt; }
}

/* ---------- AUTH ---------- */
function renderLogin() {
    const root = document.getElementById('content');
    root.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, 'Đăng nhập'));
    card.appendChild(el('div', { class: 'notice' }, 'Dùng tài khoản đã đăng ký (demo).'));
    const fUser = el('input', { placeholder: 'username', id: 'login-username' });
    const fPass = el('input', { type: 'password', placeholder: 'password', id: 'login-password' });
    card.appendChild(el('div', { class: 'form-row' }, ''));
    card.querySelector('.form-row').appendChild(fUser);
    card.querySelector('.form-row').appendChild(fPass);

    const btn = el('button', {
        class: 'btn primary',
        on: {
            click: async () => {
                const username = fUser.value.trim();
                const password = fPass.value.trim();
                if (!username || !password) {
                    alert('Nhập đủ');
                    return;
                }
                try {
                    const res = await fetch(API_BASE + '/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, passwordHash: password })
                    });
                    if (!res.ok) {
                        const t = await res.text();
                        alert('Login failed: ' + t);
                        return;
                    }
                    const data = await res.json();
                    console.log('Login response:', data);
                    state.currentUser = data.user; // Lấy user từ response
                    localStorage.setItem('username', data.user);
                    console.log('State after login:', state);
                    showPage('dashboard');
                } catch (err) {
                    alert('Login error: ' + err.message);
                }
            }
        },
        inner: 'Login'
    });

    card.appendChild(btn);
    root.appendChild(card);
}

function renderRegister() {
    const root = document.getElementById('content');
    root.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, 'Đăng ký'));
    const u = el('input', { placeholder: 'username', id: 'reg-username' });
    const p = el('input', { placeholder: 'password', id: 'reg-password', type: 'password' });
    const role = el('select', { id: 'reg-role' });
    role.innerHTML = `<option value="User">User</option><option value="Admin">Admin</option>`;
    card.appendChild(el('div', { class: 'form-row' }));
    card.querySelector('.form-row').appendChild(u);
    card.querySelector('.form-row').appendChild(p);
    card.appendChild(el('div', { class: 'form-row' }));
    card.querySelectorAll('.form-row')[1].appendChild(role);

    const btn = el('button', {
        class: 'btn primary', on: {
            click: async () => {
                const username = u.value.trim(), password = p.value.trim(), r = role.value;
                if (!username || !password) { alert('Nhập đủ'); return; }
                try {
                    const res = await fetch(API_BASE + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, passwordHash: password, role: r }) });
                    if (!res.ok) { const t = await res.text(); alert('Register failed: ' + t); return; }
                    alert('Đăng ký thành công. Đăng nhập để tiếp tục.');
                    showPage('login');
                } catch (err) { alert('Register error: ' + err.message); }
            }
        }, inner: 'Register'
    });

    card.appendChild(btn);
    root.appendChild(card);
}

function logout() {
    state.token = null;
    state.currentUser = null;
    localStorage.removeItem('username');
    showPage('login');
}

/* ---------- DASHBOARD ---------- */
async function renderDashboard() {
    console.log('Rendering dashboard, Token:', state.token); // Debug
    const root = document.getElementById('content');
    root.innerHTML = '';
    const c = el('div', { class: 'card' });
    c.appendChild(el('h2', {}, 'Dashboard'));
    c.appendChild(el('p', {}, 'Chọn menu bên trên để quản lý các thực thể.'));

    // quick stats
    const st = el('div', { class: 'card' });
    st.appendChild(el('h3', {}, 'Thống kê nhanh (tải từ API)'));
    const ul = el('ul', {});
    st.appendChild(ul);
    root.appendChild(c);
    root.appendChild(st);

    try {
        const [patients, doctors, rooms, appointments] = await Promise.all([
            apiFetch('/patients'),
            apiFetch('/doctors'),
            apiFetch('/rooms'),
            apiFetch('/appointments')
        ]);
        ul.innerHTML = `<li>Bệnh nhân: <b>${patients.length}</b></li>
      <li>Bác sĩ: <b>${doctors.length}</b></li>
      <li>Phòng: <b>${rooms.length}</b></li>
      <li>Lịch hẹn: <b>${appointments.length}</b></li>`;
    } catch (err) {
        ul.innerHTML = `<li class="small">Không thể tải thống kê: ${err.message}</li>`;
    }
}

/* ---------- CRUD: PATIENTS ---------- */
async function renderPatients() {
    const root = document.getElementById('content'); root.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, 'Quản lý Bệnh nhân'));
    card.appendChild(el('div', { class: 'controls' }));
    const controls = card.querySelector('.controls');
    const btnAdd = el('button', { class: 'btn primary', on: { click: () => patientForm() } }, 'Thêm bệnh nhân');
    controls.appendChild(btnAdd);
    const listWrap = el('div', { id: 'patients-list' });
    card.appendChild(listWrap);
    root.appendChild(card);
    await loadPatients();
}

async function loadPatients() {
    const wrap = document.getElementById('patients-list'); wrap.innerHTML = '';
    try {
        const patients = await apiFetch('/patients');
        if (!patients || patients.length === 0) { wrap.innerHTML = '<p class="small">Chưa có bản ghi</p>'; return; }
        const table = el('table', { class: 'table' });
        table.innerHTML = `<thead><tr><th>Họ tên</th><th>Ngày sinh</th><th>Giới tính</th><th>Phone</th><th>Địa chỉ</th><th></th></tr></thead>`;
        const tbody = el('tbody');
        for (const p of patients) {
            const tr = el('tr');
            tr.innerHTML = `<td>${escapeHtml(p.name || '')}</td>
        <td>${p.dob ? new Date(p.dob).toLocaleDateString() : ''}</td>
        <td>${escapeHtml(p.gender || '')}</td>
        <td>${escapeHtml(p.phone || '')}</td>
        <td>${escapeHtml(p.address || '')}</td>`;
            const tdOps = el('td');
            const btnE = el('button', { class: 'btn', on: { click: () => patientForm(p) } }, 'Sửa');
            const btnD = el('button', { class: 'btn', on: { click: () => deletePatient(p._id || p.id || p.Id) } }, 'Xóa');
            tdOps.appendChild(btnE); tdOps.appendChild(btnD);
            tr.appendChild(tdOps);
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        wrap.appendChild(table);
    } catch (err) {
        wrap.innerHTML = `<div class="notice">Lỗi tải bệnh nhân: ${err.message}</div>`;
    }
}

function patientForm(patient = null) {
    const root = document.getElementById('content'); root.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, patient ? 'Sửa Bệnh nhân' : 'Thêm Bệnh nhân'));
    const name = el('input', { placeholder: 'Họ tên', value: patient?.name || '' });
    const dob = el('input', { type: 'date', value: patient?.dob ? new Date(patient.dob).toISOString().slice(0, 10) : '' });
    const gender = el('select'); gender.innerHTML = `<option value="">--Chọn--</option><option value="Male">Nam</option><option value="Female">Nữ</option>`;
    if (patient?.gender) gender.value = patient.gender;
    const phone = el('input', { placeholder: 'Số điện thoại', value: patient?.phone || '' });
    const address = el('input', { placeholder: 'Địa chỉ', value: patient?.address || '' });

    card.appendChild(el('div', { class: 'form-row' })); card.querySelector('.form-row').appendChild(name);
    card.appendChild(el('div', { class: 'form-row' })); card.querySelectorAll('.form-row')[1].appendChild(dob);
    card.querySelectorAll('.form-row')[1].appendChild(gender);
    card.appendChild(el('div', { class: 'form-row' })); card.querySelectorAll('.form-row')[2].appendChild(phone); card.querySelectorAll('.form-row')[2].appendChild(address);

    const btnSave = el('button', {
        class: 'btn primary', on: {
            click: async () => {
                const payload = {
                    name: name.value.trim(),
                    dob: dob.value ? new Date(dob.value).toISOString() : null,
                    gender: gender.value,
                    phone: phone.value.trim(),
                    address: address.value.trim()
                };
                try {
                    if (patient && (patient._id || patient.id || patient.Id)) {
                        const id = patient._id || patient.id || patient.Id;
                        await apiFetch(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                        alert('Updated');
                    } else {
                        await apiFetch('/patients', { method: 'POST', body: JSON.stringify(payload) });
                        alert('Created');
                    }
                    showPage('patients');
                } catch (err) { alert('Lỗi lưu: ' + err.message); }
            }
        }, inner: 'Lưu'
    });

    card.appendChild(btnSave);
    card.appendChild(el('button', { class: 'btn', on: { click: () => showPage('patients') } }, 'Hủy'));
    root.appendChild(card);
}

async function deletePatient(id) {
    if (!confirm('Xóa bệnh nhân?')) return;
    try {
        await apiFetch(`/patients/${id}`, { method: 'DELETE' });
        await loadPatients();
    } catch (err) { alert('Lỗi xóa: ' + err.message); }
}

/* ---------- CRUD: DOCTORS (pattern giống patients) ---------- */
async function renderDoctors() {
    const root = document.getElementById('content'); root.innerHTML = '';
    const card = el('div', { class: 'card' });
    card.appendChild(el('h2', {}, 'Quản lý Bác sĩ'));
    card.appendChild(el('div', { class: 'controls' }));
    card.querySelector('.controls').appendChild(el('button', { class: 'btn primary', on: { click: () => doctorForm() } }, 'Thêm bác sĩ'));
    card.appendChild(el('div', { id: 'doctors-list' }));
    root.appendChild(card);
    await loadDoctors();
}
async function loadDoctors() {
    const wrap = document.getElementById('doctors-list'); wrap.innerHTML = '';
    try {
        const doctors = await apiFetch('/doctors');
        if (!doctors.length) { wrap.innerHTML = '<p class="small">Chưa có bản ghi</p>'; return; }
        const table = el('table', { class: 'table' });
        table.innerHTML = `<thead><tr><th>Họ tên</th><th>Chuyên khoa</th><th>Trình độ</th><th>Phone</th><th></th></tr></thead>`;
        const tb = el('tbody');
        for (const d of doctors) {
            const tr = el('tr');
            tr.innerHTML = `<td>${escapeHtml(d.name || '')}</td>
                      <td>${escapeHtml(d.specialty || '')}</td>
                      <td>${escapeHtml(d.degree || '')}</td>
                      <td>${escapeHtml(d.phone || '')}</td>`;
            const td = el('td');
            td.appendChild(el('button', { class: 'btn', on: { click: () => doctorForm(d) } }, 'Sửa'));
            td.appendChild(el('button', { class: 'btn', on: { click: () => deleteDoctor(d._id || d.id || d.Id) } }, 'Xóa'));
            tr.appendChild(td); tb.appendChild(tr);
        }
        table.appendChild(tb); wrap.appendChild(table);
    } catch (err) { wrap.innerHTML = `<div class="notice">Lỗi tải: ${err.message}</div>`; }
}
function doctorForm(doc = null) {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' });
    c.appendChild(el('h2', {}, doc ? 'Sửa bác sĩ' : 'Thêm bác sĩ'));
    const name = el('input', { placeholder: 'Họ tên', value: doc?.name || '' });
    const specialty = el('input', { placeholder: 'Chuyên khoa', value: doc?.specialty || '' });
    const degree = el('input', { placeholder: 'Trình độ', value: doc?.degree || '' });
    const phone = el('input', { placeholder: 'Phone', value: doc?.phone || '' });
    c.appendChild(el('div', { class: 'form-row' })); c.querySelector('.form-row').appendChild(name);
    c.appendChild(el('div', { class: 'form-row' })); c.querySelectorAll('.form-row')[1].appendChild(specialty);
    c.querySelectorAll('.form-row')[1].appendChild(degree);
    c.appendChild(el('div', { class: 'form-row' })); c.querySelectorAll('.form-row')[2].appendChild(phone);
    c.appendChild(el('button', {
        class: 'btn primary', on: {
            click: async () => {
                const payload = { name: name.value, specialty: specialty.value, degree: degree.value, phone: phone.value };
                try {
                    if (doc && (doc._id || doc.id || doc.Id)) {
                        const id = doc._id || doc.id || doc.Id;
                        await apiFetch(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                        alert('Updated'); showPage('doctors');
                    } else {
                        await apiFetch('/doctors', { method: 'POST', body: JSON.stringify(payload) });
                        alert('Created'); showPage('doctors');
                    }
                } catch (err) { alert('Lỗi lưu: ' + err.message); }
            }
        }, inner: 'Lưu'
    }));
    c.appendChild(el('button', { class: 'btn', on: { click: () => showPage('doctors') } }, 'Hủy'));
    root.appendChild(c);
}
async function deleteDoctor(id) {
    if (!confirm('Xóa bác sĩ?')) return;
    try { await apiFetch(`/doctors/${id}`, { method: 'DELETE' }); loadDoctors(); } catch (err) { alert(err.message); }
}

/* ---------- CRUD: ROOMS ---------- */
async function renderRooms() {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' });
    c.appendChild(el('h2', {}, 'Quản lý Phòng khám'));
    c.appendChild(el('div', { class: 'controls' }));
    c.querySelector('.controls').appendChild(el('button', { class: 'btn primary', on: { click: () => roomForm() } }, 'Thêm phòng'));
    c.appendChild(el('div', { id: 'rooms-list' })); root.appendChild(c);
    await loadRooms();
}
async function loadRooms() {
    const wrap = document.getElementById('rooms-list'); wrap.innerHTML = '';
    try {
        const rooms = await apiFetch('/rooms');
        if (!rooms.length) { wrap.innerHTML = '<p class="small">Chưa có bản ghi</p>'; return; }
        const t = el('table', { class: 'table' });
        t.innerHTML = `<thead><tr><th>Số phòng</th><th>Loại</th><th>Trạng thái</th><th></th></tr></thead>`;
        const tb = el('tbody');
        for (const r of rooms) {
            const tr = el('tr');
            tr.innerHTML = `<td>${escapeHtml(r.roomNumber || '')}</td><td>${escapeHtml(r.type || '')}</td><td>${escapeHtml(r.status || '')}</td>`;
            const td = el('td');
            td.appendChild(el('button', { class: 'btn', on: { click: () => roomForm(r) } }, 'Sửa'));
            td.appendChild(el('button', { class: 'btn', on: { click: () => deleteRoom(r._id || r.id || r.Id) } }, 'Xóa'));
            tr.appendChild(td); tb.appendChild(tr);
        }
        t.appendChild(tb); wrap.appendChild(t);
    } catch (err) { wrap.innerHTML = '<div class="notice">Lỗi: ' + err.message + '</div>'; }
}
function roomForm(room = null) {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' }); c.appendChild(el('h2', {}, room ? 'Chỉnh phòng' : 'Thêm phòng'));
    const rn = el('input', { placeholder: 'Số phòng', value: room?.roomNumber || '' });
    const type = el('input', { placeholder: 'Loại', value: room?.type || '' });
    const status = el('select'); status.innerHTML = `<option>Available</option><option>Occupied</option>`;
    if (room) status.value = room.status;
    c.appendChild(el('div', { class: 'form-row' })); c.querySelector('.form-row').appendChild(rn); c.querySelector('.form-row').appendChild(type);
    c.appendChild(el('div', { class: 'form-row' })); c.querySelectorAll('.form-row')[1].appendChild(status);
    c.appendChild(el('button', {
        class: 'btn primary', on: {
            click: async () => {
                const payload = { roomNumber: rn.value, type: type.value, status: status.value };
                try {
                    if (room && (room._id || room.id || room.Id)) {
                        const id = room._id || room.id || room.Id;
                        await apiFetch(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                    } else {
                        await apiFetch('/rooms', { method: 'POST', body: JSON.stringify(payload) });
                    }
                    showPage('rooms');
                } catch (err) { alert(err.message); }
            }
        }, inner: 'Lưu'
    }));
    c.appendChild(el('button', { class: 'btn', on: { click: () => showPage('rooms') } }, 'Hủy'));
    root.appendChild(c);
}
async function deleteRoom(id) { if (!confirm('Xóa phòng?')) return; try { await apiFetch(`/rooms/${id}`, { method: 'DELETE' }); loadRooms(); } catch (err) { alert(err.message); } }

/* ---------- CRUD: APPOINTMENTS ---------- */
async function renderAppointments() {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' });
    c.appendChild(el('h2', {}, 'Quản lý Lịch hẹn'));
    c.appendChild(el('div', { class: 'controls' }));
    c.querySelector('.controls').appendChild(el('button', { class: 'btn primary', on: { click: () => appointmentForm() } }, 'Thêm lịch hẹn'));
    c.appendChild(el('div', { id: 'appointments-list' }));
    root.appendChild(c);
    await loadAppointments();
}
async function loadAppointments() {
    const wrap = document.getElementById('appointments-list'); wrap.innerHTML = '';
    try {
        const appts = await apiFetch('/appointments');
        if (!appts.length) { wrap.innerHTML = '<p class="small">Chưa có bản ghi</p>'; return; }
        const t = el('table', { class: 'table' });
        t.innerHTML = `<thead><tr><th>Thời gian</th><th>Bệnh nhân</th><th>Bác sĩ</th><th>Trạng thái</th><th>Ghi chú</th><th></th></tr></thead>`;
        const tb = el('tbody');
        // For readability attempt to populate patient/doctor names by separate calls could be heavy; we display ids
        for (const a of appts) {
            const tr = el('tr');
            tr.innerHTML = `<td>${a.date ? new Date(a.date).toLocaleString() : ''}</td>
                      <td>${escapeHtml(a.patientId || '')}</td>
                      <td>${escapeHtml(a.doctorId || '')}</td>
                      <td>${escapeHtml(a.status || '')}</td>
                      <td>${escapeHtml(a.note || '')}</td>`;
            const td = el('td');
            td.appendChild(el('button', { class: 'btn', on: { click: () => appointmentForm(a) } }, 'Sửa'));
            td.appendChild(el('button', { class: 'btn', on: { click: () => deleteAppointment(a._id || a.id || a.Id) } }, 'Xóa'));
            tr.appendChild(td); tb.appendChild(tr);
        }
        t.appendChild(tb); wrap.appendChild(t);
    } catch (err) { wrap.innerHTML = '<div class="notice">Lỗi: ' + err.message + '</div>'; }
}
async function appointmentForm(appt = null) {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' }); c.appendChild(el('h2', {}, appt ? 'Sửa lịch hẹn' : 'Tạo lịch hẹn'));
    // dropdown patients, doctors
    const patients = await apiFetch('/patients').catch(() => []);
    const doctors = await apiFetch('/doctors').catch(() => []);
    const selP = el('select'); selP.innerHTML = '<option value="">--Chọn bệnh nhân--</option>';
    patients.forEach(p => selP.innerHTML += `<option value="${p._id || p.id || p.Id}">${escapeHtml(p.name)}</option>`);
    const selD = el('select'); selD.innerHTML = '<option value="">--Chọn bác sĩ--</option>';
    doctors.forEach(d => selD.innerHTML += `<option value="${d._id || d.id || d.Id}">${escapeHtml(d.name)}</option>`);
    const date = el('input', { type: 'datetime-local', value: appt && appt.date ? toLocalInput(appt.date) : '' });
    const status = el('select'); status.innerHTML = `<option>Pending</option><option>Confirmed</option><option>Cancelled</option>`;
    if (appt) status.value = appt.status;
    const note = el('input', { placeholder: 'Ghi chú', value: appt?.note || '' });
    c.appendChild(el('div', { class: 'form-row' })); c.querySelector('.form-row').appendChild(selP); c.querySelector('.form-row').appendChild(selD);
    c.appendChild(el('div', { class: 'form-row' })); c.querySelectorAll('.form-row')[1].appendChild(date); c.querySelectorAll('.form-row')[1].appendChild(status);
    c.appendChild(el('div', { class: 'form-row' })); c.querySelectorAll('.form-row')[2].appendChild(note);
    c.appendChild(el('button', {
        class: 'btn primary', on: {
            click: async () => {
                const payload = { patientId: selP.value, doctorId: selD.value, date: date.value ? new Date(date.value).toISOString() : null, status: status.value, note: note.value };
                try {
                    if (appt && (appt._id || appt.id || appt.Id)) {
                        const id = appt._id || appt.id || appt.Id;
                        await apiFetch(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                    } else {
                        await apiFetch('/appointments', { method: 'POST', body: JSON.stringify(payload) });
                    }
                    showPage('appointments');
                } catch (err) { alert(err.message); }
            }
        }, inner: 'Lưu'
    }));
    c.appendChild(el('button', { class: 'btn', on: { click: () => showPage('appointments') } }, 'Hủy'));
    root.appendChild(c);
}
async function deleteAppointment(id) { if (!confirm('Xóa lịch hẹn?')) return; try { await apiFetch(`/appointments/${id}`, { method: 'DELETE' }); loadAppointments(); } catch (err) { alert(err.message); } }

/* ---------- MEDICAL RECORDS ---------- */
async function renderMedicalRecords() {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' });
    c.appendChild(el('h2', {}, 'Hồ sơ khám bệnh'));
    c.appendChild(el('div', { class: 'controls' })); c.querySelector('.controls').appendChild(el('button', { class: 'btn primary', on: { click: () => medicalRecordForm() } }, 'Thêm hồ sơ'));
    c.appendChild(el('div', { id: 'mr-list' })); root.appendChild(c);
    await loadMedicalRecords();
}
async function loadMedicalRecords() {
    const wrap = document.getElementById('mr-list'); wrap.innerHTML = '';
    try {
        const recs = await apiFetch('/medicalrecords');
        if (!recs.length) { wrap.innerHTML = '<p class="small">Chưa có bản ghi</p>'; return; }
        const t = el('table', { class: 'table' });
        t.innerHTML = `<thead><tr><th>Ngày</th><th>Bệnh nhân</th><th>Bác sĩ</th><th>Triệu chứng</th><th>Chẩn đoán</th><th></th></tr></thead>`;
        const tb = el('tbody');
        for (const r of recs) {
            const tr = el('tr');
            tr.innerHTML = `<td>${r.visitDate ? new Date(r.visitDate).toLocaleString() : ''}</td>
                      <td>${escapeHtml(r.patientId || '')}</td>
                      <td>${escapeHtml(r.doctorId || '')}</td>
                      <td>${escapeHtml(r.symptoms || '')}</td>
                      <td>${escapeHtml(r.diagnosis || '')}</td>`;
            const td = el('td');
            td.appendChild(el('button', { class: 'btn', on: { click: () => medicalRecordForm(r) } }, 'Sửa'));
            td.appendChild(el('button', { class: 'btn', on: { click: () => deleteMedicalRecord(r._id || r.id || r.Id) } }, 'Xóa'));
            tr.appendChild(td); tb.appendChild(tr);
        }
        t.appendChild(tb); wrap.appendChild(t);
    } catch (err) { wrap.innerHTML = '<div class="notice">Lỗi: ' + err.message + '</div>'; }
}
async function medicalRecordForm(r = null) {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' }); c.appendChild(el('h2', {}, r ? 'Sửa hồ sơ' : 'Thêm hồ sơ'));
    const patients = await apiFetch('/patients').catch(() => []);
    const doctors = await apiFetch('/doctors').catch(() => []);
    const selP = el('select'); selP.innerHTML = '<option value="">--Chọn bệnh nhân--</option>';
    patients.forEach(p => selP.innerHTML += `<option value="${p._id || p.id || p.Id}">${escapeHtml(p.name)}</option>`);
    const selD = el('select'); selD.innerHTML = '<option value="">--Chọn bác sĩ--</option>';
    doctors.forEach(d => selD.innerHTML += `<option value="${d._id || d.id || d.Id}">${escapeHtml(d.name)}</option>`);
    const date = el('input', { type: 'datetime-local', value: r && r.visitDate ? toLocalInput(r.visitDate) : '' });
    const symptoms = el('textarea', { placeholder: 'Triệu chứng' }); symptoms.value = r?.symptoms || '';
    const diagnosis = el('textarea', { placeholder: 'Chẩn đoán' }); diagnosis.value = r?.diagnosis || '';
    const notes = el('textarea', { placeholder: 'Ghi chú' }); notes.value = r?.notes || '';
    c.appendChild(el('div', { class: 'form-row' })); c.querySelector('.form-row').appendChild(selP); c.querySelector('.form-row').appendChild(selD);
    c.appendChild(el('div', { class: 'form-row' })); c.querySelectorAll('.form-row')[1].appendChild(date);
    c.appendChild(symptoms); c.appendChild(diagnosis); c.appendChild(notes);
    c.appendChild(el('button', {
        class: 'btn primary', on: {
            click: async () => {
                const payload = { appointmentId: r?.appointmentId || '', patientId: selP.value, doctorId: selD.value, visitDate: date.value ? new Date(date.value).toISOString() : null, symptoms: symptoms.value, diagnosis: diagnosis.value, notes: notes.value, roomId: r?.roomId || '' };
                try {
                    if (r && (r._id || r.id || r.Id)) {
                        const id = r._id || r.id || r.Id; await apiFetch(`/medicalrecords/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                    } else { await apiFetch('/medicalrecords', { method: 'POST', body: JSON.stringify(payload) }); }
                    showPage('medicalrecords');
                } catch (err) { alert(err.message); }
            }
        }, inner: 'Lưu'
    }));
    c.appendChild(el('button', { class: 'btn', on: { click: () => showPage('medicalrecords') } }, 'Hủy'));
    root.appendChild(c);
}
async function deleteMedicalRecord(id) { if (!confirm('Xóa hồ sơ?')) return; try { await apiFetch(`/medicalrecords/${id}`, { method: 'DELETE' }); loadMedicalRecords(); } catch (err) { alert(err.message); } }

/* ---------- PRESCRIPTIONS (with Drugs array) ---------- */
async function renderPrescriptions() {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' });
    c.appendChild(el('h2', {}, 'Đơn thuốc'));
    c.appendChild(el('div', { class: 'controls' })); c.querySelector('.controls').appendChild(el('button', { class: 'btn primary', on: { click: () => prescriptionForm() } }, 'Thêm đơn thuốc'));
    c.appendChild(el('div', { id: 'pres-list' })); root.appendChild(c);
    await loadPrescriptions();
}
async function loadPrescriptions() {
    const wrap = document.getElementById('pres-list'); wrap.innerHTML = '';
    try {
        const pres = await apiFetch('/prescriptions');
        if (!pres.length) { wrap.innerHTML = '<p class="small">Chưa có bản ghi</p>'; return; }
        const t = el('table', { class: 'table' });
        t.innerHTML = `<thead><tr><th>Ngày</th><th>RecordId</th><th>Thuốc</th><th>Ghi chú</th><th></th></tr></thead>`;
        const tb = el('tbody');
        for (const p of pres) {
            const tr = el('tr');
            tr.innerHTML = `<td>${p.date ? new Date(p.date).toLocaleString() : ''}</td>
        <td>${escapeHtml(p.recordId || '')}</td>
        <td>${p.drugs ? p.drugs.map(d => escapeHtml(d.name)).join(', ') : ''}</td>
        <td>${escapeHtml(p.note || '')}</td>`;
            const td = el('td');
            td.appendChild(el('button', { class: 'btn', on: { click: () => prescriptionForm(p) } }, 'Sửa'));
            td.appendChild(el('button', { class: 'btn', on: { click: () => deletePrescription(p._id || p.id || p.Id) } }, 'Xóa'));
            tr.appendChild(td); tb.appendChild(tr);
        }
        t.appendChild(tb); wrap.appendChild(t);
    } catch (err) { wrap.innerHTML = '<div class="notice">Lỗi: ' + err.message + '</div>'; }
}
function prescriptionForm(p = null) {
    const root = document.getElementById('content'); root.innerHTML = '';
    const c = el('div', { class: 'card' }); c.appendChild(el('h2', {}, p ? 'Sửa đơn thuốc' : 'Thêm đơn thuốc'));
    const recordId = el('input', { placeholder: 'RecordId', value: p?.recordId || '' });
    const note = el('input', { placeholder: 'Ghi chú', value: p?.note || '' });
    const drugsWrap = el('div', { id: 'drug-items' }); const addDrugBtn = el('button', { class: 'btn', on: { click: () => addDrugForm(drugsWrap) } }, 'Thêm thuốc');
    if (p && p.drugs) { p.drugs.forEach(d => addDrugForm(drugsWrap, d)); }
    else addDrugForm(drugsWrap); // show one by default
    c.appendChild(el('div', { class: 'form-row' })); c.querySelector('.form-row').appendChild(recordId); c.querySelector('.form-row').appendChild(note);
    c.appendChild(drugsWrap); c.appendChild(addDrugBtn);
    c.appendChild(el('button', {
        class: 'btn primary', on: {
            click: async () => {
                // gather drugs
                const drugElems = drugsWrap.querySelectorAll('.drug-item');
                const drugs = Array.from(drugElems).map(div => {
                    return {
                        name: div.querySelector('.d-name').value,
                        dosage: div.querySelector('.d-dosage').value,
                        times: div.querySelector('.d-times').value,
                        days: parseInt(div.querySelector('.d-days').value || 0)
                    };
                }).filter(d => d.name);
                const payload = { recordId: recordId.value, note: note.value, drugs };
                try {
                    if (p && (p._id || p.id || p.Id)) {
                        const id = p._id || p.id || p.Id; await apiFetch(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                    } else await apiFetch('/prescriptions', { method: 'POST', body: JSON.stringify(payload) });
                    showPage('prescriptions');
                } catch (err) { alert(err.message); }
            }
        }, inner: 'Lưu'
    }));
    c.appendChild(el('button', { class: 'btn', on: { click: () => showPage('prescriptions') } }, 'Hủy'));
    root.appendChild(c);
}
function addDrugForm(container, data = { name: '', dosage: '', times: '', days: 0 }) {
    const div = el('div', { class: 'drug-item', style: 'margin-bottom:8px;padding:8px;border:1px dashed #ddd;border-radius:6px;' });
    div.appendChild(el('input', { class: 'd-name', placeholder: 'Tên thuốc', value: data.name }));
    div.appendChild(el('input', { class: 'd-dosage', placeholder: 'Liều lượng', value: data.dosage }));
    div.appendChild(el('input', { class: 'd-times', placeholder: 'Số lần/ngày', value: data.times }));
    div.appendChild(el('input', { class: 'd-days', placeholder: 'Số ngày', type: 'number', value: data.days }));
    const del = el('button', { class: 'btn', on: { click: () => { div.remove(); } } }, 'Xóa thuốc');
    div.appendChild(del);
    container.appendChild(div);
}
async function deletePrescription(id) { if (!confirm('Xóa đơn thuốc?')) return; try { await apiFetch(`/prescriptions/${id}`, { method: 'DELETE' }); loadPrescriptions(); } catch (err) { alert(err.message); } }

/* ---------- TESTS ---------- */
async function renderTests() { const root = document.getElementById('content'); root.innerHTML = ''; const c = el('div', { class: 'card' }); c.appendChild(el('h2', {}, 'Xét nghiệm')); c.appendChild(el('div', { class: 'controls' })); c.querySelector('.controls').appendChild(el('button', { class: 'btn primary', on: { click: () => testForm() } }, 'Thêm xét nghiệm')); c.appendChild(el('div', { id: 'tests-list' })); root.appendChild(c); await loadTests(); }
async function loadTests() { const wrap = document.getElementById('tests-list'); wrap.innerHTML = ''; try { const arr = await apiFetch('/tests'); if (!arr.length) { wrap.innerHTML = '<p class="small">Chưa có bản ghi</p>'; return; } const t = el('table', { class: 'table' }); t.innerHTML = `<thead><tr><th>Ngày</th><th>RecordId</th><th>Loại</th><th>Kết quả</th><th></th></tr></thead>`; const tb = el('tbody'); for (const it of arr) { const tr = el('tr'); tr.innerHTML = `<td>${it.date ? new Date(it.date).toLocaleString() : ''}</td><td>${escapeHtml(it.recordId || '')}</td><td>${escapeHtml(it.type || '')}</td><td>${escapeHtml(it.result || '')}</td>`; const td = el('td'); td.appendChild(el('button', { class: 'btn', on: { click: () => testForm(it) } }, 'Sửa')); td.appendChild(el('button', { class: 'btn', on: { click: () => deleteTest(it._id || it.id || it.Id) } }, 'Xóa')); tr.appendChild(td); tb.appendChild(tr); } t.appendChild(tb); wrap.appendChild(t); } catch (err) { wrap.innerHTML = '<div class="notice">Lỗi: ' + err.message + '</div>'; } }
function testForm(tst = null) { const root = document.getElementById('content'); root.innerHTML = ''; const c = el('div', { class: 'card' }); c.appendChild(el('h2', {}, tst ? 'Sửa xét nghiệm' : 'Thêm xét nghiệm')); const recordId = el('input', { placeholder: 'RecordId', value: tst?.recordId || '' }); const type = el('input', { placeholder: 'Loại', value: tst?.type || '' }); const date = el('input', { type: 'datetime-local', value: tst && tst.date ? toLocalInput(tst.date) : '' }); const result = el('textarea', { placeholder: 'Kết quả' }); result.value = tst?.result || ''; c.appendChild(el('div', { class: 'form-row' })); c.querySelector('.form-row').appendChild(recordId); c.querySelector('.form-row').appendChild(type); c.appendChild(el('div', { class: 'form-row' })); c.querySelectorAll('.form-row')[1].appendChild(date); c.appendChild(result); c.appendChild(el('button', { class: 'btn primary', on: { click: async () => { const payload = { recordId: recordId.value, type: type.value, date: date.value ? new Date(date.value).toISOString() : null, result: result.value }; try { if (tst && (tst._id || tst.id || tst.Id)) { const id = tst._id || tst.id || tst.Id; await apiFetch(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); } else await apiFetch('/tests', { method: 'POST', body: JSON.stringify(payload) }); showPage('tests'); } catch (err) { alert(err.message); } } }, inner: 'Lưu' })); c.appendChild(el('button', { class: 'btn', on: { click: () => showPage('tests') } }, 'Hủy')); root.appendChild(c); }
async function deleteTest(id) { if (!confirm('Xóa xét nghiệm?')) return; try { await apiFetch(`/tests/${id}`, { method: 'DELETE' }); loadTests(); } catch (err) { alert(err.message); } }

/* ---------- MEDICAL IMAGES ---------- */
async function renderImages() { const root = document.getElementById('content'); root.innerHTML = ''; const c = el('div', { class: 'card' }); c.appendChild(el('h2', {}, 'Hình ảnh y khoa')); c.appendChild(el('div', { class: 'controls' })); c.querySelector('.controls').appendChild(el('button', { class: 'btn primary', on: { click: () => imageForm() } }, 'Thêm ảnh')); c.appendChild(el('div', { id: 'images-list' })); root.appendChild(c); await loadImages(); }
async function loadImages() { const wrap = document.getElementById('images-list'); wrap.innerHTML = ''; try { const arr = await apiFetch('/medicalimages'); if (!arr.length) { wrap.innerHTML = '<p class="small">Chưa có bản ghi</p>'; return; } const t = el('table', { class: 'table' }); t.innerHTML = `<thead><tr><th>Ngày</th><th>RecordId</th><th>Loại</th><th>File</th><th></th></tr></thead>`; const tb = el('tbody'); for (const it of arr) { const tr = el('tr'); tr.innerHTML = `<td>${it.date ? new Date(it.date).toLocaleString() : ''}</td><td>${escapeHtml(it.recordId || '')}</td><td>${escapeHtml(it.type || '')}</td><td>${escapeHtml(it.fileUrl || '')}</td>`; const td = el('td'); td.appendChild(el('button', { class: 'btn', on: { click: () => imageForm(it) } }, 'Sửa')); td.appendChild(el('button', { class: 'btn', on: { click: () => deleteImage(it._id || it.id || it.Id) } }, 'Xóa')); tr.appendChild(td); tb.appendChild(tr); } t.appendChild(tb); wrap.appendChild(t); } catch (err) { wrap.innerHTML = '<div class="notice">Lỗi: ' + err.message + '</div>'; } }
function imageForm(img = null) { const root = document.getElementById('content'); root.innerHTML = ''; const c = el('div', { class: 'card' }); c.appendChild(el('h2', {}, img ? 'Sửa ảnh' : 'Thêm ảnh')); const recordId = el('input', { placeholder: 'RecordId', value: img?.recordId || '' }); const type = el('input', { placeholder: 'Loại', value: img?.type || '' }); const fileUrl = el('input', { placeholder: 'Đường dẫn file (URL)', value: img?.fileUrl || '' }); const date = el('input', { type: 'date', value: img?.date ? new Date(img.date).toISOString().slice(0, 10) : '' }); c.appendChild(el('div', { class: 'form-row' })); c.querySelector('.form-row').appendChild(recordId); c.querySelector('.form-row').appendChild(type); c.appendChild(el('div', { class: 'form-row' })); c.querySelectorAll('.form-row')[1].appendChild(fileUrl); c.querySelectorAll('.form-row')[1].appendChild(date); c.appendChild(el('button', { class: 'btn primary', on: { click: async () => { const payload = { recordId: recordId.value, type: type.value, fileUrl: fileUrl.value, date: date.value ? new Date(date.value).toISOString() : null }; try { if (img && (img._id || img.id || img.Id)) { const id = img._id || img.id || img.Id; await apiFetch(`/medicalimages/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); } else await apiFetch('/medicalimages', { method: 'POST', body: JSON.stringify(payload) }); showPage('images'); } catch (err) { alert(err.message); } } }, inner: 'Lưu' })); c.appendChild(el('button', { class: 'btn', on: { click: () => showPage('images') } }, 'Hủy')); root.appendChild(c); }
async function deleteImage(id) { if (!confirm('Xóa ảnh?')) return; try { await apiFetch(`/medicalimages/${id}`, { method: 'DELETE' }); loadImages(); } catch (err) { alert(err.message); } }

/* ---------- Helpers ---------- */
function escapeHtml(s) { if (!s && s !== 0) return ''; return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function toLocalInput(iso) { if (!iso) return ''; const d = new Date(iso); const off = d.getTimezoneOffset(); const local = new Date(d.getTime() - off * 60000); return local.toISOString().slice(0, 16); }
