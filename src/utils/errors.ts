export function createSnpNotFoundMessage(rsid: string, totalSnps: number): string {
  return `SNP ${rsid} not found in our database. Our dataset contains ${totalSnps} SNPs. Try using 'list_traits' to see what data is available.`;
}

export function createGenotypeNotFoundMessage(
  rsid: string,
  genotype: string,
  availableGenotypes: string[]
): string {
  const available = availableGenotypes.length > 0 ? availableGenotypes.join(", ") : "(none)";
  return `Genotype '${genotype}' not found for ${rsid}. Available genotypes: ${available}. Make sure you're using the correct alleles.`;
}
