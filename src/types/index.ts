export type CommissionStatus = 
  | 'RECEIVED'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'CANCELLED';

export type ArtworkStatus = 'available' | 'in_collection' | 'sold' | 'archived' | 'draft';

export interface Creator {
  id: string;
  handle: string; // e.g., 'maya'
  name: string;
  email: string;
  bio: string;
  statement: string; // Curatorial artist statement
  avatarUrl: string;
  disciplines: string[];
  location: string;
  socialLinks: {
    instagram?: string;
    website?: string;
    bluesky?: string;
    email?: string;
  };
  customDomain?: string;
  themeSettings: {
    accentColor: string;
    typography: 'editorial' | 'sans' | 'classic';
    gridStyle: 'editorial' | 'bento' | 'masonry' | 'minimal';
    palette: 'obsidian' | 'warm_paper' | 'brutalism' | 'ivory';
    watermarkEnabled?: boolean;
    ambientSoundscape?: 'none' | 'vinyl' | 'rain' | 'waves' | 'studio' | 'lofi';
    heroStyle?: 'immersive' | 'typographic' | 'asymmetrical';
    showSocialsInHero?: boolean;
    curatorBadgeText?: string;
    sectionOrder?: string[];
  };
  acceptingCommissions: boolean;
  commissionNotice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  order: number;
  visibility: 'public' | 'archived' | 'unlisted';
  isPasswordProtected?: boolean;
  password?: string;
  coverImage?: string;
  artworkCount?: number;
  createdAt: string;
}

export interface Artwork {
  id: string;
  creatorId: string;
  collectionId?: string | null;
  title: string;
  description: string;
  images: string[];
  medium: string;
  dimensions?: string;
  year: number;
  tags: string[];
  featured: boolean;
  status: ArtworkStatus;
  price?: number;
  currency?: string;
  processNotes?: string;
  provenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionService {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  basePrice: number;
  currency: string;
  turnaroundWeeks: number;
  revisionsIncluded: number;
  active: boolean;
  sampleImages: string[];
  deliverableSummary: string;
  createdAt: string;
}

export interface CommissionRequest {
  id: string;
  creatorId: string;
  serviceId?: string | null;
  serviceTitle?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  brief: string;
  aiEnhancedBrief?: string;
  referenceImages: string[];
  budget: number;
  currency: string;
  deadline?: string;
  intendedUse?: string;
  status: CommissionStatus;
  statusNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'commission_new' | 'status_change' | 'system';
  title: string;
  message: string;
  recipientEmail: string;
  timestamp: string;
  read: boolean;
}
