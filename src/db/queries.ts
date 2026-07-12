import { eq, desc } from "drizzle-orm";
import { threads, messages } from "./schema";
import { db } from "./client";

export const getThreadsList = async () => {
  return await db.select().from(threads).orderBy(desc(threads.updatedAt));
};

export const getThreadMessages = async (threadId: string) => {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(messages.createdAt);
};

export const insertThread = async (id: string, title: string) => {
  const now = Date.now();
  await db.insert(threads).values({
    id,
    title,
    createdAt: now,
    updatedAt: now,
  });
};

export const insertMessage = async (
  id: string,
  threadId: string,
  role: "user" | "assistant",
  content: string
) => {
  const now = Date.now();
  
  // 1. Insert the message
  await db.insert(messages).values({
    id,
    threadId,
    role,
    content,
    createdAt: now,
  });

  // 2. Update the parent thread's updatedAt timestamp
  await db.update(threads).set({ updatedAt: now }).where(eq(threads.id, threadId));
};

export const deleteThreadCascade = async (id: string) => {
  // Cascades to messages via SQLite foreign key ON DELETE CASCADE
  await db.delete(threads).where(eq(threads.id, id));
};

export const updateThreadTitle = async (id: string, title: string) => {
  await db.update(threads).set({ title, updatedAt: Date.now() }).where(eq(threads.id, id));
};


