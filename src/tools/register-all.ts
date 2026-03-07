import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SnpService } from "../services/snp.service.js";
import { createLogger } from "../utils/logger.js";
import { registerGetSnpDetailsTool } from "./get-snp-details.tool.js";
import { registerInterpretGenotypeTool } from "./interpret-genotype.tool.js";
import { registerListTraitsTool } from "./list-traits.tool.js";
import { registerSearchByTraitTool } from "./search-by-trait.tool.js";

const logger = createLogger("Tools");

// Why `server.registerTool as any` in every tool file:
// The MCP SDK bundles its own Zod 3.x, so its `AnySchema` type resolves to a
// different physical `$ZodType` than the project's Zod 4.x. TypeScript treats
// these duplicate declarations as incompatible. The cast is safe — the SDK's
// zod-compat layer handles Zod v4 schemas at runtime. Remove when the SDK
// drops its bundled Zod 3.x copy.

export function registerTools(server: McpServer, snpService: SnpService): void {
  registerSearchByTraitTool(server, snpService);
  registerGetSnpDetailsTool(server, snpService);
  registerInterpretGenotypeTool(server, snpService);
  registerListTraitsTool(server, snpService);

  logger.info("🛠️ Registered 4 genomics tools");
}
