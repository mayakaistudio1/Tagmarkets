import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Briefcase, Globe, Phone, TrendingUp } from "lucide-react";
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

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Block 1: Alexander Introduction */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border border-gray-100 shadow-sm bg-white p-5 rounded-2xl">
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold leading-tight tracking-tight">Александр Попп</h1>
              <p className="text-base font-medium text-primary">Твой проводник в мир пассивного дохода</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs font-medium text-gray-700">Более 10 лет в финансах</p>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs font-medium text-gray-700">Просто о сложном</p>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs font-medium text-gray-700">Всегда на связи</p>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs font-medium text-gray-700">Строим пассивный доход</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Block 2: About Exfusion */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-gray-100 shadow-sm bg-white p-5 rounded-2xl">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Exfusion</h2>
                <p className="text-sm text-gray-500">Инвестиционная экосистема</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Платформа для создания пассивного дохода с прозрачными условиями и поддержкой на каждом этапе.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Block 3: Maria Chat Start */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-gray-100 shadow-sm bg-white p-5 rounded-2xl">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">M</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">Мария</h2>
                <p className="text-sm text-gray-500">AI-ассистент</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed">
              Привет! Расскажу тебе про Exfusion и помогу разобраться. Что тебя интересует?
            </p>

            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickReply(question)}
                  className="px-4 py-2 text-sm font-medium bg-gray-50 border border-gray-200 text-gray-700 rounded-full hover:bg-primary/5 hover:border-primary/30 transition-colors active:scale-95"
                  data-testid={`quick-reply-${question.slice(0, 10)}`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default HomePage;
