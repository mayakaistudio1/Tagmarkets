import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

  const languages: Language[] = ['ru', 'en', 'de'];
  const cycleLanguage = () => {
    const idx = languages.indexOf(language);
    setLanguage(languages[(idx + 1) % languages.length]);
  };

  const features = [
    { icon: Layers, label: t('home.ecosystem') },
    { icon: Shield, label: t('home.broker') },
    { icon: Sliders, label: t('home.control') },
    { icon: GraduationCap, label: t('home.education') },
  ];

  return (
    <div className="h-full flex flex-col px-4 pt-3 pb-2 overflow-hidden">
      <div className="flex justify-end mb-2 flex-shrink-0">
        <button
          onClick={cycleLanguage}
          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          data-testid="language-toggle"
        >
          <span className={language === 'ru' ? 'font-bold text-primary' : 'text-gray-400'}>RU</span>
          <span className="text-gray-200">|</span>
          <span className={language === 'en' ? 'font-bold text-primary' : 'text-gray-400'}>EN</span>
          <span className="text-gray-200">|</span>
          <span className={language === 'de' ? 'font-bold text-primary' : 'text-gray-400'}>DE</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex-shrink-0"
      >
        <div className="flex flex-col items-center text-center mb-3">
          <img src="/jetup-logo.png" alt="JetUP" className="w-16 h-16 object-contain mb-2" />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary/50">
            {t('home.tagline')}
          </p>
        </div>

        <p className="text-[13px] font-medium text-gray-500 mb-3 leading-snug">
          {t('home.subtitle')}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2.5 bg-primary/[0.03] rounded-xl border border-primary/[0.08]"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feat.icon className="w-[14px] h-[14px] text-primary" />
              </div>
              <p className="text-[11px] font-semibold text-gray-700 leading-tight">{feat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mt-3 flex-1 min-h-0 flex flex-col"
      >
        <div className="flex items-start gap-2.5 mb-3">
          <div className="relative flex-shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/10">
              <span className="text-sm font-bold text-primary">M</span>
            </div>
            <div className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-md px-3 py-2.5">
              <p className="text-[13px] text-gray-800 leading-relaxed">
                {displayText}
                {displayText.length < fullText.length && (
                  <span className="inline-block w-[3px] h-[14px] ml-0.5 bg-primary/40 animate-pulse align-middle rounded-full" />
                )}
              </p>
            </div>
            <span className="text-[10px] font-medium text-green-500 mt-1 block ml-1">
              {t('home.mariaOnline')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickReplies.map((question) => (
            <button
              key={question}
              onClick={() => handleQuickReply(question)}
              className="px-3 py-1.5 text-[11px] font-medium bg-transparent border border-primary/25 text-primary rounded-full hover:bg-primary/5 transition-colors active:scale-95"
              data-testid={`quick-reply-${question.slice(0, 10)}`}
            >
              {question}
            </button>
          ))}
        </div>

        <button
          onClick={goToMaria}
          className="w-full py-3 text-[14px] font-semibold text-white rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 jetup-gradient shadow-[0_4px_16px_rgba(124,58,237,0.25)] mt-auto flex-shrink-0"
          data-testid="cta-ask-maria"
        >
          <MessageCircle className="w-[16px] h-[16px]" />
          {t('home.askMaria')}
        </button>
      </motion.div>
    </div>
  );
};

export default HomePage;
