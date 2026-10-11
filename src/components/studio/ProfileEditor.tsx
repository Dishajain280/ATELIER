import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Save, 
  CheckCircle2, 
  LayoutGrid, 
  Palette as PaletteIcon, 
  Type, 
  Shield, 
  Volume2, 
  Layout, 
  Eye,
  Paintbrush,
  Monitor,
  Smartphone,
  Maximize2,
  Check,
  MapPin
} from 'lucide-react';
import { Creator } from '../../types/index.js';
import { api } from '../../services/api.js';
import { validateAndNormalizeUrl } from '../../lib/linkSanitizer.js';

const ACCENT_SWATCHES = [
  { name: 'Raw Ochre', hex: '#B45309', desc: 'Warm earth pigment' },
  { name: 'Terracotta Clay', hex: '#C2410C', desc: 'Fired terracotta stoneware' },
  { name: 'Saffron Gold', hex: '#D97706', desc: 'Luminous curatorial gold' },
  { name: 'Cobalt Glaze', hex: '#2563EB', desc: 'Porcelain cobalt oxide' },
  { name: 'Celadon Jade', hex: '#059669', desc: 'Japanese celadon stoneware' },
  { name: 'Crimson Lacquer', hex: '#BE123C', desc: 'Refined vermillion pigment' },
  { name: 'Archival Slate', hex: '#475569', desc: 'Neutral gallery concrete' },
  { name: 'Studio Noir', hex: '#18181B', desc: 'Monochrome architectural black' },
];

interface ProfileEditorProps {
  creator: Creator;
  onRefresh: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  creator,
  onRefresh,
}) => {
  const [name, setName] = useState(creator.name);
  const [handle, setHandle] = useState(creator.handle);
  const [location, setLocation] = useState(creator.location);
  const [disciplines, setDisciplines] = useState(creator.disciplines.join(', '));
  const [bio, setBio] = useState(creator.bio);
  const [statement, setStatement] = useState(creator.statement);
  const [commissionNotice, setCommissionNotice] = useState(creator.commissionNotice || '');
  const [acceptingCommissions, setAcceptingCommissions] = useState(creator.acceptingCommissions);
  const [instagram, setInstagram] = useState(creator.socialLinks.instagram || '');
  const [website, setWebsite] = useState(creator.socialLinks.website || '');
  const [accentColor, setAccentColor] = useState(creator.themeSettings.accentColor || '#B45309');
  
  // Advanced Portfolio Customization States
  const [gridStyle, setGridStyle] = useState<'editorial' | 'bento' | 'masonry' | 'minimal'>(creator.themeSettings.gridStyle || 'bento');
  const [palette, setPalette] = useState<'obsidian' | 'warm_paper' | 'brutalism' | 'ivory'>(creator.themeSettings.palette || 'obsidian');
  const [typography, setTypography] = useState<'editorial' | 'sans' | 'classic'>(creator.themeSettings.typography || 'editorial');
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(creator.themeSettings.watermarkEnabled ?? false);
  const [ambientSoundscape, setAmbientSoundscape] = useState<'none' | 'lofi'>(['none', 'lofi'].includes(creator.themeSettings.ambientSoundscape as any) ? (creator.themeSettings.ambientSoundscape as any) : 'none');
  const [heroStyle, setHeroStyle] = useState<'immersive' | 'typographic' | 'asymmetrical'>(creator.themeSettings.heroStyle || 'immersive');
  const [showSocialsInHero, setShowSocialsInHero] = useState<boolean>(creator.themeSettings.showSocialsInHero ?? true);
  const [curatorBadgeText, setCuratorBadgeText] = useState<string>(creator.themeSettings.curatorBadgeText || 'Available for Autumn Exhibitions');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // AI Assistant states
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAIBio = async () => {
    setIsGeneratingBio(true);
    setErrorMessage('');
    try {
      const parsedDisciplines = disciplines.split(',').map(d => d.trim()).filter(Boolean);
      const res = await api.generateArtistBio({
        name,
        disciplines: parsedDisciplines.length ? parsedDisciplines : ['Contemporary Craft'],
        location,
        philosophy: statement || 'Wabi-sabi tactile craft, natural earth materials',
      });

      if (res.bio) setBio(res.bio);
      if (res.statement) setStatement(res.statement);
      if (res.commissionNotice) setCommissionNotice(res.commissionNotice);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('AI bio assistant failed, you can edit manually.');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      if (name.trim().length > 100) {
        setErrorMessage('Name cannot exceed 100 characters.');
        setIsSaving(false);
        return;
      }
      if (bio.trim().length > 1000) {
        setErrorMessage('Biography cannot exceed 1,000 characters.');
        setIsSaving(false);
        return;
      }
      if (statement.trim().length > 3000) {
        setErrorMessage('Curatorial statement cannot exceed 3,000 characters.');
        setIsSaving(false);
        return;
      }
      if (commissionNotice.trim().length > 500) {
        setErrorMessage('Commission intake notice cannot exceed 500 characters.');
        setIsSaving(false);
        return;
      }

      let sanitizedInstagram: string | undefined = undefined;
      if (instagram.trim()) {
        const instaCheck = validateAndNormalizeUrl(instagram.trim());
        if (!instaCheck.valid) {
          setErrorMessage(instaCheck.error || 'Invalid Instagram URL format.');
          setIsSaving(false);
          return;
        }
        sanitizedInstagram = instaCheck.normalized;
      }

      let sanitizedWebsite: string | undefined = undefined;
      if (website.trim()) {
        const webCheck = validateAndNormalizeUrl(website.trim());
        if (!webCheck.valid) {
          setErrorMessage(webCheck.error || 'Invalid Website URL format.');
          setIsSaving(false);
          return;
        }
        sanitizedWebsite = webCheck.normalized;
      }

      const parsedDisciplines = disciplines
        .split(',')
        .map(d => d.trim())
        .filter(Boolean)
        .slice(0, 20);

      await api.updateCreator(creator.id, {
        name: name.trim().slice(0, 100),
        handle: handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        location: location.trim().slice(0, 100),
        disciplines: parsedDisciplines,
        bio: bio.trim().slice(0, 1000),
        statement: statement.trim().slice(0, 3000),
        commissionNotice: commissionNotice.trim() ? commissionNotice.trim().slice(0, 500) : undefined,
        acceptingCommissions,
        socialLinks: {
          instagram: sanitizedInstagram,
          website: sanitizedWebsite,
        },
        themeSettings: {
          ...creator.themeSettings,
          accentColor,
          gridStyle,
          palette,
          typography,
          watermarkEnabled,
          ambientSoundscape,
          heroStyle,
          showSocialsInHero,
          curatorBadgeText,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-neutral-900">
            Artist Identity & Advanced Portfolio Customization
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure your canonical link (<code className="font-mono text-neutral-800">atelier.app/@{handle}</code>), curatorial skins, and public portfolio layout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Profile Live</span>
          </button>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xs border border-emerald-200 font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Published Successfully</span>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Identity Settings */}
        <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Creator Identity & Statement</h3>
            <button
              type="button"
              onClick={handleAIBio}
              disabled={isGeneratingBio}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isGeneratingBio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>AI Curator Bio & Statement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Studio / Artist Name *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Canonical URL Handle *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-neutral-100 border border-r-0 border-neutral-300 text-neutral-500 text-xs font-mono rounded-l-xs">
                  atelier.app/@
                </span>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-r-xs focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Location (City / Studio Base)
              </label>
              <input
                type="text"
                maxLength={100}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Disciplines (comma separated)
              </label>
              <input
                type="text"
                maxLength={200}
                value={disciplines}
                onChange={(e) => setDisciplines(e.target.value)}
                placeholder="Ceramics, Sculpture, Wood-firing"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Curatorial Artist Statement
            </label>
            <textarea
              rows={4}
              maxLength={3000}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Deep artistic philosophy and exploration of form, material, and light..."
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-editorial text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Artist Biography (About Paragraph)
            </label>
            <textarea
              rows={3}
              maxLength={1000}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Third-person professional biography detailing studio background and focus..."
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed"
            />
          </div>
        </div>

        {/* Advanced Portfolio Customization: Grid Layouts, Curator Palettes, Typography, Hero Art Direction, Watermarking & Soundscapes */}
        <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <LayoutGrid className="w-4 h-4 text-neutral-800" />
            <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">Advanced Portfolio Customization & Layouts</h3>
          </div>

          {/* Hero Layout & Typography */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2">
              Hero Art Direction & Layout Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'immersive', label: 'Immersive Banner', desc: 'Fullscreen hero photography backdrop' },
                { id: 'typographic', label: 'Typographic Manifesto', desc: 'Clean high-impact editorial typography' },
                { id: 'asymmetrical', label: 'Asymmetrical Split', desc: 'Dynamic curator split-screen layout' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHeroStyle(item.id as any)}
                  className={`p-3 text-left border rounded-xs transition-all ${
                    heroStyle === item.id
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-900'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase">{item.label}</p>
                  <p className={`text-[10px] mt-0.5 ${heroStyle === item.id ? 'text-neutral-300' : 'text-neutral-500'}`}>{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout Switcher */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2">
              Instant Grid & Layout Switcher
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'bento', label: 'Bento Grid', desc: 'Modern asymmetric tiles' },
                { id: 'editorial', label: 'Editorial Magazine', desc: 'High-fashion typography & ratios' },
                { id: 'masonry', label: 'Masonry Gallery', desc: 'Dynamic column flow' },
                { id: 'minimal', label: 'Minimalist Clean', desc: 'Uncluttered whitespace' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGridStyle(item.id as any)}
                  className={`p-3 text-left border rounded-xs transition-all ${
                    gridStyle === item.id
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-900'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase">{item.label}</p>
                  <p className={`text-[10px] mt-0.5 ${gridStyle === item.id ? 'text-neutral-300' : 'text-neutral-500'}`}>{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Curator Color Palettes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2">
              Curator Signature Color Palettes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'obsidian', label: 'Midnight Obsidian', bg: 'bg-neutral-950 text-white', desc: 'Deep museum black' },
                { id: 'warm_paper', label: 'Warm Gallery Paper', bg: 'bg-stone-100 text-stone-900', desc: 'Organic stone & cream' },
                { id: 'brutalism', label: 'Architectural Brutalism', bg: 'bg-zinc-900 text-amber-500', desc: 'Raw concrete & gold' },
                { id: 'ivory', label: 'Studio Ivory', bg: 'bg-neutral-50 text-neutral-900 border-neutral-300', desc: 'Pristine gallery white' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPalette(item.id as any)}
                  className={`p-3 text-left border rounded-xs transition-all cursor-pointer ${item.bg} ${
                    palette === item.id ? 'ring-2 ring-neutral-900 ring-offset-2' : 'border-neutral-300 opacity-90 hover:opacity-100'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase">{item.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Accent Configurations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider">
                Color Accent Configuration
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-500 uppercase">{accentColor}</span>
                <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs" style={{ backgroundColor: accentColor }}></span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 font-light mb-3">
              Defines the primary interactive emphasis color across buttons, curatorial badges, blockquote lines, and links.
            </p>

            {/* Curated Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
              {ACCENT_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => setAccentColor(swatch.hex)}
                  className={`p-2.5 border rounded-xs text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    accentColor.toLowerCase() === swatch.hex.toLowerCase()
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-900'
                  }`}
                >
                  <span 
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">{swatch.name}</p>
                    <p className={`text-[10px] font-mono truncate ${accentColor.toLowerCase() === swatch.hex.toLowerCase() ? 'text-neutral-300' : 'text-neutral-400'}`}>
                      {swatch.hex}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Hex Color Picker */}
            <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xs">
              <div className="relative flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-xs border border-neutral-300 cursor-pointer p-0.5 bg-white"
                  title="Choose custom accent color"
                />
                <span className="text-xs font-medium text-neutral-700">Custom Accent Picker:</span>
              </div>
              <input
                type="text"
                maxLength={7}
                value={accentColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('#') || val === '') {
                    setAccentColor(val);
                  } else {
                    setAccentColor('#' + val);
                  }
                }}
                placeholder="#B45309"
                className="w-28 px-2.5 py-1 text-xs font-mono bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              />
              <span className="text-[11px] text-neutral-500 font-light hidden sm:inline">
                Enter any custom studio hex code
              </span>
            </div>
          </div>

          {/* Typography Pairings */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2">
              Gallery Typography Pairing
            </label>
            <p className="text-xs text-neutral-500 font-light mb-3">
              Controls typeface scales, line rhythms, and body pairing throughout your public portfolio exhibition.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  id: 'editorial', 
                  label: 'Editorial Serif', 
                  font: 'font-editorial', 
                  badge: 'Display Serif',
                  sample: 'Graceful high-contrast serif display paired with clean neutral reading rhythm',
                  details: 'EB Garamond + Contemporary Sans'
                },
                { 
                  id: 'sans', 
                  label: 'Modern Sans', 
                  font: 'font-sans', 
                  badge: 'Swiss Grotesque',
                  sample: 'Pristine architectural sans-serif with geometric precision and open tracking',
                  details: 'Plus Jakarta Sans Geometric'
                },
                { 
                  id: 'classic', 
                  label: 'Classic Monograph', 
                  font: 'font-mono', 
                  badge: 'Archival Mono',
                  sample: 'Refined archival monospaced aesthetic tailored for historical catalogs & monographs',
                  details: 'Typewriter Monospace'
                },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTypography(item.id as any)}
                  className={`p-3.5 text-left border rounded-xs transition-all cursor-pointer ${
                    typography === item.id
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold uppercase">{item.label}</p>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs ${typography === item.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className={`text-xs italic leading-relaxed ${item.font} ${typography === item.id ? 'text-neutral-200' : 'text-neutral-800'}`}>
                    "{item.sample}"
                  </p>
                  <p className={`text-[10px] font-mono mt-2 pt-2 border-t ${typography === item.id ? 'border-white/10 text-neutral-400' : 'border-neutral-100 text-neutral-400'}`}>
                    {item.details}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================
              REAL-TIME INTERACTIVE PORTFOLIO PREVIEW PANE
          ======================================================== */}
          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Real-Time Public Portfolio Theme Simulator
                </span>
                <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-xs">
                  Live Preview
                </span>
              </div>

              {/* Viewport & Expand Controls */}
              <div className="flex items-center gap-2">
                <div className="bg-neutral-100 p-0.5 rounded-xs flex items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-2.5 py-1 rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewViewport === 'desktop' ? 'bg-white text-neutral-900 shadow-xs font-medium' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-2.5 py-1 rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewViewport === 'mobile' ? 'bg-white text-neutral-900 shadow-xs font-medium' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xs transition-colors cursor-pointer"
                  title="Expand Fullscreen Preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Public Portfolio Canvas */}
            <div className="bg-neutral-900/5 p-4 sm:p-6 rounded-xs border border-neutral-200/80 flex justify-center overflow-hidden">
              <div 
                className={`w-full transition-all duration-300 rounded-sm shadow-md overflow-hidden border ${
                  previewViewport === 'mobile' ? 'max-w-sm' : 'max-w-3xl'
                } ${
                  palette === 'obsidian' ? 'bg-[#0A0A0A] text-neutral-100 border-neutral-800' :
                  palette === 'warm_paper' ? 'bg-[#FAF9F6] text-neutral-900 border-stone-300' :
                  palette === 'brutalism' ? 'bg-[#18181B] text-amber-50 border-amber-900/50' :
                  'bg-white text-neutral-950 border-neutral-200'
                } ${
                  typography === 'sans' ? 'font-sans' : typography === 'classic' ? 'font-mono' : 'font-editorial'
                }`}
              >
                {/* Simulated Studio Browser Header Bar */}
                <div className="px-4 py-2 border-b border-current/10 flex items-center justify-between text-[11px] opacity-75">
                  <span className="font-mono font-medium">atelier.app/@{handle || 'artist'}</span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
                    <span className="uppercase tracking-wider">{typography} · {palette}</span>
                  </div>
                </div>

                {/* Simulated Artist Hero Section */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono bg-current/10 px-2.5 py-0.5 rounded-xs tracking-wider text-[11px]">
                      @{handle || 'artist'}
                    </span>
                    {location && (
                      <span className="opacity-75 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {location}
                      </span>
                    )}
                    {curatorBadgeText && (
                      <span 
                        className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs border font-medium"
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {curatorBadgeText}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-3xl sm:text-4xl font-normal tracking-tight leading-tight">
                      {name || 'Studio Artist'}
                    </h2>
                    <p className="text-xs sm:text-sm opacity-75 font-medium tracking-wide">
                      {disciplines || 'Ceramics · Fine Sculpture'}
                    </p>
                  </div>

                  <blockquote className="text-sm sm:text-base italic opacity-90 border-l-2 pl-3 py-0.5 leading-relaxed" style={{ borderColor: accentColor }}>
                    "{statement || bio || 'Tactile craft, organic forms, and earth materials.'}"
                  </blockquote>

                  {/* Simulated Action Button with Live Accent Color */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: accentColor }}
                      className="px-5 py-2.5 text-white text-xs font-semibold uppercase tracking-wider rounded-xs shadow-xs transition-opacity hover:opacity-90 cursor-default"
                    >
                      Commission Artist
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2.5 bg-current/5 border border-current/20 text-xs font-medium uppercase tracking-wider rounded-xs cursor-default"
                    >
                      View Catalog (6)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 text-center font-light">
              This preview updates instantly as you click any typography pairing or color accent above.
            </p>
          </div>

          {/* Curatorial Watermarking & Ambient Soundscapes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-neutral-800" />
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Curatorial Watermarking & Fine Art Protection
                </label>
              </div>
              <p className="text-xs text-neutral-500 font-light">
                Enable a subtle copyright overlay ("© [Name] — ATELIER Archive") across portfolio images to deter unauthorized image scraping.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="watermark-toggle"
                  checked={watermarkEnabled}
                  onChange={(e) => setWatermarkEnabled(e.target.checked)}
                  className="rounded-xs border-neutral-300 text-neutral-900 focus:ring-0"
                />
                <label htmlFor="watermark-toggle" className="text-xs font-medium text-neutral-800 cursor-pointer">
                  Enable Anti-Theft Watermark Overlay
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-neutral-800" />
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Curated Ambient Soundscape
                </label>
              </div>
              <p className="text-xs text-neutral-500 font-light">
                Attach a subtle background atmosphere for collectors exploring your portfolio.
              </p>
              <select
                value={ambientSoundscape}
                onChange={(e) => setAmbientSoundscape(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              >
                <option value="none">Studio Silence (None)</option>
                <option value="lofi">Lo-Fi Essentials (5 Songs)</option>
              </select>
            </div>
          </div>

          {/* Curator Badge & Socials in Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Curator Hero Badge Text
              </label>
              <p className="text-xs text-neutral-500 font-light">
                Custom badge shown above your name in the hero section (e.g., "Available for Autumn Exhibitions").
              </p>
              <input
                type="text"
                maxLength={100}
                value={curatorBadgeText}
                onChange={(e) => setCuratorBadgeText(e.target.value)}
                placeholder="e.g. Studio Resident 2026"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Hero Social Links & Metadata
              </label>
              <p className="text-xs text-neutral-500 font-light">
                Display social links and location directly in the primary artist hero section.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="show-socials-toggle"
                  checked={showSocialsInHero}
                  onChange={(e) => setShowSocialsInHero(e.target.checked)}
                  className="rounded-xs border-neutral-300 text-neutral-900 focus:ring-0"
                />
                <label htmlFor="show-socials-toggle" className="text-xs font-medium text-neutral-800 cursor-pointer">
                  Show Social Links & Location in Hero Banner
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Notice & Social Links */}
        <div className="bg-white border border-neutral-200 p-6 rounded-xs space-y-4 shadow-2xs">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Commissions & Socials</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Current Commission Intake Notice
              </label>
              <input
                type="text"
                maxLength={500}
                value={commissionNotice}
                onChange={(e) => setCommissionNotice(e.target.value)}
                placeholder="e.g. Currently accepting 2 bespoke commissions for Autumn delivery."
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center pt-5">
              <input
                type="checkbox"
                id="commissions-open-check"
                checked={acceptingCommissions}
                onChange={(e) => setAcceptingCommissions(e.target.checked)}
                className="rounded-xs border-neutral-300 text-neutral-900 focus:ring-0 mr-2"
              />
              <label htmlFor="commissions-open-check" className="text-xs font-medium text-neutral-800 cursor-pointer">
                Open for Commission Inquiries
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                maxLength={300}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/mayalinstudio"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                External Monograph / Portfolio URL
              </label>
              <input
                type="url"
                maxLength={300}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mayalinstudio.art"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            <span>Publish Portfolio Settings</span>
          </button>
        </div>
      </form>

      {/* Live Profile Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 rounded-xs shadow-2xl relative transition-all ${
              palette === 'obsidian' ? 'bg-[#0A0A0A] text-white border border-neutral-800' :
              palette === 'warm_paper' ? 'bg-[#FAF9F6] text-neutral-900 border border-stone-300' :
              palette === 'brutalism' ? 'bg-[#18181B] text-amber-50 border border-amber-500/30' :
              'bg-white text-neutral-950 border border-neutral-300'
            } ${
              typography === 'sans' ? 'font-sans' : typography === 'classic' ? 'font-mono' : 'font-editorial'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-current/10 mb-6 gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Live Public Exhibition Simulation</span>
                <h3 className="font-editorial text-2xl font-normal mt-0.5">{name || 'Artist Name'}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-current/10 p-0.5 rounded-xs flex items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-2.5 py-1 rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewViewport === 'desktop' ? 'bg-white text-neutral-900 shadow-xs font-medium' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-2.5 py-1 rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewViewport === 'mobile' ? 'bg-white text-neutral-900 shadow-xs font-medium' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Mobile</span>
                  </button>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3.5 py-1.5 bg-current/10 hover:bg-current/20 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  Close Preview ✕
                </button>
              </div>
            </div>

            {/* Simulated Hero Section */}
            <div className={`mx-auto transition-all duration-300 space-y-6 text-center ${
              previewViewport === 'mobile' ? 'max-w-md' : 'max-w-2xl'
            }`}>
              {curatorBadgeText && (
                <div 
                  className="inline-block text-xs font-mono px-3.5 py-1 rounded-full border uppercase tracking-widest font-medium"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {curatorBadgeText}
                </div>
              )}

              <h1 className="text-4xl md:text-6xl font-normal tracking-tight leading-tight">
                {name || 'Artist Name'}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs opacity-75">
                <span className="font-mono bg-current/10 px-2.5 py-0.5 rounded-xs">@{handle || 'handle'}</span>
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {location}
                  </span>
                )}
                <span>·</span>
                <span className="font-medium">{disciplines || 'Ceramics & Fine Sculpture'}</span>
              </div>

              <blockquote 
                className="text-base sm:text-lg italic opacity-90 border-l-2 pl-4 py-1 text-left leading-relaxed mx-auto max-w-xl"
                style={{ borderColor: accentColor }}
              >
                "{statement || bio || 'Tactile craft, organic forms, and earth materials.'}"
              </blockquote>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  style={{ backgroundColor: accentColor }}
                  className="px-6 py-2.5 text-white text-xs font-semibold uppercase tracking-wider rounded-xs shadow-md transition-opacity hover:opacity-90 cursor-default"
                >
                  Inquire Commission
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-current/5 border border-current/20 text-xs font-medium uppercase tracking-wider rounded-xs cursor-default"
                >
                  Explore Catalog
                </button>
              </div>

              {/* Watermark Protection Indicator */}
              {watermarkEnabled && (
                <div className="pt-4 flex items-center justify-center gap-2 text-[11px] opacity-70">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Archival Anti-Scraping Watermark Protection Active</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
