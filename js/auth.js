// Глобальные функции для управления доступом

// Получить роль текущего пользователя
function getCurrentUserRole() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'guest' };
    return user.role;
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
        // Скрыть кнопку "Новая заявка" (если есть)
        const newOrderBtn = document.querySelector('.btn-primary[data-bs-target="#newOrderModal"]');
        if (newOrderBtn) newOrderBtn.style.display = 'none';
        // Скрыть ссылки на отчёты, мастеров, устройства
        const linksToHide = ['reports.html', 'masters.html', 'devices.html'];
        linksToHide.forEach(link => {
            const el = document.querySelector(`a[href="${link}"]`);
            if (el && el.parentElement) el.parentElement.style.display = 'none';
        });
    }
    if (role === 'manager') {
        // Менеджер не видит ссылку на мастеров
        const mastersLink = document.querySelector('a[href="masters.html"]');
        if (mastersLink && mastersLink.parentElement) mastersLink.parentElement.style.display = 'none';
    }
    // Админ видит всё
}

// Обновление аватара и имени пользователя в сайдбаре
function updateUserAvatar() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.avatar) {
        document.querySelectorAll('.sidebar-avatar').forEach(img => {
            img.src = user.avatar;
        });
    }
    const nameSpan = document.querySelector('.dropdown strong');
    if (user && nameSpan) {
        nameSpan.textContent = user.fullName || user.login;
    }
}

// Функция выхода
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}