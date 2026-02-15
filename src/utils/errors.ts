export function createSnpNotFoundMessage(rsid: string, totalSnps: number): string {
  return `SNP ${rsid} not found in our database. Our dataset contains ${totalSnps} SNPs. Try using 'list_traits' to see what data is available.`;
}

export function createGenotypeNotFoundMessage(
  rsid: string,
  genotype: string,
  availableGenotypes: string[]
): string {
  return `Genotype '${genotype}' not found for ${rsid}. Available genotypes: ${availableGenotypes.join(", ")}. Make sure you're using the correct alleles.`;
}
