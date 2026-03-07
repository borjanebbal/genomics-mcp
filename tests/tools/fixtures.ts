/**
 * Shared fixtures and helpers for tool integration tests.
 *
 * Each test file imports `makeTestHarness()` which:
 *   1. Writes a temp JSON fixture to disk
 *   2. Initialises a real JsonSnpRepository
 *   3. Wires up a real SnpService
 *   4. Registers all tools on a real McpServer
 *   5. Connects server ↔ client via InMemoryTransport
 *
 * Tests then call `client.callTool(...)` to exercise the full MCP
 * protocol path, including input-schema validation and response shaping.
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { JsonSnpRepository } from "../../src/repositories/snp.json-repository.js";
import { SnpService } from "../../src/services/snp.service.js";
import { registerTools } from "../../src/tools/register-all.js";

// ---------------------------------------------------------------------------
// Minimal SNP fixtures — deliberately kept small so tests stay fast.
// ---------------------------------------------------------------------------

export const FIXTURE_SNP_A = {
  rsid: "rs10001",
  genes: ["APOE"],
  traits: ["alzheimer_risk", "memory"],
  description: "APOE variant associated with Alzheimer risk",
  chromosome: "19",
  position: 44908684,
  reference_allele: "T",
  effects_by_genotype: {
    TT: { summary: "No risk alleles", detail: "Baseline risk.", risk_level: "protective" },
    TC: { summary: "One risk allele", detail: "Moderate risk.", risk_level: "increased_risk" },
    CC: { summary: "Two risk alleles", detail: "Elevated risk.", risk_level: "high_risk" },
  },
  sources: [{ name: "ClinVar", url: "https://example.com/rs10001", study_type: "database" }],
  last_updated: "2025-01-15",
};

export const FIXTURE_SNP_B = {
  rsid: "rs10002",
  genes: ["BRCA1"],
  traits: ["breast_cancer_risk"],
  description: "BRCA1 variant linked to breast cancer risk",
  chromosome: "17",
  position: 43094077,
  reference_allele: "G",
  effects_by_genotype: {
    GG: { summary: "Wild type", detail: "No elevated risk.", risk_level: "informational" },
    GA: { summary: "Heterozygous carrier", detail: "Elevated risk.", risk_level: "increased_risk" },
  },
  sources: [{ name: "GWAS", url: "https://example.com/rs10002", study_type: "gwas" }],
  last_updated: "2025-03-20",
};

export const ALL_FIXTURES = [FIXTURE_SNP_A, FIXTURE_SNP_B];

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

export interface TestHarness {
  client: Client;
  server: McpServer;
  snpService: SnpService;
  cleanup: () => Promise<void>;
}

export async function makeTestHarness(snps: unknown[] = ALL_FIXTURES): Promise<TestHarness> {
  // Write fixture to a temp file
  const tmpDir = await mkdtemp(join(tmpdir(), "genomics-tool-test-"));
  const filePath = join(tmpDir, "snps.json");
  await writeFile(filePath, JSON.stringify(snps));

  // Real repository + service
  const repository = new JsonSnpRepository(filePath);
  await repository.initialize();
  const snpService = new SnpService(repository);

  // Real MCP server with all tools registered
  const server = new McpServer({ name: "genomics-mcp-test", version: "0.0.0-test" });
  registerTools(server, snpService);

  // Wire up via in-memory transport
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  const client = new Client({ name: "test-client", version: "0.0.0-test" }, { capabilities: {} });
  await client.connect(clientTransport);

  return {
    client,
    server,
    snpService,
    cleanup: async () => {
      await client.close();
      await server.close();
      await rm(tmpDir, { recursive: true, force: true });
    },
  };
}
