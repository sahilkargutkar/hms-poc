'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  X,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatHeaderProps {
  onReset: () => void;
  isMockMode?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
  isWidget?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onReset,
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
  isWidget = false
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-3.5 py-2.5 backdrop-blur-md sm:px-5">
        {/* Clinic Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs ring-4 ring-teal-50">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base truncate">
                CarePoint Clinic
              </h1>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Receptionist
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              24/7 Automated Appointment Scheduling
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Help Button */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex h-8 w-8 sm:w-auto items-center justify-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Help & Info"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <span className="hidden md:inline">Help</span>
          </button>

          {/* Reset / New Session */}
          <button
            type="button"
            onClick={onReset}
            className="flex h-8 w-8 sm:w-auto items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Start New Session"
            aria-label="New Session"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">New Session</span>
          </button>

          {/* Widget Controls */}
          {isWidget && (
            <div className="flex items-center gap-0.5 pl-1 border-l border-slate-200 ml-1">
              {onMinimize && (
                <button
                  type="button"
                  onClick={onMinimize}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  title="Minimize chat"
                  aria-label="Minimize"
                >
                  <Minus className="h-4 w-4" />
                </button>
              )}

              {onMaximize && (
                <button
                  type="button"
                  onClick={onMaximize}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  title={isMaximized ? 'Restore window' : 'Maximize window'}
                  aria-label={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              )}

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Close chat"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
                <h2 className="text-base font-semibold text-slate-900">How to use CarePoint AI</h2>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>You can chat naturally or click interactive cards to:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Find Doctors:</strong> "I need to see a dentist tomorrow" or "Show me general physicians"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Check Availability:</strong> "What slots are available at 4 PM?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Book Consultations:</strong> Click a slot, enter your name & phone, and confirm.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span><strong>Manage Visits:</strong> "Show me my appointments" or "Cancel my booking" (Test phone: <code>9876543210</code>)</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
