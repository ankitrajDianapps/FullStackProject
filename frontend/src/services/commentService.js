import api from './api';

export const getAllComments = async (postId, parentCommentId = null) => {
    let url = `/comments/${postId}`;
    if (parentCommentId) {
        url += `?parentCommentId=${parentCommentId}`;
    }
    const response = await api.get(url);
    return response.data;
};

export const addComment = async (postId, content, parentCommentId = null) => {
    let url = `/comments/${postId}`;
    if (parentCommentId) {
        url += `?parentCommentId=${parentCommentId}`;
    }
    const response = await api.post(url, { content: content });
    return response.data;
};

export const updateComment = async (id, content) => {
    const response = await api.put(`/comments/${id}`, { content: content });
    return response.data;
};

export const deleteComment = async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
};
