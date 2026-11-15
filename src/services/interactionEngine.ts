/**
 * Clinical Geriatric Drug-Drug Interaction (DDI) Warning Engine.
 * Evaluates polypharmacy drug combinations across 3 severity tiers:
 * CONTRAINDICATED, MAJOR, and MODERATE based on Beers Criteria and geriatric pharmacology.
 */
import { DDISeverity, DDIConflict } from '../types/medication';

export interface ClinicalRule {
  id: string;
  drugAKeywords: string[];
  drugBKeywords: string[];
  severity: DDISeverity;
  title: string;
  mechanism: string;
  clinicalRisk: string;
  recommendation: string;
  requiresCaretakerOverride: boolean;
}

export const GERIATRIC_DDI_RULES: ClinicalRule[] = [
  {
    id: 'DDI_WARFARIN_NSAIDS',
    drugAKeywords: ['warfarin', 'coumadin', 'jantoven'],
    drugBKeywords: ['aspirin', 'ibuprofen', 'advil', 'motrin', 'naproxen', 'aleve', 'meloxicam', 'celecoxib', 'diclofenac'],
    severity: 'CONTRAINDICATED',
    title: 'Severe Bleeding & Hemorrhage Risk',
    mechanism: 'Dual inhibition of hemostasis: NSAIDs inhibit platelet COX-1 and cause gastric mucosal injury while Warfarin inhibits vitamin K-dependent clotting factors.',
    clinicalRisk: 'Life-threatening upper gastrointestinal hemorrhage, intracranial bleeding, or major systemic hematoma.',
    recommendation: 'Avoid systemic NSAIDs in anticoagulated elderly patients. Consider acetaminophen for analgesia, or prescribe co-administered PPI if aspirin is clinically indicated.',
    requiresCaretakerOverride: true,
  },
  {
    id: 'DDI_ACEI_POTASSIUM',
    drugAKeywords: ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'losartan', 'valsartan'],
    drugBKeywords: ['potassium', 'k-dur', 'klor-con', 'spironolactone', 'eplerenone', 'triamterene'],
    severity: 'MAJOR',
    title: 'Severe Fatal Hyperkalemia Risk',
    mechanism: 'ACE inhibitors and ARBs suppress aldosterone excretion, reducing renal potassium clearance. Combining with potassium or potassium-sparing diuretics causes additive retention.',
    clinicalRisk: 'Life-threatening hyperkalemia (K+ > 6.0 mEq/L) leading to fatal cardiac conduction blocks, ventricular fibrillation, and cardiac arrest.',
    recommendation: 'Discontinue unmonitored potassium supplements. Regularly check serum potassium and renal function (eGFR).',
    requiresCaretakerOverride: true,
  },
  {
    id: 'DDI_METFORMIN_CONTRAST',
    drugAKeywords: ['metformin', 'glucophage', 'glumetza'],
    drugBKeywords: ['contrast', 'iodinated', 'omnipaque', 'visipaque', 'optiray', 'furosemide'],
    severity: 'MAJOR',
    title: 'Lactic Acidosis via Contrast Nephropathy',
    mechanism: 'Iodinated contrast or loop diuretic-induced volume depletion can precipitate acute renal impairment, impairing metformin clearance.',
    clinicalRisk: 'Metformin-associated lactic acidosis (MALA) with high geriatric mortality rate.',
    recommendation: 'Withhold metformin 48 hours prior to contrast imaging and re-evaluate renal function before restarting.',
    requiresCaretakerOverride: true,
  },
  {
    id: 'DDI_DIGOXIN_DIURETICS',
    drugAKeywords: ['digoxin', 'lanoxin'],
    drugBKeywords: ['furosemide', 'lasix', 'hydrochlorothiazide', 'hctz', 'torsemide', 'bumetanide', 'chlorthalidone'],
    severity: 'MAJOR',
    title: 'Digoxin Toxicity via Diuretic Hypokalemia',
    mechanism: 'Diuretic-induced renal potassium and magnesium wasting enhances myocardial sensitivity to digoxin.',
    clinicalRisk: 'Fatal ventricular arrhythmias, profound bradycardia, confusion, nausea, and yellow-green visual halos.',
    recommendation: 'Maintain serum potassium >= 4.0 mEq/L and monitor serum digoxin levels closely.',
    requiresCaretakerOverride: true,
  },
  {
    id: 'DDI_LEVODOPA_IRON',
    drugAKeywords: ['levodopa', 'carbidopa', 'sinemet', 'rytary'],
    drugBKeywords: ['iron', 'ferrous sulfate', 'ferrous gluconate', 'ferrous fumarate'],
    severity: 'MODERATE',
    title: 'Levodopa Chelation & Bioavailability Blockade',
    mechanism: 'Ferrous cations bind with levodopa in the gastrointestinal tract, forming unabsorbable chelates and reducing bioavailability by up to 55%.',
    clinicalRisk: 'Loss of Parkinsonian motor control, severe gait freezing, acute tremors, and rigidity.',
    recommendation: 'Separate oral administration by at least 2 to 3 hours.',
    requiresCaretakerOverride: false,
  },
  {
    id: 'DDI_QUINOLONES_ANTACIDS',
    drugAKeywords: ['ciprofloxacin', 'cipro', 'levofloxacin', 'levaquin', 'moxifloxacin'],
    drugBKeywords: ['calcium', 'magnesium', 'aluminum', 'tums', 'maalox', 'mylanta'],
    severity: 'MODERATE',
    title: 'Antibiotic Chelation & Bioavailability Failure',
    mechanism: 'Polyvalent metal cations form insoluble chelates with fluoroquinolones, preventing intestinal absorption.',
    clinicalRisk: 'Subtherapeutic antimicrobial levels leading to bacterial infection persistence or sepsis.',
    recommendation: 'Administer fluoroquinolone at least 2 hours before or 6 hours after cation-containing antacids.',
    requiresCaretakerOverride: false,
  },
  {
    id: 'DDI_AMLODIPINE_SIMVASTATIN',
    drugAKeywords: ['amlodipine', 'norvasc'],
    drugBKeywords: ['simvastatin', 'zocor'],
    severity: 'MODERATE',
    title: 'Increased Simvastatin Exposure & Rhabdomyolysis',
    mechanism: 'Amlodipine inhibits CYP3A4-mediated simvastatin metabolism, increasing systemic exposure by ~77%.',
    clinicalRisk: 'Severe statin-induced myopathy, acute muscle breakdown, and rhabdomyolysis.',
    recommendation: 'Cap simvastatin dose at 20mg daily or switch to rosuvastatin/atorvastatin.',
    requiresCaretakerOverride: false,
  },
  {
    id: 'DDI_SSRI_NSAIDS',
    drugAKeywords: ['citalopram', 'celexa', 'sertraline', 'zoloft', 'escitalopram', 'lexapro', 'fluoxetine', 'prozac'],
    drugBKeywords: ['ibuprofen', 'advil', 'naproxen', 'aleve', 'meloxicam', 'aspirin', 'diclofenac'],
    severity: 'MODERATE',
    title: 'Synergistic Upper Gastrointestinal Bleed Risk',
    mechanism: 'SSRIs impair platelet serotonin re-uptake and aggregation; NSAIDs inhibit thromboxane A2 and degrade gastric mucosa.',
    clinicalRisk: '3- to 6-fold increase in upper gastrointestinal hemorrhage.',
    recommendation: 'Use acetaminophen or prescribe gastroprotective PPI (e.g., omeprazole) if combination cannot be avoided.',
    requiresCaretakerOverride: false,
  },
  {
    id: 'DDI_BENZO_OPIOIDS',
    drugAKeywords: ['lorazepam', 'ativan', 'alprazolam', 'xanax', 'diazepam', 'valium', 'clonazepam', 'klonopin'],
    drugBKeywords: ['oxycodone', 'percocet', 'hydrocodone', 'tramadol', 'ultram', 'morphine', 'fentanyl'],
    severity: 'MAJOR',
    title: 'Profound Sedation & Fatal Respiratory Depression',
    mechanism: 'Additive central nervous system and brainstem respiratory center depression via dual GABA-A and mu-opioid activation.',
    clinicalRisk: 'Severe respiratory arrest, hypoxemic brain injury, falls, coma, and fatal overdose.',
    recommendation: 'Avoid concurrent prescribing in elderly patients. If essential, prescribe minimum effective doses and provide take-home naloxone.',
    requiresCaretakerOverride: true,
  },
  {
    id: 'DDI_BETABLOCKER_NON_DHP_CCB',
    drugAKeywords: ['metoprolol', 'lopressor', 'toprol', 'atenolol', 'bisoprolol', 'carvedilol'],
    drugBKeywords: ['diltiazem', 'cardizem', 'verapamil', 'calan'],
    severity: 'MAJOR',
    title: 'Severe Bradycardia, AV Block & Heart Failure',
    mechanism: 'Additive negative inotropic, chronotropic, and dromotropic depression at cardiac SA and AV nodes.',
    clinicalRisk: 'Profound sinus bradycardia (<40 bpm), third-degree AV block, syncope, and acute pulmonary edema.',
    recommendation: 'Avoid concurrent use in outpatients. Requires continuous telemetry if combination is medically necessary.',
    requiresCaretakerOverride: true,
  },
];

/**
 * Normalizes a drug name for keyword matching (lowercased, stripped of dosage/spaces).
 */
function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Checks whether a normalized medication name matches any keyword in a keyword list.
 */
function matchesKeyword(medName: string, keywords: string[]): boolean {
  const norm = normalizeName(medName);
  return keywords.some((kw) => norm.includes(kw) || kw.includes(norm));
}

/**
 * Evaluates a list of medication names for any clinical drug-drug interactions.
 */
export function checkInteractions(medicationNames: string[]): DDIConflict[] {
  const conflicts: DDIConflict[] = [];
  const checkedPairs = new Set<string>();

  for (let i = 0; i < medicationNames.length; i++) {
    for (let j = i + 1; j < medicationNames.length; j++) {
      const medA = medicationNames[i];
      const medB = medicationNames[j];
      const pairKey = [normalizeName(medA), normalizeName(medB)].sort().join('::');

      if (checkedPairs.has(pairKey)) continue;
      checkedPairs.add(pairKey);

      for (const rule of GERIATRIC_DDI_RULES) {
        const aMatchesA = matchesKeyword(medA, rule.drugAKeywords);
        const bMatchesB = matchesKeyword(medB, rule.drugBKeywords);

        const aMatchesB = matchesKeyword(medA, rule.drugBKeywords);
        const bMatchesA = matchesKeyword(medB, rule.drugAKeywords);

        if ((aMatchesA && bMatchesB) || (aMatchesB && bMatchesA)) {
          conflicts.push({
            drugA: medA,
            drugB: medB,
            severity: rule.severity,
            mechanism: rule.mechanism,
            clinicalRisk: rule.clinicalRisk,
            recommendation: rule.recommendation,
          });
        }
      }
    }
  }

  // Sort conflicts by severity: CONTRAINDICATED -> MAJOR -> MODERATE -> MINOR
  const severityRank: Record<DDISeverity, number> = {
    CONTRAINDICATED: 0,
    MAJOR: 1,
    MODERATE: 2,
    MINOR: 3,
  };

  return conflicts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

/**
 * Checks a proposed new medication against currently active medications.
 */
export function checkNewMedication(newMed: string, existingMeds: string[]): DDIConflict[] {
  const allMeds = [newMed, ...existingMeds];
  const allConflicts = checkInteractions(allMeds);
  const normNew = normalizeName(newMed);

  return allConflicts.filter(
    (c) => normalizeName(c.drugA).includes(normNew) || normalizeName(c.drugB).includes(normNew)
  );
}
