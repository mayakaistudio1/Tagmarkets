# JetUP — Digital Hub & Partner Platform

## Overview

JetUP is a digital information hub and smart linktree for the JetUP financial ecosystem, available as a standalone website and a Telegram Mini App. It serves as a central onboarding and navigation tool, consolidating all ecosystem resources, services, and tools for users to explore products, attend webinars, watch tutorials, and interact with an integrated AI assistant. The platform targets German and Russian-speaking users interested in trading, copy-trading, and partnership income, aiming to provide "Struktur. Transparenz. Kontrolle." within the JetUP financial ecosystem.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 19 with TypeScript and Vite 7.
- **Routing**: Wouter.
- **Styling**: Tailwind CSS v4 with CSS variables, integrating Telegram theme.
- **UI Components**: shadcn/ui (new-york style) built on Radix UI.
- **Animations**: Framer Motion.
- **State Management**: TanStack React Query for server state, React useState for local state.
- **Multilingual**: Supports German (de), Russian (ru), English (en).

### Backend
- **Runtime**: Node.js 20 with Express 5.
- **Language**: TypeScript.
- **API Pattern**: RESTful endpoints.
- **Session Management**: Express sessions with PostgreSQL store.

### Database
- **Type**: PostgreSQL with Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts` including `partners`, `personal_invites`, `invite_events`, `invite_guests`, `zoom_attendance` tables.
- **Migrations**: Applied on server startup using raw SQL.

### Build System
- **Development**: `tsx` for Express and Vite dev server.
- **Production**: Vite and esbuild for client, Node.js for server.

### Core Features
- **Partner Telegram Bot**: Manages user interactions, Mini App access, and notifications. Supports dev and production environments with separate tokens.
- **Partner Mini App Auth**: Utilizes Telegram WebApp `initData` for primary authentication; fallback for dev/browser testing. New partners register via the Mini App.
- **Partner Mini App Tabs**:
    - **Upcoming Events**: Lists events with partner-specific stats and personal invitations. Supports AI-driven personal invite creation.
    - **Contacts**: Aggregates registered guests with contact details, reminder channel status, and AI follow-up generation.
    - **Statistics**: Displays lifetime totals for invites, registrations, and attendance.
    - **Profile**: Allows viewing and updating partner information.
- **Personal Invite Pipeline**: Facilitates partner-created invites, guest interaction with an AI chat (GPT-4o-mini), registration, and automated multi-channel reminders (email, Telegram, WhatsApp). Tracks guest engagement and attendance.
- **Social Invite System**: Allows partners to share a single invite link for an event to multiple guests.
- **Guest Attendance Attribution**: Integrates with Zoom API (Server-to-Server OAuth) to fetch and match participant data to guests, ensuring accurate attendance tracking for partner statistics.
- **Partner Digital Hub**: Personalized partner pages with state-machine driven UI, multilingual support, and AI chat.
- **Dennis Fast Start Promo**: Manages promotional campaigns, applications, and admin notifications.
- **Maria AI**: Provides real-time support via text chat (GPT-4o-mini) and a video avatar (HeyGen LiveAvatar via LiveKit WebRTC).
- **Admin Panel**: Password-protected interface for managing various platform aspects, including chat logs, promotions, events, and partners.

## External Dependencies

- **PostgreSQL**: Main database.
- **OpenAI API**: Powers Maria AI, AI follow-ups, invite AI, and partner chat.
- **HeyGen / LiveKit**: Provides Maria's video avatar.
- **Replit Object Storage**: Stores media like speaker photos and banners.
- **Telegram Bot API**: Used for the Partner bot and guest notifications.
- **Resend**: Handles transactional email sending.
- **Zoom API**: For webinar attendance tracking.
- **Google Sheets**: Auto-syncs chat logs and promo applications.
- **Google Drive**: Stores presentations.