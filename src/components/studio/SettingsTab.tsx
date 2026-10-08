import React, { useState } from 'react';
import { Shield, Globe, Lock, CheckCircle2, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { Creator } from '../../types/index.js';
import { api } from '../../services/api.js';

interface SettingsTabProps {
  creator: Creator;
  onRefresh: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ creator, onRefresh }) => {
  const [handle, setHandle] = useState(creator.handle);
  const [email, setEmail] = useState(creator.email || `${creator.handle}@atelier.app`);
  const [customDomain, setCustomDomain] = useState(creator.customDomain || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      await api.updateCreator(creator.id, {
        handle: handle.trim().toLowerCase(),
        customDomain: customDomain.trim() || undefined,
      });
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-16">
      <div className="border-b border-neutral-200 pb-6 flex items-center justify-between">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-neutral-900">
            Studio Settings & Security
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your canonical handle, custom domain linking, account credentials, and publishing security.
          </p>
        </div>

        {successMessage && (
          <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settings saved successfully</span>
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-neutral-200 p-6 md:p-8 rounded-xs shadow-xs space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
            Canonical URL & Domain Mapping
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Atelier Handle *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-neutral-100 border border-r-0 border-neutral-300 text-xs font-mono text-neutral-500 rounded-l-xs">
                  atelier.app/@
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

            <div>
              <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                Custom Domain (Optional)
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-neutral-100 border border-r-0 border-neutral-300 text-xs font-mono text-neutral-500 rounded-l-xs">
                  https://
                </span>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="art.yourname.com"
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-r-xs focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-neutral-100">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
            Account Credentials
          </h3>

          <div>
            <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
              Studio Owner Email
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xs text-neutral-500 cursor-not-allowed font-mono"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Primary email address used for commission alerts and payouts.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/50 border border-red-200 p-6 rounded-xs space-y-4">
        <div className="flex items-center gap-2 text-red-900">
          <AlertTriangle className="w-4 h-4 text-red-700" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">Danger Zone</h3>
        </div>
        <p className="text-xs text-red-800/80 leading-relaxed">
          Deactivating your studio profile will unpublish all active artworks and suspend incoming commission requests. This action can be undone by contacting support.
        </p>
        <button
          type="button"
          onClick={() => alert('Studio archive requested. Please contact support@atelier.app')}
          className="px-4 py-2 bg-white hover:bg-red-50 border border-red-300 text-red-700 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
        >
          Archive Studio Profile
        </button>
      </div>
    </div>
  );
};
