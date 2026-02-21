# JetUP — Digital Hub & Smart Linktree

## Overview

JetUP is a **digital information hub and smart linktree** for the JetUP financial ecosystem. It works both as a **standalone website** (accessible via direct URL in any browser) and as a **Telegram Mini App** (embedded within Telegram). The application serves as a central onboarding and navigation tool where users can explore ecosystem products, attend webinars, watch tutorials, and interact with an AI assistant named Maria.

**Key concept:** A mobile-first, multilingual smart linktree that consolidates all JetUP ecosystem resources, services, and tools in one place — with an integrated AI consultant for real-time support.

**Target audience:** German-speaking (primary) and Russian-speaking users interested in trading, copy-trading, and partnership income.

**Tagline:** "Struktur. Transparenz. Kontrolle." / "Структура. Прозрачность. Контроль."

## JetUP Ecosystem (Business Context)

JetUP is a financial platform that unites verified providers, tools, and services for financial markets:

- **Copy-X Strategies** — automated copy-trading of professional strategies (70% profit to client)
- **Trading Signals** — real-time signals with entry, stop-loss, and take-profit levels
- **JetUP Academy** — trading education, risk management, systems thinking
- **Partner Program** — lot commissions (up to 10 levels), Profit Share, Infinity Bonus, Global Pools, Lifestyle rewards
- **TAG Markets** — licensed broker (FSC Mauritius, license GB21026474), leverage up to 1:500, 500k+ traders
- **Amplify 12x** — funded accounts with 12x capital scaling on real market liquidity
- **BIX.FI / BIT1** — crypto debit cards and crypto exchange
- **Registration URL**: https://jetup.ibportal.io

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React 19 with TypeScript, bundled via Vite 7
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS v4 with CSS variables; Telegram theme integration via CSS vars
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **State Management**: TanStack React Query for server state, React useState for local state
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js 20 with Express 5
- **Language**: TypeScript compiled with tsx (dev), esbuild (production)
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

### Database (PostgreSQL + Drizzle ORM)

Schema defined in `shared/schema.ts`. Tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (id, username, password) |
| `applications` | User applications/leads (name, contact, interest) |
| `chat_sessions` | Maria chat sessions (sessionId, language, type: text/video) |
| `chat_messages` | Individual messages within chat sessions (role, content) |
| `promotions` | Managed promotions/offers (badge, title, subtitle, highlights, CTA, gradient, language, translationGroup) |
| `schedule_events` | Webinars/events (day, date, time, timezone, speaker, speakerId, type, typeBadge, highlights, Zoom link, language) |
| `speakers` | Reusable speaker profiles (name, photo, role, isActive) |

- Migrations via `drizzle-kit push` (`npm run db:push`)
- Seed data loaded on first startup if tables are empty (see `server/seed.ts`)

### AI Integrations

- **Maria Text Chat**: OpenAI API via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`). Streaming SSE responses. System prompts per language (RU/DE) with JetUP knowledge base, TTS-optimized (no digits/symbols). Endpoint: `POST /api/maria/chat`
- **Maria Video Avatar**: HeyGen LiveAvatar integration via LiveKit WebRTC. Real-time video streaming of avatar with voice. Audio Worklet for PCM16 playback. Endpoints: `/api/liveavatar/token`, `/api/liveavatar/start`, `/api/liveavatar/stop`, `/api/liveavatar/event`, `/api/liveavatar/transcript/:sessionId`

### File Storage

- **Replit Object Storage** for persistent file uploads (speaker photos, banners)
- Upload route: `POST /api/admin/upload` (multer → Object Storage)
- Serving route: `GET /uploads/:filename` (reads from Object Storage)

### Build System

- **Development**: `npm run dev` → tsx runs Express + Vite dev server with HMR on port 5000
- **Production**: `npm run build` → Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`; `npm start` runs production bundle
- **Build Script**: `script/build.ts`

## Project Structure

```
client/
  index.html                          — HTML entry point with OG/Twitter meta tags
  src/
    main.tsx                           — React entry point
    App.tsx                            — Root component, routing, AnimatePresence
    index.css                          — Global styles, Tailwind, custom CSS classes
    contexts/
      LanguageContext.tsx               — Language state, all translations (RU/DE), t() function
    pages/
      HomePage.tsx                     — Hub: logo, Maria card, Trading/Partner hubs, promo/schedule/tutorials buttons, direct links
      TradingHubPage.tsx               — TAG Markets, Copy-X, Amplify 12x, Schnellstart, FAQ
      PartnerHubPage.tsx               — Commissions, Profit-Share, Infinity Bonus, Global Pools, Lifestyle
      SchedulePage.tsx                 — Event calendar with Alle/Trading/Partner tabs, Zoom links
      TutorialsPage.tsx                — Video/guide cards for Traders and Partners
      PromoDetailPage.tsx              — Promotions/offers listing page
      MariaPage.tsx                    — Text chat + video call bar with AI assistant Maria
      AdminPage.tsx                    — Password-protected admin dashboard (CRUD for content)
      TurkeyPromoPreview.tsx           — Turkey promo video preview page
      LinksPage.tsx                    — Links page (legacy)
      XFusionPage.tsx                  — Legacy page
      not-found.tsx                    — 404 page
    components/
      TabBar.tsx                       — Bottom navigation (Hub + Maria tabs), shown on / and /maria only
      TextChat.tsx                     — Maria text chat component with message bubbles
      VideoCallBar.tsx                 — Maria video call controls
      LiveAvatar.tsx                   — HeyGen LiveAvatar video component
      ApplicationModal.tsx             — User application/lead submission modal
      ObjectUploader.tsx               — File upload component using Object Storage
      video/turkey-promo/              — Turkey promo video scenes (animated components)
      ui/                              — shadcn/ui components (accordion, button, card, dialog, drawer, tabs, etc.)
    hooks/
      use-mobile.tsx                   — Mobile detection hook
      use-toast.ts                     — Toast notification hook
      use-upload.ts                    — File upload hook
    lib/
      queryClient.ts                   — TanStack Query client configuration
      telegram.ts                      — Telegram WebApp SDK integration (ready, expand, theme)
      utils.ts                         — Utility functions (cn for class merging)
      video/                           — Video animation utilities
  replit_integrations/
    audio/                             — Audio playback & voice recording utilities for LiveAvatar

server/
  index.ts                             — Express app setup, session, static serving, server start
  routes.ts                            — All API routes (applications, admin CRUD, uploads, chat sessions)
  storage.ts                           — IStorage interface + DatabaseStorage implementation (Drizzle queries)
  db.ts                                — Drizzle ORM database connection
  seed.ts                              — Initial seed data (speakers, promotions, schedule events)
  static.ts                            — Static file serving configuration
  vite.ts                              — Vite dev server middleware
  integrations/
    maria-chat.ts                      — Maria AI chat: system prompts (RU/EN/DE), OpenAI streaming, suggestions
    liveavatar.ts                      — HeyGen LiveAvatar: session token, start/stop, events, transcript
  replit_integrations/
    object_storage/                    — Replit Object Storage client, ACL, routes
    chat/                              — Chat integration utilities
    audio/                             — Server-side audio processing
    image/                             — Image generation utilities
    batch/                             — Batch processing utilities

shared/
  schema.ts                            — Drizzle ORM table definitions + Zod insert schemas + TypeScript types
  models/
    chat.ts                            — Chat-related type definitions
```

## Pages & Navigation

| Route | Page | Description | TabBar |
|-------|------|-------------|--------|
| `/` | HomePage (Hub) | Logo, tagline, language switcher, Maria card, Trading Hub button, Partner Hub button, Promo/Schedule/Tutorials buttons, direct links (Google Drive, Telegram, Instagram) | Yes |
| `/trading` | TradingHubPage | TAG Markets broker info, Copy-X strategies, Amplify 12x, Schnellstart 5 steps, FAQ. Has back button + "Frag Maria" footer | No |
| `/partner` | PartnerHubPage | Commissions, Profit-Share, Infinity Bonus, Global Pools & Lifestyle Rewards. Has back button + "Frag Maria" footer | No |
| `/promo` | PromoDetailPage | Promotions listing from database, language badges | No |
| `/schedule` | SchedulePage | Event calendar with Alle/Trading/Partner filter tabs, Zoom links, dual timezone (CET + MSK), filter via `?filter=` query param | No |
| `/tutorials` | TutorialsPage | Video/guide cards for Trader and Partner, tabs with `?filter=` query param | No |
| `/maria` | MariaPage | TextChat with VideoCallBar — text chat + video avatar AI assistant Maria | Yes |
| `/admin` | AdminPage | Password-protected admin panel (outside main app layout) | No |
| `/promo-preview` | TurkeyPromoPreview | Turkey promo video preview (outside main app layout) | No |

### Navigation Rules

- **TabBar** (bottom nav with Hub + Maria) shown only on `/` and `/maria`
- Sub-pages (`/trading`, `/partner`, `/schedule`, `/tutorials`, `/promo`) have their own back button and "Frag Maria" footer
- `/admin` and `/promo-preview` render outside the main app layout (no TabBar, no max-width container)

## Multilingual Support

- **Languages**: German (de) — primary, Russian (ru)
- **Language Context**: `client/src/contexts/LanguageContext.tsx` manages language state and all translations
- **Storage**: Language preference stored in localStorage as `app-language`
- **UI Selector**: DE/RU toggle on HomePage
- **Backend**: Chat API accepts `language` parameter; Maria has separate system prompts per language
- **Content**: All UI text, Maria greetings, quick replies, and suggestions are translated
- **Schedule/Promotions**: All events visible regardless of language, with language badges (DE/RU) on cards

## Admin Panel

- **Route**: `/admin`
- **Auth**: Password-protected via `ADMIN_PASSWORD` env secret, rate-limited login (5 attempts per 15 min)
- **Tabs**:
  - **Chat Logs**: View all Maria conversations, filter by type/date, expand for full transcript, CSV export
  - **Aktionen (Promotions)**: CRUD for promotions (create, edit, toggle active/inactive, delete)
  - **Webinare (Schedule)**: CRUD for schedule events with time picker, timezone dropdown (CET/CEST/MSK/EST/GST/UTC)
  - **Speakers**: CRUD for speaker profiles with photo upload
- **Security**: All admin API routes protected via `x-admin-password` header; auth error auto-logout

## Brand Identity

- **Primary Color**: Purple `#7C3AED`
- **Accent Color**: Light purple `#A855F7`
- **Light Purple**: `#C084FC`
- **Gradient**: `linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)` — via `.jetup-gradient` CSS class
- **Gradient Glow**: `.jetup-gradient-glow` adds purple box-shadow
- **Gradient Soft**: `.jetup-gradient-soft` uses `#A855F7` → `#C084FC`
- **Text Gradient**: `.text-gradient-purple` uses `#7C3AED` → `#C084FC`
- **Top Bar**: `.purple-top-bar` — 4px gradient bar on every page
- **Font**: Montserrat (400, 500, 600, 700, 800)
- **Text Colors**: Primary `#1F2937`, Secondary `#4B5563`, Light `#FFFFFF`

## External Services & Environment Variables

### Required

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | PostgreSQL | Database connection string (auto-provided by Replit) |
| `ADMIN_PASSWORD` | Admin Panel | Password for admin dashboard access |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI | API key for Maria text chat (auto-provided by Replit AI Integrations) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI | Base URL for OpenAI API (auto-provided by Replit AI Integrations) |

### Optional (for Video Avatar)

| Variable | Service | Description |
|----------|---------|-------------|
| `LIVEAVATAR_API_KEY` | HeyGen | API key for LiveAvatar video sessions |
| `LIVEAVATAR_AVATAR_ID` | HeyGen | Avatar ID from HeyGen dashboard |
| `LIVEAVATAR_VOICE_ID` | HeyGen | Default voice ID (Russian) |
| `LIVEAVATAR_CONTEXT_ID` | HeyGen | Default knowledge base context ID |
| `LIVEAVATAR_VOICE_ID_EN` | HeyGen | English voice ID (optional, falls back to default) |
| `LIVEAVATAR_CONTEXT_ID_EN` | HeyGen | English context ID (optional, falls back to default) |
| `LIVEAVATAR_VOICE_ID_DE` | HeyGen | German voice ID (optional, falls back to default) |
| `LIVEAVATAR_CONTEXT_ID_DE` | HeyGen | German context ID (optional, falls back to default) |

### Auto-provided

| Variable | Source |
|----------|--------|
| `PUBLIC_OBJECT_SEARCH_PATHS` | Replit Object Storage |
| `PRIVATE_OBJECT_DIR` | Replit Object Storage |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Replit PostgreSQL |

## Direct Links

- Google Drive (Presentations): https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R
- Telegram: https://t.me/JetUpDach
- Instagram: https://www.instagram.com/jetup.official
- Registration: https://jetup.ibportal.io

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/uploads/:filename` | Serve uploaded files from Object Storage |
| `POST` | `/api/applications` | Submit user application/lead |
| `GET` | `/api/applications` | List all applications |
| `GET` | `/api/promotions` | Get active promotions |
| `GET` | `/api/schedule-events` | Get active schedule events |
| `GET` | `/api/speakers` | Get active speakers |
| `POST` | `/api/maria/chat` | Maria text chat (streaming SSE) |
| `POST` | `/api/liveavatar/token` | Get LiveAvatar session token |
| `POST` | `/api/liveavatar/start` | Start LiveAvatar session |
| `POST` | `/api/liveavatar/stop` | Stop LiveAvatar session |
| `POST` | `/api/liveavatar/event` | Send LiveAvatar event |
| `GET` | `/api/liveavatar/transcript/:sessionId` | Get session transcript |

### Admin (requires `x-admin-password` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin login (rate-limited) |
| `POST` | `/api/admin/upload` | Upload file to Object Storage |
| `GET/POST/PUT/DELETE` | `/api/admin/promotions(/:id)` | CRUD promotions |
| `GET/POST/PUT/DELETE` | `/api/admin/schedule-events(/:id)` | CRUD schedule events |
| `GET/POST/PUT/DELETE` | `/api/admin/speakers(/:id)` | CRUD speakers |
| `GET` | `/api/admin/chat-sessions` | List chat sessions (filterable) |
| `GET` | `/api/admin/chat-sessions/:sessionId/messages` | Get session messages |
| `GET` | `/api/admin/chat-sessions/export` | Export chat sessions as CSV |

## Key NPM Packages

- **Frontend**: react, wouter, framer-motion, @tanstack/react-query, livekit-client, vaul (drawer), lucide-react, recharts, date-fns
- **Backend**: express, drizzle-orm, openai, connect-pg-simple, multer, @google-cloud/storage
- **Build**: vite, esbuild, tsx, drizzle-kit, tailwindcss, @vitejs/plugin-react

## Recent Changes

- Removed English (en) from language selector, keeping DE and RU as supported languages (Feb 2026)
- Removed language filtering: all webinars/promotions visible to all users regardless of language, with language badges on cards (Feb 2026)
- Added timezone field to schedule_events with CET default, dual timezone display (CET + MSK) on schedule page
- Redesigned EventBanner: purple-lavender gradient, JetUP logo, circular speaker photo with purple ring
- Added Admin Panel with password protection, chat logging, promotions/schedule/speakers CRUD (Feb 2026)
- PostgreSQL database with Drizzle ORM replaces in-memory storage
- Chat sessions tracked with sessionId for full conversation history
- Restructured app as Smart Linktree with multi-level navigation: Hub → Trading Hub / Partner Hub → details (Feb 2026)
- Migrated file uploads to Replit Object Storage for persistent storage across deployments (Feb 2026)
