import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import axios from "axios";
import * as cheerio from "cheerio";

// ---------------------------------------------------------------------------
// All 50 state departments of agriculture
// ---------------------------------------------------------------------------

const STATE_AGENCIES = [
  { state: "AL", name: "Alabama Department of Agriculture and Industries", url: "https://agi.alabama.gov" },
  { state: "AK", name: "Alaska Division of Agriculture", url: "https://dnr.alaska.gov/ag" },
  { state: "AZ", name: "Arizona Department of Agriculture", url: "https://agriculture.az.gov" },
  { state: "AR", name: "Arkansas Department of Agriculture", url: "https://agriculture.arkansas.gov" },
  { state: "CA", name: "California Department of Food and Agriculture", url: "https://www.cdfa.ca.gov" },
  { state: "CO", name: "Colorado Department of Agriculture", url: "https://ag.colorado.gov" },
  { state: "CT", name: "Connecticut Department of Agriculture", url: "https://portal.ct.gov/doag" },
  { state: "DE", name: "Delaware Department of Agriculture", url: "https://agriculture.delaware.gov" },
  { state: "FL", name: "Florida Department of Agriculture and Consumer Services", url: "https://www.fdacs.gov" },
  { state: "GA", name: "Georgia Department of Agriculture", url: "https://agr.georgia.gov" },
  { state: "HI", name: "Hawaii Department of Agriculture", url: "https://dab.hawaii.gov" },
  { state: "ID", name: "Idaho State Department of Agriculture", url: "https://agri.idaho.gov" },
  { state: "IL", name: "Illinois Department of Agriculture", url: "https://agr.illinois.gov" },
  { state: "IN", name: "Indiana State Department of Agriculture", url: "https://www.in.gov/isda" },
  { state: "IA", name: "Iowa Department of Agriculture and Land Stewardship", url: "https://iowaagriculture.gov" },
  { state: "KS", name: "Kansas Department of Agriculture", url: "https://agriculture.ks.gov" },
  { state: "KY", name: "Kentucky Department of Agriculture", url: "https://www.kyagr.com" },
  { state: "LA", name: "Louisiana Department of Agriculture and Forestry", url: "https://www.ldaf.state.la.us" },
  { state: "ME", name: "Maine Department of Agriculture, Conservation and Forestry", url: "https://www.maine.gov/dacf" },
  { state: "MD", name: "Maryland Department of Agriculture", url: "https://mda.maryland.gov" },
  { state: "MA", name: "Massachusetts Department of Agricultural Resources", url: "https://www.mass.gov/orgs/massachusetts-department-of-agricultural-resources" },
  { state: "MI", name: "Michigan Department of Agriculture and Rural Development", url: "https://www.michigan.gov/mdard" },
  { state: "MN", name: "Minnesota Department of Agriculture", url: "https://www.mda.state.mn.us" },
  { state: "MS", name: "Mississippi Department of Agriculture and Commerce", url: "https://www.mdac.ms.gov" },
  { state: "MO", name: "Missouri Department of Agriculture", url: "https://agriculture.mo.gov" },
  { state: "MT", name: "Montana Department of Agriculture", url: "https://agr.mt.gov" },
  { state: "NE", name: "Nebraska Department of Agriculture", url: "https://nda.nebraska.gov" },
  { state: "NV", name: "Nevada Department of Agriculture", url: "https://agri.nv.gov" },
  { state: "NH", name: "New Hampshire Department of Agriculture, Markets and Food", url: "https://www.agriculture.nh.gov" },
  { state: "NJ", name: "New Jersey Department of Agriculture", url: "https://www.nj.gov/agriculture" },
  { state: "NM", name: "New Mexico Department of Agriculture", url: "https://nmdeptag.nmsu.edu" },
  { state: "NY", name: "New York State Department of Agriculture and Markets", url: "https://agriculture.ny.gov" },
  { state: "NC", name: "North Carolina Department of Agriculture and Consumer Services", url: "https://www.ncagr.gov" },
  { state: "ND", name: "North Dakota Department of Agriculture", url: "https://www.ndda.nd.gov" },
  { state: "OH", name: "Ohio Department of Agriculture", url: "https://agri.ohio.gov" },
  { state: "OK", name: "Oklahoma Department of Agriculture, Food, and Forestry", url: "https://ag.ok.gov" },
  { state: "OR", name: "Oregon Department of Agriculture", url: "https://www.oregon.gov/oda" },
  { state: "PA", name: "Pennsylvania Department of Agriculture", url: "https://www.pa.gov/agencies/pda" },
  { state: "RI", name: "Rhode Island Division of Agriculture", url: "https://dem.ri.gov/natural-resources-bureau/agriculture-and-forest-environment" },
  { state: "SC", name: "South Carolina Department of Agriculture", url: "https://agriculture.sc.gov" },
  { state: "SD", name: "South Dakota Department of Agriculture and Natural Resources", url: "https://danr.sd.gov" },
  { state: "TN", name: "Tennessee Department of Agriculture", url: "https://www.tn.gov/agriculture.html" },
  { state: "TX", name: "Texas Department of Agriculture", url: "https://www.texasagriculture.gov" },
  { state: "UT", name: "Utah Department of Agriculture and Food", url: "https://ag.utah.gov" },
  { state: "VT", name: "Vermont Agency of Agriculture, Food and Markets", url: "https://agriculture.vermont.gov" },
  { state: "VA", name: "Virginia Department of Agriculture and Consumer Services", url: "https://www.vdacs.virginia.gov" },
  { state: "WA", name: "Washington State Department of Agriculture", url: "https://agr.wa.gov" },
  { state: "WV", name: "West Virginia Department of Agriculture", url: "https://agriculture.wv.gov" },
  { state: "WI", name: "Wisconsin Department of Agriculture, Trade and Consumer Protection", url: "https://datcp.wi.gov" },
  { state: "WY", name: "Wyoming Department of Agriculture", url: "https://agriculture.wy.gov" },
];

// ---------------------------------------------------------------------------
// Grant keyword matching
// ---------------------------------------------------------------------------

const GRANT_KEYWORDS = [
  "grant",
  "fund",
  "funding",
  "financial assistance",
  "investment fund",
  "block grant",
  "cost-share",
  "cost share",
  "incentive program",
  "award",
  "rfp",
  "request for proposal",
  "nofa",
  "notice of funding",
];

function textMatchesGrantKeyword(text) {
  const lower = text.toLowerCase();
  return GRANT_KEYWORDS.some((kw) => lower.includes(kw));
}

// ---------------------------------------------------------------------------
// Priority keywords — broader navigation terms that indicate pages worth
// visiting even without explicit grant language (e.g. intermediate nav pages)
// ---------------------------------------------------------------------------

const PRIORITY_KEYWORDS = [
  "program", "programs", "development", "agriculture", "agricultural",
  "marketing", "services", "assistance", "initiative", "initiatives",
  "conservation", "forestry", "economic", "resource", "resources",
];

function textMatchesPriorityKeyword(text) {
  const lower = text.toLowerCase();
  return PRIORITY_KEYWORDS.some((kw) => lower.includes(kw));
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

const CRAWL_CONCURRENCY = 4;
const MAX_DEPTH = 2;
const MAX_PAGES_PER_STATE = 50;

async function fetchPage(url) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AgGrantScraper/2.0; educational-use)",
      Accept: "text/html,application/xhtml+xml",
    },
    timeout: 20_000,
    maxRedirects: 5,
  });
  return res.data;
}

/** Run an array of async functions with bounded concurrency. */
async function pooled(fns, concurrency = CRAWL_CONCURRENCY) {
  const results = new Array(fns.length);
  let idx = 0;

  async function worker() {
    while (idx < fns.length) {
      const i = idx++;
      results[i] = await fns[i]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, fns.length) }, () => worker()));
  return results;
}

// ---------------------------------------------------------------------------
// URL utility functions
// ---------------------------------------------------------------------------

/** Strip fragments, trailing slashes, and common tracking params for dedup. */
function normalizeUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.hash = "";
    // Remove common tracking params
    for (const p of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"]) {
      u.searchParams.delete(p);
    }
    // Remove trailing slash for consistency (but keep "/" for root)
    let out = u.href;
    if (out.endsWith("/") && u.pathname !== "/") {
      out = out.slice(0, -1);
    }
    return out;
  } catch {
    return rawUrl;
  }
}

/** Check whether a URL belongs to the same domain or a subdomain. */
function isInternalUrl(url, baseDomain) {
  try {
    const host = new URL(url).hostname;
    return host === baseDomain || host.endsWith("." + baseDomain);
  } catch {
    return false;
  }
}

/** Return true for URLs we should never crawl (binary files, login, etc.). */
function shouldSkipUrl(url) {
  const lower = url.toLowerCase();
  // Binary / non-HTML file extensions
  if (/\.(pdf|docx?|xlsx?|pptx?|zip|tar|gz|png|jpe?g|gif|svg|ico|css|js|mp[34]|wav|avi|mov|wmv)(\?|$)/.test(lower)) return true;
  // Login, search, calendar, news, media paths
  if (/\/(login|signin|sign-in|logout|search|calendar|news|press|media|blog|events|careers|jobs|staff|directory|contact-us|privacy|terms|sitemap)\b/.test(lower)) return true;
  // mailto / tel
  if (/^(mailto|tel):/.test(lower)) return true;
  return false;
}

/** Promise-based random delay between min and max milliseconds. */
function randomDelay(min = 2000, max = 4000) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolve a href against a page URL, returning null for invalid hrefs. */
function resolveUrl(href, pageUrl) {
  if (!href || href.startsWith("#") || href.startsWith("javascript")) return null;
  if (href.startsWith("http")) return href;
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return null;
  }
}

/** Extract all internal <a> hrefs from a loaded Cheerio page. */
function extractInternalLinks($, pageUrl, baseDomain) {
  const links = [];
  $("a").each((_i, el) => {
    const href = $(el).attr("href");
    const resolved = resolveUrl(href, pageUrl);
    if (!resolved) return;
    if (!isInternalUrl(resolved, baseDomain)) return;
    if (shouldSkipUrl(resolved)) return;
    const text = collapse($(el).text());
    links.push({ url: normalizeUrl(resolved), text });
  });
  return links;
}

// ---------------------------------------------------------------------------
// Page classification — scoring system
// ---------------------------------------------------------------------------

function classifyPage($, url) {
  let score = 0;
  const bodyText = $("body").text();
  const bodyLower = bodyText.toLowerCase();
  const textLength = bodyText.trim().length;

  // Very short page (redirect stub) — penalize heavily
  if (textLength < 200) score -= 5;

  // Dollar amounts on page (+3)
  if (/\$[\d,]{2,}(?:\.\d{2})?/.test(bodyText)) score += 3;

  // Deadline / due date language (+3)
  if (/\b(deadline|applications?\s+due|due\s+date|submissions?\s+due|closing\s+date)\b/i.test(bodyText)) score += 3;

  // Apply / application links (+3)
  let hasApplyLink = false;
  $("a").each((_i, el) => {
    if (hasApplyLink) return;
    const t = ($(el).text() || "").toLowerCase();
    const h = ($(el).attr("href") || "").toLowerCase();
    if (/apply\s*now|submit\s*application|application\s*form/i.test(t) || /apply|application/i.test(h)) {
      hasApplyLink = true;
    }
  });
  if (hasApplyLink) score += 3;

  // Grant-related PDFs (+3)
  let hasGrantPdf = false;
  $("a").each((_i, el) => {
    if (hasGrantPdf) return;
    const href = ($(el).attr("href") || "").toLowerCase();
    const text = ($(el).text() || "").toLowerCase();
    if (/\.pdf/.test(href) && /(guideline|application|rubric|rfp|nofa|grant)/i.test(text + " " + href)) {
      hasGrantPdf = true;
    }
  });
  if (hasGrantPdf) score += 3;

  // Grant keywords in headings (+2)
  let headingMatch = false;
  $("h1, h2, h3, h4").each((_i, el) => {
    if (headingMatch) return;
    if (textMatchesGrantKeyword($(el).text())) headingMatch = true;
  });
  if (headingMatch) score += 2;

  // Eligibility language (+2)
  if (/\b(who\s+may\s+apply|eligib|eligible\s+applicants?|qualifying\s+criteria)\b/i.test(bodyText)) score += 2;

  // Grant keywords in body text (+1 each, capped at 3)
  const grantBodyKeywords = ["funding", "award", "recipient", "applicant", "reimbursement", "cost-share", "matching funds"];
  let bodyKeywordScore = 0;
  for (const kw of grantBodyKeywords) {
    if (bodyLower.includes(kw)) bodyKeywordScore++;
    if (bodyKeywordScore >= 3) break;
  }
  score += bodyKeywordScore;

  // Grant keyword in URL (+1)
  if (textMatchesGrantKeyword(url)) score += 1;

  // Press release language (-1)
  if (/\b(press\s+release|news\s+article|press\s+room|media\s+advisory)\b/i.test(bodyText)) score -= 1;

  // Classify based on thresholds
  let confidence;
  if (score >= 7) confidence = "definitive";
  else if (score >= 3) confidence = "ambiguous";
  else confidence = "not-a-grant";

  return { score, confidence };
}

// ---------------------------------------------------------------------------
// Extract grant details from a loaded Cheerio page (synchronous)
// ---------------------------------------------------------------------------

function extractGrantDetail($, url) {
  // Title — skip nav junk
  let title = "";
  $("h1, h2").each((_i, el) => {
    if (title) return;
    const t = $(el).text().trim();
    if (t.length > 3 && !/^menu$/i.test(t) && !/^nav/i.test(t)) {
      title = collapse(t);
    }
  });
  if (!title) title = $("title").text().trim() || url;

  // Open / closed status
  const bodyText = $("body").text().toLowerCase();
  let status = "unknown";
  if (bodyText.includes("closed") || bodyText.includes("no longer accepting")) {
    status = "closed";
  } else if (
    bodyText.includes("now open") ||
    bodyText.includes("accepting applications") ||
    bodyText.includes("apply now")
  ) {
    status = "open";
  }

  // Dollar amounts
  const amountMatches = $("body").text().match(/\$[\d,]+(?:\.\d{2})?/g);

  // Deadline dates
  const dateRe =
    /(?:deadline|due|closes?|closing)\s*(?:date)?[:\s]*([A-Z][a-z]+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/gi;
  const deadlines = [];
  let dm;
  while ((dm = dateRe.exec($("body").text())) !== null) deadlines.push(dm[1]);

  // Documents
  const documents = [];
  $("a").each((_i, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    if (/\.(pdf|docx?|xlsx?)(\?|$)/i.test(href) || /application|guideline|rubric/i.test(text)) {
      let docUrl = href;
      if (!href.startsWith("http")) {
        try { docUrl = new URL(href, url).href; } catch { docUrl = null; }
      }
      if (docUrl) documents.push({ text: collapse(text), url: docUrl });
    }
  });

  return {
    url,
    title,
    status,
    amounts: amountMatches ? [...new Set(amountMatches)] : [],
    deadlines,
    documents,
  };
}

// ---------------------------------------------------------------------------
// BFS crawler for a single state site
// ---------------------------------------------------------------------------

async function crawlStateSite(agency) {
  const baseUrl = agency.url.replace(/\/+$/, "");
  let baseDomain;
  try {
    baseDomain = new URL(baseUrl).hostname;
  } catch {
    return { ...agency, error: "Invalid base URL", grants: [], crawlStats: { pagesVisited: 0, pagesSkipped: 0, durationMs: 0 } };
  }

  const startTime = Date.now();
  const visited = new Set();
  const grants = [];
  let pagesVisited = 0;
  let pagesSkipped = 0;

  // BFS queue: { url, depth, path (breadcrumb trail of URLs) }
  const queue = [{ url: normalizeUrl(baseUrl), depth: 0, path: [baseUrl] }];
  visited.add(normalizeUrl(baseUrl));

  while (queue.length > 0 && pagesVisited < MAX_PAGES_PER_STATE) {
    const { url: pageUrl, depth, path } = queue.shift();

    // Fetch page
    let html;
    try {
      html = await fetchPage(pageUrl);
    } catch {
      pagesSkipped++;
      continue;
    }
    pagesVisited++;

    const $ = cheerio.load(html);

    // Classify this page
    const { score, confidence } = classifyPage($, pageUrl);

    if (confidence === "definitive") {
      const detail = extractGrantDetail($, pageUrl);
      // Use the page title as the grant text
      grants.push({
        type: "crawled",
        text: detail.title,
        url: pageUrl,
        confidence: "definitive",
        discoveredAt: { depth, path: [...path] },
        detail,
      });
    } else if (confidence === "ambiguous") {
      // Extract title for display but don't do full detail extraction
      let title = "";
      $("h1, h2").each((_i, el) => {
        if (title) return;
        const t = $(el).text().trim();
        if (t.length > 3 && !/^menu$/i.test(t) && !/^nav/i.test(t)) {
          title = collapse(t);
        }
      });
      if (!title) title = $("title").text().trim() || pageUrl;

      grants.push({
        type: "crawled",
        text: title,
        url: pageUrl,
        confidence: "ambiguous",
        discoveredAt: { depth, path: [...path] },
        detail: null,
      });
    }
    // "not-a-grant" pages are silently skipped (no grant entry)

    // Enqueue child links if we haven't hit max depth
    if (depth < MAX_DEPTH) {
      const links = extractInternalLinks($, pageUrl, baseDomain);

      // Three-tier BFS priority:
      //   High   — grant keywords in text/href → front of queue
      //   Medium — priority keywords in text/href → after high-priority
      //   Normal — everything else → back of queue
      const highLinks = [];
      const mediumLinks = [];
      const normalLinks = [];

      for (const link of links) {
        const norm = link.url;
        if (visited.has(norm)) continue;
        visited.add(norm);

        const entry = { url: norm, depth: depth + 1, path: [...path, norm] };
        if (textMatchesGrantKeyword(link.text) || textMatchesGrantKeyword(norm)) {
          highLinks.push(entry);
        } else if (textMatchesPriorityKeyword(link.text) || textMatchesPriorityKeyword(norm)) {
          mediumLinks.push(entry);
        } else {
          normalLinks.push(entry);
        }
      }

      // Medium first so high ends up at the very front after its unshift
      queue.unshift(...mediumLinks);
      queue.unshift(...highLinks);
      queue.push(...normalLinks);
    }

    // Polite delay between requests (skip delay after last page)
    if (queue.length > 0 && pagesVisited < MAX_PAGES_PER_STATE) {
      await randomDelay(2000, 4000);
    }
  }

  const durationMs = Date.now() - startTime;
  return {
    ...agency,
    error: null,
    grants: dedup(grants),
    crawlStats: { pagesVisited, pagesSkipped, durationMs },
  };
}

// ---------------------------------------------------------------------------
// Grants.gov CSV parsing
// ---------------------------------------------------------------------------

const AG_FOOD_KEYWORDS = [
  "agriculture", "agricultural", "farming", "farm",
  "food distribution", "food access", "food security", "food insecurity",
  "food assistance", "food supply", "food system", "food desert",
  "food bank", "food pantry", "nutrition", "snap ",
  "supplemental nutrition", "crop", "livestock", "rural development",
  "specialty crop", "farmers market", "agribusiness", "horticulture",
  "aquaculture", "food safety", "food and nutrition", "fresh food",
  "hunger", "usda",
];

const AG_FOOD_CATEGORIES = ["food_and_nutrition", "agriculture"];

const FDA_PHARMA_EXCLUSIONS = [
  "clinical trial", "drug product", "drug development", "orphan product",
  "drug-drug interaction", "pharmaceutical", "pharmacokinetic",
  "diastereomer", "sirna drug", "oncology therapeutic", "analgesi",
  "anestheti", "generics", "dose dumping", "injectable suspension",
  "topical drug", "biologica", "nitrosamine", "cardiotoxicity",
  "rare disease", "neurodegenerative", "skin lightening", "tobacco research",
  "outsourcing facilit", "machine learning with computational fluid",
  "r01 clinical", "u01 clinical", "u18 clinical", "r13 clinical",
];

function matchesAgFood(text) {
  const lower = text.toLowerCase();
  return AG_FOOD_KEYWORDS.some((kw) => lower.includes(kw));
}

function looksLikePharmaDrug(title, description) {
  const combined = (title + " " + description).toLowerCase();
  return FDA_PHARMA_EXCLUSIONS.some((pat) => combined.includes(pat));
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function parseGrantsGovCsv(csvPath) {
  const raw = readFileSync(csvPath, "utf-8");
  const records = parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true });
  const matches = [];

  for (const row of records) {
    const categories = (row.funding_categories || "").toLowerCase();
    const title = row.opportunity_title || "";
    const agency = row.agency_name || "";
    const topAgency = row.top_level_agency_name || "";
    const description = stripHtml(row.summary_description || "");
    const catDesc = row.funding_category_description || "";

    const categoryMatch = AG_FOOD_CATEGORIES.some((c) => categories.includes(c));
    const titleOrDescMatch = matchesAgFood(title) || matchesAgFood(description) || matchesAgFood(catDesc);
    const agencyIsUsda = topAgency.toLowerCase().includes("department of agriculture");
    const agencyIsFda = agency.toLowerCase().includes("food and drug");
    const agencyMatch = agencyIsUsda || (matchesAgFood(agency) && !agencyIsFda);
    const fdaWithContent = agencyIsFda && titleOrDescMatch;

    if (agencyIsFda && looksLikePharmaDrug(title, description)) continue;

    if (categoryMatch || titleOrDescMatch || agencyMatch || fdaWithContent) {
      matches.push({
        id: row.opportunity_id,
        number: row.opportunity_number,
        title,
        status: row.opportunity_status,
        agency,
        topAgency,
        category: row.category,
        fundingCategories: row.funding_categories,
        postDate: row.post_date,
        closeDate: row.close_date,
        closeDateDescription: row.close_date_description,
        costSharing: row.is_cost_sharing,
        expectedAwards: row.expected_number_of_awards,
        totalFunding: row.estimated_total_program_funding,
        awardFloor: row.award_floor,
        awardCeiling: row.award_ceiling,
        applicantTypes: row.applicant_types,
        contactDescription: collapse(row.agency_contact_description || ""),
        contactEmail: row.agency_email_address,
        url: row.url,
        summary: description.slice(0, 500),
        matchedOn: categoryMatch ? "category" : agencyIsUsda ? "usda-agency" : titleOrDescMatch ? "keyword" : "fda-food-related",
      });
    }
  }
  return matches;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function collapse(str) {
  return str.replace(/\s+/g, " ").trim();
}

function dedup(items) {
  const seenText = new Set();
  const seenUrl = new Set();
  return items.filter((item) => {
    const textKey = item.text?.toLowerCase();
    const urlKey = item.url;
    // Skip if we already have an entry with the same URL or same text.
    if (urlKey && seenUrl.has(urlKey)) return false;
    if (textKey && seenText.has(textKey)) return false;
    if (urlKey) seenUrl.add(urlKey);
    if (textKey) seenText.add(textKey);
    return true;
  });
}

function formatCurrency(val) {
  const n = Number(val);
  if (!n || isNaN(n)) return val || "—";
  return "$" + n.toLocaleString("en-US");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes("--json");
  const skipStates = args.includes("--grants-gov-only");
  const skipGrantsGov = args.includes("--states-only");
  const csvArg = args.find((a) => a.endsWith(".csv"));
  const stateFilter = args
    .find((a) => a.startsWith("--state="))
    ?.split("=")[1]
    ?.split(",")
    .map((s) => s.toUpperCase());

  if (!jsonMode) {
    console.log("=".repeat(70));
    console.log("  Agriculture Grant Opportunity Scraper");
    console.log("  Sources: 50 State Ag Departments + Grants.gov");
    console.log("  Run date:", new Date().toISOString());
    console.log("=".repeat(70));
  }

  // -----------------------------------------------------------------------
  // State agency scraping — BFS crawler
  // -----------------------------------------------------------------------
  let stateResults = [];

  if (!skipStates) {
    let agencies = STATE_AGENCIES;
    if (stateFilter) {
      agencies = agencies.filter((a) => stateFilter.includes(a.state));
    }

    if (!jsonMode) {
      console.log(`\n[1] Crawling ${agencies.length} state agriculture department websites...`);
      console.log(`    (concurrency: ${CRAWL_CONCURRENCY}, max depth: ${MAX_DEPTH}, max pages/state: ${MAX_PAGES_PER_STATE})\n`);
    }

    const crawlTasks = agencies.map((agency) => () => crawlStateSite(agency));
    stateResults = await pooled(crawlTasks);

    // Display
    if (!jsonMode) {
      let totalGrantRefs = 0;
      let totalDefinitive = 0;
      let totalAmbiguous = 0;
      for (const result of stateResults) {
        if (result.error) {
          console.log(`  [${result.state}] ${result.name}`);
          console.log(`    ERROR: ${result.error}\n`);
          continue;
        }
        const definitive = result.grants.filter((g) => g.confidence === "definitive").length;
        const ambiguous = result.grants.filter((g) => g.confidence === "ambiguous").length;
        const stats = result.crawlStats || {};
        const durationSec = stats.durationMs ? (stats.durationMs / 1000).toFixed(0) : "?";

        if (result.grants.length === 0) {
          console.log(`  [${result.state}] Done — ${stats.pagesVisited || 0} pages, 0 grants (${durationSec}s)`);
          continue;
        }
        totalGrantRefs += result.grants.length;
        totalDefinitive += definitive;
        totalAmbiguous += ambiguous;
        console.log(`  [${result.state}] Done — ${stats.pagesVisited || 0} pages, ${result.grants.length} grants (${definitive} definitive, ${ambiguous} ambiguous) ${durationSec}s`);
        for (const g of result.grants) {
          const conf = g.confidence === "ambiguous" ? " [NEEDS REVIEW]" : "";
          const depth = g.discoveredAt ? ` (depth ${g.discoveredAt.depth})` : "";
          console.log(`    ${g.text}${conf}${depth}`);
          if (g.url) console.log(`           ${g.url}`);
          if (g.detail) {
            if (g.detail.status !== "unknown") console.log(`           Status: ${g.detail.status.toUpperCase()}`);
            if (g.detail.amounts?.length) console.log(`           Amounts: ${g.detail.amounts.join(", ")}`);
            if (g.detail.deadlines?.length) console.log(`           Deadline: ${g.detail.deadlines.join(", ")}`);
            if (g.detail.documents?.length) {
              for (const d of g.detail.documents.slice(0, 3)) {
                console.log(`           Doc: ${d.text} -> ${d.url}`);
              }
              if (g.detail.documents.length > 3) console.log(`           ... and ${g.detail.documents.length - 3} more`);
            }
          }
        }
        console.log();
      }
      console.log(`  Total: ${totalGrantRefs} grants across ${stateResults.filter((s) => s.grants.length > 0).length} states (${totalDefinitive} definitive, ${totalAmbiguous} needs review)\n`);
    }
  }

  // -----------------------------------------------------------------------
  // Grants.gov CSV
  // -----------------------------------------------------------------------
  let grantsGovResults = [];

  if (!skipGrantsGov && csvArg) {
    if (!jsonMode) console.log(`[2] Parsing Grants.gov CSV for agriculture / food opportunities...\n`);

    grantsGovResults = parseGrantsGovCsv(csvArg);
    const open = grantsGovResults.filter((g) => g.status === "posted" || g.status === "forecasted");
    const closed = grantsGovResults.filter((g) => g.status !== "posted" && g.status !== "forecasted");

    if (!jsonMode) {
      console.log(`  Found ${grantsGovResults.length} matching opportunities`);
      console.log(`    ${open.length} open/forecasted  |  ${closed.length} closed/archived\n`);

      if (open.length > 0) {
        console.log("-".repeat(70));
        console.log("  OPEN / FORECASTED OPPORTUNITIES");
        console.log("-".repeat(70));
        for (const g of open) {
          console.log();
          console.log(`  ${g.title}`);
          console.log(`    Status:        ${g.status.toUpperCase()}`);
          console.log(`    Agency:        ${g.agency} (${g.topAgency})`);
          console.log(`    Posted:        ${g.postDate || "—"}`);
          console.log(`    Closes:        ${g.closeDate || "—"}${g.closeDateDescription ? "  (" + g.closeDateDescription + ")" : ""}`);
          console.log(`    Total funding: ${formatCurrency(g.totalFunding)}`);
          console.log(`    Award range:   ${formatCurrency(g.awardFloor)} – ${formatCurrency(g.awardCeiling)}`);
          console.log(`    Expected #:    ${g.expectedAwards || "—"}`);
          console.log(`    Cost sharing:  ${g.costSharing}`);
          if (g.contactEmail) console.log(`    Contact:       ${g.contactDescription} <${g.contactEmail}>`);
          if (g.url) console.log(`    URL:           ${g.url}`);
          if (g.summary) console.log(`    Summary:       ${g.summary.slice(0, 300)}...`);
        }
        console.log();
      }

      if (closed.length > 0) {
        console.log("-".repeat(70));
        console.log(`  CLOSED / ARCHIVED (${closed.length} — titles only)`);
        console.log("-".repeat(70));
        for (const g of closed) {
          console.log(`    [${g.status}] ${g.title}  (closed ${g.closeDate || "—"})`);
        }
        console.log();
      }
    }
  } else if (!skipGrantsGov && !csvArg && !jsonMode) {
    console.log("\n  Tip: pass a Grants.gov CSV to also search federal opportunities:");
    console.log("    node scraper.mjs grants-search-*.csv\n");
  }

  // -----------------------------------------------------------------------
  // JSON output
  // -----------------------------------------------------------------------
  if (jsonMode) {
    const output = {
      scrapedAt: new Date().toISOString(),
      stateAgencies: skipStates ? null : stateResults,
      grantsGov: skipGrantsGov ? null : {
        csvFile: csvArg || null,
        totalMatches: grantsGovResults.length,
        results: grantsGovResults,
      },
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log("=".repeat(70));
    console.log("  Done.");
    console.log("  Flags: --json | --states-only | --grants-gov-only | --state=VA,MD");
    console.log("=".repeat(70));
  }
}

// ---------------------------------------------------------------------------
// Exports for Tools/crawl-state.mjs and other consumers
// ---------------------------------------------------------------------------

export {
  STATE_AGENCIES, crawlStateSite, pooled, dedup,
  normalizeUrl, isInternalUrl, shouldSkipUrl, randomDelay,
  resolveUrl, extractInternalLinks, classifyPage, extractGrantDetail,
  textMatchesGrantKeyword, textMatchesPriorityKeyword, collapse,
  fetchPage, GRANT_KEYWORDS, PRIORITY_KEYWORDS,
};

// Only run main() when executed directly (not when imported)
const isDirectRun = process.argv[1] &&
  new URL(process.argv[1], "file://").pathname ===
  new URL(import.meta.url).pathname;
if (isDirectRun) {
  main().catch((err) => { console.error("Scraper failed:", err.message); process.exit(1); });
}
