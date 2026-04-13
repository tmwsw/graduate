// Глобальные функции для управления доступом

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

// Скрытие элементов навигации в зависимости от роли
function applyRoleBasedVisibility() {
    const role = getCurrentUserRole();
    if (role === 'client') {
        const newOrderBtn = document.querySelector('.btn-primary[data-bs-target="#newOrderModal"]');
        if (newOrderBtn) newOrderBtn.style.display = 'none';
        const linksToHide = ['reports.html', 'masters.html', 'devices.html'];
        linksToHide.forEach(link => {
            const el = document.querySelector(`a[href="${link}"]`);
            if (el && el.parentElement) el.parentElement.style.display = 'none';
        });
    }
    if (role === 'manager') {
        const mastersLink = document.querySelector('a[href="masters.html"]');
        if (mastersLink && mastersLink.parentElement) mastersLink.parentElement.style.display = 'none';
    }
    // admin видит всё
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