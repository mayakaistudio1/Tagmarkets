import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ru: {
    'home.title': 'Александр Попп',
    'home.subtitle': 'Твой проводник в мир пассивного дохода',
    'home.experience': 'Более 10 лет в финансах',
    'home.simple': 'Просто о сложном',
    'home.available': 'Всегда на связи',
    'home.income': 'Строим доход',
    'home.mariaGreeting': 'Привет, я Мария ассистент Александра. Расскажу тебе про Exfusion и помогу разобраться. Что тебя интересует?',
    'home.mariaOnline': 'Мария онлайн',
    'home.askMaria': 'Спросить Марию',
    'quick.whatIsExfusion': 'Что такое Exfusion?',
    'quick.howToEarn': 'Как начать зарабатывать?',
    'quick.isSafe': 'Это безопасно?',
    'nav.home': 'Главная',
    'nav.xfusion': 'XFusion',
    'nav.chat': 'Общение',
    'nav.application': 'Заявка',
    'chat.maria': 'Мария',
    'chat.online': 'Онлайн',
    'chat.placeholder': 'Напишите сообщение...',
    'chat.greeting': 'Привет! Я Мария, ассистент Александра. Расскажу тебе про Exfusion и помогу разобраться. Что тебя интересует?',
    'chat.typing': 'Мария печатает...',
    'video.startCall': 'Видеозвонок с Марией',
    'video.endCall': 'Завершить',
    'video.connecting': 'Подключение...',
    'app.title': 'Заявка на консультацию',
    'app.name': 'Ваше имя',
    'app.phone': 'Телефон',
    'app.email': 'Email',
    'app.submit': 'Отправить заявку',
    'app.success': 'Заявка отправлена!',
    'xfusion.title': 'Что такое XFusion?',
    'xfusion.desc': 'Глобальная экосистема для копи-трейдинга',
    'xfusion.neofx': 'NeoFX',
    'xfusion.neofxDesc': 'Форекс копи-трейдинг на евро и доллары США',
    'xfusion.tagMarkets': 'Tag Markets',
    'xfusion.tagMarketsDesc': 'Регулируемый брокер, где хранятся ваши деньги',
    'xfusion.howToStart': 'Как начать?',
    'xfusion.startDesc': 'Регистрация, верификация, депозит — и вы в деле',
    'xfusion.minClient': 'Минимум для клиента: $100',
    'xfusion.minPartner': 'Минимум для партнёра: $250',
  },
  en: {
    'home.title': 'Alexander Popp',
    'home.subtitle': 'Your guide to passive income',
    'home.experience': '10+ years in finance',
    'home.simple': 'Making complex simple',
    'home.available': 'Always available',
    'home.income': 'Building income',
    'home.mariaGreeting': "Hi, I'm Maria, Alexander's assistant. I'll tell you about Exfusion and help you understand. What interests you?",
    'home.mariaOnline': 'Maria online',
    'home.askMaria': 'Ask Maria',
    'quick.whatIsExfusion': 'What is Exfusion?',
    'quick.howToEarn': 'How to start earning?',
    'quick.isSafe': 'Is it safe?',
    'nav.home': 'Home',
    'nav.xfusion': 'XFusion',
    'nav.chat': 'Chat',
    'nav.application': 'Apply',
    'chat.maria': 'Maria',
    'chat.online': 'Online',
    'chat.placeholder': 'Type a message...',
    'chat.greeting': "Hi! I'm Maria, Alexander's assistant. I'll tell you about Exfusion and help you figure things out. What interests you?",
    'chat.typing': 'Maria is typing...',
    'video.startCall': 'Video call with Maria',
    'video.endCall': 'End call',
    'video.connecting': 'Connecting...',
    'app.title': 'Consultation Request',
    'app.name': 'Your name',
    'app.phone': 'Phone',
    'app.email': 'Email',
    'app.submit': 'Submit request',
    'app.success': 'Request sent!',
    'xfusion.title': 'What is XFusion?',
    'xfusion.desc': 'Global ecosystem for copy trading',
    'xfusion.neofx': 'NeoFX',
    'xfusion.neofxDesc': 'Forex copy trading on EUR and USD pairs',
    'xfusion.tagMarkets': 'Tag Markets',
    'xfusion.tagMarketsDesc': 'Regulated broker where your funds are stored',
    'xfusion.howToStart': 'How to start?',
    'xfusion.startDesc': 'Register, verify, deposit — and you\'re in',
    'xfusion.minClient': 'Minimum for client: $100',
    'xfusion.minPartner': 'Minimum for partner: $250',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
