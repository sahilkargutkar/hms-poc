'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  content: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ content, onRetry }) => {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-slate-800 shadow-xs">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
            Clinic Notification
          </h4>
          <p className="mt-1 text-xs text-slate-700 leading-relaxed">
            {content}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-50 transition-colors"
            >
              <RefreshCw className="h-3 w-3 text-amber-700" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
