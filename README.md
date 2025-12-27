# LayerChart Docs MCP

A Mastra-powered Model Context Protocol (MCP) server that provides structured access to [LayerChart](https://www.layerchart.com) documentation and source code. This server enables AI agents to easily retrieve, search, and understand LayerChart components and examples.

## Features

- **Route Discovery**: List all available documentation and component routes.
- **Hybrid Retrieval**: Get documentation text from the website combined with raw source code from GitHub.
- **Source Access**: Fetch raw Svelte source code for both documentation pages (usage) and component implementations.
- **Semantic Search**: Search across the LayerChart repository to find relevant components and documentation.

## Installation

To install dependencies:

```bash
npm install
# or
bun install
```

## Usage

### Running the MCP Server

You can run the server using Mastra's CLI:

```bash
npm run dev
# or
bun run dev
```

The server exposes an MCP endpoint that can be used by MCP-compatible clients (like Cursor, Windsurf, or Claude Desktop).

## Available Tools

### `list_docs`

List all available documentation pages and component routes from LayerChart.

- **Input**: None

### `get_doc`

Get the documentation content for a specific route. This is a hybrid tool that returns both the rendered text from the website and the raw source code from GitHub.

- **Input**:
  - `route` (string): The documentation route (e.g., `/docs/components/BarChart`).

### `get_source`

Fetch raw source code for a documentation page or component implementation directly from GitHub.

- **Input**:
  - `route` (string): The documentation route.
  - `type` (`"usage"` | `"implementation"`):
    - `"usage"`: Returns the docs page source code.
    - `"implementation"`: Returns the library component source code.

### `search_docs`

Search for documentation and components in the LayerChart repository using the GitHub Search API.

- **Input**:
  - `query` (string): The search query (e.g., `'BarChart'`, `'tooltip'`).

## Project Structure

- `src/mastra/index.ts`: Main entry point and Mastra configuration.
- `src/mastra/tools/`: Implementation of the MCP tools.
  - `listDocs.ts`: Sidebar scraping logic.
  - `getSource.ts`: GitHub mapping and fetching logic.
  - `getDoc.ts`: Hybrid text/code retrieval.
  - `searchDocs.ts`: GitHub Search API integration.

## Development

To build the project:

```bash
npm run build
# or
bun run build
```

To start the production server:

```bash
npm run start
# or
bun run start
```

## License

MIT
