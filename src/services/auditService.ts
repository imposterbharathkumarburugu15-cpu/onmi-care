/**
 * Tamper-evident chained audit log service with SHA-256 integrity verification.
 */
import { AuditLogEntry, AuditActionType, AuditSeverity } from '../types/audit';
import { UserRole } from '../types/auth';
import { bytesToHex } from './cryptoService';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Calculates SHA-256 hash string for an audit log entry.
 */
export async function computeEntryHash(
  prevHash: string,
  timestamp: string,
  actorRole: UserRole,
  action: AuditActionType,
  targetEntityId: string,
  details: string
): Promise<string> {
  const payload = `${prevHash}|${timestamp}|${actorRole}|${action}|${targetEntityId}|${details}`;
  const enc = new TextEncoder();
  const buffer = await globalThis.crypto.subtle.digest('SHA-256', enc.encode(payload));
  return bytesToHex(new Uint8Array(buffer));
}

/**
 * Generates a new cryptographically chained audit log entry.
 */
export async function createAuditEntry(
  actorRole: UserRole,
  action: AuditActionType,
  targetEntityType: AuditLogEntry['targetEntityType'],
  targetEntityId: string,
  details: string,
  severity: AuditSeverity = 'INFO',
  lastEntry?: AuditLogEntry
): Promise<AuditLogEntry> {
  const id = globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();
  const prevHash = lastEntry ? lastEntry.recordHash : GENESIS_HASH;
  const recordHash = await computeEntryHash(
    prevHash,
    timestamp,
    actorRole,
    action,
    targetEntityId,
    details
  );

  return {
    id,
    timestamp,
    actorRole,
    action,
    targetEntityType,
    targetEntityId,
    details,
    severity,
    prevHash,
    recordHash,
  };
}

/**
 * Verifies the mathematical integrity of the entire audit chain.
 * Returns true if every entry matches its recalculation and prevHash matches predecessor.
 */
export async function verifyAuditTrail(entries: AuditLogEntry[]): Promise<boolean> {
  if (entries.length === 0) return true;

  for (let i = 0; i < entries.length; i++) {
    const current = entries[i];
    const expectedPrevHash = i === 0 ? GENESIS_HASH : entries[i - 1].recordHash;

    if (current.prevHash !== expectedPrevHash) {
      return false; // Broken chain pointer
    }

    const calculatedHash = await computeEntryHash(
      current.prevHash,
      current.timestamp,
      current.actorRole,
      current.action,
      current.targetEntityId,
      current.details
    );

    if (calculatedHash !== current.recordHash) {
      return false; // Tampered payload
    }
  }

  return true;
}
