import { writeFileSync } from "node:fs";
import axios from "axios";
import * as cheerio from "cheerio";

import {
  STATE_AGENCIES, pooled,
  normalizeUrl, isInternalUrl, shouldSkipUrl, randomDelay,
  resolveUrl, extractInternalLinks, collapse,
  fetchPage,
} from "./scraper.mjs";

// ---------------------------------------------------------------------------
// Urban agriculture keywords
// ---------------------------------------------------------------------------

const URBAN_AG_KEYWORDS = [
  "urban farm", "urban farming",
  "urban agriculture", "urban agricultural",
  "community garden", "community gardening",
  "urban garden", "urban gardening",
  "city farm", "city farming",
  "rooftop farm", "rooftop farming", "rooftop garden",
  "vertical farm", "vertical farming",
  "indoor farm", "indoor farming",
  "urban food", "urban food production",
  "urban growing",
  "food hub",
  "local food system", "local food",
  "urban food desert",
  "urban food access",
  "urban agriculture grant",
  "urban ag",
];

const FUNDING_KEYWORDS = [
  "grant", "fund", "funding", "financial assistance",
  "cost-share", "cost share", "incentive",
  "award", "rfp", "nofa", "notice of funding",
  "subsidy", "rebate", "reimbursement",
];

/** Return all urban ag keywords found in text (or empty array). */
function matchedUrbanKeywords(text) {
  const lower = text.toLowerCase();
  return URBAN_AG_KEYWORDS.filter((kw) => lower.includes(kw));
}

/** Check whether text mentions any funding keyword. */
function textMatchesFunding(text) {
  const lower = text.toLowerCase();
  return FUNDING_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Extract a context snippet around the first urban keyword match. */
function extractContext(bodyText, keyword) {
  const idx = bodyText.toLowerCase().indexOf(keyword);
  if (idx === -1) return "";
  const start = Math.max(0, idx - 120);
  const end = Math.min(bodyText.length, idx + keyword.length + 120);
  let snippet = bodyText.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < bodyText.length) snippet = snippet + "...";
  return snippet;
}

// ---------------------------------------------------------------------------
// National urban ag organizations
// ---------------------------------------------------------------------------

const NATIONAL_URBAN_ORGS = [
  {
    name: "USDA Urban Agriculture",
    url: "https://www.usda.gov/topics/urban",
  },
  {
    name: "USDA People's Garden Initiative",
    url: "https://www.usda.gov/peoples-garden",
  },
  {
    name: "NIFA Urban Agriculture",
    url: "https://www.nifa.usda.gov/topics/urban-agriculture",
  },
  {
    name: "American Community Gardening Association",
    url: "https://www.communitygarden.org",
  },
  {
    name: "USDA Beginning Farmers and Ranchers",
    url: "https://www.usda.gov/topics/farming/beginning-farmers",
  },
];

// ---------------------------------------------------------------------------
// Crawl a state ag site for urban farm resources
// ---------------------------------------------------------------------------

const URBAN_MAX_DEPTH = 1;
const URBAN_MAX_PAGES = 20;

async function crawlStateForUrban(agency) {
  const baseUrl = agency.url.replace(/\/+$/, "");
  let baseDomain;
  try {
    baseDomain = new URL(baseUrl).hostname;
  } catch {
    return { state: agency.state, name: agency.name, url: agency.url, urbanResources: [] };
  }

  const visited = new Set();
  const resources = [];
  let pagesVisited = 0;

  const queue = [{ url: normalizeUrl(baseUrl), depth: 0 }];
  visited.add(normalizeUrl(baseUrl));

  while (queue.length > 0 && pagesVisited < URBAN_MAX_PAGES) {
    const { url: pageUrl, depth } = queue.shift();

    let html;
    try {
      html = await fetchPage(pageUrl);
    } catch {
      continue;
    }
    pagesVisited++;

    const $ = cheerio.load(html);
    const bodyText = $("body").text();

    // Check entire page body for urban keywords
    const pageMatches = matchedUrbanKeywords(bodyText);

    if (pageMatches.length > 0) {
      // Scan links on this page for specific resources
      $("a").each((_i, el) => {
        const href = $(el).attr("href") || "";
        const linkText = collapse($(el).text());
        if (!linkText || linkText.length < 5) return;

        const resolved = resolveUrl(href, pageUrl);
        if (!resolved) return;

        // Check if the link itself mentions urban ag
        const linkMatches = matchedUrbanKeywords(linkText + " " + resolved);
        if (linkMatches.length === 0) return;

        // Must also mention funding (for state sites)
        const combinedText = linkText + " " + bodyText.slice(
          Math.max(0, bodyText.toLowerCase().indexOf(linkText.toLowerCase()) - 200),
          Math.min(bodyText.length, bodyText.toLowerCase().indexOf(linkText.toLowerCase()) + linkText.length + 200)
        );
        if (!textMatchesFunding(combinedText) && !textMatchesFunding(resolved)) return;

        const context = extractContext(bodyText, linkMatches[0]);

        resources.push({
          text: linkText,
          url: normalizeUrl(resolved),
          matchedKeywords: [...new Set(linkMatches)],
          context,
          source: "state",
        });
      });

      // Also check if this page itself is an urban ag resource
      let title = "";
      $("h1, h2").each((_i, el) => {
        if (title) return;
        const t = $(el).text().trim();
        if (t.length > 3 && !/^menu$/i.test(t) && !/^nav/i.test(t)) {
          title = collapse(t);
        }
      });
      if (!title) title = $("title").text().trim() || pageUrl;

      const titleMatches = matchedUrbanKeywords(title);
      if (titleMatches.length > 0 && (textMatchesFunding(bodyText) || textMatchesFunding(pageUrl))) {
        resources.push({
          text: title,
          url: pageUrl,
          matchedKeywords: [...new Set(titleMatches)],
          context: extractContext(bodyText, titleMatches[0]),
          source: "state",
        });
      }
    }

    // Enqueue child links (prioritize urban keywords)
    if (depth < URBAN_MAX_DEPTH) {
      const links = extractInternalLinks($, pageUrl, baseDomain);
      for (const link of links) {
        if (visited.has(link.url)) continue;
        visited.add(link.url);
        // Prioritize links with urban keywords
        const hasUrban = matchedUrbanKeywords(link.text + " " + link.url).length > 0;
        const entry = { url: link.url, depth: depth + 1 };
        if (hasUrban) queue.unshift(entry);
        else queue.push(entry);
      }
    }

    if (queue.length > 0 && pagesVisited < URBAN_MAX_PAGES) {
      await randomDelay(1500, 3000);
    }
  }

  // Dedup by URL
  const seen = new Set();
  const deduped = resources.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return {
    state: agency.state,
    name: agency.name,
    url: agency.url,
    urbanResources: deduped,
  };
}

// ---------------------------------------------------------------------------
// Crawl a national urban ag organization
// ---------------------------------------------------------------------------

async function crawlNationalOrg(org) {
  const baseUrl = org.url.replace(/\/+$/, "");
  let baseDomain;
  try {
    baseDomain = new URL(baseUrl).hostname;
  } catch {
    return { orgName: org.name, orgUrl: org.url, resources: [], error: "Invalid URL" };
  }

  const visited = new Set();
  const resources = [];
  let pagesVisited = 0;
  const maxPages = 15;

  const queue = [{ url: normalizeUrl(baseUrl), depth: 0 }];
  visited.add(normalizeUrl(baseUrl));

  while (queue.length > 0 && pagesVisited < maxPages) {
    const { url: pageUrl, depth } = queue.shift();

    let html;
    try {
      html = await fetchPage(pageUrl);
    } catch {
      continue;
    }
    pagesVisited++;

    const $ = cheerio.load(html);
    const bodyText = $("body").text();

    // For national orgs, we're less strict — any link mentioning grants/funding
    // from these curated sites is relevant
    $("a").each((_i, el) => {
      const href = $(el).attr("href") || "";
      const linkText = collapse($(el).text());
      if (!linkText || linkText.length < 5) return;

      const resolved = resolveUrl(href, pageUrl);
      if (!resolved) return;

      const combinedText = linkText + " " + resolved;
      const urbanMatches = matchedUrbanKeywords(combinedText);
      const hasFunding = textMatchesFunding(combinedText);

      // Accept if: has urban keywords, OR has funding keywords (since the org itself is urban-ag focused)
      if (urbanMatches.length === 0 && !hasFunding) return;

      const context = extractContext(bodyText, urbanMatches.length > 0 ? urbanMatches[0] : linkText.toLowerCase().slice(0, 20));

      resources.push({
        text: linkText,
        url: normalizeUrl(resolved),
        matchedKeywords: urbanMatches.length > 0 ? [...new Set(urbanMatches)] : ["funding-related"],
        context,
        source: "national",
      });
    });

    // Enqueue depth-1 links from these org sites
    if (depth < 1) {
      const links = extractInternalLinks($, pageUrl, baseDomain);
      for (const link of links) {
        if (visited.has(link.url)) continue;
        visited.add(link.url);
        // Prioritize grant/fund pages
        const hasFunding = textMatchesFunding(link.text + " " + link.url);
        const entry = { url: link.url, depth: depth + 1 };
        if (hasFunding) queue.unshift(entry);
        else queue.push(entry);
      }
    }

    if (queue.length > 0 && pagesVisited < maxPages) {
      await randomDelay(1500, 3000);
    }
  }

  // Dedup by URL
  const seen = new Set();
  const deduped = resources.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return {
    orgName: org.name,
    orgUrl: org.url,
    resources: deduped,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes("--json");
  const nationalOnly = args.includes("--national-only");
  const statesOnly = args.includes("--states-only");
  const stateFilter = args
    .find((a) => a.startsWith("--state="))
    ?.split("=")[1]
    ?.split(",")
    .map((s) => s.toUpperCase());

  console.error("=".repeat(60));
  console.error("  Urban Agriculture Grant Resource Scraper");
  console.error("  Run date:", new Date().toISOString());
  console.error("=".repeat(60));

  // -----------------------------------------------------------------------
  // State site crawling
  // -----------------------------------------------------------------------
  let stateResults = [];

  if (!nationalOnly) {
    let agencies = STATE_AGENCIES;
    if (stateFilter) {
      agencies = agencies.filter((a) => stateFilter.includes(a.state));
    }

    console.error(`\n[1] Crawling ${agencies.length} state ag sites for urban farm resources...`);
    console.error(`    (depth: ${URBAN_MAX_DEPTH}, max pages/state: ${URBAN_MAX_PAGES})\n`);

    const tasks = agencies.map((agency) => () => crawlStateForUrban(agency));
    stateResults = await pooled(tasks, 4);

    for (const result of stateResults) {
      const count = result.urbanResources.length;
      if (count > 0) {
        console.error(`  [${result.state}] ${count} urban farm resource(s)`);
        for (const r of result.urbanResources) {
          console.error(`    ${r.text}`);
          console.error(`      ${r.url}`);
        }
      } else {
        console.error(`  [${result.state}] No urban farm resources found`);
      }
    }

    const totalUrban = stateResults.reduce((a, s) => a + s.urbanResources.length, 0);
    const statesWithUrban = stateResults.filter((s) => s.urbanResources.length > 0).length;
    console.error(`\n  Total: ${totalUrban} resources across ${statesWithUrban} states\n`);
  }

  // -----------------------------------------------------------------------
  // National org scraping
  // -----------------------------------------------------------------------
  let nationalResults = [];

  if (!statesOnly) {
    console.error(`[2] Scraping ${NATIONAL_URBAN_ORGS.length} national urban ag organizations...\n`);

    const tasks = NATIONAL_URBAN_ORGS.map((org) => () => crawlNationalOrg(org));
    nationalResults = await pooled(tasks, 2);

    for (const result of nationalResults) {
      console.error(`  [${result.orgName}] ${result.resources.length} resource(s)`);
      for (const r of result.resources) {
        console.error(`    ${r.text}`);
        console.error(`      ${r.url}`);
      }
    }

    const totalNational = nationalResults.reduce((a, o) => a + o.resources.length, 0);
    console.error(`\n  Total: ${totalNational} national resources\n`);
  }

  // -----------------------------------------------------------------------
  // Output
  // -----------------------------------------------------------------------
  const output = {
    scrapedAt: new Date().toISOString(),
    urbanKeywords: URBAN_AG_KEYWORDS,
    stateResults: nationalOnly ? [] : stateResults,
    nationalOrgs: statesOnly ? [] : nationalResults,
  };

  if (jsonMode) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    writeFileSync("urban-data.json", JSON.stringify(output, null, 2));
    console.error("Wrote urban-data.json");
  }

  console.error("\n" + "=".repeat(60));
  console.error("  Done.");
  console.error("=".repeat(60));
}

// Only run when executed directly
const isDirectRun = process.argv[1] &&
  new URL(process.argv[1], "file://").pathname ===
  new URL(import.meta.url).pathname;
if (isDirectRun) {
  main().catch((err) => { console.error("Urban scraper failed:", err.message); process.exit(1); });
}

export { URBAN_AG_KEYWORDS, FUNDING_KEYWORDS, NATIONAL_URBAN_ORGS };
