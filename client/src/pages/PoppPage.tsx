import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Briefcase, Globe, Phone, TrendingUp } from "lucide-react";

const PoppPage: React.FC = () => {
  return (
    <div className="p-4 pb-24 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center py-6"
      >
        <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-card shadow-xl">
           {/* Placeholder avatar */}
           <User size={48} className="text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Александр Попп</h1>
          <p className="text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
            Я помогаю людям разобраться в инвестициях, делая сложное простым и понятным.
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors h-full">
          <CardHeader className="p-4 pb-2">
            <Briefcase className="w-8 h-8 text-primary mb-1" />
            <CardTitle className="text-sm font-bold">Опыт</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Более 10 лет в сфере финансов и управления капиталом.
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors h-full">
          <CardHeader className="p-4 pb-2">
            <Globe className="w-8 h-8 text-primary mb-1" />
            <CardTitle className="text-sm font-bold">Просто о сложном</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Перевожу с языка цифр на язык возможностей.
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors h-full">
          <CardHeader className="p-4 pb-2">
            <Phone className="w-8 h-8 text-primary mb-1" />
            <CardTitle className="text-sm font-bold">Поддержка</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Всегда на связи, чтобы помочь вам избежать ошибок.
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card hover:bg-card/80 transition-colors h-full">
          <CardHeader className="p-4 pb-2">
            <TrendingUp className="w-8 h-8 text-primary mb-1" />
            <CardTitle className="text-sm font-bold">Масштаб</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
            Помогаю строить команды и пассивный доход.
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PoppPage;
