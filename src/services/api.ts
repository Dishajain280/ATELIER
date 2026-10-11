import type { 
  Creator, 
  Artwork, 
  Collection, 
  CommissionService, 
  CommissionRequest, 
  NotificationItem, 
  CommissionStatus 
} from '../types/index.ts';
import { 
  SEED_CREATORS, 
  SEED_ARTWORKS, 
  SEED_COLLECTIONS, 
  SEED_COMMISSION_SERVICES, 
  SEED_COMMISSION_REQUESTS 
} from '../server/db/seed.ts';

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_welcome',
    title: 'Welcome to ATELIER Backstage',
    message: 'Your curatorial studio portfolio is live and accepting bespoke commission requests.',
    recipientEmail: 'studio@mayalin.atelier',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'system',
  },
  {
    id: 'notif_inquiry',
    title: 'New Commission Inquiry',
    message: 'Patron Julian Mercer submitted a request for Architectural Vessel Series.',
    recipientEmail: 'studio@mayalin.atelier',
    timestamp: new Date().toISOString(),
    read: false,
    type: 'commission_new',
  },
];

class ClientFallbackStore {
  creators: Creator[];
  artworks: Artwork[];
  collections: Collection[];
  services: CommissionService[];
  commissions: CommissionRequest[];
  notifications: NotificationItem[];

  constructor() {
    this.creators = [...SEED_CREATORS];
    this.artworks = [...SEED_ARTWORKS];
    this.collections = [...SEED_COLLECTIONS];
    this.services = [...SEED_COMMISSION_SERVICES];
    this.commissions = [...SEED_COMMISSION_REQUESTS];
    this.notifications = [...DEFAULT_NOTIFICATIONS];
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('atelier_local_store');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.creators?.length) this.creators = parsed.creators;
        if (parsed.artworks?.length) this.artworks = parsed.artworks;
        if (parsed.collections?.length) this.collections = parsed.collections;
        if (parsed.services?.length) this.services = parsed.services;
        if (parsed.commissions?.length) this.commissions = parsed.commissions;
        if (parsed.notifications?.length) this.notifications = parsed.notifications;
      }
    } catch {
      // ignore
    }
  }

  save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('atelier_local_store', JSON.stringify({
        creators: this.creators,
        artworks: this.artworks,
        collections: this.collections,
        services: this.services,
        commissions: this.commissions,
        notifications: this.notifications,
      }));
    } catch {
      // ignore
    }
  }
}

const clientStore = new ClientFallbackStore();

class ApiService {
  private currentCreatorId: string | null = null;

  setAuthCreatorId(id: string | null) {
    this.currentCreatorId = id;
  }

  getAuthCreatorId(): string | null {
    return this.currentCreatorId;
  }

  private handleClientFallback<T>(endpoint: string, options?: RequestInit): T | undefined {
    const url = new URL(endpoint, 'http://localhost');
    const pathname = url.pathname;
    const method = options?.method?.toUpperCase() || 'GET';
    const body = options?.body ? JSON.parse(options.body as string) : {};

    // 1. Creators
    if (pathname === '/api/creators' && method === 'GET') {
      return clientStore.creators as unknown as T;
    }
    if (pathname.startsWith('/api/creators/') && method === 'GET') {
      const handleOrId = decodeURIComponent(pathname.replace('/api/creators/', ''));
      const found = clientStore.creators.find(c => c.handle.toLowerCase() === handleOrId.toLowerCase() || c.id === handleOrId);
      if (found) return found as unknown as T;
      return clientStore.creators[0] as unknown as T;
    }
    if (pathname === '/api/creators' && method === 'POST') {
      const newCreator: Creator = {
        id: 'creator_' + Date.now(),
        handle: body.handle || 'artist_' + Date.now().toString(36),
        name: body.name || 'New Artist',
        email: body.email || 'studio@atelier.app',
        bio: body.bio || '',
        statement: body.statement || '',
        avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        disciplines: body.disciplines || ['Contemporary Craft'],
        location: body.location || 'Studio Workspace',
        socialLinks: body.socialLinks || {},
        themeSettings: body.themeSettings || { accentColor: '#B45309', typography: 'editorial', gridStyle: 'bento', palette: 'obsidian' },
        acceptingCommissions: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      clientStore.creators.push(newCreator);
      clientStore.save();
      return newCreator as unknown as T;
    }
    if (pathname.startsWith('/api/creators/') && method === 'PATCH') {
      const id = pathname.replace('/api/creators/', '');
      const idx = clientStore.creators.findIndex(c => c.id === id || c.handle === id);
      if (idx !== -1) {
        clientStore.creators[idx] = { ...clientStore.creators[idx], ...body, updatedAt: new Date().toISOString() };
        clientStore.save();
        return clientStore.creators[idx] as unknown as T;
      }
    }

    // 2. Artworks
    if (pathname === '/api/artworks' && method === 'GET') {
      const creatorId = url.searchParams.get('creatorId');
      const collectionId = url.searchParams.get('collectionId');
      const publicOnly = url.searchParams.get('publicOnly') === 'true';

      let results = [...clientStore.artworks];
      if (creatorId) results = results.filter(a => a.creatorId === creatorId);
      if (collectionId) results = results.filter(a => a.collectionId === collectionId);
      if (publicOnly) results = results.filter(a => a.status !== 'draft');
      return results as unknown as T;
    }
    if (pathname === '/api/artworks' && method === 'POST') {
      const newArt: Artwork = {
        id: 'art_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...body,
      };
      clientStore.artworks.unshift(newArt);
      clientStore.save();
      return newArt as unknown as T;
    }
    if (pathname.startsWith('/api/artworks/') && method === 'PATCH') {
      const id = pathname.replace('/api/artworks/', '');
      const idx = clientStore.artworks.findIndex(a => a.id === id);
      if (idx !== -1) {
        clientStore.artworks[idx] = { ...clientStore.artworks[idx], ...body, updatedAt: new Date().toISOString() };
        clientStore.save();
        return clientStore.artworks[idx] as unknown as T;
      }
    }
    if (pathname.startsWith('/api/artworks/') && method === 'DELETE') {
      const id = pathname.replace('/api/artworks/', '');
      clientStore.artworks = clientStore.artworks.filter(a => a.id !== id);
      clientStore.save();
      return { success: true } as unknown as T;
    }

    // 3. Collections
    if (pathname === '/api/collections' && method === 'GET') {
      const creatorId = url.searchParams.get('creatorId');
      let cols = [...clientStore.collections];
      if (creatorId) cols = cols.filter(c => c.creatorId === creatorId);
      return cols as unknown as T;
    }
    if (pathname === '/api/collections' && method === 'POST') {
      const newCol: Collection = {
        id: 'col_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        artworksCount: 0,
        ...body,
      };
      clientStore.collections.push(newCol);
      clientStore.save();
      return newCol as unknown as T;
    }
    if (pathname.startsWith('/api/collections/') && method === 'PATCH') {
      const id = pathname.replace('/api/collections/', '');
      const idx = clientStore.collections.findIndex(c => c.id === id);
      if (idx !== -1) {
        clientStore.collections[idx] = { ...clientStore.collections[idx], ...body, updatedAt: new Date().toISOString() };
        clientStore.save();
        return clientStore.collections[idx] as unknown as T;
      }
    }

    // 4. Services
    if (pathname === '/api/services' && method === 'GET') {
      const creatorId = url.searchParams.get('creatorId');
      let srvs = [...clientStore.services];
      if (creatorId) srvs = srvs.filter(s => s.creatorId === creatorId);
      return srvs as unknown as T;
    }
    if (pathname === '/api/services' && method === 'POST') {
      const newSrv: CommissionService = {
        id: 'srv_' + Date.now(),
        createdAt: new Date().toISOString(),
        ...body,
      };
      clientStore.services.push(newSrv);
      clientStore.save();
      return newSrv as unknown as T;
    }

    // 5. Commissions
    if (pathname === '/api/commissions' && method === 'GET') {
      const creatorId = url.searchParams.get('creatorId');
      let comms = [...clientStore.commissions];
      if (creatorId) comms = comms.filter(c => c.creatorId === creatorId);
      return comms as unknown as T;
    }
    if (pathname === '/api/commissions' && method === 'POST') {
      const newComm: CommissionRequest = {
        id: 'comm_' + Date.now(),
        status: 'RECEIVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currency: 'USD',
        ...body,
      };
      clientStore.commissions.unshift(newComm);
      clientStore.save();
      return newComm as unknown as T;
    }
    if (pathname.includes('/status') && method === 'PATCH') {
      const id = pathname.replace('/api/commissions/', '').replace('/status', '');
      const idx = clientStore.commissions.findIndex(c => c.id === id);
      if (idx !== -1) {
        clientStore.commissions[idx] = {
          ...clientStore.commissions[idx],
          status: body.status,
          statusNotes: body.statusNotes,
          updatedAt: new Date().toISOString(),
        };
        clientStore.save();
        return clientStore.commissions[idx] as unknown as T;
      }
    }

    // 6. Notifications
    if (pathname === '/api/notifications' && method === 'GET') {
      return clientStore.notifications as unknown as T;
    }
    if (pathname.includes('/read') && method === 'POST') {
      const id = pathname.replace('/api/notifications/', '').replace('/read', '');
      const notif = clientStore.notifications.find(n => n.id === id);
      if (notif) notif.read = true;
      clientStore.save();
      return { success: true } as unknown as T;
    }

    return undefined;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const authHeaders: Record<string, string> = {};
    if (this.currentCreatorId) {
      authHeaders['x-creator-id'] = this.currentCreatorId;
    }

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...(options?.headers || {}),
        },
      });

      if (res.ok) {
        return res.json() as Promise<T>;
      }

      // If status is 404 or server is unreachable, use client fallback storage
      if (res.status === 404 || res.status >= 500) {
        const fallback = this.handleClientFallback<T>(endpoint, options);
        if (fallback !== undefined) {
          console.info(`[ATELIER API] Gracefully loaded ${endpoint} via client storage (Server returned ${res.status})`);
          return fallback;
        }
      }

      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) {
          errorMessage = typeof errorJson.error === 'string' 
            ? errorJson.error 
            : JSON.stringify(errorJson.error);
        }
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    } catch (err: any) {
      // In case of network errors (such as offline or static deployment without backend)
      const fallback = this.handleClientFallback<T>(endpoint, options);
      if (fallback !== undefined) {
        console.info(`[ATELIER API] Handled ${endpoint} via offline client fallback storage`);
        return fallback;
      }
      throw err;
    }
  }

  // Creators
  async getCreators(): Promise<Creator[]> {
    return this.request<Creator[]>('/api/creators');
  }

  async getCreator(handle: string): Promise<Creator> {
    return this.request<Creator>(`/api/creators/${encodeURIComponent(handle)}`);
  }

  async createCreator(data: {
    name: string;
    handle: string;
    bio: string;
    avatarUrl: string;
    socialLinks?: { instagram?: string; twitter?: string; website?: string };
    themeSettings?: { accentColor?: string; typography?: 'editorial' | 'sans' | 'classic'; gridStyle?: 'masonry' | 'bento' | 'minimal' };
  }): Promise<Creator> {
    return this.request<Creator>('/api/creators', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCreator(id: string, updates: Partial<Creator>): Promise<Creator> {
    return this.request<Creator>(`/api/creators/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Collections
  async getCollections(creatorId: string, publicOnly?: boolean): Promise<Collection[]> {
    const params = new URLSearchParams({ creatorId });
    if (publicOnly) params.append('publicOnly', 'true');
    return this.request<Collection[]>(`/api/collections?${params.toString()}`);
  }

  async createCollection(data: { creatorId: string; title: string; description?: string; order?: number }): Promise<Collection> {
    return this.request<Collection>('/api/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
    return this.request<Collection>(`/api/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCollection(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Artworks
  async getArtworks(creatorId?: string, collectionId?: string, publicOnly?: boolean): Promise<Artwork[]> {
    const params = new URLSearchParams();
    if (creatorId) params.append('creatorId', creatorId);
    if (collectionId) params.append('collectionId', collectionId);
    if (publicOnly) params.append('publicOnly', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Artwork[]>(`/api/artworks${query}`);
  }

  async createArtwork(data: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artwork> {
    return this.request<Artwork>('/api/artworks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArtwork(id: string, updates: Partial<Artwork>): Promise<Artwork> {
    return this.request<Artwork>(`/api/artworks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteArtwork(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/artworks/${id}`, {
      method: 'DELETE',
    });
  }

  // Commission Services
  async getServices(creatorId: string): Promise<CommissionService[]> {
    return this.request<CommissionService[]>(`/api/services?creatorId=${encodeURIComponent(creatorId)}`);
  }

  async createService(data: Omit<CommissionService, 'id' | 'createdAt'>): Promise<CommissionService> {
    return this.request<CommissionService>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, updates: Partial<CommissionService>): Promise<CommissionService> {
    return this.request<CommissionService>(`/api/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteService(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Commissions
  async getCommissions(creatorId: string): Promise<CommissionRequest[]> {
    return this.request<CommissionRequest[]>(`/api/commissions?creatorId=${encodeURIComponent(creatorId)}`);
  }

  async submitCommission(data: {
    creatorId: string;
    serviceId?: string | null;
    serviceTitle?: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    brief: string;
    aiEnhancedBrief?: string;
    budget: number;
    currency?: string;
    deadline?: string;
    intendedUse?: string;
    referenceImages?: string[];
  }): Promise<CommissionRequest> {
    return this.request<CommissionRequest>('/api/commissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCommissionStatus(id: string, status: CommissionStatus, statusNotes?: string): Promise<CommissionRequest> {
    return this.request<CommissionRequest>(`/api/commissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, statusNotes }),
    });
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/api/notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  // AI Assistants
  async generateArtworkAssistant(input: {
    image?: string;
    optionalDescription?: string;
    artistContext?: string;
  }): Promise<{
    suggestedTitle: string;
    alternativeTitles: string[];
    professionalDescription: string;
    medium: string;
    category: string;
    tags: string[];
    seoKeywords: string[];
  }> {
    return this.request('/api/ai/artwork-assistant', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async generateProfileAssistant(input: {
    roughNotes: string;
    artistName?: string;
    disciplines?: string[];
    location?: string;
  }): Promise<{
    options: Array<{
      id: string;
      styleLabel: string;
      professionalBio: string;
      shortTagline: string;
      portfolioIntroduction: string;
      suggestedSpecialties: string[];
      socialMediaIntroduction: string;
    }>;
  }> {
    return this.request('/api/ai/profile-assistant', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async generateCommissionBriefAssistant(input: {
    informalRequest: string;
    clientName?: string;
    artistName?: string;
    serviceTier?: string;
    budgetEstimated?: number;
  }): Promise<{
    projectType: string;
    subject: string;
    style: string;
    colorPreferences: string;
    intendedUse: string;
    deadline: string;
    structuredBrief: string;
    usefulClarificationQuestions: string[];
  }> {
    return this.request('/api/ai/commission-brief', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // Legacy AI Assistants
  async generateArtworkMetadata(input: {
    roughNotes?: string;
    medium?: string;
    techniques?: string;
    inspiration?: string;
  }): Promise<{
    titleSuggestions: string[];
    mediumFormatted: string;
    description: string;
    tags: string[];
  }> {
    return this.request('/api/ai/metadata', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async generateArtistBio(input: {
    name: string;
    disciplines: string[];
    location?: string;
    philosophy?: string;
    influences?: string;
  }): Promise<{
    bio: string;
    statement: string;
    commissionNotice: string;
  }> {
    return this.request('/api/ai/bio', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async generateCommissionBrief(input: {
    clientName: string;
    serviceTitle?: string;
    roughBrief: string;
    budget?: number;
    deadline?: string;
    dimensionsOrScale?: string;
  }): Promise<{
    structuredBrief: string;
    deliverablesSummary: string;
    recommendedScopeNotes: string[];
  }> {
    return this.request('/api/ai/brief', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
}

export const api = new ApiService();
