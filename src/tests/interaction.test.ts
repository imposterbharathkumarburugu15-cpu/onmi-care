import { describe, it, expect } from 'vitest';
import {
  checkInteractions,
  checkNewMedication,
  GERIATRIC_DDI_RULES,
} from '../services/interactionEngine';

describe('Clinical Geriatric Drug-Drug Interaction (DDI) Warning Engine', () => {
  it('has all 10 core polypharmacy geriatric rules defined', () => {
    expect(GERIATRIC_DDI_RULES.length).toBe(10);
  });

  describe('Clinical Rule Verifications', () => {
    it('detects CONTRAINDICATED interaction for Warfarin + Aspirin (Bleeding Risk)', () => {
      const conflicts = checkInteractions(['Warfarin 5mg', 'Aspirin 81mg']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('CONTRAINDICATED');
      expect(conflicts[0].mechanism).toContain('hemostasis');
    });

    it('detects MAJOR interaction for Lisinopril + Potassium supplement (Hyperkalemia)', () => {
      const conflicts = checkInteractions(['Lisinopril 20mg', 'Potassium Chloride (K-Dur)']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MAJOR');
      expect(conflicts[0].clinicalRisk).toContain('hyperkalemia');
    });

    it('detects MAJOR interaction for Metformin + Furosemide (Lactic Acidosis Risk)', () => {
      const conflicts = checkInteractions(['Metformin 500mg', 'Furosemide 40mg']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MAJOR');
    });

    it('detects MAJOR interaction for Digoxin + Furosemide (Digoxin Toxicity)', () => {
      const conflicts = checkInteractions(['Digoxin 0.125mg', 'Furosemide 20mg']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MAJOR');
    });

    it('detects MODERATE interaction for Levodopa + Iron supplement (Chelation)', () => {
      const conflicts = checkInteractions(['Sinemet (Carbidopa/Levodopa)', 'Ferrous Sulfate 325mg']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MODERATE');
      expect(conflicts[0].recommendation).toContain('Separate');
    });

    it('detects MODERATE interaction for Ciprofloxacin + Calcium Antacid (Absorption Failure)', () => {
      const conflicts = checkInteractions(['Ciprofloxacin 500mg', 'Calcium Carbonate (Tums)']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MODERATE');
    });

    it('detects MODERATE interaction for Amlodipine + Simvastatin (Rhabdomyolysis Risk)', () => {
      const conflicts = checkInteractions(['Amlodipine 5mg', 'Simvastatin 40mg']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MODERATE');
      expect(conflicts[0].recommendation).toContain('20mg');
    });

    it('detects MODERATE interaction for Sertraline + Ibuprofen (GI Bleed Risk)', () => {
      const conflicts = checkInteractions(['Sertraline 50mg', 'Ibuprofen 400mg']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MODERATE');
    });

    it('detects MAJOR interaction for Lorazepam + Oxycodone (Respiratory Depression)', () => {
      const conflicts = checkInteractions(['Lorazepam 1mg', 'Oxycodone 5mg']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MAJOR');
    });

    it('detects MAJOR interaction for Metoprolol + Diltiazem (Complete AV Block / Bradycardia)', () => {
      const conflicts = checkInteractions(['Metoprolol Tartrate 50mg', 'Diltiazem 120mg']);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('MAJOR');
    });
  });

  describe('Multi-Drug Polypharmacy & Safe Combinations', () => {
    it('returns zero conflicts for clinically safe regimens', () => {
      const benignMeds = ['Lisinopril 10mg', 'Atorvastatin 20mg', 'Omeprazole 20mg'];
      const conflicts = checkInteractions(benignMeds);
      expect(conflicts.length).toBe(0);
    });

    it('ranks multiple conflicts by severity (CONTRAINDICATED first, then MAJOR, then MODERATE)', () => {
      const complexRegimen = [
        'Warfarin',
        'Ibuprofen', // CONTRAINDICATED
        'Metoprolol',
        'Diltiazem', // MAJOR
        'Amlodipine',
        'Simvastatin', // MODERATE
      ];

      const conflicts = checkInteractions(complexRegimen);
      expect(conflicts.length).toBeGreaterThanOrEqual(3);
      expect(conflicts[0].severity).toBe('CONTRAINDICATED');
      expect(conflicts[1].severity).toBe('MAJOR');
    });

    it('checkNewMedication evaluates proposed drug against current profile', () => {
      const currentRegimen = ['Warfarin 5mg', 'Metformin 500mg', 'Atorvastatin 20mg'];
      const proposedMed = 'Aspirin 81mg';

      const conflicts = checkNewMedication(proposedMed, currentRegimen);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].severity).toBe('CONTRAINDICATED');
      expect(conflicts[0].drugA).toContain('Aspirin');
      expect(conflicts[0].drugB).toContain('Warfarin');
    });
  });
});
