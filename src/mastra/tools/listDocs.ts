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
      // Scrape from a component page that has the sidebar/related links
      const response = await fetch(
        "https://www.layerchart.com/docs/components/BarChart"
      );
      const html = await response.text();
      const $ = cheerio.load(html);

      const routes: string[] = [];

      // Find the "Related" section and extract links from COMPONENTS and EXAMPLES
      const relatedSection = $('h1:contains("Related")').nextAll();
      let inComponents = false;
      let inExamples = false;

      relatedSection.each((_, element) => {
        const $el = $(element);
        if ($el.is("h2")) {
          const text = $el.text().trim();
          if (text === "COMPONENTS") {
            inComponents = true;
            inExamples = false;
          } else if (text === "EXAMPLES") {
            inComponents = false;
            inExamples = true;
          } else {
            inComponents = false;
            inExamples = false;
          }
        } else if ((inComponents || inExamples) && $el.is("p")) {
          // Extract links from the paragraph
          $el.find('a[href^="/docs"]').each((_, link) => {
            const href = $(link).attr("href");
            if (href) {
              const normalized = href.replace(/\/$/, "");
              if (!routes.includes(normalized)) {
                routes.push(normalized);
              }
            }
          });
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
