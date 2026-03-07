import type { PaginationMetadata } from "../types/common.js";
import type {
  DatasetMetadata,
  GenotypeInterpretation,
  SnpRecord,
  SnpSummary,
  TraitSummary,
} from "../types/snp.js";

export function formatSearchResultsMarkdown(
  snps: SnpSummary[],
  pagination: PaginationMetadata,
  searchedTraits: string[]
): string {
  const lines: string[] = [];

  lines.push(`# SNP Search Results: ${searchedTraits.join(", ")}`);
  lines.push("");
  lines.push(
    `Found **${pagination.total}** SNPs (showing ${pagination.count}, offset: ${pagination.offset})`
  );
  lines.push("");

  if (snps.length === 0) {
    lines.push("No SNPs found matching the search criteria.");
    return lines.join("\n");
  }

  for (const snp of snps) {
    lines.push(`## ${snp.rsid}`);
    lines.push("");
    lines.push(`**Description:** ${snp.description}`);
    lines.push(`**Genes:** ${snp.genes.join(", ")}`);
    lines.push(`**Traits:** ${snp.traits.join(", ")}`);
    lines.push(`**Genotypes available:** ${snp.genotype_count}`);
    lines.push(`**Sources:** ${snp.source_count}`);
    lines.push("");
  }

  if (pagination.has_more) {
    lines.push(
      `---\n*More results available. Use offset=${pagination.next_offset} to see the next page.*`
    );
  }

  return lines.join("\n");
}

export function formatSnpDetailsMarkdown(snp: SnpRecord): string {
  const lines: string[] = [];

  lines.push(`# ${snp.rsid}`);
  lines.push("");
  lines.push(`**Description:** ${snp.description}`);
  lines.push("");

  lines.push("## Genomic Location");
  lines.push(`- **Chromosome:** ${snp.chromosome}`);
  lines.push(`- **Position:** ${snp.position.toLocaleString("en-US")}`);
  lines.push(`- **Reference allele:** ${snp.reference_allele}`);
  if (snp.risk_allele) {
    lines.push(`- **Risk allele:** ${snp.risk_allele}`);
  }
  lines.push("");

  lines.push("## Associated Information");
  lines.push(`- **Genes:** ${snp.genes.join(", ")}`);
  lines.push(`- **Traits:** ${snp.traits.join(", ")}`);
  lines.push("");

  if (snp.population_frequency) {
    lines.push("## Population Frequency");
    lines.push(`- **Global MAF:** ${(snp.population_frequency.global_maf * 100).toFixed(1)}%`);
    if (snp.population_frequency.populations) {
      for (const [population, freq] of Object.entries(snp.population_frequency.populations)) {
        lines.push(`- **${population}:** ${(freq * 100).toFixed(1)}%`);
      }
    }
    lines.push("");
  }

  lines.push("## Genotype Effects");
  lines.push("");
  for (const [genotype, effect] of Object.entries(snp.effects_by_genotype)) {
    lines.push(`### ${genotype}`);
    lines.push(`**${effect.summary}** (${effect.risk_level})`);
    lines.push(effect.detail);
    lines.push("");
  }

  lines.push("## Sources");
  for (const source of snp.sources) {
    lines.push(`- **${source.name}** (${source.study_type}): ${source.url}`);
  }
  lines.push("");

  lines.push(`*Last updated: ${snp.last_updated}*`);

  return lines.join("\n");
}

export function formatGenotypeInterpretationMarkdown(
  interpretation: GenotypeInterpretation
): string {
  const lines: string[] = [];

  lines.push(`# Genotype Interpretation: ${interpretation.rsid}`);
  lines.push("");
  lines.push(`**Your genotype:** ${interpretation.genotype}`);
  if (interpretation.genotype !== interpretation.normalized_genotype) {
    lines.push(`*(Normalized to: ${interpretation.normalized_genotype})*`);
  }
  lines.push("");

  lines.push(`**Genes:** ${interpretation.genes.join(", ")}`);
  lines.push(`**Traits:** ${interpretation.traits.join(", ")}`);
  lines.push("");

  lines.push("## Effect");
  lines.push(`**${interpretation.effect.summary}** (${interpretation.effect.risk_level})`);
  lines.push("");
  lines.push(interpretation.effect.detail);

  return lines.join("\n");
}

export function formatTraitListMarkdown(
  traits: TraitSummary[],
  pagination?: PaginationMetadata
): string {
  const lines: string[] = [];

  lines.push("# Available Traits");
  lines.push("");

  if (pagination) {
    lines.push(
      `Total: **${pagination.total}** traits (showing ${pagination.count}, offset: ${pagination.offset})`
    );
  } else {
    lines.push(`Total: **${traits.length}** traits`);
  }
  lines.push("");

  const categorized = new Map<string, TraitSummary[]>();
  const uncategorized: TraitSummary[] = [];

  for (const trait of traits) {
    if (trait.category) {
      if (!categorized.has(trait.category)) {
        categorized.set(trait.category, []);
      }
      categorized.get(trait.category)!.push(trait);
    } else {
      uncategorized.push(trait);
    }
  }

  for (const [category, categoryTraits] of categorized.entries()) {
    lines.push(`## ${category}`);
    for (const trait of categoryTraits) {
      lines.push(`- **${trait.slug}** (${trait.display_name}) - ${trait.snp_count} SNPs`);
    }
    lines.push("");
  }

  if (uncategorized.length > 0) {
    if (categorized.size > 0) {
      lines.push("## Other");
    }
    for (const trait of uncategorized) {
      lines.push(`- **${trait.slug}** (${trait.display_name}) - ${trait.snp_count} SNPs`);
    }
  }

  if (pagination?.has_more) {
    lines.push("");
    lines.push(
      `---\n*More traits available. Use offset=${pagination.next_offset} to see the next page.*`
    );
  }

  return lines.join("\n");
}

export function formatMetadataMarkdown(metadata: DatasetMetadata): string {
  const lines: string[] = [];

  lines.push("# Genomics MCP — Dataset Metadata");
  lines.push("");
  lines.push(`**Server version:** ${metadata.version}`);
  lines.push(`**Total SNPs:** ${metadata.total_snps.toLocaleString("en-US")}`);
  lines.push(`**Total traits:** ${metadata.total_traits.toLocaleString("en-US")}`);
  lines.push(`**Last updated:** ${metadata.last_updated ?? "unknown"}`);

  return lines.join("\n");
}

export function truncateIfNeeded(content: string, limit: number): string {
  if (content.length <= limit) {
    return content;
  }

  // Build the notice first so we know its exact length, then slice to fit within limit.
  const omitted = content.length - (limit - 1); // lower bound; refined below
  const notice = `\n\n---\n\n**[Content truncated due to size limit. ${omitted} characters omitted. Try filtering or using pagination to see more results.]**`;
  const sliceEnd = Math.max(0, limit - notice.length);
  const truncated = content.slice(0, sliceEnd);
  const finalNotice = `\n\n---\n\n**[Content truncated due to size limit. ${content.length - truncated.length} characters omitted. Try filtering or using pagination to see more results.]**`;
  return truncated + finalNotice;
}
