import { Database } from "bun:sqlite";
import OpenAI from "openai";
import type { UserMessage, AssistantMessage, ToolMessage } from "../types";

const db = new Database("src/message.sqlite", {
  create: true,
  strict: true,
});

db.run(`
  CREATE TABLE IF NOT EXISTS messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role VARCHAR(20) NOT NULL,
    content TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `);

db.run(`
  CREATE TABLE IF NOT EXISTS tool_calls(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  tool_call_id TEXT NOT NULL,
  tool_call_name TEXT NOT NULL,
  function_args TEXT,
  FOREIGN KEY(message_id) REFERENCES messages(id)
  )
  `);

db.run(`
  CREATE TABLE IF NOT EXISTS tool_call_responses(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  tool_call_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  FOREIGN KEY(message_id)REFERENCES messages(id)
  )
  `);

export type AIMessage = UserMessage | AssistantMessage | ToolMessage;

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

      const insertToolCall = this.db.prepare(
        `
        INSERT INTO tool_calls(message_id, tool_call_id, tool_call_name, function_args)
        VALUES($message_id, $tool_call_id, $tool_call_name, $function_args)
        `,
      );

      const insertToolCallResponse = this.db.prepare(
        `
        INSERT INTO tool_call_responses(message_id, tool_call_id, content)
        VALUES($message_id, $tool_call_id, $content)
        `,
      );

      for (const message of messages) {
        const messageId = insertMessage.get({
          role: message.role,
          content: message.content as string,
        }) as number;

        if ("tool_calls" in message && message.tool_calls) {
          for (const toolCall of message.tool_calls) {
            insertToolCall.run({
              message_id: messageId,
              tool_call_id: toolCall.id,
              tool_call_name: toolCall.function.name,
              function_args: toolCall.function.arguments,
            });
          }
        }

        if (message.role === "assistant" && "tool_call_id" in message) {
          insertToolCallResponse.run({
            message_id: messageId,
            tool_call_id: message.tool_call_id as string,
            content: message.content as string,
          });
        }
      }
    } catch (error) {
      console.log("failed to insert", error);
    }
  }
  pull(): AIMessage[] {
    const messages = this.db
      .query(
        `
      SELECT role, content
      FROM messages
      ORDER BY created_at
      ASC
      `,
      )
      .all() as (AIMessage & { id: number })[];

    for (const message of messages) {
      const toolCalls = this.db
        .query(
          `
        SELECT tool_call_id, tool_call_name, function_args
        FROM tool_calls
        WHERE message_id = ?
          `,
        )
        .all(message.id) as {
        tool_call_id: string;
        tool_call_name: string;
        function_args: string;
      }[];

      this.db
        .query(
          `SELECT tool_call_id, content 
           FROM tool_call_responses 
           WHERE message_id = ?`,
        )
        .all(message.id) as {
        tool_call_id: string;
        tool_call_name: string;
        function_args: string;
      }[];
    }
    return messages;
  }
}

export const message = new Message(db);
