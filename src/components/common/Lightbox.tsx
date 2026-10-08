import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Artwork } from '../../types/index.js';

interface LightboxProps {
  artwork: Artwork | null;
  onClose: () => void;
  onRequestCommission?: (artwork: Artwork) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  artwork,
  onClose,
  onRequestCommission,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!artwork) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#121210]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10 z-10"
        aria-label="Close viewer"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="max-w-6xl w-full h-[90vh] grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Frame */}
        <div className="md:col-span-8 h-full flex items-center justify-center overflow-hidden">
          <img
            src={artwork.images[0]}
            alt={artwork.title}
            className="max-h-[85vh] max-w-full object-contain rounded-sm shadow-2xl transition-transform"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Curatorial Details Pane */}
        <div className="md:col-span-4 text-neutral-100 flex flex-col justify-center space-y-6 pr-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
              <span>{artwork.year}</span>
              <span className="mx-2">·</span>
              <span className="capitalize">{artwork.status.replace('_', ' ')}</span>
            </div>
            <h2 className="font-editorial text-3xl md:text-4xl font-normal leading-tight text-white">
              {artwork.title}
            </h2>
          </div>

          <div className="space-y-3 border-y border-neutral-800 py-4 text-sm text-neutral-300">
            <div>
              <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Medium & Technique</span>
              <span className="font-medium text-neutral-200">{artwork.medium}</span>
            </div>
            {artwork.dimensions && (
              <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Dimensions</span>
                <span className="font-mono text-xs text-neutral-200">{artwork.dimensions}</span>
              </div>
            )}
            {artwork.price && (
              <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Acquisition / Value</span>
                <span className="font-mono text-base text-neutral-100 tabular-nums">
                  ${artwork.price.toLocaleString()} {artwork.currency || 'USD'}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm leading-relaxed text-neutral-400 font-light">
            {artwork.description}
          </p>

          {artwork.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              {artwork.tags.map((tag, idx) => (
                <span key={tag}>
                  {tag}{idx < artwork.tags.length - 1 ? ' ·' : ''}
                </span>
              ))}
            </div>
          )}

          {onRequestCommission && (
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onRequestCommission(artwork);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors rounded-sm"
              >
                <span>Commission Similar Work</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
