import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Check, Loader2, ChevronDown, ChevronUp, ChevronRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PromoCard: React.FC = () => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cuNumber, setCuNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/promo-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, cuNumber }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl px-4 py-3 bg-gradient-to-br from-emerald-600 to-teal-500 shadow-[0_4px_24px_rgba(16,185,129,0.25)]"
        data-testid="promo-success-card"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Check size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-white leading-tight" data-testid="text-promo-success-title">
              {t("dp.successTitle")}
            </h3>
            <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed" data-testid="text-promo-success-text">
              {t("dp.successText")}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div data-testid="promo-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-[0_4px_24px_rgba(245,158,11,0.25)]"
        data-testid="btn-promo-cta"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Gift size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-white leading-tight" data-testid="text-promo-title">
              {t("dp.title")}
            </h3>
            <p className="text-[11px] text-white/80 mt-0.5" data-testid="text-promo-subtitle">
              {t("dp.shortDesc")}
            </p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronRight size={18} className="text-white/80" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
              <p className="text-[12px] text-gray-600 leading-relaxed mb-3" data-testid="text-promo-full-desc">
                {t("dp.subtitle")}
              </p>

              <button
                onClick={() => setRulesOpen(!rulesOpen)}
                className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold mb-3 active:opacity-70"
                data-testid="btn-toggle-rules"
              >
                <AlertCircle size={12} />
                {t("dp.rulesTitle")}
                {rulesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              <AnimatePresence>
                {rulesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="bg-orange-50 rounded-xl px-3 py-2.5 space-y-1.5">
                      {["dp.rule1", "dp.rule2", "dp.rule3"].map((key, i) => (
                        <p key={i} className="text-[11px] text-gray-600 leading-relaxed flex gap-2" data-testid={`text-promo-rule-${i}`}>
                          <span className="text-orange-400 flex-shrink-0">•</span>
                          {t(key)}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                    {t("dp.nameLabel")}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("dp.namePlaceholder")}
                    className="w-full bg-gray-50 text-gray-900 placeholder-gray-300 text-[13px] rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-300 border border-gray-100"
                    data-testid="input-promo-name"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                    {t("dp.emailLabel")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("dp.emailPlaceholder")}
                    className="w-full bg-gray-50 text-gray-900 placeholder-gray-300 text-[13px] rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-300 border border-gray-100"
                    data-testid="input-promo-email"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                    {t("dp.cuLabel")}
                  </label>
                  <input
                    type="text"
                    required
                    value={cuNumber}
                    onChange={(e) => setCuNumber(e.target.value)}
                    placeholder={t("dp.cuPlaceholder")}
                    className="w-full bg-gray-50 text-gray-900 placeholder-gray-300 text-[13px] rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-300 border border-gray-100"
                    data-testid="input-promo-cu"
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-1.5" data-testid="text-promo-error">
                    {error}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0"
                    data-testid="btn-promo-cancel"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[13px] rounded-lg py-2.5 active:scale-[0.98] transition-transform shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                    data-testid="btn-promo-submit"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {t("dp.submit")}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromoCard;
