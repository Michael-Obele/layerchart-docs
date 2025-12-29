# Implementation Guide: LayerChart Docs MCP

This guide provides concrete code samples for building the LayerChart MCP server using Mastra.

## 1. Project Setup

Initialize a new Mastra project:

```bash
npm create mastra@latest layerchart-mcp
cd layerchart-mcp
npm install cheerio
```

## 2. Tool Definitions

### A. `list_docs` Tool

This tool scrapes the sidebar of the live documentation site to discover available routes.

**File:** `src/tools/listDocs.ts`

```typescript
import { createTool } from "@mastra/core";
import * as cheerio from "cheerio";
import { z } from "zod";

export const listDocs = createTool({
  id: "list_docs",
  description:
    "List all available documentation pages and component routes from LayerChart.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const response = await fetch("https://www.layerchart.com/docs");
      const html = await response.text();
      const $ = cheerio.load(html);

      const routes: string[] = [];

      // Select all links in the navigation sidebar
      // Adjust selector based on actual site structure, usually 'nav a' or 'aside a'
      $("nav a[href^='/docs']").each((_, element) => {
        const href = $(element).attr("href");
        if (href) {
          // Normalize URL: remove trailing slashes, ensure it starts with /docs
          const normalized = href.replace(/\/$/, "");
          if (!routes.includes(normalized)) {
            routes.push(normalized);
          }
        }
      });

      return {
        count: routes.length,
        routes: routes.sort(),
      };
    } catch (error) {
      return {
        error: "Failed to fetch documentation list",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
```

### B. `get_source` Tool

This tool fetches the raw source code from GitHub based on the documentation route. It handles both "usage" (the docs page source) and "implementation" (the component source).

**File:** `src/tools/getSource.ts`

```typescript
import { createTool } from "@mastra/core";
import { z } from "zod";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart";

// Helper to map doc routes to GitHub paths
function getGitHubUrl(
  route: string,
  type: "usage" | "implementation"
): string | null {
  const cleanRoute = route
    .replace("https://www.layerchart.com", "")
    .replace(/\/$/, "");

  // 1. Handle "Usage" (The documentation page itself)
  if (type === "usage") {
    // Most docs are at src/routes/docs/[...slug]/+page.svelte
    // Example: /docs/components/BarChart -> src/routes/docs/components/BarChart/+page.svelte
    return `${GITHUB_RAW_BASE}/src/routes${cleanRoute}/+page.svelte`;
  }

  // 2. Handle "Implementation" (The library component source)
  if (type === "implementation") {
    // Only applies to components, usually under /docs/components/
    if (!cleanRoute.includes("/components/")) {
      return null;
    }

    const componentName = cleanRoute.split("/").pop();
    if (!componentName) return null;

    // Map: /docs/components/BarChart -> src/lib/components/BarChart.svelte
    // Note: Some might be in subfolders, but this is the 80% rule.
    // A more robust version might try multiple paths or use the GitHub Tree API.
    return `${GITHUB_RAW_BASE}/src/lib/components/${componentName}.svelte`;
  }

  return null;
}

export const getSource = createTool({
  id: "get_source",
  description:
    "Fetch raw source code for a documentation page or component implementation.",
  inputSchema: z.object({
    route: z
      .string()
      .describe("The documentation route (e.g., /docs/components/BarChart)"),
    type: z
      .enum(["usage", "implementation"])
      .describe(
        "Type of source to fetch: 'usage' for the docs page code, 'implementation' for the component source code."
      ),
  }),
  execute: async ({ context }) => {
    const { route, type } = context;
    const url = getGitHubUrl(route, type);

    if (!url) {
      return {
        error: "Could not map route to a GitHub URL",
        route,
        type,
      };
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          // Fallback strategies could go here (e.g., try .md instead of .svelte)
          return {
            error: "File not found in GitHub repo",
            url,
            status: 404,
          };
        }
        throw new Error(`GitHub API returned ${response.status}`);
      }

      const content = await response.text();
      return {
        route,
        type,
        github_url: url,
        content,
        language: "svelte",
      };
    } catch (error) {
      return {
        error: "Failed to fetch source code",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
```

### C. `get_doc` Tool (Optional / Convenience)

This tool is a semantic wrapper around `get_source` with `type: "usage"`, but could be expanded to parse the markdown/svelte content if needed.

**File:** `src/tools/getDoc.ts`

```typescript
import { createTool } from "@mastra/core";
import { z } from "zod";
import { getSource } from "./getSource"; // Reuse logic

export const getDoc = createTool({
  id: "get_doc",
  description:
    "Get the documentation content for a specific route (alias for get_source type='usage').",
  inputSchema: z.object({
    route: z.string().describe("The documentation route"),
  }),
  execute: async ({ context }) => {
    // Reuse the get_source logic directly
    return getSource.execute({
      context: {
        route: context.route,
        type: "usage",
      },
    });
  },
});
```

## 3. Server Configuration

Register the tools in your Mastra server instance.

**File:** `src/index.ts`

```typescript
import { Mastra } from "@mastra/core";
import { listDocs } from "./tools/listDocs";
import { getSource } from "./tools/getSource";
import { getDoc } from "./tools/getDoc";

export const mastra = new Mastra({
  name: "layerchart-mcp",
  agents: {
    // ... agent config if needed
  },
  tools: {
    listDocs,
    getSource,
    getDoc,
  },
});

// Start the server (if using standalone MCP server mode)
// ...
```

## 4. Resilience Strategy

1.  **GitHub as Source of Truth**: We avoid scraping rendered HTML for code blocks, which is fragile. We fetch the raw `.svelte` files.
2.  **Fallback Logic**: If `src/lib/components/Name.svelte` doesn't exist, the `get_source` tool returns a clear 404, allowing the LLM to try a different path or search strategy.
3.  **Sidebar Scraping**: We only scrape the sidebar for _discovery_. If the site layout changes drastically, only `list_docs` needs updating, while `get_source` remains valid as long as the repo structure is stable.
