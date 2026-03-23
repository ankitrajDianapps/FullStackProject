import api from './api';

export const generateAIContent = async (title) => {
    try {
        const response = await api.post('/ai/generate', { title });
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const summarizeAIContent = async (content) => {
    try {
        const response = await api.post('/ai/summarize', { content });
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const refineAIContent = async (content, mode = 'improve') => {
    try {
        const response = await api.post('/ai/refine', { content, mode });
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const askChatbot = async (message) => {
    try {
        const response = await api.post('/ai/chat', { message });
        return response.data;
    } catch (err) {
        throw err;
    }
};
