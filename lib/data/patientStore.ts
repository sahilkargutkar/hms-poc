// Safely acquire Node.js internal modules only on server runtime
function getNodeModule(moduleName: string): any {
  if (typeof window !== 'undefined') return null;
  try {
    const req = (globalThis as Record<string, any>).__non_webpack_require__ || eval('require');
    return req(moduleName);
  } catch {
    return null;
  }
}

export interface StoredAppointmentRecord {
  id: string;
  patientPhone: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  serviceId?: string;
  serviceName?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  createdAt?: string;
}

interface PatientStoreData {
  patientCache: Record<string, string>; // phone -> patientId
  bookedAppointments: StoredAppointmentRecord[];
}

// Pre-seeded known live Azure records
const INITIAL_STORE_DATA: PatientStoreData = {
  patientCache: {
    '+919876543210': '6ac889e3333ff75177183283',
    '9876543210': '6ac889e3333ff75177183283',
    '+919812520986': '6ad9b87c1d4dfb65d5b2cc30',
    '9812520986': '6ad9b87c1d4dfb65d5b2cc30',
    '+919820123456': '6ad9b9331d4dfb65d5b2cc34',
    '9820123456': '6ad9b9331d4dfb65d5b2cc34'
  },
  bookedAppointments: [
    {
      id: '6ac889ec333ff75177183284',
      patientPhone: '+919876543210',
      patientName: 'John Doe',
      doctorId: '6ac747007905d54b1a59b650',
      doctorName: 'Dr. Rajesh Sharma',
      specialization: 'Dentist',
      serviceId: 'srv_6ac747007905d54b1a59b650_1',
      serviceName: 'Comprehensive Dental Examination',
      startTime: '2026-10-10T10:00:00+00:00',
      status: 'CONFIRMED'
    }
  ]
};

class PatientStore {
  private data: PatientStoreData;
  private filePath: string = '';

  constructor() {
    this.data = { ...INITIAL_STORE_DATA };
    try {
      const pathMod = getNodeModule('path');
      if (pathMod && typeof process !== 'undefined' && process.cwd) {
        this.filePath = pathMod.join(process.cwd(), '.data', 'patient-store.json');
      }
    } catch {
      this.filePath = '';
    }
    this.load();
  }

  private load(): void {
    try {
      const fsMod = getNodeModule('fs');
      if (fsMod && this.filePath && fsMod.existsSync(this.filePath)) {
        const raw = fsMod.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          patientCache: { ...INITIAL_STORE_DATA.patientCache, ...(parsed.patientCache || {}) },
          bookedAppointments: Array.isArray(parsed.bookedAppointments)
            ? parsed.bookedAppointments
            : INITIAL_STORE_DATA.bookedAppointments
        };
      }
    } catch (e) {
      console.warn('Could not read persistent patient store from disk, using memory state:', e);
    }
  }

  private save(): void {
    try {
      const fsMod = getNodeModule('fs');
      const pathMod = getNodeModule('path');
      if (fsMod && pathMod && this.filePath) {
        const dir = pathMod.dirname(this.filePath);
        if (!fsMod.existsSync(dir)) {
          fsMod.mkdirSync(dir, { recursive: true });
        }
        fsMod.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn('Could not write persistent patient store to disk:', e);
    }
  }

  public getPatientId(phone: string): string | null {
    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`;

    return (
      this.data.patientCache[formatted] ||
      this.data.patientCache[cleaned] ||
      this.data.patientCache[phone] ||
      null
    );
  }

  public setPatientId(phone: string, patientId: string): void {
    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`;

    this.data.patientCache[formatted] = patientId;
    this.data.patientCache[cleaned] = patientId;
    this.data.patientCache[phone] = patientId;
    this.save();
  }

  public addBookedAppointment(record: StoredAppointmentRecord): void {
    // Prevent duplicate entries
    this.data.bookedAppointments = this.data.bookedAppointments.filter(
      (b) => b.id !== record.id
    );
    this.data.bookedAppointments.unshift(record);
    this.save();
  }

  public getBookedAppointments(phone?: string): StoredAppointmentRecord[] {
    if (!phone) return [...this.data.bookedAppointments];

    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`;

    return this.data.bookedAppointments.filter((b) => {
      const bCleaned = b.patientPhone.replace(/\D/g, '');
      return (
        b.patientPhone === formatted ||
        b.patientPhone === cleaned ||
        b.patientPhone === phone ||
        (cleaned.length >= 10 && bCleaned.includes(cleaned.slice(-10)))
      );
    });
  }

  public removeBookedAppointment(id: string): void {
    this.data.bookedAppointments = this.data.bookedAppointments.filter(
      (b) => b.id !== id
    );
    this.save();
  }

  public markAppointmentCancelled(id: string): void {
    const appt = this.data.bookedAppointments.find((b) => b.id === id);
    if (appt) {
      appt.status = 'CANCELLED';
      this.save();
    }
  }

  public getAllCachedPatientIds(): Record<string, string> {
    return { ...this.data.patientCache };
  }
}

export const patientStore = new PatientStore();
