/**
 * Medication and Pill Visual domain models for OmniCare.
 */

export type PillShape =
  | 'ROUND'
  | 'OVAL'
  | 'OBLONG'
  | 'CAPSULE'
  | 'TRIANGLE'
  | 'SQUARE'
  | 'DIAMOND';

export type PillColor =
  | 'WHITE'
  | 'YELLOW'
  | 'ORANGE'
  | 'RED'
  | 'PINK'
  | 'PURPLE'
  | 'BLUE'
  | 'GREEN'
  | 'BROWN'
  | 'BEIGE'
  | 'GRAY';

export type PillForm =
  | 'TABLET'
  | 'CAPSULE'
  | 'LIQUID'
  | 'INHALER'
  | 'TOPICAL_CREAM'
  | 'PATCH'
  | 'DROPS';

export type PillScore = 'NONE' | 'SINGLE_SCORE' | 'DOUBLE_SCORE';

export interface PillVisual {
  shape: PillShape;
  primaryColor: PillColor;
  secondaryColor?: PillColor;
  imprint?: string;
  form: PillForm;
  score: PillScore;
}

export type RouteOfAdministration =
  | 'ORAL'
  | 'SUBLINGUAL'
  | 'TOPICAL'
  | 'INHALATION'
  | 'TRANSDERMAL'
  | 'OPHTHALMIC';

export type MedicationFrequency =
  | 'ONCE_DAILY'
  | 'TWICE_DAILY'
  | 'THREE_TIMES_DAILY'
  | 'FOUR_TIMES_DAILY'
  | 'EVERY_OTHER_DAY'
  | 'WEEKLY'
  | 'AS_NEEDED_PRN';

export type TimeSlotLabel =
  | 'EARLY_MORNING'
  | 'MORNING'
  | 'NOON'
  | 'AFTERNOON'
  | 'EVENING'
  | 'BEDTIME';

export interface TimeSlot {
  time: string; // "08:00" (24h HH:mm)
  slotLabel: TimeSlotLabel;
  doseAmount: string; // e.g., "1 pill", "20mg"
}

export type MealRelation =
  | 'BEFORE_MEAL'
  | 'WITH_MEAL'
  | 'AFTER_MEAL'
  | 'EMPTY_STOMACH'
  | 'NO_RESTRICTION';

export interface RefillTracking {
  currentStock: number;
  refillThreshold: number;
  pillsPerDose: number;
  prescriptionNumber?: string;
  prescribingDoctor?: string;
  pharmacyName?: string;
  pharmacyPhone?: string;
  lastRefillDate?: string;
}

export type MedicationStatus = 'ACTIVE' | 'PAUSED' | 'DISCONTINUED';

export interface Medication {
  id: string;
  seniorProfileId: string;
  name: string;
  genericName: string;
  dosage: string;
  route: RouteOfAdministration;
  frequency: MedicationFrequency;
  timeSlots: TimeSlot[];
  mealRelation: MealRelation;
  instructions: string;
  visual: PillVisual;
  refillTracking: RefillTracking;
  status: MedicationStatus;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  acknowledgedDdiRisk: boolean;
  ddiOverrideNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DDISeverity = 'CONTRAINDICATED' | 'MAJOR' | 'MODERATE' | 'MINOR';

export interface DDIConflict {
  drugA: string;
  drugB: string;
  severity: DDISeverity;
  mechanism: string;
  clinicalRisk: string;
  recommendation: string;
}
