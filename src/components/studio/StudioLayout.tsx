import React from 'react';
import { 
  LayoutDashboard,
  Palette, 
  Layers, 
  Inbox, 
  SlidersHorizontal, 
  User, 
  Sparkles,
  Settings,
  ExternalLink 
} from 'lucide-react';
import { Creator, CommissionRequest } from '../../types/index.js';

export type StudioTabType = 'overview' | 'portfolio' | 'artworks' | 'collections' | 'commissions' | 'inbox' | 'services' | 'ai-studio' | 'settings' | 'orders' | 'analytics';

interface StudioLayoutProps {
  creator: Creator;
  activeTab: StudioTabType;
  onTabChange: (tab: StudioTabType) => void;
  onViewPublicProfile: () => void;
  commissions: CommissionRequest[];
  children: React.ReactNode;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  creator,
  activeTab,
  onTabChange,
  onViewPublicProfile,
  commissions,
  children,
}) => {
  const pendingCount = commissions.filter(c => c.status === 'RECEIVED' || c.status === 'IN_REVIEW').length;

  const [copiedLink, setCopiedLink] = React.useState(false);

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-neutral-900 pb-20">
      {/* Studio Header Bar */}
      <div className="border-b border-neutral-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={creator.avatarUrl}
              alt={creator.name}
              className="w-12 h-12 rounded-xs object-cover border border-neutral-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-2xl font-bold text-neutral-900">
                  {creator.name}
                </h1>
                <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-xs">
                  @{creator.handle}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Studio Backstage Management · {creator.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const url = `${window.location.origin}/@${creator.handle}`;
                navigator.clipboard?.writeText(url);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              title="Copy Public Portfolio URL"
            >
              <span>{copiedLink ? '✓ Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={onViewPublicProfile}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              <span>Preview Public Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => onTabChange('overview')}
            className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-neutral-900 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onTabChange('portfolio')}
            className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'portfolio'
                ? 'border-neutral-900 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Portfolio & Bio</span>
          </button>

          <button
            onClick={() => onTabChange('artworks')}
            className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'artworks'
                ? 'border-neutral-900 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Artwork</span>
          </button>

          <button
            onClick={() => onTabChange('collections')}
            className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'collections'
                ? 'border-neutral-900 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Collections</span>
          </button>

          <button
            onClick={() => onTabChange('commissions')}
            className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap relative cursor-pointer ${
              activeTab === 'commissions'
                ? 'border-neutral-900 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Commissions</span>
            {pendingCount > 0 && (
              <span className="bg-amber-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-xs ml-0.5">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('services')}
            className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'services'
                ? 'border-neutral-900 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>

          <button
            onClick={() => onTabChange('ai-studio')}
            className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ai-studio'
                ? 'border-neutral-900 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Studio</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`py-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-neutral-900 text-neutral-950 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        {children}
      </main>
    </div>
  );
};
