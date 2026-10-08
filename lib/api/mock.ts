import {
  Doctor,
  MedicalService,
  AvailableSlot,
  Appointment,
  FindDoctorsParams,
  GetServicesParams,
  GetAvailableSlotsParams,
  BookAppointmentParams,
  BookAppointmentResponse,
  GetPatientAppointmentsParams,
  CancelAppointmentParams,
  CancelAppointmentResponse,
  RescheduleAppointmentParams,
  RescheduleAppointmentResponse
} from '@/types/api';

// Realistic mock doctors dataset
export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc_sharma_dentist',
    name: 'Dr. Rajesh Sharma',
    specialization: 'Dentist',
    qualifications: 'BDS, MDS (Orthodontics & Cosmetic Dentistry)',
    experienceYears: 12,
    rating: 4.9,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'doc_patel_gp',
    name: 'Dr. Priya Patel',
    specialization: 'General Physician',
    qualifications: 'MBBS, MD (Internal Medicine)',
    experienceYears: 15,
    rating: 4.8,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'doc_gomez_derma',
    name: 'Dr. Elena Gomez',
    specialization: 'Dermatologist',
    qualifications: 'MD (Dermatology & Venereology)',
    experienceYears: 9,
    rating: 4.9,
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday']
  },
  {
    id: 'doc_chen_ophtha',
    name: 'Dr. Sophia Chen',
    specialization: 'Ophthalmologist',
    qualifications: 'MS (Ophthalmology), FRCS',
    experienceYears: 14,
    rating: 4.9,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday']
  },
  {
    id: 'doc_mehta_pedia',
    name: 'Dr. Vikram Mehta',
    specialization: 'Pediatrician',
    qualifications: 'MBBS, DCH, DNB (Pediatrics)',
    experienceYears: 11,
    rating: 4.7,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday']
  },
  {
    id: 'doc_vance_cardio',
    name: 'Dr. Marcus Vance',
    specialization: 'Cardiologist',
    qualifications: 'MD, DM (Cardiology), FACC',
    experienceYears: 18,
    rating: 5.0,
    availableDays: ['Tuesday', 'Thursday', 'Saturday']
  }
];

// Realistic mock services dataset
export const MOCK_SERVICES: MedicalService[] = [
  // Dental Services
  {
    id: 'srv_dental_consult',
    doctorId: 'doc_sharma_dentist',
    name: 'Dental Consultation & Checkup',
    specialization: 'Dentist',
    durationMinutes: 30,
    description: 'Comprehensive oral examination, digital X-rays review, and treatment plan consultation.',
    priceEstimate: '$60'
  },
  {
    id: 'srv_dental_cleaning',
    doctorId: 'doc_sharma_dentist',
    name: 'Teeth Cleaning & Polishing',
    specialization: 'Dentist',
    durationMinutes: 45,
    description: 'Deep ultrasonic scaling, stain removal, and fluoride polish application.',
    priceEstimate: '$90'
  },
  {
    id: 'srv_dental_rootcanal',
    doctorId: 'doc_sharma_dentist',
    name: 'Root Canal Treatment (Initial)',
    specialization: 'Dentist',
    durationMinutes: 60,
    description: 'Endodontic diagnostic assessment and initial pulpectomy for tooth pain.',
    priceEstimate: '$220'
  },
  // General Physician Services
  {
    id: 'srv_gp_consult',
    doctorId: 'doc_patel_gp',
    name: 'General Health Consultation',
    specialization: 'General Physician',
    durationMinutes: 20,
    description: 'Diagnosis and medical management for fever, cough, fatigue, blood pressure, or general wellness.',
    priceEstimate: '$50'
  },
  {
    id: 'srv_gp_preventive',
    doctorId: 'doc_patel_gp',
    name: 'Preventive Health Assessment',
    specialization: 'General Physician',
    durationMinutes: 40,
    description: 'Routine executive full body evaluation, vitals, lipid/glycemic review.',
    priceEstimate: '$95'
  },
  // Dermatology Services
  {
    id: 'srv_derma_consult',
    doctorId: 'doc_gomez_derma',
    name: 'Dermatology & Skin Consultation',
    specialization: 'Dermatologist',
    durationMinutes: 30,
    description: 'Assessment of acne, eczema, hair loss, rashes, pigmentation, and skin allergies.',
    priceEstimate: '$75'
  },
  // Ophthalmology Services
  {
    id: 'srv_ophtha_check',
    doctorId: 'doc_chen_ophtha',
    name: 'Complete Eye & Vision Exam',
    specialization: 'Ophthalmologist',
    durationMinutes: 30,
    description: 'Visual acuity testing, refraction, glaucoma pressure check, and retina screening.',
    priceEstimate: '$70'
  },
  // Pediatrics Services
  {
    id: 'srv_pedia_consult',
    doctorId: 'doc_mehta_pedia',
    name: 'Child Wellness & Pediatric Visit',
    specialization: 'Pediatrician',
    durationMinutes: 30,
    description: 'Growth milestone monitoring, vaccinations, childhood infection treatments.',
    priceEstimate: '$65'
  }
];

// Helper to get formatted tomorrow date string in YYYY-MM-DD
export function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// In-memory appointments store for the mock backend
let mockAppointmentsStore: Appointment[] = [
  {
    id: 'apt_1001',
    doctorId: 'doc_sharma_dentist',
    doctorName: 'Dr. Rajesh Sharma',
    specialization: 'Dentist',
    serviceId: 'srv_dental_consult',
    serviceName: 'Dental Consultation & Checkup',
    startTime: `${getTomorrowDateString()}T16:00:00`,
    endTime: `${getTomorrowDateString()}T16:30:00`,
    patientName: 'John Doe',
    patientPhone: '9876543210',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    notes: 'Mild tooth sensitivity on lower left molar'
  },
  {
    id: 'apt_1002',
    doctorId: 'doc_patel_gp',
    doctorName: 'Dr. Priya Patel',
    specialization: 'General Physician',
    serviceId: 'srv_gp_consult',
    serviceName: 'General Health Consultation',
    startTime: `${getTomorrowDateString()}T10:30:00`,
    endTime: `${getTomorrowDateString()}T10:50:00`,
    patientName: 'Jane Smith',
    patientPhone: '9999999999',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  }
];

// Simulate network latency for realistic feel
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockBackendApi = {
  /**
   * 1. find_doctors
   */
  async findDoctors(params: FindDoctorsParams): Promise<Doctor[]> {
    await delay(250);
    const spec = params.specialization?.toLowerCase().trim();
    const name = params.name?.toLowerCase().trim();

    return MOCK_DOCTORS.filter((doc) => {
      let matches = true;
      if (spec) {
        matches = matches && (
          doc.specialization.toLowerCase().includes(spec) ||
          spec.includes(doc.specialization.toLowerCase()) ||
          (spec.includes('dent') && doc.specialization.toLowerCase().includes('dent')) ||
          (spec.includes('skin') && doc.specialization.toLowerCase().includes('derma')) ||
          (spec.includes('eye') && doc.specialization.toLowerCase().includes('ophtha')) ||
          (spec.includes('child') && doc.specialization.toLowerCase().includes('pedia')) ||
          (spec.includes('heart') && doc.specialization.toLowerCase().includes('cardio')) ||
          (spec.includes('general') || spec.includes('physician') || spec.includes('fever') || spec.includes('cold')) && doc.specialization.toLowerCase().includes('general')
        );
      }
      if (name) {
        matches = matches && doc.name.toLowerCase().includes(name);
      }
      return matches;
    });
  },

  /**
   * 2. get_services
   */
  async getServices(params: GetServicesParams): Promise<MedicalService[]> {
    await delay(200);
    if (params.doctorId) {
      const services = MOCK_SERVICES.filter((s) => s.doctorId === params.doctorId);
      if (services.length > 0) return services;
    }
    if (params.specialization) {
      const spec = params.specialization.toLowerCase();
      return MOCK_SERVICES.filter((s) => s.specialization.toLowerCase().includes(spec));
    }
    return MOCK_SERVICES;
  },

  /**
   * 3. get_available_slots
   */
  async getAvailableSlots(params: GetAvailableSlotsParams): Promise<AvailableSlot[]> {
    await delay(300);
    const dateStr = params.date || getTomorrowDateString();
    
    // Standard clinic schedule slots
    const standardSlotTimes = [
      { start: '09:30:00', end: '10:00:00' },
      { start: '10:00:00', end: '10:30:00' },
      { start: '11:00:00', end: '11:30:00' },
      { start: '11:30:00', end: '12:00:00' },
      { start: '14:00:00', end: '14:30:00' },
      { start: '14:30:00', end: '15:00:00' },
      { start: '15:30:00', end: '16:00:00' },
      { start: '16:00:00', end: '16:30:00' },
      { start: '16:30:00', end: '17:00:00' },
      { start: '17:00:00', end: '17:30:00' },
      { start: '17:30:00', end: '18:00:00' }
    ];

    // Check existing confirmed appointments to filter out booked slots
    const bookedTimes = mockAppointmentsStore
      .filter((apt) => apt.doctorId === params.doctorId && apt.status === 'CONFIRMED' && apt.startTime.startsWith(dateStr))
      .map((apt) => apt.startTime.substring(11, 19));

    return standardSlotTimes
      .filter((time) => !bookedTimes.includes(time.start))
      .map((time) => ({
        startTime: `${dateStr}T${time.start}`,
        endTime: `${dateStr}T${time.end}`,
        doctorId: params.doctorId,
        serviceId: params.serviceId
      }));
  },

  /**
   * 4. book_appointment
   */
  async bookAppointment(params: BookAppointmentParams): Promise<BookAppointmentResponse> {
    await delay(400);

    if (!params.doctorId || !params.startTime || !params.patientName || !params.patientPhone) {
      return {
        success: false,
        error: 'Missing required booking details (doctor, time slot, patient name, or phone number).'
      };
    }

    // Validate phone number format (at least 7 digits)
    const cleanedPhone = params.patientPhone.replace(/\D/g, '');
    if (cleanedPhone.length < 7) {
      return {
        success: false,
        error: 'Please provide a valid contact number (at least 7-10 digits).'
      };
    }

    const doctor = MOCK_DOCTORS.find((d) => d.id === params.doctorId) || {
      name: 'Dr. Rajesh Sharma',
      specialization: 'General Medicine'
    };

    const service = MOCK_SERVICES.find((s) => s.id === params.serviceId) || {
      name: 'General Consultation'
    };

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      doctorId: params.doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      serviceId: params.serviceId || 'srv_default',
      serviceName: service.name,
      startTime: params.startTime,
      endTime: params.endTime || params.startTime,
      patientName: params.patientName,
      patientPhone: cleanedPhone,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      notes: params.notes
    };

    // Store in mock memory
    mockAppointmentsStore.unshift(newAppointment);

    return {
      success: true,
      appointment: newAppointment,
      message: 'Appointment successfully booked. Confirmation SMS has been dispatched.'
    };
  },

  /**
   * 5. get_patient_appointments
   */
  async getPatientAppointments(params: GetPatientAppointmentsParams): Promise<Appointment[]> {
    await delay(300);
    const cleanedSearch = params.phone.replace(/\D/g, '');
    if (!cleanedSearch) return [];

    return mockAppointmentsStore.filter((apt) => {
      const aptPhone = apt.patientPhone.replace(/\D/g, '');
      return aptPhone.includes(cleanedSearch) || cleanedSearch.includes(aptPhone);
    });
  },

  /**
   * 6. cancel_appointment
   */
  async cancelAppointment(params: CancelAppointmentParams): Promise<CancelAppointmentResponse> {
    await delay(350);
    const targetIndex = mockAppointmentsStore.findIndex((apt) => apt.id === params.appointmentId);
    
    if (targetIndex === -1) {
      return {
        success: false,
        message: 'Appointment not found in our records.',
        error: 'Appointment not found in our records.'
      };
    }

    mockAppointmentsStore[targetIndex] = {
      ...mockAppointmentsStore[targetIndex],
      status: 'CANCELLED'
    };

    return {
      success: true,
      message: 'Appointment cancelled successfully. SMS cancellation confirmation sent to patient.',
      appointmentId: params.appointmentId
    };
  },

  /**
   * 7. reschedule_appointment
   */
  async rescheduleAppointment(params: RescheduleAppointmentParams): Promise<RescheduleAppointmentResponse> {
    await delay(350);
    const targetIndex = mockAppointmentsStore.findIndex((apt) => apt.id === params.appointmentId);

    if (targetIndex === -1) {
      return {
        success: false,
        message: 'Failed to reschedule',
        error: 'Appointment not found in records.'
      };
    }

    mockAppointmentsStore[targetIndex] = {
      ...mockAppointmentsStore[targetIndex],
      startTime: params.newStartTime,
      endTime: params.newEndTime,
      status: 'RESCHEDULED'
    };

    return {
      success: true,
      appointment: mockAppointmentsStore[targetIndex],
      message: 'Appointment successfully rescheduled.'
    };
  }
};
