import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

const LIVE_URL = "https://popp-api.vercel.app/demo.html";

const MariaPage: React.FC = () => {
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {isLiveOpen ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Живой разговор
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsLiveOpen(false)}
                className="rounded-full"
              >
                <X size={24} />
              </Button>
            </div>
            
            {/* Iframe Container */}
            <div className="flex-1 bg-black relative">
              <iframe 
                src={isLiveOpen ? LIVE_URL : ""} 
                className="w-full h-full border-none"
                allow="microphone; camera; autoplay"
                title="Maria Live"
              />
            </div>
          </motion.div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center flex-1 text-center space-y-8 pb-24">
             <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary relative"
            >
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-primary/20 animate-[spin_15s_linear_infinite_reverse]" />
              <MessageCircle size={48} strokeWidth={1.5} />
            </motion.div>

            <div className="space-y-2 max-w-[280px]">
              <h1 className="text-2xl font-bold">Живой разговор</h1>
              <p className="text-muted-foreground">
                Пообщайтесь с Марией в режиме реального времени. Это быстро, удобно и естественно.
              </p>
            </div>

            <Button 
              onClick={() => setIsLiveOpen(true)}
              className="w-full max-w-[280px] h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-black border-none active:scale-95 transition-transform"
            >
              Запустить разговор
            </Button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MariaPage;
