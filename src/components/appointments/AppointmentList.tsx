import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DoctorAppointment } from '../../types/appointment';
import { AppointmentModal } from './AppointmentModal';
import { VoiceReadoutButton } from '../senior/VoiceReadoutButton';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Video,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';

export const AppointmentList: React.FC = () => {
  const appointments = useAppStore((state) => state.appointments);
  const deleteAppointment = useAppStore((state) => state.deleteAppointment);
  const activeRole = useAppStore((state) => state.activeRole);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<DoctorAppointment | null>(null);

  const handleEdit = (appt: DoctorAppointment) => {
    setEditingAppt(appt);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAppt(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Doctor Appointments & Consultations
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Automated 24-hour and 2-hour multi-channel reminders dispatched to Senior, Caretaker, and Family.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-md transition-all active:scale-95 min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              No appointments currently scheduled
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Tap "Schedule Visit" to record upcoming clinical consultations.
            </p>
          </div>
        ) : (
          appointments.map((appt) => {
            const apptDate = new Date(appt.dateTime);
            const isUpcoming = apptDate.getTime() > Date.now();
            const dateStr = apptDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = apptDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            const spokenText = `Appointment with Doctor ${appt.doctorName}, specialist in ${appt.specialty}, scheduled for ${dateStr} at ${timeStr}. Location: ${appt.clinicName}. ${
              appt.preparationNotes ? `Special instructions: ${appt.preparationNotes}` : ''
            }`;

            return (
              <div
                key={appt.id}
                className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all hover:border-blue-400"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                        {appt.specialty}
                      </span>
                      {isUpcoming && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                      {appt.doctorName}
                    </h2>
                    <p className="text-base font-bold text-slate-600 dark:text-slate-400">
                      {appt.reasonForVisit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <VoiceReadoutButton
                      textToSpeak={spokenText}
                      size="normal"
                      label="Read Aloud"
                    />
                    <button
                      onClick={() => handleEdit(appt)}
                      className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Edit appointment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {activeRole !== 'SENIOR' && (
                      <button
                        onClick={() => deleteAppointment(appt.id)}
                        className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete appointment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      {dateStr} at <strong>{timeStr}</strong> ({appt.durationMinutes}m)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="truncate">
                      {appt.clinicName} — {appt.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{appt.phone}</span>
                  </div>
                </div>

                {/* Telehealth & Prep Notes */}
                {(appt.virtualLink || appt.preparationNotes) && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs md:text-sm">
                    {appt.preparationNotes && (
                      <div className="text-amber-800 dark:text-amber-300 font-semibold">
                        ⚠️ Prep Note: {appt.preparationNotes}
                      </div>
                    )}
                    {appt.virtualLink && (
                      <a
                        href={appt.virtualLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors ml-auto min-h-[36px]"
                      >
                        <Video className="w-4 h-4" />
                        <span>Launch Virtual Consultation</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointmentToEdit={editingAppt}
      />
    </div>
  );
};
