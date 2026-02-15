import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SnpService } from "../services/snp.service.js";
import { registerSearchByTraitTool } from "./search-by-trait.tool.js";
import { registerGetSnpDetailsTool } from "./get-snp-details.tool.js";
import { registerInterpretGenotypeTool } from "./interpret-genotype.tool.js";
import { registerListTraitsTool } from "./list-traits.tool.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Tools");

export function registerTools(server: McpServer, snpService: SnpService): void {
  registerSearchByTraitTool(server, snpService);
  registerGetSnpDetailsTool(server, snpService);
  registerInterpretGenotypeTool(server, snpService);
  registerListTraitsTool(server, snpService);

  logger.info("Registered 4 genomics tools");
}
