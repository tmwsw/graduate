const API_BASE = 'http://127.0.0.1:8000';

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

// ========== CLIENTS ==========
export async function fetchClients(skip = 0, limit = 1000) {
    return await apiRequest(`/clients/?skip=${skip}&limit=${limit}`);
}

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

function mapClientTypeToApi(uiType) {
    switch (uiType) {
        case 'regular': return 'regular';
        case 'new': return 'new';
        case 'vip': return 'vip';
        case 'corporate': return 'corporate';
        default: return 'regular';
    }
}

export async function deleteClient(id) {
    return await apiRequest(`/clients/${id}`, 'DELETE');
}

// ========== DEVICES ==========
export async function fetchDevices(skip = 0, limit = 1000) {
    return await apiRequest(`/devices/?skip=${skip}&limit=${limit}`);
}

export async function createDevice(deviceData) {
    return await apiRequest('/devices/', 'POST', deviceData);
}

export async function updateDevice(id, deviceData) {
    return await apiRequest(`/devices/${id}`, 'PUT', deviceData);
}

export async function deleteDevice(id) {
    return await apiRequest(`/devices/${id}`, 'DELETE');
}

// ========== ORDERS ==========
export async function fetchOrders(skip = 0, limit = 1000) {
    return await apiRequest(`/orders/?skip=${skip}&limit=${limit}`);
}

export async function createOrder(orderData) {
    return await apiRequest('/orders/', 'POST', orderData);
}

export async function deleteOrder(id) {
    return await apiRequest(`/orders/${id}`, 'DELETE');
}

// ========== MASTERS ==========
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

export async function updateOrder(id, orderData) {
    return await apiRequest(`/orders/${id}`, 'PUT', orderData);
}

// ========== AUTH ==========
export async function registerUser(userData) {
    return await apiRequest('/auth/register', 'POST', userData);
}
export async function loginUser(credentials) {
    return await apiRequest('/auth/login', 'POST', credentials);
}