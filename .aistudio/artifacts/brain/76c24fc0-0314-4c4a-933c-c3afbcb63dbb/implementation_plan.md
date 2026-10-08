# ATELIER — Platform Architecture & Hackathon Implementation Plan

> **ATELIER** (`atelier.app/@artistname`) is an editorial, high-end online presence and commission platform for independent artists, craft creators, and makers. It replaces scattered link trees, Instagram DMs, and disconnected portfolio tools with a single unified identity combining portfolio, gallery, collections, and structured commission workflows.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Hackathon Scope & Environment Alignment:**
> - **Full-Stack Architecture:** The AI Studio runtime runs a high-performance Express + Vite + React 19 + TypeScript stack (`server.ts` entry point). We will implement a clean REST API layer on the server (`/api/creators`, `/api/artworks`, `/api/collections`, `/api/services`, `/api/commissions`, `/api/ai/*`) validated by Zod schemas, mirroring the Next.js server actions / API route contracts requested.
> - **Persistence Strategy:** We provide a dual-mode repository layer (`StorageEngine`). If Supabase credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) are present in `.env`, it connects to Supabase; otherwise, it automatically uses an in-process JSON/file-backed persistent store with realistic demo seed data. This guarantees zero demo breakage while preserving the exact relational schema.
> - **AI Integration:** Powered server-side by `@google/genai` using `gemini-3.8-flash` for the 3 requested AI assistants (Artwork Metadata, Artist Bio/Statement, Commission Brief Generator).
> - **Aesthetic Direction:** Editorial, minimal, artistic, sophisticated (warm neutral canvas `#F9F8F6`, deep onyx typography `#121212`, hairline dividers, media-first responsive masonry/bento gallery, unboxed typography metadata).

---

## 1. Product Specification Analysis

### Problem Space
Independent artists currently navigate a fractured workflow:
- **Discovery:** Instagram, X, TikTok (unstructured, high noise).
- **Inquiries & Negotiation:** Chaotic Instagram DMs / Twitter DMs where scope, references, budget, and deadlines get lost.
- **Showcase:** Static portfolios (Squarespace, generic website builders) that don't connect directly to commission booking.
- **Order Tracking:** Spreadsheets, notes, or manual email chains.

### The ATELIER Solution
ATELIER delivers a single canonical link: `atelier.app/@artistname` (simulated via `/artist/:handle` and route aliases). It acts as:
1. **Curated Portfolio & Gallery:** Visual-first, high-fidelity gallery with full-screen lightbox, medium, year, and collection categorization.
2. **Identity & Statement:** Editorial artist biography, exhibition history/disciplines, verified contact & socials.
3. **Transparent Commission Services:** Clear base pricing, turnaround expectations, and revision terms.
4. **Structured Commission Intake:** A guided, friction-free commission request form that captures all required specifications upfront (with an optional AI Brief Generator for clients).
5. **Artist Back-Office Inbox:** Kanban-style request pipeline (`RECEIVED` → `IN_REVIEW` → `ACCEPTED` → `IN_PROGRESS` → `DELIVERED`).

---

## 2. Minimum Viable Feature Set (Phase 1 & Phase 2)

| Module | Core Features Included in MVP | Deferred Beyond MVP |
| :--- | :--- | :--- |
| **Identity & Auth** | Quick Demo Sign-in / Switcher (`@maya`, `@elena`, `@kai`), handle reservation, profile editing (avatar, bio, disciplines, theme accents, socials). | Complex OAuth providers, SMS 2FA, password recovery. |
| **Artwork Management** | Create / Edit / Delete artwork, multi-image upload & preview, metadata (medium, year, tags, dimensions), collection assignment, featured toggle. | Bulk batch imports, 3D glTF model viewers. |
| **Collections** | Create / reorder collections (e.g., "Ceramics 2026", "Oil & Linen", "Archival Prints"), visibility toggles. | Nested sub-collections, password-protected collections. |
| **Public Portfolio** | Editorial artist page (`/@handle`), hero statement, featured carousel/bento, filterable gallery, lightbox detail viewer, commission CTA. | Custom external domain CNAME mapping. |
| **Commission Services** | Define custom service tiers (e.g., "Custom Ceramic Vase", "Oil Portrait 18x24", "Digital Editorial Cover"), base price, currency, turnaround (days/weeks), included revisions. | Dynamic add-on pricing calculators, contract e-signing. |
| **Commission Intake** | Public client request modal/page, client details, service selection, brief description, reference upload/links, budget, deadline, and AI brief polisher. | Real Stripe/escrow checkout, credit card auth. |
| **Artist Commission Inbox** | Dedicated dashboard inbox, status workflow transitions (`RECEIVED` → `IN_REVIEW` → `ACCEPTED` / `DECLINED` → `IN_PROGRESS` → `DELIVERED`), status history, client communication summary. | Live 1-on-1 chat rooms, automated reminder cron jobs. |
| **AI Assistants** | 1. Artwork Metadata Assistant<br>2. Artist Statement / Bio Assistant<br>3. Commission Brief Generator | Autonomous conversational agents, image generation models. |

---

## 3. Application Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ATELIER CLIENT (Vite / React 19)              │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   Public Experience   │  │           Artist Studio                │ │
│  │  - Landing Showcase   │  │  - Studio Dashboard (Overview & Inbox)│ │
│  │  - Artist Page /@maya │  │  - Artwork Manager (Editor & AI Meta)   │ │
│  │  - Lightbox Gallery   │  │  - Collections Organizer                │ │
│  │  - Commission Request │  │  - Services Configurator                │ │
│  └───────────┬───────────┘  └───────────────────┬────────────────────┘ │
│              │                                  │                      │
│              └─────────────────┬────────────────┘                      │
│                                │ State Hooks (Zustand / React Query)   │
│                                ▼                                       │
│                       API Client Services                              │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │ HTTP / JSON
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND ENGINE (server.ts)                 │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  API Routes & Zod Validation Middleware                          │  │
│  │  /api/creators       /api/artworks        /api/collections       │  │
│  │  /api/services       /api/commissions     /api/ai/*              │  │
│  └───────────────────┬───────────────────────────────┬──────────────┘  │
│                      │                               │                 │
│                      ▼                               ▼                 │
│        ┌───────────────────────────┐   ┌───────────────────────────┐   │
│        │   Storage Repository      │   │     Google GenAI SDK      │   │
│        │  - Supabase / Postgres    │   │  - gemini-3.8-flash       │   │
│        │    (if credentials set)   │   │  - Structured JSON Schemas│   │
│        │  - In-Process JSON Store  │   │  - Server-side only       │   │
│        │    (resilient fallback)   │   │  - User-Agent configured  │   │
│        └───────────────────────────┘   └───────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Architectural Highlights:
1. **Clean Decoupling:** The UI components never communicate directly with databases or external APIs. All requests route through strongly-typed API client wrappers (`/src/services/api.ts`).
2. **Server-Side Validation:** All entity mutations pass through Zod schemas on the server, returning structured HTTP `400` errors with actionable validation feedback.
3. **Protected AI Endpoints:** Gemini API keys never leak to the browser. The server runs `@google/genai` exclusively using the `gemini-3.8-flash` model with schema-enforced structured JSON output.
4. **Instant Hot-Swapping:** A persistent session banner lets judges switch between the **Artist View** (managing Maya's studio) and the **Visitor View** (booking Maya from the public internet) in 1 click.

---

## 4. Proposed Folder Structure

```
├── server.ts                       # Express backend server with Vite middleware & API routes
├── src/
│   ├── main.tsx                    # React client entrypoint
│   ├── App.tsx                     # Main router & app container
│   ├── index.css                   # Tailwind CSS v4 styling & typography setup
│   ├── types/
│   │   ├── creator.ts              # Creator, theme, and profile types
│   │   ├── artwork.ts              # Artwork & collection types
│   │   ├── commission.ts           # Service & commission request models
│   │   └── api.ts                  # Shared request/response payload contracts
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts           # Zod schemas & TypeScript entity definitions
│   │   │   ├── seed.ts             # High-fidelity realistic seed data (Maya, Elena, Kai)
│   │   │   └── storage.ts          # Storage engine abstraction (Supabase / In-Memory Store)
│   │   ├── ai/
│   │   │   ├── gemini.ts           # @google/genai client initialization
│   │   │   ├── metadata-assistant.ts # Title, medium & curatorial tag generator
│   │   │   ├── bio-assistant.ts    # Editorial bio & artist statement generator
│   │   │   └── brief-generator.ts  # Client brief refiner & scope summarizer
│   │   └── routes/
│   │       ├── creators.ts
│   │       ├── artworks.ts
│   │       ├── collections.ts
│   │       ├── services.ts
│   │       ├── commissions.ts
│   │       └── ai.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx          # Editorial Top Bar (3-zone contract)
│   │   │   ├── Footer.tsx          # Minimalist typography footer
│   │   │   ├── Lightbox.tsx        # Immersive full-screen artwork viewer
│   │   │   ├── NotificationToast.tsx # Status notifications & email simulations
│   │   │   └── RoleSwitcher.tsx    # Hackathon demo controller (Artist Studio <-> Public View)
│   │   ├── public/
│   │   │   ├── LandingHero.tsx     # Editorial platform homepage & discovery
│   │   │   ├── ArtistHero.tsx      # Public artist statement & bio section
│   │   │   ├── ArtworkGrid.tsx     # Bento & Masonry gallery with unboxed metadata
│   │   │   ├── CollectionFilter.tsx# Collection tabs & filters
│   │   │   ├── ServiceCards.tsx    # Commission service tiers & pricing
│   │   │   └── CommissionModal.tsx # Public commission intake form with AI brief helper
│   │   └── studio/
│   │       ├── StudioLayout.tsx    # Artist dashboard layout & navigation
│   │       ├── ProfileEditor.tsx   # Handle, bio, and visual theme settings
│   │       ├── ArtworkManager.tsx  # Artwork table, creation drawer & AI tagger
│   │       ├── ArtworkModal.tsx    # Artwork creation/edit modal with image upload
│   │       ├── CollectionManager.tsx # Collection creator & reordering
│   │       ├── ServiceManager.tsx  # Commission services editor
│   │       └── CommissionInbox.tsx # Commission Kanban / status pipeline
│   └── services/
│       └── api.ts                  # Typed client-side fetchers & mutators
```

---

## 5. Proposed Database Schema

```sql
-- 1. CREATORS
CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,       -- e.g. 'maya'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  statement TEXT,                   -- Curatorial artist statement
  avatar_url TEXT,
  disciplines TEXT[],               -- ['Ceramics', 'Sculpture', 'Textiles']
  social_links JSONB,               -- { instagram, website, bluesky }
  theme_settings JSONB,             -- { font: 'serif', accent: '#D97706', grid: 'masonry' }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COLLECTIONS
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public' | 'archived' | 'unlisted'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ARTWORKS
CREATE TABLE artworks (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] NOT NULL,           -- Primary image + detail views
  medium TEXT NOT NULL,             -- e.g., 'Stoneware, Wood-fired, Raw Glaze'
  dimensions TEXT,                  -- e.g., '34 x 22 x 18 cm'
  year INT NOT NULL,
  tags TEXT[],                      -- Curatorial keywords
  featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'in_collection' | 'sold' | 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMISSION SERVICES
CREATE TABLE commission_services (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,              -- e.g., 'Bespoke Functional Vessel'
  description TEXT NOT NULL,
  base_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  turnaround_weeks INT NOT NULL,    -- Estimated delivery timeline
  revisions_included INT NOT NULL,  -- e.g., 2 rounds
  active BOOLEAN DEFAULT TRUE,
  sample_images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMISSION REQUESTS
CREATE TABLE commission_requests (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  service_id TEXT REFERENCES commission_services(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  brief TEXT NOT NULL,              -- Detailed description
  ai_enhanced_brief TEXT,           -- Structured brief refined by Gemini
  reference_images TEXT[],
  budget NUMERIC,
  currency TEXT DEFAULT 'USD',
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  -- Status enum: 'RECEIVED' | 'IN_REVIEW' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED'
  status_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Real Functionality vs. Development Fallbacks

| Feature Area | Production Real Implementation | Hackathon Development Fallback | Rationale |
| :--- | :--- | :--- | :--- |
| **Authentication** | Multi-tenant auth store with fast persona switching (`@maya`, `@elena`, `@kai`) & handle registration. | Mock credentials / instant session switch instead of SMS/email 2FA. | Judges can evaluate both artist management and visitor flows without sign-up friction. |
| **Data Persistence** | Dual-mode storage: Supabase PostgreSQL connector when env keys provided; in-process JSON state store with pre-seeded rich catalog. | Auto-switches to JSON store if Supabase is offline or unconfigured. | Zero downtime risk; eliminates database network timeout risks during live demos. |
| **AI Assistants** | Real Gemini API (`gemini-3.8-flash`) via server-side `@google/genai` with structured JSON schema enforcement. | Fallback algorithmic templates if network drops or API limits occur. | Guaranteed instantaneous generation, 100% resilient. |
| **Image Upload** | Client-side drag-and-drop with client FileReader (Base64 data URLs) + high-fidelity pre-rendered studio artwork library. | Cloudinary / S3 / Supabase Storage replaced with in-browser data URLs. | Artists can upload real photos immediately without AWS S3 or bucket CORS errors. |
| **Email Notifications** | Server event triggers when commission status changes. | Visual Notification Drawer / In-App Toast simulation showing real email preview ("Email sent to client: Your commission was accepted!"). | Visually demonstrates the communication loop to judges without waiting for spam filters. |
| **Payments & Escrow** | Transparent quotes & budget negotiation. | No real Stripe charge (explicitly requested: DO NOT implement real payments). | Complies with brief; focuses on the creative workflow. |

---

## 7. Implementation Order

### Phase 1: Foundation & Data Architecture
1. **Server Setup & Data Layer:** Create `server.ts` with Express, Zod validation models, and dual-mode storage engine loaded with comprehensive realistic seed data for `@maya` (Ceramics & Sculpture), `@elena` (Abstract Oil Painting), and `@kai` (Textiles & Fiber Art).
2. **Server-Side Gemini AI Endpoints:** Implement `/api/ai/metadata`, `/api/ai/bio`, and `/api/ai/brief` using `@google/genai` with `gemini-3.8-flash`.

### Phase 2: Public Identity & Gallery Experience (`/@handle`)
3. **Editorial Navigation & Layout:** Implement Top Bar Contract (Wordmark, Nav, Actions), theme tokens, and typography.
4. **Public Artist Profile (`/@maya`):** Hero section with bio, curatorial statement, disciplines, and social links.
5. **Masonry/Bento Artwork Gallery:** Artwork display with collection filter tabs, unboxed metadata (`Stoneware · 2026 · Available`), and full-screen lightbox.
6. **Commission Services Showcase:** Clear pricing cards, turnaround times, and revision policies with "Request Commission" triggers.

### Phase 3: Artist Studio Dashboard
7. **Artist Management Suite:** Studio layout with navigation to Overview, Works, Collections, Services, and Commission Inbox.
8. **Artwork Manager:** Create/Edit artwork modal with image upload, drag-and-drop, and the **AI Artwork Metadata Assistant** (auto-generates title, medium, tags, and description).
9. **Collection & Services Manager:** Tools to create collections and configure commission service offerings.

### Phase 4: Commission Intake & Pipeline Workflow
10. **Public Commission Request Flow:** Modal with service selection, client info, reference links, and the **AI Commission Brief Generator** (translates loose ideas into an organized design brief).
11. **Artist Commission Inbox:** Interactive status pipeline (`RECEIVED` → `IN_REVIEW` → `ACCEPTED` / `DECLINED` → `IN_PROGRESS` → `DELIVERED`).
12. **Notification Simulation:** In-app toast + activity log showing notifications dispatched to the client upon status change.

### Phase 5: Verification & Polish
13. **Demo Switcher Bar:** Top-level indicator allowing instant switching between "Visitor View" and "Artist Studio (@maya)".
14. **Build & Performance Verification:** Run `compile_applet` and verify responsiveness across mobile, tablet, and 1440px desktop.

---

## 8. Potential Technical Risks & Mitigations

| Identified Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Gemini API Rate Limiting or Latency** | AI button hangs or returns 500 during demo. | Implement timeout handling with instant editorial fallback templates if the API takes $>4\text{s}$ or errors. |
| **Image Upload File Size Issues** | Large 10MB raw photos causing browser or JSON payload crashes. | Implement client-side canvas compression (`max 1600px width/height`, `0.82 JPEG quality`) before storing as Data URL. |
| **Route Sync & Handle Resolution** | Navigating between `/@maya` and studio views breaks page state. | Single-page state router supporting clean URL aliases (`/@maya`, `/studio`, `/explore`) with browser History API synchronization. |
| **Missing Form Validation** | Empty commissions submitted or malformed pricing breaking UI calculations. | Zod schema validation on both client form submission and backend API handlers with visible inline error states. |

---

## 9. Hackathon Demo Reliability Plan

To guarantee a flawless live presentation:
1. **Zero-Setup Demo Data:** The application launches immediately with Maya Lin's full studio: 8 breathtaking studio artworks, 2 curated collections ("Earth & Ash 2026", "Sculptural Vessels"), 3 tiered commission offerings, and 2 active commission requests in the inbox.
2. **One-Click Story Walkthrough:**
   - **Step 1 (The Problem & Landing):** Show ATELIER homepage explaining the value proposition.
   - **Step 2 (The Artist Portfolio):** Visit `/@maya` — show editorial gallery, lightbox, and collections.
   - **Step 3 (Client Commission Booking):** Click "Commission Me", type a casual client idea, click "Enhance with AI Brief Generator", and submit.
   - **Step 4 (Artist Inbox & Workflow):** Switch to Artist Studio — see the new commission instantly arrive in `RECEIVED`, review the brief, advance it to `ACCEPTED` and `IN PROGRESS`.
   - **Step 5 (Studio Creation & AI Assistant):** Open "Add Artwork", upload a piece, click "Generate Metadata with AI", and publish to the live portfolio.
3. **No Dead Clicks:** Every button, tab, modal, and status badge is fully interactive with optimistic UI updates.

---

*This blueprint is ready for user review. Once approved, implementation will proceed systematically.*
