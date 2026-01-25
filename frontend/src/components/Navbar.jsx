import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="w-full py-6 px-8 flex justify-between items-center z-20 relative">
            <Link to="/" className="text-white text-xl font-bold tracking-tight">
                Blog Management System
            </Link>
            <div className="hidden md:flex space-x-6 text-white/80 text-sm font-medium items-center">
                <Link to="/" className="hover:text-white transition-colors text-white font-semibold">Home</Link>
                <Link to="/explore" className="hover:text-white transition-colors text-white font-semibold">Explore</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" className="hover:text-white transition-colors text-white font-semibold">Dashboard</Link>
                        <Link to="/profile" className="hover:text-white transition-colors text-white font-semibold">Profile</Link>
                        <button
                            onClick={logout}
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all text-white font-semibold border border-white/20"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hover:text-white transition-colors text-white font-semibold text-white">Login</Link>
                        <Link to="/register" className="bg-white text-primary px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition-all">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
