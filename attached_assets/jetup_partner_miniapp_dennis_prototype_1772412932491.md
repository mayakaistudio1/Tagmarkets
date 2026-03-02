# JetUP Partner MiniApp — Dennis Template (Prototype Spec + Starter Markup)

**Goal:** premium partner mini-app / digital hub (mobile-first).  
**Core idea:** user can explore sections, but is *guided* by an embedded text assistant with suggested questions. Live Avatar is an “upgrade”, not the only entry.

---

## Design direction (mobile)
- **Style:** premium fintech, minimal, airy, soft gradients, JetUP purple accents.
- **Layout:** one long scroll page with anchored sections + optional in-app “sheets”.
- **Hierarchy:** Founder → Guided chat → Paths → Ecosystem → Passive / Build → Social & Materials (secondary).

### Tokens (suggested)
```css
:root{
  --bg:#0F0A1A;
  --card:#151028;
  --card2:#1B1333;
  --ink:#F5F3FF;
  --muted:rgba(245,243,255,.72);
  --line:rgba(245,243,255,.10);
  --accent:#7C3AED;
  --accent2:#E88FEC;
  --good:#22C55E;
  --shadow: 0 18px 70px rgba(0,0,0,.45);
  --r:22px;
}
```

---

## IA: Main screen blocks

### Block A — Founder Header (above the fold)
- Avatar + name + role
- “Online” indicator
- One primary CTA: **Enter Strategy Call (Live)**
- One secondary CTA: **Text chat (Start here)**

**Copy (EN sample):**
- Title: **Dennis Schymanietz**
- Subtitle: **Founder · Infrastructure Architect**
- Micro: “I build scalable ecosystems — not hype.”

---

### Block B — Embedded Text Guide (always visible on first screen)
Looks like a chat card, not a popup.

- Assistant line: “Tell me what you want today — I’ll guide you.”
- Suggested chips (tap to navigate):
  - “I want passive income”
  - “I want to build a structure”
  - “I need clarity first”

**Behavior on chip tap**
1) Add a short assistant reply  
2) Smooth-scroll to the relevant section  
3) Highlight that section for a moment

---

### Block C — Three Paths (visual segmentation)
Three big cards:
- Passive
- Build
- Clarity

Tap opens either:
- **in-page scroll** (recommended for v1 prototype), or
- **full-screen sheet** (v2)

---

### Block D — Ecosystem Orb (wow visualization)
A simple “orbit” diagram: center “JetUP”, around it:
- TagMarkets (broker)
- BitOne (exchange)
- BIXFi (card / IBAN)
- AI Infrastructure (duplication)

Line under: “One community. Multiple income engines.”

---

### Block E — Passive section (anchored)
Contains:
- “Capital stays on your broker account”
- “No frozen deposits”
- “Choose strategy, control withdrawals”
- One CTA: “Start as Client”
- One CTA: “Ask Dennis (text)”

Suggested questions chips inside:
- “How does safety work?”
- “What results are realistic?”
- “How do I start with a small amount?”

---

### Block F — Build section (anchored) **(the money section)**
Contains:
- “Income layers” (broker volume, exchange fees, card activity)
- Core partner facts (short):
  - TagMarkets lot commission ten dollars fifty cents
  - Up to ten levels
  - BitOne up to sixty percent of trading fees redistributed by ranks
  - Pools / Infinity exist (keep short)
- One CTA: “Start as Partner”
- One CTA: “Join Webinar”

Suggested questions chips:
- “Show me the marketing plan”
- “How do bonuses work?”
- “What’s the fastest way to build?”
- “Do I need a team already?”

---

### Block G — Tools (secondary)
Only after the core story:
- Promotions
- Webinars & Schedule
- Tutorials & Guides

---

### Block H — Materials & Social (lowest priority)
- Presentations
- Telegram
- Instagram
- WhatsApp
(Partner-configurable later)

---

## Navigation model (prototype)
- Single-page with section anchors:
  - `#passive`
  - `#build`
  - `#clarity`
  - `#ecosystem`
  - `#tools`
- “Guided chat” scrolls to anchors.

---

# Starter: Single-file prototype (HTML + CSS + JS)

> Paste into `index.html` in Replit. Mobile-first. No external deps required.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>JetUP — Dennis Partner Hub (Prototype)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root{
      --bg:#0F0A1A;
      --card:#151028;
      --card2:#1B1333;
      --ink:#F5F3FF;
      --muted:rgba(245,243,255,.72);
      --line:rgba(245,243,255,.10);
      --accent:#7C3AED;
      --accent2:#E88FEC;
      --good:#22C55E;
      --shadow: 0 18px 70px rgba(0,0,0,.45);
      --r:22px;
      --pad:18px;
    }
    *{ box-sizing:border-box; }
    body{
      margin:0;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background: radial-gradient(1200px 800px at 50% -10%, rgba(124,58,237,.35), transparent 60%),
                  radial-gradient(900px 600px at 20% 0%, rgba(232,143,236,.18), transparent 55%),
                  var(--bg);
      color:var(--ink);
    }
    .wrap{
      max-width: 420px;
      margin: 0 auto;
      padding: 18px 14px 40px;
    }
    .topline{
      height:4px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      border-radius: 999px;
      opacity:.9;
      margin: 6px 2px 14px;
    }
    .card{
      background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
      border:1px solid var(--line);
      border-radius: var(--r);
      box-shadow: var(--shadow);
      padding: var(--pad);
    }
    .row{ display:flex; align-items:center; gap:14px; }
    .avatar{
      width:74px; height:74px; border-radius: 999px;
      background: radial-gradient(circle at 30% 30%, rgba(124,58,237,.55), rgba(232,143,236,.15)),
                  rgba(255,255,255,.06);
      border:1px solid rgba(255,255,255,.14);
      position:relative;
      overflow:hidden;
    }
    .online{
      position:absolute; right:-2px; bottom:-2px;
      background: rgba(34,197,94,.16);
      border:1px solid rgba(34,197,94,.45);
      padding:6px 10px;
      border-radius: 999px;
      font-size: 12px;
      display:flex; gap:6px; align-items:center;
      backdrop-filter: blur(8px);
    }
    .dot{ width:8px; height:8px; border-radius:99px; background: var(--good); }
    .h1{ font-family: Montserrat, Inter, sans-serif; font-size: 22px; margin:0; }
    .sub{ margin:6px 0 0; color: var(--muted); font-weight: 500; }
    .micro{ margin:10px 0 0; color: rgba(245,243,255,.62); font-size: 13px; line-height: 1.35; }
    .btns{ display:flex; gap:10px; margin-top:14px; }
    .btn{
      flex:1;
      border-radius: 16px;
      border:1px solid rgba(255,255,255,.14);
      padding: 12px 12px;
      background: rgba(255,255,255,.05);
      color: var(--ink);
      font-weight: 600;
      cursor:pointer;
    }
    .btn.primary{
      background: linear-gradient(90deg, rgba(124,58,237,.92), rgba(232,143,236,.70));
      border: none;
    }

    /* Guided chat */
    .chat{
      margin-top: 14px;
      padding: 14px;
      border-radius: var(--r);
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(124,58,237,.16), rgba(255,255,255,.02));
    }
    .chat .label{
      font-family: Montserrat, Inter, sans-serif;
      font-size: 12px;
      letter-spacing: .08em;
      opacity: .9;
      text-transform: uppercase;
      margin-bottom: 8px;
      color: rgba(245,243,255,.72);
    }
    .bubble{
      background: rgba(0,0,0,.20);
      border:1px solid rgba(255,255,255,.10);
      padding: 10px 12px;
      border-radius: 16px;
      line-height: 1.35;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .chips{ display:flex; flex-wrap:wrap; gap:8px; }
    .chip{
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.04);
      color: rgba(245,243,255,.90);
      border-radius: 999px;
      padding: 9px 11px;
      font-weight: 600;
      font-size: 13px;
      cursor:pointer;
    }
    .chip:hover{ background: rgba(255,255,255,.07); }

    /* Sections */
    .section{ margin-top: 14px; }
    .secTitle{
      font-family: Montserrat, Inter, sans-serif;
      font-size: 16px;
      margin: 0 0 10px;
    }
    .secText{ margin:0; color: var(--muted); line-height:1.45; font-size: 14px; }
    .grid3{ display:grid; grid-template-columns: 1fr; gap: 10px; }
    .path{
      padding: 14px;
      border-radius: var(--r);
      border:1px solid var(--line);
      background: rgba(255,255,255,.03);
      cursor:pointer;
    }
    .path b{ font-family: Montserrat, Inter, sans-serif; }
    .path small{ display:block; margin-top:6px; color: rgba(245,243,255,.70); line-height:1.35; }

    /* Ecosystem orb */
    .orb{
      position:relative;
      height: 220px;
      border-radius: var(--r);
      border:1px solid var(--line);
      background: radial-gradient(circle at 50% 50%, rgba(124,58,237,.20), rgba(0,0,0,.10));
      overflow:hidden;
    }
    .center{
      position:absolute; left:50%; top:50%;
      transform: translate(-50%,-50%);
      width: 120px; height: 120px;
      border-radius: 999px;
      border:1px solid rgba(255,255,255,.18);
      background: linear-gradient(180deg, rgba(124,58,237,.38), rgba(232,143,236,.12));
      display:flex; align-items:center; justify-content:center;
      font-family: Montserrat, Inter, sans-serif;
      box-shadow: 0 16px 40px rgba(0,0,0,.35);
    }
    .sat{
      position:absolute;
      padding: 8px 10px;
      border-radius: 999px;
      border:1px solid rgba(255,255,255,.14);
      background: rgba(0,0,0,.22);
      font-size: 12px;
      color: rgba(245,243,255,.92);
      backdrop-filter: blur(8px);
      white-space: nowrap;
    }
    .ring{
      position:absolute; left:50%; top:50%;
      transform: translate(-50%,-50%);
      width: 190px; height: 190px;
      border-radius: 999px;
      border: 1px dashed rgba(245,243,255,.14);
      opacity:.55;
    }

    /* Highlight on scroll */
    .highlight{
      outline: 2px solid rgba(232,143,236,.65);
      box-shadow: 0 0 0 8px rgba(124,58,237,.12);
      transition: .25s ease;
    }

    /* Footer */
    .footer{
      text-align:center;
      opacity:.65;
      margin-top: 18px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topline"></div>

    <!-- Founder Header -->
    <div class="card" id="top">
      <div class="row">
        <div class="avatar" aria-label="Dennis photo placeholder">
          <div class="online"><span class="dot"></span>Online</div>
        </div>
        <div>
          <h1 class="h1">Dennis Schymanietz</h1>
          <div class="sub">Founder · Infrastructure Architect</div>
          <div class="micro">I build scalable ecosystems — not hype. Use the guided chat below, or talk to my digital twin.</div>
        </div>
      </div>

      <div class="btns">
        <button class="btn primary" id="btnLive">Enter Strategy Call</button>
        <button class="btn" onclick="document.querySelector('#guide').scrollIntoView({behavior:'smooth'})">Start Here</button>
      </div>

      <!-- Guided text -->
      <div class="chat" id="guide">
        <div class="label">Guided entry</div>
        <div class="bubble" id="bubble">Tell me what you want today — I’ll guide you.</div>
        <div class="chips">
          <button class="chip" data-target="passive" data-reply="Good. Passive works when capital control is clear. Let me show you the passive path.">I want passive income</button>
          <button class="chip" data-target="build" data-reply="Perfect. Scale comes from structure and infrastructure. Let’s look at the partner path.">I want to build a structure</button>
          <button class="chip" data-target="clarity" data-reply="Sure. Let’s start with the ecosystem and what makes it different.">I need clarity first</button>
        </div>
      </div>
    </div>

    <!-- Paths -->
    <div class="section card" style="margin-top:14px;">
      <h2 class="secTitle">Choose your path</h2>
      <p class="secText">You can explore on your own, or let the guide navigate you to the right section.</p>
      <div class="grid3" style="margin-top:12px;">
        <div class="path" data-target="passive" data-reply="Passive path: control first, then performance.">
          <b>Passive exposure</b>
          <small>Start as a client, choose a strategy, keep control of your capital.</small>
        </div>
        <div class="path" data-target="build" data-reply="Partner path: income scale comes from structure and activity.">
          <b>Build income</b>
          <small>Multiple income layers across broker, exchange, and card infrastructure.</small>
        </div>
        <div class="path" data-target="clarity" data-reply="Clarity first: ecosystem, trust model, and what’s different.">
          <b>Clarity first</b>
          <small>Quick overview of how JetUP is structured and why it is different.</small>
        </div>
      </div>
    </div>

    <!-- Ecosystem orb -->
    <div class="section card" id="ecosystem">
      <h2 class="secTitle">JetUP ecosystem</h2>
      <p class="secText">One community. Multiple income engines — built on infrastructure, not hype cycles.</p>
      <div class="orb" style="margin-top:12px;">
        <div class="ring"></div>
        <div class="center">JetUP</div>
        <div class="sat" style="left:14px; top:38px;">TagMarkets · Broker</div>
        <div class="sat" style="right:14px; top:62px;">BitOne · Exchange</div>
        <div class="sat" style="left:22px; bottom:34px;">BIXFi · Card & IBAN</div>
        <div class="sat" style="right:18px; bottom:26px;">AI · Duplication</div>
      </div>
    </div>

    <!-- Passive -->
    <div class="section card" id="passive">
      <h2 class="secTitle">Passive path</h2>
      <p class="secText">Capital stays on your personal broker account. No frozen deposits. You choose a strategy and control withdrawals. Realistic expectations matter. If you want, ask Dennis for the best starting approach.</p>

      <div class="chips" style="margin-top:12px;">
        <button class="chip" data-reply="Safety is built around custody: your funds stay on your broker account, not with JetUP. What do you want to control most — risk or liquidity?">How does safety work?</button>
        <button class="chip" data-reply="A healthy approach is steady, not extreme. Typical expectations are in a realistic range, with no guarantees. Are you looking for smooth growth or higher volatility?">What results are realistic?</button>
        <button class="chip" data-reply="Starting small is fine. The key is a clean setup, then a strategy choice. Do you want to test first, or commit to a longer plan?">How do I start small?</button>
      </div>

      <div class="btns" style="margin-top:14px;">
        <button class="btn primary">Start as Client</button>
        <button class="btn" onclick="document.querySelector('#guide').scrollIntoView({behavior:'smooth'})">Ask Dennis (text)</button>
      </div>
    </div>

    <!-- Build -->
    <div class="section card" id="build">
      <h2 class="secTitle">Build path</h2>
      <p class="secText">If you want scale, you need infrastructure. JetUP combines broker volume, exchange fee sharing, and card activity — plus an AI-powered partner hub that helps you duplicate without chaos.</p>

      <div class="section" style="margin-top:12px;">
        <p class="secText"><b style="color:rgba(245,243,255,.92)">Partner facts:</b> broker lot commission is ten dollars fifty cents, up to ten levels. Exchange layer can redistribute up to sixty percent of trading fees via ranks. Pools and Infinity bonuses exist to reward structure volume.</p>
      </div>

      <div class="chips" style="margin-top:12px;">
        <button class="chip" data-reply="Marketing plan is volume-driven: broker lots, exchange fees, and card activity. The question is: are you building one strong leg, or two or three serious leaders?">Show me the marketing plan</button>
        <button class="chip" data-reply="Bonuses depend on structure activity: lots, ranks, pools. I can summarize it quickly, but first — do you already have a team, or start from zero?">How do bonuses work?</button>
        <button class="chip" data-reply="Fastest way is clarity plus consistency: pick a path, create daily contact, and let the hub duplicate the basics. Do you want a simple daily routine or a stronger launch sprint?">What’s the fastest way to build?</button>
        <button class="chip" data-reply="No. A team helps, but infrastructure helps more. If you start alone, you need a clean offer and daily activity. How many conversations can you realistically do per day?">Do I need a team already?</button>
      </div>

      <div class="btns" style="margin-top:14px;">
        <button class="btn primary">Start as Partner</button>
        <button class="btn">Join Webinar</button>
      </div>
    </div>

    <!-- Clarity -->
    <div class="section card" id="clarity">
      <h2 class="secTitle">Clarity first</h2>
      <p class="secText">JetUP is access to infrastructure. Broker custody stays with you. The ecosystem expands across broker, exchange, and card layers, so you can build one community with multiple income engines.</p>

      <div class="chips" style="margin-top:12px;">
        <button class="chip" data-reply="JetUP gives access and structure. Your capital stays on your broker account. Do you want to test as a client first, or evaluate partnership directly?">What is JetUP exactly?</button>
        <button class="chip" data-reply="The difference is infrastructure: multiple income layers and built-in AI duplication. What matters most to you — safety, simplicity, or scale?">What makes it different?</button>
        <button class="chip" data-reply="You can download the presentation inside the hub. Want the short version first, or do you prefer the full deck?">Can I get the presentation?</button>
      </div>

      <div class="btns" style="margin-top:14px;">
        <button class="btn primary">Open Presentation</button>
        <button class="btn">Webinars & Schedule</button>
      </div>
    </div>

    <!-- Tools -->
    <div class="section card" id="tools">
      <h2 class="secTitle">Tools</h2>
      <p class="secText">Secondary resources for when you want deeper detail.</p>
      <div class="grid3" style="margin-top:12px;">
        <div class="path"><b>Promotions</b><small>Current incentives and updates.</small></div>
        <div class="path"><b>Webinars & Schedule</b><small>Live onboarding and product walkthroughs.</small></div>
        <div class="path"><b>Tutorials & Guides</b><small>Step-by-step education and basics.</small></div>
      </div>
    </div>

    <!-- Materials & Social -->
    <div class="section card">
      <h2 class="secTitle">Materials</h2>
      <p class="secText">Presentations and community links. Partners can customize these later.</p>
      <div class="grid3" style="margin-top:12px;">
        <div class="path"><b>Presentations</b><small>Download directly inside the hub.</small></div>
        <div class="path"><b>Telegram</b><small>Community updates.</small></div>
        <div class="path"><b>Instagram</b><small>Short content & lifestyle.</small></div>
      </div>
    </div>

    <div class="footer">Powered by JetUP</div>
  </div>

  <script>
    const bubble = document.getElementById('bubble');

    function highlight(el){
      el.classList.add('highlight');
      setTimeout(()=>el.classList.remove('highlight'), 900);
    }

    function goTo(id){
      const el = document.getElementById(id);
      if(!el) return;
      el.scrollIntoView({behavior:'smooth', block:'start'});
      setTimeout(()=>highlight(el), 350);
    }

    // chip + path handlers
    document.addEventListener('click', (e)=>{
      const t = e.target.closest('[data-target], [data-reply]');
      if(!t) return;

      const reply = t.getAttribute('data-reply');
      if(reply) bubble.textContent = reply;

      const target = t.getAttribute('data-target');
      if(target) goTo(target);
    });

    // placeholder for live avatar
    document.getElementById('btnLive').addEventListener('click', ()=>{
      bubble.textContent = "If you want, we can go live. Before we do — are you here for passive income, or to build something scalable?";
      // In your integration: open LiveAvatar modal / iframe
      // Example: openLiveAvatar();
    });
  </script>
</body>
</html>
```

---

## What to change next (once this renders)
- Replace avatar placeholder with Dennis image.
- Replace the “Enter Strategy Call” click with LiveAvatar modal/iframe.
- Wire “Start as Client / Partner” to your internal flows (no external redirects).
- Localize chips and copy for DE / RU / EN.

