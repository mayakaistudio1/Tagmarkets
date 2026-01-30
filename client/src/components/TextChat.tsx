import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import VideoCallBar from './VideoCallBar';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'maria-chat-history';

const INITIAL_GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content: 'Привет! Я Мария, ассистент Александра. Расскажу тебе про Exfusion и помогу разобраться. Что тебя интересует?',
  timestamp: 0,
};

const QUICK_REPLIES = [
  'Что такое Exfusion?',
  'Как начать зарабатывать?',
  'Это безопасно?',
];

export default function TextChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialQuestion = localStorage.getItem('maria-initial-question');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 1) {
          setMessages(parsed);
          setShowQuickReplies(false);
        } else {
          setMessages([{ ...INITIAL_GREETING, timestamp: Date.now() }]);
          setShowQuickReplies(true);
        }
      } catch (e) {
        console.error('Failed to parse chat history:', e);
        setMessages([{ ...INITIAL_GREETING, timestamp: Date.now() }]);
        setShowQuickReplies(true);
      }
    } else {
      setMessages([{ ...INITIAL_GREETING, timestamp: Date.now() }]);
      setShowQuickReplies(true);
    }

    if (initialQuestion) {
      localStorage.removeItem('maria-initial-question');
      setPendingQuestion(initialQuestion);
    }
    
    isInitializedRef.current = true;
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (pendingQuestion && isInitializedRef.current && messages.length > 0 && !isLoading) {
      const question = pendingQuestion;
      setPendingQuestion(null);
      setTimeout(() => {
        handleSendPending(question);
      }, 300);
    }
  }, [pendingQuestion, messages, isLoading]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSendPending = async (text: string) => {
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/maria/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages
            .filter(m => m.id !== 'greeting')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
            if (data.done) {
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent,
                timestamp: Date.now(),
              };
              setMessages(prev => [...prev, assistantMessage]);
              setStreamingContent('');
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте позже.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/maria/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages
            .filter(m => m.id !== 'greeting')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
            if (data.done) {
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullContent,
                timestamp: Date.now(),
              };
              setMessages(prev => [...prev, assistantMessage]);
              setStreamingContent('');
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извини, что-то пошло не так. Попробуй еще раз!',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const clearHistory = () => {
    setMessages([{ ...INITIAL_GREETING, timestamp: Date.now() }]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors" data-testid="button-back">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
          </Link>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">M</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Мария</h2>
            <span className="text-xs text-green-500 font-medium">Онлайн</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              className="text-gray-400 hover:text-destructive"
              data-testid="button-clear-chat"
            >
              <Trash2 size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Video Call Bar - Fixed at top */}
      <VideoCallBar 
        isActive={isVideoActive}
        onStart={() => setIsVideoActive(true)}
        onEnd={() => setIsVideoActive(false)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed",
                  msg.role === 'user'
                    ? "bg-primary text-black rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming message */}
        {streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-gray-100 text-gray-800 text-[15px] leading-relaxed">
              {streamingContent}
              <span className="inline-block w-1 h-4 ml-1 bg-gray-400 animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies - Fixed above input */}
      {!isLoading && (
        <div className="px-4 py-2 bg-white border-t border-gray-50">
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                className="px-4 py-2 text-sm font-medium bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
                data-testid={`quick-reply-${reply.slice(0, 10)}`}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white safe-area-bottom border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            disabled={isLoading}
            className="flex-1 h-12 px-5 rounded-full bg-gray-50 border-none text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/20"
            data-testid="input-chat-message"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 rounded-full p-0"
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
