# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Agriculture Grant Opportunity Scraper & Data Portal** that:
- Scrapes grant opportunities from all 50 US state agriculture department websites
- Parses Grants.gov CSV exports for federal agriculture/food grants
- Extracts urban agriculture resources from state and national organizations
- Builds interactive HTML visualizations of grant data
- Generates knowledge graphs from urban agriculture PDFs

## Key Commands

### Scraping Operations
```bash
# Scrape all state agriculture department sites + Grants.gov CSV
node scraper.mjs grants-search-*.csv

# JSON output mode (for data.json)
node scraper.mjs --json grants-search-*.csv > data.json

# State-specific scraping
node scraper.mjs --state=CA,TX

# Scrape urban agriculture resources
node urban-scraper.mjs
node urban-scraper.mjs --json > urban-data.json
node urban-scraper.mjs --state=CA,NY

# Build HTML pages from scraped data
node build-page.mjs

# Full refresh pipeline
npm run refresh              # with urban scraping
npm run refresh:no-urban     # skip urban scraping
```

### Development
```bash
npm install         # Install dependencies (axios, cheerio, csv-parse)
```

### Python Scripts
```bash
# Run agriculture grants scraper (Pydantic-based)
python agriculture-grants.py

# Build knowledge graph from PDF
python build_urban_ag_kg.py  # Requires iText2KG + Ollama
```

## Architecture

### 1. Web Scraping Pipeline (Node.js)

**scraper.mjs** — Core state agriculture department crawler
- **BFS crawling**: Starts at each state's agriculture department homepage, crawls up to 2 levels deep (MAX_DEPTH=2), max 50 pages per state
- **Keyword-based discovery**: Three-tier priority queue prioritizes links with grant keywords (highest), then priority keywords like "programs" (medium), then general links (lowest)
- **Page classification**: Scores pages 0-15+ based on signals like dollar amounts, deadlines, "apply now" links, grant PDFs, eligibility language
  - Score ≥7 = "definitive" grant page
  - Score 3-6 = "ambiguous" (needs review)
  - Score <3 = "not-a-grant" (skipped)
- **Grant detail extraction**: Extracts title (from h1/h2), status (open/closed), dollar amounts, deadlines, related PDFs
- **Grants.gov CSV parsing**: Filters CSV rows for agriculture/food keywords while excluding FDA pharma grants
- **Concurrency**: Uses pooled() helper for bounded concurrency (default: 4 concurrent state crawls)
- **Politeness**: Random 2-4s delays between requests, User-Agent identifies as educational bot

**urban-scraper.mjs** — Urban agriculture resource scraper
- Crawls state agriculture sites for urban farm/community garden resources (depth=1, max 20 pages)
- Scrapes national organizations (USDA Urban Ag, NIFA, ACGA) for funding links
- Requires links to mention both urban keywords AND funding keywords
- Outputs to urban-data.json

**build-page.mjs** — HTML generator
- Reads data.json and urban-data.json
- Generates 3 main pages:
  - index.html — Home page with stats
  - state-grants.html — All state grants with collapsible cards, filter bar, jump map
  - federal-grants.html — Grants.gov table with sorting/filtering
- Generates states/*.html — Individual state detail pages (50 files) with:
  - All grant references (NO truncation of amounts/deadlines/documents)
  - Full discovery paths (breadcrumb trail showing how grant was found)
  - Urban farm resources for that state
  - National urban ag organization links
- Shared CSS variables + responsive design

### 2. Data Flow

```
Grants.gov CSV → scraper.mjs --json → data.json
                                         ↓
State sites → scraper.mjs → [BFS crawler] → data.json → build-page.mjs → *.html
                                         ↓
Urban sites → urban-scraper.mjs → urban-data.json ----→
```

### 3. Python Components

**agriculture-grants.py** — Pydantic-based scraper framework
- Defines GrantOpportunity schema (Pydantic model)
- BaseStateAgScraper abstract class for Playwright-based scrapers
- Example: CDFAScraper for California Department of Food and Agriculture
- Uses Playwright for dynamic content rendering
- Not currently integrated with main Node.js pipeline

**build_urban_ag_kg.py** — Knowledge graph builder
- Extracts text from SCALE-UP-URBAN-AG.pdf
- Uses iText2KG + Ollama (qwen2.5:32b) for entity/relationship extraction
- Generates interactive vis.js visualization with detail panels
- Outputs to urban_ag_kg_output/ (JSON + HTML)

## Data Structures

### data.json (output of scraper.mjs)
```json
{
  "scrapedAt": "ISO timestamp",
  "stateAgencies": [
    {
      "state": "CA",
      "name": "California Department of Food and Agriculture",
      "url": "https://www.cdfa.ca.gov",
      "grants": [
        {
          "type": "crawled",
          "text": "Grant title",
          "url": "https://...",
          "confidence": "definitive" | "ambiguous",
          "discoveredAt": { "depth": 1, "path": ["url1", "url2"] },
          "detail": {
            "title": "...",
            "status": "open" | "closed" | "unknown",
            "amounts": ["$50,000", "$100,000"],
            "deadlines": ["March 1, 2024"],
            "documents": [{ "text": "Application Form", "url": "..." }]
          }
        }
      ],
      "crawlStats": { "pagesVisited": 45, "pagesSkipped": 3, "durationMs": 234000 }
    }
  ],
  "grantsGov": {
    "csvFile": "grants-search-*.csv",
    "totalMatches": 150,
    "results": [ /* filtered Grants.gov opportunities */ ]
  }
}
```

### urban-data.json (output of urban-scraper.mjs)
```json
{
  "scrapedAt": "ISO timestamp",
  "stateResults": [
    {
      "state": "CA",
      "urbanResources": [
        {
          "text": "Link text",
          "url": "...",
          "matchedKeywords": ["urban farm", "community garden"],
          "context": "...excerpt...",
          "source": "state" | "national"
        }
      ]
    }
  ],
  "nationalOrgs": [ /* same structure */ ]
}
```

## Important Patterns

### Scraper Configuration
- **GRANT_KEYWORDS** (scraper.mjs:67-82): Keywords that identify grant pages
- **PRIORITY_KEYWORDS** (scraper.mjs:94-98): Keywords for intermediate nav pages
- **URBAN_AG_KEYWORDS** (urban-scraper.mjs:16-33): Urban agriculture terms
- **AG_FOOD_KEYWORDS** (scraper.mjs:488-496): Terms for Grants.gov CSV filtering

### URL Normalization
- normalizeUrl() strips fragments, tracking params, trailing slashes
- isInternalUrl() checks domain/subdomain matching
- shouldSkipUrl() filters binary files, login pages, news/media

### Deduplication
- dedup() helper removes entries with duplicate URLs or text
- State pages show unique grants (by URL and text)

### State Page Generation
- buildStateCard() — Summary view for state-grants.html (truncates docs/amounts)
- buildFullGrantItem() — Full detail view for states/*.html (NO truncation)
- Each state gets its own HTML file with complete grant data

## Key Constraints

1. **Respectful Crawling**: Always use randomDelay(2000, 4000) between requests
2. **Page Limits**: MAX_PAGES_PER_STATE=50 prevents runaway crawls
3. **Depth Limits**: MAX_DEPTH=2 for general grants, URBAN_MAX_DEPTH=1 for urban resources
4. **Error Handling**: State crawl errors are caught and logged; individual failures don't crash entire run
5. **CSV Format**: Grants.gov CSVs must have columns like opportunity_title, agency_name, funding_categories, etc.

## When Modifying Scrapers

1. **Adding a new state-specific scraper**: Update STATE_AGENCIES array (scraper.mjs:10-61)
2. **Changing classification logic**: Edit classifyPage() scoring thresholds (scraper.mjs:224-296)
3. **Adding grant keywords**: Update GRANT_KEYWORDS or AG_FOOD_KEYWORDS arrays
4. **Adjusting crawl depth/pages**: Modify MAX_DEPTH and MAX_PAGES_PER_STATE constants
5. **Rebuilding HTML after data changes**: Run `node build-page.mjs` or `npm run build`

## Testing Approach

- Test individual state scraping: `node scraper.mjs --state=CA --json`
- Validate JSON output: Check for definitive vs ambiguous grants
- Review HTML output: Open state-grants.html and states/*.html locally
- Check urban scraper: `node urban-scraper.mjs --state=NY`
