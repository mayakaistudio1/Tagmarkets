# JetUP — Digital Hub & Partner Platform

## Overview

JetUP is a digital information hub and smart linktree for the JetUP financial ecosystem, serving as a central onboarding and navigation tool. It consolidates all ecosystem resources, services, and tools, allowing users to explore products, attend webinars, watch tutorials, and interact with an integrated AI assistant named Maria. The platform targets German-speaking and Russian-speaking users interested in trading, copy-trading, and partnership income.

**Key capabilities:**
- Centralized access to JetUP financial products (Copy-X Strategies, Trading Signals, JetUP Academy, Partner Program, etc.).
- Mobile-first, multilingual experience (DE/RU/EN).
- AI consultant (Maria) for real-time support.
- Full Partner CRM: invite tracking, guest notifications, Zoom attendance attribution.

**Business Vision:** "Struktur. Transparenz. Kontrolle." within the JetUP financial ecosystem.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 19 with TypeScript, Vite 7.
- **Routing**: Wouter.
- **Styling**: Tailwind CSS v4 with CSS variables, integrates Telegram theme.
- **UI Components**: shadcn/ui (new-york style) built on Radix UI.
- **Animations**: Framer Motion.
- **State Management**: TanStack React Query for server state, React useState for local state.
- **Icons**: Lucide React.
- **Multilingual**: German (de), Russian (ru), English (en).

### Backend
- **Runtime**: Node.js 20 with Express 5.
- **Language**: TypeScript.
- **API Pattern**: RESTful endpoints under `/api/*`.
- **Session Management**: Express sessions with PostgreSQL store.

### Database
- **Type**: PostgreSQL with Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts` for entities like `partners`, `personal_invites`, `invite_events`, `invite_guests`, `zoom_attendance`.
- **Migrations**: Applied on server startup using raw SQL `ALTER TABLE IF NOT EXISTS` statements.

### Build System
- **Development**: `npm run dev` (tsx + Vite).
- **Production**: `npm run build` (Vite + esbuild), then `npm start`.

### Partner Infrastructure
- **Partner Telegram Bot**: Manages `/start` commands (opens Mini App or handles `remind_CODE` deep links), `/invite`, `/events`, `/report` commands. Notifies partners of guest registrations and reminders.
- **Partner Mini App Auth**: Uses Telegram WebApp `initData` HMAC verification for primary authentication. Fallback to `x-partner-auth: id:<telegramChatId>` for development. Supports new partner registration.
- **Partner Mini App (4 Tabs)**:
    - **Upcoming Events**: Lists events with stats, personal invitations (with status), social share, and AI Personal Invite creation.
    - **Contacts**: Aggregates guest information, shows reminder channel status, `/go/` link click status, and attendance. Features AI follow-up generation.
    - **Statistics**: Displays lifetime totals for invites, registrations, and attendance.
    - **Profile**: Shows and allows editing of partner information.
- **Personal Invite Pipeline**:
    1. Partner creates invite (via Mini App prospect form, optional DISC qualification, AI message generation).
    2. Guest opens `personal-invite/:code` page, interacts with AI chat (GPT-4o-mini), and registers via inline form.
    3. Registration triggers confirmation email (via Resend) and partner Telegram DM.
    4. Success screen prompts Telegram subscription if `reminderChannel` is Telegram.
    5. Guest can subscribe on Telegram via deep link (`/start remind_CODE`).
    6. **Reminder Scheduler**: Polls for upcoming events, sends 24h and 1h reminders to partners and guests (email or Telegram).
    7. Guest joins via `/go/{guestToken}` link, which records click and redirects to Zoom.
- **Social Invite System**: Allows partners to share a single invite link for an event with multiple guests. Guests register via a public landing page.
- **Guest Attendance Attribution**: Integrates with Zoom API (Server-to-Server OAuth) to fetch participant data post-webinar, matching attendees by `inviteGuestId` or email to `zoom_attendance` records.

### Other Core Features
- **Partner Digital Hub**: Personalized partner pages (`/dennis`, `/p/dennis`) with a state machine UI (HERO, CHAT_OVERLAY, PRESENTATION_OVERLAY, ECOSYSTEM_OVERLAY). Features multilingual AI chat (GPT-4o-mini, SSE) and interactive presentation slides with video backgrounds and ecosystem map.
- **Dennis Fast Start Promo**: Manages promotional campaigns from `dennis_promos` table, with admin CRUD, application management, and Telegram notifications.
- **Smart Linktree Navigation**: Centralized navigation for various hubs, schedules, tutorials, and promotions.
- **Admin Panel**: Password-protected interface (`/admin`) for managing chat logs, promotions, events, speakers, promo applications, invite events, and partners.
- **Maria AI**: Provides text-based chat (GPT-4o-mini, SSE) and a video avatar (HeyGen LiveAvatar via LiveKit WebRTC). Chat logs are analyzed via the admin panel.

## External Dependencies

- **PostgreSQL**: Main relational database.
- **OpenAI API**: Powers Maria AI chat, AI follow-ups, invite AI, and partner chat.
- **HeyGen / LiveKit**: Provides Maria's video avatar via WebRTC.
- **Replit Object Storage**: Stores media assets like speaker photos and banners.
- **Telegram Bot API**: Used for the Partner Bot and guest notifications.
- **Resend**: Handles transactional email sending (confirmations, reminders).
- **Zoom API**: Integrates for webinar attendance tracking (Server-to-Server OAuth).
- **Google Sheets**: Auto-syncs chat logs and promo applications.
- **Google Drive**: Stores presentations.