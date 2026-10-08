'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage, QuickReply, ConversationState } from '@/types/chat';
import { Doctor, MedicalService, AvailableSlot, Appointment } from '@/types/api';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  conversationState: ConversationState;
  isLoading: boolean;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectService: (service: MedicalService) => void;
  onSelectSlot: (slot: AvailableSlot) => void;
  onConfirmBooking: () => void;
  onRequestCancel: (appointment: Appointment) => void;
  onConfirmCancel: (appointment: Appointment) => void;
  onQuickReply: (reply: QuickReply) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  conversationState,
  isLoading,
  onSelectDoctor,
  onSelectService,
  onSelectSlot,
  onConfirmBooking,
  onRequestCancel,
  onConfirmCancel,
  onQuickReply
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            selectedDoctor={conversationState.doctor}
            selectedSlot={conversationState.selectedSlot}
            onSelectDoctor={onSelectDoctor}
            onSelectService={onSelectService}
            onSelectSlot={onSelectSlot}
            onConfirmBooking={onConfirmBooking}
            onRequestCancel={onRequestCancel}
            onConfirmCancel={onConfirmCancel}
            onQuickReply={onQuickReply}
            isLoading={isLoading}
          />
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  );
};
