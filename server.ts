import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import { storage } from './src/server/db/storage.js';
import { 
  generateArtworkMetadata, 
  generateArtistBio, 
  generateCommissionBrief,
  generateArtworkAssistant,
  generateProfileAssistant,
  generateCommissionBriefAssistant,
} from './src/server/ai/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body parser with comfortable limit for base64 uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // --- API Routes ---

  // 1. Creators
  app.get('/api/creators', (req: Request, res: Response) => {
    try {
      const creators = storage.getCreators();
      res.json(creators);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/creators/:handle', (req: Request, res: Response) => {
    try {
      const handle = req.params.handle;
      let creator = storage.getCreatorByHandle(handle);
      if (!creator) {
        creator = storage.getCreatorById(handle);
      }
      if (!creator) {
        return res.status(404).json({ error: `Artist @${handle} not found` });
      }
      res.json(creator);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const RESERVED_HANDLES = new Set([
    'admin', 'api', 'atelier', 'explore', 'dashboard', 'auth', 
    'login', 'signup', 'settings', 'studio', 'portfolio', 'commissions',
    'services', 'artwork', 'artworks', 'collections', 'help', 'about', 'public'
  ]);

  function validateAndSanitizeHandle(rawHandle: any, existingCreatorId?: string): { valid: boolean; handle?: string; error?: string } {
    if (!rawHandle || typeof rawHandle !== 'string') {
      return { valid: false, error: 'Handle is required and must be a string' };
    }
    const trimmed = rawHandle.trim().replace(/^@/, '');
    if (!trimmed) {
      return { valid: false, error: 'Handle cannot be empty or whitespace only' };
    }
    const normalized = trimmed.toLowerCase();
    if (normalized.length < 2) {
      return { valid: false, error: 'Handle must be at least 2 characters long' };
    }
    if (normalized.length > 30) {
      return { valid: false, error: 'Handle cannot exceed 30 characters' };
    }
    if (!/^[a-z0-9_]+$/.test(normalized)) {
      return { valid: false, error: 'Handle may only contain lowercase letters, numbers, and underscores' };
    }
    if (RESERVED_HANDLES.has(normalized)) {
      return { valid: false, error: `@${normalized} is a reserved system route name` };
    }
    const existing = storage.getCreatorByHandle(normalized);
    if (existing && existing.id !== existingCreatorId) {
      return { valid: false, error: `@${normalized} is already registered on ATELIER. Please choose another handle.` };
    }
    return { valid: true, handle: normalized };
  }

  function formatZodError(error: z.ZodError): string {
    return error.issues.map(i => `${i.path.join('.') || 'field'}: ${i.message}`).join('; ');
  }

  function isSafeUrl(val: string | undefined | null): boolean {
    if (!val || typeof val !== 'string') return true;
    const trimmed = val.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('vbscript:') || trimmed.startsWith('data:') || trimmed.startsWith('file:') || trimmed.startsWith('blob:')) {
      return false;
    }
    return true;
  }

  const safeUrlSchema = z.string().max(300, 'Link cannot exceed 300 characters').refine(
    val => isSafeUrl(val),
    { message: 'Unsafe link protocol detected. Only http:// and https:// links are permitted' }
  );

  const CreateCreatorSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    handle: z.string().min(2, 'Handle must be at least 2 characters').max(30, 'Handle cannot exceed 30 characters'),
    bio: z.string().min(1, 'Bio is required').max(1000, 'Bio cannot exceed 1,000 characters'),
    avatarUrl: z.string().max(500, 'Avatar URL cannot exceed 500 characters').default(''),
    socialLinks: z.record(z.string(), safeUrlSchema.optional()).optional(),
    themeSettings: z.object({
      accentColor: z.string().max(50).optional(),
      typography: z.enum(['editorial', 'sans', 'classic']).optional(),
      gridStyle: z.enum(['editorial', 'bento', 'masonry', 'minimal']).optional(),
      palette: z.enum(['obsidian', 'warm_paper', 'brutalism', 'ivory']).optional(),
      watermarkEnabled: z.boolean().optional(),
      ambientSoundscape: z.enum(['none', 'vinyl', 'rain', 'waves', 'studio']).optional(),
      heroStyle: z.enum(['immersive', 'typographic', 'asymmetrical']).optional(),
      sectionOrder: z.array(z.string()).optional(),
    }).optional(),
  });

  app.post('/api/creators', (req: Request, res: Response) => {
    try {
      const parsed = CreateCreatorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      const handleValidation = validateAndSanitizeHandle(parsed.data.handle);
      if (!handleValidation.valid || !handleValidation.handle) {
        return res.status(400).json({ error: handleValidation.error });
      }
      const created = storage.createCreator({
        ...parsed.data,
        handle: handleValidation.handle
      } as any);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  const UpdateCreatorSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').max(100, 'Name cannot exceed 100 characters').optional(),
    handle: z.string().min(2, 'Handle must be at least 2 characters').max(30, 'Handle cannot exceed 30 characters').optional(),
    bio: z.string().max(1000, 'Bio cannot exceed 1,000 characters').optional(),
    statement: z.string().max(3000, 'Statement cannot exceed 3,000 characters').optional(),
    avatarUrl: z.string().max(500, 'Avatar URL cannot exceed 500 characters').optional(),
    disciplines: z.array(z.string().max(50, 'Discipline name cannot exceed 50 characters')).max(20, 'Maximum 20 disciplines allowed').optional(),
    location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
    socialLinks: z.record(z.string(), safeUrlSchema.optional()).optional(),
    themeSettings: z.object({
      accentColor: z.string().max(50).optional(),
      typography: z.enum(['editorial', 'sans', 'classic']).optional(),
      gridStyle: z.enum(['editorial', 'bento', 'masonry', 'minimal']).optional(),
      palette: z.enum(['obsidian', 'warm_paper', 'brutalism', 'ivory']).optional(),
      watermarkEnabled: z.boolean().optional(),
      ambientSoundscape: z.enum(['none', 'vinyl', 'rain', 'waves', 'studio', 'lofi']).optional(),
      heroStyle: z.enum(['immersive', 'typographic', 'asymmetrical']).optional(),
      sectionOrder: z.array(z.string()).optional(),
    }).optional(),
    acceptingCommissions: z.boolean().optional(),
    commissionNotice: z.string().max(500, 'Commission notice cannot exceed 500 characters').optional(),
  });

  // Helper to extract authenticated creator identity for ownership checks
  // Strictly checks x-creator-id header or Bearer authorization token
  function getRequesterCreatorId(req: Request): string | undefined {
    const headerId = req.headers['x-creator-id'];
    if (typeof headerId === 'string' && headerId.trim()) {
      return headerId.trim();
    }
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) return token;
    }
    return undefined;
  }

  app.patch('/api/creators/:id', (req: Request, res: Response) => {
    try {
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (requesterId !== req.params.id) {
        return res.status(403).json({ error: 'Forbidden: Cannot modify another creator profile' });
      }
      const parsed = UpdateCreatorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      let updatePayload = { ...parsed.data };
      if (parsed.data.handle !== undefined) {
        const handleValidation = validateAndSanitizeHandle(parsed.data.handle, req.params.id);
        if (!handleValidation.valid || !handleValidation.handle) {
          return res.status(400).json({ error: handleValidation.error });
        }
        updatePayload.handle = handleValidation.handle;
      }
      const updated = storage.updateCreator(req.params.id, updatePayload as any);
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // 2. Collections
  app.get('/api/collections', (req: Request, res: Response) => {
    try {
      const creatorId = req.query.creatorId as string;
      if (!creatorId) {
        return res.status(400).json({ error: 'creatorId query parameter is required' });
      }
      const publicOnly = req.query.publicOnly === 'true';
      const collections = storage.getCollections(creatorId, publicOnly);
      res.json(collections);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const CreateCollectionSchema = z.object({
    creatorId: z.string().min(1),
    title: z.string().min(1, 'Title is required').max(120, 'Title cannot exceed 120 characters'),
    description: z.string().max(1000, 'Description cannot exceed 1,000 characters').optional(),
    order: z.number().min(0, 'Order must be non-negative').max(10000, 'Order cannot exceed 10,000').default(0),
    visibility: z.enum(['public', 'archived', 'unlisted']).default('public'),
    isPasswordProtected: z.boolean().optional(),
    password: z.string().max(100).optional(),
    coverImage: z.string().max(500).optional(),
  });

  const UpdateCollectionSchema = z.object({
    title: z.string().min(1, 'Title cannot be empty').max(120, 'Title cannot exceed 120 characters').optional(),
    description: z.string().max(1000, 'Description cannot exceed 1,000 characters').optional(),
    order: z.number().min(0, 'Order must be non-negative').max(10000, 'Order cannot exceed 10,000').optional(),
    visibility: z.enum(['public', 'archived', 'unlisted']).optional(),
    isPasswordProtected: z.boolean().optional(),
    password: z.string().max(100).optional(),
    coverImage: z.string().max(500).optional(),
  });

  app.post('/api/collections', (req: Request, res: Response) => {
    try {
      const parsed = CreateCollectionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (requesterId !== parsed.data.creatorId) {
        return res.status(403).json({ error: 'Forbidden: Cannot create collection for another creator' });
      }
      const { creatorId, ...data } = parsed.data;
      const created = storage.createCollection(creatorId, data);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/collections/:id', (req: Request, res: Response) => {
    try {
      const existing = storage.getCollectionById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this collection' });
      }
      const parsed = UpdateCollectionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      const updated = storage.updateCollection(req.params.id, parsed.data);
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.delete('/api/collections/:id', (req: Request, res: Response) => {
    try {
      const existing = storage.getCollectionById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this collection' });
      }
      const success = storage.deleteCollection(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Artworks
  app.get('/api/artworks', (req: Request, res: Response) => {
    try {
      const creatorId = req.query.creatorId as string | undefined;
      const collectionId = req.query.collectionId as string | undefined;
      const publicOnly = req.query.publicOnly === 'true';
      const artworks = storage.getArtworks(creatorId, collectionId, publicOnly);
      res.json(artworks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const CreateArtworkSchema = z.object({
    creatorId: z.string().min(1),
    collectionId: z.string().nullable().optional(),
    title: z.string().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
    description: z.string().max(3000, 'Description cannot exceed 3,000 characters').default(''),
    images: z.array(z.string().max(5000000, 'Image payload too large')).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
    medium: z.string().min(1, 'Medium is required').max(100, 'Medium cannot exceed 100 characters'),
    dimensions: z.string().max(100, 'Dimensions cannot exceed 100 characters').optional(),
    year: z.number().min(1800, 'Year must be after 1800').max(new Date().getFullYear() + 5, 'Year cannot exceed near future').default(new Date().getFullYear()),
    tags: z.array(z.string().max(50, 'Tag cannot exceed 50 characters')).max(30, 'Maximum 30 tags allowed').default([]),
    featured: z.boolean().default(false),
    status: z.enum(['available', 'in_collection', 'sold', 'archived', 'draft']).default('available'),
    price: z.number().min(0, 'Price must be non-negative').max(10000000, 'Price cannot exceed $10,000,000').optional(),
    currency: z.string().max(10).default('USD'),
  });

  const UpdateArtworkSchema = z.object({
    collectionId: z.string().nullable().optional(),
    title: z.string().min(1, 'Title cannot be empty').max(150, 'Title cannot exceed 150 characters').optional(),
    description: z.string().max(3000, 'Description cannot exceed 3,000 characters').optional(),
    images: z.array(z.string().max(5000000, 'Image payload too large')).max(10, 'Maximum 10 images allowed').optional(),
    medium: z.string().min(1, 'Medium cannot be empty').max(100, 'Medium cannot exceed 100 characters').optional(),
    dimensions: z.string().max(100, 'Dimensions cannot exceed 100 characters').optional(),
    year: z.number().min(1800, 'Year must be after 1800').max(new Date().getFullYear() + 5, 'Year cannot exceed near future').optional(),
    tags: z.array(z.string().max(50, 'Tag cannot exceed 50 characters')).max(30, 'Maximum 30 tags allowed').optional(),
    featured: z.boolean().optional(),
    status: z.enum(['available', 'in_collection', 'sold', 'archived', 'draft']).optional(),
    price: z.number().min(0, 'Price must be non-negative').max(10000000, 'Price cannot exceed $10,000,000').optional(),
    currency: z.string().max(10).optional(),
  });

  app.post('/api/artworks', (req: Request, res: Response) => {
    try {
      const parsed = CreateArtworkSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (requesterId !== parsed.data.creatorId) {
        return res.status(403).json({ error: 'Forbidden: Cannot create artwork for another creator' });
      }
      const { creatorId, ...data } = parsed.data;
      const created = storage.createArtwork(creatorId, data);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/artworks/:id', (req: Request, res: Response) => {
    try {
      const existing = storage.getArtworkById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Artwork not found' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this artwork' });
      }
      const parsed = UpdateArtworkSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      const updated = storage.updateArtwork(req.params.id, parsed.data);
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.delete('/api/artworks/:id', (req: Request, res: Response) => {
    try {
      const existing = storage.getArtworkById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Artwork not found' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this artwork' });
      }
      const success = storage.deleteArtwork(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Commission Services
  app.get('/api/services', (req: Request, res: Response) => {
    try {
      const creatorId = req.query.creatorId as string;
      if (!creatorId) {
        return res.status(400).json({ error: 'creatorId query parameter is required' });
      }
      const services = storage.getServices(creatorId);
      res.json(services);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const CreateServiceSchema = z.object({
    creatorId: z.string().min(1),
    title: z.string().min(1, 'Title is required').max(120, 'Title cannot exceed 120 characters'),
    description: z.string().min(1, 'Description is required').max(2000, 'Description cannot exceed 2,000 characters'),
    basePrice: z.number().min(0, 'Base price must be positive').max(1000000, 'Base price cannot exceed $1,000,000'),
    currency: z.string().max(10).default('USD'),
    turnaroundWeeks: z.number().min(1, 'Turnaround must be at least 1 week').max(104, 'Turnaround cannot exceed 104 weeks (2 years)').default(4),
    revisionsIncluded: z.number().min(0, 'Revisions must be non-negative').max(50, 'Revisions cannot exceed 50').default(2),
    active: z.boolean().default(true),
    sampleImages: z.array(z.string().max(5000000)).max(10).default([]),
    deliverableSummary: z.string().max(1000, 'Deliverable summary cannot exceed 1,000 characters').default(''),
  });

  const UpdateServiceSchema = z.object({
    title: z.string().min(1, 'Title cannot be empty').max(120, 'Title cannot exceed 120 characters').optional(),
    description: z.string().min(1, 'Description cannot be empty').max(2000, 'Description cannot exceed 2,000 characters').optional(),
    basePrice: z.number().min(0, 'Base price must be non-negative').max(1000000, 'Base price cannot exceed $1,000,000').optional(),
    currency: z.string().max(10).optional(),
    turnaroundWeeks: z.number().min(1, 'Turnaround must be at least 1 week').max(104, 'Turnaround cannot exceed 104 weeks (2 years)').optional(),
    revisionsIncluded: z.number().min(0, 'Revisions must be non-negative').max(50, 'Revisions cannot exceed 50').optional(),
    active: z.boolean().optional(),
    sampleImages: z.array(z.string().max(5000000)).max(10).optional(),
    deliverableSummary: z.string().max(1000, 'Deliverable summary cannot exceed 1,000 characters').optional(),
  });

  app.post('/api/services', (req: Request, res: Response) => {
    try {
      const parsed = CreateServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (requesterId !== parsed.data.creatorId) {
        return res.status(403).json({ error: 'Forbidden: Cannot create service for another creator' });
      }
      const { creatorId, ...data } = parsed.data;
      const created = storage.createService(creatorId, data);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/services/:id', (req: Request, res: Response) => {
    try {
      const existing = storage.getServiceById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Service not found' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this service' });
      }
      const parsed = UpdateServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      const updated = storage.updateService(req.params.id, parsed.data);
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.delete('/api/services/:id', (req: Request, res: Response) => {
    try {
      const existing = storage.getServiceById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Service not found' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication identity required (missing x-creator-id)' });
      }
      if (existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this service' });
      }
      const success = storage.deleteService(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Commission Requests (Inbox & Public Intake)
  // Protected private inbox: creator can only access their own commission requests
  app.get('/api/commissions', (req: Request, res: Response) => {
    try {
      const creatorId = req.query.creatorId as string;
      if (!creatorId) {
        return res.status(400).json({ error: 'creatorId query parameter is required' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required to view private commission inbox (missing x-creator-id)' });
      }
      if (requesterId !== creatorId) {
        return res.status(403).json({ error: 'Forbidden: Cannot access private commission inbox of another creator' });
      }
      const commissions = storage.getCommissions(creatorId);
      res.json(commissions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const safeReferenceUrlSchema = z.string().max(2000, 'Reference link too long').refine(
    val => isSafeUrl(val),
    { message: 'Unsafe reference link protocol detected. Only http://, https://, and data:image links are permitted' }
  );

  const CreateCommissionSchema = z.object({
    creatorId: z.string().min(1),
    serviceId: z.string().nullable().optional(),
    serviceTitle: z.string().max(150).optional(),
    clientName: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    clientEmail: z.string().email('Valid email is required').max(255, 'Email cannot exceed 255 characters'),
    clientPhone: z.string().max(50, 'Phone cannot exceed 50 characters').optional(),
    brief: z.string().min(10, 'Please provide more detail in your brief (minimum 10 characters)').max(3000, 'Brief cannot exceed 3,000 characters'),
    aiEnhancedBrief: z.string().max(5000, 'AI brief cannot exceed 5,000 characters').optional(),
    referenceImages: z.array(safeReferenceUrlSchema).max(10, 'Maximum 10 reference links allowed').default([]),
    budget: z.number().min(0, 'Budget must be non-negative').max(10000000, 'Budget cannot exceed $10,000,000').default(0),
    currency: z.string().max(10).default('USD'),
    deadline: z.string().max(100, 'Deadline cannot exceed 100 characters').optional(),
    intendedUse: z.string().max(500, 'Intended use cannot exceed 500 characters').optional(),
  });

  app.post('/api/commissions', (req: Request, res: Response) => {
    try {
      const parsed = CreateCommissionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }
      const { creatorId, ...data } = parsed.data;
      const created = storage.createCommission(creatorId, data);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const UpdateCommissionStatusSchema = z.object({
    status: z.enum([
      'RECEIVED',
      'IN_REVIEW',
      'ACCEPTED',
      'DECLINED',
      'IN_PROGRESS',
      'DELIVERED',
      'CANCELLED'
    ]),
    statusNotes: z.string().max(1000, 'Status notes cannot exceed 1,000 characters').optional(),
  });

  app.patch('/api/commissions/:id/status', (req: Request, res: Response) => {
    try {
      const existing = storage.getCommissionById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Commission request not found' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (!requesterId) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required to update commission status (missing x-creator-id)' });
      }
      if (existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this commission inquiry' });
      }
      const parsed = UpdateCommissionStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: formatZodError(parsed.error), issues: parsed.error.issues });
      }

      // Enforce Commission State Machine
      // Legal flow: RECEIVED → IN_REVIEW → ACCEPTED / DECLINED → IN_PROGRESS → DELIVERED
      // Cancellation allowed from non-terminal states. DELIVERED, DECLINED, CANCELLED are terminal.
      const VALID_COMMISSION_TRANSITIONS: Record<string, string[]> = {
        RECEIVED: ['IN_REVIEW', 'ACCEPTED', 'DECLINED', 'CANCELLED'],
        IN_REVIEW: ['ACCEPTED', 'DECLINED', 'CANCELLED'],
        ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['DELIVERED', 'CANCELLED'],
        DECLINED: [],
        DELIVERED: [],
        CANCELLED: [],
      };

      if (parsed.data.status !== existing.status) {
        const allowed = VALID_COMMISSION_TRANSITIONS[existing.status] || [];
        if (!allowed.includes(parsed.data.status)) {
          return res.status(400).json({ 
            error: `Invalid status transition: Cannot move commission from '${existing.status}' to '${parsed.data.status}'. Allowed transitions: [${allowed.join(', ') || 'None - terminal status'}].` 
          });
        }
      }

      const updated = storage.updateCommissionStatus(
        req.params.id, 
        parsed.data.status, 
        parsed.data.statusNotes
      );
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // 6. Notifications (Simulated Email & Activity Drawer)
  app.get('/api/notifications', (req: Request, res: Response) => {
    try {
      res.json(storage.getNotifications());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
    try {
      storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. AI Endpoints (Google GenAI)
  // Tool 1: Artwork Assistant
  app.post('/api/ai/artwork-assistant', async (req: Request, res: Response) => {
    try {
      const result = await generateArtworkAssistant(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Artwork assistant error:', err);
      res.status(500).json({ error: err.message || 'Artwork assistant generation failed' });
    }
  });

  // Tool 2: Profile Assistant
  app.post('/api/ai/profile-assistant', async (req: Request, res: Response) => {
    try {
      const result = await generateProfileAssistant(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Profile assistant error:', err);
      res.status(500).json({ error: err.message || 'Profile assistant generation failed' });
    }
  });

  // Tool 3: Commission Brief Assistant
  app.post('/api/ai/commission-brief', async (req: Request, res: Response) => {
    try {
      const result = await generateCommissionBriefAssistant(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Commission brief assistant error:', err);
      res.status(500).json({ error: err.message || 'Commission brief assistant generation failed' });
    }
  });

  // Backward compatibility endpoints
  app.post('/api/ai/metadata', async (req: Request, res: Response) => {
    try {
      const result = await generateArtworkMetadata(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Metadata generation error:', err);
      res.status(500).json({ error: err.message || 'AI generation failed' });
    }
  });

  app.post('/api/ai/bio', async (req: Request, res: Response) => {
    try {
      const result = await generateArtistBio(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Bio generation error:', err);
      res.status(500).json({ error: err.message || 'AI generation failed' });
    }
  });

  app.post('/api/ai/brief', async (req: Request, res: Response) => {
    try {
      const result = await generateCommissionBrief(req.body);
      res.json(result);
    } catch (err: any) {
      console.error('Brief generation error:', err);
      res.status(500).json({ error: err.message || 'AI generation failed' });
    }
  });

  // 8. System Status & Seed Infrastructure
  app.get('/api/system/status', (req: Request, res: Response) => {
    const isDbConfigured = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder'));
    res.json({
      status: 'healthy',
      version: '1.0.0-hackathon-foundation',
      database: {
        configured: isDbConfigured,
        provider: isDbConfigured ? 'PostgreSQL' : 'Development In-Memory Repository',
        fallbackActive: !isDbConfigured,
      },
      ai: {
        configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
        model: 'gemini-3.8-flash',
      },
      auth: {
        provider: 'Auth.js / Demo Persona Engine',
        personas: ['maya', 'elena', 'kai', 'visitor'],
      },
      counts: {
        creators: storage.getCreators().length,
        artworks: storage.getArtworks().length,
      },
    });
  });

  app.post('/api/seed/reset', (req: Request, res: Response) => {
    try {
      storage.resetSeed();
      res.json({ success: true, message: 'Database state reset to pristine demo seed.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Static & Vite Middleware Integration ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ATELIER] Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start ATELIER server:', err);
  process.exit(1);
});
