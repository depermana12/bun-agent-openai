import OpenAI from "openai";
import type { AIMessage } from "./db";

const openAi = new OpenAI();

export const runLLm = async ({ messages }: { messages: AIMessage[] }) => {
  const response = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages,
  });

  return response.choices[0].message.content;
};
