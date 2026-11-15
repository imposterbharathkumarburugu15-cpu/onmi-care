import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RoleSwitcher } from '../auth/RoleSwitcher';
import {
  Heart,
  Mail,
  AlertTriangle,
  Eye,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  onOpenOutbox: () => void;
  onOpenSos: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOutbox, onOpenSos }) => {
  const isSeniorMode = useAppStore((state) => state.isSeniorMode);
  const toggleSeniorMode = useAppStore((state) => state.toggleSeniorMode);
  const emailOutbox = useAppStore((state) => state.emailOutbox);
  const resetToDefaults = useAppStore((state) => state.resetToDefaults);
  const isSosActive = useAppStore((state) => state.isSosActive);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Omni<span className="text-blue-600 dark:text-blue-400">Care</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Elderly Health
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Smart Adherence & Shared Care Ecosystem
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Senior Mode Toggle */}
          <button
            onClick={toggleSeniorMode}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-bold text-xs md:text-sm border-2 transition-all min-h-[44px] ${
              isSeniorMode
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
            }`}
            title="Toggle WCAG 2.1 AAA High-Contrast Senior Mode"
          >
            <Eye className="w-4 h-4" />
            <span className="font-extrabold">Senior Mode: {isSeniorMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Role Switcher */}
          <RoleSwitcher />

          {/* Proactive Email Outbox Drawer Trigger */}
          <button
            onClick={onOpenOutbox}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs md:text-sm min-h-[44px]"
            title="View Proactive Email Notifications Ledger"
          >
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">Email Outbox</span>
            {emailOutbox.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                {emailOutbox.length}
              </span>
            )}
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSos}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs md:text-sm transition-all min-h-[44px] ${
              isSosActive
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-400 shadow-xl'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-95'
            }`}
            title="Emergency Caretaker SOS Beacon"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SOS</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={resetToDefaults}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Reset to default Eleanor Vance profile"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
