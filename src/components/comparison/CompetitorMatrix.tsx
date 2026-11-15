import React, { useState } from 'react';
import { Check, Shield, Award, Sparkles } from 'lucide-react';

interface BenchmarkRow {
  dimension: string;
  omnicare: string;
  medisafe: string;
  carezone: string;
  appleHealth: string;
  pillpack: string;
  isOmnicareSuperior: boolean;
}

const BENCHMARK_DATA: BenchmarkRow[] = [
  {
    dimension: 'Shared Ecosystem & Role Delegation',
    omnicare: 'Tri-Role RBAC: Senior, Caretaker, and Family roles with scoped permissions and collaborative dashboards.',
    medisafe: 'Partial "Medfriend" caregiver link; no granular role tiers; requires paid subscription.',
    carezone: 'Centralized family journal; lacks strict RBAC and fine-grained permission enforcement.',
    appleHealth: 'Health Sharing is view-only; strictly locked to iOS devices; no caregiver management on Android/Web.',
    pillpack: 'Single pharmacy account; no real-time multi-user adherence dashboard.',
    isOmnicareSuperior: true,
  },
  {
    dimension: 'Passcode Security & Senior Simplicity',
    omnicare: 'Salted PBKDF2-HMAC-SHA256 4-digit Senior PIN + 6-digit Caretaker PIN, 15m idle timeout, 5-attempt lockout.',
    medisafe: 'Complex alphanumeric password or biometrics; frequent cognitive barrier for seniors.',
    carezone: 'Standard email/password login; complex account recovery friction.',
    appleHealth: 'Device PIN/Face ID only; no platform-independent profile passcode.',
    pillpack: 'Amazon account login (email, complex password, SMS 2FA); severe friction for seniors.',
    isOmnicareSuperior: true,
  },
  {
    dimension: 'Pill Visual Identification',
    omnicare: 'Interactive scalable SVG pill generator: 7 shapes, 11 colors, imprint codes, and single/double score lines.',
    medisafe: 'Generic 2D icons with limited static palette; no dynamic imprint generator.',
    carezone: 'Photo capture of Rx bottle labels; no visual pill synthesizer.',
    appleHealth: 'High quality visual builder, but strictly restricted to iOS ecosystem.',
    pillpack: 'Physical packaging photos; no dynamic visual identifier in app.',
    isOmnicareSuperior: true,
  },
  {
    dimension: 'Drug-Drug Interaction (DDI) Warning Engine',
    omnicare: 'Instant clinical DDI matrix covering 10 high-risk geriatric rules across 3 severity tiers (CONTRAINDICATED, MAJOR, MODERATE).',
    medisafe: 'Available only in paid Medisafe Premium subscription; paywalls basic patient safety.',
    carezone: 'None; relies on manual pharmacist consultation.',
    appleHealth: 'Passive warnings in US market only; no geriatric severity filtering.',
    pillpack: 'Pharmacist checks before dispensing; no real-time OTC or supplement conflict engine.',
    isOmnicareSuperior: true,
  },
  {
    dimension: 'Proactive Multi-Channel Escalation',
    omnicare: 'Automated 3-tier cascade: In-app chime -> T-15m reminder -> T+30m Caretaker & Family email escalation.',
    medisafe: 'Basic push notification; delayed Medfriend push; no multi-tier email pipeline.',
    carezone: 'Simple device push; no automated escalation cascade to caregivers.',
    appleHealth: 'Local device notifications only; zero cross-platform email/SMS escalation.',
    pillpack: 'Shipping notifications only; no daily adherence dose tracking or escalation.',
    isOmnicareSuperior: true,
  },
  {
    dimension: 'WCAG 2.1 AAA Senior Accessibility',
    omnicare: 'Dedicated Senior Mode with >=56px tap targets, >10:1 contrast, Web Speech voice readout, and tactile audio chimes.',
    medisafe: 'Standard buttons (<44px), ~4.5:1 contrast, no built-in voice readout.',
    carezone: 'Dense layouts, low contrast grey text, fails WCAG AAA.',
    appleHealth: 'High system accessibility, but no simplified single-action senior mode.',
    pillpack: 'Complex e-commerce interface, dense navigation, cognitive overload.',
    isOmnicareSuperior: true,
  },
  {
    dimension: 'Emergency SOS Broadcast',
    omnicare: 'One-touch SOS beacon with 3-second hold tremor safeguard and instant caregiver cascade with medical profile summary.',
    medisafe: 'None; no caregiver emergency beacon.',
    carezone: 'None.',
    appleHealth: 'Calls 911 via iOS; not integrated with medication adherence or family dashboard.',
    pillpack: 'None.',
    isOmnicareSuperior: true,
  },
];

export const CompetitorMatrix: React.FC = () => {
  const [filterSuperiorOnly, setFilterSuperiorOnly] = useState(false);

  const displayData = filterSuperiorOnly
    ? BENCHMARK_DATA.filter((row) => row.isOmnicareSuperior)
    : BENCHMARK_DATA;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 uppercase mb-2">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Competitive Benchmark Analysis
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            OmniCare vs Existing Market Solutions
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Comprehensive feature and accessibility matrix demonstrating superiority over Medisafe, CareZone, Apple Health, and PillPack.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSuperiorOnly(!filterSuperiorOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all min-h-[40px] ${
              filterSuperiorOnly
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {filterSuperiorOnly ? 'Show All Dimensions' : 'Filter OmniCare Standouts'}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-black text-slate-900 dark:text-white w-1/4">
                Clinical & Technical Dimension
              </th>
              <th className="p-4 font-black bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-x-2 border-blue-300 dark:border-blue-800 w-1/4">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>OmniCare (Our Platform)</span>
                </div>
              </th>
              <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Medisafe</th>
              <th className="p-4 font-bold text-slate-700 dark:text-slate-300">CareZone</th>
              <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Apple Health</th>
              <th className="p-4 font-bold text-slate-700 dark:text-slate-300">PillPack</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="p-4 font-black text-slate-900 dark:text-white align-top">
                  {row.dimension}
                </td>
                <td className="p-4 bg-blue-50/50 dark:bg-blue-950/30 text-slate-900 dark:text-white font-semibold border-x-2 border-blue-200 dark:border-blue-900 align-top">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{row.omnicare}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400 align-top">
                  {row.medisafe}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400 align-top">
                  {row.carezone}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400 align-top">
                  {row.appleHealth}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400 align-top">
                  {row.pillpack}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Banner */}
      <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600 shrink-0" />
          <div>
            <h4 className="font-black text-base text-blue-900 dark:text-blue-200">
              #1 Ranked Comprehensive Geriatric Adherence Architecture
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Surpasses existing commercial solutions through cryptographic access control, real-time polypharmacy safety, automated caregiver escalation, and full WCAG 2.1 AAA accessibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
