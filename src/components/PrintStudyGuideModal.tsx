import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  Award,
  NotebookPen,
  Users,
  Calendar,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  BookOpenCheck,
  Table as TableIcon,
  Scale,
  Eye,
  EyeOff,
  Layout,
  Columns,
  CheckSquare,
  FileText,
  FileDown,
  CheckCircle2,
  Clock,
  Palette,
  Type,
} from 'lucide-react';
import { ALL_LAW_TOPICS, WORLDS_METADATA } from '../data/laborLawData';
import { LABOR_BENEFITS_MULTIPLIER_LIST } from '../data/multiplierTable';
import {
  REGIONAL_MINIMUM_WAGES,
  KASAMBAHAY_MINIMUM_WAGES,
} from '../data/regionalWages';
import {
  GROUP_MEMBERS,
  StudyNoteItem,
  loadStudyNotes,
  DEFAULT_PRINT_FORMAT_OPTIONS,
  PrintGuideFormatOptions,
  filterTopicsForPrintGuide,
} from '../utils/engagementFeatures';
import { cleanRuleText } from '../utils/moduleFormatter';
import { marioAudio } from '../utils/audio';
import {
  applyPrintPageRule,
  clearPrintPageRule,
} from '../utils/printHelper';
import {
  ONE_PAGE_LEGAL_FORMULAS,
  ONE_PAGE_LEGAL_DEADLINES,
  ONE_PAGE_STATUTORY_LEAVE_CAPS,
} from '../utils/onePageSummaryData';
import {
  downloadOnePageSummaryA4Pdf,
  downloadCertificateLandscapePdf,
  downloadStudyGuideReviewerPdf,
} from '../utils/pdfExportService';
import {
  PRINT_COLOR_THEMES,
  PRINT_FONT_STYLES,
  getPrintThemeCatalogItem,
  getPrintFontCatalogItem,
} from '../utils/round8Features';

export type PrintModalDocumentMode = 'summary' | 'guide' | 'certificate';

interface PrintStudyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTopicIds: string[];
  coins: number;
  studyNotes?: StudyNoteItem[];
  initialMode?: PrintModalDocumentMode;
}

function stripInlineLegalCitations(text: string, includeCitations: boolean): string {
  const cleaned = cleanRuleText(text);
  if (includeCitations) return cleaned;
  return cleaned
    .replace(/\s*\((?:Art\.|Arts\.|R\.A\.|P\.D\.|D\.O\.|G\.R\.|Sec\.|Labor Code)[^)]*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getPrintColumnWidths(colCount: number): string[] {
  if (colCount <= 2) return ['34%', '66%'];
  if (colCount === 3) return ['26%', '37%', '37%'];
  if (colCount === 4) return ['24%', '18%', '29%', '29%'];
  if (colCount === 5) return ['20%', '15%', '19%', '23%', '23%'];
  const equal = `${(100 / colCount).toFixed(2)}%`;
  return Array.from({ length: colCount }, () => equal);
}

export const PrintStudyGuideModal: React.FC<PrintStudyGuideModalProps> = ({
  isOpen,
  onClose,
  completedTopicIds,
  studyNotes,
  initialMode,
}) => {
  const [includeGroupMembers, setIncludeGroupMembers] = useState(true);
  const [includeProgress, setIncludeProgress] = useState(true);
  const [includeMultipliers, setIncludeMultipliers] = useState(true);
  const [includeRegionalWages, setIncludeRegionalWages] = useState(true);
  const [includeLeavesMatrix, setIncludeLeavesMatrix] = useState(true);
  const [includePersonalNotes, setIncludePersonalNotes] = useState(true);
  const [matricesOnlyMode, setMatricesOnlyMode] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [isLivePreviewMode] = useState(true);
  const [layoutPreset, setLayoutPreset] = useState<
    'custom_builder' | 'compact_cheatsheet' | 'comprehensive_syllabus'
  >('custom_builder');
  const [paperMargins, setPaperMargins] = useState<'compact' | 'standard' | 'spacious'>('standard');
  const [includeCheckboxes, setIncludeCheckboxes] = useState(true);
  const [includeHypotheticals, setIncludeHypotheticals] = useState(true);
  const [fontSizeScale, setFontSizeScale] = useState<'small' | 'normal' | 'large'>('normal');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [twoColumnLayout, setTwoColumnLayout] = useState(false);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [includeFormulasCheatSheet, setIncludeFormulasCheatSheet] = useState(true);
  const [includeExecutiveMarioSummary, setIncludeExecutiveMarioSummary] = useState(true);
  const [includeTwoNoticeChecklist, setIncludeTwoNoticeChecklist] = useState(true);
  const [includeFourFoldControlTest, setIncludeFourFoldControlTest] = useState(true);
  const [includeRetirementFormulaBox, setIncludeRetirementFormulaBox] = useState(true);
  const [includeLatinMaxims, setIncludeLatinMaxims] = useState(true);
  const [includeHonorPledge, setIncludeHonorPledge] = useState(true);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [documentMode, setDocumentMode] = useState<PrintModalDocumentMode>(
    initialMode || 'summary'
  );
  const [certificateHonors, setCertificateHonors] = useState<string>('Summa Cum Laude · Super Star Rank');
  const [candidateName, setCandidateName] = useState('');
  const [pdfDownloadedNotice, setPdfDownloadedNotice] = useState(false);
  const [formatOptions, setFormatOptions] = useState<PrintGuideFormatOptions>(
    DEFAULT_PRINT_FORMAT_OPTIONS
  );
  const [selectedWorlds, setSelectedWorlds] = useState<string[]>(() =>
    WORLDS_METADATA.map((w) => w.id)
  );

  useEffect(() => {
    if (isOpen && initialMode) {
      setDocumentMode(initialMode);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) {
      clearPrintPageRule();
      return;
    }
    if (documentMode === 'certificate') {
      applyPrintPageRule('landscape', '6mm');
    } else if (documentMode === 'summary') {
      applyPrintPageRule('portrait', '8mm');
    } else {
      applyPrintPageRule(
        pageOrientation,
        pageOrientation === 'landscape' ? '8mm 10mm' : '10mm 12mm'
      );
    }
    return () => {
      clearPrintPageRule();
    };
  }, [isOpen, documentMode, pageOrientation]);

  if (!isOpen) return null;

  const resolvedNotes =
    studyNotes ??
    (typeof window !== 'undefined' ? loadStudyNotes(window.localStorage) : []);

  const totalTopics = ALL_LAW_TOPICS.length;
  const completedCount = completedTopicIds.length;
  const overallPercent = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalTopics)) * 100)
  );

  const filteredTopics = filterTopicsForPrintGuide(
    ALL_LAW_TOPICS,
    selectedWorlds,
    completedTopicIds,
    formatOptions.hideCompletedTopics
  );

  const toggleWorld = (worldId: string) => {
    marioAudio.playClick();
    setSelectedWorlds((prev) =>
      prev.includes(worldId) ? prev.filter((id) => id !== worldId) : [...prev, worldId]
    );
  };

  const updateFormat = <K extends keyof PrintGuideFormatOptions>(
    key: K,
    value: PrintGuideFormatOptions[K]
  ) => {
    marioAudio.playClick();
    setFormatOptions((prev) => ({ ...prev, [key]: value }));
  };

  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownloadPdf = () => {
    if (documentMode === 'summary') {
      marioAudio.playCoin();
      downloadOnePageSummaryA4Pdf({
        candidateName: candidateName.trim() || undefined,
        dateLabel: currentDate,
        colorAccent: formatOptions.colorAccent,
        fontStyle: formatOptions.fontStyle,
        includeWatermark,
        watermarkText: formatOptions.watermarkText,
      });
    } else if (documentMode === 'certificate') {
      marioAudio.playQuizComplete();
      downloadCertificateLandscapePdf({
        recipientName: candidateName.trim() || 'Distinguished Labor Standards Scholar',
        honors: certificateHonors,
        completedCount,
        totalCount: totalTopics,
        dateLabel: currentDate,
        colorAccent: formatOptions.colorAccent,
        fontStyle: formatOptions.fontStyle,
      });
    } else {
      marioAudio.playCoin();
      downloadStudyGuideReviewerPdf({
        orientation: pageOrientation,
        candidateName: candidateName.trim() || undefined,
        completedTopicIds,
        topics: filteredTopics,
        selectedWorlds,
        includeGroupMembers,
        includeProgress,
        includeMultipliers,
        includeRegionalWages,
        includeLeavesMatrix,
        includePersonalNotes,
        includeBarTips: formatOptions.includeBarTips,
        includeLegalCitations: formatOptions.includeLegalCitations,
        matricesOnlyMode,
        studyNotes: resolvedNotes,
        colorAccent: formatOptions.colorAccent,
        fontStyle: formatOptions.fontStyle,
        paperMargins,
        fontSizeScale,
        includeCheckboxes,
        includeWatermark,
        watermarkText: formatOptions.watermarkText,
        includeFormulasCheatSheet,
        includeFourFoldControlTest,
        includeTwoNoticeChecklist,
        includeRetirementFormulaBox,
        includeHonorPledge,
        blankNoteLinesCount: formatOptions.blankNoteLinesCount,
      });
    }
    setPdfDownloadedNotice(true);
    window.setTimeout(() => setPdfDownloadedNotice(false), 2600);
  };

  const isCompact = formatOptions.compactLayout;
  const activeThemeCatalog = getPrintThemeCatalogItem(formatOptions.colorAccent);
  const activeFontCatalog = getPrintFontCatalogItem(formatOptions.fontStyle);
  const isSerif = activeFontCatalog.category === 'serif';
  const isNavy = formatOptions.colorAccent === 'executive_navy';

  const bodyFontClass = activeFontCatalog.previewClass;
  const headingBorderClass = activeThemeCatalog.headingBorderClass;
  const subtleBoxClass = activeThemeCatalog.subtleBoxClass;
  const tableHeaderClass = activeThemeCatalog.tableHeaderClass;
  const summaryBannerHeaderClass = activeThemeCatalog.summaryBannerHeaderClass;
  const summaryPaperBgClass = activeThemeCatalog.summaryPaperBgClass;
  const certThemeClasses = activeThemeCatalog.certClasses;

  const handleSelectPreset = (
    preset: 'custom_builder' | 'compact_cheatsheet' | 'comprehensive_syllabus'
  ) => {
    setLayoutPreset(preset);
    marioAudio.playCoin();
    if (preset === 'compact_cheatsheet') {
      setFormatOptions((prev) => ({
        ...prev,
        compactLayout: true,
        includeBarTips: true,
        includeLegalCitations: false,
        pageBreakPerWorld: true,
        pageBreakPerModule: false,
      }));
      setPaperMargins('compact');
      setFontSizeScale('small');
      setMatricesOnlyMode(false);
    } else if (preset === 'comprehensive_syllabus') {
      setFormatOptions((prev) => ({
        ...prev,
        compactLayout: false,
        includeBarTips: true,
        includeLegalCitations: true,
        pageBreakPerWorld: true,
        pageBreakPerModule: true,
      }));
      setPaperMargins('standard');
      setFontSizeScale('normal');
      setMatricesOnlyMode(false);
    } else {
      setPaperMargins('standard');
      setFontSizeScale('normal');
    }
  };

  const marginPaddingClass =
    paperMargins === 'spacious'
      ? 'p-8 sm:p-14'
      : paperMargins === 'compact'
      ? 'p-4 sm:p-6'
      : isCompact
      ? 'p-5 sm:p-7'
      : 'p-6 sm:p-11';

  const fontScaleClass =
    fontSizeScale === 'large'
      ? 'text-sm sm:text-base leading-relaxed'
      : fontSizeScale === 'small'
      ? 'text-[10px] sm:text-[11px] leading-relaxed'
      : isCompact
      ? 'text-[11px] leading-relaxed'
      : 'text-xs leading-relaxed';

  const STATUTORY_LEAVES_MASTER_ROWS = [
    {
      leave: 'Service Incentive Leave (SIL)',
      basis: 'Art. 95, Labor Code',
      duration: '5 working days / year',
      eligibility: 'Rank-and-file with ≥ 1 year service (excludes <10 workers)',
      conversion: 'Commutable to cash at year-end if unused',
    },
    {
      leave: 'Expanded Maternity Leave',
      basis: 'R.A. No. 11210',
      duration: '105d live (+15d solo) / 60d miscarriage',
      eligibility: 'Every female worker per pregnancy regardless of civil status',
      conversion: 'Full pay (SSS + salary diff.); up to 7d transferable; non-cumulative',
    },
    {
      leave: 'Paternity Leave',
      basis: 'R.A. No. 8187',
      duration: '7 calendar days (+ up to 7d from mother = 14d)',
      eligibility: 'Married male cohabiting with legitimate spouse; first 4 deliveries',
      conversion: 'Full pay by employer; non-cumulative & non-convertible to cash',
    },
    {
      leave: 'Solo Parent Parental Leave',
      basis: 'R.A. 8972 / R.A. 11861',
      duration: '7 working days / year',
      eligibility: 'Valid Solo Parent ID + ≥ 6 months service (reduced from 1 yr)',
      conversion: 'Non-cumulative; forfeited if unused unless CBA stipulates',
    },
    {
      leave: 'Special Gynecological Leave',
      basis: 'R.A. No. 9710 (Sec. 18)',
      duration: 'Up to 2 months (full pay)',
      eligibility: '≥ 6 mos continuous aggregate service in last 12 mos + surgery',
      conversion: 'Non-cumulative & non-convertible to cash',
    },
    {
      leave: 'VAWC Victim Paid Leave',
      basis: 'R.A. No. 9262 (Sec. 43)',
      duration: 'Up to 10 days (extendible per BPO/TPO/PPO)',
      eligibility: 'Female victim-survivor with Barangay/Prosecutor/Court cert.',
      conversion: 'Non-cumulative & non-convertible to cash; administrative sanction if denied',
    },
  ];

  return (
    <div
      id="print-guide-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Print Study Guide and PDF Generator"
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/85 select-none overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible"
    >
      <div className="bg-slate-900 text-white w-full h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[92vh] max-w-6xl sm:rounded-3xl border-0 sm:border-4 border-slate-950 shadow-[0_16px_40px_rgba(0,0,0,0.9)] overflow-hidden my-auto flex flex-col pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pt-0 sm:pb-0 print:max-h-none print:h-auto print:max-w-full print:rounded-none print:border-0 print:shadow-none print:bg-white print:text-black print:overflow-visible">
        {/* Modal Top Bar — Direct PDF Export Studio (Zero window.print, Zero Mobile Overflow) */}
        <div className="bg-[#0f172a] px-3 sm:px-5 py-3 sm:py-4 border-b-2 border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0 print:hidden">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-amber-400 font-mario block truncate">
                  DIRECT A4 PDF EXPORT STUDIO
                </span>
                <h2 className="text-sm sm:text-lg font-black text-white font-display truncate">
                  {documentMode === 'summary'
                    ? 'ONE-PAGE A4 SUMMARY'
                    : documentMode === 'certificate'
                    ? 'LANDSCAPE CERTIFICATE'
                    : 'LABOR LAW REVIEWER'}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close PDF Export Studio"
              className="lg:hidden min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-2 flex-wrap">
            {/* Document Mode Segmented Switcher */}
            <div className="inline-flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs shrink-0 max-w-full overflow-x-auto no-scrollbar">
              <button
                type="button"
                data-testid="toggle-summary-mode-btn"
                onClick={() => {
                  setDocumentMode('summary');
                  marioAudio.playCoin();
                }}
                className={`min-h-[38px] px-2.5 sm:px-3 py-1 rounded-lg font-black cursor-pointer transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                  documentMode === 'summary'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>1-Page A4</span>
              </button>
              <button
                type="button"
                data-testid="toggle-guide-mode-btn"
                onClick={() => {
                  setDocumentMode('guide');
                  marioAudio.playClick();
                }}
                className={`min-h-[38px] px-2.5 sm:px-3 py-1 rounded-lg font-black cursor-pointer transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                  documentMode === 'guide'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpenCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Reviewer</span>
              </button>
              <button
                type="button"
                data-testid="toggle-certificate-mode-btn"
                onClick={() => {
                  setDocumentMode('certificate');
                  marioAudio.playQuizComplete();
                }}
                className={`min-h-[38px] px-2.5 sm:px-3 py-1 rounded-lg font-black cursor-pointer transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                  documentMode === 'certificate'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Certificate</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowControlPanel((prev) => !prev)}
                aria-expanded={showControlPanel}
                className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border-2 border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{showControlPanel ? 'Hide Options' : 'Options'}</span>
              </button>

              <button
                type="button"
                data-testid="download-active-pdf-btn"
                onClick={handleDownloadPdf}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileDown className="w-4 h-4 shrink-0" />
                <span>
                  {pdfDownloadedNotice
                    ? 'PDF Downloaded (.pdf)'
                    : documentMode === 'summary'
                    ? 'Download 1-Page PDF'
                    : documentMode === 'certificate'
                    ? 'Download Certificate PDF'
                    : 'Download Reviewer PDF'}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Print Study Guide"
                className="hidden lg:flex min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Always-Visible 12 Themes & 12 Fonts Quick Studio Bar (Applies to Preview AND Downloaded .pdf!) */}
        <div
          data-testid="print-quick-style-bar"
          className="bg-slate-950 px-3 sm:px-5 py-2.5 border-b border-slate-800 space-y-2.5 text-xs print:hidden flex-shrink-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <label
                htmlFor="print-quick-theme-select"
                className="text-[11px] font-black text-amber-300 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
              >
                <Palette className="w-3.5 h-3.5 shrink-0" />
                <span>Themes ({PRINT_COLOR_THEMES.length}):</span>
              </label>
              <select
                id="print-quick-theme-select"
                data-testid="print-quick-theme-select"
                value={formatOptions.colorAccent}
                onChange={(e) =>
                  updateFormat(
                    'colorAccent',
                    e.target.value as PrintGuideFormatOptions['colorAccent']
                  )
                }
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-amber-400 truncate"
              >
                {PRINT_COLOR_THEMES.map((themeItem) => (
                  <option key={themeItem.id} value={themeItem.id}>
                    {themeItem.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <label
                htmlFor="print-quick-font-select"
                className="text-[11px] font-black text-amber-300 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
              >
                <Type className="w-3.5 h-3.5 shrink-0" />
                <span>Fonts ({PRINT_FONT_STYLES.length}):</span>
              </label>
              <select
                id="print-quick-font-select"
                data-testid="print-quick-font-select"
                value={formatOptions.fontStyle}
                onChange={(e) =>
                  updateFormat(
                    'fontStyle',
                    e.target.value as PrintGuideFormatOptions['fontStyle']
                  )
                }
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-amber-400 truncate"
              >
                {PRINT_FONT_STYLES.map((fontItem) => (
                  <option key={fontItem.id} value={fontItem.id}>
                    {fontItem.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <label
                htmlFor="print-quick-name-input"
                className="text-[11px] font-black text-emerald-300 whitespace-nowrap shrink-0"
              >
                Learner Name:
              </label>
              <input
                id="print-quick-name-input"
                data-testid="print-quick-name-input"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Optional name on PDF..."
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Interactive 12 Color Theme Swatches + 12 Font Preview Pills */}
          <div
            data-testid="print-visual-themes-fonts-strip"
            className="pt-2 border-t border-slate-800/90 grid grid-cols-1 lg:grid-cols-2 gap-2"
          >
            {/* 12 Color Swatches */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-0.5">
                Palette:
              </span>
              {PRINT_COLOR_THEMES.map((themeItem) => {
                const isSelected = formatOptions.colorAccent === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    type="button"
                    data-testid={`print-theme-swatch-${themeItem.id}`}
                    onClick={() => updateFormat('colorAccent', themeItem.id)}
                    title={themeItem.label}
                    className={`min-h-[28px] px-2 py-1 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[0_1px_0_#000]'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 border border-white/40 ${themeItem.swatchSwatchClass}`}
                    />
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 -ml-1 ${themeItem.accentDotClass}`}
                    />
                    <span>{themeItem.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* 12 Font Style Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-0.5">
                Typeface:
              </span>
              {PRINT_FONT_STYLES.map((fontItem) => {
                const isSelected = formatOptions.fontStyle === fontItem.id;
                return (
                  <button
                    key={fontItem.id}
                    type="button"
                    data-testid={`print-font-pill-${fontItem.id}`}
                    onClick={() => updateFormat('fontStyle', fontItem.id)}
                    title={fontItem.label}
                    className={`min-h-[28px] px-2 py-1 rounded-lg border text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all ${
                      fontItem.previewClass
                    } ${
                      isSelected
                        ? 'bg-emerald-400 text-slate-950 border-black font-black shadow-[0_1px_0_#000]'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 font-semibold'
                    }`}
                  >
                    <span>Aa</span>
                    <span>{fontItem.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Control Panel for PDF Aesthetics & Content Toggles */}
        {showControlPanel && (
          <div
            data-testid="print-guide-control-panel"
            className="bg-slate-900/95 px-4 py-3.5 border-b border-slate-700 space-y-3 text-xs font-bold print:hidden flex-shrink-0 max-h-[42vh] overflow-y-auto"
          >
            {documentMode === 'summary' ? (
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="space-y-1 flex-1 max-w-md">
                  <label
                    htmlFor="summary-candidate-name"
                    className="text-[11px] text-amber-300 font-bold block"
                  >
                    Optional Examinee / Header Name on A4 Sheet:
                  </label>
                  <input
                    id="summary-candidate-name"
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g., Juan Dela Cruz · 2026 Bar Candidate"
                    className="min-h-[42px] w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <p className="text-emerald-300 font-bold">
                    Strictly formatted to fit 1 single A4 Portrait sheet (210mm × 297mm).
                  </p>
                  <p className="text-slate-400">
                    Includes {ONE_PAGE_LEGAL_FORMULAS.length} statutory pay formulas,{' '}
                    {ONE_PAGE_LEGAL_DEADLINES.length} prescriptive &amp; procedural deadlines, and{' '}
                    {ONE_PAGE_STATUTORY_LEAVE_CAPS.length} World 6 leave caps.
                  </p>
                </div>
              </div>
            ) : documentMode === 'certificate' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-amber-300 text-xs font-black uppercase font-mario">
                    OFFICIAL CERTIFICATE CUSTOMIZER
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Downloads directly as an A4 Landscape Diploma PDF (.pdf)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 space-y-1">
                    <label className="text-[11px] text-amber-300 font-bold block">
                      Learner Name on Diploma:
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g., Juan Dela Cruz · Labor Standards Scholar"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 space-y-1">
                    <label className="text-[11px] text-amber-300 font-bold block">
                      Conferred Honors / Distinction:
                    </label>
                    <select
                      value={certificateHonors}
                      onChange={(e) => setCertificateHonors(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                    >
                      <option value="Summa Cum Laude • Super Star Rank">Summa Cum Laude • Super Star Rank</option>
                      <option value="Magna Cum Laude • Fire Flower Mastery">Magna Cum Laude • Fire Flower Mastery</option>
                      <option value="Cum Laude • Super Mushroom Advocate">Cum Laude • Super Mushroom Advocate</option>
                      <option value="Highest Distinction in Philippine Labor Standards">Highest Distinction in Philippine Labor Standards</option>
                    </select>
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-white text-xs font-bold block truncate">Landscape A4 Diploma</span>
                      <span className="text-[10px] text-slate-400 block truncate">Direct .pdf download</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="min-h-[40px] px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer inline-flex items-center gap-1.5 shadow-[0_2px_0_#000] whitespace-nowrap shrink-0"
                    >
                      <FileDown className="w-3.5 h-3.5 shrink-0" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Quick Layout Presets */}
                <div className="space-y-1">
                  <span className="text-amber-300 text-[11px] font-semibold block">
                    Layout Preset:
                  </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('custom_builder')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                    layoutPreset === 'custom_builder'
                      ? 'bg-amber-400 text-slate-950 font-black border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Custom Checklist</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('compact_cheatsheet')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                    layoutPreset === 'compact_cheatsheet'
                      ? 'bg-amber-400 text-slate-950 font-black border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Compact Cheat Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('comprehensive_syllabus')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                    layoutPreset === 'comprehensive_syllabus'
                      ? 'bg-amber-400 text-slate-950 font-black border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Comprehensive Syllabus</span>
                </button>
              </div>
            </div>

            {/* Margins & Font Sizing Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-300 text-[10px] uppercase font-bold block">Page Margins:</span>
                <div className="flex items-center gap-1">
                  {(['compact', 'standard', 'spacious'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        marioAudio.playClick();
                        setPaperMargins(m);
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs capitalize cursor-pointer transition-all ${
                        paperMargins === m
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-300 text-[10px] uppercase font-bold block">Font Sizing:</span>
                <div className="flex items-center gap-1">
                  {(['small', 'normal', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        marioAudio.playClick();
                        setFontSizeScale(s);
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs capitalize cursor-pointer transition-all ${
                        fontSizeScale === s
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Print Aesthetics & Content Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Compact Layout</span>
                <input
                  type="checkbox"
                  checked={formatOptions.compactLayout}
                  onChange={(e) => updateFormat('compactLayout', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Include Bar Tips</span>
                <input
                  type="checkbox"
                  checked={formatOptions.includeBarTips}
                  onChange={(e) => updateFormat('includeBarTips', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Include Legal Citations</span>
                <input
                  type="checkbox"
                  checked={formatOptions.includeLegalCitations}
                  onChange={(e) => updateFormat('includeLegalCitations', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Review Checkboxes [ ]</span>
                <input
                  type="checkbox"
                  checked={includeCheckboxes}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeCheckboxes(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Include Bar Scenarios</span>
                <input
                  type="checkbox"
                  checked={includeHypotheticals}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeHypotheticals(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Hide Completed Topics</span>
                <input
                  type="checkbox"
                  checked={formatOptions.hideCompletedTopics}
                  onChange={(e) => updateFormat('hideCompletedTopics', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">2-Column Digest Mode</span>
                <input
                  type="checkbox"
                  checked={twoColumnLayout}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setTwoColumnLayout(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Watermark Stamp</span>
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeWatermark(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Formulas Cheat Sheet</span>
                <input
                  type="checkbox"
                  checked={includeFormulasCheatSheet}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeFormulasCheatSheet(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Mario Executive Summaries</span>
                <input
                  type="checkbox"
                  checked={includeExecutiveMarioSummary}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeExecutiveMarioSummary(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">2-Notice Due Process Flow</span>
                <input
                  type="checkbox"
                  checked={includeTwoNoticeChecklist}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeTwoNoticeChecklist(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">4-Fold Control Test Box</span>
                <input
                  type="checkbox"
                  checked={includeFourFoldControlTest}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeFourFoldControlTest(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Art. 302 Retirement (22.5d)</span>
                <input
                  type="checkbox"
                  checked={includeRetirementFormulaBox}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeRetirementFormulaBox(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Latin Jurisprudence Maxims</span>
                <input
                  type="checkbox"
                  checked={includeLatinMaxims}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeLatinMaxims(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Bar Candidate Honor Pledge</span>
                <input
                  type="checkbox"
                  checked={includeHonorPledge}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeHonorPledge(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <div className="min-h-[44px] flex items-center justify-between gap-2 bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white text-xs font-bold">Page Orientation:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      marioAudio.playClick();
                      setPageOrientation('portrait');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      pageOrientation === 'portrait'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      marioAudio.playClick();
                      setPageOrientation('landscape');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      pageOrientation === 'landscape'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div className="min-h-[44px] flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-600 sm:col-span-2 lg:col-span-3">
                <span className="text-amber-300 text-xs shrink-0 font-bold">Candidate Name on Cover:</span>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g., Atty. Juan Dela Cruz (Bar Reviewee)"
                  className="bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg flex-1 min-w-0 font-normal focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Aesthetic Typography, Ink Palette & Pagination Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-0.5">
              {/* Typography Font Family */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Typography Font:
                </span>
                <select
                  value={formatOptions.fontStyle}
                  onChange={(e) => updateFormat('fontStyle', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  <option value="editorial_serif">Editorial Law Serif (Georgia / Garamond)</option>
                  <option value="formal_georgia">Judicial Supreme Court Serif (Georgia Pro)</option>
                  <option value="academic_times">Academic Times (Traditional Legal Syllabus)</option>
                  <option value="warm_charter">Warm Editorial Treatise (Charter / Cambria)</option>
                  <option value="modern_sans">Modern Clean Sans (Plus Jakarta Sans)</option>
                  <option value="clean_inter">Executive Humanist Sans (Inter / Helvetica)</option>
                  <option value="condensed_narrow">High-Density Compact Sans (Roboto Condensed)</option>
                  <option value="dyslexic_sans">High-Legibility / Dyslexic-Friendly</option>
                  <option value="classic_monospace">Classic Legal Monospace (Courier Legal Brief)</option>
                  <option value="retro_mario_mono">Retro 8-Bit Mario Style (Press Start Monospace)</option>
                </select>
              </div>

              {/* Ink & Color Palette */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Color Accent Palette:
                </span>
                <select
                  value={formatOptions.colorAccent}
                  onChange={(e) => updateFormat('colorAccent', e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  <option value="executive_navy">Executive Navy &amp; Gold</option>
                  <option value="ink_saver_bw">Ink-Saver Pure B&amp;W</option>
                  <option value="supreme_court_crimson">Supreme Court Judicial Crimson</option>
                  <option value="forest_dole_emerald">DOLE Official Seal Emerald</option>
                  <option value="vintage_parchment">Vintage Legal Sepia Parchment</option>
                </select>
              </div>

              {/* Blank Hand-Written Note Lines */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Blank Note Lines:
                </span>
                <select
                  value={formatOptions.blankNoteLinesCount ?? 0}
                  onChange={(e) =>
                    updateFormat('blankNoteLinesCount', Number(e.target.value) as 0 | 3 | 5)
                  }
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  <option value={0}>0 Lines (Clean Reading)</option>
                  <option value={3}>3 Blank Lines (For Quick Margin Notes)</option>
                  <option value={5}>5 Blank Lines (For Exhaustive Case Notes)</option>
                </select>
              </div>

              {/* Watermark Selector */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Watermark Stamp:
                </span>
                <select
                  value={
                    !includeWatermark
                      ? 'none'
                      : formatOptions.watermarkText || 'CONFIDENTIAL BAR REVIEW'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'none') {
                      setIncludeWatermark(false);
                      updateFormat('watermarkText', '');
                    } else {
                      setIncludeWatermark(true);
                      updateFormat('watermarkText', val);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  <option value="none">No Watermark</option>
                  <option value="CONFIDENTIAL BAR REVIEW">CONFIDENTIAL BAR REVIEW</option>
                  <option value="OFFICIAL STUDY GUIDE">OFFICIAL STUDY GUIDE</option>
                  <option value="FOR ACADEMIC USE ONLY">FOR ACADEMIC USE ONLY</option>
                  <option value="DO NOT REPRODUCE">DO NOT REPRODUCE</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="min-h-[38px] inline-flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
                <input
                  type="checkbox"
                  checked={formatOptions.pageBreakPerWorld}
                  onChange={(e) => updateFormat('pageBreakPerWorld', e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Page Break Per World</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
                <input
                  type="checkbox"
                  checked={formatOptions.pageBreakPerModule}
                  onChange={(e) => updateFormat('pageBreakPerModule', e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Page Break Per Module</span>
              </label>

              <label
                data-testid="toggle-matrices-only-mode"
                className="min-h-[38px] inline-flex items-center gap-2 cursor-pointer bg-emerald-950/90 hover:bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/70 text-emerald-200"
              >
                <input
                  type="checkbox"
                  checked={matricesOnlyMode}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setMatricesOnlyMode(e.target.checked);
                  }}
                  className="accent-emerald-400"
                />
                <TableIcon className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Matrices Cheat Sheet Only</span>
              </label>
            </div>

            {/* Supplemental Reference Sections */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-amber-300 text-[11px] font-semibold mr-1">
                Reference Appendices:
              </span>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeGroupMembers}
                  onChange={(e) => setIncludeGroupMembers(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Author &amp; Group Credits</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeProgress}
                  onChange={(e) => setIncludeProgress(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>6-World Checklist</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeMultipliers}
                  onChange={(e) => setIncludeMultipliers(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Statutory Multipliers</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeRegionalWages}
                  onChange={(e) => setIncludeRegionalWages(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>17 Regions Minimum Wages</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeLeavesMatrix}
                  onChange={(e) => setIncludeLeavesMatrix(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>World 6 Leaves Matrix</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includePersonalNotes}
                  onChange={(e) => setIncludePersonalNotes(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Study Notes ({resolvedNotes.length})</span>
              </label>
            </div>

            {/* All 6 Worlds Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-amber-300 text-[11px] font-semibold mr-1">
                Modules ({filteredTopics.length} topics queued):
              </span>
              {WORLDS_METADATA.map((w) => {
                const active = selectedWorlds.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleWorld(w.id)}
                    className={`min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded-lg border text-[11px] transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-amber-400 text-slate-950 border-black font-black'
                        : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>
                      W{w.worldNumber}: {w.shortTitle}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedWorlds(WORLDS_METADATA.map((w) => w.id))}
                className="min-h-[38px] px-2.5 py-1 rounded-lg border border-slate-600 text-[11px] text-emerald-300 hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                All 6 Worlds
              </button>
            </div>
            </>
            )}
          </div>
        )}

        {/* Printable Document Preview & Direct PDF Sheet Preview */}
        <div
          className={`overflow-y-auto flex-1 select-text print:overflow-visible print:p-0 print:bg-white ${
            isLivePreviewMode
              ? 'p-3 sm:p-6 bg-neutral-900/95 flex justify-center'
              : 'p-3 sm:p-6 bg-slate-950/60'
          }`}
        >
          {documentMode === 'summary' ? (
            /* ==================== ONE-PAGE A4 LEGAL FORMULAS & STATUTORY DEADLINES SUMMARY ==================== */
            <div
              id="one-page-summary-sheet"
              data-testid="one-page-summary-sheet"
              data-theme={formatOptions.colorAccent}
              data-font={formatOptions.fontStyle}
              className={`${summaryPaperBgClass} ${bodyFontClass} p-4 sm:p-7 rounded-2xl border-2 shadow-2xl max-w-5xl w-full mx-auto space-y-4 select-text my-auto`}
            >
              {/* A4 Sheet Header */}
              <div className={`border-b-2 ${headingBorderClass} pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2`}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
                    PHILIPPINE LABOR STANDARDS · ONE-PAGE A4 MASTER SUMMARY
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                    KEY LEGAL FORMULAS, MULTIPLIERS &amp; STATUTORY DEADLINES
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    P.D. No. 442 (Labor Code, as amended), DOLE D.O. 174-17, R.A. 10361, R.A. 11210, R.A. 11360 &amp; R.A. 11861
                  </p>
                </div>
                <div className="text-left sm:text-right text-[11px] font-mono text-slate-700 shrink-0">
                  {candidateName.trim() && (
                    <div className="font-bold text-slate-950">{candidateName.trim()}</div>
                  )}
                  <div>Format: Single-Page A4 (210 × 297 mm)</div>
                  <div>Updated: {currentDate}</div>
                </div>
              </div>

              {/* Two-Column A4 Core Grid: Left = Formulas, Right = Deadlines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {/* Column 1: Key Legal Formulas */}
                <div className={`border ${subtleBoxClass} rounded-xl overflow-hidden bg-white`}>
                  <div className={`${summaryBannerHeaderClass} px-3 py-2 flex items-center justify-between gap-2`}>
                    <span className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>I. Key Statutory Pay Formulas ({ONE_PAGE_LEGAL_FORMULAS.length})</span>
                    </span>
                    <span className="text-[10px] font-mono opacity-85">Arts. 87–97 · 302</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {ONE_PAGE_LEGAL_FORMULAS.map((f) => (
                      <div key={f.id} className="px-3 py-1.5 text-[11px] leading-snug space-y-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-bold text-slate-900">{f.title}</span>
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">
                            {f.citation}
                          </span>
                        </div>
                        <div className="font-mono font-black text-emerald-800 text-[11px]">
                          {f.formula}
                        </div>
                        <p className="text-[10.5px] text-slate-600">{f.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Statutory Deadlines & Prescriptive Periods */}
                <div className={`border ${subtleBoxClass} rounded-xl overflow-hidden bg-white`}>
                  <div className={`${summaryBannerHeaderClass} px-3 py-2 flex items-center justify-between gap-2`}>
                    <span className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>II. Prescriptive &amp; Procedural Deadlines ({ONE_PAGE_LEGAL_DEADLINES.length})</span>
                    </span>
                    <span className="text-[10px] font-mono opacity-85">Arts. 297–306</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {ONE_PAGE_LEGAL_DEADLINES.map((d) => (
                      <div key={d.id} className="px-3 py-1.5 text-[11px] leading-snug space-y-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-bold text-slate-900">{d.claimOrAction}</span>
                          <span className="font-mono font-black text-red-700 shrink-0 tabular-nums">
                            {d.deadline}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-600">
                          <span className="font-semibold text-slate-700">{d.citation}:</span> {d.reckoningRule}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom A4 Strip: World 6 Statutory Leave Caps & Core Doctrines */}
              <div className={`border rounded-xl p-3 space-y-2 ${subtleBoxClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>III. World 6 Statutory Leave Caps &amp; Core Tests</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    One-Page Printer-Friendly A4 Reference
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px]">
                  {ONE_PAGE_STATUTORY_LEAVE_CAPS.map((lv) => (
                    <div
                      key={lv.leaveName}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
                    >
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-bold text-slate-900">{lv.leaveName}</span>
                        <span className="font-mono font-black text-amber-800 tabular-nums shrink-0">
                          {lv.cap}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 block">
                        {lv.citation} · {lv.rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : documentMode === 'certificate' ? (
            /* ==================== OFFICIAL CERTIFICATE OF STATUTORY MASTERY (A4 LANDSCAPE) ==================== */
            <div
              id="official-labor-certificate"
              data-testid="official-labor-certificate"
              data-theme={formatOptions.colorAccent}
              data-font={formatOptions.fontStyle}
              style={isLivePreviewMode && previewZoom !== 100 ? { zoom: `${previewZoom}%` } : undefined}
              className={`${certThemeClasses.paper} ${bodyFontClass} text-slate-950 p-5 sm:p-8 lg:px-12 lg:py-8 border-[6px] sm:border-[10px] rounded-2xl shadow-2xl max-w-5xl w-full lg:aspect-[1.414/1] mx-auto relative select-text flex flex-col justify-between gap-2 my-auto outline outline-3`}
            >
              {/* Corner Ornaments */}
              <div className={`absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 ${certThemeClasses.corner} flex items-center justify-center`}>
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className={`absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 ${certThemeClasses.corner} flex items-center justify-center`}>
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className={`absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 ${certThemeClasses.corner} flex items-center justify-center`}>
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className={`absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 ${certThemeClasses.corner} flex items-center justify-center`}>
                <Award className="w-3.5 h-3.5" />
              </div>

              {/* Header Seal & Title */}
              <div className="text-center space-y-1.5">
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-10 h-10 rounded-full border-2 ${certThemeClasses.sealCircle} flex items-center justify-center shrink-0`}>
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-600">
                      REPUBLIC OF THE PHILIPPINES · PHILIPPINE LABOR STANDARDS GUIDE
                    </p>
                    <p className="text-[9.5px] font-sans font-semibold tracking-wider text-slate-500 uppercase">
                      Department of Labor and Employment · Statutory &amp; Workplace Rights Mastery
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <h2 className={`text-xl sm:text-3xl lg:text-4xl font-black tracking-wide uppercase border-y-2 py-1.5 my-1 ${certThemeClasses.title}`}>
                    Certificate of Statutory Mastery
                  </h2>
                  <p className="text-xs sm:text-sm italic text-slate-700">
                    This is officially conferred upon
                  </p>
                </div>
              </div>

              {/* Recipient */}
              <div className="text-center py-1">
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight border-b-2 border-slate-900 pb-1 max-w-xl mx-auto">
                  {candidateName || 'Distinguished Labor Standards Scholar'}
                </h3>
                <p className={`text-xs sm:text-sm font-sans font-black tracking-widest uppercase mt-1.5 ${certThemeClasses.honors}`}>
                  {certificateHonors}
                </p>
              </div>

              {/* Body Certification text */}
              <div className="text-center space-y-2 max-w-3xl mx-auto">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  for demonstrating comprehensive statutory mastery and practical command across all Six Worlds of the <strong className="font-bold">Labor Code of the Philippines (Presidential Decree No. 442, as amended)</strong>, encompassing Hours of Work &amp; Overtime Rules, Wages &amp; D.O. 174 Subcontracting, Kasambahay Rights, Security of Tenure, and all Statutory Leaves.
                </p>

                {/* 6 World Badges Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 text-[10px] font-sans font-bold">
                  {WORLDS_METADATA.map((w) => (
                    <div key={w.id} className={`border px-1.5 py-1 rounded-lg text-center min-w-0 ${certThemeClasses.badge}`}>
                      <span className="block font-black font-mono">W{w.worldNumber}</span>
                      <span className="block leading-tight">{w.shortTitle}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures & Seal Footer */}
              <div className="pt-3 border-t-2 border-amber-600/60 grid grid-cols-3 items-end gap-3 text-center">
                {/* Creator Signature */}
                <div className="space-y-0.5 min-w-0 px-1">
                  <div className="border-b border-slate-900 mx-auto max-w-[240px] pb-0.5">
                    <span className="font-serif italic text-xs sm:text-sm font-bold text-slate-900 block leading-snug">
                      Matthew Cesar Corpuz
                    </span>
                  </div>
                  <p className="text-[9.5px] sm:text-[10px] font-sans font-black text-slate-700 uppercase leading-tight">
                    Matthew Cesar Corpuz
                  </p>
                  <p className="text-[8.5px] sm:text-[9px] font-sans text-slate-500 leading-tight">
                    Main Creator &amp; Chief Legal Researcher
                  </p>
                </div>

                {/* Embossed Gold Star Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-amber-500 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex flex-col items-center justify-center text-slate-950 shadow-md">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-amber-950" />
                    <span className="text-[7.5px] font-sans font-black tracking-tighter uppercase leading-none mt-0.5">
                      SEALED
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 font-bold mt-1">
                    VERIFIED {currentDate}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">
                    ID: PH-LAW-{Math.abs(completedCount * 137).toString(16).toUpperCase()}
                  </span>
                </div>

                {/* Bar Review Board */}
                <div className="space-y-0.5 min-w-0 px-1">
                  <div className="border-b border-slate-900 mx-auto max-w-[260px] pb-0.5">
                    <span className="font-serif italic text-xs sm:text-sm font-bold text-slate-900 block leading-snug">
                      Labor Law Examination Board
                    </span>
                  </div>
                  <p className="text-[9.5px] sm:text-[10px] font-sans font-black text-slate-700 uppercase leading-tight">
                    Labor Jurisprudence Directorate
                  </p>
                  <p className="text-[8.5px] sm:text-[9px] font-sans text-slate-500 leading-tight">
                    Philippine Bar Review &amp; Statutory Board
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              id="printable-study-guide"
              data-compact={isCompact ? 'true' : 'false'}
              data-orientation={pageOrientation}
              style={isLivePreviewMode && previewZoom !== 100 ? { zoom: `${previewZoom}%` } : undefined}
              className={`bg-white text-slate-950 ${marginPaddingClass} ${fontScaleClass} ${
                isCompact ? 'space-y-4' : 'space-y-7'
              } ${pageOrientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto ${bodyFontClass} relative overflow-hidden ${
                isLivePreviewMode
                  ? 'rounded-md border border-neutral-300 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-neutral-400/30 w-full'
                  : 'rounded-2xl shadow-2xl'
              } print:p-0 print:shadow-none print:max-w-full print:rounded-none print:border-0 print:ring-0 print:overflow-visible`}
            >
            {/* Watermark Stamp Overlay (Scoped inside document sheet so it never breaks pagination) */}
            {includeWatermark && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 overflow-hidden flex items-center justify-center opacity-[0.045] select-none print:opacity-[0.05]"
              >
                <span className="rotate-[-28deg] uppercase font-black text-4xl sm:text-6xl tracking-widest text-slate-950 text-center px-6">
                  {formatOptions.watermarkText || 'CONFIDENTIAL BAR REVIEW'}
                </span>
              </div>
            )}

            {/* Editorial Law Journal Masthead */}
            <header
              className={`border-b-2 ${headingBorderClass} ${
                isCompact ? 'pb-3 space-y-1' : 'pb-5 space-y-2'
              } text-center break-inside-avoid`}
            >
              <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-600 font-mono">
                PHILIPPINE LABOR CODE • P.D. NO. 442 (AS RENUMBERED &amp; AMENDED) • DOLE BWC HANDBOOK
              </div>
              <h1
                className={`${
                  isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                } font-black text-slate-950 tracking-tight leading-tight`}
              >
                Philippine Labor Standards &amp; Statutory Welfare Reviewer
              </h1>
              <p className="text-xs text-slate-700 max-w-2xl mx-auto leading-relaxed">
                Complete Six-World Bar &amp; Law School Memory Aid covering Hours of Work, Rest &amp; Holidays, 13th Month Pay, Wages &amp; D.O. 174, Special Groups, Protective Statutes, and Statutory Leaves (World 6)
              </p>
              {candidateName && (
                <div className="pt-1">
                  <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-slate-900">
                    Prepared for Examinee: <span className="font-black text-slate-950">{candidateName}</span>
                  </span>
                </div>
              )}
              <div className="pt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600 font-sans">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                  Created by Matthew (Matthew Cesar Corpuz — Main Creator)
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {currentDate}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {filteredTopics.length} Active Modules Printed
                </span>
              </div>
            </header>

            {/* Creator & Group Members Attribution Block */}
            {includeGroupMembers && (
              <section
                className={`border ${headingBorderClass} rounded-xl ${
                  isCompact ? 'p-3 space-y-1.5' : 'p-4 space-y-2.5'
                } ${subtleBoxClass} break-inside-avoid font-sans`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-900" />
                    <h2 className="font-black text-xs uppercase tracking-wide text-slate-950">
                      Memory Aid Attribution &amp; Research Cohort
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">
                    Main Creator: Matthew Cesar Corpuz
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-slate-900">
                  {GROUP_MEMBERS.map((member, idx) => (
                    <div key={member} className="flex items-baseline gap-1.5">
                      <span className="font-mono text-[10px] text-slate-500 tabular-nums w-4 shrink-0">
                        {idx + 1}.
                      </span>
                      <span className={idx === 0 ? 'font-black underline decoration-slate-400' : 'font-medium'}>
                        {member}
                        {idx === 0 ? ' (Creator)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6-World Mastery Progress Checklist */}
            {includeProgress && (
              <section
                className={`border ${headingBorderClass} rounded-xl ${
                  isCompact ? 'p-3 space-y-2' : 'p-4 space-y-3'
                } bg-white break-inside-avoid font-sans`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-900" />
                    <h2 className="font-black text-xs uppercase tracking-wide text-slate-950">
                      Six-World Mastery Checklist
                    </h2>
                  </div>
                  <span className="font-bold text-[11px] text-slate-900 tabular-nums">
                    Mastered: {completedCount} / {totalTopics} Modules ({overallPercent}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                  {WORLDS_METADATA.map((w) => {
                    const worldTopics = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
                    const done = worldTopics.filter((t) => completedTopicIds.includes(t.id)).length;
                    return (
                      <div key={w.id} className={`p-2 border rounded-lg ${subtleBoxClass}`}>
                        <span className="font-bold block text-slate-900 truncate">
                          W{w.worldNumber}: {w.shortTitle}
                        </span>
                        <span className="text-slate-700 tabular-nums">
                          {done}/{worldTopics.length} mastered
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Personal Study Notes */}
            {includePersonalNotes && resolvedNotes.length > 0 && (
              <section className="space-y-2.5 break-inside-avoid">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center gap-2`}>
                  <NotebookPen className="w-4 h-4 text-slate-900" />
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                    Personal Study Notes &amp; Mnemonics ({resolvedNotes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {resolvedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="border border-slate-300 rounded-lg p-3 bg-white break-inside-avoid space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-slate-950">{note.title}</span>
                        <span className="font-mono text-[10px] text-slate-600">{note.worldTag}</span>
                      </div>
                      <p className="text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* I. Statutory Multipliers Reference Matrix */}
            {includeMultipliers && (
              <section className="space-y-2" data-testid="print-matrix-multipliers">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center justify-between gap-2`}>
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                    I. Statutory Pay Multiplier Matrix (DOLE BWC)
                  </h2>
                  <span className="text-[10px] font-mono text-slate-600">Arts. 87, 93–94 Labor Code</span>
                </div>
                <div className="w-full overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse font-sans tabular-nums">
                    <colgroup>
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '34%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '32%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 border border-slate-500 font-black">Benefit Category</th>
                        <th className="p-2 border border-slate-500 font-black">Scenario / Day Type</th>
                        <th className="p-2 border border-slate-500 font-black text-right">Rate</th>
                        <th className="p-2 border border-slate-500 font-black">Statutory Formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LABOR_BENEFITS_MULTIPLIER_LIST.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`break-inside-avoid ${
                            isNavy && idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                          }`}
                        >
                          <td className="p-1.5 border border-slate-400 font-bold text-slate-950 align-top">
                            {row.benefit}
                          </td>
                          <td className="p-1.5 border border-slate-400 text-slate-900 align-top">
                            {row.scenario}
                          </td>
                          <td className="p-1.5 border border-slate-400 font-mono font-black text-slate-950 text-right align-top">
                            {(row.multiplierDecimal * 100).toFixed(1).replace(/\.0$/, '')}%
                          </td>
                          <td className="p-1.5 border border-slate-400 font-mono text-[10px] text-slate-900 align-top">
                            {row.formula}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* II. 17 Regions Minimum Wage & Kasambahay Matrix */}
            {includeRegionalWages && (
              <section className="space-y-2" data-testid="print-matrix-regional-wages">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center justify-between gap-2`}>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-900" />
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                      II. 17 Regions Daily Minimum Wage &amp; Kasambahay Matrix
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">R.A. 6727 · R.A. 10361</span>
                </div>
                <div className="w-full overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse font-sans tabular-nums">
                    <colgroup>
                      <col style={{ width: '26%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '18%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 border border-slate-500 font-black">Region</th>
                        <th className="p-2 border border-slate-500 font-black">Effectivity</th>
                        <th className="p-2 border border-slate-500 font-black">Non-Agriculture</th>
                        <th className="p-2 border border-slate-500 font-black">Agriculture</th>
                        <th className="p-2 border border-slate-500 font-black">Kasambahay / Mo.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REGIONAL_MINIMUM_WAGES.map((rw, idx) => {
                        const kas = KASAMBAHAY_MINIMUM_WAGES[idx];
                        return (
                          <tr
                            key={rw.region}
                            className={`break-inside-avoid ${
                              isNavy && idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                            }`}
                          >
                            <td className="p-1.5 border border-slate-400 font-bold text-slate-950 align-top">
                              {rw.region}
                            </td>
                            <td className="p-1.5 border border-slate-400 font-mono text-[10px] text-slate-800 align-top">
                              {rw.effectivity}
                            </td>
                            <td className="p-1.5 border border-slate-400 font-mono font-bold text-slate-950 align-top">
                              {rw.nonAgri}
                            </td>
                            <td className="p-1.5 border border-slate-400 font-mono text-slate-900 align-top">
                              {rw.agri}
                            </td>
                            <td className="p-1.5 border border-slate-400 font-mono text-slate-900 align-top">
                              {kas ? kas.minimumWage : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* III. World 6 Statutory Leaves Master Matrix */}
            {includeLeavesMatrix && (
              <section className="space-y-2" data-testid="print-matrix-statutory-leaves">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center justify-between gap-2`}>
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-slate-900" />
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                      III. World 6 Statutory Leaves Master Comparison Matrix
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">Art. 95 &amp; Special Leave Statutes</span>
                </div>
                <div className="w-full overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse font-sans tabular-nums">
                    <colgroup>
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '24%' }} />
                      <col style={{ width: '22%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 border border-slate-500 font-black">Statutory Leave</th>
                        <th className="p-2 border border-slate-500 font-black">Legal Basis</th>
                        <th className="p-2 border border-slate-500 font-black">Paid Duration</th>
                        <th className="p-2 border border-slate-500 font-black">Key Eligibility</th>
                        <th className="p-2 border border-slate-500 font-black">Cash Commutation &amp; Payor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STATUTORY_LEAVES_MASTER_ROWS.map((row, idx) => (
                        <tr
                          key={row.leave}
                          className={`break-inside-avoid ${
                            isNavy && idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                          }`}
                        >
                          <td className="p-1.5 border border-slate-400 font-bold text-slate-950 align-top">
                            {row.leave}
                          </td>
                          <td className="p-1.5 border border-slate-400 font-mono text-[10px] text-slate-800 align-top">
                            {formatOptions.includeLegalCitations ? row.basis : 'Statutory'}
                          </td>
                          <td className="p-1.5 border border-slate-400 font-bold text-slate-950 align-top">
                            {row.duration}
                          </td>
                          <td className="p-1.5 border border-slate-400 text-slate-900 align-top">
                            {row.eligibility}
                          </td>
                          <td className="p-1.5 border border-slate-400 text-slate-900 align-top">
                            {row.conversion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* IV. Unabridged Modules Breakdown (or Embedded Module Matrices in Matrices-Only Mode) */}
            <section className={isCompact ? 'space-y-4' : 'space-y-6'}>
              <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center justify-between gap-2`}>
                <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                  {matricesOnlyMode
                    ? 'IV. Embedded Module Comparative Matrices (Worlds 1–6)'
                    : 'IV. Codified Provisions, Doctrines, Exceptions & Bar Exam Tips'}
                </h2>
                <span className="text-[10.5px] font-sans text-slate-600">
                  {matricesOnlyMode
                    ? 'Matrices-Only Cheat Sheet'
                    : formatOptions.hideCompletedTopics
                    ? 'Unmastered Focus Deck'
                    : 'Complete Unabridged Syllabus'}
                </span>
              </div>

              {/* Statutory Wage Multipliers & Formulas Cheat Sheet */}
              {includeFormulasCheatSheet && (
                <section className={`border ${headingBorderClass} rounded-xl p-3.5 ${subtleBoxClass} break-inside-avoid space-y-2`}>
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                    <h3 className="font-black text-xs uppercase tracking-wide text-slate-950 font-sans">
                      Statutory Wage Multipliers &amp; Overtime Computation Cheat Sheet
                    </h3>
                    <span className="text-[10px] font-mono text-slate-600 font-bold">Labor Code Arts. 86, 87, 93, 94 &amp; P.D. 851</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-sans">
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <strong className="block text-slate-950 font-bold">Normal Overtime (Art. 87)</strong>
                      <span className="text-slate-700 font-mono font-bold text-xs">+25%</span>
                      <span className="block text-slate-500 text-[9px]">(125% of regular hourly rate)</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <strong className="block text-slate-950 font-bold">Night Shift Diff. (Art. 86)</strong>
                      <span className="text-slate-700 font-mono font-bold text-xs">+10%</span>
                      <span className="block text-slate-500 text-[9px]">(10:00 PM to 6:00 AM)</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <strong className="block text-slate-950 font-bold">Rest Day / Special Day (Art. 93)</strong>
                      <span className="text-slate-700 font-mono font-bold text-xs">130%</span>
                      <span className="block text-slate-500 text-[9px]">(Special Day on Rest Day = 150%)</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <strong className="block text-slate-950 font-bold">Regular Holiday (Art. 94)</strong>
                      <span className="text-slate-700 font-mono font-bold text-xs">200%</span>
                      <span className="block text-slate-500 text-[9px]">(Holiday on Rest Day = 260%)</span>
                    </div>
                  </div>
                </section>
              )}

              {/* High-Yield Labor Law Jurisprudence Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
                {/* Four-Fold ER-EE Test Panel */}
                {includeFourFoldControlTest && (
                  <section className={`border ${headingBorderClass} rounded-xl p-3 ${subtleBoxClass} break-inside-avoid space-y-1.5`}>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                        Four-Fold Employer-Employee Test
                      </h3>
                      <span className="text-[9px] font-mono font-bold text-slate-600">Calamba Medical v. CIR</span>
                    </div>
                    <ol className="list-decimal pl-4 text-[10.5px] text-slate-900 space-y-0.5">
                      <li><strong>Selection and Engagement</strong> of the worker or contractor.</li>
                      <li><strong>Payment of Wages</strong> or statutory remuneration.</li>
                      <li><strong>Power of Dismissal</strong> or disciplinary sanction.</li>
                      <li><strong>Power of Control</strong> over means and methods of work (The most critical test!).</li>
                    </ol>
                  </section>
                )}

                {/* Two-Notice Rule Due Process Dismissal Flowchart */}
                {includeTwoNoticeChecklist && (
                  <section className={`border ${headingBorderClass} rounded-xl p-3 ${subtleBoxClass} break-inside-avoid space-y-1.5`}>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                        Two-Notice Rule Statutory Due Process
                      </h3>
                      <span className="text-[9px] font-mono font-bold text-slate-600">King of Kings / Agabon Doctrine</span>
                    </div>
                    <div className="text-[10px] text-slate-900 space-y-1">
                      <p><strong>1st Notice:</strong> Specific charges + at least 5 calendar days to explain.</p>
                      <p><strong>Hearing / Conference:</strong> Ample opportunity to defend with assistance.</p>
                      <p><strong>2nd Notice:</strong> Decision stating specific grounds proven for termination.</p>
                      <p className="text-[9px] text-slate-600 italic">Sanction for non-compliance: P30,000 nominal damages (just cause) / P50,000 (authorized cause).</p>
                    </div>
                  </section>
                )}

                {/* Art. 302 Retirement Pay 22.5-Day Formula Box */}
                {includeRetirementFormulaBox && (
                  <section className={`border ${headingBorderClass} rounded-xl p-3 ${subtleBoxClass} break-inside-avoid space-y-1.5`}>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                        Art. 302 Retirement One-Half Month Salary (22.5 Days)
                      </h3>
                      <span className="text-[9px] font-mono font-bold text-slate-600">Capitol Wireless Doctrine</span>
                    </div>
                    <p className="text-[10.5px] text-slate-900 font-semibold leading-relaxed">
                      Statutory 1/2 month = <strong>15 days basic</strong> + <strong>5 days SIL</strong> + <strong>2.5 days (1/12th of 13th month pay)</strong> = <strong>22.5 days per year of service</strong> (fraction of at least 6 months considered 1 whole year).
                    </p>
                  </section>
                )}

                {/* Latin Jurisprudence Maxims */}
                {includeLatinMaxims && (
                  <section className={`border ${headingBorderClass} rounded-xl p-3 ${subtleBoxClass} break-inside-avoid space-y-1.5`}>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                        Constitutional Doctrines &amp; Latin Maxims
                      </h3>
                      <span className="text-[9px] font-mono font-bold text-slate-600">Art. 4, Labor Code</span>
                    </div>
                    <ul className="list-disc pl-4 text-[10px] text-slate-900 space-y-0.5">
                      <li><strong>In dubio pro operario:</strong> Doubts in statutory interpretation are resolved in favor of labor.</li>
                      <li><strong>Principle of Non-Diminution:</strong> Vested employer benefits cannot be unilaterally reduced (Art. 100).</li>
                      <li><strong>Salus populi est suprema lex:</strong> Labor standards are police power social justice protections.</li>
                    </ul>
                  </section>
                )}
              </div>

              {filteredTopics.length === 0 ? (
                <div className="border border-slate-300 rounded-xl p-6 text-center space-y-1.5 bg-slate-50 font-sans">
                  <BookOpenCheck className="w-6 h-6 text-slate-700 mx-auto" />
                  <p className="font-bold text-xs text-slate-900">
                    All topics in your selected worlds are already marked Mastered!
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Uncheck &ldquo;Hide Completed Topics&rdquo; or enable more Worlds above to include mastered modules in your print packet.
                  </p>
                </div>
              ) : (
                WORLDS_METADATA.filter((w) => selectedWorlds.includes(w.id)).map((world, worldIdx) => {
                  const worldTopics = filteredTopics
                    .filter((t) => t.worldId === world.id)
                    .filter((t) => !matricesOnlyMode || t.rules.some((r) => Boolean(r.tableData)));
                  if (worldTopics.length === 0) return null;

                  return (
                    <div
                      key={world.id}
                      className={`${isCompact ? 'space-y-3' : 'space-y-4'} ${
                        formatOptions.pageBreakPerWorld && worldIdx > 0 ? 'print-page-break-before' : ''
                      }`}
                    >
                      {/* Clean Ink-Friendly Editorial World Banner (Never white-on-dark in print) */}
                      <div
                        className={`border-2 ${headingBorderClass} rounded-xl ${
                          isCompact ? 'px-3 py-2' : 'px-4 py-2.5'
                        } ${isNavy ? 'bg-slate-100 text-slate-950' : 'bg-white text-black'} break-inside-avoid`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-black text-xs sm:text-sm uppercase tracking-wide text-slate-950">
                            World {world.worldNumber}: {world.title.replace(/^WORLD \d+:\s*/i, '')}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-700 tabular-nums font-bold">
                            {worldTopics.length} {worldTopics.length === 1 ? 'Module' : 'Modules'}
                          </span>
                        </div>
                        {!matricesOnlyMode && (
                          <p className="text-[11px] mt-0.5 text-slate-700">
                            {world.description}
                          </p>
                        )}
                      </div>

                      <div className={`${isCompact ? 'space-y-3' : 'space-y-4'} ${twoColumnLayout ? 'columns-1 sm:columns-2 gap-4 print:columns-2 [column-fill:_balance]' : ''}`}>
                        {worldTopics.map((topic, topicIdx) => {
                          const isDone = completedTopicIds.includes(topic.id);
                          const combinedTips = [
                            ...(topic.barTips ?? []),
                            ...(topic.keyTips ?? []),
                          ];
                          const rulesToRender = matricesOnlyMode
                            ? topic.rules.filter((r) => Boolean(r.tableData))
                            : topic.rules;

                          return (
                            <article
                              key={topic.id}
                              className={`border border-slate-400 rounded-xl bg-white ${
                                isCompact ? 'p-3 space-y-2' : 'p-4 space-y-3'
                              } ${twoColumnLayout ? 'break-inside-avoid mb-4 inline-block w-full' : ''} ${
                                formatOptions.pageBreakPerModule && topicIdx > 0
                                  ? 'print-module-break'
                                  : ''
                              }`}
                            >
                              {/* Module Header */}
                              <div className="flex items-start justify-between gap-3 border-b border-slate-300 pb-2 break-inside-avoid">
                                <div className="space-y-0.5">
                                  {formatOptions.includeLegalCitations && (
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                                      Statutory Basis: {topic.badge}
                                    </span>
                                  )}
                                  <h4
                                    className={`font-black ${
                                      isCompact ? 'text-xs sm:text-[13px]' : 'text-sm sm:text-[15px]'
                                    } text-slate-950 leading-snug`}
                                  >
                                    {topic.title}
                                  </h4>
                                </div>
                                <span className="text-[10px] font-mono font-semibold text-slate-700 shrink-0 tabular-nums">
                                  {isDone ? '[MASTERED]' : '[  TO REVIEW]'}
                                </span>
                              </div>

                              {/* Mario Executive Takeaway */}
                              {!matricesOnlyMode && includeExecutiveMarioSummary && topic.beginnerSummary && (
                                <div className="bg-amber-50/80 border border-amber-300 rounded-lg p-2 text-[10.5px] text-amber-950 font-medium break-inside-avoid">
                                  <strong className="font-bold text-amber-900 uppercase font-sans">Mario Executive Takeaway:</strong>{' '}
                                  {topic.beginnerSummary}
                                </div>
                              )}

                              {/* Summary */}
                              {!matricesOnlyMode && (
                                <p className="text-slate-900 leading-relaxed">
                                  <strong className="font-bold">Core Rule:</strong>{' '}
                                  {stripInlineLegalCitations(
                                    topic.summary,
                                    formatOptions.includeLegalCitations
                                  )}
                                </p>
                              )}

                              {/* Key Doctrines & Jurisprudence */}
                              {!matricesOnlyMode &&
                                formatOptions.includeLegalCitations &&
                                topic.keyDoctrines &&
                                topic.keyDoctrines.length > 0 && (
                                  <div
                                    className={`${subtleBoxClass} border rounded-lg ${
                                      isCompact ? 'p-2 space-y-0.5' : 'p-2.5 space-y-1'
                                    } break-inside-avoid`}
                                  >
                                    <span className="font-bold text-slate-950 block text-[10.5px] uppercase tracking-wide font-sans">
                                      Controlling Jurisprudence &amp; Legal Citations
                                    </span>
                                    <ul className="list-disc pl-4 space-y-0.5 text-slate-900">
                                      {topic.keyDoctrines.map((d, dIdx) => (
                                        <li key={dIdx}>{cleanRuleText(d)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              {/* Codified Rules, Subsections & Embedded Statutory Tables */}
                              <div
                                className={
                                  isCompact && !matricesOnlyMode
                                    ? 'grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2'
                                    : 'space-y-2.5'
                                }
                              >
                                {rulesToRender.map((rule, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className={`space-y-1.5 ${
                                      rule.tableData ? '' : 'break-inside-avoid'
                                    } ${rule.tableData && isCompact ? 'md:col-span-2' : ''}`}
                                  >
                                    <span className="font-bold text-slate-950 flex items-start gap-1.5 break-after-avoid">
                                      {includeCheckboxes && (
                                        <span className="inline-block w-3.5 h-3.5 border-2 border-slate-700 rounded-xs mt-0.5 shrink-0" />
                                      )}
                                      <span>
                                        {rIdx + 1}.{' '}
                                        {stripInlineLegalCitations(
                                          rule.heading,
                                          formatOptions.includeLegalCitations
                                        )}
                                      </span>
                                    </span>
                                    {!matricesOnlyMode && rule.description && (
                                      <p className="text-slate-800 pl-3 leading-relaxed">
                                        {stripInlineLegalCitations(
                                          rule.description,
                                          formatOptions.includeLegalCitations
                                        )}
                                      </p>
                                    )}
                                    {!matricesOnlyMode && rule.items && rule.items.length > 0 && (
                                      <ul className="list-disc pl-5 space-y-0.5 text-slate-800 leading-relaxed">
                                        {rule.items.map((item, iIdx) => (
                                          <li key={iIdx}>
                                            {stripInlineLegalCitations(
                                              item,
                                              formatOptions.includeLegalCitations
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    {!matricesOnlyMode &&
                                      rule.subSections &&
                                      rule.subSections.map((sub, sIdx) => (
                                        <div key={sIdx} className="pl-4 pt-0.5 space-y-0.5">
                                          <span className="font-semibold text-slate-900 block">
                                            {stripInlineLegalCitations(
                                              sub.title,
                                              formatOptions.includeLegalCitations
                                            )}
                                          </span>
                                          <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                                            {sub.items.map((si, siIdx) => (
                                              <li key={siIdx}>
                                                {stripInlineLegalCitations(
                                                  si,
                                                  formatOptions.includeLegalCitations
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    {rule.tableData && (
                                      <div className="w-full overflow-visible pt-0.5">
                                        <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse font-sans tabular-nums">
                                          <colgroup>
                                            {getPrintColumnWidths(rule.tableData.headers.length).map(
                                              (widthPct, colIdx) => (
                                                <col key={colIdx} style={{ width: widthPct }} />
                                              )
                                            )}
                                          </colgroup>
                                          <thead>
                                            <tr className={tableHeaderClass}>
                                              {rule.tableData.headers.map((h, hIdx) => (
                                                <th
                                                  key={hIdx}
                                                  className="p-1.5 border border-slate-500 font-black"
                                                >
                                                  {stripInlineLegalCitations(
                                                    h,
                                                    formatOptions.includeLegalCitations
                                                  )}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {rule.tableData.rows.map((rRow, rrIdx) => (
                                              <tr
                                                key={rrIdx}
                                                className={`break-inside-avoid ${
                                                  isNavy && rrIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                                                }`}
                                              >
                                                {rRow.map((cell, cIdx) => (
                                                  <td
                                                    key={cIdx}
                                                    className={`p-1.5 border border-slate-400 align-top ${
                                                      cIdx === 0
                                                        ? 'font-bold text-slate-950'
                                                        : 'text-slate-900'
                                                    }`}
                                                  >
                                                    {stripInlineLegalCitations(
                                                      cell,
                                                      formatOptions.includeLegalCitations
                                                    )}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Statutory Exceptions */}
                              {!matricesOnlyMode && topic.exceptions && topic.exceptions.length > 0 && (
                                <div
                                  className={`${subtleBoxClass} border rounded-lg ${
                                    isCompact ? 'p-2 space-y-1' : 'p-2.5 space-y-1.5'
                                  } break-inside-avoid`}
                                >
                                  <span className="font-bold text-slate-950 block text-[10.5px] uppercase tracking-wide font-sans">
                                    General Rule &amp; Statutory Exceptions
                                  </span>
                                  {topic.exceptions.map((ex, exIdx) => (
                                    <div key={exIdx} className="space-y-0.5">
                                      <p className="font-semibold text-slate-900">
                                        General Rule:{' '}
                                        {stripInlineLegalCitations(
                                          ex.generalRule,
                                          formatOptions.includeLegalCitations
                                        )}
                                      </p>
                                      <ul className="list-disc pl-5 space-y-0.5 text-slate-800">
                                        {ex.exceptions.map((eItem, eiIdx) => (
                                          <li key={eiIdx}>
                                            {stripInlineLegalCitations(
                                              eItem,
                                              formatOptions.includeLegalCitations
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* High-Yield Bar Exam Tips & Practical Takeaway */}
                              {!matricesOnlyMode &&
                                formatOptions.includeBarTips &&
                                (combinedTips.length > 0 || topic.practicalTakeaway) && (
                                  <div
                                    className={`border ${
                                      isNavy
                                        ? 'border-amber-300 bg-amber-50/60'
                                        : 'border-slate-500 bg-white'
                                    } rounded-lg ${
                                      isCompact ? 'p-2 space-y-0.5' : 'p-2.5 space-y-1'
                                    } break-inside-avoid`}
                                  >
                                    <span className="font-bold text-slate-950 flex items-center gap-1 text-[10.5px] uppercase tracking-wide font-sans">
                                      <Sparkles className="w-3 h-3 shrink-0" />
                                      Bar Exam Memory Traps &amp; High-Yield Takeaways
                                    </span>
                                    {combinedTips.length > 0 && (
                                      <ul className="list-disc pl-4 space-y-0.5 text-slate-900">
                                        {combinedTips.map((tip, tIdx) => (
                                          <li key={tIdx}>
                                            {stripInlineLegalCitations(
                                              tip,
                                              formatOptions.includeLegalCitations
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    {topic.practicalTakeaway && (
                                      <p className="text-slate-800 pt-0.5">
                                        <strong>Practical Application:</strong>{' '}
                                        {stripInlineLegalCitations(
                                          topic.practicalTakeaway,
                                          formatOptions.includeLegalCitations
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}

                              {/* Optional Hand-Written Note Lines */}
                              {formatOptions.blankNoteLinesCount !== undefined &&
                                formatOptions.blankNoteLinesCount > 0 && (
                                  <div className="pt-2 space-y-1.5 break-inside-avoid print:block">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">
                                      Examinee Notes &amp; Statutory Annotations:
                                    </span>
                                    {Array.from({ length: formatOptions.blankNoteLinesCount }).map(
                                      (_, lineIdx) => (
                                        <div
                                          key={lineIdx}
                                          className="w-full border-b border-dashed border-slate-400 h-3.5"
                                        />
                                      )
                                    )}
                                  </div>
                                )}
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* Candidate Honor Pledge & Attestation */}
            {includeHonorPledge && (
              <section className={`border ${headingBorderClass} rounded-xl p-4 ${subtleBoxClass} break-inside-avoid font-sans space-y-2 mt-4`}>
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                    Candidate&apos;s Solemn Bar Exam Honor Pledge &amp; Attestation
                  </h3>
                  <span className="text-[10px] font-mono text-slate-600 font-bold">Labor Standards Mastery</span>
                </div>
                <p className="text-[11px] text-slate-800 italic leading-relaxed">
                  &ldquo;I hereby solemnly affirm that I have rigorously studied and committed to memory the unabridged provisions, exceptions, wage computations, and Supreme Court doctrines of Philippine Labor Standards codified herein, with unwavering integrity and adherence to the Lawyer&apos;s Oath.&rdquo;
                </p>
                <div className="pt-4 flex flex-wrap items-end justify-between gap-4 text-[11px] text-slate-900">
                  <div className="space-y-1">
                    <div className="border-b-2 border-slate-950 w-64 pb-1">
                      <span className="font-bold text-xs">{candidateName || 'Examinee Full Name & Signature'}</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Candidate / Reviewee Signature</span>
                  </div>
                  <div className="space-y-1">
                    <div className="border-b-2 border-slate-950 w-36 pb-1">
                      <span className="font-mono text-xs">{currentDate}</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Date Completed</span>
                  </div>
                </div>
              </section>
            )}

            {/* Editorial Print Footer */}
            <footer
              className={`border-t-2 ${headingBorderClass} pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600 font-mono break-inside-avoid`}
            >
              <span>Created by Matthew • Super Mario Labor Law Memory Aid (Worlds 1–6)</span>
              <span>Unabridged Bar &amp; Law School Reviewer</span>
            </footer>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
