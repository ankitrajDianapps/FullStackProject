import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, getProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await getProfile();
                    if (response && response.data) {
                        setUser(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await loginApi({ email, password });

            // Backend returns: { token: { accessToken, ... } } wrapped in apiResponse data
            // So response might be just the object if interceptor or apiService unwraps it
            // apiService.login returns response.data.
            // controller returns { success: true, data: { token: ... } }
            // So loginApi returns { token: ... } if we assume apiService returns response.data

            // Let's verify authService.js
            // const response = await api.post('/auth/login', credentials);
            // return response.data;

            // So if backend returns { success:true, data: { token: { accessToken } } }
            // then authService returns { success:true, data: { token: { accessToken } } }

            if (response && response.data && response.data.token && response.data.token.accessToken) {
                localStorage.setItem('token', response.data.token.accessToken);
                const profile = await getProfile();
                // Profile response: { success: true, data: user }
                if (profile.data) {
                    setUser(profile.data);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error", error);
            return false;
        }
    };

    const register = async (userData) => {
        const response = await registerApi(userData);
        return response;
    }

    const logout = async () => {
        await logoutApi();
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
