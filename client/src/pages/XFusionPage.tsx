import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, FileText, UserPlus, Zap, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const XFusionPage: React.FC = () => {
  const { language, t } = useLanguage();

  const faqItems = language === 'ru' ? [
    { q: "Что такое XFusion?", a: "Это передовая инвестиционная платформа, работающая в партнерстве с Tag Markets. Мы предоставляем доступ к проверенным финансовым инструментам для создания пассивного дохода." },
    { q: "С чего начинается путь?", a: "Всё начинается с простой регистрации и бесплатной консультации. Вы выбираете стратегию, которая подходит под ваши цели и бюджет." },
    { q: "Где находятся средства?", a: "Ваши средства находятся на вашем личном счете у регулируемого брокера. Вы имеете полный доступ к ним 24/7." },
    { q: "Безопасно ли это?", a: "Мы работаем только с лицензированными партнерами. Все операции прозрачны, а риски управляются профессиональной командой аналитиков." },
  ] : [
    { q: "What is XFusion?", a: "It's an advanced investment platform working in partnership with Tag Markets. We provide access to proven financial instruments for creating passive income." },
    { q: "How do I get started?", a: "It all starts with a simple registration and free consultation. You choose a strategy that fits your goals and budget." },
    { q: "Where are the funds kept?", a: "Your funds are in your personal account with a regulated broker. You have full access to them 24/7." },
    { q: "Is it safe?", a: "We only work with licensed partners. All operations are transparent, and risks are managed by a professional team of analysts." },
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
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Zap size={20} className="fill-current" />
          </div>
          <h1 className="text-2xl font-bold">{language === 'ru' ? 'Как это работает?' : 'How it works?'}</h1>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="text-gray-600 leading-relaxed px-1">
          {language === 'ru' 
            ? 'Инвестиционная экосистема для создания и масштабирования пассивного дохода.'
            : 'Investment ecosystem for creating and scaling passive income.'}
        </p>

        <div className="grid grid-cols-1 gap-3">
          <a href="https://exfusion.pro/presentation" target="_blank" rel="noopener noreferrer" className="block">
            <Card className="p-4 border border-gray-100 hover:border-primary/30 transition-colors flex items-center justify-between group rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">{language === 'ru' ? 'Презентация' : 'Presentation'}</p>
                  <p className="text-xs text-gray-500">{language === 'ru' ? 'Скачать PDF файл' : 'Download PDF file'}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </Card>
          </a>

          <a href="https://exfusion.pro/register" target="_blank" rel="noopener noreferrer" className="block">
            <Card className="p-4 border border-gray-100 hover:border-primary/30 transition-colors flex items-center justify-between group rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">{language === 'ru' ? 'Регистрация' : 'Registration'}</p>
                  <p className="text-xs text-gray-500">{language === 'ru' ? 'Создать аккаунт в системе' : 'Create an account'}</p>
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
        <Card className="p-6 bg-primary/5 border-none rounded-3xl space-y-4">
          <h2 className="text-xl font-bold">{language === 'ru' ? 'Остались вопросы?' : 'Still have questions?'}</h2>
          <p className="text-sm text-gray-600">
            {language === 'ru' 
              ? 'Наша Мария знает всё об экосистеме и готова ответить на любые вопросы в режиме реального времени.'
              : 'Our Maria knows everything about the ecosystem and is ready to answer any questions in real time.'}
          </p>
          <Link href="/maria">
            <Button className="w-full h-12 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 border-none">
              {t('home.askMaria')}
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
};

export default XFusionPage;
