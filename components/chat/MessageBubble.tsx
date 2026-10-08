'use client';

import React from 'react';
import { ChatMessage, QuickReply } from '@/types/chat';
import { Doctor, MedicalService, AvailableSlot, Appointment } from '@/types/api';
import { Stethoscope, User } from 'lucide-react';
import { DoctorCard } from './DoctorCard';
import { ServiceCard } from './ServiceCard';
import { AvailableSlots } from './AvailableSlots';
import { AppointmentCard } from './AppointmentCard';
import { BookingConfirmation } from './BookingConfirmation';
import { CancellationConfirmation } from './CancellationConfirmation';
import { ErrorMessage } from './ErrorMessage';
import { QuickReplies } from './QuickReplies';

interface MessageBubbleProps {
  message: ChatMessage;
  selectedDoctor?: Doctor | null;
  selectedSlot?: AvailableSlot | null;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectService: (service: MedicalService) => void;
  onSelectSlot: (slot: AvailableSlot) => void;
  onConfirmBooking: () => void;
  onRequestCancel: (appointment: Appointment) => void;
  onConfirmCancel: (appointment: Appointment) => void;
  onQuickReply: (reply: QuickReply) => void;
  isLoading?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  selectedDoctor,
  selectedSlot,
  onSelectDoctor,
  onSelectService,
  onSelectSlot,
  onConfirmBooking,
  onRequestCancel,
  onConfirmCancel,
  onQuickReply,
  isLoading = false
}) => {
  const isUser = message.role === 'user';

  // Basic markdown-like bold and line-break renderer
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // Split by newlines
    const paragraphs = content.split('\n\n');

    return (
      <div className="space-y-2">
        {paragraphs.map((para, pIdx) => {
          const lines = para.split('\n');
          return (
            <p key={pIdx} className="leading-relaxed">
              {lines.map((line, lIdx) => {
                // Parse bold **text**
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <React.Fragment key={lIdx}>
                    {lIdx > 0 && <br />}
                    {parts.map((part, idx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={idx} className="font-semibold text-slate-900">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </React.Fragment>
                );
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className={`group flex items-start gap-3 transition-opacity ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-2xs ${
          isUser
            ? 'bg-slate-800 text-white ring-2 ring-slate-100'
            : 'bg-teal-600 text-white ring-2 ring-teal-100'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
      </div>

      {/* Message Content Container */}
      <div className={`flex max-w-[88%] sm:max-w-[78%] flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Text Bubble */}
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm shadow-xs ${
              isUser
                ? 'rounded-tr-sm bg-slate-900 text-white'
                : 'rounded-tl-sm border border-slate-200/90 bg-white text-slate-800'
            }`}
          >
            {renderFormattedContent(message.content)}
          </div>
        )}

        {/* 1. Doctor Selection Cards */}
        {message.type === 'doctor-selection' && message.doctors && message.doctors.length > 0 && (
          <div className="mt-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            {message.doctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                isSelected={selectedDoctor?.id === doc.id}
                onSelect={onSelectDoctor}
              />
            ))}
          </div>
        )}

        {/* 2. Service Selection Cards */}
        {message.type === 'service-selection' && message.services && message.services.length > 0 && (
          <div className="mt-1 w-full space-y-2">
            {message.services.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                onSelect={onSelectService}
              />
            ))}
          </div>
        )}

        {/* 3. Available Slots Component */}
        {message.type === 'available-slots' && message.slots && (
          <div className="mt-1 w-full">
            <AvailableSlots
              slots={message.slots}
              selectedDate={message.selectedDate}
              selectedSlot={selectedSlot}
              onSelectSlot={onSelectSlot}
            />
          </div>
        )}

        {/* 4. Single Confirmed Appointment Card */}
        {message.type === 'appointment' && message.appointment && (
          <div className="mt-1 w-full">
            <AppointmentCard
              appointment={message.appointment}
              onCancel={onRequestCancel}
            />
          </div>
        )}

        {/* 5. Appointment List */}
        {message.type === 'appointment-list' && message.appointments && (
          <div className="mt-1 w-full space-y-3">
            {message.appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onCancel={onRequestCancel}
              />
            ))}
          </div>
        )}

        {/* 6. Pre-Booking Confirmation Card */}
        {message.type === 'booking-confirmation' && message.bookingDraft && (
          <div className="mt-1 w-full">
            <BookingConfirmation
              draft={message.bookingDraft}
              onConfirm={onConfirmBooking}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* 7. Cancellation Confirmation Card */}
        {message.type === 'cancellation-confirmation' && message.cancellationTarget && (
          <div className="mt-1 w-full">
            <CancellationConfirmation
              appointment={message.cancellationTarget}
              onConfirmCancel={onConfirmCancel}
              onKeepAppointment={() => onQuickReply({ id: 'keep', label: 'Keep Appointment', actionText: 'Keep my appointment' })}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* 8. Error Message */}
        {message.type === 'error' && (
          <div className="mt-1 w-full">
            <ErrorMessage content={message.content} />
          </div>
        )}

        {/* Quick Reply Chips */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="mt-1.5 w-full">
            <QuickReplies
              replies={message.quickReplies}
              onSelect={onQuickReply}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 px-1 font-mono">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
