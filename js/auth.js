// Глобальные функции для управления доступом

const API_BASE = 'http://127.0.0.1:8000';

// Получить роль текущего пользователя
function getCurrentUserRole() {
    const user = getCurrentUser();
    return user ? user.role : 'guest';
}

// Получить объект текущего пользователя
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

// Проверка, авторизован ли пользователь (не гость)
function isAuthenticated() {
    return getCurrentUserRole() !== 'guest';
}

// Проверка и перенаправление гостя на страницу логина
function checkAuthAndRedirect() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function checkRole(allowedRoles) {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return false;
    let user;
    try { user = JSON.parse(userData); } catch(e) { return false; }
    return allowedRoles.includes(user.role);
}

// Скрытие элементов навигации в зависимости от роли
function applyRoleBasedVisibility() {
    const role = getCurrentUserRole();

    const adminBlock = document.getElementById('profileAdminDropdown');
    const userBlock = document.getElementById('profileOffcanvasTrigger');

    if (adminBlock) adminBlock.style.display = 'none';
    if (userBlock) userBlock.style.display = 'none';

    if (role === 'admin') {
        if (adminBlock) adminBlock.style.display = 'block';
    } else if (role === 'manager' || role === 'master' || role === 'client') {
        if (userBlock) userBlock.style.display = 'block';
    }

    // Скрываем пункты меню
    if (role === 'master') {
        const allowed = ['orders.html', 'devices.html', 'index.html', 'profile.html'];
        document.querySelectorAll('.nav-item').forEach(item => {
            const link = item.querySelector('a');
            if (link && !allowed.includes(link.getAttribute('href'))) {
                item.style.display = 'none';
            }
        });
    } else if (role === 'manager') {
        const allowed = ['clients.html', 'orders.html', 'index.html', 'profile.html'];
        document.querySelectorAll('.nav-item').forEach(item => {
            const link = item.querySelector('a');
            if (link && !allowed.includes(link.getAttribute('href'))) {
                item.style.display = 'none';
            }
        });
    } else if (role === 'client') {
        const newOrderBtn = document.querySelector('.btn-primary[data-bs-target="#newOrderModal"]');
        if (newOrderBtn) newOrderBtn.style.display = 'none';
        ['reports.html', 'masters.html', 'devices.html'].forEach(link => {
            const el = document.querySelector(`a[href="${link}"]`);
            if (el && el.parentElement) el.parentElement.style.display = 'none';
        });
    }

    // Скрываем пункт "Профиль" в меню для всех, кроме админа
    if (role !== 'admin') {
        const profileLink = document.querySelector('a[href="profile.html"]');
        if (profileLink && profileLink.parentElement) {
            profileLink.parentElement.style.display = 'none';
        }
    }
}

function checkPageAccess(allowedRoles) {
    const role = getCurrentUserRole();
    if (!role) {
        window.location.href = 'login.html';
        return false;
    }
    if (!allowedRoles.includes(role)) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Обновление аватара и имени пользователя в сайдбаре
function updateUserAvatar() {
    const user = getCurrentUser();
    if (!user) return;

    // Аватар (пока заглушка)
    if (user.avatar) {
        document.querySelectorAll('.sidebar-avatar').forEach(img => {
            img.src = user.avatar;
        });
    }

    // Имя пользователя – используем username (или fullName, если появится)
    const nameSpan = document.querySelector('.dropdown strong');
    if (nameSpan) {
        nameSpan.textContent = user.fullName || user.username || 'Пользователь';
    }

    // Роль в бейдже
    const roleBadge = document.querySelector('.dropdown .badge');
    if (roleBadge) {
        let roleText = '';
        switch (user.role) {
            case 'admin': roleText = 'Админ'; break;
            case 'manager': roleText = 'Менеджер'; break;
            case 'master': roleText = 'Мастер'; break;
            default: roleText = user.role;
        }
        roleBadge.textContent = roleText;
        roleBadge.className = 'badge ms-2';
        if (user.role === 'admin') roleBadge.classList.add('bg-danger');
        else if (user.role === 'manager') roleBadge.classList.add('bg-warning');
        else if (user.role === 'master') roleBadge.classList.add('bg-info');
        else roleBadge.classList.add('bg-success');
    }
}

// Функция выхода
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Генерирует data URL с кругом и двумя буквами (Фамилия Имя)
function generateLetterAvatar(fullName, role) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Цвет по роли
    let color;
    switch (role) {
        case 'admin':    color = 'rgb(220, 53, 69)'; break;   // красный
        case 'manager':  color = 'rgb(255, 193, 7)'; break;   // оранжевый
        case 'master':   color = 'rgb(13, 202, 240)'; break;  // голубой
        default:         color = '#2c3e50';                   // тёмно-синий для остальных
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fill();

    // Инициалы
    let initials = '?';
    const parts = (fullName || '').trim().split(/\s+/);
    if (parts.length >= 2) {
        const lastNameInitial = parts[0].charAt(0).toUpperCase();
        const firstNameInitial = parts[1].charAt(0).toUpperCase();
        initials = lastNameInitial + firstNameInitial;
    } else if (parts.length === 1) {
        initials = parts[0].charAt(0).toUpperCase();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 64, 64);

    return canvas.toDataURL('image/png');
}

function getRoleDisplay(role) {
    const map = { admin: 'Администратор системы', manager: 'Менеджер', master: 'Мастер' };
    return map[role] || role;
}

function getUserAvatar(user) {
    if (!user) return 'https://via.placeholder.com/200';
    if (user.avatar && user.avatar.startsWith('data:image/')) {
        return user.avatar;
    }
    return generateLetterAvatar(user.full_name || user.username || '', user.role);
}

// Заполняет offcanvas данными пользователя
function updateProfileOffcanvas() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return;
    let user;
    try { user = JSON.parse(userData); } catch (e) { return; }

    const fullName = user.full_name || user.username || 'Пользователь';

    // Аватар
    const avatarElement = document.getElementById('offcanvasAvatar');
    if (avatarElement) {
        if (user.avatar && user.avatar.startsWith('data:image/')) {
            avatarElement.src = user.avatar;
        } else {
            avatarElement.src = generateLetterAvatar(fullName, user.role);
        }
    }

    // Имя
    const nameElement = document.getElementById('offcanvasName');
    if (nameElement) nameElement.textContent = fullName;

    // Роль (ИСКАТЬ ЭЛЕМЕНТ С id="offcanvasRoleBadge")
    const roleBadge = document.getElementById('offcanvasRoleBadge');
    if (roleBadge) {
        const roleMap = { admin: 'Админ', manager: 'Менеджер', master: 'Мастер', client: 'Клиент' };
        const roleText = roleMap[user.role] || 'Гость';
        const badgeClass =
            user.role === 'admin' ? 'bg-danger' :
            user.role === 'manager' ? 'bg-warning' :
            user.role === 'master' ? 'bg-info' : 'bg-success';
        roleBadge.textContent = roleText;
        roleBadge.className = `badge ${badgeClass}`;
    }
}

function updateSidebar() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return;
    let user;
    try { user = JSON.parse(userData); } catch (e) { return; }

    // Короткая форма для сайдбара
    let displayName = user.full_name || user.username || 'Пользователь';
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
        displayName = `${parts[0]} ${parts[1]}`;   // только Фамилия Имя
    }

    const roleMap = { admin: 'Админ', manager: 'Менеджер', master: 'Мастер'};
    const roleText = roleMap[user.role] || 'Гость';
    const badgeClass =
        user.role === 'admin' ? 'bg-danger' :
        user.role === 'manager' ? 'bg-warning' :
        user.role === 'master' ? 'bg-info' : 'bg-success';
    const avatarSrc = getUserAvatar(user);

    // admin dropdown
    const adminName = document.querySelector('#profileAdminDropdown strong');
    if (adminName) adminName.textContent = displayName;
    const adminBadge = document.querySelector('#profileAdminDropdown .badge');
    if (adminBadge) {
        adminBadge.textContent = roleText;
        adminBadge.className = `badge ms-2 ${badgeClass}`;
    }
    const adminAvatar = document.querySelector('#profileAdminDropdown .sidebar-avatar');
    if (adminAvatar) adminAvatar.src = avatarSrc;

    // offcanvas trigger (мастер/менеджер)
    const userName = document.querySelector('#profileOffcanvasTrigger strong');
    if (userName) userName.textContent = displayName;
    const userBadge = document.querySelector('#profileOffcanvasTrigger .badge');
    if (userBadge) {
        userBadge.textContent = roleText;
        userBadge.className = `badge ms-2 ${badgeClass}`;
    }
    const userAvatar = document.querySelector('#profileOffcanvasTrigger .sidebar-avatar');
    if (userAvatar) userAvatar.src = avatarSrc;
}

// Получить список пользователей (или одного, отфильтровав)
async function fetchUsers(skip = 0, limit = 100) {
    const response = await fetch(`http://127.0.0.1:8000/users/?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Ошибка загрузки пользователей');
    return await response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    updateSidebar();
    applyRoleBasedVisibility();
});
window.addEventListener('storage', (e) => {
    if (e.key === 'currentUser') {
        updateSidebar();
        applyRoleBasedVisibility();
    }
});

document.addEventListener('DOMContentLoaded', applyRoleBasedVisibility);
document.addEventListener('DOMContentLoaded', () => {
    updateProfileOffcanvas(); // можно вызвать сразу при загрузке, чтобы данные подгрузились
});