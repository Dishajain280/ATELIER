import React from 'react';
import { 
  Palette, 
  Layers, 
  Inbox, 
  SlidersHorizontal, 
  Eye, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Check,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Creator, Artwork, Collection, CommissionService, CommissionRequest } from '../../types/index.js';

interface StudioOverviewProps {
  creator: Creator;
  artworks: Artwork[];
  collections: Collection[];
  services: CommissionService[];
  commissions: CommissionRequest[];
  onNavigateTab: (tab: 'overview' | 'portfolio' | 'artworks' | 'collections' | 'commissions' | 'services' | 'ai-studio' | 'settings') => void;
  onOpenCreateArtwork: () => void;
  onViewPublicProfile: () => void;
}

export const StudioOverview: React.FC<StudioOverviewProps> = ({
  creator,
  artworks,
  collections,
  services,
  commissions,
  onNavigateTab,
  onOpenCreateArtwork,
  onViewPublicProfile,
}) => {
  const pendingCommissions = commissions.filter(c => c.status === 'RECEIVED' || c.status === 'IN_REVIEW');
  const activeServices = services.filter(s => s.active);

  // Calculate profile completion percentage
  let completedItems = 0;
  const totalItems = 6;
  if (creator.name) completedItems++;
  if (creator.bio && creator.bio.length > 20) completedItems++;
  if (creator.avatarUrl) completedItems++;
  if (creator.disciplines && creator.disciplines.length > 0) completedItems++;
  if (artworks.length > 0) completedItems++;
  if (collections.length > 0) completedItems++;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-10 max-w-7xl pb-16">
      {/* Welcome Hero Banner */}
      <div className="bg-white border border-neutral-200 p-8 rounded-xs shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-amber-50/50 to-transparent pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
              Studio Workspace Active
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-500 font-mono">atelier.app/@{creator.handle}</span>
          </div>
          <h2 className="font-editorial text-3xl font-normal text-neutral-900">
            Welcome back, {creator.name}.
          </h2>
          <p className="text-xs text-neutral-600 max-w-xl leading-relaxed">
            Your studio showcase is live. You have {artworks.length} works published across {collections.length} curated collections, with {pendingCommissions.length} pending commission inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            onClick={onOpenCreateArtwork}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Artwork</span>
          </button>
          
          <button
            onClick={onViewPublicProfile}
            className="px-4 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
          >
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Studio Identity / Route */}
        <div 
          onClick={onViewPublicProfile}
          className="bg-white border border-neutral-200 p-5 rounded-xs shadow-xs hover:border-neutral-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Public Address</span>
            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-neutral-900 truncate">@{creator.handle}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 truncate">atelier.app/@{creator.handle}</p>
        </div>

        {/* Artwork Count */}
        <div 
          onClick={() => onNavigateTab('artworks')}
          className="bg-white border border-neutral-200 p-5 rounded-xs shadow-xs hover:border-neutral-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Artworks Published</span>
            <Palette className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-neutral-900">{artworks.length}</span>
            <span className="text-neutral-500 text-[11px] font-mono">({collections.length} series)</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Managed in inventory</p>
        </div>

        {/* Active Services */}
        <div 
          onClick={() => onNavigateTab('services')}
          className="bg-white border border-neutral-200 p-5 rounded-xs shadow-xs hover:border-neutral-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Commission Services</span>
            <SlidersHorizontal className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-neutral-900">{activeServices.length}</span>
            <span className="text-neutral-500 text-[11px] font-mono">Active tiers</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Ready for client briefs</p>
        </div>

        {/* Pending Requests */}
        <div 
          onClick={() => onNavigateTab('commissions')}
          className="bg-white border border-neutral-200 p-5 rounded-xs shadow-xs hover:border-neutral-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Pending Requests</span>
            <Inbox className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-3xl font-bold text-amber-800">{pendingCommissions.length}</span>
            <span className="text-neutral-500 text-[11px] font-mono">Inquiries</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Requires review</p>
        </div>
      </div>

      {/* Profile Completion & Quick Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Completion Card */}
        <div className="bg-white border border-neutral-200 p-6 rounded-xs shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                Studio Setup Completion
              </h3>
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                {completionPercentage}%
              </span>
            </div>

            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mb-6">
              <div 
                className="bg-neutral-900 h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <ul className="space-y-2.5 text-xs text-neutral-700">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {creator.name ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-neutral-300" />}
                  Artist Name & Handle
                </span>
                <span className="font-mono text-[10px] text-neutral-400">Done</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {creator.bio && creator.bio.length > 20 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-neutral-300" />}
                  Biography & Statement
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{creator.bio ? 'Done' : 'Pending'}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {artworks.length > 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-neutral-300" />}
                  Published Artworks
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{artworks.length} items</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {collections.length > 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-neutral-300" />}
                  Series Collections
                </span>
                <span className="font-mono text-[10px] text-neutral-400">{collections.length} collections</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateTab('portfolio')}
            className="mt-6 w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Edit Profile & Identity</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Recent Pending Inquiries */}
        <div className="bg-white border border-neutral-200 p-6 rounded-xs shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                Recent Commission Inquiries ({pendingCommissions.length} Pending)
              </h3>
              <button
                onClick={() => onNavigateTab('commissions')}
                className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 font-medium"
              >
                <span>View all inbox</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingCommissions.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-neutral-300 stroke-[1]" />
                <p className="text-xs font-medium text-neutral-700">No pending commission requests</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">New collector inquiries will appear here instantly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCommissions.slice(0, 3).map(comm => (
                  <div 
                    key={comm.id}
                    onClick={() => onNavigateTab('commissions')}
                    className="p-3.5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-xs transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-editorial font-medium text-sm text-neutral-900">{comm.clientName}</span>
                        <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-xs">
                          ${comm.budget}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-1">{comm.brief}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-neutral-400 block">{new Date(comm.createdAt).toLocaleDateString()}</span>
                      <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                        {comm.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Direct Stripe / Escrow payouts enabled</span>
            <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs">Secure 0% commission fee tier</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">
          Studio Navigation & Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigateTab('artworks')}
            className="bg-white border border-neutral-200 p-5 rounded-xs hover:border-neutral-900 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xs bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
              <Palette className="w-4 h-4" />
            </div>
            <h4 className="font-editorial font-semibold text-base text-neutral-900 mb-1">Works & Inventory</h4>
            <p className="text-xs text-neutral-500">Create, edit, publish artworks, and toggle featured items.</p>
          </div>

          <div 
            onClick={() => onNavigateTab('collections')}
            className="bg-white border border-neutral-200 p-5 rounded-xs hover:border-neutral-900 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xs bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-editorial font-semibold text-base text-neutral-900 mb-1">Series Collections</h4>
            <p className="text-xs text-neutral-500">Curate series, reorder collections, and assign artworks.</p>
          </div>

          <div 
            onClick={() => onNavigateTab('ai-studio')}
            className="bg-white border border-neutral-200 p-5 rounded-xs hover:border-neutral-900 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xs bg-amber-50 flex items-center justify-center text-amber-700 mb-3 group-hover:bg-amber-700 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-editorial font-semibold text-base text-neutral-900 mb-1">AI Studio Assistant</h4>
            <p className="text-xs text-neutral-500">Generate museum monographs, exhibition titles, and curatorial notes.</p>
          </div>

          <div 
            onClick={() => onNavigateTab('settings')}
            className="bg-white border border-neutral-200 p-5 rounded-xs hover:border-neutral-900 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xs bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-editorial font-semibold text-base text-neutral-900 mb-1">Studio Settings</h4>
            <p className="text-xs text-neutral-500">Manage handle, custom domain, notifications, and security.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
