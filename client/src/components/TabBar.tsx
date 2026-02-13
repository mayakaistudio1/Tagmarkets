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
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-[env(safe-area-inset-bottom)] pointer-events-auto">
        <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.path)}
                className={cn(
                  "flex flex-col items-center justify-center py-1 gap-1 transition-all duration-200 active:scale-95 min-w-[64px]",
                  isActive 
                    ? "text-primary" 
                    : "text-gray-400 hover:text-gray-500"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 1.8} 
                  className="transition-colors"
                />
                <span className={cn(
                  "text-[10px] leading-none transition-colors",
                  isActive ? "font-semibold text-primary" : "font-medium text-gray-400"
                )}>
                  {t(tab.labelKey)}
                </span>
              </button>
            );
          })}
          
          <button
            onClick={onOpenApplication}
            className={cn(
              "flex flex-col items-center justify-center py-1 gap-1 transition-all duration-200 active:scale-95 min-w-[64px]",
              "text-gray-400 hover:text-gray-500"
            )}
            data-testid="tab-application"
          >
            <FileText 
              size={24} 
              strokeWidth={1.8}
              className="transition-colors"
            />
            <span className="text-[10px] font-medium leading-none text-gray-400">
              {t('nav.application')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabBar;
