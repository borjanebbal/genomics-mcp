# Tool Reference

Complete documentation for all available MCP tools in the Genomics MCP Server.

## Available Tools

1. [search_by_trait](#search_by_trait) - Search SNPs by trait(s)
2. [get_snp_details](#get_snp_details) - Get detailed SNP information
3. [interpret_genotype](#interpret_genotype) - Interpret a genotype result
4. [list_traits](#list_traits) - List all available traits

---

## `search_by_trait`

Search for SNPs associated with one or more traits.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `traits` | `string[]` | **required** | Array of trait slugs (e.g., `["alzheimer_risk", "memory"]`) |
| `match_mode` | `"any" \| "all"` | `"any"` | "any" returns SNPs matching ANY trait; "all" requires ALL traits |
| `limit` | `number` | `20` | Maximum results to return (1-100) |
| `offset` | `number` | `0` | Pagination offset |
| `response_format` | `"markdown" \| "json"` | `"markdown"` | Output format |

### Example

```json
// Input
{
  "traits": ["alzheimer_risk"],
  "response_format": "markdown"
}

// Response (markdown)
"Found 2 SNPs matching traits: alzheimer_risk

## rs7412 (APOE)
- **Chromosome:** 19:44908822
- **Traits:** alzheimer_risk, cardiovascular_disease, longevity
- **Description:** APOE ε2 defining SNP - protective against Alzheimer's
..."
```

### Use Cases

- Find all genetic variants related to a specific health condition
- Search for SNPs affecting multiple traits simultaneously
- Discover genetic factors with `match_mode: "all"` for trait combinations

---

## `get_snp_details`

Get comprehensive information about a specific SNP.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rsid` | `string` | **required** | SNP identifier (e.g., "rs7412", "rs429358") |
| `response_format` | `"markdown" \| "json"` | `"markdown"` | Output format |

### Example (Markdown)

```json
// Input
{
  "rsid": "rs429358",
  "response_format": "markdown"
}

// Response
"# SNP Details: rs429358

## Basic Information
- **rsID:** rs429358
- **Genes:** APOE
- **Chromosome:** 19:44908684
- **Reference Allele:** T

## Associated Traits
- alzheimer_risk
- cardiovascular_disease
- cognitive_decline
..."
```

### Example (JSON)

```json
// Input
{
  "rsid": "rs429358",
  "response_format": "json"
}

// Response
{
  "rsid": "rs429358",
  "genes": ["APOE"],
  "traits": ["alzheimer_risk", "cardiovascular_disease", "cognitive_decline"],
  "description": "APOE ε4 defining SNP",
  "chromosome": "19",
  "position": 44908684,
  "reference_allele": "T",
  "effects_by_genotype": [
    {
      "genotype": "CC",
      "effect": "Two copies of APOE ε4 allele (ε4/ε4 genotype)",
      "risk_level": "increased",
      "population_frequency": 0.02
    },
    {
      "genotype": "CT",
      "effect": "One copy of APOE ε4 allele (ε3/ε4 genotype)",
      "risk_level": "increased",
      "population_frequency": 0.25
    }
  ],
  "sources": [
    {
      "title": "APOE and Alzheimer's disease: a major gene with semi-dominant inheritance",
      "url": "https://www.ncbi.nlm.nih.gov/pubmed/20831773",
      "study_type": "meta_analysis"
    }
  ],
  "last_updated": "2024-01-15"
}
```

### Use Cases

- Get complete information about a known SNP
- Retrieve genomic coordinates and reference alleles
- Access research citations and study types
- View all possible genotypes and their effects

---

## `interpret_genotype`

Interpret what a specific genotype means for a given SNP.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rsid` | `string` | **required** | SNP identifier (e.g., "rs7412") |
| `genotype` | `string` | **required** | Two-letter genotype (e.g., "AG", "TT", "CC") |
| `response_format` | `"markdown" \| "json"` | `"markdown"` | Output format |

### Example

```json
// Input
{
  "rsid": "rs429358",
  "genotype": "CT",
  "response_format": "markdown"
}

// Response (markdown)
"# Genotype Interpretation: rs429358 (CT)

## Your Genotype: CT
- **Risk Level:** increased
- **Effect:** One copy of APOE ε4 allele (ε3/ε4 genotype)
- **Impact:** Approximately 3-fold increased risk of Alzheimer's disease
- **Population Frequency:** ~25% of population
..."
```

### Notes

- **Allele order doesn't matter** - "AG" and "GA" are treated as the same genotype
- **Case-insensitive** - "ag", "AG", "Ag" all work
- **Validation** - Only valid nucleotides (A, C, G, T) are accepted

### Use Cases

- Interpret personal genomics test results
- Understand the impact of a specific genotype
- Get population frequency context
- Access risk level classifications

---

## `list_traits`

List all available traits with SNP counts.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | `string` | optional | Filter traits by name (case-insensitive) |
| `response_format` | `"markdown" \| "json"` | `"markdown"` | Output format |

### Example

```json
// Input
{
  "search": "alzheimer",
  "response_format": "markdown"
}

// Response (markdown)
"# Available Traits (filtered: alzheimer)

Found 1 matching trait:

- **alzheimer_risk** - 2 SNPs
"
```

### Use Cases

- Discover what traits are available in the dataset
- Find trait slugs for use with `search_by_trait`
- Filter traits by keyword to find relevant categories
- Count how many SNPs are associated with each trait

---

## Response Formats

All tools support two response formats:

### Markdown Format

- **Default format**
- Human-readable with headers, lists, and formatting
- Ideal for AI assistants presenting information to users
- Easy to read in chat interfaces

### JSON Format

- **Structured data format**
- Returns the raw data objects
- Ideal for programmatic processing
- Useful for building UIs or integrating with other systems

---

## Common Patterns

### Pagination

Use `limit` and `offset` with `search_by_trait`:

```json
// First page
{
  "traits": ["cognitive_function"],
  "limit": 10,
  "offset": 0
}

// Second page
{
  "traits": ["cognitive_function"],
  "limit": 10,
  "offset": 10
}
```

### Multi-Trait Search

Find SNPs affecting multiple traits:

```json
// SNPs related to EITHER trait (OR logic)
{
  "traits": ["alzheimer_risk", "memory"],
  "match_mode": "any"
}

// SNPs related to BOTH traits (AND logic)
{
  "traits": ["alzheimer_risk", "memory"],
  "match_mode": "all"
}
```

### Discovery Workflow

1. **List traits** to see what's available
2. **Search by trait** to find relevant SNPs
3. **Get SNP details** for specific variants of interest
4. **Interpret genotype** if you have personal genomics data

---

## Error Handling

### Invalid rsID

```json
{
  "error": "SNP rs999999 not found in our database. Our dataset contains 12 SNPs. Try using 'list_traits' to see what data is available."
}
```

### Invalid Genotype

```json
{
  "error": "Genotype 'XY' is invalid. Must be 2 nucleotides (A, C, G, T)."
}
```

### No Results

```json
{
  "error": "No SNPs found for traits: unknown_trait. Try using 'list_traits' to see available traits."
}
```

All error messages include helpful suggestions to guide users toward success.

---

## See Also

- [Quick Start Guide](QUICKSTART.md) - Quick reference card
- [Testing Guide](TESTING.md) - 15+ test cases with expected results
- [Architecture Guide](ARCHITECTURE.md) - Design patterns and technical details
- [Main README](../README.md) - Project overview
