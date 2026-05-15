// ========== api.js — МОДУЛЬ ВЗАИМОДЕЙСТВИЯ С СЕРВЕРОМ ==========
// Базовый URL бэкенда (FastAPI). Все запросы идут сюда.
const API_BASE = 'http://127.0.0.1:8000';

// Универсальная функция для HTTP-запросов (GET, POST, PUT, DELETE)
// Принимает: url (относительный), method, data (объект для тела запроса)
// Возвращает: JSON-ответ или null при статусе 204 (No Content)
async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    const response = await fetch(API_BASE + url, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
    }
    if (response.status === 204) return null;
    return await response.json();
}

// ==================== КЛИЕНТЫ ====================
// Получить список клиентов с пагинацией (по умолчанию первые 1000)
export async function fetchClients(skip = 0, limit = 1000) {
    return await apiRequest(`/clients/?skip=${skip}&limit=${limit}`);
}

// Создание нового клиента. Принимает данные в формате UI (fullName, phone...)
// Преобразует их в формат бэкенда (full_name, client_type через маппер)
export async function createClient(clientData) {
    const apiData = {
        full_name: clientData.fullName,
        phone: clientData.phone,
        email: clientData.email || null,
        address: clientData.address || null,
        client_type: mapClientTypeToApi(clientData.clientType),
        notes: clientData.notes || null
    };
    return await apiRequest('/clients/', 'POST', apiData);
}

// Обновление клиента по ID. Допускается частичное обновление (только переданные поля)
export async function updateClient(id, clientData) {
    const apiData = {};
    if (clientData.fullName !== undefined) apiData.full_name = clientData.fullName;
    if (clientData.phone !== undefined) apiData.phone = clientData.phone;
    if (clientData.email !== undefined) apiData.email = clientData.email;
    if (clientData.address !== undefined) apiData.address = clientData.address;
    if (clientData.clientType !== undefined) apiData.client_type = mapClientTypeToApi(clientData.clientType);
    if (clientData.notes !== undefined) apiData.notes = clientData.notes;
    return await apiRequest(`/clients/${id}`, 'PUT', apiData);
}

// Преобразование типа клиента из фронтенда в то, что ожидает бэкенд
function mapClientTypeToApi(uiType) {
    switch (uiType) {
        case 'regular': return 'regular';
        case 'new': return 'new';
        case 'vip': return 'vip';
        case 'corporate': return 'corporate';
        default: return 'regular';
    }
}

// Удаление клиента
export async function deleteClient(id) {
    return await apiRequest(`/clients/${id}`, 'DELETE');
}

// ==================== УСТРОЙСТВА ====================
export async function fetchDevices(skip = 0, limit = 1000) {
    return await apiRequest(`/devices/?skip=${skip}&limit=${limit}`);
}

// Создание устройства – данные передаются напрямую (уже в формате бэкенда)
export async function createDevice(deviceData) {
    return await apiRequest('/devices/', 'POST', deviceData);
}

export async function updateDevice(id, deviceData) {
    return await apiRequest(`/devices/${id}`, 'PUT', deviceData);
}

export async function deleteDevice(id) {
    return await apiRequest(`/devices/${id}`, 'DELETE');
}

// ==================== ЗАЯВКИ (ЗАКАЗЫ) ====================
export async function fetchOrders(skip = 0, limit = 1000) {
    return await apiRequest(`/orders/?skip=${skip}&limit=${limit}`);
}

export async function createOrder(orderData) {
    return await apiRequest('/orders/', 'POST', orderData);
}

export async function updateOrder(id, orderData) {
    return await apiRequest(`/orders/${id}`, 'PUT', orderData);
}

export async function deleteOrder(id) {
    return await apiRequest(`/orders/${id}`, 'DELETE');
}

// ==================== МАСТЕРА ====================
export async function fetchMasters(skip = 0, limit = 1000) {
    return await apiRequest(`/masters/?skip=${skip}&limit=${limit}`);
}

export async function createMaster(masterData) {
    return await apiRequest('/masters/', 'POST', masterData);
}

export async function updateMaster(id, masterData) {
    return await apiRequest(`/masters/${id}`, 'PUT', masterData);
}

export async function deleteMaster(id) {
    return await apiRequest(`/masters/${id}`, 'DELETE');
}

// ==================== АУТЕНТИФИКАЦИЯ И ПОЛЬЗОВАТЕЛИ ====================
// Регистрация нового пользователя
export async function registerUser(userData) {
    return await apiRequest('/auth/register', 'POST', userData);
}

// Вход в систему (логин/пароль)
export async function loginUser(credentials) {
    return await apiRequest('/auth/login', 'POST', credentials);
}

// Получение одного пользователя по ID (используется в profile.html)
export async function fetchUser(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    if (!response.ok) {
        throw new Error(`Ошибка загрузки пользователя: ${response.status}`);
    }
    return await response.json();
}

// Обновление данных текущего пользователя (профиль)
export async function updateCurrentUser(userId, userData) {
    return await apiRequest(`/users/${userId}`, 'PUT', userData);
}

// Смена пароля пользователя
export async function changeUserPassword(userId, passwordData) {
    return await apiRequest(`/users/${userId}/password`, 'PUT', passwordData);
}

// Вспомогательная функция: получить всех пользователей (необходима для некоторых страниц)
// В бэкенде может не быть эндпоинта /users/ без пагинации – добавим для совместимости.
export async function fetchUsers(skip = 0, limit = 1000) {
    return await apiRequest(`/users/?skip=${skip}&limit=${limit}`);
}