'use client';

import React, { useState } from 'react';
import { ConversationState } from '@/types/chat';
import { Database, ChevronDown, ChevronUp, User, Calendar, Stethoscope, CheckCircle2 } from 'lucide-react';

interface StateInspectorProps {
  state: ConversationState;
}

export const StateInspector: React.FC<StateInspectorProps> = ({ state }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasAnyState = state.doctor || state.service || state.selectedSlot || state.patient.name || state.patient.phone;

  return (
    <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-2 text-xs">
      <div className="mx-auto max-w-4xl flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Database className="h-3.5 w-3.5 text-teal-600" />
          <span>Active Conversation State</span>
          {hasAnyState && (
            <span className="ml-1 h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          )}
          {isOpen ? <ChevronDown className="h-3.5 w-3.5 ml-1" /> : <ChevronUp className="h-3.5 w-3.5 ml-1" />}
        </button>

        <div className="hidden sm:flex items-center gap-3 text-slate-500">
          {state.doctor && (
            <span className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3 text-teal-600" />
              <strong className="text-slate-700">{state.doctor.name}</strong>
            </span>
          )}
          {state.selectedSlot && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-teal-600" />
              <span>{state.selectedSlot.startTime.substring(11, 16)}</span>
            </span>
          )}
          {state.patient.name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3 text-teal-600" />
              <span>{state.patient.name}</span>
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mx-auto max-w-4xl mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-xs animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                Doctor & Service
              </div>
              <p className="text-slate-600">
                Doctor: {state.doctor ? `${state.doctor.name} (${state.doctor.specialization})` : 'None selected'}
              </p>
              <p className="text-slate-600">
                Service: {state.service ? state.service.name : 'Default'}
              </p>
            </div>

            <div>
              <div className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Calendar className="h-3.5 w-3.5 text-teal-600" />
                Selected Slot
              </div>
              <p className="text-slate-600">
                Date: {state.date || 'Not set'}
              </p>
              <p className="text-slate-600">
                Slot: {state.selectedSlot ? `${state.selectedSlot.startTime.substring(11, 16)} - ${state.selectedSlot.endTime.substring(11, 16)}` : 'None selected'}
              </p>
            </div>

            <div>
              <div className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <User className="h-3.5 w-3.5 text-teal-600" />
                Patient Details
              </div>
              <p className="text-slate-600">
                Name: {state.patient.name || 'Not provided'}
              </p>
              <p className="text-slate-600">
                Phone: {state.patient.phone || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
