import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Folder, Check, X, Lock } from 'lucide-react';
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
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOrder(collections.length + 1);
    setVisibility('public');
    setIsPasswordProtected(false);
    setPassword('');
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
    setIsPasswordProtected(col.isPasswordProtected || false);
    setPassword(col.password || '');
    setIsCreating(false);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setErrorMessage(null);

    if (title.trim().length > 120) {
      setErrorMessage('Series title cannot exceed 120 characters.');
      return;
    }

    if (description.trim().length > 1000) {
      setErrorMessage('Series description cannot exceed 1,000 characters.');
      return;
    }

    if (isPasswordProtected && !password.trim()) {
      setErrorMessage('Please enter a collector access password.');
      return;
    }

    const orderNum = Number(order);
    if (orderNum < 0 || orderNum > 10000) {
      setErrorMessage('Display order must be between 0 and 10,000.');
      return;
    }

    try {
      if (editingId) {
        await api.updateCollection(editingId, {
          title: title.trim().slice(0, 120),
          description: description.trim() ? description.trim().slice(0, 1000) : undefined,
          order: orderNum,
          visibility,
          isPasswordProtected,
          password: isPasswordProtected ? password.trim() : undefined,
        });
      } else {
        await api.createCollection({
          creatorId,
          title: title.trim().slice(0, 120),
          description: description.trim() ? description.trim().slice(0, 1000) : undefined,
          order: orderNum,
          visibility,
          isPasswordProtected,
          password: isPasswordProtected ? password.trim() : undefined,
        } as any);
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
            Curated Collections & VIP Private Galleries
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Group your works into thematic series or lock exclusive exhibitions behind secure collector passwords.
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
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Earth & Ash 2026 (VIP Collector Preview)"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                max={10000}
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
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the research question, kiln firing, or thematic context of this series..."
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed"
            />
          </div>

          {/* Password Protection for Private VIP Galleries */}
          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xs space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="password-protect-check"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="rounded-xs border-neutral-300 text-neutral-900 focus:ring-0"
              />
              <label htmlFor="password-protect-check" className="text-xs font-semibold text-neutral-900 cursor-pointer flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Password-Protect Private Gallery (e.g. VIP Collector Preview)</span>
              </label>
            </div>

            {isPasswordProtected && (
              <div className="pl-5 pt-1">
                <label className="block text-[11px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
                  Secure Collector Password *
                </label>
                <input
                  type="text"
                  required={isPasswordProtected}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. collector2026"
                  className="w-full sm:w-72 px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Visitors must enter this passcode to view artworks in this collection.
                </p>
              </div>
            )}
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
                <div className="flex items-center gap-2">
                  {col.isPasswordProtected && (
                    <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                      <Lock className="w-3 h-3" />
                      <span>Protected</span>
                    </span>
                  )}
                  <span className="capitalize">{col.visibility}</span>
                </div>
              </div>

              <h3 className="font-editorial text-xl font-normal text-neutral-900 mb-1">
                {col.title}
              </h3>
              <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                {col.description || 'No conceptual statement provided.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <span className="text-xs text-neutral-500 font-mono">
                {col.artworkCount || 0} Artworks Catalogued
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEdit(col)}
                  className="px-3 py-1.5 border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-medium rounded-xs transition-colors inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(col.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors inline-flex items-center gap-1 ${
                    confirmDeleteId === col.id
                      ? 'bg-red-600 text-white'
                      : 'border border-neutral-300 hover:border-red-600 text-neutral-700 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{confirmDeleteId === col.id ? 'Confirm?' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
