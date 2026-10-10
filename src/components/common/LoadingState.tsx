import React from 'react';

interface LoadingStateProps {
  type?: 'card' | 'grid' | 'full';
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  type = 'grid', 
  message = 'Loading studio records...' 
}) => {
  if (type === 'full') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-neutral-200/80 rounded-xs" />
        <div className="h-8 w-64 bg-neutral-200/80 rounded-xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/3] w-full bg-neutral-200/80 rounded-xs" />
            <div className="h-5 w-3/4 bg-neutral-200/80 rounded-xs" />
            <div className="h-3 w-1/2 bg-neutral-200/80 rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  );
};
