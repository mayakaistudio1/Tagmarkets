import React from "react";
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

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">Более 10 лет в финансах</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">Просто о сложном</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">Всегда на связи</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">Строим пассивный доход</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Block 2: Maria Chat - Telegram Style */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 card-elevated bg-white p-5 rounded-3xl">
          <div className="space-y-4">
            {/* Maria Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">M</span>
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ fontWeight: 700 }}>Мария</h2>
                <p className="text-xs" style={{ color: '#666666' }}>AI-ассистент Александра</p>
              </div>
            </div>
            
            {/* Chat Bubble - Telegram Style */}
            <div className="pl-2">
              <div className="chat-bubble chat-bubble-incoming">
                <p className="text-sm text-gray-800 leading-relaxed">
                  Привет! Расскажу тебе про Exfusion и помогу разобраться. Что тебя интересует?
                </p>
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
