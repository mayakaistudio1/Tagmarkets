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

  const ecosystemItems = {
    ru: [
      { icon: Copy, title: "Copy-X Стратегии", desc: "Автоматическое копирование профессиональных стратегий. 70% прибыли остаётся у клиента.", color: "bg-violet-500/10 text-violet-600" },
      { icon: BarChart3, title: "Торговые сигналы", desc: "Сигналы в реальном времени с точными уровнями входа, Stop Loss/Take Profit и анализом.", color: "bg-purple-500/10 text-purple-600" },
      { icon: GraduationCap, title: "JetUP Академия", desc: "Обучение трейдингу, управление рисками, построение систем и долгосрочный подход.", color: "bg-fuchsia-500/10 text-fuchsia-600" },
      { icon: Users, title: "Партнёрская программа", desc: "Лот-комиссии, Profit Share, Infinity-бонус и Global Pools на основе реального объёма.", color: "bg-indigo-500/10 text-indigo-600" },
      { icon: Shield, title: "TAG Markets", desc: "Лицензированный брокер (FSC Mauritius). Ваш капитал всегда на вашем счёте.", color: "bg-emerald-500/10 text-emerald-600" },
    ],
    en: [
      { icon: Copy, title: "Copy-X Strategies", desc: "Automatically copy professional strategies. 70% of profits stay with the customer.", color: "bg-violet-500/10 text-violet-600" },
      { icon: BarChart3, title: "Trading Signals", desc: "Real-time signals with precise entry levels, Stop Loss/Take Profit and analysis.", color: "bg-purple-500/10 text-purple-600" },
      { icon: GraduationCap, title: "JetUP Academy", desc: "Trading education, risk management, systems thinking and long-term approach.", color: "bg-fuchsia-500/10 text-fuchsia-600" },
      { icon: Users, title: "Partner Program", desc: "Lot commissions, Profit Share, Infinity Bonus and Global Pools based on real volume.", color: "bg-indigo-500/10 text-indigo-600" },
      { icon: Shield, title: "TAG Markets", desc: "Licensed broker (FSC Mauritius). Your capital always stays in your account.", color: "bg-emerald-500/10 text-emerald-600" },
    ],
    de: [
      { icon: Copy, title: "Copy-X Strategien", desc: "Automatisches Kopieren professioneller Strategien. 70 % des Gewinns verbleiben beim Kunden.", color: "bg-violet-500/10 text-violet-600" },
      { icon: BarChart3, title: "Handelssignale", desc: "Echtzeit-Signale mit präzisen Einstiegsniveaus, Stop Loss/Take Profit und Analyse.", color: "bg-purple-500/10 text-purple-600" },
      { icon: GraduationCap, title: "JetUP Akademie", desc: "Trading-Ausbildung, Risikomanagement, Systemdenken und langfristiger Ansatz.", color: "bg-fuchsia-500/10 text-fuchsia-600" },
      { icon: Users, title: "Partnerprogramm", desc: "Lot-Provisionen, Profit Share, Infinity-Bonus und Global Pools basierend auf realem Volumen.", color: "bg-indigo-500/10 text-indigo-600" },
      { icon: Shield, title: "TAG Markets", desc: "Lizenzierter Broker (FSC Mauritius). Ihr Kapital bleibt immer auf Ihrem Konto.", color: "bg-emerald-500/10 text-emerald-600" },
    ],
  }[language];

  const faqItems = {
    ru: [
      { q: "Что такое JetUP?", a: "JetUP — это платформа, которая объединяет проверенных провайдеров, инструменты и сервисы для финансовых рынков в структурированной, прозрачной и доступной среде." },
      { q: "С чего начать?", a: "Регистрация на JetUP IB Portal → подключение к TAG Markets → установка MetaTrader 5 → депозит → доступ к инструментам экосистемы." },
      { q: "Где находятся мои средства?", a: "Ваш капитал всегда находится на вашем личном счёте у лицензированного брокера TAG Markets. Только вы имеете к нему доступ." },
      { q: "Безопасно ли это?", a: "TAG Markets — лицензированный брокер (FSC Mauritius). JetUP не управляет вашим капиталом и не принимает решений за вас. Контроль всегда остаётся у клиента." },
      { q: "Какая минимальная сумма?", a: "Минимум для клиента — $100, для партнёра — $250 с активным трейдинговым счётом." },
    ],
    en: [
      { q: "What is JetUP?", a: "JetUP is a platform that brings together verified providers, tools, and services for the financial markets in a structured, transparent, and accessible environment." },
      { q: "How do I get started?", a: "Register on JetUP IB Portal → connect to TAG Markets → install MetaTrader 5 → deposit → access ecosystem tools." },
      { q: "Where are my funds?", a: "Your capital always stays in your personal account with the licensed broker TAG Markets. Only you have access to it." },
      { q: "Is it safe?", a: "TAG Markets is a licensed broker (FSC Mauritius). JetUP does not manage your capital or make decisions for you. Control always stays with the customer." },
      { q: "What's the minimum amount?", a: "Minimum for a client is $100, for a partner — $250 with an active trading account." },
    ],
    de: [
      { q: "Was ist JetUP?", a: "JetUP ist eine Plattform, die verifizierte Anbieter, Tools und Dienstleistungen für die Finanzmärkte in einer strukturierten, transparenten und zugänglichen Umgebung zusammenbringt." },
      { q: "Wie fange ich an?", a: "Registrierung auf dem JetUP IB Portal → Verbindung mit TAG Markets → MetaTrader 5 installieren → Einzahlung → Zugang zu Ökosystem-Tools." },
      { q: "Wo ist mein Kapital?", a: "Ihr Kapital befindet sich immer auf Ihrem persönlichen Konto beim lizenzierten Broker TAG Markets. Nur Sie haben Zugang dazu." },
      { q: "Ist es sicher?", a: "TAG Markets ist ein lizenzierter Broker (FSC Mauritius). JetUP verwaltet Ihr Kapital nicht und trifft keine Entscheidungen für Sie. Die Kontrolle bleibt immer beim Kunden." },
      { q: "Was ist der Mindestbetrag?", a: "Minimum für Kunden: 100 $, für Partner: 250 $ mit einem aktiven Handelskonto." },
    ],
  }[language];

  const registrationLabel = { ru: 'Регистрация', en: 'Registration', de: 'Registrierung' }[language];
  const faqLabel = { ru: 'Частые вопросы', en: 'FAQ', de: 'Häufige Fragen' }[language];
  const questionsLabel = { ru: 'Остались вопросы?', en: 'Still have questions?', de: 'Noch Fragen?' }[language];
  const questionsDesc = { 
    ru: 'Мария знает всё об экосистеме JetUP и готова ответить на любые вопросы в режиме реального времени.',
    en: 'Maria knows everything about the JetUP ecosystem and is ready to answer any questions in real time.',
    de: 'Maria weiß alles über das JetUP-Ökosystem und ist bereit, alle Fragen in Echtzeit zu beantworten.',
  }[language];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-2 flex-shrink-0">
        <Link href="/">
          <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors shadow-sm">
            <ChevronLeft size={22} />
          </button>
        </Link>
        <div className="flex items-center gap-2.5">
          <img src="/jetup-logo.png" alt="JetUP" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold">{t('jetup.title')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-3 space-y-4">
        <p className="text-sm text-gray-500 leading-relaxed">
          {t('jetup.desc')}
        </p>

        <div className="space-y-2.5">
          {ecosystemItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-3 border border-gray-100 rounded-2xl hover:border-primary/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[14px]">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <a href="https://jetup.ibportal.io" target="_blank" rel="noopener noreferrer" className="block">
          <Card className="p-3 border border-gray-100 hover:border-primary/30 transition-colors flex items-center justify-between group rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-bold text-sm">{registrationLabel}</p>
                <p className="text-xs text-gray-500">JetUP IB Portal</p>
              </div>
            </div>
            <ExternalLink className="w-4.5 h-4.5 text-gray-300 group-hover:text-primary transition-colors" />
          </Card>
        </a>

        <div>
          <h2 className="text-lg font-bold mb-3">{faqLabel}</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqItems.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-none bg-card rounded-2xl px-3 shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3 font-semibold text-left text-sm">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-3 text-sm">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Card className="p-4 bg-primary/[0.04] border border-primary/10 rounded-2xl space-y-3">
          <h2 className="text-lg font-bold">{questionsLabel}</h2>
          <p className="text-xs text-gray-500">{questionsDesc}</p>
          <Link href="/maria">
            <Button className="w-full h-11 rounded-xl jetup-gradient text-white font-bold hover:opacity-90 border-none shadow-md">
              {t('home.askMaria')}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default XFusionPage;
