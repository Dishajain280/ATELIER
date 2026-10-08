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

  const CreateCreatorSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    handle: z.string().min(2, 'Handle must be at least 2 characters'),
    bio: z.string().min(1, 'Bio is required'),
    avatarUrl: z.string().default(''),
    socialLinks: z.record(z.string(), z.string().optional()).optional(),
    themeSettings: z.object({
      accentColor: z.string().optional(),
      typography: z.enum(['editorial', 'sans', 'classic']).optional(),
      gridStyle: z.enum(['masonry', 'bento', 'minimal']).optional(),
    }).optional(),
  });

  app.post('/api/creators', (req: Request, res: Response) => {
    try {
      const parsed = CreateCreatorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
      }
      const created = storage.createCreator(parsed.data as any);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  const UpdateCreatorSchema = z.object({
    name: z.string().min(1).optional(),
    handle: z.string().min(2).optional(),
    bio: z.string().optional(),
    statement: z.string().optional(),
    avatarUrl: z.string().optional(),
    disciplines: z.array(z.string()).optional(),
    location: z.string().optional(),
    socialLinks: z.record(z.string(), z.string().optional()).optional(),
    themeSettings: z.object({
      accentColor: z.string().optional(),
      typography: z.enum(['editorial', 'sans', 'classic']).optional(),
      gridStyle: z.enum(['masonry', 'bento', 'minimal']).optional(),
    }).optional(),
    acceptingCommissions: z.boolean().optional(),
    commissionNotice: z.string().optional(),
  });

  // Helper to extract requester creator id for ownership checks
  function getRequesterCreatorId(req: Request): string | undefined {
    return (req.headers['x-creator-id'] as string) || (req.query.creatorId as string) || (req.body?.creatorId as string);
  }

  app.patch('/api/creators/:id', (req: Request, res: Response) => {
    try {
      const requesterId = req.headers['x-creator-id'] as string;
      if (requesterId && requesterId !== req.params.id) {
        return res.status(403).json({ error: 'Unauthorized: Cannot modify another creator profile' });
      }
      const parsed = UpdateCreatorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
      }
      const updated = storage.updateCreator(req.params.id, parsed.data as any);
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
    title: z.string().min(1),
    description: z.string().optional(),
    order: z.number().default(0),
    visibility: z.enum(['public', 'archived', 'unlisted']).default('public'),
    coverImage: z.string().optional(),
  });

  app.post('/api/collections', (req: Request, res: Response) => {
    try {
      const parsed = CreateCollectionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
      }
      const requesterId = req.headers['x-creator-id'] as string;
      if (requesterId && requesterId !== parsed.data.creatorId) {
        return res.status(403).json({ error: 'Unauthorized: Cannot create collection for another creator' });
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
      if (requesterId && existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this collection' });
      }
      const updated = storage.updateCollection(req.params.id, req.body);
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
      if (requesterId && existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this collection' });
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
    title: z.string().min(1, 'Title is required'),
    description: z.string().default(''),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    medium: z.string().min(1, 'Medium is required'),
    dimensions: z.string().optional(),
    year: z.number().default(new Date().getFullYear()),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: z.enum(['available', 'in_collection', 'sold', 'archived', 'draft']).default('available'),
    price: z.number().optional(),
    currency: z.string().default('USD'),
  });

  app.post('/api/artworks', (req: Request, res: Response) => {
    try {
      const parsed = CreateArtworkSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
      }
      const requesterId = req.headers['x-creator-id'] as string;
      if (requesterId && requesterId !== parsed.data.creatorId) {
        return res.status(403).json({ error: 'Unauthorized: Cannot create artwork for another creator' });
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
      if (requesterId && existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this artwork' });
      }
      const updated = storage.updateArtwork(req.params.id, req.body);
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
      if (requesterId && existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this artwork' });
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
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    basePrice: z.number().min(0, 'Base price must be positive'),
    currency: z.string().default('USD'),
    turnaroundWeeks: z.number().min(1).default(4),
    revisionsIncluded: z.number().min(0).default(2),
    active: z.boolean().default(true),
    sampleImages: z.array(z.string()).default([]),
    deliverableSummary: z.string().default(''),
  });

  app.post('/api/services', (req: Request, res: Response) => {
    try {
      const parsed = CreateServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
      }
      const requesterId = req.headers['x-creator-id'] as string;
      if (requesterId && requesterId !== parsed.data.creatorId) {
        return res.status(403).json({ error: 'Unauthorized: Cannot create service for another creator' });
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
      if (requesterId && existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this service' });
      }
      const updated = storage.updateService(req.params.id, req.body);
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
      if (requesterId && existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this service' });
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
        return res.status(400).json({ error: 'creatorId is required' });
      }
      const requesterId = req.headers['x-creator-id'] as string;
      if (requesterId && requesterId !== creatorId) {
        return res.status(403).json({ error: 'Unauthorized: Cannot access private commission inbox of another creator' });
      }
      const commissions = storage.getCommissions(creatorId);
      res.json(commissions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const CreateCommissionSchema = z.object({
    creatorId: z.string().min(1),
    serviceId: z.string().nullable().optional(),
    serviceTitle: z.string().optional(),
    clientName: z.string().min(1, 'Name is required'),
    clientEmail: z.string().email('Valid email is required'),
    clientPhone: z.string().optional(),
    brief: z.string().min(10, 'Please provide more detail in your brief'),
    aiEnhancedBrief: z.string().optional(),
    referenceImages: z.array(z.string()).default([]),
    budget: z.number().min(0).default(0),
    currency: z.string().default('USD'),
    deadline: z.string().optional(),
    intendedUse: z.string().optional(),
  });

  app.post('/api/commissions', (req: Request, res: Response) => {
    try {
      const parsed = CreateCommissionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
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
    statusNotes: z.string().optional(),
  });

  app.patch('/api/commissions/:id/status', (req: Request, res: Response) => {
    try {
      const existing = storage.getCommissionById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Commission request not found' });
      }
      const requesterId = getRequesterCreatorId(req);
      if (requesterId && existing.creatorId !== requesterId) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this commission inquiry' });
      }
      const parsed = UpdateCommissionStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
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
