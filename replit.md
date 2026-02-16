# JetUP - Telegram Mini App

## Overview

JetUP is a Telegram Mini App that serves as an online hub and onboarding tool for the JetUP financial ecosystem. The application provides users with information about the JetUP ecosystem (Copy-X Strategies, Trading Signals, Academy, Partner Program, TAG Markets broker), featuring an AI assistant named Maria (available via video chat using HeyGen LiveAvatar and text chat powered by OpenAI), FAQ sections, and application submission functionality. The app is designed with a mobile-first approach optimized for Telegram WebApp integration.

## Brand Identity

- **Primary Color**: Purple #7C3AED
- **Accent Color**: Light purple #A855F7
- **Light Purple**: #C084FC
- **Gradient**: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%) — used via `.jetup-gradient` CSS class
- **Gradient Glow**: `.jetup-gradient-glow` adds purple box-shadow
- **Gradient Soft**: `.jetup-gradient-soft` uses #A855F7 → #C084FC
- **Text Gradient**: `.text-gradient-purple` uses #7C3AED → #C084FC
- **Top Bar**: `.purple-top-bar` 4px gradient bar on every page
- **Font**: Montserrat (400, 500, 600, 700, 800)
- **Text Colors**: Primary #1F2937, Secondary #4B5563, Light #FFFFFF
- **Tagline**: "Structure. Transparency. Control." / "Структура. Прозрачность. Контроль."
- **Registration URL**: https://jetup.ibportal.io

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight React router) with 4 main pages: Home, JetUP Ecosystem, Maria, and Links
- **Styling**: Tailwind CSS v4 with CSS variables for Telegram theme integration
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **State Management**: TanStack React Query for server state, React useState for local state

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: users, applications, conversations, messages
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### AI Integrations
- **Text Chat**: OpenAI API via Replit AI Integrations for Maria text conversations
- **Video Avatar**: HeyGen LiveAvatar integration using LiveKit for real-time video streaming
- **Voice Processing**: Custom audio worklet implementation for PCM16 streaming playback
- **System Prompt**: Maria persona with tri-language support (RU/EN/DE) updated to JetUP content

### Multilingual Support
- **Languages**: Russian (ru), English (en), and German (de)
- **Language Context**: `client/src/contexts/LanguageContext.tsx` manages language state and all translations
- **Storage**: Language preference stored in localStorage as 'app-language'
- **UI Selector**: RU/EN/DE toggle on main screen (HomePage)
- **Backend Support**: Chat API accepts `language` parameter to use appropriate system prompt
- **Translations**: All UI text, Maria greetings, quick replies, and suggestions are translated

### Build System
- **Development**: Vite dev server with HMR on port 5000, proxied through Express
- **Production**: Vite builds to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Build Script**: Custom `script/build.ts` handles both client and server builds

### Project Structure
```
client/src/         - React frontend application
server/             - Express backend and API routes
shared/             - Shared TypeScript types and Drizzle schema
server/integrations/- HeyGen LiveAvatar and Maria chat implementations
server/replit_integrations/ - Replit-provided audio, chat, image, and batch utilities
```

## External Dependencies

### Third-Party Services
- **Telegram WebApp SDK**: Client-side integration for theme, buttons, and native features
- **HeyGen/LiveAvatar**: Video avatar streaming (requires LIVEAVATAR_API_KEY, LIVEAVATAR_AVATAR_ID, LIVEAVATAR_VOICE_ID, LIVEAVATAR_CONTEXT_ID; optional per-language: LIVEAVATAR_VOICE_ID_EN, LIVEAVATAR_CONTEXT_ID_EN, LIVEAVATAR_VOICE_ID_DE, LIVEAVATAR_CONTEXT_ID_DE)
- **LiveKit**: WebRTC infrastructure for real-time video/audio
- **OpenAI**: Text generation via Replit AI Integrations (AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL)

### Database
- **PostgreSQL**: Primary database accessed via DATABASE_URL environment variable
- **connect-pg-simple**: Session storage in PostgreSQL

### Key NPM Packages
- **Frontend**: react, wouter, framer-motion, @tanstack/react-query, livekit-client, vaul (drawer)
- **Backend**: express, drizzle-orm, openai, connect-pg-simple
- **Build**: vite, esbuild, tsx, drizzle-kit

## App Structure (Smart Linktree)

### Pages & Routing
- `/` — **HomePage (Hub)**: Header "JetApp – JetUP Ökosystem", welcome text, Maria live card, 2 big pathway cards (Trading Hub, Partner Hub), Webinare & Tutorials buttons, direct links block (Google Drive, Telegram, Instagram, Registration)
- `/trading` — **TradingHubPage**: TAG Markets Broker, Copy-X Strategien, Amplify 12x (accordion cards), Schnellstart 5 Schritte, FAQ, links to Trading-Calls & Tutorials
- `/partner` — **PartnerHubPage**: Provisionen, Profit-Share, Infinity Bonus, Global Pools & Rewards (accordion cards), Partner PDF link, links to Partner-Calls & Tutorials
- `/schedule` — **SchedulePage**: Event calendar with Alle/Trading/Partner tabs, Zoom links, filter via ?filter= query param
- `/tutorials` — **TutorialsPage**: Video/guide cards for Trader and Partner, tabs with ?filter= query param
- `/maria` — **MariaPage**: TextChat with VideoCallBar (video + text chat with AI assistant Maria)

### TabBar
- Shown only on `/` (Hub) and `/maria` (Maria)
- Hidden on `/trading` and `/partner` — these pages have their own back + "Frag Maria" footer buttons

### Direct Links
- Google Drive (Presentations): https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R
- Telegram: https://t.me/JetUpDach
- Instagram: https://www.instagram.com/jetup.official
- Registration: https://jetup.ibportal.io

## Recent Changes
- Restructured app as Smart Linktree with 3-level navigation: Hub → Trading Hub / Partner Hub → details (Feb 2026)
- HomePage: Maria card + 2 big pathway cards + Webinare/Tutorials buttons + direct links block + welcome text
- TradingHubPage: TAG Markets, Copy-X, Amplify 12x, Schnellstart, FAQ + contextual links to Trading-Calls and Tutorials
- PartnerHubPage: Provisionen, Profit-Share, Infinity Bonus, Global Pools & Lifestyle Rewards + contextual links to Partner-Calls and Tutorials
- SchedulePage: event calendar with tabs (Alle/Trading/Partner), Zoom links, filter via URL query params
- TutorialsPage: video/guide cards for Trader and Partner, tabs with URL query params
- TabBar shown only on Hub and Maria pages; sub-pages have back + "Frag Maria" footer buttons
- Updated Maria DE system prompt with Amplify, TAG Markets, BIX.FI/BIT1, Lifestyle rewards
- Added German (de) translations for all components
