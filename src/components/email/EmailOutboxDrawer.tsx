import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { EmailNotification } from '../../types/notification';
import {
  dispatchUpcomingDoseReminder,
  dispatchMissedDoseEscalation,
} from '../../services/emailDispatcher';
import {
  X,
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle,
  Trash2,
} from 'lucide-react';

interface EmailOutboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailOutboxDrawer: React.FC<EmailOutboxDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const profile = useAppStore((state) => state.profile);
  const emailOutbox = useAppStore((state) => state.emailOutbox);
  const clearOutbox = useAppStore((state) => state.clearOutbox);

  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  if (!isOpen) return null;

  const handleSimulateUpcoming = () => {
    dispatchUpcomingDoseReminder(
      profile.seniorEmail,
      'SENIOR',
      profile.name,
      'Lisinopril',
      '10mg',
      '08:00 AM',
      'Take 1 tablet with a full glass of water.'
    );
    // Refresh local store view
    useAppStore.setState((prev) => ({
      emailOutbox: [
        {
          id: `email-${Date.now()}`,
          to: profile.seniorEmail,
          recipientRole: 'SENIOR',
          subject: 'Upcoming Medication: Lisinopril at 08:00 AM',
          htmlBody: `Simulated reminder sent to ${profile.seniorEmail}`,
          category: 'UPCOMING_DOSE',
          escalationLevel: 0,
          sentAt: new Date().toISOString(),
          status: 'DELIVERED',
        },
        ...prev.emailOutbox,
      ],
    }));
  };

  const handleSimulateMissed = () => {
    dispatchMissedDoseEscalation(
      profile.caretakerEmail,
      'CARETAKER',
      profile.name,
      'Nurse Sarah',
      'Metformin',
      '500mg',
      '08:00 AM',
      2
    );
    useAppStore.setState((prev) => ({
      emailOutbox: [
        {
          id: `email-${Date.now()}`,
          to: profile.caretakerEmail,
          recipientRole: 'CARETAKER',
          subject: `[ALERT] Missed Dose: Metformin for ${profile.name}`,
          htmlBody: `Simulated Tier 2 Escalation sent to Caretaker (${profile.caretakerEmail})`,
          category: 'MISSED_DOSE_ESCALATION',
          escalationLevel: 2,
          sentAt: new Date().toISOString(),
          status: 'DELIVERED',
        },
        ...prev.emailOutbox,
      ],
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border-l-2 border-slate-300 dark:border-slate-800 w-full max-w-xl h-full shadow-2xl flex flex-col justify-between animate-slide-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Proactive Notification Outbox
              </h2>
              <p className="text-xs text-slate-500">
                Simulated automated multi-channel email ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emailOutbox.length > 0 && (
              <button
                onClick={clearOutbox}
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Clear outbox history"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close drawer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dispatch Controls & Simulation Trigger */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider block mb-2">
            Simulate Automated Background Triggers:
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSimulateUpcoming}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors min-h-[40px]"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Upcoming Dose (-15m)</span>
            </button>
            <button
              onClick={handleSimulateMissed}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-colors min-h-[40px]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Missed Dose (+30m)</span>
            </button>
          </div>
        </div>

        {/* Email Ledger List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {emailOutbox.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Mail className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold">No email notifications dispatched yet.</p>
              <p className="text-xs">
                Trigger an upcoming or missed dose simulation above to test proactive notification dispatch.
              </p>
            </div>
          ) : (
            emailOutbox.map((email) => {
              const isUrgent = email.category === 'EMERGENCY_SOS' || email.escalationLevel >= 2;

              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isUrgent
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900 hover:border-red-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  } shadow-sm`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      To: {email.to} ({email.recipientRole})
                    </span>
                    <span className="text-slate-400">
                      {new Date(email.sentAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">
                    {email.subject}
                  </h3>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {email.category.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Delivered
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Email Preview Modal / Subview */}
        {selectedEmail && (
          <div
            className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 max-h-[45vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                HTML Email Preview: {selectedEmail.subject}
              </h4>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Close Preview
              </button>
            </div>
            <div
              className="p-3 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
