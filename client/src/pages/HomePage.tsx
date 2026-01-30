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
    <div className="p-4 pb-24 space-y-6">
      {/* Alexander Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Александр Попп</h1>
          <p className="text-xl font-medium text-primary">Твой проводник в мир пассивного дохода</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors p-4">
            <Briefcase className="w-6 h-6 text-primary mb-2" />
            <p className="text-xs font-medium">Более 10 лет в финансах</p>
          </Card>

          <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors p-4">
            <Globe className="w-6 h-6 text-primary mb-2" />
            <p className="text-xs font-medium">Просто о сложном</p>
          </Card>

          <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors p-4">
            <Phone className="w-6 h-6 text-primary mb-2" />
            <p className="text-xs font-medium">Всегда на связи</p>
          </Card>

          <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors p-4">
            <TrendingUp className="w-6 h-6 text-primary mb-2" />
            <p className="text-xs font-medium">Строим пассивный доход</p>
          </Card>
        </div>
      </motion.div>

      {/* Maria Greeting Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary">M</span>
          </div>
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
            <p className="text-[15px] text-gray-800 leading-relaxed">
              Привет! Я Мария, ассистент Александра. Расскажу тебе про Exfusion и помогу разобраться. Что тебя интересует?
            </p>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2 pl-15">
          {QUICK_REPLIES.map((question) => (
            <button
              key={question}
              onClick={() => handleQuickReply(question)}
              className="px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 hover:border-primary/30 transition-colors active:scale-95 shadow-sm"
              data-testid={`quick-reply-${question.slice(0, 10)}`}
            >
              {question}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
