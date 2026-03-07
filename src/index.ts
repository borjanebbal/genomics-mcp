#!/usr/bin/env bun

import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { VERSION } from "./constants.js";
import { JsonSnpRepository } from "./repositories/snp.json-repository.js";
import { SnpService } from "./services/snp.service.js";
import { registerTools } from "./tools/register-all.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("Server");

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

/** Parse --flag value pairs from process.argv. */
function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

type TransportMode = "stdio" | "http";

const transportArg = getArg("--transport") ?? "stdio";
if (transportArg !== "stdio" && transportArg !== "http") {
  process.stderr.write(
    `[Server] ERROR: Unknown --transport value "${transportArg}". Valid values: stdio, http\n`
  );
  process.exit(1);
}
const TRANSPORT_MODE: TransportMode = transportArg as TransportMode;

const portArg = getArg("--port") ?? "3000";
const HTTP_PORT = Number(portArg);
if (!Number.isInteger(HTTP_PORT) || HTTP_PORT < 1 || HTTP_PORT > 65535) {
  process.stderr.write(
    `[Server] ERROR: Invalid --port value "${portArg}". Must be an integer between 1 and 65535.\n`
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const server = new McpServer({
    name: "genomics-mcp",
    version: VERSION,
  });

  logger.info(`Initializing Genomics MCP Server v${VERSION}`);

  const dataPath = resolve(import.meta.dir, "repositories/data/snps.json");
  logger.info(`Loading SNP data from: ${dataPath}`);

  const repository = new JsonSnpRepository(dataPath);

  try {
    await repository.initialize();
  } catch (error) {
    logger.error("FATAL: Failed to initialize repository:", error);
    process.exit(1);
  }

  const snpService = new SnpService(repository);

  registerTools(server, snpService);

  const metadata = await snpService.getMetadata();
  logger.info(`🧬 Dataset loaded: ${metadata.total_snps} SNPs, ${metadata.total_traits} traits`);
  logger.info(`🗓️ Last updated: ${metadata.last_updated ?? "unknown"}`);

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully... 👋`);
      try {
        await server.close();
      } catch (err) {
        logger.error("Error during shutdown:", err);
      }
      process.exit(0);
    });
  }

  if (TRANSPORT_MODE === "http") {
    await startHttpTransport(server);
  } else {
    await startStdioTransport(server);
  }
}

// ---------------------------------------------------------------------------
// Transport: stdio (default)
// ---------------------------------------------------------------------------

async function startStdioTransport(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Connected via stdio transport");
  logger.info("🚀 Genomics MCP Server is ready");
}

// ---------------------------------------------------------------------------
// Transport: HTTP (Streamable HTTP — stateless, Bun.serve)
// ---------------------------------------------------------------------------

async function startHttpTransport(server: McpServer): Promise<void> {
  // Stateless mode: no sessionIdGenerator — every POST /mcp is handled
  // independently. This is the simplest deployment model and requires no
  // sticky sessions or shared state between requests.
  const transport = new WebStandardStreamableHTTPServerTransport();
  await server.connect(transport);

  Bun.serve({
    port: HTTP_PORT,
    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url);

      if (url.pathname === "/mcp") {
        return transport.handleRequest(req);
      }

      if (url.pathname === "/health") {
        return new Response(JSON.stringify({ status: "ok", version: VERSION }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  logger.info("Connected via HTTP transport (Streamable HTTP)");
  logger.info(`🚀 Genomics MCP Server is ready on http://localhost:${HTTP_PORT}/mcp`);
  logger.info(`   Health check: http://localhost:${HTTP_PORT}/health`);
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
