import React, { useState } from "react";
import { ArrowLeft, Send, ExternalLink, Calendar, Clock, User, Phone, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";

export function Interaction() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const isNameValid = name.trim().length > 0;
  const isContactValid = contact.trim().length > 0;
  const isQuestionValid = question.trim().length > 0;
  const isFormValid = isNameValid && isContactValid && isQuestionValid;

  return (
    <div className="w-[390px] h-[844px] bg-[#0c0b1a] text-white flex flex-col relative overflow-hidden font-sans border-8 border-black rounded-[40px] shadow-2xl">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-[#0c0b1a]/95 via-[#0c0b1a]/80 to-transparent pt-12 pb-6 px-5 flex items-center gap-3 pointer-events-none">
        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 pointer-events-auto active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 drop-shadow-md">
          <div className="text-[12px] font-bold text-white uppercase tracking-wider">AMA Session</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[120px] hide-scrollbar bg-[#0c0b1a]">
        {/* Banner area - Compact to save vertical space */}
        <div className="relative w-full h-[220px]">
          <img 
            src="/__mockup/images/ama-banner.png" 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b1a] via-[#0c0b1a]/50 to-black/20" />
          
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <h1 className="text-[26px] font-extrabold leading-tight mb-3 tracking-tight">
              Ask Niklas Anything
            </h1>
            
            {/* Inline Event Info & Countdown */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5 text-[13px] font-medium text-white/80">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#A855F7]" />
                  April 9
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#A855F7]" />
                  7:00 PM CET
                </div>
              </div>
              
              <div className="flex gap-1.5 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/10">
                  <div className="text-[14px] font-bold">03</div>
                  <div className="text-[9px] text-[#A855F7] uppercase tracking-wider font-bold">Days</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/10">
                  <div className="text-[14px] font-bold">14</div>
                  <div className="text-[9px] text-[#A855F7] uppercase tracking-wider font-bold">Hrs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Zone: Highly visible form */}
        <div className="px-5 relative z-20 mt-2">
          <div className="bg-[#131224] rounded-3xl p-5 border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
            <div className="mb-5">
              <h2 className="text-[18px] font-bold text-white mb-1">Submit your question</h2>
              <p className="text-[13px] text-white/50 leading-relaxed">
                We're collecting questions now to cover the most important topics on stream.
              </p>
            </div>

            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              {/* Name Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-white/80 pl-1">Your Name</label>
                  {isNameValid && <CheckCircle2 size={14} className="text-green-400" />}
                </div>
                <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'name' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                    <User size={18} className={focused === 'name' ? 'text-[#A855F7]' : ''} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] focus:outline-none placeholder-white/20"
                  />
                </div>
              </div>

              {/* Contact Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-white/80 pl-1">Contact Info <span className="text-white/40 font-normal">(Optional but helpful)</span></label>
                  {isContactValid && <CheckCircle2 size={14} className="text-green-400" />}
                </div>
                <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'contact' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                    <Phone size={18} className={focused === 'contact' ? 'text-[#A855F7]' : ''} />
                  </div>
                  <input
                    type="text"
                    value={contact}
                    onFocus={() => setFocused('contact')}
                    onBlur={() => setFocused(null)}
                    onChange={e => setContact(e.target.value)}
                    placeholder="Telegram or Email"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] focus:outline-none placeholder-white/20"
                  />
                </div>
              </div>

              {/* Question Field */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-white/80 pl-1">Your Question</label>
                  {isQuestionValid && <CheckCircle2 size={14} className="text-green-400" />}
                  {!isQuestionValid && focused === 'question' && question.length > 0 && <AlertCircle size={14} className="text-amber-400" />}
                </div>
                <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'question' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                  <div className="absolute left-3.5 top-4 text-white/40">
                    <HelpCircle size={18} className={focused === 'question' ? 'text-[#A855F7]' : ''} />
                  </div>
                  <textarea
                    value={question}
                    onFocus={() => setFocused('question')}
                    onBlur={() => setFocused(null)}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="What's on your mind? Be specific."
                    rows={4}
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] focus:outline-none placeholder-white/20 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="button"
                  className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${
                    isFormValid 
                      ? "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-[0.98]" 
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <Send size={18} className={isFormValid ? "text-white" : "opacity-40"} />
                  Send Question
                </button>
              </div>
            </form>
          </div>

          {/* Reading Zone: Description (Pushed below the fold) */}
          <div className="mt-8 mb-8 space-y-6 opacity-80 pl-2">
            <div>
              <h3 className="text-[15px] font-bold mb-2 flex items-center gap-2 text-white">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                About the Session
              </h3>
              <p className="text-[13px] leading-relaxed text-white/60">
                Niklas answers your questions live. No script, no presentation — a direct conversation with the man behind the brokerage infrastructure of our ecosystem.
                <br /><br />
                Everything you've always wanted to ask — ask it directly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Zoom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0c0b1a] via-[#0c0b1a]/95 to-transparent pb-8 pt-12 z-30">
        <button className="w-full py-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 font-bold text-[15px] flex items-center justify-center gap-2 active:bg-white/20 transition-all text-white shadow-[0_−10px_40px_rgba(0,0,0,0.5)]">
          <ExternalLink size={18} className="text-[#A855F7]" />
          Join Zoom Call
        </button>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
