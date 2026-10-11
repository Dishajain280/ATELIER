import type { 
  Creator, 
  Collection, 
  Artwork, 
  CommissionService, 
  CommissionRequest, 
  NotificationItem,
  CommissionStatus 
} from '../../types/index.ts';
import { 
  SEED_CREATORS, 
  SEED_COLLECTIONS, 
  SEED_ARTWORKS, 
  SEED_COMMISSION_SERVICES, 
  SEED_COMMISSION_REQUESTS 
} from './seed.ts';

class StorageEngine {
  private creators: Map<string, Creator> = new Map();
  private collections: Map<string, Collection> = new Map();
  private artworks: Map<string, Artwork> = new Map();
  private services: Map<string, CommissionService> = new Map();
  private commissions: Map<string, CommissionRequest> = new Map();
  private notifications: NotificationItem[] = [];

  constructor() {
    this.resetSeed();
  }

  public resetSeed() {
    this.creators.clear();
    this.collections.clear();
    this.artworks.clear();
    this.services.clear();
    this.commissions.clear();
    this.notifications = [];
    SEED_CREATORS.forEach(c => this.creators.set(c.id, { ...c }));
    SEED_COLLECTIONS.forEach(col => this.collections.set(col.id, { ...col }));
    SEED_ARTWORKS.forEach(a => this.artworks.set(a.id, { ...a }));
    SEED_COMMISSION_SERVICES.forEach(s => this.services.set(s.id, { ...s }));
    SEED_COMMISSION_REQUESTS.forEach(r => this.commissions.set(r.id, { ...r }));

    // Initial system notification
    this.notifications.push({
      id: 'notif_init',
      type: 'system',
      title: 'Welcome to ATELIER Studio',
      message: 'Your studio space is initialized. Manage works, collections, and commission requests in one place.',
      recipientEmail: 'maya@atelier.app',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  // --- Creators ---
  getCreators(): Creator[] {
    return Array.from(this.creators.values());
  }

  getCreatorByHandle(handle: string): Creator | undefined {
    const cleanHandle = handle.replace(/^@/, '').toLowerCase();
    if (cleanHandle === 'demoartist' || cleanHandle === 'maya.paints') {
      return Array.from(this.creators.values()).find(c => c.handle === 'maya') || Array.from(this.creators.values())[0];
    }
    return Array.from(this.creators.values()).find(
      c => c.handle.toLowerCase() === cleanHandle
    );
  }

  getCreatorById(id: string): Creator | undefined {
    return this.creators.get(id);
  }

  updateCreator(id: string, updates: Partial<Creator>): Creator {
    const existing = this.creators.get(id);
    if (!existing) throw new Error(`Creator ${id} not found`);
    const updated: Creator = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.creators.set(id, updated);
    return updated;
  }

  createCreator(data: {
    name: string;
    handle: string;
    bio: string;
    avatarUrl: string;
    socialLinks?: { instagram?: string; twitter?: string; website?: string };
    themeSettings?: { 
      accentColor?: string; 
      typography?: 'editorial' | 'sans' | 'classic'; 
      gridStyle?: 'editorial' | 'bento' | 'masonry' | 'minimal'; 
      palette?: 'obsidian' | 'warm_paper' | 'brutalism' | 'ivory';
      watermarkEnabled?: boolean;
      ambientSoundscape?: 'none' | 'vinyl' | 'rain' | 'waves' | 'studio';
      heroStyle?: 'immersive' | 'typographic' | 'asymmetrical';
      sectionOrder?: string[];
    };
  }): Creator {
    const cleanHandle = data.handle.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (this.getCreatorByHandle(cleanHandle)) {
      throw new Error(`Handle @${cleanHandle} is already taken.`);
    }
    const id = `creator_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const creator: Creator = {
      id,
      name: data.name,
      handle: cleanHandle,
      email: `${cleanHandle}@atelier.app`,
      bio: data.bio,
      statement: `Independent artist & maker studio. Focused on tactile medium and deliberate form.`,
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      disciplines: ['Fine Art', 'Sculpture', 'Contemporary Craft'],
      location: 'New York, NY',
      socialLinks: data.socialLinks || { instagram: `@${cleanHandle}` },
      themeSettings: {
        accentColor: data.themeSettings?.accentColor || '#92400e',
        typography: data.themeSettings?.typography || 'editorial',
        gridStyle: data.themeSettings?.gridStyle || 'bento',
        palette: data.themeSettings?.palette || 'obsidian',
        watermarkEnabled: data.themeSettings?.watermarkEnabled ?? false,
        ambientSoundscape: data.themeSettings?.ambientSoundscape || 'none',
        heroStyle: data.themeSettings?.heroStyle || 'immersive',
        sectionOrder: data.themeSettings?.sectionOrder || ['hero', 'gallery', 'services', 'statement'],
      },
      acceptingCommissions: true,
      commissionNotice: 'Currently accepting commission inquiries for new works.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.creators.set(id, creator);

    // Seed realistic demo data for the new creator
    const colId = `col_${id}`;
    this.collections.set(colId, {
      id: colId,
      creatorId: id,
      title: 'Foundational Studies (2026)',
      description: 'Recent works and material explorations.',
      artworkCount: 2,
      order: 0,
      visibility: 'public',
      createdAt: new Date().toISOString()
    });

    const art1Id = `art_init_1_${id}`;
    this.artworks.set(art1Id, {
      id: art1Id,
      creatorId: id,
      collectionId: colId,
      title: `${data.name}'s Studio Monolith`,
      description: 'Exploration of texture and organic pigment.',
      images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'],
      medium: 'Mixed Media on Canvas',
      dimensions: '36 x 48 in',
      year: 2026,
      tags: ['Study', 'Pigment', 'Texture'],
      featured: true,
      status: 'available',
      price: 1500,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const art2Id = `art_init_2_${id}`;
    this.artworks.set(art2Id, {
      id: art2Id,
      creatorId: id,
      collectionId: colId,
      title: 'Silence in Form',
      description: 'Hand-coiled earthenware study with iron wash.',
      images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80'],
      medium: 'Ceramic & Iron Wash',
      dimensions: '14 x 10 in',
      year: 2026,
      tags: ['Ceramic', 'Vessel'],
      featured: false,
      status: 'available',
      price: 850,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Seed default commission service
    const srvId = `srv_${id}`;
    this.services.set(srvId, {
      id: srvId,
      creatorId: id,
      title: 'Custom Commission Study',
      description: 'Commission a bespoke piece tailored to your space and palette specifications.',
      basePrice: 2000,
      currency: 'USD',
      turnaroundWeeks: 4,
      revisionsIncluded: 2,
      active: true,
      sampleImages: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'],
      deliverableSummary: 'Original signed piece with certificate of authenticity.',
      createdAt: new Date().toISOString()
    });

    return creator;
  }


  // --- Collections ---
  getCollections(creatorId: string, publicOnly?: boolean): Collection[] {
    let list = Array.from(this.collections.values())
      .filter(c => c.creatorId === creatorId);
    if (publicOnly) {
      list = list.filter(c => c.visibility === 'public');
    }
    return list.sort((a, b) => a.order - b.order);
  }

  getCollectionById(id: string): Collection | undefined {
    return this.collections.get(id);
  }

  createCollection(creatorId: string, data: Omit<Collection, 'id' | 'creatorId' | 'createdAt'>): Collection {
    const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const collection: Collection = {
      id,
      creatorId,
      ...data,
      artworkCount: 0,
      createdAt: new Date().toISOString()
    };
    this.collections.set(id, collection);
    return collection;
  }

  updateCollection(id: string, updates: Partial<Collection>): Collection {
    const existing = this.collections.get(id);
    if (!existing) throw new Error(`Collection ${id} not found`);
    const updated = { ...existing, ...updates };
    this.collections.set(id, updated);
    return updated;
  }

  deleteCollection(id: string): boolean {
    // Unlink artworks
    for (const art of this.artworks.values()) {
      if (art.collectionId === id) {
        art.collectionId = null;
      }
    }
    return this.collections.delete(id);
  }

  // --- Artworks ---
  getArtworks(creatorId?: string, collectionId?: string, publicOnly?: boolean): Artwork[] {
    let list = Array.from(this.artworks.values());
    if (creatorId) {
      list = list.filter(a => a.creatorId === creatorId);
    }
    if (collectionId) {
      list = list.filter(a => a.collectionId === collectionId);
    }
    if (publicOnly) {
      list = list.filter(a => a.status !== 'draft');
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getArtworkById(id: string): Artwork | undefined {
    return this.artworks.get(id);
  }

  createArtwork(creatorId: string, data: Omit<Artwork, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>): Artwork {
    const id = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const artwork: Artwork = {
      id,
      creatorId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.artworks.set(id, artwork);

    // Update collection count
    if (artwork.collectionId) {
      const col = this.collections.get(artwork.collectionId);
      if (col) {
        col.artworkCount = (col.artworkCount || 0) + 1;
      }
    }

    return artwork;
  }

  updateArtwork(id: string, updates: Partial<Artwork>): Artwork {
    const existing = this.artworks.get(id);
    if (!existing) throw new Error(`Artwork ${id} not found`);
    const updated: Artwork = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.artworks.set(id, updated);
    return updated;
  }

  deleteArtwork(id: string): boolean {
    const art = this.artworks.get(id);
    if (art && art.collectionId) {
      const col = this.collections.get(art.collectionId);
      if (col && col.artworkCount && col.artworkCount > 0) {
        col.artworkCount -= 1;
      }
    }
    return this.artworks.delete(id);
  }

  // --- Commission Services ---
  getServices(creatorId: string): CommissionService[] {
    return Array.from(this.services.values())
      .filter(s => s.creatorId === creatorId);
  }

  getServiceById(id: string): CommissionService | undefined {
    return this.services.get(id);
  }

  createService(creatorId: string, data: Omit<CommissionService, 'id' | 'creatorId' | 'createdAt'>): CommissionService {
    const id = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const service: CommissionService = {
      id,
      creatorId,
      ...data,
      createdAt: new Date().toISOString()
    };
    this.services.set(id, service);
    return service;
  }

  updateService(id: string, updates: Partial<CommissionService>): CommissionService {
    const existing = this.services.get(id);
    if (!existing) throw new Error(`Service ${id} not found`);
    const updated = { ...existing, ...updates };
    this.services.set(id, updated);
    return updated;
  }

  deleteService(id: string): boolean {
    return this.services.delete(id);
  }

  // --- Commission Requests ---
  getCommissions(creatorId: string): CommissionRequest[] {
    return Array.from(this.commissions.values())
      .filter(c => c.creatorId === creatorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getCommissionById(id: string): CommissionRequest | undefined {
    return this.commissions.get(id);
  }

  createCommission(creatorId: string, data: Omit<CommissionRequest, 'id' | 'creatorId' | 'status' | 'createdAt' | 'updatedAt'>): CommissionRequest {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let serviceTitle = data.serviceTitle;
    if (data.serviceId && !serviceTitle) {
      const srv = this.services.get(data.serviceId);
      if (srv) serviceTitle = srv.title;
    }

    const commission: CommissionRequest = {
      id,
      creatorId,
      ...data,
      serviceTitle,
      status: 'RECEIVED',
      statusNotes: 'Inbound request received via public portfolio.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.commissions.set(id, commission);

    // Push notification to creator
    const creator = this.creators.get(creatorId);
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'commission_new',
      title: 'New Commission Inquiry Received',
      message: `Inquiry from ${commission.clientName} for ${serviceTitle || 'custom work'} (Budget: $${commission.budget})`,
      recipientEmail: creator?.email || 'studio@atelier.app',
      timestamp: new Date().toISOString(),
      read: false
    });

    return commission;
  }

  updateCommissionStatus(id: string, status: CommissionStatus, statusNotes?: string): CommissionRequest {
    const existing = this.commissions.get(id);
    if (!existing) throw new Error(`Commission request ${id} not found`);
    const updated: CommissionRequest = {
      ...existing,
      status,
      statusNotes: statusNotes !== undefined ? statusNotes : existing.statusNotes,
      updatedAt: new Date().toISOString()
    };
    this.commissions.set(id, updated);

    // Add client notification event
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      type: 'status_change',
      title: `Commission Status Updated: ${status.replace('_', ' ')}`,
      message: `Status updated for ${existing.clientName} (${existing.clientEmail}): ${status}. ${statusNotes || ''}`,
      recipientEmail: existing.clientEmail,
      timestamp: new Date().toISOString(),
      read: false
    });

    return updated;
  }

  // --- Notifications ---
  getNotifications(): NotificationItem[] {
    return this.notifications.slice(0, 20);
  }

  markNotificationAsRead(id: string): void {
    const item = this.notifications.find(n => n.id === id);
    if (item) item.read = true;
  }

  clearNotifications(): void {
    this.notifications = [];
  }
}

export const storage = new StorageEngine();
