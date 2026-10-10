import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Globe, 
  Instagram, 
  Twitter, 
  Link as LinkIcon, 
  Palette, 
  User, 
  Lock, 
  Mail, 
  CheckCircle2,
  X
} from 'lucide-react';
import { Creator } from '../../types/index.js';
import { api } from '../../services/api.js';
import { validateAndNormalizeUrl } from '../../lib/linkSanitizer.js';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCreators: Creator[];
  onComplete: (newCreator: Creator) => void;
  initialHandle?: string;
}

const RESERVED_WORDS = [
  'admin', 'api', 'atelier', 'explore', 'dashboard', 'auth', 
  'login', 'signup', 'support', 'terms', 'privacy', 'settings', 
  'help', 'about', 'features', 'search', 'public', 'create', 'root'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  existingCreators,
  onComplete,
  initialHandle,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 8;

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialWebsite, setSocialWebsite] = useState('');
  const [accentColor, setAccentColor] = useState('#92400e'); // amber
  const [typography, setTypography] = useState<'editorial' | 'sans' | 'classic'>('editorial');
  const [gridStyle, setGridStyle] = useState<'bento' | 'masonry' | 'minimal'>('bento');

  // Validation & Status
  const [handleError, setHandleError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successState, setSuccessState] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setPassword('');
      const cleanInitial = (initialHandle || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      setHandle(cleanInitial);
      setName('');
      setBio('');
      setAvatarUrl(PRESET_AVATARS[0]);
      setSocialInstagram('');
      setSocialTwitter('');
      setSocialWebsite('');
      setAccentColor('#92400e');
      setTypography('editorial');
      setGridStyle('bento');
      setHandleError(null);
      setErrorMsg(null);
      setSuccessState(false);
      if (cleanInitial) {
        validateHandle(cleanInitial);
      }
    }
  }, [isOpen, initialHandle]);

  if (!isOpen) return null;

  // Handle validation
  const validateHandle = (val: string) => {
    const clean = val.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (clean.length < 2) {
      setHandleError('Handle must be at least 2 characters');
      return false;
    }
    if (RESERVED_WORDS.includes(clean)) {
      setHandleError(`@${clean} is a reserved system handle`);
      return false;
    }
    const taken = existingCreators.some(c => c.handle.toLowerCase() === clean);
    if (taken) {
      setHandleError(`@${clean} is already taken by another artist`);
      return false;
    }
    setHandleError(null);
    return true;
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!email.includes('@') || password.length < 6) {
        setErrorMsg('Please provide a valid email and a password of at least 6 characters.');
        return;
      }
    } else if (step === 2) {
      if (!handle.trim()) {
        setHandleError('Handle is required');
        return;
      }
      const clean = handle.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      if (!validateHandle(clean)) {
        return;
      }
    } else if (step === 3) {
      if (!name.trim()) {
        setErrorMsg('Artist name is required');
        return;
      }
    } else if (step === 4) {
      if (!bio.trim()) {
        setErrorMsg('Please provide a short artist bio or statement');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmitProfile();
    }
  };

  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const cleanHandle = handle.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

      let sanitizedWebsite: string | undefined = undefined;
      if (socialWebsite.trim()) {
        const webCheck = validateAndNormalizeUrl(socialWebsite.trim());
        if (!webCheck.valid) {
          setErrorMsg(webCheck.error || 'Invalid Website URL format.');
          setIsSubmitting(false);
          return;
        }
        sanitizedWebsite = webCheck.normalized;
      }

      const newCreator = await api.createCreator({
        name: name.trim().slice(0, 100),
        handle: cleanHandle,
        bio: bio.trim().slice(0, 1000),
        avatarUrl,
        socialLinks: {
          instagram: socialInstagram ? `@${socialInstagram.replace(/^@/, '')}`.slice(0, 100) : undefined,
          twitter: socialTwitter ? `@${socialTwitter.replace(/^@/, '')}`.slice(0, 100) : undefined,
          website: sanitizedWebsite,
        },
        themeSettings: {
          accentColor,
          typography,
          gridStyle,
        }
      });

      setSuccessState(true);
      setTimeout(() => {
        onComplete(newCreator);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create creator profile');
      setIsSubmitting(false);
    }
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF9F6] border border-neutral-300 w-full max-w-2xl rounded-xs shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header & Progress */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-xl font-normal tracking-tight text-neutral-950">ATELIER</span>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">/ Creator Onboarding</span>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 h-1">
          <div 
            className="bg-neutral-950 h-1 transition-all duration-300 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-8 md:p-10 flex-1 overflow-y-auto">
          {successState ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-editorial text-3xl text-neutral-950">Your Studio is Live.</h3>
              <p className="text-sm text-neutral-600 font-light max-w-md mx-auto">
                Welcome to ATELIER. Redirecting you to your backstage dashboard at <code className="font-mono text-neutral-900">atelier.app/@{handle.toLowerCase()}</code>...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step Title & Counter */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  Step {step} of {totalSteps}
                </span>
                <span className="text-xs text-neutral-400 font-light">
                  {Math.round(progressPercent)}% Complete
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 rounded-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: Sign Up Credentials */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="font-editorial text-3xl text-neutral-950 mb-2">Create your maker account.</h2>
                    <p className="text-sm text-neutral-600 font-light">
                      Enter your credentials to secure your studio account and access commission inquiries.
                    </p>
                  </div>

                  {handle && !handleError && (
                    <div className="p-3 bg-amber-50/90 border border-amber-300/80 rounded-xs flex items-center justify-between text-xs font-mono text-amber-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Reserving studio handle: <strong>atelier.app/@{handle}</strong></span>
                      </div>
                      <span className="text-[10px] uppercase font-sans font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-xs">
                        Available
                      </span>
                    </div>
                  )}

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="maya@artstudio.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 text-sm text-neutral-900 rounded-xs focus:outline-none focus:border-neutral-900"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 text-sm text-neutral-900 rounded-xs focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">Must be at least 6 characters.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Handle */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="font-editorial text-3xl text-neutral-950 mb-2">Choose your unique handle.</h2>
                    <p className="text-sm text-neutral-600 font-light">
                      This will be your permanent professional URL on ATELIER.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5">
                        Studio Handle
                      </label>
                      <div className="flex items-center">
                        <span className="bg-neutral-200 text-neutral-700 px-3.5 py-2.5 text-sm font-mono border border-r-0 border-neutral-300 rounded-l-xs">
                          atelier.app/@
                        </span>
                        <input
                          type="text"
                          value={handle}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                            setHandle(val);
                            validateHandle(val);
                          }}
                          placeholder="maya.paints"
                          className="flex-1 px-4 py-2.5 bg-white border border-neutral-300 text-sm font-mono text-neutral-900 rounded-r-xs focus:outline-none focus:border-neutral-900"
                          autoFocus
                        />
                      </div>
                      {handleError ? (
                        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{handleError}</span>
                        </p>
                      ) : handle.length >= 2 ? (
                        <p className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>atelier.app/@{handle} is available</span>
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-500 mt-1.5">
                          Lowercase letters, numbers, and underscores only.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Enter Artist Name */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="font-editorial text-3xl text-neutral-950 mb-2">What is your artist name?</h2>
                    <p className="text-sm text-neutral-600 font-light">
                      This is the primary name displayed on your portfolio and artwork cards.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5">
                        Full Name or Studio Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Maya Lin"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 text-sm text-neutral-900 rounded-xs focus:outline-none focus:border-neutral-900"
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Bio & Statement */}
              {step === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="font-editorial text-3xl text-neutral-950 mb-2">Craft your artist statement.</h2>
                    <p className="text-sm text-neutral-600 font-light">
                      Share your medium, philosophy, and artistic background with collectors.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5">
                        Bio & Artist Statement
                      </label>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Working in wood-fired Shigaraki stoneware and natural ash glaze, exploring sedimentary stratigraphy..."
                        className="w-full p-3 bg-white border border-neutral-300 text-sm text-neutral-900 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed"
                        autoFocus
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">You can refine this later in your studio dashboard.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Profile Image */}
              {step === 5 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="font-editorial text-3xl text-neutral-950 mb-2">Choose your profile portrait.</h2>
                    <p className="text-sm text-neutral-600 font-light">
                      Select a portrait or provide an image URL.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-4">
                      <img 
                        src={avatarUrl} 
                        alt="Avatar Preview" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-neutral-300 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-2">
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700">
                          Custom Image URL
                        </label>
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs text-neutral-900 rounded-xs focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-2">
                        Or Choose Curator Preset
                      </label>
                      <div className="flex items-center gap-3">
                        {PRESET_AVATARS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAvatarUrl(url)}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer ${avatarUrl === url ? 'border-neutral-950 ring-2 ring-neutral-950/20' : 'border-neutral-300'}`}
                          >
                            <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Social Links */}
              {step === 6 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="font-editorial text-3xl text-neutral-950 mb-2">Connect your socials.</h2>
                    <p className="text-sm text-neutral-600 font-light">
                      Let collectors find you across Instagram, X/Twitter, and your personal website.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1">
                        Instagram Handle
                      </label>
                      <div className="flex items-center">
                        <span className="bg-neutral-200 text-neutral-700 px-3 py-2 text-xs font-mono border border-r-0 border-neutral-300 rounded-l-xs">
                          @
                        </span>
                        <input
                          type="text"
                          value={socialInstagram}
                          onChange={(e) => setSocialInstagram(e.target.value)}
                          placeholder="maya.ceramics"
                          className="flex-1 px-3 py-2 bg-white border border-neutral-300 text-xs text-neutral-900 rounded-r-xs focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1">
                        X / Twitter Handle
                      </label>
                      <div className="flex items-center">
                        <span className="bg-neutral-200 text-neutral-700 px-3 py-2 text-xs font-mono border border-r-0 border-neutral-300 rounded-l-xs">
                          @
                        </span>
                        <input
                          type="text"
                          value={socialTwitter}
                          onChange={(e) => setSocialTwitter(e.target.value)}
                          placeholder="mayaceramics"
                          className="flex-1 px-3 py-2 bg-white border border-neutral-300 text-xs text-neutral-900 rounded-r-xs focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1">
                        Personal Website (Optional)
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="url"
                          value={socialWebsite}
                          onChange={(e) => setSocialWebsite(e.target.value)}
                          placeholder="https://mayalin.art"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 text-xs text-neutral-900 rounded-xs focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Choose Visual Theme */}
              {step === 7 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="font-editorial text-3xl text-neutral-950 mb-2">Choose your visual theme.</h2>
                    <p className="text-sm text-neutral-600 font-light">
                      Customize typography, grid arrangement, and accent tone for your portfolio.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-2">
                        Typography Style
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'editorial', label: 'Editorial Serif', desc: 'Classic literary feel' },
                          { id: 'sans', label: 'Modern Sans', desc: 'Clean Swiss minimalism' },
                          { id: 'classic', label: 'Traditional', desc: 'Gallery fine art' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTypography(t.id as any)}
                            className={`p-3 border text-left rounded-xs transition-colors cursor-pointer ${typography === t.id ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400'}`}
                          >
                            <div className="font-medium text-xs mb-1">{t.label}</div>
                            <div className={`text-[10px] ${typography === t.id ? 'text-neutral-300' : 'text-neutral-500'}`}>{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-2">
                        Portfolio Grid Layout
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'bento', label: 'Bento Editorial', desc: 'Asymmetric feature layout' },
                          { id: 'masonry', label: 'Masonry Flow', desc: 'Organic aspect ratios' },
                          { id: 'minimal', label: 'Minimalist Grid', desc: 'Structured uniform tiles' },
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setGridStyle(g.id as any)}
                            className={`p-3 border text-left rounded-xs transition-colors cursor-pointer ${gridStyle === g.id ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400'}`}
                          >
                            <div className="font-medium text-xs mb-1">{g.label}</div>
                            <div className={`text-[10px] ${gridStyle === g.id ? 'text-neutral-300' : 'text-neutral-500'}`}>{g.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: Review & Complete */}
              {step === 8 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="font-editorial text-3xl text-neutral-950 mb-2">Review & Complete Studio.</h2>
                    <p className="text-sm text-neutral-600 font-light">
                      Everything is ready. We will seed initial demo artworks and collections so your portfolio is ready to showcase instantly.
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-neutral-300 rounded-xs space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-mono">Handle</span>
                      <span className="font-mono font-medium text-neutral-900">atelier.app/@{handle || 'artist'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-mono">Artist Name</span>
                      <span className="font-medium text-neutral-900">{name || 'Unnamed Artist'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-mono">Typography</span>
                      <span className="capitalize text-neutral-900">{typography}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500 font-mono">Grid Style</span>
                      <span className="capitalize text-neutral-900">{gridStyle}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Navigation Buttons */}
              <div className="pt-6 border-t border-neutral-200 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{step === totalSteps ? (isSubmitting ? 'Launching Studio...' : 'Launch Studio & Dashboard') : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
