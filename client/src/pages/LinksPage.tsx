import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronLeft, FileText, UserPlus, Download, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const LinksPage: React.FC = () => {
  const { language } = useLanguage();

  const links = language === 'ru' ? [
    { title: 'Регистрация', desc: 'JetUP IB Portal', url: 'https://jetup.ibportal.io', icon: UserPlus, color: 'bg-primary/10 text-primary' },
    { title: 'Презентация', desc: 'Скачать PDF', url: '#', icon: FileText, color: 'bg-red-500/10 text-red-500', showDownload: true },
  ] : [
    { title: 'Registration', desc: 'JetUP IB Portal', url: 'https://jetup.ibportal.io', icon: UserPlus, color: 'bg-primary/10 text-primary' },
    { title: 'Presentation', desc: 'Download PDF', url: '#', icon: FileText, color: 'bg-red-500/10 text-red-500', showDownload: true },
  ];

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">{language === 'ru' ? 'Полезные ссылки' : 'Useful Links'}</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {links.map((link, idx) => (
          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="block group">
            <Card className="p-4 flex items-center gap-4 border-none shadow-sm bg-card group-hover:bg-card/80 transition-all group-active:scale-98 rounded-2xl">
              <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center`}>
                <link.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">{link.title}</h3>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </div>
              {link.showDownload ? <Download size={20} className="text-muted-foreground" /> : <ExternalLink size={20} className="text-muted-foreground" />}
            </Card>
          </a>
        ))}
      </motion.div>
    </div>
  );
};

export default LinksPage;
