import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { TestHarness } from "./fixtures.js";
import { makeTestHarness } from "./fixtures.js";

let harness: TestHarness;

beforeEach(async () => {
  harness = await makeTestHarness();
});

afterEach(async () => {
  await harness.cleanup();
});

// biome-ignore lint/suspicious/noExplicitAny: SDK callTool return type has index signature [x:string]:unknown
function getText(result: any): string {
  const first = result.content[0];
  if (first?.type !== "text") throw new Error(`Expected text content, got: ${first?.type}`);
  return first.text as string;
}

// ---------------------------------------------------------------------------
// search_by_trait tool integration tests
// ---------------------------------------------------------------------------

describe("search_by_trait tool", () => {
  it("returns markdown results for a known trait", async () => {
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: { traits: ["alzheimer_risk"] },
    });
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text).toContain("SNP Search Results");
    expect(text).toContain("rs10001");
  });

  it("returns JSON when response_format is json", async () => {
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: { traits: ["alzheimer_risk"], response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(Array.isArray(parsed.snps)).toBe(true);
    expect(parsed.snps[0].rsid).toBe("rs10001");
    expect(parsed.pagination).toBeDefined();
  });

  it("returns a not-found message when no SNPs match", async () => {
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: { traits: ["nonexistent_trait"] },
    });
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text.toLowerCase()).toContain("no snps found");
  });

  it("match_mode=any returns union of results", async () => {
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: {
        traits: ["alzheimer_risk", "breast_cancer_risk"],
        match_mode: "any",
        response_format: "json",
      },
    });
    const parsed = JSON.parse(getText(result));
    // Both FIXTURE_SNP_A and FIXTURE_SNP_B should be returned
    expect(parsed.snps).toHaveLength(2);
  });

  it("match_mode=all returns empty text message when no SNP satisfies all traits", async () => {
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: {
        traits: ["alzheimer_risk", "breast_cancer_risk"],
        match_mode: "all",
      },
    });
    // Default format (markdown): returns plain-text "No SNPs found" message
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text.toLowerCase()).toContain("no snps found");
  });

  it("match_mode=all with response_format=json returns structured empty object", async () => {
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: {
        traits: ["alzheimer_risk", "breast_cancer_risk"],
        match_mode: "all",
        response_format: "json",
      },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(Array.isArray(parsed.snps)).toBe(true);
    expect(parsed.snps).toHaveLength(0);
    expect(parsed.pagination).toBeDefined();
    expect(parsed.pagination.total).toBe(0);
    expect(parsed.pagination.has_more).toBe(false);
  });

  it("match_mode=all returns SNP when it has all required traits", async () => {
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: {
        traits: ["alzheimer_risk", "memory"],
        match_mode: "all",
        response_format: "json",
      },
    });
    const parsed = JSON.parse(getText(result));
    // FIXTURE_SNP_A has both alzheimer_risk and memory
    expect(parsed.snps).toHaveLength(1);
    expect(parsed.snps[0].rsid).toBe("rs10001");
  });

  it("respects limit for pagination", async () => {
    // Search for a trait that has 1 result to test pagination plumbing
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: {
        traits: ["alzheimer_risk", "breast_cancer_risk"],
        match_mode: "any",
        limit: 1,
        response_format: "json",
      },
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.snps).toHaveLength(1);
    expect(parsed.pagination.total).toBe(2);
    expect(parsed.pagination.has_more).toBe(true);
  });

  it("respects offset for pagination", async () => {
    const firstPage = await harness.client.callTool({
      name: "search_by_trait",
      arguments: {
        traits: ["alzheimer_risk", "breast_cancer_risk"],
        match_mode: "any",
        limit: 1,
        offset: 0,
        response_format: "json",
      },
    });
    const secondPage = await harness.client.callTool({
      name: "search_by_trait",
      arguments: {
        traits: ["alzheimer_risk", "breast_cancer_risk"],
        match_mode: "any",
        limit: 1,
        offset: 1,
        response_format: "json",
      },
    });
    const first = JSON.parse(getText(firstPage));
    const second = JSON.parse(getText(secondPage));
    expect(first.snps[0].rsid).not.toBe(second.snps[0].rsid);
  });

  it("each result summary includes required fields", async () => {
    const result = await harness.client.callTool({
      name: "search_by_trait",
      arguments: { traits: ["alzheimer_risk"], response_format: "json" },
    });
    const parsed = JSON.parse(getText(result));
    const snp = parsed.snps[0];
    expect(snp).toHaveProperty("rsid");
    expect(snp).toHaveProperty("genes");
    expect(snp).toHaveProperty("traits");
    expect(snp).toHaveProperty("description");
    expect(snp).toHaveProperty("genotype_count");
    expect(snp).toHaveProperty("source_count");
  });
});
