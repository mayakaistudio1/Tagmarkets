import React from "react";
import { Home, Zap, MessageCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenApplication: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentPath, onNavigate, onOpenApplication }) => {
  const tabs = [
    { id: "home", label: "Главная", icon: Home, path: "/" },
    { id: "xfusion", label: "XFusion", icon: Zap, path: "/xfusion" },
    { id: "maria", label: "Мария", icon: MessageCircle, path: "/maria" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[420px] bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-border/50 pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-2 pt-2 pb-1 relative">
          
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors duration-200 active:scale-95",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
          
          {/* Application Button - Floating or integrated? User asked for 4 tabs + "Заявка" separate button/tile/modal. 
              Implementing as a central or extra action. Since we have 4 tabs, fitting a 5th is tight but standard.
              Let's make it a distinct button on top or part of the bar. 
              Let's put it in the bar as the 5th element for symmetry or a floating FAB?
              "Tabs: 1) Home... 2) XFusion... 3) Popp... 4) Maria..."
              "App structure: 4 tabs in tab bar + separate “Заявка” opened via button/tile/bottom-sheet modal."
              I will add a FAB above the tab bar or a button in the tab bar.
              Let's add it as a 5th item in the bar but styled differently.
          */}
           <button
            onClick={onOpenApplication}
            className="flex flex-col items-center justify-center flex-1 py-1 gap-1 text-muted-foreground hover:text-primary transition-colors active:scale-95"
          >
            <div className="bg-primary/10 p-1 rounded-full">
              <FileText size={20} className="text-primary" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-medium leading-none text-primary">Заявка</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabBar;
