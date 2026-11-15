import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DoseCard } from './DoseCard';
import { VoiceReadoutButton } from './VoiceReadoutButton';
import { Toast } from '../common/Toast';
import { getTodayDateString, formatTime12h } from '../../utils/dateUtils';
import { Sparkles, Calendar, Flame } from 'lucide-react';
import { vocalizeConfirmation } from '../../services/speechService';

export const SeniorDashboard: React.FC = () => {
  const profile = useAppStore((state) => state.profile);
  const doseEvents = useAppStore((state) => state.doseEvents);
  const markDoseTaken = useAppStore((state) => state.markDoseTaken);
  const markDoseSkipped = useAppStore((state) => state.markDoseSkipped);
  const undoDoseStatus = useAppStore((state) => state.undoDoseStatus);
  const adherenceStats = useAppStore((state) => state.adherenceStats);
  const appointments = useAppStore((state) => state.appointments);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDoseId, setLastDoseId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getTodayDateString();
  const todaysDoses = doseEvents.filter((d) => (d.scheduledDate || d.scheduledTime.split('T')[0]) === todayStr);

  // Find next due dose
  const nextDue = todaysDoses.find((d) => d.status === 'SCHEDULED' || d.status === 'DUE' || d.status === 'REMINDED');

  const handleTake = async (doseId: string) => {
    const dose = todaysDoses.find((d) => d.id === doseId);
    await markDoseTaken(doseId);
    setLastDoseId(doseId);
    setToastMessage(`Marked ${dose?.medicationName || 'dose'} as taken!`);

    if (dose) {
      vocalizeConfirmation(dose.medicationName, adherenceStats.currentStreak + 1);
    }
  };

  const handleUndo = async () => {
    if (lastDoseId) {
      await undoDoseStatus(lastDoseId);
      setLastDoseId(null);
      setToastMessage('Dose action undone.');
    }
  };

  const fullScheduleSpeech = `Hello ${profile.name}. Today is ${currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })}. You have ${todaysDoses.length} scheduled doses. ${
    nextDue
      ? `Your next dose is ${nextDue.medicationName} at ${formatTime12h(nextDue.timeSlot)}.`
      : 'All scheduled doses for today have been taken!'
  }`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-8">
      {/* Elder Greeting & High-Visibility Clock Banner */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs md:text-sm font-black bg-white/20 backdrop-blur-md uppercase tracking-wider">
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {profile.name}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-bold mt-1">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Adherence Streak Badge */}
        <div className="flex flex-col items-center sm:items-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 text-slate-950 font-black shadow-lg">
            <Flame className="w-7 h-7 fill-slate-950" />
            <div className="text-left">
              <div className="text-xl md:text-2xl font-black leading-none">
                {adherenceStats.currentStreak} Days
              </div>
              <div className="text-xs uppercase font-extrabold tracking-wider">
                Adherence Streak
              </div>
            </div>
          </div>

          <VoiceReadoutButton
            textToSpeak={fullScheduleSpeech}
            size="senior"
            label="Hear Today's Schedule"
            className="w-full sm:w-auto justify-center bg-white text-slate-950 hover:bg-slate-100 border-none"
          />
        </div>
      </section>

      {/* Next Due Dose Hero Card */}
      {nextDue && (
        <section aria-labelledby="next-due-heading">
          <h2 id="next-due-heading" className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
            Next Scheduled Dose
          </h2>
          <DoseCard
            dose={nextDue}
            onTake={handleTake}
            onSkip={(id, r, n) => markDoseSkipped(id, r, n)}
            isHero={true}
            isSeniorMode={true}
          />
        </section>
      )}

      {/* All Today's Doses */}
      <section aria-labelledby="all-doses-heading" className="space-y-4">
        <h2 id="all-doses-heading" className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-between">
          <span>Today's Medication Schedule</span>
          <span className="text-base font-bold text-slate-500">
            {todaysDoses.filter((d) => d.status === 'TAKEN').length} of {todaysDoses.length} Taken
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todaysDoses.map((dose) => (
            <DoseCard
              key={dose.id}
              dose={dose}
              onTake={handleTake}
              onSkip={(id, r, n) => markDoseSkipped(id, r, n)}
              isHero={false}
              isSeniorMode={true}
            />
          ))}
        </div>
      </section>

      {/* Upcoming Medical Appointments Snapshot */}
      {appointments.length > 0 && (
        <section aria-labelledby="upcoming-appts-heading" className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border-2 border-slate-300 dark:border-slate-700">
          <h2 id="upcoming-appts-heading" className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Upcoming Medical Consultations
          </h2>
          <div className="space-y-3">
            {appointments.slice(0, 2).map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {appt.doctorName}
                  </h3>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {appt.specialty} — {appt.clinicName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(appt.dateTime).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <VoiceReadoutButton
                  textToSpeak={`Appointment with ${appt.doctorName} on ${new Date(appt.dateTime).toLocaleDateString()} at ${appt.clinicName}.`}
                  size="normal"
                  label="Listen"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onUndo={handleUndo}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
