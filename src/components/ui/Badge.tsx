import React from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'success' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'neutral', 
  children, 
  ...props 
}) => {
  const variants = {
    neutral: 'text-neutral-700 bg-neutral-100/80',
    accent: 'text-amber-900 bg-amber-50 border border-amber-200/80',
    success: 'text-emerald-900 bg-emerald-50 border border-emerald-200/80',
    outline: 'text-neutral-800 border border-neutral-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
