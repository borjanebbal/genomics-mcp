export function normalizeGenotype(genotype: string): string {
  const upper = genotype.toUpperCase();
  const alleles = upper.split("").sort();
  return alleles.join("");
}
