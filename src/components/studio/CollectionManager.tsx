import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Folder, Check, X } from 'lucide-react';
import { Collection } from '../../types/index.js';
import { api } from '../../services/api.js';

interface CollectionManagerProps {
  creatorId: string;
  collections: Collection[];
  onRefresh: () => void;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  creatorId,
  collections,
  onRefresh,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [visibility, setVisibility] = useState<Collection['visibility']>('public');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOrder(collections.length + 1);
    setVisibility('public');
    setIsCreating(false);
    setEditingId(null);
    setErrorMessage(null);
  };

  const handleStartEdit = (col: Collection) => {
    setEditingId(col.id);
    setTitle(col.title);
    setDescription(col.description || '');
    setOrder(col.order);
    setVisibility(col.visibility);
    setIsCreating(false);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setErrorMessage(null);

    try {
      if (editingId) {
        await api.updateCollection(editingId, {
          title: title.trim(),
          description: description.trim() || undefined,
          order: Number(order),
          visibility,
        });
      } else {
        await api.createCollection({
          creatorId,
          title: title.trim(),
          description: description.trim() || undefined,
          order: Number(order),
        });
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save collection');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 4000);
      return;
    }
    setErrorMessage(null);
    try {
      await api.deleteCollection(id);
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete collection');
    }
  };

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-900 rounded-xs flex items-center justify-between animate-fadeIn">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 font-bold ml-2">✕</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-neutral-900">
            Curated Collections & Series
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Group your works into thematic series, seasonal kiln firings, or exhibition suites.
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Series</span>
          </button>
        )}
      </div>

      {/* Inline Create / Edit Drawer */}
      {(isCreating || editingId) && (
        <form onSubmit={handleSave} className="bg-white border border-neutral-300 p-6 rounded-xs space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h3 className="font-editorial text-xl font-normal text-neutral-900">
              {editingId ? 'Edit Series Details' : 'Create New Collection Series'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-neutral-400 hover:text-neutral-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Series Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Earth & Ash 2026"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Curatorial Concept / Series Statement
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the research question, kiln firing, or thematic context of this series..."
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
            >
              {editingId ? 'Save Changes' : 'Create Series'}
            </button>
          </div>
        </form>
      )}

      {/* Collection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-white border border-neutral-200 rounded-xs p-6 flex flex-col justify-between hover:border-neutral-300 transition-colors shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
                <span>ORDER 0{col.order}</span>
                <span className="capitalize">{col.visibility}</span>
              </div>

              <h3 className="font-editorial text-2xl font-normal text-neutral-900 mb-2">
                {col.title}
              </h3>

              {col.description && (
                <p className="text-xs text-neutral-600 font-light leading-relaxed mb-4">
                  {col.description}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-mono text-[11px]">
                {col.artworkCount || 0} Artworks Catalogued
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEdit(col)}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xs transition-colors"
                  title="Edit Series"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {confirmDeleteId === col.id ? (
                  <div className="flex items-center gap-1 animate-fadeIn">
                    <button
                      onClick={() => handleDelete(col.id)}
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
                    onClick={() => handleDelete(col.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-xs transition-colors"
                    title="Delete Series"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
