import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp } from '../services/authService';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const VerifyOtp = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const inputRefs = useRef([]);
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            toast.error('Please enter your email first');
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length; i++) {
            if (!isNaN(pastedData[i])) {
                newOtp[i] = pastedData[i];
            }
        }
        setOtp(newOtp);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            toast.error('Please enter complete OTP');
            return;
        }

        setIsLoading(true);

        try {
            const response = await verifyOtp(email, otpString);
            if (response.status) {
                toast.success('OTP verified successfully!');
                navigate('/reset-password', { state: { token: response.data.token } });
            } else {
                toast.error(response.message || 'Invalid OTP');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
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
                            <h1 className="text-5xl font-bold mb-6 leading-tight">Verify Your Identity</h1>
                            <p className="text-lg text-white/80 max-w-sm leading-relaxed">
                                We've sent a 6-digit verification code to your email. Please enter it below to continue.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form Section */}
                    <div className="md:w-1/2 bg-white p-12 flex flex-col justify-center items-center">
                        <div className="w-full max-w-sm">
                            <div className="text-center mb-10">
                                <h2 className="text-gray-400 font-semibold tracking-wider uppercase">VERIFY OTP</h2>
                                <p className="text-gray-500 text-sm mt-2">Code sent to {email}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="w-12 h-14 text-center text-2xl font-bold bg-rose-50/50 border-none rounded-lg focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700"
                                            required
                                        />
                                    ))}
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
                                            "VERIFY OTP"
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 text-center space-y-2">
                                <p className="text-gray-500 text-sm">
                                    Didn't receive the code?{' '}
                                    <button
                                        onClick={() => navigate('/forgot-password')}
                                        className="font-semibold text-red-600 hover:underline"
                                    >
                                        Resend
                                    </button>
                                </p>
                                <p className="text-gray-500 text-sm">
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

export default VerifyOtp;
