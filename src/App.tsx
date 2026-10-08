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
import { AuthProvider } from './context/AuthContext';

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

      const hash = window.location.hash;
      if (hash.startsWith('#/@')) {
        const clean = hash.replace('#/@', '');
        const parts = clean.split('/');
        const handle = parts[0];
        const sub1 = parts[1];
        const sub2 = parts[2];

        try {
          const matchedCreator = await api.getCreator(handle);
          if (matchedCreator) {
            setActiveCreator(matchedCreator);
            const [arts, cols, srvs, comms] = await Promise.all([
              api.getArtworks(matchedCreator.id),
              api.getCollections(matchedCreator.id),
              api.getServices(matchedCreator.id),
              api.getCommissions(matchedCreator.id),
            ]);
            setArtworks(arts);
            setCollections(cols);
            setServices(srvs);
            setCommissions(comms);
            setCurrentView('artist');

            if (sub1 === 'c' && sub2) {
              const matchedCol = cols.find(c => slugify(c.title) === sub2 || c.id === sub2);
              if (matchedCol) setSelectedCollectionId(matchedCol.id);
            } else if (sub1) {
              const matchedArt = arts.find(a => slugify(a.title) === sub1 || a.id === sub1);
              if (matchedArt) setInspectingArtwork(matchedArt);
            }

            setIsLoading(false);
            return;
          } else {
            setNotFoundHandle(handle);
            setCurrentView('404');
            setIsLoading(false);
            return;
          }
        } catch {
          setNotFoundHandle(handle);
          setCurrentView('404');
          setIsLoading(false);
          return;
        }
      }

      // Default to Maya Lin (@maya)
      const maya = creatorList.find(c => c.handle === 'maya') || creatorList[0];
      if (maya) {
        setActiveCreator(maya);
        await loadCreatorData(maya.id);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load creator-specific collections, artworks, services, commissions
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

  useEffect(() => {
    loadInitialData();

    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/dashboard')) {
        const sub = hash.replace('#/dashboard', '').replace(/^\//, '');
        setCurrentView('studio');
        if (sub === 'ai' || sub === 'ai-studio') {
          setStudioTab('ai-studio');
        } else if (sub === 'artworks' || sub === 'artwork') {
          setStudioTab('artworks');
        } else if (sub === 'collections') {
          setStudioTab('collections');
        } else if (sub === 'commissions' || sub === 'inbox') {
          setStudioTab('commissions');
        } else if (sub === 'services') {
          setStudioTab('services');
        } else if (sub === 'portfolio') {
          setStudioTab('portfolio');
        } else if (sub === 'settings') {
          setStudioTab('settings');
        } else {
          setStudioTab('overview');
        }
        return;
      }

      if (hash.startsWith('#/@')) {
        const clean = hash.replace('#/@', '');
        const parts = clean.split('/');
        const handle = parts[0];
        const sub1 = parts[1];
        const sub2 = parts[2];

        try {
          const creator = await api.getCreator(handle);
          if (creator) {
            setActiveCreator(creator);
            const [arts, cols, srvs, comms] = await Promise.all([
              api.getArtworks(creator.id),
              api.getCollections(creator.id),
              api.getServices(creator.id),
              api.getCommissions(creator.id),
            ]);
            setArtworks(arts);
            setCollections(cols);
            setServices(srvs);
            setCommissions(comms);
            setCurrentView('artist');

            if (sub1 === 'c' && sub2) {
              const matchedCol = cols.find(c => slugify(c.title) === sub2 || c.id === sub2);
              if (matchedCol) setSelectedCollectionId(matchedCol.id);
            } else if (sub1 === 'commissions') {
              // Stay on commissions section
            } else if (sub1) {
              const matchedArt = arts.find(a => slugify(a.title) === sub1 || a.id === sub1);
              if (matchedArt) setInspectingArtwork(matchedArt);
            }
          } else {
            setNotFoundHandle(handle);
            setCurrentView('404');
          }
        } catch {
          setNotFoundHandle(handle);
          setCurrentView('404');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Creator selection handler
  const handleSelectCreator = async (creator: Creator) => {
    setActiveCreator(creator);
    await loadCreatorData(creator.id);
  };

  // Navigation router
  const handleNavigate = (view: 'landing' | 'artist' | 'studio' | '404', handle?: string) => {
    if (handle && handle !== activeCreator?.handle) {
      const target = creators.find(c => c.handle === handle);
      if (target) handleSelectCreator(target);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCommissionModal = (service?: CommissionService, fromArtwork?: Artwork) => {
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

  const handleOpenStudioWithClaimedHandle = async (claimedHandle?: string) => {
    if (claimedHandle && activeCreator) {
      try {
        const updated = await api.updateCreator(activeCreator.id, { handle: claimedHandle });
        setActiveCreator(updated);
        const all = await api.getCreators();
        setCreators(all);
      } catch (err) {
        console.error(err);
      }
    }
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              setCurrentView('artist');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenStudio={handleOpenStudioWithClaimedHandle}
            onInspectArtwork={(art) => setInspectingArtwork(art)}
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

        {currentView === 'artist' && (
          <div>
            {/* Public Artist Profile (/@artistname) */}
            <ArtistHero
              creator={activeCreator}
              artworkCount={artworks.length}
              collectionCount={collections.length}
              onRequestCommission={() => handleOpenCommissionModal()}
              onScrollToGallery={() => {
                document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Artwork Gallery with Unboxed Metadata */}
            <ArtworkGrid
              artworks={artworks.filter(a => a.status !== 'draft')}
              collections={collections.filter(c => c.visibility === 'public')}
              onSelectArtwork={(art) => setInspectingArtwork(art)}
              initialCollectionId={selectedCollectionId}
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
        )}

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

            {(studioTab === 'commissions' || studioTab === 'inbox') && (
              <CommissionInbox
                commissions={commissions}
                onRefresh={refreshCreatorData}
              />
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

      {/* Global Minimalist Footer (Displayed on artist & studio views) */}
      {currentView !== 'landing' && <Footer />}

      {/* Fullscreen Artwork Lightbox */}
      <Lightbox
        artwork={inspectingArtwork}
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
        onComplete={async (newCreator) => {
          const all = await api.getCreators();
          setCreators(all);
          setActiveCreator(newCreator);
          await loadCreatorData(newCreator.id);
          setCurrentView('studio');
          setStudioTab('artworks');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AtelierAppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
