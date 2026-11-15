import React, { useState } from 'react';
import { Medication, PillShape, PillColor, PillForm, PillScore, RouteOfAdministration, MedicationFrequency, TimeSlotLabel, MealRelation, DDIConflict } from '../../types/medication';
import { PillVisualizer } from '../common/PillVisualizer';
import { DDIAlertModal } from './DDIAlertModal';
import { checkNewMedication } from '../../services/interactionEngine';
import { useAppStore } from '../../store/useAppStore';
import { X, AlertCircle } from 'lucide-react';
import { MedicationInputSchema } from '../../utils/validation';

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: Medication | null;
}

const SHAPES: PillShape[] = ['ROUND', 'OVAL', 'OBLONG', 'CAPSULE', 'TRIANGLE', 'SQUARE', 'DIAMOND'];
const COLORS: PillColor[] = ['WHITE', 'YELLOW', 'ORANGE', 'RED', 'PINK', 'PURPLE', 'BLUE', 'GREEN', 'BROWN', 'BEIGE', 'GRAY'];

export const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  medicationToEdit,
}) => {
  const profile = useAppStore((state) => state.profile);
  const existingMeds = useAppStore((state) => state.medications);
  const addMedication = useAppStore((state) => state.addMedication);
  const updateMedication = useAppStore((state) => state.updateMedication);

  // Form State
  const [name, setName] = useState(medicationToEdit?.name || '');
  const [genericName, setGenericName] = useState(medicationToEdit?.genericName || '');
  const [dosage, setDosage] = useState(medicationToEdit?.dosage || '10mg');
  const [route, setRoute] = useState<RouteOfAdministration>(medicationToEdit?.route || 'ORAL');
  const [frequency, setFrequency] = useState<MedicationFrequency>(medicationToEdit?.frequency || 'ONCE_DAILY');
  const [time, setTime] = useState(medicationToEdit?.timeSlots[0]?.time || '08:00');
  const [slotLabel, setSlotLabel] = useState<TimeSlotLabel>(medicationToEdit?.timeSlots[0]?.slotLabel || 'MORNING');
  const [mealRelation, setMealRelation] = useState<MealRelation>(medicationToEdit?.mealRelation || 'NO_RESTRICTION');
  const [instructions, setInstructions] = useState(medicationToEdit?.instructions || '');

  // Visual Attributes
  const [shape, setShape] = useState<PillShape>(medicationToEdit?.visual?.shape || 'ROUND');
  const [primaryColor, setPrimaryColor] = useState<PillColor>(medicationToEdit?.visual?.primaryColor || 'WHITE');
  const [imprint, setImprint] = useState(medicationToEdit?.visual?.imprint || '');
  const [score, setScore] = useState<PillScore>(medicationToEdit?.visual?.score || 'NONE');

  // Refill attributes
  const [currentStock, setCurrentStock] = useState<number>(medicationToEdit?.refillTracking?.currentStock ?? 30);
  const [refillThreshold, setRefillThreshold] = useState<number>(medicationToEdit?.refillTracking?.refillThreshold ?? 7);

  // DDI check and validation error
  const [ddiConflicts, setDdiConflicts] = useState<DDIConflict[]>([]);
  const [isDdiModalOpen, setIsDdiModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVisual = {
    shape,
    primaryColor,
    imprint,
    form: (shape === 'CAPSULE' ? 'CAPSULE' : 'TABLET') as PillForm,
    score,
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate inputs with Zod
    const payload = {
      name,
      genericName,
      dosage,
      route,
      frequency,
      timeSlots: [{ time, slotLabel, doseAmount: `1 ${shape.toLowerCase()}` }],
      mealRelation,
      instructions,
      visual: currentVisual,
      refillTracking: {
        currentStock,
        refillThreshold,
        pillsPerDose: 1,
      },
      status: 'ACTIVE' as const,
      startDate: new Date().toISOString().split('T')[0],
      acknowledgedDdiRisk: false,
    };

    const validation = MedicationInputSchema.safeParse(payload);
    if (!validation.success) {
      setValidationError(validation.error.errors[0]?.message || 'Please check form fields.');
      return;
    }

    // Run DDI engine check against other existing medications
    const otherMedNames = existingMeds
      .filter((m) => m.id !== medicationToEdit?.id)
      .map((m) => m.name);

    const conflicts = checkNewMedication(genericName || name, otherMedNames);
    if (conflicts.length > 0 && !medicationToEdit?.acknowledgedDdiRisk) {
      setDdiConflicts(conflicts);
      setIsDdiModalOpen(true);
      return;
    }

    finalizeSave();
  };

  const finalizeSave = (overrideNotes?: string) => {
    const medId = medicationToEdit ? medicationToEdit.id : `med-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const fullMed: Medication = {
      id: medId,
      seniorProfileId: profile.id,
      name,
      genericName,
      dosage,
      route,
      frequency,
      timeSlots: [{ time, slotLabel, doseAmount: `1 ${shape.toLowerCase()}` }],
      mealRelation,
      instructions,
      visual: currentVisual,
      refillTracking: {
        currentStock,
        refillThreshold,
        pillsPerDose: 1,
      },
      status: 'ACTIVE',
      startDate: medicationToEdit?.startDate || new Date().toISOString().split('T')[0],
      acknowledgedDdiRisk: !!overrideNotes,
      ddiOverrideNotes: overrideNotes,
      createdAt: medicationToEdit?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (medicationToEdit) {
      updateMedication(fullMed);
    } else {
      addMedication(fullMed);
    }

    setIsDdiModalOpen(false);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl my-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {medicationToEdit ? 'Edit Medication Regimen' : 'Add New Medication'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 p-3 my-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handlePreSubmit} className="space-y-5 my-4">
            {/* Pill Visual Live Preview Banner */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700">
                <PillVisualizer visual={currentVisual} size="lg" />
              </div>
              <div className="text-sm">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  Live Pill Visual Preview:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {primaryColor} {shape} with imprint "{imprint || 'none'}", score: {score}
                </p>
              </div>
            </div>

            {/* Names & Dosage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warfarin, Lisinopril"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Generic Chemical Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. warfarin sodium"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5mg, 500mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Route & Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Administration Route
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value as RouteOfAdministration)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="ORAL">Oral</option>
                  <option value="SUBLINGUAL">Sublingual</option>
                  <option value="TOPICAL">Topical</option>
                  <option value="INHALATION">Inhalation</option>
                  <option value="TRANSDERMAL">Transdermal Patch</option>
                  <option value="OPHTHALMIC">Ophthalmic Drops</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Prescription Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as MedicationFrequency)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="ONCE_DAILY">Once Daily</option>
                  <option value="TWICE_DAILY">Twice Daily</option>
                  <option value="THREE_TIMES_DAILY">Three Times Daily</option>
                  <option value="FOUR_TIMES_DAILY">Four Times Daily</option>
                  <option value="EVERY_OTHER_DAY">Every Other Day</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="AS_NEEDED_PRN">As Needed (PRN)</option>
                </select>
              </div>
            </div>

            {/* Time Slot & Meal Relation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Time *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time Slot Routine
                </label>
                <select
                  value={slotLabel}
                  onChange={(e) => setSlotLabel(e.target.value as TimeSlotLabel)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="EARLY_MORNING">Early Morning</option>
                  <option value="MORNING">Morning</option>
                  <option value="NOON">Noon</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                  <option value="BEDTIME">Bedtime</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meal Relation
                </label>
                <select
                  value={mealRelation}
                  onChange={(e) => setMealRelation(e.target.value as MealRelation)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="NO_RESTRICTION">No Restriction</option>
                  <option value="WITH_MEAL">With Meal</option>
                  <option value="BEFORE_MEAL">Before Meal</option>
                  <option value="AFTER_MEAL">After Meal</option>
                  <option value="EMPTY_STOMACH">Empty Stomach</option>
                </select>
              </div>
            </div>

            {/* Visual Pill Attributes Customizer */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                Elder Pill Visual Identifier
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shape
                  </label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value as PillShape)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  >
                    {SHAPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Color
                  </label>
                  <select
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value as PillColor)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  >
                    {COLORS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Imprint Code
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. L10, 500"
                    value={imprint}
                    onChange={(e) => setImprint(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Score Line
                  </label>
                  <select
                    value={score}
                    onChange={(e) => setScore(e.target.value as PillScore)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="NONE">None</option>
                    <option value="SINGLE_SCORE">Single Score Line</option>
                    <option value="DOUBLE_SCORE">Cross / Double Score</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Refill Inventory Tracking */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Supply (Pills Remaining)
                </label>
                <input
                  type="number"
                  min={0}
                  value={currentStock}
                  onChange={(e) => setCurrentStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Low-Stock Alert Threshold (Doses)
                </label>
                <input
                  type="number"
                  min={1}
                  value={refillThreshold}
                  onChange={(e) => setRefillThreshold(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Senior Instructions (Spoken Aloud)
              </label>
              <textarea
                rows={2}
                placeholder="Take 1 tablet in the morning with a full glass of water..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
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
                Save & Check Interactions
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DDI Alert Modal Override */}
      <DDIAlertModal
        isOpen={isDdiModalOpen}
        conflicts={ddiConflicts}
        onCancel={() => setIsDdiModalOpen(false)}
        onConfirmOverride={(notes) => finalizeSave(notes)}
      />
    </>
  );
};
