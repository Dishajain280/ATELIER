import React, { useState } from 'react';
import { 
  ArrowDown, 
  Mail, 
  ExternalLink, 
  Instagram, 
  Share2, 
  Check, 
  Heart, 
  MapPin, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Creator } from '../../types/index.js';

interface ArtistHeroProps {
  creator: Creator;
  artworkCount: number;
  collectionCount: number;
  onRequestCommission: () => void;
  onScrollToGallery: () => void;
}

export const ArtistHero: React.FC<ArtistHeroProps> = ({
  creator,
  artworkCount,
  collectionCount,
  onRequestCommission,
  onScrollToGallery,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleShare = async () => {
    const url = window.location.href.split('#')[0] + `#/@${creator.handle}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2400);
    } catch {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2400);
    }
  };

  return (
    <section className="pt-10 pb-18 border-b border-neutral-200/80 bg-[#FAF9F6] relative overflow-hidden">
      {/* Subtle organic texture wash */}
      <div className="absolute inset-0 bg-radial from-amber-100/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Identity, Statement, and Action */}
          <div className="lg:col-span-8 space-y-7">
            {/* Header Kicker: Handle, Location & Commission Status */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-mono font-medium text-neutral-900 bg-neutral-200/70 px-2.5 py-1 rounded-xs tracking-wider">
                @{creator.handle}
              </span>
              
              {creator.location && (
                <>
                  <span className="text-neutral-300" aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-neutral-600 font-medium">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>{creator.location}</span>
                  </span>
                </>
              )}

              <span className="text-neutral-300" aria-hidden="true">·</span>
              {creator.acceptingCommissions ? (
                <span className="inline-flex items-center gap-1.5 text-amber-900 font-medium bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>Accepting Select Commissions</span>
                </span>
              ) : (
                <span className="text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-xs">
                  Studio Bookings Closed
                </span>
              )}
            </div>

            {/* Artist Name & Curatorial Disciplines */}
            <div className="space-y-2">
              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-normal text-neutral-950 tracking-tight leading-[1.02]">
                {creator.name}
              </h1>

              {/* Disciplines Kicker */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 font-medium tracking-wide pt-1">
                {creator.disciplines.map((d, i) => (
                  <span key={d}>
                    {d}{i < creator.disciplines.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Curatorial Statement & Studio Practice Bio */}
            <div className="space-y-4 pt-1 max-w-3xl">
              <blockquote className="text-lg md:text-xl lg:text-2xl font-editorial italic text-neutral-900 leading-relaxed border-l-2 border-neutral-300 pl-4 py-0.5">
                "{creator.statement || creator.bio}"
              </blockquote>
              <p className="text-sm text-neutral-600 leading-relaxed font-light">
                {creator.bio}
              </p>
            </div>

            {/* Studio Booking Schedule / Notice */}
            {creator.commissionNotice && (
              <div className="border border-amber-200 bg-amber-50/60 p-3.5 rounded-xs max-w-xl text-xs text-amber-950 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block uppercase tracking-wider text-[10px] text-amber-900 mb-0.5">
                    Studio Availability & Intake
                  </span>
                  <span>{creator.commissionNotice}</span>
                </div>
              </div>
            )}

            {/* Primary Action Buttons & Socials */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onRequestCommission}
                className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                Commission Me
              </button>

              <button
                onClick={onScrollToGallery}
                className="px-5 py-3 bg-white border border-neutral-300 text-neutral-800 text-xs font-medium uppercase tracking-wider hover:bg-neutral-50 transition-colors rounded-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>View Works ({artworkCount})</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsFollowing(prev => !prev)}
                className={`px-4 py-3 border text-xs font-medium uppercase tracking-wider rounded-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFollowing
                    ? 'border-emerald-300 bg-emerald-50/60 text-emerald-800'
                    : 'border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-3 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-xs transition-colors cursor-pointer relative"
                title="Share artist portfolio link"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}

                {isCopied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">
                    Link Copied!
                  </span>
                )}
              </button>

              {/* Social icons */}
              <div className="flex items-center gap-2 pl-1 text-neutral-500">
                {creator.socialLinks.instagram && (
                  <a
                    href={creator.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 hover:text-neutral-900 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {creator.socialLinks.website && (
                  <a
                    href={creator.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 hover:text-neutral-900 transition-colors"
                    title="Website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {creator.socialLinks.email && (
                  <a
                    href={`mailto:${creator.socialLinks.email}`}
                    className="p-2.5 hover:text-neutral-900 transition-colors"
                    title="Email Studio"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Studio Portrait / Avatar & Curatorial Provenance */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end">
            <div className="relative w-full max-w-xs aspect-square overflow-hidden rounded-xs border border-neutral-200/90 shadow-sm bg-neutral-100 group">
              <img
                src={creator.avatarUrl}
                alt={creator.name}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
            </div>

            {/* Studio Metrics / Provenance */}
            <div className="w-full max-w-xs grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-neutral-200/80 text-left">
              <div>
                <span className="font-mono text-2xl font-light text-neutral-900 block tabular-nums">
                  {artworkCount}
                </span>
                <span className="text-xs text-neutral-500 font-light">
                  Archived Works
                </span>
              </div>
              <div>
                <span className="font-mono text-2xl font-light text-neutral-900 block tabular-nums">
                  {collectionCount}
                </span>
                <span className="text-xs text-neutral-500 font-light">
                  Curated Series
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
