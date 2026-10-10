import React, { useState } from 'react';
import { Sparkles, Palette, Bell, Menu, X, ChevronRight, User, Compass, Layers, ExternalLink } from 'lucide-react';
import { Creator } from '../../types/index.js';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMobileNav = (view: 'landing' | 'artist' | 'studio' | '404', handle?: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(view, handle);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top Demo Context Bar for Hackathon Presentation — Fully responsive down to 320px */}
      <div className="bg-[#1C1B19] text-neutral-300 text-xs px-3 sm:px-4 py-1.5 border-b border-neutral-800">
        {/* Desktop / Tablet Bar (sm and up) */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="text-neutral-400 shrink-0">Demo Persona:</span>
            <select
              value={activeCreator.handle}
              onChange={(e) => {
                const selected = allCreators.find(c => c.handle === e.target.value);
                if (selected) onSelectCreator(selected);
              }}
              className="bg-neutral-800 text-neutral-100 text-xs rounded px-2 py-0.5 border border-neutral-700 focus:outline-none focus:border-amber-500 cursor-pointer truncate max-w-[240px]"
            >
              {allCreators.map((c) => (
                <option key={c.handle} value={c.handle}>
                  @{c.handle} — {c.name} ({c.disciplines[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400">View Mode:</span>
              <button
                onClick={() => onNavigate('landing')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
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
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  currentView === 'artist' 
                    ? 'bg-amber-600/90 text-white font-medium' 
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Portfolio (/@{activeCreator.handle})
              </button>
              <span className="text-neutral-600">·</span>
              <button
                onClick={() => onNavigate('studio')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  currentView === 'studio' 
                    ? 'bg-amber-600/90 text-white font-medium' 
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Studio
              </button>
            </div>

            <button
              onClick={onOpenNotifications}
              className="relative flex items-center gap-1 text-neutral-300 hover:text-white transition-colors cursor-pointer pl-1"
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

        {/* Mobile Compact Context Bar (under 640px: fits 320px, 375px, 390px, 430px perfectly without overflow) */}
        <div className="sm:hidden flex items-center justify-between gap-1.5 w-full">
          {/* Persona selector */}
          <div className="flex items-center gap-1.5 min-w-0 max-w-[55%]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <select
              value={activeCreator.handle}
              onChange={(e) => {
                const selected = allCreators.find(c => c.handle === e.target.value);
                if (selected) onSelectCreator(selected);
              }}
              className="bg-neutral-800 text-neutral-100 text-[11px] rounded px-1.5 py-0.5 border border-neutral-700 focus:outline-none focus:border-amber-500 cursor-pointer truncate w-full"
              aria-label="Demo Artist Persona"
            >
              {allCreators.map((c) => (
                <option key={c.handle} value={c.handle}>
                  @{c.handle} ({c.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Compact View Switcher & Notification Bell */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={currentView === 'artist' ? 'artist' : currentView === 'studio' ? 'studio' : 'landing'}
              onChange={(e) => {
                const val = e.target.value as 'landing' | 'artist' | 'studio';
                if (val === 'artist') {
                  onNavigate('artist', activeCreator.handle);
                } else {
                  onNavigate(val);
                }
              }}
              className="bg-neutral-800 text-amber-400 font-mono text-[11px] rounded px-1.5 py-0.5 border border-neutral-700 focus:outline-none cursor-pointer"
              aria-label="View Mode Switcher"
            >
              <option value="landing">Discovery</option>
              <option value="artist">Portfolio</option>
              <option value="studio">Studio</option>
            </select>

            <button
              onClick={onOpenNotifications}
              className="relative p-1 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Activity"
              aria-label="Activity notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-neutral-900"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleMobileNav('landing')}
            className="font-editorial text-2xl font-bold tracking-tight text-neutral-950 hover:opacity-85 transition-opacity flex items-center gap-2 cursor-pointer"
          >
            <span>ATELIER</span>
            <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-neutral-400 border border-neutral-300/80 px-1.5 py-0.5 rounded-xs">
              STUDIO
            </span>
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links (Accessible on large screens) */}
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

        {/* Zone 3: Primary Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentView === 'landing' ? (
            <>
              <button
                onClick={onOpenOnboarding || onOpenSignIn}
                className="hidden sm:inline-block px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenOnboarding || (() => scrollToSection('claim-section'))}
                className="px-3 sm:px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer"
              >
                <span className="hidden sm:inline">Create Your Portfolio</span>
                <span className="sm:hidden">Get Started</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate(currentView === 'artist' ? 'studio' : 'artist', activeCreator.handle)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xs transition-colors cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{currentView === 'artist' ? 'Studio Backstage' : 'Public Profile'}</span>
              </button>
              <button
                onClick={onOpenOnboarding || (() => scrollToSection('claim-section'))}
                className="hidden md:inline-flex px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs cursor-pointer"
              >
                Claim Handle
              </button>
            </div>
          )}

          {/* Hamburger Mobile Menu Toggle Button (Visible on screens < lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-700 hover:text-neutral-950 rounded-xs hover:bg-neutral-100 transition-colors cursor-pointer focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out / Dropdown Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F6] border-b border-neutral-300 shadow-xl transition-all animate-fadeIn">
          <div className="max-w-7xl mx-auto px-5 py-4 space-y-4">
            {/* Quick Navigation Links */}
            <div className="space-y-1 text-sm font-medium text-neutral-800">
              <button
                onClick={() => handleMobileNav('landing')}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xs text-left cursor-pointer ${
                  currentView === 'landing' ? 'bg-neutral-200/60 font-semibold text-neutral-950' : 'hover:bg-neutral-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-neutral-500" />
                  <span>Discovery & Directory</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => scrollToSection('showcase-section')}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xs text-left hover:bg-neutral-100 cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-neutral-500" />
                  <span>Featured Artworks</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => scrollToSection('features-section')}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xs text-left hover:bg-neutral-100 cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-neutral-500" />
                  <span>Platform for Artists</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => scrollToSection('ai-section')}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xs text-left hover:bg-amber-50 text-amber-900 cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Gemini AI Studio Suite</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <div className="pt-2 border-t border-neutral-200/80 my-2"></div>

              <button
                onClick={() => handleMobileNav('artist', activeCreator.handle)}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xs text-left cursor-pointer ${
                  currentView === 'artist' ? 'bg-neutral-200/60 font-semibold text-neutral-950' : 'hover:bg-neutral-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-neutral-500" />
                  <span>Public Portfolio (/@{activeCreator.handle})</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => handleMobileNav('studio')}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xs text-left cursor-pointer ${
                  currentView === 'studio' ? 'bg-neutral-200/60 font-semibold text-neutral-950' : 'hover:bg-neutral-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-neutral-500" />
                  <span>Studio Backstage Dashboard</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>

            {/* Mobile Actions / Switch Persona */}
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-500 font-mono">Current Artist:</span>
                <span className="text-xs font-semibold text-neutral-900 font-mono">@{activeCreator.handle}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {onOpenOnboarding && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenOnboarding();
                    }}
                    className="flex-1 py-2 text-center bg-neutral-950 text-white text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer hover:bg-neutral-800 transition-colors"
                  >
                    Claim New Handle
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenSignIn) onOpenSignIn();
                  }}
                  className="px-3 py-2 border border-neutral-300 text-xs font-medium text-neutral-700 hover:text-neutral-950 rounded-xs cursor-pointer"
                >
                  Switch Persona
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
