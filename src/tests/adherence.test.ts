import { describe, it, expect } from 'vitest';
import {
  determineDoseStatus,
  calculateAdherence,
} from '../services/adherenceEngine';
import { DoseEvent } from '../types/adherence';

describe('Adherence Engine & Dose Lifecycle State Machine', () => {
  describe('Dose Status Determinations', () => {
    const scheduledTime = '2026-11-15T08:00:00.000Z';

    it('returns TAKEN when isTaken is true regardless of time', () => {
      const now = new Date('2026-11-15T08:45:00.000Z');
      const status = determineDoseStatus(scheduledTime, now, true, false);
      expect(status).toBe('TAKEN');
    });

    it('returns SKIPPED when isSkipped is true', () => {
      const now = new Date('2026-11-15T08:00:00.000Z');
      const status = determineDoseStatus(scheduledTime, now, false, true);
      expect(status).toBe('SKIPPED');
    });

    it('returns SCHEDULED when time is more than 15 minutes before scheduled dose', () => {
      const now = new Date('2026-11-15T07:30:00.000Z'); // -30 min
      const status = determineDoseStatus(scheduledTime, now, false, false);
      expect(status).toBe('SCHEDULED');
    });

    it('returns REMINDED when within 15 minutes prior to scheduled dose (-15m to 0m)', () => {
      const now = new Date('2026-11-15T07:50:00.000Z'); // -10 min
      const status = determineDoseStatus(scheduledTime, now, false, false);
      expect(status).toBe('REMINDED');
    });

    it('returns DUE during active window (0m to +30m past scheduled time)', () => {
      const nowAtDue = new Date('2026-11-15T08:00:00.000Z');
      expect(determineDoseStatus(scheduledTime, nowAtDue, false, false)).toBe('DUE');

      const nowAt20m = new Date('2026-11-15T08:20:00.000Z');
      expect(determineDoseStatus(scheduledTime, nowAt20m, false, false)).toBe('DUE');
    });

    it('returns MISSED when more than 30 minutes overdue', () => {
      const now = new Date('2026-11-15T08:35:00.000Z'); // +35 min
      const status = determineDoseStatus(scheduledTime, now, false, false);
      expect(status).toBe('MISSED');
    });
  });

  describe('Adherence Percentage & Streak Analytics', () => {
    it('returns 100% adherence and 0 streak for empty events', () => {
      const stats = calculateAdherence([]);
      expect(stats.percentage).toBe(100);
      expect(stats.currentStreak).toBe(0);
      expect(stats.totalScheduled).toBe(0);
    });

    it('computes 100% adherence when all scheduled doses are taken', () => {
      const events: DoseEvent[] = [
        {
          id: '1',
          medicationId: 'm1',
          medicationName: 'Lisinopril',
          dosage: '10mg',
          scheduledTime: '2026-11-14T08:00:00Z',
          scheduledDate: '2026-11-14',
          timeSlot: '08:00',
          status: 'TAKEN',
        },
        {
          id: '2',
          medicationId: 'm1',
          medicationName: 'Lisinopril',
          dosage: '10mg',
          scheduledTime: '2026-11-15T08:00:00Z',
          scheduledDate: '2026-11-15',
          timeSlot: '08:00',
          status: 'TAKEN',
        },
      ];

      const stats = calculateAdherence(events);
      expect(stats.percentage).toBe(100);
      expect(stats.totalTaken).toBe(2);
      expect(stats.currentStreak).toBe(2);
    });

    it('does NOT penalize adherence score or break streak on clinically permitted SKIPPED doses', () => {
      const events: DoseEvent[] = [
        {
          id: '1',
          medicationId: 'm1',
          medicationName: 'Lisinopril',
          dosage: '10mg',
          scheduledTime: '2026-11-13T08:00:00Z',
          scheduledDate: '2026-11-13',
          timeSlot: '08:00',
          status: 'TAKEN',
        },
        {
          id: '2',
          medicationId: 'm1',
          medicationName: 'Lisinopril',
          dosage: '10mg',
          scheduledTime: '2026-11-14T08:00:00Z',
          scheduledDate: '2026-11-14',
          timeSlot: '08:00',
          status: 'SKIPPED',
          skipReason: 'FASTING_OR_LABS',
        },
        {
          id: '3',
          medicationId: 'm2',
          medicationName: 'Metformin',
          dosage: '500mg',
          scheduledTime: '2026-11-14T08:00:00Z',
          scheduledDate: '2026-11-14',
          timeSlot: '08:00',
          status: 'TAKEN',
        },
      ];

      const stats = calculateAdherence(events);
      // 2 taken out of (3 scheduled - 1 skipped = 2 applicable) = 100%
      expect(stats.percentage).toBe(100);
      expect(stats.totalSkipped).toBe(1);
      expect(stats.currentStreak).toBe(2);
    });

    it('penalizes adherence score and resets streak when doses are MISSED', () => {
      const events: DoseEvent[] = [
        {
          id: '1',
          medicationId: 'm1',
          medicationName: 'Lisinopril',
          dosage: '10mg',
          scheduledTime: '2026-11-13T08:00:00Z',
          scheduledDate: '2026-11-13',
          timeSlot: '08:00',
          status: 'TAKEN',
        },
        {
          id: '2',
          medicationId: 'm1',
          medicationName: 'Lisinopril',
          dosage: '10mg',
          scheduledTime: '2026-11-14T08:00:00Z',
          scheduledDate: '2026-11-14',
          timeSlot: '08:00',
          status: 'MISSED',
        },
      ];

      const stats = calculateAdherence(events);
      // 1 taken / 2 scheduled = 50%
      expect(stats.percentage).toBe(50);
      expect(stats.totalMissed).toBe(1);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(1);
    });
  });
});
