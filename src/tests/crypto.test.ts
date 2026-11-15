import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPasscode,
  verifyPasscode,
  createSession,
  isSessionValid,
  checkPermission,
  constantTimeEqual,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from '../services/cryptoService';
import {
  computeEntryHash,
  createAuditEntry,
  verifyAuditTrail,
  GENESIS_HASH,
} from '../services/auditService';

describe('Cryptographic Security & RBAC Service', () => {
  beforeEach(() => {
    resetRateLimit('SENIOR');
    resetRateLimit('CARETAKER');
    resetRateLimit('FAMILY');
  });

  describe('Passcode Hashing & Constant-Time Verification', () => {
    it('should hash a 4-digit senior passcode with salt and verify successfully', async () => {
      const pin = '1234';
      const result = await hashPasscode(pin);

      expect(result.salt).toBeDefined();
      expect(result.salt.length).toBe(32); // 16 bytes in hex
      expect(result.hash).toBeDefined();
      expect(result.hash.length).toBe(64); // 32 bytes in hex

      const isValid = await verifyPasscode(pin, result.salt, result.hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPasscode('0000', result.salt, result.hash);
      expect(isInvalid).toBe(false);
    });

    it('should hash a 6-digit caretaker passcode and verify successfully', async () => {
      const caretakerPin = '987654';
      const result = await hashPasscode(caretakerPin);

      const valid = await verifyPasscode('987654', result.salt, result.hash);
      expect(valid).toBe(true);

      const invalid = await verifyPasscode('123456', result.salt, result.hash);
      expect(invalid).toBe(false);
    });

    it('constantTimeEqual should return true for identical strings and false for differences', () => {
      expect(constantTimeEqual('abcdef', 'abcdef')).toBe(true);
      expect(constantTimeEqual('abcdef', 'abcdeg')).toBe(false);
      expect(constantTimeEqual('short', 'longer_string')).toBe(false);
    });
  });

  describe('Session Lifecycle & Idle Expiration', () => {
    it('creates an active session with 15-minute expiration window', () => {
      const session = createSession('SENIOR', 'profile-1', 'Eleanor Vance');
      expect(session.token).toBeDefined();
      expect(session.role).toBe('SENIOR');
      expect(session.expiresAt).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
      expect(isSessionValid(session)).toBe(true);
    });

    it('rejects expired sessions or null sessions', () => {
      expect(isSessionValid(null)).toBe(false);

      const expiredSession = {
        token: 'token-123',
        role: 'SENIOR' as const,
        profileId: 'profile-1',
        displayName: 'Eleanor',
        createdAt: Date.now() - 30 * 60 * 1000,
        expiresAt: Date.now() - 15 * 60 * 1000, // Expired 15 mins ago
      };

      expect(isSessionValid(expiredSession)).toBe(false);
    });
  });

  describe('Rate Limiting & Lockout Protection', () => {
    it('locks role after 5 consecutive failed attempts', () => {
      expect(checkRateLimit('SENIOR').isLocked).toBe(false);

      for (let i = 1; i <= 4; i++) {
        const attempt = recordFailedAttempt('SENIOR');
        expect(attempt.isLocked).toBe(false);
        expect(attempt.attemptsLeft).toBe(5 - i);
      }

      // 5th failed attempt triggers lockout
      const fifthAttempt = recordFailedAttempt('SENIOR');
      expect(fifthAttempt.isLocked).toBe(true);
      expect(fifthAttempt.attemptsLeft).toBe(0);

      const check = checkRateLimit('SENIOR');
      expect(check.isLocked).toBe(true);
      expect(check.remainingMs).toBeGreaterThan(0);
    });

    it('resets rate limit on successful authentication', () => {
      recordFailedAttempt('CARETAKER');
      recordFailedAttempt('CARETAKER');
      expect(checkRateLimit('CARETAKER').isLocked).toBe(false);

      resetRateLimit('CARETAKER');
      const attempt = recordFailedAttempt('CARETAKER');
      expect(attempt.attemptsLeft).toBe(4);
    });
  });

  describe('RBAC Authorization Guards', () => {
    it('enforces senior role permissions (view and take doses, cannot delete medications)', () => {
      expect(checkPermission('SENIOR', 'DOSE_MARK_TAKEN')).toBe(true);
      expect(checkPermission('SENIOR', 'MEDICATION_VIEW')).toBe(true);
      expect(checkPermission('SENIOR', 'EMERGENCY_TRIGGER_SOS')).toBe(true);
      expect(checkPermission('SENIOR', 'MEDICATION_CREATE')).toBe(false);
      expect(checkPermission('SENIOR', 'MEDICATION_DELETE')).toBe(false);
      expect(checkPermission('SENIOR', 'DDI_ACKNOWLEDGE_OVERRIDE')).toBe(false);
    });

    it('enforces caretaker role permissions (full management and DDI override)', () => {
      expect(checkPermission('CARETAKER', 'MEDICATION_CREATE')).toBe(true);
      expect(checkPermission('CARETAKER', 'MEDICATION_EDIT')).toBe(true);
      expect(checkPermission('CARETAKER', 'MEDICATION_DELETE')).toBe(true);
      expect(checkPermission('CARETAKER', 'DDI_ACKNOWLEDGE_OVERRIDE')).toBe(true);
      expect(checkPermission('CARETAKER', 'REFILL_MANAGE')).toBe(true);
    });

    it('enforces family member role permissions (view adherence, cannot edit doses)', () => {
      expect(checkPermission('FAMILY', 'ADHERENCE_VIEW_STATS')).toBe(true);
      expect(checkPermission('FAMILY', 'DOSE_MARK_TAKEN')).toBe(false);
      expect(checkPermission('FAMILY', 'MEDICATION_DELETE')).toBe(false);
      expect(checkPermission('FAMILY', 'APPOINTMENT_CREATE_EDIT')).toBe(true);
    });
  });

  describe('Tamper-Evident Chained Audit Log Ledger', () => {
    it('computes deterministic SHA-256 entry hash', async () => {
      const hash1 = await computeEntryHash(GENESIS_HASH, '2026-11-15T10:00:00Z', 'SENIOR', 'AUTH_LOGIN_SUCCESS', 'user-1', 'details');
      const hash2 = await computeEntryHash(GENESIS_HASH, '2026-11-15T10:00:00Z', 'SENIOR', 'AUTH_LOGIN_SUCCESS', 'user-1', 'details');
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });

    it('creates chained entries and verifies ledger cryptographic integrity', async () => {
      const entry1 = await createAuditEntry(
        'SENIOR',
        'AUTH_LOGIN_SUCCESS',
        'SECURITY',
        'role-senior',
        'Senior login with 4-digit PIN'
      );
      expect(entry1.prevHash).toBe(GENESIS_HASH);
      expect(entry1.recordHash.length).toBe(64);

      const entry2 = await createAuditEntry(
        'SENIOR',
        'DOSE_MARKED_TAKEN',
        'ADHERENCE',
        'dose-101',
        'Marked Lisinopril as taken',
        'INFO',
        entry1
      );
      expect(entry2.prevHash).toBe(entry1.recordHash);

      const entry3 = await createAuditEntry(
        'CARETAKER',
        'MEDICATION_CREATED',
        'MEDICATION',
        'med-202',
        'Added Metformin 500mg',
        'INFO',
        entry2
      );
      expect(entry3.prevHash).toBe(entry2.recordHash);

      const isChainValid = await verifyAuditTrail([entry1, entry2, entry3]);
      expect(isChainValid).toBe(true);
    });

    it('detects tampering when an audit log details or hash is altered', async () => {
      const entry1 = await createAuditEntry(
        'SENIOR',
        'AUTH_LOGIN_SUCCESS',
        'SECURITY',
        'role-senior',
        'Original text'
      );
      const entry2 = await createAuditEntry(
        'SENIOR',
        'DOSE_MARKED_TAKEN',
        'ADHERENCE',
        'dose-1',
        'Dose taken',
        'INFO',
        entry1
      );

      // Tamper with entry1 payload
      const tamperedEntry1 = { ...entry1, details: 'TAMPERED MALICIOUS ACTION' };

      const isChainValid = await verifyAuditTrail([tamperedEntry1, entry2]);
      expect(isChainValid).toBe(false);
    });
  });
});
