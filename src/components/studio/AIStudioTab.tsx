import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  UserCheck, 
  FileText, 
  Upload, 
  Check, 
  Copy, 
  RotateCw, 
  ArrowRight, 
  Layers, 
  Tag, 
  Search, 
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Creator, Artwork } from '../../types/index.js';
import { api } from '../../services/api.js';

interface AIStudioTabProps {
  creator: Creator;
  artworks?: Artwork[];
  onNavigateTab?: (tab: any) => void;
  onRefreshCreator?: () => void;
  onOpenCreateArtworkWithData?: (data: {
    title: string;
    description: string;
    medium: string;
    tags: string[];
    image?: string;
  }) => void;
}

export const AIStudioTab: React.FC<AIStudioTabProps> = ({ 
  creator, 
  artworks = [],
  onNavigateTab,
  onRefreshCreator,
  onOpenCreateArtworkWithData
}) => {
  const [activeTool, setActiveTool] = useState<'artwork' | 'profile' | 'brief'>('artwork');

  // ─────────────────────────────────────────────────────────────
  // TOOL 1 STATE — ARTWORK ASSISTANT
  // ─────────────────────────────────────────────────────────────
  const [t1Image, setT1Image] = useState<string>('/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg');
  const [t1Description, setT1Description] = useState<string>('Hand-built stoneware vessel with natural wood ash glaze from a 4-day anagama firing.');
  const [t1Loading, setT1Loading] = useState(false);
  const [t1Error, setT1Error] = useState('');
  const [t1SuccessNotice, setT1SuccessNotice] = useState('');
  
  // Editable generated fields (Tool 1)
  const [t1SuggestedTitle, setT1SuggestedTitle] = useState('');
  const [t1AlternativeTitles, setT1AlternativeTitles] = useState<string[]>([]);
  const [t1ProfessionalDescription, setT1ProfessionalDescription] = useState('');
  const [t1Medium, setT1Medium] = useState('');
  const [t1Category, setT1Category] = useState('');
  const [t1Tags, setT1Tags] = useState('');
  const [t1SeoKeywords, setT1SeoKeywords] = useState('');
  const [t1HasGenerated, setT1HasGenerated] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // TOOL 2 STATE — PROFILE ASSISTANT
  // ─────────────────────────────────────────────────────────────
  const [t2RoughNotes, setT2RoughNotes] = useState<string>(
    'I make digital portraits and fantasy illustrations with lush botanicals and dreamlike lighting. Based in Kyoto studio.'
  );
  const [t2Loading, setT2Loading] = useState(false);
  const [t2Error, setT2Error] = useState('');
  const [t2SuccessNotice, setT2SuccessNotice] = useState('');

  // Editable generated options (Tool 2)
  interface ProfileOptionEditable {
    id: string;
    styleLabel: string;
    professionalBio: string;
    shortTagline: string;
    portfolioIntroduction: string;
    suggestedSpecialties: string;
    socialMediaIntroduction: string;
  }
  const [t2Options, setT2Options] = useState<ProfileOptionEditable[]>([]);
  const [t2SelectedOptionIndex, setT2SelectedOptionIndex] = useState(0);
  const [t2HasGenerated, setT2HasGenerated] = useState(false);
  const [t2Applying, setT2Applying] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // TOOL 3 STATE — COMMISSION BRIEF ASSISTANT
  // ─────────────────────────────────────────────────────────────
  const [t3InformalRequest, setT3InformalRequest] = useState<string>(
    'I want a digital portrait of my sister with flowers, something dreamy, maybe purple and blue. I need it around her birthday.'
  );
  const [t3ClientName, setT3ClientName] = useState<string>('Elena Rostova');
  const [t3Loading, setT3Loading] = useState(false);
  const [t3Error, setT3Error] = useState('');
  const [t3Copied, setT3Copied] = useState(false);

  // Editable structured brief fields (Tool 3)
  const [t3ProjectType, setT3ProjectType] = useState('');
  const [t3Subject, setT3Subject] = useState('');
  const [t3Style, setT3Style] = useState('');
  const [t3ColorPreferences, setT3ColorPreferences] = useState('');
  const [t3IntendedUse, setT3IntendedUse] = useState('');
  const [t3Deadline, setT3Deadline] = useState('');
  const [t3StructuredBrief, setT3StructuredBrief] = useState('');
  const [t3ClarificationQuestions, setT3ClarificationQuestions] = useState<string[]>([]);
  const [t3HasGenerated, setT3HasGenerated] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS — TOOL 1: ARTWORK ASSISTANT
  // ─────────────────────────────────────────────────────────────
  const handleT1FileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setT1Image(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateArtworkMetadata = async () => {
    setT1Loading(true);
    setT1Error('');
    setT1SuccessNotice('');
    try {
      const res = await api.generateArtworkAssistant({
        image: t1Image,
        optionalDescription: t1Description,
        artistContext: `${creator.name} (@${creator.handle}), specializing in ${creator.disciplines.join(', ')}`,
      });

      setT1SuggestedTitle(res.suggestedTitle);
      setT1AlternativeTitles(res.alternativeTitles || []);
      setT1ProfessionalDescription(res.professionalDescription);
      setT1Medium(res.medium);
      setT1Category(res.category);
      setT1Tags(res.tags.join(', '));
      setT1SeoKeywords(res.seoKeywords.join(', '));
      setT1HasGenerated(true);
    } catch (err: any) {
      console.error(err);
      setT1Error(err.message || 'Failed to generate artwork metadata.');
    } finally {
      setT1Loading(false);
    }
  };

  const handleApplyToArtwork = () => {
    // CRITICAL: NEVER automatically publish. Artist reviews & approves in creation modal.
    if (onOpenCreateArtworkWithData) {
      onOpenCreateArtworkWithData({
        title: t1SuggestedTitle,
        description: t1ProfessionalDescription,
        medium: t1Medium,
        tags: t1Tags.split(',').map(t => t.trim()).filter(Boolean),
        image: t1Image,
      });
    } else if (onNavigateTab) {
      onNavigateTab('artworks');
    }
    setT1SuccessNotice('Draft metadata transferred to Artwork modal for your review and approval.');
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS — TOOL 2: PROFILE ASSISTANT
  // ─────────────────────────────────────────────────────────────
  const handleGenerateProfile = async () => {
    setT2Loading(true);
    setT2Error('');
    setT2SuccessNotice('');
    try {
      const res = await api.generateProfileAssistant({
        roughNotes: t2RoughNotes,
        artistName: creator.name,
        disciplines: creator.disciplines,
        location: creator.location,
      });

      const mapped = res.options.map(opt => ({
        id: opt.id,
        styleLabel: opt.styleLabel,
        professionalBio: opt.professionalBio,
        shortTagline: opt.shortTagline,
        portfolioIntroduction: opt.portfolioIntroduction,
        suggestedSpecialties: opt.suggestedSpecialties.join(', '),
        socialMediaIntroduction: opt.socialMediaIntroduction,
      }));

      setT2Options(mapped);
      setT2SelectedOptionIndex(0);
      setT2HasGenerated(true);
    } catch (err: any) {
      console.error(err);
      setT2Error(err.message || 'Failed to generate profile copy.');
    } finally {
      setT2Loading(false);
    }
  };

  const handleApplyToProfile = async () => {
    const selected = t2Options[t2SelectedOptionIndex];
    if (!selected) return;

    setT2Applying(true);
    setT2Error('');
    try {
      const specialtiesArray = selected.suggestedSpecialties
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await api.updateCreator(creator.id, {
        bio: selected.professionalBio,
        statement: selected.portfolioIntroduction,
        disciplines: specialtiesArray.length ? specialtiesArray : creator.disciplines,
      });

      if (onRefreshCreator) onRefreshCreator();
      setT2SuccessNotice(`"${selected.styleLabel}" copy applied to your active profile!`);
      setTimeout(() => setT2SuccessNotice(''), 4000);
    } catch (err: any) {
      console.error(err);
      setT2Error(err.message || 'Failed to update profile.');
    } finally {
      setT2Applying(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS — TOOL 3: COMMISSION BRIEF ASSISTANT
  // ─────────────────────────────────────────────────────────────
  const handleGenerateCommissionBrief = async () => {
    setT3Loading(true);
    setT3Error('');
    try {
      const res = await api.generateCommissionBriefAssistant({
        informalRequest: t3InformalRequest,
        clientName: t3ClientName,
        artistName: creator.name,
      });

      setT3ProjectType(res.projectType);
      setT3Subject(res.subject);
      setT3Style(res.style);
      setT3ColorPreferences(res.colorPreferences);
      setT3IntendedUse(res.intendedUse);
      setT3Deadline(res.deadline);
      setT3StructuredBrief(res.structuredBrief);
      setT3ClarificationQuestions(res.usefulClarificationQuestions || []);
      setT3HasGenerated(true);
    } catch (err: any) {
      console.error(err);
      setT3Error(err.message || 'Failed to convert brief.');
    } finally {
      setT3Loading(false);
    }
  };

  const handleCopyBriefSummary = () => {
    const fullText = `STRUCTURED COMMISSION BRIEF
Project Type: ${t3ProjectType}
Subject: ${t3Subject}
Style Direction: ${t3Style}
Color Preferences: ${t3ColorPreferences}
Intended Use: ${t3IntendedUse}
Target Deadline: ${t3Deadline}

Project Brief:
${t3StructuredBrief}

Recommended Clarification Questions:
${t3ClarificationQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

    navigator.clipboard.writeText(fullText);
    setT3Copied(true);
    setTimeout(() => setT3Copied(false), 2500);
  };

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      {/* Studio Header */}
      <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 font-mono text-[11px] uppercase tracking-wider rounded-xs font-semibold">
              <Sparkles className="w-3 h-3 text-amber-700" />
              ATELIER AI Studio
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">Curatorial Editorial Engine</span>
          </div>
          <h2 className="font-editorial text-3xl font-normal text-neutral-900">
            Professional Creative Assistant
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            AI is designed to elevate and organize your professional portfolio copy, cataloging metadata, and client briefs—never to replace your artistic voice or automatically publish content without your explicit approval.
          </p>
        </div>

        {/* Demo Fast Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-neutral-100 p-1 rounded-xs border border-neutral-200">
          <span className="text-[11px] font-mono text-neutral-500 px-2 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-600" />
            Hackathon Demo:
          </span>
          <button
            type="button"
            onClick={() => setActiveTool('artwork')}
            className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-colors ${
              activeTool === 'artwork' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            1. Artwork
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('profile')}
            className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-colors ${
              activeTool === 'profile' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            2. Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('brief')}
            className={`px-2.5 py-1 text-xs rounded-xs font-medium transition-colors ${
              activeTool === 'brief' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            3. Brief
          </button>
        </div>
      </div>

      {/* Primary Tool Cards (3 Dedicated Tools) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tool 1 Card */}
        <button
          type="button"
          onClick={() => setActiveTool('artwork')}
          className={`p-5 text-left border rounded-xs transition-all relative cursor-pointer ${
            activeTool === 'artwork'
              ? 'border-neutral-950 bg-white ring-1 ring-neutral-950 shadow-sm'
              : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xs ${activeTool === 'artwork' ? 'bg-amber-100 text-amber-900' : 'bg-neutral-100 text-neutral-700'}`}>
              <Wand2 className="w-4 h-4" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">Tool 01</span>
          </div>
          <h3 className="font-editorial text-lg font-bold text-neutral-900 mb-1">
            Artwork Assistant
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Generate evocative titles, curatorial descriptions, medium taxonomy, and SEO keywords from an image and brief notes.
          </p>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>Requires Review</span>
            <span className="text-amber-700 font-medium">Apply to Artwork →</span>
          </div>
        </button>

        {/* Tool 2 Card */}
        <button
          type="button"
          onClick={() => setActiveTool('profile')}
          className={`p-5 text-left border rounded-xs transition-all relative cursor-pointer ${
            activeTool === 'profile'
              ? 'border-neutral-950 bg-white ring-1 ring-neutral-950 shadow-sm'
              : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xs ${activeTool === 'profile' ? 'bg-amber-100 text-amber-900' : 'bg-neutral-100 text-neutral-700'}`}>
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">Tool 02</span>
          </div>
          <h3 className="font-editorial text-lg font-bold text-neutral-900 mb-1">
            Profile Assistant
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Convert informal artist notes into museum-grade biographies, taglines, intro statements, and social media hooks.
          </p>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>Multiple Personas</span>
            <span className="text-amber-700 font-medium">Apply to Profile →</span>
          </div>
        </button>

        {/* Tool 3 Card */}
        <button
          type="button"
          onClick={() => setActiveTool('brief')}
          className={`p-5 text-left border rounded-xs transition-all relative cursor-pointer ${
            activeTool === 'brief'
              ? 'border-neutral-950 bg-white ring-1 ring-neutral-950 shadow-sm'
              : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xs ${activeTool === 'brief' ? 'bg-amber-100 text-amber-900' : 'bg-neutral-100 text-neutral-700'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">Tool 03</span>
          </div>
          <h3 className="font-editorial text-lg font-bold text-neutral-900 mb-1">
            Commission Brief Assistant
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Turn unstructured client messages into structured project briefs with subject, palette, use-case, and clarification questions.
          </p>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>Client & Artist Ready</span>
            <span className="text-amber-700 font-medium">Review & Export →</span>
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOOL 1 WORKSPACE: ARTWORK ASSISTANT
         ───────────────────────────────────────────────────────────── */}
      {activeTool === 'artwork' && (
        <div className="bg-white border border-neutral-200 rounded-xs shadow-xs p-6 md:p-8 space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
                Tool 1 Workspace · Metadata & Cataloging
              </span>
              <h3 className="font-editorial text-xl font-bold text-neutral-900">
                Artwork Curatorial Assistant
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-1 rounded-xs inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Never auto-publishes. Artist review mandatory.
              </span>
            </div>
          </div>

          {t1Error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t1Error}</span>
            </div>
          )}

          {t1SuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t1SuccessNotice}</span>
            </div>
          )}

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Image Preview & Upload */}
            <div className="lg:col-span-5 space-y-3">
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider">
                Artwork Visual (Preview)
              </label>
              <div className="aspect-square bg-neutral-100 border border-neutral-300 rounded-xs overflow-hidden flex items-center justify-center relative group">
                {t1Image ? (
                  <img
                    src={t1Image}
                    alt="Artwork Preview"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <span className="text-xs text-neutral-400">No artwork selected</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-800 rounded-xs transition-colors w-full">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload High-Res Photograph</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleT1FileUpload}
                    className="hidden"
                  />
                </label>

                {/* Preset Fast Picker */}
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>Fast Demo Presets:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setT1Image('/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg');
                        setT1Description('Hand-built stoneware vessel with natural wood ash glaze from a 4-day anagama firing.');
                      }}
                      className="text-amber-800 hover:underline font-medium"
                    >
                      Stoneware
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setT1Image('/src/assets/images/atelier_oil_abstract_1791384045751.jpg');
                        setT1Description('Large abstract study on raw Belgian linen with cold wax and iron oxide washes.');
                      }}
                      className="text-amber-800 hover:underline font-medium"
                    >
                      Abstract Linen
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Action */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                    Optional Artist Notes / Rough Description
                  </label>
                  <textarea
                    rows={4}
                    value={t1Description}
                    onChange={(e) => setT1Description(e.target.value)}
                    placeholder="Provide rough material notes, kiln method, inspiration, or physical size..."
                    className="w-full px-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-sans"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Tip: Even one sentence like &quot;stoneware with ash glaze&quot; is enough for the assistant to deduce taxonomy and curate exhibition copy.
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xs text-[11px] text-neutral-600 space-y-1">
                  <span className="font-semibold text-neutral-800 block">Cataloging Standard Output:</span>
                  <p>• Editorial title candidates & alternatives</p>
                  <p>• Museum-grade curatorial description (materiality & atmosphere)</p>
                  <p>• Formal medium label and discipline category</p>
                  <p>• Curatorial tags and collector SEO keywords</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateArtworkMetadata}
                  disabled={t1Loading}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {t1Loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Synthesizing Metadata with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{t1HasGenerated ? 'Regenerate Metadata' : 'Generate Artwork Metadata'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated & Editable Output Form */}
          {t1HasGenerated && (
            <div className="border-t border-neutral-200 pt-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Generated Cataloging Record (Editable Fields)
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  You can edit all fields freely before applying
                </span>
              </div>

              {/* Title & Alternatives */}
              <div className="space-y-3 bg-neutral-50 p-4 border border-neutral-200 rounded-xs">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                    Suggested Title (Primary)
                  </label>
                  <input
                    type="text"
                    value={t1SuggestedTitle}
                    onChange={(e) => setT1SuggestedTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial font-bold"
                  />
                </div>

                {t1AlternativeTitles.length > 0 && (
                  <div>
                    <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                      Alternative Title Suggestions (Click to swap):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {t1AlternativeTitles.map((altTitle, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const current = t1SuggestedTitle;
                            setT1SuggestedTitle(altTitle);
                            const updated = [...t1AlternativeTitles];
                            updated[idx] = current;
                            setT1AlternativeTitles(updated);
                          }}
                          className="px-2.5 py-1 text-xs bg-white border border-neutral-300 hover:border-neutral-800 rounded-xs text-neutral-700 transition-colors font-editorial"
                        >
                          &quot;{altTitle}&quot;
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                  Curatorial Description
                </label>
                <textarea
                  rows={3}
                  value={t1ProfessionalDescription}
                  onChange={(e) => setT1ProfessionalDescription(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-editorial text-sm"
                />
              </div>

              {/* Medium & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                    Museum Medium Taxonomy
                  </label>
                  <input
                    type="text"
                    value={t1Medium}
                    onChange={(e) => setT1Medium(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                    Discipline / Category
                  </label>
                  <input
                    type="text"
                    value={t1Category}
                    onChange={(e) => setT1Category(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Tags & SEO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-neutral-500" />
                    Artwork Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={t1Tags}
                    onChange={(e) => setT1Tags(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Search className="w-3 h-3 text-neutral-500" />
                    SEO Search Keywords
                  </label>
                  <input
                    type="text"
                    value={t1SeoKeywords}
                    onChange={(e) => setT1SeoKeywords(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Action Buttons: Apply / Regenerate */}
              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleGenerateArtworkMetadata}
                  disabled={t1Loading}
                  className="px-4 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Regenerate Suggestions</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleApplyToArtwork}
                    className="w-full sm:w-auto px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply to Artwork (Review & Save)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TOOL 2 WORKSPACE: PROFILE ASSISTANT
         ───────────────────────────────────────────────────────────── */}
      {activeTool === 'profile' && (
        <div className="bg-white border border-neutral-200 rounded-xs shadow-xs p-6 md:p-8 space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
                Tool 2 Workspace · Artist Identity & Voice
              </span>
              <h3 className="font-editorial text-xl font-bold text-neutral-900">
                Profile & Statement Assistant
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-1 rounded-xs inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Synthesizes 3 distinct editorial personas
              </span>
            </div>
          </div>

          {t2Error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t2Error}</span>
            </div>
          )}

          {t2SuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t2SuccessNotice}</span>
            </div>
          )}

          {/* Rough Info Input */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Rough Artist Information & Practice Focus
                </label>
                <div className="flex gap-2 text-[11px] text-neutral-500">
                  <span>Try examples:</span>
                  <button
                    type="button"
                    onClick={() => setT2RoughNotes('I make digital portraits and fantasy illustrations.')}
                    className="text-amber-800 hover:underline"
                  >
                    Digital & Fantasy
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setT2RoughNotes('Contemporary ceramic sculptor focused on raw clay, wood ash, and wabi-sabi vessels in Portland studio.')}
                    className="text-amber-800 hover:underline"
                  >
                    Ceramic Sculptor
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={t2RoughNotes}
                onChange={(e) => setT2RoughNotes(e.target.value)}
                placeholder="Enter casual notes, e.g.: &quot;I make digital portraits and fantasy illustrations.&quot;"
                className="w-full px-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-sans"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateProfile}
              disabled={t2Loading || !t2RoughNotes.trim()}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {t2Loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Generating Curated Profile Options...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t2HasGenerated ? 'Regenerate Profiles' : 'Generate Profile & Statement Options'}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Multiple Options Selector */}
          {t2HasGenerated && t2Options.length > 0 && (
            <div className="border-t border-neutral-200 pt-6 space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider block mb-2">
                  Select & Edit Persona Style:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {t2Options.map((opt, idx) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setT2SelectedOptionIndex(idx)}
                      className={`p-3 text-left border rounded-xs transition-all cursor-pointer ${
                        t2SelectedOptionIndex === idx
                          ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950'
                          : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-600'
                      }`}
                    >
                      <span className="font-editorial text-sm font-bold text-neutral-900 block truncate">
                        {opt.styleLabel}
                      </span>
                      <span className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                        {opt.shortTagline}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Fields for the active option */}
              {t2Options[t2SelectedOptionIndex] && (
                <div className="space-y-4 bg-neutral-50/60 p-5 border border-neutral-200 rounded-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <span className="text-xs font-bold text-neutral-900 font-editorial">
                      Editing: {t2Options[t2SelectedOptionIndex].styleLabel} Persona
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">All fields are directly editable</span>
                  </div>

                  {/* 1. Professional Bio */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                      Professional Bio (Third-Person Monograph)
                    </label>
                    <textarea
                      rows={3}
                      value={t2Options[t2SelectedOptionIndex].professionalBio}
                      onChange={(e) => {
                        const val = e.target.value;
                        setT2Options(prev => prev.map((item, i) => i === t2SelectedOptionIndex ? { ...item, professionalBio: val } : item));
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-sans"
                    />
                  </div>

                  {/* 2. Short Tagline */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                      Short Tagline (Hero Banner Subtitle)
                    </label>
                    <input
                      type="text"
                      value={t2Options[t2SelectedOptionIndex].shortTagline}
                      onChange={(e) => {
                        const val = e.target.value;
                        setT2Options(prev => prev.map((item, i) => i === t2SelectedOptionIndex ? { ...item, shortTagline: val } : item));
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial text-sm font-medium"
                    />
                  </div>

                  {/* 3. Portfolio Introduction */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                      Portfolio Introduction / Artist Statement
                    </label>
                    <textarea
                      rows={2}
                      value={t2Options[t2SelectedOptionIndex].portfolioIntroduction}
                      onChange={(e) => {
                        const val = e.target.value;
                        setT2Options(prev => prev.map((item, i) => i === t2SelectedOptionIndex ? { ...item, portfolioIntroduction: val } : item));
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-sans"
                    />
                  </div>

                  {/* 4. Suggested Specialties */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                      Suggested Specialties (Disciplines)
                    </label>
                    <input
                      type="text"
                      value={t2Options[t2SelectedOptionIndex].suggestedSpecialties}
                      onChange={(e) => {
                        const val = e.target.value;
                        setT2Options(prev => prev.map((item, i) => i === t2SelectedOptionIndex ? { ...item, suggestedSpecialties: val } : item));
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  {/* 5. Social Media Intro */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                      Social Media Introduction (Instagram / Bluesky Bio)
                    </label>
                    <input
                      type="text"
                      value={t2Options[t2SelectedOptionIndex].socialMediaIntroduction}
                      onChange={(e) => {
                        const val = e.target.value;
                        setT2Options(prev => prev.map((item, i) => i === t2SelectedOptionIndex ? { ...item, socialMediaIntroduction: val } : item));
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons: Apply / Regenerate */}
              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleGenerateProfile}
                  disabled={t2Loading}
                  className="px-4 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Regenerate Personas</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyToProfile}
                  disabled={t2Applying}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {t2Applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synchronizing Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Apply to Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TOOL 3 WORKSPACE: COMMISSION BRIEF ASSISTANT
         ───────────────────────────────────────────────────────────── */}
      {activeTool === 'brief' && (
        <div className="bg-white border border-neutral-200 rounded-xs shadow-xs p-6 md:p-8 space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-amber-800 font-semibold block mb-0.5">
                Tool 3 Workspace · Client Intake & Structuring
              </span>
              <h3 className="font-editorial text-xl font-bold text-neutral-900">
                Commission Brief Assistant
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-1 rounded-xs inline-flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-600" />
                Transforms casual inquiries into structured briefs
              </span>
            </div>
          </div>

          {t3Error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t3Error}</span>
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                  Client / Collector Name
                </label>
                <input
                  type="text"
                  value={t3ClientName}
                  onChange={(e) => setT3ClientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                  Quick Prompt Example
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setT3ClientName('Elena Rostova');
                    setT3InformalRequest('I want a digital portrait of my sister with flowers, something dreamy, maybe purple and blue. I need it around her birthday.');
                  }}
                  className="w-full text-left px-3 py-2 bg-neutral-100 hover:bg-neutral-200/80 text-[11px] text-neutral-800 rounded-xs truncate border border-neutral-200 transition-colors"
                >
                  &quot;I want a digital portrait of my sister with flowers, something dreamy...&quot;
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Informal Client Request Message *
              </label>
              <textarea
                rows={3}
                value={t3InformalRequest}
                onChange={(e) => setT3InformalRequest(e.target.value)}
                placeholder="Enter client's casual message or inquiry..."
                className="w-full px-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-sans"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateCommissionBrief}
              disabled={t3Loading || !t3InformalRequest.trim()}
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {t3Loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Structuring Brief & Extracting Milestones...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t3HasGenerated ? 'Regenerate Brief' : 'Convert to Structured Commission Brief'}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated & Editable Structured Brief */}
          {t3HasGenerated && (
            <div className="border-t border-neutral-200 pt-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Structured Commission Brief (Editable Breakdown)
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Review & edit all structured fields before sharing with client
                </span>
              </div>

              {/* Structured Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-neutral-50 p-4 border border-neutral-200 rounded-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Project Type
                  </label>
                  <input
                    type="text"
                    value={t3ProjectType}
                    onChange={(e) => setT3ProjectType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Subject Focus
                  </label>
                  <input
                    type="text"
                    value={t3Subject}
                    onChange={(e) => setT3Subject(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Aesthetic Style
                  </label>
                  <input
                    type="text"
                    value={t3Style}
                    onChange={(e) => setT3Style(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Color Preferences
                  </label>
                  <input
                    type="text"
                    value={t3ColorPreferences}
                    onChange={(e) => setT3ColorPreferences(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Intended Use
                  </label>
                  <input
                    type="text"
                    value={t3IntendedUse}
                    onChange={(e) => setT3IntendedUse(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="text"
                    value={t3Deadline}
                    onChange={(e) => setT3Deadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-medium"
                  />
                </div>
              </div>

              {/* Formal Multi-paragraph Brief */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                  Synthesized Formal Project Brief
                </label>
                <textarea
                  rows={5}
                  value={t3StructuredBrief}
                  onChange={(e) => setT3StructuredBrief(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-sans"
                />
              </div>

              {/* Clarification Questions */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xs space-y-2">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                  Useful Clarification Questions for Client
                </span>
                <p className="text-[11px] text-amber-900/80">
                  Recommended strategic questions to verify with the collector before confirming invoice:
                </p>
                <div className="space-y-1.5 pt-1">
                  {t3ClarificationQuestions.map((question, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-800">
                      <span className="font-mono text-amber-700 font-bold shrink-0">{idx + 1}.</span>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => {
                          const val = e.target.value;
                          setT3ClarificationQuestions(prev => prev.map((q, i) => i === idx ? val : q));
                        }}
                        className="w-full px-2 py-1 text-xs bg-white border border-amber-200 rounded-xs focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Copy / Regenerate */}
              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleGenerateCommissionBrief}
                  disabled={t3Loading}
                  className="px-4 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Regenerate Brief</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBriefSummary}
                  className="w-full sm:w-auto px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {t3Copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Structured Brief & Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
