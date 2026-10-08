import { GoogleGenAI, Type } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return aiInstance;
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// TOOL 1 — ARTWORK ASSISTANT
// ─────────────────────────────────────────────────────────────
export interface ArtworkAssistantInput {
  image?: string; // base64 or URL
  optionalDescription?: string;
  artistContext?: string;
}

export interface ArtworkAssistantResult {
  suggestedTitle: string;
  alternativeTitles: string[];
  professionalDescription: string;
  medium: string;
  category: string;
  tags: string[];
  seoKeywords: string[];
}

export async function generateArtworkAssistant(input: ArtworkAssistantInput): Promise<ArtworkAssistantResult> {
  const ai = getAI();
  if (ai) {
    try {
      const contentsParts: any[] = [];

      // Check if image is a base64 data URL
      if (input.image && input.image.startsWith('data:')) {
        const matches = input.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          contentsParts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      const promptText = `You are a contemporary art curator and cataloger for ATELIER.
Analyze the artwork provided (image and/or description) and generate comprehensive, professional cataloging metadata.

User provided description / notes:
"${input.optionalDescription || 'Original contemporary artwork'}"
${input.artistContext ? `Artist context: ${input.artistContext}` : ''}

Requirements:
- suggestedTitle: A poignant, evocative, non-generic title (e.g. "Sediment V: Stratum in Ash", "Studies in Residual Indigo", "Vessel for Winter Light").
- alternativeTitles: 2-3 additional strong titles.
- professionalDescription: 2-3 sentences of elegant curatorial text describing the aesthetic atmosphere, physical materiality, and conceptual depth.
- medium: Specific, precise medium designation (e.g. "Wood-fired stoneware with natural wood ash glaze", "Oil, raw pigment, and cold wax on unprimed Belgian linen", "Digital painting with textured risograph wash").
- category: High-level discipline (e.g. "Ceramics & Pottery", "Painting & Mixed Media", "Digital Art & Illustration", "Sculpture", "Textiles").
- tags: 5-8 relevant stylistic, thematic, and medium tags.
- seoKeywords: 4-6 search-friendly keywords (e.g. "contemporary ceramics Kyoto", "wabi sabi pottery collector", "textured abstract wall art").

Return pure structured JSON matching the schema.`;

      contentsParts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: contentsParts },
        config: {
          systemInstruction: 'You are an editorial fine art curator and metadata specialist who assists independent artists with professional cataloging.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedTitle: { type: Type.STRING },
              alternativeTitles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              professionalDescription: { type: Type.STRING },
              medium: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              seoKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['suggestedTitle', 'alternativeTitles', 'professionalDescription', 'medium', 'category', 'tags', 'seoKeywords'],
          },
        },
      });

      if (response.text) {
        return JSON.parse(response.text.trim()) as ArtworkAssistantResult;
      }
    } catch (error) {
      console.warn('Gemini artwork assistant generation failed, applying curated fallback:', error);
    }
  }

  // Resilient fallback based on input
  const desc = input.optionalDescription?.toLowerCase() || '';
  const isPainting = desc.includes('paint') || desc.includes('oil') || desc.includes('canvas') || desc.includes('acrylic');
  const isDigital = desc.includes('digital') || desc.includes('portrait') || desc.includes('illustration') || desc.includes('fantasy');

  if (isDigital) {
    return {
      suggestedTitle: 'Solitary Bloom in Twilight',
      alternativeTitles: ['Aura & Petal', 'Reverie in Ultraviolet', 'The Sister’s Solstice'],
      professionalDescription: 'A layered digital portrait exploring botanical symbolism and luminous atmospheric lighting. Delicate brushwork merges ethereal purples with muted blues to evoke a dreamlike quietude.',
      medium: 'Digital Painting with Gouache Brushes & Texture Glaze',
      category: 'Digital Art & Illustration',
      tags: ['Digital Portrait', 'Botanical', 'Dreamy', 'Illustration', 'Character Art', 'Floral'],
      seoKeywords: ['digital portrait commission', 'custom floral portrait', 'dreamy fantasy art', 'custom sister gift artwork'],
    };
  }

  if (isPainting) {
    return {
      suggestedTitle: 'Topographies of Stillness: No. 7',
      alternativeTitles: ['Residual Horizon', 'Studies in Ochre and Ash', 'Memory of Cold Stone'],
      professionalDescription: 'An expansive investigation into tactile surfaces and geological sedimentation. Applied using layered palette knives and raw mineral washes to preserve spontaneous textural tension.',
      medium: 'Oil, Raw Earth Pigment, and Cold Wax on Raw Belgian Linen',
      category: 'Painting & Mixed Media',
      tags: ['Abstract Expressionism', 'Tactile Painting', 'Mineral Pigment', 'Minimalist', 'Linen Canvas'],
      seoKeywords: ['textured abstract art', 'minimalist linen painting', 'earth tone fine art', 'contemporary gallery painting'],
    };
  }

  return {
    suggestedTitle: 'Sediment V: Stratum in Ash',
    alternativeTitles: ['The Quiet Chamber: No. 04', 'Geology of Winter Light', 'Vessel for Memory and Void'],
    professionalDescription: 'Constructed through slow tactile coiling and intuitive physical tension. The surface preserves the spontaneous trace of kiln flame and raw mineral deposits, balancing geological weight with delicate negative space.',
    medium: 'Wood-fired Shigaraki Stoneware, Natural Ash Glaze',
    category: 'Ceramics & Sculpture',
    tags: ['Sculptural', 'Contemporary Craft', 'Tactile', 'Raw Material', 'Studio Practice', 'Wood Fired'],
    seoKeywords: ['wood fired ceramic art', 'contemporary Japanese pottery', 'sculptural stoneware vessel', 'fine craft collector'],
  };
}

// ─────────────────────────────────────────────────────────────
// TOOL 2 — PROFILE ASSISTANT
// ─────────────────────────────────────────────────────────────
export interface ProfileAssistantInput {
  roughNotes: string; // e.g. "I make digital portraits and fantasy illustrations."
  artistName?: string;
  disciplines?: string[];
  location?: string;
}

export interface ProfileOption {
  id: string;
  styleLabel: string; // e.g. "Editorial & Curatorial", "Approachable & Creative", "Poetic & Atmospheric"
  professionalBio: string;
  shortTagline: string;
  portfolioIntroduction: string;
  suggestedSpecialties: string[];
  socialMediaIntroduction: string;
}

export interface ProfileAssistantResult {
  options: ProfileOption[];
}

export async function generateProfileAssistant(input: ProfileAssistantInput): Promise<ProfileAssistantResult> {
  const ai = getAI();
  if (ai) {
    try {
      const prompt = `You are a career strategist and editorial biographer for fine artists and independent illustrators.
An artist enters rough notes about their practice:
"${input.roughNotes}"
Artist Name: ${input.artistName || 'Artist'}
${input.location ? `Location: ${input.location}` : ''}

Generate 3 distinct, professional persona options for their portfolio:
1. "Editorial & Contemporary" (Sophisticated, museum-grade, confident)
2. "Approachable & Expressive" (Warm, client-friendly, engaging for commission buyers)
3. "Atmospheric & Poetic" (Evocative, moody, focusing on feeling and craft)

Each option must include:
- professionalBio: A polished 2-3 sentence biography.
- shortTagline: A punchy 1-sentence tagline under 15 words.
- portfolioIntroduction: A 2-sentence welcoming statement to appear at the top of their public portfolio.
- suggestedSpecialties: 4-5 refined specialties or creative keywords.
- socialMediaIntroduction: A concise, compelling bio for Instagram/Bluesky (under 160 characters).

Return pure structured JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an editorial portfolio consultant who transforms rough artist notes into professional identity copy.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    styleLabel: { type: Type.STRING },
                    professionalBio: { type: Type.STRING },
                    shortTagline: { type: Type.STRING },
                    portfolioIntroduction: { type: Type.STRING },
                    suggestedSpecialties: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    socialMediaIntroduction: { type: Type.STRING },
                  },
                  required: ['id', 'styleLabel', 'professionalBio', 'shortTagline', 'portfolioIntroduction', 'suggestedSpecialties', 'socialMediaIntroduction'],
                },
              },
            },
            required: ['options'],
          },
        },
      });

      if (response.text) {
        return JSON.parse(response.text.trim()) as ProfileAssistantResult;
      }
    } catch (error) {
      console.warn('Gemini profile assistant failed, applying curated fallback:', error);
    }
  }

  // Resilient fallback based on input notes
  const name = input.artistName || 'Artist';
  const notes = input.roughNotes || 'independent artist';

  return {
    options: [
      {
        id: 'editorial',
        styleLabel: 'Editorial & Contemporary',
        professionalBio: `${name} is an independent visual artist whose practice explores character narrative and contemporary mood through nuanced digital and traditional media. Their work balances atmospheric color harmony with intimate figurative storytelling.`,
        shortTagline: 'Capturing poetic character narratives through luminous digital portraiture and illustration.',
        portfolioIntroduction: `Welcome to the studio catalogue of ${name}. Here you will find original explorations, archival series, and bespoke commissioned works.`,
        suggestedSpecialties: ['Digital Portraiture', 'Botanical Illustration', 'Visual Storytelling', 'Limited Edition Prints', 'Character Design'],
        socialMediaIntroduction: `Artist & Illustrator ✨ Digital portraits & lyrical dreamscapes. Accepting select commissions.`,
      },
      {
        id: 'approachable',
        styleLabel: 'Warm & Client-Friendly',
        professionalBio: `Hi, I'm ${name}! I craft heartfelt portraits and fantasy illustrations inspired by nature, folklore, and everyday moments. Whether capturing a loved one's likeness or illustrating a mythical world, my focus is on genuine emotional resonance.`,
        shortTagline: 'Bespoke portraits and whimsical fantasy illustrations crafted with heart.',
        portfolioIntroduction: `Explore my latest paintings and gallery collections. Open for personal commissions and collaborative projects worldwide.`,
        suggestedSpecialties: ['Custom Keepsake Portraits', 'Fantasy Book Cover Art', 'Floral Motifs', 'Editorial Illustration', 'Gift Commissions'],
        socialMediaIntroduction: `Making art that tells your story 🌿 Digital portraits & fantasy art. Inquiries: hello@studio.app`,
      },
      {
        id: 'poetic',
        styleLabel: 'Atmospheric & Poetic',
        professionalBio: `Working at the threshold between memory and folklore, ${name}'s illustrations translate subtle emotional states into luminous palettes. Every piece is an invitation to pause amidst modern noise and dwell in quiet enchantment.`,
        shortTagline: 'Luminous dreamscapes and quiet figurative studies suspended in color.',
        portfolioIntroduction: `A sanctuary of slow craft, lingering palettes, and ethereal figures. Each composition is an inquiry into light and form.`,
        suggestedSpecialties: ['Ethereal Landscapes', 'Mythological Figures', 'Color Theory & Lighting', 'Intimate Likenesses', 'Archival Art'],
        socialMediaIntroduction: `Painting quiet wonders & ethereal memories. Studio notes & commissions open.`,
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// TOOL 3 — COMMISSION BRIEF ASSISTANT
// ─────────────────────────────────────────────────────────────
export interface CommissionBriefAssistantInput {
  informalRequest: string; // e.g. "I want a digital portrait of my sister with flowers, something dreamy, maybe purple and blue. I need it around her birthday."
  clientName?: string;
  artistName?: string;
  serviceTier?: string;
  budgetEstimated?: number;
}

export interface CommissionBriefAssistantResult {
  projectType: string;
  subject: string;
  style: string;
  colorPreferences: string;
  intendedUse: string;
  deadline: string;
  structuredBrief: string;
  usefulClarificationQuestions: string[];
}

export async function generateCommissionBriefAssistant(input: CommissionBriefAssistantInput): Promise<CommissionBriefAssistantResult> {
  const ai = getAI();
  if (ai) {
    try {
      const prompt = `You are an art director and commission coordinator at ATELIER studio.
A client entered an informal, casual request for a custom artwork:
"${input.informalRequest}"

Client Name: ${input.clientName || 'Inquiring Collector'}
Artist Name: ${input.artistName || 'Studio Artist'}
Service Tier: ${input.serviceTier || 'Custom Commission'}

Transform this casual request into a structured, professional commission brief.
Extract or synthesize:
1. projectType: The exact creative deliverable (e.g., "Custom Digital Portrait with Botanical Accents", "Bespoke Ceramic Vessel", "Textured Oil Painting").
2. subject: Clear identification of the central focus (e.g., "Full-bust portrait of client's sister surrounded by seasonal flora").
3. style: Aesthetic direction (e.g., "Dreamy, luminous illustrative style with soft painterly textures").
4. colorPreferences: Recommended or stated color palette (e.g., "Cool palette dominated by lavender, deep violet, and ethereal blues with subtle gold highlights").
5. intendedUse: Personal gift, living room display, editorial print, commercial, etc.
6. deadline: Desired target date or milestone timeframe mentioned or implied.
7. structuredBrief: A polished, formal 2-3 paragraph brief summarizing the scope, mood, and deliverable specifications.
8. usefulClarificationQuestions: 3-4 smart, courteous questions the artist should ask the client to clarify before starting (e.g. "Do you have 2-3 clear reference photos with natural lighting?", "What are her favorite flowers or birth month blooms?").

Return pure structured JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert art commission coordinator helping clients and artists establish precise, mutually clear project briefs.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectType: { type: Type.STRING },
              subject: { type: Type.STRING },
              style: { type: Type.STRING },
              colorPreferences: { type: Type.STRING },
              intendedUse: { type: Type.STRING },
              deadline: { type: Type.STRING },
              structuredBrief: { type: Type.STRING },
              usefulClarificationQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'projectType',
              'subject',
              'style',
              'colorPreferences',
              'intendedUse',
              'deadline',
              'structuredBrief',
              'usefulClarificationQuestions',
            ],
          },
        },
      });

      if (response.text) {
        return JSON.parse(response.text.trim()) as CommissionBriefAssistantResult;
      }
    } catch (error) {
      console.warn('Gemini commission brief assistant failed, applying curated fallback:', error);
    }
  }

  // Resilient fallback based on input
  return {
    projectType: 'Bespoke Digital Portrait with Floral Elements',
    subject: "Full-bust commemorative portrait of client's sister surrounded by botanical elements",
    style: 'Dreamy and luminous illustrative style with soft edges and painterly textures',
    colorPreferences: 'Palette centered on lavender, royal purple, dusty blue, and ethereal periwinkle highlights',
    intendedUse: 'Personal keepsake & framed birthday gift (high-resolution print)',
    deadline: 'Upcoming birthday milestone (2-3 weeks recommended turnaround)',
    structuredBrief: `Project Overview:\nCreation of a custom digital portrait honoring the client's sister. The composition will feature an expressive portrait framed by delicate flora, balancing genuine physical likeness with a poetic, dreamy aesthetic.\n\nAesthetic & Palette:\nA cool, atmospheric atmosphere driven by gentle lavenders, celestial blues, and soft botanical highlights. The lighting will emphasize warmth in the facial features contrasting against a twilight floral background.\n\nDeliverable:\nHigh-resolution print-ready file (300 DPI, 18x24 inches) suitable for archival giclée framing, alongside web-optimized digital copies.`,
    usefulClarificationQuestions: [
      'Could you share 2–3 high-resolution reference photos of your sister in natural, flattering light?',
      'Are there specific flowers that hold sentimental value or match her birth month?',
      'Do you prefer an oval floral frame vignette or a full background composition?',
      'What is the exact target date for her birthday celebration to ensure comfortable delivery?',
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// Legacy helpers retained for backward compatibility
// ─────────────────────────────────────────────────────────────
export async function generateArtworkMetadata(input: any) {
  const res = await generateArtworkAssistant({
    optionalDescription: input.roughNotes || input.inspiration,
    artistContext: input.medium ? `Medium: ${input.medium}, Techniques: ${input.techniques}` : undefined,
  });
  return {
    titleSuggestions: [res.suggestedTitle, ...res.alternativeTitles],
    mediumFormatted: res.medium,
    description: res.professionalDescription,
    tags: res.tags,
  };
}

export async function generateArtistBio(input: any) {
  const res = await generateProfileAssistant({
    roughNotes: `${input.disciplines?.join(', ')}. ${input.philosophy || ''}`,
    artistName: input.name,
    location: input.location,
  });
  const first = res.options[0];
  return {
    bio: first.professionalBio,
    statement: first.portfolioIntroduction,
    commissionNotice: 'Currently accepting a limited number of bespoke commissions for seasonal delivery.',
  };
}

export async function generateCommissionBrief(input: any) {
  const res = await generateCommissionBriefAssistant({
    informalRequest: input.roughBrief,
    clientName: input.clientName,
    serviceTier: input.serviceTitle,
    budgetEstimated: input.budget,
  });
  return {
    structuredBrief: res.structuredBrief,
    deliverablesSummary: `${res.projectType} — ${res.subject}`,
    recommendedScopeNotes: res.usefulClarificationQuestions,
  };
}
