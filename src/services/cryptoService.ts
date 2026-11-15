/**
 * Cryptographic security, passcode hashing, session tokens, and RBAC authorization service.
 * Uses native Web Crypto API for salted PBKDF2-HMAC-SHA256 key derivation.
 */
import {
  UserRole,
  HashResult,
  Session,
  PermissionAction,
  ROLE_PERMISSIONS,
  RateLimitState,
} from '../types/auth';

const PBKDF2_ITERATIONS = 100000;
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

// In-memory rate limiting map per role
const rateLimitMap: Record<UserRole, RateLimitState> = {
  SENIOR: { role: 'SENIOR', failedAttempts: 0, lockoutUntil: null, lastAttemptAt: null },
  CARETAKER: { role: 'CARETAKER', failedAttempts: 0, lockoutUntil: null, lastAttemptAt: null },
  FAMILY: { role: 'FAMILY', failedAttempts: 0, lockoutUntil: null, lastAttemptAt: null },
};

/**
 * Converts a byte array to a hex string.
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a hex string to a Uint8Array byte array.
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time string equality comparison to prevent timing side-channel attacks.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generates a cryptographically secure 16-byte random salt as hex string.
 */
export function generateSalt(): string {
  const salt = new Uint8Array(16);
  globalThis.crypto.getRandomValues(salt);
  return bytesToHex(salt);
}

/**
 * Hashes a passcode using PBKDF2-HMAC-SHA256 with 100,000 iterations.
 */
export async function hashPasscode(passcode: string, existingSalt?: string): Promise<HashResult> {
  const salt = existingSalt || generateSalt();
  const saltBytes = hexToBytes(salt);

  const enc = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 32 bytes
  );

  const hash = bytesToHex(new Uint8Array(derivedBits));
  return { hash, salt };
}

/**
 * Verifies a provided passcode against stored salt and expected hash using constant-time comparison.
 */
export async function verifyPasscode(
  passcode: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  const result = await hashPasscode(passcode, salt);
  return constantTimeEqual(result.hash, expectedHash);
}

/**
 * Checks rate limiting / brute-force lockout status for a role.
 */
export function checkRateLimit(role: UserRole): { isLocked: boolean; remainingMs: number } {
  const state = rateLimitMap[role];
  const now = Date.now();

  if (state.lockoutUntil && state.lockoutUntil > now) {
    return {
      isLocked: true,
      remainingMs: state.lockoutUntil - now,
    };
  }

  if (state.lockoutUntil && state.lockoutUntil <= now) {
    // Lockout expired, reset attempts
    state.lockoutUntil = null;
    state.failedAttempts = 0;
  }

  return { isLocked: false, remainingMs: 0 };
}

/**
 * Records a failed passcode attempt and applies lockout if threshold reached.
 */
export function recordFailedAttempt(role: UserRole): { isLocked: boolean; attemptsLeft: number } {
  const state = rateLimitMap[role];
  const now = Date.now();

  state.lastAttemptAt = now;
  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    state.lockoutUntil = now + LOCKOUT_DURATION_MS;
    return { isLocked: true, attemptsLeft: 0 };
  }

  return {
    isLocked: false,
    attemptsLeft: MAX_FAILED_ATTEMPTS - state.failedAttempts,
  };
}

/**
 * Resets failed attempts after a successful authentication.
 */
export function resetRateLimit(role: UserRole): void {
  const state = rateLimitMap[role];
  state.failedAttempts = 0;
  state.lockoutUntil = null;
  state.lastAttemptAt = null;
}

/**
 * Generates a high-entropy pseudo-random session token.
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(24);
  globalThis.crypto.getRandomValues(array);
  return bytesToHex(array);
}

/**
 * Creates an authenticated session with a 15-minute idle expiration.
 */
export function createSession(role: UserRole, profileId: string, displayName: string): Session {
  const now = Date.now();
  return {
    token: generateSessionToken(),
    role,
    profileId,
    displayName,
    createdAt: now,
    expiresAt: now + SESSION_TIMEOUT_MS,
  };
}

/**
 * Validates whether a session exists and has not expired.
 */
export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;
  if (!session.token || !session.expiresAt) return false;
  return Date.now() < session.expiresAt;
}

/**
 * Refreshes session idle expiration timestamp by 15 minutes.
 */
export function refreshSession(session: Session): Session {
  return {
    ...session,
    expiresAt: Date.now() + SESSION_TIMEOUT_MS,
  };
}

/**
 * Evaluates whether a role is authorized to perform an action per RBAC matrix.
 */
export function checkPermission(role: UserRole, action: PermissionAction): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return false;
  return rolePermissions[action] ?? false;
}
