import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/helpers';
import { Eye, MessageCircle, Heart, User } from 'lucide-react';
import { DEFAULT_PROFILE_IMAGE } from '../utils/constants';

const PostCard = ({ post, authorOverride }) => {
    const author = authorOverride || post.author;
    const authorName = author?.fullName || author?.userName || 'Anonymous';
    const authorAvatar = author?.avatar;

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
                {post.featuredImage ? (
                    <img
                        src={post.featuredImage.startsWith('http') ? post.featuredImage : post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-4xl font-bold opacity-20">BLOCK</span>
                    </div>
                )}
                {post.category && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider border border-red-50/50 shadow-sm">
                        {post.category}
                    </span>
                )}
            </div>
            <div className="p-5">
                <Link to={`/profile/${author?._id || author}`} className="flex items-center mb-3 group/author">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mr-2 group-hover/author:ring-2 group-hover/author:ring-primary/20 transition-all">
                        <img
                            src={DEFAULT_PROFILE_IMAGE}
                            alt={authorName}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 group-hover/author:text-primary transition-colors">{authorName}</p>
                        <p className="text-xs text-gray-500">{formatDate(post.publishedAt)}</p>
                    </div>
                </Link>
                <Link to={`/posts/${post._id}`} className="block">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {post.excerpt || post.content.substring(0, 150)}...
                </p>

                <div className="flex items-center justify-between text-gray-500 text-xs pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{post.viewCount || 0}</span>
                        </div>
                        {/* Likes count not strictly in post object from getAllPublishedPosts usually, but let's assume it might be populated or we use separate call. 
                     The backend Post model has likes? Need to check. 
                     No 'likes' field in Post schema in service createPost. 
                     Like is a separate model. 
                     We might not have like count in list view unless aggregated.
                     We'll hide it if missing.
                  */}
                    </div>
                    <Link to={`/posts/${post._id}`} className="text-primary font-medium hover:text-primary-hover">
                        Read more
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
