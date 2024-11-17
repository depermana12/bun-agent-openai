import { z } from "zod";
import { runAgent } from "./src/agent";

const userPrompt = Bun.argv[2];
if (!userPrompt) {
  console.log(`Invalid messages.\nUsage: bun index.ts <message>`);
  process.exit(1);
}

const weatherTool = {
  name: "get_weater",
  description: "use this tool to get the weather",
  parameters: z.object({}),
};

const response = await runAgent({ userPrompt, tools: [weatherTool] });

console.log(response);
