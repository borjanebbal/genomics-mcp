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
// interpret_genotype tool integration tests
// ---------------------------------------------------------------------------

describe("interpret_genotype tool", () => {
  it("returns a markdown interpretation for a known rsID and genotype", async () => {
    const result = await harness.client.callTool({
      name: "interpret_genotype",
      arguments: { rsid: "rs10001", genotype: "TT" },
    });
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text).toContain("rs10001");
    expect(text).toContain("TT");
  });

  it("returns JSON when response_format is json", async () => {
    const result = await harness.client.callTool({
      name: "interpret_genotype",
      arguments: { rsid: "rs10001", genotype: "TT", response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(parsed.rsid).toBe("rs10001");
    expect(parsed.genotype).toBe("TT");
    expect(parsed.normalized_genotype).toBe("TT");
    expect(parsed.effect).toBeDefined();
    expect(parsed.genes).toContain("APOE");
    expect(parsed.traits).toContain("alzheimer_risk");
  });

  it("normalises reversed allele order (CT → TC lookup)", async () => {
    // Fixture rs10001 only has "TC" defined, not "CT"
    const result = await harness.client.callTool({
      name: "interpret_genotype",
      arguments: { rsid: "rs10001", genotype: "CT", response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    // Canonical sort: C < T, so normalised form is "CT" which after sort becomes "TC" (T > C)
    expect(parsed.effect).toBeDefined();
  });

  it("returns an error for an unknown rsID", async () => {
    const result = await harness.client.callTool({
      name: "interpret_genotype",
      arguments: { rsid: "rs99999", genotype: "AA" },
    });
    expect(result.isError).toBe(true);
    const text = getText(result);
    expect(text.toLowerCase()).toContain("rs99999");
  });

  it("returns an error for a genotype not present in the SNP data", async () => {
    const result = await harness.client.callTool({
      name: "interpret_genotype",
      arguments: { rsid: "rs10001", genotype: "AA" },
    });
    expect(result.isError).toBe(true);
  });

  it("input schema enforces lowercase rs prefix (RS10001 is rejected)", async () => {
    // The Zod input schema requires /^rs\d+$/; uppercase is rejected before it
    // reaches the service layer — this is expected tool behaviour.
    const result = await harness.client.callTool({
      name: "interpret_genotype",
      arguments: { rsid: "RS10001", genotype: "CC" },
    });
    expect(result.isError).toBe(true);
  });
});
