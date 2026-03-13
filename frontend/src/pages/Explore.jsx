import React, { useEffect, useState } from 'react';
import { getAllPublishedPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import { Search, Filter, ChevronLeft, ChevronRight, Compass, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Navbar from '../components/Navbar';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const postsPerPage = 6;

    const fetchPosts = async (page = 1) => {
        try {
            setLoading(true);
            setError('');
            const response = await getAllPublishedPosts({ page, limit: postsPerPage });

            if (Array.isArray(response)) {
                setPosts(response);
                setHasMore(response.length === postsPerPage);
            } else if (response.status && Array.isArray(response.data)) {
                setPosts(response.data);
                setHasMore(response.data.length === postsPerPage);
            } else {
                setPosts([]);
                setHasMore(false);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load posts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(posts.map(post => post.category).filter(Boolean))];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-primary shadow-lg">
                <Navbar />
            </div>

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center px-3 py-1 bg-red-50 text-primary rounded-full text-sm font-bold tracking-wide uppercase">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Discover Content
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                                Explore the world of <span className="text-primary italic">Creative Ideas</span>
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl">
                                Welcome to our community's public feed. Here you can browse through stories, insights, and perspectives from authors around the globe. No account needed to start reading.
                            </p>
                        </div>
                        <div className="hidden lg:block">
                            <Compass className="w-48 h-48 text-primary opacity-10 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search thousands of posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === category
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary shadow-sm'
                                    }`}
                            >
                                {category === 'all' ? 'All Topics' : category}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl h-96 animate-pulse border border-gray-100 shadow-sm"></div>
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No stories found</h3>
                        <p className="text-gray-500 mt-2">Try searching for something else or exploring a different category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                )}

                {!loading && filteredPosts.length > 0 && (
                    <div className="flex items-center justify-center space-x-6 mt-16 pb-12">
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-8 rounded-full border-gray-200"
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            Prev
                        </Button>
                        <span className="text-sm font-bold text-gray-400">
                            Page {currentPage}
                        </span>
                        <Button
                            variant="secondary"
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={!hasMore}
                            className="px-8 rounded-full border-gray-200"
                        >
                            Next
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                )}
            </div>

            <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
                    <p className="text-white font-bold text-lg">Dekho Blog</p>
                    <p className="text-sm">Join our community to start sharing your own stories.</p>
                    <div className="pt-4 text-xs font-medium uppercase tracking-widest text-gray-600">
                        &copy; 2026 All Rights Reserved
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Explore;
