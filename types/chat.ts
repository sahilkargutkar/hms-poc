import { Doctor, MedicalService, AvailableSlot, Appointment, PatientInfo } from './api';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type MessageType =
  | 'text'
  | 'doctor-selection'
  | 'service-selection'
  | 'available-slots'
  | 'appointment'
  | 'appointment-list'
  | 'booking-confirmation'
  | 'cancellation-confirmation'
  | 'cancellation-success'
  | 'emergency'
  | 'quick-replies'
  | 'error'
  | 'loading';

export interface EmergencyContacts {
  hotline: string;
  hotlineTel: string;
  mobile: string;
  mobileTel: string;
  description?: string;
  matchedCategories?: string[];
  matchedKeywords?: string[];
}

export interface QuickReply {
  id: string;
  label: string;
  actionText: string;
  category?: 'specialty' | 'action' | 'date' | 'general';
}

export interface BookingDetailsDraft {
  doctor: Doctor | null;
  service: MedicalService | null;
  date: string | null; // "YYYY-MM-DD"
  selectedSlot: AvailableSlot | null;
  patient: {
    name: string | null;
    phone: string | null;
  };
}

export interface ConversationState {
  doctor: Doctor | null;
  service: MedicalService | null;
  date: string | null; // "YYYY-MM-DD"
  selectedSlot: AvailableSlot | null;
  patient: {
    name: string | null;
    phone: string | null;
  };
  currentAppointment: Appointment | null; // For cancellation or rescheduling
  pendingAction?: 'awaiting_slot' | 'awaiting_patient_info' | 'awaiting_otp' | 'awaiting_confirmation' | 'awaiting_cancellation_confirm' | 'awaiting_phone_for_lookup' | 'idle';
  isOtpVerified?: boolean;
  otp?: string | null;
}

export interface ToolCallData {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type?: MessageType;
  timestamp: string; // ISO string
  // Specialized payload data for rich UI components
  doctors?: Doctor[];
  services?: MedicalService[];
  slots?: AvailableSlot[];
  selectedDate?: string;
  appointment?: Appointment;
  appointments?: Appointment[];
  bookingDraft?: BookingDetailsDraft;
  cancellationTarget?: Appointment;
  quickReplies?: QuickReply[];
  emergencyContacts?: EmergencyContacts;
  toolCalls?: ToolCallData[];
  error?: string;
  isStreaming?: boolean;
}

export interface ChatRequestPayload {
  messages: ChatMessage[];
  conversationState: ConversationState;
  userPrompt: string;
  action?: {
    type: 'SELECT_DOCTOR' | 'SELECT_SERVICE' | 'SELECT_SLOT' | 'CONFIRM_BOOKING' | 'REQUEST_CANCEL' | 'CONFIRM_CANCEL' | 'VIEW_APPOINTMENTS' | 'CUSTOM';
    payload?: any;
  };
}

export interface ChatResponsePayload {
  message: ChatMessage;
  updatedState: ConversationState;
}
