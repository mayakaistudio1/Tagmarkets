import {
  type User, type InsertUser,
  type Application, type InsertApplication,
  type PromoApplication, type InsertPromoApplication,
  type DennisPromo, type InsertDennisPromo,
  type InviteEvent, type InsertInviteEvent,
  type InviteGuest, type InsertInviteGuest,
  users, applications, chatSessions, chatMessages, promotions, scheduleEvents, speakers, promoApplications, dennisPromos,
  inviteEvents, inviteGuests,
} from "@shared/schema";
import { eq, desc, and, gte, lte, sql, count, or } from "drizzle-orm";
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

  getPromotions(activeOnly?: boolean, language?: string): Promise<any[]>;
  getPromotion(id: number): Promise<any | undefined>;
  createPromotion(promo: any): Promise<any>;
  updatePromotion(id: number, promo: any): Promise<any>;
  deletePromotion(id: number): Promise<void>;

  getScheduleEvents(activeOnly?: boolean): Promise<any[]>;
  getScheduleEvent(id: number): Promise<any | undefined>;
  createScheduleEvent(event: any): Promise<any>;
  updateScheduleEvent(id: number, event: any): Promise<any>;
  deleteScheduleEvent(id: number): Promise<void>;

  createPromoApplication(application: InsertPromoApplication): Promise<PromoApplication>;
  getPromoApplications(): Promise<PromoApplication[]>;
  updatePromoApplicationStatus(id: number, status: string): Promise<PromoApplication>;
  findDuplicatePromoApplication(email: string, cuNumber: string): Promise<PromoApplication | undefined>;
  getUnverifiedPromoApplicationByEmail(email: string, cuNumber?: string): Promise<PromoApplication | undefined>;
  markPromoApplicationVerified(id: number): Promise<PromoApplication>;
  markPromoApplicationEmailSent(id: number): Promise<PromoApplication>;

  getDennisPromos(activeOnly?: boolean, language?: string): Promise<DennisPromo[]>;
  getDennisPromo(id: number): Promise<DennisPromo | undefined>;
  createDennisPromo(promo: InsertDennisPromo): Promise<DennisPromo>;
  updateDennisPromo(id: number, promo: Partial<InsertDennisPromo>): Promise<DennisPromo>;
  deleteDennisPromo(id: number): Promise<void>;

  getSpeakers(activeOnly?: boolean): Promise<any[]>;
  getSpeaker(id: number): Promise<any | undefined>;
  createSpeaker(speaker: any): Promise<any>;
  updateSpeaker(id: number, speaker: any): Promise<any>;
  deleteSpeaker(id: number): Promise<void>;

  createInviteEvent(data: InsertInviteEvent): Promise<InviteEvent>;
  getInviteEventByCode(code: string): Promise<InviteEvent | undefined>;
  getInviteEventById(id: number): Promise<InviteEvent | undefined>;
  getAllInviteEvents(): Promise<(InviteEvent & { guestCount: number; clickedCount: number })[]>;
  addInviteGuest(data: InsertInviteGuest): Promise<InviteGuest>;
  getGuestsByEventId(eventId: number): Promise<InviteGuest[]>;
  markGuestClickedZoom(guestId: number): Promise<InviteGuest>;
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
        messageCount: sql<number>`(SELECT COUNT(*) FROM chat_messages WHERE chat_messages.session_id = chat_sessions.session_id)`.as('messageCount'),
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

  async getPromotions(activeOnly?: boolean, language?: string): Promise<any[]> {
    const conditions = [];
    if (activeOnly) {
      conditions.push(eq(promotions.isActive, true));
    }
    if (language) {
      conditions.push(eq(promotions.language, language));
    }
    if (conditions.length > 0) {
      return db.select().from(promotions).where(and(...conditions)).orderBy(promotions.sortOrder);
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
    const { id: _, createdAt, updatedAt, ...data } = promo;
    const [updated] = await db.update(promotions).set(data).where(eq(promotions.id, id)).returning();
    return updated;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  async getScheduleEvents(activeOnly?: boolean): Promise<any[]> {
    const query = db
      .select({
        id: scheduleEvents.id,
        day: scheduleEvents.day,
        date: scheduleEvents.date,
        time: scheduleEvents.time,
        timezone: scheduleEvents.timezone,
        title: scheduleEvents.title,
        speaker: scheduleEvents.speaker,
        speakerId: scheduleEvents.speakerId,
        type: scheduleEvents.type,
        typeBadge: scheduleEvents.typeBadge,
        banner: scheduleEvents.banner,
        highlights: scheduleEvents.highlights,
        link: scheduleEvents.link,
        isActive: scheduleEvents.isActive,
        sortOrder: scheduleEvents.sortOrder,
        language: scheduleEvents.language,
        translationGroup: scheduleEvents.translationGroup,
        createdAt: scheduleEvents.createdAt,
        speakerPhoto: speakers.photo,
      })
      .from(scheduleEvents)
      .leftJoin(speakers, eq(scheduleEvents.speakerId, speakers.id))
      .orderBy(scheduleEvents.date, scheduleEvents.time);

    if (activeOnly) {
      return query.where(eq(scheduleEvents.isActive, true));
    }
    return query;
  }

  async getScheduleEvent(id: number): Promise<any | undefined> {
    const [event] = await db
      .select({
        id: scheduleEvents.id,
        day: scheduleEvents.day,
        date: scheduleEvents.date,
        time: scheduleEvents.time,
        timezone: scheduleEvents.timezone,
        title: scheduleEvents.title,
        speaker: scheduleEvents.speaker,
        speakerId: scheduleEvents.speakerId,
        type: scheduleEvents.type,
        typeBadge: scheduleEvents.typeBadge,
        banner: scheduleEvents.banner,
        highlights: scheduleEvents.highlights,
        link: scheduleEvents.link,
        isActive: scheduleEvents.isActive,
        sortOrder: scheduleEvents.sortOrder,
        language: scheduleEvents.language,
        translationGroup: scheduleEvents.translationGroup,
        createdAt: scheduleEvents.createdAt,
        speakerPhoto: speakers.photo,
      })
      .from(scheduleEvents)
      .leftJoin(speakers, eq(scheduleEvents.speakerId, speakers.id))
      .where(eq(scheduleEvents.id, id));
    return event;
  }

  async createScheduleEvent(event: any): Promise<any> {
    const [created] = await db.insert(scheduleEvents).values(event).returning();
    return created;
  }

  async updateScheduleEvent(id: number, event: any): Promise<any> {
    const { id: _, createdAt, updatedAt, ...data } = event;
    const [updated] = await db.update(scheduleEvents).set(data).where(eq(scheduleEvents.id, id)).returning();
    return updated;
  }

  async deleteScheduleEvent(id: number): Promise<void> {
    await db.delete(scheduleEvents).where(eq(scheduleEvents.id, id));
  }

  async createPromoApplication(application: InsertPromoApplication): Promise<PromoApplication> {
    const [created] = await db.insert(promoApplications).values(application).returning();
    return created;
  }

  async getPromoApplications(): Promise<PromoApplication[]> {
    return db.select().from(promoApplications).orderBy(desc(promoApplications.createdAt));
  }

  async updatePromoApplicationStatus(id: number, status: string): Promise<PromoApplication> {
    const [updated] = await db.update(promoApplications).set({ status }).where(eq(promoApplications.id, id)).returning();
    return updated;
  }

  async findDuplicatePromoApplication(email: string, cuNumber: string): Promise<PromoApplication | undefined> {
    const [found] = await db.select().from(promoApplications)
      .where(or(eq(promoApplications.email, email), eq(promoApplications.cuNumber, cuNumber)))
      .limit(1);
    return found;
  }

  async getUnverifiedPromoApplicationByEmail(email: string, cuNumber?: string): Promise<PromoApplication | undefined> {
    const conditions = cuNumber
      ? and(eq(promoApplications.email, email), eq(promoApplications.cuNumber, cuNumber))
      : eq(promoApplications.email, email);
    const results = await db.select().from(promoApplications)
      .where(conditions!)
      .orderBy(desc(promoApplications.createdAt));
    return results.find(app => !app.verifiedAt && app.status !== 'duplicate');
  }

  async markPromoApplicationVerified(id: number): Promise<PromoApplication> {
    const [updated] = await db.update(promoApplications)
      .set({ status: 'verified', verifiedAt: new Date() })
      .where(eq(promoApplications.id, id))
      .returning();
    return updated;
  }

  async markPromoApplicationEmailSent(id: number): Promise<PromoApplication> {
    const [updated] = await db.update(promoApplications)
      .set({ emailSentAt: new Date() })
      .where(eq(promoApplications.id, id))
      .returning();
    return updated;
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
    const { id: _, createdAt, updatedAt, ...data } = speaker;
    const [updated] = await db.update(speakers).set(data).where(eq(speakers.id, id)).returning();
    return updated;
  }

  async deleteSpeaker(id: number): Promise<void> {
    await db.delete(speakers).where(eq(speakers.id, id));
  }

  async getDennisPromos(activeOnly?: boolean, language?: string): Promise<DennisPromo[]> {
    const conditions = [];
    if (activeOnly) conditions.push(eq(dennisPromos.isActive, true));
    if (language) conditions.push(eq(dennisPromos.language, language));
    if (conditions.length > 0) {
      return db.select().from(dennisPromos).where(and(...conditions)).orderBy(dennisPromos.sortOrder);
    }
    return db.select().from(dennisPromos).orderBy(dennisPromos.sortOrder);
  }

  async getDennisPromo(id: number): Promise<DennisPromo | undefined> {
    const [promo] = await db.select().from(dennisPromos).where(eq(dennisPromos.id, id));
    return promo;
  }

  async createDennisPromo(promo: InsertDennisPromo): Promise<DennisPromo> {
    const [created] = await db.insert(dennisPromos).values(promo).returning();
    return created;
  }

  async updateDennisPromo(id: number, promo: Partial<InsertDennisPromo>): Promise<DennisPromo> {
    const [updated] = await db.update(dennisPromos).set(promo).where(eq(dennisPromos.id, id)).returning();
    return updated;
  }

  async deleteDennisPromo(id: number): Promise<void> {
    await db.delete(dennisPromos).where(eq(dennisPromos.id, id));
  }

  async createInviteEvent(data: InsertInviteEvent): Promise<InviteEvent> {
    const inviteCode = Math.random().toString(36).substring(2, 8);
    const [created] = await db.insert(inviteEvents).values({ ...data, inviteCode }).returning();
    return created;
  }

  async getInviteEventByCode(code: string): Promise<InviteEvent | undefined> {
    const [event] = await db.select().from(inviteEvents).where(eq(inviteEvents.inviteCode, code));
    return event;
  }

  async getInviteEventById(id: number): Promise<InviteEvent | undefined> {
    const [event] = await db.select().from(inviteEvents).where(eq(inviteEvents.id, id));
    return event;
  }

  async getAllInviteEvents(): Promise<(InviteEvent & { guestCount: number; clickedCount: number })[]> {
    const events = await db.select().from(inviteEvents).orderBy(desc(inviteEvents.createdAt));
    const results = [];
    for (const event of events) {
      const guests = await db.select().from(inviteGuests).where(eq(inviteGuests.inviteEventId, event.id));
      results.push({
        ...event,
        guestCount: guests.length,
        clickedCount: guests.filter(g => g.clickedZoom).length,
      });
    }
    return results;
  }

  async addInviteGuest(data: InsertInviteGuest): Promise<InviteGuest> {
    const [created] = await db.insert(inviteGuests).values(data).returning();
    return created;
  }

  async getGuestsByEventId(eventId: number): Promise<InviteGuest[]> {
    return db.select().from(inviteGuests).where(eq(inviteGuests.inviteEventId, eventId)).orderBy(desc(inviteGuests.registeredAt));
  }

  async markGuestClickedZoom(guestId: number): Promise<InviteGuest> {
    const [updated] = await db.update(inviteGuests)
      .set({ clickedZoom: true, clickedAt: new Date() })
      .where(eq(inviteGuests.id, guestId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
