import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Medication } from '../../types/medication';
import { PillVisualizer } from '../common/PillVisualizer';
import { MedicationModal } from './MedicationModal';
import { checkInteractions } from '../../services/interactionEngine';
import { formatTime12h } from '../../utils/dateUtils';
import {
  Plus,
  Edit2,
  Trash2,
  PackagePlus,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export const MedicationManager: React.FC = () => {
  const medications = useAppStore((state) => state.medications);
  const deleteMedication = useAppStore((state) => state.deleteMedication);
  const refillMedication = useAppStore((state) => state.refillMedication);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Cross check all current medications for polypharmacy interactions
  const allMedNames = medications.map((m) => m.name);
  const activeConflicts = checkInteractions(allMedNames);

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingMed(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Top Banner & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            Medication Regimen & Clinical Safety Manager
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Caretaker Administrative Portal: Dosage schedules, refill tracking, and DDI surveillance.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-md transition-all active:scale-95 min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* DDI Warning Banner if any conflicts exist */}
      {activeConflicts.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-lg">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span>Active Polypharmacy Interactions Detected ({activeConflicts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeConflicts.map((c, i) => (
              <div
                key={i}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 text-xs md:text-sm"
              >
                <div className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{c.drugA} + {c.drugB}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-200 text-amber-900">
                    {c.severity}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{c.clinicalRisk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((med) => {
          const isLowStock = med.refillTracking.currentStock <= med.refillTracking.refillThreshold;

          return (
            <div
              key={med.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <PillVisualizer visual={med.visual} size="lg" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        {med.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-500">
                        {med.genericName} • {med.dosage} ({med.route})
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {med.frequency.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(med)}
                      className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Edit medication"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Delete medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Schedules & Instructions */}
                <div className="space-y-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      Scheduled at:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {med.timeSlots.map((ts) => formatTime12h(ts.time)).join(', ')}
                      </strong>
                    </span>
                  </div>

                  {med.instructions && (
                    <p className="italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-slate-700 dark:text-slate-300">
                      "{med.instructions}"
                    </p>
                  )}
                </div>
              </div>

              {/* Refill Inventory Bar */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="text-slate-500">Supply: </span>
                  <strong className={isLowStock ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-900 dark:text-white'}>
                    {med.refillTracking.currentStock} doses remaining
                  </strong>
                  {isLowStock && (
                    <span className="ml-1 text-[10px] font-black uppercase text-red-600 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
                      Low
                    </span>
                  )}
                </div>

                <button
                  onClick={() => refillMedication(med.id, 30)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs min-h-[40px]"
                >
                  <PackagePlus className="w-4 h-4 text-emerald-600" />
                  <span>+30 Refill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Medication Add/Edit Modal */}
      <MedicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        medicationToEdit={editingMed}
      />
    </div>
  );
};
