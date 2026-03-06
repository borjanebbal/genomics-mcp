import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonSnpRepository } from "../../src/repositories/snp.json-repository.js";

// ---------------------------------------------------------------------------
// Minimal SNP fixtures for test data files
// ---------------------------------------------------------------------------

const SNP_A = {
  rsid: "rs00001",
  genes: ["GENE1"],
  traits: ["trait_a", "trait_shared"],
  description: "Test SNP A",
  chromosome: "1",
  position: 1000,
  reference_allele: "A",
  effects_by_genotype: {
    AA: { summary: "Homozygous A", detail: "Detail A.", risk_level: "protective" },
    AG: { summary: "Heterozygous", detail: "Detail AG.", risk_level: "informational" },
  },
  sources: [{ name: "TestDB", url: "https://example.com/rs00001", study_type: "database" }],
  last_updated: "2025-01-01",
};

const SNP_B = {
  rsid: "rs00002",
  genes: ["GENE2"],
  traits: ["trait_b", "trait_shared"],
  description: "Test SNP B",
  chromosome: "2",
  position: 2000,
  reference_allele: "C",
  effects_by_genotype: {
    CC: { summary: "Homozygous C", detail: "Detail C.", risk_level: "informational" },
    CT: { summary: "Heterozygous", detail: "Detail CT.", risk_level: "increased_risk" },
  },
  sources: [{ name: "TestDB", url: "https://example.com/rs00002", study_type: "database" }],
  last_updated: "2025-06-01",
};

// SNP_C uses a trait slug that IS in TRAIT_CATEGORIES — used to test category population.
const SNP_C = {
  rsid: "rs00003",
  genes: ["GENE3"],
  traits: ["memory"],
  description: "Test SNP C",
  chromosome: "3",
  position: 3000,
  reference_allele: "G",
  effects_by_genotype: {
    GG: { summary: "Homozygous G", detail: "Detail G.", risk_level: "informational" },
  },
  sources: [{ name: "TestDB", url: "https://example.com/rs00003", study_type: "database" }],
  last_updated: "2025-03-01",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

async function createRepoFromData(snps: unknown[]): Promise<JsonSnpRepository> {
  const filePath = join(tmpDir, `snps-${Date.now()}.json`);
  await writeFile(filePath, JSON.stringify(snps));
  const repo = new JsonSnpRepository(filePath);
  await repo.initialize();
  return repo;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "genomics-test-"));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// initialize()
// ---------------------------------------------------------------------------

describe("JsonSnpRepository.initialize", () => {
  it("loads SNPs successfully from a valid JSON file", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const all = await repo.getAllSnps();
    expect(all).toHaveLength(2);
  });

  it("calling initialize() twice is idempotent", async () => {
    const filePath = join(tmpDir, "snps.json");
    await writeFile(filePath, JSON.stringify([SNP_A]));
    const repo = new JsonSnpRepository(filePath);
    await repo.initialize();
    await repo.initialize(); // second call should be a no-op
    const all = await repo.getAllSnps();
    expect(all).toHaveLength(1);
  });

  it("throws when the file does not exist", async () => {
    const repo = new JsonSnpRepository("/does/not/exist.json");
    await expect(repo.initialize()).rejects.toThrow();
  });

  it("throws when the JSON is syntactically invalid", async () => {
    const filePath = join(tmpDir, "bad.json");
    await writeFile(filePath, "{ not valid json }");
    const repo = new JsonSnpRepository(filePath);
    await expect(repo.initialize()).rejects.toThrow();
  });

  it("throws when the JSON does not satisfy the Zod schema", async () => {
    const filePath = join(tmpDir, "invalid.json");
    await writeFile(filePath, JSON.stringify([{ rsid: "bad" }]));
    const repo = new JsonSnpRepository(filePath);
    await expect(repo.initialize()).rejects.toThrow();
  });

  it("throws on duplicate rsIDs and prevents startup", async () => {
    const filePath = join(tmpDir, "dupes.json");
    await writeFile(filePath, JSON.stringify([SNP_A, SNP_A]));
    const repo = new JsonSnpRepository(filePath);
    await expect(repo.initialize()).rejects.toThrow(/[Dd]uplicate/);
  });
});

// ---------------------------------------------------------------------------
// findByRsid()
// ---------------------------------------------------------------------------

describe("JsonSnpRepository.findByRsid", () => {
  it("returns the correct SNP for a known rsID", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const snp = await repo.findByRsid("rs00001");
    expect(snp).not.toBeNull();
    expect(snp?.rsid).toBe("rs00001");
  });

  it("returns null for an unknown rsID", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const snp = await repo.findByRsid("rs99999");
    expect(snp).toBeNull();
  });

  it("is case-insensitive (RS00001 finds rs00001)", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const snp = await repo.findByRsid("RS00001");
    expect(snp?.rsid).toBe("rs00001");
  });
});

// ---------------------------------------------------------------------------
// findByTraits() — "any" mode
// ---------------------------------------------------------------------------

describe("JsonSnpRepository.findByTraits — any mode", () => {
  it("returns SNPs that match any of the requested traits", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const results = await repo.findByTraits(["trait_a", "trait_b"], "any");
    expect(results).toHaveLength(2);
  });

  it("returns only the SNPs that have the trait", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const results = await repo.findByTraits(["trait_a"], "any");
    expect(results).toHaveLength(1);
    expect(results[0]?.rsid).toBe("rs00001");
  });

  it("returns all SNPs that share a common trait", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const results = await repo.findByTraits(["trait_shared"], "any");
    expect(results).toHaveLength(2);
  });

  it("returns an empty array for a trait that no SNP has", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const results = await repo.findByTraits(["unknown_trait"], "any");
    expect(results).toHaveLength(0);
  });

  it("returns an empty array for an empty traits list", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const results = await repo.findByTraits([], "any");
    expect(results).toHaveLength(0);
  });

  it("is case-insensitive (TRAIT_A matches trait_a)", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const results = await repo.findByTraits(["TRAIT_A"], "any");
    expect(results).toHaveLength(1);
  });

  it("does not return duplicate SNPs when matched by multiple traits", async () => {
    const repo = await createRepoFromData([SNP_A]);
    // SNP_A has both trait_a and trait_shared
    const results = await repo.findByTraits(["trait_a", "trait_shared"], "any");
    expect(results).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// findByTraits() — "all" mode
// ---------------------------------------------------------------------------

describe("JsonSnpRepository.findByTraits — all mode", () => {
  it("returns only SNPs that have ALL requested traits", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    // Only SNP_A has both trait_a and trait_shared
    const results = await repo.findByTraits(["trait_a", "trait_shared"], "all");
    expect(results).toHaveLength(1);
    expect(results[0]?.rsid).toBe("rs00001");
  });

  it("returns SNPs that appear in the intersection of multiple traits", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    // Both SNPs have trait_shared but only SNP_A has trait_a
    const results = await repo.findByTraits(["trait_shared", "trait_a"], "all");
    expect(results).toHaveLength(1);
  });

  it("returns empty when no SNP satisfies all traits", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    // No SNP has both trait_a AND trait_b
    const results = await repo.findByTraits(["trait_a", "trait_b"], "all");
    expect(results).toHaveLength(0);
  });

  it("returns empty immediately when a required trait is unknown", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const results = await repo.findByTraits(["trait_a", "nonexistent"], "all");
    expect(results).toHaveLength(0);
  });

  it("does not mutate the internal trait index across calls", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    await repo.findByTraits(["trait_shared"], "all");
    // Second call should still return both SNPs for trait_shared in "any" mode
    const results = await repo.findByTraits(["trait_shared"], "any");
    expect(results).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// listTraits()
// ---------------------------------------------------------------------------

describe("JsonSnpRepository.listTraits", () => {
  it("returns all unique traits sorted alphabetically", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const traits = await repo.listTraits();
    const slugs = traits.map((t) => t.slug);
    expect(slugs).toContain("trait_a");
    expect(slugs).toContain("trait_b");
    expect(slugs).toContain("trait_shared");
    expect(slugs).toEqual([...slugs].sort());
  });

  it("reports the correct snp_count per trait", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const traits = await repo.listTraits();
    const shared = traits.find((t) => t.slug === "trait_shared");
    expect(shared?.snp_count).toBe(2);
    const traitA = traits.find((t) => t.slug === "trait_a");
    expect(traitA?.snp_count).toBe(1);
  });

  it("filters by search string (case-insensitive)", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const traits = await repo.listTraits("TRAIT_A");
    expect(traits).toHaveLength(1);
    expect(traits[0]?.slug).toBe("trait_a");
  });

  it("returns empty array when search matches nothing", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const traits = await repo.listTraits("zzz_no_match");
    expect(traits).toHaveLength(0);
  });

  it("generates a capitalised display_name from the slug", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const traits = await repo.listTraits();
    const traitA = traits.find((t) => t.slug === "trait_a");
    // "trait_a" → "Trait A"
    expect(traitA?.display_name).toBe("Trait A");
  });

  it("sets category to undefined for slugs not in TRAIT_CATEGORIES", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const traits = await repo.listTraits();
    const traitA = traits.find((t) => t.slug === "trait_a");
    expect(traitA?.category).toBeUndefined();
  });

  it("populates category for slugs present in TRAIT_CATEGORIES", async () => {
    const repo = await createRepoFromData([SNP_C]);
    const traits = await repo.listTraits();
    const memory = traits.find((t) => t.slug === "memory");
    expect(memory?.category).toBe("Neurological");
  });
});

// ---------------------------------------------------------------------------
// getMetadata()
// ---------------------------------------------------------------------------

describe("JsonSnpRepository.getMetadata", () => {
  it("returns the correct total_snps count", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const meta = await repo.getMetadata();
    expect(meta.total_snps).toBe(2);
  });

  it("returns the correct total_traits count", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const meta = await repo.getMetadata();
    // trait_a, trait_shared, trait_b = 3 unique traits
    expect(meta.total_traits).toBe(3);
  });

  it("returns the most recent last_updated date across all SNPs", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const meta = await repo.getMetadata();
    expect(meta.last_updated).toBe("2025-06-01"); // SNP_B is more recent
  });

  it("returns version string", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const meta = await repo.getMetadata();
    expect(typeof meta.version).toBe("string");
    expect(meta.version.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// getAllSnps()
// ---------------------------------------------------------------------------

describe("JsonSnpRepository.getAllSnps", () => {
  it("returns all loaded SNPs", async () => {
    const repo = await createRepoFromData([SNP_A, SNP_B]);
    const all = await repo.getAllSnps();
    expect(all).toHaveLength(2);
  });

  it("returns a copy — mutating the result does not affect the repository", async () => {
    const repo = await createRepoFromData([SNP_A]);
    const copy1 = await repo.getAllSnps();
    copy1.pop();
    const copy2 = await repo.getAllSnps();
    expect(copy2).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ensureInitialized guard
// ---------------------------------------------------------------------------

describe("JsonSnpRepository — uninitialized guard", () => {
  it("throws when findByRsid is called before initialize()", async () => {
    const repo = new JsonSnpRepository("/any/path.json");
    await expect(repo.findByRsid("rs00001")).rejects.toThrow(/[Ii]nitializ/);
  });

  it("throws when findByTraits is called before initialize()", async () => {
    const repo = new JsonSnpRepository("/any/path.json");
    await expect(repo.findByTraits(["t"], "any")).rejects.toThrow(/[Ii]nitializ/);
  });

  it("throws when listTraits is called before initialize()", async () => {
    const repo = new JsonSnpRepository("/any/path.json");
    await expect(repo.listTraits()).rejects.toThrow(/[Ii]nitializ/);
  });

  it("throws when getMetadata is called before initialize()", async () => {
    const repo = new JsonSnpRepository("/any/path.json");
    await expect(repo.getMetadata()).rejects.toThrow(/[Ii]nitializ/);
  });
});
