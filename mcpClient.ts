import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

interface MCPTool {
  name: string;
  title?: string;
  description?: string;
  // add more if needed
}

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["--loader", "ts-node/esm", "mcpServer.ts"], 
  });

  const client = new Client({
    name: "mcp-client-example",
    version: "1.0.0",
  });

  await client.connect(transport);

  const toolsData = await client.listTools();
  // Log raw data to inspect
  console.log("toolsData", toolsData);

  // Example extraction — adjust based on actual structure
  let tools: MCPTool[] = [];

  if (Array.isArray(toolsData)) {
    tools = toolsData as MCPTool[];
  } else if ("tools" in toolsData && Array.isArray((toolsData as any).tools)) {
    tools = (toolsData as any).tools as MCPTool[];
  } else {
    // fallback or raise error
    console.warn("Tools response is not an array or contains no tools array");
  }

  console.log("Available tools:", tools.map((t) => t.name).join(", "));

  // Call greet tool
  const greetResult = await client.callTool({
    name: "greet",
    arguments: { name: "Gaurav Jogani" },
  });


  const weatherResult = await client.callTool({
    name: "get_weather",
    arguments: { latitude: 52.52, longitude: 13.41 },
  });

  console.log("User Greeting", greetResult);
  console.log("Get Weather", weatherResult);

  // Don't forget to close transport if needed
  await client.close();
}

main().catch(console.error);
