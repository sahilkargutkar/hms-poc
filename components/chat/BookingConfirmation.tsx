'use client';

import React from 'react';
import { BookingDetailsDraft } from '@/types/chat';
import { Calendar, Clock, User, Phone, CheckCircle, ArrowLeft, Stethoscope } from 'lucide-react';

interface BookingConfirmationProps {
  draft: BookingDetailsDraft;
  onConfirm: () => void;
  onChangeTime?: () => void;
  isLoading?: boolean;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  draft,
  onConfirm,
  onChangeTime,
  isLoading = false
}) => {
  const { doctor, service, selectedSlot, patient } = draft;

  const formattedDate = selectedSlot?.startTime
    ? new Date(selectedSlot.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Selected Date';

  const formattedTime = selectedSlot?.startTime
    ? new Date(selectedSlot.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : 'Selected Time';

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-4 sm:p-5 shadow-sm ring-1 ring-teal-500/10">
      <div className="flex items-center gap-2 border-b border-teal-100 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
          <Stethoscope className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Appointment Confirmation Summary
          </h3>
          <p className="text-xs text-slate-500">
            Please review the consultation details below
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Doctor & Service */}
        <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Practitioner & Service
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-bold text-slate-900 text-sm sm:text-base">
              {doctor?.name || 'Assigned Clinic Specialist'}
            </span>
            <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              {doctor?.specialization || 'Consultant'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600">
            {service?.name || 'General Medical Consultation'}
          </p>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 shadow-xs flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Date</div>
              <div className="text-xs font-semibold text-slate-800 truncate">{formattedDate}</div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 shadow-xs flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Time</div>
              <div className="text-xs font-semibold text-slate-800 truncate">{formattedTime}</div>
            </div>
          </div>
        </div>

        {/* Patient Contact Info */}
        <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Patient Contact Information
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-700">
            <span className="flex items-center gap-1 font-medium">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {patient.name || 'Not provided'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 font-mono text-slate-600">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {patient.phone || 'Not provided'}
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              <CheckCircle className="h-3 w-3 text-emerald-600" />
              OTP Verified
            </span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="mt-4 pt-3 border-t border-teal-100/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
        {onChangeTime && (
          <button
            type="button"
            onClick={onChangeTime}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
            Change Slot / Doctor
          </button>
        )}

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading || !patient.name || !patient.phone}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <CheckCircle className="h-4 w-4" />
          {isLoading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </div>
    </div>
  );
};
