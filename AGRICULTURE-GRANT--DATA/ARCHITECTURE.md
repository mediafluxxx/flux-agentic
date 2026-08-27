# Full-Stack Grant Matching Platform - Architecture Design

## 🎯 Vision

Transform from static scraper → **Intelligent Grant Matching SaaS Platform**

**Core Value Propositions**:
1. **Universal Grant Intelligence** - Scrape ANY grant source (federal, state, foundation, corporate)
2. **AI-Powered Matching** - Match organizations to relevant opportunities
3. **Automated Discovery** - Continuous monitoring & alerts
4. **Profile-Based Filtering** - Eligibility pre-screening

---

## 📚 Recommended Tech Stack

### Backend (Node.js/TypeScript)

**Framework**: NestJS (enterprise-grade, TypeScript-first)
- Built-in dependency injection, modules, microservices support
- Scales from monolith → microservices seamlessly
- Great for managing multiple scrapers as modules

**API Layer**: GraphQL + REST
- GraphQL: Complex queries (search, filters, relationships)
- REST: Webhooks, scraper triggers, simple CRUD

**Database**: PostgreSQL + Redis
- **PostgreSQL**: Primary data (grants, users, profiles, matches)
  - Full-text search with pg_trgm + ts_vector
- **Redis**:
  - Search index cache
  - Job queue (BullMQ)
  - Rate limiting for scrapers
- **Consider**: Elasticsearch for advanced search (later phase)

**Vector DB**: Pinecone or Qdrant
- Semantic search, AI-powered grant matching

### Frontend (Modern SPA)

**Framework**: Next.js 14+ (React)
- App Router for server components
- Built-in API routes for BFF pattern
- Great SEO for public grant listings
- Incremental Static Regeneration (ISR) for performance

**UI Library**: shadcn/ui + Tailwind CSS
- Beautiful, accessible components
- Consistent with modern SaaS aesthetic
- Easy customization

**State Management**:
- Zustand (lightweight, simple)
- React Query (server state, caching)

**Search UX**:
- Algolia (managed) or Meilisearch (self-hosted)
- Instant search, typo tolerance, faceted filters

### Scraper Infrastructure

**Orchestration**: Temporal.io or BullMQ
- Durable workflows for multi-step scrapes
- Retry logic, error handling
- Schedule recurring scrapes
- Monitor scraper health

**Execution**:
- Playwright (dynamic sites) - already using
- Cheerio (static sites) - already using
- Apify SDK (optional, for complex scraping)
- Puppeteer Cluster (parallel scraping)

**Storage**:
- Raw HTML → S3/MinIO (audit trail, re-parsing)
- Extracted data → PostgreSQL
- Embeddings → Vector DB

### AI/ML Layer

**LLM Integration**: LangChain + OpenAI/Anthropic
- Entity extraction from unstructured grant text
- Eligibility criteria parsing
- Grant-to-profile matching
- Search query understanding

**Embeddings**: OpenAI text-embedding-3-small
- Grant descriptions → vectors
- User profiles → vectors
- Semantic similarity matching

**Knowledge Graph**: Neo4j (optional, advanced phase)
- Grant relationships (related opportunities)
- Organization networks
- Funding agency mapping

---

## 🗄️ Database Schema (PostgreSQL)

### Users & Authentication

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR,
  role VARCHAR DEFAULT 'user', -- user, admin, scraper
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Organizations (Grant Seekers)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  type VARCHAR, -- nonprofit, government, business, individual
  ein VARCHAR, -- Tax ID
  industry_tags TEXT[], -- e.g., ['agriculture', 'education', 'healthcare']
  location JSONB, -- {city, state, country, coordinates}
  annual_revenue BIGINT,
  employee_count INT,
  mission_statement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX org_user_idx ON organizations(user_id);
CREATE INDEX org_tags_idx ON organizations USING GIN(industry_tags);
```

### Organization Capabilities (For Matching)

```sql
CREATE TABLE org_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category VARCHAR, -- e.g., 'focus_area', 'service_type', 'population_served'
  value VARCHAR, -- e.g., 'urban_agriculture', 'STEM_education'
  embedding VECTOR(1536), -- For semantic matching
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX org_cap_org_idx ON org_capabilities(org_id);
```

### Grant Sources (Configurable Scraper Targets)

```sql
CREATE TABLE grant_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL, -- "Grants.gov", "CA Dept of Agriculture"
  source_type VARCHAR, -- federal, state, foundation, corporate
  domain VARCHAR[], -- e.g., ['agriculture', 'education']
  url VARCHAR,
  scraper_config JSONB, -- Scraper-specific settings
  scrape_frequency INTERVAL DEFAULT '1 day',
  last_scraped_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX sources_active_idx ON grant_sources(is_active);
CREATE INDEX sources_domain_idx ON grant_sources USING GIN(domain);
```

### Grants (Main Data)

```sql
CREATE TABLE grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES grant_sources(id),
  external_id VARCHAR, -- Source's ID (e.g., Grants.gov opportunity number)
  title VARCHAR NOT NULL,
  description TEXT,
  description_embedding VECTOR(1536),

  -- Funding details
  total_funding BIGINT, -- in cents
  award_floor BIGINT,
  award_ceiling BIGINT,
  expected_awards INT,
  cost_sharing BOOLEAN,

  -- Dates
  posted_date DATE,
  open_date DATE,
  close_date DATE,

  -- Categorization
  status VARCHAR, -- open, forecasted, closed, archived
  categories TEXT[], -- e.g., ['food_assistance', 'research']
  domains TEXT[], -- e.g., ['agriculture', 'nutrition']

  -- Eligibility
  eligible_applicants TEXT[], -- e.g., ['nonprofits', 'state_governments']
  geographic_restrictions JSONB, -- {country: ['USA'], states: ['CA', 'TX']}
  eligibility_criteria TEXT,
  eligibility_embedding VECTOR(1536),

  -- Agency info
  agency_name VARCHAR,
  agency_contact JSONB,

  -- URLs & docs
  source_url VARCHAR,
  application_url VARCHAR,
  documents JSONB[], -- [{title, url, type}]

  -- Metadata
  raw_data JSONB, -- Full scraper output
  confidence_score FLOAT, -- Quality/relevance score (0-1)

  -- Search optimization
  search_vector TSVECTOR, -- PostgreSQL full-text search

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source_id, external_id)
);

CREATE INDEX grants_search_idx ON grants USING GIN(search_vector);
CREATE INDEX grants_status_idx ON grants(status);
CREATE INDEX grants_close_date_idx ON grants(close_date);
CREATE INDEX grants_domains_idx ON grants USING GIN(domains);
CREATE INDEX grants_source_idx ON grants(source_id);
```

### Grant Matches (AI-Powered Recommendations)

```sql
CREATE TABLE grant_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,
  match_score FLOAT, -- 0-1 similarity score
  match_reasons JSONB, -- [{type: 'domain_match', weight: 0.3, details: '...'}]
  eligibility_check JSONB, -- {passed: true, failed: [], warnings: []}
  status VARCHAR DEFAULT 'pending', -- pending, saved, applied, dismissed
  user_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, grant_id)
);

CREATE INDEX grant_matches_org_score_idx ON grant_matches(org_id, match_score DESC);
CREATE INDEX grant_matches_status_idx ON grant_matches(org_id, status);
```

### Saved Searches (Alerts)

```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  query JSONB, -- {domains: ['agriculture'], minAmount: 50000, ...}
  alert_frequency VARCHAR, -- daily, weekly, monthly, realtime
  last_alerted_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX saved_searches_user_idx ON saved_searches(user_id);
CREATE INDEX saved_searches_active_idx ON saved_searches(is_active, alert_frequency);
```

### Scraper Jobs (Audit Trail)

```sql
CREATE TABLE scraper_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES grant_sources(id),
  status VARCHAR, -- queued, running, completed, failed
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  grants_found INT DEFAULT 0,
  grants_new INT DEFAULT 0,
  grants_updated INT DEFAULT 0,
  error_message TEXT,
  metadata JSONB, -- {pages_crawled, duration_ms, etc.}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX scraper_jobs_source_idx ON scraper_jobs(source_id, created_at DESC);
CREATE INDEX scraper_jobs_status_idx ON scraper_jobs(status);
```

---

## 🎯 Key Features & Implementation

### 1. Universal Scraper Framework

```typescript
// src/scrapers/scraper.interface.ts
interface ScraperConfig {
  sourceId: string;
  name: string;
  type: 'state_ag' | 'federal' | 'foundation' | 'corporate';
  domain: string[];
  startUrl: string;
  extractionRules: {
    title: string; // CSS selector or regex
    description: string;
    eligibility?: string;
    amount?: string;
    deadline?: string;
  };
  crawlStrategy: 'bfs' | 'sitemap' | 'api' | 'rss';
  rateLimiting: {
    requestsPerSecond: number;
    delayMs: number;
  };
}

abstract class BaseScraper {
  constructor(protected config: ScraperConfig) {}

  abstract extract(html: string): Partial<Grant>;

  async run(): Promise<Grant[]> {
    // Generic scraping logic
    const job = await this.createJob();
    try {
      const grants = await this.scrape();
      await this.saveGrants(grants);
      await this.completeJob(job, grants);
      return grants;
    } catch (error) {
      await this.failJob(job, error);
      throw error;
    }
  }

  protected async scrape(): Promise<Grant[]> {
    // Implement BFS/sitemap/API logic
  }
}

// Example: Register new scraper without code changes
// src/scrapers/registry.ts
const scraperRegistry = new Map<string, typeof BaseScraper>();
scraperRegistry.set('grants.gov', GrantsGovScraper);
scraperRegistry.set('state_agriculture', StateAgScraper);
scraperRegistry.set('nsf', NSFScraper); // New domain!
scraperRegistry.set('gates_foundation', GatesFoundationScraper);
```

**Admin UI**: Let admins configure new scrapers via form instead of code.

### 2. AI-Powered Grant Matching

```typescript
// src/matching/match-engine.service.ts
@Injectable()
export class MatchEngine {
  constructor(
    private vectorDB: VectorDBService,
    private llm: LLMService,
    private orgs: OrganizationService,
    private grants: GrantService
  ) {}

  async findMatches(orgId: string): Promise<GrantMatch[]> {
    const org = await this.orgs.findOne(orgId);
    const orgProfile = await this.buildOrgVector(org);

    // 1. Vector similarity search
    const semanticMatches = await this.vectorDB.search(orgProfile, {
      topK: 100,
      filter: { status: 'open' }
    });

    // 2. Rule-based filtering (eligibility)
    const eligible = await Promise.all(
      semanticMatches.map(async grant => ({
        grant,
        eligibility: await this.checkEligibility(org, grant)
      }))
    );

    const passed = eligible.filter(e => e.eligibility.passed);

    // 3. Score & rank
    const scored = passed.map(({ grant, eligibility }) => ({
      grant,
      score: this.calculateScore(org, grant),
      reasons: this.explainMatch(org, grant),
      eligibility
    }));

    return scored.sort((a, b) => b.score - a.score);
  }

  private calculateScore(org: Organization, grant: Grant): number {
    let score = 0;

    // Domain overlap (30%)
    const domainMatch = intersection(org.industryTags, grant.domains);
    score += (domainMatch.length / org.industryTags.length) * 0.3;

    // Semantic similarity (40%)
    score += grant.embeddingSimilarity * 0.4;

    // Location match (15%)
    if (this.locationMatches(org.location, grant.geoRestrictions)) {
      score += 0.15;
    }

    // Funding size fit (15%)
    if (this.fundingSizeFits(org.annualRevenue, grant.awardCeiling)) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  private async checkEligibility(
    org: Organization,
    grant: Grant
  ): Promise<EligibilityCheck> {
    // Use LLM to parse eligibility criteria
    const prompt = `
      Organization: ${org.type}, ${org.industryTags.join(', ')}
      Location: ${JSON.stringify(org.location)}
      Annual Revenue: ${org.annualRevenue}

      Grant Eligibility Criteria:
      ${grant.eligibilityCriteria}

      Eligible Applicants: ${grant.eligibleApplicants.join(', ')}
      Geographic Restrictions: ${JSON.stringify(grant.geoRestrictions)}

      Determine if this organization is eligible. Return JSON:
      {
        "passed": boolean,
        "failed": string[], // reasons if not eligible
        "warnings": string[] // potential issues
      }
    `;

    const result = await this.llm.generateStructured(prompt, EligibilitySchema);
    return result;
  }

  private explainMatch(org: Organization, grant: Grant): MatchReason[] {
    const reasons: MatchReason[] = [];

    // Domain matches
    const domains = intersection(org.industryTags, grant.domains);
    if (domains.length > 0) {
      reasons.push({
        type: 'domain_match',
        weight: 0.3,
        details: `Shared focus areas: ${domains.join(', ')}`
      });
    }

    // Semantic similarity
    if (grant.embeddingSimilarity > 0.7) {
      reasons.push({
        type: 'semantic_similarity',
        weight: 0.4,
        details: 'High semantic similarity between your profile and grant description'
      });
    }

    // Add more reasons...
    return reasons;
  }
}
```

### 3. Smart Search Interface

```typescript
// Frontend: components/GrantSearch.tsx
'use client';

import { InstantSearch, SearchBox, Hits, RefinementList, Configure } from 'react-instantsearch';
import { searchClient } from '@/lib/search-client';
import { GrantCard } from './GrantCard';
import { ChatInterface } from './ChatInterface';

export function GrantSearch() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="grants"
      routing={true}
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Filters */}
        <aside className="col-span-3 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Domains</h3>
            <RefinementList
              attribute="domains"
              searchable
              showMore
              limit={10}
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Status</h3>
            <RefinementList attribute="status" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Award Amount</h3>
            <RangeSlider
              attribute="awardCeiling"
              min={0}
              max={10000000}
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Close Date</h3>
            <DateRangePicker attribute="closeDate" />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Agency</h3>
            <RefinementList
              attribute="agencyName"
              searchable
              showMore
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-9">
          <SearchBox
            placeholder="Search grants by keyword, agency, or description..."
            classNames={{
              input: 'w-full px-4 py-3 text-lg border rounded-lg'
            }}
            autoFocus
          />

          <div className="mt-4 flex items-center justify-between">
            <Stats />
            <SortBy
              items={[
                { label: 'Most Relevant', value: 'grants' },
                { label: 'Highest Amount', value: 'grants_amount_desc' },
                { label: 'Closing Soon', value: 'grants_date_asc' },
                { label: 'Recently Posted', value: 'grants_posted_desc' }
              ]}
            />
          </div>

          <Hits
            hitComponent={GrantCard}
            classNames={{ list: 'space-y-4 mt-6' }}
          />

          <Pagination
            padding={3}
            showFirst={false}
            showLast={false}
          />
        </main>
      </div>

      {/* AI Chat Assistant (Floating) */}
      <ChatInterface
        systemPrompt="You are a grant expert. Help users find relevant opportunities based on their search."
      />

      <Configure hitsPerPage={20} />
    </InstantSearch>
  );
}
```

### 4. Profile Builder Wizard

```typescript
// components/OrgProfileWizard.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSchema } from '@/lib/schemas';

const steps = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Tell us about your organization',
    fields: ['name', 'type', 'ein', 'location']
  },
  {
    id: 'focus',
    title: 'Focus Areas',
    description: 'What domains do you work in?',
    component: FocusAreasStep
  },
  {
    id: 'capabilities',
    title: 'Capabilities',
    description: 'What can your organization do?',
    component: CapabilitiesStep
  },
  {
    id: 'preferences',
    title: 'Grant Preferences',
    description: 'What types of grants are you looking for?',
    component: PreferencesStep
  }
];

export function OrgProfileWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm({
    resolver: zodResolver(organizationSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: Organization) => {
    // Extract capabilities using AI
    const capabilities = await extractCapabilities(data.missionStatement);

    // Generate embeddings
    const embedding = await generateOrgEmbedding(data);

    // Save to database
    await createOrganization({
      ...data,
      capabilities,
      embedding
    });

    // Trigger initial matching
    await findMatches(org.id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator steps={steps} currentStep={currentStep} />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {steps[currentStep].component ? (
          <steps[currentStep].component form={form} />
        ) : (
          <BasicFieldsStep form={form} fields={steps[currentStep].fields} />
        )}

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button type="submit">
              Complete Profile
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
            >
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// AI-Enhanced Capabilities Extraction
async function extractCapabilities(missionStatement: string) {
  const response = await fetch('/api/ai/extract-capabilities', {
    method: 'POST',
    body: JSON.stringify({ missionStatement })
  });

  return response.json();
}

// Backend API
// app/api/ai/extract-capabilities/route.ts
export async function POST(req: Request) {
  const { missionStatement } = await req.json();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Extract key capabilities, focus areas, and target populations from this organization description.
      Return as JSON with arrays: focusAreas, capabilities, targetPopulations, serviceTypes.`
    }, {
      role: 'user',
      content: missionStatement
    }],
    response_format: { type: 'json_object' }
  });

  return Response.json(
    JSON.parse(completion.choices[0].message.content)
  );
}
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Months 1-2)
- [ ] NestJS backend setup with module structure
- [ ] PostgreSQL schema + migrations (Prisma or TypeORM)
- [ ] User authentication (NextAuth.js or Clerk)
- [ ] Migrate existing scrapers to modular framework
- [ ] Basic CRUD for organizations & grants
- [ ] Next.js frontend shell with routing
- [ ] Deploy infrastructure (Vercel + Neon/Supabase)

### Phase 2: Core Features (Months 3-4)
- [ ] Scraper job queue (BullMQ + Redis)
- [ ] Admin dashboard for scraper management
- [ ] Search infrastructure (Meilisearch or Algolia integration)
- [ ] Profile builder UI with wizard flow
- [ ] Grant detail pages with responsive design
- [ ] Basic matching algorithm (rule-based, no AI yet)
- [ ] Email notifications (Resend or SendGrid)

### Phase 3: Intelligence (Months 5-6)
- [ ] Vector embeddings generation pipeline
- [ ] Pinecone/Qdrant setup for semantic search
- [ ] AI-powered matching engine
- [ ] Eligibility pre-screening with LLM
- [ ] Match explanations & scoring
- [ ] Saved searches & alerts system
- [ ] Dashboard analytics

### Phase 4: Scale & Polish (Months 7-8)
- [ ] Performance optimization (caching, indexes)
- [ ] API documentation (OpenAPI/GraphQL schema)
- [ ] Webhooks for integrations
- [ ] Mobile-responsive refinements
- [ ] User feedback system
- [ ] A/B testing infrastructure
- [ ] Monitoring & observability (Sentry, LogRocket)

### Phase 5: Multi-Domain Expansion (Months 9+)
- [ ] 50+ new grant sources across domains
- [ ] Education grants (NSF, Dept of Education)
- [ ] Healthcare grants (NIH, foundations)
- [ ] Research grants (various agencies)
- [ ] Foundation grants (Gates, Ford, Kresge, etc.)
- [ ] Corporate giving programs
- [ ] International grants
- [ ] Grant writing assistant (AI-powered)

---

## 💰 Monetization Strategy

### Pricing Tiers

**Free Tier**
- Basic profile creation
- 10 grant matches/month
- Manual search (full database)
- Community support

**Professional ($49/month)**
- Unlimited grant matches
- Email alerts (daily/weekly)
- Up to 5 saved searches
- Application deadline tracking
- Priority support

**Team ($149/month)**
- Everything in Professional
- Up to 5 team members
- Collaborative grant tracking
- Team analytics dashboard
- Custom reporting

**Enterprise ($499+/month)**
- Everything in Team
- Unlimited team members
- API access (1000 req/day)
- Custom scrapers
- White-label option
- Dedicated account manager
- SSO/SAML support

### Revenue Streams

1. **Subscription Revenue** (Primary)
2. **API Access** (Usage-based pricing)
3. **Grant Writing Services** (Marketplace)
4. **Premium Data Exports**
5. **Consulting Services** (Custom implementations)

---

## 🔧 API Design

### GraphQL Schema

```graphql
type Query {
  # Grants
  grants(
    filters: GrantFilters
    search: String
    page: Int
    limit: Int
  ): GrantConnection!

  grant(id: ID!): Grant

  # Matches
  myMatches(
    minScore: Float
    status: MatchStatus
    page: Int
  ): [GrantMatch!]!

  # Organizations
  organization(id: ID!): Organization
  myOrganizations: [Organization!]!

  # Sources
  grantSources(active: Boolean): [GrantSource!]!

  # Analytics
  matchStats(orgId: ID!): MatchStats!
}

type Mutation {
  # Organizations
  createOrganization(input: OrgInput!): Organization!
  updateOrganization(id: ID!, input: OrgInput!): Organization!
  deleteOrganization(id: ID!): Boolean!

  # Profile
  updateProfile(input: ProfileInput!): Organization!
  addCapability(orgId: ID!, input: CapabilityInput!): OrgCapability!

  # Matches
  saveGrant(grantId: ID!): GrantMatch!
  updateMatchStatus(id: ID!, status: MatchStatus!): GrantMatch!
  addMatchNote(id: ID!, note: String!): GrantMatch!

  # Alerts
  createAlert(input: AlertInput!): SavedSearch!
  updateAlert(id: ID!, input: AlertInput!): SavedSearch!
  deleteAlert(id: ID!): Boolean!

  # Scrapers (Admin only)
  triggerScrape(sourceId: ID!): ScraperJob!
  createSource(input: SourceInput!): GrantSource!
  updateSource(id: ID!, input: SourceInput!): GrantSource!
}

type Subscription {
  # Real-time updates
  newGrantMatches(orgId: ID!): GrantMatch!
  scraperJobUpdated(sourceId: ID!): ScraperJob!
  grantUpdated(grantId: ID!): Grant!
}

# Types
type Grant {
  id: ID!
  title: String!
  description: String
  status: GrantStatus!

  # Funding
  totalFunding: Int
  awardFloor: Int
  awardCeiling: Int
  expectedAwards: Int
  costSharing: Boolean

  # Dates
  postedDate: Date
  openDate: Date
  closeDate: Date
  daysUntilClose: Int

  # Categorization
  categories: [String!]!
  domains: [String!]!

  # Eligibility
  eligibleApplicants: [String!]!
  geoRestrictions: JSON
  eligibilityCriteria: String

  # Agency
  agencyName: String
  agencyContact: JSON
  source: GrantSource!

  # URLs
  sourceUrl: String!
  applicationUrl: String
  documents: [Document!]!

  # Metadata
  confidenceScore: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}

type GrantMatch {
  id: ID!
  grant: Grant!
  organization: Organization!
  score: Float!
  reasons: [MatchReason!]!
  eligibilityCheck: EligibilityCheck!
  status: MatchStatus!
  userNotes: String
  createdAt: DateTime!
}

type Organization {
  id: ID!
  name: String!
  type: OrgType!
  ein: String
  industryTags: [String!]!
  location: JSON
  annualRevenue: Int
  employeeCount: Int
  missionStatement: String
  capabilities: [OrgCapability!]!
  matches(minScore: Float): [GrantMatch!]!
  createdAt: DateTime!
}

type GrantSource {
  id: ID!
  name: String!
  sourceType: SourceType!
  domain: [String!]!
  url: String
  isActive: Boolean!
  lastScrapedAt: DateTime
  recentJobs(limit: Int): [ScraperJob!]!
}

type ScraperJob {
  id: ID!
  source: GrantSource!
  status: JobStatus!
  startedAt: DateTime
  completedAt: DateTime
  grantsFound: Int!
  grantsNew: Int!
  grantsUpdated: Int!
  errorMessage: String
  metadata: JSON
}

# Enums
enum GrantStatus {
  OPEN
  FORECASTED
  CLOSED
  ARCHIVED
}

enum MatchStatus {
  PENDING
  SAVED
  APPLIED
  DISMISSED
}

enum OrgType {
  NONPROFIT
  GOVERNMENT
  BUSINESS
  INDIVIDUAL
}

enum SourceType {
  FEDERAL
  STATE
  FOUNDATION
  CORPORATE
}

enum JobStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
}
```

### REST API (Webhooks & External Integrations)

```typescript
// POST /api/webhooks/scraper-complete
{
  "jobId": "uuid",
  "sourceId": "uuid",
  "status": "completed",
  "stats": {
    "grantsFound": 50,
    "grantsNew": 12,
    "duration": 45000
  }
}

// POST /api/external/import-grants
// Import grants from external sources
{
  "source": "custom_api",
  "grants": [...]
}

// GET /api/public/grants
// Public API for grant discovery (rate limited)
?domain=agriculture&status=open&limit=20
```

---

## 📊 Success Metrics

### User Acquisition Metrics
- **Orgs onboarded/week** - Target: 50/week by month 6
- **Activation rate** (completed profile) - Target: 60%
- **Retention**
  - 30-day: Target 40%
  - 90-day: Target 25%
- **Referral rate** - Target: 15%

### Product Quality Metrics
- **Match accuracy** (user feedback) - Target: 80% "relevant" rating
- **Grant coverage** (% of available opportunities) - Target: 70% coverage
- **Scraper reliability** (uptime, error rate) - Target: 99% uptime
- **Search relevance** (click-through rate) - Target: 30% CTR
- **Time to first match** - Target: <5 minutes

### Business Metrics
- **Free → Paid conversion** - Target: 5%
- **MRR growth** - Target: 20% MoM
- **Churn rate** - Target: <5% monthly
- **LTV:CAC ratio** - Target: 3:1
- **NPS Score** - Target: 50+

### Operational Metrics
- **Scraper jobs/day** - Monitor for scale
- **API response time** - Target: p95 < 500ms
- **Search latency** - Target: p95 < 200ms
- **Database size growth** - Monitor for capacity planning

---

## 🏗️ Infrastructure & Deployment

### Recommended Stack

**Hosting**
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Railway or Fly.io (NestJS + workers)
- **Database**: Neon or Supabase (PostgreSQL)
- **Redis**: Upstash (serverless Redis)
- **Vector DB**: Pinecone (managed) or Qdrant Cloud
- **Storage**: Vercel Blob or Cloudflare R2

**Monitoring**
- **APM**: Sentry (errors) + Axiom (logs)
- **Analytics**: PostHog (product) + Plausible (web)
- **Uptime**: Better Uptime

**CI/CD**
- GitHub Actions
- Preview deployments on Vercel
- Automated migrations with Prisma

### Environment Architecture

```
Production:
├── Vercel (Frontend + API Routes)
├── Railway (NestJS Backend + BullMQ workers)
├── Neon (PostgreSQL - Production tier)
├── Upstash (Redis - Production tier)
└── Pinecone (Vector DB - Starter plan)

Staging:
├── Vercel Preview (Auto-deploy from PR)
├── Railway Preview (Dedicated staging)
└── Neon (Separate staging database)

Development:
├── Local Next.js dev server
├── Local NestJS dev server
├── Docker Compose (PostgreSQL + Redis)
└── Pinecone free tier or local Qdrant
```

---

## 🎯 Go-to-Market Strategy

### Phase 1: MVP Launch (Months 1-3)
**Target**: Agriculture nonprofits in 5 states
- Partner with 2-3 state ag departments
- Launch with 50+ beta users
- Gather feedback, iterate quickly

### Phase 2: Vertical Expansion (Months 4-6)
**Target**: Add education & environmental nonprofits
- Build integrations for NSF, EPA grants
- Content marketing (SEO for "{domain} grants")
- Webinar series on grant finding

### Phase 3: Horizontal Scale (Months 7-12)
**Target**: All nonprofit domains + small businesses
- Partner with foundations (Gates, Ford, etc.)
- Launch API for grant management platforms
- Affiliate program with grant writers

### Marketing Channels
1. **Content Marketing** - Blog posts, grant guides
2. **SEO** - Rank for "{domain} grants {state}"
3. **Partnerships** - Nonprofit associations, accelerators
4. **Product-Led Growth** - Viral sharing of grant matches
5. **Email Marketing** - Nurture campaigns for free users

---

## 🏁 Next Steps

### Immediate Actions (Week 1)
1. Set up project repository structure
2. Initialize NestJS backend + Next.js frontend
3. Configure PostgreSQL database (Neon)
4. Create initial schema migrations
5. Deploy "Hello World" to Vercel + Railway

### Sprint 1 (Weeks 2-3)
1. Build user authentication
2. Create organization CRUD
3. Migrate existing scrapers to new framework
4. Build admin dashboard for scraper management
5. Set up BullMQ for job processing

### Sprint 2 (Weeks 4-5)
1. Implement search infrastructure (Meilisearch)
2. Build profile wizard UI
3. Create grant detail pages
4. Basic matching algorithm (rule-based)
5. Email notification system

---

## 🔗 References & Resources

### Similar Platforms (Competitive Analysis)
- **Instrumentl** - Grant discovery for nonprofits
- **GrantWatch** - Grant database + alerts
- **Foundation Directory Online** - Foundation grants
- **Submittable** - Grant management platform

### Technology Documentation
- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [BullMQ](https://docs.bullmq.io/)
- [Meilisearch](https://www.meilisearch.com/docs)
- [LangChain](https://js.langchain.com/docs)

### Open Source Scrapers
- [Apify SDK](https://docs.apify.com/sdk)
- [Crawlee](https://crawlee.dev/)
- [Playwright](https://playwright.dev/)

---

**Document Version**: 1.0
**Last Updated**: 2026-08-26
**Author**: Architecture Design Team
**Status**: Proposal - Pending Implementation
