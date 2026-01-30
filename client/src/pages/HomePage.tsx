import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Briefcase, Globe, Phone, TrendingUp, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

const QUICK_REPLIES = [
  'Что такое Exfusion?',
  'Как начать зарабатывать?',
  'Это безопасно?',
];

const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [displayText, setDisplayText] = useState("");
  const fullText = "Привет, я Мария ассистент Александра. Расскажу тебе про Exfusion и помогу разобраться. Что тебя интересует?";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const handleQuickReply = (question: string) => {
    localStorage.setItem('maria-initial-question', question);
    setLocation('/maria');
  };

  const goToMaria = () => {
    setLocation('/maria');
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Block 1: Alexander Introduction */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 card-elevated bg-white p-6 rounded-3xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold leading-tight tracking-tight" style={{ fontWeight: 700 }}>Александр Попп</h1>
              <p className="text-base font-medium" style={{ color: '#666666' }}>Твой проводник в мир пассивного дохода</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">Более 10 лет в финансах</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">Просто о сложном</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">Всегда на связи</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">Строим доход</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Block 2: Maria Chat - Messenger Style (Variant 3) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 card-elevated bg-white p-5 rounded-3xl">
          <div className="space-y-4">
            {/* Maria Messenger UI */}
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <div className="relative flex-shrink-0 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/10">
                    <span className="text-xs font-bold text-primary">M</span>
                  </div>
                  <div className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="chat-bubble chat-bubble-incoming !max-w-[85%] !p-3.5 !bg-gray-50 border border-gray-100 min-h-[60px]">
                  <p className="text-[14px] text-gray-800 leading-relaxed">
                    {displayText}
                    {displayText.length < fullText.length && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/50 animate-pulse align-middle" />
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-10">
                <span className="text-[10px] font-semibold text-green-500">Мария онлайн</span>
              </div>
            </div>

            {/* Quick Reply Buttons - Compact Telegram Style */}
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_REPLIES.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickReply(question)}
                  className="px-4 py-2 text-xs font-medium bg-transparent border border-primary/40 text-primary rounded-full hover:bg-primary/5 transition-colors active:scale-95"
                  data-testid={`quick-reply-${question.slice(0, 10)}`}
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Main CTA Button */}
            <button
              onClick={goToMaria}
              className="w-full py-3.5 text-base font-semibold text-white rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ backgroundColor: '#00C853' }}
              data-testid="cta-ask-maria"
            >
              <MessageCircle className="w-5 h-5" />
              Спросить Марию
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default HomePage;
