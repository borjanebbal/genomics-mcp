import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SnpService } from "../services/snp.service.js";
import {
  SearchByTraitInputSchema,
  type SearchByTraitInput,
} from "../schemas/tool-inputs.schemas.js";
import { CHARACTER_LIMIT } from "../constants.js";
import {
  formatSearchResultsMarkdown,
  truncateIfNeeded,
} from "../utils/formatting.js";

export function registerSearchByTraitTool(server: McpServer, snpService: SnpService): void {
  server.tool(
    "search_by_trait",
    SearchByTraitInputSchema.shape,
    async (params: SearchByTraitInput) => {
      try {
        const { snps, pagination } = await snpService.searchByTraits(
          params.traits,
          params.match_mode,
          params.limit,
          params.offset
        );

        if (snps.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No SNPs found for traits: ${params.traits.join(", ")}. Try using 'list_traits' to see available traits.`,
              },
            ],
          };
        }

        let textContent: string;
        if (params.response_format === "markdown") {
          textContent = formatSearchResultsMarkdown(snps, pagination, params.traits);
        } else {
          textContent = JSON.stringify({ snps, pagination }, null, 2);
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
              text: `Error searching SNPs: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
