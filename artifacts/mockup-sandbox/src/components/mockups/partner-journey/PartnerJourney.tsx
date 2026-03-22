import { useState, useEffect } from "react";

const scenes = [
  {
    id: 1,
    phase: "СОМНЕНИЕ",
    phaseEn: "DOUBT",
    color: "#1a1a2e",
    accent: "#e74c3c",
    emoji: "😟",
    character: "👤",
    title: "Это вообще работает?",
    subtitle: "Максим, 34 года. Наёмный сотрудник.",
    thought: "«Сетевой маркетинг? Я слышал это раньше. Скорее всего, очередная пирамида...»",
    details: [
      "Нестабильный доход",
      "Нет свободы времени",
      "Боится потерять деньги",
      "Не доверяет финансовым партнёрствам",
    ],
    bg: "from-red-950 to-slate-950",
    visual: "doubt",
  },
  {
    id: 2,
    phase: "ПЕРВЫЙ КОНТАКТ",
    phaseEn: "FIRST CONTACT",
    color: "#0f2027",
    accent: "#3498db",
    emoji: "🎯",
    character: "🧑‍💻",
    title: "JetUP — это другое",
    subtitle: "Вебинар. Партнёр показывает результаты.",
    thought: "«TAG Markets. Регулируемый брокер. Стратегия Sonic — 80% прибыльных месяцев. Это не просто слова...»",
    details: [
      "Стратегия Sonic — 24x Amplify модель",
      "Myfxbook — прозрачная история сделок",
      "Регуляция LFSA (Labuan)",
      "AI-ассистент объясняет каждый шаг",
    ],
    bg: "from-blue-950 to-slate-950",
    visual: "contact",
  },
  {
    id: 3,
    phase: "РЕШЕНИЕ",
    phaseEn: "DECISION",
    color: "#0d1b2a",
    accent: "#f39c12",
    emoji: "⚡",
    character: "🙋",
    title: "Я попробую",
    subtitle: "Dennis Fast Start Promo — вход без барьеров",
    thought: "«100 USD → и я получаю +100 USD бонус. Итого 200 USD — это 4 800 USD на счёте MT5. Риск понятен, логика прозрачна.»",
    details: [
      "Депозит 100 USD → бонус +100 USD",
      "4 800 USD аккаунт на стратегии Sonic",
      "Прибыль можно выводить в любое время",
      "Partner App — всё в телефоне",
    ],
    bg: "from-amber-950 to-slate-950",
    visual: "decision",
  },
  {
    id: 4,
    phase: "ПЕРВЫЙ ДОХОД",
    phaseEn: "FIRST INCOME",
    color: "#0a1628",
    accent: "#27ae60",
    emoji: "💸",
    character: "😊",
    title: "Деньги пришли",
    subtitle: "Месяц 1-3. Lot Commissions + Profit Share",
    thought: "«Я пригласил 3 человек. Они активны. Пошли сделки — и я вижу комиссии. Это не разовое — это продолжается.»",
    details: [
      "Lot Commissions — с каждой сделки",
      "Profit Share — доля от прибыли клиента",
      "Доход продолжается пока клиент активен",
      "Первое осознание residual income",
    ],
    bg: "from-green-950 to-slate-950",
    visual: "income",
  },
  {
    id: 5,
    phase: "РОСТ СТРУКТУРЫ",
    phaseEn: "TEAM GROWTH",
    color: "#0a0a2e",
    accent: "#9b59b6",
    emoji: "🚀",
    character: "👨‍👩‍👧‍👦",
    title: "Структура ожила",
    subtitle: "Месяц 4-8. Infinity Bonus включается",
    thought: "«У меня 3 ветки. Каждый лидер строит свою команду. Доход идёт уже глубже меня — я зарабатываю на том, что выстроил.»",
    details: [
      "Infinity Bonus — доход с глубины организации",
      "Команда дублирует действия",
      "AI-аватар работает за меня на вебинарах",
      "Доход не зависит только от личных действий",
    ],
    bg: "from-purple-950 to-slate-950",
    visual: "growth",
  },
  {
    id: 6,
    phase: "ПРОЦВЕТАНИЕ",
    phaseEn: "PROSPERITY",
    color: "#0a1a0a",
    accent: "#f1c40f",
    emoji: "🏆",
    character: "😎",
    title: "Система работает на меня",
    subtitle: "Год+. Global Pool. Свобода.",
    thought: "«Global Pool. Incentives. Путешествия за счёт компании. Я создал остаточный доход — теперь система живёт своей жизнью.»",
    details: [
      "Global Pool — доля от оборота всей компании",
      "Incentives — путешествия, бонусы",
      "Зрелая partner economy",
      "Свобода времени и финансовая независимость",
    ],
    bg: "from-yellow-950 to-slate-950",
    visual: "prosperity",
  },
];

const VisualDot = ({ visual, accent }: { visual: string; accent: string }) => {
  const visuals: Record<string, JSX.Element> = {
    doubt: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-red-900/40 flex items-center justify-center border border-red-700/30 animate-pulse">
            <span className="text-6xl">😟</span>
          </div>
        </div>
        {["?", "?", "?"].map((q, i) => (
          <div
            key={i}
            className="absolute text-red-400/60 text-2xl font-bold animate-bounce"
            style={{
              top: `${[10, 20, 5][i]}%`,
              left: `${[5, 75, 45][i]}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {q}
          </div>
        ))}
      </div>
    ),
    contact: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-blue-900/40 flex items-center justify-center border border-blue-500/30">
            <span className="text-6xl">💻</span>
          </div>
        </div>
        <div className="absolute top-2 right-4 bg-blue-600/80 text-white text-xs px-2 py-1 rounded animate-pulse">
          LIVE
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {["📊", "📈", "🔒"].map((e, i) => (
            <span key={i} className="text-lg animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
              {e}
            </span>
          ))}
        </div>
      </div>
    ),
    decision: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-amber-900/40 flex items-center justify-center border border-amber-500/30">
            <span className="text-6xl">✅</span>
          </div>
        </div>
        <div className="absolute top-0 left-8 text-amber-400 text-sm font-bold animate-pulse">$100</div>
        <div className="absolute top-0 right-8 text-green-400 text-sm font-bold animate-pulse" style={{ animationDelay: "0.5s" }}>+$100</div>
        <div className="absolute bottom-2 left-0 right-0 text-center text-amber-300 text-xs font-bold">
          = $4,800 MT5
        </div>
      </div>
    ),
    income: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-green-900/40 flex items-center justify-center border border-green-500/30">
            <span className="text-6xl">📈</span>
          </div>
        </div>
        {["$", "$", "$"].map((s, i) => (
          <div
            key={i}
            className="absolute text-green-400 font-bold text-xl animate-bounce"
            style={{
              top: `${[60, 40, 70][i]}%`,
              left: `${[10, 80, 50][i]}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {s}
          </div>
        ))}
      </div>
    ),
    growth: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-purple-900/40 flex items-center justify-center border border-purple-500/30 z-10">
            <span className="text-4xl">👤</span>
          </div>
        </div>
        {[
          { top: "5%", left: "5%" },
          { top: "5%", right: "5%" },
          { bottom: "5%", left: "5%" },
          { bottom: "5%", right: "5%" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-12 h-12 rounded-full bg-purple-800/30 flex items-center justify-center border border-purple-400/20 animate-pulse"
            style={{ ...pos, animationDelay: `${i * 0.2}s` }}
          >
            <span className="text-xl">👤</span>
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-24 border-t border-purple-500/30"
              style={{ transform: `rotate(${i * 45}deg)` }}
            />
          ))}
        </div>
      </div>
    ),
    prosperity: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-yellow-900/40 flex items-center justify-center border border-yellow-500/30 animate-pulse">
            <span className="text-6xl">🏆</span>
          </div>
        </div>
        {["⭐", "✨", "🌟", "💫"].map((s, i) => (
          <div
            key={i}
            className="absolute animate-spin text-xl"
            style={{
              top: `${[5, 5, 75, 75][i]}%`,
              left: `${[5, 75, 5, 75][i]}%`,
              animationDuration: `${3 + i}s`,
            }}
          >
            {s}
          </div>
        ))}
      </div>
    ),
  };
  return visuals[visual] || <div />;
};

export function PartnerJourney() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);

  const scene = scenes[current];

  const goTo = (index: number) => {
    if (animating || index === current) return;
    setAnimating(true);
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
      setAnimating(false);
      setProgress(0);
    }, 400);
  };

  const next = () => goTo(Math.min(current + 1, scenes.length - 1));
  const prev = () => goTo(Math.max(current - 1, 0));

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (current < scenes.length - 1) {
            next();
            return 0;
          } else {
            setAutoPlay(false);
            return 100;
          }
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [autoPlay, current]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-xs tracking-widest text-slate-500 uppercase mb-1">JetUP Partner Story</div>
          <h1 className="text-white text-xl font-bold">Путь Партнёра</h1>
          <p className="text-slate-400 text-xs mt-1">от сомнения до процветания</p>
        </div>

        {/* Scene dots */}
        <div className="flex justify-center gap-2 mb-6">
          {scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 opacity-100" : "w-1.5 opacity-30"
              }`}
              style={{ backgroundColor: i === current ? scene.accent : "#64748b" }}
            />
          ))}
        </div>

        {/* Main card */}
        <div
          className={`rounded-2xl overflow-hidden border transition-all duration-400 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            borderColor: `${scene.accent}33`,
            background: `linear-gradient(135deg, ${scene.color}ee, #0f172aee)`,
            transition: "opacity 0.4s, transform 0.4s",
          }}
        >
          {/* Phase badge */}
          <div
            className="px-4 py-2 flex items-center justify-between"
            style={{ backgroundColor: `${scene.accent}22`, borderBottom: `1px solid ${scene.accent}33` }}
          >
            <span className="text-xs font-bold tracking-widest" style={{ color: scene.accent }}>
              {String(scene.id).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")} — {scene.phase}
            </span>
            <span className="text-lg">{scene.emoji}</span>
          </div>

          <div className="p-6">
            {/* Visual */}
            <div className="mb-6">
              <VisualDot visual={scene.visual} accent={scene.accent} />
            </div>

            {/* Title */}
            <h2 className="text-white text-2xl font-bold text-center mb-1">{scene.title}</h2>
            <p className="text-slate-400 text-xs text-center mb-4">{scene.subtitle}</p>

            {/* Thought bubble */}
            <div
              className="rounded-xl p-4 mb-5 text-sm italic leading-relaxed"
              style={{
                backgroundColor: `${scene.accent}11`,
                borderLeft: `3px solid ${scene.accent}88`,
                color: "#cbd5e1",
              }}
            >
              {scene.thought}
            </div>

            {/* Details */}
            <div className="space-y-2">
              {scene.details.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: scene.accent }} />
                  <span className="text-slate-300 text-sm">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-play progress bar */}
        {autoPlay && (
          <div className="mt-3 h-0.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-none"
              style={{ width: `${progress}%`, backgroundColor: scene.accent }}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mt-5 gap-3">
          <button
            onClick={prev}
            disabled={current === 0 || animating}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-20"
            style={{ backgroundColor: "#1e293b", color: "#94a3b8" }}
          >
            ← Назад
          </button>

          <button
            onClick={() => {
              setAutoPlay((a) => !a);
              setProgress(0);
            }}
            className="px-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              backgroundColor: autoPlay ? `${scene.accent}33` : scene.accent,
              color: autoPlay ? scene.accent : "#000",
            }}
          >
            {autoPlay ? "⏸" : "▶ Авто"}
          </button>

          <button
            onClick={next}
            disabled={current === scenes.length - 1 || animating}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-20"
            style={{ backgroundColor: "#1e293b", color: "#94a3b8" }}
          >
            Далее →
          </button>
        </div>

        {/* Restart on last scene */}
        {current === scenes.length - 1 && (
          <button
            onClick={() => goTo(0)}
            className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:border-slate-500 transition-all"
          >
            🔄 Начать сначала
          </button>
        )}
      </div>
    </div>
  );
}
