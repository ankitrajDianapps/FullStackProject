import React from 'react';
import { Link } from 'react-router-dom';
import { User, Edit2, Reply, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import Button from './ui/Button';
import { DEFAULT_PROFILE_IMAGE } from '../utils/constants';

const CommentItem = ({
    comment,
    user,
    isPostAuthor,
    replies,
    loadingReplies,
    expandedComments,
    onViewReplies,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    onReplySubmit,
    submittingReply,
    onDelete,
    depth = 0
}) => {
    const isOwner = user && comment.user && user._id === comment.user._id;
    const canDelete = isOwner || isPostAuthor;
    const hasReplies = expandedComments[comment._id];
    const commentReplies = replies[comment._id] || [];
    const isLoading = loadingReplies[comment._id];
    const isDeleted = comment.isDeleted || false;

    return (
        <div className={`group ${depth > 0 ? 'ml-4 lg:ml-8 border-l border-gray-100 pl-4 py-1' : 'border-b border-gray-100 py-3 last:border-0'} ${isDeleted ? 'opacity-60' : ''}`}>
            <div className={`flex space-x-3 transition-colors ${depth > 0 ? '' : ''}`}>
                <Link to={`/profile/${comment.user?._id || comment.user}`} className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mt-1 hover:ring-2 hover:ring-primary/20 transition-all">
                    <img src={DEFAULT_PROFILE_IMAGE} alt="User" className="h-full w-full object-cover" />
                </Link>
                <div className="flex-grow">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                                <Link to={`/profile/${comment.user?._id || comment.user}`} className="hover:text-primary transition-colors">
                                    <h4 className={`text-sm font-semibold ${isDeleted ? 'text-gray-400' : 'text-gray-900'}`}>
                                        {comment.user?.fullName || 'Unknown User'}
                                    </h4>
                                </Link>
                                {isDeleted && <span className="ml-2 text-xs font-normal italic">(deleted)</span>}
                                <span className="text-xs text-gray-400">• {formatDate(comment.createdAt)}</span>
                                {comment.createdAt !== comment.updatedAt && !isDeleted && (
                                    <span className="text-xs text-gray-400 flex items-center" title="Edited">
                                        <Edit2 className="w-3 h-3 mr-0.5" />
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm mt-0.5 leading-relaxed ${isDeleted ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                                {comment.content}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-2">
                        {/* Actions Bar */}
                        {!isDeleted && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                className="text-gray-500 hover:text-primary text-xs font-medium flex items-center transition-colors"
                            >
                                Reply
                            </button>
                        )}

                        <button
                            onClick={() => onViewReplies(comment._id)}
                            className="text-gray-500 hover:text-primary text-xs font-medium flex items-center transition-colors"
                        >
                            {hasReplies ? (
                                <>Hide Replies</>
                            ) : (
                                <>View Replies {commentReplies.length > 0 && `(${commentReplies.length})`}</>
                            )}
                        </button>

                        {canDelete && !isDeleted && (
                            <button onClick={() => onDelete(comment._id)} className="text-gray-400 hover:text-red-600 text-xs flex items-center transition-colors" title="Delete">
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment._id && (
                        <form onSubmit={(e) => onReplySubmit(e, comment._id)} className="mt-2 flex items-start space-x-2 animate-fade-in-down">
                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                <img src={DEFAULT_PROFILE_IMAGE} alt="User" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-grow flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    className="flex-grow px-3 py-1.5 border border-gray-300 rounded-full text-xs focus:outline-none focus:border-primary"
                                    autoFocus
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={submittingReply}
                                    className="p-1.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
                                >
                                    {submittingReply ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Reply className="w-3 h-3" transform="scale(-1, 1)" />}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Recursive Replies */}
            {hasReplies && (
                <div className="mt-2 space-y-2">
                    {isLoading && <div className="text-xs text-gray-500 ml-11">Loading replies...</div>}

                    {!isLoading && commentReplies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            user={user}
                            isPostAuthor={isPostAuthor}
                            replies={replies}
                            loadingReplies={loadingReplies}
                            expandedComments={expandedComments}
                            onViewReplies={onViewReplies}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            onReplySubmit={onReplySubmit}
                            submittingReply={submittingReply}
                            onDelete={onDelete}
                            depth={depth + 1}
                        />
                    ))}

                    {!isLoading && commentReplies.length === 0 && (
                        <p className="text-xs text-gray-500 ml-11 italic">No replies yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
