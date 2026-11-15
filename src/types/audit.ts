/**
 * Audit log and chained tamper-evident ledger types.
 */
import { UserRole } from './auth';

export type AuditActionType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOCKOUT_TRIGGERED'
  | 'AUTH_LOGOUT'
  | 'MEDICATION_CREATED'
  | 'MEDICATION_UPDATED'
  | 'MEDICATION_DELETED'
  | 'DDI_OVERRIDE_RECORDED'
  | 'DOSE_MARKED_TAKEN'
  | 'DOSE_MARKED_SKIPPED'
  | 'DOSE_MARKED_MISSED'
  | 'REFILL_LOGGED'
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_UPDATED'
  | 'APPOINTMENT_CANCELLED'
  | 'EMERGENCY_SOS_TRIGGERED'
  | 'EMERGENCY_SOS_RESOLVED';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  action: AuditActionType;
  targetEntityType: 'MEDICATION' | 'ADHERENCE' | 'APPOINTMENT' | 'SECURITY' | 'EMERGENCY' | 'PROFILE';
  targetEntityId: string;
  details: string;
  severity: AuditSeverity;
  prevHash: string;
  recordHash: string;
}
