import React, { useEffect, useState } from 'react';
import { getDashboardData, getTrendingPosts } from '../services/analyticsService';
import { TrendingUp, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, trendingRes] = await Promise.all([
                getDashboardData(),
                getTrendingPosts()
            ]);

            if (dashboardRes.status) {
                setDashboardData(dashboardRes.data);
            }
            if (trendingRes.status) {
                setTrendingPosts(trendingRes.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Posts</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.totalPosts}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Views</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.totalViews}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Comments</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.totalComments}</p>
                    </div>
                </div>
            )}

            {/* Trending Posts Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Today's Trending Posts
                </h2>

                {trendingPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendingPosts.map((post) => (
                            <div key={post._id}>
                                <PostCard post={post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
                        <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p>No trending posts yet today. Check back later!</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Dashboard;
