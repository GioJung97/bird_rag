import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  title: text("title")
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  text: text("text"),
  imagePath: text("image_path"),
  imageName: text("image_name"),
  createdAt: integer("created_at").notNull()
});

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
