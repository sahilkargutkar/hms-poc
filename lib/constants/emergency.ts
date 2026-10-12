export const EMERGENCY_CONFIG = {
  hotlineDisplay: process.env.NEXT_PUBLIC_EMERGENCY_HOTLINE || '+1 (800) 555-CARE',
  hotlineTel: process.env.NEXT_PUBLIC_EMERGENCY_HOTLINE_TEL || '+18005552273',
  mobileDisplay: process.env.NEXT_PUBLIC_EMERGENCY_MOBILE || '+1 (555) 911-0199',
  mobileTel: process.env.NEXT_PUBLIC_EMERGENCY_MOBILE_TEL || '+15559110199',
  description: 'CarePoint 24/7 Rapid Emergency Response Desk'
};

/**
 * Standardized Emergency Categories & Test Keywords Dictionary
 */
export const EMERGENCY_CATEGORIES: Record<string, string[]> = {
  Heart: [
    'chest pain',
    'chest pressure',
    'tightness in chest',
    'crushing chest pain',
    'heart attack',
    'pain in left arm',
    'pain spreading to jaw',
    'sudden chest discomfort',
    'heavy chest'
  ],
  Breathing: [
    "can't breathe",
    'cannot breathe',
    'difficulty breathing',
    'shortness of breath',
    'gasping for air',
    'choking',
    'suffocating',
    'lips turning blue',
    'severe wheezing'
  ],
  Stroke: [
    'face drooping',
    'one side weak',
    'sudden arm weakness',
    'slurred speech',
    "can't speak suddenly",
    'sudden confusion',
    'sudden vision loss',
    'sudden loss of balance'
  ],
  Collapse: [
    'unconscious',
    'not responding',
    "passed out and won't wake up",
    'collapsed',
    'not waking up',
    'unresponsive',
    'suddenly collapsed',
    'stopped breathing'
  ],
  'Major injury': [
    'heavy bleeding',
    "bleeding won't stop",
    'blood spurting',
    'major accident',
    'severe injury',
    'deep wound',
    'head injury and unconscious',
    'serious road accident'
  ],
  Allergy: [
    'throat swelling',
    'tongue swelling',
    'face swelling with breathing difficulty',
    'anaphylaxis',
    'severe allergic reaction',
    "can't swallow and breathe",
    'allergic reaction and fainting'
  ],
  Seizure: [
    'seizure',
    'convulsions',
    'fits',
    'continuous shaking',
    'first seizure',
    "seizure won't stop",
    'repeated seizures without waking up'
  ]
};

/**
 * General Emergency Inquiries
 */
export const GENERAL_EMERGENCY_KEYWORDS = [
  'emergency',
  'urgent care hotline',
  'emergency contact',
  'emergency number',
  'hotline number',
  'emergency hotline',
  'mobile number for emergency',
  'ambulance',
  'call ambulance',
  'call 911',
  'call 112',
  'call doctor urgently',
  'immediate help',
  'life threatening',
  'critical condition'
];

export interface EmergencyMatchResult {
  isEmergency: boolean;
  matchedCategories: string[];
  matchedKeywords: string[];
}

/**
 * Evaluates whether text matches any of the official emergency categories or general keywords
 */
export function matchEmergencyCategories(text: string): EmergencyMatchResult {
  if (!text) {
    return { isEmergency: false, matchedCategories: [], matchedKeywords: [] };
  }

  const lower = text.toLowerCase().trim();
  const matchedCategories: string[] = [];
  const matchedKeywords: string[] = [];

  for (const [category, keywords] of Object.entries(EMERGENCY_CATEGORIES)) {
    let categoryMatched = false;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
        categoryMatched = true;
      }
    }
    if (categoryMatched) {
      matchedCategories.push(category);
    }
  }

  // Also check general emergency intent keywords
  for (const kw of GENERAL_EMERGENCY_KEYWORDS) {
    if (lower.includes(kw)) {
      matchedKeywords.push(kw);
      if (!matchedCategories.includes('General Emergency')) {
        matchedCategories.push('General Emergency');
      }
    }
  }

  return {
    isEmergency: matchedCategories.length > 0 || matchedKeywords.length > 0,
    matchedCategories,
    matchedKeywords
  };
}

/**
 * Boolean check for emergency queries
 */
export function isEmergencyQuery(text: string): boolean {
  return matchEmergencyCategories(text).isEmergency;
}
