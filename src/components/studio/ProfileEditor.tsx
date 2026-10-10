import React, { useState } from 'react';
import { Sparkles, Loader2, Save, CheckCircle2, LayoutGrid, Palette as PaletteIcon, Type, Shield, Volume2, Layout } from 'lucide-react';
import { Creator } from '../../types/index.js';
import { api } from '../../services/api.js';
import { validateAndNormalizeUrl } from '../../lib/linkSanitizer.js';

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

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xs border border-emerald-200 font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Changes Published Successfully</span>
          </div>
        )}
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
                  className={`p-3 text-left border rounded-xs transition-all ${item.bg} ${
                    palette === item.id ? 'ring-2 ring-neutral-900 ring-offset-2' : 'border-neutral-300 opacity-90 hover:opacity-100'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase">{item.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Typography Pairings */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2">
              Gallery Typography Pairing
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'editorial', label: 'Editorial Serif', font: 'font-editorial', sample: 'Graceful high-contrast serif' },
                { id: 'sans', label: 'Modern Sans', font: 'font-sans', sample: 'Clean Swiss sans-serif' },
                { id: 'classic', label: 'Classic Monograph', font: 'font-mono', sample: 'Refined archival monospaced' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTypography(item.id as any)}
                  className={`p-3 text-left border rounded-xs transition-all ${
                    typography === item.id
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-900'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase">{item.label}</p>
                  <p className={`text-xs mt-1 italic ${item.font}`}>{item.sample}</p>
                </button>
              ))}
            </div>
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
    </div>
  );
};
