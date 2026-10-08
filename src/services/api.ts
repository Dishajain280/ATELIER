import { 
  Creator, 
  Artwork, 
  Collection, 
  CommissionService, 
  CommissionRequest, 
  NotificationItem, 
  CommissionStatus 
} from '../types/index.js';

class ApiService {
  private currentCreatorId: string | null = null;

  setAuthCreatorId(id: string | null) {
    this.currentCreatorId = id;
  }

  getAuthCreatorId(): string | null {
    return this.currentCreatorId;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const authHeaders: Record<string, string> = {};
    if (this.currentCreatorId) {
      authHeaders['x-creator-id'] = this.currentCreatorId;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
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
    }

    return res.json() as Promise<T>;
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
