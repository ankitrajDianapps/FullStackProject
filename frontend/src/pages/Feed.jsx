import React, { useEffect, useState } from 'react';
import { getAllPublishedPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const postsPerPage = 9; // Changed to 9 for better grid layout

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
            if (err.response?.status === 404) {
                // No posts on this page
                setPosts([]);
                setHasMore(false);
            } else {
                setError('Failed to load posts.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage]);

    // Filter posts based on search and category (client-side)
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories from current page
    const categories = ['all', ...new Set(posts.map(post => post.category).filter(Boolean))];

    const handleNextPage = () => {
        if (hasMore) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading && currentPage === 1) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Explore Posts</h1>
                    <p className="text-gray-500 mt-1">Discover content from the community</p>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category === 'all' ? 'All' : category}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                    {error}
                </div>
            )}

            {/* Posts Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
            ) : filteredPosts.length === 0 && !error ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || selectedCategory !== 'all'
                            ? 'Try adjusting your filters'
                            : currentPage > 1
                                ? 'No more posts available'
                                : 'No published posts available yet'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-500 mb-2">
                        Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} (Page {currentPage})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-center space-x-4 pt-8">
                        <Button
                            variant="secondary"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="flex items-center"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>

                        <span className="text-sm text-gray-600 font-medium">
                            Page {currentPage}
                        </span>

                        <Button
                            variant="secondary"
                            onClick={handleNextPage}
                            disabled={!hasMore || filteredPosts.length < postsPerPage}
                            className="flex items-center"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Feed;
