import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/postService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

import toast from 'react-hot-toast';

const CreatePost = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: '',
        featuredImage: '',
        status: 'published' // Default to published for now
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Prepare payload
            const payload = {
                ...formData,
                tags: formData.tags,
                viewCount: 0
            };

            const response = await createPost(payload);

            if (response.status) {
                if (formData.status === 'draft') {
                    toast.success('Draft saved successfully!');
                    navigate('/drafts');
                } else {
                    toast.success('Post published successfully!');
                    navigate(`/posts/${response.data._id}`);
                }
            } else {
                setError('Failed to create post');
                toast.error('Failed to create post');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
                toast.error(err.response.data.message);
            } else {
                setError('Something went wrong.');
                toast.error('Something went wrong.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter post title"
                />

                <Input
                    label="Excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    required
                    placeholder="Short summary of the post"
                />

                <div className="w-full">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                        id="content"
                        name="content"
                        rows={8}
                        className="w-full px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-gray-300"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        placeholder="Write your post content here..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g., Technology"
                    />

                    <Input
                        label="Tags (comma separated)"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g., react, javascript, ui"
                    />
                </div>

                <Input
                    label="Featured Image URL"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                />

                <div className="w-full">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        id="status"
                        name="status"
                        className="w-full px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors border-gray-300 bg-white"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="button" variant="secondary" className="mr-3" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Create Post
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
