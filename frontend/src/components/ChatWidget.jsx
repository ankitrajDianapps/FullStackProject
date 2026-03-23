import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { askChatbot } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I am Dekho Bot. Need help with the website features?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        if (!user) {
            toast.error('Please login to use the Chat Assistant');
            return;
        }

        const userMsg = message;
        setMessage('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await askChatbot(userMsg);
            if (response.status) {
                setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 h-[500px] mb-4 rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Dekho Bot</h3>
                                <div className="flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-white/80">Online Assistant</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-md transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-2`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${msg.role === 'user' ? 'bg-primary border-primary' : 'bg-white border-gray-100'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            <User className="w-4 h-4 text-white" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-primary" />
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask about features..."
                            className="flex-1 text-sm bg-gray-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !message.trim()}
                            className="bg-primary text-white p-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative p-4 rounded-2xl shadow-xl transition-all duration-300 transform active:scale-95 ${isOpen ? 'bg-gray-100 text-gray-600' : 'bg-primary text-white hover:shadow-primary/40 hover:-translate-y-1'
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[8px] items-center justify-center font-bold">1</span>
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
