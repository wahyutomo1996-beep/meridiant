import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minus } from 'lucide-react';
import api from '@/lib/api';

const INITIAL_MESSAGES = [
  { role: 'assistant', content: 'Halo! Saya asisten Meridiant. Ada yang bisa saya bantu?' }
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const handleMinimize = () => {
    // Hide window, keep conversation history and session
    setIsOpen(false);
  };

  const handleClose = () => {
    // Close and reset the conversation
    setIsOpen(false);
    setMessages(INITIAL_MESSAGES);
    setSessionId(null);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg, session_id: sessionId });
      setSessionId(res.data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi gangguan. Silakan coba lagi.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-[68px] right-4 sm:bottom-5 sm:right-5 z-50" data-testid="chatbot-widget">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[380px] rounded-2xl overflow-hidden anim-scale-in flex flex-col"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--dropdown-border)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 'min(520px, 70vh)',
          }}
          data-testid="chatbot-window"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: 'var(--accent-bg)',
              borderBottom: '1px solid var(--divider)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
              >
                <Bot className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Meridiant CS</p>
                <p className="text-[11px]" style={{ color: 'var(--accent)' }}>Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMinimize}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover-bg"
                title="Minimize"
                aria-label="Minimize chat"
                data-testid="chatbot-minimize-btn"
              >
                <Minus className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover-danger"
                title="Close"
                aria-label="Close chat"
                data-testid="chatbot-close-btn"
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
            style={{ minHeight: '300px', background: 'var(--bg-secondary)' }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'var(--accent)',
                          color: '#ffffff',
                        }
                      : {
                          background: 'var(--card-inner)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--divider)',
                        }
                  }
                  data-testid={`chat-message-${i}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-md text-sm"
                  style={{
                    background: 'var(--card-inner)',
                    border: '1px solid var(--divider)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-3 flex items-center gap-2"
            style={{ borderTop: '1px solid var(--divider)', background: 'var(--bg-secondary)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
              data-testid="chatbot-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl disabled:opacity-40 flex items-center justify-center transition-colors btn-press"
              style={{ background: 'var(--accent)' }}
              data-testid="chatbot-send-btn"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}

      {/* FAB Button - only shown when chat is closed/minimized */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 8px 10px -6px rgba(16, 185, 129, 0.2)',
          }}
          aria-label="Open chat"
          data-testid="chatbot-toggle-btn"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
