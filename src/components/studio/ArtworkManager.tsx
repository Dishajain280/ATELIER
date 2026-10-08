import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Eye } from 'lucide-react';
import { Artwork, Collection } from '../../types/index.js';
import { api } from '../../services/api.js';

interface ArtworkManagerProps {
  artworks: Artwork[];
  collections: Collection[];
  onOpenCreateModal: () => void;
  onEditArtwork: (artwork: Artwork) => void;
  onRefresh: () => void;
  onPreviewArtwork: (artwork: Artwork) => void;
}

export const ArtworkManager: React.FC<ArtworkManagerProps> = ({
  artworks,
  collections,
  onOpenCreateModal,
  onEditArtwork,
  onRefresh,
  onPreviewArtwork,
}) => {
  const [filterCollection, setFilterCollection] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = filterCollection === 'all'
    ? artworks
    : artworks.filter(a => a.collectionId === filterCollection);

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 4000);
      return;
    }
    setDeletingId(id);
    setErrorMessage(null);
    try {
      await api.deleteArtwork(id);
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove artwork');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (artwork: Artwork) => {
    setErrorMessage(null);
    try {
      await api.updateArtwork(artwork.id, { featured: !artwork.featured });
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update artwork status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-neutral-900">
            Studio Artwork Inventory
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your archived, exhibited, and available artworks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-neutral-300 rounded-xs focus:outline-none"
          >
            <option value="all">All Collections ({artworks.length})</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Artwork</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-900 rounded-xs flex items-center justify-between animate-fadeIn">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Artworks List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-neutral-400 bg-white border border-neutral-200 rounded-xs">
          <p className="text-sm">No artworks catalogued in this view.</p>
          <button
            onClick={onOpenCreateModal}
            className="mt-3 text-xs text-amber-800 hover:underline font-medium"
          >
            Catalogue your first artwork →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((artwork) => {
            const col = collections.find(c => c.id === artwork.collectionId);

            return (
              <div
                key={artwork.id}
                className="bg-white border border-neutral-200 rounded-xs overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-colors shadow-2xs"
              >
                <div>
                  {/* Image slot */}
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <img
                      src={artwork.images[0]}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Status & Featured badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="bg-white/95 text-neutral-800 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-xs shadow-xs">
                        {artwork.status.replace('_', ' ')}
                      </span>
                      {artwork.featured && (
                        <span className="bg-amber-600 text-white text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-xs shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          Featured
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onPreviewArtwork(artwork)}
                      className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-xs transition-colors"
                      title="Inspect"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-editorial text-lg font-normal text-neutral-900 truncate">
                        {artwork.title}
                      </h3>
                      <span className="font-mono text-xs text-neutral-400 tabular-nums">
                        {artwork.year}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 truncate">
                      {artwork.medium}
                    </div>

                    {col && (
                      <div className="text-[11px] text-neutral-400 truncate">
                        Series: <span className="text-neutral-700">{col.title}</span>
                      </div>
                    )}

                    {artwork.price && (
                      <div className="text-xs font-mono font-medium text-neutral-800 tabular-nums pt-1">
                        ${artwork.price.toLocaleString()} USD
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleFeatured(artwork)}
                    className={`inline-flex items-center gap-1 hover:text-amber-800 transition-colors ${
                      artwork.featured ? 'text-amber-700 font-medium' : 'text-neutral-500'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${artwork.featured ? 'fill-amber-600' : ''}`} />
                    <span>{artwork.featured ? 'Featured' : 'Make Featured'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditArtwork(artwork)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xs transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {confirmDeleteId === artwork.id ? (
                      <div className="flex items-center gap-1 animate-fadeIn">
                        <button
                          onClick={() => handleDelete(artwork.id)}
                          disabled={deletingId === artwork.id}
                          className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-xs transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-1 text-[11px] text-neutral-500 hover:text-neutral-900 rounded-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(artwork.id)}
                        disabled={deletingId === artwork.id}
                        className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-xs transition-colors"
                        title="Delete Artwork"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
