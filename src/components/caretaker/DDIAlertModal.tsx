import React, { useState } from 'react';
import { DDIConflict, DDISeverity } from '../../types/medication';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface DDIAlertModalProps {
  conflicts: DDIConflict[];
  isOpen: boolean;
  onConfirmOverride: (notes: string) => void;
  onCancel: () => void;
}

const SEVERITY_BADGES: Record<DDISeverity, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  CONTRAINDICATED: {
    label: 'CONTRAINDICATED / CRITICAL',
    bg: 'bg-red-600',
    text: 'text-white',
    icon: <AlertOctagon className="w-5 h-5" />,
  },
  MAJOR: {
    label: 'MAJOR CLINICAL RISK',
    bg: 'bg-amber-600',
    text: 'text-white',
    icon: <ShieldAlert className="w-5 h-5" />,
  },
  MODERATE: {
    label: 'MODERATE INTERACTION',
    bg: 'bg-blue-600',
    text: 'text-white',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  MINOR: {
    label: 'MINOR INTERACTION',
    bg: 'bg-slate-600',
    text: 'text-white',
    icon: <Info className="w-5 h-5" />,
  },
};

export const DDIAlertModal: React.FC<DDIAlertModalProps> = ({
  conflicts,
  isOpen,
  onConfirmOverride,
  onCancel,
}) => {
  const [overrideNotes, setOverrideNotes] = useState('');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!isOpen || conflicts.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border-2 border-red-500 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl my-8">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertOctagon className="w-10 h-10 shrink-0" />
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Clinical Drug-Drug Interaction Warning
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The interaction engine detected {conflicts.length} potential polypharmacy conflict(s).
            </p>
          </div>
        </div>

        {/* Conflicts List */}
        <div className="space-y-4 my-4 max-h-[50vh] overflow-y-auto pr-1">
          {conflicts.map((conflict, i) => {
            const badge = SEVERITY_BADGES[conflict.severity];
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-extrabold text-base text-slate-900 dark:text-white">
                    {conflict.drugA} + {conflict.drugB}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${badge.bg} ${badge.text}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Mechanism:</strong> {conflict.mechanism}
                </p>

                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong className="text-red-900 dark:text-red-300">Clinical Risk:</strong> {conflict.clinicalRisk}
                </p>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs md:text-sm text-blue-900 dark:text-blue-200">
                  <strong>Recommendation:</strong> {conflict.recommendation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Override Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              className="mt-1 w-5 h-5 rounded text-red-600 focus:ring-red-500 shrink-0"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              I am an authorized Caretaker / Clinical Provider. I have reviewed the pharmacological risks and confirm that physician monitoring is in place.
            </span>
          </label>

          <input
            type="text"
            placeholder="Clinical Justification Note (e.g. Approved by Dr. Thorne with routine lab check)"
            value={overrideNotes}
            onChange={(e) => setOverrideNotes(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors min-h-[48px]"
            >
              Cancel & Adjust Medication
            </button>
            <button
              onClick={() => onConfirmOverride(overrideNotes)}
              disabled={!hasAcknowledged}
              className={`flex-1 py-3 rounded-xl font-bold transition-all min-h-[48px] ${
                hasAcknowledged
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Authorize & Save Override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
