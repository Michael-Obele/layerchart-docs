# LayerChart Docs MCP

Build a Mastra-based MCP server that scrapes and provides access to LayerChart documentation in AI-digestible formats.

## Goals

- Create an MCP server with ≤4 tools for accessing LayerChart docs
- Enable AI agents to easily retrieve and understand LayerChart documentation without manual browsing
- Provide structured access to getting started guides, examples, component APIs, and search capabilities
- Publish the server to NPM for easy consumption via npx

## Tools

1. **`list_docs`**: Scrapes the sidebar to find all available documentation pages.
2. **`get_source`**: Fetches the raw source code from GitHub.
   - **Usage**: `get_source(route: "/docs/components/BarChart", type: "usage")` -> Returns the docs page source.
   - **Implementation**: `get_source(route: "/docs/components/BarChart", type: "implementation")` -> Returns the component source.
3. **`get_doc`**: Convenience wrapper for `get_source(..., type: "usage")`.

## Implementation

See [Implementation Guide](./implementation-guide.md) for concrete code samples and setup instructions.

## Success Criteria

- MCP server successfully exposes 4 tools: list_docs, get_doc, get_source, search_docs
- **Hybrid Strategy**: Tools intelligently combine website scraping (for text) and GitHub raw fetching (for code)
- **Resilience**: Code retrieval is immune to website DOM changes; text retrieval uses robust selectors or Cinder fallback
- Content is formatted for AI consumption (markdown, raw Svelte source)
- Server can be installed and run via npx
- Documentation is up-to-date and reliable

## Next Steps

1. Research web scraping libraries compatible with Node.js
2. Analyze LayerChart website structure for scraping targets
3. Implement Mastra MCPServer with the 4 tools
4. Test tools against live website
5. Publish to NPM following Mastra guidelines
6. Document usage and integration examples

## Related Documents

- [Notes](./notes.md)
- [Todos](./todos.md)
