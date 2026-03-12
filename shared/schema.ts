import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  interest: text("interest").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  language: text("language").notNull().default("de"),
  type: text("type").notNull().default("text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const speakers = pgTable("speakers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photo: text("photo").notNull().default(""),
  role: text("role").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSpeakerSchema = createInsertSchema(speakers).omit({
  id: true,
  createdAt: true,
});

export type InsertSpeaker = z.infer<typeof insertSpeakerSchema>;
export type Speaker = typeof speakers.$inferSelect;

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  badge: text("badge").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  banner: text("banner").notNull().default(""),
  highlights: text("highlights").array().notNull(),
  ctaText: text("cta_text").notNull(),
  ctaLink: text("cta_link").notNull(),
  deadline: text("deadline"),
  gradient: text("gradient").notNull().default("from-[#7C3AED] to-[#A855F7]"),
  badgeColor: text("badge_color").notNull().default("bg-orange-500"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  language: text("language").notNull().default("de"),
  translationGroup: text("translation_group"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
});

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

export const dennisPromos = pgTable("dennis_promos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  shortDesc: text("short_desc").notNull(),
  description: text("description").notNull(),
  rules: text("rules").array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  language: text("language").notNull().default("ru"),
  translationGroup: text("translation_group"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDennisPromoSchema = createInsertSchema(dennisPromos).omit({
  id: true,
  createdAt: true,
});

export type InsertDennisPromo = z.infer<typeof insertDennisPromoSchema>;
export type DennisPromo = typeof dennisPromos.$inferSelect;

export const promoApplications = pgTable("promo_applications", {
  id: serial("id").primaryKey(),
  promoId: integer("promo_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  cuNumber: text("cu_number").notNull(),
  status: text("status").notNull().default("pending"),
  verifiedAt: timestamp("verified_at"),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromoApplicationSchema = createInsertSchema(promoApplications).omit({
  id: true,
  createdAt: true,
  status: true,
  verifiedAt: true,
  emailSentAt: true,
});

export type InsertPromoApplication = z.infer<typeof insertPromoApplicationSchema>;
export type PromoApplication = typeof promoApplications.$inferSelect;

export const scheduleEvents = pgTable("schedule_events", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  timezone: text("timezone").notNull().default("CET"),
  title: text("title").notNull(),
  speaker: text("speaker").notNull(),
  speakerId: integer("speaker_id"),
  type: text("type").notNull(),
  typeBadge: text("type_badge").notNull(),
  banner: text("banner").notNull().default(""),
  highlights: text("highlights").array().notNull(),
  link: text("link").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  language: text("language").notNull().default("de"),
  translationGroup: text("translation_group"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertScheduleEvent = z.infer<typeof insertScheduleEventSchema>;
export type ScheduleEvent = typeof scheduleEvents.$inferSelect;

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  telegramChatId: text("telegram_chat_id").notNull().unique(),
  telegramUsername: text("telegram_username"),
  name: text("name").notNull(),
  cuNumber: text("cu_number").notNull(),
  phone: text("phone"),
  email: text("email"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export const inviteEvents = pgTable("invite_events", {
  id: serial("id").primaryKey(),
  partnerName: text("partner_name").notNull(),
  partnerCu: text("partner_cu").notNull(),
  partnerId: integer("partner_id"),
  scheduleEventId: integer("schedule_event_id"),
  zoomLink: text("zoom_link").notNull(),
  title: text("title").notNull(),
  eventDate: text("event_date").notNull(),
  eventTime: text("event_time").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInviteEventSchema = createInsertSchema(inviteEvents).omit({
  id: true,
  createdAt: true,
  inviteCode: true,
});

export type InsertInviteEvent = z.infer<typeof insertInviteEventSchema>;
export type InviteEvent = typeof inviteEvents.$inferSelect;

export const inviteGuests = pgTable("invite_guests", {
  id: serial("id").primaryKey(),
  inviteEventId: integer("invite_event_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  clickedZoom: boolean("clicked_zoom").notNull().default(false),
  clickedAt: timestamp("clicked_at"),
});

export const insertInviteGuestSchema = createInsertSchema(inviteGuests).omit({
  id: true,
  registeredAt: true,
  clickedZoom: true,
  clickedAt: true,
});

export type InsertInviteGuest = z.infer<typeof insertInviteGuestSchema>;
export type InviteGuest = typeof inviteGuests.$inferSelect;

export const zoomAttendance = pgTable("zoom_attendance", {
  id: serial("id").primaryKey(),
  inviteGuestId: integer("invite_guest_id"),
  inviteEventId: integer("invite_event_id").notNull(),
  participantEmail: text("participant_email").notNull(),
  participantName: text("participant_name"),
  joinTime: timestamp("join_time"),
  leaveTime: timestamp("leave_time"),
  durationMinutes: integer("duration_minutes").notNull().default(0),
  questionsAsked: integer("questions_asked").notNull().default(0),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

export const insertZoomAttendanceSchema = createInsertSchema(zoomAttendance).omit({
  id: true,
  fetchedAt: true,
});

export type InsertZoomAttendance = z.infer<typeof insertZoomAttendanceSchema>;
export type ZoomAttendance = typeof zoomAttendance.$inferSelect;

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
