# LayerChart Docs MCP

A Mastra-powered Model Context Protocol (MCP) server that provides structured access to [LayerChart](https://www.layerchart.com) documentation and source code. This server enables AI agents to easily retrieve, search, and understand LayerChart components and examples.

## Production Deployment

|                  |                                   |                                                           |
| ---------------- | --------------------------------- | --------------------------------------------------------- |
| **Mastra Cloud** | `https://layerchart.mastra.cloud` | Primary choice - Zero cold start, maximum responsiveness. |

- Append `/api/mcp/layerChart/sse` for the **SSE transport** (best for editors that keep long-lived connections).
- Append `/api/mcp/layerChart/mcp` for the **HTTP transport** (handy for CLIs and quick one-off calls).

## 🚀 Features

- **Route Discovery**: List all available documentation and component routes.
- **Hybrid Retrieval**: Get documentation text from the website combined with raw source code from GitHub.
- **Source Access**: Fetch raw Svelte source code for both documentation pages (usage) and component implementations.
- **Semantic Search**: Search across the LayerChart repository to find relevant components and documentation.

## Editor Setup

Mastra Cloud is the recommended deployment for all editors. It offers zero cold start and maximum responsiveness. SSE works best for editors that keep a persistent connection, while HTTP is handy for one-off requests and scripts.

### Cursor / Windsurf / VS Code / Claude Desktop

Configure your editor to use the SSE endpoint:

```json
{
  "mcpServers": {
    "layerchart-docs": {
      "url": "https://layerchart.mastra.cloud/api/mcp/layerChart/sse"
    }
  }
}
```

## Verification & Quick Tests

Test the MCP connection using `mcp-remote` or `curl`:

```bash
# Test MCP connection
npx mcp-remote https://layerchart.mastra.cloud/api/mcp/layerChart/mcp

# Check HTTP endpoint
curl -I https://layerchart.mastra.cloud/api/mcp/layerChart/mcp
```

## Available Tools

Once installed, your AI assistant will have access to these tools:

1. **`list_docs`** - List all available documentation pages and component routes from LayerChart.
2. **`get_doc`** - Get the documentation content for a specific route. Returns both rendered text and raw source code.
3. **`get_source`** - Fetch raw source code for a documentation page (`usage`) or component implementation (`implementation`) directly from GitHub.
4. **`search_docs`** - Search for documentation and components in the LayerChart repository.

## Example Usage

After installing the MCP server in your editor, you can ask your AI assistant:

- "How do I use the BarChart component in LayerChart?"
- "Show me examples of using tooltips in LayerChart"
- "What are the props for the Axis component?"
- "Find documentation for the PieChart component"

## 📖 Programmatic Usage

```typescript
import { MCPClient } from "@mastra/mcp";

const mcp = new MCPClient({
  servers: {
    layerchart: {
      url: "https://layerchart.mastra.cloud/api/mcp/layerChart/sse",
    },
  },
});

// Get available tools
const tools = await mcp.getTools();

// Call a tool directly
const result = await mcp.callTool("layerchart", "search_docs", {
  query: "BarChart",
});
```

## 🚀 Quick Start (Local Development)

1. Install dependencies:

```bash
npm install
# or
bun install
```

2. Run in development mode:

```bash
npm run dev
# or
bun run dev
```

3. Build and run production:

```bash
npm run build
npm run start
```

## 📦 Scripts

| Script  | Description                             |
| ------- | --------------------------------------- |
| `dev`   | Start Mastra in development mode        |
| `build` | Build the Mastra project for production |
| `start` | Start the built Mastra server           |

## 🗂️ Project Structure

```
src/
├─ mastra/
│  ├─ tools/
│  │  ├─ getDoc.ts       # Hybrid text/code retrieval
│  │  ├─ getSource.ts    # GitHub mapping and fetching logic
│  │  ├─ listDocs.ts     # Sidebar scraping logic
│  │  └─ searchDocs.ts   # GitHub Search API integration
│  └─ index.ts           # Mastra configuration
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repo and create a feature branch
2. Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
3. Submit a PR describing your change

## License

MIT

## References

- [LayerChart Documentation](https://www.layerchart.com)
- [Mastra Documentation](https://mastra.ai/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
