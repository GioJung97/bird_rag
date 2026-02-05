import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { conversations, messages } from "@/src/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const rows = await db
    .select({
      id: conversations.id,
      createdAt: conversations.createdAt,
      title: conversations.title,
      lastUpdatedAt: sql<number>`max(${messages.createdAt})`,
      firstUserText: sql<string | null>`(select ${messages.text} from ${messages} where ${messages.conversationId} = ${conversations.id} and ${messages.role} = 'user' order by ${messages.createdAt} asc limit 1)`
    })
    .from(conversations)
    .leftJoin(messages, eq(messages.conversationId, conversations.id))
    .groupBy(conversations.id)
    .orderBy(desc(sql`max(${messages.createdAt})`));

  const results = rows.map((row) => {
    const derivedTitle = row.title ?? row.firstUserText?.trim().slice(0, 60) ?? "Untitled";
    return {
      id: row.id,
      createdAt: row.createdAt,
      title: derivedTitle,
      lastUpdatedAt: row.lastUpdatedAt ?? row.createdAt
    };
  });

  return NextResponse.json({ conversations: results });
}
