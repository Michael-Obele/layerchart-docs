import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart";

// Helper to map doc routes to GitHub paths
export function getGitHubUrl(
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
    // Root pages like /getting-started are also under /docs in the repo
    if (cleanRoute === "/getting-started") {
      return `${GITHUB_RAW_BASE}/src/routes/docs/getting-started/+page.svelte`;
    }
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
