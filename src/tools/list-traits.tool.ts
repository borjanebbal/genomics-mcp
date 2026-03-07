import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CHARACTER_LIMIT } from "../constants.js";
import { type ListTraitsInput, ListTraitsInputSchema } from "../schemas/tool-inputs.schemas.js";
import type { SnpService } from "../services/snp.service.js";
import { formatTraitListMarkdown, truncateIfNeeded } from "../utils/formatting.js";

export function registerListTraitsTool(server: McpServer, snpService: SnpService): void {
  // biome-ignore lint/suspicious/noExplicitAny: duplicate-package Zod type mismatch (see register-all.ts)
  (server.registerTool as any)(
    "list_traits",
    {
      description:
        "List all available traits in the dataset with SNP counts, grouped by category. Supports optional search filter.",
      inputSchema: ListTraitsInputSchema.shape,
    },
    async (params: ListTraitsInput) => {
      try {
        const traits = await snpService.listTraits(params.search);

        if (traits.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: params.search
                  ? `No traits found matching '${params.search}'`
                  : "No traits available in the database",
              },
            ],
          };
        }

        let textContent: string;
        if (params.response_format === "markdown") {
          textContent = formatTraitListMarkdown(traits);
        } else {
          textContent = JSON.stringify({ traits, total: traits.length }, null, 2);
        }

        textContent = truncateIfNeeded(textContent, CHARACTER_LIMIT);

        return {
          content: [{ type: "text", text: textContent }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing traits: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
