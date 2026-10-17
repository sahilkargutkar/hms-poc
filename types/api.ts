// ==========================================
// Swagger API Contracts & DTOs
// ==========================================

export type DayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export type SwaggerAppointmentStatus =
  | 'Booked'
  | 'Cancelled'
  | 'Completed'
  | 'NoShow';

export interface DoctorAvailabilityDto {
  dayOfWeek: DayOfWeek;
  startTime: string; // e.g. "05:30:00"
  endTime: string;   // e.g. "06:30:00"
  slotDurationMinutes?: number;
}

export interface DoctorResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specialty: string;
  licenseNumber: string;
  timeZoneId: string;
  isActive: boolean;
  createdAtUtc: string;
  availability?: DoctorAvailabilityDto[];
}

export interface DoctorListResponseDto {
  doctors: DoctorResponseDto[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CreateDoctorAvailabilityDto {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
}

export interface CreateDoctorRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specialty: string;
  licenseNumber: string;
  timeZoneId: string;
  availability: CreateDoctorAvailabilityDto[];
}

export interface PatientResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface CreatePatientRequestDto {
  firstName: string;
  lastName: string;
  mobileNumber: string; // E.164 format, e.g. "+919876543210"
  email?: string;
}

export interface CreateAppointmentRequestDto {
  patientId: string;
  doctorId: string;
  startAtUtc: string; // ISO date-time
  endAtUtc: string;   // ISO date-time
  reasonForVisit?: string;
}

export interface UpdateAppointmentRequestDto {
  doctorId: string;
  startAtUtc: string;
  endAtUtc: string;
  reasonForVisit?: string;
}

export interface CancelAppointmentRequestDto {
  cancellationReason?: string;
}

export interface AppointmentResponseDto {
  id: string;
  patientId: string;
  doctorId: string;
  startAtUtc: string;
  endAtUtc: string;
  status: SwaggerAppointmentStatus;
  reasonForVisit?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  cancelledAtUtc?: string | null;
  cancellationReason?: string | null;
}

export interface RequestOtpRequestDto {
  mobileNumber: string;
}

export interface RequestOtpResponseDto {
  message?: string;
}

export interface EmergencyDetectionRequestDto {
  text: string;
}

export interface EmergencyDetectionResponseDto {
  isEmergency: boolean;
  matchedCategories?: string[];
  matchedKeywords?: string[];
  message?: string | null;
  emergencyPhoneNumber?: string | null;
}

export interface VerifyOtpRequestDto {
  mobileNumber: string;
  otp: string;
}

export interface AuthTokenResponseDto {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
}

export interface ProblemDetailsDto {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// ==========================================
// Frontend Domain Models
// ==========================================

export interface Doctor {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  qualifications?: string;
  avatarUrl?: string;
  experienceYears?: number;
  rating?: number;
  availableDays?: string[];
  phoneNumber?: string;
  email?: string;
  licenseNumber?: string;
  timeZoneId?: string;
  rawAvailability?: DoctorAvailabilityDto[];
  services?: MedicalService[];
}

export interface MedicalService {
  id: string;
  doctorId?: string;
  name: string;
  specialization: string;
  durationMinutes: number;
  description?: string;
  priceEstimate?: string;
}

export interface AvailableSlot {
  startTime: string; // ISO 8601 string: e.g. "2026-10-10T16:00:00"
  endTime: string;   // ISO 8601 string: e.g. "2026-10-10T16:30:00"
  doctorId?: string;
  serviceId?: string;
}

export interface PatientInfo {
  name: string;
  phone: string;
  email?: string;
  id?: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  serviceId?: string;
  serviceName?: string;
  startTime: string;
  endTime: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'PENDING' | 'Booked' | 'Completed' | 'NoShow';
  createdAt?: string;
  notes?: string;
  reasonForVisit?: string;
}

export interface FindDoctorsParams {
  specialization?: string;
  name?: string;
  page?: number;
  pageSize?: number;
}

export interface GetServicesParams {
  doctorId?: string;
  specialization?: string;
}

export interface GetAvailableSlotsParams {
  doctorId: string;
  serviceId?: string;
  date: string; // "YYYY-MM-DD"
}

export interface BookAppointmentParams {
  doctorId: string;
  serviceId?: string;
  startTime: string;
  endTime: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  notes?: string;
  reasonForVisit?: string;
}

export interface BookAppointmentResponse {
  success: boolean;
  appointment?: Appointment;
  message?: string;
  error?: string;
}

export interface GetPatientAppointmentsParams {
  phone: string;
}

export interface GetAppointmentsByMobileParams {
  mobileNumber: string;
}

export interface CancelAppointmentParams {
  appointmentId: string;
  reason?: string;
}

export interface CancelAppointmentResponse {
  success: boolean;
  message: string;
  appointmentId?: string;
  error?: string;
}

export interface RescheduleAppointmentParams {
  appointmentId: string;
  newStartTime: string;
  newEndTime: string;
  doctorId?: string;
  reasonForVisit?: string;
}

export interface RescheduleAppointmentResponse {
  success: boolean;
  appointment?: Appointment;
  message: string;
  error?: string;
}

export interface APIErrorResponse {
  success: false;
  error: string;
  code?: string;
}

