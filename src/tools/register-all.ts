import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SnpService } from "../services/snp.service.js";
import { createLogger } from "../utils/logger.js";
import { registerGetMetadataTool } from "./get-metadata.tool.js";
import { registerGetSnpDetailsTool } from "./get-snp-details.tool.js";
import { registerInterpretGenotypeTool } from "./interpret-genotype.tool.js";
import { registerListTraitsTool } from "./list-traits.tool.js";
import { registerSearchByTraitTool } from "./search-by-trait.tool.js";

const logger = createLogger("Tools");

// WHY `server.registerTool as any` in every tool file
// =====================================================
// The MCP SDK bundles its own private copy of Zod 3.x inside its package.
// When TypeScript resolves `AnySchema` from `@modelcontextprotocol/sdk`, it
// sees that package's `$ZodType`, which is a *different physical class* than
// the `$ZodType` exported by this project's Zod 4.x.  TypeScript's structural
// type-checker treats these as incompatible even though the runtime call is
// perfectly safe — the SDK ships a `zod-compat` adapter that accepts Zod v4
// schemas at runtime.
//
// The cast is isolated to a single line in each tool file and annotated with
// a `biome-ignore` comment so it does not silently spread.
//
// Track https://github.com/modelcontextprotocol/typescript-sdk/issues for an
// SDK release that removes the bundled Zod 3.x copy, at which point all the
// casts can be deleted.

export function registerTools(server: McpServer, snpService: SnpService): void {
  registerSearchByTraitTool(server, snpService);
  registerGetSnpDetailsTool(server, snpService);
  registerInterpretGenotypeTool(server, snpService);
  registerListTraitsTool(server, snpService);
  registerGetMetadataTool(server, snpService);

  logger.info("🛠️ Registered 5 genomics tools");
}
