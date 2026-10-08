import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Records',
  message = 'The studio server encountered a communication issue. Please verify your connection or retry.',
  onRetry,
}) => {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xs p-8 text-center space-y-4 shadow-xs">
        <AlertCircle className="w-8 h-8 text-amber-700 mx-auto" />
        <h3 className="font-editorial text-2xl font-normal text-neutral-900">
          {title}
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed font-light">
          {message}
        </p>
        {onRetry && (
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Retry Operation</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
