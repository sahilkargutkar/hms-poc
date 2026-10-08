'use client';

import React from 'react';
import { Doctor } from '@/types/api';
import { Star, Award, Calendar, ChevronRight, UserCheck } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
  isSelected?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect, isSelected }) => {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
        isSelected
          ? 'border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500'
          : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200">
              {doctor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
                {doctor.name}
              </h3>
              <span className="inline-flex items-center text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md mt-0.5">
                {doctor.specialization}
              </span>
            </div>
          </div>

          {doctor.rating && (
            <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 border border-amber-200/50">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>{doctor.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {doctor.qualifications && (
          <p className="mt-2.5 text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
            <Award className="h-3 w-3 shrink-0 text-slate-400" />
            <span>{doctor.qualifications}</span>
          </p>
        )}

        {doctor.experienceYears && (
          <p className="mt-1 text-xs text-slate-500">
            {doctor.experienceYears}+ years clinical experience
          </p>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Available This Week</span>
        </span>

        <button
          type="button"
          onClick={() => onSelect(doctor)}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            isSelected
              ? 'bg-teal-700 text-white'
              : 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800'
          }`}
        >
          {isSelected ? (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              <span>Selected</span>
            </>
          ) : (
            <>
              <span>Check Slots</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
