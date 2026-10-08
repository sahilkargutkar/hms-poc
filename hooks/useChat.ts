'use client';

import { useState, useCallback, useRef } from 'react';
import {
  ChatMessage,
  ConversationState,
  ChatResponsePayload,
  QuickReply
} from '@/types/chat';
import { Doctor, MedicalService, AvailableSlot, Appointment } from '@/types/api';

const INITIAL_CONVERSATION_STATE: ConversationState = {
  doctor: null,
  service: null,
  date: null,
  selectedSlot: null,
  patient: {
    name: null,
    phone: null
  },
  currentAppointment: null,
  pendingAction: 'idle'
};

const INITIAL_GREETING_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  role: 'assistant',
  type: 'quick-replies',
  timestamp: new Date().toISOString(),
  content: `👋 Hello! Welcome to **CarePoint Medical Clinic**.\n\nI'm your AI Receptionist. I can help you find specialist doctors, check real-time availability, schedule consultations, or view and manage existing appointments.\n\nHow can I help you today?`,
  quickReplies: [
    { id: 'qr_dentist', label: '🦷 Book a Dentist', actionText: 'I want to see a dentist tomorrow' },
    { id: 'qr_gp', label: '🩺 General Physician', actionText: 'I want to see a general physician' },
    { id: 'qr_derma', label: '✨ Dermatologist', actionText: 'I want to consult a dermatologist' },
    { id: 'qr_apts', label: '📅 View My Appointments', actionText: 'Show me my appointments' }
  ]
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING_MESSAGE]);
  const [conversationState, setConversationState] = useState<ConversationState>(INITIAL_CONVERSATION_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Send a chat message or trigger an action to the AI Receptionist
   */
  const sendMessage = useCallback(
    async (
      userText?: string,
      action?: { type: 'SELECT_DOCTOR' | 'SELECT_SERVICE' | 'SELECT_SLOT' | 'CONFIRM_BOOKING' | 'REQUEST_CANCEL' | 'CONFIRM_CANCEL' | 'CUSTOM'; payload?: any }
    ) => {
      if (isLoading) return;

      const trimmedText = userText?.trim();
      if (!trimmedText && !action) return;

      setError(null);
      setIsLoading(true);

      const userMessageId = `usr_${Date.now()}`;
      let updatedMessages = [...messages];

      // If user typed a text message, append it to the chat list immediately
      if (trimmedText) {
        const userMsg: ChatMessage = {
          id: userMessageId,
          role: 'user',
          type: 'text',
          content: trimmedText,
          timestamp: new Date().toISOString()
        };
        updatedMessages.push(userMsg);
        setMessages(updatedMessages);
      }

      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
          body: JSON.stringify({
            messages: updatedMessages,
            conversationState,
            userPrompt: trimmedText || '',
            action
          })
        });

        if (!res.ok) {
          throw new Error(`Server returned error ${res.status}`);
        }

        const data: ChatResponsePayload = await res.json();

        if (data.updatedState) {
          setConversationState((prevState) => ({
            ...prevState,
            ...data.updatedState
          }));
        }

        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Failed to communicate with AI receptionist:', err);
        setError('Connection interrupted. Please try again.');
        
        const errorMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          type: 'error',
          timestamp: new Date().toISOString(),
          content: 'Sorry, I had trouble reaching our clinic scheduling system. Please try again in a moment.'
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, conversationState, isLoading]
  );

  /**
   * Action triggers for interactive components
   */
  const selectDoctor = useCallback((doctor: Doctor) => {
    sendMessage(undefined, { type: 'SELECT_DOCTOR', payload: doctor });
  }, [sendMessage]);

  const selectService = useCallback((service: MedicalService) => {
    sendMessage(undefined, { type: 'SELECT_SERVICE', payload: service });
  }, [sendMessage]);

  const selectSlot = useCallback((slot: AvailableSlot) => {
    sendMessage(undefined, { type: 'SELECT_SLOT', payload: slot });
  }, [sendMessage]);

  const confirmBooking = useCallback(() => {
    sendMessage(undefined, { type: 'CONFIRM_BOOKING' });
  }, [sendMessage]);

  const requestCancel = useCallback((appointment: Appointment) => {
    sendMessage(undefined, { type: 'REQUEST_CANCEL', payload: appointment });
  }, [sendMessage]);

  const confirmCancel = useCallback((appointment: Appointment) => {
    sendMessage(undefined, { type: 'CONFIRM_CANCEL', payload: appointment });
  }, [sendMessage]);

  const handleQuickReply = useCallback((reply: QuickReply) => {
    sendMessage(reply.actionText);
  }, [sendMessage]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        ...INITIAL_GREETING_MESSAGE,
        id: `msg_welcome_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    ]);
    setConversationState(INITIAL_CONVERSATION_STATE);
    setError(null);
  }, []);

  return {
    messages,
    conversationState,
    isLoading,
    error,
    sendMessage,
    selectDoctor,
    selectService,
    selectSlot,
    confirmBooking,
    requestCancel,
    confirmCancel,
    handleQuickReply,
    resetChat
  };
}
