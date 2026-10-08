import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200/80 bg-[#FAF9F6] py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-neutral-200/60">
          <div>
            <span className="font-editorial text-2xl font-bold tracking-tight text-neutral-900 block">
              ATELIER
            </span>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              The unified professional presence for independent artists, craft creators, and small makers.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-600 font-medium">
            <span>Portfolio</span>
            <span aria-hidden="true" className="text-neutral-300">/</span>
            <span>Gallery</span>
            <span aria-hidden="true" className="text-neutral-300">/</span>
            <span>Collections</span>
            <span aria-hidden="true" className="text-neutral-300">/</span>
            <span>Commission Intake</span>
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
