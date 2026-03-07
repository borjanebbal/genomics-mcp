# AGENTS.md — AI Agent Instructions

## Project Overview

This is an MCP (Model Context Protocol) server written in TypeScript that exposes genomics SNP data to LLM clients. It is a **read-only** data service — no mutations, no user accounts, no authentication.

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **MCP SDK:** `@modelcontextprotocol/sdk` v1.x — use `server.registerTool(name, { inputSchema: Schema.shape }, handler)` API
- **Validation:** Zod 3.x
- **Linter/Formatter:** Biome (`biome.json` at project root)
- **Build:** Bun runs TypeScript directly — `tsc` is available for type-checking only (`tsconfig.json` at project root)

## Key Architecture Rules

1. **stdout is sacred.** All log output MUST go to stderr. Use `createLogger()` from `src/utils/logger.ts` — never use `console.log()` or `console.error()` directly.
2. **Repository Pattern.** All data access goes through `ISnpRepository`. Never read JSON files directly in services or tools.
3. **Use-case classes.** Business logic lives in `src/services/*.use-case.ts`. The `SnpService` facade delegates to them. **Exception:** `listTraits()` and `getMetadata()` on `SnpService` call the repository directly (no use-case class) because they contain no business logic — `getMetadata()` enriches the repository's `getStats()` result with the application `VERSION`.
4. **One tool per file.** Each MCP tool is defined in `src/tools/*.tool.ts`. The barrel `register-all.ts` wires them together.
5. **Zod schemas are the source of truth** for both runtime validation and TypeScript types (via `z.infer`).

## File Layout

```
genomics-mcp/
├── package.json                          # Scripts, dependencies (Bun runtime)
├── tsconfig.json                         # Strict mode, noEmit, excludes tests/
├── biome.json                            # Linter + formatter config
├── bun.lock                              # Lockfile
├── AGENTS.md                             # AI agent instructions (this file)
├── README.md                             # Project overview and quick-start
├── LICENSE                               # MIT
│
├── docs/
│   ├── ARCHITECTURE.md                   # Design decisions, data flow, known limitations
│   ├── TESTING.md                        # Automated + manual testing guide
│   └── TOOLS.md                          # MCP tool reference (inputs, outputs, examples)
│
├── src/
│   ├── index.ts                          # Entry point — wires server, repository, service, tools
│   ├── constants.ts                      # Shared limits, patterns, defaults
│   │
│   ├── types/                            # TypeScript types (derived from Zod schemas via z.infer)
│   │   ├── common.ts                     # PaginationMetadata, MatchMode, ResponseFormat, RiskLevel, StudyType
│   │   ├── snp.ts                        # SnpRecord, SnpSummary, TraitSummary, DatasetStats, DatasetMetadata, GenotypeInterpretation
│   │   └── trait-categories.ts           # TraitCategory const/type, TRAIT_CATEGORIES slug→category map
│   │
│   ├── schemas/                          # Zod schemas — source of truth for validation and types
│   │   ├── snp.schemas.ts                # Domain schemas — validates seed data on startup
│   │   └── tool-inputs.schemas.ts        # MCP tool input schemas
│   │
│   ├── repositories/                     # Data access layer
│   │   ├── snp.repository.ts             # ISnpRepository interface
│   │   ├── snp.json-repository.ts        # JSON/in-memory implementation
│   │   └── data/
│   │       └── snps.json                 # Seed data (validated by Zod on startup)
│   │
│   ├── services/                         # Business logic
│   │   ├── snp.service.ts                # Facade — delegates to use-case classes
│   │   ├── get-snp-details.use-case.ts
│   │   ├── interpret-genotype.use-case.ts
│   │   └── search-by-trait.use-case.ts
│   │
│   ├── tools/                            # MCP tool registrations (one tool per file)
│   │   ├── register-all.ts               # Barrel — imports and registers all tools
│   │   ├── get-snp-details.tool.ts
│   │   ├── interpret-genotype.tool.ts
│   │   ├── list-traits.tool.ts
│   │   └── search-by-trait.tool.ts
│   │
│   └── utils/                            # Shared utilities
│       ├── logger.ts                     # Stderr-only logger (stdout is reserved for MCP)
│       ├── genotype.ts                   # Allele normalization (canonical sort)
│       ├── errors.ts                     # Error message helpers
│       └── formatting.ts                 # Markdown/JSON response formatters
│
└── tests/                                # Mirrors src/ — Bun native test runner (bun:test)
    ├── utils/
    │   ├── genotype.test.ts              # normalizeGenotype() — all allele combos, case handling
    │   ├── errors.test.ts                # createSnpNotFoundMessage(), createGenotypeNotFoundMessage()
    │   └── formatting.test.ts            # All 5 formatters, pagination, empty results, truncation
    ├── schemas/
    │   └── snp.schemas.test.ts           # Valid/invalid domain data, canonicalisation transform
    ├── repositories/
    │   └── snp.json-repository.test.ts   # Full repository lifecycle, all query methods, error paths
    └── services/
        ├── mock-repo.ts                  # Shared in-memory ISnpRepository mock + fixture SNPs
        ├── snp.service.test.ts
        ├── get-snp-details.use-case.test.ts
        ├── interpret-genotype.use-case.test.ts
        └── search-by-trait.use-case.test.ts
```

## Common Tasks

### Adding a new MCP tool

1. Create `src/tools/<name>.tool.ts` exporting a `register<Name>Tool(server, snpService)` function
2. Register the tool inside that function using:
   ```typescript
   server.registerTool(
     "tool_name",
     { inputSchema: MyInputSchema.shape },
     async (params) => { ... }
   );
   ```
3. Add its Zod input schema to `src/schemas/tool-inputs.schemas.ts`. If it needs new domain-model schemas, add those to `src/schemas/snp.schemas.ts`
4. If new business logic is needed, create `src/services/<name>.use-case.ts`
5. Wire the use case into `SnpService` (the facade)
6. Import and call the registration function in `src/tools/register-all.ts`
7. Update the tool count in the logger message in `register-all.ts`

### Adding new SNPs

1. Edit `src/repositories/data/snps.json`
2. Follow the existing schema — Zod validates on startup via `SnpArraySchema.parse()` in `snp.json-repository.ts`
3. Restart the server (`bun src/index.ts`)

### Switching data source (e.g., to PostgreSQL)

1. Create a new class implementing `ISnpRepository`
2. Swap the instantiation in `src/index.ts`
3. No other files change

### Adding a new test

Tests live in `tests/` and mirror `src/`. Use Bun's native test runner (`bun:test`) — no Jest imports.

- **Utils / schemas** — import and call the function directly; assert outputs with `expect()`
- **Repository** — write a temp JSON fixture, call `initialize()`, then test each query method
- **Use-case / service** — import `makeMockRepo` from `tests/services/mock-repo.ts`; inject it into the use-case constructor
- **Never** test through the MCP tool layer in unit tests; tools are covered by manual MCP Inspector tests
- Run `bun test` to verify; the pre-commit hook runs the full suite automatically

## Build & Run

```bash
bun install
bun start            # Run server (stdio transport)
bun run dev          # Dev mode with --watch
bun run inspector    # MCP Inspector (web UI for testing)
bun run build        # TypeScript type-check (noEmit)
bun run lint         # Biome lint check
bun run format       # Biome format (write)
bun run check        # Biome lint + format (write) — combined
bun run check:staged # Biome check on staged files — used by the git pre-commit hook
```

## Testing

```bash
bun test             # Run all automated tests
```

Tests live in `tests/` and mirror the `src/` structure:

| File | Coverage |
|---|---|
| `tests/utils/genotype.test.ts` | `normalizeGenotype()` — all allele combos, case handling |
| `tests/utils/errors.test.ts` | `createSnpNotFoundMessage()`, `createGenotypeNotFoundMessage()` |
| `tests/utils/formatting.test.ts` | All 5 formatters, pagination, empty results, truncation |
| `tests/schemas/snp.schemas.test.ts` | Valid/invalid domain data, canonicalisation transform |
| `tests/repositories/snp.json-repository.test.ts` | Full repository lifecycle, all query methods, error paths |
| `tests/services/snp.service.test.ts` | `SnpService.getMetadata()` — version enrichment, shape; `listTraits()` delegation |
| `tests/services/get-snp-details.use-case.test.ts` | `GetSnpDetailsUseCase` — found, not-found, case-insensitive lookup |
| `tests/services/interpret-genotype.use-case.test.ts` | `InterpretGenotypeUseCase` — normalisation, error paths, result shape |
| `tests/services/search-by-trait.use-case.test.ts` | `SearchByTraitUseCase` — any/all modes, pagination, summary fields |

Tests use Bun's native test runner (`bun:test`) — no Jest or Vitest. The pre-commit hook runs `bun test` automatically before every commit.

See `docs/TESTING.md` for manual test cases using MCP Inspector.

## Gotchas

- The shebang in `src/index.ts` is `#!/usr/bin/env bun`. Keep it as `bun`.
- `import.meta.dir` is used for path resolution — this is a Bun API (no `fileURLToPath`/`dirname` needed).
- The `findByTraits` "all" mode intersection copies the first set with `new Set(...)` to avoid mutating the internal trait index.
- `ISnpRepository` exposes `getAllSnps()` which is currently unused by any service or tool — treat it as an available extension point.
- `TraitSummary` has an optional `category` field populated from the `TRAIT_CATEGORIES` map in `src/types/trait-categories.ts`. `formatting.ts` renders categories as `## headers` and falls back to `## Other` for slugs not in the map. When adding new trait slugs to the dataset, also add them to `TRAIT_CATEGORIES` so they appear in the correct group.
