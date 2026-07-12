import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const threads = sqliteTable("threads", {
  id: text("id").primaryKey(), // UUID generated in React
  title: text("title").notNull(),
  createdAt: integer("created_at").notNull(), // Unix timestamp
  updatedAt: integer("updated_at").notNull(), // Unix timestamp for sorting
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(), // UUID generated in React
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(), // Unix timestamp
});
