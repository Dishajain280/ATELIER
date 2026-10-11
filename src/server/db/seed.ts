import type { Creator, Collection, Artwork, CommissionService, CommissionRequest } from '../../types/index.ts';

export const SEED_CREATORS: Creator[] = [
  {
    id: 'creator_maya',
    handle: 'maya',
    name: 'Maya Lin',
    email: 'studio@mayalin.atelier',
    bio: 'Sculptural ceramicist based in Kyoto and Portland. Crafting raw, wood-fired stoneware vessels that explore negative space, geological erosion, and quiet tactile ritual.',
    statement: 'My practice treats earth and ash as living collaborators. Each vessel is slowly coiled by hand and fired in an Anagama kiln for 96 hours, letting wild flame gradients crystallize into spontaneous mineral glazes.',
    avatarUrl: '/src/assets/images/atelier_artist_maya_1791384078475.jpg',
    disciplines: ['Ceramics', 'Sculptural Stoneware', 'Wood-Firing'],
    location: 'Kyoto / Portland',
    socialLinks: {
      instagram: 'https://instagram.com/mayalinstudio',
      website: 'https://mayalinstudio.art',
      email: 'maya@atelier.app'
    },
    themeSettings: {
      accentColor: '#B45309', // Warm amber / terracotta
      typography: 'editorial',
      gridStyle: 'masonry',
      palette: 'warm_paper'
    },
    acceptingCommissions: true,
    commissionNotice: 'Currently accepting 2 bespoke commissions for Autumn delivery.',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z'
  },
  {
    id: 'creator_elena',
    handle: 'elena',
    name: 'Elena Rostova',
    email: 'elena@rostovastudio.com',
    bio: 'Visual artist exploring atmospheric memory and raw linen tension through layered natural pigments and cold wax.',
    statement: 'Working with unprimed Belgian linen, I investigate the threshold where geological time intersects fleeting light.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    disciplines: ['Oil on Linen', 'Mineral Pigments', 'Cold Wax'],
    location: 'Berlin, Germany',
    socialLinks: {
      instagram: 'https://instagram.com/elenarostova.art',
      website: 'https://elenarostova.com'
    },
    themeSettings: {
      accentColor: '#475569',
      typography: 'editorial',
      gridStyle: 'bento',
      palette: 'obsidian'
    },
    acceptingCommissions: true,
    commissionNotice: 'Open for architectural-scale private residence commissions.',
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-09-20T14:30:00Z'
  },
  {
    id: 'creator_kai',
    handle: 'kai',
    name: 'Kai Takahashi',
    email: 'kai@takahashitextiles.co',
    bio: 'Fiber artist weaving monumental structural tapestries from raw undyed fleece, wild nettle, and architectural brass wire.',
    statement: 'Each woven warp is a physical recording of tempo, tension, and silence in spatial interiors.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    disciplines: ['Fiber Art', 'Tapestry', 'Woven Architecture'],
    location: 'Tokyo / Vancouver',
    socialLinks: {
      instagram: 'https://instagram.com/kai.textiles'
    },
    themeSettings: {
      accentColor: '#3F3F46',
      typography: 'sans',
      gridStyle: 'minimal',
      palette: 'ivory'
    },
    acceptingCommissions: false,
    commissionNotice: 'Waitlist open for Q1 2027 installations.',
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z'
  }
];

export const SEED_COLLECTIONS: Collection[] = [
  {
    id: 'col_ash_2026',
    creatorId: 'creator_maya',
    title: 'Earth & Ash 2026',
    description: 'A study in 96-hour Anagama firings using wild mountain clay and unrefined pine ash glaze.',
    order: 1,
    visibility: 'public',
    coverImage: '/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg',
    artworkCount: 4,
    createdAt: '2026-04-10T00:00:00Z'
  },
  {
    id: 'col_sculptural_vessels',
    creatorId: 'creator_maya',
    title: 'Architectural Vessels',
    description: 'Monolithic stoneware forms inspired by brutalist cantilever structures and geological strata.',
    order: 2,
    visibility: 'public',
    artworkCount: 3,
    createdAt: '2026-05-18T00:00:00Z'
  },
  {
    id: 'col_elena_solitude',
    creatorId: 'creator_elena',
    title: 'Silent Stratum',
    description: 'Raw linen, bone black, and natural ochre pigments gathered from the Baltic coastline.',
    order: 1,
    visibility: 'public',
    coverImage: '/src/assets/images/atelier_oil_abstract_1791384045751.jpg',
    artworkCount: 2,
    createdAt: '2026-03-12T00:00:00Z'
  }
];

export const SEED_ARTWORKS: Artwork[] = [
  {
    id: 'art_vessel_01',
    creatorId: 'creator_maya',
    collectionId: 'col_ash_2026',
    title: 'Monolith IV: Sediment & Flame',
    description: 'Hand-coiled Shigaraki stoneware vessel fired over 4 days in an unglazed wood kiln. Natural pine ash vitrified onto the shoulder creating a deep olive celadon glass droplet trail.',
    images: ['/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg'],
    medium: 'Wood-fired Shigaraki stoneware, natural ash glaze',
    dimensions: '42 x 28 x 26 cm',
    year: 2026,
    tags: ['Stoneware', 'Wood-Fired', 'Anagama', 'Vessel', 'Kyoto'],
    featured: true,
    status: 'available',
    price: 1850,
    currency: 'USD',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z'
  },
  {
    id: 'art_vessel_02',
    creatorId: 'creator_maya',
    collectionId: 'col_ash_2026',
    title: 'Canyon Lip: Pitcher No. 07',
    description: 'Earthy sculptural pitcher with exaggerated pinched spout and raw scraped exterior finish. Designed for slow decanting and architectural display.',
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=80'],
    medium: 'Black mountain stoneware, iron wash',
    dimensions: '30 x 18 x 16 cm',
    year: 2026,
    tags: ['Pitcher', 'Iron Wash', 'Black Clay'],
    featured: true,
    status: 'available',
    price: 920,
    currency: 'USD',
    createdAt: '2026-05-15T12:00:00Z',
    updatedAt: '2026-05-15T12:00:00Z'
  },
  {
    id: 'art_vessel_03',
    creatorId: 'creator_maya',
    collectionId: 'col_sculptural_vessels',
    title: 'Totem Vessel in White Slip',
    description: 'Vertical architectural cylinder with carved rhythmic fluting, coated with brushed porcelain slip and reduction fired to cone 11.',
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'],
    medium: 'Red earthenware with brushed white porcelain slip',
    dimensions: '54 x 22 x 22 cm',
    year: 2025,
    tags: ['White Slip', 'Sculptural', 'Totem', 'Porcelain'],
    featured: false,
    status: 'in_collection',
    price: 2400,
    currency: 'USD',
    createdAt: '2025-11-20T16:00:00Z',
    updatedAt: '2025-11-20T16:00:00Z'
  },
  {
    id: 'art_vessel_04',
    creatorId: 'creator_maya',
    collectionId: 'col_ash_2026',
    title: 'Offering Bowl: Ochre Basin',
    description: 'Low, wide flared bowl with tactile pitted rim. The unglazed bottom reveals coarse grog crystals collected from riverbed silt.',
    images: ['https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=1000&q=80'],
    medium: 'Coarse grogged clay, riverbed silt wash',
    dimensions: '36 x 36 x 11 cm',
    year: 2026,
    tags: ['Bowl', 'Offering', 'Grog Clay', 'Riverbed'],
    featured: false,
    status: 'sold',
    price: 680,
    currency: 'USD',
    createdAt: '2026-06-02T14:00:00Z',
    updatedAt: '2026-06-02T14:00:00Z'
  },
  {
    id: 'art_vessel_05',
    creatorId: 'creator_maya',
    collectionId: 'col_sculptural_vessels',
    title: 'Dualities: Twin Chamber Amphora',
    description: 'Interconnected twin chamber form addressing balance, tension, and shared gravity. Finished with matte feldspathic glaze.',
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80'],
    medium: 'Feldspathic glazed stoneware',
    dimensions: '48 x 32 x 24 cm',
    year: 2026,
    tags: ['Twin Chamber', 'Feldspar', 'Amphora'],
    featured: true,
    status: 'available',
    price: 3100,
    currency: 'USD',
    createdAt: '2026-07-14T09:30:00Z',
    updatedAt: '2026-07-14T09:30:00Z'
  },
  // Elena's works
  {
    id: 'art_elena_01',
    creatorId: 'creator_elena',
    collectionId: 'col_elena_solitude',
    title: 'Baltic Sediment No. 12',
    description: 'Raw unprimed linen stained with wet mineral pigments, charred birch soot, and transparent dammar varnish.',
    images: ['/src/assets/images/atelier_oil_abstract_1791384045751.jpg'],
    medium: 'Oil, bone black, and natural ochre on Belgian linen',
    dimensions: '160 x 130 cm',
    year: 2026,
    tags: ['Oil', 'Linen', 'Abstract', 'Minimalist'],
    featured: true,
    status: 'available',
    price: 4800,
    currency: 'USD',
    createdAt: '2026-04-12T10:00:00Z',
    updatedAt: '2026-04-12T10:00:00Z'
  },
  // Kai's works
  {
    id: 'art_kai_01',
    creatorId: 'creator_kai',
    title: 'Tectonic Warp: Weft in Nettle & Brass',
    description: 'Architectural wall tapestry hand-woven on a counterbalance loom using handspun nettle yarn and tensioned oxidized brass wire.',
    images: ['/src/assets/images/atelier_fiber_tapestry_1791384057846.jpg'],
    medium: 'Handspun wild nettle, undyed wool, brass wire',
    dimensions: '210 x 140 cm',
    year: 2026,
    tags: ['Tapestry', 'Fiber', 'Nettle', 'Woven'],
    featured: true,
    status: 'available',
    price: 5200,
    currency: 'USD',
    createdAt: '2026-05-10T11:00:00Z',
    updatedAt: '2026-05-10T11:00:00Z'
  }
];

export const SEED_COMMISSION_SERVICES: CommissionService[] = [
  {
    id: 'srv_vessel_custom',
    creatorId: 'creator_maya',
    title: 'Bespoke Sculptural Vessel',
    description: 'A one-of-a-kind hand-coiled stoneware vessel tailored to your interior space or table ritual. Includes consultation on clay body, scale, and wood-firing temperature.',
    basePrice: 1600,
    currency: 'USD',
    turnaroundWeeks: 6,
    revisionsIncluded: 2,
    active: true,
    sampleImages: ['/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg'],
    deliverableSummary: 'One bespoke wood-fired vessel (up to 45cm height) with signed certificate of authenticity and custom timber crate.',
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'srv_tableware_set',
    creatorId: 'creator_maya',
    title: 'Ceremonial Tea or Dining Set',
    description: 'Curated 6-to-10 piece tableware suite crafted from Kyoto dark stoneware with food-safe raw satin feldspar glazes.',
    basePrice: 2200,
    currency: 'USD',
    turnaroundWeeks: 8,
    revisionsIncluded: 2,
    active: true,
    sampleImages: ['https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=1000&q=80'],
    deliverableSummary: 'Complete customized tableware suite with custom glaze testing tiles shipped prior to production.',
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'srv_architectural_installation',
    creatorId: 'creator_maya',
    title: 'Site-Specific Architectural Installation',
    description: 'Multi-piece ceramic wall relief or sculptural plinth cluster engineered for luxury residences, hotel lobbies, and gallery collections.',
    basePrice: 6500,
    currency: 'USD',
    turnaroundWeeks: 12,
    revisionsIncluded: 3,
    active: true,
    sampleImages: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'],
    deliverableSummary: 'Site evaluation, scale drawings, sample tiles, production of relief modules, and installation hardware guidance.',
    createdAt: '2026-03-01T00:00:00Z'
  }
];

export const SEED_COMMISSION_REQUESTS: CommissionRequest[] = [
  {
    id: 'req_01',
    creatorId: 'creator_maya',
    serviceId: 'srv_vessel_custom',
    serviceTitle: 'Bespoke Sculptural Vessel',
    clientName: 'Julian Vance',
    clientEmail: 'julian@vancedesign.com',
    clientPhone: '+1 (415) 890-3321',
    brief: 'We are designing an open atrium for a residential project in Big Sur. We need a tall, weathered vessel (approx 40-45cm) with heavy ash deposition on one flank, evoking coastal sea fog and Monterey shale cliffs.',
    aiEnhancedBrief: 'Project: Big Sur Residence Atrium Centerpiece\nScale: 42cm height x 28cm width\nMedium: Dark stoneware, high ash melt\nAtmosphere: Brutalist, oceanic, coastal fog, tactile wabi-sabi\nClient Preferences: Asymmetric scorched shoulder, matte celadon pooling, heavy foot.\nDeliverable: Signed wood-fired vessel with custom plinth padding.',
    referenceImages: ['/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg'],
    budget: 1800,
    currency: 'USD',
    deadline: '2026-11-20',
    status: 'IN_REVIEW',
    statusNotes: 'Reviewed initial drawings. Sent clay test photo to client; awaiting choice between Shigaraki and black mountain clay.',
    createdAt: '2026-10-02T15:20:00Z',
    updatedAt: '2026-10-04T09:15:00Z'
  },
  {
    id: 'req_02',
    creatorId: 'creator_maya',
    serviceId: 'srv_tableware_set',
    serviceTitle: 'Ceremonial Tea or Dining Set',
    clientName: 'Sora Takahashi',
    clientEmail: 'sora@omotesando-tea.jp',
    brief: 'Looking for a bespoke 4-guest sencha tea set for our private tasting room in Omotesando. Needs 1 kyusu teapot, 1 yuzamashi cooling bowl, and 4 matching yunomi cups in unglazed dark clay with smooth interior finish.',
    aiEnhancedBrief: 'Project: Omotesando Tasting Room Sencha Suite\nSet Composition: 1 Kyusu (240ml), 1 Yuzamashi (180ml), 4 Yunomi cups (70ml each)\nFunctional Requirements: Precision multi-hole ceramic strainer, drip-free pour, satin food-safe interior glaze, tactile raw exterior.\nTarget Turnaround: 8 weeks.',
    referenceImages: [],
    budget: 2400,
    currency: 'USD',
    deadline: '2026-12-10',
    status: 'RECEIVED',
    statusNotes: 'New inbound inquiry. Client provided tasting room dimensions and water mineral specifications.',
    createdAt: '2026-10-06T18:40:00Z',
    updatedAt: '2026-10-06T18:40:00Z'
  }
];
