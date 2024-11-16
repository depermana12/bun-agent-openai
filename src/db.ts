import { Database } from "bun:sqlite";
import OpenAI from "openai";

const db = new Database("message.sqlite", {
  create: true,
  strict: true,
});

db.run(`
  CREATE TABLE IF NOT EXISTS messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `);

type Role = "user" | "assistant";

export type AIMessage =
  | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
  | { role: Role; content: string };

class Message {
  constructor(private db: Database) {}

  async push(messages: AIMessage[]) {
    try {
      const insertMessage = this.db.prepare(
        `
        INSERT INTO messages(role, content)
        VALUES($role, $content)
        `,
      );
      for (const message of messages) {
        insertMessage.run({
          role: message.role,
          content: message.content as string,
        });
      }
    } catch (error) {
      console.log("failed to insert", error);
    }
  }
  pull(): AIMessage[] {
    return this.db
      .query(
        `
      SELECT role, content
      FROM messages
      ORDER BY created_at
      ASC
      `,
      )
      .all() as AIMessage[];
  }
}

export const message = new Message(db);
