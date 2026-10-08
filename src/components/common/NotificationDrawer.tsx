import React from 'react';
import { X, Mail, CheckCircle, Bell, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../../types/index.js';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onViewCommission?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onViewCommission,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-[#FAF9F6] h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-700" />
            <h2 className="font-editorial text-xl font-bold text-neutral-900">
              Activity & Notifications
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="bg-amber-50/80 px-6 py-3 border-b border-amber-200/50 text-xs text-amber-900">
          <p className="font-medium">Live Communication Feed</p>
          <p className="text-amber-800/80 text-[11px] mt-0.5">
            Real-time simulated email dispatches to patrons and commission intake logs.
          </p>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No activity records yet.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-sm border transition-all ${
                  item.read
                    ? 'bg-white/60 border-neutral-200 text-neutral-600'
                    : 'bg-white border-amber-300/80 shadow-xs text-neutral-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500 truncate max-w-[180px]">
                    To: {item.recipientEmail}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-neutral-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                  {!item.read && (
                    <button
                      onClick={() => onMarkRead(item.id)}
                      className="text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Mark acknowledged</span>
                    </button>
                  )}
                  {onViewCommission && item.type === 'commission_new' && (
                    <button
                      onClick={() => {
                        onClose();
                        onViewCommission();
                      }}
                      className="text-neutral-900 hover:underline font-medium inline-flex items-center gap-1 ml-auto"
                    >
                      <span>Open Inbox</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-neutral-900 text-white text-xs font-medium uppercase tracking-wider rounded-sm hover:bg-neutral-800 transition-colors"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
};
