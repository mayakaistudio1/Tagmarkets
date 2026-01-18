import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Link as LinkIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomePageProps {
  onOpenMaria: () => void;
  onOpenLinks: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onOpenMaria, onOpenLinks }) => {
  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary-foreground dark:text-primary rounded-full text-xs font-semibold backdrop-blur-sm"
      >
        <Star size={12} className="fill-current" />
        Открыто только 10 мест в первую линию
      </motion.div>

      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          Твой проводник в мир <span className="text-primary selection:bg-primary/30">пассивного дохода.</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Я покажу систему, по которой работаю сам: понятную, прозрачную и доступную каждому.
        </p>
      </motion.div>

      {/* Info Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-3"
      >
        <Card className="p-5 border-none shadow-sm bg-card hover:bg-card/80 transition-colors">
          <p className="font-medium text-card-foreground">
            Ты можешь зарабатывать пассивно или выстроить партнёрский бизнес с перспективой роста.
          </p>
        </Card>
        <Card className="p-5 border-none shadow-sm bg-card hover:bg-card/80 transition-colors">
          <p className="font-medium text-card-foreground">
            Мария помогает выбрать формат и сделать первый шаг.
          </p>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 pt-2"
      >
        <Button 
          onClick={onOpenMaria}
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-black border-none active:scale-95 transition-transform"
        >
          Начать разговор с Марией
        </Button>
        
        <a href="/xfusion" className="block">
           <Button variant="secondary" className="w-full h-12 rounded-xl text-foreground font-medium bg-secondary hover:bg-secondary/80 border-none active:scale-95 transition-transform">
            Как это работает?
          </Button>
        </a>

        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <ShieldCheck size={14} />
          <span>Без спама. Можно просто задать вопрос.</span>
        </div>
      </motion.div>

      {/* Small Links Button */}
      <div className="flex justify-center pt-4">
        <button 
          onClick={onOpenLinks}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <LinkIcon size={16} />
          <span>Ссылки</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
