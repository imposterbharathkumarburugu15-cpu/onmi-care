import { describe, it, expect, beforeEach } from 'vitest';
import {
  queueEmailNotification,
  getEmailHistory,
  clearEmailHistory,
  renderUpcomingDoseTemplate,
  renderMissedDoseTemplate,
  renderAppointmentReminderTemplate,
  renderEmergencySosTemplate,
  dispatchUpcomingDoseReminder,
  dispatchMissedDoseEscalation,
  dispatchAppointmentReminder,
} from '../services/emailDispatcher';

describe('Proactive Email Dispatcher & Simulated Outbox', () => {
  beforeEach(() => {
    clearEmailHistory();
  });

  it('queues email notification into the outbox ledger with generated ID and timestamp', () => {
    const notif = queueEmailNotification({
      to: 'eleanor@omnicare.org',
      recipientRole: 'SENIOR',
      subject: 'Test Subject',
      htmlBody: '<p>Test body</p>',
      category: 'UPCOMING_DOSE',
      escalationLevel: 0,
    });

    expect(notif.id).toBeDefined();
    expect(notif.sentAt).toBeDefined();
    expect(notif.status).toBe('DELIVERED');

    const history = getEmailHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(notif.id);
  });

  describe('HTML Template Generators', () => {
    it('generates valid HTML template for upcoming dose reminders', () => {
      const html = renderUpcomingDoseTemplate(
        'Eleanor Vance',
        'Lisinopril',
        '10mg',
        '08:00 AM',
        'Take with full glass of water'
      );

      expect(html).toContain('Eleanor Vance');
      expect(html).toContain('Lisinopril (10mg)');
      expect(html).toContain('08:00 AM');
      expect(html).toContain('Take with full glass of water');
    });

    it('generates tiered escalation HTML for missed doses', () => {
      const htmlTier1 = renderMissedDoseTemplate(
        'Eleanor Vance',
        'Nurse Sarah',
        'Metformin',
        '500mg',
        '08:00 AM',
        1
      );
      expect(htmlTier1).toContain('Tier 1');
      expect(htmlTier1).toContain('Nurse Sarah');
      expect(htmlTier1).toContain('Metformin — 500mg');

      const htmlTier2 = renderMissedDoseTemplate(
        'Eleanor Vance',
        'Nurse Sarah',
        'Metformin',
        '500mg',
        '08:00 AM',
        2
      );
      expect(htmlTier2).toContain('Tier 2');
      expect(htmlTier2).toContain('URGENT');
    });

    it('generates appointment reminder HTML with doctor, specialty, and clinic', () => {
      const html = renderAppointmentReminderTemplate(
        'Eleanor Vance',
        'Dr. Evelyn Thorne',
        'Cardiology',
        'St. Jude Medical Pavilion',
        '740 St. Jude Parkway',
        '2026-11-20T10:00:00.000Z',
        'Bring blood pressure log'
      );

      expect(html).toContain('Dr. Evelyn Thorne (Cardiology)');
      expect(html).toContain('St. Jude Medical Pavilion');
      expect(html).toContain('Bring blood pressure log');
    });

    it('generates emergency SOS alert HTML with active medications list', () => {
      const activeMeds = ['Lisinopril 10mg', 'Metformin 500mg', 'Amlodipine 5mg'];
      const html = renderEmergencySosTemplate(
        'Eleanor Vance',
        new Date().toISOString(),
        activeMeds
      );

      expect(html).toContain('EMERGENCY SOS BEACON ACTIVATED');
      expect(html).toContain('Eleanor Vance');
      expect(html).toContain('Lisinopril 10mg');
      expect(html).toContain('Metformin 500mg');
    });
  });

  describe('Helper Dispatch Functions', () => {
    it('dispatchUpcomingDoseReminder dispatches and returns notification', () => {
      const notif = dispatchUpcomingDoseReminder(
        'eleanor@omnicare.org',
        'SENIOR',
        'Eleanor',
        'Lisinopril',
        '10mg',
        '08:00 AM'
      );

      expect(notif.category).toBe('UPCOMING_DOSE');
      expect(notif.to).toBe('eleanor@omnicare.org');
      expect(getEmailHistory().length).toBe(1);
    });

    it('dispatchMissedDoseEscalation dispatches escalation tier to caretaker', () => {
      const notif = dispatchMissedDoseEscalation(
        'caretaker@omnicare.org',
        'CARETAKER',
        'Eleanor',
        'Nurse Sarah',
        'Metformin',
        '500mg',
        '08:00 AM',
        2
      );

      expect(notif.category).toBe('MISSED_DOSE_ESCALATION');
      expect(notif.escalationLevel).toBe(2);
      expect(notif.to).toBe('caretaker@omnicare.org');
    });

    it('dispatchAppointmentReminder dispatches appointment notice', () => {
      const notif = dispatchAppointmentReminder(
        'eleanor@omnicare.org',
        'SENIOR',
        'Eleanor',
        'Dr. Thorne',
        'Cardiology',
        'St. Jude Clinic',
        'Main Street',
        '2026-11-25T14:00:00.000Z'
      );

      expect(notif.category).toBe('APPOINTMENT_REMINDER');
      expect(notif.subject).toContain('Dr. Dr. Thorne');
    });
  });
});
