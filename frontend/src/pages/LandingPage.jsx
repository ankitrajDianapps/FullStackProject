import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, TrendingUp, MessageSquare, BarChart3, Shield, Zap, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import Navbar from '../components/Navbar';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="bg-primary">
                <Navbar />
            </div>
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
                            Blog Management
                            <span className="block text-primary mt-2">Made Simple</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                            A powerful, feature-rich platform for creating, managing, and analyzing your blog content.
                            Built for authors, teams, and content creators who demand excellence.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button
                                className="px-8 py-3 text-lg"
                                onClick={() => navigate('/register')}
                            >
                                Get Started Free
                            </Button>
                            <Button
                                variant="secondary"
                                className="px-8 py-3 text-lg"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section ... */}
            {/* Same content here ... skipping for brevity in thought but including in file write */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
                    <p className="text-xl text-gray-600">Powerful features to manage your content ecosystem</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Post Management</h3>
                        <p className="text-gray-600">
                            Create, edit, and publish blog posts with ease. Support for drafts, categories, tags, and featured images.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Analytics</h3>
                        <p className="text-gray-600">
                            Track views, engagement, and performance metrics. Identify trending posts and optimize your content strategy.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <MessageSquare className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nested Comments</h3>
                        <p className="text-gray-600">
                            Engage with your audience through threaded comment discussions. Support for replies and moderation.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Trending Posts</h3>
                        <p className="text-gray-600">
                            Automatic detection of trending content based on engagement metrics and view velocity.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Author Profiles</h3>
                        <p className="text-gray-600">
                            Personalized author pages with performance metrics, bio, and complete post history.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Reliable</h3>
                        <p className="text-gray-600">
                            JWT authentication, role-based access control, and automated data cleanup for optimal security.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-primary text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="flex items-center justify-center mb-2">
                                <Zap className="w-8 h-8 mr-2" />
                                <div className="text-4xl font-bold">Fast</div>
                            </div>
                            <p className="text-blue-100">Lightning-fast performance with optimized queries</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center mb-2">
                                <Globe className="w-8 h-8 mr-2" />
                                <div className="text-4xl font-bold">Scalable</div>
                            </div>
                            <p className="text-blue-100">Built to handle thousands of posts and users</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center mb-2">
                                <Shield className="w-8 h-8 mr-2" />
                                <div className="text-4xl font-bold">Secure</div>
                            </div>
                            <p className="text-blue-100">Enterprise-grade security and data protection</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join thousands of content creators managing their blogs with our platform
                    </p>
                    <Button
                        className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg"
                        onClick={() => navigate('/register')}
                    >
                        Create Your Account
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p>&copy; 2026 Blog Management System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
