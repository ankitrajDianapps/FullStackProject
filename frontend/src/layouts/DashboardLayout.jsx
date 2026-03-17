import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, PlusSquare, LogOut, Menu, X, User, Compass, FileClock, Bookmark, Search, Bell, Check, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { DEFAULT_PROFILE_IMAGE } from '../utils/constants';
import { searchUsers, acceptRequest, removeConnection } from '../services/connectionService';
import { getNotifications, markAsRead, markAllAsRead, deleteNotificationById } from '../services/notificationService';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const debounceTimer = useRef(null);
    const searchContainerRef = useRef(null);

    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationContainerRef = useRef(null);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Feed', href: '/feed', icon: Compass },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'My Posts', href: '/my-posts', icon: FileText },
        { name: 'My Drafts', href: '/drafts', icon: FileClock },
        { name: 'Saved Posts', href: '/saved', icon: Bookmark },
        { name: 'Create Post', href: '/create-post', icon: PlusSquare },
    ];

    const isActive = (path) => location.pathname === path;

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            if (res?.status) {
                setNotifications(res.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
        // Optional: Polling every 60s for real-world feel
        const interval = setInterval(() => {
            if (user) fetchNotifications();
        }, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowSearchDropdown(false);
            }
            if (notificationContainerRef.current && !notificationContainerRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        clearTimeout(debounceTimer.current);

        if (!value.trim()) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                setSearchLoading(true);
                setShowSearchDropdown(true);
                const res = await searchUsers(value.trim());
                if (res?.status) {
                    setSearchResults(res.data || []);
                }
            } catch (err) {
                console.error('Search failed:', err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    };

    const handleResultClick = (userId) => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchDropdown(false);
        setIsSidebarOpen(false);
        navigate(`/profile/${userId}`);
    };

    const handleNotificationClick = async (notif) => {
        // For non-actionable notifications (ACCEPTED, LIKE, etc.), delete from DB on click
        if (notif.type !== 'CONNECTION_REQUEST') {
            try {
                await deleteNotificationById(notif._id);
                setNotifications(prev => prev.filter(n => n._id !== notif._id));
            } catch (err) {
                console.error('Delete notification failed', err);
            }
        } else {
            // For connection requests, just mark as read (user will use Accept/Decline buttons)
            if (!notif.isRead) {
                try {
                    await markAsRead(notif._id);
                    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                } catch (err) {
                    console.error('Mark read failed', err);
                }
            }
        }

        setShowNotifications(false);
        if (notif.type === 'LIKE' && notif.relatedId) {
            navigate(`/posts/${notif.relatedId}`);
        } else if (notif.sender?._id) {
            navigate(`/profile/${notif.sender._id}`);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Mark all read failed', err);
        }
    };

    const handleAcceptRequest = async (e, notif) => {
        e.stopPropagation(); // prevent clicking the notification body
        try {
            await acceptRequest(notif.relatedId); // relatedId is the connectionId
            toast.success("Connection accepted!");
            // Mark as read and remove from UI quickly
            await handleNotificationClick(notif);
            fetchNotifications(); // refresh to get new notifications and drop the old request
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to accept");
        }
    };

    const handleDeclineRequest = async (e, notif) => {
        e.stopPropagation();
        try {
            // Remove connection via sender's ID
            await removeConnection(notif.sender._id);
            toast.success("Request declined");
            fetchNotifications(); // refresh list
        } catch (err) {
            toast.error("Failed to decline");
        }
    };

    return (
        <div className="min-h-screen bg-red-50/30 flex relative">

            {/* --- Floating Notification Bell --- */}
            <div className="fixed top-4 right-4 sm:right-8 z-50 flex items-center justify-end" ref={notificationContainerRef}>
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 bg-white rounded-full shadow-md text-gray-700 hover:text-primary transition-colors border border-gray-100"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in slide-in-from-top-4 duration-200">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs font-semibold text-primary hover:text-red-800 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {notifications.length === 0 ? (
                                    <div className="py-8 text-center text-gray-500 text-sm">
                                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif._id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={clsx(
                                                "p-3 rounded-lg cursor-pointer transition-colors flex items-start space-x-3",
                                                !notif.isRead ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden shadow-sm">
                                                <img
                                                    src={notif.sender?.avatar || DEFAULT_PROFILE_IMAGE}
                                                    alt="User"
                                                    className="w-full h-full object-cover"
                                                    onError={e => { e.target.src = DEFAULT_PROFILE_IMAGE }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800 leading-snug">
                                                    <span className="font-semibold text-gray-900">{notif.sender?.fullName}</span>
                                                    {notif.type === 'CONNECTION_REQUEST' && " wants to connect with you."}
                                                    {notif.type === 'CONNECTION_ACCEPTED' && " accepted your connection request."}
                                                    {notif.type === 'LIKE' && " liked your post."}
                                                </p>

                                                {/* Action Buttons for Connection Requests */}
                                                {notif.type === 'CONNECTION_REQUEST' && (
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <button
                                                            onClick={(e) => handleAcceptRequest(e, notif)}
                                                            className="flex items-center text-xs font-bold px-3 py-1.5 bg-primary text-white rounded-full hover:bg-red-700 transition"
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-1" /> Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeclineRequest(e, notif)}
                                                            className="flex items-center text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                                                        </button>
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notif.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* --- End Notification Bell --- */}


            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:flex md:w-64 md:flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-center h-20 border-b border-red-100 bg-primary shadow-inner">
                    <h1 className="text-xl font-bold text-white tracking-wider uppercase">Dekho Blog</h1>
                </div>

                {/* Search Bar */}
                <div className="px-4 py-3 border-b border-gray-100" ref={searchContainerRef}>
                    <div className="relative">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0 mr-2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                                placeholder="Search people..."
                                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); }}
                                    className="ml-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Results Dropdown */}
                        {showSearchDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden max-h-64 overflow-y-auto">
                                {searchLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((u) => (
                                        <button
                                            key={u._id}
                                            onClick={() => handleResultClick(u._id)}
                                            className="w-full flex items-center px-3 py-2.5 hover:bg-red-50 transition-colors text-left group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mr-3">
                                                <img
                                                    src={u.avatar || DEFAULT_PROFILE_IMAGE}
                                                    alt={u.fullName}
                                                    className="w-full h-full object-cover"
                                                    onError={e => { e.target.src = DEFAULT_PROFILE_IMAGE }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 group-hover:text-primary truncate">{u.fullName}</p>
                                                <p className="text-xs text-gray-400 truncate">@{u.userName}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-center text-sm text-gray-400">
                                        No users found for &ldquo;{searchQuery}&rdquo;
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={clsx(
                                        isActive(item.href)
                                            ? 'bg-red-50 text-red-800 border-l-4 border-primary'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-red-700',
                                        'group flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all'
                                    )}
                                >
                                    <Icon className={clsx(
                                        isActive(item.href) ? 'text-primary' : 'text-gray-400 group-hover:text-red-500',
                                        'mr-3 flex-shrink-0 h-5 w-5'
                                    )} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="flex-shrink-0 flex border-t border-red-50 p-6 bg-gray-50/50">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center mb-6">
                            <div className="inline-block h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <img
                                    src={DEFAULT_PROFILE_IMAGE}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold text-gray-800">{user?.fullName || 'User'}</p>
                                <p className="text-xs font-medium text-gray-500 truncate w-32">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-full text-white bg-primary hover:bg-red-900 shadow-md hover:shadow-lg transition-all focus:outline-none"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="bg-white shadow-sm md:hidden border-b border-red-50 pr-16">
                    <div className="py-4 px-4 sm:px-6 flex justify-between items-center">
                        <h1 className="text-lg font-bold text-red-800 uppercase tracking-tight">Dekho Blog</h1>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-md text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-red-50/20 to-white pt-16 md:pt-8 w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

