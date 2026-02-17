import {
  type User, type InsertUser,
  type Application, type InsertApplication,
  users, applications, chatSessions, chatMessages, promotions, scheduleEvents, speakers,
} from "@shared/schema";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createApplication(application: InsertApplication): Promise<Application>;
  getApplications(): Promise<Application[]>;

  createChatSession(session: { sessionId: string; language: string; type: string }): Promise<any>;
  saveChatMessage(msg: { sessionId: string; role: string; content: string }): Promise<any>;
  getChatSessions(filters?: { type?: string; dateFrom?: string; dateTo?: string }): Promise<any[]>;
  getChatSessionMessages(sessionId: string): Promise<any[]>;

  getPromotions(activeOnly?: boolean): Promise<any[]>;
  getPromotion(id: number): Promise<any | undefined>;
  createPromotion(promo: any): Promise<any>;
  updatePromotion(id: number, promo: any): Promise<any>;
  deletePromotion(id: number): Promise<void>;

  getScheduleEvents(activeOnly?: boolean): Promise<any[]>;
  getScheduleEvent(id: number): Promise<any | undefined>;
  createScheduleEvent(event: any): Promise<any>;
  updateScheduleEvent(id: number, event: any): Promise<any>;
  deleteScheduleEvent(id: number): Promise<void>;

  getSpeakers(activeOnly?: boolean): Promise<any[]>;
  getSpeaker(id: number): Promise<any | undefined>;
  createSpeaker(speaker: any): Promise<any>;
  updateSpeaker(id: number, speaker: any): Promise<any>;
  deleteSpeaker(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db.insert(applications).values(insertApplication).returning();
    return application;
  }

  async getApplications(): Promise<Application[]> {
    return db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async createChatSession(session: { sessionId: string; language: string; type: string }): Promise<any> {
    const existing = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, session.sessionId));
    if (existing.length > 0) {
      await db.update(chatSessions).set({ updatedAt: new Date() }).where(eq(chatSessions.sessionId, session.sessionId));
      return existing[0];
    }
    const [created] = await db.insert(chatSessions).values(session).returning();
    return created;
  }

  async saveChatMessage(msg: { sessionId: string; role: string; content: string }): Promise<any> {
    const [message] = await db.insert(chatMessages).values(msg).returning();
    return message;
  }

  async getChatSessions(filters?: { type?: string; dateFrom?: string; dateTo?: string }): Promise<any[]> {
    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(chatSessions.type, filters.type));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(chatSessions.createdAt, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      conditions.push(lte(chatSessions.createdAt, new Date(filters.dateTo)));
    }
    const query = db
      .select({
        id: chatSessions.id,
        sessionId: chatSessions.sessionId,
        language: chatSessions.language,
        type: chatSessions.type,
        createdAt: chatSessions.createdAt,
        updatedAt: chatSessions.updatedAt,
        messageCount: sql<number>`(SELECT COUNT(*) FROM chat_messages WHERE chat_messages.session_id = ${chatSessions.sessionId})`.as('messageCount'),
      })
      .from(chatSessions)
      .orderBy(desc(chatSessions.createdAt));
    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }
    return query;
  }

  async getChatSessionMessages(sessionId: string): Promise<any[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.timestamp);
  }

  async getPromotions(activeOnly?: boolean): Promise<any[]> {
    if (activeOnly) {
      return db.select().from(promotions).where(eq(promotions.isActive, true)).orderBy(promotions.sortOrder);
    }
    return db.select().from(promotions).orderBy(promotions.sortOrder);
  }

  async getPromotion(id: number): Promise<any | undefined> {
    const [promo] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promo;
  }

  async createPromotion(promo: any): Promise<any> {
    const [created] = await db.insert(promotions).values(promo).returning();
    return created;
  }

  async updatePromotion(id: number, promo: any): Promise<any> {
    const [updated] = await db.update(promotions).set(promo).where(eq(promotions.id, id)).returning();
    return updated;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  async getScheduleEvents(activeOnly?: boolean): Promise<any[]> {
    if (activeOnly) {
      return db.select().from(scheduleEvents).where(eq(scheduleEvents.isActive, true)).orderBy(scheduleEvents.sortOrder);
    }
    return db.select().from(scheduleEvents).orderBy(scheduleEvents.sortOrder);
  }

  async getScheduleEvent(id: number): Promise<any | undefined> {
    const [event] = await db.select().from(scheduleEvents).where(eq(scheduleEvents.id, id));
    return event;
  }

  async createScheduleEvent(event: any): Promise<any> {
    const [created] = await db.insert(scheduleEvents).values(event).returning();
    return created;
  }

  async updateScheduleEvent(id: number, event: any): Promise<any> {
    const [updated] = await db.update(scheduleEvents).set(event).where(eq(scheduleEvents.id, id)).returning();
    return updated;
  }

  async deleteScheduleEvent(id: number): Promise<void> {
    await db.delete(scheduleEvents).where(eq(scheduleEvents.id, id));
  }

  async getSpeakers(activeOnly?: boolean): Promise<any[]> {
    if (activeOnly) {
      return db.select().from(speakers).where(eq(speakers.isActive, true)).orderBy(speakers.name);
    }
    return db.select().from(speakers).orderBy(speakers.name);
  }

  async getSpeaker(id: number): Promise<any | undefined> {
    const [speaker] = await db.select().from(speakers).where(eq(speakers.id, id));
    return speaker;
  }

  async createSpeaker(speaker: any): Promise<any> {
    const [created] = await db.insert(speakers).values(speaker).returning();
    return created;
  }

  async updateSpeaker(id: number, speaker: any): Promise<any> {
    const [updated] = await db.update(speakers).set(speaker).where(eq(speakers.id, id)).returning();
    return updated;
  }

  async deleteSpeaker(id: number): Promise<void> {
    await db.delete(speakers).where(eq(speakers.id, id));
  }
}

export const storage = new DatabaseStorage();
