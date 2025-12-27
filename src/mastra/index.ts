import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { MCPServer } from "@mastra/mcp";

import { listDocs } from "./tools/listDocs";
import { getSource } from "./tools/getSource";
import { getDoc } from "./tools/getDoc";
import { searchDocs } from "./tools/searchDocs";

const layerChartMCP = new MCPServer({
  name: "LayerChart Docs",
  version: "1.0.0",
  tools: {
    listDocs,
    getSource,
    getDoc,
    searchDocs,
  },
});

export const mastra = new Mastra({
  mcpServers: {
    layerChart: layerChartMCP,
  },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true },
  },
});
