import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

async function main() {
    // Create MCP server instance
    const server = new McpServer({
        name: "hello-world-mcp",
        version: "1.0.0",
    });

    console.log("Registering greet tool...");
    server.registerTool(
        "greet",
        {
            title: "Greeting Tool",
            description: "Returns a personalized greeting",
            inputSchema: {
                name: z.string().describe("Name to greet"),
            },
        },
        async ({ name }) => {
            // Return a simple greeting text response
            return {
                content: [{ type: "text", text: `Hello, ${name}!` }],
            };
        }
    );
    console.log("Registered greet tool!");

    // Weather tool definition
    console.log("Registering get_weather tool...");
    server.registerTool(
        "get_weather",
        {
            title: "Get Weather",
            description: "Returns current temperature and wind speed for given coordinates",
            inputSchema: {
                latitude: z.number().describe("Latitude (e.g. 52.52)"),
                longitude: z.number().describe("Longitude (e.g. 13.41)"),
            },
        },
        async ({ latitude, longitude }) => {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`;
            const response = await axios.get(url);
            const current = response.data.current;
            const summary = `At lat ${latitude}, lon ${longitude}: Temperature is ${current.temperature_2m}°C, wind speed is ${current.wind_speed_10m} km/h.`;
            return { content: [{ type: "text", text: summary }] };
        }
    );
    console.log("Registered get_weather tool!");

    const transport = new StdioServerTransport();

    await server.connect(transport);
    console.log("🚀 MCP Hello World server running on stdio");
}

main().catch((e) => {
    console.error("Server error:", e);
    process.exit(1);
});
