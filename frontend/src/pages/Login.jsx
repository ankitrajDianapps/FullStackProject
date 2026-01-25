import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to profile by default after login as requested
    const from = "/profile";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                toast.success('Welcome back!');
                navigate(from, { replace: true });
            } else {
                toast.error('Invalid credentials');
            }
        } catch (err) {
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4 my-8">
                <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] relative z-10">
                    {/* Left Side - Decorative Section (Red Theme) */}
                    <div className="md:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-red-950 p-12 text-white flex flex-col justify-center overflow-hidden">
                        {/* Abstract shapes from image */}
                        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>

                        {/* Diagonal bars from image (Theme adjusted) */}
                        <div className="absolute bottom-10 left-10 rotate-45 space-y-4">
                            <div className="h-4 w-48 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-60"></div>
                            <div className="h-4 w-64 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-80"></div>
                            <div className="h-4 w-40 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-50"></div>
                            <div className="h-4 w-56 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-70 ml-12"></div>
                        </div>

                        <div className="relative z-10">
                            <h1 className="text-5xl font-bold mb-6 leading-tight">Empower Your Digital Voice</h1>
                            <p className="text-lg text-white/80 max-w-sm leading-relaxed">
                                Join our professional publishing ecosystem designed for authors who value performance, analytics, and seamless content creation.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form Section */}
                    <div className="md:w-1/2 bg-white p-12 flex flex-col justify-center items-center">
                        <div className="w-full max-w-sm">
                            <div className="text-center mb-10">
                                <h2 className="text-gray-400 font-semibold tracking-wider uppercase">USER LOGIN</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="block w-full pl-12 pr-4 py-3 bg-rose-50/50 border-none rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="block w-full pl-12 pr-4 py-3 bg-rose-50/50 border-none rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs px-2">
                                    <label className="flex items-center text-gray-400 cursor-pointer">
                                        <input type="checkbox" className="rounded text-red-600 focus:ring-0 mr-2" />
                                        Remember
                                    </label>
                                    <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">Forgot password?</a>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center"
                                    >
                                        {isLoading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            "LOGIN"
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-gray-500 text-sm">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="font-semibold text-red-600 hover:underline">
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
