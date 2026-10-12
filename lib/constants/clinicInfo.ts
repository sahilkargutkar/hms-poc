export const CLINIC_INFO_FALLBACK_MESSAGE =
  'You are looking for information is not available currently but our Operations team will get back with relevant information.';

export interface ClinicInfoTopic {
  id: string;
  title: string;
  keywords: string[];
  content: string;
}

export const CLINIC_INFO_TOPICS: Record<string, ClinicInfoTopic> = {
  timings: {
    id: 'timings',
    title: 'Clinic Timings & Working Hours',
    keywords: [
      'timing',
      'timings',
      'working hour',
      'working hours',
      'opening hour',
      'opening hours',
      'hours',
      'when are you open',
      'what time do you open',
      'closing time',
      'schedule hours'
    ],
    content: `🕒 **CarePoint Clinic Working Hours & Timings**\n\n• **Monday – Friday:** 8:00 AM – 8:00 PM\n• **Saturday:** 9:00 AM – 6:00 PM\n• **Sunday:** Urgent Care On-Call (10:00 AM – 2:00 PM)\n• **Emergency Care:** 24/7 hotline and duty mobile line active 365 days a year.\n\n*Walk-ins are welcomed for urgent triage; appointment bookings recommended for specialist consultations.*`
  },

  address: {
    id: 'address',
    title: 'Address & Directions',
    keywords: [
      'address',
      'location',
      'directions',
      'how to reach',
      'where are you located',
      'where is the clinic',
      'metro',
      'subway',
      'bus',
      'landmark',
      'google map',
      'map'
    ],
    content: `📍 **CarePoint Clinic Address & Directions**\n\n**Address:**\nCarePoint Health Plaza, Suite 400\nDowntown Medical District, Metro City\n\n**Transit & Directions:**\n• **Metro/Subway:** 2-minute walk from **Central Medical Station** (Blue Line, Exit 3).\n• **By Car:** Easy access via 5th Avenue Medical Boulevard; patient drop-off bay at the Main Entrance.\n• **Landmark:** Directly opposite the Civic Botanical Center.\n\n[Open Clinic Directions in Google Maps](https://maps.google.com/?q=CarePoint+Medical+Clinic)`
  },

  parking: {
    id: 'parking',
    title: 'Parking Facilities',
    keywords: [
      'parking',
      'park',
      'valet',
      'car park',
      'garage',
      'parking space',
      'parking fee',
      'ev charging'
    ],
    content: `🚗 **Parking Facilities & Accessibility**\n\n• **Free Patient Parking:** 2-level secure underground facility (levels P1 & P2) with 150+ reserved bays.\n• **Complimentary Valet:** Available at the Main Clinic Entrance (Monday – Saturday, 8 AM – 7 PM).\n• **Accessible Parking:** Dedicated wheelchair-accessible bays situated directly adjacent to elevator lobbies.\n• **EV Charging:** 6 fast EV charging stations on level P1.`
  },

  doctors: {
    id: 'doctors',
    title: 'Doctors & Specialities',
    keywords: [
      'doctors',
      'doctor',
      'specialities',
      'specialties',
      'specialist',
      'specialists',
      'departments',
      'what doctors',
      'physicians'
    ],
    content: `👨‍⚕️ **Doctors & Medical Specialities**\n\nCarePoint Clinic features certified specialists across 7 departments:\n\n• **Dentistry:** Dr. Rajesh Sharma (BDS, MDS) – Orthodontics & Cosmetic Smiles\n• **General Medicine:** Dr. Ananya Patel (MBBS, MD) – Primary & Preventive Care\n• **Dermatology:** Dr. Priya Nair (MD) – Skin, Hair & Aesthetic Dermatology\n• **Cardiology:** Dr. Vikram Malhotra (MD, DM) – Cardiovascular Wellness & ECG\n• **Pediatrics:** Dr. Sarah Jenkins (MBBS, DNB) – Child Care & Growth Milestones\n• **Ophthalmology:** Dr. David Chen (MS) – Vision Care & Refractive Screening\n• **Gynaecology:** Dr. Meera Reddy (MBBS, MS) – Women's Reproductive Wellness\n\n*Would you like to check available slots with any of our specialists?*`
  },

  fees: {
    id: 'fees',
    title: 'Consultation Fees & Pricing',
    keywords: [
      'fees',
      'fee',
      'cost',
      'costs',
      'price',
      'prices',
      'pricing',
      'charges',
      'how much',
      'consultation fee',
      'consultation charges',
      'doctor fee'
    ],
    content: `💳 **Consultation Fees & Transparent Pricing**\n\nStandard initial consultation fees:\n\n• **General Physician Visit:** $50\n• **Dentistry Consultation:** $60 *(Teeth Cleaning & Polish: $90)*\n• **Dermatology Consultation:** $75 *(Mole & Aesthetic Evaluation: $120)*\n• **Pediatric Wellness Visit:** $65\n• **Eye & Vision Examination:** $70\n• **Gynaecology Consultation:** $80\n• **Cardiology Consultation & ECG:** $110\n\n*Payment methods: We accept major health insurance (cashless network), credit/debit cards, and contactless payments.*`
  },

  services: {
    id: 'services',
    title: 'Clinical Services',
    keywords: [
      'services',
      'service',
      'treatments',
      'treatment',
      'procedures',
      'procedure',
      'what do you offer',
      'facilities',
      'lab tests',
      'checkups'
    ],
    content: `🩺 **Comprehensive Clinical Services**\n\n• **Preventive & Wellness Care:** Full-body routine checkups, blood work, cardiovascular profiling.\n• **Dental Care:** Oral prophylaxis, cosmetic veneers, digital radiography & endodontics.\n• **Dermatology:** Clinical acne care, allergy patch tests, dermoscopic skin checks.\n• **Heart Health:** Resting ECG, 24-hr Holter monitoring, arterial hypertension management.\n• **Pediatrics:** Childhood vaccination packages, developmental screening, pediatric triage.\n• **On-Site Diagnostics & Pharmacy:** Rapid blood sampling laboratory and prescription dispensary.`
  },

  holidays: {
    id: 'holidays',
    title: 'Clinic Holidays Calendar',
    keywords: [
      'holidays',
      'holiday',
      'closed days',
      'annual holiday',
      'clinic holidays',
      'vacation',
      'festival',
      'thanksgiving',
      'christmas',
      'new year'
    ],
    content: `📅 **CarePoint Clinic Annual Holiday Calendar**\n\nOur outpatient offices observe the following clinic holidays:\n\n• **New Year's Day:** January 1\n• **Memorial Day:** Last Monday of May\n• **Independence Day:** July 4\n• **Labor Day:** First Monday of September\n• **Thanksgiving Day:** Fourth Thursday of November\n• **Christmas Day:** December 25\n\n*Emergency Notice: Our 24/7 Emergency Triage Hotline (+1 800-555-CARE) and On-Call Emergency Mobile (+1 555-911-0199) remain operational 24 hours a day on all public holidays.*`
  }
};

/**
 * Evaluates whether user query is asking for clinic information / FAQ.
 * If matches one of the 7 provisioned topics, returns detailed information.
 * If user asks for clinic information/FAQ and info is not available, returns the required standard message.
 */
export function matchClinicInfoOrFaq(input: string): {
  isMatch: boolean;
  content: string;
  topicId?: string;
  isUnavailable?: boolean;
} {
  const text = input.trim();
  const lower = text.toLowerCase();

  // Check 7 provisioned topics first
  for (const [key, topic] of Object.entries(CLINIC_INFO_TOPICS)) {
    for (const kw of topic.keywords) {
      // Word boundary or substring match
      if (lower.includes(kw)) {
        return {
          isMatch: true,
          content: topic.content,
          topicId: key,
          isUnavailable: false
        };
      }
    }
  }

  // Check general FAQ or Clinic information queries where specific info is not available
  const generalFaqKeywords = [
    'faq',
    'faqs',
    'clinic information',
    'clinic info',
    'about the clinic',
    'about clinic',
    'wifi',
    'wi-fi',
    'cafeteria',
    'canteen',
    'food',
    'wheelchair rental',
    'pet',
    'pets',
    'smoking',
    'hotel nearby',
    'stay nearby',
    'ceo',
    'owner',
    'equipment brand',
    'accreditation details',
    'policy on',
    'refund policy'
  ];

  for (const kw of generalFaqKeywords) {
    if (lower.includes(kw)) {
      return {
        isMatch: true,
        content: CLINIC_INFO_FALLBACK_MESSAGE,
        isUnavailable: true
      };
    }
  }

  return {
    isMatch: false,
    content: '',
    isUnavailable: false
  };
}
