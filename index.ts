import { runLLm } from "./src/llm";
import { message } from "./src/db";

const userPrompt = Bun.argv[2];
if (!userPrompt) {
  console.log(`Invalid messages.\nUsage: bun index.ts <message>`);
  process.exit(1);
}

message.push([{ role: "user", content: userPrompt }]);
const messagesHistory = message.pull();

const response = await runLLm({
  messages: messagesHistory,
});

message.push([{ role: "assistant", content: response }]);

console.log(response);
