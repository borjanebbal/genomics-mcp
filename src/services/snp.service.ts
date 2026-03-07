import { VERSION } from "../constants.js";
import type { ISnpRepository } from "../repositories/snp.repository.js";
import type { MatchMode, PaginationMetadata } from "../types/common.js";
import type {
  DatasetMetadata,
  GenotypeInterpretation,
  SnpRecord,
  SnpSummary,
  TraitSummary,
} from "../types/snp.js";
import { GetSnpDetailsUseCase } from "./get-snp-details.use-case.js";
import { InterpretGenotypeUseCase } from "./interpret-genotype.use-case.js";
import { SearchByTraitUseCase } from "./search-by-trait.use-case.js";

export class SnpService {
  private readonly searchByTraitUseCase: SearchByTraitUseCase;
  private readonly getSnpDetailsUseCase: GetSnpDetailsUseCase;
  private readonly interpretGenotypeUseCase: InterpretGenotypeUseCase;

  constructor(private readonly repository: ISnpRepository) {
    this.searchByTraitUseCase = new SearchByTraitUseCase(repository);
    this.getSnpDetailsUseCase = new GetSnpDetailsUseCase(repository);
    this.interpretGenotypeUseCase = new InterpretGenotypeUseCase(repository);
  }

  async searchByTraits(
    traits: string[],
    matchMode: MatchMode,
    limit: number,
    offset: number
  ): Promise<{ snps: SnpSummary[]; pagination: PaginationMetadata }> {
    return this.searchByTraitUseCase.execute(traits, matchMode, limit, offset);
  }

  async getSnpDetails(rsid: string): Promise<SnpRecord | { error: string }> {
    return this.getSnpDetailsUseCase.execute(rsid);
  }

  async interpretGenotype(
    rsid: string,
    genotype: string
  ): Promise<GenotypeInterpretation | { error: string }> {
    return this.interpretGenotypeUseCase.execute(rsid, genotype);
  }

  async listTraits(
    search?: string,
    limit?: number,
    offset?: number
  ): Promise<{ traits: TraitSummary[]; pagination: PaginationMetadata }> {
    // Fetch the total count without pagination, then apply limit/offset.
    const allMatching = await this.repository.listTraits(search);
    const total = allMatching.length;
    const resolvedOffset = offset ?? 0;
    const page =
      limit !== undefined
        ? allMatching.slice(resolvedOffset, resolvedOffset + limit)
        : allMatching.slice(resolvedOffset);
    const hasMore = resolvedOffset + page.length < total;
    const pagination: PaginationMetadata = {
      total,
      count: page.length,
      offset: resolvedOffset,
      has_more: hasMore,
      next_offset: hasMore ? resolvedOffset + page.length : undefined,
    };
    return { traits: page, pagination };
  }

  async getMetadata(): Promise<DatasetMetadata> {
    const stats = await this.repository.getStats();
    return { ...stats, version: VERSION };
  }
}
