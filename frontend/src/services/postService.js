import api from './api';

export const getAllPublishedPosts = async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
};

export const getOwnPosts = async () => {
    const response = await api.get('/posts/my-posts');
    return response.data;
};

export const getPostById = async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
};

export const createPost = async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
};

export const updatePost = async (id, postData) => {
    const response = await api.patch(`/posts/${id}`, postData);
    return response.data;
};

export const deletePost = async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
};

export const publishDraftPost = async (id) => {
    const response = await api.patch(`/posts/${id}/publish`);
    return response.data;
};

export const likePost = async (id) => {
    const response = await api.put(`/posts/${id}/like`);
    return response.data;
};

export const unlikePost = async (id) => {
    const response = await api.put(`/posts/${id}/unlike`);
    return response.data;
};
