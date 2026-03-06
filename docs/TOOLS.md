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
"# rs429358

**Description:** APOE ε4 allele defining SNP, strongest genetic risk factor for late-onset Alzheimer's

## Genomic Location
- **Chromosome:** 19
- **Position:** 44,908,822
- **Reference allele:** T
- **Risk allele:** C

## Associated Information
- **Genes:** APOE
- **Traits:** alzheimer_risk, cognitive_decline, cardiovascular_disease
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
  "traits": ["alzheimer_risk", "cognitive_decline", "cardiovascular_disease"],
  "description": "APOE ε4 allele defining SNP, strongest genetic risk factor for late-onset Alzheimer's",
  "chromosome": "19",
  "position": 44908822,
  "reference_allele": "T",
  "risk_allele": "C",
  "effects_by_genotype": {
    "TT": {
      "summary": "APOE ε3/ε3 - Standard Alzheimer's risk",
      "detail": "Most common genotype. Standard population risk for Alzheimer's disease. No increased or decreased risk from APOE gene.",
      "risk_level": "informational"
    },
    "CT": {
      "summary": "APOE ε3/ε4 - 3x increased Alzheimer's risk",
      "detail": "One copy of ε4 allele increases Alzheimer's risk approximately 3-fold. Age of onset typically 5-10 years earlier. Consider preventive lifestyle interventions.",
      "risk_level": "increased_risk"
    },
    "CC": {
      "summary": "APOE ε4/ε4 - 8-12x increased Alzheimer's risk",
      "detail": "Two copies of ε4 allele dramatically increase Alzheimer's risk (8-12 fold). Up to 50% lifetime risk. Earlier age of onset (60s vs 70s). Strong recommendation for cognitive health monitoring.",
      "risk_level": "high_risk"
    }
  },
  "sources": [
    {
      "name": "SNPedia",
      "url": "https://www.snpedia.com/index.php/Rs429358",
      "study_type": "database"
    },
    {
      "name": "Alzheimer's Association",
      "url": "https://www.alz.org/alzheimers-dementia/what-is-alzheimers/causes-and-risk-factors/genetics",
      "study_type": "review"
    }
  ],
  "population_frequency": {
    "global_maf": 0.14
  },
  "last_updated": "2025-01-20"
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
"# Genotype Interpretation: rs429358

**Your genotype:** CT

**Genes:** APOE
**Traits:** alzheimer_risk, cognitive_decline, cardiovascular_disease

## Effect
**APOE ε3/ε4 - 3x increased Alzheimer's risk** (increased_risk)

One copy of ε4 allele increases Alzheimer's risk approximately 3-fold. Age of onset typically 5-10 years earlier. Consider preventive lifestyle interventions."
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

Errors are returned as standard MCP tool responses with `isError: true` and a plain-text message inside the `content` array.

### Invalid rsID

```json
{
  "content": [
    {
      "type": "text",
      "text": "SNP rs999999 not found in our database. Our dataset contains 12 SNPs. Try using 'list_traits' to see what data is available."
    }
  ],
  "isError": true
}
```

### Invalid Genotype

```json
{
  "content": [
    {
      "type": "text",
      "text": "Genotype 'XY' not found for rs429358. Available genotypes: TT, CT, CC. Make sure you're using the correct alleles."
    }
  ],
  "isError": true
}
```

### No Results (`search_by_trait`)

When `search_by_trait` finds no matching SNPs, it returns a plain informational message — **not** an error response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "No SNPs found for traits: unknown_trait. Try using 'list_traits' to see available traits."
    }
  ]
}
```

All error messages include helpful suggestions to guide users toward success.
