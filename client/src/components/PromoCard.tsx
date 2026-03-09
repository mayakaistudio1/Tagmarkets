import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Check, Loader2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PromoCard: React.FC = () => {
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);
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
        className="relative rounded-2xl overflow-hidden"
        data-testid="promo-success-card"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-500" />
        <div className="relative px-5 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Check size={28} className="text-white" />
          </div>
          <h3 className="text-[16px] font-bold text-white mb-1" data-testid="text-promo-success-title">
            {t("dp.successTitle")}
          </h3>
          <p className="text-[13px] text-white/90 leading-relaxed" data-testid="text-promo-success-text">
            {t("dp.successText")}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="relative rounded-2xl overflow-hidden"
      data-testid="promo-card"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative px-4 py-4">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Gift size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/25 text-white rounded-full px-2 py-0.5" data-testid="badge-promo">
                {t("dp.badge")}
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-white leading-tight" data-testid="text-promo-title">
              {t("dp.title")}
            </h3>
          </div>
        </div>

        <p className="text-[12px] text-white/90 leading-relaxed mb-3" data-testid="text-promo-subtitle">
          {t("dp.subtitle")}
        </p>

        <button
          onClick={() => setRulesOpen(!rulesOpen)}
          className="flex items-center gap-1 text-[11px] text-white/70 font-semibold mb-3 active:opacity-70"
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
              <div className="bg-white/10 rounded-xl px-3 py-2.5 space-y-1.5 backdrop-blur-sm">
                {["dp.rule1", "dp.rule2", "dp.rule3"].map((key, i) => (
                  <p key={i} className="text-[11px] text-white/85 leading-relaxed flex gap-2" data-testid={`text-promo-rule-${i}`}>
                    <span className="text-white/50 flex-shrink-0">•</span>
                    {t(key)}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!formOpen ? (
            <motion.button
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(true)}
              className="w-full bg-white text-orange-600 font-bold text-[13px] rounded-xl py-2.5 active:scale-[0.98] transition-transform shadow-lg"
              data-testid="btn-promo-cta"
            >
              {t("dp.cta")}
            </motion.button>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-2.5"
            >
              <div>
                <label className="text-[10px] text-white/70 font-semibold uppercase tracking-wider block mb-1">
                  {t("dp.nameLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("dp.namePlaceholder")}
                  className="w-full bg-white/15 text-white placeholder-white/40 text-[13px] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                  data-testid="input-promo-name"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/70 font-semibold uppercase tracking-wider block mb-1">
                  {t("dp.emailLabel")}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("dp.emailPlaceholder")}
                  className="w-full bg-white/15 text-white placeholder-white/40 text-[13px] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                  data-testid="input-promo-email"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/70 font-semibold uppercase tracking-wider block mb-1">
                  {t("dp.cuLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={cuNumber}
                  onChange={(e) => setCuNumber(e.target.value)}
                  placeholder={t("dp.cuPlaceholder")}
                  className="w-full bg-white/15 text-white placeholder-white/40 text-[13px] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                  data-testid="input-promo-cu"
                />
              </div>

              {error && (
                <p className="text-[11px] text-red-200 bg-red-900/30 rounded-lg px-3 py-1.5" data-testid="text-promo-error">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/15 rounded-lg flex-shrink-0"
                  data-testid="btn-promo-cancel"
                >
                  <X size={16} className="text-white" />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-white text-orange-600 font-bold text-[13px] rounded-lg py-2.5 active:scale-[0.98] transition-transform shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                  data-testid="btn-promo-submit"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {t("dp.submit")}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PromoCard;
