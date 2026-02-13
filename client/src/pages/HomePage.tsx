import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Layers, Shield, Sliders, GraduationCap, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [displayText, setDisplayText] = useState("");
  const fullText = t('home.mariaGreeting');

  useEffect(() => {
    setDisplayText("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [fullText]);

  const quickReplies = [
    t('quick.whatIsJetup'),
    t('quick.howToStart'),
    t('quick.isSafe'),
  ];

  const handleQuickReply = (question: string) => {
    localStorage.setItem('maria-initial-question', question);
    setLocation('/maria');
  };

  const goToMaria = () => {
    setLocation('/maria');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex justify-end">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          data-testid="language-toggle"
        >
          <span className={language === 'ru' ? 'font-bold text-primary' : ''}>RU</span>
          <span className="text-gray-300">|</span>
          <span className={language === 'en' ? 'font-bold text-primary' : ''}>EN</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 card-elevated bg-white p-6 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          <div className="space-y-5 relative">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center">
                  <img src="/jetup-logo.png" alt="JetUP" className="w-11 h-11 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight tracking-tight text-primary">{t('home.title')}</h1>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-primary/50">{t('home.tagline')}</p>
                </div>
              </div>
              <p className="text-[15px] font-medium text-gray-500 mt-2">{t('home.subtitle')}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2.5 p-3 bg-primary/[0.04] rounded-xl border border-primary/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">{t('home.ecosystem')}</p>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-primary/[0.04] rounded-xl border border-primary/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">{t('home.broker')}</p>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-primary/[0.04] rounded-xl border border-primary/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sliders className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">{t('home.control')}</p>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-primary/[0.04] rounded-xl border border-primary/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-medium text-gray-700 leading-tight">{t('home.education')}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 card-elevated bg-white p-5 rounded-3xl">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <div className="relative flex-shrink-0 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center border border-primary/10">
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
                <span className="text-[10px] font-semibold text-green-500">{t('home.mariaOnline')}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {quickReplies.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickReply(question)}
                  className="px-4 py-2 text-xs font-medium bg-transparent border border-primary/30 text-primary rounded-full hover:bg-primary/5 transition-colors active:scale-95"
                  data-testid={`quick-reply-${question.slice(0, 10)}`}
                >
                  {question}
                </button>
              ))}
            </div>

            <button
              onClick={goToMaria}
              className="w-full py-3.5 text-base font-semibold text-white rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 jetup-gradient shadow-md"
              data-testid="cta-ask-maria"
            >
              <MessageCircle className="w-5 h-5" />
              {t('home.askMaria')}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default HomePage;
