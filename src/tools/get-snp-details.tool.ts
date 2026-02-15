import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SnpService } from "../services/snp.service.js";
import {
  GetSnpDetailsInputSchema,
  type GetSnpDetailsInput,
} from "../schemas/tool-inputs.schemas.js";
import { CHARACTER_LIMIT } from "../constants.js";
import {
  formatSnpDetailsMarkdown,
  truncateIfNeeded,
} from "../utils/formatting.js";

export function registerGetSnpDetailsTool(server: McpServer, snpService: SnpService): void {
  server.tool(
    "get_snp_details",
    GetSnpDetailsInputSchema.shape,
    async (params: GetSnpDetailsInput) => {
      try {
        const result = await snpService.getSnpDetails(params.rsid);

        if ("error" in result) {
          return {
            content: [{ type: "text", text: result.error }],
          };
        }

        let textContent: string;
        if (params.response_format === "markdown") {
          textContent = formatSnpDetailsMarkdown(result);
        } else {
          textContent = JSON.stringify(result, null, 2);
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
              text: `Error retrieving SNP details: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
