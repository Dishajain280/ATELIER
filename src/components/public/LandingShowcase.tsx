import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Palette, 
  Clock, 
  ShieldCheck, 
  Inbox, 
  MessageSquare, 
  FolderArchive, 
  ArrowUpRight, 
  Eye, 
  SlidersHorizontal,
  FileText,
  UserCheck,
  Check,
  Zap,
  CornerDownRight
} from 'lucide-react';
import { Creator, Artwork, CommissionService } from '../../types/index.js';

interface LandingShowcaseProps {
  creators: Creator[];
  featuredArtworks: Artwork[];
  onSelectCreator: (creator: Creator) => void;
  onOpenStudio: (claimedHandle?: string) => void;
  onInspectArtwork: (artwork: Artwork) => void;
}

export const LandingShowcase: React.FC<LandingShowcaseProps> = ({
  creators,
  featuredArtworks,
  onSelectCreator,
  onOpenStudio,
  onInspectArtwork,
}) => {
  // Interactive State
  const [handleInput, setHandleInput] = useState('');
  const [handleClaimedSuccess, setHandleClaimedSuccess] = useState(false);
  const [activeAITab, setActiveAITab] = useState<'metadata' | 'bio' | 'brief'>('metadata');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Maya as primary showcase artist
  const maya = creators.find(c => c.handle === 'maya') || creators[0];
  const elena = creators.find(c => c.handle === 'elena') || creators[1];
  const kai = creators.find(c => c.handle === 'kai') || creators[2];

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    const cleanHandle = handleInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    setHandleClaimedSuccess(true);
    setTimeout(() => {
      onOpenStudio(cleanHandle);
    }, 900);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-neutral-900 min-h-screen selection:bg-amber-100 selection:text-amber-900">

      {/* =========================================================================
          SECTION 2: HERO SECTION
      ========================================================================= */}
      <section className="pt-20 pb-20 md:pt-28 md:pb-28 border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl space-y-8">
            {/* Editorial Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 bg-neutral-100/90 px-3 py-1 rounded-xs border border-neutral-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
              <span>The Independent Maker Identity</span>
              <span className="text-neutral-300">/</span>
              <span>Portfolio · Gallery · Commissions</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-neutral-950 tracking-tight leading-[0.98]">
              Your art deserves more than a feed.
            </h1>

            {/* Supporting Pitch */}
            <p className="text-lg md:text-xl text-neutral-600 font-light leading-relaxed max-w-2xl">
              ATELIER gives fine artists, craftspeople, and small makers one professional identity: <code className="font-mono text-base font-medium text-neutral-900 bg-neutral-200/60 px-2 py-0.5 rounded-xs">atelier.app/@artistname</code>. A curated portfolio, thematic collections, and a structured commission intake form — with zero algorithm compression.
            </p>

            {/* CTA Group */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollToSection('claim-section')}
                className="px-7 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm inline-flex items-center gap-2.5 cursor-pointer"
              >
                <span>Create Your Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('showcase-section')}
                className="px-6 py-3.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
              >
                Explore Featured Artists
              </button>
            </div>

            {/* Subtext provenance */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-500 font-light">
              <span>Tailored for ceramicists</span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span>Oil painters</span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span>Textile & fiber sculptors</span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span>Woodturners & craft ateliers</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: VISUAL PORTFOLIO SHOWCASE (Artwork Gallery)
      ========================================================================= */}
      <section id="showcase-section" className="py-24 border-b border-neutral-200/80 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono block mb-1">
                Curatorial Showcase
              </span>
              <h2 className="font-editorial text-3xl md:text-5xl font-normal text-neutral-950">
                Craftsmanship in high fidelity.
              </h2>
            </div>
            <p className="text-xs text-neutral-500 max-w-md font-light">
              Every detail is preserved without compression artifacts. Inspect textures, glazes, brushwork, and provenance in fullscreen.
            </p>
          </div>

          {/* Curated Bento Grid of Artworks */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Card 1: Maya's Stoneware Vessel (Large Feature) */}
            <div 
              className="md:col-span-7 group cursor-pointer flex flex-col"
              onClick={() => {
                const art = featuredArtworks[0];
                if (art) onInspectArtwork(art);
              }}
            >
              <div className="relative aspect-[16/11] bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200/80 mb-4">
                <img
                  src="/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg"
                  alt="Monolith IV: Sediment & Flame by Maya Lin"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-neutral-950 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-xs shadow-md inline-flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Piece</span>
                  </span>
                </div>
                <div className="absolute top-3 left-3 bg-[#FAF9F6]/90 backdrop-blur-xs text-[11px] font-mono px-2 py-0.5 rounded-xs border border-neutral-200 font-medium text-neutral-800">
                  @maya · Earth & Ash 2026
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-editorial text-2xl font-normal text-neutral-950 group-hover:text-amber-800 transition-colors">
                    Monolith IV: Sediment & Flame
                  </h3>
                  <span className="font-mono text-sm text-neutral-900 font-medium tabular-nums">$1,850 USD</span>
                </div>
                <div className="text-xs text-neutral-500 flex items-center gap-2">
                  <span>Wood-fired Shigaraki stoneware, natural ash glaze</span>
                  <span>·</span>
                  <span className="capitalize">Available</span>
                </div>
              </div>
            </div>

            {/* Card 2 & 3: Elena's Abstract Linen & Kai's Tapestry */}
            <div className="md:col-span-5 flex flex-col justify-between gap-8">
              {/* Elena's Painting */}
              <div 
                className="group cursor-pointer flex flex-col"
                onClick={() => {
                  const art = featuredArtworks.find(a => a.creatorId === 'creator_elena') || featuredArtworks[1];
                  if (art) onInspectArtwork(art);
                }}
              >
                <div className="relative aspect-[16/10] bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200/80 mb-3">
                  <img
                    src="/src/assets/images/atelier_oil_abstract_1791384045751.jpg"
                    alt="Baltic Sediment No. 12 by Elena Rostova"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#FAF9F6]/90 backdrop-blur-xs text-[10px] font-mono px-2 py-0.5 rounded-xs border border-neutral-200 font-medium text-neutral-800">
                    @elena · Silent Stratum
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-editorial text-xl font-normal text-neutral-950 group-hover:text-amber-800 transition-colors">
                      Baltic Sediment No. 12
                    </h3>
                    <span className="font-mono text-xs text-neutral-900 font-medium tabular-nums">$4,800 USD</span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Oil, bone black, and natural ochre on raw linen
                  </div>
                </div>
              </div>

              {/* Kai's Fiber Art */}
              <div 
                className="group cursor-pointer flex flex-col"
                onClick={() => {
                  const art = featuredArtworks.find(a => a.creatorId === 'creator_kai') || featuredArtworks[2];
                  if (art) onInspectArtwork(art);
                }}
              >
                <div className="relative aspect-[16/10] bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200/80 mb-3">
                  <img
                    src="/src/assets/images/atelier_fiber_tapestry_1791384057846.jpg"
                    alt="Tectonic Warp by Kai Takahashi"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#FAF9F6]/90 backdrop-blur-xs text-[10px] font-mono px-2 py-0.5 rounded-xs border border-neutral-200 font-medium text-neutral-800">
                    @kai · Architectural Textiles
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-editorial text-xl font-normal text-neutral-950 group-hover:text-amber-800 transition-colors">
                      Tectonic Warp: Weft in Nettle & Brass
                    </h3>
                    <span className="font-mono text-xs text-neutral-900 font-medium tabular-nums">$5,200 USD</span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Handspun wild nettle, undyed fleece, oxidized brass wire
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PROBLEM SECTION ("From scattered DMs to one professional presence")
      ========================================================================= */}
      <section className="py-24 border-b border-neutral-200/80 bg-[#F4F2EB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono block mb-1">
              The Problem We Solve
            </span>
            <h2 className="font-editorial text-4xl md:text-5xl font-normal text-neutral-950 leading-tight">
              From scattered DMs to one professional presence.
            </h2>
            <p className="text-sm text-neutral-600 font-light mt-3 leading-relaxed">
              Artists currently run their creative enterprise across four disconnected tools, losing commissions and clarity along the way.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* The Fragmented Old Way (Left 5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                The Fragmented Workflow:
              </span>

              <div className="bg-white/80 border border-neutral-200 p-4 rounded-xs space-y-1">
                <span className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Instagram
                </span>
                <p className="text-xs text-neutral-500">Algorithm changes bury your best work. Photos are heavily compressed.</p>
              </div>

              <div className="bg-white/80 border border-neutral-200 p-4 rounded-xs space-y-1">
                <span className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Direct Messages (DMs)
                </span>
                <p className="text-xs text-neutral-500">Unstructured inquiries, vague budgets, lost reference images, and endless back-and-forth.</p>
              </div>

              <div className="bg-white/80 border border-neutral-200 p-4 rounded-xs space-y-1">
                <span className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Google Drive & Dropbox
                </span>
                <p className="text-xs text-neutral-500">Scattered folders of moodboards and sketches that confuse patrons.</p>
              </div>

              <div className="bg-white/80 border border-neutral-200 p-4 rounded-xs space-y-1">
                <span className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Payment Links & Spreadsheets
                </span>
                <p className="text-xs text-neutral-500">Disconnected invoices with no clear milestone tracking or revision terms.</p>
              </div>
            </div>

            {/* Transform Arrow (Center 2 Cols) */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-md">
                <ArrowRight className="w-5 h-5 hidden lg:block" />
                <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0 block" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 mt-2 block">
                Replaced By
              </span>
            </div>

            {/* The ATELIER Solution (Right 5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-neutral-300 p-8 rounded-xs shadow-sm space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-800 block mb-1">
                  ATELIER Canonical Link
                </span>
                <h3 className="font-editorial text-3xl font-normal text-neutral-950">
                  atelier.app/@artistname
                </h3>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                One elegant, shareable URL on your business card, Instagram bio, and exhibition catalogs that unites all five facets of your creative practice:
              </p>

              <ul className="space-y-3 text-xs text-neutral-800">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Artist Portfolio:</strong> Verified editorial identity and monograph statement.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Artwork Gallery:</strong> High-resolution photography with unboxed provenance.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Thematic Collections:</strong> Groupings by kiln firing, year, or exhibition.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Commission Services:</strong> Transparent base rates, turnaround weeks, revisions.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Structured Intake Pipeline:</strong> Direct patron briefs with Gemini AI assistance.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FEATURE SECTION (5 Core Pillars)
      ========================================================================= */}
      <section id="features-section" className="py-24 border-b border-neutral-200/80 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono block mb-1">
              Platform Features
            </span>
            <h2 className="font-editorial text-4xl md:text-5xl font-normal text-neutral-950">
              Engineered for the fine craft atelier.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-xs shadow-2xs space-y-4">
              <span className="font-mono text-xs text-neutral-400 block">PILLAR 01</span>
              <h3 className="font-editorial text-2xl font-normal text-neutral-950">
                Your Own Identity
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 font-light">
                Claim your bespoke handle (e.g. <code className="font-mono text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded-xs">@maya</code>). Customize your curatorial statement, verified craft disciplines, studio location, and studio schedule notice.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-xs shadow-2xs space-y-4">
              <span className="font-mono text-xs text-neutral-400 block">PILLAR 02</span>
              <h3 className="font-editorial text-2xl font-normal text-neutral-950">
                Beautiful Artwork Gallery
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 font-light">
                Present artwork with quiet, unboxed metadata (medium, dimensions, year, value). Fullscreen lightbox viewer lets collectors inspect physical textures and glaze pooling.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-xs shadow-2xs space-y-4">
              <span className="font-mono text-xs text-neutral-400 block">PILLAR 03</span>
              <h3 className="font-editorial text-2xl font-normal text-neutral-950">
                Organized Collections
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 font-light">
                Group works into meaningful bodies of work, seasonal Anagama firings, or gallery exhibition suites. Control order and visibility with one click.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-xs shadow-2xs space-y-4">
              <span className="font-mono text-xs text-neutral-400 block">PILLAR 04</span>
              <h3 className="font-editorial text-2xl font-normal text-neutral-950">
                Structured Commission Intake
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 font-light">
                Replace endless DMs with clear service tiers. Set transparent base rates, turnaround weeks, and revision allowances. Patrons submit structured briefs directly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-xs shadow-2xs space-y-4">
              <span className="font-mono text-xs text-neutral-400 block">PILLAR 05</span>
              <h3 className="font-editorial text-2xl font-normal text-neutral-950">
                AI-Assisted Creation
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 font-light">
                Gemini AI assists with curatorial metadata (poetic titles and tags), monographs (first-person artist statements), and turns loose client thoughts into structured design briefs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-neutral-950 text-white p-8 rounded-xs shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-neutral-400 block mb-2">READY IN 2 MINUTES</span>
                <h3 className="font-editorial text-2xl font-normal text-white">
                  Zero Code Setup
                </h3>
                <p className="text-xs leading-relaxed text-neutral-300 font-light mt-2">
                  No complex site builders, plugins, or broken DNS settings. Claim your handle, add 3 artworks, and share your link today.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('claim-section')}
                className="w-full py-2.5 bg-white text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-neutral-200 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Claim Handle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: EXAMPLE ARTIST PROFILE PREVIEW (Interactive Live Card)
      ========================================================================= */}
      <section className="py-24 border-b border-neutral-200/80 bg-[#F4F2EB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono block">
              Live Example Profile
            </span>
            <h2 className="font-editorial text-4xl md:text-5xl font-normal text-neutral-950">
              See what patrons experience.
            </h2>
            <p className="text-xs text-neutral-600 font-light">
              Here is how Maya Lin's public presence appears to collectors and curators at <code className="font-mono text-neutral-900 bg-neutral-200/80 px-1 py-0.5 rounded-xs">atelier.app/@maya</code>.
            </p>
          </div>

          {/* Interactive Profile Card Simulation */}
          <div className="max-w-4xl mx-auto bg-white border border-neutral-300 rounded-xs shadow-lg overflow-hidden">
            {/* Fake Browser Top Bar */}
            <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
              </div>
              <div className="font-mono text-neutral-600 text-xs bg-white px-4 py-1 rounded-xs border border-neutral-200 shadow-2xs">
                https://atelier.app/@maya
              </div>
              <button
                onClick={() => onSelectCreator(maya)}
                className="text-amber-800 hover:text-amber-950 font-medium inline-flex items-center gap-1 text-xs cursor-pointer"
              >
                <span>Open Full Page</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </button>
            </div>

            {/* Profile Content Preview */}
            <div className="p-8 md:p-12 space-y-8 bg-[#FAF9F6]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-neutral-200 pb-8">
                <div className="flex items-center gap-5">
                  <img
                    src="/src/assets/images/atelier_artist_maya_1791384078475.jpg"
                    alt="Maya Lin"
                    className="w-18 h-18 rounded-xs object-cover border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-editorial text-3xl font-normal text-neutral-950">Maya Lin</h3>
                      <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-xs">@maya</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Ceramics · Sculptural Stoneware · Kyoto / Portland
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCreator(maya)}
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                >
                  Commission Me
                </button>
              </div>

              {/* Statement Snippet */}
              <p className="font-editorial italic text-xl text-neutral-800 leading-relaxed max-w-2xl">
                "My practice treats earth and ash as living collaborators. Each vessel is slowly coiled by hand and fired in an Anagama kiln for 96 hours."
              </p>

              {/* Artwork Row Preview */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="aspect-[4/3] bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200">
                  <img
                    src="/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg"
                    alt="Work 1"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="aspect-[4/3] bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200">
                  <img
                    src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80"
                    alt="Work 2"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="aspect-[4/3] bg-neutral-100 rounded-xs overflow-hidden border border-neutral-200">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80"
                    alt="Work 3"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="pt-4 text-center">
                <button
                  onClick={() => onSelectCreator(maya)}
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-950 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Full Profile & Commission Tiers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: COMMISSION WORKFLOW SECTION
      ========================================================================= */}
      <section id="workflow-section" className="py-24 border-b border-neutral-200/80 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono block mb-1">
              End-to-End Delivery
            </span>
            <h2 className="font-editorial text-4xl md:text-5xl font-normal text-neutral-950">
              The structured commission workflow.
            </h2>
            <p className="text-xs text-neutral-500 font-light mt-2 leading-relaxed">
              Every custom engagement moves through transparent, verifiable milestones without ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-3">
              <span className="font-mono text-xs text-amber-800 font-semibold block">STEP 01</span>
              <h3 className="font-editorial text-xl font-normal text-neutral-950">
                Publish Service Tiers
              </h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Define your offerings (e.g. "Bespoke Ceramic Vessel", "Site-Specific Wall Relief") with base rates, estimated turnaround weeks, and revision allowances.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-3">
              <span className="font-mono text-xs text-amber-800 font-semibold block">STEP 02</span>
              <h3 className="font-editorial text-xl font-normal text-neutral-950">
                Patron Brief Intake
              </h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Patrons select a tier and submit placement, dimension, and aesthetic preferences. The AI brief generator structures loose notes into clear deliverables.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-3">
              <span className="font-mono text-xs text-amber-800 font-semibold block">STEP 03</span>
              <h3 className="font-editorial text-xl font-normal text-neutral-950">
                Studio Review & Pipeline
              </h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Requests arrive in your dedicated Studio Inbox. Advance proposals through:
                <span className="block font-mono text-[10px] text-neutral-500 mt-1">
                  RECEIVED → IN REVIEW → ACCEPTED → IN PROGRESS
                </span>
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-3">
              <span className="font-mono text-xs text-amber-800 font-semibold block">STEP 04</span>
              <h3 className="font-editorial text-xl font-normal text-neutral-950">
                Fulfillment & Notification
              </h3>
              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                Append studio progress notes (e.g. "Kiln firing complete") and transition to DELIVERED. Patrons receive instant automated email confirmations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: AI FEATURE SHOWCASE (Gemini AI Studio Assistants)
      ========================================================================= */}
      <section id="ai-section" className="py-24 border-b border-neutral-200/80 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-mono block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Gemini AI Studio Integration
              </span>
              <h2 className="font-editorial text-4xl md:text-5xl font-normal text-neutral-950">
                Curatorial intelligence, crafted for artists.
              </h2>
            </div>
            <p className="text-xs text-neutral-500 max-w-md font-light">
              Built on Google's modern Gemini 3.8 Flash model. Always artist-editable before publishing, with zero AI slop or generic clichés.
            </p>
          </div>

          {/* Interactive AI Assistant Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Tab Switcher */}
            <div className="lg:col-span-4 space-y-3">
              <button
                onClick={() => setActiveAITab('metadata')}
                className={`w-full p-5 text-left border rounded-xs transition-all cursor-pointer ${
                  activeAITab === 'metadata'
                    ? 'bg-white border-neutral-950 shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-white text-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
                  <span>ASSISTANT 01</span>
                  {activeAITab === 'metadata' && <span className="text-amber-800 font-semibold">ACTIVE</span>}
                </div>
                <h3 className="font-editorial text-xl font-normal text-neutral-950 mb-1">
                  Artwork Metadata Assistant
                </h3>
                <p className="text-xs text-neutral-500 font-light">
                  Suggests poetic title options, museum-standard medium formatting, and curatorial tags from rough clay notes.
                </p>
              </button>

              <button
                onClick={() => setActiveAITab('bio')}
                className={`w-full p-5 text-left border rounded-xs transition-all cursor-pointer ${
                  activeAITab === 'bio'
                    ? 'bg-white border-neutral-950 shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-white text-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
                  <span>ASSISTANT 02</span>
                  {activeAITab === 'bio' && <span className="text-amber-800 font-semibold">ACTIVE</span>}
                </div>
                <h3 className="font-editorial text-xl font-normal text-neutral-950 mb-1">
                  Artist Monograph & Statement
                </h3>
                <p className="text-xs text-neutral-500 font-light">
                  Distills studio philosophy, material techniques, and natural influences into resonant curatorial statements.
                </p>
              </button>

              <button
                onClick={() => setActiveAITab('brief')}
                className={`w-full p-5 text-left border rounded-xs transition-all cursor-pointer ${
                  activeAITab === 'brief'
                    ? 'bg-white border-neutral-950 shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-white text-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
                  <span>ASSISTANT 03</span>
                  {activeAITab === 'brief' && <span className="text-amber-800 font-semibold">ACTIVE</span>}
                </div>
                <h3 className="font-editorial text-xl font-normal text-neutral-950 mb-1">
                  Commission Brief Synthesizer
                </h3>
                <p className="text-xs text-neutral-500 font-light">
                  Transforms loose patron ideas into structured design specifications with clear milestones and deliverables.
                </p>
              </button>
            </div>

            {/* Right Display Panel */}
            <div className="lg:col-span-8 bg-white border border-neutral-300 p-8 rounded-xs shadow-xs space-y-6">
              {activeAITab === 'metadata' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                      Raw Studio Input:
                    </span>
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-mono text-neutral-700">
                      "tall ceramic vase, fired in wood kiln for 4 days, natural ash glaze, ash pooling on shoulder"
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Gemini Curatorial Output:
                    </span>
                    
                    <div className="space-y-3 bg-amber-50/50 border border-amber-200/80 p-5 rounded-xs text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-amber-800 font-semibold block mb-1">Suggested Titles:</span>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 bg-white border border-amber-300 text-neutral-900 rounded-xs font-editorial text-sm">
                            "Monolith IV: Sediment & Flame"
                          </span>
                          <span className="px-2.5 py-1 bg-white border border-amber-300 text-neutral-900 rounded-xs font-editorial text-sm">
                            "The Quiet Chamber: No. 04"
                          </span>
                          <span className="px-2.5 py-1 bg-white border border-amber-300 text-neutral-900 rounded-xs font-editorial text-sm">
                            "Geology of Winter Light"
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200/60">
                        <span className="text-[10px] uppercase font-mono text-amber-800 font-semibold block mb-1">Museum Nomenclature:</span>
                        <p className="font-medium text-neutral-800">Wood-fired Shigaraki stoneware, vitrified pine ash celadon deposit</p>
                      </div>

                      <div className="pt-2 border-t border-amber-200/60">
                        <span className="text-[10px] uppercase font-mono text-amber-800 font-semibold block mb-1">Curatorial Statement:</span>
                        <p className="text-neutral-700 font-light leading-relaxed">
                          Constructed through slow tactile coiling and intuitive physical tension. The surface preserves the spontaneous trace of kiln flame and raw mineral deposits, balancing geological weight with delicate negative space.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeAITab === 'bio' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                      Artist Discipline & Context:
                    </span>
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-mono text-neutral-700">
                      "Elena Rostova · Abstract Oil on Unprimed Linen · Cold Wax · Berlin"
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Gemini Monograph Statement:
                    </span>
                    <div className="bg-amber-50/50 border border-amber-200/80 p-5 rounded-xs space-y-3">
                      <p className="font-editorial italic text-lg text-neutral-900 leading-relaxed">
                        "Working with unprimed Belgian linen, I investigate the threshold where geological time intersects fleeting light. Raw earth pigments and cold wax record the rhythm of patience in an accelerated world."
                      </p>
                      <p className="text-xs text-neutral-600 font-light leading-relaxed border-t border-amber-200/60 pt-3">
                        Elena Rostova is an independent visual artist based in Berlin. Her practice pairs architectural restraint with volatile organic pigments gathered from the Baltic shoreline.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeAITab === 'brief' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                      Raw Patron Inbound Inquiry:
                    </span>
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xs text-xs font-mono text-neutral-700">
                      "Need a tall vessel for our living room atrium. Maybe 40cm tall. Like coastal fog and dark rock."
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Gemini Structured Commission Specification:
                    </span>
                    <div className="bg-amber-50/50 border border-amber-200/80 p-5 rounded-xs text-xs space-y-2">
                      <pre className="font-sans text-[11px] text-neutral-800 whitespace-pre-wrap leading-relaxed">
{`Project Scope: Residential Atrium Centerpiece
Target Scale: 42cm height x 28cm diameter
Aesthetic Mood: Brutalist, oceanic, coastal fog, tactile wabi-sabi
Recommended Clay: Black mountain stoneware with heavy ash melt
Deliverables: Original wood-fired vessel, certificate of provenance, custom timber crating.`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-light">
                  Live in both public inquiry forms and artist studio drawers.
                </span>
                <button
                  onClick={() => onOpenStudio()}
                  className="font-semibold text-neutral-950 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Test in Studio Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: FINAL CTA ("Claim your @handle")
      ========================================================================= */}
      <section id="claim-section" className="py-24 border-b border-neutral-200/80 bg-[#121210] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-mono block">
              Start Your Studio
            </span>

            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-normal text-white leading-tight">
              Claim your @handle before your next exhibition.
            </h2>

            <p className="text-sm md:text-base text-neutral-400 font-light max-w-xl mx-auto leading-relaxed">
              Join independent creators establishing their canonical studio identity. Free during hackathon release.
            </p>

            {/* Handle Claim Form */}
            <form onSubmit={handleClaimSubmit} className="max-w-md mx-auto pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full flex items-center bg-neutral-900 border border-neutral-700 rounded-xs px-3 py-2 text-xs text-white focus-within:border-amber-500">
                  <span className="text-neutral-500 font-mono mr-1">atelier.app/@</span>
                  <input
                    type="text"
                    required
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    placeholder="yourname"
                    className="w-full bg-transparent border-none focus:outline-none font-mono text-white placeholder:text-neutral-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shrink-0 shadow-sm cursor-pointer"
                >
                  {handleClaimedSuccess ? 'Reserving...' : 'Claim Handle'}
                </button>
              </div>

              {handleClaimedSuccess && (
                <p className="text-xs text-emerald-400 mt-3 font-mono animate-fadeIn">
                  ✓ Handle reserved! Transitioning to your studio space...
                </p>
              )}
            </form>

            <div className="pt-8 flex flex-wrap justify-center items-center gap-8 text-xs text-neutral-500 font-mono">
              <span>Instant Setup</span>
              <span>·</span>
              <span>Zero Transaction Fees on Intake</span>
              <span>·</span>
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: EDITORIAL FOOTER
      ========================================================================= */}
      <footer className="bg-[#FAF9F6] border-t border-neutral-200/80 py-16 text-neutral-600 text-xs">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <span className="font-editorial text-2xl font-bold tracking-tight text-neutral-950 block">
                ATELIER
              </span>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                The unified professional presence for independent artists, craft creators, and small makers.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 block mb-2">
                Discovery
              </span>
              <ul className="space-y-1.5 font-medium">
                <li><button onClick={() => onSelectCreator(maya)} className="hover:text-neutral-950 cursor-pointer">@maya (Ceramics)</button></li>
                <li><button onClick={() => onSelectCreator(elena)} className="hover:text-neutral-950 cursor-pointer">@elena (Oil on Linen)</button></li>
                <li><button onClick={() => onSelectCreator(kai)} className="hover:text-neutral-950 cursor-pointer">@kai (Fiber Art)</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 block mb-2">
                Platform
              </span>
              <ul className="space-y-1.5 font-medium">
                <li><button onClick={() => scrollToSection('features-section')} className="hover:text-neutral-950 cursor-pointer">For Artists</button></li>
                <li><button onClick={() => scrollToSection('workflow-section')} className="hover:text-neutral-950 cursor-pointer">Commission Workflow</button></li>
                <li><button onClick={() => scrollToSection('ai-section')} className="hover:text-neutral-950 cursor-pointer">Gemini AI Studio</button></li>
                <li><button onClick={() => onOpenStudio()} className="hover:text-neutral-950 cursor-pointer">Studio Dashboard</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 block mb-2">
                Philosophy
              </span>
              <p className="text-neutral-500 text-[11px] font-light leading-relaxed">
                We believe art is best sustained when creators possess sovereign digital identities instead of renting attention on ephemeral social feeds.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400 font-mono">
            <span>© {new Date().getFullYear()} ATELIER Platform. Built with care for artists.</span>
            <span>All demo data and artworks simulated for hackathon presentation.</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL: SIGN IN / DEMO PERSONA SELECTOR
      ========================================================================= */}
      {isSignInModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsSignInModalOpen(false)}
        >
          <div 
            className="bg-[#FAF9F6] border border-neutral-300 rounded-xs p-6 md:p-8 max-w-md w-full shadow-2xl text-neutral-900 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                Demo Authentication
              </span>
              <h3 className="font-editorial text-3xl font-normal text-neutral-950">
                Sign In to Studio
              </h3>
              <p className="text-xs text-neutral-500 mt-1 font-light">
                Select an artist persona to explore their backstage dashboard:
              </p>
            </div>

            <div className="space-y-2.5">
              {creators.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setIsSignInModalOpen(false);
                    onSelectCreator(c);
                    onOpenStudio();
                  }}
                  className="w-full p-3.5 border border-neutral-200 hover:border-neutral-900 bg-white rounded-xs flex items-center justify-between transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      className="w-10 h-10 rounded-xs object-cover border border-neutral-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="font-editorial text-lg text-neutral-950 block leading-tight group-hover:text-amber-800 transition-colors">
                        {c.name}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-500">
                        @{c.handle} · {c.disciplines[0]}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setIsSignInModalOpen(false)}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
