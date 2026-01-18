import * as React from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { tg } from "@/lib/telegram";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Auto close after success
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form logic would go here
    }, 2000);

    // Optional: Open Telegram link with pre-filled message
    // if (tg) tg.openTelegramLink("https://t.me/share/url?url=...");
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-card flex flex-col rounded-t-[20px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 max-w-[420px] mx-auto outline-none">
          <div className="p-4 bg-card rounded-t-[20px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
            
            <div className="max-w-md mx-auto">
              {!isSuccess ? (
                <>
                  <Drawer.Title className="font-bold text-2xl mb-2 text-foreground">Заявка</Drawer.Title>
                  <Drawer.Description className="text-muted-foreground mb-6">
                    Заполните форму, и мы свяжемся с вами в ближайшее время.
                  </Drawer.Description>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя</Label>
                      <Input id="name" placeholder="Как к вам обращаться?" required className="bg-background" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact">Контакт</Label>
                      <Input id="contact" placeholder="Telegram или WhatsApp" required className="bg-background" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="interest">Что интересно</Label>
                      <Select required>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Выберите тему" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passive">Пассивный доход</SelectItem>
                          <SelectItem value="team">Построение команды</SelectItem>
                          <SelectItem value="general">Общий обзор</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button type="submit" className="w-full mt-4 font-bold rounded-xl h-12 text-base shadow-lg shadow-primary/20" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Отправить"}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Спасибо!</h3>
                  <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время.</p>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default ApplicationModal;
