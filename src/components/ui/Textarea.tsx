import React from 'react';
import { cn } from '../../lib/utils.js';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-neutral-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 leading-relaxed transition-colors',
            error && 'border-red-500 focus:border-red-600 focus:ring-red-600',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
