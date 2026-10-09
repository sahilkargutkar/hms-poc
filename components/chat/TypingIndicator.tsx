import React from 'react';
import { Stethoscope } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 ring-1 ring-teal-600/10">
        <Stethoscope className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-xs">
        <span className="text-xs font-medium text-slate-500 mr-1">Checking appointment schedule</span>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600 [animation-delay:-0.3s]"></span>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600 [animation-delay:-0.15s]"></span>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600"></span>
      </div>
    </div>
  );
};
