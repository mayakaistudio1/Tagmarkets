import { db } from "./db";
import { promotions, scheduleEvents } from "@shared/schema";

export async function seedDatabase() {
  const existingPromos = await db.select().from(promotions);
  if (existingPromos.length === 0) {
    await db.insert(promotions).values([
      {
        badge: "SPEZIALAKTION",
        title: "24X Trading-Boost aktivieren",
        subtitle: "Normalerweise 12X Multiplikator, jetzt 24X. Doppeltes Kapital & Gewinn aus denselben Trades!",
        banner: "/promo-24x-boost.png",
        highlights: [
          "24X statt 12X Multiplikator auf deine Trades",
          "Doppeltes Kapital & Gewinnpotenzial",
          "Gleiche Strategie, doppelter Hebel",
        ],
        ctaText: "Jetzt aktivieren",
        ctaLink: "https://jetup.ibportal.io",
        deadline: "Zeitlich begrenzt verfügbar",
        gradient: "from-[#7C3AED] to-[#A855F7]",
        badgeColor: "bg-orange-500",
        isActive: true,
        sortOrder: 0,
      },
    ]);
    console.log("Seeded promotions table");
  }

  const existingEvents = await db.select().from(scheduleEvents);
  if (existingEvents.length === 0) {
    await db.insert(scheduleEvents).values([
      {
        day: "Mittwoch",
        date: "Jeden Mittwoch",
        time: "19:00",
        title: "Dein klarer Einstieg in die Finanzmärkte",
        speaker: "Lorenz Brunner",
        type: "trading",
        typeBadge: "Trading",
        banner: "/webinar-lorenz.png",
        highlights: [
          "Einstieg in die Finanzmärkte — strukturiert und verständlich",
          "Transparenz und Kontrolle über dein Kapital",
          "Praxisnahe Strategien für deinen Start",
        ],
        link: "https://us05web.zoom.us/j/83031264996?pwd=XG7QRgjUPi6qTet3jWybMf9OJu8IQi.1",
        isActive: true,
        sortOrder: 0,
      },
      {
        day: "Donnerstag",
        date: "Jeden Donnerstag",
        time: "19:00",
        title: "JetUP Ökosystem: Deine Möglichkeiten im Überblick",
        speaker: "Eddy Kanke",
        type: "partner",
        typeBadge: "Partner",
        banner: "/webinar-eddy.png",
        highlights: [
          "Überblick über das JetUP Ökosystem",
          "Deine Möglichkeiten als Investor",
          "Partnerprogramm & zusätzliche Einkommensmöglichkeiten",
        ],
        link: "https://us02web.zoom.us/j/87966496089?pwd=wn9dtI4JKkSow8shBHE3bNsj2IIImt.1",
        isActive: true,
        sortOrder: 1,
      },
    ]);
    console.log("Seeded schedule_events table");
  }
}
