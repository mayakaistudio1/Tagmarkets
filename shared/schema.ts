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

export const scheduleEvents = pgTable("schedule_events", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
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
