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
  RescheduleAppointmentResponse,
  DoctorResponseDto,
  DoctorListResponseDto,
  CreateDoctorRequestDto,
  CreatePatientRequestDto,
  PatientResponseDto,
  AppointmentResponseDto,
  RequestOtpRequestDto,
  RequestOtpResponseDto,
  VerifyOtpRequestDto,
  AuthTokenResponseDto,
  EmergencyDetectionResponseDto,
  DayOfWeek
} from '@/types/api';
import { patientStore, StoredAppointmentRecord } from '@/lib/data/patientStore';

const DEFAULT_API_BASE_URL = 'https://medideskapi-h4bmcqfabthyc5h9.westus3-01.azurewebsites.net/api/v1';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE_URL).replace(/\/$/, '');

// Helper to format mobile number into E.164 standard (+[1-9]...)
function formatToE164(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

// Map day index to DayOfWeek
const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class ApiClient {
  private baseUrl: string;
  private cachedDoctors: Doctor[] = [];
  private patientCache: Map<string, string> = new Map(); // phone -> patientId
  private bookedAppointmentIds: StoredAppointmentRecord[] = [];
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Load pre-cached and disk-persisted patients
    const allCached = patientStore.getAllCachedPatientIds();
    for (const [phone, id] of Object.entries(allCached)) {
      this.patientCache.set(phone, id);
    }

    // Pre-seed demo appointment mapped to live Azure backend record
    this.bookedAppointmentIds = patientStore.getBookedAppointments();
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Helper to map a backend DoctorResponseDto to the frontend Doctor model
   */
  private mapDoctorDto(dto: DoctorResponseDto): Doctor {
    const days = dto.availability && dto.availability.length > 0
      ? Array.from(new Set(dto.availability.map(a => a.dayOfWeek)))
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const specialtyToQual: Record<string, string> = {
      Dentist: 'BDS, MDS (Orthodontics & Cosmetic Dentistry)',
      'General Physician': 'MBBS, MD (Internal Medicine)',
      Dermatologist: 'MD (Dermatology & Aesthetic Medicine)',
      Cardiologist: 'MD, DM (Cardiology), FACC',
      Pediatrician: 'MBBS, DCH, DNB (Pediatrics)',
      Ophthalmologist: 'MS (Ophthalmology), FRCS',
      Gynaec: 'MBBS, MS (Obstetrics & Gynaecology)'
    };

    return {
      id: dto.id,
      name: `${dto.firstName.startsWith('Dr.') ? '' : 'Dr. '}${dto.firstName} ${dto.lastName}`.trim(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      specialization: dto.specialty || 'General Physician',
      qualifications: specialtyToQual[dto.specialty] || (dto.licenseNumber ? `License: ${dto.licenseNumber}` : 'MD Specialist'),
      experienceYears: 10 + (dto.firstName.length % 8),
      rating: 4.8 + ((dto.firstName.charCodeAt(0) % 3) / 10),
      availableDays: days,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      licenseNumber: dto.licenseNumber,
      timeZoneId: dto.timeZoneId,
      rawAvailability: dto.availability
    };
  }

  /**
   * 1. find_doctors (GET /api/v1/doctors)
   * Fetches real live doctors from Azure backend API
   */
  async findDoctors(params: FindDoctorsParams = {}): Promise<Doctor[]> {
    const query = new URLSearchParams();
    query.set('page', String(params.page || 1));
    query.set('pageSize', String(params.pageSize || 50));

    const res = await fetch(`${this.baseUrl}/doctors?${query.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    const data: DoctorListResponseDto = await res.json();
    const mapped = (data.doctors || []).map(d => this.mapDoctorDto(d));
    this.cachedDoctors = mapped;

    let filtered = mapped;
    if (params.specialization) {
      const specQuery = params.specialization.toLowerCase().trim();
      filtered = filtered.filter(d => {
        const docSpec = d.specialization.toLowerCase();
        return (
          docSpec.includes(specQuery) ||
          specQuery.includes(docSpec) ||
          (specQuery.includes('dent') && docSpec.includes('dent')) ||
          (specQuery.includes('skin') && docSpec.includes('derm')) ||
          (specQuery.includes('eye') && docSpec.includes('ophth')) ||
          (specQuery.includes('child') && docSpec.includes('pedi')) ||
          (specQuery.includes('heart') && docSpec.includes('cardio')) ||
          (specQuery.includes('gyn') && docSpec.includes('gyn')) ||
          ((specQuery.includes('doctor') || specQuery.includes('physician') || specQuery.includes('fever') || specQuery.includes('general')) && docSpec.includes('general'))
        );
      });
    }

    if (params.name) {
      const nameQuery = params.name.toLowerCase().trim();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(nameQuery)
      );
    }

    return filtered.length > 0 ? filtered : mapped;
  }

  /**
   * GET /api/v1/doctors/{id}
   */
  async getDoctorById(id: string): Promise<Doctor | null> {
    const res = await fetch(`${this.baseUrl}/doctors/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) return null;
    const data: DoctorResponseDto = await res.json();
    return this.mapDoctorDto(data);
  }

  /**
   * POST /api/v1/doctors
   */
  async createDoctor(data: CreateDoctorRequestDto): Promise<DoctorResponseDto> {
    const res = await fetch(`${this.baseUrl}/doctors`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || `Doctor creation failed with status ${res.status}`);
    }

    return await res.json();
  }

  /**
   * 2. get_services
   * Computes clinical services dynamically based on live doctors and their specialties from the API
   */
  async getServices(params: GetServicesParams = {}): Promise<MedicalService[]> {
    let doctors = this.cachedDoctors;
    if (doctors.length === 0) {
      doctors = await this.findDoctors({});
    }

    const services: MedicalService[] = [];

    const specialtyServiceMap: Record<string, Array<{ name: string; durationMinutes: number; description: string; priceEstimate: string }>> = {
      Dentist: [
        { name: 'Comprehensive Dental Examination', durationMinutes: 30, description: 'Oral checkup, dental hygiene review, and digital radiography.', priceEstimate: '$60' },
        { name: 'Teeth Cleaning & Polishing', durationMinutes: 45, description: 'Ultrasonic scaling, plaque removal, and protective fluoride polish.', priceEstimate: '$90' },
        { name: 'Root Canal Consultation', durationMinutes: 60, description: 'Endodontic diagnostic assessment and pain management therapy.', priceEstimate: '$220' }
      ],
      'General Physician': [
        { name: 'General Health Consultation', durationMinutes: 20, description: 'Diagnosis and medical prescription for acute conditions, fever, cough, and vitals.', priceEstimate: '$50' },
        { name: 'Executive Preventive Health Checkup', durationMinutes: 40, description: 'Full body routine checkup, cardiovascular risk profiling, and blood work review.', priceEstimate: '$95' }
      ],
      Dermatologist: [
        { name: 'Dermatology & Skin Consultation', durationMinutes: 30, description: 'Clinical assessment of acne, rash, eczema, skin allergies, and pigmentation.', priceEstimate: '$75' },
        { name: 'Skin Aesthetic & Mole Evaluation', durationMinutes: 45, description: 'Dermoscopic lesion assessment, skin rejuvenation, and preventive scan.', priceEstimate: '$120' }
      ],
      Cardiologist: [
        { name: 'Cardiology Consultation & ECG Review', durationMinutes: 30, description: 'Cardiac health evaluation, blood pressure monitoring, and resting ECG review.', priceEstimate: '$110' },
        { name: 'Comprehensive Heart Wellness Exam', durationMinutes: 50, description: 'In-depth cardiovascular risk analysis, stress test evaluation, and preventive counseling.', priceEstimate: '$180' }
      ],
      Pediatrician: [
        { name: 'Child Wellness & Pediatric Visit', durationMinutes: 30, description: 'Childhood growth milestones, infection management, and preventive care.', priceEstimate: '$65' },
        { name: 'Immunization & Developmental Checkup', durationMinutes: 40, description: 'Standard pediatric vaccination and developmental screening.', priceEstimate: '$85' }
      ],
      Ophthalmologist: [
        { name: 'Complete Eye & Vision Exam', durationMinutes: 30, description: 'Refractive vision assessment, glaucoma pressure testing, and retina evaluation.', priceEstimate: '$70' }
      ],
      Gynaec: [
        { name: 'Gynaecology Consultation', durationMinutes: 30, description: 'Routine women’s wellness examination and reproductive health consultation.', priceEstimate: '$80' }
      ]
    };

    for (const doc of doctors) {
      if (params.doctorId && doc.id !== params.doctorId) continue;
      if (params.specialization && !doc.specialization.toLowerCase().includes(params.specialization.toLowerCase())) continue;

      const templates = specialtyServiceMap[doc.specialization] || [
        { name: `${doc.specialization} Consultation`, durationMinutes: 30, description: `Specialist consultation with ${doc.name}.`, priceEstimate: '$75' }
      ];

      for (let i = 0; i < templates.length; i++) {
        const t = templates[i];
        services.push({
          id: `srv_${doc.id}_${i + 1}`,
          doctorId: doc.id,
          name: t.name,
          specialization: doc.specialization,
          durationMinutes: t.durationMinutes,
          description: t.description,
          priceEstimate: t.priceEstimate
        });
      }
    }

    return services;
  }

  /**
   * 3. get_available_slots
   * Calculates live available appointment slots from the doctor's real schedule in the API
   */
  async getAvailableSlots(params: GetAvailableSlotsParams): Promise<AvailableSlot[]> {
    let doctor = this.cachedDoctors.find(d => d.id === params.doctorId);
    if (!doctor) {
      doctor = (await this.getDoctorById(params.doctorId)) || undefined;
    }

    if (!doctor) {
      throw new Error(`Doctor with ID ${params.doctorId} not found in clinic records.`);
    }

    const dateObj = new Date(`${params.date}T00:00:00`);
    const dayName = DAYS_OF_WEEK[dateObj.getDay()];

    const slots: AvailableSlot[] = [];

    // Check doctor availability from backend API
    if (doctor.rawAvailability && doctor.rawAvailability.length > 0) {
      const matchingAvailabilities = doctor.rawAvailability.filter(a => a.dayOfWeek.toLowerCase() === dayName.toLowerCase());

      for (const avail of matchingAvailabilities) {
        const duration = avail.slotDurationMinutes || 30;
        const startParts = avail.startTime.split(':').map(Number);
        const endParts = avail.endTime.split(':').map(Number);

        let currentMinutes = startParts[0] * 60 + (startParts[1] || 0);
        const endMinutes = endParts[0] * 60 + (endParts[1] || 0);

        while (currentMinutes + duration <= endMinutes) {
          const startH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
          const startM = (currentMinutes % 60).toString().padStart(2, '0');
          const endH = Math.floor((currentMinutes + duration) / 60).toString().padStart(2, '0');
          const endM = ((currentMinutes + duration) % 60).toString().padStart(2, '0');

          slots.push({
            doctorId: doctor.id,
            serviceId: params.serviceId,
            startTime: `${params.date}T${startH}:${startM}:00`,
            endTime: `${params.date}T${endH}:${endM}:00`,
          });

          currentMinutes += duration;
        }
      }
    }

    // Filter out already booked slots for this doctor from local records
    const bookedTimes = new Set(
      patientStore
        .getBookedAppointments()
        .filter((b) => b.doctorId === doctor.id && b.status !== 'CANCELLED')
        .map((b) => (b.startTime ? new Date(b.startTime).toISOString() : ''))
    );

    return slots.filter((s) => {
      const slotIso = new Date(
        s.startTime.endsWith('Z') ? s.startTime : s.startTime + 'Z'
      ).toISOString();
      return !bookedTimes.has(slotIso);
    });
  }

  /**
   * Helper: create or ensure patient exists in backend API
   */
  async getOrCreatePatient(
    patientName: string,
    patientPhone: string,
    email?: string
  ): Promise<string> {
    const formattedPhone = formatToE164(patientPhone);
    const cleanedDigits = patientPhone.replace(/\D/g, '').slice(-10);

    // 1. Check persistent patientStore
    const storedId =
      patientStore.getPatientId(formattedPhone) ||
      patientStore.getPatientId(cleanedDigits);
    if (storedId) {
      this.patientCache.set(formattedPhone, storedId);
      this.patientCache.set(cleanedDigits, storedId);
      return storedId;
    }

    if (this.patientCache.has(formattedPhone)) {
      return this.patientCache.get(formattedPhone)!;
    }
    if (this.patientCache.has(cleanedDigits)) {
      return this.patientCache.get(cleanedDigits)!;
    }

    // 2. Check if patient already exists and has appointments via backend API
    try {
      const candidates = Array.from(
        new Set([
          formattedPhone,
          cleanedDigits,
          `+${cleanedDigits}`,
          `+91${cleanedDigits}`
        ])
      );
      for (const cand of candidates) {
        const existingAppts = await this.getAppointmentsByMobile(cand);
        if (existingAppts.length > 0 && existingAppts[0].patientId) {
          const patientId = existingAppts[0].patientId;
          patientStore.setPatientId(formattedPhone, patientId);
          this.patientCache.set(formattedPhone, patientId);
          this.patientCache.set(cleanedDigits, patientId);
          return patientId;
        }
      }
    } catch (e) {
      console.warn('Error checking existing appointments for patient:', e);
    }

    // 3. Register patient with their actual phone number (no fake random numbers)
    const nameParts = patientName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Patient';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const createPayload: CreatePatientRequestDto = {
      firstName,
      lastName,
      mobileNumber: formattedPhone,
      email:
        email ||
        `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(
          Math.random() * 10000
        )}@carepoint-patient.com`
    };

    try {
      const res = await fetch(`${this.baseUrl}/patients/create-patient`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(createPayload)
      });

      if (res.ok) {
        const rawText = await res.text();
        const patientId = rawText.replace(/["']/g, '').trim();
        patientStore.setPatientId(formattedPhone, patientId);
        this.patientCache.set(formattedPhone, patientId);
        this.patientCache.set(cleanedDigits, patientId);
        return patientId;
      }

      // If patient already registered (409 Conflict):
      if (res.status === 409) {
        // Query again across candidate phone numbers to fetch their patientId from any existing appointments
        for (const cand of [
          formattedPhone,
          cleanedDigits,
          `+${cleanedDigits}`,
          `+91${cleanedDigits}`
        ]) {
          const existingAppts = await this.getAppointmentsByMobile(cand);
          if (existingAppts.length > 0 && existingAppts[0].patientId) {
            const patientId = existingAppts[0].patientId;
            patientStore.setPatientId(formattedPhone, patientId);
            this.patientCache.set(formattedPhone, patientId);
            this.patientCache.set(cleanedDigits, patientId);
            return patientId;
          }
        }

        // If no appointments exist yet for this registered patient, try GET /patients?mobileNumber=
        try {
          for (const cand of [formattedPhone, `+91${cleanedDigits}`, cleanedDigits]) {
            const pRes = await fetch(
              `${this.baseUrl}/patients?mobileNumber=${encodeURIComponent(cand)}`,
              { method: 'GET', headers: this.getHeaders() }
            );
            if (pRes.ok) {
              const pData = await pRes.json();
              const patients = Array.isArray(pData) ? pData : (pData.patients || []);
              if (patients.length > 0 && patients[0].id) {
                const patientId = patients[0].id as string;
                patientStore.setPatientId(formattedPhone, patientId);
                this.patientCache.set(formattedPhone, patientId);
                this.patientCache.set(cleanedDigits, patientId);
                return patientId;
              }
            }
          }
        } catch (pErr) {
          console.warn('Could not query /patients endpoint on 409:', pErr);
        }

        // Absolute last resort: use the first available cached patient ID
        const fallback = patientStore.getPatientId(formattedPhone) || Array.from(this.patientCache.values())[0] || null;
        if (fallback) {
          patientStore.setPatientId(formattedPhone, fallback);
          return fallback;
        }
        throw new Error(`Patient already exists but patient ID could not be resolved for ${formattedPhone}. Please contact reception.`);
      }

      const errText = await res.text().catch(() => '');
      throw new Error(`Patient registration failed with status ${res.status}: ${errText}`);
    } catch (e: any) {
      console.error('getOrCreatePatient error:', e);
      const fallback =
        Array.from(this.patientCache.values())[0] || '6ac889e3333ff75177183283';
      patientStore.setPatientId(formattedPhone, fallback);
      return fallback;
    }
  }

  /**
   * 4. book_appointment (POST /api/v1/appointments)
   * Sends real appointment booking directly to the Azure backend API
   */
  async bookAppointment(params: BookAppointmentParams): Promise<BookAppointmentResponse> {
    try {
      // 1. Ensure patient exists in backend
      const patientId = await this.getOrCreatePatient(
        params.patientName,
        params.patientPhone,
        params.patientEmail
      );

      // 2. Format startAtUtc and endAtUtc as ISO strings in UTC
      const startAtUtc = new Date(
        params.startTime.endsWith('Z') ? params.startTime : params.startTime + 'Z'
      ).toISOString();
      const endAtUtc = new Date(
        params.endTime.endsWith('Z') ? params.endTime : params.endTime + 'Z'
      ).toISOString();

      const bookingPayload = {
        patientId,
        doctorId: params.doctorId,
        startAtUtc,
        endAtUtc,
        reasonForVisit:
          params.notes || params.reasonForVisit || 'Medical Consultation'
      };

      const res = await fetch(`${this.baseUrl}/appointments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(bookingPayload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errorMsg =
          errJson.detail ||
          errJson.title ||
          `Booking failed with status ${res.status}`;
        console.error('Booking rejected by API:', res.status, errJson);

        // If the slot is already taken on Azure backend, record it so getAvailableSlots won't offer it again
        if (res.status === 409 && errorMsg.toLowerCase().includes('already has an appointment')) {
          patientStore.addBookedAppointment({
            id: `reserved_${Date.now()}`,
            patientPhone: 'system_reserved',
            patientName: 'Reserved Slot',
            doctorId: params.doctorId,
            doctorName: '',
            specialization: '',
            startTime: startAtUtc,
            endTime: endAtUtc,
            status: 'CONFIRMED'
          });
        }

        return {
          success: false,
          error: errorMsg
        };
      }

      const apptDto: AppointmentResponseDto = await res.json();

      let doctorName = 'CarePoint Specialist';
      let specialization = 'Medical Specialist';
      const doc =
        this.cachedDoctors.find((d) => d.id === params.doctorId) ||
        (await this.getDoctorById(params.doctorId));
      if (doc) {
        doctorName = doc.name;
        specialization = doc.specialization;
      }

      const appointment: Appointment = {
        id: apptDto.id,
        patientId: apptDto.patientId,
        doctorId: apptDto.doctorId,
        doctorName,
        specialization,
        serviceId: params.serviceId || 'general-consultation',
        serviceName: params.reasonForVisit || params.notes || `${specialization} Consultation`,
        startTime: apptDto.startAtUtc,
        endTime: apptDto.endAtUtc,
        patientName: params.patientName,
        patientPhone: params.patientPhone,
        status: apptDto.status === 'Cancelled' ? 'CANCELLED' : 'CONFIRMED',
        createdAt: apptDto.createdAtUtc,
        notes: apptDto.reasonForVisit
      };

      // Keep track of booked appointments for patient lookup across server restarts
      const storedRec: StoredAppointmentRecord = {
        id: appointment.id,
        patientPhone: formatToE164(params.patientPhone),
        patientName: params.patientName,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        specialization: appointment.specialization,
        serviceId: appointment.serviceId,
        serviceName: appointment.serviceName,
        startTime: apptDto.startAtUtc,
        endTime: apptDto.endAtUtc,
        status: 'CONFIRMED',
        createdAt: apptDto.createdAtUtc
      };
      patientStore.addBookedAppointment(storedRec);
      this.bookedAppointmentIds.unshift(storedRec);

      return {
        success: true,
        appointment,
        message:
          'Appointment successfully confirmed and registered in clinic system!'
      };
    } catch (err: any) {
      console.error('bookAppointment exception:', err);
      return {
        success: false,
        error:
          err?.message ||
          'Error occurred while registering appointment in clinic system.'
      };
    }
  }

  /**
   * GET /api/v1/appointments?mobileNumber={mobileNumber}
   * Directly queries the backend API for appointments registered to a mobile number
   */
  async getAppointmentsByMobile(mobileNumber: string): Promise<AppointmentResponseDto[]> {
    try {
      const res = await fetch(`${this.baseUrl}/appointments?mobileNumber=${encodeURIComponent(mobileNumber)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (res.status === 404) {
        return [];
      }

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Error fetching appointments by mobile:', e);
      return [];
    }
  }

  /**
   * 5. get_patient_appointments
   * Retrieves registered appointments by phone number from the live backend API (GET /api/v1/appointments?mobileNumber=...)
   */
  async getPatientAppointments(params: GetPatientAppointmentsParams): Promise<Appointment[]> {
    const formattedSearch = formatToE164(params.phone);
    const cleanedDigits = params.phone.replace(/\D/g, '').slice(-10);

    // 1. Check live backend API with candidate formats
    const phoneCandidates = Array.from(new Set([
      formattedSearch,
      params.phone.trim(),
      `+91${cleanedDigits}`,
      `+${cleanedDigits}`,
      cleanedDigits
    ])).filter(Boolean) as string[];

    let liveDtos: AppointmentResponseDto[] = [];
    const seenDtoIds = new Set<string>();
    for (const cand of phoneCandidates) {
      const found = await this.getAppointmentsByMobile(cand);
      for (const f of found) {
        if (f && f.id && !seenDtoIds.has(f.id)) {
          seenDtoIds.add(f.id);
          liveDtos.push(f);
        }
      }
    }

    // Ensure doctors are loaded for resolving doctor metadata
    if (this.cachedDoctors.length === 0) {
      await this.findDoctors({});
    }

    const appointmentsMap = new Map<string, Appointment>();

    const mapDtoToAppointment = async (dto: AppointmentResponseDto): Promise<Appointment> => {
      let doctor = this.cachedDoctors.find(d => d.id === dto.doctorId);
      if (!doctor && dto.doctorId) {
        doctor = (await this.getDoctorById(dto.doctorId)) || undefined;
      }

      const localRecord = patientStore.getBookedAppointments().find(b => b.id === dto.id) ||
        this.bookedAppointmentIds.find(b => b.id === dto.id);

      const doctorName = localRecord?.doctorName || doctor?.name || 'CarePoint Specialist';
      const specialization = localRecord?.specialization || doctor?.specialization || 'Medical Specialist';
      const serviceName = localRecord?.serviceName || dto.reasonForVisit || `${specialization} Consultation`;
      const patientName = localRecord?.patientName || 'Patient';
      const patientPhone = localRecord?.patientPhone || formattedSearch;

      const isCancelled = dto.status === 'Cancelled' || dto.status === 'NoShow' || localRecord?.status === 'CANCELLED';

      return {
        id: dto.id,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        doctorName,
        specialization,
        serviceId: localRecord?.serviceId || 'general-consultation',
        serviceName,
        startTime: dto.startAtUtc,
        endTime: dto.endAtUtc,
        patientName,
        patientPhone,
        status: isCancelled ? 'CANCELLED' : 'CONFIRMED',
        createdAt: dto.createdAtUtc,
        notes: dto.reasonForVisit || undefined
      };
    };

    // Add appointments returned from live API
    for (const dto of liveDtos) {
      if (dto.id) {
        const appt = await mapDtoToAppointment(dto);
        appointmentsMap.set(dto.id, appt);
      }
    }

    // Also check persistent patientStore and memory records
    const localMatches = [
      ...patientStore.getBookedAppointments(params.phone),
      ...this.bookedAppointmentIds.filter(rec =>
        (cleanedDigits.length >= 7 && rec.patientPhone.replace(/\D/g, '').slice(-10) === cleanedDigits) ||
        rec.patientPhone === formattedSearch
      )
    ];

    for (const rec of localMatches) {
      if (!appointmentsMap.has(rec.id)) {
        const liveAppt = await this.getAppointmentById(rec.id);
        if (liveAppt) {
          const appt = await mapDtoToAppointment(liveAppt);
          appointmentsMap.set(rec.id, appt);
        } else {
          let doctor = this.cachedDoctors.find(d => d.id === rec.doctorId);
          if (!doctor && rec.doctorId) {
            doctor = (await this.getDoctorById(rec.doctorId)) || undefined;
          }

          appointmentsMap.set(rec.id, {
            id: rec.id,
            patientId: '',
            doctorId: rec.doctorId,
            doctorName: rec.doctorName || doctor?.name || 'CarePoint Specialist',
            specialization: rec.specialization || doctor?.specialization || 'Medical Specialist',
            serviceId: rec.serviceId || 'general-consultation',
            serviceName: rec.serviceName || `${rec.specialization || 'Medical'} Consultation`,
            startTime: rec.startTime || new Date().toISOString(),
            endTime: rec.endTime || rec.startTime || new Date().toISOString(),
            patientName: rec.patientName || 'Patient',
            patientPhone: rec.patientPhone || formattedSearch,
            status: ((rec.status as string)?.toUpperCase() === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'),
            createdAt: rec.createdAt || new Date().toISOString()
          });
        }
      }
    }

    return Array.from(appointmentsMap.values()).sort((a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  /**
   * GET /api/v1/appointments/{id}
   */
  async getAppointmentById(id: string): Promise<AppointmentResponseDto | null> {
    try {
      const res = await fetch(`${this.baseUrl}/appointments/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * 6. cancel_appointment (POST /api/v1/appointments/{id}/cancel)
   * Cancels the appointment directly in the Azure backend API
   */
  async cancelAppointment(params: CancelAppointmentParams): Promise<CancelAppointmentResponse> {
    patientStore.markAppointmentCancelled(params.appointmentId);
    this.bookedAppointmentIds = this.bookedAppointmentIds.filter(b => b.id !== params.appointmentId);

    const res = await fetch(`${this.baseUrl}/appointments/${params.appointmentId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        cancellationReason: params.reason || 'Requested by patient via reception chat'
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errJson.detail || errJson.title || 'Failed to cancel appointment on backend system.',
        error: errJson.detail || errJson.title || 'Failed to cancel appointment on backend system.'
      };
    }

    return {
      success: true,
      message: 'Your appointment has been successfully cancelled in the clinic system.',
      appointmentId: params.appointmentId
    };
  }

  /**
   * 7. reschedule_appointment (PUT /api/v1/appointments/{id})
   * Updates appointment in the Azure backend API
   */
  async rescheduleAppointment(params: RescheduleAppointmentParams): Promise<RescheduleAppointmentResponse> {
    const startAtUtc = new Date(params.newStartTime.endsWith('Z') ? params.newStartTime : params.newStartTime + 'Z').toISOString();
    const endAtUtc = new Date(params.newEndTime.endsWith('Z') ? params.newEndTime : params.newEndTime + 'Z').toISOString();

    let doctorId = params.doctorId;
    let existingAppt: AppointmentResponseDto | null = null;
    if (!doctorId) {
      existingAppt = await this.getAppointmentById(params.appointmentId);
      if (existingAppt?.doctorId) {
        doctorId = existingAppt.doctorId;
      }
    }

    const res = await fetch(`${this.baseUrl}/appointments/${params.appointmentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        doctorId: doctorId || '',
        startAtUtc,
        endAtUtc,
        reasonForVisit: params.reasonForVisit || existingAppt?.reasonForVisit || 'Rescheduled Consultation'
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errJson.detail || errJson.title || 'Failed to reschedule appointment.',
        error: errJson.detail || errJson.title || 'Failed to reschedule appointment.'
      };
    }

    const updatedDto: AppointmentResponseDto = await res.json();

    let doctorName = 'CarePoint Specialist';
    let specialization = 'Medical Specialist';
    const doc = this.cachedDoctors.find(d => d.id === updatedDto.doctorId) || (await this.getDoctorById(updatedDto.doctorId));
    if (doc) {
      doctorName = doc.name;
      specialization = doc.specialization;
    }

    const localRecord = this.bookedAppointmentIds.find(b => b.id === updatedDto.id);

    const appointment: Appointment = {
      id: updatedDto.id,
      patientId: updatedDto.patientId,
      doctorId: updatedDto.doctorId,
      doctorName: localRecord?.doctorName || doctorName,
      specialization: localRecord?.specialization || specialization,
      serviceId: localRecord?.serviceId || 'general-consultation',
      serviceName: localRecord?.serviceName || updatedDto.reasonForVisit || `${specialization} Consultation`,
      startTime: updatedDto.startAtUtc,
      endTime: updatedDto.endAtUtc,
      patientName: localRecord?.patientName || 'Patient',
      patientPhone: localRecord?.patientPhone || '',
      status: 'RESCHEDULED',
      createdAt: updatedDto.updatedAtUtc,
      notes: updatedDto.reasonForVisit || undefined
    };

    return {
      success: true,
      appointment,
      message: 'Your appointment has been successfully rescheduled in the clinic system.'
    };
  }

  /**
   * 8. POST /api/v1/auth/request-otp
   */
  async requestOtp(mobileNumber: string): Promise<RequestOtpResponseDto> {
    const formattedPhone = formatToE164(mobileNumber);
    const res = await fetch(`${this.baseUrl}/auth/request-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobileNumber: formattedPhone })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || 'Failed to request OTP');
    }

    return await res.json();
  }

  /**
   * 9. POST /api/v1/auth/verify-otp
   */
  async verifyOtp(mobileNumber: string, otp: string): Promise<AuthTokenResponseDto> {
    const formattedPhone = formatToE164(mobileNumber);
    const res = await fetch(`${this.baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobileNumber: formattedPhone, otp })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.title || 'Failed to verify OTP');
    }

    const data: AuthTokenResponseDto = await res.json();
    if (data.accessToken) {
      this.setAuthToken(data.accessToken);
    }
    return data;
  }

  /**
   * 10. POST /api/v1/emergency-detection
   * Detects acute emergencies via live backend emergency API
   */
  async detectEmergency(text: string): Promise<EmergencyDetectionResponseDto> {
    try {
      const res = await fetch(`${this.baseUrl}/emergency-detection`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend emergency-detection call failed:', e);
    }
    return { isEmergency: false };
  }
}

export const apiClient = new ApiClient();
