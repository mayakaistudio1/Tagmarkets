import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";

interface ChatOverlayProps {
  onClose: () => void;
  onTriggerPresentation: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
  type?: "presentation_trigger";
}

const QUICK_REPLIES = [
  "Пассивный доход",
  "Партнёрская программа",
  "Безопасность",
  "Как начать",
];

const AI_RESPONSES: Record<string, string> = {
  "Пассивный доход": "Отличный выбор. В JetUP твой капитал остаётся на твоём брокерском счёте — никаких заморозок. Ты выбираешь стратегию и контролируешь вывод средств. Хочешь узнать подробнее?",
  "Партнёрская программа": "Партнёрская модель JetUP — это несколько источников дохода: комиссия с лотов брокера, доля от торговых сборов биржи и активность по картам. Плюс AI-дупликация для твоей команды.",
  "Безопасность": "Безопасность в JetUP строится на принципе кастодиальности: твои средства всегда на твоём счёте, не у JetUP. Регулируемый брокер, прозрачная структура.",
  "Как начать": "Начать просто: выбери путь — как клиент (пассивный доход) или как партнёр (построение структуры). Я могу показать тебе короткую презентацию, чтобы всё стало понятнее.",
};

const ChatOverlay: React.FC<ChatOverlayProps> = ({ onClose, onTriggerPresentation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Привет! Я — AI-копия Дениса. Ты рассматриваешь пассивный доход или построение команды?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [presentationOffered, setPresentationOffered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessages = (userText: string, aiText: string) => {
    const userMsg: Message = { id: nextId.current++, text: userText, sender: "user" };
    const aiMsg: Message = { id: nextId.current++, text: aiText, sender: "ai" };
    
    setMessages((prev) => [...prev, userMsg]);
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    setTimeout(() => {
      const newMessages: Message[] = [aiMsg];

      if (newCount >= 2 && !presentationOffered) {
        setPresentationOffered(true);
        newMessages.push({
          id: nextId.current++,
          text: "Кстати, у меня есть короткая презентация, которая объяснит всё за 5 минут. Хочешь посмотреть?",
          sender: "ai",
          type: "presentation_trigger",
        });
      }

      setMessages((prev) => [...prev, ...newMessages]);
    }, 800);
  };

  const handleQuickReply = (reply: string) => {
    const aiResponse = AI_RESPONSES[reply] || "Хороший вопрос. Давай разберёмся вместе.";
    addMessages(reply, aiResponse);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    addMessages(text, "Хороший вопрос! Давай я объясню подробнее. В JetUP каждый элемент экосистемы работает как отдельный источник дохода — и всё это под твоим контролем.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <motion.div
        className="ph-chat-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="ph-chat-panel"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="ph-chat-header">
          <div className="ph-chat-header-left">
            <div className="ph-chat-avatar-small">
              <img src="/dennis-photo.png" alt="Dennis" />
            </div>
            <div>
              <span className="ph-chat-name">Dennis AI</span>
              <span className="ph-chat-status">
                <span className="ph-status-dot" />
                Online
              </span>
            </div>
          </div>
          <button className="ph-chat-close" onClick={onClose} data-testid="btn-close-chat">
            <X size={18} />
          </button>
        </div>

        <div className="ph-chat-messages" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`ph-msg ${msg.sender === "user" ? "ph-msg-user" : "ph-msg-ai"}`}>
              {msg.text}
              {msg.type === "presentation_trigger" && (
                <button
                  className="ph-presentation-trigger"
                  onClick={onTriggerPresentation}
                  data-testid="btn-open-presentation"
                >
                  <Sparkles size={16} />
                  Открыть презентацию
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="ph-chat-quick">
          {userMessageCount === 0 && QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              className="ph-quick-chip"
              onClick={() => handleQuickReply(reply)}
              data-testid={`chip-${reply.substring(0, 10)}`}
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="ph-chat-input-row">
          <input
            type="text"
            className="ph-chat-input"
            placeholder="Напиши сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            data-testid="input-chat"
          />
          <button className="ph-chat-send" onClick={handleSend} data-testid="btn-send">
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default ChatOverlay;
