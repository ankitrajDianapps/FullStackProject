import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { User, FileText, Grid } from 'lucide-react';
import { DEFAULT_PROFILE_IMAGE } from '../utils/constants';

const ProfileHome = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                <h1 className="text-4xl font-bold text-gray-900">Welcome to Dekho Blog</h1>
                <p className="text-lg text-gray-600 max-w-md">
                    Share your thoughts, connect with others, and manage your content efficiently.
                </p>
                <div className="flex space-x-4">
                    <Link to="/login">
                        <Button>Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="secondary">Register</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary to-primary-hover"></div>
                <div className="relative px-6 pb-6">
                    <div className="flex flex-col items-center -mt-16">
                        <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                            <img
                                src={DEFAULT_PROFILE_IMAGE}
                                alt={user.userName}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <h1 className="mt-4 text-3xl font-bold text-gray-900">{user.fullName || user.userName}</h1>
                        <p className="text-sm text-gray-500">@{user.userName}</p>
                        {user.bio && <p className="mt-2 text-center text-gray-600 max-w-lg">{user.bio}</p>}

                        <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                            <span>{user.email}</span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center space-x-6">
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg min-w-[100px]">
                            <span className="text-2xl font-bold text-primary">--</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Posts</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg min-w-[100px]">
                            <span className="text-2xl font-bold text-primary">--</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Views</span>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/create-post" className="flex-1 max-w-xs">
                            <Button className="w-full justify-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Create New Post
                            </Button>
                        </Link>
                        <Link to="/my-posts" className="flex-1 max-w-xs">
                            <Button variant="secondary" className="w-full justify-center">
                                <Grid className="w-4 h-4 mr-2" />
                                Manage My Posts
                            </Button>
                        </Link>
                        <Link to="/feed" className="flex-1 max-w-xs">
                            <Button variant="outline" className="w-full justify-center">
                                Browse Feed
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHome;
