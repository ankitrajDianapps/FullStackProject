import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
    }

    // If already logged in, redirect to profile
    if (user) {
        return <Navigate to="/profile" state={{ from: location }} replace />;
    }

    return (
        <Outlet />
    );
};

export default AuthLayout;
