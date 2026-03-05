import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await forgotPassword(email);
            if (response.status) {
                toast.success('OTP sent to your email!');
                navigate('/verify-otp', { state: { email } });
            } else {
                toast.error(response.message || 'Failed to send OTP');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4 my-8">
                <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] relative z-10">
                    {/* Left Side - Decorative Section */}
                    <div className="md:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-red-950 p-12 text-white flex flex-col justify-center overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>

                        <div className="absolute bottom-10 left-10 rotate-45 space-y-4">
                            <div className="h-4 w-48 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-60"></div>
                            <div className="h-4 w-64 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-80"></div>
                            <div className="h-4 w-40 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-50"></div>
                            <div className="h-4 w-56 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-70 ml-12"></div>
                        </div>

                        <div className="relative z-10">
                            <h1 className="text-5xl font-bold mb-6 leading-tight">Reset Your Password</h1>
                            <p className="text-lg text-white/80 max-w-sm leading-relaxed">
                                Don't worry! Enter your email address and we'll send you a verification code to reset your password.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form Section */}
                    <div className="md:w-1/2 bg-white p-12 flex flex-col justify-center items-center">
                        <div className="w-full max-w-sm">
                            <div className="text-center mb-10">
                                <h2 className="text-gray-400 font-semibold tracking-wider uppercase">FORGOT PASSWORD</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="block w-full pl-12 pr-4 py-3 bg-rose-50/50 border-none rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                        required
                                    />
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
                                            "SEND OTP"
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 text-center space-y-2">
                                <p className="text-gray-500 text-sm">
                                    Remember your password?{' '}
                                    <Link to="/login" className="font-semibold text-red-600 hover:underline">
                                        Back to Login
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

export default ForgotPassword;
