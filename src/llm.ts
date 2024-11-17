import { openAi } from "./openai";
import type { AIMessage } from "./db";
import { zodFunction } from "openai/helpers/zod";

export const runLLm = async ({
  messages,
  tools,
}: {
  messages: AIMessage[];
  tools: any[];
}) => {
  const formattedTools = tools.map(zodFunction);

  const response = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages,
    tools: formattedTools,
    tool_choice: "auto",
    parallel_tool_calls: false,
  });

  return response.choices[0].message;
};
