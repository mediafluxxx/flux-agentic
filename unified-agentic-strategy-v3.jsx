import { useState } from "react";

const tabs = [
  { id: "synthesis", label: "Grand Synthesis" },
  { id: "verification", label: "Claims Verified" },
  { id: "disciplines", label: "Four Disciplines" },
  { id: "penta", label: "Penta-Alignment" },
  { id: "skills", label: "Skill Development" },
  { id: "memory-acumen", label: "Persistent Memory & Acumen" },
  { id: "roadmap", label: "Strategic Roadmap" },
];

function Badge({ status }) {
  const c = {
    VERIFIED: "bg-green-600/30 text-green-300",
    "PARTIALLY VERIFIED": "bg-yellow-600/30 text-yellow-300",
    UNVERIFIED: "bg-gray-600/30 text-gray-300",
    "NOVEL CLAIM": "bg-blue-600/30 text-blue-300",
    INCORRECT: "bg-red-600/30 text-red-300",
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded ${c[status] || c.VERIFIED}`}>{status}</span>;
}

function GrandSynthesis() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Grand Synthesis: Three Analyses, One Strategy</h2>
        <p className="text-gray-400">Harness Architecture + Memory Architecture + Prompting Disciplines = Unified Enterprise AI Framework</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-indigo-300 mb-4">The Convergence</h3>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">
          Three independent analyses from the same creator converge on a single unified thesis about enterprise AI.
          Each analysis reveals a different dimension of the same strategic reality:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-blue-300 font-bold mb-2">Video 1: Harness</div>
            <div className="text-xs text-gray-400 mb-2">The infrastructure wrapping the model determines performance more than the model itself.</div>
            <div className="text-blue-400 text-xs font-semibold">Key insight: Same model, 1.86x performance gap based on harness alone.</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-amber-300 font-bold mb-2">Video 2: Memory</div>
            <div className="text-xs text-gray-400 mb-2">Persistent, agent-readable memory creates compounding advantages that platform-siloed memory cannot.</div>
            <div className="text-amber-400 text-xs font-semibold">Key insight: Memory architecture determines agent capability more than model selection.</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-emerald-300 font-bold mb-2">Video 3: Disciplines</div>
            <div className="text-xs text-gray-400 mb-2">Prompting has split into four skills operating at different altitudes. Most people practice only one.</div>
            <div className="text-emerald-400 text-xs font-semibold">Key insight: The bottleneck skill shifts from verbal fluency to specification completeness.</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Unified Principle</h3>
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-lg p-5 text-center">
          <p className="text-white font-bold text-lg mb-3">Model = Commodity. Harness = Performance Multiplier. Memory = Compounding Asset. Disciplines = Human Skill Stack.</p>
          <p className="text-gray-400 text-sm">Organizations that invest in all four layers compound advantages weekly. Organizations that focus on model selection reset to zero with every model release.</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">How the Three Analyses Map Together</h3>
        <div className="space-y-2">
          {[
            { discipline: "Prompt Craft (L1)", harness: "Chat interface layer", memory: "Session-only context", scope: "Individual, synchronous", color: "text-gray-400" },
            { discipline: "Context Engineering (L2)", harness: "CLAUDE.md, MCP tools, skills system", memory: "Open Brain retrieval via MCP", scope: "Individual → Team", color: "text-blue-300" },
            { discipline: "Intent Engineering (L3)", harness: "Bounded autonomy governance", memory: "Organizational knowledge topology", scope: "Team → Department", color: "text-purple-300" },
            { discipline: "Specification Engineering (L4)", harness: "Planner-worker orchestration", memory: "Full org corpus as agent-readable specs", scope: "Organization-wide", color: "text-amber-300" },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 bg-gray-900/50 rounded-lg p-3 text-xs">
              <div className={`font-semibold ${row.color}`}>{row.discipline}</div>
              <div className="text-gray-300">{row.harness}</div>
              <div className="text-gray-300">{row.memory}</div>
              <div className="text-gray-300">{row.scope}</div>
              <div className="text-gray-500 text-right">{i === 0 ? "Table stakes" : i === 1 ? "Current focus" : i === 2 ? "Emerging" : "Frontier"}</div>
            </div>
          ))}
          <div className="grid grid-cols-5 gap-2 px-3 text-xs text-gray-600">
            <div>Discipline</div><div>Harness Layer</div><div>Memory Layer</div><div>Scope</div><div>Maturity</div>
          </div>
        </div>
      </div>

      <div className="bg-red-900/15 border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-300 mb-3">The Strategic Innovation Opportunity</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          No one is currently teaching or building all four layers as an integrated system. The speaker treats them as
          separate videos. Enterprise vendors sell point solutions. Consulting firms address one layer at a time. The
          innovation is building a unified architecture where harness design, memory infrastructure, organizational
          alignment, and human skill development are treated as a single interdependent system. This is the
          competitive moat: not any single layer, but the integration across all layers.
        </p>
      </div>
    </div>
  );
}

function ClaimsVerification() {
  const claims = [
    { claim: "Toby Lutke: 'politics is bad context engineering'", status: "VERIFIED", source: "Acquired podcast, X post", detail: "Exact quotes confirmed from multiple sources" },
    { claim: "Klarna AI resolved 2.3M conversations, then had to rehire humans", status: "PARTIALLY VERIFIED", source: "Klarna press release, Fortune", detail: "2.3M number confirmed. CEO admitted quality problems. Rehiring confirmed. 'Wrong optimization' framing is editorialized." },
    { claim: "Telus has 13,000 custom AI solutions internally", status: "VERIFIED", source: "Google Cloud case study", detail: "57,000 employees using AI, 100B tokens/month, $90M+ in benefits" },
    { claim: "Zapier has 800+ agents internally", status: "VERIFIED", source: "Product School podcast", detail: "VP of Product confirmed on record" },
    { claim: "Harrison Chase: 'everything is context engineering'", status: "VERIFIED", source: "Sequoia Capital podcast, Jan 2026", detail: "Exact quote confirmed from Training Data episode" },
    { claim: "Claude Code session lengths doubled Oct-Jan 2026", status: "PARTIALLY VERIFIED", source: "Anthropic research", detail: "99.9th percentile turn duration: 25min→45min confirmed. Second doubling not documented." },
    { claim: "Anthropic recommends 'interview me in detail' workflow", status: "UNVERIFIED", source: "Not found in official docs", detail: "May be community-derived or from unofficial sources" },
    { claim: "CLAUDE.md 'every line earns its place' consensus", status: "PARTIALLY VERIFIED", source: "Community guides", detail: "Concept confirmed (<300 lines recommended). Exact phrase not sourced." },
    { claim: "Specification engineering as a formal discipline", status: "NOVEL CLAIM", source: "Speaker's framework", detail: "Related 'spec-driven development' emerging (EY, GitHub, O'Reilly). This specific framing may be original." },
    { claim: "Anthropic planner-worker architecture", status: "VERIFIED", source: "Anthropic engineering blog", detail: "Called 'orchestrator-worker' pattern in official documentation" },
    { claim: "Same model, 10x productivity gap based on prompting skill", status: "PARTIALLY VERIFIED", source: "Anecdotal/framework", detail: "Directionally supported by CORE benchmark (1.86x from harness alone). 10x is illustrative." },
    { claim: "Open Brain cost: $0.10-0.30/month", status: "PARTIALLY VERIFIED", source: "Supabase pricing, OpenAI API", detail: "Accurate for embedding costs. Supabase free tier auto-pauses after 7 days inactivity." },
    { claim: "pgvector production-viable", status: "VERIFIED", source: "Benchmarks, Supabase docs", detail: "471 QPS at 99% recall on 50M vectors. SOC2 Type 2 compliant." },
    { claim: "MCP is 'USB-C of AI'", status: "VERIFIED", source: "Industry adoption data", detail: "97M+ monthly SDK downloads. Linux Foundation governance. Adopted by all major AI companies." },
    { claim: "Platform memories are siloed", status: "VERIFIED", source: "Platform documentation", detail: "Confirmed. Anthropic launched manual import (Mar 2026). Mem0 raised $24M for cross-platform." },
    { claim: "HBR: 1,200 app toggles/day", status: "VERIFIED", source: "HBR, August 2022", detail: "137 users, 3 Fortune 500 companies. ~4 hrs/week lost." },
    { claim: "Harness benchmark: 78% vs 42% same model", status: "VERIFIED", source: "AI Engineer Summit, Jan 2026", detail: "CORE benchmark. Claude in Claude Code harness vs SWE Agent harness." },
    { claim: "OpenClaw 190K+ stars, 1.5M agents", status: "INCORRECT", source: "GitHub, security research", detail: "Stars: 250K+ (understated). 1.5M agents mapped to ~17K humans. Major security breach." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Complete Claims Verification</h2>
        <p className="text-gray-400">All 18 major claims across three videos, fact-checked against primary sources</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Verified", count: claims.filter(c => c.status === "VERIFIED").length, color: "text-green-400" },
          { label: "Partially", count: claims.filter(c => c.status === "PARTIALLY VERIFIED").length, color: "text-yellow-400" },
          { label: "Novel", count: claims.filter(c => c.status === "NOVEL CLAIM").length, color: "text-blue-400" },
          { label: "Issues", count: claims.filter(c => ["UNVERIFIED","INCORRECT"].includes(c.status)).length, color: "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {claims.map((c, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-3 flex items-start gap-3 border border-gray-700/50">
            <Badge status={c.status} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">{c.claim}</p>
              <p className="text-xs text-gray-500 mt-1">{c.detail}</p>
            </div>
            <div className="text-xs text-gray-600 shrink-0">{c.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FourDisciplines() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">The Four Prompting Disciplines — Analyzed & Extended</h2>
        <p className="text-gray-400">Framework analysis with enterprise optimization strategies</p>
      </div>

      {[
        {
          level: "L1: Prompt Craft",
          color: "gray",
          status: "Table Stakes",
          timeHorizon: "Seconds-minutes (synchronous)",
          description: "Structuring clear instructions with examples, guardrails, output format, and ambiguity resolution.",
          strengths: ["Well-documented by Anthropic, OpenAI, Google", "Immediate feedback loop enables rapid learning", "Foundation for all higher disciplines"],
          gaps: ["Ceiling hit when agents run autonomously", "Cannot encode institutional knowledge", "Rewards verbal fluency over strategic thinking"],
          optimization: "Automate prompt craft via reusable templates stored in skills/memory. Make good prompt structure the default, not a per-session effort.",
          personnel: "All AI-using personnel must reach competency. Test via structured exercises, not certification theater.",
        },
        {
          level: "L2: Context Engineering",
          color: "blue",
          status: "Current Industry Focus",
          timeHorizon: "Minutes-hours (session-spanning)",
          description: "Curating the optimal set of tokens for an LLM task: system prompts, tool definitions, retrieved documents, message history, memory systems, MCP connections.",
          strengths: ["Endorsed by Shopify CEO, LangChain founder, Anthropic", "CLAUDE.md pattern provides concrete implementation", "MCP standardizes tool integration"],
          gaps: ["Often conflated with 'everything' (Harrison Chase danger)", "No standard methodology for measuring context quality", "Progressive disclosure not yet mainstream practice"],
          optimization: "Integrate Open Brain memory layer as the persistent context source. Build progressive disclosure into all MCP servers. Measure context quality via agent task success rate.",
          personnel: "Dedicated Context Engineers who maintain CLAUDE.md files, design RAG pipelines, manage MCP server configurations. Cross-functional role touching IT + domain expertise.",
        },
        {
          level: "L3: Intent Engineering",
          color: "purple",
          status: "Emerging",
          timeHorizon: "Hours-days (multi-session)",
          description: "Encoding organizational purpose, goals, values, trade-off hierarchies, and decision boundaries into infrastructure that agents can act against.",
          strengths: ["Klarna case provides vivid failure mode", "Bounded autonomy frameworks exist", "Directly maps to organizational governance"],
          gaps: ["No standard framework for encoding intent", "Failure modes are catastrophic and delayed (Klarna-type)", "Requires organizational buy-in, not just individual skill"],
          optimization: "Build intent as a layer in the knowledge topology (Open Brain L6). Encode decision hierarchies as structured data agents can query. Create intent verification checkpoints in multi-agent orchestration.",
          personnel: "Intent Architects who translate business strategy into agent-readable decision frameworks. Likely a senior role bridging product/strategy and AI engineering.",
        },
        {
          level: "L4: Specification Engineering",
          color: "amber",
          status: "Frontier / Novel",
          timeHorizon: "Days-weeks (long-running autonomous)",
          description: "Writing complete, structured, internally consistent descriptions of what outputs should be — treating the entire organizational document corpus as agent-fungible specifications.",
          strengths: ["Emerging industry validation (EY, GitHub, O'Reilly on spec-driven development)", "Anthropic's harness research confirms need", "Directly enables planner-worker architectures"],
          gaps: ["No established methodology — speaker may be defining the discipline", "Requires cultural shift in how organizations write documents", "Five primitives (self-contained problems, acceptance criteria, constraint architecture, decomposition, evaluation design) need training programs"],
          optimization: "Build specification templates into the Open Brain as reusable patterns. Create specification quality scoring (automated). Train planner agents on your organization's specification patterns so they learn your decomposition style.",
          personnel: "Specification Engineers who maintain organizational document standards for agent readability. Must understand both business domain and agent capabilities. This is the highest-leverage new role.",
        },
      ].map((d, i) => (
        <div key={i} className={`rounded-xl border overflow-hidden ${
          d.color === "gray" ? "border-gray-600/30" :
          d.color === "blue" ? "border-blue-500/30" :
          d.color === "purple" ? "border-purple-500/30" :
          "border-amber-500/30"
        }`}>
          <div className={`px-5 py-3 flex justify-between items-center ${
            d.color === "gray" ? "bg-gray-700/30" :
            d.color === "blue" ? "bg-blue-900/30" :
            d.color === "purple" ? "bg-purple-900/30" :
            "bg-amber-900/30"
          }`}>
            <h3 className="text-lg font-bold text-white">{d.level}</h3>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400">{d.timeHorizon}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                d.color === "gray" ? "bg-gray-600/30 text-gray-300" :
                d.color === "blue" ? "bg-blue-600/30 text-blue-300" :
                d.color === "purple" ? "bg-purple-600/30 text-purple-300" :
                "bg-amber-600/30 text-amber-300"
              }`}>{d.status}</span>
            </div>
          </div>
          <div className="p-5 bg-gray-800/30 space-y-4">
            <p className="text-sm text-gray-300">{d.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-green-400 uppercase mb-2">Verified Strengths</div>
                {d.strengths.map((s, j) => (
                  <div key={j} className="bg-green-900/10 rounded px-3 py-1.5 text-xs text-gray-300 mb-1">{s}</div>
                ))}
              </div>
              <div>
                <div className="text-xs text-red-400 uppercase mb-2">Identified Gaps</div>
                {d.gaps.map((g, j) => (
                  <div key={j} className="bg-red-900/10 rounded px-3 py-1.5 text-xs text-gray-300 mb-1">{g}</div>
                ))}
              </div>
            </div>
            <div className="bg-indigo-900/15 border border-indigo-500/20 rounded-lg p-3">
              <div className="text-xs text-indigo-400 uppercase mb-1">Innovation Optimization</div>
              <p className="text-xs text-gray-300">{d.optimization}</p>
            </div>
            <div className="bg-emerald-900/15 border border-emerald-500/20 rounded-lg p-3">
              <div className="text-xs text-emerald-400 uppercase mb-1">Personnel Strategy</div>
              <p className="text-xs text-gray-300">{d.personnel}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PentaAlignment() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Penta-Alignment Framework</h2>
        <p className="text-gray-400">Five pillars that must co-evolve for enterprise AI architecture</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-indigo-300 mb-3">Evolution: Tri → Quad → Penta</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          Video 1 revealed the need for tri-alignment (Org + Personnel + Infrastructure). Video 2 added Memory as
          a fourth pillar. Video 3 reveals a fifth: <span className="text-white font-semibold">the Human Skill Stack
          </span> — the four prompting disciplines that personnel must develop, which are distinct from role assignments
          and require their own systematic development architecture. Personnel strategy (who fills which roles) is
          different from skill development (how people build competence across the four disciplines).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {[
          { name: "Org Structure", items: ["Decision authority", "Governance tiers", "Workflow ownership", "Cross-functional coordination"], color: "blue" },
          { name: "Personnel", items: ["Role design", "Task routing", "Hiring strategy", "Performance frameworks"], color: "emerald" },
          { name: "Infrastructure", items: ["Harness design", "Model gateway", "MCP integration", "Multi-agent orchestration"], color: "purple" },
          { name: "Memory", items: ["Open Brain", "Knowledge topology", "Cross-platform persistence", "Agent write-back"], color: "amber" },
          { name: "Skill Stack", items: ["Prompt craft (L1)", "Context engineering (L2)", "Intent engineering (L3)", "Spec engineering (L4)"], color: "rose" },
        ].map((p, i) => (
          <div key={i} className={`rounded-xl p-3 border ${
            p.color === "blue" ? "bg-blue-900/20 border-blue-500/20" :
            p.color === "emerald" ? "bg-emerald-900/20 border-emerald-500/20" :
            p.color === "purple" ? "bg-purple-900/20 border-purple-500/20" :
            p.color === "amber" ? "bg-amber-900/20 border-amber-500/20" :
            "bg-rose-900/20 border-rose-500/20"
          }`}>
            <h4 className={`text-sm font-bold mb-2 ${
              p.color === "blue" ? "text-blue-300" :
              p.color === "emerald" ? "text-emerald-300" :
              p.color === "purple" ? "text-purple-300" :
              p.color === "amber" ? "text-amber-300" :
              "text-rose-300"
            }`}>{p.name}</h4>
            {p.items.map((item, j) => (
              <div key={j} className="bg-black/20 rounded px-2 py-1.5 text-xs text-gray-300 mb-1">{item}</div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">The Toby Lutke Feedback Loop</h3>
        <p className="text-sm text-gray-300 mb-4">
          The speaker surfaces a profound observation from Shopify's CEO: developing AI prompting skills
          improves human-to-human communication. This creates a virtuous feedback loop:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {[
            "Better spec engineering for agents",
            "Forces clearer thinking",
            "Surfaces hidden assumptions",
            "Reduces organizational politics",
            "Improves human communication",
            "Better leadership decisions",
            "Better agent specifications",
          ].map((s, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="bg-indigo-600/20 text-indigo-200 px-3 py-2 rounded-lg">{s}</div>
              {i < arr.length - 1 && <span className="text-indigo-400">{">"}</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          This is the "double dividend" of specification engineering: better agents AND better organizations.
        </p>
      </div>
    </div>
  );
}

function SkillDevelopment() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Strategic Skill Development Architecture</h2>
        <p className="text-gray-400">Responsible approach to developing prompting acumen for agents and personnel</p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">The Five Specification Primitives — Training Program</h3>
        <div className="space-y-3">
          {[
            {
              primitive: "1. Self-Contained Problem Statements",
              exercise: "Take a request you'd make conversationally ('update the dashboard for Q3') and rewrite it as if the recipient has zero context. Include all database references, metric definitions, formatting requirements, and success criteria.",
              agentIntegration: "Store exemplar problem statements in Open Brain. Agent retrieves similar past specifications when you begin a new one. Compounding advantage: your specification library grows with every task.",
              measurement: "Score: can an independent observer execute the spec without asking a single clarifying question? Binary pass/fail.",
            },
            {
              primitive: "2. Acceptance Criteria",
              exercise: "For every task, write 3 sentences that an independent observer could use to verify the output. If you can't write them, you don't understand the task well enough to delegate it.",
              agentIntegration: "Acceptance criteria become the verification step in planner-worker architectures. Agents run automated checks against criteria before marking tasks complete.",
              measurement: "Track: percentage of agent outputs that pass first-round acceptance. Target: 90%+ within 3 months of practice.",
            },
            {
              primitive: "3. Constraint Architecture",
              exercise: "Before delegating, write down what a smart, well-intentioned person might do that would technically satisfy the request but produce the wrong outcome. Those failure modes become your constraint architecture: musts, must-nots, preferences, escalation triggers.",
              agentIntegration: "Constraints encoded in CLAUDE.md files and intent engineering layers. Agents query constraints before taking actions, not just during execution.",
              measurement: "Track: number of 'technically correct but wrong' outcomes per month. Should decrease as constraint architecture matures.",
            },
            {
              primitive: "4. Decomposition",
              exercise: "Take a multi-day project and decompose into subtasks each <2 hours, with clear input/output boundaries, independently verifiable. This is the granularity agents work best at.",
              agentIntegration: "Train planner agents on your decomposition patterns so they learn your organization's preferred task granularity. Store decomposition templates in Open Brain.",
              measurement: "Track: average subtask completion rate and integration success rate. Target: 95%+ subtask completion, 85%+ clean integration.",
            },
            {
              primitive: "5. Evaluation Design",
              exercise: "Design testable acceptance criteria that can be verified programmatically or by independent observation. Convert subjective quality judgments into measurable proxies.",
              agentIntegration: "Evaluation criteria feed directly into governance agents that monitor other agents' work. Automated quality scoring creates feedback loops for continuous improvement.",
              measurement: "Track: percentage of evaluations that can be automated. Target: 70%+ automated evaluation within 6 months.",
            },
          ].map((p, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-indigo-300 font-semibold mb-2">{p.primitive}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-blue-900/15 rounded p-2">
                  <div className="text-blue-400 uppercase mb-1">Exercise</div>
                  <div className="text-gray-300">{p.exercise}</div>
                </div>
                <div className="bg-purple-900/15 rounded p-2">
                  <div className="text-purple-400 uppercase mb-1">Agent Integration</div>
                  <div className="text-gray-300">{p.agentIntegration}</div>
                </div>
                <div className="bg-emerald-900/15 rounded p-2">
                  <div className="text-emerald-400 uppercase mb-1">Measurement</div>
                  <div className="text-gray-300">{p.measurement}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 border border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-cyan-300 mb-3">Responsible Development Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { principle: "Educate Before Automate", detail: "Ensure personnel understand WHY each discipline matters before giving them templates. The Toby Lutke insight: forced clarity improves human thinking, not just AI output." },
            { principle: "Compound, Don't Replace", detail: "Each discipline builds on the previous. Skipping levels creates the failures seen at scale (Klarna-type). L1→L2→L3→L4 progression, not shortcuts." },
            { principle: "Measure Acumen, Not Activity", detail: "Track specification quality scores, acceptance criteria pass rates, and agent task success rates — not 'number of prompts written' or 'hours using AI'." },
            { principle: "Persistent Memory Enables Growth", detail: "Store successful specifications, effective constraints, and decomposition patterns in Open Brain. Every team member's best practices become organizational assets." },
          ].map((p, i) => (
            <div key={i} className="bg-black/20 rounded-lg p-3">
              <div className="text-cyan-300 font-semibold text-sm mb-1">{p.principle}</div>
              <p className="text-xs text-gray-400">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MemoryAcumen() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Persistent Memory & Acumen Development</h2>
        <p className="text-gray-400">How memory architecture enables compounding skill development for agents AND humans</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-indigo-300 mb-3">The Compounding Flywheel</h3>
        <p className="text-sm text-gray-300 mb-4">
          The three videos implicitly describe a flywheel where better infrastructure enables better skills
          which produce better outputs which create better institutional knowledge:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { phase: "Capture", desc: "Specifications, decisions, and outcomes stored in Open Brain via MCP", icon: "1" },
            { phase: "Learn", desc: "Agents and humans retrieve past patterns when starting similar tasks", icon: "2" },
            { phase: "Improve", desc: "Each iteration builds on accumulated institutional knowledge", icon: "3" },
            { phase: "Compound", desc: "Organization develops domain-specific AI acumen that competitors can't replicate", icon: "4" },
          ].map((p, i) => (
            <div key={i} className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-indigo-400 mb-2">{p.icon}</div>
              <div className="text-white font-semibold text-sm mb-1">{p.phase}</div>
              <div className="text-xs text-gray-400">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">What Gets Stored (Agent + Human Acumen)</h3>
        <div className="space-y-2">
          {[
            { category: "Specification Templates", human: "Humans learn what 'good spec' looks like for each task type", agent: "Agents retrieve similar past specs as starting points", memory: "Template library grows with every project" },
            { category: "Constraint Patterns", human: "Teams learn common failure modes in their domain", agent: "Agents pre-load domain-specific constraints automatically", memory: "Constraint architecture becomes institutional knowledge" },
            { category: "Decomposition Styles", human: "Teams develop shared language for task granularity", agent: "Planner agents learn org-preferred decomposition patterns", memory: "Break patterns stored as reusable templates" },
            { category: "Decision Rationale", human: "Leaders document WHY choices were made, not just WHAT", agent: "Agents can cite past decisions when facing similar trade-offs", memory: "Decision history prevents repeating past mistakes" },
            { category: "Quality Baselines", human: "Teams calibrate 'good enough' for each work category", agent: "Evaluation agents compare output against historical baselines", memory: "Quality standards evolve based on accumulated examples" },
            { category: "Intent Hierarchies", human: "Organizations articulate trade-off priorities explicitly", agent: "Agents query intent hierarchy when facing ambiguous choices", memory: "Organizational values become queryable infrastructure" },
          ].map((c, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-3 grid grid-cols-4 gap-2 text-xs">
              <div className="text-indigo-300 font-semibold">{c.category}</div>
              <div className="text-blue-200">{c.human}</div>
              <div className="text-purple-200">{c.agent}</div>
              <div className="text-amber-200">{c.memory}</div>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-2 px-3 text-xs text-gray-600">
            <div>Category</div><div>Human Acumen</div><div>Agent Acumen</div><div>Memory Compound</div>
          </div>
        </div>
      </div>

      <div className="bg-amber-900/15 border border-amber-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-300 mb-3">The 'Double Dividend' Architecture</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          The speaker's most powerful (and verified) insight comes from Toby Lutke: forcing yourself to communicate
          clearly with AI makes you communicate more clearly with humans. This means investing in specification
          engineering training produces TWO returns simultaneously — better agent performance AND better
          organizational communication. This is the strongest argument for the Penta-Alignment approach: the Skill
          Stack pillar doesn't just serve the Infrastructure pillar, it improves the Org Structure and Personnel
          pillars directly through the Lutke feedback loop.
        </p>
      </div>
    </div>
  );
}

function StrategicRoadmap() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Unified Strategic Roadmap</h2>
        <p className="text-gray-400">Integrating all three analyses into a single implementation strategy</p>
      </div>

      <div className="space-y-4">
        {[
          {
            phase: "Phase 0: Foundation (Weeks 1-4)",
            color: "gray",
            items: [
              "Deploy Open Brain (PostgreSQL + pgvector + MCP server) — personal instance first",
              "All personnel complete L1 Prompt Craft baseline assessment",
              "Document existing organizational specifications, constraints, and decision frameworks",
              "Establish model-agnostic gateway layer for infrastructure flexibility",
              "Begin CLAUDE.md / institutional memory creation for top 3 workflows",
              "Run memory migration: extract existing context from Claude/ChatGPT into Open Brain",
            ],
          },
          {
            phase: "Phase 1: Context & Memory (Months 2-3)",
            color: "blue",
            items: [
              "Train personnel on L2 Context Engineering: MCP, progressive disclosure, RAG design",
              "Upgrade Open Brain: hybrid retrieval (semantic + BM25), agent write-back loop",
              "Select harness philosophy per department (collaborator vs. contractor vs. hybrid)",
              "Build knowledge topology: personal → team → department → organization memory scopes",
              "Deploy prompt caching and tiered model routing for cost optimization",
              "Assign first Context Engineers and Harness Engineers",
            ],
          },
          {
            phase: "Phase 2: Intent & Governance (Months 3-5)",
            color: "purple",
            items: [
              "Train managers on L3 Intent Engineering: encode decision hierarchies, trade-off frameworks",
              "Implement bounded autonomy tiers aligned to organizational decision authority",
              "Deploy governance agents that monitor other agents for policy compliance",
              "Build intent verification checkpoints into multi-agent orchestration",
              "Create Klarna-prevention framework: intent misalignment detection and escalation",
              "Assign Intent Architects (senior role bridging strategy and AI engineering)",
            ],
          },
          {
            phase: "Phase 3: Specification & Scale (Months 5-8)",
            color: "amber",
            items: [
              "Train leadership on L4 Specification Engineering: 5 primitives training program",
              "Audit organizational document corpus for agent readability — begin conversion",
              "Deploy planner-worker orchestration with specification-driven task decomposition",
              "Build specification quality scoring (automated) — track acceptance criteria pass rates",
              "Implement the Lutke feedback loop: measure human communication improvements alongside agent performance",
              "Store successful specifications in Open Brain as compounding organizational assets",
            ],
          },
          {
            phase: "Phase 4: Compounding (Months 8-12+)",
            color: "emerald",
            items: [
              "Full Penta-Alignment: Org + Personnel + Infrastructure + Memory + Skill Stack operating as integrated system",
              "Measure compounding effect: weekly improvement curves across all five pillars",
              "Build switching cost analysis: quantify lock-in risk, maintain model-agnostic flexibility",
              "Scale successful patterns across entire organization",
              "Knowledge graph visualization: organizational thinking patterns and decision history",
              "Continuous evolution: specification library, constraint patterns, and decomposition templates all compound",
            ],
          },
        ].map((p, i) => (
          <div key={i} className={`rounded-xl p-5 border ${
            p.color === "gray" ? "bg-gray-800/30 border-gray-600/30" :
            p.color === "blue" ? "bg-blue-900/15 border-blue-500/30" :
            p.color === "purple" ? "bg-purple-900/15 border-purple-500/30" :
            p.color === "amber" ? "bg-amber-900/15 border-amber-500/30" :
            "bg-emerald-900/15 border-emerald-500/30"
          }`}>
            <h3 className={`text-lg font-bold mb-3 ${
              p.color === "gray" ? "text-gray-300" :
              p.color === "blue" ? "text-blue-300" :
              p.color === "purple" ? "text-purple-300" :
              p.color === "amber" ? "text-amber-300" :
              "text-emerald-300"
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
        <h3 className="text-lg font-bold text-indigo-300 mb-3">Final Strategic Thesis</h3>
        <div className="bg-black/20 rounded-lg p-5 text-center mb-4">
          <p className="text-white font-bold text-lg">
            The model is the brain in a jar. The harness gives it hands. Memory gives it experience.
            Specifications give it purpose. Your organization gives it alignment.
            All five must co-evolve.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="bg-black/20 rounded-lg p-3">
            <span className="text-indigo-300 font-semibold">Responsible development</span> means
            educating people on WHY each layer matters before handing them tools. The Lutke feedback
            loop means this investment pays double: better agents AND better humans.
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <span className="text-indigo-300 font-semibold">Persistent memory</span> means every
            specification, constraint, and decision becomes a compounding organizational asset.
            The gap between organizations that build this infrastructure and those that don't
            widens every week.
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionMap = {
  synthesis: GrandSynthesis,
  verification: ClaimsVerification,
  disciplines: FourDisciplines,
  penta: PentaAlignment,
  skills: SkillDevelopment,
  "memory-acumen": MemoryAcumen,
  roadmap: StrategicRoadmap,
};

export default function UnifiedAgenticStrategy() {
  const [active, setActive] = useState("synthesis");
  const Component = sectionMap[active];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Unified Agentic Strategy: Harness + Memory + Disciplines
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Penta-Alignment Framework v3 — Three analyses synthesized into one enterprise AI architecture
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        <nav className="w-48 shrink-0 space-y-1 sticky top-16 self-start">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active === t.id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </nav>
        <main className="flex-1 min-w-0"><Component /></main>
      </div>
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-3 text-center text-xs text-gray-600">
          Unified Agentic Strategy v3.0 — 18 claims verified, 3 analyses synthesized, March 2026
        </div>
      </footer>
    </div>
  );
}
