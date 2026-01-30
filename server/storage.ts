import { type User, type InsertUser, type Application, type InsertApplication } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createApplication(application: InsertApplication): Promise<Application>;
  getApplications(): Promise<Application[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private applications: Application[];
  private applicationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.applications = [];
    this.applicationIdCounter = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const application: Application = {
      ...insertApplication,
      id: this.applicationIdCounter++,
      createdAt: new Date(),
    };
    this.applications.push(application);
    return application;
  }

  async getApplications(): Promise<Application[]> {
    return [...this.applications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
