import { useState } from "react";

const sections = [
  { id: "verification", title: "Claim Verification", icon: "V" },
  { id: "memory-layer", title: "Memory Architecture", icon: "M" },
  { id: "innovations", title: "Optimizations & Innovations", icon: "+" },
  { id: "quad-alignment", title: "Quad-Alignment Framework", icon: "Q" },
  { id: "enterprise-memory", title: "Enterprise Memory Design", icon: "E" },
  { id: "roadmap", title: "Implementation Strategy", icon: "R" },
];

function Badge({ status }) {
  const colors = {
    VERIFIED: "bg-green-600/30 text-green-300 border-green-500/30",
    "PARTIALLY VERIFIED": "bg-yellow-600/30 text-yellow-300 border-yellow-500/30",
    INCORRECT: "bg-red-600/30 text-red-300 border-red-500/30",
    MISLEADING: "bg-orange-600/30 text-orange-300 border-orange-500/30",
  };
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded border ${colors[status] || colors.VERIFIED}`}>
      {status}
    </span>
  );
}

function Verification() {
  const claims = [
    {
      claim: "PostgreSQL + Supabase free tier = ~$0.10-0.30/month for ~20 thoughts/day",
      status: "PARTIALLY VERIFIED",
      analysis: "Embedding costs via OpenAI text-embedding-3-small at ~600/month = $0.006/mo. pgvector included free on Supabase. However, Supabase free tier auto-pauses after 7 days inactivity — breaks continuous systems. Production use requires $25/mo Pro plan.",
      innovation: "Use local embedding models (e.g., all-MiniLM-L6-v2) to eliminate API costs entirely. Run on Ollama for zero ongoing cost. For enterprise: self-host PostgreSQL + pgvector on existing infrastructure.",
    },
    {
      claim: "OpenClaw passed 190,000 GitHub stars; spawned 1.5M autonomous agents",
      status: "INCORRECT",
      analysis: "Stars actually exceeded 250,000+ by March 2026 (understated, not overstated). The '1.5 million autonomous agents' is misleading — security researchers found these mapped to ~17,000 human owners. Moltbook also suffered a major security breach due to exposed Supabase credentials with disabled row-level security.",
      innovation: "Critical lesson for enterprise: agent spawning without governance creates security exposure. The Open Brain architecture must include agent identity management and access control from day one.",
    },
    {
      claim: "MCP is the 'HTTP infrastructure of the AI age' / 'USB-C of AI'",
      status: "VERIFIED",
      analysis: "97M+ monthly SDK downloads. Adopted by OpenAI, Google, Microsoft, Anthropic. Donated to Linux Foundation (Agentic AI Foundation) in December 2025. De facto standard for AI-to-tool connections. 10,000+ active public MCP servers.",
      innovation: "MCP is the correct integration protocol. But for enterprise memory systems, you need MCP + access control + audit logging. The protocol itself has no built-in auth — this must be layered on.",
    },
    {
      claim: "Platform memories (Claude/ChatGPT/Gemini/Grok) are siloed with no cross-sharing",
      status: "VERIFIED",
      analysis: "Confirmed: each platform operates independently. Anthropic launched a memory import tool (March 2026) for manual copy-paste transfer. Mem0 raised $24M for cross-platform memory. OneContext (cited in video) is now out of business.",
      innovation: "The Open Brain thesis is validated by market evidence. However, the architecture should be bidirectional — not just read-from but write-back-to platform memories when useful. Also: Mem0's $24M funding validates the market, but their approach (hosted SaaS) contradicts the 'own your data' thesis.",
    },
    {
      claim: "US productivity grew ~2.7% in 2025, double the decade average (Brynjolfsson)",
      status: "PARTIALLY VERIFIED",
      analysis: "Official BLS data shows 2.2% full-year 2025 nonfarm productivity growth, not 2.7%. Q4-to-Q4 was 2.8%. The decade average of ~1.4% makes the 'double' claim roughly correct. However: an NBER study found 90% of firms report AI has had NO measurable productivity impact despite 70% adoption.",
      innovation: "The productivity gap between AI-fluent and AI-naive workers is the real story — not aggregate numbers. This supports the memory architecture thesis: the compounding advantage is real but unevenly distributed.",
    },
    {
      claim: "HBR: Workers toggle between applications 1,200 times/day",
      status: "VERIFIED",
      analysis: "From HBR August 2022 study across 137 users at 3 Fortune 500 companies. Each toggle costs ~2 seconds. Total: ~4 hours/week (9% of work time) lost to context switching.",
      innovation: "This directly quantifies the value of a unified memory layer. If Open Brain reduces toggles by even 20%, that's 48 minutes/week recovered per worker. At scale: massive ROI calculation for enterprise adoption.",
    },
    {
      claim: "pgvector is production-viable for personal and enterprise knowledge systems",
      status: "VERIFIED",
      analysis: "pgvectorscale (Timescale enhancement) achieves 471 QPS at 99% recall on 50M vectors — 11.4x better than Qdrant in benchmarks. PostgreSQL provides ACID compliance, backups, security. SOC2 Type 2 on Supabase.",
      innovation: "For enterprise: pgvector is the right choice IF you keep HNSW indexes in memory. For personal use at scale (10K+ notes): consider hybrid retrieval — semantic search + BM25 keyword search combined. This catches edge cases semantic search misses.",
    },
    {
      claim: "The internet is forking into human-readable and agent-readable layers",
      status: "VERIFIED",
      analysis: "Multiple sources confirm this bifurcation in 2025-2026. Agents don't need CSS, layouts, fonts — they need structured data, APIs, semantic endpoints. Web infrastructure is actively restructuring to serve both.",
      innovation: "This is the deepest insight in the video. Your memory architecture IS your agent-readable layer. But the innovation opportunity is building the translation layer — converting human-readable artifacts (meeting notes, Slack threads, emails) into agent-readable structured knowledge automatically.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Claim Verification & Analysis</h2>
        <p className="text-gray-400">Every major claim fact-checked against primary sources</p>
      </div>
      <div className="space-y-4">
        {claims.map((c, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex justify-between items-start gap-3">
                <p className="text-white font-medium text-sm flex-1">"{c.claim}"</p>
                <Badge status={c.status} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700/50">
              <div className="p-4">
                <div className="text-xs text-gray-500 uppercase mb-2">Verification</div>
                <p className="text-sm text-gray-300">{c.analysis}</p>
              </div>
              <div className="p-4">
                <div className="text-xs text-indigo-400 uppercase mb-2">Innovation Opportunity</div>
                <p className="text-sm text-indigo-200">{c.innovation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryLayer() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Memory Architecture: Deep Analysis</h2>
        <p className="text-gray-400">The Open Brain proposal analyzed, improved, and extended for enterprise</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-indigo-300 mb-3">The Core Insight That Changes Everything</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          The video's speaker arrives at a profound architectural insight: memory architecture determines agent
          capabilities more than model selection does. Combined with the harness thesis (harness determines
          performance more than model), we get a unified principle: <span className="text-white font-semibold">the
          infrastructure around the model — harness + memory — is the true performance multiplier</span>. The model
          itself is a commodity. This reframes the entire enterprise AI investment thesis.
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Open Brain Architecture — As Proposed</h3>
        <div className="space-y-2">
          {[
            { layer: "Capture Layer", desc: "Slack/messaging input → Supabase Edge Function", color: "bg-blue-600" },
            { layer: "Processing Layer", desc: "Parallel: embedding generation + LLM metadata extraction", color: "bg-blue-500" },
            { layer: "Storage Layer", desc: "PostgreSQL + pgvector (vector embeddings + structured metadata)", color: "bg-indigo-600" },
            { layer: "Retrieval Layer", desc: "MCP Server exposing 3 tools: semantic_search, list_recent, stats", color: "bg-indigo-500" },
            { layer: "Consumption Layer", desc: "Any MCP-compatible client (Claude, ChatGPT, Cursor, agents)", color: "bg-purple-600" },
          ].map((l, i) => (
            <div key={i} className="flex gap-3">
              <div className={`${l.color} rounded-lg px-4 py-3 min-w-[180px] text-white font-semibold text-sm flex items-center`}>
                {l.layer}
              </div>
              <div className="bg-gray-900/50 rounded-lg px-4 py-3 flex-1 text-sm text-gray-300 flex items-center">
                {l.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-300 mb-3">Architectural Gaps Identified</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              gap: "No Access Control",
              detail: "MCP has no built-in auth. Any connected client gets full brain access. Enterprise deployment requires RBAC, scoping, and audit trails.",
            },
            {
              gap: "Single-User Design",
              detail: "Architecture assumes one person, one brain. Enterprise needs multi-tenant memory with organizational knowledge graphs alongside personal ones.",
            },
            {
              gap: "No Write-Back Loop",
              detail: "Retrieval-only MCP tools. Missing: agents writing insights BACK to the brain, creating a self-reinforcing knowledge loop.",
            },
            {
              gap: "Metadata Extraction Fragility",
              detail: "Speaker acknowledges LLM classification errors. No feedback mechanism to correct misclassifications or retrain extraction prompts.",
            },
            {
              gap: "No Knowledge Graph Layer",
              detail: "Flat vector storage. Missing: entity relationships, temporal connections, causal links. GraphRAG would dramatically improve retrieval quality.",
            },
            {
              gap: "Supabase Free Tier Risk",
              detail: "Auto-pause after 7 days inactivity breaks the system. Single vendor dependency contradicts the 'own your data' thesis.",
            },
          ].map((g, i) => (
            <div key={i} className="bg-black/20 rounded-lg p-3">
              <div className="text-amber-300 font-semibold text-sm mb-1">{g.gap}</div>
              <p className="text-xs text-gray-400">{g.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Innovations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Optimizations & Innovations</h2>
        <p className="text-gray-400">How to evolve the Open Brain into enterprise-grade agentic memory</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-green-300 mb-3">1. Hybrid Retrieval: Semantic + BM25 + Knowledge Graph</h3>
          <p className="text-sm text-gray-300 mb-3">
            Pure semantic search misses exact matches. Pure keyword search misses meaning. The innovation:
            combine all three retrieval methods with a learned re-ranker.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-green-300 font-bold text-lg">Semantic</div>
              <div className="text-xs text-gray-400 mt-1">pgvector cosine similarity — finds conceptual matches</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-green-300 font-bold text-lg">BM25</div>
              <div className="text-xs text-gray-400 mt-1">PostgreSQL full-text search — catches exact terms semantic misses</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-green-300 font-bold text-lg">GraphRAG</div>
              <div className="text-xs text-gray-400 mt-1">Entity relationships — surfaces contextual connections</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Combined with reciprocal rank fusion (RRF), this consistently outperforms any single method by 15-30% on retrieval benchmarks.</p>
        </div>

        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-300 mb-3">2. Agent Write-Back Loop (Self-Reinforcing Memory)</h3>
          <p className="text-sm text-gray-300 mb-3">
            The Open Brain proposal is read-only from the agent's perspective. The innovation: let agents write
            discoveries, synthesis, and decisions back into the brain. This creates a flywheel:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            {["Human captures thought", "Agent retrieves context", "Agent generates insight", "Insight written back to brain", "Next retrieval is richer"].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-blue-600/30 text-blue-200 px-3 py-2 rounded-lg">{step}</div>
                {i < arr.length - 1 && <span className="text-blue-400 font-bold">{">"}</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            MCP tools needed: capture_thought (write), update_thought (edit), link_thoughts (graph edges),
            create_synthesis (agent-generated summaries). Tag agent-written vs. human-written for provenance.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-300 mb-3">3. Multi-Tier Memory Architecture</h3>
          <p className="text-sm text-gray-300 mb-3">
            Human cognition has working memory, short-term, and long-term memory. The Open Brain treats
            everything as flat storage. The innovation: a tiered memory system that mirrors cognition.
          </p>
          <div className="space-y-2">
            {[
              { tier: "Hot Memory (Working)", desc: "Current session context, active project state, recent decisions — kept in-context or fast cache", retention: "Hours", access: "Immediate" },
              { tier: "Warm Memory (Episodic)", desc: "Recent interactions, meeting notes, weekly patterns — semantic search priority", retention: "Days-Weeks", access: "Fast retrieval" },
              { tier: "Cool Memory (Semantic)", desc: "Accumulated knowledge, relationships, principles — GraphRAG + vector search", retention: "Months", access: "Deep search" },
              { tier: "Cold Memory (Archival)", desc: "Historical context, old decisions with rationale — compressed summaries, full text on demand", retention: "Years", access: "Explicit query" },
            ].map((t, i) => (
              <div key={i} className="bg-black/20 rounded-lg p-3 grid grid-cols-4 gap-3 text-sm">
                <div className="text-purple-300 font-semibold">{t.tier}</div>
                <div className="text-gray-300 col-span-1">{t.desc}</div>
                <div className="text-gray-500">{t.retention}</div>
                <div className="text-gray-500">{t.access}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-amber-300 mb-3">4. Local-First Embedding (Zero API Cost)</h3>
          <p className="text-sm text-gray-300 mb-3">
            The proposal depends on OpenAI's embedding API. The innovation: run embedding models locally
            via Ollama, eliminating the last external dependency and reducing cost to true zero.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-amber-300 font-semibold text-sm">Proposed (Cloud)</div>
              <div className="text-xs text-gray-400 mt-1">OpenAI text-embedding-3-small: $0.006/mo at 600 embeddings/mo. Requires internet. API key dependency. Data leaves your machine.</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-amber-300 font-semibold text-sm">Optimized (Local)</div>
              <div className="text-xs text-gray-400 mt-1">all-MiniLM-L6-v2 via Ollama: $0.00/mo. Runs offline. No API keys. Data never leaves your machine. 384-dim vectors (vs 1536) = smaller DB.</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-cyan-300 mb-3">5. Organizational Knowledge Topology</h3>
          <p className="text-sm text-gray-300 mb-3">
            The Open Brain is designed for individuals. The enterprise innovation: layered knowledge that mirrors
            organizational structure, enabling agents to access the right scope of memory.
          </p>
          <div className="space-y-2">
            {[
              { scope: "Personal Brain", desc: "Individual's thoughts, decisions, relationships — private by default", access: "Owner + their agents only" },
              { scope: "Team Brain", desc: "Shared project context, team decisions, sprint artifacts — team-scoped", access: "Team members + team agents" },
              { scope: "Department Brain", desc: "Departmental knowledge, policies, domain expertise — cross-team", access: "Department + delegated agents" },
              { scope: "Organizational Brain", desc: "Company-wide principles, strategy, institutional memory — org-scoped", access: "All authenticated agents + humans" },
            ].map((s, i) => (
              <div key={i} className="bg-black/20 rounded-lg p-3 flex justify-between items-center gap-3">
                <div>
                  <div className="text-cyan-300 font-semibold text-sm">{s.scope}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
                </div>
                <div className="text-xs text-gray-500 min-w-[140px] text-right">{s.access}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuadAlignment() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">The Quad-Alignment Framework</h2>
        <p className="text-gray-400">Evolving from tri-alignment to include the memory layer as a fourth pillar</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-indigo-300 mb-3">Why Three Pillars Became Four</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          The original tri-alignment framework (Org Structure + Personnel + Agentic Infrastructure)
          missed a critical dimension revealed by the Open Brain analysis: <span className="text-white font-semibold">
          persistent, agent-readable memory is not a feature of the harness — it's a separate
          architectural layer that cuts across all three pillars</span>. Memory determines what the organization
          knows collectively, what individual personnel can access, and how effectively agents can operate
          across sessions and tools. It deserves its own pillar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            name: "Organizational Structure",
            color: "blue",
            items: [
              "Outcome-aligned agentic teams",
              "Bounded autonomy governance tiers",
              "Cross-functional coordination protocols",
              "Decision authority mapping",
            ],
          },
          {
            name: "Personnel Strategy",
            color: "emerald",
            items: [
              "Emerging roles: Harness Engineers, Context Engineers",
              "Skills-based task routing (human vs. agent)",
              "Hybrid team performance frameworks",
              "Agent Manager capability development",
            ],
          },
          {
            name: "Agentic Infrastructure",
            color: "purple",
            items: [
              "Model-agnostic gateway layer",
              "Harness abstraction (collaborator/contractor)",
              "MCP-based tool integration",
              "Multi-agent orchestration patterns",
            ],
          },
          {
            name: "Memory Architecture",
            color: "amber",
            items: [
              "Agent-readable knowledge layer (Open Brain)",
              "Multi-tier memory (hot/warm/cool/cold)",
              "Organizational knowledge topology (personal→org)",
              "Cross-platform persistence via MCP",
            ],
          },
        ].map((pillar, i) => (
          <div
            key={i}
            className={`rounded-xl p-5 border ${
              pillar.color === "blue" ? "bg-blue-900/20 border-blue-500/30" :
              pillar.color === "emerald" ? "bg-emerald-900/20 border-emerald-500/30" :
              pillar.color === "purple" ? "bg-purple-900/20 border-purple-500/30" :
              "bg-amber-900/20 border-amber-500/30"
            }`}
          >
            <h4 className={`text-lg font-bold mb-3 ${
              pillar.color === "blue" ? "text-blue-300" :
              pillar.color === "emerald" ? "text-emerald-300" :
              pillar.color === "purple" ? "text-purple-300" :
              "text-amber-300"
            }`}>{pillar.name}</h4>
            <div className="space-y-2">
              {pillar.items.map((item, j) => (
                <div key={j} className="bg-black/20 rounded px-3 py-2 text-sm text-gray-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Alignment Interfaces (6 Connections)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { from: "Org", to: "Personnel", label: "Role Design", detail: "Org defines roles; personnel fills them" },
            { from: "Org", to: "Infrastructure", label: "Governance Binding", detail: "Authority boundaries = agent autonomy limits" },
            { from: "Org", to: "Memory", label: "Knowledge Topology", detail: "Org structure defines memory scope and access tiers" },
            { from: "Personnel", to: "Infrastructure", label: "Capability Mapping", detail: "Skills determine agent vs. human task routing" },
            { from: "Personnel", to: "Memory", label: "Context Engineering", detail: "Personnel build and curate the institutional memory" },
            { from: "Infrastructure", to: "Memory", label: "State Persistence", detail: "Harness reads/writes memory; memory enables cross-session continuity" },
          ].map((a, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-3 flex items-start gap-3">
              <div className="flex items-center gap-1 min-w-[100px] text-xs font-mono text-indigo-400 shrink-0">
                {a.from} {"<>"} {a.to}
              </div>
              <div>
                <span className="text-white text-sm font-semibold">{a.label}: </span>
                <span className="text-gray-400 text-sm">{a.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-300 mb-3">The Unified Principle</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            Two independent analyses — harness architecture and memory architecture — converge on the same
            strategic conclusion: <span className="text-white font-semibold">the model is a commodity; the infrastructure
            around the model is the competitive moat</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <div className="text-red-300 font-bold text-lg mb-2">Harness</div>
              <div className="text-xs text-gray-400">Same model, 1.86x performance gap (CORE benchmark). Harness determines whether intelligence translates into useful work.</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <div className="text-red-300 font-bold text-lg mb-2">Memory</div>
              <div className="text-xs text-gray-400">Same model, dramatically different output quality based on context availability. Memory determines whether the model knows what you know.</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <div className="text-red-300 font-bold text-lg mb-2">Together</div>
              <div className="text-xs text-gray-400">Harness + Memory = the complete performance multiplier. Models are interchangeable; your infrastructure investment is what compounds.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnterpriseMemory() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Enterprise Memory Architecture Design</h2>
        <p className="text-gray-400">Scaling Open Brain from personal to organizational with governance</p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Enterprise Memory Stack</h3>
        <div className="space-y-2">
          {[
            { layer: "L7: Governance & Audit", desc: "Access control, audit logging, compliance monitoring, data retention policies", color: "bg-red-600" },
            { layer: "L6: Knowledge Topology", desc: "Personal → Team → Department → Organization scoped memory tiers", color: "bg-orange-600" },
            { layer: "L5: Agent Write-Back", desc: "Agents contribute discoveries, syntheses, and decisions back to the brain", color: "bg-amber-600" },
            { layer: "L4: Hybrid Retrieval", desc: "Semantic (pgvector) + BM25 (full-text) + GraphRAG (entity relationships)", color: "bg-indigo-600" },
            { layer: "L3: Multi-Tier Storage", desc: "Hot (session cache) → Warm (recent) → Cool (knowledge) → Cold (archive)", color: "bg-indigo-500" },
            { layer: "L2: Processing Pipeline", desc: "Embedding generation + metadata extraction + entity linking + classification", color: "bg-purple-600" },
            { layer: "L1: Capture Layer", desc: "MCP write tools + Slack/Teams/email integrations + browser extensions", color: "bg-purple-500" },
            { layer: "L0: Storage Foundation", desc: "PostgreSQL + pgvector + pgvectorscale, self-hosted or managed", color: "bg-gray-600" },
          ].map((l, i) => (
            <div key={i} className="flex gap-3">
              <div className={`${l.color} rounded-lg px-3 py-2 min-w-[200px] text-white font-semibold text-xs flex items-center`}>
                {l.layer}
              </div>
              <div className="bg-gray-900/50 rounded-lg px-3 py-2 flex-1 text-xs text-gray-300 flex items-center">
                {l.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">MCP Server Interface Design (Enterprise)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { tool: "semantic_search", type: "READ", desc: "Find thoughts by meaning with scope filtering (personal/team/org)", auth: "Scoped to user's access level" },
            { tool: "exact_search", type: "READ", desc: "BM25 keyword search for precise term matching", auth: "Scoped to user's access level" },
            { tool: "graph_query", type: "READ", desc: "Traverse entity relationships and find connected knowledge", auth: "Scoped + relationship permissions" },
            { tool: "capture_thought", type: "WRITE", desc: "Store new thought with auto-embedding and metadata extraction", auth: "Personal scope by default" },
            { tool: "link_thoughts", type: "WRITE", desc: "Create explicit connections between knowledge nodes", auth: "Must own both nodes or have write access" },
            { tool: "create_synthesis", type: "WRITE", desc: "Agent-generated summaries tagged with provenance", auth: "Tagged as agent-written; reviewable" },
            { tool: "weekly_digest", type: "COMPUTE", desc: "Pattern analysis across recent captures with gap detection", auth: "Scoped to user's captures" },
            { tool: "knowledge_health", type: "COMPUTE", desc: "Coverage metrics, staleness detection, relationship density", auth: "Team/org level for managers" },
          ].map((t, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <code className="text-indigo-300 font-mono text-sm">{t.tool}</code>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  t.type === "READ" ? "bg-green-600/30 text-green-300" :
                  t.type === "WRITE" ? "bg-blue-600/30 text-blue-300" :
                  "bg-purple-600/30 text-purple-300"
                }`}>{t.type}</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{t.desc}</p>
              <p className="text-xs text-gray-600">{t.auth}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 border border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-cyan-300 mb-3">Connecting Harness + Memory: The Full Stack</h3>
        <p className="text-sm text-gray-300 mb-4">
          The harness (from Video 1) and the memory layer (from Video 2) are complementary architectural layers.
          Here's how they integrate:
        </p>
        <div className="space-y-2">
          {[
            {
              harness: "Claude Code (Collaborator)",
              memory: "CLAUDE.md files + Open Brain MCP → agent reads project memory AND personal/org brain simultaneously",
              benefit: "Deep context from both project artifacts and institutional knowledge"
            },
            {
              harness: "Codex (Contractor)",
              memory: "Repo-encoded principles + Open Brain MCP read-only → agent uses org brain for architectural decisions",
              benefit: "Isolated execution with organizational context for better decision-making"
            },
            {
              harness: "Cowork (Knowledge Work)",
              memory: "Open Brain is the primary memory layer → captures human thinking, enables agent continuity",
              benefit: "Non-technical users get the same compounding context advantage"
            },
            {
              harness: "Multi-Agent Teams",
              memory: "Shared team brain via MCP → all sub-agents access same institutional memory",
              benefit: "Coordinated agents with consistent organizational context"
            },
          ].map((h, i) => (
            <div key={i} className="bg-black/20 rounded-lg p-3">
              <div className="text-cyan-300 font-semibold text-sm">{h.harness}</div>
              <div className="text-xs text-gray-300 mt-1">{h.memory}</div>
              <div className="text-xs text-cyan-400 mt-1">{h.benefit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Roadmap() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Implementation Strategy</h2>
        <p className="text-gray-400">Phased deployment integrating harness + memory + org alignment</p>
      </div>

      <div className="space-y-4">
        {[
          {
            phase: "Phase 0: Personal Proof of Concept (Week 1-2)",
            color: "gray",
            items: [
              "Deploy Open Brain on Supabase (personal instance) following the proposed architecture",
              "Connect to Claude + ChatGPT via MCP server — validate cross-platform retrieval",
              "Run migration: extract existing memories from Claude/ChatGPT into Open Brain",
              "Test semantic search quality; identify classification failure patterns",
              "Benchmark: capture 20 thoughts/day for 2 weeks, measure retrieval quality",
            ],
          },
          {
            phase: "Phase 1: Enhanced Architecture (Weeks 3-6)",
            color: "blue",
            items: [
              "Add hybrid retrieval: BM25 full-text search alongside semantic search",
              "Implement agent write-back: agents can capture insights back to the brain",
              "Add provenance tagging: human-written vs. agent-generated content",
              "Deploy local embedding model (Ollama) to eliminate API dependency",
              "Self-host PostgreSQL + pgvector on existing infrastructure (if enterprise)",
              "Build the multi-tier memory system (hot/warm/cool/cold)",
            ],
          },
          {
            phase: "Phase 2: Enterprise Foundation (Months 2-4)",
            color: "purple",
            items: [
              "Deploy model-agnostic gateway layer (harness infrastructure from Video 1)",
              "Implement knowledge topology: personal → team → department → org memory scopes",
              "Add RBAC and audit logging to MCP server (enterprise governance)",
              "Deploy GraphRAG layer: entity extraction, relationship mapping, connection discovery",
              "Begin harness philosophy selection per department (collaborator vs. contractor)",
              "Hire/assign first Context Engineers and Harness Engineers",
            ],
          },
          {
            phase: "Phase 3: Agentic Integration (Months 4-8)",
            color: "emerald",
            items: [
              "Connect Open Brain MCP to harness-level agents (Claude Code, Codex, Cowork)",
              "Deploy multi-agent orchestration with shared organizational memory",
              "Implement bounded autonomy tiers aligned to org decision authority",
              "Build agent-to-agent knowledge sharing via shared brain queries",
              "Create weekly digest and knowledge health monitoring dashboards",
              "Progressive disclosure: agents discover and use brain tools just-in-time",
            ],
          },
          {
            phase: "Phase 4: Compounding Advantage (Months 8-12+)",
            color: "amber",
            items: [
              "Measure compounding effect: retrieval quality over time, agent performance curves",
              "Build switching cost analysis: quantify lock-in risk across harness and memory layers",
              "Implement governance agents that monitor other agents' brain access patterns",
              "Scale successful patterns across all departments",
              "Knowledge graph visualization: see organizational thinking patterns",
              "Continuous optimization: token economics, retrieval precision, memory tier management",
            ],
          },
        ].map((p, i) => (
          <div key={i} className={`rounded-xl p-5 border ${
            p.color === "gray" ? "bg-gray-800/30 border-gray-600/30" :
            p.color === "blue" ? "bg-blue-900/15 border-blue-500/30" :
            p.color === "purple" ? "bg-purple-900/15 border-purple-500/30" :
            p.color === "emerald" ? "bg-emerald-900/15 border-emerald-500/30" :
            "bg-amber-900/15 border-amber-500/30"
          }`}>
            <h3 className={`text-lg font-bold mb-3 ${
              p.color === "gray" ? "text-gray-300" :
              p.color === "blue" ? "text-blue-300" :
              p.color === "purple" ? "text-purple-300" :
              p.color === "emerald" ? "text-emerald-300" :
              "text-amber-300"
            }`}>{p.phase}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {p.items.map((item, j) => (
                <div key={j} className="bg-black/20 rounded-lg px-3 py-2 text-sm text-gray-300">{item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-indigo-300 mb-3">The Strategic Thesis (Unified)</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            Two independent analyses — harness divergence and memory architecture — converge on a single
            enterprise strategy:
          </p>
          <div className="bg-black/20 rounded-lg p-4 text-white text-center font-semibold">
            Model = Commodity. Harness = Performance Multiplier. Memory = Compounding Asset.
            Organization = Alignment Layer.
          </div>
          <p>
            Organizations that invest in the quad-alignment framework — aligning org structure, personnel
            skills, agentic infrastructure, AND persistent agent-readable memory — will compound advantages
            weekly. Organizations that focus on model selection will reset to zero with every model release.
          </p>
          <p>
            The right question is not "which model is best?" or even "which harness is best?" It's:
            "which infrastructure philosophy — harness + memory + organization — matches how our teams
            work and creates the fastest compounding advantage?"
          </p>
        </div>
      </div>
    </div>
  );
}

const sectionComponents = {
  verification: Verification,
  "memory-layer": MemoryLayer,
  innovations: Innovations,
  "quad-alignment": QuadAlignment,
  "enterprise-memory": EnterpriseMemory,
  roadmap: Roadmap,
};

export default function OpenBrainAnalysis() {
  const [activeSection, setActiveSection] = useState("verification");
  const ActiveComponent = sectionComponents[activeSection];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Open Brain: Verified Analysis & Enterprise Architecture
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Memory Layer Integration with Harness Architecture — Quad-Alignment Framework v2
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          <nav className="w-56 shrink-0 space-y-1 sticky top-20 self-start">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                  activeSection === section.id
                    ? "bg-amber-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <span className="mr-2 font-mono text-xs">[{section.icon}]</span>
                {section.title}
              </button>
            ))}
          </nav>
          <main className="flex-1 min-w-0">
            <ActiveComponent />
          </main>
        </div>
      </div>

      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-600">
          Open Brain Analysis v2.0 — Claims verified against primary sources, March 2026
        </div>
      </footer>
    </div>
  );
}
