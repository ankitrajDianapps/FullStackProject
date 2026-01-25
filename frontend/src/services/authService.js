import api from './api';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData) => {
    const formData = new FormData();

    // Extract avatar from userData if it exists, the rest is the data payload
    const { avatar, ...dataPayload } = userData;

    formData.append('data', JSON.stringify(dataPayload));
    if (avatar) {
        formData.append('avatar', avatar);
    }

    const response = await api.post('/auth/register', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error("Logout failed on server:", error);
    } finally {
        localStorage.removeItem('token');
    }
};

export const getProfile = async () => {
    // Backend uses POST for profile
    const response = await api.post('/auth/profile');
    return response.data;
};

export const getUserById = async (userId) => {
    const response = await api.get(`/auth/${userId}`);
    return response.data;
};
