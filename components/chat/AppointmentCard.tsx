'use client';

import React from 'react';
import { Appointment } from '@/types/api';
import { Calendar, Clock, User, Phone, CheckCircle2, XCircle, AlertCircle, RefreshCw, Star, ExternalLink } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  showActions?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  onReschedule,
  showActions = true
}) => {
  const startDate = new Date(appointment.startTime);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const isCancelled = appointment.status === 'CANCELLED';

  return (
    <div
      className={`rounded-xl border p-4.5 transition-all ${
        isCancelled
          ? 'border-slate-200 bg-slate-50 opacity-75'
          : 'border-slate-200 bg-white shadow-xs hover:border-slate-300'
      }`}
    >
      {/* Status & ID Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-mono text-slate-400">
          Ref: {appointment.id}
        </span>
        <div>
          {appointment.status === 'CONFIRMED' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmed
            </span>
          )}
          {appointment.status === 'CANCELLED' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20">
              <XCircle className="h-3.5 w-3.5" />
              Cancelled
            </span>
          )}
          {appointment.status === 'RESCHEDULED' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
              <RefreshCw className="h-3.5 w-3.5" />
              Rescheduled
            </span>
          )}
        </div>
      </div>

      {/* Appointment Information */}
      <div className="mt-3.5 space-y-2.5">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
            {appointment.doctorName}
          </h3>
          <p className="text-xs font-medium text-teal-700">
            {appointment.specialization} • {appointment.serviceName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-medium">{formattedTime}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-slate-200/60">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{appointment.patientName}</span>
            <span className="text-slate-400">•</span>
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{appointment.patientPhone}</span>
          </div>
        </div>
      </div>

      {/* Post Appointment Google Review Link */}
      {!isCancelled && appointment.status === 'CONFIRMED' && (
        <div className="mt-3 rounded-lg border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-amber-50/80 p-2.5 text-xs shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-medium">
              <span className="text-amber-500 font-bold tracking-tight">★★★★★</span>
              <span>Happy with your booking? Share your feedback!</span>
            </div>
            <a
              href="https://g.page/r/carepoint-clinic/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-amber-700 active:scale-95 transition-all self-start sm:self-auto"
            >
              <span>Review on Google</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && !isCancelled && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={() => onCancel(appointment)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 active:bg-rose-200 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
};
