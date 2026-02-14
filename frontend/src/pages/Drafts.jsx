import React, { useEffect, useState } from 'react';
import { getDraftPosts, publishDraftPost, deletePost } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import {
    FileClock,
    Send,
    Trash2,
    Eye,
    PenLine,
    Tag,
    FolderOpen,
    Calendar,
    X,
    AlertTriangle,
    FileText,
    PlusSquare
} from 'lucide-react';

const Drafts = () => {
    const { user } = useAuth();
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [publishingId, setPublishingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, postId: null, action: null, title: '' });

    const fetchDrafts = async () => {
        try {
            setLoading(true);
            const response = await getDraftPosts();
            if (response.status && Array.isArray(response.data)) {
                setDrafts(response.data);
            } else if (Array.isArray(response)) {
                setDrafts(response);
            } else {
                setDrafts([]);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setDrafts([]);
            } else {
                console.error(err);
                setError('Failed to load your drafts.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    const openConfirmModal = (postId, action, title) => {
        setConfirmModal({ open: true, postId, action, title });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ open: false, postId: null, action: null, title: '' });
    };

    const handlePublish = async (postId) => {
        closeConfirmModal();
        setPublishingId(postId);
        try {
            await publishDraftPost(postId);
            toast.success('Post published successfully! 🎉');
            setDrafts(prev => prev.filter(d => d._id !== postId));
        } catch (err) {
            console.error(err);
            toast.error('Failed to publish post');
        } finally {
            setPublishingId(null);
        }
    };

    const handleDelete = async (postId) => {
        closeConfirmModal();
        setDeletingId(postId);
        try {
            await deletePost(postId);
            toast.success('Draft deleted.');
            setDrafts(prev => prev.filter(d => d._id !== postId));
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete draft');
        } finally {
            setDeletingId(null);
        }
    };

    const handleConfirm = () => {
        if (confirmModal.action === 'publish') {
            handlePublish(confirmModal.postId);
        } else if (confirmModal.action === 'delete') {
            handleDelete(confirmModal.postId);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-sm text-gray-500 font-medium animate-pulse">Loading your drafts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-100 rounded-xl">
                        <FileClock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Drafts</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'} saved
                        </p>
                    </div>
                </div>
                <Link to="/create-post">
                    <Button className="flex items-center space-x-2">
                        <PlusSquare className="w-4 h-4" />
                        <span>New Post</span>
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Empty State */}
            {drafts.length === 0 && !error ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-5">
                        <FileText className="w-10 h-10 text-amber-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No drafts yet</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                        Start writing a post and save it as a draft. Your unpublished work will appear here.
                    </p>
                    <Link to="/create-post">
                        <Button className="inline-flex items-center space-x-2">
                            <PlusSquare className="w-4 h-4" />
                            <span>Create Your First Draft</span>
                        </Button>
                    </Link>
                </div>
            ) : (
                /* Draft Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {drafts.map((draft, index) => (
                        <div
                            key={draft._id}
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                            style={{ animationDelay: `${index * 80}ms`, animation: 'fadeInUp 0.5s ease-out forwards', opacity: 0 }}
                        >
                            {/* Featured Image / Placeholder */}
                            <div className="relative h-44 w-full bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                                {draft.featuredImage ? (
                                    <img
                                        src={draft.featuredImage}
                                        alt={draft.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.src = '';
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <PenLine className="w-12 h-12 text-amber-200" />
                                    </div>
                                )}

                                {/* Draft Badge */}
                                <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-md">
                                    <FileClock className="w-3 h-3" />
                                    <span>Draft</span>
                                </div>

                                {/* Category Badge */}
                                {draft.category && (
                                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider border border-gray-100 shadow-sm">
                                        {draft.category}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors capitalize">
                                    {draft.title}
                                </h3>

                                {draft.excerpt && (
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                        {draft.excerpt}
                                    </p>
                                )}

                                {!draft.excerpt && draft.content && (
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                        {draft.content.substring(0, 120)}...
                                    </p>
                                )}

                                {/* Tags */}
                                {draft.tags && draft.tags.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-1.5 mb-4">
                                        <Tag className="w-3 h-3 text-gray-400" />
                                        {(typeof draft.tags === 'string' ? draft.tags.split(',') : draft.tags).slice(0, 3).map((tag, i) => (
                                            <span
                                                key={i}
                                                className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium"
                                            >
                                                {typeof tag === 'string' ? tag.trim() : tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Meta */}
                                <div className="flex items-center text-xs text-gray-400 mb-4">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    <span>{new Date(draft.createdAt || draft.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    {/* Publish Button */}
                                    <button
                                        onClick={() => openConfirmModal(draft._id, 'publish', draft.title)}
                                        disabled={publishingId === draft._id}
                                        className="flex-1 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {publishingId === draft._id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Publish</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Preview Button */}
                                    <Link
                                        to={`/posts/${draft._id}`}
                                        className="flex items-center justify-center p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors duration-200"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => openConfirmModal(draft._id, 'delete', draft.title)}
                                        disabled={deletingId === draft._id}
                                        className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-xl transition-colors duration-200 disabled:opacity-50"
                                        title="Delete Draft"
                                    >
                                        {deletingId === draft._id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeConfirmModal}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

                    {/* Modal */}
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'fadeInUp 0.25s ease-out forwards' }}
                    >
                        <button
                            onClick={closeConfirmModal}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>

                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${confirmModal.action === 'publish'
                                ? 'bg-emerald-100'
                                : 'bg-red-100'
                            }`}>
                            {confirmModal.action === 'publish' ? (
                                <Send className="w-6 h-6 text-emerald-600" />
                            ) : (
                                <Trash2 className="w-6 h-6 text-red-500" />
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {confirmModal.action === 'publish' ? 'Publish this post?' : 'Delete this draft?'}
                        </h3>

                        <p className="text-sm text-gray-500 mb-1">
                            {confirmModal.action === 'publish'
                                ? 'This will make your post visible to everyone.'
                                : 'This action cannot be undone. The draft will be permanently removed.'}
                        </p>

                        <p className="text-sm font-semibold text-gray-700 mb-6 line-clamp-1 capitalize">
                            "{confirmModal.title}"
                        </p>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={closeConfirmModal}
                                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-2.5 px-4 font-semibold rounded-xl transition-all text-sm text-white shadow-sm hover:shadow-md ${confirmModal.action === 'publish'
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                                        : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                                    }`}
                            >
                                {confirmModal.action === 'publish' ? 'Yes, Publish' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Drafts;
