import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Briefcase, Globe, Phone, TrendingUp, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import useEmblaCarousel from 'embla-carousel-react';

const QUICK_REPLIES = [
  'Что такое Exfusion?',
  'Как начать зарабатывать?',
  'Это безопасно?',
];

const POPO_INFO = [
  { icon: Briefcase, text: "Более 10 лет в финансах" },
  { icon: Globe, text: "Просто о сложном" },
  { icon: Phone, text: "Всегда на связи" },
  { icon: TrendingUp, text: "Строим пассивный доход" },
];

const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

  const handleQuickReply = (question: string) => {
    localStorage.setItem('maria-initial-question', question);
    setLocation('/maria');
  };

  const goToMaria = () => {
    setLocation('/maria');
  };

  return (
    <div className="p-4 pb-24 space-y-4 bg-[#F7F7F7] min-h-screen">
      {/* Block 1: Alexander Introduction - Stories Style */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 card-elevated bg-white p-4 rounded-3xl overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <div>
                 <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">LIFESTYLE-ЛИДЕР</p>
                 <h1 className="text-xl font-bold leading-tight" style={{ fontWeight: 700 }}>Александр Попп</h1>
               </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {POPO_INFO.map((item, idx) => (
                  <div key={idx} className="flex-[0_0_85%] min-w-0 pl-1 first:pl-0">
                    <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3 h-14">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-xs font-medium text-gray-700 leading-tight">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-1 justify-center mt-1">
              {[0, 1, 2, 3].map((_, i) => (
                <div key={i} className="h-1 w-6 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary/40"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 3 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Block 2: Maria Chat - Main Accent */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 card-elevated bg-white p-5 rounded-3xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
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
            
            {/* Chat Bubble */}
            <div className="pl-1">
              <div className="chat-bubble chat-bubble-incoming !max-w-full">
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  Привет! Давай начнём с простого. Что тебе сейчас ближе?
                </p>
              </div>
            </div>

            {/* Quick Reply Buttons */}
            <div className="space-y-2 pt-1">
              {QUICK_REPLIES.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickReply(question)}
                  className="w-full px-4 py-3.5 text-sm font-semibold bg-gray-50/50 border border-gray-100 text-gray-800 rounded-2xl hover:bg-white hover:border-primary/30 hover:shadow-sm transition-all flex items-center justify-between group active:scale-[0.98]"
                  data-testid={`quick-reply-${question.slice(0, 10)}`}
                >
                  <span>{question}</span>
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors">
                    <TrendingUp className="w-3 h-3 rotate-90" />
                  </div>
                </button>
              ))}
            </div>

            {/* Main CTA */}
            <button
              onClick={goToMaria}
              className="w-full py-4 text-base font-bold text-white rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: '#00C853' }}
              data-testid="cta-ask-maria"
            >
              <MessageCircle className="w-5 h-5" />
              Написать Марии
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default HomePage;
