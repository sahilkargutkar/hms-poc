'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Stethoscope,
  Minus,
  Maximize2,
  Minimize2,
  X,
  ChevronUp,
  Sparkles,
  Bot
} from 'lucide-react';
import { ChatContainer } from './ChatContainer';
import { useChat } from '@/hooks/useChat';

export type WidgetState = 'closed' | 'minimized' | 'normal' | 'maximized';

interface FloatingChatWidgetProps {
  chatHook: ReturnType<typeof useChat>;
  widgetState: WidgetState;
  setWidgetState: React.Dispatch<React.SetStateAction<WidgetState>>;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  chatHook,
  widgetState,
  setWidgetState
}) => {
  const [showNotificationTooltip, setShowNotificationTooltip] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-dismiss initial promo tooltip after 10s or when opened
  useEffect(() => {
    if (widgetState !== 'closed') {
      setShowNotificationTooltip(false);
      setHasInteracted(true);
    }
  }, [widgetState]);

  return (
    <>
      {/* 1. CLOSED STATE: Floating Action Button / Launcher */}
      {widgetState === 'closed' && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
          {/* Promo Speech Bubble */}
          {showNotificationTooltip && !hasInteracted && (
            <div className="mb-3 max-w-xs animate-bounce rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-slate-900/10 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>CarePoint Front Desk</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotificationTooltip(false);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Dismiss tooltip"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Book a doctor, check available consultation slots, or manage visits instantly!
              </p>
            </div>
          )}

          {/* Floating Trigger Button */}
          <button
            type="button"
            onClick={() => setWidgetState('normal')}
            className="group relative flex items-center gap-2.5 rounded-full bg-teal-600 px-4 py-3.5 text-white shadow-xl ring-4 ring-teal-500/20 hover:bg-teal-700 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Open Clinic Reception Desk"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-teal-700/50">
              <Stethoscope className="h-4 w-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </span>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold leading-tight">Chat with Front Desk</div>
              <div className="text-[10px] text-teal-100 leading-tight">Reception Online</div>
            </div>
          </button>
        </div>
      )}

      {/* 2. MINIMIZED STATE: Docked Pill Bar at bottom right */}
      {widgetState === 'minimized' && (
        <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex h-12 w-72 sm:w-80 items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-3.5 shadow-xl backdrop-blur-md ring-1 ring-slate-900/5">
            <button
              type="button"
              onClick={() => setWidgetState('normal')}
              className="flex flex-1 items-center gap-2.5 text-left min-w-0"
              title="Click to restore chat"
            >
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Stethoscope className="h-3.5 w-3.5" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  CarePoint Clinic Reception
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">
                  • Click to expand conversation
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1 pl-2">
              <button
                type="button"
                onClick={() => setWidgetState('normal')}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                title="Restore size"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setWidgetState('maximized')}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                title="Maximize full screen"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setWidgetState('closed')}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="Close chat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NORMAL FLOATING WINDOW */}
      {widgetState === 'normal' && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[450px] md:w-[480px] h-[620px] max-h-[calc(100vh-4.5rem)] rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
          <ChatContainer
            isWidget={true}
            isMaximized={false}
            onMinimize={() => setWidgetState('minimized')}
            onMaximize={() => setWidgetState('maximized')}
            onClose={() => setWidgetState('closed')}
            chatHook={chatHook}
          />
        </div>
      )}

      {/* 4. MAXIMIZED MODAL VIEW */}
      {widgetState === 'maximized' && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setWidgetState('normal')}
          />

          {/* Expanded Window */}
          <div className="fixed inset-2 sm:inset-5 md:inset-8 z-50 mx-auto max-w-5xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2.5rem)] md:h-[calc(100vh-4rem)] rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-900/15 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <ChatContainer
              isWidget={true}
              isMaximized={true}
              onMinimize={() => setWidgetState('minimized')}
              onMaximize={() => setWidgetState('normal')}
              onClose={() => setWidgetState('closed')}
              chatHook={chatHook}
            />
          </div>
        </>
      )}
    </>
  );
};
