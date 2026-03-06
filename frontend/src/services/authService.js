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

export const sendSignupOTP = async (userData) => {
    // Only send the necessary data (exclude avatar which isn't used until verification)
    const { avatar, ...dataPayload } = userData;
    const response = await api.post('/auth/send-signup-otp', dataPayload);
    return response.data;
};

export const verifySignupOTP = async (userData, otp) => {
    const formData = new FormData();

    const { avatar, ...dataPayload } = userData;

    formData.append('data', JSON.stringify(dataPayload));
    formData.append('otp', otp);
    if (avatar) {
        formData.append('avatar', avatar);
    }

    const response = await api.post('/auth/verify-signup-otp', formData, {
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

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const verifyOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
};

export const changePassword = async (token, newPassword) => {
    const response = await api.post('/auth/change-password', { token, newPassword });
    return response.data;
};
