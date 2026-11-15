/**
 * Doctor Appointments types.
 */

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface DoctorAppointment {
  id: string;
  seniorProfileId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  address: string;
  virtualLink?: string;
  phone: string;
  dateTime: string; // ISO 8601 string
  durationMinutes: number;
  reasonForVisit: string;
  preparationNotes: string;
  doctorInstructions?: string;
  status: AppointmentStatus;
  remind24h: boolean;
  remind2h: boolean;
  notified24h: boolean;
  notified2h: boolean;
  createdAt: string;
  updatedAt: string;
}
