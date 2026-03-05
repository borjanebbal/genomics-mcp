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
3. **Use-case classes.** Business logic lives in `src/services/*.use-case.ts`. The `SnpService` facade delegates to them. **Exception:** `listTraits()` and `getMetadata()` on `SnpService` call the repository directly (no use-case class) because they contain no business logic.
4. **One tool per file.** Each MCP tool is defined in `src/tools/*.tool.ts`. The barrel `register-all.ts` wires them together.
5. **Zod schemas are the source of truth** for both runtime validation and TypeScript types (via `z.infer`).

## File Layout

```
src/
├── index.ts                              # Entry point — wires everything together
├── constants.ts                          # Limits, patterns, defaults
├── types/
│   ├── common.ts                         # PaginationMetadata, MatchMode, ResponseFormat, RiskLevel, StudyType
│   └── snp.ts                            # SnpRecord, SnpSummary, TraitSummary, DatasetMetadata, GenotypeInterpretation
├── schemas/
│   ├── snp.schemas.ts                    # Domain Zod schemas — validates seed data on startup
│   └── tool-inputs.schemas.ts            # Zod schemas for MCP tool inputs
├── repositories/                         # Data access layer
│   ├── snp.repository.ts                 # ISnpRepository interface
│   ├── snp.json-repository.ts            # JSON/in-memory implementation
│   └── data/snps.json                    # Seed data
├── services/                             # Business logic
│   ├── snp.service.ts                    # Facade — delegates to use cases
│   ├── get-snp-details.use-case.ts
│   ├── interpret-genotype.use-case.ts
│   └── search-by-trait.use-case.ts
├── tools/                                # MCP tool registrations
│   ├── register-all.ts                   # Barrel — registers all tools
│   ├── get-snp-details.tool.ts
│   ├── interpret-genotype.tool.ts
│   ├── list-traits.tool.ts
│   └── search-by-trait.tool.ts
└── utils/                                # Shared utilities
    ├── logger.ts                         # Stderr logger
    ├── genotype.ts                       # Allele normalization
    ├── errors.ts                         # Error message helpers
    └── formatting.ts                     # Markdown/JSON response formatters
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

No automated tests yet. See `docs/TESTING.md` for 15+ manual test cases using MCP Inspector.

## Gotchas

- The shebang in `src/index.ts` is `#!/usr/bin/env bun`. Keep it as `bun`.
- `import.meta.dir` is used for path resolution — this is a Bun API (no `fileURLToPath`/`dirname` needed).
- The `findByTraits` "all" mode intersection copies the first set with `new Set(...)` to avoid mutating the internal trait index.
- `ISnpRepository` exposes `getAllSnps()` which is currently unused by any service or tool — treat it as an available extension point.
- `TraitSummary` has an optional `category` field and `formatting.ts` renders it as a group header, but `snp.json-repository.ts` does not populate it yet — traits will always appear ungrouped until this is wired up.
