import { createTool } from "@mastra/core/tools";
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
