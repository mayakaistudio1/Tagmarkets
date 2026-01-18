import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronLeft, FileText, UserPlus, Download } from "lucide-react";
import { Link } from "wouter";

const REG_URL = "#"; // Replace with actual URL
const PDF_URL = "#"; // Replace with actual URL

const LinksPage: React.FC = () => {
  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Полезные ссылки</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <a href={REG_URL} target="_blank" rel="noopener noreferrer" className="block group">
          <Card className="p-4 flex items-center gap-4 border-none shadow-sm bg-card group-hover:bg-card/80 transition-all group-active:scale-98">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <UserPlus size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base">Регистрация</h3>
              <p className="text-sm text-muted-foreground">Стать частью команды</p>
            </div>
          </Card>
        </a>

        <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="block group">
          <Card className="p-4 flex items-center gap-4 border-none shadow-sm bg-card group-hover:bg-card/80 transition-all group-active:scale-98">
             <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base">Презентация</h3>
              <p className="text-sm text-muted-foreground">Скачать PDF</p>
            </div>
            <Download size={20} className="text-muted-foreground" />
          </Card>
        </a>
      </motion.div>
    </div>
  );
};

export default LinksPage;
