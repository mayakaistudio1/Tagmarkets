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
    - **Multilingual Support**: German (de) and Russian (ru) languages managed via `LanguageContext.tsx`.

### Backend
- **Runtime**: Node.js 20 with Express 5.
- **Language**: TypeScript.
- **API Pattern**: RESTful endpoints under `/api/*`.
- **Session Management**: Express sessions with PostgreSQL store.

### Database
- **Type**: PostgreSQL with Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts`. Key tables include `users`, `applications`, `chat_sessions`, `chat_messages`, `promotions`, `schedule_events`, and `speakers`.
- **Data Management**: Drizzle-kit for migrations; seed data loaded on first startup.

### AI Integrations
- **Maria Text Chat**: Utilizes OpenAI API via Replit AI Integrations for streaming SSE responses. Includes system prompts tailored per language (RU/DE) with integrated JetUP knowledge base.
- **Maria Video Avatar**: HeyGen LiveAvatar integration via LiveKit WebRTC for real-time video streaming with voice.

### File Storage
- **Platform**: Replit Object Storage for persistent file uploads (e.g., speaker photos, banners).

### Build System
- **Development**: `npm run dev` for tsx (Express) + Vite dev server.
- **Production**: `npm run build` for client (Vite) and server (esbuild) bundling, followed by `npm start`.

### Core Features
- **Smart Linktree Navigation**: Multi-level navigation including Hub, Trading Hub, Partner Hub, Schedule, Tutorials, and Promotions.
- **Admin Panel**: Password-protected (`/admin`) for managing chat logs, promotions, schedule events, and speakers with CRUD operations. Includes rate-limited login.

## External Dependencies

- **PostgreSQL**: For database persistence, managed by Drizzle ORM.
- **OpenAI API**: Used for Maria's text chat capabilities (via Replit AI Integrations).
- **HeyGen**: Provides the LiveAvatar service for Maria's video avatar functionality, integrating with LiveKit WebRTC.
- **Replit Object Storage**: For persistent file storage of uploaded assets.
- **Telegram WebApp SDK**: For integration as a Telegram Mini App.
- **Google Drive**: Linked for presentations.
- **Telegram (External)**: Linked for the JetUPDach channel.
- **Instagram**: Linked for jetup.official.
- **TAG Markets**: Licensed broker integrated into the ecosystem.
- **BIX.FI / BIT1**: Crypto debit card and exchange services.