/**
 * Dose Lifecycle and Adherence Metrics types.
 */
import { UserRole } from './auth';
import { PillVisual } from './medication';

export type DoseStatus =
  | 'SCHEDULED'
  | 'REMINDED'
  | 'DUE'
  | 'TAKEN'
  | 'SKIPPED'
  | 'MISSED';

export type SkipReason =
  | 'PHYSICIAN_INSTRUCTED'
  | 'FASTING_OR_LABS'
  | 'EXPERIENCING_SIDE_EFFECTS'
  | 'NAUSEA_OR_VOMITING'
  | 'MEDICATION_OUT_OF_STOCK'
  | 'FORGOT_MEDICATION_AWAY'
  | 'PATIENT_REFUSED'
  | 'OTHER';

export interface DoseEvent {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // ISO string or "YYYY-MM-DDTHH:mm:ss"
  scheduledDate: string; // YYYY-MM-DD
  timeSlot: string; // "08:00"
  status: DoseStatus;
  loggedAt?: string;
  takenBy?: UserRole;
  skipReason?: SkipReason;
  skipNotes?: string;
  takenEarly?: boolean;
  takenLate?: boolean;
  visual?: PillVisual;
  escalationDispatched?: boolean;
}

export interface AdherenceStats {
  percentage: number;
  currentStreak: number;
  bestStreak: number;
  totalScheduled: number;
  totalTaken: number;
  totalSkipped: number;
  totalMissed: number;
}
