import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Globe, Phone, TrendingUp } from "lucide-react";

const HomePage: React.FC = () => {
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

      {/* Single CTA Button */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-2"
      >
        <a href="/maria" className="block">
          <Button 
            className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-black border-none active:scale-95 transition-transform"
            data-testid="button-open-maria"
          >
            Подробнее об EXFUSION
          </Button>
        </a>
      </motion.div>
    </div>
  );
};

export default HomePage;
