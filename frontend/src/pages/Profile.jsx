import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, AlignLeft, BarChart2, Eye, MessageSquare, FileText, Users, UserCheck, UserPlus, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { getAuthorPerformance } from '../services/analyticsService';
import { getUserById } from '../services/authService';
import { DEFAULT_PROFILE_IMAGE } from '../utils/constants';
import { getConnectionStatus, sendRequest, acceptRequest, removeConnection, getConnections } from '../services/connectionService';
import { getAllPublishedPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPerformance, setLoadingPerformance] = useState(true);
    const [error, setError] = useState('');

    // Connection state
    const [connStatus, setConnStatus] = useState('none'); // 'none' | 'pending' | 'accepted'
    const [connectionId, setConnectionId] = useState(null);
    const [isRequester, setIsRequester] = useState(false);
    const [connLoading, setConnLoading] = useState(false);
    const [connections, setConnections] = useState([]);
    const [connectionsLoading, setConnectionsLoading] = useState(true);
    const [showConnectionsList, setShowConnectionsList] = useState(false);

    // User Posts state
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);

    const isOwnProfile = !id || id === currentUser?._id;
    const profileUserId = isOwnProfile ? currentUser?._id : id;

    useEffect(() => {
        const fetchUserData = async () => {
            if (isOwnProfile && !currentUser) return;
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

    // Fetch connection status (only for other users' profiles)
    useEffect(() => {
        if (!isOwnProfile && id) {
            getConnectionStatus(id)
                .then(res => {
                    if (res?.status) {
                        setConnStatus(res.data.status);
                        setConnectionId(res.data.connectionId);
                        setIsRequester(res.data.isRequester);
                    }
                })
                .catch(() => { });
        }
    }, [id, isOwnProfile]);

    // Fetch connections list for the profile being viewed
    useEffect(() => {
        if (profileUserId) {
            setConnectionsLoading(true);
            getConnections(profileUserId)
                .then(res => {
                    if (res?.status) setConnections(res.data || []);
                })
                .catch(() => { })
                .finally(() => setConnectionsLoading(false));
        }
    }, [profileUserId]);

    // Fetch user's published posts
    useEffect(() => {
        if (user?.userName) {
            setPostsLoading(true);
            getAllPublishedPosts({ author: user.userName, limit: 100 })
                .then(res => {
                    if (Array.isArray(res)) setUserPosts(res);
                    else if (res?.status && Array.isArray(res.data)) setUserPosts(res.data);
                    else setUserPosts([]);
                })
                .catch(() => setUserPosts([]))
                .finally(() => setPostsLoading(false));
        }
    }, [user?.userName]);

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
        if (user) fetchPerformance();
    }, [user, id, currentUser, isOwnProfile]);

    const handleConnect = async () => {
        setConnLoading(true);
        try {
            if (connStatus === 'none') {
                const res = await sendRequest(id);
                if (res?.status) {
                    setConnStatus('pending');
                    setIsRequester(true);
                    setConnectionId(res.data._id);
                    toast.success('Connection request sent!');
                }
            } else if (connStatus === 'pending' && !isRequester) {
                // Recipient accepting
                const res = await acceptRequest(connectionId);
                if (res?.status) {
                    setConnStatus('accepted');
                    toast.success('Connection accepted!');
                    // Refresh connections list
                    const listRes = await getConnections(profileUserId);
                    if (listRes?.status) setConnections(listRes.data || []);
                }
            } else {
                // Remove (either pending cancel or disconnect)
                const res = await removeConnection(id);
                if (res?.status) {
                    setConnStatus('none');
                    setConnectionId(null);
                    setIsRequester(false);
                    // Hide list if they were viewing it and disconnected
                    setShowConnectionsList(false);
                    toast.success(connStatus === 'accepted' ? 'Connection removed' : 'Request cancelled');
                    // Refresh connections list
                    const listRes = await getConnections(profileUserId);
                    if (listRes?.status) setConnections(listRes.data || []);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Action failed');
        } finally {
            setConnLoading(false);
        }
    };

    const getConnectButtonProps = () => {
        if (connStatus === 'none') {
            return {
                label: 'Connect',
                icon: <UserPlus className="w-4 h-4 mr-1.5" />,
                className: 'bg-white border border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-red-50'
            };
        }
        if (connStatus === 'pending' && isRequester) {
            return {
                label: 'Pending',
                icon: <Clock className="w-4 h-4 mr-1.5" />,
                className: 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
            };
        }
        if (connStatus === 'pending' && !isRequester) {
            return {
                label: 'Accept',
                icon: <UserCheck className="w-4 h-4 mr-1.5" />,
                className: 'bg-green-50 border border-green-400 text-green-700 hover:bg-green-100'
            };
        }
        // accepted
        return {
            label: 'Connected',
            icon: <UserCheck className="w-4 h-4 mr-1.5" />,
            className: 'bg-green-600 border border-green-600 text-white hover:bg-red-600 hover:border-red-600'
        };
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse text-gray-500">Loading profile...</div>;
    }

    if (error || !user) {
        return <div className="p-8 text-center text-red-500 font-medium">{error || 'User not found'}</div>;
    }

    const btnProps = getConnectButtonProps();
    const canViewConnections = isOwnProfile || connStatus === 'accepted';

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

                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                                    <p className="text-sm text-gray-500 mb-1">@{user.userName}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />
                                        {connectionsLoading ? '...' : connections.length} connection{connections.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                {/* Connect button — only on other profiles */}
                                {!isOwnProfile && (
                                    <button
                                        onClick={handleConnect}
                                        disabled={connLoading}
                                        className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-60 ${btnProps.className}`}
                                    >
                                        {connLoading
                                            ? <span className="animate-pulse">...</span>
                                            : <>{btnProps.icon}{btnProps.label}</>
                                        }
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col space-y-2 text-sm text-gray-600 mt-4">
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

                {/* Right Column */}
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

                    {/* Performance Metrics */}
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

                    {/* Connections Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-primary" />
                                Connections
                                <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {connectionsLoading ? '...' : connections.length}
                                </span>
                            </h3>

                            {canViewConnections && connections.length > 0 && (
                                <button
                                    onClick={() => setShowConnectionsList(!showConnectionsList)}
                                    className="flex items-center text-sm font-medium text-primary hover:text-red-700 transition-colors"
                                >
                                    {showConnectionsList ? (
                                        <>Hide <ChevronUp className="w-4 h-4 ml-1" /></>
                                    ) : (
                                        <>View All <ChevronDown className="w-4 h-4 ml-1" /></>
                                    )}
                                </button>
                            )}
                        </div>

                        {!canViewConnections && (
                            <p className="text-sm text-gray-500 mt-2">
                                Connect with {user.fullName} to see their connections.
                            </p>
                        )}

                        {canViewConnections && showConnectionsList && (
                            <div className="mt-5 border-t border-gray-100 pt-5">
                                {connectionsLoading ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                                                    <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : connections.length === 0 ? (
                                    <div className="text-center py-6">
                                        <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">
                                            {isOwnProfile ? "You haven't connected with anyone yet." : "No connections yet."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {connections.map(({ connectionId: cId, user: connUser }) => (
                                            <Link
                                                key={cId}
                                                to={`/profile/${connUser._id}`}
                                                className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-red-50 transition-colors group border border-transparent hover:border-red-100"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                                    <img
                                                        src={connUser.avatar || DEFAULT_PROFILE_IMAGE}
                                                        alt={connUser.fullName}
                                                        className="w-full h-full object-cover"
                                                        onError={e => { e.target.src = DEFAULT_PROFILE_IMAGE }}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-800 group-hover:text-primary truncate">{connUser.fullName}</p>
                                                    <p className="text-xs text-gray-500 truncate">@{connUser.userName}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User's Published Posts Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-primary" />
                    Published Posts
                </h2>

                {postsLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    </div>
                ) : userPosts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-medium text-gray-900">No posts yet</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {isOwnProfile ? "You haven't published any posts." : `${user.fullName} hasn't published any posts.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userPosts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
