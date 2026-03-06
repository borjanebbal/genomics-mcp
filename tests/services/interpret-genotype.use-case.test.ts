import { describe, expect, it } from "bun:test";
import { InterpretGenotypeUseCase } from "../../src/services/interpret-genotype.use-case.js";
import { makeMockRepo } from "./mock-repo.js";

describe("InterpretGenotypeUseCase", () => {
  it("returns a GenotypeInterpretation for a known rsID + genotype", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "AG");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.rsid).toBe("rs00001");
      expect(result.normalized_genotype).toBe("AG");
    }
  });

  it("normalises the input genotype before lookup (GA → AG)", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "GA");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.normalized_genotype).toBe("AG");
      // Raw input preserved on the interpretation object
      expect(result.genotype).toBe("GA");
    }
  });

  it("normalises lowercase input (ag → AG)", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "ag");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.normalized_genotype).toBe("AG");
    }
  });

  it("returns an error when rsID is not found", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs99999", "AG");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("rs99999");
    }
  });

  it("returns an error when the genotype is not in effects_by_genotype", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "TT");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("TT");
    }
  });

  it("error for unknown genotype includes available genotypes", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "TT");
    if ("error" in result) {
      expect(result.error).toMatch(/AA|AG|GG/);
    }
  });

  it("includes genes and traits on the interpretation result", async () => {
    const useCase = new InterpretGenotypeUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001", "AA");
    if (!("error" in result)) {
      expect(result.genes).toContain("GENE1");
      expect(result.traits).toContain("trait_a");
    }
  });
});
