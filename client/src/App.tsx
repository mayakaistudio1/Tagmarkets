import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, MessageCircle, FileText } from "lucide-react";
import { initTelegram } from "@/lib/telegram";
import { LanguageProvider } from "@/contexts/LanguageContext";

import HomePage from "@/pages/HomePage";
import XFusionPage from "@/pages/XFusionPage";
import MariaPage from "@/pages/MariaPage";
import LinksPage from "@/pages/LinksPage";
import ApplicationModal from "@/components/ApplicationModal";
import TabBar from "@/components/TabBar";

function AppContent() {
  const [location, setLocation] = useLocation();
  const [isAppModalOpen, setIsAppModalOpen] = React.useState(false);

  useEffect(() => {
    initTelegram();
  }, []);

  const renderPage = () => {
    switch (location) {
      case "/":
        return <HomePage />;
      case "/xfusion":
        return <XFusionPage />;
      case "/popp":
        setLocation("/");
        return <HomePage />;
      case "/maria":
        return <MariaPage />;
      case "/links":
        return <LinksPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="bg-background text-foreground h-[100dvh] font-sans flex justify-center w-full overflow-hidden">
      <div className="w-full max-w-[420px] relative bg-background shadow-2xl h-full flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden no-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-hidden"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {location !== '/maria' && (
          <TabBar 
            currentPath={location} 
            onNavigate={setLocation} 
            onOpenApplication={() => setIsAppModalOpen(true)}
          />
        )}
        
        <ApplicationModal 
          isOpen={isAppModalOpen} 
          onClose={() => setIsAppModalOpen(false)} 
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
