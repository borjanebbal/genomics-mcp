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
// list_traits tool integration tests
// ---------------------------------------------------------------------------

describe("list_traits tool", () => {
  it("returns markdown trait list by default", async () => {
    const result = await harness.client.callTool({ name: "list_traits", arguments: {} });
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text).toContain("Available Traits");
    expect(text).toContain("alzheimer_risk");
    expect(text).toContain("breast_cancer_risk");
    expect(text).toContain("memory");
  });

  it("returns JSON when response_format is json", async () => {
    const result = await harness.client.callTool({
      name: "list_traits",
      arguments: { response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(Array.isArray(parsed.traits)).toBe(true);
    expect(parsed.pagination).toBeDefined();
    expect(parsed.pagination.total).toBe(3); // alzheimer_risk, memory, breast_cancer_risk
  });

  it("each trait item has slug, display_name, and snp_count", async () => {
    const result = await harness.client.callTool({
      name: "list_traits",
      arguments: { response_format: "json" },
    });
    const parsed = JSON.parse(getText(result));
    const alzheimer = parsed.traits.find((t: { slug: string }) => t.slug === "alzheimer_risk");
    expect(alzheimer).toBeDefined();
    expect(typeof alzheimer.display_name).toBe("string");
    expect(alzheimer.snp_count).toBe(1);
  });

  it("filters traits by search string (case-insensitive)", async () => {
    const result = await harness.client.callTool({
      name: "list_traits",
      arguments: { search: "ALZHEIMER", response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(parsed.traits).toHaveLength(1);
    expect(parsed.traits[0].slug).toBe("alzheimer_risk");
  });

  it("returns empty message when search matches nothing", async () => {
    const result = await harness.client.callTool({
      name: "list_traits",
      arguments: { search: "zzz_nonexistent" },
    });
    // Default format (markdown): returns plain-text message containing the search term
    expect(result.isError).toBeFalsy();
    const text = getText(result);
    expect(text).toContain("zzz_nonexistent");
  });

  it("returns structured JSON empty object when search matches nothing and format is json", async () => {
    const result = await harness.client.callTool({
      name: "list_traits",
      arguments: { search: "zzz_nonexistent", response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(Array.isArray(parsed.traits)).toBe(true);
    expect(parsed.traits).toHaveLength(0);
    expect(parsed.pagination).toBeDefined();
    expect(parsed.pagination.total).toBe(0);
    expect(parsed.pagination.has_more).toBe(false);
  });

  it("respects limit for pagination", async () => {
    const result = await harness.client.callTool({
      name: "list_traits",
      arguments: { limit: 1, response_format: "json" },
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(getText(result));
    expect(parsed.traits).toHaveLength(1);
    expect(parsed.pagination.has_more).toBe(true);
    expect(parsed.pagination.next_offset).toBe(1);
  });

  it("respects offset for pagination", async () => {
    const firstPage = await harness.client.callTool({
      name: "list_traits",
      arguments: { limit: 1, offset: 0, response_format: "json" },
    });
    const secondPage = await harness.client.callTool({
      name: "list_traits",
      arguments: { limit: 1, offset: 1, response_format: "json" },
    });
    const first = JSON.parse(getText(firstPage));
    const second = JSON.parse(getText(secondPage));
    // The two pages should contain different traits
    expect(first.traits[0].slug).not.toBe(second.traits[0].slug);
  });

  it("pagination total reflects total matching count, not page size", async () => {
    const result = await harness.client.callTool({
      name: "list_traits",
      arguments: { limit: 1, response_format: "json" },
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.pagination.total).toBe(3);
    expect(parsed.pagination.count).toBe(1);
  });
});
