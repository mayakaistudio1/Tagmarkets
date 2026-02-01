# XFusion Partner - Telegram Mini App

## Overview

XFusion Partner is a Telegram Mini App that serves as an investment platform onboarding and engagement tool. The application provides users with information about the Exfusion ecosystem, featuring an AI assistant named Maria (available via video chat using HeyGen LiveAvatar and text chat powered by OpenAI), FAQ sections about XFusion services, and application submission functionality. The app is designed with a mobile-first approach optimized for Telegram WebApp integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight React router) with 4 main pages: Home, XFusion, Maria, and Links
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
- **System Prompt**: Maria persona with dual-language support (RU/EN) with strict response length limits

### Multilingual Support
- **Languages**: Russian (ru) and English (en)
- **Language Context**: `client/src/contexts/LanguageContext.tsx` manages language state
- **Storage**: Language preference stored in localStorage as 'app-language'
- **UI Selector**: RU/EN toggle on main screen (HomePage)
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
- **HeyGen/LiveAvatar**: Video avatar streaming (requires LIVEAVATAR_API_KEY, LIVEAVATAR_AVATAR_ID, LIVEAVATAR_VOICE_ID, LIVEAVATAR_CONTEXT_ID)
- **LiveKit**: WebRTC infrastructure for real-time video/audio
- **OpenAI**: Text generation via Replit AI Integrations (AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL)

### Database
- **PostgreSQL**: Primary database accessed via DATABASE_URL environment variable
- **connect-pg-simple**: Session storage in PostgreSQL

### Key NPM Packages
- **Frontend**: react, wouter, framer-motion, @tanstack/react-query, livekit-client, vaul (drawer)
- **Backend**: express, drizzle-orm, openai, connect-pg-simple
- **Build**: vite, esbuild, tsx, drizzle-kit