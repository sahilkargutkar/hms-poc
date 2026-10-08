export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export const AI_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'find_doctors',
      description: 'Search for available clinic doctors by medical specialization (e.g. dentist, general physician, dermatologist, ophthalmologist, pediatrician, cardiologist) or doctor name.',
      parameters: {
        type: 'object',
        properties: {
          specialization: {
            type: 'string',
            description: 'Medical specialty to search for (e.g. "dentist", "general physician", "dermatologist", "ophthalmologist", "pediatrician").'
          },
          name: {
            type: 'string',
            description: 'Doctor name if specifically requested by the patient.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_services',
      description: 'Retrieve medical services and consultations offered by a specific doctor or medical department.',
      parameters: {
        type: 'object',
        properties: {
          doctorId: {
            type: 'string',
            description: 'The unique ID of the doctor.'
          },
          specialization: {
            type: 'string',
            description: 'The medical department or specialization.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_available_slots',
      description: 'Fetch real-time available appointment start and end time slots for a doctor on a specific date.',
      parameters: {
        type: 'object',
        properties: {
          doctorId: {
            type: 'string',
            description: 'The unique ID of the doctor.'
          },
          date: {
            type: 'string',
            description: 'The requested appointment date in YYYY-MM-DD format (e.g. "2026-10-06").'
          },
          serviceId: {
            type: 'string',
            description: 'Optional ID of the specific service.'
          }
        },
        required: ['doctorId', 'date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Book a medical consultation appointment in the clinic system after patient has confirmed all details.',
      parameters: {
        type: 'object',
        properties: {
          doctorId: {
            type: 'string',
            description: 'The unique ID of the doctor.'
          },
          serviceId: {
            type: 'string',
            description: 'The ID of the medical service.'
          },
          startTime: {
            type: 'string',
            description: 'Slot start time in ISO format (e.g. "2026-10-06T16:00:00").'
          },
          endTime: {
            type: 'string',
            description: 'Slot end time in ISO format (e.g. "2026-10-06T16:30:00").'
          },
          patientName: {
            type: 'string',
            description: 'Full name of the patient.'
          },
          patientPhone: {
            type: 'string',
            description: 'Contact phone/mobile number of the patient for SMS notification.'
          },
          notes: {
            type: 'string',
            description: 'Optional brief reason for visit or patient notes.'
          }
        },
        required: ['doctorId', 'startTime', 'patientName', 'patientPhone']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_patient_appointments',
      description: 'Look up existing confirmed or past appointments for a patient using their registered phone number.',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'The patient registered mobile phone number.'
          }
        },
        required: ['phone']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'cancel_appointment',
      description: 'Cancel an existing clinic appointment by appointment ID after explicit confirmation from the patient.',
      parameters: {
        type: 'object',
        properties: {
          appointmentId: {
            type: 'string',
            description: 'The unique ID of the appointment to cancel.'
          },
          reason: {
            type: 'string',
            description: 'Optional reason for cancellation.'
          }
        },
        required: ['appointmentId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reschedule_appointment',
      description: 'Reschedule an existing appointment to a new date and time slot.',
      parameters: {
        type: 'object',
        properties: {
          appointmentId: {
            type: 'string',
            description: 'The unique ID of the appointment.'
          },
          newStartTime: {
            type: 'string',
            description: 'New start time in ISO format.'
          },
          newEndTime: {
            type: 'string',
            description: 'New end time in ISO format.'
          }
        },
        required: ['appointmentId', 'newStartTime']
      }
    }
  }
];
