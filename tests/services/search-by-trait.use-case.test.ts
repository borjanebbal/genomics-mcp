import { describe, expect, it } from "bun:test";
import { SearchByTraitUseCase } from "../../src/services/search-by-trait.use-case.js";
import { makeMockRepo } from "./mock-repo.js";

describe("SearchByTraitUseCase", () => {
  it("returns SNP summaries matching the trait in 'any' mode", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a"], "any", 10, 0);
    expect(snps).toHaveLength(1);
    expect(snps[0]?.rsid).toBe("rs00001");
  });

  it("returns SNPs matching any trait in 'any' mode", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a", "trait_b"], "any", 10, 0);
    expect(snps).toHaveLength(2);
  });

  it("returns only SNPs matching all traits in 'all' mode", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a", "trait_shared"], "all", 10, 0);
    expect(snps).toHaveLength(1);
    expect(snps[0]?.rsid).toBe("rs00001");
  });

  it("returns no results when no SNP satisfies all traits in 'all' mode", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a", "trait_b"], "all", 10, 0);
    expect(snps).toHaveLength(0);
  });

  it("pagination: limit restricts the number of results returned", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps, pagination } = await useCase.execute(["trait_shared"], "any", 1, 0);
    expect(snps).toHaveLength(1);
    expect(pagination.total).toBe(2);
    expect(pagination.has_more).toBe(true);
  });

  it("pagination: offset skips earlier results", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps, pagination } = await useCase.execute(["trait_shared"], "any", 1, 1);
    expect(snps).toHaveLength(1);
    expect(pagination.offset).toBe(1);
    expect(pagination.has_more).toBe(false);
  });

  it("pagination: next_offset is set when has_more is true", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { pagination } = await useCase.execute(["trait_shared"], "any", 1, 0);
    expect(pagination.next_offset).toBe(1);
  });

  it("pagination: next_offset is undefined when has_more is false", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { pagination } = await useCase.execute(["trait_a"], "any", 10, 0);
    expect(pagination.has_more).toBe(false);
    expect(pagination.next_offset).toBeUndefined();
  });

  it("summary includes the correct genotype_count", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a"], "any", 10, 0);
    // SNP_A has 3 genotypes: AA, AG, GG
    expect(snps[0]?.genotype_count).toBe(3);
  });

  it("summary includes the correct source_count", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps } = await useCase.execute(["trait_a"], "any", 10, 0);
    expect(snps[0]?.source_count).toBe(1);
  });

  it("returns empty results with correct pagination for unknown trait", async () => {
    const useCase = new SearchByTraitUseCase(makeMockRepo());
    const { snps, pagination } = await useCase.execute(["no_such_trait"], "any", 10, 0);
    expect(snps).toHaveLength(0);
    expect(pagination.total).toBe(0);
    expect(pagination.has_more).toBe(false);
  });
});
