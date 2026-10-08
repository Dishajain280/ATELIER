import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, RefreshCw, X } from 'lucide-react';
import { CommissionService } from '../../types/index.js';
import { api } from '../../services/api.js';

interface ServiceManagerProps {
  creatorId: string;
  services: CommissionService[];
  onRefresh: () => void;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  creatorId,
  services,
  onRefresh,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(1500);
  const [turnaroundWeeks, setTurnaroundWeeks] = useState<number>(6);
  const [revisionsIncluded, setRevisionsIncluded] = useState<number>(2);
  const [deliverableSummary, setDeliverableSummary] = useState('');
  const [active, setActive] = useState(true);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBasePrice(1500);
    setTurnaroundWeeks(6);
    setRevisionsIncluded(2);
    setDeliverableSummary('');
    setActive(true);
    setIsCreating(false);
    setEditingId(null);
    setErrorMessage(null);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartEdit = (service: CommissionService) => {
    setEditingId(service.id);
    setTitle(service.title);
    setDescription(service.description);
    setBasePrice(service.basePrice);
    setTurnaroundWeeks(service.turnaroundWeeks);
    setRevisionsIncluded(service.revisionsIncluded);
    setDeliverableSummary(service.deliverableSummary || '');
    setActive(service.active);
    setIsCreating(false);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setErrorMessage(null);

    try {
      if (editingId) {
        await api.updateService(editingId, {
          title: title.trim(),
          description: description.trim(),
          basePrice: Number(basePrice),
          turnaroundWeeks: Number(turnaroundWeeks),
          revisionsIncluded: Number(revisionsIncluded),
          deliverableSummary: deliverableSummary.trim(),
          active,
        });
      } else {
        await api.createService({
          creatorId,
          title: title.trim(),
          description: description.trim(),
          basePrice: Number(basePrice),
          currency: 'USD',
          turnaroundWeeks: Number(turnaroundWeeks),
          revisionsIncluded: Number(revisionsIncluded),
          deliverableSummary: deliverableSummary.trim(),
          active,
          sampleImages: [],
        });
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save service tier');
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
      await api.deleteService(id);
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete service tier');
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
            Commission Service Offerings
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure transparent base rates, delivery schedules, and scope boundaries for prospective patrons.
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
            <span>Add Service Tier</span>
          </button>
        )}
      </div>

      {/* Inline Create / Edit Drawer */}
      {(isCreating || editingId) && (
        <form onSubmit={handleSave} className="bg-white border border-neutral-300 p-6 rounded-xs space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h3 className="font-editorial text-xl font-normal text-neutral-900">
              {editingId ? 'Edit Service Tier' : 'Create Commission Service Offering'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-neutral-400 hover:text-neutral-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Tier Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bespoke Sculptural Vessel"
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-editorial text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Base Price (USD) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Scope Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what this custom engagement entails, clay body options, kiln temperatures..."
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Estimated Turnaround (Weeks)
              </label>
              <input
                type="number"
                min="1"
                value={turnaroundWeeks}
                onChange={(e) => setTurnaroundWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Included Review Checkpoints
              </label>
              <input
                type="number"
                min="0"
                value={revisionsIncluded}
                onChange={(e) => setRevisionsIncluded(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Deliverable Summary
            </label>
            <input
              type="text"
              value={deliverableSummary}
              onChange={(e) => setDeliverableSummary(e.target.value)}
              placeholder="e.g. One bespoke vessel (up to 45cm) with signed certificate of authenticity."
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
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
              {editingId ? 'Save Tier' : 'Publish Tier'}
            </button>
          </div>
        </form>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-neutral-200 rounded-xs p-6 flex flex-col justify-between hover:border-neutral-300 transition-colors shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                <span>ACTIVE TIER</span>
                <span className="font-mono text-base font-semibold text-neutral-900 tabular-nums">
                  ${srv.basePrice}
                </span>
              </div>

              <h3 className="font-editorial text-2xl font-normal text-neutral-900 mb-2">
                {srv.title}
              </h3>

              <p className="text-xs text-neutral-600 font-light leading-relaxed mb-4">
                {srv.description}
              </p>

              <div className="border-t border-b border-neutral-100 py-3 space-y-2 text-xs text-neutral-600 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Turnaround:
                  </span>
                  <span className="font-mono text-neutral-900 font-medium">{srv.turnaroundWeeks} Weeks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Revisions:
                  </span>
                  <span className="font-mono text-neutral-900 font-medium">{srv.revisionsIncluded} Included</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                onClick={() => handleStartEdit(srv)}
                className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xs transition-colors"
                title="Edit Tier"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {confirmDeleteId === srv.id ? (
                <div className="flex items-center gap-1 animate-fadeIn">
                  <button
                    onClick={() => handleDelete(srv.id)}
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
                  onClick={() => handleDelete(srv.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded-xs transition-colors"
                  title="Delete Tier"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
