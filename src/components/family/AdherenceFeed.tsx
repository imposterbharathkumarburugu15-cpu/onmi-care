import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PillVisualizer } from '../common/PillVisualizer';
import { formatTime12h, formatRelativeDate } from '../../utils/dateUtils';
import { Check, AlertCircle, Clock } from 'lucide-react';

export const AdherenceFeed: React.FC = () => {
  const doseEvents = useAppStore((state) => state.doseEvents);

  // Sort doses newest first
  const sortedEvents = [...doseEvents].sort((a, b) => {
    return new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime();
  });

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Live Adherence Activity Feed
      </h3>

      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {sortedEvents.slice(0, 15).map((ev) => {
          const dateLabel = formatRelativeDate(ev.scheduledDate || ev.scheduledTime.split('T')[0]);
          const timeLabel = formatTime12h(ev.timeSlot);

          return (
            <div
              key={ev.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {ev.visual && (
                  <div className="p-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <PillVisualizer visual={ev.visual} size="sm" />
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">
                    {ev.medicationName} ({ev.dosage})
                  </div>
                  <div className="text-xs text-slate-500">
                    {dateLabel} at {timeLabel}
                  </div>
                  {ev.skipNotes && (
                    <div className="text-xs text-amber-700 dark:text-amber-300 italic mt-0.5">
                      Note: "{ev.skipNotes}"
                    </div>
                  )}
                </div>
              </div>

              <div>
                {ev.status === 'TAKEN' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    Taken
                  </span>
                )}
                {ev.status === 'SKIPPED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Skipped ({ev.skipReason?.replace(/_/g, ' ')})
                  </span>
                )}
                {ev.status === 'MISSED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missed
                  </span>
                )}
                {ev.status === 'SCHEDULED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Scheduled
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
