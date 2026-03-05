import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendSignupOTP } from '../services/authService';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Register = () => {
    const [formData, setFormData] = useState({
        userName: '',
        fullName: '',
        email: '',
        password: '',
        bio: '',
        role: 'author',
        avatar: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'avatar') {
            setFormData(prev => ({ ...prev, avatar: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const userData = {
                userName: formData.userName,
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                bio: formData.bio,
                avatar: formData.avatar,
                role: formData.role,
                isActive: true
            };

            const response = await sendSignupOTP(userData);

            if (response.status) {
                toast.success('OTP sent to your email!');
                navigate('/verify-signup-otp', { state: { userData } });
            } else {
                toast.error(response.message || 'Failed to send OTP');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
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
                    <div className="md:w-1/3 relative bg-gradient-to-br from-primary via-primary/90 to-red-950 p-12 text-white flex flex-col justify-center overflow-hidden">
                        {/* Abstract shapes from image */}
                        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>

                        {/* Diagonal bars */}
                        <div className="absolute bottom-10 left-10 rotate-45 space-y-4">
                            <div className="h-4 w-48 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-60"></div>
                            <div className="h-4 w-64 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-80"></div>
                            <div className="h-4 w-40 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-50"></div>
                        </div>

                        <div className="relative z-10">
                            <h1 className="text-4xl font-bold mb-6 leading-tight">Start Your Creative Journey</h1>
                            <p className="text-base text-white/80 max-w-xs leading-relaxed">
                                Create your profile to start sharing your stories and connect with our global community.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form Section */}
                    <div className="md:w-2/3 bg-white p-8 md:p-12 flex flex-col justify-center">
                        <div className="w-full px-4">
                            <div className="text-center mb-8">
                                <h2 className="text-gray-400 font-semibold tracking-wider uppercase">CREATE ACCOUNT</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleChange}
                                            placeholder="Username"
                                            className="block w-full px-6 py-3 bg-rose-50/50 border-none rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                            className="block w-full px-6 py-3 bg-rose-50/50 border-none rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address"
                                    className="block w-full px-6 py-3 bg-rose-50/50 border-none rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                    required
                                />

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="block w-full px-6 py-3 bg-rose-50/50 border-none rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                    required
                                />

                                <div>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Bio (Optional)"
                                        rows={2}
                                        className="block w-full px-6 py-3 bg-rose-50/50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 ml-4 mb-1 block">Account Type</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="block w-full px-6 py-2.5 bg-rose-50/50 border-none rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 outline-none"
                                        >
                                            <option value="author">Author</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4">
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

                            <div className="mt-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-semibold text-red-600 hover:underline">
                                        Sign in
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

export default Register;
