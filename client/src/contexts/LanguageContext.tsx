import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ru' | 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ru: {
    'home.title': 'JetUP',
    'home.subtitle': 'Ваш вход на финансовые рынки',
    'home.tagline': 'Структура. Прозрачность. Контроль.',
    'home.ecosystem': 'Полная экосистема',
    'home.broker': 'Надёжный брокер',
    'home.control': 'Полный контроль',
    'home.education': 'Обучение',
    'home.mariaGreeting': 'Привет! Я Мария, ассистент JetUP. Расскажу про экосистему и помогу разобраться. Что тебя интересует?',
    'home.mariaOnline': 'Мария онлайн',
    'home.askMaria': 'Спросить Марию',
    'quick.whatIsJetup': 'Что такое JetUP?',
    'quick.howToStart': 'Как начать?',
    'quick.isSafe': 'Это безопасно?',
    'nav.home': 'Главная',
    'nav.jetup': 'JetUP',
    'nav.chat': 'Общение',
    'nav.application': 'Заявка',
    'chat.maria': 'Мария',
    'chat.online': 'Онлайн',
    'chat.placeholder': 'Напишите сообщение...',
    'chat.greeting': 'Привет! Я Мария, ассистент JetUP. Расскажу про экосистему и помогу разобраться. Что тебя интересует?',
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
    'jetup.title': 'Экосистема JetUP',
    'jetup.desc': 'Современная платформа для выхода на финансовые рынки',
    'jetup.copyTrading': 'Copy-X Стратегии',
    'jetup.copyTradingDesc': 'Автоматическое копирование профессиональных стратегий с полным контролем',
    'jetup.signals': 'Торговые сигналы',
    'jetup.signalsDesc': 'Сигналы в реальном времени с точными уровнями входа и анализом',
    'jetup.academy': 'JetUP Академия',
    'jetup.academyDesc': 'Обучение трейдингу, управлению рисками и построению систем',
    'jetup.partner': 'Партнёрская программа',
    'jetup.partnerDesc': 'Структурированные модели дохода на основе реального объёма торгов',
    'jetup.tagMarkets': 'TAG Markets',
    'jetup.tagMarketsDesc': 'Лицензированный брокер — ваш капитал всегда на вашем счёте',
    'jetup.howToStart': 'Как начать?',
    'jetup.startDesc': 'Регистрация → TAG Markets → MetaTrader 5 → Депозит → Доступ к инструментам',
    'jetup.minClient': 'Минимум для клиента: $100',
    'jetup.minPartner': 'Минимум для партнёра: $250',
  },
  en: {
    'home.title': 'JetUP',
    'home.subtitle': 'Your clear entry into the financial markets',
    'home.tagline': 'Structure. Transparency. Control.',
    'home.ecosystem': 'Full ecosystem',
    'home.broker': 'Reliable broker',
    'home.control': 'Full control',
    'home.education': 'Education',
    'home.mariaGreeting': "Hi! I'm Maria, JetUP assistant. I'll tell you about the ecosystem and help you understand. What interests you?",
    'home.mariaOnline': 'Maria online',
    'home.askMaria': 'Ask Maria',
    'quick.whatIsJetup': 'What is JetUP?',
    'quick.howToStart': 'How to get started?',
    'quick.isSafe': 'Is it safe?',
    'nav.home': 'Home',
    'nav.jetup': 'JetUP',
    'nav.chat': 'Chat',
    'nav.application': 'Apply',
    'chat.maria': 'Maria',
    'chat.online': 'Online',
    'chat.placeholder': 'Type a message...',
    'chat.greeting': "Hi! I'm Maria, JetUP assistant. I'll tell you about the ecosystem and help you figure things out. What interests you?",
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
    'jetup.title': 'JetUP Ecosystem',
    'jetup.desc': 'A modern platform for entering the financial markets',
    'jetup.copyTrading': 'Copy-X Strategies',
    'jetup.copyTradingDesc': 'Automatically copy professional strategies with full control',
    'jetup.signals': 'Trading Signals',
    'jetup.signalsDesc': 'Real-time signals with precise entry levels and analysis',
    'jetup.academy': 'JetUP Academy',
    'jetup.academyDesc': 'Trading education, risk management and systems thinking',
    'jetup.partner': 'Partner Program',
    'jetup.partnerDesc': 'Structured income models based on real trading volume',
    'jetup.tagMarkets': 'TAG Markets',
    'jetup.tagMarketsDesc': 'Licensed broker — your capital always stays in your account',
    'jetup.howToStart': 'How to start?',
    'jetup.startDesc': 'Register → TAG Markets → MetaTrader 5 → Deposit → Access tools',
    'jetup.minClient': 'Minimum for client: $100',
    'jetup.minPartner': 'Minimum for partner: $250',
  },
  de: {
    'home.title': 'JetUP',
    'home.subtitle': 'Ihr Zugang zu den Finanzmärkten',
    'home.tagline': 'Struktur. Transparenz. Kontrolle.',
    'home.ecosystem': 'Komplettes Ökosystem',
    'home.broker': 'Zuverlässiger Broker',
    'home.control': 'Volle Kontrolle',
    'home.education': 'Ausbildung',
    'home.mariaGreeting': 'Hallo! Ich bin Maria, die JetUP-Assistentin. Ich erzähle dir alles über das Ökosystem und helfe dir weiter. Was interessiert dich?',
    'home.mariaOnline': 'Maria online',
    'home.askMaria': 'Maria fragen',
    'quick.whatIsJetup': 'Was ist JetUP?',
    'quick.howToStart': 'Wie fange ich an?',
    'quick.isSafe': 'Ist es sicher?',
    'nav.home': 'Startseite',
    'nav.jetup': 'JetUP',
    'nav.chat': 'Chat',
    'nav.application': 'Anfrage',
    'chat.maria': 'Maria',
    'chat.online': 'Online',
    'chat.placeholder': 'Nachricht schreiben...',
    'chat.greeting': 'Hallo! Ich bin Maria, die JetUP-Assistentin. Ich erzähle dir alles über das Ökosystem und helfe dir weiter. Was interessiert dich?',
    'chat.typing': 'Maria tippt...',
    'video.startCall': 'Videoanruf mit Maria',
    'video.endCall': 'Beenden',
    'video.connecting': 'Verbindung wird hergestellt...',
    'app.title': 'Beratungsanfrage',
    'app.name': 'Ihr Name',
    'app.phone': 'Telefon',
    'app.email': 'E-Mail',
    'app.submit': 'Anfrage senden',
    'app.success': 'Anfrage gesendet!',
    'jetup.title': 'JetUP Ökosystem',
    'jetup.desc': 'Eine moderne Plattform für den Einstieg in die Finanzmärkte',
    'jetup.copyTrading': 'Copy-X Strategien',
    'jetup.copyTradingDesc': 'Automatisches Kopieren professioneller Strategien mit voller Kontrolle',
    'jetup.signals': 'Handelssignale',
    'jetup.signalsDesc': 'Echtzeit-Signale mit präzisen Einstiegsniveaus und Analyse',
    'jetup.academy': 'JetUP Akademie',
    'jetup.academyDesc': 'Trading-Ausbildung, Risikomanagement und Systemdenken',
    'jetup.partner': 'Partnerprogramm',
    'jetup.partnerDesc': 'Strukturierte Einkommensmodelle basierend auf realem Handelsvolumen',
    'jetup.tagMarkets': 'TAG Markets',
    'jetup.tagMarketsDesc': 'Lizenzierter Broker — Ihr Kapital bleibt immer auf Ihrem Konto',
    'jetup.howToStart': 'Wie starte ich?',
    'jetup.startDesc': 'Registrierung → TAG Markets → MetaTrader 5 → Einzahlung → Zugang zu Tools',
    'jetup.minClient': 'Minimum für Kunden: 100 $',
    'jetup.minPartner': 'Minimum für Partner: 250 $',
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
