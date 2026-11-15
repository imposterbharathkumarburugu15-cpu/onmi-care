/**
 * Seed data for Eleanor Vance (age 78) profile, active medications, adherence logs, and appointments.
 */
import { Medication } from '../types/medication';
import { DoctorAppointment } from '../types/appointment';
import { DoseEvent } from '../types/adherence';
import { UserRole } from '../types/auth';
import { getTodayDateString } from './dateUtils';

export interface SeniorProfile {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  bloodType: string;
  emergencyPhone: string;
  primaryPhysician: string;
  allergies: string[];
  conditions: string[];
  caretakerEmail: string;
  familyEmail: string;
  seniorEmail: string;
  address: string;
}

export const SEED_PROFILE: SeniorProfile = {
  id: 'profile-eleanor-vance-78',
  name: 'Eleanor Vance',
  age: 78,
  dateOfBirth: '1948-04-12',
  bloodType: 'O+',
  emergencyPhone: '+1-555-019-9111',
  primaryPhysician: 'Dr. Evelyn Thorne, MD (Cardiology)',
  allergies: ['Penicillin', 'Sulfa Drugs'],
  conditions: ['Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Osteoarthritis'],
  caretakerEmail: 'nurse.sarah@omnicare.org',
  familyEmail: 'robert.vance@familynet.org',
  seniorEmail: 'eleanor.vance@omnicare.org',
  address: '442 Blossom Hill Road, Apt 3B, Springfield',
};

// Default demonstration PINs for evaluation
export const DEFAULT_PINS: Record<UserRole, string> = {
  SENIOR: '1234',
  CARETAKER: '987654',
  FAMILY: '555123',
};

export const SEED_MEDICATIONS: Medication[] = [
  {
    id: 'med-lisinopril-10',
    seniorProfileId: SEED_PROFILE.id,
    name: 'Lisinopril',
    genericName: 'lisinopril',
    dosage: '10mg',
    route: 'ORAL',
    frequency: 'ONCE_DAILY',
    timeSlots: [
      {
        time: '08:00',
        slotLabel: 'MORNING',
        doseAmount: '1 tablet (10mg)',
      },
    ],
    mealRelation: 'NO_RESTRICTION',
    instructions: 'Take 1 tablet every morning with water for blood pressure.',
    visual: {
      shape: 'ROUND',
      primaryColor: 'PINK',
      imprint: 'L10',
      form: 'TABLET',
      score: 'SINGLE_SCORE',
    },
    refillTracking: {
      currentStock: 24,
      refillThreshold: 7,
      pillsPerDose: 1,
      prescriptionNumber: 'RX-884129-A',
      prescribingDoctor: 'Dr. Evelyn Thorne',
      pharmacyName: 'CVS Pharmacy #4120',
      pharmacyPhone: '+1-555-014-4120',
    },
    status: 'ACTIVE',
    startDate: '2024-01-15',
    acknowledgedDdiRisk: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'med-metformin-500',
    seniorProfileId: SEED_PROFILE.id,
    name: 'Metformin',
    genericName: 'metformin',
    dosage: '500mg',
    route: 'ORAL',
    frequency: 'TWICE_DAILY',
    timeSlots: [
      {
        time: '08:00',
        slotLabel: 'MORNING',
        doseAmount: '1 tablet (500mg)',
      },
      {
        time: '18:00',
        slotLabel: 'EVENING',
        doseAmount: '1 tablet (500mg)',
      },
    ],
    mealRelation: 'WITH_MEAL',
    instructions: 'Take with breakfast and dinner to reduce stomach upset.',
    visual: {
      shape: 'OBLONG',
      primaryColor: 'WHITE',
      imprint: 'M500',
      form: 'TABLET',
      score: 'SINGLE_SCORE',
    },
    refillTracking: {
      currentStock: 45,
      refillThreshold: 10,
      pillsPerDose: 1,
      prescriptionNumber: 'RX-991204-B',
      prescribingDoctor: 'Dr. Marcus Reed',
      pharmacyName: 'CVS Pharmacy #4120',
      pharmacyPhone: '+1-555-014-4120',
    },
    status: 'ACTIVE',
    startDate: '2023-11-01',
    acknowledgedDdiRisk: false,
    createdAt: '2023-11-01T08:00:00Z',
    updatedAt: '2023-11-01T08:00:00Z',
  },
  {
    id: 'med-amlodipine-5',
    seniorProfileId: SEED_PROFILE.id,
    name: 'Amlodipine',
    genericName: 'amlodipine',
    dosage: '5mg',
    route: 'ORAL',
    frequency: 'ONCE_DAILY',
    timeSlots: [
      {
        time: '08:00',
        slotLabel: 'MORNING',
        doseAmount: '1 tablet (5mg)',
      },
    ],
    mealRelation: 'NO_RESTRICTION',
    instructions: 'Take in the morning for cardiovascular support.',
    visual: {
      shape: 'OVAL',
      primaryColor: 'WHITE',
      imprint: 'A5',
      form: 'TABLET',
      score: 'NONE',
    },
    refillTracking: {
      currentStock: 18,
      refillThreshold: 7,
      pillsPerDose: 1,
      prescriptionNumber: 'RX-773192-C',
      prescribingDoctor: 'Dr. Evelyn Thorne',
      pharmacyName: 'Walgreens #1088',
      pharmacyPhone: '+1-555-018-1088',
    },
    status: 'ACTIVE',
    startDate: '2024-02-10',
    acknowledgedDdiRisk: false,
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-10T08:00:00Z',
  },
  {
    id: 'med-atorvastatin-20',
    seniorProfileId: SEED_PROFILE.id,
    name: 'Atorvastatin',
    genericName: 'atorvastatin',
    dosage: '20mg',
    route: 'ORAL',
    frequency: 'ONCE_DAILY',
    timeSlots: [
      {
        time: '20:00',
        slotLabel: 'BEDTIME',
        doseAmount: '1 tablet (20mg)',
      },
    ],
    mealRelation: 'NO_RESTRICTION',
    instructions: 'Take before sleep at bedtime for lipid management.',
    visual: {
      shape: 'OVAL',
      primaryColor: 'WHITE',
      imprint: 'AT20',
      form: 'TABLET',
      score: 'NONE',
    },
    refillTracking: {
      currentStock: 30,
      refillThreshold: 5,
      pillsPerDose: 1,
      prescriptionNumber: 'RX-661208-D',
      prescribingDoctor: 'Dr. Evelyn Thorne',
      pharmacyName: 'CVS Pharmacy #4120',
      pharmacyPhone: '+1-555-014-4120',
    },
    status: 'ACTIVE',
    startDate: '2023-08-15',
    acknowledgedDdiRisk: false,
    createdAt: '2023-08-15T08:00:00Z',
    updatedAt: '2023-08-15T08:00:00Z',
  },
  {
    id: 'med-omeprazole-20',
    seniorProfileId: SEED_PROFILE.id,
    name: 'Omeprazole',
    genericName: 'omeprazole',
    dosage: '20mg',
    route: 'ORAL',
    frequency: 'ONCE_DAILY',
    timeSlots: [
      {
        time: '07:30',
        slotLabel: 'EARLY_MORNING',
        doseAmount: '1 capsule (20mg)',
      },
    ],
    mealRelation: 'EMPTY_STOMACH',
    instructions: 'Take 30 minutes before first meal of the day.',
    visual: {
      shape: 'CAPSULE',
      primaryColor: 'PURPLE',
      imprint: 'OM20',
      form: 'CAPSULE',
      score: 'NONE',
    },
    refillTracking: {
      currentStock: 22,
      refillThreshold: 6,
      pillsPerDose: 1,
      prescriptionNumber: 'RX-554199-E',
      prescribingDoctor: 'Dr. Marcus Reed',
      pharmacyName: 'Walgreens #1088',
      pharmacyPhone: '+1-555-018-1088',
    },
    status: 'ACTIVE',
    startDate: '2024-03-01',
    acknowledgedDdiRisk: false,
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-01T08:00:00Z',
  },
];

export const SEED_APPOINTMENTS: DoctorAppointment[] = [
  {
    id: 'appt-cardio-thorne',
    seniorProfileId: SEED_PROFILE.id,
    doctorName: 'Dr. Evelyn Thorne, MD',
    specialty: 'Cardiology & Preventive Heart Health',
    clinicName: 'St. Jude Medical Pavilion, Suite 402',
    address: '740 St. Jude Parkway, Springfield',
    virtualLink: 'https://telehealth.stjudemedical.org/visit/thorne-vance',
    phone: '+1-555-019-4402',
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    durationMinutes: 45,
    reasonForVisit: '6-Month Comprehensive Blood Pressure & ECG Evaluation',
    preparationNotes: 'Bring home blood pressure log book. Fasting not required.',
    status: 'SCHEDULED',
    remind24h: true,
    remind2h: true,
    notified24h: false,
    notified2h: false,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
  },
  {
    id: 'appt-endo-reed',
    seniorProfileId: SEED_PROFILE.id,
    doctorName: 'Dr. Marcus Reed, MD',
    specialty: 'Endocrinology & Diabetes Care',
    clinicName: 'Metro Health Endocrinology Center',
    address: '1200 Central Ave, Bldg B, Springfield',
    virtualLink: 'https://metrohealth.org/telehealth/reed-dr',
    phone: '+1-555-019-3310',
    dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    durationMinutes: 30,
    reasonForVisit: 'Quarterly HbA1c Lab Review & Medication Adjustment',
    preparationNotes: 'Complete blood draw at lab 2 days prior to consultation.',
    status: 'SCHEDULED',
    remind24h: true,
    remind2h: true,
    notified24h: false,
    notified2h: false,
    createdAt: '2024-11-05T14:30:00Z',
    updatedAt: '2024-11-05T14:30:00Z',
  },
];

/**
 * Generates realistic adherence history for Eleanor across the past 7 days plus today.
 */
export function generateSeedDoseEvents(): DoseEvent[] {
  const events: DoseEvent[] = [];
  const today = getTodayDateString();
  const todayDate = new Date(today + 'T00:00:00');

  // Past 7 days: all taken on time, except day -3 had 1 permitted skip for fasting
  for (let i = 7; i >= 1; i--) {
    const d = new Date(todayDate.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];

    for (const med of SEED_MEDICATIONS) {
      for (const slot of med.timeSlots) {
        const isFastingSkip = i === 3 && med.name === 'Metformin' && slot.time === '08:00';
        events.push({
          id: `dose-${dateStr}-${med.id}-${slot.time}`,
          medicationId: med.id,
          medicationName: med.name,
          dosage: med.dosage,
          scheduledTime: `${dateStr}T${slot.time}:00`,
          scheduledDate: dateStr,
          timeSlot: slot.time,
          status: isFastingSkip ? 'SKIPPED' : 'TAKEN',
          loggedAt: isFastingSkip ? `${dateStr}T08:05:00Z` : `${dateStr}T${slot.time}:20Z`,
          takenBy: 'SENIOR',
          skipReason: isFastingSkip ? 'FASTING_OR_LABS' : undefined,
          skipNotes: isFastingSkip ? 'Held morning dose per physician instructions for fasting blood draw' : undefined,
          visual: med.visual,
        });
      }
    }
  }

  // Today's doses:
  // 07:30 Omeprazole -> TAKEN
  // 08:00 Lisinopril, Metformin, Amlodipine -> TAKEN
  // 18:00 Metformin -> DUE / SCHEDULED
  // 20:00 Atorvastatin -> SCHEDULED
  for (const med of SEED_MEDICATIONS) {
    for (const slot of med.timeSlots) {
      const isMorning = slot.time <= '08:00';
      events.push({
        id: `dose-${today}-${med.id}-${slot.time}`,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        scheduledTime: `${today}T${slot.time}:00`,
        scheduledDate: today,
        timeSlot: slot.time,
        status: isMorning ? 'TAKEN' : 'SCHEDULED',
        loggedAt: isMorning ? `${today}T${slot.time}:15Z` : undefined,
        takenBy: isMorning ? 'SENIOR' : undefined,
        visual: med.visual,
      });
    }
  }

  return events;
}
