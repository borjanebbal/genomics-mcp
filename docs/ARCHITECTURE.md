# Architecture Documentation

## Overview

This document describes the technical architecture, design patterns, and implementation details of the Genomics MCP Server.

## Tech Stack

- **Runtime:** Bun (TypeScript execution without compilation)
- **Language:** TypeScript (strict mode)
- **Protocol:** Model Context Protocol (MCP) v1.x
- **Validation:** Zod 4.x for runtime schema validation
- **Linter/Formatter:** Biome

## Architectural Layers

```
┌──────────────────────────────────────┐
│           MCP Client (LLM)           │
└────────────────┬─────────────────────┘
                 │ stdio | HTTP (Streamable HTTP)
┌────────────────┴─────────────────────┐
│           MCP Server (Bun)            │
├──────────────────────────────────────┤
│  Tools: search, details, interpret,  │
│         list_traits, get_metadata     │
├──────────────────────────────────────┤
│    Use Cases (business logic)         │
├──────────────────────────────────────┤
│   ISnpRepository (interface)         │
├──────────────────────────────────────┤
│  JsonSnpRepository (in-memory index) │
└────────────────┬─────────────────────┘
                 │
  ┌──────────────┴──────────────────┐
  │ src/repositories/data/snps.json │
  └─────────────────────────────────┘
```

### Layer Responsibilities

1. **Transport Layer** - stdio or HTTP (Streamable HTTP) transport, selectable via `--transport` CLI flag
2. **MCP Server Layer** - Tool registration and request routing
3. **Tools Layer** - MCP tool definitions with Zod input validation
4. **Service Layer** - Business logic organized as use cases
5. **Repository Layer** - Data access abstraction
6. **Data Layer** - JSON storage (easily replaceable with DB)

## Key Design Patterns

### 1. Repository Pattern

**Purpose:** Abstract data access to enable easy migration from JSON to database without changing business logic.

```typescript
// Interface - defines contract
interface ISnpRepository {
  initialize(): Promise<void>;
  findByTraits(traits: string[], matchMode: MatchMode): Promise<SnpRecord[]>;
  findByRsid(rsid: string): Promise<SnpRecord | null>;
  listTraits(search?: string): Promise<TraitSummary[]>;
  getStats(): Promise<DatasetStats>;
  /** Extension point — not called by any current service or tool. */
  getAllSnps(): Promise<SnpRecord[]>;
}

// JSON implementation
class JsonSnpRepository implements ISnpRepository {
  // In-memory indexes for fast lookups
  private snps: SnpRecord[];
  private rsidIndex: Map<string, number>;
  private traitIndex: Map<string, Set<number>>;
}

// Future: PostgreSQL implementation
class PostgresSnpRepository implements ISnpRepository {
  // Same interface, different implementation
}
```

**Benefits:**
- Zero changes to tools/services when swapping data sources
- Easy to test with mock implementations
- Database migration becomes a 1-day task instead of 1-week refactor

### 2. Use-Case Pattern

**Purpose:** Each business operation is an isolated, testable class.

```typescript
// Each use case is self-contained
class SearchByTraitUseCase {
  execute(params: SearchParams): SearchResult {
    // Single responsibility
  }
}

class InterpretGenotypeUseCase {
  execute(rsid: string, genotype: string): Interpretation {
    // Different concern, different class
  }
}

// Facade creates use cases from the repository
class SnpService {
  private readonly searchByTrait: SearchByTraitUseCase;
  private readonly interpretUseCase: InterpretGenotypeUseCase;

  constructor(repository: ISnpRepository) {
    // Use cases are created internally — the facade owns their lifecycle
    this.searchByTrait = new SearchByTraitUseCase(repository);
    this.interpretUseCase = new InterpretGenotypeUseCase(repository);
  }
}
```

**Benefits:**
- Easy to test individual use cases in isolation
- Clear separation of concerns
- New features don't touch existing code

### 3. In-Memory Indexing

**Purpose:** Fast lookups without requiring a database for small datasets.

```typescript
class JsonSnpRepository {
  private rsidIndex: Map<string, number>;       // O(1) rsID lookups
  private traitIndex: Map<string, Set<number>>; // O(k) trait queries
}
```

**Performance:**
- Small dataset (< 100 SNPs): < 1ms queries
- 1,000 SNPs: < 50ms queries
- Only need DB when > 10K SNPs OR need persistence/concurrency

### 4. Genotype Normalization

**Purpose:** Handle allele order ambiguity (AG = GA) and case variations consistently at two layers.

**Runtime layer** — `normalizeGenotype()` in `src/utils/genotype.ts` sorts alleles alphabetically before every lookup:

```typescript
function normalizeGenotype(genotype: string): string {
  const upper = genotype.toUpperCase();
  // Alphabetical sort ensures AG and GA both become AG
  const alleles = upper.split("").sort();
  return alleles.join("");
}
```

**Parse-time layer** — `SnpRecordSchema` applies a `.transform()` on `effects_by_genotype` keys at Zod parse time (server startup), so keys in the seed data are canonicalised once. If two raw keys normalise to the same canonical key (e.g. `"AG"` + `"GA"`), the transform rejects the entire record:

```typescript
effects_by_genotype: z
  .record(...)
  .refine((effects) => Object.keys(effects).length > 0, {
    message: "At least one genotype effect is required",
  })
  .transform((effects, ctx) => {
    const canonical: Record<string, GenotypeEffect> = {};
    for (const [key, value] of Object.entries(effects)) {
      const canonicalKey = normalizeGenotype(key);
      if (canonicalKey in canonical) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate canonical genotype key "${canonicalKey}"...`,
        });
        return z.NEVER;  // abort — data would be silently lost
      }
      canonical[canonicalKey] = value;
    }
    return canonical;
  }),
```

**Why this matters:**
- Seed data may use either allele order (e.g. `"CG"` vs `"GC"`)
- Users may type `"ag"`, `"AG"`, `"GA"`, or `"ga"`
- Both layers guarantee all variations match the same canonical key

### 5. Dual Response Formats

**Purpose:** Support both human-readable and programmatic consumption.

```typescript
type ResponseFormat = "markdown" | "json";

// Markdown: for AI assistants and human readers
// JSON: for programmatic processing or UI integration
```

### 6. Centralised Trait Display Names

**Purpose:** Guarantee consistent, human-readable display names for all trait slugs regardless of how the slug is cased in the seed data.

`TRAIT_DISPLAY_NAMES` in `src/types/trait-categories.ts` is a slug → display-name map (~80 entries). `slugToDisplayName()` consults this map first and falls back to auto-generated Title Case only for unknown slugs.

```typescript
// Priority order:
// 1. TRAIT_DISPLAY_NAMES map  →  authoritative, hand-curated
// 2. Title-Case fallback       →  for slugs added before the map is updated
function slugToDisplayName(slug: string): string {
  return TRAIT_DISPLAY_NAMES[slug] ?? toTitleCase(slug.replace(/_/g, " "));
}
```

**Benefits:**
- Consistent display names across all tools and formatters
- No risk of mismatched capitalisation between different SNP records
- Easy to maintain — add new slugs to `TRAIT_CATEGORIES` and `TRAIT_DISPLAY_NAMES` together

---

## Key Architectural Decisions

### Why Bun over Node.js?

1. **Native TypeScript execution** - No compilation step needed
2. **Faster startup** - < 500ms to load and index data
3. **Built-in APIs** - `import.meta.dir` for path resolution
4. **Better DX** - Simpler tooling, fewer dependencies

### Why Zod for Validation?

1. **Runtime + compile-time safety** - Validates JSON data at runtime, generates TypeScript types
2. **Self-documenting** - Schema IS the documentation
3. **Excellent error messages** - Pinpoints exactly what's invalid
4. **Type inference** - `z.infer<typeof schema>` keeps types in sync

```typescript
// Schema defines structure
const SnpRecordSchema = z.object({
  rsid: z.string().regex(/^rs\d+$/),
  genes: z.array(z.string()).min(1),
  // ...
});

// Type is automatically derived
type SnpRecord = z.infer<typeof SnpRecordSchema>;
```

### Why stderr for Logging?

**Critical MCP requirement:** stdout is reserved for JSON-RPC protocol messages. This applies equally when using stdio transport. When using HTTP transport, logs are still written to stderr so that stdout remains clean for any shell piping use cases.

```typescript
// ❌ WRONG - breaks MCP protocol
console.log("Starting server...");

// ✅ CORRECT - logs to stderr
process.stderr.write("Starting server...\n");
```

Any output to stdout will corrupt the MCP communication channel (stdio mode) or pollute shell output (HTTP mode).

### Why In-Memory Indexes?

For datasets < 10K records:
- **Faster than SQLite** - No serialization overhead
- **Simpler than Redis** - No external dependencies
- **Easier to debug** - Plain JavaScript objects

Migration to DB is trivial thanks to repository pattern.

## Data Model

### SNP Record Structure

```typescript
interface SnpRecord {
  rsid: string;                        // Unique identifier (e.g., "rs429358")
  genes: string[];                     // Associated genes (e.g., ["APOE"])
  traits: string[];                    // Associated trait slugs
  description: string;                 // Human-readable summary
  chromosome: string;                  // Genomic location (e.g., "19")
  position: number;                    // Base pair position
  reference_allele: string;            // Reference genome allele
  risk_allele?: string;                // Risk allele (optional)
  effects_by_genotype: {               // Per-genotype effects (keyed by genotype)
    [genotype: string]: GenotypeEffect;
  };
  sources: Source[];                   // Research citations
  population_frequency?: PopulationFrequency; // Population data (optional)
  last_updated: string;                // ISO date
}

interface GenotypeEffect {
  summary: string;                     // Short description (e.g., "3x increased Alzheimer's risk")
  detail: string;                      // Detailed explanation
  risk_level: RiskLevel;               // informational | protective | increased_risk | high_risk
}
```

## Error Handling Strategy

### 1. Validation Errors (User Input)

The MCP SDK validates tool inputs against the Zod schemas automatically — tools never see invalid data:

```typescript
// Defined in tool-inputs.schemas.ts
const GetSnpDetailsInputSchema = z.object({
  rsid: z.string().regex(RSID_PATTERN, "Must be a valid rsID format (e.g., 'rs111', 'rs12345')"),
  response_format: z.enum(["markdown", "json"]).default("markdown"),
});

// The MCP SDK calls .parse() on the input before the handler runs.
// If validation fails, the SDK returns a Zod error to the client — the
// handler is never invoked.
```

### 2. Not Found Errors

Use-case classes return `{ error: string }` and the tool layer converts this to an `isError: true` MCP response:

```typescript
// In get-snp-details.use-case.ts
if (!snp) {
  const stats = await this.repository.getStats();
  return { error: createSnpNotFoundMessage(rsid, stats.total_snps) };
}

// createSnpNotFoundMessage() produces:
// "SNP rs999999 not found in our database. Our dataset contains N SNPs.
//  Try using 'list_traits' to see what data is available."
```

### 3. System Errors

Each tool wraps its handler in a `try/catch` that returns a generic MCP error:

```typescript
// In every *.tool.ts
catch (error) {
  return {
    content: [{ type: "text", text: `Error retrieving SNP details: ${error instanceof Error ? error.message : String(error)}` }],
    isError: true,
  };
}
```

## Performance Characteristics

| Operation | Time Complexity | Typical Latency |
|-----------|----------------|-----------------|
| Find by rsID | O(1) | < 1ms |
| Search by single trait | O(1) | < 1ms |
| Search by N traits (any) | O(k×n) where k = avg SNPs/trait | < 5ms |
| Search by N traits (all) | O(k×n) + O(m log m) for set intersection | < 10ms |
| List all traits | O(t) where t = trait count | < 1ms |

## Known Limitations

### 1. Strand Orientation

- Assumes all genotypes are on the same strand
- Real genomics data may need complement/reverse-complement
- **Future:** Add `strand` field and orientation utilities

### 2. Duplicate rsID Handling

- Duplicate rsIDs in the JSON dataset cause a hard `Error` to be thrown inside `buildIndexes()` during `initialize()`
- The error propagates out of `initialize()`, is caught and re-thrown with context, and causes `process.exit(1)` at server startup
- The dataset is rejected entirely — no SNP from a file with duplicate rsIDs will be served
- **Resolution:** Remove or de-duplicate the offending entries in `snps.json` and restart

### 3. Limited Search Capabilities

- Only exact trait slug matching (case-insensitive)
- No fuzzy search ("alzheimers" won't find "alzheimer_risk")
- No partial matching ("cardio" won't find "cardiovascular_disease")
- **Future:** Add fuzzy search library (Fuse.js or similar)

### 4. No Caching

- Every query rebuilds result sets
- For frequently accessed SNPs, could add LRU cache
- Probably not needed until 1000+ SNPs
