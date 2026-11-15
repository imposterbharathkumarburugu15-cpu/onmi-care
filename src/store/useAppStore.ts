/**
 * Central Zustand reactive store for OmniCare platform with persistence and role guards.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole, Session, PasscodeCredential } from '../types/auth';
import { Medication, RefillTracking } from '../types/medication';
import { DoseEvent, DoseStatus, SkipReason, AdherenceStats } from '../types/adherence';
import { DoctorAppointment } from '../types/appointment';
import { EmailNotification } from '../types/notification';
import { AuditLogEntry } from '../types/audit';
import {
  SEED_PROFILE,
  SEED_MEDICATIONS,
  SEED_APPOINTMENTS,
  DEFAULT_PINS,
  SeniorProfile,
  generateSeedDoseEvents,
} from '../utils/seedData';
import {
  hashPasscode,
  verifyPasscode,
  createSession,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from '../services/cryptoService';
import { createAuditEntry } from '../services/auditService';
import { calculateAdherence } from '../services/adherenceEngine';
import {
  queueEmailNotification,
  renderEmergencySosTemplate,
} from '../services/emailDispatcher';
import { playPillTakenChime, playSosAlarm } from '../services/soundService';

export interface AppState {
  // Profile & Authentication
  profile: SeniorProfile;
  activeRole: UserRole;
  session: Session | null;
  credentials: Record<UserRole, PasscodeCredential | null>;
  isSeniorMode: boolean;

  // Domain Data
  medications: Medication[];
  doseEvents: DoseEvent[];
  appointments: DoctorAppointment[];
  adherenceStats: AdherenceStats;
  emailOutbox: EmailNotification[];
  auditLog: AuditLogEntry[];

  // Emergency SOS State
  isSosActive: boolean;
  sosTriggeredAt: string | null;

  // Actions
  loginWithPasscode: (role: UserRole, passcode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleSeniorMode: () => void;
  setRole: (role: UserRole) => void;

  // Medication Actions
  addMedication: (med: Medication) => Promise<{ success: boolean; error?: string }>;
  updateMedication: (med: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  refillMedication: (id: string, refillCount: number) => Promise<void>;

  // Dose Adherence Actions
  markDoseTaken: (doseId: string) => Promise<void>;
  markDoseSkipped: (doseId: string, reason: SkipReason, notes?: string) => Promise<void>;
  undoDoseStatus: (doseId: string) => Promise<void>;

  // Appointment Actions
  addAppointment: (appt: DoctorAppointment) => Promise<void>;
  updateAppointment: (appt: DoctorAppointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Emergency SOS Actions
  triggerSos: () => Promise<void>;
  resolveSos: () => Promise<void>;

  // Outbox & Notification Actions
  sendEmailNotification: (notification: Omit<EmailNotification, 'id' | 'sentAt' | 'status'>) => void;
  clearOutbox: () => void;

  // Reset demo state
  resetToDefaults: () => void;
}

const initialDoseEvents = generateSeedDoseEvents();
const initialAdherenceStats = calculateAdherence(initialDoseEvents);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: SEED_PROFILE,
      activeRole: 'SENIOR',
      session: createSession('SENIOR', SEED_PROFILE.id, SEED_PROFILE.name),
      credentials: {
        SENIOR: null,
        CARETAKER: null,
        FAMILY: null,
      },
      isSeniorMode: true,
      medications: SEED_MEDICATIONS,
      doseEvents: initialDoseEvents,
      appointments: SEED_APPOINTMENTS,
      adherenceStats: initialAdherenceStats,
      emailOutbox: [],
      auditLog: [],
      isSosActive: false,
      sosTriggeredAt: null,

      loginWithPasscode: async (role: UserRole, passcode: string) => {
        // 1. Rate limiting check
        const rateCheck = checkRateLimit(role);
        if (rateCheck.isLocked) {
          const secondsRemaining = Math.ceil(rateCheck.remainingMs / 1000);
          return {
            success: false,
            error: `Too many failed attempts. Role locked for ${secondsRemaining}s.`,
          };
        }

        // 2. Fetch or initialize credentials
        let cred = get().credentials[role];
        const defaultPin = DEFAULT_PINS[role];

        if (!cred) {
          // Initialize salt & hash for default PIN
          const hashed = await hashPasscode(defaultPin);
          cred = {
            role,
            salt: hashed.salt,
            hash: hashed.hash,
            iterations: 100000,
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            credentials: { ...state.credentials, [role]: cred },
          }));
        }

        // 3. Verify passcode
        const isValid = await verifyPasscode(passcode, cred.salt, cred.hash);
        if (!isValid) {
          const attemptResult = recordFailedAttempt(role);
          const lastEntry = get().auditLog[get().auditLog.length - 1];
          const auditEntry = await createAuditEntry(
            role,
            'AUTH_LOGIN_FAILED',
            'SECURITY',
            role,
            `Failed passcode attempt for role ${role}`,
            attemptResult.isLocked ? 'SECURITY' : 'WARNING',
            lastEntry
          );

          set((state) => ({
            auditLog: [...state.auditLog, auditEntry],
          }));

          if (attemptResult.isLocked) {
            return {
              success: false,
              error: 'Account locked due to 5 consecutive failed attempts (15 min lockout).',
            };
          }

          return {
            success: false,
            error: `Incorrect PIN. ${attemptResult.attemptsLeft} attempt(s) remaining.`,
          };
        }

        // Reset rate limit on success
        resetRateLimit(role);

        // 4. Create Session
        const displayName =
          role === 'SENIOR'
            ? get().profile.name
            : role === 'CARETAKER'
            ? 'Nurse Sarah (Caretaker)'
            : 'Robert Vance (Family)';

        const newSession = createSession(role, get().profile.id, displayName);

        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          role,
          'AUTH_LOGIN_SUCCESS',
          'SECURITY',
          role,
          `Authenticated successfully as ${role}`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          session: newSession,
          activeRole: role,
          isSeniorMode: role === 'SENIOR',
          auditLog: [...state.auditLog, auditEntry],
        }));

        return { success: true };
      },

      logout: () => {
        set({
          session: null,
          activeRole: 'SENIOR',
          isSeniorMode: true,
        });
      },

      toggleSeniorMode: () => {
        set((state) => ({ isSeniorMode: !state.isSeniorMode }));
      },

      setRole: (role: UserRole) => {
        set({
          activeRole: role,
          isSeniorMode: role === 'SENIOR',
        });
      },

      addMedication: async (med: Medication) => {
        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'MEDICATION_CREATED',
          'MEDICATION',
          med.id,
          `Created medication ${med.name} (${med.dosage})`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          medications: [...state.medications, med],
          auditLog: [...state.auditLog, auditEntry],
        }));

        return { success: true };
      },

      updateMedication: async (med: Medication) => {
        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'MEDICATION_UPDATED',
          'MEDICATION',
          med.id,
          `Updated medication ${med.name}`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          medications: state.medications.map((m) => (m.id === med.id ? med : m)),
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      deleteMedication: async (id: string) => {
        const target = get().medications.find((m) => m.id === id);
        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'MEDICATION_DELETED',
          'MEDICATION',
          id,
          `Deleted medication ${target?.name || id}`,
          'WARNING',
          lastEntry
        );

        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      refillMedication: async (id: string, refillCount: number) => {
        const med = get().medications.find((m) => m.id === id);
        if (!med) return;

        const updatedRefill: RefillTracking = {
          ...med.refillTracking,
          currentStock: med.refillTracking.currentStock + refillCount,
          lastRefillDate: new Date().toISOString(),
        };

        const updatedMed: Medication = {
          ...med,
          refillTracking: updatedRefill,
          updatedAt: new Date().toISOString(),
        };

        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'REFILL_LOGGED',
          'MEDICATION',
          id,
          `Added ${refillCount} pills to stock for ${med.name}. New stock: ${updatedRefill.currentStock}`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          medications: state.medications.map((m) => (m.id === id ? updatedMed : m)),
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      markDoseTaken: async (doseId: string) => {
        const nowIso = new Date().toISOString();
        const activeRole = get().activeRole;

        const doseTarget = get().doseEvents.find((ev) => ev.id === doseId);
        let medToUpdate: Medication | undefined;

        if (doseTarget) {
          const med = get().medications.find((m) => m.id === doseTarget.medicationId);
          if (med) {
            medToUpdate = {
              ...med,
              refillTracking: {
                ...med.refillTracking,
                currentStock: Math.max(0, med.refillTracking.currentStock - med.refillTracking.pillsPerDose),
              },
            };
          }
        }

        const updatedEvents = get().doseEvents.map((ev) => {
          if (ev.id === doseId) {
            return {
              ...ev,
              status: 'TAKEN' as DoseStatus,
              loggedAt: nowIso,
              takenBy: activeRole,
            };
          }
          return ev;
        });

        // Play feedback chime
        playPillTakenChime();

        // Calculate new adherence stats
        const newStats = calculateAdherence(updatedEvents);

        // Audit log
        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          activeRole,
          'DOSE_MARKED_TAKEN',
          'ADHERENCE',
          doseId,
          `Marked dose of ${doseTarget?.medicationName || 'medication'} as TAKEN`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          doseEvents: updatedEvents,
          medications: medToUpdate
            ? state.medications.map((m) => (m.id === medToUpdate!.id ? medToUpdate! : m))
            : state.medications,
          adherenceStats: newStats,
          auditLog: [...state.auditLog, auditEntry],
        }));

        // Low stock email trigger check
        if (medToUpdate && medToUpdate.refillTracking.currentStock <= medToUpdate.refillTracking.refillThreshold) {
          get().sendEmailNotification({
            to: get().profile.caretakerEmail,
            recipientRole: 'CARETAKER',
            subject: `[LOW STOCK] Refill Needed for ${medToUpdate.name}`,
            htmlBody: `<p>Medication <strong>${medToUpdate.name}</strong> has reached low stock (${medToUpdate.refillTracking.currentStock} doses remaining). Please request a pharmacy refill.</p>`,
            category: 'UPCOMING_DOSE',
            escalationLevel: 1,
          });
        }
      },

      markDoseSkipped: async (doseId: string, reason: SkipReason, notes?: string) => {
        const nowIso = new Date().toISOString();
        const activeRole = get().activeRole;
        const doseTarget = get().doseEvents.find((ev) => ev.id === doseId);

        const updatedEvents = get().doseEvents.map((ev) => {
          if (ev.id === doseId) {
            return {
              ...ev,
              status: 'SKIPPED' as DoseStatus,
              loggedAt: nowIso,
              takenBy: activeRole,
              skipReason: reason,
              skipNotes: notes,
            };
          }
          return ev;
        });

        const newStats = calculateAdherence(updatedEvents);

        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          activeRole,
          'DOSE_MARKED_SKIPPED',
          'ADHERENCE',
          doseId,
          `Marked dose of ${doseTarget?.medicationName || 'medication'} as SKIPPED (${reason})`,
          'WARNING',
          lastEntry
        );

        set((state) => ({
          doseEvents: updatedEvents,
          adherenceStats: newStats,
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      undoDoseStatus: async (doseId: string) => {
        const activeRole = get().activeRole;
        const updatedEvents = get().doseEvents.map((ev) => {
          if (ev.id === doseId) {
            return {
              ...ev,
              status: 'SCHEDULED' as DoseStatus,
              loggedAt: undefined,
              takenBy: undefined,
              skipReason: undefined,
              skipNotes: undefined,
            };
          }
          return ev;
        });

        const newStats = calculateAdherence(updatedEvents);

        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          activeRole,
          'DOSE_MARKED_MISSED',
          'ADHERENCE',
          doseId,
          `Undid dose status for ${doseId}`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          doseEvents: updatedEvents,
          adherenceStats: newStats,
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      addAppointment: async (appt: DoctorAppointment) => {
        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'APPOINTMENT_CREATED',
          'APPOINTMENT',
          appt.id,
          `Scheduled appointment with ${appt.doctorName} on ${new Date(appt.dateTime).toLocaleDateString()}`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          appointments: [...state.appointments, appt],
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      updateAppointment: async (appt: DoctorAppointment) => {
        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'APPOINTMENT_UPDATED',
          'APPOINTMENT',
          appt.id,
          `Updated appointment with ${appt.doctorName}`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          appointments: state.appointments.map((a) => (a.id === appt.id ? appt : a)),
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      deleteAppointment: async (id: string) => {
        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'APPOINTMENT_CANCELLED',
          'APPOINTMENT',
          id,
          `Cancelled appointment ${id}`,
          'WARNING',
          lastEntry
        );

        set((state) => ({
          appointments: state.appointments.filter((a) => a.id !== id),
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      triggerSos: async () => {
        const nowIso = new Date().toISOString();
        playSosAlarm();

        const medNames = get().medications.map((m) => `${m.name} (${m.dosage})`);
        const emailBody = renderEmergencySosTemplate(get().profile.name, nowIso, medNames);

        // Queue emergency notification to Caretaker and Family
        const caretakerNotif = queueEmailNotification({
          to: get().profile.caretakerEmail,
          recipientRole: 'CARETAKER',
          subject: `[EMERGENCY SOS] Urgent Assistance Needed for ${get().profile.name}`,
          htmlBody: emailBody,
          category: 'EMERGENCY_SOS',
          escalationLevel: 3,
        });

        const familyNotif = queueEmailNotification({
          to: get().profile.familyEmail,
          recipientRole: 'FAMILY',
          subject: `[EMERGENCY SOS] Urgent Assistance Needed for ${get().profile.name}`,
          htmlBody: emailBody,
          category: 'EMERGENCY_SOS',
          escalationLevel: 3,
        });

        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'EMERGENCY_SOS_TRIGGERED',
          'EMERGENCY',
          get().profile.id,
          `Emergency SOS beacon activated by ${get().profile.name}`,
          'CRITICAL',
          lastEntry
        );

        set((state) => ({
          isSosActive: true,
          sosTriggeredAt: nowIso,
          emailOutbox: [caretakerNotif, familyNotif, ...state.emailOutbox],
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      resolveSos: async () => {
        const lastEntry = get().auditLog[get().auditLog.length - 1];
        const auditEntry = await createAuditEntry(
          get().activeRole,
          'EMERGENCY_SOS_RESOLVED',
          'EMERGENCY',
          get().profile.id,
          `Emergency SOS cleared and resolved by ${get().activeRole}`,
          'INFO',
          lastEntry
        );

        set((state) => ({
          isSosActive: false,
          sosTriggeredAt: null,
          auditLog: [...state.auditLog, auditEntry],
        }));
      },

      sendEmailNotification: (notification) => {
        const queued = queueEmailNotification(notification);
        set((state) => ({
          emailOutbox: [queued, ...state.emailOutbox],
        }));
      },

      clearOutbox: () => {
        set({ emailOutbox: [] });
      },

      resetToDefaults: () => {
        const seedEvents = generateSeedDoseEvents();
        set({
          profile: SEED_PROFILE,
          activeRole: 'SENIOR',
          session: createSession('SENIOR', SEED_PROFILE.id, SEED_PROFILE.name),
          isSeniorMode: true,
          medications: SEED_MEDICATIONS,
          doseEvents: seedEvents,
          appointments: SEED_APPOINTMENTS,
          adherenceStats: calculateAdherence(seedEvents),
          isSosActive: false,
          sosTriggeredAt: null,
          emailOutbox: [],
          auditLog: [],
        });
      },
    }),
    {
      name: 'omnicare-health-storage-v1',
      partialize: (state) => ({
        profile: state.profile,
        activeRole: state.activeRole,
        credentials: state.credentials,
        isSeniorMode: state.isSeniorMode,
        medications: state.medications,
        doseEvents: state.doseEvents,
        appointments: state.appointments,
        emailOutbox: state.emailOutbox,
        auditLog: state.auditLog,
        isSosActive: state.isSosActive,
      }),
    }
  )
);
