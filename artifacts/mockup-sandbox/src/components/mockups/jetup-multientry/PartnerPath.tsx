import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Cpu, Network, Zap } from 'lucide-react';

export function PartnerPath() {
  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30 selection:text-primary-foreground">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen opacity-30" />
        
        {/* Noise overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }} 
        />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-12 md:py-24 min-h-screen flex flex-col">
        
        <header className="flex items-center justify-between mb-16 md:mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">J</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">JetUP</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-sm font-medium tracking-wider text-muted-foreground uppercase"
          >
            Partner Program
          </motion.div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Column: Copy */}
          <div className="flex-1 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap size={14} className="text-primary fill-primary/20" />
                <span>The Business Opportunity</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                Build your own <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
                  financial network.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
                We give you the system, you build the network. A professional ecosystem designed for ambition, equipped with the tools to scale your independence without traditional overhead.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="group relative h-14 px-8 bg-white text-black font-semibold rounded-full overflow-hidden transition-transform active:scale-95 flex items-center justify-center gap-2">
                <span>Start the Journey</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
              </button>
              
              <button className="h-14 px-8 bg-transparent text-white font-medium rounded-full border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center">
                View Infrastructure
              </button>
            </motion.div>
          </div>

          {/* Right Column: Tech Stack / Visuals */}
          <div className="flex-1 w-full relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative aspect-square max-w-[500px] mx-auto lg:ml-auto"
            >
              {/* Central Abstract Image */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-card shadow-2xl">
                <img 
                  src="/__mockup/images/jetup-network-abstract.png" 
                  alt="Network abstraction" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </div>

              {/* Floating Feature Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -left-6 top-1/4 bg-card/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Personal Bot</div>
                  <div className="text-xs text-muted-foreground">Automated engagement</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -right-6 top-1/2 bg-card/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold">AI Invitations</div>
                  <div className="text-xs text-muted-foreground">Smart personalization</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="absolute left-1/4 -bottom-6 bg-card/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Network size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold">CRM Engine</div>
                  <div className="text-xs text-muted-foreground">Track and scale</div>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
