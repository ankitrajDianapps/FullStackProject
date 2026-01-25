import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, AlignLeft, BarChart2, Eye, MessageSquare, FileText } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { getAuthorPerformance } from '../services/analyticsService';
import { getUserById } from '../services/authService';
import { DEFAULT_PROFILE_IMAGE } from '../utils/constants';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPerformance, setLoadingPerformance] = useState(true);
    const [error, setError] = useState('');

    const isOwnProfile = !id || id === currentUser?._id;

    useEffect(() => {
        const fetchUserData = async () => {
            if (isOwnProfile && !currentUser) {
                // Wait for useAuth to provide the user
                return;
            }

            try {
                setLoading(true);
                setError('');
                if (isOwnProfile) {
                    setUser(currentUser);
                } else {
                    const response = await getUserById(id);
                    if (response.status) {
                        setUser(response.data);
                    } else {
                        setError('User not found');
                    }
                }
            } catch (err) {
                console.error("Failed to load user profile", err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id, currentUser, isOwnProfile]);

    useEffect(() => {
        const fetchPerformance = async () => {
            const targetUserId = isOwnProfile ? currentUser?._id : id;
            if (targetUserId) {
                try {
                    setLoadingPerformance(true);
                    const response = await getAuthorPerformance(targetUserId);
                    if (response.status) {
                        setPerformanceData(response.data);
                    }
                } catch (err) {
                    console.error("Failed to load performance metrics", err);
                } finally {
                    setLoadingPerformance(false);
                }
            }
        };
        if (user) {
            fetchPerformance();
        }
    }, [user, id, currentUser, isOwnProfile]);

    if (loading) {
        return <div className="p-8 text-center animate-pulse text-gray-500">Loading profile...</div>;
    }

    if (error || !user) {
        return <div className="p-8 text-center text-red-500 font-medium">{error || 'User not found'}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {isOwnProfile ? 'My Profile' : `${user.fullName}'s Profile`}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: User Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="h-24 bg-gradient-to-r from-primary to-purple-600"></div>
                        <div className="px-6 pb-6 relative">
                            <div className="relative -mt-12 mb-4 inline-block">
                                <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md overflow-hidden">
                                    <img
                                        src={DEFAULT_PROFILE_IMAGE}
                                        alt={user.userName}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                            <p className="text-sm text-gray-500 mb-4">@{user.userName}</p>

                            <div className="flex flex-col space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="capitalize">{user.role}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>Joined {formatDate(user.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio and Performance */}
                <div className="md:col-span-2 space-y-8">
                    {/* Bio Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <AlignLeft className="w-5 h-5 mr-2 text-primary" />
                            About Me
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {user.bio || "No bio available. Update your profile to add one!"}
                        </p>
                    </div>

                    {/* Performance Metrics Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <BarChart2 className="w-5 h-5 mr-2 text-primary" />
                            Author Performance
                        </h3>

                        {loadingPerformance ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ) : performanceData ? (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg text-center">
                                    <FileText className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                    <span className="block text-2xl font-bold text-blue-700">{performanceData.total_publishedPosts || 0}</span>
                                    <span className="text-xs text-blue-600 uppercase font-medium">Total Posts</span>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg text-center">
                                    <Eye className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                    <span className="block text-2xl font-bold text-green-700">{performanceData.totalViews || 0}</span>
                                    <span className="text-xs text-green-600 uppercase font-medium">Total Views</span>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg text-center">
                                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                                    <span className="block text-2xl font-bold text-purple-700">{performanceData.totalComments || 0}</span>
                                    <span className="text-xs text-purple-600 uppercase font-medium">Comments</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No performance data available yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
