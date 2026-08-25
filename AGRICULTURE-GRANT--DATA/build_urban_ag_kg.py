"""
Build a Knowledge Graph from SCALE-UP-URBAN-AG.pdf using iText2KG + Ollama (qwen2.5:32b)

Uses a custom extraction approach that includes the JSON schema in the prompt
to work around qwen2.5:32b's structured output incompatibility with LangChain.
"""

import asyncio
import json
import sys
import os
import time

sys.path.insert(0, "/Users/edwardhooban/Downloads/itext2kg-main")

from pypdf import PdfReader
from langchain_ollama import ChatOllama, OllamaEmbeddings
from itext2kg.itext2kg_star.models.schemas import RelationshipsExtractor
from itext2kg.itext2kg_star.models import Entity, Relationship, KnowledgeGraph
from itext2kg.itext2kg_star.graph_matching import Matcher
from itext2kg.llm_output_parsing.langchain_output_parser import LangchainOutputParser
from itext2kg.logging_config import setup_logging, get_logger
import numpy as np

setup_logging(level="INFO")
logger = get_logger(__name__)

PDF_PATH = "/Users/edwardhooban/Downloads/SCALE-UP-URBAN-AG.pdf"
OUTPUT_DIR = "/Users/edwardhooban/Downloads/urban_ag_kg_output"

# Content pages only (skip title, TOC, list of figures/tables, references, appendices)
CONTENT_PAGE_RANGE = (6, 45)  # 1-indexed, inclusive

# JSON schema for the prompt
RELATIONSHIPS_SCHEMA = json.dumps(RelationshipsExtractor.model_json_schema(), indent=2)

IE_QUERY = f"""Extract all meaningful relationships from the context below.
Return ONLY valid JSON matching this exact schema:

{RELATIONSHIPS_SCHEMA}

DIRECTIVES:
- Extract all meaningful relationships directly from the provided context.
- For each relationship, identify the startNode and endNode entities.
- Each entity must have a "label" (category like Person, Location, Organization, Concept, Technology, etc.) and a "name" (specific identifier).
- Each relationship must have a "name" (predicate like "reduces", "is_located_in", "produces", etc.).
- Avoid reflexive relations (entity relating to itself).
- Return ONLY the JSON object, no other text."""


# --- 1. Extract text from PDF (content pages only) ---
def extract_pdf_text(pdf_path):
    reader = PdfReader(pdf_path)
    pages = []
    start, end = CONTENT_PAGE_RANGE
    for i in range(start - 1, min(end, len(reader.pages))):
        text = reader.pages[i].extract_text()
        if text and len(text.strip()) > 200:
            pages.append((i + 1, text.strip()))
    print(f"Extracted {len(pages)} content pages (pages {start}-{end} of {len(reader.pages)} total)")
    return pages


# --- 2. Create sections (1 page per chunk) ---
def create_sections(pages):
    sections = []
    for page_num, text in pages:
        sections.append({"page": page_num, "text": text})
    print(f"Created {len(sections)} sections (1 page each)")
    return sections


# --- 3. Extract relationships from a single section ---
async def extract_relationships_from_section(llm, text, max_tries=3):
    """Call the LLM with explicit JSON schema and parse the result."""
    prompt = f"# Context:\n{text}\n\n{IE_QUERY}"

    for attempt in range(max_tries):
        try:
            result = await llm.ainvoke(prompt)
            raw = json.loads(result.content)

            # Unwrap tool-calling format if the model wraps it
            if "arguments" in raw and "relationships" not in raw:
                raw = raw["arguments"]

            parsed = RelationshipsExtractor(**raw)
            if parsed.relationships:
                return parsed
        except json.JSONDecodeError as e:
            logger.warning("JSON parse error on attempt %d: %s", attempt + 1, e)
        except Exception as e:
            logger.warning("Extraction error on attempt %d: %s", attempt + 1, str(e)[:150])

    return None


# --- 4. Convert schema relationships to KG model objects ---
def convert_to_kg_objects(parsed):
    """Convert RelationshipsExtractor result to Entity and Relationship model objects."""
    entities = []
    relationships = []

    for rel in parsed.relationships:
        start = Entity(label=rel.startNode.label, name=rel.startNode.name)
        start.process()
        end = Entity(label=rel.endNode.label, name=rel.endNode.name)
        end.process()
        entities.extend([start, end])

        kg_rel = Relationship(startEntity=start, endEntity=end, name=rel.name)
        relationships.append(kg_rel)

    return entities, relationships


# --- 5. Build knowledge graph section-by-section ---
async def build_knowledge_graph(sections):
    llm = ChatOllama(
        model="qwen2.5:32b",
        temperature=0,
        num_ctx=16384,
        format="json",
    )
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    output_parser = LangchainOutputParser(llm_model=llm, embeddings_model=embeddings)
    matcher = Matcher()

    print(f"\nBuilding knowledge graph from {len(sections)} sections...")
    print("Using model: qwen2.5:32b (format=json) | Embeddings: nomic-embed-text")
    print("Sections that fail extraction will be skipped.\n")

    global_entities = None
    global_relationships = None
    succeeded = 0
    failed = 0
    failed_pages = []
    start_time = time.time()

    for i, section in enumerate(sections):
        page_num = section["page"]
        elapsed = time.time() - start_time
        print(f"[{i+1}/{len(sections)}] Processing page {page_num}... "
              f"(elapsed: {elapsed/60:.1f}min, ok: {succeeded}, skipped: {failed})")

        try:
            parsed = await extract_relationships_from_section(llm, section["text"])
            if parsed is None:
                failed += 1
                failed_pages.append(page_num)
                print(f"  -> SKIPPED (page {page_num}): Could not extract relationships")
                continue

            entities, relationships = convert_to_kg_objects(parsed)

            # Compute embeddings for entity matching
            kg = KnowledgeGraph(entities=entities, relationships=relationships)
            kg.remove_duplicates_entities()
            await kg.embed_entities(
                entity_name_weight=0.6,
                entity_label_weight=0.4,
                embeddings_function=lambda x: output_parser.calculate_embeddings(x),
            )
            await kg.embed_relationships(
                embeddings_function=lambda x: output_parser.calculate_embeddings(x),
            )
            entities = kg.entities
            relationships = kg.relationships

            if global_entities is None:
                global_entities = entities
                global_relationships = relationships
            else:
                global_entities, global_relationships = matcher.match_entities_and_update_relationships(
                    entities1=entities,
                    entities2=global_entities,
                    relationships1=relationships,
                    relationships2=global_relationships,
                    ent_threshold=0.7,
                    rel_threshold=0.7,
                )

            succeeded += 1
            print(f"  -> OK ({len(entities)} entities, {len(relationships)} relationships)")

        except Exception as e:
            failed += 1
            failed_pages.append(page_num)
            print(f"  -> SKIPPED (page {page_num}): {str(e)[:120]}")
            continue

    print(f"\nProcessing complete: {succeeded} succeeded, {failed} skipped")
    if failed_pages:
        print(f"Skipped pages: {failed_pages}")
    print(f"Total time: {(time.time() - start_time)/60:.1f} minutes")

    if global_entities is None:
        raise RuntimeError("No sections were successfully processed!")

    kg = KnowledgeGraph(entities=global_entities, relationships=global_relationships)
    kg.remove_duplicates_entities()
    kg.remove_duplicates_relationships()
    return kg


# --- 6. Save results ---
def save_results(kg, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    entities_data = []
    for e in kg.entities:
        entities_data.append({"name": e.name, "label": e.label})

    relationships_data = []
    for r in kg.relationships:
        relationships_data.append({
            "source": r.startEntity.name,
            "source_label": r.startEntity.label,
            "relationship": r.name,
            "target": r.endEntity.name,
            "target_label": r.endEntity.label,
        })

    # Extract page texts from PDF for the detail panel
    page_texts = []
    try:
        reader = PdfReader(PDF_PATH)
        start, end = CONTENT_PAGE_RANGE
        for i in range(start - 1, min(end, len(reader.pages))):
            text = reader.pages[i].extract_text()
            if text and len(text.strip()) > 200:
                page_texts.append({"page": i + 1, "text": text.strip()})
    except Exception as e:
        print(f"Warning: Could not extract PDF text for detail panel: {e}")

    result = {
        "total_entities": len(entities_data),
        "total_relationships": len(relationships_data),
        "entities": entities_data,
        "relationships": relationships_data,
        "page_texts": page_texts,
    }

    json_path = os.path.join(output_dir, "knowledge_graph.json")
    with open(json_path, "w") as f:
        json.dump(result, f, indent=2)
    print(f"\nSaved JSON: {json_path}")

    # Save interactive HTML visualization with pyvis
    try:
        from pyvis.network import Network

        net = Network(
            height="900px",
            width="100%",
            bgcolor="#1a1a2e",
            font_color="white",
            directed=True,
            notebook=False,
        )
        net.barnes_hut(
            gravity=-8000,
            central_gravity=0.3,
            spring_length=200,
            spring_strength=0.01,
        )

        label_colors = {}
        palette = [
            "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
            "#1abc9c", "#e67e22", "#e84393", "#00cec9", "#fd79a8",
            "#6c5ce7", "#ffeaa7", "#dfe6e9", "#74b9ff", "#a29bfe",
        ]

        for e in kg.entities:
            if e.label not in label_colors:
                label_colors[e.label] = palette[len(label_colors) % len(palette)]
            net.add_node(
                e.name,
                label=e.name,
                title=f"{e.name}\n[{e.label}]",
                color=label_colors[e.label],
                size=25,
            )

        for r in kg.relationships:
            net.add_edge(
                r.startEntity.name,
                r.endEntity.name,
                label=r.name,
                title=r.name,
                color="#888888",
                arrows="to",
            )

        html_path = os.path.join(output_dir, "knowledge_graph.html")
        net.save_graph(html_path)
        print(f"Saved visualization: {html_path}")

        legend_path = os.path.join(output_dir, "legend.txt")
        with open(legend_path, "w") as f:
            f.write("Entity Label Color Legend:\n")
            for label, color in label_colors.items():
                f.write(f"  {color} = {label}\n")
        print(f"Saved legend: {legend_path}")

    except ImportError:
        print("pyvis not installed - skipping HTML visualization")

    # Generate enhanced HTML with detail panel
    save_enhanced_html(result, output_dir)

    return result


# --- 7. Generate enhanced HTML visualization ---
def save_enhanced_html(data, output_dir):
    """Generate a custom vis.js HTML with a full-page detail view on double-click."""

    label_colors = {
        "Concept": "#e74c3c",
        "Person": "#3498db",
        "Organization": "#2ecc71",
        "Event": "#f39c12",
        "Location": "#9b59b6",
    }
    palette = [
        "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
        "#1abc9c", "#e67e22", "#e84393", "#00cec9", "#fd79a8",
        "#6c5ce7", "#ffeaa7", "#dfe6e9", "#74b9ff", "#a29bfe",
    ]

    # Build nodes
    nodes = []
    for e in data["entities"]:
        if e["label"] not in label_colors:
            label_colors[e["label"]] = palette[len(label_colors) % len(palette)]
        nodes.append({
            "id": e["name"],
            "label": e["name"],
            "title": f"{e['name']}\\n[{e['label']}]",
            "color": label_colors[e["label"]],
            "size": 25,
            "entity_label": e["label"],
        })

    # Build edges
    edges = []
    for r in data["relationships"]:
        edges.append({
            "from": r["source"],
            "to": r["target"],
            "label": r["relationship"],
            "title": r["relationship"],
            "color": "#888888",
            "arrows": "to",
        })

    page_texts = data.get("page_texts", [])

    nodes_json = json.dumps(nodes)
    edges_json = json.dumps(edges)
    relationships_json = json.dumps(data["relationships"])
    page_texts_json = json.dumps(page_texts)
    label_colors_json = json.dumps(label_colors)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Urban Agriculture Knowledge Graph</title>
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ background: #1a1a2e; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}

/* ===== OVERVIEW PAGE ===== */
#overview-page {{
  width: 100%; height: 100vh; overflow: hidden;
}}
#graph-container {{
  width: 100%; height: 100%;
}}

/* ===== DETAIL PAGE ===== */
#detail-page {{
  display: none;
  width: 100%; min-height: 100vh;
}}

/* Back bar */
#back-bar {{
  position: sticky; top: 0; z-index: 100;
  background: #0f3460; padding: 10px 20px;
  display: flex; align-items: center; gap: 16px;
  border-bottom: 2px solid #16213e;
}}
#back-btn {{
  background: none; border: 1px solid #ffffff44; color: #74b9ff;
  padding: 6px 16px; border-radius: 6px; cursor: pointer;
  font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 6px;
}}
#back-btn:hover {{ background: #ffffff15; color: #fff; }}
#back-bar .entity-title {{
  font-size: 18px; font-weight: 600; color: #fff;
}}
.type-badge {{
  display: inline-block; padding: 3px 10px; border-radius: 12px;
  font-size: 12px; font-weight: 600; color: #fff;
  white-space: nowrap;
}}

/* Detail layout: graph left, info right */
#detail-content {{
  display: flex; height: calc(100vh - 50px);
}}
#detail-graph {{
  width: 50%; height: 100%; border-right: 2px solid #0f3460;
}}
#detail-info {{
  width: 50%; height: 100%; overflow-y: auto; padding: 20px;
}}

.section-title {{
  font-size: 14px; font-weight: 600; color: #74b9ff;
  text-transform: uppercase; letter-spacing: 1px;
  margin: 20px 0 10px 0; padding-bottom: 6px;
  border-bottom: 1px solid #ffffff22;
}}
.section-title:first-child {{ margin-top: 0; }}

/* Relationship tables */
.rel-table {{
  width: 100%; border-collapse: collapse; margin-bottom: 6px;
  font-size: 13px;
}}
.rel-table td {{
  padding: 6px 8px; border-bottom: 1px solid #ffffff11;
  vertical-align: top;
}}
.rel-table td:first-child {{ width: 38%; }}
.rel-table td:nth-child(2) {{ width: 24%; color: #ffeaa7; font-style: italic; text-align: center; }}
.rel-table td:last-child {{ width: 38%; }}
.entity-link {{
  color: #74b9ff; cursor: pointer; text-decoration: underline;
  text-decoration-color: #74b9ff44;
}}
.entity-link:hover {{ color: #a29bfe; text-decoration-color: #a29bfe; }}
.self-ref {{ color: #fd79a8; font-weight: 600; }}

/* Excerpts */
.excerpt {{
  background: #1a1a2e; border: 1px solid #ffffff15; border-radius: 8px;
  padding: 12px 14px; margin-bottom: 10px; font-size: 13px;
  line-height: 1.6; color: #dfe6e9;
}}
.excerpt .page-num {{
  display: inline-block; background: #0f3460; color: #74b9ff;
  padding: 2px 8px; border-radius: 4px; font-size: 11px;
  font-weight: 600; margin-bottom: 6px;
}}
.excerpt mark {{
  background: #f39c1255; color: #ffeaa7; border-radius: 2px;
  padding: 0 2px;
}}
.no-results {{ color: #888; font-style: italic; font-size: 13px; }}

/* Legend (overview only) */
#legend {{
  position: fixed; bottom: 16px; left: 16px;
  background: #16213e; border: 1px solid #0f3460; border-radius: 8px;
  padding: 10px 14px; z-index: 500; font-size: 12px;
}}
#legend div {{ display: flex; align-items: center; margin: 3px 0; }}
#legend .dot {{
  width: 12px; height: 12px; border-radius: 50%; margin-right: 8px;
  flex-shrink: 0;
}}

/* Hint */
#hint {{
  position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
  background: #0f3460cc; color: #74b9ff; padding: 8px 18px;
  border-radius: 20px; font-size: 13px; z-index: 500;
  pointer-events: none; transition: opacity 0.5s;
}}
</style>
</head>
<body>

<!-- ===== OVERVIEW PAGE ===== -->
<div id="overview-page">
  <div id="graph-container"></div>
</div>

<!-- ===== DETAIL PAGE ===== -->
<div id="detail-page">
  <div id="back-bar">
    <button id="back-btn">&#8592; Back to full graph</button>
    <span class="type-badge" id="detail-badge"></span>
    <span class="entity-title" id="detail-title"></span>
  </div>
  <div id="detail-content">
    <div id="detail-graph"></div>
    <div id="detail-info"></div>
  </div>
</div>

<div id="legend"></div>
<div id="hint">Double-click any node to view details</div>

<script>
// --- Data ---
var allNodes = {nodes_json};
var allEdges = {edges_json};
var relationships = {relationships_json};
var pageTexts = {page_texts_json};
var labelColors = {label_colors_json};

// --- Entity lookup ---
var entityMap = {{}};
allNodes.forEach(function(n) {{ entityMap[n.id] = n; }});

// --- Build legend ---
(function() {{
  var legend = document.getElementById('legend');
  var html = '';
  for (var label in labelColors) {{
    html += '<div><span class="dot" style="background:' + labelColors[label] + '"></span>' + label + '</div>';
  }}
  legend.innerHTML = html;
}})();

// --- Build main overview network ---
var overviewNodes = new vis.DataSet(allNodes);
var overviewEdges = new vis.DataSet(allEdges);
var container = document.getElementById('graph-container');
var networkOptions = {{
  physics: {{
    barnesHut: {{
      gravitationalConstant: -8000,
      centralGravity: 0.3,
      springLength: 200,
      springConstant: 0.01
    }}
  }},
  edges: {{
    font: {{ size: 10, color: '#888', strokeWidth: 0 }},
    smooth: {{ type: 'continuous' }}
  }},
  nodes: {{
    font: {{ size: 14, color: '#ffffff' }},
    borderWidth: 2,
    borderWidthSelected: 3,
    shape: 'dot'
  }},
  interaction: {{
    hover: true,
    tooltipDelay: 200
  }}
}};
var overviewNetwork = new vis.Network(container, {{ nodes: overviewNodes, edges: overviewEdges }}, networkOptions);

// --- Fade hint ---
setTimeout(function() {{
  document.getElementById('hint').style.opacity = '0';
  setTimeout(function() {{ document.getElementById('hint').style.display = 'none'; }}, 600);
}}, 5000);

// --- Double-click -> detail page ---
overviewNetwork.on('doubleClick', function(params) {{
  if (params.nodes.length === 0) return;
  showDetailPage(params.nodes[0]);
}});

// --- Back button ---
document.getElementById('back-btn').addEventListener('click', showOverviewPage);

var detailNetwork = null;

function showOverviewPage() {{
  document.getElementById('detail-page').style.display = 'none';
  document.getElementById('overview-page').style.display = 'block';
  document.getElementById('legend').style.display = '';
  if (detailNetwork) {{ detailNetwork.destroy(); detailNetwork = null; }}
  // Redraw to fix canvas sizing
  overviewNetwork.redraw();
  overviewNetwork.fit();
}};

function showDetailPage(entityId) {{
  var entity = entityMap[entityId];
  if (!entity) return;

  // --- Header ---
  var badge = document.getElementById('detail-badge');
  badge.textContent = entity.entity_label;
  badge.style.background = entity.color;
  document.getElementById('detail-title').textContent = entity.label;

  // --- Collect neighbor nodes and relevant edges ---
  var neighborIds = new Set();
  neighborIds.add(entityId);
  var detailEdges = [];

  var outgoing = relationships.filter(function(r) {{ return r.source === entityId; }});
  var incoming = relationships.filter(function(r) {{ return r.target === entityId; }});

  outgoing.forEach(function(r) {{ neighborIds.add(r.target); }});
  incoming.forEach(function(r) {{ neighborIds.add(r.source); }});

  // Edges: only those connecting the focal node to its neighbors
  allEdges.forEach(function(e) {{
    if ((e.from === entityId && neighborIds.has(e.to)) ||
        (e.to === entityId && neighborIds.has(e.from))) {{
      detailEdges.push(e);
    }}
  }});

  // Nodes for the sub-graph
  var detailNodes = [];
  neighborIds.forEach(function(nid) {{
    var orig = entityMap[nid];
    if (!orig) return;
    detailNodes.push({{
      id: orig.id,
      label: orig.label,
      title: orig.title,
      color: nid === entityId ? {{ background: orig.color, border: '#fff' }} : orig.color,
      size: nid === entityId ? 35 : 22,
      entity_label: orig.entity_label,
      font: nid === entityId ? {{ size: 16, color: '#fff', bold: true }} : {{ size: 12, color: '#fff' }},
      borderWidth: nid === entityId ? 4 : 2,
    }});
  }});

  // --- Build sub-graph ---
  if (detailNetwork) detailNetwork.destroy();
  var dgContainer = document.getElementById('detail-graph');
  var subOptions = {{
    physics: {{
      barnesHut: {{
        gravitationalConstant: -3000,
        centralGravity: 0.5,
        springLength: 150,
        springConstant: 0.04
      }}
    }},
    edges: {{
      font: {{ size: 11, color: '#aaa', strokeWidth: 0 }},
      smooth: {{ type: 'continuous' }},
      color: {{ color: '#555', highlight: '#74b9ff' }}
    }},
    nodes: {{
      font: {{ size: 13, color: '#ffffff' }},
      shape: 'dot'
    }},
    interaction: {{
      hover: true,
      tooltipDelay: 200,
      zoomView: true,
      dragView: true
    }}
  }};
  detailNetwork = new vis.Network(
    dgContainer,
    {{ nodes: new vis.DataSet(detailNodes), edges: new vis.DataSet(detailEdges) }},
    subOptions
  );

  // Double-click a neighbor in the sub-graph -> navigate to that entity's detail
  detailNetwork.on('doubleClick', function(params) {{
    if (params.nodes.length === 0) return;
    showDetailPage(params.nodes[0]);
  }});

  // --- Build info panel ---
  var html = '';

  // Outgoing relationships
  html += '<div class="section-title">Outgoing Relationships (' + outgoing.length + ')</div>';
  if (outgoing.length > 0) {{
    html += '<table class="rel-table">';
    outgoing.forEach(function(r) {{
      var te = entityMap[r.target];
      var tc = te ? te.color : '#888';
      html += '<tr>'
        + '<td class="self-ref">' + escapeHtml(entityId) + '</td>'
        + '<td>' + escapeHtml(r.relationship) + '</td>'
        + '<td><span class="entity-link" data-entity="' + escapeAttr(r.target)
        + '" style="color:' + tc + '">' + escapeHtml(r.target) + '</span></td>'
        + '</tr>';
    }});
    html += '</table>';
  }} else {{
    html += '<div class="no-results">None</div>';
  }}

  // Incoming relationships
  html += '<div class="section-title">Incoming Relationships (' + incoming.length + ')</div>';
  if (incoming.length > 0) {{
    html += '<table class="rel-table">';
    incoming.forEach(function(r) {{
      var se = entityMap[r.source];
      var sc = se ? se.color : '#888';
      html += '<tr>'
        + '<td><span class="entity-link" data-entity="' + escapeAttr(r.source)
        + '" style="color:' + sc + '">' + escapeHtml(r.source) + '</span></td>'
        + '<td>' + escapeHtml(r.relationship) + '</td>'
        + '<td class="self-ref">' + escapeHtml(entityId) + '</td>'
        + '</tr>';
    }});
    html += '</table>';
  }} else {{
    html += '<div class="no-results">None</div>';
  }}

  // PDF excerpts
  html += '<div class="section-title">PDF Excerpts</div>';
  var excerpts = findExcerpts(entityId);
  if (excerpts.length > 0) {{
    excerpts.forEach(function(ex) {{
      html += '<div class="excerpt">'
        + '<span class="page-num">Page ' + ex.page + '</span><br>'
        + ex.html
        + '</div>';
    }});
  }} else {{
    html += '<div class="no-results">No mentions found in PDF text</div>';
  }}

  document.getElementById('detail-info').innerHTML = html;

  // --- Switch pages ---
  document.getElementById('overview-page').style.display = 'none';
  document.getElementById('legend').style.display = 'none';
  document.getElementById('detail-page').style.display = 'block';

  // --- Entity link click handlers ---
  document.querySelectorAll('#detail-info .entity-link').forEach(function(el) {{
    el.addEventListener('click', function() {{
      showDetailPage(this.getAttribute('data-entity'));
    }});
  }});
}}

// --- Find matching excerpts ---
function findExcerpts(entityName) {{
  var results = [];
  var searchTerm = entityName.toLowerCase();

  pageTexts.forEach(function(pt) {{
    var textLower = pt.text.toLowerCase();
    if (textLower.indexOf(searchTerm) === -1) return;

    var positions = [];
    var idx = 0;
    while ((idx = textLower.indexOf(searchTerm, idx)) !== -1) {{
      positions.push(idx);
      idx += searchTerm.length;
    }}

    positions.forEach(function(pos) {{
      var start = Math.max(0, pos - 120);
      var end = Math.min(pt.text.length, pos + searchTerm.length + 120);
      if (start > 0) {{ while (start > 0 && pt.text[start] !== ' ') start--; start++; }}
      if (end < pt.text.length) {{ while (end < pt.text.length && pt.text[end] !== ' ') end++; }}

      var snippet = pt.text.substring(start, end);
      var prefix = start > 0 ? '...' : '';
      var suffix = end < pt.text.length ? '...' : '';

      var highlighted = escapeHtml(prefix + snippet + suffix);
      var re = new RegExp('(' + escapeRegex(escapeHtml(entityName)) + ')', 'gi');
      highlighted = highlighted.replace(re, '<mark>$1</mark>');
      results.push({{ page: pt.page, html: highlighted }});
    }});
  }});

  var seen = {{}};
  results = results.filter(function(r) {{
    var key = r.page + ':' + r.html.substring(0, 80);
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  }});
  return results.slice(0, 10);
}}

// --- Utilities ---
function escapeHtml(str) {{
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}}
function escapeAttr(str) {{
  return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}}
function escapeRegex(str) {{
  return str.replace(/[.*+?^${{}}()|[\\]\\\\]/g, '\\\\$&');
}}

// --- Handle hash navigation (e.g. #entity=urban%20agriculture) ---
function checkHash() {{
  var hash = window.location.hash;
  if (hash.startsWith('#entity=')) {{
    var id = decodeURIComponent(hash.substring(8));
    if (entityMap[id]) showDetailPage(id);
  }}
}}
window.addEventListener('hashchange', checkHash);
checkHash();
</script>
</body>
</html>"""

    html_path = os.path.join(output_dir, "knowledge_graph.html")
    with open(html_path, "w") as f:
        f.write(html)
    print(f"Saved enhanced visualization: {html_path}")


# --- Main ---
async def main():
    pages = extract_pdf_text(PDF_PATH)
    sections = create_sections(pages)

    kg = await build_knowledge_graph(sections)

    print("\n" + "=" * 60)
    print("KNOWLEDGE GRAPH RESULTS")
    print("=" * 60)
    print(f"\nEntities ({len(kg.entities)}):")
    for e in kg.entities:
        print(f"  - {e.name} [{e.label}]")

    print(f"\nRelationships ({len(kg.relationships)}):")
    for r in kg.relationships:
        print(f"  - {r.startEntity.name} --[{r.name}]--> {r.endEntity.name}")

    result = save_results(kg, OUTPUT_DIR)
    print(f"\nDone! {result['total_entities']} entities, {result['total_relationships']} relationships")


if __name__ == "__main__":
    asyncio.run(main())
