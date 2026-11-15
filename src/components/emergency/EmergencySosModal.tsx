import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
}) => {
  const profile = useAppStore((state) => state.profile);
  const isSosActive = useAppStore((state) => state.isSosActive);
  const triggerSos = useAppStore((state) => state.triggerSos);
  const resolveSos = useAppStore((state) => state.resolveSos);

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds hold threshold

    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        setIsHolding(false);
        triggerSos();
      }
    }, 50);
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border-4 border-red-600 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl text-center space-y-6 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-8 h-8 fill-red-600 text-white" />
            <span className="text-xl font-black tracking-wide uppercase">
              Emergency SOS Beacon
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isSosActive ? (
          /* Active Emergency State */
          <div className="space-y-4 p-6 bg-red-50 dark:bg-red-950/40 rounded-2xl border-2 border-red-500 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-xl">
              <AlertTriangle className="w-10 h-10 fill-white" />
            </div>

            <h3 className="text-2xl font-black text-red-700 dark:text-red-400">
              EMERGENCY BROADCAST ACTIVE!
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              High-priority broadcast dispatched to Caretaker ({profile.caretakerEmail}) and Family ({profile.familyEmail}). Emergency contacts have been notified.
            </p>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-red-300 text-left text-xs md:text-sm space-y-1">
              <p><strong>Patient:</strong> {profile.name} (Age {profile.age})</p>
              <p><strong>Primary Contact:</strong> {profile.emergencyPhone}</p>
              <p><strong>Hospital Physician:</strong> {profile.primaryPhysician}</p>
            </div>

            <button
              onClick={resolveSos}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-xl transition-all min-h-[56px]"
            >
              Mark Emergency Resolved & Stand Down
            </button>
          </div>
        ) : (
          /* Ready to Trigger State with Hold Safeguard */
          <div className="space-y-5">
            <p className="text-slate-600 dark:text-slate-300 text-base font-semibold">
              Hold the giant red button below for <strong>3 seconds</strong> to broadcast an emergency alert to your caregiver and family circle.
            </p>

            {/* Tremor Safeguard Giant Button */}
            <div className="relative flex justify-center py-4">
              <button
                onMouseDown={startHold}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onTouchStart={startHold}
                onTouchEnd={endHold}
                className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer ring-8 ring-red-200 dark:ring-red-900 select-none"
                aria-label="Hold to trigger Emergency SOS"
              >
                <AlertTriangle className="w-16 h-16 fill-white" />
                <span className="font-black text-xl tracking-wider mt-2">
                  {isHolding ? `${Math.round(holdProgress)}%` : 'HOLD SOS'}
                </span>
                <span className="text-xs uppercase opacity-80">
                  {isHolding ? 'Keep holding...' : '3s Hold Safeguard'}
                </span>
              </button>

              {/* Progress Ring */}
              {isHolding && (
                <div
                  className="absolute inset-0 rounded-full border-8 border-red-400 animate-spin"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-tremor protection prevents accidental triggers.</span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-sm min-h-[44px]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
