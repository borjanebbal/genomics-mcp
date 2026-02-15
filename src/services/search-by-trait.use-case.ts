import type { ISnpRepository } from "../repositories/snp.repository.js";
import type { SnpRecord, SnpSummary } from "../types/snp.js";
import type { MatchMode, PaginationMetadata } from "../types/common.js";

export class SearchByTraitUseCase {
  constructor(private readonly repository: ISnpRepository) {}

  async execute(
    traits: string[],
    matchMode: MatchMode,
    limit: number,
    offset: number
  ): Promise<{ snps: SnpSummary[]; pagination: PaginationMetadata }> {
    const allMatches = await this.repository.findByTraits(traits, matchMode);

    const summaries = allMatches.map((snp) => this.toSnpSummary(snp));

    const total = summaries.length;
    const paginated = summaries.slice(offset, offset + limit);

    const pagination: PaginationMetadata = {
      total,
      count: paginated.length,
      offset,
      has_more: offset + paginated.length < total,
      next_offset:
        offset + paginated.length < total ? offset + paginated.length : undefined,
    };

    return { snps: paginated, pagination };
  }

  private toSnpSummary(snp: SnpRecord): SnpSummary {
    return {
      rsid: snp.rsid,
      genes: snp.genes,
      traits: snp.traits,
      description: snp.description,
      source_count: snp.sources.length,
      genotype_count: Object.keys(snp.effects_by_genotype).length,
    };
  }
}
