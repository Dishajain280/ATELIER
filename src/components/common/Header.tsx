import React from 'react';
import { Sparkles, Palette, ArrowUpRight, Bell } from 'lucide-react';
import { Creator, NotificationItem } from '../../types/index.js';

interface HeaderProps {
  currentView: 'landing' | 'artist' | 'studio' | '404';
  currentHandle: string;
  activeCreator: Creator;
  allCreators: Creator[];
  onNavigate: (view: 'landing' | 'artist' | 'studio' | '404', handle?: string) => void;
  onSelectCreator: (creator: Creator) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onScrollToSection?: (sectionId: string) => void;
  onOpenSignIn?: () => void;
  onOpenOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentHandle,
  activeCreator,
  allCreators,
  onNavigate,
  onSelectCreator,
  unreadNotificationsCount,
  onOpenNotifications,
  onScrollToSection,
  onOpenSignIn,
  onOpenOnboarding,
}) => {
  const scrollToSection = (id: string) => {
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top Demo Context Bar for Hackathon presentation */}
      <div className="bg-[#1C1B19] text-neutral-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-neutral-400">Demo Persona:</span>
          <select
            value={activeCreator.handle}
            onChange={(e) => {
              const selected = allCreators.find(c => c.handle === e.target.value);
              if (selected) onSelectCreator(selected);
            }}
            className="bg-neutral-800 text-neutral-100 text-xs rounded px-2 py-0.5 border border-neutral-700 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {allCreators.map((c) => (
              <option key={c.handle} value={c.handle}>
                @{c.handle} — {c.name} ({c.disciplines[0]})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">View Mode:</span>
            <button
              onClick={() => onNavigate('landing')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                currentView === 'landing' 
                  ? 'bg-amber-600/90 text-white font-medium' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Landing
            </button>
            <span className="text-neutral-600">·</span>
            <button
              onClick={() => onNavigate('artist', activeCreator.handle)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                currentView === 'artist' 
                  ? 'bg-amber-600/90 text-white font-medium' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Public Portfolio (/@{activeCreator.handle})
            </button>
            <span className="text-neutral-600">·</span>
            <button
              onClick={() => onNavigate('studio')}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                currentView === 'studio' 
                  ? 'bg-amber-600/90 text-white font-medium' 
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Studio Dashboard
            </button>
          </div>

          <button
            onClick={onOpenNotifications}
            className="relative flex items-center gap-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Activity & simulated email dispatches"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Activity</span>
            {unreadNotificationsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>
        </div>
      </div>

      {/* Primary Top Bar: Unified Single Header Contract */}
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="font-editorial text-2xl font-bold tracking-tight text-neutral-950 hover:opacity-85 transition-opacity flex items-center gap-2 cursor-pointer"
          >
            <span>ATELIER</span>
            <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-neutral-400 border border-neutral-300/80 px-1.5 py-0.5 rounded-xs">
              STUDIO
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (All core pages & sections accessible at all times) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`hover:text-neutral-950 transition-colors cursor-pointer ${currentView === 'landing' ? 'text-neutral-950 font-semibold' : ''}`}
          >
            Discovery
          </button>
          <button
            onClick={() => scrollToSection('showcase-section')}
            className="hover:text-neutral-950 transition-colors cursor-pointer"
          >
            Explore
          </button>
          <button
            onClick={() => scrollToSection('features-section')}
            className="hover:text-neutral-950 transition-colors cursor-pointer"
          >
            For Artists
          </button>
          <button
            onClick={() => scrollToSection('ai-section')}
            className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-1 text-amber-800"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>AI Studio</span>
          </button>
          <button
            onClick={() => onNavigate('artist', activeCreator.handle)}
            className={`hover:text-neutral-950 transition-colors cursor-pointer ${currentView === 'artist' ? 'text-neutral-950 font-semibold' : ''}`}
          >
            Portfolio (/@{activeCreator.handle})
          </button>
          <button
            onClick={() => onNavigate('studio')}
            className={`hover:text-neutral-950 transition-colors cursor-pointer ${currentView === 'studio' ? 'text-neutral-950 font-semibold' : ''}`}
          >
            Studio Dashboard
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {currentView === 'landing' ? (
            <>
              <button
                onClick={onOpenOnboarding || onOpenSignIn}
                className="px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenOnboarding || (() => scrollToSection('claim-section'))}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer"
              >
                Create Your Portfolio
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate(currentView === 'artist' ? 'studio' : 'artist', activeCreator.handle)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xs transition-colors cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{currentView === 'artist' ? 'Studio Backstage' : 'View Public Link'}</span>
              </button>
              <button
                onClick={onOpenOnboarding || (() => scrollToSection('claim-section'))}
                className="hidden sm:inline-flex px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer"
              >
                Claim Handle
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
