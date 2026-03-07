# Testing Guide for Genomics MCP Server

This guide shows how to test the Genomics MCP Server to ensure all tools work correctly.

## Prerequisites

- Bun installed (https://bun.sh)
- Dependencies installed (`bun install`)

## Automated Tests

Run the full test suite with:

```bash
bun test
```

All tests must pass before every commit (enforced by the pre-commit hook).

| File | What it covers |
|---|---|
| `tests/utils/genotype.test.ts` | `normalizeGenotype()` — all allele combos, case handling |
| `tests/utils/errors.test.ts` | `createSnpNotFoundMessage()`, `createGenotypeNotFoundMessage()` |
| `tests/utils/formatting.test.ts` | All 5 formatters, pagination, empty results, truncation |
| `tests/schemas/snp.schemas.test.ts` | Valid/invalid domain data, canonicalisation transform |
| `tests/repositories/snp.json-repository.test.ts` | Full repository lifecycle, all query methods, error paths |
| `tests/services/get-snp-details.use-case.test.ts` | `GetSnpDetailsUseCase` — found, not-found, case-insensitive lookup |
| `tests/services/interpret-genotype.use-case.test.ts` | `InterpretGenotypeUseCase` — normalisation, error paths, result shape |
| `tests/services/search-by-trait.use-case.test.ts` | `SearchByTraitUseCase` — any/all modes, pagination, summary fields |

Tests use Bun's native test runner (`bun:test`) — no Jest or Vitest. Tool-layer integration is covered by the manual MCP Inspector tests below.

---

## Method 1: MCP Inspector (Recommended)

The MCP Inspector provides a web-based interface to test MCP servers.

### Start the Inspector

```bash
bun run inspector
```

You should see output like:
```
[Server] Initializing Genomics MCP Server v0.1.0
[Server] Loading SNP data from: /path/to/src/repositories/data/snps.json
[JsonSnpRepository] Loaded N SNPs from /path/to/data/snps.json
[Tools] 🛠️ Registered 4 genomics tools
[Server] 🧬 Dataset loaded: N SNPs, N traits
[Server] 🗓️ Last updated: 2025-01-20
[Server] Connected via stdio transport
[Server] 🚀 Genomics MCP Server is ready

Inspector running at http://localhost:5173
```

### Open the Web Interface

1. Open the URL shown (typically `http://localhost:5173`)
2. You should see the MCP Inspector interface
3. Click on "Connect" to establish connection to your server

### Test Each Tool

#### Test 1: List Available Traits

**Tool:** `list_traits`

**Parameters:**
```json
{
  "response_format": "markdown"
}
```

**Expected Result:** List of all 34+ traits with SNP counts

**Search Test:**
```json
{
  "search": "alzheimer",
  "response_format": "markdown"
}
```

**Expected Result:** Only traits containing "alzheimer"

---

#### Test 2: Search SNPs by Single Trait

**Tool:** `search_by_trait`

**Parameters:**
```json
{
  "traits": ["alzheimer_risk"],
  "match_mode": "any",
  "limit": 10,
  "offset": 0,
  "response_format": "markdown"
}
```

**Expected Result:** 2 SNPs (rs7412, rs429358) with APOE gene

---

#### Test 3: Search SNPs by Multiple Traits (ANY mode)

**Tool:** `search_by_trait`

**Parameters:**
```json
{
  "traits": ["cognitive_function", "memory"],
  "match_mode": "any",
  "limit": 20,
  "response_format": "markdown"
}
```

**Expected Result:** Multiple SNPs (rs4680, rs6265, etc.) - any SNP matching either trait

---

#### Test 4: Search SNPs by Multiple Traits (ALL mode)

**Tool:** `search_by_trait`

**Parameters:**
```json
{
  "traits": ["cognitive_function", "memory"],
  "match_mode": "all",
  "limit": 20,
  "response_format": "markdown"
}
```

**Expected Result:** Only SNPs that have BOTH traits (rs6265 BDNF, rs4680 COMT)

---

#### Test 5: Get SNP Details

**Tool:** `get_snp_details`

**Parameters:**
```json
{
  "rsid": "rs429358",
  "response_format": "markdown"
}
```

**Expected Result:** Full details for APOE ε4 SNP including:
- Description
- Genomic location (chromosome 19, position 44908822)
- Genes: APOE
- Traits: alzheimer_risk, cognitive_decline, cardiovascular_disease
- All 3 genotype effects (TT, CT, CC)
- Sources with URLs
- Population frequency

---

#### Test 6: Get SNP Details - Not Found

**Tool:** `get_snp_details`

**Parameters:**
```json
{
  "rsid": "rs999999999",
  "response_format": "markdown"
}
```

**Expected Result:** Helpful error message:
```
SNP rs999999999 not found in our database. Our dataset contains N SNPs. 
Try using 'list_traits' to see available data.
```

---

#### Test 7: Interpret Genotype - Basic

**Tool:** `interpret_genotype`

**Parameters:**
```json
{
  "rsid": "rs429358",
  "genotype": "CT",
  "response_format": "markdown"
}
```

**Expected Result:** Interpretation for APOE ε3/ε4 genotype:
- "3x increased Alzheimer's risk"
- Detailed explanation
- Associated genes and traits

---

#### Test 8: Interpret Genotype - Normalized (AG = GA)

**Tool:** `interpret_genotype`

**Parameters for first call:**
```json
{
  "rsid": "rs53576",
  "genotype": "AG",
  "response_format": "json"
}
```

**Parameters for second call:**
```json
{
  "rsid": "rs53576",
  "genotype": "GA",
  "response_format": "json"
}
```

**Expected Result:** Both should return the same interpretation with:
- `"genotype": "AG"` (or "GA")
- `"normalized_genotype": "AG"`
- Same effect data

---

#### Test 9: Interpret Genotype - Not Available

**Tool:** `interpret_genotype`

**Parameters:**
```json
{
  "rsid": "rs429358",
  "genotype": "GG",
  "response_format": "markdown"
}
```

**Expected Result:** Helpful error with available genotypes:
```
Genotype 'GG' not found for rs429358. Available genotypes: CT, CC, TT. 
Make sure you're using the correct alleles.
```

---

#### Test 10: Pagination

**Tool:** `search_by_trait`

**First page:**
```json
{
  "traits": ["cognitive_function"],
  "limit": 1,
  "offset": 0,
  "response_format": "json"
}
```

**Second page:**
```json
{
  "traits": ["cognitive_function"],
  "limit": 1,
  "offset": 1,
  "response_format": "json"
}
```

**Expected Result:** 
- First call returns first SNP with `"has_more": true, "next_offset": 1`
- Second call returns second SNP
- Different SNPs in each response

---

#### Test 11: JSON Response Format

**Tool:** `get_snp_details`

**Parameters:**
```json
{
  "rsid": "rs7412",
  "response_format": "json"
}
```

**Expected Result:** Valid JSON object with all SNP fields (no markdown formatting)

---

#### Test 12: Invalid Input - Malformed rsID

**Tool:** `get_snp_details`

**Parameters:**
```json
{
  "rsid": "invalid123",
  "response_format": "markdown"
}
```

**Expected Result:** Zod validation error:
```
Must be a valid rsID format (e.g., 'rs111', 'rs12345')
```

---

#### Test 13: Invalid Input - Bad Genotype

**Tool:** `interpret_genotype`

**Parameters:**
```json
{
  "rsid": "rs429358",
  "genotype": "XX",
  "response_format": "markdown"
}
```

**Expected Result:** Zod validation error:
```
Must be exactly 2 nucleotide letters: A, C, G, or T
```

---

#### Test 14: Edge Case - Empty Traits Array

**Tool:** `search_by_trait`

**Parameters:**
```json
{
  "traits": [],
  "response_format": "markdown"
}
```

**Expected Result:** Zod validation error:
```
At least one trait is required
```

---

#### Test 15: Edge Case - Too Many Traits

**Tool:** `search_by_trait`

**Parameters:**
```json
{
  "traits": ["trait1", "trait2", "trait3", "trait4", "trait5", "trait6", 
             "trait7", "trait8", "trait9", "trait10", "trait11"],
  "response_format": "markdown"
}
```

**Expected Result:** Zod validation error:
```
Maximum 10 traits per query
```

---

## Method 2: Manual Testing via stdio (Advanced)

For deeper integration testing, you can manually send JSON-RPC messages:

### 1. List Tools Request

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | bun src/index.ts
```

**Expected:** List of 4 tools with descriptions

### 2. Call Tool Request

```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_traits","arguments":{"response_format":"json"}}}' | bun src/index.ts
```

**Expected:** JSON response with list of traits

---

## Verification Checklist

- [ ] Server starts without errors
- [ ] All 4 tools are registered
- [ ] SNPs loaded successfully
- [ ] Traits indexed
- [ ] `list_traits` returns all traits
- [ ] `search_by_trait` with "any" mode works
- [ ] `search_by_trait` with "all" mode works
- [ ] `get_snp_details` returns full SNP data
- [ ] `interpret_genotype` normalizes allele order
- [ ] Not found errors are helpful
- [ ] Invalid input is caught by Zod validation
- [ ] Pagination works correctly
- [ ] Both markdown and JSON formats work
- [ ] Character limit truncation triggers on large results (>25k chars)

---

## Common Issues

### Issue: "command not found: bun"

**Solution:** Install Bun from https://bun.sh

### Issue: "Cannot find module"

**Solution:** Run `bun install` to install dependencies

### Issue: "Failed to load SNP data"

**Solution:** 
- Check that `src/repositories/data/snps.json` exists
- Validate JSON syntax
- Check console for Zod validation errors

### Issue: Inspector connection fails

**Solution:**
- Make sure server is running
- Check firewall settings
- Try restarting the inspector

---

## Performance Benchmarks

Expected performance on modern hardware:

- **Server startup:** < 500ms
- **Data loading:** < 100ms
- **Trait search:** < 5ms
- **SNP details:** < 1ms
- **Genotype interpretation:** < 1ms

With 1000+ SNPs, search times should remain under 50ms due to in-memory indexing.

---

## Next Steps

After verifying all tests pass:

1. Integrate with your MCP client
2. Test real user queries through the LLM
3. Monitor for edge cases and errors
4. Expand SNP dataset
5. Consider database migration for larger datasets
6. Set up GitHub Actions CI to run `bun test`, `bun run build`, and `bun run lint` on every push
