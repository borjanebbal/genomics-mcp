import { describe, expect, it } from "bun:test";
import { VERSION } from "../../src/constants.js";
import { SnpService } from "../../src/services/snp.service.js";
import { ALL_SNPS, SNP_A, SNP_B, makeMockRepo } from "./mock-repo.js";

// ---------------------------------------------------------------------------
// SnpService.getMetadata()
// ---------------------------------------------------------------------------

describe("SnpService.getMetadata", () => {
  it("includes a non-empty version string", async () => {
    const service = new SnpService(makeMockRepo());
    const metadata = await service.getMetadata();
    expect(typeof metadata.version).toBe("string");
    expect(metadata.version.length).toBeGreaterThan(0);
  });

  it("version equals the VERSION constant from constants.ts", async () => {
    const service = new SnpService(makeMockRepo());
    const metadata = await service.getMetadata();
    expect(metadata.version).toBe(VERSION);
  });

  it("includes total_snps from the repository", async () => {
    const service = new SnpService(makeMockRepo());
    const metadata = await service.getMetadata();
    expect(metadata.total_snps).toBe(ALL_SNPS.length);
  });

  it("includes total_traits from the repository", async () => {
    const service = new SnpService(makeMockRepo());
    const metadata = await service.getMetadata();
    // trait_a, trait_shared, trait_b = 3 unique traits across SNP_A and SNP_B
    const expectedTraitCount = new Set(ALL_SNPS.flatMap((s) => s.traits)).size;
    expect(metadata.total_traits).toBe(expectedTraitCount);
  });

  it("includes last_updated from the repository", async () => {
    const service = new SnpService(makeMockRepo());
    const metadata = await service.getMetadata();
    expect(typeof metadata.last_updated).toBe("string");
    expect(metadata.last_updated.length).toBeGreaterThan(0);
  });

  it("returns the correct shape (total_snps, total_traits, last_updated, version)", async () => {
    const service = new SnpService(makeMockRepo());
    const metadata = await service.getMetadata();
    expect(metadata).toMatchObject({
      total_snps: expect.any(Number),
      total_traits: expect.any(Number),
      last_updated: expect.any(String),
      version: expect.any(String),
    });
  });

  it("enriches DatasetStats — the mock repo does not provide a version field", async () => {
    const repo = makeMockRepo();
    // Confirm the raw repo stats have no version field
    const stats = await repo.getStats();
    expect("version" in stats).toBe(false);

    // But the service wraps it to produce version
    const service = new SnpService(repo);
    const metadata = await service.getMetadata();
    expect("version" in metadata).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SnpService.listTraits()
// ---------------------------------------------------------------------------

describe("SnpService.listTraits", () => {
  it("delegates to the repository and returns all traits when no search is given", async () => {
    const service = new SnpService(makeMockRepo());
    const traits = await service.listTraits();
    const slugs = traits.map((t) => t.slug);
    expect(slugs).toContain("trait_a");
    expect(slugs).toContain("trait_b");
    expect(slugs).toContain("trait_shared");
  });

  it("filters results when a search string is passed", async () => {
    const service = new SnpService(makeMockRepo());
    const traits = await service.listTraits("trait_a");
    expect(traits).toHaveLength(1);
    expect(traits[0]?.slug).toBe("trait_a");
  });

  it("returns an empty array when search matches nothing", async () => {
    const service = new SnpService(makeMockRepo());
    const traits = await service.listTraits("zzz_no_match");
    expect(traits).toHaveLength(0);
  });

  it("returns snp_count per trait", async () => {
    const service = new SnpService(makeMockRepo());
    const traits = await service.listTraits();
    const shared = traits.find((t) => t.slug === "trait_shared");
    expect(shared?.snp_count).toBe(2); // both SNP_A and SNP_B share this trait
  });
});

// ---------------------------------------------------------------------------
// SnpService with a single SNP (edge case)
// ---------------------------------------------------------------------------

describe("SnpService.getMetadata — single SNP dataset", () => {
  it("reports total_snps = 1", async () => {
    const service = new SnpService(makeMockRepo([SNP_A]));
    const metadata = await service.getMetadata();
    expect(metadata.total_snps).toBe(1);
  });

  it("still includes a version field", async () => {
    const service = new SnpService(makeMockRepo([SNP_B]));
    const metadata = await service.getMetadata();
    expect(metadata.version).toBe(VERSION);
  });
});
