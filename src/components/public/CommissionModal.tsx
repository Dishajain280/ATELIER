import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { CommissionService, Creator } from '../../types/index.js';
import { api } from '../../services/api.js';
import { validateAndNormalizeUrl } from '../../lib/linkSanitizer.js';

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator;
  services: CommissionService[];
  preselectedService?: CommissionService | null;
  onSuccess: () => void;
}

export const CommissionModal: React.FC<CommissionModalProps> = ({
  isOpen,
  onClose,
  creator,
  services,
  preselectedService,
  onSuccess,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedService?.id || (services[0]?.id || '')
  );
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [brief, setBrief] = useState('');
  const [budget, setBudget] = useState<number>(preselectedService?.basePrice || 1600);
  const [deadline, setDeadline] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');

  // AI Assistant states
  const [isGeneratingAIBrief, setIsGeneratingAIBrief] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentService = services.find(s => s.id === selectedServiceId);

  const handleAIEnhanceBrief = async () => {
    if (!brief.trim()) {
      setErrorMessage('Please type a brief initial thought or vision before running the AI brief generator.');
      return;
    }
    setErrorMessage('');
    setIsGeneratingAIBrief(true);
    try {
      const result = await api.generateCommissionBrief({
        clientName: clientName.trim() || 'Patron',
        serviceTitle: currentService?.title || 'Custom Ceramic Piece',
        roughBrief: brief,
        budget: budget,
        deadline: deadline,
      });

      setAiSuggestions(result.structuredBrief);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('AI Brief generation failed. You can continue typing manually.');
    } finally {
      setIsGeneratingAIBrief(false);
    }
  };

  const handleApplyAIBrief = () => {
    if (aiSuggestions) {
      setBrief(aiSuggestions);
      setAiSuggestions(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!clientName.trim() || !clientEmail.trim() || !brief.trim()) {
      setErrorMessage('Please fill in your name, email, and brief details.');
      return;
    }

    if (brief.trim().length < 10) {
      setErrorMessage('Please provide more detail in your project brief (at least 10 characters).');
      return;
    }

    if (brief.trim().length > 3000) {
      setErrorMessage('Brief is too long. Please keep within 3,000 characters.');
      return;
    }

    if (Number(budget) > 10000000) {
      setErrorMessage('Budget exceeds maximum allowed amount ($10,000,000).');
      return;
    }

    let sanitizedRefUrl = '';
    if (referenceUrl.trim()) {
      const urlCheck = validateAndNormalizeUrl(referenceUrl.trim());
      if (!urlCheck.valid) {
        setErrorMessage(urlCheck.error || 'Please enter a valid reference URL with http:// or https://');
        return;
      }
      sanitizedRefUrl = urlCheck.normalized || '';
    }

    setIsSubmitting(true);
    try {
      await api.submitCommission({
        creatorId: creator.id,
        serviceId: selectedServiceId || null,
        serviceTitle: currentService?.title || 'Bespoke Custom Commission',
        clientName: clientName.trim().slice(0, 100),
        clientEmail: clientEmail.trim().slice(0, 255),
        clientPhone: clientPhone.trim() ? clientPhone.trim().slice(0, 50) : undefined,
        brief: brief.trim().slice(0, 3000),
        aiEnhancedBrief: aiSuggestions ? aiSuggestions.slice(0, 5000) : undefined,
        budget: Number(budget) || 0,
        currency: currentService?.currency || 'USD',
        deadline: deadline ? deadline.slice(0, 100) : undefined,
        intendedUse: intendedUse.trim() ? intendedUse.trim().slice(0, 500) : undefined,
        referenceImages: sanitizedRefUrl ? [sanitizedRefUrl] : [],
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitSuccess(false);
      }, 2200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit commission request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF9F6] border border-neutral-300 rounded-xs shadow-2xl p-6 md:p-8 my-8 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitSuccess ? (
          <div className="py-16 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
            <h2 className="font-editorial text-3xl font-normal text-neutral-900">
              Inquiry Dispatched to {creator.name}
            </h2>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              Your structured brief has entered the artist's studio intake pipeline. A confirmation email has been dispatched to <strong>{clientEmail}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                Direct Studio Intake · @{creator.handle}
              </span>
              <h2 className="font-editorial text-3xl font-normal text-neutral-900">
                Commission Inquiry
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Submit project requirements, aesthetic reference, and timeline directly to the studio.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs">
                {errorMessage}
              </div>
            )}

            {/* Service Selection */}
            {services.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Service Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceId(s.id);
                        if (!budget || budget < s.basePrice) {
                          setBudget(s.basePrice);
                        }
                      }}
                      className={`p-3 text-left border rounded-xs transition-all ${
                        selectedServiceId === s.id
                          ? 'border-neutral-900 bg-white shadow-xs font-semibold'
                          : 'border-neutral-200 bg-neutral-50 hover:bg-white text-neutral-600'
                      }`}
                    >
                      <span className="block text-xs font-editorial font-bold text-neutral-900 truncate">
                        {s.title}
                      </span>
                      <span className="block text-[11px] font-mono text-neutral-500 mt-0.5">
                        from ${s.basePrice}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1 uppercase tracking-wider">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Julian Vance"
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="julian@example.com"
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            {/* Brief & AI Helper */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  Project Brief & Vision *
                </label>

                <button
                  type="button"
                  onClick={handleAIEnhanceBrief}
                  disabled={isGeneratingAIBrief}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-medium transition-colors cursor-pointer"
                >
                  {isGeneratingAIBrief ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>Refine with AI Brief Generator</span>
                </button>
              </div>

              <textarea
                required
                rows={4}
                maxLength={3000}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Describe your desired piece, placement, scale, tactile preferences, or intended atmosphere..."
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed font-sans"
              />
              <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-1">
                <span>Minimum 10 characters</span>
                <span className={brief.length > 2800 ? 'text-amber-700 font-semibold' : ''}>
                  {brief.length} / 3000 characters
                </span>
              </div>

              {/* AI Suggestion Preview Box if generated */}
              {aiSuggestions && (
                <div className="mt-2 p-3 bg-amber-50/80 border border-amber-200 rounded-xs text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Curated AI Structure Preview
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyAIBrief}
                      className="text-xs bg-amber-700 hover:bg-amber-800 text-white px-2 py-0.5 rounded-xs font-medium"
                    >
                      Apply to Brief
                    </button>
                  </div>
                  <pre className="text-[11px] text-amber-950 font-sans whitespace-pre-wrap leading-relaxed">
                    {aiSuggestions}
                  </pre>
                </div>
              )}
            </div>

            {/* Budget & Target Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1 uppercase tracking-wider">
                  Allocated Budget (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1 uppercase tracking-wider">
                  Target Deadline / Timeline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            {/* Intended Use */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1 uppercase tracking-wider">
                Intended Use & Placement (Optional)
              </label>
              <input
                type="text"
                maxLength={500}
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                placeholder="e.g. Private residence dining room, hospitality interior, collection installation"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            {/* Reference URL */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1 uppercase tracking-wider">
                Reference Image / Moodboard Link (Optional)
              </label>
              <input
                type="url"
                maxLength={1000}
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://arena.na/... or cloud drive image link"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
