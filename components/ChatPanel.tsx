import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage, Phase } from '../types';

interface ChatPanelProps {
    velocity: number;
    phase: Phase;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ velocity, phase }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Flight Computer Online. Telemetry synchronized. Ready for queries regarding relativistic physics.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // Context injection for better answers
            const contextPrompt = `[Current Velocity: ${velocity.toFixed(0)} m/s, Phase: ${phase}] ${userMsg}`;
            
            const stream = await sendMessageToGemini(contextPrompt);
            
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            let fullText = '';
            for await (const chunk of stream) {
                fullText += chunk;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    if (lastMsg.role === 'model') {
                        lastMsg.text = fullText;
                    }
                    return newMsgs;
                });
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "ERROR: Connection to flight computer interrupted.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed bottom-28 right-6 z-30 transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'}`}>
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 rounded-full bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center text-white shadow-lg border border-cyan-400 animate-pulse"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 19.742c-.31.852-.74 1.253-1.398 1.253-.932 0-2.266-2.458-2.909-5.452a11.969 11.969 0 0 1-.447-4.088c.112-2.316.744-4.225 1.767-5.344C6.914 5.204 8.243 4.5 9.778 4.5c1.458 0 2.723.633 3.636 1.614.992 1.066 1.642 2.82 1.765 4.96.064 1.107-.024 2.219-.247 3.253m-1.082 1.554a4.42 4.42 0 0 0-1.026.046c-.731.13-1.332.613-1.63 1.198" />
                    </svg>
                </button>
            )}

            {isOpen && (
                <div className="bg-black/90 border border-gray-700 rounded-lg shadow-2xl flex flex-col h-96 overflow-hidden">
                    <div className="flex justify-between items-center p-3 bg-gray-900 border-b border-gray-700">
                        <h3 className="text-cyan-400 font-mono text-sm font-bold">FLIGHT COMPUTER AI</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded p-2 text-sm font-mono ${
                                    msg.role === 'user' 
                                    ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-700/50' 
                                    : msg.isError ? 'bg-red-900/40 text-red-200 border border-red-700' : 'bg-gray-800 text-gray-300 border border-gray-700'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-cyan-500 text-xs font-mono animate-pulse">Processing...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 bg-gray-900">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about physics..."
                                className="w-full bg-black text-white text-sm font-mono border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="absolute right-2 top-2 text-cyan-500 hover:text-cyan-300 disabled:text-gray-600"
                            >
                                →
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatPanel;