import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/postService';
import { generateAIContent, summarizeAIContent, refineAIContent } from '../services/aiService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Sparkles, Wand2, FileText, Loader2, RefreshCw } from 'lucide-react';

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

    const [aiLoading, setAiLoading] = useState({
        generate: false,
        summarize: false,
        refine: false
    });

    const handleAIGenerate = async () => {
        if (!formData.title) {
            toast.error('Please enter a title first!');
            return;
        }
        setAiLoading(prev => ({ ...prev, generate: true }));
        try {
            const response = await generateAIContent(formData.title);
            if (response.status) {
                setFormData(prev => ({ ...prev, content: response.data.content }));
                toast.success('Draft generated! ✨');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate draft');
        } finally {
            setAiLoading(prev => ({ ...prev, generate: false }));
        }
    };

    const handleAISummarize = async () => {
        if (!formData.content) {
            toast.error('Please write some content first!');
            return;
        }
        setAiLoading(prev => ({ ...prev, summarize: true }));
        try {
            const response = await summarizeAIContent(formData.content);
            if (response.status) {
                setFormData(prev => ({ ...prev, excerpt: response.data.summary }));
                toast.success('Excerpt generated! 📝');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to summarize');
        } finally {
            setAiLoading(prev => ({ ...prev, summarize: false }));
        }
    };

    const handleAIRefine = async (mode = 'improve') => {
        if (!formData.content) {
            toast.error('Please write some content first!');
            return;
        }
        setAiLoading(prev => ({ ...prev, refine: true }));
        try {
            const response = await refineAIContent(formData.content, mode);
            if (response.status) {
                setFormData(prev => ({ ...prev, content: response.data.content }));
                toast.success('Content refined! 🪄');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to refine content');
        } finally {
            setAiLoading(prev => ({ ...prev, refine: false }));
        }
    };

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

                <div className="relative group">
                    <Input
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter post title"
                    />
                    <button
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={aiLoading.generate}
                        className="absolute right-0 top-0 flex items-center space-x-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2 py-1 rounded-bl-lg rounded-tr-md border-l border-b border-primary/10 disabled:opacity-50"
                        title="Generate draft using AI"
                    >
                        {aiLoading.generate ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Sparkles className="w-3 h-3" />
                        )}
                        <span>AI Draft</span>
                    </button>
                </div>

                <div className="relative group">
                    <Input
                        label="Excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        required
                        placeholder="Short summary of the post"
                    />
                    <button
                        type="button"
                        onClick={handleAISummarize}
                        disabled={aiLoading.summarize}
                        className="absolute right-0 top-0 flex items-center space-x-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 px-2 py-1 rounded-bl-lg rounded-tr-md border-l border-b border-amber-100 disabled:opacity-50"
                        title="Auto-summarize using AI"
                    >
                        {aiLoading.summarize ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <FileText className="w-3 h-3" />
                        )}
                        <span>AI Summarize</span>
                    </button>
                </div>

                <div className="w-full relative">
                    <div className="flex justify-between items-end mb-1">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => handleAIRefine('improve')}
                                disabled={aiLoading.refine}
                                className="flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-all border border-indigo-100 disabled:opacity-50"
                            >
                                {aiLoading.refine ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                <span>Refine Writing</span>
                            </button>
                        </div>
                    </div>
                    <textarea
                        id="content"
                        name="content"
                        rows={12}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y min-h-[300px]"
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
