export const EMERGENCY_CONFIG = {
  hotlineDisplay: process.env.NEXT_PUBLIC_EMERGENCY_HOTLINE || '+1 (800) 555-CARE',
  hotlineTel: process.env.NEXT_PUBLIC_EMERGENCY_HOTLINE_TEL || '+18005552273',
  mobileDisplay: process.env.NEXT_PUBLIC_EMERGENCY_MOBILE || '+1 (555) 911-0199',
  mobileTel: process.env.NEXT_PUBLIC_EMERGENCY_MOBILE_TEL || '+15559110199',
  description: 'CarePoint 24/7 Rapid Emergency Response Desk'
};

/**
 * Detects whether a patient message describes a medical emergency or requests emergency contacts
 */
export function isEmergencyQuery(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase().trim();

  // 1. Direct emergency keywords & questions
  const emergencyKeywords = [
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
    'call doctor urgently',
    'immediate help',
    'life threatening',
    'critical condition'
  ];

  // 2. High-acuity symptoms & medical crises
  const criticalSymptoms = [
    'chest pain',
    'heart attack',
    'cardiac',
    'cannot breathe',
    'can not breathe',
    "can't breathe",
    'cant breathe',
    'trouble breathing',
    'difficulty breathing',
    'shortness of breath',
    'suffocating',
    'choking',
    'gasping for air',
    'heavy bleeding',
    'bleeding heavily',
    'bleeding profusely',
    'severe bleeding',
    'blood loss',
    'hemorrhage',
    'unconscious',
    'passed out',
    'fainted',
    'unresponsive',
    'not waking up',
    'collapsed',
    'loss of consciousness',
    'stroke',
    'facial droop',
    'slurred speech',
    'paralysis',
    'sudden numbness',
    'seizure',
    'convulsion',
    'fits',
    'poison',
    'poisoning',
    'overdose',
    'swallowed chemical',
    'severe burn',
    'head injury',
    'severe trauma',
    'car crash',
    'bad accident',
    'anaphylaxis',
    'throat closing',
    'severe allergic reaction'
  ];

  for (const kw of emergencyKeywords) {
    if (lower.includes(kw)) return true;
  }

  for (const sym of criticalSymptoms) {
    if (lower.includes(sym)) return true;
  }

  return false;
}
