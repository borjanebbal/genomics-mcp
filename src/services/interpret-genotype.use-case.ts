import type { ISnpRepository } from "../repositories/snp.repository.js";
import type { GenotypeInterpretation } from "../types/snp.js";
import { createGenotypeNotFoundMessage, createSnpNotFoundMessage } from "../utils/errors.js";
import { normalizeGenotype } from "../utils/genotype.js";

export class InterpretGenotypeUseCase {
  constructor(private readonly repository: ISnpRepository) {}

  async execute(
    rsid: string,
    genotype: string
  ): Promise<GenotypeInterpretation | { error: string }> {
    const snp = await this.repository.findByRsid(rsid);

    if (!snp) {
      const stats = await this.repository.getStats();
      return { error: createSnpNotFoundMessage(rsid, stats.total_snps) };
    }

    const normalizedGenotype = normalizeGenotype(genotype);

    const effect = snp.effects_by_genotype[normalizedGenotype];

    if (!effect) {
      const availableGenotypes = Object.keys(snp.effects_by_genotype).sort();
      return {
        error: createGenotypeNotFoundMessage(rsid, genotype, availableGenotypes),
      };
    }

    return {
      rsid: snp.rsid,
      genotype,
      normalized_genotype: normalizedGenotype,
      effect,
      genes: snp.genes,
      traits: snp.traits,
    };
  }
}
