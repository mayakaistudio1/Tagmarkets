import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, UserPlus } from "lucide-react";

const XFusionPage: React.FC<{ onOpenMaria?: () => void }> = () => {
  return (
    <div className="p-4 pb-24 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold leading-tight">О проекте Exfusion</h1>
        <p className="text-gray-600 leading-relaxed">
          Инвестиционная экосистема для создания и масштабирования пассивного дохода.
        </p>

        {/* Links Section */}
        <div className="space-y-3 pt-4">
          <a href="https://exfusion.pro/presentation" target="_blank" rel="noopener noreferrer" className="block">
            <Card className="p-4 border border-gray-100 hover:border-primary/30 transition-colors flex items-center justify-between group">
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
            <Card className="p-4 border border-gray-100 hover:border-primary/30 transition-colors flex items-center justify-between group">
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

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-6"
      >
        <Card className="p-6 bg-primary/5 border-none rounded-3xl space-y-4">
          <h2 className="text-xl font-bold">Остались вопросы?</h2>
          <p className="text-sm text-gray-600">
            Наша Мария знает всё об экосистеме и готова ответить на любые вопросы в режиме реального времени.
          </p>
          <a href="/maria" className="block">
            <Button className="w-full h-12 rounded-2xl bg-primary text-black font-bold hover:bg-primary/90 border-none">
              Спросить Марию
            </Button>
          </a>
        </Card>
      </motion.div>
    </div>
  );
};

export default XFusionPage;
