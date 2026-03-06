#!/usr/bin/env bun

import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { JsonSnpRepository } from "./repositories/snp.json-repository.js";
import { SnpService } from "./services/snp.service.js";
import { registerTools } from "./tools/register-all.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("Server");

async function main() {
  const server = new McpServer({
    name: "genomics-mcp",
    version: "0.1.0",
  });

  logger.info("Initializing Genomics MCP Server v0.1.0");

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

  const metadata = await repository.getMetadata();
  logger.info(`🧬 Dataset loaded: ${metadata.total_snps} SNPs, ${metadata.total_traits} traits`);
  logger.info(`🗓️ Last updated: ${metadata.last_updated}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("Connected via stdio transport");
  logger.info("🚀 Genomics MCP Server is ready");

  process.on("SIGINT", async () => {
    logger.info("Received SIGINT, shutting down gracefully... 👋");
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    logger.info("Received SIGTERM, shutting down gracefully... 👋");
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
