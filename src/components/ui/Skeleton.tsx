import React from 'react';
import { cn } from '../../lib/utils.js';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-xs bg-neutral-200/70', className)}
      {...props}
    />
  );
};
