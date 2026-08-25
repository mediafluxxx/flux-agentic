import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf-8"));
const states = data.stateAgencies || [];
const grantsGov = data.grantsGov?.results || [];
const openFederal = grantsGov.filter((g) => g.status === "posted" || g.status === "forecasted");
const statesWithGrants = states.filter((s) => s.grants.length > 0);
const needsReviewCount = states.reduce((a, s) => a + s.grants.filter((g) => g.confidence === "ambiguous").length, 0);
const totalGrantRefs = states.reduce((a, s) => a + s.grants.length, 0);

// Load urban farm data (optional — may not exist yet)
let urbanData = { stateResults: [], nationalOrgs: [] };
try {
  urbanData = JSON.parse(readFileSync(new URL("./urban-data.json", import.meta.url), "utf-8"));
} catch {
  // urban-data.json not yet generated — proceed without it
}
const totalUrbanResources = (urbanData.stateResults || []).reduce((a, s) => a + (s.urbanResources?.length || 0), 0);

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function esc(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtCurrency(val) {
  const n = Number(val);
  if (!n || isNaN(n)) return "";
  return "$" + n.toLocaleString("en-US");
}

function statusBadge(status) {
  if (!status) return "";
  const cls = status === "open" || status === "posted" || status === "forecasted" ? "open" : status === "closed" ? "closed" : "unknown";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return `<span class="badge badge-${cls}">${esc(label)}</span>`;
}

// ---------------------------------------------------------------------------
// Shared CSS
// ---------------------------------------------------------------------------

function sharedCss() {
  return `
  :root {
    --green-900: #1a3a1a;
    --green-700: #2d5a2d;
    --green-600: #3a7a3a;
    --green-100: #e8f5e8;
    --green-50: #f0faf0;
    --gold-600: #b8860b;
    --gold-100: #fef9e7;
    --red-600: #c0392b;
    --red-100: #fdecea;
    --gray-50: #f8f9fa;
    --gray-100: #e9ecef;
    --gray-200: #dee2e6;
    --gray-400: #ced4da;
    --gray-600: #6c757d;
    --gray-800: #343a40;
    --gray-900: #212529;
    --shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.08);
    --shadow-lg: 0 4px 12px rgba(0,0,0,.1);
    --radius: 8px;
  }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0; padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
    background: var(--gray-50); color: var(--gray-900);
    line-height: 1.6;
  }

  /* Hero */
  .hero {
    background: linear-gradient(135deg, var(--green-900) 0%, var(--green-700) 100%);
    color: #fff; padding: 3rem 2rem; text-align: center;
  }
  .hero h1 { margin: 0 0 .5rem; font-size: 2.2rem; font-weight: 700; }
  .hero p { margin: 0; opacity: .85; font-size: 1.1rem; }
  .hero a { color: #fff; }
  .hero .stats {
    display: flex; gap: 2rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;
  }
  .hero .stat { text-align: center; }
  .hero .stat-num { font-size: 2rem; font-weight: 700; display: block; }
  .hero .stat-label { font-size: .85rem; opacity: .7; text-transform: uppercase; letter-spacing: .05em; }
  .hero-compact { padding: 2rem 2rem 1.5rem; }
  .hero-compact h1 { font-size: 1.8rem; }

  /* Page nav (inter-page links) */
  .page-nav {
    position: sticky; top: 0; z-index: 100;
    background: #fff; border-bottom: 1px solid var(--gray-200);
    display: flex; justify-content: center; gap: 0; box-shadow: var(--shadow);
  }
  .page-nav a {
    display: inline-block; padding: 1rem 2rem; text-decoration: none;
    font-size: 1rem; font-weight: 500; color: var(--gray-600);
    border-bottom: 3px solid transparent; transition: all .2s;
  }
  .page-nav a:hover { color: var(--green-700); }
  .page-nav a.active { color: var(--green-700); border-bottom-color: var(--green-600); }

  /* Filter bar */
  .filter-bar {
    max-width: 1200px; margin: 1.5rem auto; padding: 0 1.5rem;
    display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;
  }
  .filter-bar input, .filter-bar select {
    padding: .6rem 1rem; border: 1px solid var(--gray-400); border-radius: var(--radius);
    font-size: .95rem; background: #fff;
  }
  .filter-bar input { flex: 1; min-width: 200px; }
  .filter-bar select { min-width: 140px; }
  .result-count { font-size: .85rem; color: var(--gray-600); margin-left: auto; }

  /* Badges */
  .badge {
    display: inline-block; font-size: .7rem; font-weight: 600; padding: .15rem .5rem;
    border-radius: 4px; text-transform: uppercase; letter-spacing: .03em; margin-left: .5rem;
    vertical-align: middle;
  }
  .badge-open { background: var(--green-100); color: var(--green-700); }
  .badge-closed { background: var(--red-100); color: var(--red-600); }
  .badge-unknown { background: var(--gray-100); color: var(--gray-600); }
  .badge-error { background: var(--red-100); color: var(--red-600); }
  .badge-none { background: var(--gray-100); color: var(--gray-600); }
  .badge-review { background: var(--gold-100); color: var(--gold-600); }

  .timestamp { text-align: center; padding: 2rem; color: var(--gray-600); font-size: .85rem; }

  /* Responsive */
  @media (max-width: 768px) {
    .hero h1 { font-size: 1.5rem; }
    .hero .stats { gap: 1rem; }
    .page-nav a { padding: .75rem 1rem; font-size: .85rem; }
    .filter-bar { flex-direction: column; }
    .filter-bar input { min-width: 100%; }
  }`;
}

function htmlHead(title, extraCss = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>${sharedCss()}${extraCss}
</style>
</head>
<body>`;
}

function pageNav(activePage, pathPrefix = "") {
  const links = [
    { id: "home", label: "Home", href: `${pathPrefix}index.html` },
    { id: "state", label: "State Grants", href: `${pathPrefix}state-grants.html` },
    { id: "federal", label: "Federal Grants", href: `${pathPrefix}federal-grants.html` },
  ];
  return `
<div class="page-nav">
  ${links.map((l) => `<a href="${l.href}" class="${l.id === activePage ? "active" : ""}">${l.label}</a>`).join("\n  ")}
</div>`;
}

function pageFooter() {
  return `
<div class="timestamp">
  Data scraped: ${esc(data.scrapedAt)}<br>
  Sources: 50 state agriculture department websites + <a href="https://www.grants.gov" target="_blank">Grants.gov</a>
</div>`;
}

// ---------------------------------------------------------------------------
// State card builder (summary view for state-grants.html — keeps truncation
// for the overview page since individual state pages show full data)
// ---------------------------------------------------------------------------

function buildStateCard(s) {
  if (s.error) {
    return `
    <div class="state-card state-error" id="state-${esc(s.state)}">
      <div class="state-header">
        <h3>${esc(s.state)} — ${esc(s.name)}</h3>
        <div class="state-header-right">
          <span class="badge badge-error">Unreachable</span>
          <a href="states/${esc(s.state)}.html" class="view-full-link">View Full Details &rarr;</a>
        </div>
      </div>
      <p class="state-url"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></p>
      <p class="error-msg">${esc(s.error)}</p>
    </div>`;
  }
  if (s.grants.length === 0) {
    return `
    <div class="state-card state-empty" id="state-${esc(s.state)}">
      <div class="state-header">
        <h3>${esc(s.state)} — ${esc(s.name)}</h3>
        <div class="state-header-right">
          <span class="badge badge-none">No grants found</span>
          <a href="states/${esc(s.state)}.html" class="view-full-link">View Full Details &rarr;</a>
        </div>
      </div>
      <p class="state-url"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></p>
    </div>`;
  }

  const hasReviewItems = s.grants.some((g) => g.confidence === "ambiguous");

  const grantRows = s.grants.map((g) => {
    const isAmbiguous = g.confidence === "ambiguous";
    const detail = g.detail || {};
    const statusHtml = detail.status ? statusBadge(detail.status) : "";
    const reviewBadge = isAmbiguous ? `<span class="badge badge-review">Needs Review</span>` : "";
    const amounts = (detail.amounts || []).filter((a) => a.length < 15).slice(0, 3).join(", ");
    const deadlines = (detail.deadlines || []).join(", ");
    const docs = (detail.documents || []).slice(0, 3);
    const extraDocs = (detail.documents || []).length - 3;
    const depthInfo = g.discoveredAt ? `<span class="meta-tag">Depth: ${g.discoveredAt.depth}</span>` : "";

    let docsHtml = "";
    if (docs.length > 0) {
      docsHtml = `<div class="docs"><strong>Documents:</strong><ul>${docs
        .map((d) => `<li><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.text || "Document")}</a></li>`)
        .join("")}${extraDocs > 0 ? `<li class="more">+ ${extraDocs} more</li>` : ""}</ul></div>`;
    }

    return `
      <div class="grant-item${isAmbiguous ? " grant-ambiguous" : ""}">
        <div class="grant-title">
          ${g.url ? `<a href="${esc(g.url)}" target="_blank" rel="noopener">${esc(g.text)}</a>` : esc(g.text)}
          ${statusHtml}${reviewBadge}
        </div>
        <div class="grant-meta">
          ${amounts ? `<span class="meta-tag">Amount: ${esc(amounts)}</span>` : ""}
          ${deadlines ? `<span class="meta-tag">Deadline: ${esc(deadlines)}</span>` : ""}
          ${depthInfo}
        </div>
        ${docsHtml}
      </div>`;
  });

  const stats = s.crawlStats || {};
  const crawlInfo = stats.pagesVisited
    ? `<p class="crawl-stats">Crawled ${stats.pagesVisited} pages in ${(stats.durationMs / 1000).toFixed(0)}s</p>`
    : "";

  return `
  <div class="state-card${hasReviewItems ? " has-review" : ""}" id="state-${esc(s.state)}">
    <div class="state-header">
      <h3>${esc(s.state)} — ${esc(s.name)}</h3>
      <div class="state-header-right">
        <span class="grant-count">${s.grants.length} grant${s.grants.length !== 1 ? "s" : ""}</span>
        <a href="states/${esc(s.state)}.html" class="view-full-link">View Full Details &rarr;</a>
      </div>
    </div>
    <p class="state-url"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></p>
    ${crawlInfo}
    <div class="grants-list">${grantRows.join("")}</div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Full grant item builder (ZERO TRUNCATION — for individual state pages)
// ---------------------------------------------------------------------------

function buildFullGrantItem(g) {
  const isAmbiguous = g.confidence === "ambiguous";
  const detail = g.detail || {};
  const statusHtml = detail.status ? statusBadge(detail.status) : "";
  const reviewBadge = isAmbiguous ? `<span class="badge badge-review">Needs Review</span>` : "";

  // ALL amounts — no filter, no slice
  const amounts = (detail.amounts || []).join(", ");

  // ALL deadlines
  const deadlines = (detail.deadlines || []).join(", ");

  // ALL documents — no slice, no "+ N more"
  const allDocs = detail.documents || [];
  let docsHtml = "";
  if (allDocs.length > 0) {
    docsHtml = `<div class="docs"><strong>Documents (${allDocs.length}):</strong><ul>${allDocs
      .map((d) => `<li><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.text || "Document")}</a></li>`)
      .join("")}</ul></div>`;
  }

  // Full discovery path
  let discoveryHtml = "";
  if (g.discoveredAt) {
    const pathList = g.discoveredAt.path || [];
    discoveryHtml = `
      <div class="discovery-info">
        <strong>Discovery:</strong> Depth ${g.discoveredAt.depth}
        ${pathList.length > 1 ? `<div class="discovery-path"><strong>Path:</strong><ol>${pathList.map((p) => `<li><a href="${esc(p)}" target="_blank" rel="noopener">${esc(p)}</a></li>`).join("")}</ol></div>` : ""}
      </div>`;
  }

  return `
    <div class="grant-item${isAmbiguous ? " grant-ambiguous" : ""}">
      <div class="grant-title">
        ${g.url ? `<a href="${esc(g.url)}" target="_blank" rel="noopener">${esc(g.text)}</a>` : esc(g.text)}
        ${statusHtml}${reviewBadge}
      </div>
      <div class="grant-meta">
        ${amounts ? `<span class="meta-tag">Amounts: ${esc(amounts)}</span>` : ""}
        ${deadlines ? `<span class="meta-tag">Deadlines: ${esc(deadlines)}</span>` : ""}
      </div>
      ${docsHtml}
      ${discoveryHtml}
    </div>`;
}

// ---------------------------------------------------------------------------
// Individual state page builder
// ---------------------------------------------------------------------------

const statePageCss = `
  .section { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
  .grant-item { padding: .75rem 0; border-top: 1px solid var(--gray-100); }
  .grant-item:first-child { border-top: none; }
  .grant-title { font-weight: 500; }
  .grant-title a { color: var(--green-700); text-decoration: none; }
  .grant-title a:hover { text-decoration: underline; }
  .grant-meta { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .25rem; }
  .meta-tag {
    font-size: .8rem; background: var(--gray-100); color: var(--gray-800);
    padding: .15rem .5rem; border-radius: 4px; word-break: break-word;
  }
  .docs { margin-top: .5rem; font-size: .85rem; }
  .docs ul { margin: .25rem 0 0; padding-left: 1.2rem; }
  .docs li { margin-bottom: .15rem; }
  .docs a { color: var(--green-700); }
  .error-msg { color: var(--red-600); font-size: .95rem; margin: 1rem 0; }
  .grant-ambiguous {
    background: var(--gold-100); border-radius: 4px;
    padding: .75rem .5rem; margin: .25rem -.5rem;
  }
  .crawl-stats {
    font-size: .85rem; color: var(--gray-600); font-style: italic; margin: .5rem 0 1rem;
  }
  .grants-section {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 1.25rem; border-left: 4px solid var(--green-600); margin-bottom: 1.5rem;
  }
  .grants-section h2 { margin: 0 0 .75rem; font-size: 1.2rem; color: var(--green-700); }

  /* Discovery path */
  .discovery-info {
    margin-top: .5rem; font-size: .85rem; color: var(--gray-600);
  }
  .discovery-path ol {
    margin: .25rem 0 0; padding-left: 1.5rem; font-size: .8rem;
  }
  .discovery-path li { margin-bottom: .15rem; word-break: break-all; }
  .discovery-path a { color: var(--gray-600); }

  /* Urban resources section */
  .urban-section {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    margin-bottom: 1.5rem; padding: 1.25rem; border-left: 4px solid var(--gold-600);
  }
  .urban-section h2 { margin: 0 0 .75rem; font-size: 1.2rem; color: var(--gold-600); }
  .urban-item { padding: .5rem 0; border-top: 1px solid var(--gray-100); }
  .urban-item:first-child { border-top: none; }
  .urban-item a { color: var(--green-700); text-decoration: none; font-weight: 500; }
  .urban-item a:hover { text-decoration: underline; }
  .urban-context { font-size: .85rem; color: var(--gray-600); margin: .25rem 0 0; }
  .urban-keywords { display: flex; gap: .25rem; flex-wrap: wrap; margin-top: .25rem; }
  .urban-keyword {
    font-size: .7rem; background: var(--gold-100); color: var(--gold-600);
    padding: .1rem .4rem; border-radius: 3px; font-weight: 600;
  }

  /* National orgs */
  .national-orgs {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    margin-bottom: 1.5rem; padding: 1.25rem; border-left: 4px solid #4a90d9;
  }
  .national-orgs h2 { margin: 0 0 .75rem; font-size: 1.2rem; color: #4a90d9; }
  .national-orgs .org-card {
    padding: .75rem 0; border-top: 1px solid var(--gray-100);
  }
  .national-orgs .org-card:first-child { border-top: none; }
  .national-orgs .org-name { font-weight: 600; }
  .national-orgs .org-name a { color: var(--green-700); text-decoration: none; }
  .national-orgs .org-name a:hover { text-decoration: underline; }
  .national-orgs .org-resources { margin-top: .25rem; padding-left: 1rem; font-size: .9rem; }
  .national-orgs .org-resources li { margin-bottom: .2rem; }
  .national-orgs .org-resources a { color: var(--green-700); text-decoration: none; }
  .national-orgs .org-resources a:hover { text-decoration: underline; }

  .back-link {
    display: inline-block; margin-bottom: 1rem; color: var(--green-700);
    text-decoration: none; font-size: .9rem; font-weight: 500;
  }
  .back-link:hover { text-decoration: underline; }`;

function buildStatePage(s) {
  const urbanState = (urbanData.stateResults || []).find((u) => u.state === s.state);
  const urbanResources = urbanState?.urbanResources || [];
  const nationalOrgs = urbanData.nationalOrgs || [];

  const stats = s.crawlStats || {};
  const defCount = s.grants.filter((g) => g.confidence === "definitive").length;
  const ambCount = s.grants.filter((g) => g.confidence === "ambiguous").length;

  const grantItems = s.grants.map(buildFullGrantItem).join("");

  // Urban resources section (state-specific)
  let urbanHtml = "";
  if (urbanResources.length > 0) {
    urbanHtml = `
    <div class="urban-section">
      <h2>Urban Farm Resources — ${esc(s.state)} (${urbanResources.length})</h2>
      ${urbanResources.map((r) => `
        <div class="urban-item">
          <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.text)}</a>
          ${r.context ? `<p class="urban-context">${esc(r.context)}</p>` : ""}
          <div class="urban-keywords">
            ${(r.matchedKeywords || []).map((kw) => `<span class="urban-keyword">${esc(kw)}</span>`).join("")}
          </div>
        </div>`).join("")}
    </div>`;
  }

  // National urban ag orgs (shown on every state page)
  let nationalHtml = "";
  if (nationalOrgs.length > 0) {
    nationalHtml = `
    <div class="national-orgs">
      <h2>National Urban Agriculture Organizations</h2>
      <p style="font-size:.9rem;color:var(--gray-600);margin:0 0 .75rem">Federal and national resources for urban farming grants and programs.</p>
      ${nationalOrgs.map((org) => `
        <div class="org-card">
          <div class="org-name"><a href="${esc(org.orgUrl)}" target="_blank" rel="noopener">${esc(org.orgName)}</a></div>
          ${org.resources.length > 0 ? `<ul class="org-resources">${org.resources.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.text)}</a></li>`).join("")}</ul>` : ""}
        </div>`).join("")}
    </div>`;
  } else {
    // Show static links even if urban scraper hasn't run yet
    nationalHtml = `
    <div class="national-orgs">
      <h2>National Urban Agriculture Organizations</h2>
      <p style="font-size:.9rem;color:var(--gray-600);margin:0 0 .75rem">Federal and national resources for urban farming grants and programs.</p>
      <div class="org-card">
        <div class="org-name"><a href="https://www.usda.gov/topics/urban" target="_blank" rel="noopener">USDA Urban Agriculture</a></div>
      </div>
      <div class="org-card">
        <div class="org-name"><a href="https://www.nifa.usda.gov/topics/urban-agriculture" target="_blank" rel="noopener">NIFA Urban Agriculture</a></div>
      </div>
      <div class="org-card">
        <div class="org-name"><a href="https://www.usda.gov/peoples-garden" target="_blank" rel="noopener">USDA People's Garden Initiative</a></div>
      </div>
      <div class="org-card">
        <div class="org-name"><a href="https://www.communitygarden.org" target="_blank" rel="noopener">American Community Gardening Association</a></div>
      </div>
      <div class="org-card">
        <div class="org-name"><a href="https://www.usda.gov/topics/farming/beginning-farmers" target="_blank" rel="noopener">USDA Beginning Farmers and Ranchers</a></div>
      </div>
    </div>`;
  }

  return `${htmlHead(`${s.state} — ${s.name} — Agriculture Grant Resources`, statePageCss)}

<div class="hero hero-compact">
  <h1>${esc(s.state)} — ${esc(s.name)}</h1>
  <p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></p>
  <div class="stats">
    <div class="stat">
      <span class="stat-num">${s.grants.length}</span>
      <span class="stat-label">Grants Found</span>
    </div>
    ${defCount > 0 ? `<div class="stat"><span class="stat-num">${defCount}</span><span class="stat-label">Definitive</span></div>` : ""}
    ${ambCount > 0 ? `<div class="stat"><span class="stat-num">${ambCount}</span><span class="stat-label">Needs Review</span></div>` : ""}
    ${urbanResources.length > 0 ? `<div class="stat"><span class="stat-num">${urbanResources.length}</span><span class="stat-label">Urban Farm Resources</span></div>` : ""}
    ${stats.pagesVisited ? `<div class="stat"><span class="stat-num">${stats.pagesVisited}</span><span class="stat-label">Pages Crawled</span></div>` : ""}
  </div>
</div>

${pageNav("state", "../")}

<div class="section">
  <a href="../state-grants.html" class="back-link">&larr; Back to all states</a>

  ${s.error ? `<p class="error-msg">Error during crawl: ${esc(s.error)}</p>` : ""}
  ${stats.pagesVisited ? `<p class="crawl-stats">Crawled ${stats.pagesVisited} pages${stats.pagesSkipped ? `, ${stats.pagesSkipped} skipped` : ""} in ${(stats.durationMs / 1000).toFixed(0)}s</p>` : ""}

  ${s.grants.length > 0 ? `
  <div class="grants-section">
    <h2>Grant References (${s.grants.length})</h2>
    ${grantItems}
  </div>` : `
  <div class="grants-section">
    <h2>Grant References</h2>
    <p style="color:var(--gray-600)">No grant references found on this department's website.</p>
  </div>`}

  ${urbanHtml}

  ${nationalHtml}
</div>

${pageFooter()}

</body>
</html>`;
}

function generateStatePages() {
  mkdirSync("./states", { recursive: true });

  let totalBytes = 0;
  for (const s of states) {
    const html = buildStatePage(s);
    writeFileSync(`./states/${s.state}.html`, html);
    totalBytes += html.length;
  }

  console.log(`  states/*.html        (${states.length} files, ${(totalBytes / 1024).toFixed(0)} KB total)`);
}

// ---------------------------------------------------------------------------
// Federal table row builder
// ---------------------------------------------------------------------------

function buildFederalRow(g) {
  const total = fmtCurrency(g.totalFunding);
  const floor = fmtCurrency(g.awardFloor);
  const ceil = fmtCurrency(g.awardCeiling);
  const range = floor && ceil ? `${floor} – ${ceil}` : floor || ceil || "—";

  return `
    <tr>
      <td>
        <a href="${esc(g.url)}" target="_blank" rel="noopener">${esc(g.title)}</a>
        ${statusBadge(g.status)}
      </td>
      <td>${esc(g.agency)}</td>
      <td class="nowrap">${esc(g.closeDate) || "—"}</td>
      <td class="nowrap">${total || "—"}</td>
      <td class="nowrap">${range}</td>
      <td>${esc(g.contactEmail) ? `<a href="mailto:${esc(g.contactEmail)}">${esc(g.contactEmail)}</a>` : "—"}</td>
    </tr>`;
}

// ===========================================================================
// 1. index.html — Home / landing page
// ===========================================================================

const indexCss = `
  .home-cards {
    max-width: 900px; margin: 2rem auto; padding: 0 1.5rem;
    display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
  }
  .home-card {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow-lg);
    padding: 2rem; text-decoration: none; color: var(--gray-900);
    border-left: 5px solid var(--green-600); transition: transform .15s, box-shadow .15s;
  }
  .home-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }
  .home-card h2 { margin: 0 0 .5rem; font-size: 1.3rem; color: var(--green-700); }
  .home-card p { margin: 0 0 1rem; color: var(--gray-600); font-size: .95rem; }
  .home-card .card-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .home-card .card-stat { text-align: center; }
  .home-card .card-stat-num { font-size: 1.5rem; font-weight: 700; color: var(--green-700); display: block; }
  .home-card .card-stat-label { font-size: .75rem; color: var(--gray-600); text-transform: uppercase; letter-spacing: .04em; }
  @media (max-width: 768px) {
    .home-cards { grid-template-columns: 1fr; }
  }`;

const indexHtml = `${htmlHead("Agriculture Grant Resources — Home", indexCss)}

<div class="hero">
  <h1>Agriculture Grant Resources</h1>
  <p>Grant opportunities from all 50 US state agriculture departments and Grants.gov</p>
  <div class="stats">
    <div class="stat">
      <span class="stat-num">${statesWithGrants.length}</span>
      <span class="stat-label">States with Grants</span>
    </div>
    <div class="stat">
      <span class="stat-num">${totalGrantRefs}</span>
      <span class="stat-label">State Grant References</span>
    </div>
    <div class="stat">
      <span class="stat-num">${needsReviewCount}</span>
      <span class="stat-label">Needs Review</span>
    </div>
    <div class="stat">
      <span class="stat-num">${openFederal.length}</span>
      <span class="stat-label">Federal Opportunities</span>
    </div>
    ${totalUrbanResources > 0 ? `<div class="stat">
      <span class="stat-num">${totalUrbanResources}</span>
      <span class="stat-label">Urban Farm Resources</span>
    </div>` : ""}
  </div>
</div>

${pageNav("home")}

<div class="home-cards">
  <a href="state-grants.html" class="home-card">
    <h2>State Department Grants</h2>
    <p>Grant opportunities crawled from all 50 state agriculture department websites.</p>
    <div class="card-stats">
      <div class="card-stat">
        <span class="card-stat-num">${statesWithGrants.length}</span>
        <span class="card-stat-label">States</span>
      </div>
      <div class="card-stat">
        <span class="card-stat-num">${totalGrantRefs}</span>
        <span class="card-stat-label">Grant Refs</span>
      </div>
      <div class="card-stat">
        <span class="card-stat-num">${needsReviewCount}</span>
        <span class="card-stat-label">Needs Review</span>
      </div>
    </div>
  </a>
  <a href="federal-grants.html" class="home-card">
    <h2>Federal Grants (Grants.gov)</h2>
    <p>Agriculture and food-related opportunities from the federal Grants.gov database.</p>
    <div class="card-stats">
      <div class="card-stat">
        <span class="card-stat-num">${grantsGov.length}</span>
        <span class="card-stat-label">Total</span>
      </div>
      <div class="card-stat">
        <span class="card-stat-num">${openFederal.length}</span>
        <span class="card-stat-label">Open / Forecasted</span>
      </div>
    </div>
  </a>
</div>

${pageFooter()}

</body>
</html>`;

// ===========================================================================
// 2. state-grants.html — State department grants
// ===========================================================================

const stateCss = `
  /* State cards */
  .section { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
  .state-card {
    background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
    margin-bottom: 1rem; overflow: hidden; border-left: 4px solid var(--green-600);
  }
  .state-card.state-error { border-left-color: var(--red-600); }
  .state-card.state-empty { border-left-color: var(--gray-400); }
  .state-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.25rem .25rem; cursor: pointer;
  }
  .state-header h3 { margin: 0; font-size: 1.1rem; }
  .state-header-right { display: flex; align-items: center; gap: .5rem; }
  .state-url { margin: 0 1.25rem .75rem; font-size: .85rem; }
  .state-url a { color: var(--green-700); }
  .grant-count {
    font-size: .8rem; background: var(--green-100); color: var(--green-700);
    padding: .2rem .6rem; border-radius: 12px; font-weight: 600;
  }
  .view-full-link {
    font-size: .8rem; color: var(--green-700); text-decoration: none; font-weight: 500;
  }
  .view-full-link:hover { text-decoration: underline; }
  .grants-list { padding: 0 1.25rem 1rem; }
  .grant-item { padding: .75rem 0; border-top: 1px solid var(--gray-100); }
  .grant-item:first-child { border-top: none; }
  .grant-title { font-weight: 500; }
  .grant-title a { color: var(--green-700); text-decoration: none; }
  .grant-title a:hover { text-decoration: underline; }
  .grant-meta { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .25rem; }
  .meta-tag {
    font-size: .8rem; background: var(--gray-100); color: var(--gray-800);
    padding: .15rem .5rem; border-radius: 4px;
  }
  .docs { margin-top: .5rem; font-size: .85rem; }
  .docs ul { margin: .25rem 0 0; padding-left: 1.2rem; }
  .docs li { margin-bottom: .15rem; }
  .docs a { color: var(--green-700); }
  .docs .more { color: var(--gray-600); font-style: italic; }
  .error-msg { color: var(--red-600); font-size: .85rem; padding: 0 1.25rem .75rem; }
  .grant-ambiguous {
    background: var(--gold-100); border-radius: 4px;
    padding: .75rem .5rem; margin: .25rem -.5rem;
  }
  .crawl-stats {
    margin: 0 1.25rem .5rem; font-size: .8rem; color: var(--gray-600); font-style: italic;
  }

  /* Collapsible */
  .state-card .grants-list { display: none; }
  .state-card.expanded .grants-list { display: block; }
  .state-header::after {
    content: "\\25B6"; font-size: .7rem; color: var(--gray-400); transition: transform .2s;
  }
  .state-card.expanded .state-header::after { transform: rotate(90deg); }

  /* Jump map */
  .jump-map {
    display: flex; flex-wrap: wrap; gap: .35rem; justify-content: center;
    max-width: 1200px; margin: 1rem auto .5rem; padding: 0 1.5rem;
  }
  .jump-map a {
    display: inline-block; padding: .2rem .5rem; font-size: .75rem; font-weight: 600;
    background: var(--green-100); color: var(--green-700); border-radius: 4px;
    text-decoration: none; transition: background .15s;
  }
  .jump-map a:hover { background: var(--green-600); color: #fff; }
  .jump-map a.has-grants { background: var(--green-600); color: #fff; }
  .jump-map a.has-review { background: var(--gold-600); color: #fff; }
  .jump-map a.has-error { background: var(--red-100); color: var(--red-600); }
  .jump-map a.no-grants { background: var(--gray-100); color: var(--gray-600); }`;

const stateHtml = `${htmlHead("State Department Grants — Agriculture Grant Resources", stateCss)}

<div class="hero hero-compact">
  <h1>State Department Grants</h1>
  <p>Grant opportunities crawled from all 50 state agriculture department websites</p>
  <div class="stats">
    <div class="stat">
      <span class="stat-num">${statesWithGrants.length}</span>
      <span class="stat-label">States with Grants</span>
    </div>
    <div class="stat">
      <span class="stat-num">${totalGrantRefs}</span>
      <span class="stat-label">Grant References</span>
    </div>
    <div class="stat">
      <span class="stat-num">${needsReviewCount}</span>
      <span class="stat-label">Needs Review</span>
    </div>
  </div>
</div>

${pageNav("state")}

<!-- State jump map -->
<div class="jump-map" id="jump-map">
  ${states
    .map((s) => {
      const hasReview = s.grants.some((g) => g.confidence === "ambiguous");
      const cls = s.error ? "has-error" : hasReview ? "has-review" : s.grants.length > 0 ? "has-grants" : "no-grants";
      return `<a href="#state-${esc(s.state)}" class="${cls}" onclick="expandAndJump('${esc(s.state)}'); return false;">${esc(s.state)}</a>`;
    })
    .join("")}
</div>

<div class="filter-bar">
  <input type="text" id="state-search" placeholder="Search states, grants, keywords..." oninput="filterStates()">
  <select id="state-status-filter" onchange="filterStates()">
    <option value="all">All states</option>
    <option value="has-grants">With grants</option>
    <option value="has-review">With items to review</option>
    <option value="no-grants">No grants found</option>
    <option value="error">Errors</option>
  </select>
  <span class="result-count" id="state-count"></span>
</div>

<div class="section">
  ${states.map(buildStateCard).join("")}
</div>

${pageFooter()}

<script>
// Expand/collapse state cards
document.querySelectorAll('.state-header').forEach(h => {
  h.addEventListener('click', (e) => {
    if (e.target.closest('.view-full-link')) return;
    h.closest('.state-card').classList.toggle('expanded');
  });
});

function expandAndJump(state) {
  const el = document.getElementById('state-' + state);
  if (el) {
    el.classList.add('expanded');
    el.style.display = '';
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

// State filtering
function filterStates() {
  const query = document.getElementById('state-search').value.toLowerCase();
  const status = document.getElementById('state-status-filter').value;
  let visible = 0;
  document.querySelectorAll('.state-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    let matchesStatus = true;
    if (status === 'has-grants') matchesStatus = !card.classList.contains('state-error') && !card.classList.contains('state-empty');
    if (status === 'has-review') matchesStatus = card.classList.contains('has-review');
    if (status === 'no-grants') matchesStatus = card.classList.contains('state-empty');
    if (status === 'error') matchesStatus = card.classList.contains('state-error');
    const show = matchesQuery && matchesStatus;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  document.getElementById('state-count').textContent = visible + ' of ${states.length} states';
}
filterStates();
</script>

</body>
</html>`;

// ===========================================================================
// 3. federal-grants.html — Federal grants (Grants.gov)
// ===========================================================================

const federalCss = `
  .section { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
  .table-wrap { overflow-x: auto; }
  table {
    width: 100%; border-collapse: collapse; background: #fff;
    border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden;
    font-size: .9rem;
  }
  thead { background: var(--green-700); color: #fff; }
  th { padding: .75rem 1rem; text-align: left; font-weight: 600; cursor: pointer; white-space: nowrap; }
  th:hover { background: var(--green-600); }
  td { padding: .65rem 1rem; border-bottom: 1px solid var(--gray-100); vertical-align: top; }
  td a { color: var(--green-700); text-decoration: none; }
  td a:hover { text-decoration: underline; }
  tr:hover td { background: var(--green-50); }
  .nowrap { white-space: nowrap; }
  @media (max-width: 768px) {
    th, td { padding: .5rem .6rem; font-size: .8rem; }
  }`;

const federalHtml = `${htmlHead("Federal Grants (Grants.gov) — Agriculture Grant Resources", federalCss)}

<div class="hero hero-compact">
  <h1>Federal Grants (Grants.gov)</h1>
  <p>Agriculture and food-related opportunities from the federal Grants.gov database</p>
  <div class="stats">
    <div class="stat">
      <span class="stat-num">${grantsGov.length}</span>
      <span class="stat-label">Total Opportunities</span>
    </div>
    <div class="stat">
      <span class="stat-num">${openFederal.length}</span>
      <span class="stat-label">Open / Forecasted</span>
    </div>
  </div>
</div>

${pageNav("federal")}

<div class="filter-bar">
  <input type="text" id="federal-search" placeholder="Search grants, agencies, keywords..." oninput="filterFederal()">
  <select id="federal-status-filter" onchange="filterFederal()">
    <option value="all">All statuses</option>
    <option value="posted">Open (Posted)</option>
    <option value="forecasted">Forecasted</option>
    <option value="closed">Closed</option>
    <option value="archived">Archived</option>
  </select>
  <span class="result-count" id="federal-count"></span>
</div>

<div class="section">
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th onclick="sortTable(0)">Opportunity</th>
          <th onclick="sortTable(1)">Agency</th>
          <th onclick="sortTable(2)">Close Date</th>
          <th onclick="sortTable(3)">Total Funding</th>
          <th onclick="sortTable(4)">Award Range</th>
          <th onclick="sortTable(5)">Contact</th>
        </tr>
      </thead>
      <tbody id="federal-tbody">
        ${grantsGov.map(buildFederalRow).join("")}
      </tbody>
    </table>
  </div>
</div>

${pageFooter()}

<script>
// Federal filtering
function filterFederal() {
  const query = document.getElementById('federal-search').value.toLowerCase();
  const status = document.getElementById('federal-status-filter').value;
  let visible = 0;
  document.querySelectorAll('#federal-tbody tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const badge = row.querySelector('.badge');
    const rowStatus = badge ? badge.textContent.toLowerCase() : '';
    const matchesStatus = status === 'all' || rowStatus === status;
    const show = matchesQuery && matchesStatus;
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  document.getElementById('federal-count').textContent = visible + ' of ${grantsGov.length} opportunities';
}
filterFederal();

// Table sorting
let sortDir = {};
function sortTable(col) {
  const tbody = document.getElementById('federal-tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  sortDir[col] = !sortDir[col];
  rows.sort((a, b) => {
    const aText = a.children[col]?.textContent.trim() || '';
    const bText = b.children[col]?.textContent.trim() || '';
    if (col >= 3 && col <= 4) {
      const aNum = parseFloat(aText.replace(/[^0-9.-]/g, '')) || 0;
      const bNum = parseFloat(bText.replace(/[^0-9.-]/g, '')) || 0;
      return sortDir[col] ? aNum - bNum : bNum - aNum;
    }
    return sortDir[col] ? aText.localeCompare(bText) : bText.localeCompare(aText);
  });
  rows.forEach(r => tbody.appendChild(r));
}
</script>

</body>
</html>`;

// ===========================================================================
// Write all files
// ===========================================================================

writeFileSync("./index.html", indexHtml);
writeFileSync("./state-grants.html", stateHtml);
writeFileSync("./federal-grants.html", federalHtml);

generateStatePages();

console.log(`Built HTML files:`);
console.log(`  index.html          (${(indexHtml.length / 1024).toFixed(0)} KB)`);
console.log(`  state-grants.html   (${(stateHtml.length / 1024).toFixed(0)} KB)`);
console.log(`  federal-grants.html (${(federalHtml.length / 1024).toFixed(0)} KB)`);
