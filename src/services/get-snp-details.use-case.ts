import type { ISnpRepository } from "../repositories/snp.repository.js";
import type { SnpRecord } from "../types/snp.js";
import { createSnpNotFoundMessage } from "../utils/errors.js";

export class GetSnpDetailsUseCase {
  constructor(private readonly repository: ISnpRepository) {}

  async execute(rsid: string): Promise<SnpRecord | { error: string }> {
    const snp = await this.repository.findByRsid(rsid);

    if (!snp) {
      const stats = await this.repository.getStats();
      return { error: createSnpNotFoundMessage(rsid, stats.total_snps) };
    }

    return snp;
  }
}
