import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Video, MessageSquareText, ChevronLeft } from "lucide-react";
import LiveAvatarChat from "@/components/LiveAvatar";
import TextChat from "@/components/TextChat";
import { Link } from "wouter";

type ChatMode = 'none' | 'video' | 'text';

const MariaPage: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>('none');

  const handleSessionEnd = (messages: any[]) => {
    console.log("Session ended with messages:", messages);
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {mode === 'video' && (
          <LiveAvatarChat 
            key="video"
            language="ru" 
            onSessionEnd={handleSessionEnd}
            onClose={() => setMode('none')}
          />
        )}
        
        {mode === 'text' && (
          <TextChat 
            key="text"
            onClose={() => setMode('none')}
          />
        )}
        
        {mode === 'none' && (
          <motion.div 
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 flex flex-col flex-1 pb-24"
          >
            <div className="flex items-center gap-4 mb-8">
              <Link href="/">
                <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors shadow-sm" data-testid="button-back">
                  <ChevronLeft size={24} />
                </button>
              </Link>
              <h1 className="text-2xl font-bold">Мария</h1>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 text-center space-y-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center text-primary relative"
              >
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-primary/20 animate-[spin_15s_linear_infinite_reverse]" />
                <span className="text-4xl font-bold">M</span>
              </motion.div>

              <div className="space-y-2 max-w-[300px]">
                <p className="text-muted-foreground">
                  Ваш персональный ассистент. Выберите удобный способ общения.
                </p>
              </div>

              <div className="w-full max-w-[300px] space-y-3">
                <Button 
                  onClick={() => setMode('video')}
                  className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-black border-none active:scale-95 transition-transform"
                  data-testid="button-video-chat"
                >
                  <Video size={20} className="mr-2" />
                  Видеозвонок
                </Button>
                
                <Button 
                  onClick={() => setMode('text')}
                  variant="outline"
                  className="w-full h-14 rounded-2xl text-base font-bold border-2 hover:bg-primary/5 active:scale-95 transition-transform"
                  data-testid="button-text-chat"
                >
                  <MessageSquareText size={20} className="mr-2" />
                  Текстовый чат
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground max-w-[280px]">
                История текстового чата сохраняется автоматически
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MariaPage;
