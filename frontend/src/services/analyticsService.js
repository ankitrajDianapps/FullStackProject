import api from './api';

export const getDashboardData = async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
};

export const getTrendingPosts = async () => {
    const response = await api.get('/analytics/trending');
    return response.data;
};

export const getPostAnalytics = async (postId) => {
    const response = await api.get(`/analytics/post/${postId}`);
    return response.data;
};

export const getAuthorPerformance = async (authorId) => {
    const response = await api.get(`/analytics/author/${authorId}`);
    return response.data;
};
