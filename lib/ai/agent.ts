import { SYSTEM_PROMPT } from './prompts';
import { AI_TOOLS } from './tools';
import { executeAiTool } from './toolHandlers';
import { apiClient } from '@/lib/api/client';
import { getTomorrowDateString, formatDateDisplay, formatTimeDisplay } from '@/lib/utils/date';
import { EMERGENCY_CONFIG, isEmergencyQuery, matchEmergencyCategories } from '@/lib/constants/emergency';
import { matchClinicInfoOrFaq, CLINIC_INFO_FALLBACK_MESSAGE } from '@/lib/constants/clinicInfo';
import {
  ChatMessage,
  ConversationState,
  ChatRequestPayload,
  ChatResponsePayload,
  QuickReply
} from '@/types/chat';
import { Doctor, MedicalService, AvailableSlot, Appointment, EmergencyDetectionResponseDto } from '@/types/api';

const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

/**
 * Immediate emergency responder (combines local heuristics & live backend Emergency API)
 */
export function handleEmergencyRequest(
  state: ConversationState,
  apiResult?: EmergencyDetectionResponseDto | null,
  localMatch?: { matchedCategories: string[]; matchedKeywords: string[] } | null
): ChatResponsePayload {
  const nowIso = new Date().toISOString();
  const quickReplies: QuickReply[] = [
    { id: 'qr_safe_book', label: 'I am safe, book regular appointment', actionText: 'I am safe, I want to book a regular appointment' },
    { id: 'qr_nearest_er', label: 'Emergency Guidance', actionText: 'What should I do in this emergency?' }
  ];

  const matchedCategories = Array.from(
    new Set([...(localMatch?.matchedCategories || []), ...(apiResult?.matchedCategories || [])])
  );
  const matchedKeywords = Array.from(
    new Set([...(localMatch?.matchedKeywords || []), ...(apiResult?.matchedKeywords || [])])
  );

  const categoryText = matchedCategories.length > 0
    ? `\n🚨 **Priority Medical Trigger:** [${matchedCategories.join(', ')}]\n`
    : '';

  const apiEmergencyNotice = apiResult?.emergencyPhoneNumber
    ? `\n• **Direct Emergency Line:** **${apiResult.emergencyPhoneNumber}**`
    : '';

  return {
    updatedState: state,
    message: {
      id: `msg_emerg_${Date.now()}`,
      role: 'assistant',
      type: 'emergency',
      timestamp: nowIso,
      content: `⚠️ **EMERGENCY MEDICAL NOTICE**\n${categoryText}\nIf you or someone with you is experiencing a medical emergency, acute symptoms, or life-threatening distress, **do not wait for a clinic appointment**.\n\nPlease call our emergency care team immediately:\n\n• **24/7 Emergency Hotline:** **${EMERGENCY_CONFIG.hotlineDisplay}**\n• **Duty Doctor Mobile:** **${EMERGENCY_CONFIG.mobileDisplay}**${apiEmergencyNotice}\n\nIf this is a life-threatening crisis, please dial **911** (or your local emergency services) or proceed to the nearest Emergency Room immediately.`,
      emergencyContacts: {
        hotline: EMERGENCY_CONFIG.hotlineDisplay,
        hotlineTel: EMERGENCY_CONFIG.hotlineTel,
        mobile: EMERGENCY_CONFIG.mobileDisplay,
        mobileTel: EMERGENCY_CONFIG.mobileTel,
        description: EMERGENCY_CONFIG.description,
        matchedCategories,
        matchedKeywords
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

  // 2. CRITICAL EMERGENCY PROTOCOL: Checked via Emergency API and official categories dictionary
  if (userPrompt) {
    const localMatch = matchEmergencyCategories(userPrompt);
    if (localMatch.isEmergency) {
      return handleEmergencyRequest(currentState, null, localMatch);
    }
    try {
      const apiEmerg = await apiClient.detectEmergency(userPrompt);
      if (apiEmerg && apiEmerg.isEmergency) {
        return handleEmergencyRequest(currentState, apiEmerg, localMatch);
      }
    } catch {
      // Fall through to regular conversational engine
    }
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

      if (slots.length === 0) {
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'text',
            timestamp: nowIso,
            content: `**${doctor.name}** (${doctor.specialization}) does not have available consultation slots on **${formatDateDisplay(state.date)}** (the doctor may be off-duty or fully booked for this day).\n\nWould you like to select another specialist or check your existing appointments?`,
            quickReplies: [
              { id: 'qr_other_doc', label: 'View Other Doctors', actionText: 'Show me other doctors' },
              { id: 'qr_view_apts', label: 'View My Appointments', actionText: 'Show me my appointments' }
            ]
          }
        };
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

      // If we already have patient information, verify OTP if not verified yet
      if (state.patient.name && state.patient.phone) {
        if (!state.isOtpVerified) {
          state.pendingAction = 'awaiting_otp';
          return {
            updatedState: state,
            message: {
              id: `msg_${Date.now()}`,
              role: 'assistant',
              type: 'text',
              timestamp: nowIso,
              content: `Great! We have reserved **${timeStr}** on **${dateStr}** with **${state.doctor?.name || 'the doctor'}**.\n\nTo verify your mobile number (**${state.patient.phone}**), we have sent a 4-digit verification code.\n\nPlease enter the **4-digit OTP** to continue:`,
              quickReplies: [
                { id: 'qr_fill_otp', label: 'Use Demo OTP (1234)', actionText: '1234' }
              ]
            }
          };
        }

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
      if (!state.doctor || !state.selectedSlot || !state.patient.phone) {
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'error',
            timestamp: nowIso,
            content: `We're missing some appointment details. Please provide your phone number to complete the booking.`
          }
        };
      }

      if (!state.patient.name) {
        state.patient.name = 'Patient';
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
          pendingAction: 'idle',
          isOtpVerified: true
        };

        const quickReplies: QuickReply[] = [
          { id: 'qr_review', label: '⭐ Rate on Google Reviews', actionText: 'Leave a Google review' },
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
            content: `🎉 **Your appointment is confirmed!**\n\nYou're booked with **${appointment.doctorName}** for **${dateStr} at ${timeStr}**.\n\nAn SMS confirmation with clinic directions has been dispatched to **${appointment.patientPhone}**.\n\n⭐⭐⭐⭐⭐\n**Happy with your booking experience?**\nWe'd love your feedback! Please [leave us a review on Google](https://g.page/r/carepoint-clinic/review) to share your thoughts with our healthcare team.`,
            appointment,
            quickReplies
          }
        };
      } else {
        const errorDetail =
          bookRes.result?.error ||
          bookRes.error ||
          'The slot may have just been booked by another patient';
        console.error('CONFIRM_BOOKING failed:', errorDetail);

        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'error',
            timestamp: nowIso,
            content: `Sorry, I couldn't complete the booking: ${errorDetail}. Let me check for another available time for you.`,
            quickReplies: [
              { id: 'qr_change_slot', label: 'Choose Another Time Slot', actionText: 'Show me available slots' },
              { id: 'qr_view_doc', label: 'Choose Another Doctor', actionText: 'Show doctors' }
            ]
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
 * Robust extractor for patient name & phone from natural user text
 */
function extractPatientInfo(text: string): { phone: string | null; name: string | null } {
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/;
  const phoneMatch = text.match(phoneRegex);
  let phone: string | null = null;
  let textWithoutPhone = text;

  if (phoneMatch) {
    phone = phoneMatch[0].replace(/\D/g, '');
    textWithoutPhone = text.replace(phoneMatch[0], ' ');
  }

  let name: string | null = null;
  const namePrefixMatch = textWithoutPhone.match(/(?:my name is|name is|i am|i'm|this is)\s+([A-Za-z\s]+)/i);
  if (namePrefixMatch && namePrefixMatch[1]) {
    name = namePrefixMatch[1].trim();
  } else if (text.includes(',')) {
    const parts = text.split(',');
    const part0 = parts[0].trim().replace(/[^\w\s]/g, '');
    if (part0 && !/^\d+$/.test(part0)) {
      name = part0;
    }
  } else if (textWithoutPhone.trim()) {
    const cleanRemainder = textWithoutPhone
      .replace(/[^\w\s]/g, ' ')
      .replace(/\b(hi|hello|hey|book|appointment|for|please|dr|doctor|my|is|phone|number|mobile|patient)\b/gi, ' ')
      .trim();
    if (cleanRemainder.length >= 2 && !/^\d+$/.test(cleanRemainder)) {
      name = cleanRemainder.replace(/\s+/g, ' ');
    }
  }

  return { phone, name };
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

  // Extract phone & name intelligently from input
  const extracted = extractPatientInfo(text);
  if (extracted.phone) {
    state.patient.phone = extracted.phone;
  }
  if (extracted.name && (!state.patient.name || state.pendingAction === 'awaiting_patient_info')) {
    state.patient.name = extracted.name;
  }
  const phoneMatch = extracted.phone ? [extracted.phone] : null;

  // 1. EMERGENCY PROTOCOL CHECK
  const localMatch = matchEmergencyCategories(text);
  if (localMatch.isEmergency) {
    return handleEmergencyRequest(state, null, localMatch);
  }

  // 2. OTP VERIFICATION CHECK (Accept any 4-digit code to continue booking)
  const fourDigitMatch = text.match(/\b\d{4}\b/);
  if (
    (state.pendingAction === 'awaiting_otp' || (state.doctor && state.selectedSlot && state.patient.phone && !state.isOtpVerified)) &&
    fourDigitMatch
  ) {
    state.isOtpVerified = true;
    state.otp = fourDigitMatch[0];
    state.pendingAction = 'awaiting_confirmation';

    return {
      updatedState: state,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'booking-confirmation',
        timestamp: nowIso,
        content: `✅ **Mobile Number Verified!** (OTP: ${fourDigitMatch[0]})\n\nI have prepared your appointment details. Please review and confirm your booking below:`,
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

  if (state.pendingAction === 'awaiting_otp' && !fourDigitMatch && !lower.includes('cancel')) {
    return {
      updatedState: state,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'text',
        timestamp: nowIso,
        content: `Please enter the **4-digit verification OTP** sent to **${state.patient.phone || 'your phone'}** (e.g. *1234*) to verify your contact number.`,
        quickReplies: [
          { id: 'qr_demo_otp', label: 'Use Demo OTP (1234)', actionText: '1234' }
        ]
      }
    };
  }

  // If patient info was submitted during booking and OTP is not yet verified:
  if (state.doctor && state.selectedSlot && phoneMatch && !state.isOtpVerified) {
    state.pendingAction = 'awaiting_otp';
    return {
      updatedState: state,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'text',
        timestamp: nowIso,
        content: `Thank you, **${state.patient.name || 'Patient'}**! We've sent a 4-digit verification code to **${state.patient.phone}**.\n\nPlease enter the **4-digit OTP** to verify your contact number and proceed with booking.`,
        quickReplies: [
          { id: 'qr_demo_otp', label: 'Use Demo OTP (1234)', actionText: '1234' }
        ]
      }
    };
  }

  // 3. CLINIC INFORMATION & FAQ CHECK
  const clinicInfoMatch = matchClinicInfoOrFaq(text);
  if (clinicInfoMatch.isMatch) {
    const allInfoReplies: QuickReply[] = [
      { id: 'qr_timings', label: '🕒 Timings', actionText: 'What are the clinic timings?' },
      { id: 'qr_address', label: '📍 Address & Directions', actionText: 'What is the clinic address?' },
      { id: 'qr_parking', label: '🚗 Parking', actionText: 'Do you have parking facilities?' },
      { id: 'qr_doctors', label: '👨‍⚕️ Doctors & Specialities', actionText: 'Show me doctors and specialities' },
      { id: 'qr_fees', label: '💳 Consultation Fees', actionText: 'What are the consultation fees?' },
      { id: 'qr_services', label: '🩺 Services', actionText: 'What services do you offer?' },
      { id: 'qr_holidays', label: '📅 Holidays', actionText: 'When is the clinic closed for holidays?' },
      { id: 'qr_book', label: 'Book an Appointment', actionText: 'I want to book an appointment' }
    ];

    const activeReplies = allInfoReplies
      .filter(r => r.id !== `qr_${clinicInfoMatch.topicId}`)
      .slice(0, 4);

    return {
      updatedState: state,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'text',
        timestamp: nowIso,
        content: clinicInfoMatch.content,
        quickReplies: activeReplies
      }
    };
  }

  // 4. GOOGLE REVIEWS INQUIRY
  if (lower.includes('google review') || lower.includes('leave review') || lower.includes('write review') || (lower.includes('review') && !lower.includes('view') && !lower.includes('appointment'))) {
    return {
      updatedState: state,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        type: 'text',
        timestamp: nowIso,
        content: `⭐⭐⭐⭐⭐\n**We Value Your Feedback!**\n\nThank you for choosing CarePoint Medical Clinic. We'd love to hear about your experience! Please [click here to leave us a review on Google](https://g.page/r/carepoint-clinic/review) ★★★★★.\n\nYour review helps our front desk and medical team continue delivering outstanding care!`
      }
    };
  }

  // 5. GREETING
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/i.test(lower) && lower.length < 25) {
    const quickReplies: QuickReply[] = [
      { id: 'qr_book_dentist', label: 'Book a Dentist', actionText: 'I want to see a dentist' },
      { id: 'qr_info', label: 'Clinic Timings & Info', actionText: 'What are the clinic timings?' },
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
        content: `Welcome to **CarePoint Medical Clinic**.\n\nI'm your patient care coordinator at the front desk. I can help you find doctors, check available consultation slots, book visits, answer clinic questions (timings, parking, fees, holidays), or manage your existing appointments. How can I assist you today?`,
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
  const isConfirmIntent =
    lower.includes('confirm') ||
    lower === 'yes' ||
    lower === 'yes please' ||
    lower === 'proceed' ||
    lower === 'book it' ||
    lower === 'yes, book it';

  if (
    isConfirmIntent &&
    state.doctor &&
    state.selectedSlot &&
    (state.pendingAction === 'awaiting_confirmation' || state.isOtpVerified || state.patient.phone)
  ) {
    return handleDirectUiAction({ type: 'CONFIRM_BOOKING' }, state);
  }

  // 5. IF AWAITING PATIENT INFO AND USER PROVIDED IT
  if (state.pendingAction === 'awaiting_patient_info' || (state.selectedSlot && (!state.patient.name || !state.patient.phone))) {
    if (extracted.phone) {
      state.patient.phone = extracted.phone;
    }
    if (extracted.name) {
      state.patient.name = extracted.name;
    }

    if (state.patient.phone) {
      if (!state.isOtpVerified) {
        state.pendingAction = 'awaiting_otp';
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'text',
            timestamp: nowIso,
            content: `Thank you, **${state.patient.name || 'Patient'}**! We've sent a 4-digit verification code to **${state.patient.phone}**.\n\nPlease enter the **4-digit OTP** to verify your contact number and proceed with booking.`,
            quickReplies: [
              { id: 'qr_demo_otp', label: 'Use Demo OTP (1234)', actionText: '1234' }
            ]
          }
        };
      }

      state.pendingAction = 'awaiting_confirmation';
      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'booking-confirmation',
          timestamp: nowIso,
          content: `Thank you, **${state.patient.name || 'Patient'}**! Please verify the appointment details below:`,
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
  else if (lower.includes('doctor') || lower.includes('physician') || lower.includes('fever') || lower.includes('general') || (lower.includes('appointment') && !lower.includes('confirm'))) {
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

      const slots: AvailableSlot[] = slotsRes.result || [];
      if (slots.length === 0) {
        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'text',
            timestamp: nowIso,
            content: `We have **${doctor.name}** (${doctor.specialization}) available, but there are no consultation slots on **${formatDateDisplay(state.date)}** (the doctor may be off-duty or fully booked for this day).\n\nWould you like to check another doctor or your existing appointments?`,
            quickReplies: [
              { id: 'qr_other_doc', label: 'View Other Doctors', actionText: 'Show me other doctors' },
              { id: 'qr_view_apts', label: 'View My Appointments', actionText: 'Show me my appointments' }
            ]
          }
        };
      }

      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: 'available-slots',
          timestamp: nowIso,
          content: `We have **${doctor.name}** (${doctor.specialization}) available. What time would you prefer for **${formatDateDisplay(state.date)}**?`,
          slots,
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

    if (toolName === 'book_appointment' && execResult.result) {
      if (execResult.result.success && execResult.result.appointment) {
        const appointment: Appointment = execResult.result.appointment;
        const timeStr = formatTimeDisplay(appointment.startTime);
        const dateStr = formatDateDisplay(appointment.startTime.split('T')[0]);

        state = {
          doctor: null,
          service: null,
          date: null,
          selectedSlot: null,
          patient: { ...state.patient },
          currentAppointment: null,
          pendingAction: 'idle',
          isOtpVerified: true
        };

        const quickReplies: QuickReply[] = [
          { id: 'qr_review', label: '⭐ Rate on Google Reviews', actionText: 'Leave a Google review' },
          { id: 'qr_view_apt', label: 'View My Appointments', actionText: 'Show me my appointments' },
          { id: 'qr_book_another', label: 'Book Another Appointment', actionText: 'I want to book another appointment' }
        ];

        return {
          updatedState: state,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            type: 'appointment',
            timestamp: new Date().toISOString(),
            content: `🎉 **Your appointment is confirmed!**\n\nYou're booked with **${appointment.doctorName}** for **${dateStr} at ${timeStr}**.\n\nAn SMS confirmation with clinic directions has been dispatched to **${appointment.patientPhone}**.\n\n⭐⭐⭐⭐⭐\n**Happy with your booking experience?**\nWe'd love your feedback! Please [leave us a review on Google](https://g.page/r/carepoint-clinic/review) to share your thoughts with our healthcare team.`,
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
            timestamp: new Date().toISOString(),
            content: `Sorry, I couldn't complete the booking: ${execResult.result?.error || execResult.error || 'The slot may no longer be available.'}`
          }
        };
      }
    }

    if (toolName === 'cancel_appointment' && execResult.result) {
      return {
        updatedState: state,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          type: execResult.result.success ? 'cancellation-success' : 'error',
          timestamp: new Date().toISOString(),
          content: execResult.result.success
            ? `Your appointment has been **cancelled successfully**.\n\nA cancellation confirmation SMS has been sent to your phone.`
            : `Sorry, I couldn't cancel the appointment: ${execResult.result.error || 'Please contact the clinic reception directly.'}`
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
