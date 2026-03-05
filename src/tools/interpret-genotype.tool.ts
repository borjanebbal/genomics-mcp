import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CHARACTER_LIMIT } from "../constants.js";
import { InterpretGenotypeInputSchema } from "../schemas/tool-inputs.schemas.js";
import type { SnpService } from "../services/snp.service.js";
import { formatGenotypeInterpretationMarkdown, truncateIfNeeded } from "../utils/formatting.js";

export function registerInterpretGenotypeTool(server: McpServer, snpService: SnpService): void {
  server.registerTool(
    "interpret_genotype",
    { inputSchema: InterpretGenotypeInputSchema.shape },
    async (params) => {
      try {
        const result = await snpService.interpretGenotype(params.rsid, params.genotype);

        if ("error" in result) {
          return {
            content: [{ type: "text", text: result.error }],
          };
        }

        let textContent: string;
        if (params.response_format === "markdown") {
          textContent = formatGenotypeInterpretationMarkdown(result);
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
              text: `Error interpreting genotype: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
