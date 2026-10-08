import { apiClient } from '@/lib/api/client';
import {
  FindDoctorsParams,
  GetServicesParams,
  GetAvailableSlotsParams,
  BookAppointmentParams,
  GetPatientAppointmentsParams,
  CancelAppointmentParams,
  RescheduleAppointmentParams
} from '@/types/api';

export interface ToolExecutionResult {
  toolName: string;
  result: any;
  error?: string;
}

export async function executeAiTool(name: string, args: Record<string, any>): Promise<ToolExecutionResult> {
  try {
    switch (name) {
      case 'find_doctors': {
        const doctors = await apiClient.findDoctors(args as FindDoctorsParams);
        return { toolName: name, result: doctors };
      }

      case 'get_services': {
        const services = await apiClient.getServices(args as GetServicesParams);
        return { toolName: name, result: services };
      }

      case 'get_available_slots': {
        const slots = await apiClient.getAvailableSlots(args as GetAvailableSlotsParams);
        return { toolName: name, result: slots };
      }

      case 'book_appointment': {
        const bookingRes = await apiClient.bookAppointment(args as BookAppointmentParams);
        return { toolName: name, result: bookingRes };
      }

      case 'get_patient_appointments': {
        const appointments = await apiClient.getPatientAppointments(args as GetPatientAppointmentsParams);
        return { toolName: name, result: appointments };
      }

      case 'cancel_appointment': {
        const cancelRes = await apiClient.cancelAppointment(args as CancelAppointmentParams);
        return { toolName: name, result: cancelRes };
      }

      case 'reschedule_appointment': {
        const rescheduleRes = await apiClient.rescheduleAppointment(args as RescheduleAppointmentParams);
        return { toolName: name, result: rescheduleRes };
      }

      default:
        return {
          toolName: name,
          result: null,
          error: `Unrecognized tool function: "${name}"`
        };
    }
  } catch (err: any) {
    return {
      toolName: name,
      result: null,
      error: err?.message || 'Error occurred during tool execution.'
    };
  }
}
