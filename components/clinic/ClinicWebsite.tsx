'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  Phone,
  MapPin,
  HeartPulse,
  Activity,
  User,
  Users,
  Award,
  ChevronRight,
  MessageSquareHeart,
  Headphones,
  CalendarCheck
} from 'lucide-react';
import {
  FaTooth,
  FaStethoscope,
  FaWandMagicSparkles,
  FaEye,
  FaBaby,
  FaHeartPulse,
  FaCalendarCheck,
  FaBolt
} from 'react-icons/fa6';
import { apiClient } from '@/lib/api/client';
import { Doctor, MedicalService } from '@/types/api';
import { WidgetState } from '@/components/chat/FloatingChatWidget';

interface ClinicWebsiteProps {
  onOpenBot: (prompt?: string, actionDoctor?: Doctor, actionService?: MedicalService) => void;
  widgetState: WidgetState;
}

export const ClinicWebsite: React.FC<ClinicWebsiteProps> = ({
  onOpenBot,
  widgetState
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    async function loadLiveClinicData() {
      try {
        setIsLoadingData(true);
        const docs = await apiClient.findDoctors({});
        setDoctors(docs);
        const srvs = await apiClient.getServices({});
        setServices(srvs);
      } catch (err) {
        console.error('Failed to load clinic data from API:', err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadLiveClinicData();
  }, []);

  const specialties = [
    {
      id: 'dentistry',
      name: 'Dentistry',
      icon: FaTooth,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
      description: 'Comprehensive dental hygiene, cosmetic smiles, root canals & orthodontic treatments.',
      prompt: 'I want to see a dentist'
    },
    {
      id: 'general_medicine',
      name: 'General Medicine',
      icon: FaStethoscope,
      color: 'bg-teal-50 text-teal-700 border-teal-100',
      iconBg: 'bg-teal-100 text-teal-600',
      description: 'Primary care, chronic disease management, seasonal illness diagnostics & preventive health.',
      prompt: 'I need to consult a general physician'
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      icon: FaWandMagicSparkles,
      color: 'bg-rose-50 text-rose-700 border-rose-100',
      iconBg: 'bg-rose-100 text-rose-600',
      description: 'Advanced clinical skincare, acne therapy, mole examinations & aesthetic consultations.',
      prompt: 'I need to see a dermatologist'
    },
    {
      id: 'ophthalmology',
      name: 'Ophthalmology',
      icon: FaEye,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
      description: 'Precision vision evaluations, glaucoma screenings, refractive exams & eye health.',
      prompt: 'I want to book an eye doctor appointment'
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      icon: FaBaby,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-600',
      description: 'Gentle, compassionate pediatric care, newborn growth tracking & child immunizations.',
      prompt: 'I want to book a pediatrician appointment'
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      icon: FaHeartPulse,
      color: 'bg-red-50 text-red-700 border-red-100',
      iconBg: 'bg-red-100 text-red-600',
      description: 'Cardiac assessments, resting ECG tests, blood pressure management & heart wellness.',
      prompt: 'I want to consult a cardiologist'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-teal-900 px-4 py-2 text-xs font-medium text-teal-100 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online Front Desk is active 24/7 for instant appointment scheduling & slot verification</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-teal-300" />
              <span>Helpline: +1 (800) 555-CARE</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-300" />
              <span>Downtown Medical Center, Suite 400</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Clinic Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md ring-4 ring-teal-50">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                CarePoint Clinic
              </span>
              <p className="text-[11px] font-medium text-teal-700">
                Advanced Medical & Wellness Center
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#specialties" className="hover:text-teal-600 transition-colors">Specialties</a>
            <a href="#doctors" className="hover:text-teal-600 transition-colors">Our Doctors</a>
            <a href="#services" className="hover:text-teal-600 transition-colors">Services & Pricing</a>
            <a href="#features" className="hover:text-teal-600 transition-colors">Why CarePoint</a>
            <a href="#hours" className="hover:text-teal-600 transition-colors">Hours & Info</a>
          </nav>

          {/* Action CTA to open Front Desk */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenBot('Show me my appointments')}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-teal-800 hover:bg-teal-50/80 active:scale-95 transition-all shadow-2xs"
            >
              <CalendarCheck className="h-4 w-4 text-teal-600" />
              <span>My Appointments</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBot()}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition-all"
            >
              <MessageSquareHeart className="h-4 w-4" />
              <span>Book Appointment Online</span>
              <span className="flex h-2 w-2 relative">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/80 px-3.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-600/20">
                <HeartPulse className="h-3.5 w-3.5 text-teal-600" />
                <span>Patient-First Healthcare Scheduling</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
                Quality Healthcare,{' '}
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Scheduled in Seconds.
                </span>
              </h1>

              <p className="text-base text-slate-600 sm:text-lg leading-relaxed">
                Skip long telephone queues and waiting rooms. Our patient care coordinators match you with top specialist doctors, check real-time clinic schedules, and confirm appointments 24/7.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenBot('I want to book an appointment')}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:shadow-xl active:scale-95 transition-all"
                >
                  <MessageSquareHeart className="h-4 w-4" />
                  <span>Book Appointment Online</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href="#doctors"
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Users className="h-4 w-4 text-slate-500" />
                  <span>Browse Specialists</span>
                </a>
              </div>

              {/* Quick Scheduling Prompt Chips */}
              <div className="pt-4 border-t border-slate-200/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <FaBolt className="h-3.5 w-3.5 text-amber-500" />
                  <span>Quick Scheduling Options:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenBot('I want to see a dentist tomorrow')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-800 transition-all"
                  >
                    <FaTooth className="h-3.5 w-3.5 text-teal-600" />
                    <span>Book Dentist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenBot('Show me general physicians')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-800 transition-all"
                  >
                    <FaStethoscope className="h-3.5 w-3.5 text-teal-600" />
                    <span>General Physician</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenBot('I want to see a dermatologist')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-800 transition-all"
                  >
                    <FaWandMagicSparkles className="h-3.5 w-3.5 text-teal-600" />
                    <span>Skin Specialist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenBot('Show me my appointments')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-800 transition-all"
                  >
                    <FaCalendarCheck className="h-3.5 w-3.5 text-teal-600" />
                    <span>Check My Bookings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
                {/* Decorative Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">CarePoint Front Desk</h2>
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Interactive Scheduling
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 text-[11px] font-semibold">
                    Front Desk Online
                  </span>
                </div>

                {/* Simulated Conversation Snapshot */}
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white text-[11px] font-bold">
                      Desk
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-slate-100 px-3.5 py-2.5 text-xs text-slate-700">
                      Hello! How can I assist you with your health today?
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-none bg-teal-600 px-3.5 py-2.5 text-xs text-white font-medium">
                      "I'd like to book a dental cleaning with Dr. Sharma tomorrow"
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white text-[11px] font-bold">
                      Desk
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-slate-100 p-3 text-xs text-slate-700 space-y-2">
                      <p className="font-semibold text-slate-900">Dr. Rajesh Sharma (Dentist)</p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                          10:00 AM Available
                        </span>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                          02:30 PM Available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Launch Button */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onOpenBot()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-semibold text-white hover:bg-slate-800 active:scale-98 transition-all"
                  >
                    <MessageSquareHeart className="h-4 w-4 text-teal-400" />
                    <span>Chat with Front Desk (Bottom-Right)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-14 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:grid-cols-4">
            <div className="text-center sm:border-r border-slate-100">
              <div className="text-2xl font-bold text-teal-600">15,000+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Appointments Booked</div>
            </div>
            <div className="text-center sm:border-r border-slate-100">
              <div className="text-2xl font-bold text-teal-600">4.9 / 5.0</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Patient Satisfaction</div>
            </div>
            <div className="text-center sm:border-r border-slate-100">
              <div className="text-2xl font-bold text-teal-600">&lt; 60 Sec</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Average Booking Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">24 / 7</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Real-Time Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SPECIALTIES SECTION */}
      <section id="specialties" className="py-20 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              Clinical Departments
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Comprehensive Medical Specializations
            </p>
            <p className="mt-3 text-sm text-slate-600">
              From routine preventive checkups to complex specialist care, our accredited physicians are ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <div
                  key={spec.id}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-500 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${spec.iconBg}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${spec.color}`}>
                        Active Department
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {spec.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {spec.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onOpenBot(spec.prompt)}
                      className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors"
                    >
                      <span>Schedule Consultation</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-400">Next-Day Slots</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. DOCTORS SECTION */}
      <section id="doctors" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
                Expert Medical Team
              </h2>
              <p className="text-3xl font-extrabold text-slate-900">
                Meet Our Certified Specialists
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Experienced practitioners dedicated to patient-first care and evidence-based medicine.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenBot('Show me all doctors')}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors self-start md:self-auto"
            >
              <Calendar className="h-4 w-4 text-teal-600" />
              <span>Check Doctor Schedules</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingData && doctors.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              ))
            ) : (
              doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 font-bold text-base ring-1 ring-teal-600/20">
                          {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 3)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{doctor.name}</h3>
                          <p className="text-xs font-semibold text-teal-700">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-600/20">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{(doctor.rating ?? 4.8).toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <p className="font-medium text-slate-800">{doctor.qualifications}</p>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Award className="h-3.5 w-3.5 text-teal-600" />
                        <span>{doctor.experienceYears ?? 10} Years Clinical Experience</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-[11px] font-semibold text-slate-500">Available Days:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(doctor.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map((day) => (
                          <span
                            key={day}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpenBot(undefined, doctor)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-700 active:scale-95 transition-all"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Book with {doctor.name.split(' ')[1] || doctor.name}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. POPULAR SERVICES & PRICING */}
      <section id="services" className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              Transparent Pricing
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Procedures & Medical Services
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Clear upfront estimates with no hidden surprise fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                      {service.specialization}
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {service.priceEstimate}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900">
                    {service.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3 text-teal-600" />
                    <span>Duration: ~{service.durationMinutes} mins</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onOpenBot(undefined, undefined, service)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-teal-600 bg-teal-50/50 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-600 hover:text-white transition-all"
                  >
                    <span>Schedule this Service</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE CAREPOINT / FEATURES */}
      <section id="features" className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
              The CarePoint Difference
            </h2>
            <p className="text-3xl font-extrabold sm:text-4xl">
              Why Patients Love CarePoint
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Modern patient care designed to save time and provide effortless appointment scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700/60 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold">Zero Phone Waiting Time</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No music on hold or busy phone lines. Access the online front desk anytime, even after hours, to reserve your preferred clinical slot instantly.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700/60 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold">Real-Time Calendar Sync</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Directly connected with our doctors' live clinic schedules to show verified open slots, preventing double-bookings.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700/60 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold">Effortless Cancellation & Rescheduling</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Plans change? Simply look up your phone number in our front desk chat to reschedule or cancel with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLINIC HOURS & CONTACT */}
      <section id="hours" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Clinic Working Hours</span>
                </div>
                <p className="text-xs text-slate-600"><strong>Monday – Friday:</strong> 8:00 AM – 8:00 PM</p>
                <p className="text-xs text-slate-600"><strong>Saturday:</strong> 9:00 AM – 6:00 PM</p>
                <p className="text-xs text-slate-600"><strong>Sunday:</strong> Urgent Care On-Call</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>Location & Access</span>
                </div>
                <p className="text-xs text-slate-600">CarePoint Health Plaza, Suite 400</p>
                <p className="text-xs text-slate-600">Downtown Medical District</p>
                <p className="text-xs text-slate-600">Valet & Accessible Parking Available</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
                  <Phone className="h-4 w-4" />
                  <span>Emergency & Direct Contact</span>
                </div>
                <p className="text-xs text-slate-600">Emergency 24/7 Hotline: <strong>+1 (800) 555-CARE</strong></p>
                <p className="text-xs text-slate-600">On-Call Duty Mobile: <strong>+1 (555) 911-0199</strong></p>
                <button
                  type="button"
                  onClick={() => onOpenBot()}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
                >
                  <MessageSquareHeart className="h-3.5 w-3.5" />
                  <span>Open Online Front Desk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600 text-white">
                <Stethoscope className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-slate-800">CarePoint Medical Clinic</span>
            </div>
            <p>© {new Date().getFullYear()} CarePoint Medical Clinic. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="hover:text-slate-600">Privacy</a>
              <a href="#" className="hover:text-slate-600">Terms</a>
              <a href="#" className="hover:text-slate-600">HIPAA Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
