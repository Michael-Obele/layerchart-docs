import { createTool } from "@mastra/core/tools";
import * as cheerio from "cheerio";
import { z } from "zod";
import { getGitHubUrl } from "./getSource";

export const getDoc = createTool({
  id: "get_doc",
  description:
    "Get the documentation content for a specific route (text and code from GitHub).",
  inputSchema: z.object({
    route: z
      .string()
      .describe("The documentation route (e.g., /docs/components/BarChart)"),
  }),
  execute: async ({ context }) => {
    const { route } = context;
    const githubUrl = getGitHubUrl(route, "usage");

    if (!githubUrl) {
      return {
        error: "Could not map route to a GitHub URL",
        route,
      };
    }

    try {
      // Fetch the Svelte source from GitHub
      const response = await fetch(githubUrl);
      if (!response.ok) {
        return {
          error: `GitHub API returned ${response.status}`,
          github_url: githubUrl,
        };
      }

      const svelteContent = await response.text();

      // Parse the Svelte content with cheerio to extract text
      const $ = cheerio.load(svelteContent);

      // Remove script and style tags
      $("script, style").remove();

      // Extract text from the body, which contains the documentation content
      const mainContent = $("body").text();

      // Clean up whitespace
      const cleanText = mainContent.replace(/\s+/g, " ").trim();

      return {
        route,
        text: cleanText,
        code: svelteContent,
        github_url: githubUrl,
      };
    } catch (error) {
      return {
        error: "Failed to fetch documentation",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
