import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostById, likePost, unlikePost, deletePost } from '../services/postService';
import { getAllComments, addComment, deleteComment } from '../services/commentService';
import { savePost, unsavePost, isPostSaved } from '../services/savedService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import Button from '../components/ui/Button';
import CommentItem from '../components/CommentItem';
import { Heart, MessageCircle, User, Trash2, ArrowLeft, ChevronDown, ChevronUp, Reply, Edit2, BarChart2, X, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPostAnalytics } from '../services/analyticsService';
import { DEFAULT_PROFILE_IMAGE } from '../utils/constants';

const PostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // UI States
    const [showComments, setShowComments] = useState(true);
    // Mimicking a reply input toggle for simulation, though backend is flat for now
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    // Nested replies state
    const [replies, setReplies] = useState({}); // { commentId: [replies] }
    const [loadingReplies, setLoadingReplies] = useState({}); // { commentId: bool }
    const [expandedComments, setExpandedComments] = useState({}); // { commentId: bool }

    // Analytics Modal State
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const fetchPostData = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getPostById(id);
            console.log('Post details response:', response);

            // Handle both {status, data} and direct data responses
            const postData = response.status !== undefined ? response.data : response;

            if (postData && (postData._id || postData.id)) {
                setPost(postData);
                setIsLiked(postData.isLikedByUser || false);
            } else {
                setError('Post not found');
            }

            try {
                const commentsResponse = await getAllComments(id);
                const commentsData = commentsResponse.status !== undefined ? commentsResponse.data : commentsResponse;
                if (Array.isArray(commentsData)) {
                    setComments(commentsData);
                }
            } catch (commentErr) {
                console.error('Failed to load comments:', commentErr);
                // Don't set main error if only comments fail
            }
        } catch (err) {
            console.error('Failed to load post:', err);
            setError('Failed to load post details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostData();
        // Fetch save status
        if (id) {
            isPostSaved(id)
                .then(res => {
                    if (res?.status) setIsSaved(res.data?.isSaved || false);
                })
                .catch(() => { }); // silently fail — don't block page load
        }
    }, [id]);

    const handleLike = async () => {
        if (!user) {
            toast.error("Please login to like posts");
            return;
        }

        // Toggle logic
        const previousState = isLiked;
        setIsLiked(!previousState); // Optimistic

        try {
            if (previousState) {
                await unlikePost(id);
                toast.success("Post unliked");
            } else {
                await likePost(id);
                toast.success("Post liked!");
            }
        } catch (err) {
            setIsLiked(previousState); // Revert
            console.error(err);
            toast.error(previousState ? "Failed to unlike" : "Failed to like");
        }
    };

    const handleSave = async () => {
        if (!user) {
            toast.error("Please login to save posts");
            return;
        }

        const previousState = isSaved;
        setIsSaved(!previousState); // Optimistic

        try {
            if (previousState) {
                await unsavePost(id);
                toast.success("Post removed from saved list");
            } else {
                await savePost(id);
                toast.success("Post saved!");
            }
        } catch (err) {
            setIsSaved(previousState); // Revert
            console.error(err);
            toast.error(previousState ? "Failed to unsave post" : "Failed to save post");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        // Optimistic update
        const tempId = Date.now().toString();
        const optimisticComment = {
            _id: tempId,
            content: commentText,
            user: user, // user from AuthContext
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        setComments(prev => [optimisticComment, ...prev]);
        const originalCommentText = commentText;
        setCommentText('');

        try {
            setSubmittingComment(true);
            const response = await addComment(id, originalCommentText);
            if (response.status) {
                toast.success("Comment added successfully!");
                // Update the optimistic comment with real data from server
                setComments(prev => prev.map(c => c._id === tempId ? response.data : c));
            } else {
                // Revert optimistic update if backend failed but returned status: false
                setComments(prev => prev.filter(c => c._id !== tempId));
                setCommentText(originalCommentText);
                toast.error("Failed to add comment");
            }
        } catch (err) {
            console.error(err);
            // Revert optimistic update on error
            setComments(prev => prev.filter(c => c._id !== tempId));
            setCommentText(originalCommentText);
            toast.error("Failed to add comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleReplySubmit = async (e, parentCommentId) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        // Optimistic update for reply
        const tempId = Date.now().toString();
        const optimisticReply = {
            _id: tempId,
            content: replyText,
            user: user,
            parentCommentId: parentCommentId,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        setReplies(prev => ({
            ...prev,
            [parentCommentId]: [optimisticReply, ...(prev[parentCommentId] || [])]
        }));
        setExpandedComments(prev => ({ ...prev, [parentCommentId]: true }));

        const originalReplyText = replyText;
        setReplyText('');
        setReplyingTo(null);

        try {
            setSubmittingReply(true);
            const response = await addComment(id, originalReplyText, parentCommentId);
            if (response.status) {
                toast.success("Reply added successfully!");
                // Update the optimistic reply with real data from server
                setReplies(prev => ({
                    ...prev,
                    [parentCommentId]: (prev[parentCommentId] || []).map(r => r._id === tempId ? response.data : r)
                }));
            } else {
                // Revert
                setReplies(prev => ({
                    ...prev,
                    [parentCommentId]: (prev[parentCommentId] || []).filter(r => r._id !== tempId)
                }));
                setReplyText(originalReplyText);
                setReplyingTo(parentCommentId);
                toast.error("Failed to add reply");
            }
        } catch (err) {
            console.error(err);
            // Revert
            setReplies(prev => ({
                ...prev,
                [parentCommentId]: (prev[parentCommentId] || []).filter(r => r._id !== tempId)
            }));
            setReplyText(originalReplyText);
            setReplyingTo(parentCommentId);
            toast.error("Failed to add reply");
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleViewReplies = async (commentId) => {
        // Toggle if already loaded
        if (expandedComments[commentId] && replies[commentId]) {
            setExpandedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }));
            return;
        }

        try {
            setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
            const response = await getAllComments(id, commentId);
            if (response.status) {
                setReplies(prev => ({ ...prev, [commentId]: response.data }));
                setExpandedComments(prev => ({ ...prev, [commentId]: true }));
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load replies");
        } finally {
            setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await deletePost(id);
                toast.success("Post deleted successfully");
                navigate('/feed');
            } catch (err) {
                toast.error("Failed to delete post");
            }
        }
    };

    const handleViewAnalytics = async () => {
        setShowAnalyticsModal(true);
        setAnalyticsLoading(true);
        try {
            const response = await getPostAnalytics(id);
            if (response.status) {
                setAnalyticsData(response.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load analytics");
            setShowAnalyticsModal(false);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Delete this comment?")) {
            const previousComments = [...comments];
            const previousReplies = { ...replies };

            // Optimistic update: mark as deleted in top-level comments
            setComments(prev => prev.map(c =>
                c._id === commentId ? { ...c, isDeleted: true, content: 'content deleted' } : c
            ));

            // Optimistic update: mark as deleted in replies
            setReplies(prev => {
                const newReplies = { ...prev };
                Object.keys(newReplies).forEach(parentId => {
                    newReplies[parentId] = newReplies[parentId].map(r =>
                        r._id === commentId ? { ...r, isDeleted: true, content: 'content deleted' } : r
                    );
                });
                return newReplies;
            });

            try {
                const response = await deleteComment(commentId);
                if (response.status) {
                    toast.success("Comment deleted");
                } else {
                    // Revert if backend failed
                    setComments(previousComments);
                    setReplies(previousReplies);
                    toast.error("Failed to delete comment");
                }
            } catch (err) {
                console.error(err);
                // Revert on error
                setComments(previousComments);
                setReplies(previousReplies);
                toast.error("Failed to delete comment");
            }
        }
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (error || !post) return <div className="p-10 text-center text-red-600">{error || 'Post not found'}</div>;

    const isAuthor = user && post.author && (user._id === post.author._id || user._id === post.author);

    // Helper to render comments to reuse logic could be here, but for now inline

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {post.featuredImage && (
                    <div className="h-64 w-full bg-gray-200">
                        <img
                            src={post.featuredImage.startsWith('http') ? post.featuredImage : post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'; }}
                        />
                    </div>
                )}
                <div className="p-8">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                        <span className="bg-red-50 text-primary px-2 py-1 rounded-md text-xs font-bold uppercase">{post.category}</span>
                        <span>•</span>
                        <span>{formatDate(post.publishedAt)}</span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                        <Link to={`/profile/${post.author?._id || post.author}`} className="flex items-center group/author">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mr-3 group-hover/author:ring-2 group-hover/author:ring-primary/20 transition-all">
                                <img
                                    src={DEFAULT_PROFILE_IMAGE}
                                    alt={post.author?.userName}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 group-hover/author:text-primary transition-colors">{post.author?.fullName || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{post.author?.bio}</p>
                            </div>
                        </Link>

                        <div className="flex items-center space-x-2">
                            <Button variant="secondary" className="border-blue-200 hover:bg-blue-50 text-blue-600" onClick={handleViewAnalytics}>
                                <BarChart2 className="w-4 h-4 mr-2" /> Analytics
                            </Button>
                            {isAuthor && (
                                <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeletePost}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-800 mb-10 whitespace-pre-wrap">
                        {post.content}
                    </div>

                    <div className="flex items-center space-x-4 border-t border-gray-100 pt-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center px-4 py-2 rounded-full transition-colors ${isLiked
                                ? 'bg-red-50 text-red-600'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{isLiked ? 'Liked' : 'Like'}</span>
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            <span>Comments ({post?.totalComment || 0})</span>
                        </button>

                        <button
                            onClick={handleSave}
                            className={`flex items-center px-4 py-2 rounded-full transition-colors ${isSaved
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <Bookmark className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>

                    {/* Comments Section - Now inside the same card */}
                    {showComments && (
                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Comments
                            </h3>
                            <form onSubmit={handleCommentSubmit} className="mb-8">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-grow">
                                        <textarea
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            rows="3"
                                            placeholder="Add a comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" isLoading={submittingComment}>
                                        Post
                                    </Button>
                                </div>
                            </form>

                            <div className="space-y-1">
                                {comments.map((comment) => (
                                    <CommentItem
                                        key={comment._id}
                                        comment={comment}
                                        user={user}
                                        isPostAuthor={isAuthor}
                                        replies={replies}
                                        loadingReplies={loadingReplies}
                                        expandedComments={expandedComments}
                                        onViewReplies={handleViewReplies}
                                        replyingTo={replyingTo}
                                        setReplyingTo={setReplyingTo}
                                        replyText={replyText}
                                        setReplyText={setReplyText}
                                        onReplySubmit={handleReplySubmit}
                                        submittingReply={submittingReply}
                                        onDelete={handleDeleteComment}
                                        depth={0}
                                    />
                                ))}
                                {comments.length === 0 && (
                                    <p className="text-center text-gray-500 italic py-4">No comments yet. Start the conversation!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Modal */}
            {showAnalyticsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Post Analytics</h3>
                            <button onClick={() => setShowAnalyticsModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {analyticsLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                                </div>
                            ) : analyticsData ? (
                                <div className="space-y-6">
                                    <h4 className="font-medium text-gray-900 line-clamp-2 text-center mb-6">{analyticsData.title}</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg text-center col-span-2">
                                            <p className="text-3xl font-bold text-blue-600">{analyticsData.totalViews || 0}</p>
                                            <p className="text-xs uppercase text-blue-500 font-bold mt-1">Total Views</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg text-center col-span-2">
                                            <p className="text-3xl font-bold text-purple-600">{analyticsData.totalComment || 0}</p>
                                            <p className="text-xs uppercase text-purple-500 font-bold mt-1">Total Comments</p>
                                        </div>
                                        <div className="bg-red-50 p-4 rounded-lg text-center col-span-2">
                                            <p className="text-3xl font-bold text-red-600">{analyticsData.totalLikes || 0}</p>
                                            <p className="text-xs uppercase text-red-500 font-bold mt-1">Total Likes</p>
                                        </div>
                                    </div>

                                    <div className="text-center text-sm text-gray-500 pt-4 border-t">
                                        <p>Author: <span className="font-semibold text-gray-700">{analyticsData.author}</span></p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No data available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetails;
