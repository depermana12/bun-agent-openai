import type OpenAI from "openai";

type Role = "user" | "assistant" | "tool";
type Content = string | null;

interface BaseMessage {
  role: Role;
  content: Content;
}

export interface UserMessage extends BaseMessage {
  role: "user";
  content: string;
}

export interface AssistantMessage extends BaseMessage {
  role: "assistant";
  content: Content;
  tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
}

export interface ToolMessage extends BaseMessage {
  role: "tool";
  content: string;
  tool_call_id: string;
}
