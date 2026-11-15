import { describe, it, expect } from 'vitest';
import {
  SeniorPinSchema,
  CaretakerPinSchema,
  FamilyPinSchema,
  MedicationInputSchema,
  AppointmentInputSchema,
  PillVisualSchema,
} from '../utils/validation';

describe('Zod Input Validation & Boundary Schemas', () => {
  describe('Passcode Schemas', () => {
    it('validates senior 4-digit numeric PIN', () => {
      expect(SeniorPinSchema.safeParse('1234').success).toBe(true);
      expect(SeniorPinSchema.safeParse('0000').success).toBe(true);
      expect(SeniorPinSchema.safeParse('9999').success).toBe(true);

      // Invalid inputs
      expect(SeniorPinSchema.safeParse('123').success).toBe(false);
      expect(SeniorPinSchema.safeParse('12345').success).toBe(false);
      expect(SeniorPinSchema.safeParse('abcd').success).toBe(false);
      expect(SeniorPinSchema.safeParse('12a4').success).toBe(false);
    });

    it('validates caretaker 6-digit numeric PIN', () => {
      expect(CaretakerPinSchema.safeParse('987654').success).toBe(true);
      expect(CaretakerPinSchema.safeParse('123456').success).toBe(true);

      // 4-digit fails caretaker schema
      expect(CaretakerPinSchema.safeParse('1234').success).toBe(false);
      expect(CaretakerPinSchema.safeParse('abcdef').success).toBe(false);
    });

    it('validates family member 6-digit numeric PIN', () => {
      expect(FamilyPinSchema.safeParse('555123').success).toBe(true);
      expect(FamilyPinSchema.safeParse('1234').success).toBe(false);
    });
  });

  describe('Pill Visual Schema', () => {
    it('validates correct pill visual attributes', () => {
      const validVisual = {
        shape: 'ROUND' as const,
        primaryColor: 'PINK' as const,
        imprint: 'L10',
        form: 'TABLET' as const,
        score: 'SINGLE_SCORE' as const,
      };

      const result = PillVisualSchema.safeParse(validVisual);
      expect(result.success).toBe(true);
    });

    it('rejects invalid shape or color enums', () => {
      const invalidShape = {
        shape: 'HEXAGON_INVALID',
        primaryColor: 'PINK',
        form: 'TABLET',
        score: 'NONE',
      };
      expect(PillVisualSchema.safeParse(invalidShape).success).toBe(false);
    });
  });

  describe('Medication Input Schema', () => {
    it('validates comprehensive medication entity', () => {
      const validMed = {
        name: 'Lisinopril',
        genericName: 'lisinopril',
        dosage: '10mg',
        route: 'ORAL',
        frequency: 'ONCE_DAILY',
        timeSlots: [
          {
            time: '08:00',
            slotLabel: 'MORNING',
            doseAmount: '1 tablet',
          },
        ],
        mealRelation: 'NO_RESTRICTION',
        instructions: 'Take in morning',
        visual: {
          shape: 'ROUND',
          primaryColor: 'PINK',
          imprint: 'L10',
          form: 'TABLET',
          score: 'SINGLE_SCORE',
        },
        refillTracking: {
          currentStock: 30,
          refillThreshold: 7,
          pillsPerDose: 1,
        },
        status: 'ACTIVE',
        startDate: '2026-11-15',
        acknowledgedDdiRisk: false,
      };

      const result = MedicationInputSchema.safeParse(validMed);
      expect(result.success).toBe(true);
    });

    it('rejects negative stock counts', () => {
      const invalidStock = {
        name: 'Lisinopril',
        genericName: 'lisinopril',
        dosage: '10mg',
        route: 'ORAL',
        frequency: 'ONCE_DAILY',
        timeSlots: [{ time: '08:00', slotLabel: 'MORNING', doseAmount: '1 pill' }],
        mealRelation: 'NO_RESTRICTION',
        instructions: '',
        visual: { shape: 'ROUND', primaryColor: 'WHITE', form: 'TABLET', score: 'NONE' },
        refillTracking: { currentStock: -5, refillThreshold: 7, pillsPerDose: 1 },
        status: 'ACTIVE',
        startDate: '2026-11-15',
      };

      const result = MedicationInputSchema.safeParse(invalidStock);
      expect(result.success).toBe(false);
    });
  });

  describe('Doctor Appointment Schema', () => {
    it('validates complete appointment input', () => {
      const validAppt = {
        doctorName: 'Dr. Evelyn Thorne',
        specialty: 'Cardiology',
        clinicName: 'St. Jude Medical Pavilion',
        address: '740 St. Jude Parkway',
        phone: '+1-555-019-4402',
        dateTime: '2026-11-20T10:00:00.000Z',
        durationMinutes: 45,
        reasonForVisit: 'Blood pressure checkup',
        preparationNotes: 'Bring home log',
        remind24h: true,
        remind2h: true,
      };

      const result = AppointmentInputSchema.safeParse(validAppt);
      expect(result.success).toBe(true);
    });

    it('rejects invalid virtual URLs', () => {
      const invalidUrlAppt = {
        doctorName: 'Dr. Evelyn Thorne',
        specialty: 'Cardiology',
        clinicName: 'St. Jude Pavilion',
        address: 'Main St',
        phone: '+1-555-019-4402',
        dateTime: '2026-11-20T10:00:00.000Z',
        virtualLink: 'not-a-valid-url',
        reasonForVisit: 'Checkup',
      };

      const result = AppointmentInputSchema.safeParse(invalidUrlAppt);
      expect(result.success).toBe(false);
    });
  });
});
