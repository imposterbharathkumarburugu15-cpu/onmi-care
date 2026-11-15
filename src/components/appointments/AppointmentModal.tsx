import React, { useState } from 'react';
import { DoctorAppointment } from '../../types/appointment';
import { useAppStore } from '../../store/useAppStore';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { AppointmentInputSchema } from '../../utils/validation';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit?: DoctorAppointment | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointmentToEdit,
}) => {
  const profile = useAppStore((state) => state.profile);
  const addAppointment = useAppStore((state) => state.addAppointment);
  const updateAppointment = useAppStore((state) => state.updateAppointment);

  const [doctorName, setDoctorName] = useState(appointmentToEdit?.doctorName || '');
  const [specialty, setSpecialty] = useState(appointmentToEdit?.specialty || '');
  const [clinicName, setClinicName] = useState(appointmentToEdit?.clinicName || '');
  const [address, setAddress] = useState(appointmentToEdit?.address || '');
  const [phone, setPhone] = useState(appointmentToEdit?.phone || '+1-555-019-4402');
  const [virtualLink, setVirtualLink] = useState(appointmentToEdit?.virtualLink || '');
  const [dateTime, setDateTime] = useState(
    appointmentToEdit?.dateTime
      ? new Date(appointmentToEdit.dateTime).toISOString().slice(0, 16)
      : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(appointmentToEdit?.durationMinutes || 30);
  const [reasonForVisit, setReasonForVisit] = useState(appointmentToEdit?.reasonForVisit || '');
  const [preparationNotes, setPreparationNotes] = useState(appointmentToEdit?.preparationNotes || '');
  const [remind24h, setRemind24h] = useState(appointmentToEdit?.remind24h ?? true);
  const [remind2h, setRemind2h] = useState(appointmentToEdit?.remind2h ?? true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      doctorName,
      specialty,
      clinicName,
      address,
      virtualLink: virtualLink || undefined,
      phone,
      dateTime: new Date(dateTime).toISOString(),
      durationMinutes,
      reasonForVisit,
      preparationNotes,
      remind24h,
      remind2h,
    };

    const validation = AppointmentInputSchema.safeParse(payload);
    if (!validation.success) {
      setErrorMsg(validation.error.errors[0]?.message || 'Please check form inputs.');
      return;
    }

    const apptId = appointmentToEdit?.id || `appt-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const fullAppt: DoctorAppointment = {
      id: apptId,
      seniorProfileId: profile.id,
      doctorName,
      specialty,
      clinicName,
      address,
      virtualLink: virtualLink || undefined,
      phone,
      dateTime: new Date(dateTime).toISOString(),
      durationMinutes,
      reasonForVisit,
      preparationNotes,
      status: 'SCHEDULED',
      remind24h,
      remind2h,
      notified24h: false,
      notified2h: false,
      createdAt: appointmentToEdit?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (appointmentToEdit) {
      updateAppointment(fullAppt);
    } else {
      addAppointment(fullAppt);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            {appointmentToEdit ? 'Edit Medical Appointment' : 'Schedule Medical Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 my-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Doctor Name *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Evelyn Thorne"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Specialty *
              </label>
              <input
                type="text"
                required
                placeholder="Cardiology, Endocrinology..."
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clinic / Hospital *
              </label>
              <input
                type="text"
                required
                placeholder="St. Jude Medical Pavilion"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clinic Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+1-555-019-4402"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Physical Address *
            </label>
            <input
              type="text"
              required
              placeholder="740 St. Jude Parkway, Suite 402, Springfield"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={10}
                max={240}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 30)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telehealth Virtual Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://telehealth.stjudemedical.org/..."
                value={virtualLink}
                onChange={(e) => setVirtualLink(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Visit *
            </label>
            <input
              type="text"
              required
              placeholder="6-Month Comprehensive Blood Pressure & ECG Evaluation"
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Senior Preparation Notes
            </label>
            <textarea
              rows={2}
              placeholder="Fasting required 8 hours prior; bring home blood pressure log..."
              value={preparationNotes}
              onChange={(e) => setPreparationNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Dual Reminders Toggles */}
          <div className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={remind24h}
                onChange={(e) => setRemind24h(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4"
              />
              24-Hour Email Reminder
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={remind2h}
                onChange={(e) => setRemind2h(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4"
              />
              2-Hour Urgent Reminder
            </label>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 min-h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg min-h-[48px]"
            >
              Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
