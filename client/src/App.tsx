import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { initTelegram } from "@/lib/telegram";
import { LanguageProvider } from "@/contexts/LanguageContext";

import HomePage from "@/pages/HomePage";
import MariaPage from "@/pages/MariaPage";
import TradingHubPage from "@/pages/TradingHubPage";
import PartnerHubPage from "@/pages/PartnerHubPage";
import SchedulePage from "@/pages/SchedulePage";
import TutorialsPage from "@/pages/TutorialsPage";
import PromoDetailPage from "@/pages/PromoDetailPage";
import TabBar from "@/components/TabBar";

function AppContent() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    initTelegram();
  }, []);

  const basePath = location.split("?")[0];

  const renderPage = () => {
    switch (basePath) {
      case "/":
        return <HomePage />;
      case "/maria":
        return <MariaPage />;
      case "/trading":
        return <TradingHubPage />;
      case "/partner":
        return <PartnerHubPage />;
      case "/schedule":
        return <SchedulePage />;
      case "/tutorials":
        return <TutorialsPage />;
      case "/promo":
        return <PromoDetailPage />;
      default:
        return <HomePage />;
    }
  };

  const showTabBar = basePath === "/" || basePath === "/maria";

  return (
    <div className="bg-background text-foreground h-[100dvh] font-sans flex justify-center w-full overflow-hidden">
      <div className="w-full max-w-[420px] relative bg-background shadow-2xl h-full flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden no-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={basePath}
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

        {showTabBar && (
          <TabBar 
            currentPath={basePath} 
            onNavigate={setLocation} 
          />
        )}
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
