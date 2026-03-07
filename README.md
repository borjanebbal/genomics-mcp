# Genomics MCP Server

An MCP (Model Context Protocol) server that provides programmatic access to SNP (Single Nucleotide Polymorphism) data by trait. Enables LLM-powered applications to query curated genomics information through a standardized interface.

## 🌟 Features

- 🧬 **Search SNPs by trait** - Find genetic variants associated with specific traits (e.g., "alzheimer_risk", "athletic_performance")
- 🔍 **Detailed SNP information** - Get comprehensive data including genomic coordinates, genes, effects, and research sources
- 🧪 **Genotype interpretation** - Understand what a specific genotype (e.g., "AG", "TT") means for a given SNP
- 📋 **Trait discovery** - List all available traits with SNP counts
- 📚 **Evidence-based** - All data includes source citations with URLs and study types
- ⚡ **Fast lookups** - In-memory indexing for sub-millisecond queries
- 🔄 **Database-ready** - Repository pattern enables easy migration from JSON to SQL/NoSQL

## 📦 Installation

```bash
# Install dependencies
bun install

# Run the server
bun start
```

## 🚀 Quick Start

### Testing with MCP Inspector

The MCP Inspector is the recommended way to test your server:

```bash
# Run the inspector (launches web UI)
bun run inspector
```

Then open the URL shown in your browser to interact with the tools.

### Integration with an MCP Client

Add this server to your MCP client's configuration. For example, in a `config.json`:

```json
{
  "mcpServers": {
    "genomics": {
      "command": "bun",
      "args": ["/absolute/path/to/genomics-mcp/src/index.ts"]
    }
  }
}
```

> **Note:** Replace `/absolute/path/to/genomics-mcp` with the actual path to your installation. Consult your MCP client's documentation for the exact config file location and format.

## 🛠️ Available Tools

The server provides 4 MCP tools for querying genomics data:

| Tool | Description |
|------|-------------|
| `search_by_trait` | Search for SNPs associated with one or more traits (supports "any"/"all" matching) |
| `get_snp_details` | Get comprehensive information about a specific SNP by rsID |
| `interpret_genotype` | Interpret what a specific genotype (e.g., "AG", "CT") means for a given SNP |
| `list_traits` | List all available traits with SNP counts (supports filtering) |

All tools support both **markdown** and **json** response formats.

**👉 See [Tool Reference](docs/TOOLS.md) for detailed documentation, parameters, and examples.**

## 📊 Dataset

The dataset covers a broad range of well-studied SNPs across multiple trait categories, including:

- **Neurological**: Alzheimer's risk (APOE), memory (BDNF), cognitive function (COMT), dopamine signaling (DRD2)
- **Behavioral**: Social behavior (OXTR), addiction risk (DRD2), nicotine dependence (CHRNA3)
- **Cardiovascular**: Heart disease risk (9p21), hypertension (AGT), HDL cholesterol (CETP), beta-blocker response (ADRB1)
- **Metabolic**: Folate metabolism (MTHFR), obesity risk (FTO), triglyceride levels (APOA5)
- **Pharmacogenomics**: Drug metabolism (CYP2C9, CYP2C19), warfarin sensitivity (VKORC1), fluorouracil toxicity (DPYD), hepatitis C treatment (IFNL3), abacavir hypersensitivity (HCP5)
- **Autoimmune & Immune**: Celiac disease (HLA-DQA1), rheumatoid arthritis (STAT4), autoimmune risk (PTPN22)
- **Inflammation**: IL-1β (IL1B), IL-10 (IL10), CRP levels (CRP)
- **Cancer & Developmental**: Detoxification (NQO1), melanoma risk (TYR), lung cancer risk (CHRNA3)
- **Eye & Vision**: Age-related macular degeneration (CFH, ARMS2)
- **Bone & Musculoskeletal**: Bone density (COL1A1, ESR1), osteoporosis risk
- **Iron & Liver**: Hemochromatosis (HFE), Gilbert syndrome (UGT1A1)
- **Physical Traits**: Eye color (OCA2), skin pigmentation (TYR, MC1R)
- **Athletic**: Sprint/endurance performance (ACTN3)
- **Nutrition & Metabolism**: Lactose intolerance (MCM6), vitamin D levels (GC, VDR)
- **Circadian & Sleep**: Circadian rhythm (CLOCK), sleep duration (DEC2)
- **Musculoskeletal & Uric Acid**: Gout risk (ABCG2), uric acid levels (SLC2A9)

All SNPs include:
- Genomic coordinates (chromosome, position)
- Associated genes and traits
- Genotype-specific effects with risk levels
- Population frequencies
- Research source citations with URLs

## 🏗️ Architecture

The server uses a layered architecture: **Tools → Use Cases → Repository → Data**, with in-memory indexing for sub-millisecond queries and a repository interface that makes database migration trivial.

**👉 See [Architecture Guide](docs/ARCHITECTURE.md) for diagrams, design patterns, data model, and technical details.**

## 🧪 Development

```bash
# Install dependencies
bun install

# Run in development mode (auto-reload)
bun run dev

# Run automated tests
bun test

# Type-check (optional — Bun runs TypeScript directly)
bun run build

# Format code
bun run format

# Lint code
bun run lint

# Lint + format in one pass (auto-fixes)
bun run check
```

A pre-commit hook runs `bun run check` on staged files and then `bun test` before every commit.

## 📝 Adding New SNPs

To add new SNPs to the dataset:

1. Edit `src/repositories/data/snps.json`
2. Follow the schema with required fields:
   - `rsid`, `genes`, `traits`, `description`, `chromosome`, `position`
   - `reference_allele`, `effects_by_genotype`, `sources`, `last_updated`
3. Restart the server — Zod validates on startup and will report any schema violations
4. If the SNP introduces a new trait slug, add it to the `TRAIT_CATEGORIES` map in `src/types/trait-categories.ts` so it appears under the correct category heading in `list_traits` output (unlisted slugs fall back to **Other**)
5. Optionally run `bun run build` to type-check

The data is validated against Zod schemas on load, so any schema violations will be caught immediately.

## 📚 Resources

- [Tool Reference](docs/TOOLS.md) — Complete tool documentation with examples
- [Testing Guide](docs/TESTING.md) — Automated test suite and manual MCP Inspector test cases
- [Architecture Guide](docs/ARCHITECTURE.md) — Design patterns and technical details
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

### Data Sources

The curated SNP dataset draws on the following authoritative genomics databases:

- [dbSNP](https://www.ncbi.nlm.nih.gov/snp/) — NCBI reference database for SNP identifiers, genomic coordinates, and allele frequencies
- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) — NCBI archive of clinically relevant genomic variants and their interpretations
- [SNPedia](https://www.snpedia.com) — Community-curated wiki of SNP associations and genotype effects
- [PharmGKB](https://www.pharmgkb.org) — Pharmacogenomics knowledge base for drug–gene interactions
- [CPIC](https://cpicpgx.org) — Clinical Pharmacogenetics Implementation Consortium guidelines
- [GnomAD](https://gnomad.broadinstitute.org) — Genome Aggregation Database for population allele frequencies

## 📄 License

MIT License - see LICENSE file for details

---

**Note:** This server provides educational genomics information only. It is not intended for clinical use or medical diagnosis. Always consult healthcare professionals for medical decisions.
