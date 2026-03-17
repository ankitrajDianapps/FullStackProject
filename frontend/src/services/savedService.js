import api from './api';

export const savePost = async (postId) => {
    const response = await api.post(`/saved/${postId}`);
    return response.data;
};

export const unsavePost = async (postId) => {
    const response = await api.delete(`/saved/${postId}`);
    return response.data;
};

export const getSavedPosts = async () => {
    const response = await api.get('/saved');
    return response.data;
};

export const isPostSaved = async (postId) => {
    const response = await api.get(`/saved/${postId}/status`);
    return response.data;
};
