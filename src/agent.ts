import { message } from "./db";
import { terminalLoader, logMessage } from "./terminalUtils";
import { runLLm } from "./llm";

export const runAgent = async ({
  userPrompt,
  tools,
}: {
  userPrompt: string;
  tools: any[];
}) => {
  message.push([{ role: "user", content: userPrompt }]);

  const loader = terminalLoader("Thinking...");

  const messageHistory = message.pull();

  const response = await runLLm({ messages: messageHistory, tools });
  if (response.tool_calls) {
    console.log("response from tool calling", response.tool_calls);
  }

  message.push([response]);

  logMessage(response);

  loader.stop();

  const result = message.pull();

  return result;
};
