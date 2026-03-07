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
// get_snp_details tool integration tests
// ---------------------------------------------------------------------------

describe("get_snp_details tool", () => {
  it("returns markdown SNP details for a known rsID", async () => {
    const result = await harness.client.callTool({
      name: "get_snp_details",
      arguments: { rsid: "rs10001" },
    });
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text).toContain("rs10001");
    expect(text).toContain("APOE");
    expect(text).toContain("alzheimer_risk");
  });

  it("returns JSON when response_format is json", async () => {
    const result = await harness.client.callTool({
      name: "get_snp_details",
      arguments: { rsid: "rs10001", response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(parsed.rsid).toBe("rs10001");
    expect(parsed.genes).toContain("APOE");
    expect(parsed.traits).toContain("alzheimer_risk");
    expect(parsed.effects_by_genotype).toBeDefined();
  });

  it("returns an error response for an unknown rsID", async () => {
    const result = await harness.client.callTool({
      name: "get_snp_details",
      arguments: { rsid: "rs99999" },
    });
    expect(result.isError).toBe(true);
    const text = getText(result);
    expect(text.toLowerCase()).toContain("rs99999");
  });

  it("input schema enforces lowercase rs prefix (RS10001 is rejected)", async () => {
    // The Zod input schema requires /^rs\d+$/; uppercase is rejected before it
    // reaches the service layer — this is expected tool behaviour.
    const result = await harness.client.callTool({
      name: "get_snp_details",
      arguments: { rsid: "RS10001" },
    });
    expect(result.isError).toBe(true);
  });

  it("includes genotype effects in the response", async () => {
    const result = await harness.client.callTool({
      name: "get_snp_details",
      arguments: { rsid: "rs10001", response_format: "json" },
    });
    const parsed = JSON.parse(getText(result));
    expect(Object.keys(parsed.effects_by_genotype).length).toBeGreaterThan(0);
  });

  it("includes sources in the response", async () => {
    const result = await harness.client.callTool({
      name: "get_snp_details",
      arguments: { rsid: "rs10001", response_format: "json" },
    });
    const parsed = JSON.parse(getText(result));
    expect(Array.isArray(parsed.sources)).toBe(true);
    expect(parsed.sources.length).toBeGreaterThan(0);
  });
});
