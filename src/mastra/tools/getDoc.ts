import { createTool } from "@mastra/core/tools";
import * as cheerio from "cheerio";
import { z } from "zod";
import { getGitHubUrl } from "./getSource";

export const getDoc = createTool({
  id: "get_doc",
  description:
    "Get the documentation content for a specific route (Hybrid: text from website + code from GitHub).",
  inputSchema: z.object({
    route: z
      .string()
      .describe("The documentation route (e.g., /docs/components/BarChart)"),
  }),
  execute: async ({ context }) => {
    const { route } = context;
    const fullUrl = route.startsWith("http")
      ? route
      : `https://www.layerchart.com${route}`;
    const githubUrl = getGitHubUrl(route, "usage");

    const results: {
      text?: string;
      code?: string;
      github_url?: string;
      error?: string;
    } = {};

    try {
      // 1. Fetch rendered content from website
      const webResponse = await fetch(fullUrl);
      if (webResponse.ok) {
        const html = await webResponse.text();
        const $ = cheerio.load(html);

        // Extract main content - adjust selector based on actual site structure
        // Usually 'main' or a specific container
        const mainContent = $("main").text().trim() || $("body").text().trim();
        results.text = mainContent;
      }

      // 2. Fetch raw source from GitHub
      if (githubUrl) {
        const ghResponse = await fetch(githubUrl);
        if (ghResponse.ok) {
          results.code = await ghResponse.text();
          results.github_url = githubUrl;
        }
      }

      if (!results.text && !results.code) {
        return {
          error: "Failed to fetch content from both website and GitHub",
          route,
        };
      }

      return {
        route,
        ...results,
      };
    } catch (error) {
      return {
        error: "Failed to fetch documentation",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
