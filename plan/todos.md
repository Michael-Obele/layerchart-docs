# Todos for LayerChart Docs MCP

## Research Phase

- [x] Analyze LayerChart website structure (sidebar nav, page formats)
- [x] Verify GitHub file paths for key documentation sections
- [x] Test `fetch` + `cheerio` on LayerChart site for text extraction (Simulated via context)
- [x] Validate `mapping-strategy.md` logic with real URLs

## Implementation Phase

> **Note:** Refer to [Implementation Guide](./implementation-guide.md) for code samples.

- [x] Set up Mastra project with MCPServer
- [x] Implement list_docs tool (scrape sidebar for routes)
- [x] Implement get_source tool (GitHub raw fetch with `type` param for usage/implementation)
- [x] Implement get_doc tool (Hybrid: Cheerio for text + get_source for code)
- [x] Implement search_docs tool (GitHub search API)
- [ ] Optimize search_docs tool (currently fetches all pages)
- [ ] Implement caching for GitHub fetches
- [ ] Test all tools with real LayerChart data

## Publishing Phase

- [ ] Configure package.json for NPM publishing
- [ ] Set up build process (tsup for stdio server)
- [ ] Test npx installation and execution
- [ ] Publish to NPM with proper versioning
- [ ] Update documentation with usage examples

## Documentation Phase

- [ ] Write README with installation and usage instructions
- [ ] Document tool APIs and parameters
- [ ] Add integration examples for AI agents
- [ ] Create troubleshooting guide
