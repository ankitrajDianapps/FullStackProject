import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSavedPosts, unsavePost } from '../services/savedService';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { Bookmark, BookmarkX, Calendar, User, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const SavedPosts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    const fetchSavedPosts = async () => {
        try {
            setLoading(true);
            const response = await getSavedPosts();
            if (response?.status && Array.isArray(response.data)) {
                setPosts(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch saved posts:', err);
            toast.error('Failed to load saved posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    const handleUnsave = async (postId, e) => {
        e.preventDefault();
        e.stopPropagation();
        setRemovingId(postId);
        try {
            await unsavePost(postId);
            setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
            toast.success('Post removed from saved list');
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove post');
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bookmark className="w-6 h-6 fill-current text-gray-900" />
                        Saved Posts
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {posts.length} {posts.length === 1 ? 'post' : 'posts'} saved
                    </p>
                </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && posts.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                    <Bookmark className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No saved posts yet</h3>
                    <p className="text-gray-500 mb-6 text-sm">
                        When you save a post, it will appear here for easy access later.
                    </p>
                    <Button onClick={() => navigate('/feed')}>
                        Browse the Feed
                    </Button>
                </div>
            )}

            {/* Post cards */}
            {!loading && posts.length > 0 && (
                <div className="space-y-4">
                    {posts.map(post => {
                        const postId = post._id || post.id;
                        return (
                            <Link
                                key={postId}
                                to={`/posts/${postId}`}
                                className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden group"
                            >
                                <div className="flex">
                                    {/* Featured image */}
                                    {post.featuredImage && (
                                        <div className="w-40 h-32 flex-shrink-0 overflow-hidden">
                                            <img
                                                src={post.featuredImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={e => { e.target.src = 'https://via.placeholder.com/160x128?text=No+Image'; }}
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                                        <div>
                                            {post.category && (
                                                <span className="inline-block bg-red-50 text-primary text-xs font-bold uppercase px-2 py-0.5 rounded mb-2">
                                                    {post.category}
                                                </span>
                                            )}
                                            <h2 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                                {post.title}
                                            </h2>
                                            {post.excerpt && (
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                {post.author && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        {post.author.fullName || post.author.userName}
                                                    </span>
                                                )}
                                                {post.publishedAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(post.publishedAt)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Unsave button */}
                                            <button
                                                onClick={(e) => handleUnsave(postId, e)}
                                                disabled={removingId === postId}
                                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-full hover:bg-red-50 disabled:opacity-50"
                                                title="Remove from saved"
                                            >
                                                <BookmarkX className="w-4 h-4" />
                                                <span>{removingId === postId ? 'Removing...' : 'Remove'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SavedPosts;
