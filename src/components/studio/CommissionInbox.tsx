import React, { useState } from 'react';
import { 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { CommissionRequest, CommissionStatus } from '../../types/index.js';
import { api } from '../../services/api.js';
import { getSafeExternalUrl } from '../../lib/linkSanitizer.js';

interface CommissionInboxProps {
  commissions: CommissionRequest[];
  onRefresh: () => void;
}

const STATUS_ORDER: CommissionStatus[] = [
  'RECEIVED',
  'IN_REVIEW',
  'ACCEPTED',
  'IN_PROGRESS',
  'DELIVERED',
];

export const CommissionInbox: React.FC<CommissionInboxProps> = ({
  commissions,
  onRefresh,
}) => {
  const [selectedId, setSelectedId] = useState<string>(commissions[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = filterStatus === 'all'
    ? commissions
    : commissions.filter(c => c.status === filterStatus);

  const activeCommission = commissions.find(c => c.id === selectedId) || filtered[0];

  const handleStatusChange = async (newStatus: CommissionStatus) => {
    if (!activeCommission) return;
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      await api.updateCommissionStatus(
        activeCommission.id, 
        newStatus, 
        statusNoteInput.trim() || undefined
      );
      setStatusNoteInput('');
      setToastMessage(`Status transitioned to ${newStatus.replace('_', ' ')}. Simulated email notification logged!`);
      setTimeout(() => setToastMessage(null), 4000);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update commission status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: CommissionStatus) => {
    switch (status) {
      case 'RECEIVED': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'IN_REVIEW': return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'ACCEPTED': return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'IN_PROGRESS': return 'text-purple-800 bg-purple-50 border-purple-200';
      case 'DELIVERED': return 'text-neutral-800 bg-neutral-100 border-neutral-300';
      case 'DECLINED': return 'text-red-800 bg-red-50 border-red-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-neutral-900">
            Commission Intake & Pipeline
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Review inbound client briefs, accept proposals, and track studio delivery checkpoints.
          </p>
        </div>

        {/* Filter by status */}
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-neutral-300 rounded-xs focus:outline-none"
          >
            <option value="all">All Requests ({commissions.length})</option>
            <option value="RECEIVED">Received</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DELIVERED">Delivered</option>
            <option value="DECLINED">Declined</option>
          </select>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xs flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-900 rounded-xs flex items-center justify-between animate-fadeIn">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900 font-bold ml-2">✕</button>
        </div>
      )}

      {commissions.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 bg-white border border-neutral-200 rounded-xs">
          <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No commission inquiries received yet.</p>
          <p className="text-xs text-neutral-500 mt-1">
            Test the visitor view to submit a sample commission inquiry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Request List */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.map((item) => {
              const isSelected = item.id === (activeCommission?.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded-xs border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-neutral-900 shadow-xs ring-1 ring-neutral-900'
                      : 'bg-white/80 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-editorial text-lg font-bold text-neutral-900 truncate">
                      {item.clientName}
                    </span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs border ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2 font-light mb-2">
                    {item.brief}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>
                      {item.serviceTitle || 'Bespoke Work'}
                    </span>
                    <span className="text-neutral-800 font-medium tabular-nums">
                      ${item.budget.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Inspection & Workflow Actions */}
          {activeCommission && (
            <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xs p-6 space-y-6 shadow-xs">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs border ${getStatusColor(activeCommission.status)}`}>
                      {activeCommission.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs text-neutral-500 font-mono">
                      Received {new Date(activeCommission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-editorial text-3xl font-normal text-neutral-900">
                    {activeCommission.clientName}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-400 block font-mono">Allocated Budget</span>
                  <span className="font-mono text-2xl font-light text-neutral-900 tabular-nums">
                    ${activeCommission.budget.toLocaleString()} {activeCommission.currency}
                  </span>
                </div>
              </div>

              {/* Client Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50/70 p-4 rounded-xs border border-neutral-200/60">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <a href={`mailto:${activeCommission.clientEmail}`} className="hover:underline font-mono">
                    {activeCommission.clientEmail}
                  </a>
                </div>
                {activeCommission.clientPhone && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono">{activeCommission.clientPhone}</span>
                  </div>
                )}
                {activeCommission.deadline && (
                  <div className="flex items-center gap-2 text-neutral-700 sm:col-span-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Target Delivery Date: <strong className="font-mono">{activeCommission.deadline}</strong></span>
                  </div>
                )}
                {activeCommission.intendedUse && (
                  <div className="text-xs text-neutral-700 sm:col-span-2 pt-1 border-t border-neutral-200/60">
                    <span className="text-neutral-500 block mb-0.5 uppercase tracking-wider text-[10px]">Intended Use & Placement</span>
                    <span className="font-medium text-neutral-900">{activeCommission.intendedUse}</span>
                  </div>
                )}
              </div>

              {/* Raw Client Brief */}
              <div>
                <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block mb-1.5">
                  Client Project Vision
                </span>
                <p className="text-xs leading-relaxed text-neutral-700 bg-white p-3 rounded-xs border border-neutral-200 font-light">
                  {activeCommission.brief}
                </p>
              </div>

              {/* Reference Links & Moodboards */}
              {activeCommission.referenceImages && activeCommission.referenceImages.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block mb-1.5">
                    Reference Links & Moodboards
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCommission.referenceImages.map((refUrl, idx) => {
                      const safeUrl = getSafeExternalUrl(refUrl);
                      if (!safeUrl) return null;
                      return (
                        <a
                          key={idx}
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xs text-xs text-neutral-800 transition-colors font-mono"
                        >
                          <ExternalLink className="w-3 h-3 text-neutral-500" />
                          <span>Reference Asset #{idx + 1}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI-Enhanced Structured Brief if available */}
              {activeCommission.aiEnhancedBrief && (
                <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xs space-y-2">
                  <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    Curated AI Scope & Deliverable Analysis
                  </span>
                  <pre className="text-[11px] text-amber-950 font-sans whitespace-pre-wrap leading-relaxed">
                    {activeCommission.aiEnhancedBrief}
                  </pre>
                </div>
              )}

              {/* Status Notes / Log */}
              {activeCommission.statusNotes && (
                <div className="border-l-2 border-neutral-300 pl-3 py-1 text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-800 block text-[11px] uppercase tracking-wider">Latest Studio Note:</span>
                  {activeCommission.statusNotes}
                </div>
              )}

              {/* Workflow Status Controls */}
              <div className="pt-4 border-t border-neutral-200 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wider mb-1">
                    Append Status Note for Client Notification Email
                  </label>
                  <input
                    type="text"
                    value={statusNoteInput}
                    onChange={(e) => setStatusNoteInput(e.target.value)}
                    placeholder="e.g. Clay test tiles fired. Shipping photos to client for approval..."
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mr-2">
                    Advance Status:
                  </span>

                  {activeCommission.status === 'RECEIVED' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('IN_REVIEW')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                      >
                        Mark In Review
                      </button>
                      <button
                        onClick={() => handleStatusChange('ACCEPTED')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleStatusChange('DECLINED')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-neutral-200 hover:bg-red-100 text-neutral-700 hover:text-red-700 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {activeCommission.status === 'IN_REVIEW' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('ACCEPTED')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleStatusChange('DECLINED')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-neutral-200 hover:bg-red-100 text-neutral-700 hover:text-red-700 text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {activeCommission.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                    >
                      Start Studio Production (In Progress)
                    </button>
                  )}

                  {activeCommission.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusChange('DELIVERED')}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
                    >
                      Mark Completed & Delivered
                    </button>
                  )}

                  {activeCommission.status === 'DELIVERED' && (
                    <span className="text-xs font-medium text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Commission Completed and Shipped
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
