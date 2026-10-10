import React, { useState } from 'react';
import { Eye, Sparkles, Layers, Lock, Check } from 'lucide-react';
import { Artwork, Collection } from '../../types/index.js';

interface ArtworkGridProps {
  artworks: Artwork[];
  collections: Collection[];
  onSelectArtwork: (artwork: Artwork) => void;
  initialCollectionId?: string;
  gridStyle?: 'editorial' | 'bento' | 'masonry' | 'minimal';
  watermarkEnabled?: boolean;
  creatorName?: string;
}

export const ArtworkGrid: React.FC<ArtworkGridProps> = ({
  artworks,
  collections,
  onSelectArtwork,
  initialCollectionId = 'all',
  gridStyle = 'bento',
  watermarkEnabled = false,
  creatorName = 'ATELIER Studio',
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(initialCollectionId);
  const [unlockedCollections, setUnlockedCollections] = useState<Record<string, boolean>>({});
  const [passwordPromptCol, setPasswordPromptCol] = useState<Collection | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  React.useEffect(() => {
    if (initialCollectionId) {
      setSelectedCollectionId(initialCollectionId);
    }
  }, [initialCollectionId]);

  const handleCollectionClick = (col: Collection) => {
    if (col.isPasswordProtected && !unlockedCollections[col.id]) {
      setPasswordPromptCol(col);
      setEnteredPassword('');
      setPasswordError('');
      return;
    }
    setSelectedCollectionId(col.id);
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPromptCol) return;
    if (enteredPassword.trim() === (passwordPromptCol.password || '')) {
      setUnlockedCollections(prev => ({ ...prev, [passwordPromptCol.id]: true }));
      setSelectedCollectionId(passwordPromptCol.id);
      setPasswordPromptCol(null);
      setEnteredPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect collector passcode. Please check with the artist.');
    }
  };

  const filteredArtworks = selectedCollectionId === 'all'
    ? artworks
    : artworks.filter(a => a.collectionId === selectedCollectionId);

  return (
    <section id="gallery-section" className="py-20 max-w-7xl mx-auto px-6">
      {/* Gallery Header & Collection Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-5 border-b border-neutral-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono block mb-1">
            01. Selected Works
          </span>
          <h2 className="font-editorial text-3xl md:text-5xl font-normal">
            Gallery & Collections
          </h2>
        </div>

        {/* Functional interactive filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100/90 rounded-md border border-neutral-200/60">
          <button
            onClick={() => setSelectedCollectionId('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer ${
              selectedCollectionId === 'all'
                ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Works ({artworks.length})
          </button>
          {collections.map((col) => {
            const count = artworks.filter(a => a.collectionId === col.id).length;
            const isProtected = col.isPasswordProtected && !unlockedCollections[col.id];

            return (
              <button
                key={col.id}
                onClick={() => handleCollectionClick(col)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  selectedCollectionId === col.id
                    ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {isProtected && <Lock className="w-3 h-3 text-amber-700" />}
                <span>{col.title} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Password Prompt Modal for VIP Private Galleries */}
      {passwordPromptCol && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xs max-w-md w-full p-8 shadow-2xl border border-neutral-200 space-y-6 text-neutral-900">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-2xl font-normal text-neutral-950">
                Protected Collection
              </h3>
              <p className="text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900">{passwordPromptCol.title}</span> requires a secure collector password provided by the artist for VIP preview.
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                  Collector Password *
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono text-center tracking-widest text-base text-neutral-900"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-red-600 text-center font-medium animate-fadeIn">
                  {passwordError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordPromptCol(null)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
                >
                  Unlock Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Artwork Grid with dynamic gridStyle layout */}
      {filteredArtworks.length === 0 ? (
        <div className="py-24 text-center text-neutral-500 bg-neutral-50/50 rounded-xs border border-dashed border-neutral-300">
          <Layers className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-sm font-medium text-neutral-800">No artworks found in this collection series.</p>
          <p className="text-xs text-neutral-500 mt-1">Select "All Works" to browse the complete studio catalogue.</p>
        </div>
      ) : (
        <div className={
          gridStyle === 'editorial'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20'
            : gridStyle === 'masonry'
            ? 'columns-1 md:columns-2 lg:columns-3 gap-8 space-y-12'
            : gridStyle === 'minimal'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14'
        }>
          {filteredArtworks.map((artwork, idx) => {
            const isFeatured = gridStyle === 'bento' ? Boolean(artwork.featured && idx === 0) : gridStyle === 'editorial' ? idx % 3 === 0 : false;
            const aspectClass = gridStyle === 'minimal'
              ? 'aspect-square'
              : gridStyle === 'editorial'
              ? isFeatured ? 'aspect-[16/11]' : 'aspect-[4/5]'
              : isFeatured ? 'aspect-[16/10]' : 'aspect-[4/3]';

            return (
              <article
                key={artwork.id}
                onClick={() => onSelectArtwork(artwork)}
                className={`group cursor-pointer flex flex-col ${
                  gridStyle === 'masonry' ? 'break-inside-avoid mb-10' : ''
                } ${
                  isFeatured && gridStyle !== 'masonry' ? 'md:col-span-2' : 'col-span-1'
                }`}
              >
                {/* Media Frame */}
                <div className={`relative overflow-hidden bg-neutral-100 rounded-xs mb-4 border border-neutral-200/80 shadow-2xs group-hover:border-neutral-400 transition-colors ${aspectClass}`}>
                  <img
                    src={artwork.images[0]}
                    alt={artwork.title}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  {/* Subtle hover overlay with inspect trigger */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <span className="bg-white/95 text-neutral-900 text-xs font-medium uppercase tracking-wider px-3.5 py-2 rounded-xs shadow-md inline-flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Piece</span>
                    </span>
                  </div>

                  {artwork.featured && (
                    <div className="absolute top-3 left-3 bg-[#FAF9F6]/95 backdrop-blur-xs text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 text-neutral-900 rounded-xs border border-neutral-300 shadow-2xs">
                      Featured Work
                    </div>
                  )}

                  {artwork.status === 'sold' && (
                    <div className="absolute top-3 right-3 bg-neutral-900/90 text-white text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs">
                      Acquired
                    </div>
                  )}

                  {watermarkEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-25 transform -rotate-12">
                      <span className="text-white font-mono text-xs tracking-widest uppercase px-3 py-1 bg-black/50 backdrop-blur-xs rounded-xs">
                        © {creatorName} — ATELIER Archive
                      </span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-editorial text-2xl font-normal group-hover:opacity-75 transition-opacity">
                      {artwork.title}
                    </h3>
                    <span className="font-mono text-xs opacity-60 tabular-nums">
                      {artwork.year}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs opacity-75 font-light truncate">
                    <span className="truncate">{artwork.medium}</span>
                    <span aria-hidden="true" className="opacity-40">·</span>
                    <span className="capitalize whitespace-nowrap font-medium">
                      {artwork.status === 'in_collection' ? 'In Private Collection' : artwork.status.replace('_', ' ')}
                    </span>
                    {artwork.price && (
                      <>
                        <span aria-hidden="true" className="opacity-40">·</span>
                        <span className="font-mono font-medium tabular-nums whitespace-nowrap">
                          ${artwork.price.toLocaleString()} {artwork.currency || 'USD'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
