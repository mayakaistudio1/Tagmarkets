import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const languages: Language[] = ['ru', 'en', 'de'];
  const cycleLanguage = () => {
    const idx = languages.indexOf(language);
    setLanguage(languages[(idx + 1) % languages.length]);
  };

  const goToMaria = () => {
    setLocation('/maria');
  };

  const handleQuickReply = (question: string) => {
    localStorage.setItem('maria-initial-question', question);
    setLocation('/maria');
  };

  const pdfUrl = { ru: '/jetup-presentation-ru.pdf', en: '/jetup-presentation-en.pdf', de: '/jetup-presentation-de.pdf' }[language];

  const texts = {
    ru: {
      subtitle: 'Ваш вход на финансовые рынки',
      tagline: 'Структура · Прозрачность · Контроль',
      infoTitle: 'О JetUP',
      infoText: 'JetUP — платформа, объединяющая проверенные инструменты для финансовых рынков: Copy-X стратегии, торговые сигналы, обучение и партнёрскую программу. Брокер TAG Markets (лицензия FSC Mauritius). Ваш капитал всегда на вашем счёте.',
      moreDetails: 'Подробнее',
      mariaTitle: 'Мария — ваш ассистент',
      mariaDesc: 'Ответит на вопросы о JetUP в реальном времени',
      liveChat: 'Написать в чат',
      liveVideo: 'Live видеозвонок',
      online: 'онлайн',
      downloadPdf: 'Скачать презентацию',
      pdfDesc: 'PDF на вашем языке',
      faqTitle: 'Частые вопросы',
      quickReplies: ['Что такое JetUP?', 'Как начать?', 'Это безопасно?'],
      faq: [
        { q: 'С чего начать?', a: 'Регистрация → TAG Markets → MetaTrader 5 → Депозит → Доступ к инструментам. Минимум $100.' },
        { q: 'Где мои средства?', a: 'Ваш капитал на вашем счёте у лицензированного брокера TAG Markets. Только вы имеете к нему доступ.' },
        { q: 'Безопасно ли это?', a: 'TAG Markets — лицензированный брокер (FSC Mauritius). JetUP не управляет вашим капиталом.' },
      ],
    },
    en: {
      subtitle: 'Your entry into financial markets',
      tagline: 'Structure · Transparency · Control',
      infoTitle: 'About JetUP',
      infoText: 'JetUP is a platform combining verified tools for financial markets: Copy-X strategies, trading signals, education, and a partner program. Broker: TAG Markets (FSC Mauritius licensed). Your capital always stays in your account.',
      moreDetails: 'Learn more',
      mariaTitle: 'Maria — your assistant',
      mariaDesc: 'Answers your questions about JetUP in real time',
      liveChat: 'Start text chat',
      liveVideo: 'Live video call',
      online: 'online',
      downloadPdf: 'Download presentation',
      pdfDesc: 'PDF in your language',
      faqTitle: 'FAQ',
      quickReplies: ['What is JetUP?', 'How to start?', 'Is it safe?'],
      faq: [
        { q: 'How do I get started?', a: 'Register → TAG Markets → MetaTrader 5 → Deposit → Access tools. Minimum $100.' },
        { q: 'Where are my funds?', a: 'Your capital stays in your personal account with licensed broker TAG Markets. Only you have access.' },
        { q: 'Is it safe?', a: 'TAG Markets is a licensed broker (FSC Mauritius). JetUP does not manage your capital.' },
      ],
    },
    de: {
      subtitle: 'Ihr Zugang zu den Finanzmärkten',
      tagline: 'Struktur · Transparenz · Kontrolle',
      infoTitle: 'Über JetUP',
      infoText: 'JetUP ist eine Plattform mit verifizierten Tools für Finanzmärkte: Copy-X Strategien, Handelssignale, Ausbildung und Partnerprogramm. Broker: TAG Markets (FSC Mauritius lizenziert). Ihr Kapital bleibt immer auf Ihrem Konto.',
      moreDetails: 'Mehr erfahren',
      mariaTitle: 'Maria — Ihre Assistentin',
      mariaDesc: 'Beantwortet Ihre Fragen zu JetUP in Echtzeit',
      liveChat: 'Chat starten',
      liveVideo: 'Live-Videoanruf',
      online: 'online',
      downloadPdf: 'Präsentation herunterladen',
      pdfDesc: 'PDF in Ihrer Sprache',
      faqTitle: 'Häufige Fragen',
      quickReplies: ['Was ist JetUP?', 'Wie fange ich an?', 'Ist es sicher?'],
      faq: [
        { q: 'Wie fange ich an?', a: 'Registrierung → TAG Markets → MetaTrader 5 → Einzahlung → Zugang zu Tools. Minimum 100 $.' },
        { q: 'Wo ist mein Kapital?', a: 'Ihr Kapital ist auf Ihrem persönlichen Konto beim lizenzierten Broker TAG Markets. Nur Sie haben Zugang.' },
        { q: 'Ist es sicher?', a: 'TAG Markets ist ein lizenzierter Broker (FSC Mauritius). JetUP verwaltet Ihr Kapital nicht.' },
      ],
    },
  }[language]!;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <img src="/jetup-logo.png" alt="JetUP" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg">JetUP</span>
        </div>
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

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-3 space-y-3 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/50 mb-1">
            {texts.tagline}
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {texts.infoText}
          </p>
          <button
            onClick={() => setLocation('/xfusion')}
            className="mt-2 text-[12px] font-semibold text-primary flex items-center gap-1"
            data-testid="link-more-details"
          >
            {texts.moreDetails}
            <ArrowRight size={14} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <button
            onClick={goToMaria}
            className="w-full bg-white rounded-2xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.06)] flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
            data-testid="cta-ask-maria"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center">
                <span className="text-base font-bold text-white">M</span>
              </div>
              <div className="absolute -left-1 -bottom-0.5 flex items-center gap-0.5 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-semibold text-gray-500">{texts.online}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-bold text-gray-900">{texts.mariaTitle}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{texts.mariaDesc}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">{texts.liveChat}</span>
                <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {texts.liveVideo}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <ArrowRight size={16} className="text-white" />
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex gap-2"
        >
          {texts.quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickReply(q)}
              className="flex-1 px-2 py-2 text-[10px] font-medium bg-white border border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-colors active:scale-95 shadow-sm"
              data-testid={`quick-reply-${q.slice(0, 8)}`}
            >
              {q}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <a
            href={pdfUrl}
            download
            className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform"
            data-testid="download-presentation-home"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Download size={18} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-gray-900">{texts.downloadPdf}</p>
              <p className="text-[11px] text-gray-500">{texts.pdfDesc}</p>
            </div>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <h3 className="text-[13px] font-bold text-gray-900 px-4 pt-3 pb-1">{texts.faqTitle}</h3>
          {texts.faq.map((item, idx) => (
            <div key={idx} className="border-t border-gray-50">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                data-testid={`faq-toggle-${idx}`}
              >
                <span className="text-[12px] font-semibold text-gray-800">{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <p className="text-[11px] text-gray-500 leading-relaxed px-4 pb-3">{item.a}</p>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
