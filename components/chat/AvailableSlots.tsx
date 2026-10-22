'use client';

import React from 'react';
import { AvailableSlot } from '@/types/api';
import { Clock, Sun, Sunrise, Sunset, CalendarDays } from 'lucide-react';

interface AvailableSlotsProps {
  slots: AvailableSlot[];
  selectedDate?: string;
  selectedSlot?: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
}

export const AvailableSlots: React.FC<AvailableSlotsProps> = ({
  slots,
  selectedDate,
  selectedSlot,
  onSelectSlot
}) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center">
        <Clock className="mx-auto h-6 w-6 text-slate-400" />
        <p className="mt-1.5 text-xs text-slate-600 font-medium">
          No available appointment slots found for this date.
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          Try asking for another day or doctor.
        </p>
      </div>
    );
  }

  // Format date display (parse parts directly to avoid UTC offset shifts)
  const formattedDate = (() => {
    if (!selectedDate) return 'Upcoming Available Date';
    try {
      const clean = selectedDate.includes('T') ? selectedDate.split('T')[0] : selectedDate;
      const [y, m, d] = clean.split('-').map(Number);
      if (y && m && d) {
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      }
    } catch { /* fall through */ }
    return selectedDate;
  })();

  // Group slots into Morning, Afternoon, Evening based on time
  const morningSlots: AvailableSlot[] = [];
  const afternoonSlots: AvailableSlot[] = [];
  const eveningSlots: AvailableSlot[] = [];

  slots.forEach((slot) => {
    let hour = 9;
    if (slot.startTime.includes('T')) {
      hour = parseInt(slot.startTime.split('T')[1].substring(0, 2), 10);
    } else {
      hour = new Date(slot.startTime).getHours();
    }

    if (hour < 12) {
      morningSlots.push(slot);
    } else if (hour < 17) {
      afternoonSlots.push(slot);
    } else {
      eveningSlots.push(slot);
    }
  });

  const renderSlotTime = (isoString: string) => {
    try {
      const timePart = isoString.includes('T') ? isoString.split('T')[1].substring(0, 5) : '';
      if (timePart && timePart.includes(':')) {
        const [h, m] = timePart.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
      }
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString.substring(11, 16);
    }
  };

  const isSlotSelected = (slot: AvailableSlot) => {
    return selectedSlot?.startTime === slot.startTime;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarDays className="h-4 w-4 text-teal-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Available Slots
          </span>
        </div>
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {formattedDate}
        </span>
      </div>

      <div className="mt-3 space-y-4">
        {/* Morning Slots */}
        {morningSlots.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
              <Sunrise className="h-3.5 w-3.5 text-amber-500" />
              <span>Morning</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {morningSlots.map((slot, idx) => {
                const isSelected = isSlotSelected(slot);
                return (
                  <button
                    key={`m_${idx}`}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={`flex items-center justify-center rounded-lg border py-2 px-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-900 active:scale-95'
                    }`}
                  >
                    {renderSlotTime(slot.startTime)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Afternoon Slots */}
        {afternoonSlots.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
              <Sun className="h-3.5 w-3.5 text-orange-500" />
              <span>Afternoon</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {afternoonSlots.map((slot, idx) => {
                const isSelected = isSlotSelected(slot);
                return (
                  <button
                    key={`a_${idx}`}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={`flex items-center justify-center rounded-lg border py-2 px-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-900 active:scale-95'
                    }`}
                  >
                    {renderSlotTime(slot.startTime)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Evening Slots */}
        {eveningSlots.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
              <Sunset className="h-3.5 w-3.5 text-indigo-500" />
              <span>Evening</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {eveningSlots.map((slot, idx) => {
                const isSelected = isSlotSelected(slot);
                return (
                  <button
                    key={`e_${idx}`}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={`flex items-center justify-center rounded-lg border py-2 px-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-900 active:scale-95'
                    }`}
                  >
                    {renderSlotTime(slot.startTime)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
