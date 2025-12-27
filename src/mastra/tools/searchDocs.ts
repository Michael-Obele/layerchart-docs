import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const searchDocs = createTool({
  id: "search_docs",
  description:
    "Search for documentation and components in the LayerChart repository using GitHub Search API.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("The search query (e.g., 'BarChart', 'tooltip')"),
  }),
  execute: async ({ context }) => {
    const { query } = context;

    // GitHub Search API URL
    // We search for the query in the techniq/layerchart repo, specifically in the packages/layerchart directory
    const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent(
      `${query} repo:techniq/layerchart path:packages/layerchart`
    )}`;

    try {
      const response = await fetch(searchUrl, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Mastra-MCP-Server",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: "GitHub Search API error",
          details: errorData.message || response.statusText,
        };
      }

      const data = await response.json();

      // Map results to a more useful format
      const results = data.items.map((item: any) => {
        let route = "";
        if (item.path.includes("src/routes/docs")) {
          // Map back to website route
          // packages/layerchart/src/routes/docs/components/BarChart/+page.svelte -> /docs/components/BarChart
          route = item.path
            .replace("packages/layerchart/src/routes", "")
            .replace("/+page.svelte", "");
        } else if (item.path.includes("src/lib/components")) {
          // Map back to component route
          // packages/layerchart/src/lib/components/BarChart.svelte -> /docs/components/BarChart
          const name = item.path.split("/").pop().replace(".svelte", "");
          route = `/docs/components/${name}`;
        }

        return {
          name: item.name,
          path: item.path,
          route: route || null,
          github_url: item.html_url,
          score: item.score,
        };
      });

      return {
        query,
        total_count: data.total_count,
        results: results.slice(0, 10), // Return top 10 results
      };
    } catch (error) {
      return {
        error: "Failed to search documentation",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
