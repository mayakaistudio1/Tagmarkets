import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Zap, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

interface XFusionPageProps {
  onOpenMaria: () => void;
}

const XFusionPage: React.FC<XFusionPageProps> = ({ onOpenMaria }) => {
  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors shadow-sm" data-testid="button-back">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
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
          
          <AccordionItem value="item-5" className="border-none bg-card rounded-2xl px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4 font-semibold text-left">Вывод средств</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
              Вывод средств доступен в любое время без ограничений. Процесс обычно занимает от нескольких минут до 24 часов.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6" className="border-none bg-card rounded-2xl px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4 font-semibold text-left">Кому подходит?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
              Платформа подходит как новичкам, так и опытным инвесторам. Минимальный порог входа позволяет начать практически с любым бюджетом.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pt-6"
      >
        <Button 
          onClick={onOpenMaria}
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-black border-none active:scale-95 transition-transform"
          data-testid="button-open-maria"
        >
          Задать вопрос Марии
        </Button>
      </motion.div>
    </div>
  );
};

export default XFusionPage;
