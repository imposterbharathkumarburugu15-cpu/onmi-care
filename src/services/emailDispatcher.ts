/**
 * Proactive Email Dispatcher and simulated notification outbox.
 * Generates structured HTML templates for upcoming doses, missed dose escalations,
 * doctor appointment reminders, and emergency SOS broadcasts.
 */
import { EmailNotification, EscalationLevel } from '../types/notification';
import { UserRole } from '../types/auth';

let emailOutbox: EmailNotification[] = [];

/**
 * Dispatches (queues) an email notification into the simulated outbox.
 */
export function queueEmailNotification(
  notification: Omit<EmailNotification, 'id' | 'sentAt' | 'status'>
): EmailNotification {
  const id = globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const sentAt = new Date().toISOString();

  const fullNotification: EmailNotification = {
    ...notification,
    id,
    sentAt,
    status: 'DELIVERED',
  };

  emailOutbox.unshift(fullNotification);
  return fullNotification;
}

/**
 * Returns all sent / queued email notifications in the outbox.
 */
export function getEmailHistory(): EmailNotification[] {
  return [...emailOutbox];
}

/**
 * Clears the email outbox (useful for testing).
 */
export function clearEmailHistory(): void {
  emailOutbox = [];
}

/**
 * HTML Template for Upcoming Medication Dose.
 */
export function renderUpcomingDoseTemplate(
  patientName: string,
  medName: string,
  dosage: string,
  scheduledTime: string,
  instructions?: string
): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #0284C7; border-radius: 12px; background-color: #F8FAFC;">
  <div style="background-color: #0284C7; color: white; padding: 16px; border-radius: 8px; text-align: center;">
    <h1 style="margin: 0; font-size: 22px;">Upcoming Medication Reminder</h1>
    <p style="margin: 4px 0 0; font-size: 14px;">OmniCare Elderly Healthcare Network</p>
  </div>
  <div style="padding: 20px 0;">
    <p style="font-size: 16px; color: #1E293B;">Dear <strong>${patientName}</strong>,</p>
    <p style="font-size: 16px; color: #334155;">This is a friendly reminder that your next scheduled dose is due shortly:</p>
    <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h2 style="color: #0F172A; margin: 0 0 8px; font-size: 20px;">${medName} (${dosage})</h2>
      <p style="margin: 4px 0; color: #475569;"><strong>Scheduled Time:</strong> ${scheduledTime}</p>
      ${instructions ? `<p style="margin: 4px 0; color: #475569;"><strong>Instructions:</strong> ${instructions}</p>` : ''}
    </div>
    <p style="font-size: 14px; color: #64748B;">Please log in to your OmniCare profile and tap <em>"TAKE NOW"</em> once ingested.</p>
  </div>
  <div style="border-top: 1px solid #CBD5E1; padding-top: 12px; text-align: center; font-size: 12px; color: #94A3B8;">
    Secure healthcare message delivered on behalf of your Caregiver team.
  </div>
</div>
`.trim();
}

/**
 * HTML Template for Missed Dose Caregiver Escalation.
 */
export function renderMissedDoseTemplate(
  patientName: string,
  caretakerName: string,
  medName: string,
  dosage: string,
  scheduledTime: string,
  escalationLevel: EscalationLevel
): string {
  const urgencyColor = escalationLevel >= 2 ? '#B91C1C' : '#B45309';
  const levelTitle = escalationLevel >= 2 ? 'URGENT: Caregiver Escalation' : 'Attention: Missed Dose Notice';

  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid ${urgencyColor}; border-radius: 12px; background-color: #FFF7ED;">
  <div style="background-color: ${urgencyColor}; color: white; padding: 16px; border-radius: 8px; text-align: center;">
    <h1 style="margin: 0; font-size: 22px;">${levelTitle} (Tier ${escalationLevel})</h1>
    <p style="margin: 4px 0 0; font-size: 14px;">OmniCare Automated Escalation Protocol</p>
  </div>
  <div style="padding: 20px 0;">
    <p style="font-size: 16px; color: #1E293B;">Attention <strong>${caretakerName}</strong>,</p>
    <p style="font-size: 16px; color: #7C2D12;">
      <strong>${patientName}</strong> has not logged their scheduled dose within the permitted grace window.
    </p>
    <div style="background-color: #FFFFFF; border: 1px solid #FED7AA; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h2 style="color: #9A3412; margin: 0 0 8px; font-size: 18px;">${medName} — ${dosage}</h2>
      <p style="margin: 4px 0; color: #431407;"><strong>Scheduled At:</strong> ${scheduledTime}</p>
      <p style="margin: 4px 0; color: #431407;"><strong>Escalation Tier:</strong> Level ${escalationLevel} of 3</p>
    </div>
    <p style="font-size: 15px; color: #334155;">
      Recommended action: Contact ${patientName} directly to confirm their well-being and medication status.
    </p>
  </div>
  <div style="border-top: 1px solid #FED7AA; padding-top: 12px; text-align: center; font-size: 12px; color: #9A3412;">
    Automated safety check provided by OmniCare Adherence Guard.
  </div>
</div>
`.trim();
}

/**
 * HTML Template for Doctor Appointment Reminders.
 */
export function renderAppointmentReminderTemplate(
  patientName: string,
  doctorName: string,
  specialty: string,
  clinicName: string,
  address: string,
  dateTime: string,
  prepNotes?: string
): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #2563EB; border-radius: 12px; background-color: #F8FAFC;">
  <div style="background-color: #2563EB; color: white; padding: 16px; border-radius: 8px; text-align: center;">
    <h1 style="margin: 0; font-size: 22px;">Doctor Appointment Reminder</h1>
    <p style="margin: 4px 0 0; font-size: 14px;">OmniCare Medical Calendar</p>
  </div>
  <div style="padding: 20px 0;">
    <p style="font-size: 16px; color: #1E293B;">Hello <strong>${patientName}</strong>,</p>
    <p style="font-size: 16px; color: #334155;">You have an upcoming medical consultation scheduled:</p>
    <div style="background-color: #FFFFFF; border: 1px solid #DBEAFE; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h2 style="color: #1E3A8A; margin: 0 0 6px; font-size: 18px;">${doctorName} (${specialty})</h2>
      <p style="margin: 4px 0; color: #334155;"><strong>Date & Time:</strong> ${new Date(dateTime).toLocaleString()}</p>
      <p style="margin: 4px 0; color: #334155;"><strong>Clinic:</strong> ${clinicName}</p>
      <p style="margin: 4px 0; color: #334155;"><strong>Location:</strong> ${address}</p>
      ${prepNotes ? `<p style="margin: 8px 0 0; color: #1D4ED8; font-weight: bold;">Preparation Note: ${prepNotes}</p>` : ''}
    </div>
  </div>
</div>
`.trim();
}

/**
 * HTML Template for Emergency SOS Alerts.
 */
export function renderEmergencySosTemplate(
  patientName: string,
  timestamp: string,
  activeMedsList: string[]
): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 3px solid #DC2626; border-radius: 12px; background-color: #FEF2F2;">
  <div style="background-color: #DC2626; color: white; padding: 18px; border-radius: 8px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">EMERGENCY SOS BEACON ACTIVATED</h1>
    <p style="margin: 6px 0 0; font-size: 15px;">Immediate Caretaker & Family Notification</p>
  </div>
  <div style="padding: 20px 0;">
    <p style="font-size: 18px; color: #7F1D1D; font-weight: bold;">
      ${patientName} has pressed the Emergency SOS Beacon at ${new Date(timestamp).toLocaleTimeString()}!
    </p>
    <p style="font-size: 15px; color: #991B1B;">
      Please reach out immediately or coordinate emergency services.
    </p>
    <div style="background-color: #FFFFFF; border: 1px solid #FCA5A5; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 8px; color: #991B1B;">Current Active Medications:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${activeMedsList.map((m) => `<li>${m}</li>`).join('')}
      </ul>
    </div>
  </div>
</div>
`.trim();
}

/**
 * Helper to dispatch an upcoming dose reminder email.
 */
export function dispatchUpcomingDoseReminder(
  recipientEmail: string,
  recipientRole: UserRole,
  patientName: string,
  medName: string,
  dosage: string,
  scheduledTime: string,
  instructions?: string
): EmailNotification {
  return queueEmailNotification({
    to: recipientEmail,
    recipientRole,
    subject: `Upcoming Medication: ${medName} at ${scheduledTime}`,
    htmlBody: renderUpcomingDoseTemplate(patientName, medName, dosage, scheduledTime, instructions),
    category: 'UPCOMING_DOSE',
    escalationLevel: 0,
  });
}

/**
 * Helper to dispatch a missed dose escalation email.
 */
export function dispatchMissedDoseEscalation(
  recipientEmail: string,
  recipientRole: UserRole,
  patientName: string,
  caretakerName: string,
  medName: string,
  dosage: string,
  scheduledTime: string,
  escalationLevel: EscalationLevel
): EmailNotification {
  return queueEmailNotification({
    to: recipientEmail,
    recipientRole,
    subject: `[ALERT] Missed Dose: ${medName} for ${patientName}`,
    htmlBody: renderMissedDoseTemplate(
      patientName,
      caretakerName,
      medName,
      dosage,
      scheduledTime,
      escalationLevel
    ),
    category: 'MISSED_DOSE_ESCALATION',
    escalationLevel,
  });
}

/**
 * Helper to dispatch doctor appointment reminder email.
 */
export function dispatchAppointmentReminder(
  recipientEmail: string,
  recipientRole: UserRole,
  patientName: string,
  doctorName: string,
  specialty: string,
  clinicName: string,
  address: string,
  dateTime: string,
  prepNotes?: string
): EmailNotification {
  return queueEmailNotification({
    to: recipientEmail,
    recipientRole,
    subject: `Appointment Reminder: Dr. ${doctorName} on ${new Date(dateTime).toLocaleDateString()}`,
    htmlBody: renderAppointmentReminderTemplate(
      patientName,
      doctorName,
      specialty,
      clinicName,
      address,
      dateTime,
      prepNotes
    ),
    category: 'APPOINTMENT_REMINDER',
    escalationLevel: 0,
  });
}
