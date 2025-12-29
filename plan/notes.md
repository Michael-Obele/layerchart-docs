# Notes for LayerChart Docs MCP

## LayerChart Overview

- Svelte charting library with composable components
- Website: www.layerchart.com
- GitHub: techniq/layerchart
- Docs include: getting started, examples, components, API references
- Examples have "Show code" links with full Svelte code
- Uses Layer Cake as underlying framework

## Mastra MCP Implementation

- Use MCPServer class to expose tools
- Tools run via stdio transport for npx compatibility
- Publish as NPM package with bin entry
- Follow Mastra publishing guide for stdio setup

## Scraping Approach

- **Hybrid Strategy**: Combine resilient website scraping for text with direct GitHub fetching for code.
- **GitHub as Source of Truth (Code)**:
  - **Mapping Pattern**: `www.layerchart.com/docs/examples/Columns` -> `packages/layerchart/src/routes/docs/examples/Columns/+page.svelte`
  - **Benefit**: Bypasses dynamic rendering issues for code examples; provides exact source.
  - **Implementation**: See `mapping-strategy.md` for detailed logic.
- **Website Scraping (Text)**:
  - **Primary**: Use `fetch` + `cheerio` to extract documentation text from the rendered HTML (SvelteKit SSR).
  - **Fallback**: Use `Cinder` (Go Scraper Backend) if dynamic rendering is strictly required (e.g., for interactive demos that load content via JS).
  - **Resilience**: Focus on extracting main content containers, ignoring nav/sidebar.

## Tool Design (4 tools max)

1. **list_docs**: Scrape the sidebar navigation from `www.layerchart.com` to list all available documentation and example routes.
2. **get_doc**: **Hybrid Tool**. Fetches rendered text from the website AND raw source code from GitHub. Returns a combined Markdown response.
3. **get_source**: Direct access to raw Svelte source code from GitHub for a given route.
4. **search_docs**: Search across the documentation content (via GitHub search or local index).

## Challenges

- Website may have anti-scraping measures
- Content structure changes could break scraping
- Need to respect robots.txt
- Ensure content freshness vs performance

## Dependencies

- @mastra/mcp, @mastra/core
- cheerio, node-fetch
- tsup for building
- Testing: vitest or similar
