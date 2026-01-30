import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Link as LinkIcon, Star, Briefcase, Globe, Phone, TrendingUp } from "lucide-react";

interface HomePageProps {
  onOpenMaria: () => void;
  onOpenLinks: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onOpenMaria, onOpenLinks }) => {
  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Alexander Section - Now at the top */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Александр Попп</h1>
          <p className="text-xl font-medium text-primary">Твой проводник в мир <span className="text-primary">пассивного дохода</span></p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors p-4">
            <Briefcase className="w-6 h-6 text-primary mb-2" />
            <p className="text-xs font-medium">Более 10 лет в финансах</p>
          </Card>

          <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors p-4">
            <Globe className="w-6 h-6 text-primary mb-2" />
            <p className="text-xs font-medium">Просто о сложном</p>
          </Card>

          <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors p-4">
            <Phone className="w-6 h-6 text-primary mb-2" />
            <p className="text-xs font-medium">Всегда на связи</p>
          </Card>

          <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors p-4">
            <TrendingUp className="w-6 h-6 text-primary mb-2" />
            <p className="text-xs font-medium">Строим пассивный доход</p>
          </Card>
        </div>
      </motion.div>

      {/* Hero Badge & Text - Below Alexander */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary-foreground dark:text-primary rounded-full text-xs font-semibold backdrop-blur-sm">
          <Star size={12} className="fill-current" />
          Открыто только 10 мест в первую линию
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Понятная система. Прозрачные условия. Первый шаг за тобой.
        </p>
      </motion.div>

      {/* Actions - Now at the bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 pt-2"
      >
        <Button 
          onClick={onOpenMaria}
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-black border-none active:scale-95 transition-transform"
          data-testid="button-open-maria"
        >
          Начать разговор с Марией
        </Button>
        
        <a href="/xfusion" className="block">
           <Button variant="secondary" className="w-full h-12 rounded-xl text-foreground font-medium bg-secondary hover:bg-secondary/80 border-none active:scale-95 transition-transform" data-testid="button-how-it-works">
            Как это работает?
          </Button>
        </a>

        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
          <ShieldCheck size={14} />
          <span>Без спама. Можно просто задать вопрос.</span>
        </div>
      </motion.div>

      {/* Small Links Button */}
      <div className="flex justify-center pt-2">
        <button 
          onClick={onOpenLinks}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          data-testid="button-links"
        >
          <LinkIcon size={16} />
          <span>Ссылки</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
