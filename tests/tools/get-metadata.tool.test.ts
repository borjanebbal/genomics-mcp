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

/** Extract plain text from the first content item of a callTool response. */
// biome-ignore lint/suspicious/noExplicitAny: SDK callTool return type has index signature [x:string]:unknown
function getText(result: any): string {
  const first = result.content[0];
  if (first?.type !== "text") throw new Error(`Expected text content, got: ${first?.type}`);
  return first.text as string;
}

// ---------------------------------------------------------------------------
// get_metadata tool integration tests
// ---------------------------------------------------------------------------

describe("get_metadata tool", () => {
  it("returns markdown metadata by default", async () => {
    const result = await harness.client.callTool({ name: "get_metadata", arguments: {} });
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text).toContain("Genomics MCP");
    expect(text).toContain("Total SNPs:");
    expect(text).toContain("Total traits:");
    expect(text).toContain("Last updated:");
  });

  it("reflects the correct SNP count", async () => {
    const result = await harness.client.callTool({ name: "get_metadata", arguments: {} });
    const text = getText(result);
    // Fixture has 2 SNPs
    expect(text).toContain("2");
  });

  it("returns JSON when response_format is json", async () => {
    const result = await harness.client.callTool({
      name: "get_metadata",
      arguments: { response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(parsed).toHaveProperty("total_snps");
    expect(parsed).toHaveProperty("total_traits");
    expect(parsed).toHaveProperty("last_updated");
    expect(parsed).toHaveProperty("version");
    expect(parsed.total_snps).toBe(2);
  });

  it("reports last_updated as the most recent date in the dataset", async () => {
    const result = await harness.client.callTool({
      name: "get_metadata",
      arguments: { response_format: "json" },
    });
    const parsed = JSON.parse(getText(result));
    // FIXTURE_SNP_B has the later date
    expect(parsed.last_updated).toBe("2025-03-20");
  });

  it("returns null for last_updated on an empty dataset", async () => {
    const emptyHarness = await makeTestHarness([]);
    try {
      const result = await emptyHarness.client.callTool({
        name: "get_metadata",
        arguments: { response_format: "json" },
      });
      const parsed = JSON.parse(getText(result));
      expect(parsed.last_updated).toBeNull();
      expect(parsed.total_snps).toBe(0);
    } finally {
      await emptyHarness.cleanup();
    }
  });

  it("includes server version in the response", async () => {
    const result = await harness.client.callTool({
      name: "get_metadata",
      arguments: { response_format: "json" },
    });
    const parsed = JSON.parse(getText(result));
    expect(typeof parsed.version).toBe("string");
    expect(parsed.version.length).toBeGreaterThan(0);
  });
});
