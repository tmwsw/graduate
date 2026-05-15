// ========== auth.js — МОДУЛЬ АУТЕНТИФИКАЦИИ И РАЗГРАНИЧЕНИЯ ДОСТУПА ==========
// Содержит функции для проверки авторизации, получения роли, скрытия/показа элементов
// в зависимости от роли, генерации аватаров, работы с localStorage и API пользователей.

const API_BASE = 'http://127.0.0.1:8000';

// ==================== ОСНОВНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЕМ ====================

// Получить объект текущего пользователя из localStorage
// Возвращает объект или null, если не авторизован
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

// Получить роль текущего пользователя (admin, manager, master, guest)
// Если пользователь не авторизован, возвращается 'guest'
function getCurrentUserRole() {
    const user = getCurrentUser();
    return user ? user.role : 'guest';
}

// Проверка, авторизован ли пользователь (не гость)
function isAuthenticated() {
    return getCurrentUserRole() !== 'guest';
}

// Проверка авторизации и перенаправление на login.html, если не авторизован
// Используется на защищённых страницах (вызывается в начале скрипта)
function checkAuthAndRedirect() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Проверка, входит ли роль текущего пользователя в список разрешённых
// Используется для страниц, доступных только определённым ролям
function checkRole(allowedRoles) {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return false;
    let user;
    try { user = JSON.parse(userData); } catch(e) { return false; }
    return allowedRoles.includes(user.role);
}

// ==================== РОЛЕВАЯ ВИДИМОСТЬ ЭЛЕМЕНТОВ ИНТЕРФЕЙСА ====================

// Скрывает/показывает пункты меню и блоки профиля в зависимости от роли
// Вызывается при загрузке любой страницы (например, в DOMContentLoaded)
function applyRoleBasedVisibility() {
    const role = getCurrentUserRole();

    // Блоки профиля: для админа – dropdown, для остальных – offcanvas
    const adminBlock = document.getElementById('profileAdminDropdown');
    const userBlock = document.getElementById('profileOffcanvasTrigger');

    if (adminBlock) adminBlock.style.display = 'none';
    if (userBlock) userBlock.style.display = 'none';

    if (role === 'admin') {
        if (adminBlock) adminBlock.style.display = 'block';
    } else if (role === 'manager' || role === 'master' || role === 'client') {
        if (userBlock) userBlock.style.display = 'block';
    }

    // Скрываем недоступные разделы в боковом меню
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
        // Для клиента скрываем кнопку "Новая заявка"
        const newOrderBtn = document.querySelector('.btn-primary[data-bs-target="#newOrderModal"]');
        if (newOrderBtn) newOrderBtn.style.display = 'none';
        ['reports.html', 'masters.html', 'devices.html'].forEach(link => {
            const el = document.querySelector(`a[href="${link}"]`);
            if (el && el.parentElement) el.parentElement.style.display = 'none';
        });
    }

    // Скрываем пункт "Профиль" в меню для всех, кроме администратора
    if (role !== 'admin') {
        const profileLink = document.querySelector('a[href="profile.html"]');
        if (profileLink && profileLink.parentElement) {
            profileLink.parentElement.style.display = 'none';
        }
    }
}

// Проверка доступа к странице: если роль не входит в разрешённый список,
// перенаправляет на index.html. Используется в начале скрипта страницы.
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

// ==================== АВАТАРЫ И ОТОБРАЖЕНИЕ ПРОФИЛЯ ====================

// Генерирует data URL с круглым аватаром, содержащим инициалы (Фамилия + Имя)
// Цвет зависит от роли: admin – красный, manager – оранжевый, master – голубой, остальные – тёмно-синий
function generateLetterAvatar(fullName, role) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

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

// Возвращает отображаемое имя роли (для интерфейса)
function getRoleDisplay(role) {
    const map = { admin: 'Администратор системы', manager: 'Менеджер', master: 'Мастер' };
    return map[role] || role;
}

// Возвращает URL аватара пользователя (либо сохранённый, либо сгенерированный)
// Используется в сайдбаре и offcanvas
function getUserAvatar(user) {
    if (!user) return 'https://via.placeholder.com/200';
    if (user.avatar && user.avatar.startsWith('data:image/')) {
        return user.avatar;
    }
    return generateLetterAvatar(user.full_name || user.username || '', user.role);
}

// Обновляет аватар и имя пользователя в сайдбаре (для администратора в dropdown)
function updateUserAvatar() {
    const user = getCurrentUser();
    if (!user) return;

    if (user.avatar) {
        document.querySelectorAll('.sidebar-avatar').forEach(img => {
            img.src = user.avatar;
        });
    }

    const nameSpan = document.querySelector('.dropdown strong');
    if (nameSpan) {
        nameSpan.textContent = user.fullName || user.username || 'Пользователь';
    }

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

// Заполняет выдвижную панель (offcanvas) данными пользователя (для менеджера/мастера)
function updateProfileOffcanvas() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return;
    let user;
    try { user = JSON.parse(userData); } catch (e) { return; }

    const fullName = user.full_name || user.username || 'Пользователь';

    const avatarElement = document.getElementById('offcanvasAvatar');
    if (avatarElement) {
        if (user.avatar && user.avatar.startsWith('data:image/')) {
            avatarElement.src = user.avatar;
        } else {
            avatarElement.src = generateLetterAvatar(fullName, user.role);
        }
    }

    const nameElement = document.getElementById('offcanvasName');
    if (nameElement) nameElement.textContent = fullName;

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

// Обновляет сайдбар (оба варианта – и для админа, и для offcanvas)
function updateSidebar() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return;
    let user;
    try { user = JSON.parse(userData); } catch (e) { return; }

    let displayName = user.full_name || user.username || 'Пользователь';
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
        displayName = `${parts[0]} ${parts[1]}`;
    }

    const roleMap = { admin: 'Админ', manager: 'Менеджер', master: 'Мастер'};
    const roleText = roleMap[user.role] || 'Гость';
    const badgeClass =
        user.role === 'admin' ? 'bg-danger' :
        user.role === 'manager' ? 'bg-warning' :
        user.role === 'master' ? 'bg-info' : 'bg-success';
    const avatarSrc = getUserAvatar(user);

    // Администраторский dropdown
    const adminName = document.querySelector('#profileAdminDropdown strong');
    if (adminName) adminName.textContent = displayName;
    const adminBadge = document.querySelector('#profileAdminDropdown .badge');
    if (adminBadge) {
        adminBadge.textContent = roleText;
        adminBadge.className = `badge ms-2 ${badgeClass}`;
    }
    const adminAvatar = document.querySelector('#profileAdminDropdown .sidebar-avatar');
    if (adminAvatar) adminAvatar.src = avatarSrc;

    // Offcanvas для менеджера/мастера
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

// ==================== API-ФУНКЦИИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ====================

// Получить список пользователей с сервера (с пагинацией)
// Используется на странице профиля для получения данных текущего пользователя
async function fetchUsers(skip = 0, limit = 100) {
    const response = await fetch(`http://127.0.0.1:8000/users/?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Ошибка загрузки пользователей');
    return await response.json();
}

// ==================== ВЫХОД ИЗ СИСТЕМЫ ====================
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ====================
document.addEventListener('DOMContentLoaded', () => {
    updateSidebar();
    applyRoleBasedVisibility();
});

// Следим за изменениями в localStorage (если в другой вкладке изменился пользователь)
window.addEventListener('storage', (e) => {
    if (e.key === 'currentUser') {
        updateSidebar();
        applyRoleBasedVisibility();
    }
});

// Дополнительная инициализация (для совместимости)
document.addEventListener('DOMContentLoaded', applyRoleBasedVisibility);
document.addEventListener('DOMContentLoaded', () => {
    updateProfileOffcanvas();
});