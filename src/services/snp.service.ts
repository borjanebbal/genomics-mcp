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
  private readonly searchByTrait: SearchByTraitUseCase;
  private readonly getSnpDetailsUseCase: GetSnpDetailsUseCase;
  private readonly interpretGenotypeUseCase: InterpretGenotypeUseCase;

  constructor(private readonly repository: ISnpRepository) {
    this.searchByTrait = new SearchByTraitUseCase(repository);
    this.getSnpDetailsUseCase = new GetSnpDetailsUseCase(repository);
    this.interpretGenotypeUseCase = new InterpretGenotypeUseCase(repository);
  }

  async searchByTraits(
    traits: string[],
    matchMode: MatchMode,
    limit: number,
    offset: number
  ): Promise<{ snps: SnpSummary[]; pagination: PaginationMetadata }> {
    return this.searchByTrait.execute(traits, matchMode, limit, offset);
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

  async listTraits(search?: string): Promise<TraitSummary[]> {
    return this.repository.listTraits(search);
  }

  async getMetadata(): Promise<DatasetMetadata> {
    return this.repository.getMetadata();
  }
}
