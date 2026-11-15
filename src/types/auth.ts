/**
 * Authentication and RBAC type definitions for OmniCare platform.
 */

export type UserRole = 'SENIOR' | 'CARETAKER' | 'FAMILY';

export interface HashResult {
  hash: string;
  salt: string;
}

export interface PasscodeCredential {
  role: UserRole;
  salt: string;
  hash: string;
  iterations: number;
  updatedAt: string;
}

export interface Session {
  token: string;
  role: UserRole;
  profileId: string;
  displayName: string;
  expiresAt: number; // Unix epoch millisecond timestamp
  createdAt: number;
}

export interface RateLimitState {
  role: UserRole;
  failedAttempts: number;
  lockoutUntil: number | null; // Unix epoch timestamp
  lastAttemptAt: number | null;
}

export type PermissionAction =
  | 'PROFILE_VIEW'
  | 'MEDICATION_VIEW'
  | 'MEDICATION_CREATE'
  | 'MEDICATION_EDIT'
  | 'MEDICATION_DELETE'
  | 'DOSE_MARK_TAKEN'
  | 'DOSE_MARK_SKIPPED'
  | 'DOSE_UNDO'
  | 'DDI_VIEW'
  | 'DDI_ACKNOWLEDGE_OVERRIDE'
  | 'ADHERENCE_VIEW_STATS'
  | 'APPOINTMENT_VIEW'
  | 'APPOINTMENT_CREATE_EDIT'
  | 'APPOINTMENT_DELETE'
  | 'REFILL_MANAGE'
  | 'SETTINGS_PINS_UPDATE'
  | 'EMERGENCY_TRIGGER_SOS'
  | 'EMERGENCY_RESOLVE'
  | 'AUDIT_TRAIL_VIEW';

export const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionAction, boolean>> = {
  SENIOR: {
    PROFILE_VIEW: true,
    MEDICATION_VIEW: true,
    MEDICATION_CREATE: false,
    MEDICATION_EDIT: false,
    MEDICATION_DELETE: false,
    DOSE_MARK_TAKEN: true,
    DOSE_MARK_SKIPPED: true,
    DOSE_UNDO: true,
    DDI_VIEW: true,
    DDI_ACKNOWLEDGE_OVERRIDE: false,
    ADHERENCE_VIEW_STATS: true,
    APPOINTMENT_VIEW: true,
    APPOINTMENT_CREATE_EDIT: true,
    APPOINTMENT_DELETE: false,
    REFILL_MANAGE: false,
    SETTINGS_PINS_UPDATE: false,
    EMERGENCY_TRIGGER_SOS: true,
    EMERGENCY_RESOLVE: false,
    AUDIT_TRAIL_VIEW: false,
  },
  CARETAKER: {
    PROFILE_VIEW: true,
    MEDICATION_VIEW: true,
    MEDICATION_CREATE: true,
    MEDICATION_EDIT: true,
    MEDICATION_DELETE: true,
    DOSE_MARK_TAKEN: true,
    DOSE_MARK_SKIPPED: true,
    DOSE_UNDO: true,
    DDI_VIEW: true,
    DDI_ACKNOWLEDGE_OVERRIDE: true,
    ADHERENCE_VIEW_STATS: true,
    APPOINTMENT_VIEW: true,
    APPOINTMENT_CREATE_EDIT: true,
    APPOINTMENT_DELETE: true,
    REFILL_MANAGE: true,
    SETTINGS_PINS_UPDATE: true,
    EMERGENCY_TRIGGER_SOS: true,
    EMERGENCY_RESOLVE: true,
    AUDIT_TRAIL_VIEW: true,
  },
  FAMILY: {
    PROFILE_VIEW: true,
    MEDICATION_VIEW: true,
    MEDICATION_CREATE: false,
    MEDICATION_EDIT: false,
    MEDICATION_DELETE: false,
    DOSE_MARK_TAKEN: false,
    DOSE_MARK_SKIPPED: false,
    DOSE_UNDO: false,
    DDI_VIEW: true,
    DDI_ACKNOWLEDGE_OVERRIDE: false,
    ADHERENCE_VIEW_STATS: true,
    APPOINTMENT_VIEW: true,
    APPOINTMENT_CREATE_EDIT: true,
    APPOINTMENT_DELETE: false,
    REFILL_MANAGE: true,
    SETTINGS_PINS_UPDATE: false,
    EMERGENCY_TRIGGER_SOS: true,
    EMERGENCY_RESOLVE: false,
    AUDIT_TRAIL_VIEW: true,
  },
};
