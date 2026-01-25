import React, { useEffect, useState } from 'react';
import { getOwnPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

import { useAuth } from '../context/AuthContext';
import { publishDraftPost } from '../services/postService';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

const MyPosts = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await getOwnPosts();
            if (Array.isArray(response)) {
                setPosts(response);
            } else if (response.status && Array.isArray(response.data)) {
                setPosts(response.data);
            } else {
                setPosts([]);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setPosts([]);
            } else {
                console.error(err);
                setError('Failed to load your posts.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (postId) => {
        if (!window.confirm("Are you sure you want to publish this post?")) return;

        try {
            await publishDraftPost(postId);
            toast.success("Post published successfully!");
            fetchPosts(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error("Failed to publish post");
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
                <Link to="/create-post">
                    <Button>Create New Post</Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                    {error}
                </div>
            )}

            {posts.length === 0 && !loading && !error ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">You haven't published any posts yet</h3>
                    <div className="mt-6">
                        <Link to="/create-post">
                            <Button>Create Post</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <div key={post._id} className="relative group">
                            <PostCard post={post} authorOverride={user} />

                            {/* Overlay Actions */}
                            <div className="absolute top-2 right-2 flex space-x-2 z-10">
                                {post.status === 'draft' && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); handlePublish(post._id); }}
                                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md transition-colors"
                                        title="Publish Now"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Status Badge Override if needed */}
                            {post.status === 'draft' && (
                                <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold z-10">
                                    DRAFT
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPosts;
