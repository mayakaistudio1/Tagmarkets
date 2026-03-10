import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Calendar, Clock, User, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface InviteEvent {
  id: number;
  partnerName: string;
  title: string;
  eventDate: string;
  eventTime: string;
  isActive: boolean;
}

const InvitePage = () => {
  const [, params] = useRoute("/invite/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const code = params?.code;

  const [event, setEvent] = useState<InviteEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [registering, setRegistering] = useState(false);
  const [registeredGuestId, setRegisteredGuestId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!code) return;

    fetch(`/api/invite/${code}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Event not found");
          throw new Error("Failed to load event");
        }
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setRegistering(true);
    try {
      const res = await fetch(`/api/invite/${code}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await res.json();
      setRegisteredGuestId(data.guestId);
      toast({
        title: "Success",
        description: "You have registered for the event!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleJoinZoom = async () => {
    if (!code || !registeredGuestId) return;

    try {
      const res = await fetch(`/api/invite/${code}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: registeredGuestId }),
      });

      if (!res.ok) throw new Error("Failed to track click");

      const data = await res.json();
      if (data.zoomLink) {
        window.open(data.zoomLink, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Could not open Zoom link. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-foreground p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading event details...</p>
      </div>
    );
  }

  if (error || !event || !event.isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-foreground p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold mb-2">Event Unavailable</h1>
        <p className="text-muted-foreground mb-6">
          {error || "This invitation is no longer active or the event could not be found."}
        </p>
        <Button onClick={() => setLocation("/")} variant="outline" data-testid="button-back-home">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-y-auto no-scrollbar">
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo/Brand */}
          <div className="flex flex-col items-center text-center space-y-2">
            <img src="/jetup-logo.png" alt="JetUP Logo" className="h-12 mb-4" />
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Special Invitation
            </div>
          </div>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400" data-testid="text-event-title">
                {event.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Hosted by <span className="text-foreground font-semibold" data-testid="text-partner-name">{event.partnerName}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">Date</p>
                    <p className="text-sm font-medium" data-testid="text-event-date">{event.eventDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">Time</p>
                    <p className="text-sm font-medium" data-testid="text-event-time">{event.eventTime}</p>
                  </div>
                </div>
              </div>

              {!registeredGuestId ? (
                <form onSubmit={handleRegister} className="space-y-4 pt-4 border-t border-border/40">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                    <Input
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/50"
                      data-testid="input-guest-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                    <Input
                      required
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background/50"
                      data-testid="input-guest-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Phone Number (Optional)</label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-background/50"
                      data-testid="input-guest-phone"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 mt-4"
                    disabled={registering}
                    data-testid="button-register"
                  >
                    {registering ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Register to Join"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6 pt-4 border-t border-border/40 text-center">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <p className="text-sm font-medium">Registration Successful!</p>
                  </div>
                  <Button
                    onClick={handleJoinZoom}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-16 text-lg shadow-lg shadow-blue-500/20"
                    data-testid="button-join-zoom"
                  >
                    Join Zoom Meeting
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-xs text-muted-foreground italic">
                    Click the button above to launch the Zoom meeting in a new tab.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitePage;
