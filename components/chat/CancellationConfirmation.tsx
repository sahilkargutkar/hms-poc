'use client';

import React from 'react';
import { Appointment } from '@/types/api';
import { AlertTriangle, Calendar, Clock, User, Check, X } from 'lucide-react';

interface CancellationConfirmationProps {
  appointment: Appointment;
  onConfirmCancel: (appointment: Appointment) => void;
  onKeepAppointment: () => void;
  isLoading?: boolean;
}

export const CancellationConfirmation: React.FC<CancellationConfirmationProps> = ({
  appointment,
  onConfirmCancel,
  onKeepAppointment,
  isLoading = false
}) => {
  const startDate = new Date(appointment.startTime);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-rose-100 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Confirm Appointment Cancellation
          </h3>
          <p className="text-xs text-slate-500">
            This action will release the slot back to the clinic calendar.
          </p>
        </div>
      </div>

      <div className="mt-3.5 rounded-lg bg-white p-3 border border-rose-100 text-xs text-slate-700 space-y-1.5">
        <div className="font-semibold text-slate-900 text-sm">
          {appointment.doctorName}
        </div>
        <div className="text-teal-700 font-medium">
          {appointment.specialization} • {appointment.serviceName}
        </div>
        <div className="flex items-center gap-3 pt-1 text-slate-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {formattedTime}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-rose-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
        <button
          type="button"
          onClick={onKeepAppointment}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Check className="h-3.5 w-3.5 text-slate-500" />
          Keep Appointment
        </button>

        <button
          type="button"
          onClick={() => onConfirmCancel(appointment)}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 transition-all"
        >
          <X className="h-4 w-4" />
          {isLoading ? 'Cancelling...' : 'Yes, Cancel Appointment'}
        </button>
      </div>
    </div>
  );
};
