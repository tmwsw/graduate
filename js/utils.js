// js/utils.js

// ==================== УВЕДОМЛЕНИЯ (ALERT) ====================
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
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, timeout);
}

// ==================== НАЗВАНИЯ СПЕЦИАЛИЗАЦИЙ МАСТЕРОВ ====================
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

// ==================== (ДОПОЛНИТЕЛЬНО) ФОРМАТИРОВАНИЕ ТЕЛЕФОНА ====================
export function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
    return phone;
}

// ==================== НАЗВАНИЯ ТИПОВ УСТРОЙСТВ ====================
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
export function getClientTypeName(type) {
    const types = {
        'regular': 'Постоянный',
        'new': 'Новый',
        'corporate': 'Корпоративный',
        'vip': 'VIP'
    };
    return types[type] || 'Обычный';
}
// ==================== вспомогательную функцию для проверки роли ====================
export function checkRole(allowedRoles) {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'guest' };
    return allowedRoles.includes(user.role);
}

export function getCurrentUserRole() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'guest' };
    return user.role;
}