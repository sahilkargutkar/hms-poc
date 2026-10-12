'use client';

import React, { useState } from 'react';
import { EmergencyContacts } from '@/types/chat';
import {
  AlertTriangle,
  PhoneCall,
  Phone,
  Copy,
  Check,
  ShieldAlert,
  Ambulance,
  HeartPulse
} from 'lucide-react';

interface EmergencyCardProps {
  contacts?: EmergencyContacts;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ contacts }) => {
  const [copiedType, setCopiedType] = useState<'hotline' | 'mobile' | null>(null);

  const hotline = contacts?.hotline || '+1 (800) 555-CARE';
  const hotlineTel = contacts?.hotlineTel || '+18005552273';
  const mobile = contacts?.mobile || '+1 (555) 911-0199';
  const mobileTel = contacts?.mobileTel || '+15559110199';

  const handleCopy = (text: string, type: 'hotline' | 'mobile') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50/90 via-red-50/40 to-white shadow-md shadow-rose-500/10 transition-all">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-rose-200/80 bg-rose-600 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20">
            <ShieldAlert className="h-4 w-4 animate-pulse text-white" />
          </span>
          <span className="text-xs font-bold tracking-wide uppercase">
            Emergency Care Contacts
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-rose-50">
          <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
          24/7 ACTIVE
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Urgent Attention Alert */}
        <div className="rounded-xl border border-rose-200 bg-white/90 p-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 leading-relaxed">
              <strong className="font-semibold text-rose-900 block mb-0.5">
                Life-Threatening Situation?
              </strong>
              If you or the patient are experiencing acute chest pain, severe shortness of breath, sudden paralysis, or heavy bleeding, call <strong className="text-rose-700 underline font-bold">911</strong> or proceed directly to the nearest Emergency Room.
            </div>
          </div>
        </div>

        {/* Detected Emergency Category Chips */}
        {contacts?.matchedCategories && contacts.matchedCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 -mt-1">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wide">
              Priority Triage:
            </span>
            {contacts.matchedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 rounded-md bg-rose-100/90 px-2.5 py-0.5 text-[11px] font-bold text-rose-900 ring-1 ring-rose-300 shadow-2xs"
              >
                <AlertTriangle className="h-3 w-3 text-rose-600" />
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Contact Numbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. 24/7 Hotline Number */}
          <div className="flex flex-col justify-between rounded-xl border border-rose-200 bg-white p-3.5 shadow-xs transition-shadow hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  <Ambulance className="h-3.5 w-3.5" />
                  Clinic 24/7 Hotline
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(hotline, 'hotline')}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Copy Hotline Number"
                >
                  {copiedType === 'hotline' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="mt-2">
                <div className="text-lg font-extrabold tracking-tight text-slate-900 font-mono">
                  {hotline}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Toll-Free Urgent Care Triage Line
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <a
                href={`tel:${hotlineTel}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-[0.98] transition-all"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Hotline Now</span>
              </a>
            </div>
          </div>

          {/* 2. On-Call Mobile Number */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-shadow hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  <HeartPulse className="h-3.5 w-3.5 text-rose-600" />
                  Duty Doctor Mobile
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(mobile, 'mobile')}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Copy Mobile Number"
                >
                  {copiedType === 'mobile' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="mt-2">
                <div className="text-lg font-extrabold tracking-tight text-slate-900 font-mono">
                  {mobile}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct Clinic Duty Physician Mobile
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <a
                href={`tel:${mobileTel}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-[0.98] transition-all"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Mobile Now</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>CarePoint Emergency Response Team</span>
          <span className="font-medium text-emerald-600">Immediate Line Available</span>
        </div>
      </div>
    </div>
  );
};
