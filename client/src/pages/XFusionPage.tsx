import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, FileText, UserPlus, ChevronLeft, Copy, BarChart3, GraduationCap, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const XFusionPage: React.FC = () => {
  const { language, t } = useLanguage();

  const ecosystemItems = language === 'ru' ? [
    { icon: Copy, title: "Copy-X Стратегии", desc: "Автоматическое копирование профессиональных стратегий. 70% прибыли остаётся у клиента.", color: "bg-violet-500/10 text-violet-600" },
    { icon: BarChart3, title: "Торговые сигналы", desc: "Сигналы в реальном времени с точными уровнями входа, Stop Loss/Take Profit и анализом.", color: "bg-purple-500/10 text-purple-600" },
    { icon: GraduationCap, title: "JetUP Академия", desc: "Обучение трейдингу, управление рисками, построение систем и долгосрочный подход.", color: "bg-fuchsia-500/10 text-fuchsia-600" },
    { icon: Users, title: "Партнёрская программа", desc: "Лот-комиссии, Profit Share, Infinity-бонус и Global Pools на основе реального объёма.", color: "bg-indigo-500/10 text-indigo-600" },
    { icon: Shield, title: "TAG Markets", desc: "Лицензированный брокер (FSC Mauritius). Ваш капитал всегда на вашем счёте.", color: "bg-emerald-500/10 text-emerald-600" },
  ] : [
    { icon: Copy, title: "Copy-X Strategies", desc: "Automatically copy professional strategies. 70% of profits stay with the customer.", color: "bg-violet-500/10 text-violet-600" },
    { icon: BarChart3, title: "Trading Signals", desc: "Real-time signals with precise entry levels, Stop Loss/Take Profit and analysis.", color: "bg-purple-500/10 text-purple-600" },
    { icon: GraduationCap, title: "JetUP Academy", desc: "Trading education, risk management, systems thinking and long-term approach.", color: "bg-fuchsia-500/10 text-fuchsia-600" },
    { icon: Users, title: "Partner Program", desc: "Lot commissions, Profit Share, Infinity Bonus and Global Pools based on real volume.", color: "bg-indigo-500/10 text-indigo-600" },
    { icon: Shield, title: "TAG Markets", desc: "Licensed broker (FSC Mauritius). Your capital always stays in your account.", color: "bg-emerald-500/10 text-emerald-600" },
  ];

  const faqItems = language === 'ru' ? [
    { q: "Что такое JetUP?", a: "JetUP — это платформа, которая объединяет проверенных провайдеров, инструменты и сервисы для финансовых рынков в структурированной, прозрачной и доступной среде." },
    { q: "С чего начать?", a: "Регистрация на JetUP IB Portal → подключение к TAG Markets → установка MetaTrader 5 → депозит → доступ к инструментам экосистемы." },
    { q: "Где находятся мои средства?", a: "Ваш капитал всегда находится на вашем личном счёте у лицензированного брокера TAG Markets. Только вы имеете к нему доступ." },
    { q: "Безопасно ли это?", a: "TAG Markets — лицензированный брокер (FSC Mauritius). JetUP не управляет вашим капиталом и не принимает решений за вас. Контроль всегда остаётся у клиента." },
    { q: "Какая минимальная сумма?", a: "Минимум для клиента — $100, для партнёра — $250 с активным трейдинговым счётом." },
  ] : [
    { q: "What is JetUP?", a: "JetUP is a platform that brings together verified providers, tools, and services for the financial markets in a structured, transparent, and accessible environment." },
    { q: "How do I get started?", a: "Register on JetUP IB Portal → connect to TAG Markets → install MetaTrader 5 → deposit → access ecosystem tools." },
    { q: "Where are my funds?", a: "Your capital always stays in your personal account with the licensed broker TAG Markets. Only you have access to it." },
    { q: "Is it safe?", a: "TAG Markets is a licensed broker (FSC Mauritius). JetUP does not manage your capital or make decisions for you. Control always stays with the customer." },
    { q: "What's the minimum amount?", a: "Minimum for a client is $100, for a partner — $250 with an active trading account." },
  ];

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/">
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <img src="/jetup-logo.png" alt="JetUP" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold">{t('jetup.title')}</h1>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="text-gray-500 leading-relaxed px-1">
          {t('jetup.desc')}
        </p>

        <div className="space-y-3">
          {ecosystemItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-4 border border-gray-100 rounded-2xl hover:border-primary/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[15px]">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2">
          <a href="https://jetup.ibportal.io" target="_blank" rel="noopener noreferrer" className="block">
            <Card className="p-4 border border-gray-100 hover:border-primary/30 transition-colors flex items-center justify-between group rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">{language === 'ru' ? 'Регистрация' : 'Registration'}</p>
                  <p className="text-xs text-gray-500">{language === 'ru' ? 'JetUP IB Portal' : 'JetUP IB Portal'}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </Card>
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold mb-4 px-1">{language === 'ru' ? 'Частые вопросы' : 'FAQ'}</h2>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqItems.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-none bg-card rounded-2xl px-4 shadow-sm">
              <AccordionTrigger className="hover:no-underline py-4 font-semibold text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-2"
      >
        <Card className="p-6 bg-primary/[0.04] border border-primary/10 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold">{language === 'ru' ? 'Остались вопросы?' : 'Still have questions?'}</h2>
          <p className="text-sm text-gray-500">
            {language === 'ru' 
              ? 'Мария знает всё об экосистеме JetUP и готова ответить на любые вопросы в режиме реального времени.'
              : 'Maria knows everything about the JetUP ecosystem and is ready to answer any questions in real time.'}
          </p>
          <Link href="/maria">
            <Button className="w-full h-12 rounded-2xl jetup-gradient text-white font-bold hover:opacity-90 border-none shadow-md">
              {t('home.askMaria')}
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
};

export default XFusionPage;
