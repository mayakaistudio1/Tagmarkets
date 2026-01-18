import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, User, MessageCircle, FileText } from "lucide-react";
import { initTelegram } from "@/lib/telegram";

// Pages
import HomePage from "@/pages/HomePage";
import XFusionPage from "@/pages/XFusionPage";
import PoppPage from "@/pages/PoppPage";
import MariaPage from "@/pages/MariaPage";
import LinksPage from "@/pages/LinksPage";
import ApplicationModal from "@/components/ApplicationModal";
import TabBar from "@/components/TabBar";

function App() {
  const [location, setLocation] = useLocation();
  const [isAppModalOpen, setIsAppModalOpen] = React.useState(false);

  useEffect(() => {
    initTelegram();
  }, []);

  // Simple router switch
  const renderPage = () => {
    switch (location) {
      case "/":
        return <HomePage onOpenMaria={() => setLocation("/maria")} onOpenLinks={() => setLocation("/links")} />;
      case "/xfusion":
        return <XFusionPage onOpenMaria={() => setLocation("/maria")} />;
      case "/popp":
        return <PoppPage />;
      case "/maria":
        return <MariaPage />;
      case "/links":
        return <LinksPage />;
      default:
        return <HomePage onOpenMaria={() => setLocation("/maria")} onOpenLinks={() => setLocation("/links")} />;
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen font-sans flex justify-center w-full">
      <div className="w-full max-w-[420px] relative bg-background shadow-2xl min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto no-scrollbar safe-bottom relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <TabBar 
          currentPath={location} 
          onNavigate={setLocation} 
          onOpenApplication={() => setIsAppModalOpen(true)}
        />
        
        <ApplicationModal 
          isOpen={isAppModalOpen} 
          onClose={() => setIsAppModalOpen(false)} 
        />
      </div>
    </div>
  );
}

export default App;
