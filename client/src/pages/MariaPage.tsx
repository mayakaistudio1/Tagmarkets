import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import LiveAvatarChat from "@/components/LiveAvatar";

const MariaPage: React.FC = () => {
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  const handleSessionEnd = (messages: any[]) => {
    console.log("Session ended with messages:", messages);
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {isLiveOpen ? (
          <LiveAvatarChat 
            language="ru" 
            onSessionEnd={handleSessionEnd}
            onClose={() => setIsLiveOpen(false)}
          />
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
