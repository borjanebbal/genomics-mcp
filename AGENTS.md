# AGENTS.md — AI Agent Instructions

## Project Overview

This is an MCP (Model Context Protocol) server written in TypeScript that exposes genomics SNP data to LLM clients. It is a **read-only** data service — no mutations, no user accounts, no authentication.

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **MCP SDK:** `@modelcontextprotocol/sdk` v1.x — use `server.tool(name, schema.shape, handler)` API
- **Validation:** Zod 3.x
- **Linter/Formatter:** Biome
- **Build:** Bun runs TypeScript directly — `tsc` is available for type-checking only

## Key Architecture Rules

1. **stdout is sacred.** All log output MUST go to stderr. Use `createLogger()` from `src/utils/logger.ts` — never use `console.log()` or `console.error()` directly.
2. **Repository Pattern.** All data access goes through `ISnpRepository`. Never read JSON files directly in services or tools.
3. **Use-case classes.** Business logic lives in `src/services/*.use-case.ts`. The `SnpService` facade delegates to them.
4. **One tool per file.** Each MCP tool is defined in `src/tools/*.tool.ts`. The barrel `register-all.ts` wires them together.
5. **Zod schemas are the source of truth** for both runtime validation and TypeScript types (via `z.infer`).

## File Layout

```
src/
├── index.ts                          # Entry point — wires everything together
├── constants.ts                      # Limits, patterns, defaults
├── types/                            # Pure TypeScript interfaces (no runtime code)
├── schemas/                          # Zod schemas (runtime validation)
├── repositories/                     # Data access layer
│   ├── snp.repository.ts             # Interface
│   ├── snp.json-repository.ts        # JSON/in-memory implementation
│   └── data/snps.json                # Seed data
├── services/                         # Business logic
│   ├── snp.service.ts                # Facade
│   └── *.use-case.ts                 # Individual use cases
├── tools/                            # MCP tool registrations
│   ├── register-all.ts               # Barrel
│   └── *.tool.ts                     # One file per tool
└── utils/                            # Shared utilities
    ├── logger.ts                     # Stderr logger
    ├── genotype.ts                   # Allele normalization
    ├── errors.ts                     # Error message helpers
    └── formatting.ts                 # Markdown/JSON response formatters
```

## Common Tasks

### Adding a new MCP tool

1. Create `src/tools/<name>.tool.ts` exporting a `register<Name>Tool(server, snpService)` function
2. Add its Zod input schema to `src/schemas/tool-inputs.schemas.ts`
3. If new business logic is needed, create `src/services/<name>.use-case.ts`
4. Wire the use case into `SnpService` (the facade)
5. Import and call the registration function in `src/tools/register-all.ts`
6. Update the tool count in the logger message

### Adding new SNPs

1. Edit `src/repositories/data/snps.json`
2. Follow the existing schema — Zod validates on startup
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
bun run lint         # Biome lint
bun run format       # Biome format
```

## Testing

No automated tests yet. See `docs/TESTING.md` for 15+ manual test cases using MCP Inspector.

## Gotchas

- The shebang in `src/index.ts` is `#!/usr/bin/env bun`. Keep it as `bun`.
- `import.meta.dir` is used for path resolution — this is a Bun API (no `fileURLToPath`/`dirname` needed).
- The `findByTraits` "all" mode intersection copies the first set with `new Set(...)` to avoid mutating the internal trait index.

