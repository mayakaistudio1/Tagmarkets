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

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  const features = [
    { icon: Layers, label: t('home.ecosystem') },
    { icon: Shield, label: t('home.broker') },
    { icon: Sliders, label: t('home.control') },
    { icon: GraduationCap, label: t('home.education') },
  ];

  return (
    <div className="px-5 pt-4 pb-28 space-y-5">
      <div className="flex justify-end">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          data-testid="language-toggle"
        >
          <span className={language === 'ru' ? 'font-bold text-primary' : 'text-gray-400'}>RU</span>
          <span className="text-gray-200">|</span>
          <span className={language === 'en' ? 'font-bold text-primary' : 'text-gray-400'}>EN</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      >
        <div className="flex flex-col items-center text-center mb-5">
          <img src="/jetup-logo.png" alt="JetUP" className="w-24 h-24 object-contain mb-3" />
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-primary/50">
            {t('home.tagline')}
          </p>
        </div>

        <p className="text-[15px] font-medium text-gray-500 mb-5 leading-snug">
          {t('home.subtitle')}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3.5 bg-primary/[0.03] rounded-2xl border border-primary/[0.08]"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feat.icon className="w-[18px] h-[18px] text-primary" />
              </div>
              <p className="text-[12px] font-semibold text-gray-700 leading-tight">{feat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/10">
              <span className="text-sm font-bold text-primary">M</span>
            </div>
            <div className="absolute -right-0.5 -bottom-0.5 w-3 h-3 bg-green-500 border-[2.5px] border-white rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
              <p className="text-[14px] text-gray-800 leading-relaxed">
                {displayText}
                {displayText.length < fullText.length && (
                  <span className="inline-block w-[3px] h-[16px] ml-0.5 bg-primary/40 animate-pulse align-middle rounded-full" />
                )}
              </p>
            </div>
            <span className="text-[11px] font-medium text-green-500 mt-1.5 block ml-1">
              {t('home.mariaOnline')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {quickReplies.map((question) => (
            <button
              key={question}
              onClick={() => handleQuickReply(question)}
              className="px-3.5 py-2 text-[12px] font-medium bg-transparent border border-primary/25 text-primary rounded-full hover:bg-primary/5 transition-colors active:scale-95"
              data-testid={`quick-reply-${question.slice(0, 10)}`}
            >
              {question}
            </button>
          ))}
        </div>

        <button
          onClick={goToMaria}
          className="w-full py-3.5 text-[15px] font-semibold text-white rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 jetup-gradient shadow-[0_4px_16px_rgba(124,58,237,0.25)]"
          data-testid="cta-ask-maria"
        >
          <MessageCircle className="w-[18px] h-[18px]" />
          {t('home.askMaria')}
        </button>
      </motion.div>
    </div>
  );
};

export default HomePage;
