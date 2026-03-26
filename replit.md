# JetUP — Digital Hub & Partner Platform

## Overview

JetUP is a digital information hub and smart linktree for the JetUP financial ecosystem, functioning as both a standalone website and a Telegram Mini App. Its primary purpose is to serve as a central onboarding and navigation tool, consolidating all JetUP ecosystem resources, services, and tools. Users can explore products, attend webinars, watch tutorials, and interact with an integrated AI assistant named Maria. The platform targets German-speaking (primary) and Russian-speaking users interested in trading, copy-trading, and partnership income.

**Key capabilities:**
- Centralized access to JetUP financial products like Copy-X Strategies, Trading Signals, JetUP Academy, Partner Program, TAG Markets, Amplify 12x, and BIX.FI / BIT1.
- Mobile-first, multilingual experience (DE/RU/EN).
- AI consultant (Maria) for real-time support.
- Full Partner CRM: invite tracking, guest notifications, Zoom attendance attribution.

**Business Vision:** "Struktur. Transparenz. Kontrolle." within the JetUP financial ecosystem.

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend
- **Framework**: React 19 with TypeScript, bundled via Vite 7.
- **Routing**: Wouter.
- **Styling**: Tailwind CSS v4 with CSS variables; integrates Telegram theme.
- **UI Components**: shadcn/ui (new-york style) built on Radix UI.
- **Animations**: Framer Motion for transitions and micro-interactions.
- **State Management**: TanStack React Query for server state, React useState for local state.
- **Icons**: Lucide React.
- **Multilingual**: German (de), Russian (ru), English (en) managed via `LanguageContext.tsx`.

### Backend
- **Runtime**: Node.js 20 with Express 5.
- **Language**: TypeScript.
- **API Pattern**: RESTful endpoints under `/api/*`.
- **Session Management**: Express sessions with PostgreSQL store.

### Database
- **Type**: PostgreSQL with Drizzle ORM.
- **Schema**: `shared/schema.ts`. Key partner tables: `partners`, `personal_invites`, `invite_events`, `invite_guests`, `zoom_attendance`.
- **Migrations**: Applied on server startup in `server/index.ts` via raw SQL `ALTER TABLE IF NOT EXISTS` statements.

### Build System
- **Development**: `npm run dev` — tsx (Express) + Vite dev server on port 5000.
- **Production**: `npm run build` (Vite + esbuild), then `npm start`.

---

## Partner Infrastructure — Complete Architecture

### Overview Diagram

```
Partner (Telegram)
    │
    ├─ Partner Bot (@Jetup_partner_bot / @Jetup_partner_test_bot)
    │       └─ /start → opens Partner Mini App (WebApp button)
    │       └─ /start remind_CODE → guest Telegram subscription deep link
    │
    └─ Partner Mini App (Telegram WebApp)
            ├─ Tab 1: Upcoming Events (webinars + funnels + per-contact invites)
            ├─ Tab 2: Contacts (all registered guests + channel status + AI follow-up)
            ├─ Tab 3: Statistics (lifetime totals)
            └─ Tab 4: Profile (partner info)

Guest Flow:
    Partner creates invite → Guest opens /personal-invite/:code
        → AI chat (GPT-4o-mini) → Registration form
        → Confirmation email (Resend)
        → Telegram CTA (if channel=telegram)
        → /go/{guestToken} tracking link (in email, reminders)
        → Zoom event (attendance tracked via Zoom API)
        → Partner sees attendance + channel status in Mini App
```

---

### 1. Partner Telegram Bot

**Files**: `server/integrations/partner-bot.ts`, `server/partner-app-routes.ts`

**Two bot tokens** (selected at runtime):
- `TELEGRAM_PARTNER_BOT_TOKEN_DEV` — dev bot (@Jetup_partner_test_bot)
- `TELEGRAM_PARTNER_BOT_TOKEN` — production bot
- Helper: `getPartnerBotToken()` always picks DEV in development, PROD in production.

**Webhook**: `POST /api/telegram-bot/webhook`

**Bot commands**:
| Command | Action |
|---|---|
| `/start` | Opens Partner Mini App via WebApp button |
| `/start remind_CODE` | Guest Telegram deep link: links `telegramChatId` to `personal_invites` row identified by `inviteCode=CODE`, enables `telegramNotificationsEnabled=true`, sends confirmation with webinar details |
| `/invite` | Opens Mini App on Upcoming tab |
| `/events` | Text summary of partner's upcoming events |
| `/report` | Partner stats summary |

**Registration**: New partners register via the Mini App registration form, not via bot. Bot detects unknown `telegramChatId` → sends "open Mini App to register" message.

**Notifications to partner** (triggered server-side):
- Guest registers via personal invite link → partner gets Telegram DM with guest name + contact details.
- Reminder windows (24h, 1h before event) → partner gets reminder prompt to contact guest.

---

### 2. Partner Mini App Auth

**File**: `client/src/pages/partner-app/partnerAuth.ts`, `server/partner-app-routes.ts`

**Auth flow**:
1. **Primary**: Telegram WebApp `initData` sent in `x-partner-auth: tg:<initData>` header. Server verifies HMAC signature using `TELEGRAM_PARTNER_BOT_TOKEN` (prod/dev selected automatically). Extracts `telegramChatId` from verified data. Looks up partner in DB.
2. **Fallback (dev/browser)**: `x-partner-auth: id:<telegramChatId>` for direct testing.
3. **New partner**: If `telegramChatId` not found → returns `{ needsRegistration: true }` → frontend shows registration form.

**Registration**: `POST /api/partner-app/register` — creates partner record with name, CU number, phone, email, telegramChatId.

**All partner API routes** require valid `x-partner-auth` header and resolved `partner.id`.

---

### 3. Partner Mini App — 4 Tabs

**File**: `client/src/pages/partner-app/PartnerApp.tsx`

#### Tab 1: Upcoming Events (`UpcomingScreen.tsx`)
- Lists all future `schedule_events` with partner-specific stats pulled from `GET /api/partner-app/events`.
- Stats per event: registered count, attended count (walk-ins excluded — only guests with `inviteGuestId != null`).
- **Event detail screen** (tapping an event):
  - Funnel card: Views → Registered → Clicked join link → Attended.
  - Guest list from `GET /api/partner-app/events/:id/report`.
  - **"My Invitations" section**: fetches `GET /api/partner-app/events/:id/personal-invites` — shows all personal invites for that event with status badges: Sent / Viewed / Chatted / Registered.
  - Follow-up button per contact: opens Telegram direct chat (if `guestTelegram` set) or Telegram share link with pre-filled personalized reminder text.
  - **Social share**: "Share invite link" button creates/reuses a `invite_events` record and shares `/invite/:code` URL.
  - AI Personal Invite creation: prospect form → DISC qualification → preview → share `/personal-invite/:code`.

#### Tab 2: Contacts (`ContactsScreen.tsx`)
- Fetches all registered guests across all events from `GET /api/partner-app/events/:id/report` (per event), aggregated.
- Per contact card shows:
  - Name, email, phone, Telegram handle.
  - **Reminder channel + subscription status**:
    - `reminderChannel=telegram`: 🔔 Subscribed / ⏺ Not subscribed (based on `telegramNotificationsEnabled`).
    - `reminderChannel=whatsapp`: 📲 WhatsApp reminder badge.
    - `reminderChannel=email` or unset: ✉️ Email reminder badge.
  - `/go/` link click status: green "clicked" or amber "not yet".
  - Attendance status from Zoom.
- **AI Follow-up**: generates personalized outreach message via `POST /api/partner-app/contacts/:guestId/ai-followup`.
- Filter tabs: All / Invited / Registered / Attended / No-show / Follow-up.

#### Tab 3: Statistics (`StatisticsScreen.tsx`)
- Lifetime totals: total invites sent, total registered, total attended (walk-ins excluded).
- From `GET /api/partner-app/profile`.

#### Tab 4: Profile (`PartnerApp.tsx` profile section)
- Displays partner name, CU number, email, phone.
- Editable via `PUT /api/partner-app/profile`.

---

### 4. Personal Invite Pipeline (Full Flow)

**Tables**: `personal_invites`

**Schema fields** (key ones):
```
id, partnerId, scheduleEventId
inviteCode (unique slug)
prospectName, prospectType, prospectNote
discType, inviteStrategy
guestName, guestEmail, guestTelegram, guestPhone
guestLanguage, chatHistory (JSON)
reminderChannel ("email" | "whatsapp" | "telegram")
preferredChannel (mirrors reminderChannel, persisted on registration)
reminderSent (bool) — 1h reminder sent
reminder24hSent (bool) — 24h reminder sent
reminderPreference (legacy, kept for UX quick replies)
viewedAt, registeredAt, isActive
guestToken (unique UUID) — used in /go/ links
goClickedAt — timestamp when guest clicked /go/ link
telegramChatId — set when guest subscribes via bot /start remind_CODE
telegramNotificationsEnabled (bool)
```

**Step-by-step flow**:

1. **Partner creates invite** in Mini App:
   - Fills prospect name, type, note → optional DISC qualification chat → AI generates personalized opening messages → preview → confirm.
   - API: `POST /api/partner-app/create-personal-invite`
   - Unique `inviteCode` generated, `guestToken` UUID generated, stored in DB.
   - Partner gets share link: `https://jet-up.ai/personal-invite/:code`

2. **Guest opens invite** (`/personal-invite/:code`):
   - `GET /api/personal-invite/:code` marks `viewedAt`, returns event info + chat history + `reminderChannel` + `inviteCode` (for already-registered guests).
   - AI chat starts using `POST /api/personal-invite/:code/chat` (GPT-4o-mini, DISC-aware system prompt).
   - DISC quick-reply buttons offered based on `discType`.

3. **Guest registers** via inline form:
   - Fields: Name, Email, + reminder channel toggle (Email / WhatsApp / Telegram).
   - WhatsApp: phone number field. Telegram: @username field. Email: no extra field.
   - API: `POST /api/personal-invite/:code/register`
   - Persists: `guestName`, `guestEmail`, `guestTelegram`, `guestPhone`, `reminderChannel`, `preferredChannel`, `registeredAt`.
   - Triggers:
     - Branded confirmation email sent to guest via Resend (EN/DE/RU, `/go/{guestToken}` join link).
     - Telegram DM to partner with guest contact details.

4. **Success screen** (post-registration):
   - Shows event details + "We'll remind you" message.
   - If `reminderChannel === "telegram"`: shows CTA button "Subscribe in Telegram" — deep link `t.me/<botUsername>?start=remind_<inviteCode>`.
   - Join link shown only when event is ≤60 min away (or up to 3h after start).

5. **Guest subscribes on Telegram** (optional):
   - Guest taps CTA → opens bot → sends `/start remind_CODE`.
   - Bot webhook: parses `remind_CODE`, finds invite by `inviteCode`, stores `telegramChatId`, sets `telegramNotificationsEnabled=true`, sends confirmation with webinar details.

6. **Reminder scheduler** (`server/integrations/reminder-scheduler.ts`):
   - Polls every 2 minutes.
   - Fetches all registered invites where `reminderSent=false` (`getPersonalInvitesPendingAutoReminder()`).
   - **24h window** (event is 1h–24h away, `reminder24hSent=false`):
     - Sends partner Telegram DM: "Your guest X has a webinar in 24 hours — remind them via [channel]".
     - Sends guest notification on their chosen channel (email or Telegram).
     - Sets `reminder24hSent=true`.
   - **1h window** (event ≤1h away):
     - Same pattern. Sets `reminderSent=true` (marks as done).
   - **Channel routing**:
     - `reminderChannel=email` → sends Resend email with `/go/{guestToken}` link.
     - `reminderChannel=telegram` → sends Telegram DM via partner bot (prefers `telegramChatId`, falls back to `@username`).
     - `reminderChannel=whatsapp` → partner notified only (partner must contact manually).
   - If no `guestToken`: skips guest notification, logs warning, partner still notified.

7. **Guest joins via `/go/{guestToken}`** (`GoPage.tsx`):
   - Records `goClickedAt` on invite record.
   - Redirects to Zoom link.
   - Zoom attendance later matched by `inviteGuestId` for accurate attribution.

---

### 5. Social Invite System (Group Invite)

**Tables**: `invite_events`, `invite_guests`

**Flow**: Partner shares a single invite link for an event with many guests.
- `GET /invite/:code` — landing page with event info + registration form.
- `POST /invite/:code/register` — creates `invite_guests` record, Telegram notification to partner + admin.
- `POST /invite/:code/click` — marks `clickedZoom=true`, redirects to Zoom.
- Partner creates invite from UpcomingScreen detail → `invite_events` record with `inviteCode`.
- Walk-ins (Zoom participants without `inviteGuestId`) are **excluded** from partner stats.

---

### 6. Guest Attendance Attribution

**Table**: `zoom_attendance`

- Server-to-Server Zoom OAuth (`ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`).
- Fetches participants from Zoom Reports API after each webinar.
- Matches by `inviteGuestId` (preferred) or email.
- Stores: `durationMinutes`, `questionsAsked`, `joinTime`, `leaveTime`.
- Partner stats: `attendedCount` = guests where `inviteGuestId != null` (excludes walk-ins).

---

### 7. Key API Endpoints (Partner)

**Partner-auth required** (`x-partner-auth` header):

| Method | Path | Description |
|---|---|---|
| GET | `/api/partner-app/profile` | Partner profile + lifetime stats |
| PUT | `/api/partner-app/profile` | Update partner info |
| GET | `/api/partner-app/events` | Upcoming events with per-event stats |
| GET | `/api/partner-app/events/:id/report` | Full funnel report + guest list |
| GET | `/api/partner-app/events/:id/personal-invites` | Personal invites for event (My Invitations) |
| POST | `/api/partner-app/create-personal-invite` | Create new personal invite |
| POST | `/api/partner-app/create-social-invite` | Create/get social invite for event |
| POST | `/api/partner-app/contacts/:id/ai-followup` | Generate AI follow-up message |
| POST | `/api/partner-app/register` | Register new partner |

**Public (guest-facing)**:

| Method | Path | Description |
|---|---|---|
| GET | `/api/personal-invite/:code` | Load invite (marks viewed, returns reminderChannel) |
| POST | `/api/personal-invite/:code/chat` | AI chat message |
| POST | `/api/personal-invite/:code/register` | Guest registration |
| GET | `/api/go/:token` | Record goClickedAt, redirect to Zoom |
| GET | `/invite/:code` | Social invite landing |
| POST | `/invite/:code/register` | Social invite registration |

**Bot**:

| Method | Path | Description |
|---|---|---|
| POST | `/api/telegram-bot/webhook` | Partner bot webhook (all commands incl. `/start remind_CODE`) |

---

### 8. Environment Variables (Partner-related)

| Variable | Purpose |
|---|---|
| `TELEGRAM_PARTNER_BOT_TOKEN` | Production partner bot token |
| `TELEGRAM_PARTNER_BOT_TOKEN_DEV` | Dev partner bot token |
| `TELEGRAM_PARTNER_BOT_USERNAME` | Bot @username for deep links (prod) |
| `TELEGRAM_PARTNER_BOT_USERNAME_DEV` | Bot @username for deep links (dev) |
| `RESEND_API_KEY` | Transactional email sending |
| `ZOOM_ACCOUNT_ID` | Zoom Server-to-Server OAuth |
| `ZOOM_CLIENT_ID` | Zoom API access |
| `ZOOM_CLIENT_SECRET` | Zoom API access |
| `PRODUCTION_URL` | Base URL for /go/ links in production |

---

## Other Core Features

- **Partner Digital Hub**: Personalized partner pages (`/dennis`, `/p/dennis`). State machine: HERO → CHAT_OVERLAY → PRESENTATION_OVERLAY → ECOSYSTEM_OVERLAY + `/live` route. Multilingual (RU/DE/EN). AI chat via `POST /api/partner/dennis/chat` (GPT-4o-mini, SSE). 10-slide presentation with cinematic video backgrounds (`bg_market.mp4`, `bg_partner.mp4`, `bg_tech.mp4`), glassmorphism cards, interactive ecosystem map (`EcosystemMapSlide.tsx`), context-injected chip→chat interactions.

- **Dennis Fast Start Promo**: `dennis_promos` DB table. PromoCard fetches from `GET /api/dennis-promos`. Admin CRUD + applications management with approve/reject/CSV export. Telegram notifications on each new application.

- **Smart Linktree Navigation**: Hub, Trading Hub, Partner Hub, Schedule, Tutorials, Promotions pages.

- **Zoom API Integration**: Server-to-Server OAuth. Fetches participants after each webinar, stores in `zoom_attendance`, matches to guests by `inviteGuestId` or email.

- **Admin Panel**: Password-protected (`/admin`). Manages chat logs, promotions, schedule events, speakers, promo applications, invite events, partners. Rate-limited login.

- **Maria AI**: Text chat (GPT-4o-mini, SSE, system prompt per language). Video avatar (HeyGen LiveAvatar via LiveKit WebRTC). GPT-4o analysis of chat logs via admin panel.

- **Promo Verification Poller**: Checks pending promo applications every 3 minutes, notifies admin on status changes.

---

## External Dependencies

| Service | Purpose |
|---|---|
| PostgreSQL | Main database (Drizzle ORM) |
| OpenAI API | Maria chat, AI follow-ups, invite AI, partner chat (via Replit AI Integrations) |
| HeyGen / LiveKit | Maria video avatar (WebRTC) |
| Replit Object Storage | Speaker photos, banners |
| Telegram Bot API | Partner bot + guest notifications |
| Resend | Transactional emails (confirmation, reminders) |
| Zoom API | Attendance tracking (Server-to-Server OAuth) |
| Google Sheets | Chat logs + promo applications auto-sync (Replit connector) |
| Google Drive | Presentations |

## File Structure (Key Partner Files)

```
server/
  partner-app-routes.ts       — All /api/partner-app/* and /api/personal-invite/* routes
  integrations/
    partner-bot.ts            — Telegram bot webhook handler
    reminder-scheduler.ts     — 24h + 1h automatic reminder scheduler
    resend-email.ts           — Transactional email templates + sending
    telegram-notify.ts        — Low-level Telegram message helpers

client/src/pages/
  partner-app/
    PartnerApp.tsx            — Main 4-tab container + auth + registration
    UpcomingScreen.tsx        — Events list + detail + My Invitations
    ContactsScreen.tsx        — All guests + channel status + AI follow-up
    StatisticsScreen.tsx      — Lifetime partner stats
    partnerAuth.ts            — HMAC auth header helper
  PersonalInvitePage.tsx      — /personal-invite/:code guest-facing page
  GoPage.tsx                  — /go/:token attendance tracking redirect
  InvitePage.tsx              — /invite/:code social invite landing

shared/
  schema.ts                   — All DB table definitions (personalInvites, partners, etc.)
```
