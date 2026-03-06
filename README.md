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

The current dataset includes **12 well-studied SNPs** across **34 traits**, covering:

- **Neurological**: Alzheimer's risk (APOE), memory (BDNF), cognitive function (COMT)
- **Behavioral**: Social behavior (OXTR), addiction risk (DRD2), nicotine dependence (CHRNA3)
- **Athletic**: Sprint/endurance performance (ACTN3)
- **Metabolic**: Folate metabolism (MTHFR), triglyceride levels (APOA5)
- **Cardiovascular**: Heart disease risk (9p21), inflammation (IL6)

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
4. Optionally run `bun run build` to type-check

The data is validated against Zod schemas on load, so any schema violations will be caught immediately.

## 📚 Resources

- [Tool Reference](docs/TOOLS.md) — Complete tool documentation with examples
- [Testing Guide](docs/TESTING.md) — Automated test suite and manual MCP Inspector test cases
- [Architecture Guide](docs/ARCHITECTURE.md) — Design patterns and technical details
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [SNPedia](https://www.snpedia.com) - Source of SNP information
- [dbSNP](https://www.ncbi.nlm.nih.gov/snp/) - NCBI SNP database

## 📄 License

MIT License - see LICENSE file for details

---

**Note:** This server provides educational genomics information only. It is not intended for clinical use or medical diagnosis. Always consult healthcare professionals for medical decisions.
