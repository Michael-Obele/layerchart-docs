import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const listDocs = createTool({
  id: "list_docs",
  description:
    "List all available documentation pages and component routes from LayerChart.",
  inputSchema: z.object({}),
  execute: async () => {
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
