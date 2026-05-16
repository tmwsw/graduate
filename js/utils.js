// ========== utils.js — УТИЛИТЫ ДЛЯ ВСЕГО ПРОЕКТА ==========
// Содержит вспомогательные функции: уведомления, форматирование, преобразование типов,
// генерация звёзд рейтинга, работа с ролями и т.д.

// ==================== УВЕДОМЛЕНИЯ (ALERT) ====================
/**
 * Показывает всплывающее уведомление в правом верхнем углу экрана.
 * Уведомление автоматически исчезает через указанное время.
 * 
 * @param {string} type - тип уведомления: 'success', 'danger', 'warning', 'info'
 * @param {string} message - текст сообщения (может содержать HTML)
 * @param {number} timeout - время показа в миллисекундах (по умолчанию 5000)
 */
export function showAlert(type, message, timeout = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 350px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        if (alertDiv.parentNode) alertDiv.remove();
    }, timeout);
}

// ==================== НАЗВАНИЯ СПЕЦИАЛИЗАЦИЙ МАСТЕРОВ ====================
/**
 * Возвращает русское название специализации мастера по её коду.
 * Используется в таблицах и карточках мастеров.
 * 
 * @param {string} spec - код специализации (например, 'notebooks', 'smartphones')
 * @returns {string} русское название
 */
export function getSpecializationName(spec) {
    const specNames = {
        'notebooks': 'Ноутбуки',
        'smartphones': 'Смартфоны',
        'pc': 'Стационарные ПК',
        'motherboards': 'Материнские платы',
        'displays': 'Дисплеи',
        'data_recovery': 'Восстановление данных',
        'power_supplies': 'Блоки питания',
        'software': 'ПО/ОС',
        'other': 'Другое'
    };
    return specNames[spec] || spec;
}

// ==================== НАЗВАНИЯ СТАТУСОВ МАСТЕРОВ ====================
/**
 * Возвращает русское название статуса мастера.
 * 
 * @param {string} status - код статуса ('active', 'inactive', 'vacation', 'sick')
 * @returns {string} русское название
 */
export function getMasterStatusName(status) {
    const statuses = {
        'active': 'Активный',
        'inactive': 'Неактивный',
        'vacation': 'В отпуске',
        'sick': 'На больничном'
    };
    return statuses[status] || status;
}

// ==================== ГЕНЕРАЦИЯ ЗВЁЗД РЕЙТИНГА ====================
/**
 * Генерирует HTML-строку с иконками звёзд для рейтинга (полные, половинные, пустые).
 * Используется для отображения рейтинга мастеров или клиентов.
 * 
 * @param {number} rating - рейтинг от 0 до 5 (дробное число, 0.5 – половина звезды)
 * @returns {string} HTML с иконками Font Awesome
 */
export function generateRatingStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// ==================== ФОРМАТИРОВАНИЕ ТЕЛЕФОНА ====================
/**
 * Форматирует строку с номером телефона в единый формат +X (XXX) XXX-XX-XX.
 * Если номер не соответствует ожидаемой маске, возвращает исходную строку.
 * 
 * @param {string} phone - сырая строка с телефоном (может содержать любые символы)
 * @returns {string} отформатированный номер телефона
 */
export function formatPhone(phone) {
    if (!phone) return '—';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
    return phone;
}

// ==================== НАЗВАНИЯ ТИПОВ УСТРОЙСТВ ====================
/**
 * Возвращает русское название типа устройства по его коду.
 * Используется в таблицах устройств, заявок, карточках.
 * 
 * @param {string} type - код типа ('notebook', 'pc', 'smartphone', 'tablet', 'monitor', 'printer', 'other')
 * @returns {string} русское название
 */
export function getDeviceTypeName(type) {
    const types = {
        'notebook': 'Ноутбук',
        'pc': 'Стационарный ПК',
        'smartphone': 'Смартфон',
        'tablet': 'Планшет',
        'monitor': 'Монитор',
        'printer': 'Принтер/МФУ',
        'other': 'Другое устройство'
    };
    return types[type] || type;
}

// ==================== НАЗВАНИЯ СТАТУСОВ ЗАЯВОК ====================
/**
 * Возвращает русское название статуса заявки.
 * 
 * @param {string} status - код статуса ('new', 'in_progress', 'in_repair', 'ready', 'completed', 'cancelled', 'returned', 'scrap')
 * @returns {string} русское название
 */
export function getStatusName(status) {
    const statuses = {
        'new': 'Новый',
        'in_progress': 'В работе',
        'in_repair': 'В ремонте',
        'ready': 'Готов',
        'completed': 'Завершён',
        'cancelled': 'Отменён',
        'returned': 'Возвращено',
        'scrap': 'Списано'
    };
    return statuses[status] || status;
}

// ==================== НАЗВАНИЯ ТИПОВ КЛИЕНТОВ ====================
/**
 * Возвращает русское название типа клиента.
 * 
 * @param {string} type - код типа ('regular', 'new', 'corporate', 'vip')
 * @returns {string} русское название
 */
export function getClientTypeName(type) {
    const types = {
        'regular': 'Постоянный',
        'new': 'Новый',
        'corporate': 'Корпоративный',
        'vip': 'VIP'
    };
    return types[type] || 'Обычный';
}

// ==================== ПРОВЕРКА РОЛИ ПОЛЬЗОВАТЕЛЯ ====================
/**
 * Проверяет, входит ли роль текущего пользователя в список разрешённых.
 * Используется для условного отображения элементов интерфейса.
 * 
 * @param {string[]} allowedRoles - массив разрешённых ролей (например, ['admin', 'manager'])
 * @returns {boolean} true, если роль пользователя есть в списке, иначе false
 */
export function checkRole(allowedRoles) {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'guest' };
    return allowedRoles.includes(user.role);
}

/**
 * Возвращает роль текущего пользователя (admin, manager, master, guest).
 * 
 * @returns {string} роль пользователя
 */
export function getCurrentUserRole() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'guest' };
    return user.role;
}