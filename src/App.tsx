import React, { useState, useEffect, useCallback } from 'react';
import { 
  Creator, 
  Artwork, 
  Collection, 
  CommissionService, 
  CommissionRequest, 
  NotificationItem 
} from './types/index.js';
import { api } from './services/api.js';

// Common Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Lightbox } from './components/common/Lightbox';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AmbientPlayer } from './components/common/AmbientPlayer';

// Public Components
import { LandingShowcase } from './components/public/LandingShowcase';
import { ArtistHero } from './components/public/ArtistHero';
import { ArtworkGrid } from './components/public/ArtworkGrid';
import { ServiceCards } from './components/public/ServiceCards';
import { CommissionModal } from './components/public/CommissionModal';
import { OnboardingModal } from './components/public/OnboardingModal';

// Studio Components
import { StudioLayout, StudioTabType } from './components/studio/StudioLayout';
import { StudioOverview } from './components/studio/StudioOverview';
import { ArtworkManager } from './components/studio/ArtworkManager';
import { ArtworkModal } from './components/studio/ArtworkModal';
import { CollectionManager } from './components/studio/CollectionManager';
import { ServiceManager } from './components/studio/ServiceManager';
import { CommissionInbox } from './components/studio/CommissionInbox';
import { ProfileEditor } from './components/studio/ProfileEditor';
import { AIStudioTab } from './components/studio/AIStudioTab';
import { SettingsTab } from './components/studio/SettingsTab';

// Infrastructure & Foundation
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingState } from './components/common/LoadingState';

function AtelierAppContent() {
  // Navigation & Personas — Defaulting to 'landing' for first impression!
  const [currentView, setCurrentView] = useState<'landing' | 'artist' | 'studio' | '404'>('landing');
  const [studioTab, setStudioTab] = useState<StudioTabType>('overview');
  const [notFoundHandle, setNotFoundHandle] = useState<string>('');
  
  // Data State
  const [creators, setCreators] = useState<Creator[]>([]);
  const [activeCreator, setActiveCreator] = useState<Creator | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [services, setServices] = useState<CommissionService[]>([]);
  const [commissions, setCommissions] = useState<CommissionRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  
  // Modals & Drawers
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<CommissionService | null>(null);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [aiArtworkDraft, setAiArtworkDraft] = useState<{
    title?: string;
    description?: string;
    medium?: string;
    tags?: string[];
    image?: string;
  } | null>(null);
  const [inspectingArtwork, setInspectingArtwork] = useState<Artwork | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);

  // Slugify helper
  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const parseCurrentUrl = () => {
    const pathname = window.location.pathname || '';
    const hash = window.location.hash || '';

    if (pathname.startsWith('/@')) {
      const clean = pathname.replace(/^\/@/, '');
      const parts = clean.split('/').filter(Boolean);
      return {
        type: 'artist' as const,
        handle: parts[0]?.toLowerCase(),
        sub1: parts[1]?.toLowerCase(),
        sub2: parts[2]?.toLowerCase(),
      };
    }

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/studio')) {
      const sub = pathname.replace(/^\/(dashboard|studio)/, '').replace(/^\//, '').toLowerCase();
      return {
        type: 'studio' as const,
        tab: sub,
      };
    }

    if (hash.startsWith('#/@')) {
      const clean = hash.replace(/^#\/@/, '');
      const parts = clean.split('/').filter(Boolean);
      return {
        type: 'artist' as const,
        handle: parts[0]?.toLowerCase(),
        sub1: parts[1]?.toLowerCase(),
        sub2: parts[2]?.toLowerCase(),
      };
    }

    if (hash.startsWith('#/dashboard') || hash.startsWith('#/studio')) {
      const sub = hash.replace(/^#\/(dashboard|studio)/, '').replace(/^\//, '').toLowerCase();
      return {
        type: 'studio' as const,
        tab: sub,
      };
    }

    return { type: 'landing' as const };
  };

  const applyStudioTab = (subTab?: string) => {
    if (subTab === 'ai' || subTab === 'ai-studio') {
      setStudioTab('ai-studio');
    } else if (subTab === 'artworks' || subTab === 'artwork') {
      setStudioTab('artworks');
    } else if (subTab === 'collections') {
      setStudioTab('collections');
    } else if (subTab === 'commissions' || subTab === 'inbox') {
      setStudioTab('commissions');
    } else if (subTab === 'services') {
      setStudioTab('services');
    } else if (subTab === 'portfolio') {
      setStudioTab('portfolio');
    } else if (subTab === 'settings') {
      setStudioTab('settings');
    } else {
      setStudioTab('overview');
    }
  };

  // Load public portfolio data for an artist (safe for patrons/visitors)
  const loadPublicArtistData = async (creator: Creator, sub1?: string, sub2?: string) => {
    try {
      setActiveCreator(creator);
      const [arts, cols, srvs] = await Promise.all([
        api.getArtworks(creator.id, undefined, true),
        api.getCollections(creator.id, true),
        api.getServices(creator.id),
      ]);
      setArtworks(arts);
      setCollections(cols);
      setServices(srvs);
      setCurrentView('artist');

      if (sub1 === 'commissions' || sub1 === 'services') {
        setTimeout(() => {
          const el = document.getElementById('services-section') || document.getElementById('commissions-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      } else if (sub1 === 'c' && sub2) {
        const matchedCol = cols.find(c => slugify(c.title) === sub2 || c.id === sub2);
        if (matchedCol) setSelectedCollectionId(matchedCol.id);
      } else if (sub1) {
        const matchedArt = arts.find(a => slugify(a.title) === sub1 || a.id === sub1);
        if (matchedArt) setInspectingArtwork(matchedArt);
      }
    } catch (err) {
      console.error('Failed to load public artist data:', err);
    }
  };

  // Load creator-specific private dashboard collections, artworks, services, commissions
  const loadCreatorData = async (creatorId: string) => {
    try {
      api.setAuthCreatorId(creatorId);
      const [arts, cols, srvs, comms] = await Promise.all([
        api.getArtworks(creatorId),
        api.getCollections(creatorId),
        api.getServices(creatorId),
        api.getCommissions(creatorId),
      ]);
      setArtworks(arts);
      setCollections(cols);
      setServices(srvs);
      setCommissions(comms);
    } catch (err) {
      console.error('Failed to load creator data:', err);
    }
  };

  const refreshCreatorData = useCallback(async () => {
    if (!activeCreator) return;
    await loadCreatorData(activeCreator.id);
    const notifs = await api.getNotifications();
    setNotifications(notifs);
  }, [activeCreator]);

  // Load all creators and notifications on mount and check URL handle & subroutes
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [creatorList, notifs, fullArtworks] = await Promise.all([
        api.getCreators(),
        api.getNotifications(),
        api.getArtworks(),
      ]);

      setCreators(creatorList);
      setNotifications(notifs);
      setAllArtworks(fullArtworks);

      const route = parseCurrentUrl();

      if (route.type === 'artist' && route.handle) {
        try {
          const matchedCreator = await api.getCreator(route.handle);
          if (matchedCreator) {
            await loadPublicArtistData(matchedCreator, route.sub1, route.sub2);
            setIsLoading(false);
            return;
          } else {
            setNotFoundHandle(route.handle);
            setCurrentView('404');
            setIsLoading(false);
            return;
          }
        } catch {
          setNotFoundHandle(route.handle);
          setCurrentView('404');
          setIsLoading(false);
          return;
        }
      }

      if (route.type === 'studio') {
        const maya = creatorList.find(c => c.handle === 'maya') || creatorList[0];
        if (maya) {
          setActiveCreator(maya);
          await loadCreatorData(maya.id);
        }
        setCurrentView('studio');
        applyStudioTab(route.tab);
        setIsLoading(false);
        return;
      }

      // Default landing page
      const maya = creatorList.find(c => c.handle === 'maya') || creatorList[0];
      if (maya) {
        setActiveCreator(maya);
        await loadCreatorData(maya.id);
      }
      setCurrentView('landing');
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    const handleLocationChange = async () => {
      const route = parseCurrentUrl();
      if (route.type === 'artist' && route.handle) {
        try {
          const creator = await api.getCreator(route.handle);
          if (creator) {
            await loadPublicArtistData(creator, route.sub1, route.sub2);
          } else {
            setNotFoundHandle(route.handle);
            setCurrentView('404');
          }
        } catch {
          setNotFoundHandle(route.handle);
          setCurrentView('404');
        }
      } else if (route.type === 'studio') {
        setCurrentView('studio');
        applyStudioTab(route.tab);
      } else if (route.type === 'landing') {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Creator selection handler
  const handleSelectCreator = async (creator: Creator) => {
    setActiveCreator(creator);
    await loadCreatorData(creator.id);
  };

  // Navigation router
  const handleNavigate = (view: 'landing' | 'artist' | 'studio' | '404', handle?: string) => {
    if (view === 'artist') {
      const targetHandle = handle || activeCreator?.handle || 'maya';
      const target = creators.find(c => c.handle.toLowerCase() === targetHandle.toLowerCase());
      if (target) {
        loadPublicArtistData(target);
      }
      window.history.pushState(null, '', `/@${targetHandle}`);
      setCurrentView('artist');
    } else if (view === 'studio') {
      window.history.pushState(null, '', '/dashboard');
      setCurrentView('studio');
    } else if (view === 'landing') {
      window.history.pushState(null, '', '/');
      setCurrentView('landing');
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCommissionModal = (service?: CommissionService, _fromArtwork?: Artwork) => {
    setPreselectedService(service || null);
    setIsCommissionModalOpen(true);
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const [prefilledOnboardingHandle, setPrefilledOnboardingHandle] = useState<string>('');

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (isLoading || !activeCreator) {
    return <LoadingState type="full" message="Loading ATELIER Platform..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 selection:bg-neutral-200">
      {/* 3-Zone Editorial Top Bar & Demo Persona Controller */}
      <Header
        currentView={currentView}
        currentHandle={activeCreator.handle}
        activeCreator={activeCreator}
        allCreators={creators}
        onNavigate={handleNavigate}
        onSelectCreator={(c) => {
          handleSelectCreator(c);
          if (currentView === 'landing') setCurrentView('artist');
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenSignIn={() => {
          if (currentView !== 'landing') setCurrentView('landing');
          setTimeout(() => {
            document.getElementById('claim-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingShowcase
            creators={creators}
            featuredArtworks={allArtworks}
            onSelectCreator={(c) => {
              handleSelectCreator(c);
              handleNavigate('artist', c.handle);
            }}
            onOpenStudio={() => {
              handleNavigate('studio');
            }}
            onInspectArtwork={(art) => setInspectingArtwork(art)}
            onClaimHandle={(claimedHandle) => {
              setPrefilledOnboardingHandle(claimedHandle);
              setIsOnboardingOpen(true);
            }}
            onOpenOnboarding={() => {
              setPrefilledOnboardingHandle('');
              setIsOnboardingOpen(true);
            }}
          />
        )}

        {currentView === '404' && (
          <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center bg-[#FAF9F6]">
            <div className="max-w-md space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 bg-neutral-200/60 px-3 py-1 rounded-xs">
                404 · Atelier Not Found
              </span>
              <h1 className="font-editorial text-4xl md:text-5xl text-neutral-900">
                Artist profile @{notFoundHandle || 'unknown'} does not exist.
              </h1>
              <p className="text-sm text-neutral-600 font-light leading-relaxed">
                The studio handle you requested is inactive, archived, or has not been claimed on ATELIER.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    window.location.hash = '';
                    setCurrentView('landing');
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors"
                >
                  Explore Featured Artists
                </button>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-neutral-300 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs hover:bg-neutral-50 transition-colors"
                >
                  Create Your Portfolio
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'artist' && (() => {
          const palette = activeCreator.themeSettings?.palette || 'obsidian';
          const typography = activeCreator.themeSettings?.typography || 'editorial';
          const gridStyle = activeCreator.themeSettings?.gridStyle || 'bento';

          const paletteClass = palette === 'obsidian'
            ? 'bg-[#0A0A0A] text-neutral-100'
            : palette === 'warm_paper'
            ? 'bg-[#FAF9F6] text-neutral-900'
            : palette === 'brutalism'
            ? 'bg-[#18181B] text-amber-50'
            : 'bg-[#FFFFFF] text-neutral-950';

          const typographyClass = typography === 'sans'
            ? 'font-sans'
            : typography === 'classic'
            ? 'font-mono'
            : 'font-editorial';

          return (
            <div className={`min-h-screen ${paletteClass} ${typographyClass} transition-colors duration-500`}>
              {/* Public Artist Profile (/@artistname) */}
              <ArtistHero
                creator={activeCreator}
                artworkCount={artworks.length}
                collectionCount={collections.length}
                onRequestCommission={() => handleOpenCommissionModal()}
                onScrollToGallery={() => {
                  document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                heroStyle={activeCreator.themeSettings?.heroStyle}
              />

              {/* Ambient Soundscape Player */}
              <AmbientPlayer
                soundscape={activeCreator.themeSettings?.ambientSoundscape}
                creatorName={activeCreator.name}
              />

              {/* Artwork Gallery with Unboxed Metadata */}
              <ArtworkGrid
                artworks={artworks.filter(a => a.status !== 'draft')}
                collections={collections.filter(c => c.visibility === 'public')}
                onSelectArtwork={(art) => setInspectingArtwork(art)}
                initialCollectionId={selectedCollectionId}
                gridStyle={gridStyle}
                watermarkEnabled={activeCreator.themeSettings?.watermarkEnabled}
                creatorName={activeCreator.name}
              />

              {/* Commission Service Tiers */}
              <ServiceCards
                services={services}
                creatorName={activeCreator.name}
                onSelectService={(srv) => handleOpenCommissionModal(srv)}
                onRequestCommissionGeneral={() => handleOpenCommissionModal()}
              />

            {/* Public Artist Page Footer */}
            <footer className="bg-[#1C1B19] text-neutral-400 py-16 border-t border-neutral-800">
              <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-xs">
                <div className="space-y-1 text-center md:text-left">
                  <div className="font-editorial text-xl font-normal text-white">
                    {activeCreator.name}
                  </div>
                  <p className="text-neutral-500 font-light">
                    © {new Date().getFullYear()} {activeCreator.name}. All visual works protected by international copyright.
                  </p>
                </div>

                <div className="flex items-center gap-6 text-neutral-400">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Back to Top ↑
                  </button>
                  <span className="text-neutral-700">·</span>
                  <button
                    onClick={() => setCurrentView('landing')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    ATELIER Discovery
                  </button>
                  <span className="text-neutral-700">·</span>
                  <button
                    onClick={() => {
                      setCurrentView('studio');
                      setStudioTab('overview');
                    }}
                    className="hover:text-amber-400 text-amber-500/90 font-mono transition-colors cursor-pointer"
                  >
                    Studio Backstage
                  </button>
                </div>
              </div>
            </footer>
          </div>
        );
      })()}

        {currentView === 'studio' && (
          <StudioLayout
            creator={activeCreator}
            activeTab={studioTab}
            onTabChange={setStudioTab}
            onViewPublicProfile={() => setCurrentView('artist')}
            commissions={commissions}
          >
            {studioTab === 'overview' && (
              <StudioOverview
                creator={activeCreator}
                artworks={artworks}
                collections={collections}
                services={services}
                commissions={commissions}
                onNavigateTab={setStudioTab}
                onOpenCreateArtwork={() => {
                  setEditingArtwork(null);
                  setIsArtworkModalOpen(true);
                }}
                onViewPublicProfile={() => setCurrentView('artist')}
              />
            )}

            {studioTab === 'portfolio' && (
              <ProfileEditor
                creator={activeCreator}
                onRefresh={async () => {
                  const updated = await api.getCreator(activeCreator.handle);
                  setActiveCreator(updated);
                  const allC = await api.getCreators();
                  setCreators(allC);
                }}
              />
            )}

            {studioTab === 'artworks' && (
              <ArtworkManager
                artworks={artworks}
                collections={collections}
                onOpenCreateModal={() => {
                  setEditingArtwork(null);
                  setIsArtworkModalOpen(true);
                }}
                onEditArtwork={(art: Artwork) => {
                  setEditingArtwork(art);
                  setIsArtworkModalOpen(true);
                }}
                onRefresh={refreshCreatorData}
                onPreviewArtwork={(art: Artwork) => setInspectingArtwork(art)}
              />
            )}

            {studioTab === 'collections' && (
              <CollectionManager
                creatorId={activeCreator.id}
                collections={collections}
                onRefresh={refreshCreatorData}
              />
            )}

            {(studioTab === 'commissions' || studioTab === 'inbox' || studioTab === 'orders') && (
              <CommissionInbox
                commissions={studioTab === 'orders' ? commissions.filter(c => ['ACCEPTED', 'IN_PROGRESS', 'DELIVERED'].includes(c.status)) : commissions}
                onRefresh={refreshCreatorData}
              />
            )}

            {studioTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white border border-neutral-200 p-8 rounded-xs shadow-xs">
                  <h3 className="font-editorial text-2xl font-normal text-neutral-900 mb-2">Studio Analytics & Performance</h3>
                  <p className="text-xs text-neutral-600 mb-6">Real-time engagement metrics for your public portfolio and commission services.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-xs">
                      <p className="text-xs font-mono text-neutral-500 uppercase">Portfolio Views</p>
                      <p className="font-editorial text-3xl font-bold text-neutral-900 mt-2">1,284</p>
                      <p className="text-[11px] text-emerald-700 mt-1">↑ 24% vs last month</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-xs">
                      <p className="text-xs font-mono text-neutral-500 uppercase">Artwork Impressions</p>
                      <p className="font-editorial text-3xl font-bold text-neutral-900 mt-2">856</p>
                      <p className="text-[11px] text-emerald-700 mt-1">↑ 18% vs last month</p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-xs">
                      <p className="text-xs font-mono text-neutral-500 uppercase">Commission Inquiries</p>
                      <p className="font-editorial text-3xl font-bold text-neutral-900 mt-2">{commissions.length}</p>
                      <p className="text-[11px] text-emerald-700 mt-1">↑ 36% vs last month</p>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 pt-6">
                    <h4 className="font-medium text-sm text-neutral-900 mb-4">Top Performing Artworks</h4>
                    <div className="space-y-3">
                      {artworks.slice(0, 3).map((art, idx) => (
                        <div key={art.id} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xs text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-neutral-400 font-bold">#{idx + 1}</span>
                            <img src={art.images[0]} alt={art.title} className="w-10 h-10 object-cover rounded-xs border" />
                            <div>
                              <p className="font-medium text-neutral-900">{art.title}</p>
                              <p className="text-[11px] text-neutral-500">{art.medium} · {art.year}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-neutral-900">{Math.floor(200 + Math.random() * 400)} views</p>
                            <p className="text-[10px] text-emerald-700">Active engagement</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {studioTab === 'services' && (
              <ServiceManager
                creatorId={activeCreator.id}
                services={services}
                onRefresh={refreshCreatorData}
              />
            )}

            {studioTab === 'ai-studio' && (
              <AIStudioTab
                creator={activeCreator}
                artworks={artworks}
                onNavigateTab={setStudioTab}
                onRefreshCreator={refreshCreatorData}
                onOpenCreateArtworkWithData={(draft) => {
                  setEditingArtwork(null);
                  setAiArtworkDraft(draft);
                  setIsArtworkModalOpen(true);
                }}
              />
            )}

            {studioTab === 'settings' && (
              <SettingsTab
                creator={activeCreator}
                onRefresh={async () => {
                  const updated = await api.getCreator(activeCreator.handle);
                  setActiveCreator(updated);
                  const allC = await api.getCreators();
                  setCreators(allC);
                }}
              />
            )}
          </StudioLayout>
        )}
      </div>

      {/* Global Minimalist Footer (Suppressed on artist public view which already renders its intentional bespoke footer, and on landing which renders its showcase footer) */}
      {currentView !== 'landing' && currentView !== 'artist' && (
        <Footer
          onNavigateTab={(tab) => {
            setCurrentView('studio');
            setStudioTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateLanding={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Fullscreen Artwork Lightbox */}
      <Lightbox
        artwork={inspectingArtwork}
        artworks={artworks}
        onNavigate={setInspectingArtwork}
        onClose={() => setInspectingArtwork(null)}
        onRequestCommission={(art) => {
          setInspectingArtwork(null);
          handleOpenCommissionModal(undefined, art);
        }}
      />

      {/* Structured Commission Intake Modal */}
      <CommissionModal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        creator={activeCreator}
        services={services}
        preselectedService={preselectedService}
        onSuccess={async () => {
          await refreshCreatorData();
        }}
      />

      {/* Artwork Create / Edit Modal (With AI Metadata Assistant) */}
      <ArtworkModal
        isOpen={isArtworkModalOpen}
        onClose={() => {
          setIsArtworkModalOpen(false);
          setAiArtworkDraft(null);
        }}
        creatorId={activeCreator.id}
        collections={collections}
        artworkToEdit={editingArtwork}
        initialDraft={aiArtworkDraft}
        onSuccess={refreshCreatorData}
      />

      {/* Notification / Simulated Email Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onViewCommission={() => {
          setCurrentView('studio');
          setStudioTab('inbox');
        }}
      />

      {/* Onboarding Flow Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        existingCreators={creators}
        initialHandle={prefilledOnboardingHandle}
        onComplete={async (newCreator) => {
          setIsOnboardingOpen(false);
          const all = await api.getCreators();
          setCreators(all);
          setActiveCreator(newCreator);
          api.setAuthCreatorId(newCreator.id);
          await loadCreatorData(newCreator.id);
          setCurrentView('studio');
          setStudioTab('artworks');
          window.history.pushState(null, '', '/dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AtelierAppContent />
    </ErrorBoundary>
  );
}
