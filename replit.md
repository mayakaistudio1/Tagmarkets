# JetUP — Digital Hub & Smart Linktree

## Overview

JetUP is a digital information hub and smart linktree for the JetUP financial ecosystem, functioning as both a standalone website and a Telegram Mini App. Its primary purpose is to serve as a central onboarding and navigation tool, consolidating all JetUP ecosystem resources, services, and tools. Users can explore products, attend webinars, watch tutorials, and interact with an integrated AI assistant named Maria. The platform targets German-speaking (primary) and Russian-speaking users interested in trading, copy-trading, and partnership income.

**Key capabilities:**
- Centralized access to JetUP financial products like Copy-X Strategies, Trading Signals, JetUP Academy, Partner Program, TAG Markets, Amplify 12x, and BIX.FI / BIT1.
- Provides a mobile-first, multilingual experience.
- Features an AI consultant for real-time support.

**Business Vision:** To provide structure, transparency, and control ("Struktur. Transparenz. Kontrolle.") within the JetUP financial ecosystem by offering a comprehensive and user-friendly digital hub.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 19 with TypeScript, bundled via Vite 7.
- **Routing**: Wouter.
- **Styling**: Tailwind CSS v4 with CSS variables; integrates Telegram theme.
- **UI Components**: shadcn/ui (new-york style) built on Radix UI.
- **Animations**: Framer Motion for transitions and micro-interactions.
- **State Management**: TanStack React Query for server state, React useState for local state.
- **Icons**: Lucide React.
- **UI/UX Decisions**:
    - **Color Scheme**: Primary purple (`#7C3AED`), accent light purple (`#A855F7`), gradient effects.
    - **Typography**: Montserrat font (400-800 weight).
    - **Mobile-First Design**: Responsive layout for optimal mobile experience.
    - **Multilingual Support**: German (de), Russian (ru), and English (en) languages managed via `LanguageContext.tsx`.

### Backend
- **Runtime**: Node.js 20 with Express 5.
- **Language**: TypeScript.
- **API Pattern**: RESTful endpoints under `/api/*`.
- **Session Management**: Express sessions with PostgreSQL store.

### Database
- **Type**: PostgreSQL with Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts`. Key tables include `users`, `applications`, `chat_sessions`, `chat_messages`, `promotions`, `schedule_events`, `speakers`, and `promo_applications`.
- **Data Management**: Drizzle-kit for migrations; seed data loaded on first startup.

### AI Integrations
- **Maria Text Chat**: Utilizes OpenAI API via Replit AI Integrations for streaming SSE responses. Includes system prompts tailored per language (RU/DE/EN) with integrated JetUP knowledge base. Text transcripts saved to DB.
- **Maria Video Avatar**: HeyGen LiveAvatar integration via LiveKit WebRTC for real-time video streaming with voice. Video call transcriptions are saved to the database on session end and viewable in the admin panel.

### File Storage
- **Platform**: Replit Object Storage for persistent file uploads (e.g., speaker photos, banners).

### Build System
- **Development**: `npm run dev` for tsx (Express) + Vite dev server.
- **Production**: `npm run build` for client (Vite) and server (esbuild) bundling, followed by `npm start`.

### Core Features
- **Partner Digital Hub**: Personalized partner pages (e.g., `/dennis`, also `/p/dennis` for backward compat) — state machine with 5 states (HERO → CHAT_OVERLAY → PRESENTATION_OVERLAY → ECOSYSTEM_OVERLAY + `/live` route). **Multilingual** (RU/DE/EN) with language selector on hero screen — all text uses `t()` from `LanguageContext` with `pdh.*` keys. Hero: "Dennis / Founder JetUP / Financial products · Partner system · AI infrastructure". Chat: first message invites to explore system, fixed exploration button always visible → AI responds → opens presentation. Dennis AI chat uses real OpenAI (`gpt-4o-mini`) with SSE streaming via `POST /api/partner/dennis/chat`. Presentation (Deck v2): Canvas/CSS animated financial background (`FinancialBackground.tsx` — 3 layers: gradient, network lines, market candles, parallax on slide change) + **cinematic AI-generated video backgrounds** (3 groups: `bg_market.mp4` for slides 1-3 [night city aerial], `bg_partner.mp4` for slides 4-7/10 [business conference silhouettes], `bg_tech.mp4` for slides 8-9 [AI digital twin concept]; HTML5 `<video>` elements with autoPlay/loop/muted, gradient overlays + vignette on top, fallback to static poster images on error) + 1 interactive ecosystem map slide (`EcosystemMapSlide.tsx` — JETUP center + 5 satellite nodes with orbital floating + zoom animations + line highlighting on selection) + glassmorphism text cards (rgba(8,6,20,0.60), blur 20px, radius 24px) + 2-3 contextual chips per slide (chip press → card micro-scale 1.02 + open chat with slide context injection). **Partner recruiting presentation**: Slides 1-2 (market/industry problem), 3-4 (JetUP solution/safety), 5-7 (partner program deep dive with Lot Commissions, Profit Share, Infinity Bonus, Global Pool, Incentives, Career Steps — each with interactive micro-cards and FactSheet bottom-sheets), 8 (AI duplication), 9 (ecosystem), 10 (CTA). Interactive sub-elements on slides 4 (security points), 5 (strategy cards for income streams), 6 (security points for bonuses/career), 8 (AI network nodes + **side-by-side AI comparison** "Без AI" vs "С AI" + "Try Dennis AI" button). **Journey Progress navigation** replaces hidden Explore Map — 5 color-coded segment groups (Market red, Solution purple, Partner green, AI blue, Ecosystem orange) with active/completed/partial states. **Other features**: (1) Enhanced progress bar showing exploration % and next slide name; (2) Dennis Insight personal quotes on slides 3, 5, 6, 8; (3) Side-by-side AI comparison on slide 8; (4) "Try Dennis AI" button opening chat directly from slide 8; (5) JetUP Engine animated assembly on final slide 10. TOC popup. Slide 10 CTAs: schedule call, start link, Telegram, view ecosystem. Ecosystem overlay renders full `HomePage` component inside Dennis hub with back-to-Dennis navigation via `EcoNavContext`. Language change resets chat messages to localized first message. See `docs/presentation_structure.md` for full details.
- **Social Sharing**: Reusable ShareMenu component on Promotions and Schedule pages.
- **Smart Linktree Navigation**: Multi-level navigation including Hub, Trading Hub, Partner Hub, Schedule, Tutorials, and Promotions.
- **Dennis Fast Start Promo**: Dynamic promo system with `dennis_promos` DB table for configurable promo offers (title, shortDesc, description, rules, isActive, sortOrder). PromoCard component fetches active promos from `GET /api/dennis-promos` and renders them dynamically. Admin tab "Promo" has two sub-tabs: "Промо-акции" (CRUD for promo offers) and "Заявки" (applications management with approve/reject/CSV export). Applications stored in `promo_applications` table with `promoId` linking to specific promo. Telegram notifications sent to group chat on each new application via `TELEGRAM_BOT_TOKEN` + `TELEGRAM_NOTIFY_CHAT_ID`. API: `GET/POST /api/admin/dennis-promos`, `PUT/DELETE /api/admin/dennis-promos/:id`, `GET /api/admin/promo-applications`, `PATCH /api/admin/promo-applications/:id/status`.
- **Personal AI Invite**: Chat-based personalized invitation flow for webinars. Partner creates a unique link for a specific prospect via DISC-based AI qualification (relationship/motivation/reaction questions), and when the prospect opens `/personal-invite/:code`, an AI assistant conducts a conversational invitation using OpenAI GPT-4o-mini. Features: personalized first message using partner name/prospect details, DISC-typed quick-reply buttons (language-aware EN/DE/RU), inline registration form within chat, reminder preference selection, visit tracking (`viewedAt` timestamp set on first open). Invite Preview screen shows partner what prospect will see (chat bubbles, webinar card, quick replies) before sharing. Data stored in `personal_invites` table (partnerId, scheduleEventId, inviteCode, prospectName/Type/Note, guestName/Email/Telegram, chatHistory JSON, reminderPreference, viewedAt, discType, inviteStrategy, generatedMessages). API: `POST /api/partner-app/create-personal-invite`, `GET /api/personal-invite/:code`, `POST /api/personal-invite/:code/init-chat`, `POST /api/personal-invite/:code/chat`, `POST /api/personal-invite/:code/register`, `POST /api/personal-invite/:code/reminder`. Partner app UI: "AI Invite" button on webinar detail screen → prospect form → AI qualification chat → preview messages → confirm → share link screen with preview button. PersonalInvitePage is fully multilingual (EN/DE/RU) with language auto-detection from browser, language selector, and language passed to AI chat endpoints.
- **Smart Invite System**: Partner invite tracking for Zoom events. Tables: `invite_events` (partnerName, partnerCu, partnerId, scheduleEventId, zoomLink, title, eventDate, eventTime, inviteCode unique), `invite_guests` (name, email, phone, clickedZoom, clickedAt), `zoom_attendance` (participant tracking from Zoom API). Flow: partner selects webinar from schedule via bot → gets unique `/invite/:code` URL → shares link → guest registers → clicks "Join Zoom" (tracked) → redirected to Zoom. Enhanced invite landing page with countdown timer, speaker info, event highlights, branded JetUP design. Telegram notifications on registration to both admin chat and partner's personal Telegram. API: `GET/POST /api/invite/:code`, `POST /api/invite/:code/register`, `POST /api/invite/:code/click`, admin CRUD under `/api/admin/invite-events`.
- **Partner Telegram Bot**: Bot for partners (brokers). `/start` opens the Partner Mini App via Web App button (both for new and existing partners). `/invite` opens the Mini App's webinars tab. `/events`, `/report`, `/followup` for stats, reports, and AI follow-up. Registration happens in the Mini App (not via bot commands). Bot webhook at `POST /api/telegram-bot/webhook`. Partners table: `partners` (telegramChatId unique, name, cuNumber, phone, email, status). Real-time notifications when guests register through partner's invite link.
- **Partner App Auth**: Three auth modes: (1) Telegram WebApp SDK auto-auth when opened from Telegram, (2) Telegram Login Widget for browser access, (3) manual Telegram ID input as fallback. New partners see a registration form (name, CU number, phone, email) instead of "Access Restricted". Registration endpoint: `POST /api/partner-app/register`.
- **Zoom API Integration**: Server-to-Server OAuth integration with Zoom Reports API. Fetches participant data (join/leave times, duration), Q&A activity. Matches participants to registered guests by email. Stores in `zoom_attendance` table. Gracefully falls back to click tracking when Zoom API is not configured. Environment variables: `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`.
- **Admin Panel**: Password-protected (`/admin`) for managing chat logs, promotions, schedule events, speakers, promo applications, and invite events with CRUD operations. Includes rate-limited login. Banner export uses html2canvas to capture the rendered React preview component.
- **Maria AI Analysis**: GPT-4o powered analysis of chat dialogues via admin panel. Includes Maria's actual system prompt for context. Filterable by language (DE/RU/EN/All). Produces report with: top user questions, problematic answers, drop-off points, conversion analysis, and prompt improvement recommendations. Endpoint: `POST /api/admin/analyze-maria`.

## External Dependencies

- **PostgreSQL**: For database persistence, managed by Drizzle ORM.
- **OpenAI API**: Used for Maria's text chat capabilities (via Replit AI Integrations).
- **HeyGen**: Provides the LiveAvatar service for Maria's video avatar functionality, integrating with LiveKit WebRTC.
- **Replit Object Storage**: For persistent file storage of uploaded assets.
- **Telegram WebApp SDK**: For integration as a Telegram Mini App.
- **Google Sheets API**: Auto-sync of chat logs to a "JetUP Chat Logs" spreadsheet and promo applications to a "JetUP Promo Applications" spreadsheet via `server/googleSheets.ts`. Uses Replit Google Sheets connector (OAuth). New messages/applications auto-append on creation; full sync available via admin panel buttons. Promo applications sync endpoint: `POST /api/admin/sync-promo-sheets`.
- **Google Drive**: Linked for presentations.
- **Telegram (External)**: Linked for the JetUPDach channel.
- **Instagram**: Linked for jetup.official.
- **TAG Markets**: Licensed broker integrated into the ecosystem.
- **BIX.FI / BIT1**: Crypto debit card and exchange services.