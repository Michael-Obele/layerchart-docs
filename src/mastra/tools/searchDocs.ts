import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const searchDocs = createTool({
  id: "search_docs",
  description:
    "Search for documentation and components in the LayerChart repository.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("The search query (e.g., 'BarChart', 'tooltip')"),
  }),
  execute: async ({ context }) => {
    const { query } = context;

    try {
      const routes: string[] = [];

      // Get components from GitHub API
      const componentsRes = await fetch(
        "https://api.github.com/repos/techniq/layerchart/contents/packages/layerchart/src/routes/docs/components"
      );
      if (componentsRes.ok) {
        const components = await componentsRes.json();
        for (const item of components) {
          if (item.type === "dir") {
            routes.push(`/docs/components/${item.name}`);
          }
        }
      }

      // Get examples from GitHub API
      const examplesRes = await fetch(
        "https://api.github.com/repos/techniq/layerchart/contents/packages/layerchart/src/routes/docs/examples"
      );
      if (examplesRes.ok) {
        const examples = await examplesRes.json();
        for (const item of examples) {
          if (item.type === "dir") {
            routes.push(`/docs/examples/${item.name}`);
          }
        }
      }

      // Search through routes and content
      const results: any[] = [];
      const searchTerm = query.toLowerCase();

      for (const route of routes) {
        try {
          // First check if route name matches
          const routeName = route.split('/').pop()?.toLowerCase() || '';
          if (routeName.includes(searchTerm)) {
            results.push({
              route,
              match_type: 'route_name',
              relevance: 'high',
              preview: `Route: ${route}`,
            });
            continue; // Don't search content if route name matches
          }

          // Get documentation content
          const githubUrl = getGitHubUrl(route, "usage");
          if (!githubUrl) continue;

          const response = await fetch(githubUrl);
          if (!response.ok) continue;

          const svelteContent = await response.text();
          const contentLower = svelteContent.toLowerCase();

          // Search for the query in the content
          if (contentLower.includes(searchTerm)) {
            // Extract a preview around the first match
            const index = contentLower.indexOf(searchTerm);
            const start = Math.max(0, index - 100);
            const end = Math.min(svelteContent.length, index + 200);
            const preview = svelteContent.substring(start, end).replace(/\s+/g, ' ').trim();

            results.push({
              route,
              match_type: 'content',
              relevance: 'medium',
              preview: `...${preview}...`,
            });
          }
        } catch (error) {
          // Skip this route if there's an error
          continue;
        }
      }

      // Sort results by relevance
      results.sort((a, b) => {
        if (a.relevance === 'high' && b.relevance !== 'high') return -1;
        if (b.relevance === 'high' && a.relevance !== 'high') return 1;
        return 0;
      });

      return {
        query,
        total_count: results.length,
        results: results.slice(0, 20), // Return top 20 results
      };
    } catch (error) {
      return {
        error: "Failed to search documentation",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// Helper function to map route to GitHub URL (copied from getSource.ts)
function getGitHubUrl(route: string, type: "usage" | "implementation"): string | null {
  if (route.startsWith("/docs/components/")) {
    const component = route.replace("/docs/components/", "");
    if (type === "usage") {
      return `https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart/src/routes/docs/components/${component}/+page.svelte`;
    } else {
      return `https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart/src/lib/components/${component}.svelte`;
    }
  } else if (route.startsWith("/docs/examples/")) {
    const example = route.replace("/docs/examples/", "");
    if (type === "usage") {
      return `https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart/src/routes/docs/examples/${example}/+page.svelte`;
    } else {
      return `https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart/src/lib/components/${example}.svelte`;
    }
  }
  return null;
}
