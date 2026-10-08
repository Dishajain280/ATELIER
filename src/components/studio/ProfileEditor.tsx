import React, { useState } from 'react';
import { Sparkles, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { Creator } from '../../types/index.js';
import { api } from '../../services/api.js';

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
      const parsedDisciplines = disciplines.split(',').map(d => d.trim()).filter(Boolean);

      await api.updateCreator(creator.id, {
        name: name.trim(),
        handle: handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        location: location.trim(),
        disciplines: parsedDisciplines,
        bio: bio.trim(),
        statement: statement.trim(),
        commissionNotice: commissionNotice.trim() || undefined,
        acceptingCommissions,
        socialLinks: {
          instagram: instagram.trim() || undefined,
          website: website.trim() || undefined,
        },
        themeSettings: {
          ...creator.themeSettings,
          accentColor,
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
            Artist Identity & Theme Settings
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure your canonical link (<code className="font-mono text-neutral-800">atelier.app/@{handle}</code>), curatorial statement, and commission notice.
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Profile synchronized</span>
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs">
          {errorMessage}
        </div>
      )}

      {/* AI Assistant Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-xs text-amber-900 block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            AI Monograph & Curatorial Statement Assistant
          </span>
          <p className="text-[11px] text-amber-800/80 mt-0.5">
            Generate an authentic, museum-grade artist biography and philosophical statement based on your mediums and location.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAIBio}
          disabled={isGeneratingBio}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          {isGeneratingBio ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Drafting Monograph...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-neutral-200 rounded-xs p-6 md:p-8 space-y-6 shadow-xs">
        {/* Core Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Artist / Studio Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial text-base"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Canonical @handle *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-neutral-100 border border-r-0 border-neutral-300 text-xs font-mono text-neutral-500 rounded-l-xs">
                @
              </span>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-r-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Studio Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kyoto / Portland"
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Disciplines & Media (comma separated)
            </label>
            <input
              type="text"
              value={disciplines}
              onChange={(e) => setDisciplines(e.target.value)}
              placeholder="Ceramics, Sculptural Stoneware, Wood-Firing"
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>

        {/* Statement & Bio */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
            Curatorial Statement (Hero Quote)
          </label>
          <textarea
            rows={3}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="First-person creative philosophy regarding materiality and space..."
            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial text-sm leading-relaxed italic"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
            Artist Biography (About Paragraph)
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Third-person professional biography detailing studio background and focus..."
            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed"
          />
        </div>

        {/* Commission Notice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Current Commission Intake Notice
            </label>
            <input
              type="text"
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

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Instagram Profile URL
            </label>
            <input
              type="url"
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
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://mayalinstudio.art"
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
