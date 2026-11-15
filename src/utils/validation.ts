/**
 * Runtime Zod validation schemas for inputs, passcodes, medications, and appointments.
 */
import { z } from 'zod';

export const SeniorPinSchema = z
  .string()
  .regex(/^\d{4}$/, 'Senior PIN must be exactly 4 digits');

export const CaretakerPinSchema = z
  .string()
  .regex(/^\d{6}$/, 'Caretaker PIN must be exactly 6 digits');

export const FamilyPinSchema = z
  .string()
  .regex(/^\d{6}$/, 'Family Member PIN must be exactly 6 digits');

export const PillVisualSchema = z.object({
  shape: z.enum(['ROUND', 'OVAL', 'OBLONG', 'CAPSULE', 'TRIANGLE', 'SQUARE', 'DIAMOND']),
  primaryColor: z.enum([
    'WHITE',
    'YELLOW',
    'ORANGE',
    'RED',
    'PINK',
    'PURPLE',
    'BLUE',
    'GREEN',
    'BROWN',
    'BEIGE',
    'GRAY',
  ]),
  secondaryColor: z
    .enum([
      'WHITE',
      'YELLOW',
      'ORANGE',
      'RED',
      'PINK',
      'PURPLE',
      'BLUE',
      'GREEN',
      'BROWN',
      'BEIGE',
      'GRAY',
    ])
    .optional(),
  imprint: z.string().max(20).optional(),
  form: z.enum([
    'TABLET',
    'CAPSULE',
    'LIQUID',
    'INHALER',
    'TOPICAL_CREAM',
    'PATCH',
    'DROPS',
  ]),
  score: z.enum(['NONE', 'SINGLE_SCORE', 'DOUBLE_SCORE']),
});

export const TimeSlotSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24h format HH:mm'),
  slotLabel: z.enum([
    'EARLY_MORNING',
    'MORNING',
    'NOON',
    'AFTERNOON',
    'EVENING',
    'BEDTIME',
  ]),
  doseAmount: z.string().min(1, 'Dose amount is required'),
});

export const RefillTrackingSchema = z.object({
  currentStock: z.number().int().min(0, 'Current stock must be non-negative'),
  refillThreshold: z.number().int().min(1, 'Refill threshold must be >= 1'),
  pillsPerDose: z.number().int().min(1, 'Pills per dose must be >= 1'),
  prescriptionNumber: z.string().optional(),
  prescribingDoctor: z.string().optional(),
  pharmacyName: z.string().optional(),
  pharmacyPhone: z.string().optional(),
  lastRefillDate: z.string().optional(),
});

export const MedicationInputSchema = z.object({
  name: z.string().min(2, 'Medication name must be at least 2 characters'),
  genericName: z.string().min(2, 'Generic name must be at least 2 characters'),
  dosage: z.string().min(1, 'Dosage is required (e.g., 20mg, 500mg)'),
  route: z.enum([
    'ORAL',
    'SUBLINGUAL',
    'TOPICAL',
    'INHALATION',
    'TRANSDERMAL',
    'OPHTHALMIC',
  ]),
  frequency: z.enum([
    'ONCE_DAILY',
    'TWICE_DAILY',
    'THREE_TIMES_DAILY',
    'FOUR_TIMES_DAILY',
    'EVERY_OTHER_DAY',
    'WEEKLY',
    'AS_NEEDED_PRN',
  ]),
  timeSlots: z.array(TimeSlotSchema).min(1, 'At least one time slot is required'),
  mealRelation: z.enum([
    'BEFORE_MEAL',
    'WITH_MEAL',
    'AFTER_MEAL',
    'EMPTY_STOMACH',
    'NO_RESTRICTION',
  ]),
  instructions: z.string().max(500).default(''),
  visual: PillVisualSchema,
  refillTracking: RefillTrackingSchema,
  status: z.enum(['ACTIVE', 'PAUSED', 'DISCONTINUED']).default('ACTIVE'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  acknowledgedDdiRisk: z.boolean().default(false),
  ddiOverrideNotes: z.string().optional(),
});

export const AppointmentInputSchema = z.object({
  doctorName: z.string().min(2, 'Doctor name must be at least 2 characters'),
  specialty: z.string().min(2, 'Medical specialty is required'),
  clinicName: z.string().min(2, 'Clinic or hospital name is required'),
  address: z.string().min(3, 'Clinic address is required'),
  virtualLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  phone: z.string().min(7, 'Valid phone number is required'),
  dateTime: z.string().min(1, 'Appointment date and time are required'),
  durationMinutes: z.number().int().min(10).max(240).default(30),
  reasonForVisit: z.string().min(2, 'Reason for visit is required'),
  preparationNotes: z.string().max(500).default(''),
  remind24h: z.boolean().default(true),
  remind2h: z.boolean().default(true),
});
