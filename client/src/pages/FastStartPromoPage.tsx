import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PromoData {
  id: number;
  title: string;
  shortDesc: string;
  description: string;
  rules: string[];
  isActive: boolean;
  language: string;
}

const FastStartPromoPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", cuNumber: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dennis-promos?language=${language}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPromo(data[0]);
        } else {
          setPromo(null);
        }
      })
      .catch(() => setPromo(null))
      .finally(() => setLoading(false));
  }, [language]);

  const isCuValid = (value: string) => {
    if (!value) return true;
    return value.toUpperCase().startsWith("CU");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isCuValid(formData.cuNumber)) {
      setError(t("dp.cuError"));
      return;
    }
    if (!promo) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/partner/promo-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, promoId: promo.id }),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Error");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const langs: Array<{ code: "de" | "ru" | "en"; label: string }> = [
    { code: "de", label: "DE" },
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
  ];

  return (
    <div className="min-h-screen bg-[#08051a] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-lg mx-auto px-5 py-8">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
              <span className="text-white font-bold text-xs">J</span>
            </div>
            <span className="text-white/60 text-sm font-semibold tracking-wide">JetUP</span>
          </div>
          <div className="flex gap-1" data-testid="lang-switcher-fast-start">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  language === l.code
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-white/50 hover:bg-white/15"
                }`}
                data-testid={`btn-lang-${l.code}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="text-purple-300 text-xs font-semibold tracking-widest uppercase">Partner Promo</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white leading-tight mb-2" data-testid="text-fast-start-title">
              Fast Start Promo
            </h1>
            <p className="text-purple-300/70 text-sm" data-testid="text-fast-start-subtitle">
              {promo?.shortDesc || t("dp.subtitle")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-6 mb-6 text-center" data-testid="offer-block">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-5xl font-extrabold text-purple-300" style={{ textShadow: "0 0 30px rgba(168,85,247,0.4)" }}>
                100
              </span>
              <span className="text-2xl font-bold text-white/50">+</span>
              <span className="text-5xl font-extrabold text-purple-300" style={{ textShadow: "0 0 30px rgba(168,85,247,0.4)" }}>
                100
              </span>
              <span className="text-lg font-semibold text-white/40 self-end mb-1">USD</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Amplify 24x &bull; Sonic Strategy &bull; 4,800 USD Account
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-purple-400" />
            </div>
          ) : promo ? (
            <>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6" data-testid="promo-description-block">
                <p className="text-white/70 text-[14px] leading-relaxed whitespace-pre-line">
                  {promo.description}
                </p>
              </div>

              {promo.rules.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setRulesOpen(!rulesOpen)}
                    className="flex items-center gap-2 text-white/50 text-sm font-semibold mb-3 hover:text-white/70 transition-colors w-full"
                    data-testid="btn-toggle-rules"
                  >
                    <AlertCircle size={14} />
                    {t("dp.rulesTitle")}
                    {rulesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {rulesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-purple-900/20 border border-purple-500/15 rounded-xl p-4 space-y-2.5 overflow-hidden"
                    >
                      {promo.rules.map((rule, i) => (
                        <div key={i} className="flex gap-2.5 text-[13px] text-white/60 leading-relaxed" data-testid={`rule-${i}`}>
                          <span className="text-purple-400 flex-shrink-0 mt-0.5">•</span>
                          <span>{rule}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-emerald-600/90 to-teal-500/90 rounded-2xl p-6 text-center"
                  data-testid="success-block"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <Check size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{t("dp.successTitle")}</h3>
                  <p className="text-white/80 text-sm">{t("dp.successText")}</p>
                </motion.div>
              ) : (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5" data-testid="registration-form-block">
                  <h3 className="text-white font-bold text-base mb-4">{t("dp.formTitle") || "Registration"}</h3>
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider block mb-1.5">
                        {t("dp.nameLabel")}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("dp.namePlaceholder")}
                        className="w-full bg-white/[0.06] text-white placeholder-white/25 text-[14px] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 transition-colors"
                        data-testid="input-fast-start-name"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider block mb-1.5">
                        {t("dp.emailLabel")}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t("dp.emailPlaceholder")}
                        className="w-full bg-white/[0.06] text-white placeholder-white/25 text-[14px] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 transition-colors"
                        data-testid="input-fast-start-email"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 font-semibold uppercase tracking-wider block mb-1.5">
                        {t("dp.cuLabel")}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cuNumber}
                        onChange={(e) => setFormData({ ...formData, cuNumber: e.target.value })}
                        placeholder={t("dp.cuPlaceholder")}
                        className={`w-full bg-white/[0.06] text-white placeholder-white/25 text-[14px] rounded-xl px-4 py-3 outline-none focus:ring-2 border transition-colors ${
                          formData.cuNumber && !isCuValid(formData.cuNumber)
                            ? "border-red-400/50 focus:ring-red-500/50"
                            : "border-white/10 focus:ring-purple-500/50"
                        }`}
                        data-testid="input-fast-start-cu"
                      />
                      {formData.cuNumber && !isCuValid(formData.cuNumber) && (
                        <p className="text-[11px] text-red-400 mt-1.5">{t("dp.cuError")}</p>
                      )}
                    </div>

                    {error && (
                      <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2" data-testid="text-fast-start-error">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || (!!formData.cuNumber && !isCuValid(formData.cuNumber))}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-[14px] rounded-xl py-3.5 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                      data-testid="btn-fast-start-submit"
                    >
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      {t("dp.submit")}
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-white/40 text-sm">
              No active promo available
            </div>
          )}
        </motion.div>

        <div className="text-center mt-10 text-white/20 text-xs">
          &copy; JetUP {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default FastStartPromoPage;
