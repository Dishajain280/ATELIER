import React, { useState } from 'react';
import { Eye, Sparkles, Layers } from 'lucide-react';
import { Artwork, Collection } from '../../types/index.js';

interface ArtworkGridProps {
  artworks: Artwork[];
  collections: Collection[];
  onSelectArtwork: (artwork: Artwork) => void;
  initialCollectionId?: string;
}

export const ArtworkGrid: React.FC<ArtworkGridProps> = ({
  artworks,
  collections,
  onSelectArtwork,
  initialCollectionId = 'all',
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(initialCollectionId);

  React.useEffect(() => {
    if (initialCollectionId) {
      setSelectedCollectionId(initialCollectionId);
    }
  }, [initialCollectionId]);

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
          <h2 className="font-editorial text-3xl md:text-5xl font-normal text-neutral-950">
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
            return (
              <button
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                  selectedCollectionId === col.id
                    ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {col.title} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Artwork Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="py-24 text-center text-neutral-500 bg-neutral-50/50 rounded-xs border border-dashed border-neutral-300">
          <Layers className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-sm font-medium text-neutral-800">No artworks found in this collection series.</p>
          <p className="text-xs text-neutral-500 mt-1">Select "All Works" to browse the complete studio catalogue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filteredArtworks.map((artwork, idx) => {
            const isFeatured = artwork.featured && idx === 0;

            return (
              <article
                key={artwork.id}
                onClick={() => onSelectArtwork(artwork)}
                className={`group cursor-pointer flex flex-col ${
                  isFeatured ? 'md:col-span-2' : 'col-span-1'
                }`}
              >
                {/* Media Frame */}
                <div className={`relative overflow-hidden bg-neutral-100 rounded-xs mb-4 border border-neutral-200/80 shadow-2xs group-hover:border-neutral-400 transition-colors ${
                  isFeatured ? 'aspect-[16/10]' : 'aspect-[4/3]'
                }`}>
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
                </div>

                {/* Zero-Pill Unboxed Metadata: Title, Year, Medium, Price */}
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-editorial text-2xl font-normal text-neutral-950 group-hover:text-amber-800 transition-colors">
                      {artwork.title}
                    </h3>
                    <span className="font-mono text-xs text-neutral-400 tabular-nums">
                      {artwork.year}
                    </span>
                  </div>

                  {/* Clean text metadata with typographical separators */}
                  <div className="flex items-center gap-2 text-xs text-neutral-600 font-light truncate">
                    <span className="truncate">{artwork.medium}</span>
                    <span aria-hidden="true" className="text-neutral-300">·</span>
                    <span className="capitalize whitespace-nowrap font-medium text-neutral-700">
                      {artwork.status === 'in_collection' ? 'In Private Collection' : artwork.status.replace('_', ' ')}
                    </span>
                    {artwork.price && (
                      <>
                        <span aria-hidden="true" className="text-neutral-300">·</span>
                        <span className="font-mono text-neutral-900 font-medium tabular-nums whitespace-nowrap">
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
