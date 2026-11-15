/**
 * Proactive Notification & Email Outbox types.
 */
import { UserRole } from './auth';

export type NotificationCategory =
  | 'UPCOMING_DOSE'
  | 'MISSED_DOSE_ESCALATION'
  | 'APPOINTMENT_REMINDER'
  | 'EMERGENCY_SOS';

export type EscalationLevel = 0 | 1 | 2 | 3;

export interface EmailNotification {
  id: string;
  to: string;
  recipientRole: UserRole;
  subject: string;
  htmlBody: string;
  category: NotificationCategory;
  escalationLevel: EscalationLevel;
  sentAt: string;
  status: 'DELIVERED' | 'QUEUED';
}
