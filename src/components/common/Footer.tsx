import React from 'react';

interface FooterProps {
  onNavigateTab?: (tab: 'portfolio' | 'artworks' | 'collections' | 'commissions') => void;
  onNavigateLanding?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onNavigateLanding }) => {
  return (
    <footer className="border-t border-neutral-200/80 bg-[#FAF9F6] py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-neutral-200/60">
          <div>
            {onNavigateLanding ? (
              <button
                onClick={onNavigateLanding}
                className="font-editorial text-2xl font-bold tracking-tight text-neutral-900 block text-left cursor-pointer hover:opacity-80 transition-opacity"
              >
                ATELIER
              </button>
            ) : (
              <span className="font-editorial text-2xl font-bold tracking-tight text-neutral-900 block">
                ATELIER
              </span>
            )}
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              The unified professional presence for independent artists, craft creators, and small makers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-600 font-medium">
            {onNavigateTab ? (
              <>
                <button
                  onClick={() => onNavigateTab('portfolio')}
                  className="hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  Portfolio & Bio
                </button>
                <span aria-hidden="true" className="text-neutral-300">/</span>
                <button
                  onClick={() => onNavigateTab('artworks')}
                  className="hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  Artworks
                </button>
                <span aria-hidden="true" className="text-neutral-300">/</span>
                <button
                  onClick={() => onNavigateTab('collections')}
                  className="hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  Collections
                </button>
                <span aria-hidden="true" className="text-neutral-300">/</span>
                <button
                  onClick={() => onNavigateTab('commissions')}
                  className="hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  Commission Inbox
                </button>
              </>
            ) : (
              <>
                <span>Portfolio</span>
                <span aria-hidden="true" className="text-neutral-300">/</span>
                <span>Artworks</span>
                <span aria-hidden="true" className="text-neutral-300">/</span>
                <span>Collections</span>
                <span aria-hidden="true" className="text-neutral-300">/</span>
                <span>Commissions</span>
              </>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} ATELIER platform. Built for craftspeople and patrons.</p>
          <p className="text-neutral-400">
            Empowering human tactile craft through structured digital identity.
          </p>
        </div>
      </div>
    </footer>
  );
};
