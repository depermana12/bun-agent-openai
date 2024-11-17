import ora from "ora";
import chalk from "chalk";
import { UserMessage, AssistantMessage, ToolMessage } from "../types.ts";

type AIMessage = UserMessage | AssistantMessage | ToolMessage;

const color = chalk.green;
const reset = chalk.reset;

export const terminalLoader = (text: string) => {
  const spinner = ora({ text, color: "blue" }).start();

  return {
    fail: (text: string) => spinner.fail(text),
    succeed: (text: string) => spinner.succeed(text),
    update: (text: string) => (spinner.text = text),
    stop: () => spinner.stop(),
  };
};

export const logMessage = (message: AIMessage) => {
  // Log user messages (only have content)
  if (message.role === "user") {
    console.log(`\n${color}[USER]${reset}`);
    console.log(`${message.content}\n`);
    return;
  }

  // Log assistant messages
  if (message.role === "assistant") {
    console.log(`\n${color}[ASSISTANT]${reset}`);
    if (message.content) {
      console.log(`${message.content}\n`);
    }
    if (message.tool_calls) {
      console.log(`${color}[TOOL CALLS]${reset}`);
      message.tool_calls.forEach((tool_call) => {
        console.log(`Tool: ${tool_call.function.name}`);
        console.log(`Args: ${tool_call.function.arguments}\n`);
      });
    }
    return;
  }
};
