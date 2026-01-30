import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, FileText, UserPlus, Zap, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

const XFusionPage: React.FC = () => {
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
          <h1 className="text-2xl font-bold">Как это работает?</h1>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="text-gray-600 leading-relaxed px-1">
          Инвестиционная экосистема для создания и масштабирования пассивного дохода.
        </p>

        {/* Links Section */}
        <div className="grid grid-cols-1 gap-3">
          <a href="https://exfusion.pro/presentation" target="_blank" rel="noopener noreferrer" className="block">
            <Card className="p-4 border border-gray-100 hover:border-primary/30 transition-colors flex items-center justify-between group rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Презентация</p>
                  <p className="text-xs text-gray-500">Скачать PDF файл</p>
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
                  <p className="font-bold">Регистрация</p>
                  <p className="text-xs text-gray-500">Создать аккаунт в системе</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </Card>
          </a>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold mb-4 px-1">Частые вопросы</h2>
        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="item-1" className="border-none bg-card rounded-2xl px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4 font-semibold text-left">Что такое XFusion?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
              Это передовая инвестиционная платформа, работающая в партнерстве с Tag Markets. Мы предоставляем доступ к проверенным финансовым инструментам для создания пассивного дохода.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border-none bg-card rounded-2xl px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4 font-semibold text-left">С чего начинается путь?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
              Всё начинается с простой регистрации и бесплатной консультации. Вы выбираете стратегию, которая подходит под ваши цели и бюджет.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-none bg-card rounded-2xl px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4 font-semibold text-left">Где находятся средства?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
              Ваши средства находятся на вашем личном счете у регулируемого брокера. Вы имеете полный доступ к ним 24/7.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4" className="border-none bg-card rounded-2xl px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4 font-semibold text-left">Безопасно ли это?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
              Мы работаем только с лицензированными партнерами. Все операции прозрачны, а риски управляются профессиональной командой аналитиков.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-2"
      >
        <Card className="p-6 bg-primary/5 border-none rounded-3xl space-y-4">
          <h2 className="text-xl font-bold">Остались вопросы?</h2>
          <p className="text-sm text-gray-600">
            Наша Мария знает всё об экосистеме и готова ответить на любые вопросы в режиме реального времени.
          </p>
          <Link href="/maria">
            <Button className="w-full h-12 rounded-2xl bg-primary text-black font-bold hover:bg-primary/90 border-none">
              Спросить Марию
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
};

export default XFusionPage;
