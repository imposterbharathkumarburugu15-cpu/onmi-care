/**
 * HL7 / FHIR R4 Interoperability Service
 * Converts local OmniCare elderly records into official FHIR R4 clinical standard resources
 * for hospital and Electronic Health Record (EHR) interoperability (Epic, Cerner, Allscripts).
 */

import { SeniorProfile } from '../utils/seedData';
import { Medication } from '../types/medication';
import { DoseEvent, AdherenceStats } from '../types/adherence';
import { DoctorAppointment } from '../types/appointment';

export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: unknown;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'collection';
  timestamp: string;
  total: number;
  entry: Array<{
    fullUrl: string;
    resource: FHIRResource;
  }>;
}

/**
 * Transforms an OmniCare senior profile into a FHIR R4 Patient resource
 */
export function exportToFHIRPatient(profile: SeniorProfile): FHIRResource {
  const [givenName, ...familyParts] = profile.name.split(' ');
  const familyName = familyParts.join(' ') || 'Unknown';

  return {
    resourceType: 'Patient',
    id: profile.id,
    active: true,
    name: [
      {
        use: 'official',
        family: familyName,
        given: [givenName],
      },
    ],
    birthDate: profile.dateOfBirth,
    telecom: [
      {
        system: 'phone',
        value: profile.emergencyPhone,
        use: 'emergency',
      },
      {
        system: 'email',
        value: profile.seniorEmail,
      },
    ],
    address: [
      {
        text: profile.address,
      },
    ],
    generalPractitioner: [
      {
        display: profile.primaryPhysician,
      },
    ],
  };
}

/**
 * Transforms an OmniCare medication into a FHIR R4 MedicationStatement resource
 */
export function exportToFHIRMedicationStatement(
  med: Medication,
  patientId: string
): FHIRResource {
  return {
    resourceType: 'MedicationStatement',
    id: `med-${med.id}`,
    status: med.status === 'ACTIVE' ? 'active' : 'completed',
    subject: {
      reference: `Patient/${patientId}`,
    },
    medicationCodeableConcept: {
      text: `${med.name} ${med.dosage}`,
      coding: [
        {
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          display: med.name,
        },
      ],
    },
    dosage: [
      {
        text: `${med.dosage} ${med.route.toLowerCase()} ${med.frequency.toLowerCase()}`,
        timing: {
          code: {
            text: med.timeSlots.map((ts) => ts.time).join(', '),
          },
        },
        route: {
          text: med.route,
        },
        additionalInstruction: [
          {
            text: med.mealRelation.replace('_', ' ').toLowerCase(),
          },
        ],
      },
    ],
    note: med.instructions ? [{ text: med.instructions }] : [],
  };
}

/**
 * Transforms OmniCare adherence statistics into a FHIR R4 Observation resource
 */
export function exportToFHIRObservation(
  stats: AdherenceStats,
  patientId: string
): FHIRResource {
  return {
    resourceType: 'Observation',
    id: `obs-adherence-${patientId}`,
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'therapy',
            display: 'Therapy Adherence',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '89555-7',
          display: 'Medication adherence percentage',
        },
      ],
      text: 'Overall Medication Adherence Compliance',
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: {
      value: stats.percentage,
      unit: '%',
      system: 'http://unitsofmeasure.org',
      code: '%',
    },
    component: [
      {
        code: {
          text: 'Consecutive Day Streak',
        },
        valueInteger: stats.currentStreak,
      },
      {
        code: {
          text: 'Doses Taken',
        },
        valueInteger: stats.totalTaken,
      },
      {
        code: {
          text: 'Doses Missed',
        },
        valueInteger: stats.totalMissed,
      },
    ],
  };
}

/**
 * Generates a complete FHIR R4 Bundle containing all patient records
 */
export function exportFullFHIRBundle(
  profile: SeniorProfile,
  medications: Medication[],
  stats: AdherenceStats,
  _appointments?: DoctorAppointment[],
  _doseEvents?: DoseEvent[]
): FHIRBundle {
  const patientResource = exportToFHIRPatient(profile);
  const medResources = medications.map((m) =>
    exportToFHIRMedicationStatement(m, profile.id)
  );
  const observationResource = exportToFHIRObservation(stats, profile.id);

  const entries: Array<{ fullUrl: string; resource: FHIRResource }> = [
    {
      fullUrl: `urn:uuid:${patientResource.id}`,
      resource: patientResource,
    },
    ...medResources.map((mr) => ({
      fullUrl: `urn:uuid:${mr.id}`,
      resource: mr,
    })),
    {
      fullUrl: `urn:uuid:${observationResource.id}`,
      resource: observationResource,
    },
  ];

  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    total: entries.length,
    entry: entries,
  };
}
