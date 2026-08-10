import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const aiDailyQuota = sqliteTable(
  "ai_daily_quota",
  {
    quotaKey: text("quota_key").notNull(),
    quotaDate: text("quota_date").notNull(),
    used: integer("used").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [primaryKey({ columns: [table.quotaKey, table.quotaDate] })],
);

export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("active"),
  source: text("source").notNull().default("website"),
  consentedAt: text("consented_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
