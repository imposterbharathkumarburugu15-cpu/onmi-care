import { describe, it, expect } from 'vitest';
import {
  calculateAdherence,
  determineDoseStatus,
} from '../services/adherenceEngine';
import { DoseEvent } from '../types/adherence';
import {
  checkInteractions,
  GERIATRIC_DDI_RULES,
} from '../services/interactionEngine';

describe('Extreme Edge Cases & Boundary Stress Testing', () => {
  it('handles 0 total doses gracefully without dividing by zero', () => {
    const stats = calculateAdherence([]);
    expect(stats.totalScheduled).toBe(0);
    expect(stats.totalTaken).toBe(0);
    expect(stats.percentage).toBe(100); // 100% baseline when no scheduled doses missed
    expect(stats.currentStreak).toBe(0);
  });

  it('handles 100% adherence streak calculation across 30 days', () => {
    const mockEvents: DoseEvent[] = [];
    const baseDate = new Date('2026-11-01T08:00:00Z');

    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      mockEvents.push({
        id: `event-${i}`,
        medicationId: 'med-01',
        medicationName: 'Metformin',
        dosage: '500mg',
        timeSlot: '08:00',
        scheduledDate: dateStr,
        scheduledTime: d.toISOString(),
        status: 'TAKEN',
      });
    }

    const stats = calculateAdherence(mockEvents);
    expect(stats.totalScheduled).toBe(30);
    expect(stats.totalTaken).toBe(30);
    expect(stats.percentage).toBe(100);
    expect(stats.currentStreak).toBe(30);
  });

  it('resets streak when a dose is missed', () => {
    const mockEvents: DoseEvent[] = [
      {
        id: 'event-yesterday',
        medicationId: 'med-01',
        medicationName: 'Metformin',
        dosage: '500mg',
        timeSlot: '08:00',
        scheduledDate: '2026-11-14',
        scheduledTime: '2026-11-14T08:00:00Z',
        status: 'MISSED',
      },
      {
        id: 'event-today',
        medicationId: 'med-01',
        medicationName: 'Metformin',
        dosage: '500mg',
        timeSlot: '08:00',
        scheduledDate: '2026-11-15',
        scheduledTime: '2026-11-15T08:00:00Z',
        status: 'TAKEN',
      },
    ];

    const stats = calculateAdherence(mockEvents);
    expect(stats.totalMissed).toBe(1);
    expect(stats.totalTaken).toBe(1);
    expect(stats.currentStreak).toBe(1);
  });

  it('evaluates benign polypharmacy combinations with 0 false positive interactions', () => {
    const safeMeds = ['Acetaminophen 500mg', 'Amoxicillin 250mg', 'Loratadine 10mg'];
    const conflicts = checkInteractions(safeMeds);
    expect(conflicts.length).toBe(0);
  });

  it('correctly transitions dose status based on elapsed time windows', () => {
    const now = new Date('2026-11-15T12:00:00Z');

    // >15m in future
    const future = determineDoseStatus('2026-11-15T13:00:00Z', now, false, false);
    expect(future).toBe('SCHEDULED');

    // Within 15m before
    const reminded = determineDoseStatus('2026-11-15T12:10:00Z', now, false, false);
    expect(reminded).toBe('REMINDED');

    // Due window (0 to 30m after)
    const due = determineDoseStatus('2026-11-15T11:50:00Z', now, false, false);
    expect(due).toBe('DUE');

    // Missed (>30m after)
    const missed = determineDoseStatus('2026-11-15T11:15:00Z', now, false, false);
    expect(missed).toBe('MISSED');

    // Explicitly taken or skipped
    expect(determineDoseStatus('2026-11-15T11:15:00Z', now, true, false)).toBe('TAKEN');
    expect(determineDoseStatus('2026-11-15T11:15:00Z', now, false, true)).toBe('SKIPPED');
  });

  it('verifies clinical interaction rule count covers 10 critical geriatric combinations', () => {
    expect(GERIATRIC_DDI_RULES.length).toBe(10);
    const contraindicated = GERIATRIC_DDI_RULES.filter((r) => r.severity === 'CONTRAINDICATED');
    const major = GERIATRIC_DDI_RULES.filter((r) => r.severity === 'MAJOR');
    const moderate = GERIATRIC_DDI_RULES.filter((r) => r.severity === 'MODERATE');

    expect(contraindicated.length).toBeGreaterThanOrEqual(1);
    expect(major.length).toBeGreaterThanOrEqual(3);
    expect(moderate.length).toBeGreaterThanOrEqual(2);
  });
});
