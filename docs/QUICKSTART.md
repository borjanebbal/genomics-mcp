# Genomics MCP Server - Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Test with Inspector
bun run inspector

# 3. Open browser to http://localhost:5173
```

## 🔧 Available Tools

### 1️⃣ search_by_trait
Search SNPs by trait(s)

**Quick Example:**
```json
{
  "traits": ["alzheimer_risk"],
  "response_format": "markdown"
}
```

### 2️⃣ get_snp_details
Get full SNP information

**Quick Example:**
```json
{
  "rsid": "rs429358",
  "response_format": "markdown"
}
```

### 3️⃣ interpret_genotype
Interpret your genotype

**Quick Example:**
```json
{
  "rsid": "rs429358",
  "genotype": "CT",
  "response_format": "markdown"
}
```

### 4️⃣ list_traits
List all available traits

**Quick Example:**
```json
{
  "response_format": "markdown"
}
```

## 📊 Dataset

- **12 SNPs** covering major genes:
  - APOE (Alzheimer's)
  - BDNF (memory)
  - COMT (cognitive function)
  - ACTN3 (athletic performance)
  - And more...

- **34 traits** including:
  - alzheimer_risk
  - cognitive_function
  - athletic_performance
  - addiction_risk
  - cardiovascular_disease

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Server won't start | Run `bun install` first |
| Missing data | Check that `src/repositories/data/snps.json` exists |
| Invalid rsID | Format must be `rs` + numbers (e.g., `rs429358`) |
| Invalid genotype | Must be 2 letters: A, C, G, or T |

## 🔗 Resources

- Full docs: [`README.md`](../README.md)
- Tool reference: [`TOOLS.md`](TOOLS.md)
- Testing guide: [`TESTING.md`](TESTING.md)
- Architecture guide: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Data file: `src/repositories/data/snps.json`

## 📦 Integration

**MCP Client Config:**
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

Consult your MCP client's documentation for the config file location and format.

---

**Need help?** Check `TESTING.md` for 15+ test cases with expected results!
