import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/common/Header';
import { SeniorDashboard } from './components/senior/SeniorDashboard';
import { MedicationManager } from './components/caretaker/MedicationManager';
import { AppointmentList } from './components/appointments/AppointmentList';
import { FamilyDashboard } from './components/family/FamilyDashboard';
import { EmailOutboxDrawer } from './components/email/EmailOutboxDrawer';
import { EmergencySosModal } from './components/emergency/EmergencySosModal';
import { CompetitorMatrix } from './components/comparison/CompetitorMatrix';
import {
  Heart,
  Pill,
  Calendar,
  Users,
  Award,
  AlertTriangle,
  ShieldCheck,
  Activity,
  FileCode2,
} from 'lucide-react';
import { exportFullFHIRBundle } from './services/fhirService';

export type ActiveTab = 'senior' | 'medications' | 'appointments' | 'family' | 'benchmark';

export const App: React.FC = () => {
  const activeRole = useAppStore((state) => state.activeRole);
  const isSeniorMode = useAppStore((state) => state.isSeniorMode);
  const isSosActive = useAppStore((state) => state.isSosActive);
  const profile = useAppStore((state) => state.profile);
  const medications = useAppStore((state) => state.medications);
  const adherenceStats = useAppStore((state) => state.adherenceStats);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('senior');
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [showFhirToast, setShowFhirToast] = useState(false);

  // When role changes, align default tab intelligently
  useEffect(() => {
    if (activeRole === 'SENIOR') {
      setActiveTab('senior');
    } else if (activeRole === 'CARETAKER') {
      setActiveTab('medications');
    } else if (activeRole === 'FAMILY') {
      setActiveTab('family');
    }
  }, [activeRole]);

  // Global Accessible Keyboard Shortcuts (Alt+S for Senior Mode, Alt+E for SOS)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        useAppStore.getState().toggleSeniorMode();
      } else if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setIsSosOpen(true);
      } else if (e.altKey && e.key === '1') {
        setActiveTab('senior');
      } else if (e.altKey && e.key === '2') {
        setActiveTab('medications');
      } else if (e.altKey && e.key === '3') {
        setActiveTab('appointments');
      } else if (e.altKey && e.key === '4') {
        setActiveTab('family');
      } else if (e.altKey && e.key === '5') {
        setActiveTab('benchmark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDownloadFhir = () => {
    const bundle = exportFullFHIRBundle(profile, medications, adherenceStats);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/fhir+json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR-R4-${profile.name.replace(/\s+/g, '_')}-health-record.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowFhirToast(true);
    setTimeout(() => setShowFhirToast(false), 4000);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isSeniorMode
          ? 'bg-amber-50/40 text-black font-semibold'
          : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* Top Header */}
      <Header
        onOpenOutbox={() => setIsOutboxOpen(true)}
        onOpenSos={() => setIsSosOpen(true)}
      />

      {/* Futuristic Clinical Telemetry Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-semibold border-b border-slate-800 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Core Engines: Online</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Cryptographic RBAC & Chained Ledger</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>DDI Rules: 10 Active</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadFhir}
              className="flex items-center gap-1 text-teal-400 hover:text-teal-300 hover:underline transition-colors"
              title="Download FHIR R4 JSON Clinical Interoperability Bundle"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Export FHIR R4 Bundle</span>
            </button>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Shortcuts: <kbd className="px-1 py-0.5 bg-slate-800 rounded text-[10px]">Alt+S</kbd> Senior Mode • <kbd className="px-1 py-0.5 bg-slate-800 rounded text-[10px]">Alt+E</kbd> SOS
            </span>
          </div>
        </div>
      </div>

      {/* Global Emergency Banner if SOS is active */}
      {isSosActive && (
        <div className="bg-red-600 text-white px-4 py-3 text-center font-black flex items-center justify-center gap-3 animate-pulse shadow-lg">
          <AlertTriangle className="w-6 h-6 fill-white text-red-600" />
          <span className="tracking-wide">
            EMERGENCY SOS IS ACTIVE FOR ELEANOR VANCE — CAREGIVERS & FAMILY NOTIFIED
          </span>
          <button
            onClick={() => setIsSosOpen(true)}
            className="underline font-bold text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl transition-all"
          >
            Open Dispatch Panel
          </button>
        </div>
      )}

      {/* Navigation Tabs with Modern Pill Styling */}
      <nav
        className="max-w-7xl mx-auto px-4 pt-4 sm:px-6"
        aria-label="Main Navigation Tabs"
      >
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('senior')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all min-h-[48px] ${
              activeTab === 'senior'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Elderly Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('medications')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all min-h-[48px] ${
              activeTab === 'medications'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Medications & Safety</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'medications'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {medications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all min-h-[48px] ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Doctor Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all min-h-[48px] ${
              activeTab === 'family'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family Network</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'family'
                  ? 'bg-white/25 text-white'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {adherenceStats.currentStreak}d Streak
            </span>
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all min-h-[48px] ${
              activeTab === 'benchmark'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Competitor Benchmark</span>
          </button>
        </div>
      </nav>

      {/* Main View Container */}
      <main className="pb-16 pt-2">
        {activeTab === 'senior' && <SeniorDashboard />}
        {activeTab === 'medications' && <MedicationManager />}
        {activeTab === 'appointments' && <AppointmentList />}
        {activeTab === 'family' && <FamilyDashboard />}
        {activeTab === 'benchmark' && <CompetitorMatrix />}
      </main>

      {/* Slide-out Email Outbox Drawer */}
      <EmailOutboxDrawer
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
      />

      {/* Emergency SOS Modal */}
      <EmergencySosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

      {/* FHIR Export Toast Notification */}
      {showFhirToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-teal-500/50 flex items-center gap-3 animate-bounce">
          <FileCode2 className="w-5 h-5 text-teal-400" />
          <div>
            <p className="font-bold text-sm">FHIR R4 Bundle Downloaded!</p>
            <p className="text-xs text-slate-400">Ready for hospital EHR import.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

