import React from "react";
import { Home, Rocket, MessageCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface TabBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenApplication: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentPath, onNavigate, onOpenApplication }) => {
  const { t } = useLanguage();
  
  const tabs = [
    { id: "home", labelKey: "nav.home", icon: Home, path: "/" },
    { id: "jetup", labelKey: "nav.jetup", icon: Rocket, path: "/xfusion" },
    { id: "maria", labelKey: "nav.chat", icon: MessageCircle, path: "/maria" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[420px] bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t border-gray-200/60 pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between px-3 pt-2.5 pb-2 relative">
          
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-1.5 gap-1 transition-all duration-200 active:scale-95",
                  isActive 
                    ? "text-primary" 
                    : "text-gray-400 hover:text-gray-600"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon 
                  size={26} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={cn(
                    "transition-colors",
                    isActive && "drop-shadow-sm"
                  )}
                />
                <span className={cn(
                  "text-[11px] font-medium leading-none transition-colors",
                  isActive && "font-semibold"
                )}>
                  {t(tab.labelKey)}
                </span>
              </button>
            );
          })}
          
          <button
            onClick={onOpenApplication}
            className="flex flex-col items-center justify-center flex-1 py-1.5 gap-1 text-gray-400 hover:text-primary transition-all active:scale-95"
            data-testid="tab-application"
          >
            <div className="p-1.5 rounded-full" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
              <FileText size={22} className="text-primary" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-semibold leading-none text-primary">{t('nav.application')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabBar;
