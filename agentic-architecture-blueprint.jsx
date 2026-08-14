import { useState } from "react";

const sections = [
  {
    id: "thesis",
    title: "Core Thesis",
    icon: "🧠",
  },
  {
    id: "tri-alignment",
    title: "Tri-Alignment Framework",
    icon: "🔺",
  },
  {
    id: "harness-analysis",
    title: "Harness Architecture Analysis",
    icon: "⚙️",
  },
  {
    id: "scaffolding",
    title: "Scaffolding & Cost Strategy",
    icon: "🏗️",
  },
  {
    id: "org-mapping",
    title: "Org-Agent Mapping",
    icon: "🗺️",
  },
  {
    id: "implementation",
    title: "Implementation Roadmap",
    icon: "🚀",
  },
];

function NavItem({ section, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      <span className="mr-2">{section.icon}</span>
      {section.title}
    </button>
  );
}

function CoreThesis() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          The Harness Thesis: Why Architecture Trumps Intelligence
        </h2>
        <p className="text-gray-400 text-lg">
          Synthesized from primary source analysis and enterprise research
        </p>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-indigo-300 mb-4">
          The Performance Multiplier Effect
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-green-400">78%</div>
            <div className="text-sm text-gray-400 mt-1">
              Same Claude model in Claude Code harness
            </div>
            <div className="text-xs text-gray-500">CORE Benchmark</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-red-400">42%</div>
            <div className="text-sm text-gray-400 mt-1">
              Same Claude model in SWE Agent harness
            </div>
            <div className="text-xs text-gray-500">CORE Benchmark</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-yellow-400">1.86x</div>
            <div className="text-sm text-gray-400 mt-1">
              Performance gap from harness alone
            </div>
            <div className="text-xs text-gray-500">Same weights, same training</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          Five Axes of Harness Divergence
        </h3>
        <div className="space-y-3">
          {[
            {
              axis: "Execution Philosophy",
              claude: "Bash-is-all-you-need — composable Unix primitives, lean context",
              codex: "Built-in DevTools, ephemeral observability stacks, RPC endpoints",
            },
            {
              axis: "State & Memory",
              claude: "Agent remembers via structured artifacts (CLAUDE.md, progress files)",
              codex: "Codebase remembers via repo-as-system-of-record",
            },
            {
              axis: "Context Management",
              claude: "Compaction + sub-agent delegation, progressive disclosure of skills",
              codex: "Isolated sandboxes per task, no context competition",
            },
            {
              axis: "Tool Integration",
              claude: "MCP-native, skills as markdown files, just-in-time tool loading",
              codex: "Bidirectional JSON-RPC, server-mediated environment",
            },
            {
              axis: "Multi-Agent Architecture",
              claude: "Orchestrated collaboration — coordinator + parallel sub-agents",
              codex: "Isolated parallelism — coordination via codebase (git branches)",
            },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-gray-900/50 rounded-lg p-3">
              <div className="font-semibold text-indigo-300">{item.axis}</div>
              <div className="text-sm text-blue-300">{item.claude}</div>
              <div className="text-sm text-emerald-300">{item.codex}</div>
            </div>
          ))}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-3 text-xs text-gray-500">
            <div></div>
            <div className="text-center">Claude Code / Anthropic</div>
            <div className="text-center">Codex / OpenAI</div>
          </div>
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-300 mb-3">
          Strategic Implication: Harness Lock-In
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Lock-in is not vendor subscription lock-in. It's lock-in to a model maker's philosophy
          of how work should happen, expressed through the harness. Teams build habits, processes,
          verification steps, integration plumbing, and institutional knowledge around their chosen
          harness. Switching doesn't just mean learning new commands — it means rebuilding the
          entire compounding chain of automation. This cost increases every quarter as more
          infrastructure accumulates around the current architecture.
        </p>
      </div>
    </div>
  );
}

function TriAlignment() {
  const [activeLayer, setActiveLayer] = useState("all");

  const layers = [
    {
      id: "org",
      name: "Organizational Structure",
      color: "blue",
      description: "Departmental delegation, decision authority, workflow ownership",
      components: [
        "Outcome-aligned agentic teams (not role-based silos)",
        "Cross-functional coordination: IT + HR + Finance + Legal + Business Units",
        "Bounded autonomy governance tiers (routine → escalation → human oversight)",
        "Task-based routing replacing rigid departmental ownership",
      ],
    },
    {
      id: "personnel",
      name: "Personnel Strategy & Skillsets",
      color: "emerald",
      description: "HR alignment, role evolution, skills-based routing",
      components: [
        "Emerging roles: Agent Managers, Harness Engineers, MCP Architects",
        "Hybrid human-AI team performance frameworks",
        "Skills-to-agent mapping: which tasks route to humans vs. agents",
        "Progressive disclosure of agent capabilities based on team maturity",
      ],
    },
    {
      id: "infra",
      name: "Agentic Infrastructure",
      color: "purple",
      description: "Harness design, model routing, tool integration, cost optimization",
      components: [
        "Model-agnostic gateway layer (swap models without code rewrites)",
        "Harness abstraction layer supporting multiple execution philosophies",
        "MCP-based tool integration with progressive disclosure",
        "Multi-agent orchestration patterns (hierarchical, parallel, pipeline)",
      ],
    },
  ];

  const alignmentPoints = [
    {
      from: "org",
      to: "personnel",
      label: "Role Design",
      detail: "Org structure defines needed roles; personnel strategy fills them",
    },
    {
      from: "personnel",
      to: "infra",
      label: "Capability Mapping",
      detail: "Personnel skills determine which tasks route to agents vs. humans",
    },
    {
      from: "org",
      to: "infra",
      label: "Governance Binding",
      detail: "Org authority defines agent autonomy boundaries and escalation paths",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Tri-Alignment Framework
        </h2>
        <p className="text-gray-400 text-lg">
          Three pillars that must align for effective enterprise AI architecture
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveLayer("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeLayer === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          All Layers
        </button>
        {layers.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeLayer === l.id
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {layers
          .filter((l) => activeLayer === "all" || activeLayer === l.id)
          .map((layer) => (
            <div
              key={layer.id}
              className={`rounded-xl p-6 border transition-all ${
                layer.color === "blue"
                  ? "bg-blue-900/20 border-blue-500/30"
                  : layer.color === "emerald"
                  ? "bg-emerald-900/20 border-emerald-500/30"
                  : "bg-purple-900/20 border-purple-500/30"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-2 ${
                  layer.color === "blue"
                    ? "text-blue-300"
                    : layer.color === "emerald"
                    ? "text-emerald-300"
                    : "text-purple-300"
                }`}
              >
                {layer.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{layer.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {layer.components.map((comp, i) => (
                  <div
                    key={i}
                    className="bg-black/20 rounded-lg px-3 py-2 text-sm text-gray-300"
                  >
                    {comp}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {activeLayer === "all" && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">
            Alignment Interfaces
          </h3>
          <div className="space-y-3">
            {alignmentPoints.map((ap, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-gray-900/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="text-xs font-mono text-indigo-400 uppercase">
                    {ap.from}
                  </span>
                  <span className="text-gray-500">↔</span>
                  <span className="text-xs font-mono text-indigo-400 uppercase">
                    {ap.to}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-white text-sm">
                    {ap.label}:
                  </span>{" "}
                  <span className="text-gray-400 text-sm">{ap.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-indigo-300 mb-3">
          The Alignment Principle
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Misalignment between any two pillars creates organizational friction.
          An advanced agentic infrastructure without matching personnel skills
          creates underutilization. A reorganized department without supporting
          agent architecture creates bottlenecks. Personnel upskilling without
          organizational authority to deploy agents creates frustration. All three
          must evolve together, which is why this is an architecture problem, not
          a procurement problem.
        </p>
      </div>
    </div>
  );
}

function HarnessAnalysis() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Harness Architecture: Deep Analysis
        </h2>
        <p className="text-gray-400 text-lg">
          Model-agnostic design principles derived from harness divergence patterns
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          The Harness Abstraction Stack
        </h3>
        <div className="space-y-2">
          {[
            {
              layer: "L5: Workflow Orchestration",
              desc: "Multi-agent coordination, task routing, human-in-the-loop governance",
              color: "bg-indigo-600",
            },
            {
              layer: "L4: Tool Integration",
              desc: "MCP servers, skills, progressive disclosure, just-in-time loading",
              color: "bg-indigo-500",
            },
            {
              layer: "L3: State & Memory",
              desc: "Cross-session persistence, institutional memory, context artifacts",
              color: "bg-purple-600",
            },
            {
              layer: "L2: Execution Environment",
              desc: "Local vs. sandboxed, trust boundaries, security posture",
              color: "bg-purple-500",
            },
            {
              layer: "L1: Model Gateway",
              desc: "Model-agnostic routing, cost optimization, capability matching",
              color: "bg-gray-600",
            },
            {
              layer: "L0: Foundation Models",
              desc: "Claude, GPT, Gemini, open-source — interchangeable at this layer",
              color: "bg-gray-700",
            },
          ].map((l, i) => (
            <div key={i} className="flex items-stretch gap-3">
              <div
                className={`${l.color} rounded-lg px-4 py-3 min-w-[240px] text-white font-semibold text-sm flex items-center`}
              >
                {l.layer}
              </div>
              <div className="bg-gray-900/50 rounded-lg px-4 py-3 flex-1 text-sm text-gray-300 flex items-center">
                {l.desc}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          L1–L5 constitute the harness. L0 is the model. The key insight: invest in L1–L5
          as your strategic differentiator, not L0.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5">
          <h4 className="text-lg font-bold text-blue-300 mb-3">
            Collaborator Architecture
          </h4>
          <p className="text-xs text-blue-400 mb-3">
            Anthropic / Claude Code / Cowork philosophy
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="bg-black/20 rounded px-3 py-2">
              Agent sits at your desk with full environment access
            </div>
            <div className="bg-black/20 rounded px-3 py-2">
              Memory lives in structured artifacts (progress files, CLAUDE.md)
            </div>
            <div className="bg-black/20 rounded px-3 py-2">
              Incrementalism enforced: one feature per session
            </div>
            <div className="bg-black/20 rounded px-3 py-2">
              Sub-agents with dedicated context windows + shared task lists
            </div>
            <div className="bg-black/20 rounded px-3 py-2">
              Risk managed via human oversight + forced verification
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-400">
            Best for: Deep codebase understanding, planning, creative exploration,
            multi-step orchestration
          </div>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="text-lg font-bold text-emerald-300 mb-3">
            Contractor Architecture
          </h4>
          <p className="text-xs text-emerald-400 mb-3">
            OpenAI / Codex philosophy
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="bg-black/20 rounded px-3 py-2">
              Agent works in sealed clean room with code copy
            </div>
            <div className="bg-black/20 rounded px-3 py-2">
              Memory lives in the repo — repo is system of record
            </div>
            <div className="bg-black/20 rounded px-3 py-2">
              Linters-as-guardrails: error messages = remediation instructions
            </div>
            <div className="bg-black/20 rounded px-3 py-2">
              Isolated parallelism: tasks can't interfere with each other
            </div>
            <div className="bg-black/20 rounded px-3 py-2">
              Risk managed via isolation + mechanical enforcement
            </div>
          </div>
          <div className="mt-3 text-xs text-emerald-400">
            Best for: Independent parallel tasks, autonomous operation,
            fewer bugs in implementation
          </div>
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-300 mb-3">
          Model-Agnostic Design Principle
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          The architecture must treat models as interchangeable commodities while
          investing heavily in the harness layers (L1–L5). This means:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-black/20 rounded-lg p-3 text-sm text-gray-300">
            <span className="text-amber-300 font-semibold">Gateway Pattern:</span> All
            model calls route through a unified agnostic interface. Swap providers via
            config, not code.
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-sm text-gray-300">
            <span className="text-amber-300 font-semibold">Tiered Routing:</span> Fast/cheap
            models (Haiku) for exploration, powerful models (Opus) for decisions. The harness
            routes automatically.
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-sm text-gray-300">
            <span className="text-amber-300 font-semibold">Harness Portability:</span> Build
            harness abstractions that span both collaborator and contractor philosophies.
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-sm text-gray-300">
            <span className="text-amber-300 font-semibold">Progressive Disclosure:</span> 98%
            token reduction vs. traditional MCP. Load tool descriptions only when needed.
          </div>
        </div>
      </div>
    </div>
  );
}

function ScaffoldingStrategy() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Scaffolding & Cost Optimization Strategy
        </h2>
        <p className="text-gray-400 text-lg">
          Token economics, context engineering, and cost-performance optimization
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          Token Economics: The Hidden Cost Multiplier
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-300 font-bold mb-2">The Problem</div>
            <div className="text-sm text-gray-300 space-y-2">
              <p>GitHub MCP server's 38 tools consume 15,000 tokens of tool descriptions alone.</p>
              <p>Multi-turn conversations face quadratic token growth — every turn re-sends all context.</p>
              <p>Agents that load all capabilities upfront waste 90%+ of context on unused tools.</p>
            </div>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="text-green-300 font-bold mb-2">The Solution Stack</div>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Progressive disclosure: agents discover tools just-in-time (98% token reduction).</p>
              <p>Prompt caching: ~90% cost reduction on repeated system instructions.</p>
              <p>Context compaction: summarize older context instead of re-sending verbatim.</p>
              <p>Tiered model routing: Haiku for exploration, Opus for synthesis.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">
          Scaffolding Architecture Pattern
        </h3>
        <div className="space-y-3">
          {[
            {
              name: "Foundation Layer — Generic Agent Runtime",
              desc: "Model-agnostic gateway, MCP protocol support, basic execution environment. This is the 80% that's common across all deployments.",
              effort: "Build once",
            },
            {
              name: "Harness Layer — Execution Philosophy",
              desc: "Choose collaborator (local, memory-rich) vs. contractor (isolated, repo-centric) or hybrid. Defines trust boundaries and state management.",
              effort: "Configure per team",
            },
            {
              name: "Scaffolding Layer — Domain Customization",
              desc: "Skills, CLAUDE.md files, linter rules, MCP connectors specific to department or workflow. This is where institutional knowledge accumulates.",
              effort: "Evolve continuously",
            },
            {
              name: "Orchestration Layer — Multi-Agent Coordination",
              desc: "Task routing, sub-agent delegation, parallel execution, human-in-the-loop checkpoints. Maps directly to organizational decision authority.",
              effort: "Align to org structure",
            },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-indigo-300">{item.name}</div>
                <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded">
                  {item.effort}
                </span>
              </div>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-indigo-300 mb-3">
          Cost Optimization Decision Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 pr-4">Strategy</th>
                <th className="py-2 pr-4">Token Savings</th>
                <th className="py-2 pr-4">Implementation</th>
                <th className="py-2">Trade-off</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 text-white">Prompt Caching</td>
                <td className="py-2 pr-4 text-green-400">~90%</td>
                <td className="py-2 pr-4">Low</td>
                <td className="py-2">Requires stable system prompts</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 text-white">Progressive Disclosure</td>
                <td className="py-2 pr-4 text-green-400">~98%</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2">Slower initial tool discovery</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 text-white">Context Compaction</td>
                <td className="py-2 pr-4 text-green-400">~60%</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2">Potential context loss on edge cases</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 text-white">Tiered Model Routing</td>
                <td className="py-2 pr-4 text-green-400">~70%</td>
                <td className="py-2 pr-4">Low-Medium</td>
                <td className="py-2">Requires task classification logic</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-white">RAG over Full Context</td>
                <td className="py-2 pr-4 text-green-400">~80%</td>
                <td className="py-2 pr-4">High</td>
                <td className="py-2">Retrieval quality dependency</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrgMapping() {
  const departments = [
    {
      name: "Engineering",
      agents: [
        "Code generation agents (collaborator + contractor hybrid)",
        "CI/CD pipeline agents",
        "Architecture review sub-agents",
      ],
      harness: "Hybrid: Claude Code for planning/orchestration, Codex for implementation",
      autonomy: "Tier 2 — Intermediate with monitoring",
    },
    {
      name: "Product & Design",
      agents: [
        "Requirements decomposition agents",
        "Spec-to-prototype pipeline agents",
        "User research synthesis agents",
      ],
      harness: "Collaborator: Deep context, iterative exploration, human-in-the-loop",
      autonomy: "Tier 1 — Bounded with checkpoints",
    },
    {
      name: "Marketing & Content",
      agents: [
        "Content generation and personalization agents",
        "Campaign analytics agents",
        "Multi-channel distribution agents",
      ],
      harness: "Collaborator: Cowork-style knowledge work harness",
      autonomy: "Tier 2 — Intermediate with approval gates",
    },
    {
      name: "Operations & Finance",
      agents: [
        "Report generation agents",
        "Data pipeline orchestration agents",
        "Compliance monitoring agents",
      ],
      harness: "Contractor: Isolated execution, audit trails, mechanical enforcement",
      autonomy: "Tier 1 — Strict bounded autonomy",
    },
    {
      name: "Customer Success",
      agents: [
        "Ticket triage and routing agents",
        "Knowledge base maintenance agents",
        "Escalation prediction agents",
      ],
      harness: "Hybrid: Collaborator for complex cases, contractor for routine processing",
      autonomy: "Tier 2 with escalation paths",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Organizational-Agent Architecture Mapping
        </h2>
        <p className="text-gray-400 text-lg">
          How departmental structure maps to harness selection and agent delegation
        </p>
      </div>

      <div className="space-y-4">
        {departments.map((dept, i) => (
          <div
            key={i}
            className="bg-gray-800/50 rounded-xl p-5 border border-gray-700"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-white">{dept.name}</h3>
              <span className="text-xs bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full">
                {dept.autonomy}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-2">
                  Agent Responsibilities
                </div>
                <div className="space-y-1">
                  {dept.agents.map((a, j) => (
                    <div
                      key={j}
                      className="bg-black/20 rounded px-3 py-2 text-sm text-gray-300"
                    >
                      {a}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-2">
                  Harness Philosophy
                </div>
                <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-3 text-sm text-indigo-200">
                  {dept.harness}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">
          Personnel Strategy: Emerging Roles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              role: "Harness Engineer",
              desc: "Designs and maintains the execution environment, tool integration, and state management layers. Understands both collaborator and contractor architectures.",
            },
            {
              role: "Agent Manager",
              desc: "Supervises AI agent workflows, monitors performance, handles escalations. Analogous to a team lead for AI workers.",
            },
            {
              role: "MCP Architect",
              desc: "Designs which tools and data sources are exposed via MCP, implements progressive disclosure, manages token economics.",
            },
            {
              role: "AI Governance Specialist",
              desc: "Monitors compliance, manages bounded autonomy tiers, maintains audit trails, deploys governance agents that monitor other agents.",
            },
            {
              role: "Context Engineer",
              desc: "Designs CLAUDE.md files, skills, prompt templates, and institutional memory systems. The new 'documentation engineer' for the agentic era.",
            },
            {
              role: "Workflow Orchestrator",
              desc: "Designs task routing between human and AI team members, manages handoff protocols, optimizes hybrid team velocity.",
            },
          ].map((r, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-4">
              <div className="font-semibold text-emerald-300 mb-1">{r.role}</div>
              <p className="text-sm text-gray-400">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImplementationRoadmap() {
  const phases = [
    {
      phase: "Phase 1: Foundation (Months 1–3)",
      color: "blue",
      items: [
        "Deploy model-agnostic gateway layer (unified API interface)",
        "Establish MCP server infrastructure for core enterprise tools",
        "Design bounded autonomy governance framework (3-tier)",
        "Define harness philosophy per department (collaborator vs. contractor vs. hybrid)",
        "Create initial CLAUDE.md / institutional memory templates",
        "Hire or assign first Harness Engineer and MCP Architect roles",
      ],
    },
    {
      phase: "Phase 2: Scaffolding (Months 3–6)",
      color: "purple",
      items: [
        "Build progressive disclosure system for tool/skill loading",
        "Implement tiered model routing (fast/cheap ↔ powerful/expensive)",
        "Deploy prompt caching and context compaction strategies",
        "Create department-specific skills and workflow templates",
        "Establish cross-session memory patterns (progress files, git-based state)",
        "Train Agent Managers and Context Engineers",
      ],
    },
    {
      phase: "Phase 3: Orchestration (Months 6–9)",
      color: "emerald",
      items: [
        "Implement multi-agent orchestration patterns (hierarchical, parallel, pipeline)",
        "Deploy task routing system: human vs. agent vs. hybrid decision matrix",
        "Build human-in-the-loop checkpoints at organizational authority boundaries",
        "Create cross-department agent coordination protocols",
        "Establish agent performance monitoring and governance dashboards",
        "Deploy governance agents that monitor other agents for policy compliance",
      ],
    },
    {
      phase: "Phase 4: Optimization (Months 9–12)",
      color: "amber",
      items: [
        "Measure and optimize token economics across all departments",
        "Build compounding institutional knowledge assets (skills, memory, templates)",
        "Implement hybrid harness strategies (Calvin French-Owen pattern)",
        "Establish switching cost analysis framework for harness lock-in management",
        "Scale successful patterns across organization",
        "Continuous governance refinement based on agent behavior data",
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Implementation Roadmap
        </h2>
        <p className="text-gray-400 text-lg">
          12-month phased deployment for enterprise agentic infrastructure
        </p>
      </div>

      <div className="space-y-4">
        {phases.map((p, i) => (
          <div
            key={i}
            className={`rounded-xl p-6 border ${
              p.color === "blue"
                ? "bg-blue-900/15 border-blue-500/30"
                : p.color === "purple"
                ? "bg-purple-900/15 border-purple-500/30"
                : p.color === "emerald"
                ? "bg-emerald-900/15 border-emerald-500/30"
                : "bg-amber-900/15 border-amber-500/30"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-3 ${
                p.color === "blue"
                  ? "text-blue-300"
                  : p.color === "purple"
                  ? "text-purple-300"
                  : p.color === "emerald"
                  ? "text-emerald-300"
                  : "text-amber-300"
              }`}
            >
              {p.phase}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {p.items.map((item, j) => (
                <div
                  key={j}
                  className="bg-black/20 rounded-lg px-3 py-2 text-sm text-gray-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-300 mb-3">
          Critical Success Factors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="bg-black/20 rounded-lg p-3">
            <span className="text-red-300 font-semibold">Don't start with the model.</span>{" "}
            Start with the harness philosophy that matches how your teams work. The model is
            the brain in the jar — the harness gives it hands.
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <span className="text-red-300 font-semibold">Price in switching costs.</span>{" "}
            Every quarter your team builds more infrastructure around the current architecture.
            The cost to change your mind goes up every quarter.
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <span className="text-red-300 font-semibold">Align all three pillars.</span>{" "}
            Org structure, personnel skills, and agentic infrastructure must evolve together.
            Misalignment in any pair creates friction.
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <span className="text-red-300 font-semibold">Invest in institutional memory.</span>{" "}
            Whether it's CLAUDE.md files, skills, or repo-encoded principles — context that
            compounds is your strategic asset, not the model subscription.
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">
          Market Context
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-400">$7.8B</div>
            <div className="text-xs text-gray-500">Current market</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-400">$52B+</div>
            <div className="text-xs text-gray-500">Projected 2030</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-400">40%</div>
            <div className="text-xs text-gray-500">Enterprise apps with agents by 2026 (Gartner)</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-400">1,445%</div>
            <div className="text-xs text-gray-500">Surge in multi-agent inquiries (Gartner)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionComponents = {
  thesis: CoreThesis,
  "tri-alignment": TriAlignment,
  "harness-analysis": HarnessAnalysis,
  scaffolding: ScaffoldingStrategy,
  "org-mapping": OrgMapping,
  implementation: ImplementationRoadmap,
};

export default function AgenticArchitectureBlueprint() {
  const [activeSection, setActiveSection] = useState("thesis");

  const ActiveComponent = sectionComponents[activeSection];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Enterprise Agentic Architecture Blueprint
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tri-Alignment Framework: Organization + Personnel + Infrastructure
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          <nav className="w-64 shrink-0 space-y-1 sticky top-20 self-start">
            {sections.map((section) => (
              <NavItem
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </nav>

          <main className="flex-1 min-w-0">
            <ActiveComponent />
          </main>
        </div>
      </div>

      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-600">
          Architecture Blueprint v1.0 — Built on primary source analysis of harness divergence patterns
          and enterprise agentic AI research (2025–2026)
        </div>
      </footer>
    </div>
  );
}
