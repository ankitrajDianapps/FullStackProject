import api from './api';

export const sendRequest = async (recipientId) => {
    const response = await api.post(`/connections/request/${recipientId}`);
    return response.data;
};

export const acceptRequest = async (connectionId) => {
    const response = await api.patch(`/connections/accept/${connectionId}`);
    return response.data;
};

export const removeConnection = async (recipientId) => {
    const response = await api.delete(`/connections/remove/${recipientId}`);
    return response.data;
};

export const getConnections = async (userId) => {
    const params = userId ? { userId } : {};
    const response = await api.get('/connections', { params });
    return response.data;
};

export const getConnectionStatus = async (profileUserId) => {
    const response = await api.get(`/connections/status/${profileUserId}`);
    return response.data;
};

export const searchUsers = async (q) => {
    const response = await api.get('/auth/search', { params: { q } });
    return response.data;
};
