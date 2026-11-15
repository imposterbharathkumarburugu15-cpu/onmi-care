import React, { useState } from 'react';
import { DoseEvent, SkipReason } from '../../types/adherence';
import { PillVisualizer } from '../common/PillVisualizer';
import { VoiceReadoutButton } from './VoiceReadoutButton';
import { formatTime12h } from '../../utils/dateUtils';
import { Check, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface DoseCardProps {
  dose: DoseEvent;
  onTake: (doseId: string) => void;
  onSkip: (doseId: string, reason: SkipReason, notes?: string) => void;
  isHero?: boolean;
  isSeniorMode?: boolean;
}

export const DoseCard: React.FC<DoseCardProps> = ({
  dose,
  onTake,
  onSkip,
  isHero = false,
  isSeniorMode = true,
}) => {
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipReason, setSkipReason] = useState<SkipReason>('FASTING_OR_LABS');
  const [skipNotes, setSkipNotes] = useState('');

  const formattedTime = formatTime12h(dose.timeSlot);
  const spokenText = `At ${formattedTime}, take ${dose.medicationName}, ${dose.dosage}. ${
    dose.status === 'TAKEN' ? 'This has already been taken.' : 'Tap take now when ingested.'
  }`;

  const isTaken = dose.status === 'TAKEN';
  const isSkipped = dose.status === 'SKIPPED';
  const isMissed = dose.status === 'MISSED';

  const handleConfirmSkip = () => {
    onSkip(dose.id, skipReason, skipNotes);
    setShowSkipModal(false);
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-3xl transition-all border-2 ${
          isHero
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 shadow-xl'
            : isTaken
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
            : isMissed
            ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md'
        } p-5 md:p-6`}
      >
        {/* Status Badge Tag */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-black bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Clock className="w-4 h-4" />
              {formattedTime}
            </span>
            {isHero && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                NEXT DUE DOSE
              </span>
            )}
          </div>

          <div>
            {isTaken && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-black bg-emerald-600 text-white shadow-sm">
                <Check className="w-4 h-4" />
                TAKEN
              </span>
            )}
            {isSkipped && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-black bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                SKIPPED ({dose.skipReason?.replace(/_/g, ' ')})
              </span>
            )}
            {isMissed && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-black bg-red-600 text-white shadow-sm">
                <AlertCircle className="w-4 h-4" />
                MISSED
              </span>
            )}
          </div>
        </div>

        {/* Medication Details & Pill Visualizer */}
        <div className="flex items-center gap-4 my-2">
          {dose.visual && (
            <div className="p-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
              <PillVisualizer visual={dose.visual} size={isHero ? 'xl' : 'lg'} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3
              className={`font-black text-slate-900 dark:text-white truncate ${
                isHero ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
              }`}
            >
              {dose.medicationName}
            </h3>
            <p className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-300">
              {dose.dosage}
            </p>
            {dose.visual?.imprint && (
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                Pill Imprint: <span className="font-bold text-slate-800 dark:text-slate-200">{dose.visual.imprint}</span> ({dose.visual.primaryColor.toLowerCase()} {dose.visual.shape.toLowerCase()})
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!isTaken && (
            <button
              onClick={() => onTake(dose.id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl font-black transition-all shadow-lg active:scale-95 min-h-[56px] ${
                isHero
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white text-xl md:text-2xl ring-4 ring-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white text-lg'
              }`}
              aria-label={`Mark ${dose.medicationName} as taken`}
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>TAKE NOW</span>
            </button>
          )}

          <VoiceReadoutButton
            textToSpeak={spokenText}
            size={isSeniorMode ? 'senior' : 'normal'}
            label="Listen"
          />

          {!isTaken && !isSkipped && (
            <button
              onClick={() => setShowSkipModal(true)}
              className="px-4 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-sm md:text-base min-h-[56px]"
              aria-label="Skip this dose"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Skip Reason Modal */}
      {showSkipModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border-2 border-slate-300 dark:border-slate-700 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Reason for Skipping Dose
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Recording clinical reasons prevents streak penalties for medically advised skips.
            </p>

            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              Select Reason:
            </label>
            <select
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value as SkipReason)}
              className="w-full p-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium mb-4 min-h-[48px]"
            >
              <option value="FASTING_OR_LABS">Fasting for Medical Lab / Blood Test</option>
              <option value="PHYSICIAN_INSTRUCTED">Physician Advised Holding Dose</option>
              <option value="EXPERIENCING_SIDE_EFFECTS">Experiencing Discomfort or Side Effects</option>
              <option value="NAUSEA_OR_VOMITING">Nausea / Unable to keep pill down</option>
              <option value="MEDICATION_OUT_OF_STOCK">Awaiting Pharmacy Refill</option>
              <option value="OTHER">Other Reason</option>
            </select>

            <textarea
              placeholder="Optional notes for your caregiver..."
              value={skipNotes}
              onChange={(e) => setSkipNotes(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium mb-4 text-sm"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="flex-1 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md min-h-[48px]"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
