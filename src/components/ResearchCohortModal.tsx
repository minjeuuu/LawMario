import React, { useState } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  Shield,
  Star,
  Scale,
  Feather,
} from 'lucide-react';
import {
  MarioSuperStarIcon,
  MarioCoinBlockIcon,
  MarioWarpPipeIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioCoinIcon,
  MarioBrickStrip,
} from './MarioPrintIcons';
import { GROUP_MEMBER_DETAILS, GroupMemberDetail } from '../utils/engagementFeatures';
import { marioAudio } from '../utils/audio';

interface ResearchCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchCohortModal: React.FC<ResearchCohortModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [filterDomain, setFilterDomain] = useState<'all' | 'architecture' | 'leaves' | 'wages' | 'tenure'>('all');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredMembers = GROUP_MEMBER_DETAILS.filter((m) => {
    if (filterDomain === 'all') return true;
    if (filterDomain === 'architecture') return m.name.includes('CORPUZ');
    if (filterDomain === 'leaves') return m.specialization.includes('Leave') || m.specialization.includes('Maternity') || m.specialization.includes('Rest');
    if (filterDomain === 'wages') return m.specialization.includes('Wage') || m.specialization.includes('Hours') || m.specialization.includes('Overtime');
    if (filterDomain === 'tenure') return m.specialization.includes('Tenure') || m.specialization.includes('Contracting') || m.specialization.includes('Children') || m.specialization.includes('Prescriptive');
    return true;
  });

  const handleCopyCitation = (type: 'bluebook' | 'academic' | 'apa') => {
    marioAudio.playCoin();
    let text = '';
    if (type === 'bluebook') {
      text = 'Matthew Cesar Corpuz et al., Super Mario Philippine Labor Standards Memory Aid (2026) (covering P.D. No. 442, DOLE D.O. 174-17, R.A. 10361, R.A. 11210 & R.A. 11360).';
    } else if (type === 'apa') {
      text = 'Corpuz, M. C., Cruz, M. L., Fanged, T. F., Fernandez, J., Garcia, A. S., Garvida, M., Mañalac, A., Untalan, B. H., & Vila, H. D. (2026). Super Mario Labor Adventure: Philippine Labor Standards & Statutory Welfare Reviewer. Manila, Philippines.';
    } else {
      text = `RESEARCH COHORT ATTRIBUTION SLIP:
Lead Creator: Matthew Cesar Corpuz (Field Captain)
Senior Researchers:
- Mary Louise Cruz (Statutory Leaves & Maternity)
- Tracy Fae Fanged (Hours of Work & Overtime Formulas)
- Jelyn Fernandez (Rest Periods & Holiday Multipliers)
- Aeron Steven Garcia (17 Regions Wages & Wage Distortion)
- Mhelbourne Garvida (DOLE D.O. 174-17 Subcontracting)
- Abigail Mañalac (Kasambahay & Special Worker Classes)
- Beyonce Helein Untalan (Security of Tenure & Due Process)
- Hannah Daniela Vila (Prescriptive Periods & Procedural Rules)
Project: Super Mario Labor Adventure (Presidential Decree No. 442, as amended)`;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cohort-directory-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border-4 border-amber-400 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-700 via-amber-600 to-yellow-600 px-4 py-3 sm:px-6 sm:py-3.5 border-b-4 border-black flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Users className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 font-mono block">
                PHILIPPINE LABOR STANDARDS RESEARCH COHORT (9 MEMBERS)
              </span>
              <h2
                id="cohort-directory-title"
                className="text-lg sm:text-xl font-black text-white tracking-wide"
              >
                Authors &amp; Legal Research Directorate
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              marioAudio.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-red-950 text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-md"
            aria-label="Close Research Cohort Directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-100">
          {/* Masthead Banner */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-md">
                  <MarioSuperStarIcon size={28} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Research &amp; Development Cohort</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase font-mono">
                      Official 9 Authors
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Comprehensive legal syllabus synthesis for Philippine Bar examinees and labor law students.
                  </p>
                </div>
              </div>

              {/* Citation Copy Strip */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyCitation('bluebook')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-400/80 text-amber-300 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  title="Copy Philippine Law / Bluebook citation format"
                >
                  {copiedType === 'bluebook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Bluebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyCitation('apa')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-400/80 text-amber-300 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                  title="Copy APA format"
                >
                  {copiedType === 'apa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>APA 7th</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyCitation('academic')}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs inline-flex items-center gap-1 border border-black cursor-pointer shadow-xs"
                  title="Copy full roster slip"
                >
                  {copiedType === 'academic' ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Full Roster</span>
                </button>
              </div>
            </div>

            <MarioBrickStrip className="w-full h-2 rounded my-1 shadow-2xs" />

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Domain:</span>
              {[
                { id: 'all', label: 'All 9 Members' },
                { id: 'architecture', label: 'Lead Creator' },
                { id: 'wages', label: 'Hours & Wages' },
                { id: 'leaves', label: 'Statutory Leaves' },
                { id: 'tenure', label: 'Tenure & Due Process' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setFilterDomain(pill.id as any);
                    marioAudio.playClick();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    filterDomain === pill.id
                      ? 'bg-amber-400 text-slate-950 font-black border-black shadow-xs'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredMembers.map((member, idx) => {
              const isLead = member.name.includes('CORPUZ');
              return (
                <div
                  key={member.name}
                  className={`rounded-2xl p-4 border-2 flex flex-col justify-between gap-3 transition-all ${
                    isLead
                      ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border-amber-400 shadow-lg'
                      : 'bg-slate-800/90 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full font-black text-xs font-mono flex items-center justify-center shrink-0 border ${
                          isLead
                            ? 'bg-amber-400 text-slate-950 border-black'
                            : 'bg-slate-700 text-white border-slate-600'
                        }`}>
                          {GROUP_MEMBER_DETAILS.findIndex((m) => m.name === member.name) + 1}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                          {member.marioRole}
                        </span>
                      </div>
                      {isLead && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[9px] uppercase inline-flex items-center gap-1 border border-black shadow-2xs">
                          <MarioSuperStarIcon size={12} />
                          <span>Main Creator</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white leading-snug break-words [overflow-wrap:anywhere]">
                        {member.name}
                      </h4>
                      <p className="text-xs font-semibold text-amber-300 mt-0.5">
                        {member.role}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Domain Specialization:
                      </span>
                      <p className="leading-snug text-slate-200">
                        {member.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Labor Code P.D. 442</span>
                    <span className="text-amber-400 font-bold">Verified Contributor</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-4 py-3 sm:px-6 border-t-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <span>Super Mario Labor Adventure · Research Cohort Charter 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 font-bold cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
