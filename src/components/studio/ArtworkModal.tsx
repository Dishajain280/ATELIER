import React, { useState } from 'react';
import { X, Sparkles, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Artwork, Collection } from '../../types/index.js';
import { api } from '../../services/api.js';

interface ArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  collections: Collection[];
  artworkToEdit?: Artwork | null;
  initialDraft?: {
    title?: string;
    description?: string;
    medium?: string;
    tags?: string[];
    image?: string;
  } | null;
  onSuccess: () => void;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  collections,
  artworkToEdit,
  initialDraft,
  onSuccess,
}) => {
  const [title, setTitle] = useState(artworkToEdit?.title || initialDraft?.title || '');
  const [description, setDescription] = useState(artworkToEdit?.description || initialDraft?.description || '');
  const [medium, setMedium] = useState(artworkToEdit?.medium || initialDraft?.medium || '');
  const [dimensions, setDimensions] = useState(artworkToEdit?.dimensions || '');
  const [year, setYear] = useState<number>(artworkToEdit?.year || new Date().getFullYear());
  const [collectionId, setCollectionId] = useState<string>(artworkToEdit?.collectionId || '');
  const [tags, setTags] = useState<string>(
    artworkToEdit?.tags.join(', ') || initialDraft?.tags?.join(', ') || ''
  );
  const [featured, setFeatured] = useState<boolean>(artworkToEdit?.featured || false);
  const [status, setStatus] = useState<Artwork['status']>(artworkToEdit?.status || 'available');
  const [price, setPrice] = useState<number | undefined>(artworkToEdit?.price);
  
  // Image handling
  const [images, setImages] = useState<string[]>(
    artworkToEdit?.images || (initialDraft?.image ? [initialDraft.image] : [])
  );
  const [imagePreview, setImagePreview] = useState<string>(
    artworkToEdit?.images[0] || initialDraft?.image || ''
  );

  // AI Assistant states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTitleSuggestions, setAiTitleSuggestions] = useState<string[]>([]);
  const [aiError, setAiError] = useState('');

  // Submit states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
        setImages([reader.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAIGenerateMetadata = async () => {
    setIsGeneratingAI(true);
    setAiError('');
    try {
      const result = await api.generateArtworkMetadata({
        roughNotes: description || title || 'Handcrafted studio artwork',
        medium: medium || 'Ceramic stoneware / Mixed media',
        techniques: 'Hand-formed, textural organic finish',
      });

      if (result.titleSuggestions?.length) {
        setAiTitleSuggestions(result.titleSuggestions);
        if (!title) setTitle(result.titleSuggestions[0]);
      }
      if (result.description) setDescription(result.description);
      if (result.mediumFormatted && !medium) setMedium(result.mediumFormatted);
      if (result.tags?.length) setTags(result.tags.join(', '));
    } catch (err: any) {
      console.error(err);
      setAiError('AI generation failed, please enter details manually.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !medium.trim()) {
      setErrorMessage('Please provide at least a title and medium.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please provide an image for the artwork.');
      return;
    }

    setIsSaving(true);
    try {
      const parsedTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      if (artworkToEdit) {
        await api.updateArtwork(artworkToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          medium: medium.trim(),
          dimensions: dimensions.trim() || undefined,
          year: Number(year),
          collectionId: collectionId || null,
          tags: parsedTags,
          featured,
          status,
          price: price ? Number(price) : undefined,
          images,
        });
      } else {
        await api.createArtwork({
          creatorId,
          title: title.trim(),
          description: description.trim(),
          medium: medium.trim(),
          dimensions: dimensions.trim() || undefined,
          year: Number(year),
          collectionId: collectionId || null,
          tags: parsedTags,
          featured,
          status,
          price: price ? Number(price) : undefined,
          images,
          currency: 'USD',
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save artwork');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF9F6] border border-neutral-300 rounded-xs shadow-2xl p-6 md:p-8 my-8 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
              Studio Catalogue Management
            </span>
            <h2 className="font-editorial text-3xl font-normal text-neutral-900">
              {artworkToEdit ? 'Edit Artwork Record' : 'Catalogue New Artwork'}
            </h2>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs">
              {errorMessage}
            </div>
          )}

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-2">
              Artwork Photography *
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 bg-neutral-100 border border-neutral-300 rounded-xs overflow-hidden flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-neutral-300" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-800 rounded-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload High-Res Photograph</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-neutral-500">
                  Select a JPG, PNG, or WEBP image. Will be compressed and stored in local state.
                </p>

                {/* Preset test image option */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
                  <span>Or use preset:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '/src/assets/images/atelier_ceramic_vessel_1791384010911.jpg';
                      setImagePreview(sample);
                      setImages([sample]);
                    }}
                    className="text-amber-800 hover:underline"
                  >
                    Stoneware Vessel
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '/src/assets/images/atelier_oil_abstract_1791384045751.jpg';
                      setImagePreview(sample);
                      setImages([sample]);
                    }}
                    className="text-amber-800 hover:underline"
                  >
                    Abstract Linen
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Metadata Assistant Button */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-xs text-amber-900 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                AI Curatorial Metadata Assistant
              </span>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Automatically generate poetic titles, formatted medium nomenclature, and curatorial tags.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAIGenerateMetadata}
              disabled={isGeneratingAI}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Metadata</span>
                </>
              )}
            </button>
          </div>

          {aiError && (
            <p className="text-xs text-red-600">{aiError}</p>
          )}

          {/* AI Title Suggestions Pills */}
          {aiTitleSuggestions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                Click a title suggestion to apply:
              </span>
              <div className="flex flex-wrap gap-2">
                {aiTitleSuggestions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTitle(st)}
                    className="px-2.5 py-1 text-xs bg-white border border-amber-300 hover:border-amber-600 text-neutral-800 rounded-xs font-editorial"
                  >
                    "{st}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Artwork Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sediment V: Stratum in Ash"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Collection Series
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              >
                <option value="">No Collection (Standalone Work)</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Medium & Material *
              </label>
              <input
                type="text"
                required
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="e.g. Wood-fired Shigaraki stoneware"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 42 x 28 x 26 cm"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Creation Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Curatorial Description & Process
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Poetic description detailing materiality, firing conditions, or conceptual origin..."
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Stoneware, Wood-fired, Anagama"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Availability Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Artwork['status'])}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 capitalize"
              >
                <option value="available">Available (Published)</option>
                <option value="draft">Draft (Unpublished)</option>
                <option value="in_collection">In Private Collection</option>
                <option value="sold">Sold</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                value={price !== undefined ? price : ''}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 1850"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="featured-check"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded-xs border-neutral-300 text-neutral-900 focus:ring-0"
            />
            <label htmlFor="featured-check" className="text-xs font-medium text-neutral-800 cursor-pointer">
              Feature as primary spotlight piece on public portfolio
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>

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
                <span>Save Artwork</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
