import { describe, it, expect } from 'vitest';
import {
  exportToFHIRPatient,
  exportToFHIRMedicationStatement,
  exportToFHIRObservation,
  exportFullFHIRBundle,
} from '../services/fhirService';
import { SeniorProfile } from '../utils/seedData';
import { Medication } from '../types/medication';
import { AdherenceStats } from '../types/adherence';

describe('HL7 / FHIR R4 Interoperability Service', () => {
  const mockProfile: SeniorProfile = {
    id: 'senior-001',
    name: 'Eleanor Vance',
    age: 78,
    dateOfBirth: '1948-04-12',
    bloodType: 'O+',
    emergencyPhone: '+1-555-019-9111',
    primaryPhysician: 'Dr. Sarah Jenkins, MD',
    allergies: ['Penicillin'],
    conditions: ['Hypertension'],
    caretakerEmail: 'nurse.sarah@omnicare.org',
    familyEmail: 'robert.vance@familynet.org',
    seniorEmail: 'eleanor.vance@omnicare.org',
    address: '142 Elmwood Terrace, Boston, MA',
  };

  const mockMedication: Medication = {
    id: 'med-warfarin-01',
    seniorProfileId: 'senior-001',
    name: 'Warfarin',
    genericName: 'Warfarin Sodium',
    dosage: '5mg',
    route: 'ORAL',
    frequency: 'ONCE_DAILY',
    timeSlots: [{ time: '18:00', slotLabel: 'EVENING', doseAmount: '1 tablet' }],
    visual: {
      shape: 'ROUND',
      primaryColor: 'RED',
      imprint: 'W5',
      form: 'TABLET',
      score: 'SINGLE_SCORE',
    },
    mealRelation: 'BEFORE_MEAL',
    refillTracking: {
      currentStock: 22,
      refillThreshold: 5,
      pillsPerDose: 1,
    },
    status: 'ACTIVE',
    startDate: '2026-11-01',
    acknowledgedDdiRisk: false,
    instructions: 'Take in the evening with water',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  };

  const mockStats: AdherenceStats = {
    percentage: 96,
    currentStreak: 14,
    bestStreak: 21,
    totalScheduled: 28,
    totalTaken: 27,
    totalSkipped: 0,
    totalMissed: 1,
  };

  it('transforms senior profile into valid FHIR R4 Patient resource', () => {
    const fhirPatient = exportToFHIRPatient(mockProfile);

    expect(fhirPatient.resourceType).toBe('Patient');
    expect(fhirPatient.id).toBe('senior-001');
    expect(fhirPatient.active).toBe(true);
    expect(Array.isArray(fhirPatient.name)).toBe(true);

    const name = (fhirPatient.name as Array<{ family: string; given: string[] }>)[0];
    expect(name.family).toBe('Vance');
    expect(name.given).toContain('Eleanor');
  });

  it('transforms medication into valid FHIR R4 MedicationStatement resource', () => {
    const fhirMed = exportToFHIRMedicationStatement(mockMedication, mockProfile.id);

    expect(fhirMed.resourceType).toBe('MedicationStatement');
    expect(fhirMed.id).toBe('med-med-warfarin-01');
    expect(fhirMed.status).toBe('active');
    expect((fhirMed.subject as { reference: string }).reference).toBe('Patient/senior-001');
  });

  it('transforms adherence stats into valid FHIR R4 Observation resource', () => {
    const fhirObs = exportToFHIRObservation(mockStats, mockProfile.id);

    expect(fhirObs.resourceType).toBe('Observation');
    expect(fhirObs.status).toBe('final');
    expect((fhirObs.valueQuantity as { value: number; unit: string }).value).toBe(96);
    expect((fhirObs.valueQuantity as { value: number; unit: string }).unit).toBe('%');
  });

  it('generates a complete valid FHIR Bundle of type collection', () => {
    const bundle = exportFullFHIRBundle(mockProfile, [mockMedication], mockStats);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.total).toBe(3);
    expect(bundle.entry.length).toBe(3);
    expect(bundle.entry[0].resource.resourceType).toBe('Patient');
    expect(bundle.entry[1].resource.resourceType).toBe('MedicationStatement');
    expect(bundle.entry[2].resource.resourceType).toBe('Observation');
  });
});
