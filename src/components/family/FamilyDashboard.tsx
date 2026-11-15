import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AdherenceFeed } from './AdherenceFeed';
import {
  Heart,
  Flame,
  Award,
  User,
  Shield,
  MessageSquare,
  Send,
} from 'lucide-react';

export const FamilyDashboard: React.FC = () => {
  const profile = useAppStore((state) => state.profile);
  const adherenceStats = useAppStore((state) => state.adherenceStats);
  const [familyNote, setFamilyNote] = useState('');
  const [notesList, setNotesList] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([
    {
      id: 'note-1',
      sender: 'Nurse Sarah (Caretaker)',
      text: 'Eleanor had a great walk in the garden today. Morning blood pressure checked at 124/82.',
      time: 'Today, 11:30 AM',
    },
    {
      id: 'note-2',
      sender: 'Robert Vance (Son)',
      text: 'Visited Mom yesterday evening. Brought fresh fruits and confirmed evening pills.',
      time: 'Yesterday, 6:45 PM',
    },
  ]);

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyNote.trim()) return;

    setNotesList((prev) => [
      {
        id: `note-${Date.now()}`,
        sender: 'Robert Vance (Family)',
        text: familyNote.trim(),
        time: 'Just now',
      },
      ...prev,
    ]);
    setFamilyNote('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            Family Circle & Caregiver Network
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time adherence monitoring, health statistics, and shared caregiver notes for {profile.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
          <Shield className="w-5 h-5 text-emerald-600" />
          <span>Patient Status: Stable & Monitored</span>
        </div>
      </div>

      {/* Metrics Row: Adherence Percentage, Streak, Total Doses */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Compliance Gauge */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${adherenceStats.percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-black text-slate-900 dark:text-white">
              {adherenceStats.percentage}%
            </span>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              Overall Compliance
            </div>
            <div className="text-xs text-slate-500 font-medium">
              30-Day Medication Adherence
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-8 h-8 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {adherenceStats.currentStreak} Days
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Current Healthy Streak (Best: {adherenceStats.bestStreak}d)
            </div>
          </div>
        </div>

        {/* Total Taken */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {adherenceStats.totalTaken} of {adherenceStats.totalScheduled}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Scheduled Doses Completed
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Adherence Feed + Notes & Patient Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm">
            <AdherenceFeed />
          </div>
        </div>

        {/* Right Col: Notes & Emergency Profile */}
        <div className="space-y-6">
          {/* Patient Vitals Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Patient Profile
            </h3>
            <div className="space-y-2 text-xs md:text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Name:</strong> {profile.name} (Age {profile.age})</p>
              <p><strong>Blood Type:</strong> {profile.bloodType}</p>
              <p><strong>Primary Physician:</strong> {profile.primaryPhysician}</p>
              <p><strong>Emergency Contact:</strong> {profile.emergencyPhone}</p>
              <div className="pt-2">
                <span className="font-bold text-slate-900 dark:text-white">Known Allergies:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.allergies.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Caregiver Notes Board */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Caregiver Check-in Notes
            </h3>

            <form onSubmit={handlePostNote} className="space-y-2">
              <textarea
                rows={2}
                placeholder="Leave an update for other caregivers..."
                value={familyNote}
                onChange={(e) => setFamilyNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs md:text-sm"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors min-h-[38px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Care Note</span>
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {notesList.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{note.sender}</span>
                    <span>{note.time}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
