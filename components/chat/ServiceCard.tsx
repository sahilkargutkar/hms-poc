'use client';

import React from 'react';
import { MedicalService } from '@/types/api';
import { Clock, Tag, Check } from 'lucide-react';

interface ServiceCardProps {
  service: MedicalService;
  onSelect: (service: MedicalService) => void;
  isSelected?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect, isSelected }) => {
  return (
    <div
      onClick={() => onSelect(service)}
      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
        isSelected
          ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-500'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">{service.name}</h4>
          {service.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">{service.description}</p>
          )}
        </div>
        {isSelected && (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
            <Check className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{service.durationMinutes} mins</span>
        </span>
        {service.priceEstimate && (
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <span>{service.priceEstimate}</span>
          </span>
        )}
      </div>
    </div>
  );
};
