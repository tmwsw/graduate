// js/data.js

// ==================== КЛИЕНТЫ ====================
/**
 * Получить всех клиентов из localStorage
 * @returns {Array} массив клиентов
 */
export function getClients() {
    return JSON.parse(localStorage.getItem('clients')) || [];
}

/**
 * Сохранить массив клиентов в localStorage
 * @param {Array} clients
 */
export function saveClients(clients) {
    localStorage.setItem('clients', JSON.stringify(clients));
}

/**
 * Добавить нового клиента (ID генерируется автоматически)
 * @param {Object} client - объект клиента без поля id
 * @returns {Object} добавленный клиент с id
 */
export function addClient(client) {
    const clients = getClients();
    client.id = clients.length ? Math.max(...clients.map(c => c.id)) + 1 : 1;
    clients.push(client);
    saveClients(clients);
    return client;
}

/**
 * Обновить данные клиента по ID
 * @param {number} clientId
 * @param {Object} newData - частичные данные для обновления
 * @returns {Object|null} обновлённый клиент или null
 */
export function updateClient(clientId, newData) {
    const clients = getClients();
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
        clients[index] = { ...clients[index], ...newData };
        saveClients(clients);
        return clients[index];
    }
    return null;
}

/**
 * Удалить клиента по ID
 * @param {number} clientId
 */
export function deleteClient(clientId) {
    const clients = getClients().filter(c => c.id !== clientId);
    saveClients(clients);
}

// ==================== УСТРОЙСТВА ====================
export function getDevices() {
    return JSON.parse(localStorage.getItem('devices')) || [];
}

export function saveDevices(devices) {
    localStorage.setItem('devices', JSON.stringify(devices));
}

export function addDevice(device) {
    const devices = getDevices();
    device.id = devices.length ? Math.max(...devices.map(d => d.id)) + 1 : 1;
    devices.push(device);
    saveDevices(devices);
    return device;
}

export function updateDevice(deviceId, newData) {
    const devices = getDevices();
    const index = devices.findIndex(d => d.id === deviceId);
    if (index !== -1) {
        devices[index] = { ...devices[index], ...newData };
        saveDevices(devices);
        return devices[index];
    }
    return null;
}

export function deleteDevice(deviceId) {
    const devices = getDevices().filter(d => d.id !== deviceId);
    saveDevices(devices);
}

// ==================== МАСТЕРА ====================
export function getMasters() {
    return JSON.parse(localStorage.getItem('masters')) || [];
}

export function saveMasters(masters) {
    localStorage.setItem('masters', JSON.stringify(masters));
}

export function addMaster(master) {
    const masters = getMasters();
    master.id = masters.length ? Math.max(...masters.map(m => m.id)) + 1 : 1;
    masters.push(master);
    saveMasters(masters);
    return master;
}

export function updateMaster(masterId, newData) {
    const masters = getMasters();
    const index = masters.findIndex(m => m.id === masterId);
    if (index !== -1) {
        masters[index] = { ...masters[index], ...newData };
        saveMasters(masters);
        return masters[index];
    }
    return null;
}

export function deleteMaster(masterId) {
    const masters = getMasters().filter(m => m.id !== masterId);
    saveMasters(masters);
}

// ==================== ЗАЯВКИ ====================
export function getOrders() {
    return JSON.parse(localStorage.getItem('repair_orders')) || [];
}

export function saveOrders(orders) {
    localStorage.setItem('repair_orders', JSON.stringify(orders));
}

export function addOrder(order) {
    const orders = getOrders();
    order.id = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1001;
    orders.push(order);
    saveOrders(orders);
    return order;
}

export function updateOrder(orderId, newData) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...newData };
        saveOrders(orders);
        return orders[index];
    }
    return null;
}

export function deleteOrder(orderId) {
    const orders = getOrders().filter(o => o.id !== orderId);
    saveOrders(orders);
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================
export function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

export function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

export function addUser(user) {
    const users = getUsers();
    user.id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    users.push(user);
    saveUsers(users);
    return user;
}

export function updateUser(userId, newData) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...newData };
        saveUsers(users);
        return users[index];
    }
    return null;
}

export function deleteUser(userId) {
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);
}

// Текущий пользователь (отдельно)
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

export function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

export function updateCurrentUser(newData) {
    const user = getCurrentUser();
    if (user) {
        Object.assign(user, newData);
        setCurrentUser(user);
    }
    return user;
}

// ==================== УВЕДОМЛЕНИЯ ====================
export function getNotifications() {
    return JSON.parse(localStorage.getItem('notifications')) || [];
}

export function saveNotifications(notifications) {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

export function addNotification(notification) {
    const notifications = getNotifications();
    notification.id = notifications.length ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    notifications.unshift(notification);
    saveNotifications(notifications);
    return notification;
}

export function markNotificationAsRead(notificationId) {
    const notifications = getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
        notifications[index].read = true;
        saveNotifications(notifications);
    }
}

export function deleteNotification(notificationId) {
    const notifications = getNotifications().filter(n => n.id !== notificationId);
    saveNotifications(notifications);
}

// ==================== ИСТОРИЯ АКТИВНОСТИ ====================
export function getActivityHistory() {
    return JSON.parse(localStorage.getItem('activityHistory')) || [];
}

export function saveActivityHistory(history) {
    localStorage.setItem('activityHistory', JSON.stringify(history));
}

export function addActivity(action, details, type, icon) {
    const history = getActivityHistory();
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('ru-RU');
    
    const newActivity = {
        id: history.length + 1,
        action: action,
        details: details,
        time: `Сегодня, ${timeString}`,
        type: type,
        icon: icon
    };
    
    history.unshift(newActivity);
    if (history.length > 50) history.pop();
    saveActivityHistory(history);
    return newActivity;
}