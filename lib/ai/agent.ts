import { SYSTEM_PROMPT } from './prompts';
import { AI_TOOLS } from './tools';
import { executeAiTool } from './toolHandlers';
import { getTomorrowDateString } from '@/lib/utils/date';
import { EMERGENCY_CONFIG, isEmergencyQuery } from '@/lib/constants/emergency';
import {
  ChatMessage,
  ConversationState,
  ChatRequestPayload,
  ChatResponsePayload,
  QuickReply
} from '@/types/chat';
import { Doctor, MedicalService, AvailableSlot, Appointment } from '@/types/api';

const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

/**
 * Immediate, zero-latency emergency responder
 */
export function handleEmergencyRequest(state: ConversationState): ChatResponsePayload {
  const nowIso = new Date().toISOString();
  const quickReplies: QuickReply[] = [
    { id: 'qr_safe_book', label: 'I am safe, book regular appointment', actionText: 'I am safe, I want to book a regular appointment' },
    { id: 'qr_nearest_er', label: 'Emergency Guidance', actionText: 'What should I do in this emergency?' }
  ];

  return {
    updatedState: state,
    message: {
      id: `msg_emerg_${Date.now()}`,
      role: 'assistant',
      type: 'emergency',
      timestamp: nowIso,
      content: `⚠️ **EMERGENCY MEDICAL NOTICE**\n\nIf you or someone with you is experiencing a medical emergency, severe chest pain, shortness of breath, acute heavy bleeding, sudden paralysis, or life-threatening symptoms, **do not wait for a clinic appointment**.\n\nPlease call our urgent care team immediately:\n\n• **24/7 Emergency Hotline:** **${EMERGENCY_CONFIG.hotlineDisplay}**\n• **Duty Doctor Mobile:** **${EMERGENCY_CONFIG.mobileDisplay}**\n\nIf this is a life-threatening crisis, please dial **911** (or your local emergency services) or proceed to the nearest Emergency Room immediately.`,
      emergencyContacts: {
        hotline: EMERGENCY_CONFIG.hotlineDisplay,
        hotlineTel: EMERGENCY_CONFIG.hotlineTel,
        mobile: EMERGENCY_CONFIG.mobileDisplay,
        mobileTel: EMERGENCY_CONFIG.mobileTel,
        description: EMERGENCY_CONFIG.description
      },
      quickReplies
    }
  };
}

/**
 * Main AI Receptionist Agent Entrypoint
 */
export async function runAiReceptionist(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const { messages, conversationState, userPrompt, action } = payload;
  let currentState: ConversationState = {
    doctor: conversationState?.doctor || null,
    service: conversationState?.service || null,
    date: conversationState?.date || null,
    selectedSlot: conversationState?.selectedSlot || null,
    patient: {
      name: conversationState?.patient?.name || null,
      phone: conversationState?.patient?.phone || null,
    },
    currentAppointment: conversationState?.currentAppointment || null,
    pendingAction: conversationState?.pendingAction || 'idle'
  };

  // 1. Handle explicit UI action clicks first for instant seamless interactions
  if (action) {
    return handleDirectUiAction(action, currentState);
  }

  // 2. CRITICAL EMERGENCY PROTOCOL: Immediate hotline & mobile sharing
  if (userPrompt && isEmergencyQuery(userPrompt)) {
    return handleEmergencyRequest(currentState);
  }

  // 3. If AI API key is configured, execute real LLM function-calling flow
  if (AI_API_KEY) {
    try {
      return await executeLlmAgentFlow(messages, userPrompt, currentState);
    } catch (err) {
      console.warn('LLM API call failed or timed out, executing resilient conversational engine:', err);
      // Fallback seamlessly to natural language parser engine
    }
  }

  // 4. Resilient conversational engine (interprets natural language without requiring live API keys)
  return executeConversationalEngine(userPrompt, currentState, messages);
}

/**
 * Handles explicit interactive UI button clicks
 */
async function handleDirectUiAction(
  action: { type: string; payload?: any },
  state: ConversationState
): Promise<ChatResponsePayload> {
  const nowIso = new Date().toISOString();

  switch (action.type) {
    case 'SELECT_DOCTOR': {
      const doctor: Doctor = action.payload;
      state.doctor = doctor;
      state.date = state.date || getTomorrowDateString();

      // Fetch services & available slots for this doctor
      const servicesRes = await executeAiTool('get_services', { doctorId: doctor.id });
      const slotsRes = await executeAiTool('get_available_slots', { doctorId: doctor.id, date: state.date });
      
      const services: MedicalService[] = servicesRes.result || [];
      const slots: AvailableSlot[] = slotsRes.result || [];

      if (services.length > 0 && !state.service) {
        state.service = services[0];
      }

      const quickReplies: QuickReply[] = [
        { id: 'qr_tomorrow', label: 'Tomorrow', actionText: 'Check availability for tomorrow' },
        { id: 'qr_afternoon', label: 'Around 4:00 PM', actionText: 'Do you have slots around 4 PM?' },
        { id: 'qr_morning', label: 'Morning slot', actionText: 'Show me morning slots' }
      ];

      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'available-slots',
          timestamp: nowIso,
          content: `Great choice. I've selected **${doctor.name}** (${doctor.specialization}).\n\nHere are the available appointment slots for **${formatDateDisplay(state.date)}**. Please click your preferred time below:`,
          slots,
          selectedDate: state.date,
          quickReplies
        }
      };
    }

    case 'SELECT_SERVICE': {
      const service: MedicalService = action.payload;
      state.service = service;
      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'text',
          timestamp: nowIso,
          content: `Selected **${service.name}** (${service.durationMinutes} mins${service.priceEstimate ? ` • ${service.priceEstimate}` : ''}). Please select an available slot below.`
        }
      };
    }

    case 'SELECT_SLOT': {
      const slot: AvailableSlot = action.payload;
      state.selectedSlot = slot;
      
      const timeStr = formatTimeDisplay(slot.startTime);
      const dateStr = formatDateDisplay(slot.startTime.split('T')[0]);

      // If we already have patient information, show confirmation card immediately
      if (state.patient.name && state.patient.phone) {
        state.pendingAction = 'awaiting_confirmation';
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'booking-confirmation',
            timestamp: nowIso,
            content: `I have prepared your appointment details. Please review and confirm:`,
            bookingDraft: {
              doctor: state.doctor,
              service: state.service,
              date: state.date,
              selectedSlot: slot,
              patient: state.patient
            }
          }
        };
      }

      state.pendingAction = 'awaiting_patient_info';
      const quickReplies: QuickReply[] = [
        { id: 'qr_fill_demo', label: 'Use Demo Patient Info (John, 9876543210)', actionText: 'John, 9876543210' }
      ];

      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'text',
          timestamp: nowIso,
          content: `Excellent. I have reserved **${timeStr}** on **${dateStr}** with **${state.doctor?.name || 'the doctor'}**.\n\nTo finalize your booking, please provide your **Full Name** and **Mobile Phone Number** (e.g. *John, 9876543210*).`,
          quickReplies
        }
      };
    }

    case 'CONFIRM_BOOKING': {
      if (!state.doctor || !state.selectedSlot || !state.patient.name || !state.patient.phone) {
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'error',
            timestamp: nowIso,
            content: `We're missing some appointment details. Please provide your name and phone number to complete the booking.`
          }
        };
      }

      const bookRes = await executeAiTool('book_appointment', {
        doctorId: state.doctor.id,
        serviceId: state.service?.id || 'srv_default',
        startTime: state.selectedSlot.startTime,
        endTime: state.selectedSlot.endTime,
        patientName: state.patient.name,
        patientPhone: state.patient.phone
      });

      if (bookRes.result?.success && bookRes.result.appointment) {
        const appointment: Appointment = bookRes.result.appointment;
        const timeStr = formatTimeDisplay(appointment.startTime);
        const dateStr = formatDateDisplay(appointment.startTime.split('T')[0]);

        // Reset booking draft while preserving patient credentials for convenience
        const preservedPatient = { ...state.patient };
        state = {
          doctor: null,
          service: null,
          date: null,
          selectedSlot: null,
          patient: preservedPatient,
          currentAppointment: null,
          pendingAction: 'idle'
        };

        const quickReplies: QuickReply[] = [
          { id: 'qr_view_apt', label: 'View My Appointments', actionText: 'Show me my appointments' },
          { id: 'qr_book_another', label: 'Book Another Appointment', actionText: 'I want to book another appointment' }
        ];

        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'appointment',
            timestamp: nowIso,
            content: `**Your appointment is confirmed!**\n\nYou're booked with **${appointment.doctorName}** for **${dateStr} at ${timeStr}**.\n\nAn SMS confirmation with clinic directions has been dispatched to **${appointment.patientPhone}**.`,
            appointment,
            quickReplies
          }
        };
      } else {
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'error',
            timestamp: nowIso,
            content: `Sorry, I couldn't complete the booking: ${bookRes.result?.error || 'Slot may have just been taken'}. Let me check for another available time for you.`
          }
        };
      }
    }

    case 'REQUEST_CANCEL': {
      const targetApt: Appointment = action.payload;
      state.currentAppointment = targetApt;
      state.pendingAction = 'awaiting_cancellation_confirm';

      const timeStr = formatTimeDisplay(targetApt.startTime);
      const dateStr = formatDateDisplay(targetApt.startTime.split('T')[0]);

      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'cancellation-confirmation',
          timestamp: nowIso,
          content: `Are you sure you want to cancel your appointment with **${targetApt.doctorName}** on **${dateStr} at ${timeStr}**?`,
          cancellationTarget: targetApt
        }
      };
    }

    case 'CONFIRM_CANCEL': {
      const targetApt = state.currentAppointment || action.payload;
      if (!targetApt) {
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'text',
            timestamp: nowIso,
            content: 'No appointment was selected for cancellation.'
          }
        };
      }

      const cancelRes = await executeAiTool('cancel_appointment', {
        appointmentId: targetApt.id
      });

      if (cancelRes.result?.success) {
        state.currentAppointment = null;
        state.pendingAction = 'idle';

        const quickReplies: QuickReply[] = [
          { id: 'qr_book_new', label: 'Book New Appointment', actionText: 'I want to book an appointment' },
          { id: 'qr_view_apts', label: 'View Appointments', actionText: 'Show me my appointments' }
        ];

        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'cancellation-success',
            timestamp: nowIso,
            content: `Your appointment with **${targetApt.doctorName}** has been **cancelled successfully**.\n\nA cancellation confirmation SMS has been sent to your phone.`,
            quickReplies
          }
        };
      } else {
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'error',
            timestamp: nowIso,
            content: `Sorry, I couldn't cancel the appointment: ${cancelRes.result?.error || 'Please try again or contact the clinic reception directly.'}`
          }
        };
      }
    }

    default:
      return executeConversationalEngine('', state, []);
  }
}

/**
 * Natural language conversational planner engine (Rock-solid fallback)
 */
async function executeConversationalEngine(
  input: string,
  state: ConversationState,
  _history: ChatMessage[]
): Promise<ChatResponsePayload> {
  const text = input.trim();
  const lower = text.toLowerCase();
  const nowIso = new Date().toISOString();

  // Extract phone numbers (e.g. 9876543210, +1 555-123-4567, 10 digits)
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
  if (phoneMatch) {
    state.patient.phone = phoneMatch[0].replace(/\D/g, '');
  }

  // Extract patient name (e.g. "John", "John Doe", "My name is John Doe")
  if (state.pendingAction === 'awaiting_patient_info' || (!state.patient.name && lower.includes('name is'))) {
    const nameMatch = text.match(/(?:my name is|name is|i am|i'm)\s+([A-Za-z\s]+)/i) ||
      (text.includes(',') ? [null, text.split(',')[0].trim()] : null);
    if (nameMatch && nameMatch[1]) {
      state.patient.name = nameMatch[1].trim();
    } else if (!text.includes(' ') && text.length > 1 && !phoneMatch) {
      state.patient.name = text;
    }
  }

  // 1. EMERGENCY PROTOCOL CHECK
  if (isEmergencyQuery(text)) {
    return handleEmergencyRequest(state);
  }

  // 2. GREETING
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/i.test(lower) && lower.length < 25) {
    const quickReplies: QuickReply[] = [
      { id: 'qr_book_dentist', label: 'Book a Dentist', actionText: 'I want to see a dentist' },
      { id: 'qr_book_gp', label: 'General Physician', actionText: 'I need to see a general physician' },
      { id: 'qr_view_apt', label: 'View My Appointments', actionText: 'Show me my appointments' },
      { id: 'qr_cancel_apt', label: 'Cancel Appointment', actionText: 'I need to cancel my appointment' }
    ];

    return {
      updatedState: state,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'quick-replies',
        timestamp: nowIso,
        content: `Welcome to **CarePoint Medical Clinic**.\n\nI'm your patient care coordinator at the front desk. I can help you find doctors, check available consultation slots, book visits, or manage your existing appointments. How can I assist you today?`,
        quickReplies
      }
    };
  }

  // 3. MEDICAL ADVICE SAFETY GUARDRAIL
  if (
    lower.includes('diagnose') ||
    lower.includes('what disease') ||
    lower.includes('prescription') ||
    lower.includes('medication') ||
    lower.includes('can you cure') ||
    lower.includes('interpret my test')
  ) {
    return {
      updatedState: state,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'text',
        timestamp: nowIso,
        content: `Our front desk team cannot provide medical diagnoses, treatment plans, or drug prescriptions. I'd be delighted to book an in-person consultation with one of our certified doctors so they can examine you thoroughly.`
      }
    };
  }

  // 3. VIEW APPOINTMENTS OR CANCEL INTENT
  if (
    lower.includes('cancel') ||
    lower.includes('my appointment') ||
    lower.includes('show my') ||
    lower.includes('view my') ||
    lower.includes('reschedule')
  ) {
    const phoneToSearch = state.patient.phone || (phoneMatch ? phoneMatch[0].replace(/\D/g, '') : null);

    if (!phoneToSearch) {
      const quickReplies: QuickReply[] = [
        { id: 'qr_use_test_phone', label: 'Use Test Phone: 9876543210', actionText: '9876543210' }
      ];

      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'text',
          timestamp: nowIso,
          content: `Sure, I can help you with your appointments.\n\nCould you please provide the **mobile phone number** used when booking?`,
          quickReplies
        }
      };
    }

    const aptsRes = await executeAiTool('get_patient_appointments', { phone: phoneToSearch });
    const appointments: Appointment[] = aptsRes.result || [];

    if (appointments.length === 0) {
      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'text',
          timestamp: nowIso,
          content: `I couldn't find any active appointments under **${phoneToSearch}**. Would you like to schedule a new visit?`
        }
      };
    }

    return {
      updatedState: state,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'appointment-list',
        timestamp: nowIso,
        content: `I found **${appointments.length}** appointment(s) registered for **${phoneToSearch}**:`,
        appointments
      }
    };
  }

  // 4. CONFIRMATION COMMAND
  if (
    state.pendingAction === 'awaiting_confirmation' &&
    (lower.includes('confirm') || lower.includes('yes') || lower.includes('book it') || lower.includes('proceed'))
  ) {
    return handleDirectUiAction({ type: 'CONFIRM_BOOKING' }, state);
  }

  // 5. IF AWAITING PATIENT INFO AND USER PROVIDED IT
  if (state.pendingAction === 'awaiting_patient_info' || (state.selectedSlot && (!state.patient.name || !state.patient.phone))) {
    if (text.includes(',') || (phoneMatch && text.length > 10)) {
      const parts = text.split(',');
      if (parts.length >= 2) {
        state.patient.name = parts[0].trim();
        state.patient.phone = parts[1].replace(/\D/g, '').trim();
      } else if (phoneMatch) {
        state.patient.phone = phoneMatch[0].replace(/\D/g, '');
        const namePart = text.replace(phoneMatch[0], '').replace(/[^\w\s]/g, '').trim();
        if (namePart) state.patient.name = namePart;
      }

      if (state.patient.name && state.patient.phone) {
        state.pendingAction = 'awaiting_confirmation';
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'booking-confirmation',
            timestamp: nowIso,
            content: `Thank you, **${state.patient.name}**! Please verify the appointment details below:`,
            bookingDraft: {
              doctor: state.doctor,
              service: state.service,
              date: state.date,
              selectedSlot: state.selectedSlot,
              patient: state.patient
            }
          }
        };
      }
    }
  }

  // 6. SPECIFIC TIME SELECTION (e.g. "4:00 PM", "book me for 4:30", "around 4 pm")
  const timeRegex = /(1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm)/i;
  const timeMatch = text.match(timeRegex);

  if (timeMatch && state.doctor) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] || '00';
    const period = timeMatch[3].toLowerCase();
    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    const hourStr = hour.toString().padStart(2, '0');
    const targetTimePrefix = `${hourStr}:${minute}`;

    const slotsRes = await executeAiTool('get_available_slots', {
      doctorId: state.doctor.id,
      date: state.date || getTomorrowDateString()
    });
    const slots: AvailableSlot[] = slotsRes.result || [];
    const matchedSlot = slots.find((s) => s.startTime.includes(`T${targetTimePrefix}`));

    if (matchedSlot) {
      return handleDirectUiAction({ type: 'SELECT_SLOT', payload: matchedSlot }, state);
    }
  }

  // 7. FIND DOCTORS / SPECIALTY QUERY
  let specialtyQuery = '';
  if (lower.includes('dentist') || lower.includes('teeth') || lower.includes('tooth')) specialtyQuery = 'dentist';
  else if (lower.includes('skin') || lower.includes('derma') || lower.includes('acne')) specialtyQuery = 'dermatologist';
  else if (lower.includes('eye') || lower.includes('vision') || lower.includes('ophtha')) specialtyQuery = 'ophthalmologist';
  else if (lower.includes('child') || lower.includes('pediatric') || lower.includes('baby')) specialtyQuery = 'pediatrician';
  else if (lower.includes('heart') || lower.includes('cardio')) specialtyQuery = 'cardiologist';
  else if (lower.includes('doctor') || lower.includes('physician') || lower.includes('fever') || lower.includes('general') || lower.includes('appointment')) {
    specialtyQuery = 'general physician';
  }

  if (specialtyQuery) {
    const docRes = await executeAiTool('find_doctors', { specialization: specialtyQuery });
    const doctors: Doctor[] = docRes.result || [];

    if (doctors.length === 1) {
      // Auto-select single doctor and show their slots
      const doctor = doctors[0];
      state.doctor = doctor;
      state.date = state.date || getTomorrowDateString();

      const slotsRes = await executeAiTool('get_available_slots', { doctorId: doctor.id, date: state.date });
      const servicesRes = await executeAiTool('get_services', { doctorId: doctor.id });
      if (servicesRes.result?.length > 0) state.service = servicesRes.result[0];

      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'available-slots',
          timestamp: nowIso,
          content: `We have **${doctor.name}** (${doctor.specialization}) available. What time would you prefer for **${formatDateDisplay(state.date)}**?`,
          slots: slotsRes.result || [],
          selectedDate: state.date
        }
      };
    } else if (doctors.length > 1) {
      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'doctor-selection',
          timestamp: nowIso,
          content: `I found ${doctors.length} doctors available in **${specialtyQuery}**. Please select a doctor to check their consultation schedule:`,
          doctors
        }
      };
    }
  }

  // 8. DEFAULT FALLBACK
  const quickReplies: QuickReply[] = [
    { id: 'qr_dentist', label: 'Dental Care', actionText: 'I need a dentist tomorrow' },
    { id: 'qr_physician', label: 'General Health Checkup', actionText: 'I want to see a general physician' },
    { id: 'qr_derma', label: 'Dermatologist', actionText: 'I want to see a skin doctor' },
    { id: 'qr_my_apts', label: 'View My Appointments', actionText: 'Show me my appointments' }
  ];

  return {
    updatedState: state,
    message: {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      type: 'quick-replies',
      timestamp: nowIso,
      content: `I can help you book an appointment with our specialists, check doctor schedules, or manage an existing visit. Which department or doctor would you like to consult with?`,
      quickReplies
    }
  };
}

/**
 * Executes LLM agent with function-calling loop
 */
async function executeLlmAgentFlow(
  messages: ChatMessage[],
  userPrompt: string,
  state: ConversationState
): Promise<ChatResponsePayload> {
  const llmMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    })),
    { role: 'user', content: userPrompt }
  ];

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: llmMessages,
      tools: AI_TOOLS,
      tool_choice: 'auto',
      temperature: 0.2
    })
  });

  if (!res.ok) {
    throw new Error(`LLM provider error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const responseMsg = choice?.message;

  if (responseMsg?.tool_calls && responseMsg.tool_calls.length > 0) {
    const toolCall = responseMsg.tool_calls[0];
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

    const execResult = await executeAiTool(toolName, toolArgs);

    // Update state based on tool outcomes
    if (toolName === 'find_doctors' && Array.isArray(execResult.result)) {
      if (execResult.result.length === 1) {
        state.doctor = execResult.result[0];
      }
      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'doctor-selection',
          timestamp: new Date().toISOString(),
          content: `I found the following doctors for you:`,
          doctors: execResult.result
        }
      };
    }

    if (toolName === 'get_available_slots' && Array.isArray(execResult.result)) {
      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'available-slots',
          timestamp: new Date().toISOString(),
          content: `Here are the available consultation slots:`,
          slots: execResult.result,
          selectedDate: toolArgs.date
        }
      };
    }

    if (toolName === 'get_patient_appointments' && Array.isArray(execResult.result)) {
      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'appointment-list',
          timestamp: new Date().toISOString(),
          content: `Here are your scheduled appointments:`,
          appointments: execResult.result
        }
      };
    }
  }

  const isEmerg = isEmergencyQuery(userPrompt) || isEmergencyQuery(responseMsg?.content || '');

  return {
    updatedState: state,
    message: {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      type: isEmerg ? 'emergency' : 'text',
      timestamp: new Date().toISOString(),
      content: responseMsg?.content || "How else can I assist you with your appointment today?",
      emergencyContacts: isEmerg ? {
        hotline: EMERGENCY_CONFIG.hotlineDisplay,
        hotlineTel: EMERGENCY_CONFIG.hotlineTel,
        mobile: EMERGENCY_CONFIG.mobileDisplay,
        mobileTel: EMERGENCY_CONFIG.mobileTel,
        description: EMERGENCY_CONFIG.description
      } : undefined
    }
  };
}

function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Tomorrow';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatTimeDisplay(isoStr: string | null | undefined): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return isoStr.substring(11, 16);
  }
}
