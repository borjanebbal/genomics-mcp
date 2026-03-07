import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type GetMetadataInput, GetMetadataInputSchema } from "../schemas/tool-inputs.schemas.js";
import type { SnpService } from "../services/snp.service.js";
import { formatMetadataMarkdown } from "../utils/formatting.js";

export function registerGetMetadataTool(server: McpServer, snpService: SnpService): void {
  // biome-ignore lint/suspicious/noExplicitAny: duplicate-package Zod type mismatch (see register-all.ts)
  (server.registerTool as any)(
    "get_metadata",
    {
      description:
        "Return dataset statistics and server version: total SNP count, total trait count, and the date of the most recently updated SNP.",
      inputSchema: GetMetadataInputSchema.shape,
    },
    async (params: GetMetadataInput) => {
      try {
        const metadata = await snpService.getMetadata();

        let textContent: string;
        if (params.response_format === "markdown") {
          textContent = formatMetadataMarkdown(metadata);
        } else {
          textContent = JSON.stringify(metadata, null, 2);
        }

        return {
          content: [{ type: "text", text: textContent }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving metadata: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
