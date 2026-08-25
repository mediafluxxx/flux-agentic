#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Generic BFS crawler CLI — wraps shared logic from scraper.mjs
//
// Usage:
//   node Tools/crawl-state.mjs <url> [options]
//
// Options:
//   --depth <n>         Max crawl depth (default: 2)
//   --max-pages <n>     Max pages to visit (default: 50)
//   --delay <ms>        Delay between requests in ms (default: 2000-4000 random)
//   --user-agent <str>  Custom User-Agent string
//   --output <file>     Write JSON results to file (default: stdout)
//   --verbose           Print each URL as it's visited
// ---------------------------------------------------------------------------

import { writeFileSync } from "node:fs";
import axios from "axios";
import * as cheerio from "cheerio";

import {
  normalizeUrl, isInternalUrl, shouldSkipUrl, randomDelay,
  resolveUrl, extractInternalLinks, classifyPage, extractGrantDetail,
  textMatchesGrantKeyword, textMatchesPriorityKeyword, collapse,
  GRANT_KEYWORDS, PRIORITY_KEYWORDS,
} from "../scraper.mjs";

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getFlag(name) {
  return args.includes(name);
}

function getOption(name, fallback) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  return args[idx + 1];
}

const startUrl = args.find((a) => !a.startsWith("--"));
if (!startUrl) {
  console.error(`Usage: node Tools/crawl-state.mjs <url> [options]

Options:
  --depth <n>         Max crawl depth (default: 2)
  --max-pages <n>     Max pages to visit (default: 50)
  --delay <ms>        Fixed delay between requests in ms (default: random 2000-4000)
  --user-agent <str>  Custom User-Agent string
  --output <file>     Write JSON results to file (default: stdout)
  --verbose           Print each URL as it's visited`);
  process.exit(1);
}

const maxDepth = Number(getOption("--depth", 2));
const maxPages = Number(getOption("--max-pages", 50));
const fixedDelay = getOption("--delay", null);
const userAgent = getOption("--user-agent", "Mozilla/5.0 (compatible; AgGrantScraper/2.0; educational-use)");
const outputFile = getOption("--output", null);
const verbose = getFlag("--verbose");

// ---------------------------------------------------------------------------
// Fetch helper (uses custom user-agent if provided)
// ---------------------------------------------------------------------------

async function fetchPage(url) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml",
    },
    timeout: 20_000,
    maxRedirects: 5,
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Delay helper — uses fixed delay if --delay is set, otherwise random
// ---------------------------------------------------------------------------

function delay() {
  if (fixedDelay !== null) {
    const ms = Number(fixedDelay);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  return randomDelay(2000, 4000);
}

// ---------------------------------------------------------------------------
// BFS crawl
// ---------------------------------------------------------------------------

async function crawl(baseUrl) {
  let baseDomain;
  try {
    baseDomain = new URL(baseUrl).hostname;
  } catch {
    console.error("Invalid URL:", baseUrl);
    process.exit(1);
  }

  const startTime = Date.now();
  const visited = new Set();
  const grants = [];
  let pagesVisited = 0;
  let pagesSkipped = 0;

  const queue = [{ url: normalizeUrl(baseUrl), depth: 0, path: [baseUrl] }];
  visited.add(normalizeUrl(baseUrl));

  while (queue.length > 0 && pagesVisited < maxPages) {
    const { url: pageUrl, depth, path } = queue.shift();

    if (verbose) {
      process.stderr.write(`[VISIT] depth=${depth} ${pageUrl}\n`);
    }

    let html;
    try {
      html = await fetchPage(pageUrl);
    } catch (err) {
      pagesSkipped++;
      if (verbose) {
        process.stderr.write(`[SKIP]  ${pageUrl} — ${err.message}\n`);
      }
      continue;
    }
    pagesVisited++;

    const $ = cheerio.load(html);
    const { score, confidence } = classifyPage($, pageUrl);

    if (confidence === "definitive" || confidence === "ambiguous") {
      const detail = confidence === "definitive" ? extractGrantDetail($, pageUrl) : null;

      let title = "";
      if (!detail) {
        $("h1, h2").each((_i, el) => {
          if (title) return;
          const t = $(el).text().trim();
          if (t.length > 3 && !/^menu$/i.test(t) && !/^nav/i.test(t)) {
            title = collapse(t);
          }
        });
        if (!title) title = $("title").text().trim() || pageUrl;
      }

      grants.push({
        type: "crawled",
        text: detail ? detail.title : title,
        url: pageUrl,
        confidence,
        score,
        discoveredAt: { depth, path: [...path] },
        detail,
      });

      // Log grant-page URLs to stderr so they don't mix with JSON on stdout
      process.stderr.write(`[GRANT FOUND] ${pageUrl}\n`);
    }

    // Enqueue child links
    if (depth < maxDepth) {
      const links = extractInternalLinks($, pageUrl, baseDomain);

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

      queue.unshift(...mediumLinks);
      queue.unshift(...highLinks);
      queue.push(...normalLinks);
    }

    if (queue.length > 0 && pagesVisited < maxPages) {
      await delay();
    }
  }

  const durationMs = Date.now() - startTime;
  return {
    baseUrl,
    crawlStats: { pagesVisited, pagesSkipped, durationMs },
    grants,
  };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const result = await crawl(startUrl.replace(/\/+$/, ""));
const json = JSON.stringify(result, null, 2);

if (outputFile) {
  writeFileSync(outputFile, json);
  process.stderr.write(`Results written to ${outputFile}\n`);
} else {
  console.log(json);
}

process.stderr.write(
  `\nDone: ${result.crawlStats.pagesVisited} pages visited, ` +
  `${result.grants.length} grant(s) found in ${(result.crawlStats.durationMs / 1000).toFixed(0)}s\n`
);
