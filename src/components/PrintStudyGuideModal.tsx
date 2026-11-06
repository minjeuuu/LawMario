import React, { useState, useEffect, useRef } from 'react';
import {
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
  Layout,
  Columns,
  FileText,
  FileDown,
  CheckCircle2,
  Clock,
  Palette,
  Type,
  Trophy,
  ZoomIn,
  ChevronDown,
  ChevronUp,
  Eye,
  Calculator,
  Star,
  Printer,
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
import { getPrintFontCssStack } from '../utils/round11Features';
import {
  ONE_PAGE_LEGAL_FORMULAS,
  ONE_PAGE_LEGAL_DEADLINES,
  ONE_PAGE_STATUTORY_LEAVE_CAPS,
} from '../utils/onePageSummaryData';
import {
  downloadOnePageSummaryA4Pdf,
  downloadCertificatePdf,
  downloadStudyGuideReviewerPdf,
  downloadScoreCardLandscapePdf,
  buildOnePageSummaryPdfBytes,
  buildCertificatePdfBytes,
  buildStudyGuideReviewerPdfBytes,
  buildScoreCardLandscapePdfBytes,
  countPdfPagesFromBytes,
  ScoreCardPdfParams,
} from '../utils/pdfExportService';
import {
  PRINT_COLOR_THEMES,
  PRINT_FONT_STYLES,
  PreviewZoomPreset,
  computeA4PreviewStageMetrics,
  getPrintThemeCatalogItem,
  getPrintFontCatalogItem,
} from '../utils/round8Features';
import {
  EXTENDED_PRINT_COLOR_THEMES,
  EXTENDED_PRINT_FONT_CATALOG,
  resolveExtendedPrintTheme,
  resolveExtendedPrintFont,
} from '../utils/round12Features';
import {
  buildTrueFontOnePageSummaryPdfBytesAsync,
  buildTrueFontCertificateOrDiplomaPdfBytesAsync,
  buildTrueFontScoreCardPdfBytesAsync,
  buildTrueFontStudyReviewerPdfBytesAsync,
  downloadTrueFontOnePageSummaryPdfAsync,
  downloadTrueFontCertificatePdfAsync,
  downloadTrueFontScoreCardPdfAsync,
  downloadTrueFontStudyReviewerPdfAsync,
} from '../utils/pdfTrueFontRenderer';
import {
  MarioSuperStarIcon,
  MarioCoinBlockIcon,
  MarioWarpPipeIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioCoinIcon,
  MarioBrickStrip,
} from './MarioPrintIcons';

export type PrintModalDocumentMode = 'summary' | 'guide' | 'certificate' | 'scorecard';

interface PrintStudyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTopicIds: string[];
  coins: number;
  studyNotes?: StudyNoteItem[];
  initialMode?: PrintModalDocumentMode;
  playerName?: string;
  equippedAvatar?: string;
  loginStreak?: number;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  quizRunsCompleted?: number;
  studiedSeconds?: number;
  appStudyFont?: string;
  activeAppTheme?: string;
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
  coins,
  studyNotes,
  initialMode,
  playerName = 'Labor Scholar Hero',
  equippedAvatar = 'mario',
  loginStreak = 1,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 12,
  quizRunsCompleted = 0,
  studiedSeconds = 0,
  appStudyFont,
  activeAppTheme,
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
  const [zoomPreset, setZoomPreset] = useState<PreviewZoomPreset>('fit');
  const [previewRenderMode, setPreviewRenderMode] = useState<'sheet' | 'pdf'>('sheet');
  const [showVisualSwatches, setShowVisualSwatches] = useState<boolean>(true);
  const [swatchViewMode, setSwatchViewMode] = useState<'themes' | 'fonts'>('themes');
  const [themeCategoryFilter, setThemeCategoryFilter] = useState<string>('All');
  const [fontCategoryFilter, setFontCategoryFilter] = useState<string>('All');
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
  const [certOrientation, setCertOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [documentMode, setDocumentMode] = useState<PrintModalDocumentMode>(
    initialMode || 'summary'
  );
  const [certificateHonors, setCertificateHonors] = useState<string>(
    'Summa Cum Laude · Super Star Rank'
  );
  const [candidateName, setCandidateName] = useState('');
  const [simDailyWage, setSimDailyWage] = useState<number>(645);
  const [showMultiplierSim, setShowMultiplierSim] = useState<boolean>(false);
  const [pdfDownloadedNotice, setPdfDownloadedNotice] = useState(false);
  const [formatOptions, setFormatOptions] = useState<PrintGuideFormatOptions>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_print_format_options_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_PRINT_FORMAT_OPTIONS, ...parsed };
        }
      } catch {}
    }
    return DEFAULT_PRINT_FORMAT_OPTIONS;
  });
  const [selectedWorlds, setSelectedWorlds] = useState<string[]>(() =>
    WORLDS_METADATA.map((w) => w.id)
  );

  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const sheetContentRef = useRef<HTMLDivElement | null>(null);
  const [stageWidthPx, setStageWidthPx] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.min(1100, window.innerWidth - 24) : 960
  );
  const [stageHeightPx, setStageHeightPx] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(320, window.innerHeight - 190) : 640
  );
  const [sheetNaturalHeightPx, setSheetNaturalHeightPx] = useState<number>(0);
  const [pdfPreviewState, setPdfPreviewState] = useState<{
    url: string | null;
    pages: number;
    kbSize: number;
  }>({ url: null, pages: 1, kbSize: 0 });

  useEffect(() => {
    if (isOpen && initialMode) {
      setDocumentMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Reset scroll container to top whenever opening or switching document modes / render modes
  useEffect(() => {
    if (!isOpen) return;
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollTop = 0;
      previewScrollRef.current.scrollLeft = 0;
    }
  }, [isOpen, documentMode, previewRenderMode]);

  // Allow Escape key to close Print Studio cleanly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollEl = previewScrollRef.current;
    if (!scrollEl) return;
    const measureStage = () => {
      if (scrollEl.clientWidth > 0) {
        setStageWidthPx(scrollEl.clientWidth);
      }
      if (scrollEl.clientHeight > 0) {
        setStageHeightPx(scrollEl.clientHeight);
      }
    };
    measureStage();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measureStage);
      ro.observe(scrollEl);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measureStage);
    return () => window.removeEventListener('resize', measureStage);
  }, [isOpen, showControlPanel, showVisualSwatches, documentMode]);

  useEffect(() => {
    if (!isOpen || previewRenderMode !== 'sheet') return;
    const sheetEl = sheetContentRef.current;
    if (!sheetEl) return;
    const measureSheet = () => {
      const h = sheetEl.offsetHeight;
      if (h > 0) {
        setSheetNaturalHeightPx(h);
      }
    };
    measureSheet();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measureSheet);
      ro.observe(sheetEl);
      return () => ro.disconnect();
    }
  }, [
    isOpen,
    previewRenderMode,
    documentMode,
    pageOrientation,
    formatOptions,
    selectedWorlds,
    matricesOnlyMode,
    paperMargins,
    fontSizeScale,
    twoColumnLayout,
    includeGroupMembers,
    includeProgress,
    includeMultipliers,
    includeRegionalWages,
    includeLeavesMatrix,
    includePersonalNotes,
    includeFormulasCheatSheet,
    includeFourFoldControlTest,
    includeTwoNoticeChecklist,
    includeRetirementFormulaBox,
    includeLatinMaxims,
    includeHonorPledge,
    candidateName,
    certificateHonors,
  ]);

  useEffect(() => {
    if (!isOpen) {
      clearPrintPageRule();
      return;
    }
    const resolvedExtFont = resolveExtendedPrintFont(formatOptions.fontStyle);
    const fontStack = resolvedExtFont.cssFontFamily;
    if (documentMode === 'certificate') {
      applyPrintPageRule(certOrientation, '6mm', fontStack);
    } else if (documentMode === 'scorecard') {
      applyPrintPageRule('landscape', '6mm', fontStack);
    } else if (documentMode === 'summary') {
      applyPrintPageRule('portrait', '8mm', fontStack);
    } else {
      applyPrintPageRule(
        pageOrientation,
        pageOrientation === 'landscape' ? '8mm 10mm' : '10mm 12mm',
        fontStack
      );
    }
    return () => {
      clearPrintPageRule();
    };
  }, [isOpen, documentMode, pageOrientation, certOrientation, formatOptions.fontStyle]);

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

  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const studiedMinutes = Math.max(1, Math.round(studiedSeconds / 60));
  const studyDurationFormatted =
    studiedMinutes >= 60
      ? `${Math.floor(studiedMinutes / 60)}h ${studiedMinutes % 60}m`
      : `${studiedMinutes} min`;
  const heroDisplayName =
    equippedAvatar.charAt(0).toUpperCase() + equippedAvatar.slice(1).replace(/_/g, ' ');
  const heroRankLabel =
    overallPercent >= 90
      ? 'Super Star Labor Grandmaster'
      : overallPercent >= 65
      ? 'Fire Flower Statutory Counsel'
      : overallPercent >= 35
      ? 'Super Mushroom Workplace Advocate'
      : 'Rising Mushroom Kingdom Scholar';

  const scoreCardWorldBreakdown = WORLDS_METADATA.map((w) => {
    const wt = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
    const done = wt.filter((t) => completedTopicIds.includes(t.id)).length;
    const pct = Math.round((done / Math.max(1, wt.length)) * 100);
    return {
      worldNumber: w.worldNumber,
      shortTitle: w.shortTitle,
      completed: done,
      total: wt.length,
      percent: pct,
    };
  });

  const buildCurrentScoreCardParams = (): ScoreCardPdfParams => ({
    playerName: candidateName.trim() || playerName || 'Labor Scholar Hero',
    heroName: heroDisplayName,
    heroRank: heroRankLabel,
    completedCount,
    totalTopics,
    coins,
    loginStreak,
    unlockedAchievementsCount,
    totalAchievementsCount,
    quizRunsCompleted,
    studyDurationFormatted,
    colorAccent: formatOptions.colorAccent,
    fontStyle: formatOptions.fontStyle,
    worldBreakdown: scoreCardWorldBreakdown,
  });

  useEffect(() => {
    if (!isOpen || previewRenderMode !== 'pdf') {
      return;
    }
    let cancelled = false;
    let activeBlobUrl: string | null = null;

    const runPreviewBuild = async () => {
      let bytes: Uint8Array;
      if (documentMode === 'summary') {
        bytes = await buildTrueFontOnePageSummaryPdfBytesAsync({
          candidateName: candidateName.trim() || undefined,
          dateLabel: currentDate,
          colorAccent: formatOptions.colorAccent,
          fontStyle: formatOptions.fontStyle,
          includeWatermark,
          watermarkText: formatOptions.watermarkText,
        });
      } else if (documentMode === 'certificate') {
        bytes = await buildTrueFontCertificateOrDiplomaPdfBytesAsync(
          {
            recipientName:
              candidateName.trim() || playerName || 'Distinguished Labor Standards Scholar',
            honors: certificateHonors,
            completedCount,
            totalCount: totalTopics,
            dateLabel: currentDate,
            colorAccent: formatOptions.colorAccent,
            fontStyle: formatOptions.fontStyle,
            orientation: certOrientation,
          },
          false
        );
      } else if (documentMode === 'scorecard') {
        bytes = await buildTrueFontScoreCardPdfBytesAsync(buildCurrentScoreCardParams());
      } else {
        bytes = await buildTrueFontStudyReviewerPdfBytesAsync({
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

      if (cancelled) return;
      const pages = countPdfPagesFromBytes(bytes);
      const kbSize = Math.max(1, Math.round(bytes.byteLength / 1024));
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      activeBlobUrl = URL.createObjectURL(blob);
      setPdfPreviewState({ url: activeBlobUrl, pages, kbSize });
    };

    void runPreviewBuild();

    return () => {
      cancelled = true;
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [
    isOpen,
    previewRenderMode,
    documentMode,
    pageOrientation,
    certOrientation,
    candidateName,
    playerName,
    certificateHonors,
    formatOptions,
    selectedWorlds,
    matricesOnlyMode,
    paperMargins,
    fontSizeScale,
    includeCheckboxes,
    includeWatermark,
    includeGroupMembers,
    includeProgress,
    includeMultipliers,
    includeRegionalWages,
    includeLeavesMatrix,
    includePersonalNotes,
    includeFormulasCheatSheet,
    includeFourFoldControlTest,
    includeTwoNoticeChecklist,
    includeRetirementFormulaBox,
    includeHonorPledge,
    completedCount,
    coins,
    loginStreak,
    unlockedAchievementsCount,
    quizRunsCompleted,
    studiedSeconds,
  ]);

  if (!isOpen) return null;

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
    setFormatOptions((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mario_print_format_options_v1', JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const handleDownloadPdf = async () => {
    if (documentMode === 'summary') {
      marioAudio.playCoin();
      await downloadTrueFontOnePageSummaryPdfAsync({
        candidateName: candidateName.trim() || undefined,
        dateLabel: currentDate,
        colorAccent: formatOptions.colorAccent,
        fontStyle: formatOptions.fontStyle,
        includeWatermark,
        watermarkText: formatOptions.watermarkText,
      });
    } else if (documentMode === 'certificate') {
      marioAudio.playQuizComplete();
      await downloadTrueFontCertificatePdfAsync({
        recipientName:
          candidateName.trim() || playerName || 'Distinguished Labor Standards Scholar',
        honors: certificateHonors,
        completedCount,
        totalCount: totalTopics,
        dateLabel: currentDate,
        colorAccent: formatOptions.colorAccent,
        fontStyle: formatOptions.fontStyle,
        orientation: certOrientation,
      });
    } else if (documentMode === 'scorecard') {
      marioAudio.playQuizComplete();
      await downloadTrueFontScoreCardPdfAsync(buildCurrentScoreCardParams());
    } else {
      marioAudio.playCoin();
      await downloadTrueFontStudyReviewerPdfAsync({
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
  const activeExtendedTheme = resolveExtendedPrintTheme(formatOptions.colorAccent);
  const activeExtendedFont = resolveExtendedPrintFont(formatOptions.fontStyle);
  const activeCssFontStack = activeExtendedFont.cssFontFamily;
  const activeSheetDynamicStyle: React.CSSProperties = {
    '--print-active-font': activeCssFontStack,
    fontFamily: activeCssFontStack,
    backgroundColor:
      activeExtendedTheme.id === 'ink_saver_bw'
        ? '#FFFFFF'
        : activeExtendedTheme.tableStripeBgHex || '#FFFFFF',
    borderColor: activeExtendedTheme.borderHex,
    color: activeExtendedTheme.bodyTextHex,
  } as React.CSSProperties;

  const bodyFontClass = activeFontCatalog.previewClass;
  const headingBorderClass = activeThemeCatalog.headingBorderClass;
  const subtleBoxClass = activeThemeCatalog.subtleBoxClass;
  const tableHeaderClass = activeThemeCatalog.tableHeaderClass;
  const summaryBannerHeaderClass = activeThemeCatalog.summaryBannerHeaderClass;
  const summaryPaperBgClass = activeThemeCatalog.summaryPaperBgClass;
  const worldBannerClass = activeThemeCatalog.worldBannerClass;
  const zebraRowClass = activeThemeCatalog.zebraRowClass;
  const tipBoxClass = activeThemeCatalog.tipBoxClass;
  const certThemeClasses = activeThemeCatalog.certClasses;

  const isLandscapeDocument =
    (documentMode === 'certificate' && certOrientation === 'landscape') ||
    documentMode === 'scorecard' ||
    (documentMode === 'guide' && pageOrientation === 'landscape');

  const stageMetrics = computeA4PreviewStageMetrics({
    containerWidthPx: stageWidthPx,
    containerHeightPx: stageHeightPx,
    fitWholePageVertically: documentMode === 'certificate' || documentMode === 'scorecard',
    isLandscape: isLandscapeDocument,
    zoomPreset,
  });

  const estimatedPageCount =
    documentMode === 'summary' || documentMode === 'certificate' || documentMode === 'scorecard'
      ? 1
      : previewRenderMode === 'pdf' && pdfPreviewState.pages > 0
      ? pdfPreviewState.pages
      : Math.max(
          2,
          (includeMultipliers ? 1 : 0) +
            (includeRegionalWages ? 1 : 0) +
            (includeLeavesMatrix ? 1 : 0) +
            Math.ceil((matricesOnlyMode ? filteredTopics.length * 0.45 : filteredTopics.length * 0.85))
        );

  const handleJumpToSection = (sectionId: string) => {
    marioAudio.playClick();
    if (previewRenderMode !== 'sheet') {
      setPreviewRenderMode('sheet');
    }
    window.requestAnimationFrame(() => {
      const target = document.getElementById(sectionId);
      const container = previewScrollRef.current;
      if (target && container) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - 12;
        container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
      }
    });
  };

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
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/85 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible print:select-text"
    >
      <div className="bg-slate-900 text-white w-full h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[94vh] max-w-6xl sm:rounded-3xl border-0 sm:border-4 border-slate-950 shadow-[0_16px_40px_rgba(0,0,0,0.9)] overflow-hidden my-auto flex flex-col pt-[max(0.4rem,env(safe-area-inset-top))] pb-[max(0.4rem,env(safe-area-inset-bottom))] sm:pt-0 sm:pb-0 print:max-h-none print:h-auto print:max-w-full print:rounded-none print:border-0 print:shadow-none print:bg-white print:text-black print:overflow-visible">
        {/* Modal Top Bar — Direct PDF Export & Whole-Document Preview Studio */}
        <div className="bg-[#0f172a] px-3 sm:px-5 py-2.5 sm:py-3.5 border-b-2 border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 flex-shrink-0 print:hidden">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                <FileDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400 font-mario block truncate">
                  A4 WHOLE-DOCUMENT PREVIEW &amp; PDF STUDIO
                </span>
                <h2 className="text-xs sm:text-base font-black text-white font-display truncate">
                  {documentMode === 'summary'
                    ? 'ONE-PAGE A4 SUMMARY'
                    : documentMode === 'certificate'
                    ? certOrientation === 'portrait'
                      ? 'A4 PORTRAIT CERTIFICATE'
                      : 'A4 LANDSCAPE CERTIFICATE'
                    : documentMode === 'scorecard'
                    ? 'A4 HERO SCORE CARD'
                    : 'COMPLETE LABOR REVIEWER'}
                </h2>
              </div>
            </div>

            <button
              type="button"
              data-testid="close-print-studio-mobile-btn"
              onClick={onClose}
              aria-label="Close Print Study Guide"
              className="lg:hidden min-h-[42px] min-w-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-2 flex-wrap">
            {/* 4-Mode Segmented Switcher (2x2 on narrow <460px phones so full labels never clip, 4-across on >=460px) */}
            <div className="grid grid-cols-2 min-[460px]:grid-cols-4 sm:inline-flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs w-full sm:w-auto gap-1">
              <button
                type="button"
                data-testid="toggle-summary-mode-btn"
                onClick={() => {
                  setDocumentMode('summary');
                  marioAudio.playCoin();
                }}
                className={`min-h-[38px] px-2.5 py-1 rounded-lg font-black cursor-pointer transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
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
                className={`min-h-[38px] px-2.5 py-1 rounded-lg font-black cursor-pointer transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
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
                className={`min-h-[38px] px-2.5 py-1 rounded-lg font-black cursor-pointer transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
                  documentMode === 'certificate'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Certificate</span>
              </button>
              <button
                type="button"
                data-testid="toggle-scorecard-mode-btn"
                onClick={() => {
                  setDocumentMode('scorecard');
                  marioAudio.playCoin();
                }}
                className={`min-h-[38px] px-2.5 py-1 rounded-lg font-black cursor-pointer transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
                  documentMode === 'scorecard'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span>Score Card</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={() => setShowControlPanel((prev) => !prev)}
                aria-expanded={showControlPanel}
                className="min-h-[42px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border-2 border-slate-600 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{showControlPanel ? 'Hide Options' : 'Options'}</span>
              </button>

              <button
                type="button"
                data-testid="download-active-pdf-btn"
                onClick={handleDownloadPdf}
                className="min-h-[42px] flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0 transition-transform"
                title="Download PDF file (.pdf)"
              >
                <FileDown className="w-4 h-4 shrink-0" />
                <span>
                  {pdfDownloadedNotice
                    ? 'PDF Downloaded (.pdf)'
                    : documentMode === 'summary'
                    ? 'Download 1-Page Summary PDF'
                    : documentMode === 'certificate'
                    ? 'Download Certificate PDF'
                    : documentMode === 'scorecard'
                    ? 'Download Score Card PDF'
                    : 'Download Reviewer PDF'}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Print Study Guide"
                className="hidden lg:flex min-h-[42px] min-w-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact 24 Themes & 20 Fonts Studio + Zoom/Page/Section Inspector Bar */}
        <div
          data-testid="print-quick-style-bar"
          className="bg-slate-950 px-3 sm:px-5 py-2 border-b border-slate-800 space-y-2 text-xs print:hidden flex-shrink-0"
        >
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-2 items-center">
            <div className="flex items-center gap-1.5 min-w-0 lg:col-span-4">
              <label
                htmlFor="print-quick-theme-select"
                className="text-[11px] font-black text-amber-300 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
              >
                <Palette className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Themes ({EXTENDED_PRINT_COLOR_THEMES.length}):</span>
                <span className="sm:hidden">Theme:</span>
              </label>
              <select
                id="print-quick-theme-select"
                data-testid="print-quick-theme-select"
                value={activeExtendedTheme.id}
                onChange={(e) =>
                  updateFormat(
                    'colorAccent',
                    e.target.value as PrintGuideFormatOptions['colorAccent']
                  )
                }
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs font-bold rounded-xl px-2 py-1 cursor-pointer focus:outline-none focus:border-amber-400 truncate"
              >
                {(['Legal & Classic', 'Mario Kingdom', 'Editorial & Luxury', 'Pastel & Ink-Saver'] as const).map((cat) => (
                  <optgroup key={cat} label={cat} className="bg-slate-950 text-amber-300 font-bold">
                    {EXTENDED_PRINT_COLOR_THEMES.filter((t) => t.category === cat).map((themeItem) => (
                      <option
                        key={themeItem.id}
                        value={themeItem.id}
                        className="bg-slate-900 text-white font-semibold"
                      >
                        {themeItem.name} ({themeItem.badge})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 min-w-0 lg:col-span-4">
              <label
                htmlFor="print-quick-font-select"
                className="text-[11px] font-black text-amber-300 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
              >
                <Type className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Fonts ({EXTENDED_PRINT_FONT_CATALOG.length}):</span>
                <span className="sm:hidden">Font:</span>
              </label>
              <select
                id="print-quick-font-select"
                data-testid="print-quick-font-select"
                value={activeExtendedFont.id}
                onChange={(e) =>
                  updateFormat(
                    'fontStyle',
                    e.target.value as PrintGuideFormatOptions['fontStyle']
                  )
                }
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs font-bold rounded-xl px-2 py-1 cursor-pointer focus:outline-none focus:border-amber-400 truncate"
              >
                {(['Sans-Serif', 'Legal Serif', 'Display & Mario', 'Tabular Mono'] as const).map((fCat) => (
                  <optgroup key={fCat} label={fCat} className="bg-slate-950 text-emerald-300 font-bold">
                    {EXTENDED_PRINT_FONT_CATALOG.filter((f) => f.category === fCat).map((fontItem) => (
                      <option
                        key={fontItem.id}
                        value={fontItem.id}
                        className="bg-slate-900 text-white font-semibold"
                      >
                        {fontItem.name} ({fontItem.badge})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="col-span-2 lg:col-span-4 flex items-center gap-1.5 min-w-0">
              <label
                htmlFor="print-quick-name-input"
                className="text-[11px] font-black text-emerald-300 whitespace-nowrap shrink-0"
              >
                Name:
              </label>
              <input
                id="print-quick-name-input"
                data-testid="print-quick-name-input"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder={playerName || 'Learner / Recipient name...'}
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                data-testid="toggle-visual-swatches-btn"
                onClick={() => setShowVisualSwatches((prev) => !prev)}
                aria-expanded={showVisualSwatches}
                className="min-h-[38px] px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                title="Show or hide visual color swatches and font pills"
              >
                <span>Swatches</span>
                {showVisualSwatches ? (
                  <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Preview Zoom, Render Mode (Live Sheet vs PDF File), Page Estimate & Section Jumpers */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Zoom Switcher */}
              <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 gap-0.5">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-0.5 shrink-0" />
                {(['fit', '75', '100', '125'] as const).map((zp) => (
                  <button
                    key={zp}
                    type="button"
                    data-testid={`print-zoom-${zp}-btn`}
                    onClick={() => {
                      marioAudio.playClick();
                      setZoomPreset(zp);
                    }}
                    className={`min-h-[30px] px-2 py-0.5 rounded-md text-[11px] font-black cursor-pointer transition-colors whitespace-nowrap ${
                      zoomPreset === zp
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {zp === 'fit'
                      ? `Fit (${Math.round(stageMetrics.fitScale * 100)}%)`
                      : `${zp}%`}
                  </button>
                ))}
              </div>

              {/* Live Sheet vs Generated PDF File Toggle */}
              <div
                data-testid="print-preview-render-mode-toggle"
                className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 gap-0.5"
              >
                <button
                  type="button"
                  data-testid="preview-mode-sheet-btn"
                  onClick={() => {
                    marioAudio.playClick();
                    setPreviewRenderMode('sheet');
                  }}
                  className={`min-h-[30px] px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 whitespace-nowrap ${
                    previewRenderMode === 'sheet'
                      ? 'bg-sky-400 text-slate-950 font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3 shrink-0" />
                  <span>Live Sheet</span>
                </button>
                <button
                  type="button"
                  data-testid="preview-mode-pdf-btn"
                  onClick={() => {
                    marioAudio.playClick();
                    setPreviewRenderMode('pdf');
                  }}
                  className={`min-h-[30px] px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 whitespace-nowrap ${
                    previewRenderMode === 'pdf'
                      ? 'bg-emerald-400 text-slate-950 font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-3 h-3 shrink-0" />
                  <span>PDF File</span>
                </button>
              </div>

              {documentMode === 'certificate' && (
                <div
                  data-testid="print-cert-orientation-toolbar-toggle"
                  className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 gap-0.5"
                >
                  <button
                    type="button"
                    data-testid="cert-orientation-landscape-btn"
                    onClick={() => {
                      marioAudio.playClick();
                      setCertOrientation('landscape');
                    }}
                    className={`min-h-[30px] px-2.5 py-0.5 rounded-md text-[11px] font-black cursor-pointer whitespace-nowrap ${
                      certOrientation === 'landscape'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Landscape
                  </button>
                  <button
                    type="button"
                    data-testid="cert-orientation-portrait-btn"
                    onClick={() => {
                      marioAudio.playClick();
                      setCertOrientation('portrait');
                    }}
                    className={`min-h-[30px] px-2.5 py-0.5 rounded-md text-[11px] font-black cursor-pointer whitespace-nowrap ${
                      certOrientation === 'portrait'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Portrait
                  </button>
                </div>
              )}

              <span
                data-testid="print-page-estimate-label"
                className="text-[11px] text-slate-400 font-mono tabular-nums whitespace-nowrap px-1"
              >
                {isLandscapeDocument ? 'A4 Landscape' : 'A4 Portrait'} ·{' '}
                {estimatedPageCount === 1 ? '1 Page' : `${estimatedPageCount} Pages`}
              </span>
            </div>

            {/* Whole-Reviewer Quick Section Jump Bar */}
            {documentMode === 'guide' && (
              <div
                data-testid="print-reviewer-section-jumpers"
                className="flex flex-wrap items-center gap-1"
              >
                <span className="text-[10px] font-bold text-amber-300 mr-0.5">Jump:</span>
                {[
                  { id: 'print-sec-masthead', label: 'Cover' },
                  { id: 'print-sec-matrices', label: 'Matrices' },
                  ...WORLDS_METADATA.filter((w) => selectedWorlds.includes(w.id)).map((w) => ({
                    id: `print-sec-${w.id}`,
                    label: `W${w.worldNumber}`,
                  })),
                  ...(includeHonorPledge
                    ? [{ id: 'print-sec-pledge', label: 'Pledge' }]
                    : []),
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    data-testid={`jump-${sec.id}`}
                    onClick={() => handleJumpToSection(sec.id)}
                    className="min-h-[28px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-200 hover:text-amber-300 cursor-pointer whitespace-nowrap"
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Themes & Fonts Swatches Studio — Super UI/UX Friendly */}
          {showVisualSwatches && (
            <div
              data-testid="print-visual-themes-fonts-strip"
              className="pt-2.5 pb-1 border-t border-slate-800 space-y-2.5"
            >
              {/* Header Controls: Tab Switcher + Category Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Segmented Switcher: Themes vs Fonts */}
                <div className="inline-flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    data-testid="swatch-tab-themes-btn"
                    onClick={() => {
                      marioAudio.playClick();
                      setSwatchViewMode('themes');
                    }}
                    className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      swatchViewMode === 'themes'
                        ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 shrink-0" />
                    <span>Color Themes ({EXTENDED_PRINT_COLOR_THEMES.length})</span>
                  </button>
                  <button
                    type="button"
                    data-testid="swatch-tab-fonts-btn"
                    onClick={() => {
                      marioAudio.playClick();
                      setSwatchViewMode('fonts');
                    }}
                    className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      swatchViewMode === 'fonts'
                        ? 'bg-emerald-400 text-slate-950 shadow-[0_2px_0_#000]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5 shrink-0" />
                    <span>Typography Fonts ({EXTENDED_PRINT_FONT_CATALOG.length})</span>
                  </button>
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {swatchViewMode === 'themes' ? (
                    (['All', 'Mario Kingdom', 'Legal & Classic', 'Editorial & Luxury', 'Pastel & Ink-Saver'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          marioAudio.playClick();
                          setThemeCategoryFilter(cat);
                        }}
                        className={`min-h-[26px] px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                          themeCategoryFilter === cat
                            ? 'bg-slate-800 text-amber-300 border-amber-400 font-black'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))
                  ) : (
                    (['All', 'Sans-Serif', 'Legal Serif', 'Display & Mario', 'Tabular Mono'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          marioAudio.playClick();
                          setFontCategoryFilter(cat);
                        }}
                        className={`min-h-[26px] px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                          fontCategoryFilter === cat
                            ? 'bg-slate-800 text-emerald-300 border-emerald-400 font-black'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Swatches Grid */}
              <div className="max-h-[30vh] sm:max-h-[34vh] overflow-y-auto pr-1">
                {swatchViewMode === 'themes' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {EXTENDED_PRINT_COLOR_THEMES.filter(
                      (t) => themeCategoryFilter === 'All' || t.category === themeCategoryFilter
                    ).map((themeItem) => {
                      const isSelected = activeExtendedTheme.id === themeItem.id;
                      return (
                        <button
                          key={themeItem.id}
                          type="button"
                          data-testid={`print-theme-swatch-${themeItem.id}`}
                          onClick={() => {
                            marioAudio.playCoin();
                            updateFormat(
                              'colorAccent',
                              themeItem.id as PrintGuideFormatOptions['colorAccent']
                            );
                          }}
                          className={`min-h-[58px] p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 relative overflow-hidden group ${
                            isSelected
                              ? 'bg-amber-400/15 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_4px_12px_rgba(251,191,36,0.25)]'
                              : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Palette Multi-Bar Swatch */}
                          <div className="flex items-center justify-between gap-1.5 w-full">
                            <div className="flex items-center h-3.5 rounded-md overflow-hidden border border-white/20 flex-1 shadow-xs">
                              {themeItem.swatchHexes.map((hex, idx) => (
                                <span
                                  key={idx}
                                  className="h-full flex-1"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                          </div>

                          {/* Theme Name & Badge */}
                          <div className="min-w-0">
                            <span
                              className={`text-[11px] font-black block truncate leading-tight ${
                                isSelected ? 'text-amber-300' : 'text-slate-100 group-hover:text-white'
                              }`}
                            >
                              {themeItem.name}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 block truncate">
                              {themeItem.badge} · {themeItem.category.replace(' & ', '/')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {EXTENDED_PRINT_FONT_CATALOG.filter(
                      (f) => fontCategoryFilter === 'All' || f.category === fontCategoryFilter
                    ).map((fontItem) => {
                      const isSelected = activeExtendedFont.id === fontItem.id;
                      return (
                        <button
                          key={fontItem.id}
                          type="button"
                          data-testid={`print-font-pill-${fontItem.id}`}
                          onClick={() => {
                            marioAudio.playClick();
                            updateFormat(
                              'fontStyle',
                              fontItem.id as PrintGuideFormatOptions['fontStyle']
                            );
                          }}
                          className={`min-h-[62px] p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1 relative overflow-hidden group ${
                            isSelected
                              ? 'bg-emerald-400/15 border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_4px_12px_rgba(52,211,153,0.25)]'
                              : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 w-full">
                            <span
                              style={{ fontFamily: fontItem.cssFontFamily }}
                              className="text-lg font-bold text-white leading-none tracking-normal"
                            >
                              Aa
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span
                              className={`text-[11px] font-black block truncate leading-tight ${
                                isSelected ? 'text-emerald-300' : 'text-slate-100 group-hover:text-white'
                              }`}
                            >
                              {fontItem.name}
                            </span>
                            <span
                              style={{ fontFamily: fontItem.cssFontFamily }}
                              className="text-[9.5px] text-slate-400 block truncate leading-tight mt-0.5"
                            >
                              {fontItem.sampleText}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Control Panel for PDF Aesthetics & Content Toggles */}
        {showControlPanel && (
          <div
            data-testid="print-guide-control-panel"
            className="bg-slate-900/95 px-4 py-3.5 border-b border-slate-700 space-y-3 text-xs font-bold print:hidden flex-shrink-0 max-h-[38vh] overflow-y-auto"
          >
            {documentMode === 'summary' ? (
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="space-y-1 flex-1 max-w-md">
                  <label
                    htmlFor="summary-candidate-name"
                    className="text-[11px] text-amber-300 font-bold block"
                  >
                    Optional Learner / Header Name on A4 Sheet:
                  </label>
                  <input
                    id="summary-candidate-name"
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g., Juan Dela Cruz · Labor Standards Scholar"
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
                    EXECUTIVE CERTIFICATE CUSTOMIZER (PORTRAIT OR LANDSCAPE)
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Exports directly as an A4 {certOrientation === 'portrait' ? 'Portrait (210×297mm)' : 'Landscape (297×210mm)'} Certificate PDF (.pdf)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 space-y-1">
                    <label className="text-[11px] text-amber-300 font-bold block">
                      Learner Name on Certificate:
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
                      className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                    >
                      <option value="Summa Cum Laude · Super Star Rank" className="bg-slate-900 text-white">Summa Cum Laude · Super Star Rank</option>
                      <option value="Magna Cum Laude · Fire Flower Mastery" className="bg-slate-900 text-white">Magna Cum Laude · Fire Flower Mastery</option>
                      <option value="Cum Laude · Super Mushroom Advocate" className="bg-slate-900 text-white">Cum Laude · Super Mushroom Advocate</option>
                      <option value="Highest Distinction in Philippine Labor Standards" className="bg-slate-900 text-white">Highest Distinction in Philippine Labor Standards</option>
                    </select>
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 space-y-1">
                    <span className="text-[11px] text-amber-300 font-bold block">
                      Page Orientation:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          marioAudio.playClick();
                          setCertOrientation('landscape');
                        }}
                        className={`min-h-[34px] rounded-lg text-xs font-black border cursor-pointer ${
                          certOrientation === 'landscape'
                            ? 'bg-amber-400 text-slate-950 border-black'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        Landscape
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          marioAudio.playClick();
                          setCertOrientation('portrait');
                        }}
                        className={`min-h-[34px] rounded-lg text-xs font-black border cursor-pointer ${
                          certOrientation === 'portrait'
                            ? 'bg-amber-400 text-slate-950 border-black'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        Portrait
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-white text-xs font-bold block truncate">
                        {certOrientation === 'portrait' ? 'Portrait A4' : 'Landscape A4'}
                      </span>
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
            ) : documentMode === 'scorecard' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-amber-300 text-xs font-black uppercase font-mario block">
                    OFFICIAL HERO SCORE CARD &amp; MASTERY DOSSIER
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Exports your live 6-World completion breakdown, study streak, coins, and earned badges as an A4 Landscape PDF styled in any of the {PRINT_COLOR_THEMES.length} themes &amp; {PRINT_FONT_STYLES.length} fonts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="min-h-[42px] px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl border-2 border-black cursor-pointer inline-flex items-center gap-1.5 shadow-[0_2px_0_#000] whitespace-nowrap shrink-0"
                >
                  <FileDown className="w-4 h-4 shrink-0" />
                  <span>Download Score Card PDF</span>
                </button>
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
                  Typography Font ({EXTENDED_PRINT_FONT_CATALOG.length}):
                </span>
                <select
                  value={activeExtendedFont.id}
                  onChange={(e) =>
                    updateFormat(
                      'fontStyle',
                      e.target.value as PrintGuideFormatOptions['fontStyle']
                    )
                  }
                  className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  {EXTENDED_PRINT_FONT_CATALOG.map((fontItem) => (
                    <option key={fontItem.id} value={fontItem.id} className="bg-slate-900 text-white">
                      {fontItem.name} ({fontItem.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ink & Color Palette */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Color Accent Palette ({EXTENDED_PRINT_COLOR_THEMES.length}):
                </span>
                <select
                  value={activeExtendedTheme.id}
                  onChange={(e) =>
                    updateFormat(
                      'colorAccent',
                      e.target.value as PrintGuideFormatOptions['colorAccent']
                    )
                  }
                  className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  {EXTENDED_PRINT_COLOR_THEMES.map((themeItem) => (
                    <option key={themeItem.id} value={themeItem.id} className="bg-slate-900 text-white">
                      {themeItem.name} ({themeItem.badge})
                    </option>
                  ))}
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
                  className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  <option value={0} className="bg-slate-900 text-white">0 Lines (Clean Reading)</option>
                  <option value={3} className="bg-slate-900 text-white">3 Blank Lines (For Quick Margin Notes)</option>
                  <option value={5} className="bg-slate-900 text-white">5 Blank Lines (For Exhaustive Case Notes)</option>
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
                  className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  <option value="none" className="bg-slate-900 text-white">No Watermark</option>
                  <option value="CONFIDENTIAL BAR REVIEW" className="bg-slate-900 text-white">CONFIDENTIAL BAR REVIEW</option>
                  <option value="OFFICIAL STUDY GUIDE" className="bg-slate-900 text-white">OFFICIAL STUDY GUIDE</option>
                  <option value="FOR ACADEMIC USE ONLY" className="bg-slate-900 text-white">FOR ACADEMIC USE ONLY</option>
                  <option value="DO NOT REPRODUCE" className="bg-slate-900 text-white">DO NOT REPRODUCE</option>
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

        {/* Printable Whole-Document Stage & Direct PDF File Inspector */}
        <div
          id="print-preview-scroll-stage"
          ref={previewScrollRef}
          data-testid="print-preview-scroll-stage"
          className={`overflow-auto flex-1 select-text print:overflow-visible print:p-0 print:bg-white ${
            isLivePreviewMode
              ? 'p-2.5 sm:p-5 bg-neutral-900/95'
              : 'p-2.5 sm:p-5 bg-slate-950/60'
          }`}
        >
          {/* Scoped CSS font inheritance style so all headings, bodies, badges, and numbers use chosen font stack */}
          <style>{`
            #one-page-summary-sheet,
            #one-page-summary-sheet *:not(.preserve-system-font),
            #official-labor-certificate,
            #official-labor-certificate *:not(.preserve-system-font),
            #official-scorecard-sheet,
            #official-scorecard-sheet *:not(.preserve-system-font),
            #printable-study-guide,
            #printable-study-guide *:not(.preserve-system-font) {
              font-family: ${activeCssFontStack} !important;
            }
          `}</style>

          {previewRenderMode === 'pdf' && (
            <div
              data-testid="generated-pdf-file-preview-card"
              className="max-w-5xl mx-auto h-full min-h-[380px] flex flex-col gap-3"
            >
              <div className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white truncate">
                    Generated A4 PDF Ready ({pdfPreviewState.pages}{' '}
                    {pdfPreviewState.pages === 1 ? 'Page' : 'Pages'} · {pdfPreviewState.kbSize} KB)
                  </span>
                </div>
                <span className="text-[11px] text-slate-300">
                  Theme: <strong className="text-amber-300">{activeExtendedTheme.name}</strong> · Font:{' '}
                  <strong className="text-emerald-300">{activeExtendedFont.name}</strong>
                </span>
              </div>
              {pdfPreviewState.url ? (
                <iframe
                  title="Generated PDF File Preview"
                  src={pdfPreviewState.url}
                  className="w-full flex-1 min-h-[420px] rounded-xl border-2 border-slate-700 bg-white"
                />
              ) : (
                <div className="flex-1 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center text-xs text-slate-400">
                  Building PDF preview...
                </div>
              )}
            </div>
          )}

          <div
            data-testid="print-scaled-stage-outer"
            style={{
              width: `${stageMetrics.scaledWidthPx}px`,
              height:
                sheetNaturalHeightPx > 0
                  ? `${Math.ceil(sheetNaturalHeightPx * stageMetrics.effectiveScale)}px`
                  : undefined,
              ...(previewRenderMode === 'pdf'
                ? {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -10,
                  }
                : {}),
            }}
            className="mx-auto relative transition-[width,height] duration-150 print:!w-full print:!h-auto"
          >
              <div
                ref={sheetContentRef}
                data-testid="print-scaled-stage-inner"
                style={{
                  width: `${stageMetrics.logicalWidthPx}px`,
                  minHeight: `${stageMetrics.logicalMinHeightPx}px`,
                  transform:
                    stageMetrics.effectiveScale !== 1
                      ? `scale(${stageMetrics.effectiveScale})`
                      : undefined,
                  transformOrigin: 'top left',
                }}
                className="print:!w-full print:!min-h-0 print:!transform-none select-text"
              >
                {documentMode === 'summary' ? (
                  /* ==================== ONE-PAGE A4 LEGAL FORMULAS & STATUTORY DEADLINES SUMMARY ==================== */
                  <div
                    id="one-page-summary-sheet"
                    data-testid="one-page-summary-sheet"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    style={activeSheetDynamicStyle}
                    className={`${summaryPaperBgClass} ${bodyFontClass} p-4 sm:p-5 rounded-2xl border-2 shadow-2xl w-full space-y-2.5 select-text overflow-visible box-border`}
                  >
                    {/* A4 Sheet Header */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.headerBgHex,
                        color: activeExtendedTheme.headerTextHex,
                        borderColor: activeExtendedTheme.borderHex,
                      }}
                      className={`border-b-2 ${headingBorderClass} px-3.5 py-2.5 rounded-xl flex items-end justify-between gap-3`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-xs">
                          <MarioSuperStarIcon size={20} />
                        </div>
                        <div className="min-w-0">
                          <span
                            style={{ color: activeExtendedTheme.headerTextHex }}
                            className="text-[9px] font-black uppercase tracking-wider opacity-90 block truncate"
                          >
                            PHILIPPINE LABOR STANDARDS · ONE-PAGE A4 MASTER SUMMARY · {activeExtendedTheme.name.toUpperCase()}
                          </span>
                          <h2
                            style={{ color: activeExtendedTheme.headerTextHex }}
                            className="text-base sm:text-lg font-black tracking-tight leading-snug"
                          >
                            KEY LEGAL FORMULAS, MULTIPLIERS &amp; STATUTORY DEADLINES
                          </h2>
                          <p
                            style={{ color: activeExtendedTheme.headerTextHex }}
                            className="text-[9.5px] sm:text-[10px] opacity-90 font-medium leading-tight"
                          >
                            P.D. No. 442 (Labor Code, as amended), DOLE D.O. 174-17, R.A. 10361, R.A. 11210, R.A. 11360 &amp; R.A. 11861
                          </p>
                        </div>
                      </div>
                      <div
                        style={{ color: activeExtendedTheme.headerTextHex }}
                        className="text-right text-[10px] font-mono opacity-95 shrink-0"
                      >
                        {candidateName.trim() && (
                          <div className="font-bold">{candidateName.trim()}</div>
                        )}
                        <div>Format: Single-Page A4 · {activeExtendedFont.name}</div>
                        <div>Updated: {currentDate}</div>
                      </div>
                    </div>

                    {/* Two-Column A4 Core Grid: Left = Formulas, Right = Deadlines */}
                    <div className="grid grid-cols-2 gap-3 items-start">
                      {/* Column 1: Key Legal Formulas */}
                      <div
                        style={{
                          borderColor: activeExtendedTheme.borderHex,
                          backgroundColor: '#FFFFFF',
                        }}
                        className={`border-2 ${subtleBoxClass} rounded-xl overflow-hidden bg-white`}
                      >
                        <div
                          style={{
                            backgroundColor: activeExtendedTheme.tableHeadBgHex,
                            color: activeExtendedTheme.headerTextHex,
                          }}
                          className={`${summaryBannerHeaderClass} px-3 py-1.5 flex items-center justify-between gap-2`}
                        >
                          <span className="text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5">
                            <MarioCoinBlockIcon size={14} />
                            <span>I. Key Statutory Pay Formulas ({ONE_PAGE_LEGAL_FORMULAS.length})</span>
                          </span>
                          <span className="text-[9.5px] font-mono opacity-85">Arts. 87–97 · 302</span>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {ONE_PAGE_LEGAL_FORMULAS.map((f, idx) => (
                            <div
                              key={f.id}
                              style={
                                idx % 2 === 1
                                  ? { backgroundColor: activeExtendedTheme.tableStripeBgHex }
                                  : { backgroundColor: '#FFFFFF' }
                              }
                              className="px-2.5 py-1 text-[10px] sm:text-[10.5px] leading-snug space-y-0.5"
                            >
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  style={{ color: activeExtendedTheme.bodyTextHex }}
                                  className="font-bold break-words [overflow-wrap:anywhere]"
                                >
                                  {f.title}
                                </span>
                                <span
                                  style={{ color: activeExtendedTheme.mutedTextHex }}
                                  className="font-mono text-[9px] shrink-0"
                                >
                                  {f.citation}
                                </span>
                              </div>
                              <div
                                style={{ color: activeExtendedTheme.accentHex }}
                                className="font-mono font-black text-[10.5px] sm:text-[11px] break-words [overflow-wrap:anywhere]"
                              >
                                {f.formula}
                              </div>
                              <p
                                style={{ color: activeExtendedTheme.mutedTextHex }}
                                className="text-[9.5px] sm:text-[10px] break-words [overflow-wrap:anywhere]"
                              >
                                {f.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Column 2: Statutory Deadlines & Prescriptive Periods */}
                      <div
                        style={{
                          borderColor: activeExtendedTheme.borderHex,
                          backgroundColor: '#FFFFFF',
                        }}
                        className={`border-2 ${subtleBoxClass} rounded-xl overflow-hidden bg-white`}
                      >
                        <div
                          style={{
                            backgroundColor: activeExtendedTheme.tableHeadBgHex,
                            color: activeExtendedTheme.headerTextHex,
                          }}
                          className={`${summaryBannerHeaderClass} px-3 py-1.5 flex items-center justify-between gap-2`}
                        >
                          <span className="text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5">
                            <MarioWarpPipeIcon size={14} />
                            <span>II. Prescriptive &amp; Procedural Deadlines ({ONE_PAGE_LEGAL_DEADLINES.length})</span>
                          </span>
                          <span className="text-[9.5px] font-mono opacity-85">Arts. 297–306</span>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {ONE_PAGE_LEGAL_DEADLINES.map((d, idx) => (
                            <div
                              key={d.id}
                              style={
                                idx % 2 === 1
                                  ? { backgroundColor: activeExtendedTheme.tableStripeBgHex }
                                  : { backgroundColor: '#FFFFFF' }
                              }
                              className="px-2.5 py-1 text-[10px] sm:text-[10.5px] leading-snug space-y-0.5"
                            >
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  style={{ color: activeExtendedTheme.bodyTextHex }}
                                  className="font-bold break-words [overflow-wrap:anywhere]"
                                >
                                  {d.claimOrAction}
                                </span>
                                <span
                                  style={{ color: activeExtendedTheme.accentHex }}
                                  className="font-mono font-black shrink-0 tabular-nums text-[10px] sm:text-[10.5px]"
                                >
                                  {d.deadline}
                                </span>
                              </div>
                              <p
                                style={{ color: activeExtendedTheme.mutedTextHex }}
                                className="text-[9.5px] sm:text-[10px] break-words [overflow-wrap:anywhere]"
                              >
                                <span className="font-semibold">{d.citation}:</span> {d.reckoningRule}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mario 8-Bit Brick Divider Strip */}
                    <MarioBrickStrip className="w-full h-1.5 rounded my-0.5 shadow-2xs" />

                    {/* Bottom A4 Strip: World 6 Statutory Leave Caps & Core Doctrines */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.accentSoftBgHex,
                        borderColor: activeExtendedTheme.borderHex,
                      }}
                      className={`border-2 rounded-xl p-2.5 space-y-1.5 ${subtleBoxClass}`}
                    >
                      <div
                        style={{ borderColor: activeExtendedTheme.borderHex }}
                        className="flex flex-wrap items-center justify-between gap-1 border-b pb-1"
                      >
                        <span
                          style={{ color: activeExtendedTheme.bodyTextHex }}
                          className="text-[11px] font-black uppercase flex items-center gap-1.5"
                        >
                          <MarioMushroomIcon size={14} variant="1up" />
                          <span>III. World 6 Statutory Leave Caps &amp; Core Tests</span>
                        </span>
                        <span
                          style={{ color: activeExtendedTheme.mutedTextHex }}
                          className="text-[9.5px] font-mono"
                        >
                          One-Page Printer-Friendly A4 Reference
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-[10.5px]">
                        {ONE_PAGE_STATUTORY_LEAVE_CAPS.map((lv) => (
                          <div
                            key={lv.leaveName}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1"
                          >
                            <div className="flex items-baseline justify-between gap-1">
                              <span className="font-bold text-slate-900 break-words [overflow-wrap:anywhere] text-[10px]">{lv.leaveName}</span>
                              <span className="font-mono font-black text-amber-800 tabular-nums shrink-0 text-[10px]">
                                {lv.cap}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-600 block break-words [overflow-wrap:anywhere] leading-tight">
                              {lv.citation} · {lv.rule}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* IV. Research & Development Cohort Attribution Bar */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.tableStripeBgHex || '#F8FAFC',
                        borderColor: activeExtendedTheme.borderHex,
                        color: activeExtendedTheme.bodyTextHex,
                      }}
                      className={`border-2 rounded-xl px-3 py-2 space-y-1 text-[10px] ${subtleBoxClass}`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1">
                        <span className="font-black uppercase tracking-wider text-[9px] text-amber-900 bg-amber-400 border border-amber-600 px-1.5 py-0.5 rounded shadow-xs inline-flex items-center gap-1">
                          <MarioSuperStarIcon size={12} />
                          <span>Research Cohort · 9 Members</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          P.D. No. 442 Master Summary · {activeExtendedFont.name}
                        </span>
                      </div>
                      <div className="text-[9.5px] font-semibold text-slate-900 tracking-tight leading-snug">
                        <span className="font-black text-amber-800">CORPUZ (Main Creator)</span> · CRUZ · FANGED · FERNANDEZ · GARCIA · GARVIDA · MAÑALAC · UNTALAN · VILA
                      </div>
                    </div>
                  </div>
                ) : documentMode === 'certificate' ? (
                  /* ==================== EXECUTIVE CERTIFICATE OF STATUTORY COMPLETION (PORTRAIT 794x1122 OR LANDSCAPE 1122x794) ==================== */
                  <div
                    id="official-labor-certificate"
                    data-testid="official-labor-certificate"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    data-orientation={certOrientation}
                    style={activeSheetDynamicStyle}
                    className={`${certThemeClasses.paper} ${bodyFontClass} text-slate-950 ${
                      certOrientation === 'portrait'
                        ? 'px-10 py-12 min-h-[1122px]'
                        : 'px-12 py-8 min-h-[794px]'
                    } border-[10px] rounded-2xl shadow-2xl w-full relative select-text flex flex-col justify-between gap-3 outline outline-3 overflow-hidden`}
                  >
                    {/* Corner Ornaments */}
                    <div className={`absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 ${certThemeClasses.corner} flex items-center justify-center`}>
                      <MarioSuperStarIcon size={16} />
                    </div>
                    <div className={`absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 ${certThemeClasses.corner} flex items-center justify-center`}>
                      <MarioSuperStarIcon size={16} />
                    </div>
                    <div className={`absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 ${certThemeClasses.corner} flex items-center justify-center`}>
                      <MarioSuperStarIcon size={16} />
                    </div>
                    <div className={`absolute bottom-3 right-3 w-7 h-7 border-r-2 border-b-2 ${certThemeClasses.corner} flex items-center justify-center`}>
                      <MarioSuperStarIcon size={16} />
                    </div>

                    {/* Header Seal & Title */}
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <div className={`w-11 h-11 rounded-full border-2 ${certThemeClasses.sealCircle} flex items-center justify-center shrink-0`}>
                          <MarioCoinBlockIcon size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                            REPUBLIC OF THE PHILIPPINES · PHILIPPINE LABOR STANDARDS GUIDE
                          </p>
                          <p className="text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
                            Department of Labor and Employment · Executive Statutory Completion Record
                          </p>
                        </div>
                      </div>

                      <div className="pt-1">
                        <h2
                          style={{
                            borderColor: activeExtendedTheme.borderHex,
                            color: activeExtendedTheme.accentHex,
                          }}
                          className={`${
                            certOrientation === 'portrait' ? 'text-3xl' : 'text-4xl'
                          } font-black tracking-wide uppercase border-y-2 py-2 my-1 ${certThemeClasses.title}`}
                        >
                          Certificate of Statutory Completion
                        </h2>
                        <p className="text-sm italic text-slate-700">
                          This Executive Honor Certificate is Proudly Conferred Upon
                        </p>
                      </div>
                    </div>

                    {/* Recipient */}
                    <div className="text-center py-1">
                      <h3
                        className={`${
                          certOrientation === 'portrait' ? 'text-3xl' : 'text-4xl'
                        } font-extrabold text-slate-950 tracking-tight border-b-2 border-slate-900 pb-1.5 max-w-2xl mx-auto break-words [overflow-wrap:anywhere]`}
                      >
                        {candidateName.trim() || playerName || 'Distinguished Labor Standards Scholar'}
                      </h3>
                      <p className={`text-sm font-black tracking-widest uppercase mt-2 ${certThemeClasses.honors}`}>
                        {certificateHonors}
                      </p>
                    </div>

                    {/* Body Certification text */}
                    <div className="text-center space-y-3 max-w-4xl mx-auto">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        for demonstrating comprehensive statutory mastery and practical command across all Six Worlds of the <strong className="font-bold">Labor Code of the Philippines (Presidential Decree No. 442, as amended)</strong>, encompassing Hours of Work &amp; Overtime Rules, Wages &amp; D.O. 174 Subcontracting, Kasambahay Rights, Security of Tenure, and all Statutory Leaves.
                      </p>

                      {/* 6 World Badges Strip (6-across in Landscape, 2x3 in Portrait) */}
                      <div
                        className={`grid ${
                          certOrientation === 'portrait' ? 'grid-cols-2 gap-3' : 'grid-cols-6 gap-2'
                        } pt-1 text-[11px] font-bold`}
                      >
                        {WORLDS_METADATA.map((w) => (
                          <div key={w.id} className={`border px-2.5 py-2 rounded-lg text-center min-w-0 ${certThemeClasses.badge}`}>
                            <span className="block font-black font-mono">WORLD {w.worldNumber}</span>
                            <span className="block leading-tight">{w.shortTitle}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signatures & Seal Footer */}
                    <div className="pt-4 border-t-2 border-amber-600/60 grid grid-cols-3 items-end gap-4 text-center">
                      <div className="space-y-0.5 min-w-0 px-2">
                        <div className="border-b border-slate-900 mx-auto max-w-[260px] pb-0.5">
                          <span className="italic text-base font-bold text-slate-900 block leading-snug">
                            Matthew Cesar Corpuz
                          </span>
                        </div>
                        <p className="text-[10.5px] font-black text-slate-700 uppercase leading-tight">
                          Matthew Cesar Corpuz
                        </p>
                        <p className="text-[9.5px] text-slate-500 leading-tight">
                          Main Creator &amp; Chief Legal Researcher
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-amber-500 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex flex-col items-center justify-center text-slate-950 shadow-md">
                          <MarioSuperStarIcon size={26} />
                          <span className="text-[8px] font-black tracking-tighter uppercase leading-none mt-0.5">
                            SEALED
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 font-bold mt-1">
                          VERIFIED {currentDate}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          ID: PH-LAW-{Math.abs(completedCount * 137 + 442).toString(16).toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-0.5 min-w-0 px-2">
                        <div className="border-b border-slate-900 mx-auto max-w-[280px] pb-0.5">
                          <span className="italic text-base font-bold text-slate-900 block leading-snug">
                            Labor Standards Academic Board
                          </span>
                        </div>
                        <p className="text-[10.5px] font-black text-slate-700 uppercase leading-tight">
                          Philippine Labor Standards Directorate
                        </p>
                        <p className="text-[9.5px] text-slate-500 leading-tight">
                          Statutory &amp; Workplace Rights Board
                        </p>
                      </div>
                    </div>
                  </div>
                ) : documentMode === 'scorecard' ? (
                  /* ==================== OFFICIAL HERO SCORE CARD & MASTERY DOSSIER (A4 LANDSCAPE 1122x794) ==================== */
                  <div
                    id="official-scorecard-sheet"
                    data-testid="official-scorecard-sheet"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    style={activeSheetDynamicStyle}
                    className={`${certThemeClasses.paper} ${bodyFontClass} text-slate-950 px-10 py-8 border-[8px] rounded-2xl shadow-2xl w-full min-h-[794px] select-text flex flex-col justify-between gap-5 outline outline-2 overflow-hidden`}
                  >
                    {/* Top Banner */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.headerBgHex,
                        color: activeExtendedTheme.headerTextHex,
                        borderColor: activeExtendedTheme.borderHex,
                      }}
                      className={`${summaryBannerHeaderClass} rounded-2xl p-6 flex items-center justify-between gap-6 border-2 ${headingBorderClass}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-md">
                          <MarioSuperStarIcon size={32} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span
                            style={{ color: activeExtendedTheme.headerTextHex }}
                            className="text-xs font-mono font-bold uppercase tracking-widest opacity-90 block"
                          >
                            SUPER MARIO LABOR ADVENTURE · OFFICIAL HERO SCORE CARD · {activeExtendedTheme.name.toUpperCase()}
                          </span>
                          <h2
                            style={{ color: activeExtendedTheme.headerTextHex }}
                            className="text-2xl sm:text-3xl font-black tracking-tight break-words [overflow-wrap:anywhere]"
                          >
                            {candidateName.trim() || playerName || 'Labor Scholar Hero'}
                          </h2>
                          <p
                            style={{ color: activeExtendedTheme.headerTextHex }}
                            className="text-sm font-semibold opacity-95"
                          >
                            {heroRankLabel} · Equipped Hero: {heroDisplayName} · {activeExtendedFont.name}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: activeExtendedTheme.accentSoftBgHex,
                          borderColor: activeExtendedTheme.borderHex,
                          color: activeExtendedTheme.bodyTextHex,
                        }}
                        className={`px-6 py-4 rounded-xl border-2 text-center shrink-0 ${certThemeClasses.badge}`}
                      >
                        <span className="text-3xl font-black font-mono tabular-nums block">
                          {overallPercent}%
                        </span>
                        <span className="text-xs font-bold block">
                          {completedCount} / {totalTopics} Modules Mastered
                        </span>
                      </div>
                    </div>

                    {/* 5 KPI Stat Tiles */}
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        {
                          label: 'STUDY TIME',
                          val: studyDurationFormatted,
                          icon: <Clock className="w-3.5 h-3.5 text-slate-500 inline mr-1" />,
                        },
                        {
                          label: 'GOLD COINS',
                          val: `x${coins}`,
                          icon: <MarioCoinIcon size={15} className="inline mr-1" />,
                        },
                        {
                          label: 'LOGIN STREAK',
                          val: `${loginStreak} Days`,
                          icon: <MarioFireFlowerIcon size={15} className="inline mr-1" />,
                        },
                        {
                          label: 'BADGES EARNED',
                          val: `${unlockedAchievementsCount}/${totalAchievementsCount}`,
                          icon: <MarioSuperStarIcon size={15} className="inline mr-1" />,
                        },
                        {
                          label: 'QUIZ RUNS',
                          val: `${quizRunsCompleted} Cleared`,
                          icon: <MarioMushroomIcon size={15} variant="super" className="inline mr-1" />,
                        },
                      ].map((tile) => (
                        <div
                          key={tile.label}
                          className={`rounded-xl border-2 ${headingBorderClass} ${subtleBoxClass} p-3.5 space-y-1`}
                        >
                          <span className="text-[11px] font-mono font-bold text-slate-600 flex items-center">
                            {tile.icon}
                            <span>{tile.label}</span>
                          </span>
                          <span className="text-lg font-black font-mono text-slate-950 tabular-nums block">
                            {tile.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Six-World Breakdown Grid */}
                    <div className="space-y-2.5 flex-1">
                      <div className={`border-b-2 ${headingBorderClass} pb-1.5 flex items-center justify-between`}>
                        <h3 className="text-sm font-black uppercase tracking-wide text-slate-950 flex items-center gap-2">
                          <MarioCoinBlockIcon size={16} />
                          <span>Six-World Philippine Labor Standards Mastery Breakdown</span>
                        </h3>
                        <span className="text-xs font-mono text-slate-600">Issued: {currentDate}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3.5">
                        {scoreCardWorldBreakdown.map((wb) => (
                          <div
                            key={wb.worldNumber}
                            className="bg-white border border-slate-300 rounded-xl p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2 text-sm">
                              <span className="font-black text-slate-950 flex items-center gap-1.5">
                                <MarioWarpPipeIcon size={14} className="shrink-0" />
                                <span>World {wb.worldNumber}: {wb.shortTitle}</span>
                              </span>
                              <span className="font-mono font-bold text-slate-700 tabular-nums">
                                {wb.percent}% ({wb.completed}/{wb.total})
                              </span>
                            </div>
                            <div className="h-3 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                              <div
                                style={{ width: `${Math.max(wb.percent > 0 ? 4 : 0, wb.percent)}%` }}
                                className={`h-full rounded-full ${
                                  wb.percent === 100 ? 'bg-emerald-600' : 'bg-amber-500'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mario 8-Bit Brick Divider Strip */}
                    <MarioBrickStrip className="w-full h-2 rounded my-1 shadow-2xs" />

                    {/* Footer */}
                    <div className={`border-t-2 ${headingBorderClass} pt-3 flex items-center justify-between text-xs font-mono text-slate-600`}>
                      <span>Super Mario Labor Adventure · Philippine Labor Standards Guide</span>
                      <span>Created by Matthew (Matthew Cesar Corpuz — Main Creator)</span>
                    </div>
                  </div>
                ) : (
                  <div
                    id="printable-study-guide"
                    data-compact={isCompact ? 'true' : 'false'}
                    data-orientation={pageOrientation}
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    style={activeSheetDynamicStyle}
                    className={`${summaryPaperBgClass} text-slate-950 ${marginPaddingClass} ${fontScaleClass} ${
                      isCompact ? 'space-y-4' : 'space-y-7'
                    } w-full ${bodyFontClass} relative overflow-hidden select-text allow-text-select ${
                      isLivePreviewMode
                        ? 'rounded-md border-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
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
                    id="print-sec-masthead"
                    style={{
                      backgroundColor: activeExtendedTheme.headerBgHex,
                      color: activeExtendedTheme.headerTextHex,
                      borderColor: activeExtendedTheme.borderHex,
                    }}
                    className={`border-b-2 ${headingBorderClass} rounded-xl px-4 ${
                      isCompact ? 'py-3 space-y-1' : 'py-5 space-y-2'
                    } text-center break-inside-avoid`}
                  >
              <div
                style={{ color: activeExtendedTheme.headerTextHex }}
                className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-90 font-mono"
              >
                PHILIPPINE LABOR CODE • P.D. NO. 442 • {activeExtendedTheme.name.toUpperCase()} • {activeExtendedFont.name.toUpperCase()}
              </div>
              <h1
                style={{ color: activeExtendedTheme.headerTextHex }}
                className={`${
                  isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                } font-black tracking-tight leading-tight flex items-center justify-center gap-2 flex-wrap`}
              >
                <MarioSuperStarIcon size={24} />
                <span>Philippine Labor Standards &amp; Statutory Welfare Reviewer</span>
                <MarioCoinBlockIcon size={24} />
              </h1>
              <p
                style={{ color: activeExtendedTheme.headerTextHex }}
                className="text-xs opacity-90 max-w-2xl mx-auto leading-relaxed"
              >
                Complete Six-World Bar &amp; Law School Memory Aid covering Hours of Work, Rest &amp; Holidays, 13th Month Pay, Wages &amp; D.O. 174, Special Groups, Protective Statutes, and Statutory Leaves (World 6)
              </p>
              {candidateName && (
                <div className="pt-1">
                  <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-slate-900">
                    Prepared for Examinee: <span className="font-black text-slate-950">{candidateName}</span>
                  </span>
                </div>
              )}
              <div
                style={{ color: activeExtendedTheme.headerTextHex }}
                className="pt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] opacity-90"
              >
                <span className="inline-flex items-center gap-1 font-semibold">
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
                } ${subtleBoxClass} break-inside-avoid`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <MarioSuperStarIcon size={16} />
                    <h2 className="font-black text-xs uppercase tracking-wide text-slate-950">
                      Memory Aid Attribution &amp; Research Cohort
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">
                    Main Creator: Matthew Cesar Corpuz
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-x-3 gap-y-2 text-[11px] text-slate-900">
                  {GROUP_MEMBERS.map((member, idx) => (
                    <div
                      key={member}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-white/85 border border-slate-300 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 border border-amber-600 shadow-xs tabular-nums">
                        {idx + 1}
                      </span>
                      <span className={idx === 0 ? 'font-black text-slate-950 flex-1 break-words [overflow-wrap:anywhere] leading-snug min-w-0' : 'font-semibold text-slate-900 flex-1 break-words [overflow-wrap:anywhere] leading-snug min-w-0'}>
                        {member}
                      </span>
                      {idx === 0 && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 inline-flex items-center gap-0.5">
                          <MarioSuperStarIcon size={11} />
                          <span>Lead</span>
                        </span>
                      )}
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
                } bg-white break-inside-avoid`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <MarioCoinBlockIcon size={16} />
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
                        <span className="font-bold block text-slate-950 break-words [overflow-wrap:anywhere] leading-tight">
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
            <div id="print-sec-matrices" className="space-y-6">
            {includeMultipliers && (
              <section className="space-y-2" data-testid="print-matrix-multipliers">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex flex-wrap items-center justify-between gap-2`}>
                  <div className="flex items-center gap-2">
                    <MarioCoinIcon size={18} />
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                      I. Statutory Pay Multiplier Matrix (DOLE BWC)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMultiplierSim((prev) => !prev);
                        marioAudio.playCoin();
                      }}
                      className="print:hidden px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] inline-flex items-center gap-1 border border-black shadow-xs cursor-pointer"
                      title="Open interactive DOLE pay multiplier simulator"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{showMultiplierSim ? 'Close Calculator' : 'Live Pay Calculator'}</span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-600">Arts. 87, 93–94 Labor Code</span>
                  </div>
                </div>

                {/* Interactive Multiplier Live Simulator (Print Hidden) */}
                {showMultiplierSim && (
                  <div className="print:hidden p-3 rounded-xl bg-slate-900 text-white border-2 border-amber-400 shadow-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center font-mario">
                          ?
                        </span>
                        <span className="font-black text-xs uppercase tracking-wide text-amber-300">
                          DOLE Statutory Pay Multiplier Simulator
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <label htmlFor="sim-wage-input" className="text-slate-300 font-bold">
                          Daily Wage: ₱
                        </label>
                        <input
                          id="sim-wage-input"
                          type="number"
                          min="100"
                          max="50000"
                          step="1"
                          value={simDailyWage}
                          onChange={(e) => setSimDailyWage(Math.max(1, Number(e.target.value) || 0))}
                          className="w-24 px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-mono font-bold text-xs"
                        />
                        <span className="text-slate-400 text-[11px] font-mono">
                          (₱{(simDailyWage / 8).toFixed(2)}/hr)
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 text-[10px] block font-bold">Ordinary OT (+2h @ 125%)</span>
                        <span className="font-mono font-black text-amber-300 text-sm">
                          ₱{((simDailyWage / 8) * 1.25 * 2).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">Total: ₱{(simDailyWage + (simDailyWage / 8) * 1.25 * 2).toFixed(2)}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 text-[10px] block font-bold">Rest Day / Special (130%)</span>
                        <span className="font-mono font-black text-emerald-300 text-sm">
                          ₱{(simDailyWage * 1.3).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">+₱{(simDailyWage * 0.3).toFixed(2)} premium</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 text-[10px] block font-bold">Regular Holiday (200%)</span>
                        <span className="font-mono font-black text-yellow-300 text-sm">
                          ₱{(simDailyWage * 2.0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">200% double pay</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 text-[10px] block font-bold">Holiday on Rest Day (260%)</span>
                        <span className="font-mono font-black text-sky-300 text-sm">
                          ₱{(simDailyWage * 2.6).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">+60% combined</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full overflow-x-auto print:overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse tabular-nums box-border">
                    <colgroup>
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '33%' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '32%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Benefit Category</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Scenario / Day Type</th>
                        <th className="p-2 border border-slate-500 font-black text-right break-words [overflow-wrap:anywhere]">Rate</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Statutory Formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LABOR_BENEFITS_MULTIPLIER_LIST.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`break-inside-avoid ${
                            idx % 2 === 1 ? zebraRowClass : 'bg-white'
                          }`}
                        >
                          <td className="p-1.5 border border-slate-400 font-bold text-slate-950 align-top break-words [overflow-wrap:anywhere] leading-snug">
                            {row.benefit}
                          </td>
                          <td className="p-1.5 border border-slate-400 text-slate-900 align-top break-words [overflow-wrap:anywhere] leading-snug">
                            {row.scenario}
                          </td>
                          <td className="p-1.5 border border-slate-400 font-mono font-black text-slate-950 text-right align-top break-words [overflow-wrap:anywhere] leading-snug">
                            {(row.multiplierDecimal * 100).toFixed(1).replace(/\.0$/, '')}%
                          </td>
                          <td className="p-1.5 border border-slate-400 font-mono text-[10px] text-slate-900 align-top break-words [overflow-wrap:anywhere] leading-snug">
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
                  <div className="flex items-center gap-2">
                    <MarioWarpPipeIcon size={18} />
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                      II. 17 Regions Daily Minimum Wage &amp; Kasambahay Matrix
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">R.A. 6727 · R.A. 10361</span>
                </div>
                <div className="w-full overflow-x-auto print:overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse tabular-nums box-border">
                    <colgroup>
                      <col style={{ width: '26%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '18%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Region</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Effectivity</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Non-Agriculture</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Agriculture</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Kasambahay / Mo.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REGIONAL_MINIMUM_WAGES.map((rw, idx) => {
                        const kas = KASAMBAHAY_MINIMUM_WAGES[idx];
                        return (
                          <tr
                            key={rw.region}
                            className={`break-inside-avoid ${
                              idx % 2 === 1 ? zebraRowClass : 'bg-white'
                            }`}
                          >
                            <td className="p-1.5 border border-slate-400 font-bold text-slate-950 align-top break-words [overflow-wrap:anywhere] leading-snug">
                              {rw.region}
                            </td>
                            <td className="p-1.5 border border-slate-400 font-mono text-[10px] text-slate-800 align-top break-words [overflow-wrap:anywhere] leading-snug">
                              {rw.effectivity}
                            </td>
                            <td className="p-1.5 border border-slate-400 font-mono font-bold text-slate-950 align-top break-words [overflow-wrap:anywhere] leading-snug">
                              {rw.nonAgri}
                            </td>
                            <td className="p-1.5 border border-slate-400 font-mono text-slate-900 align-top break-words [overflow-wrap:anywhere] leading-snug">
                              {rw.agri}
                            </td>
                            <td className="p-1.5 border border-slate-400 font-mono text-slate-900 align-top break-words [overflow-wrap:anywhere] leading-snug">
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
                  <div className="flex items-center gap-2">
                    <MarioMushroomIcon size={18} variant="1up" />
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                      III. World 6 Statutory Leaves Master Comparison Matrix
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">Art. 95 &amp; Special Leave Statutes</span>
                </div>
                <div className="w-full overflow-x-auto print:overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse tabular-nums box-border">
                    <colgroup>
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '24%' }} />
                      <col style={{ width: '22%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Statutory Leave</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Legal Basis</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Paid Duration</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Key Eligibility</th>
                        <th className="p-2 border border-slate-500 font-black break-words [overflow-wrap:anywhere]">Cash Commutation &amp; Payor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STATUTORY_LEAVES_MASTER_ROWS.map((row, idx) => (
                        <tr
                          key={row.leave}
                          className={`break-inside-avoid ${
                            idx % 2 === 1 ? zebraRowClass : 'bg-white'
                          }`}
                        >
                          <td className="p-1.5 border border-slate-400 font-bold text-slate-950 align-top break-words [overflow-wrap:anywhere] leading-snug">
                            {row.leave}
                          </td>
                          <td className="p-1.5 border border-slate-400 font-mono text-[10px] text-slate-800 align-top break-words [overflow-wrap:anywhere] leading-snug">
                            {formatOptions.includeLegalCitations ? row.basis : 'Statutory'}
                          </td>
                          <td className="p-1.5 border border-slate-400 font-bold text-slate-950 align-top break-words [overflow-wrap:anywhere] leading-snug">
                            {row.duration}
                          </td>
                          <td className="p-1.5 border border-slate-400 text-slate-900 align-top break-words [overflow-wrap:anywhere] leading-snug">
                            {row.eligibility}
                          </td>
                          <td className="p-1.5 border border-slate-400 text-slate-900 align-top break-words [overflow-wrap:anywhere] leading-snug">
                            {row.conversion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            </div>

            {/* IV. Unabridged Modules Breakdown (or Embedded Module Matrices in Matrices-Only Mode) */}
            <section className={isCompact ? 'space-y-4' : 'space-y-6'}>
              <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center justify-between gap-2`}>
                <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                  {matricesOnlyMode
                    ? 'IV. Embedded Module Comparative Matrices (Worlds 1–6)'
                    : 'IV. Codified Provisions, Doctrines, Exceptions & Bar Exam Tips'}
                </h2>
                <span className="text-[10.5px] text-slate-600">
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
                    <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                      Statutory Wage Multipliers &amp; Overtime Computation Cheat Sheet
                    </h3>
                    <span className="text-[10px] font-mono text-slate-600 font-bold">Labor Code Arts. 86, 87, 93, 94 &amp; P.D. 851</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="border border-slate-300 rounded-xl p-6 text-center space-y-1.5 bg-slate-50">
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
                      id={`print-sec-${world.id}`}
                      className={`${isCompact ? 'space-y-3' : 'space-y-4'} ${
                        formatOptions.pageBreakPerWorld && worldIdx > 0 ? 'print-page-break-before' : ''
                      }`}
                    >
                      {/* Clean Theme-Matched Editorial World Banner */}
                      <div
                        style={{
                          backgroundColor: activeExtendedTheme.accentSoftBgHex,
                          borderColor: activeExtendedTheme.borderHex,
                          color: activeExtendedTheme.bodyTextHex,
                        }}
                        className={`border-2 ${headingBorderClass} rounded-xl ${
                          isCompact ? 'px-3 py-2' : 'px-4 py-2.5'
                        } ${worldBannerClass} break-inside-avoid`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3
                            style={{ color: activeExtendedTheme.accentHex }}
                            className="font-black text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5"
                          >
                            <MarioSuperStarIcon size={14} />
                            <span>World {world.worldNumber}: {world.title.replace(/^WORLD \d+:\s*/i, '')}</span>
                          </h3>
                          <span
                            style={{ color: activeExtendedTheme.mutedTextHex }}
                            className="text-[10px] font-mono tabular-nums font-bold"
                          >
                            {worldTopics.length} {worldTopics.length === 1 ? 'Module' : 'Modules'}
                          </span>
                        </div>
                        {!matricesOnlyMode && (
                          <p
                            style={{ color: activeExtendedTheme.mutedTextHex }}
                            className="text-[11px] mt-0.5"
                          >
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
                              className={`border-y sm:border-y border-slate-300 bg-white ${
                                isCompact ? 'p-3 space-y-2' : 'p-4 space-y-3'
                              } break-inside-avoid print:break-inside-avoid ${twoColumnLayout ? 'mb-4 inline-block w-full' : ''} ${
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
                                  <strong className="font-bold text-amber-900 uppercase">Mario Executive Takeaway:</strong>{' '}
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
                                    <span className="font-bold text-slate-950 block text-[10.5px] uppercase tracking-wide">
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
                                      <div className="w-full overflow-x-auto print:overflow-visible pt-0.5">
                                        <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse tabular-nums box-border">
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
                                                  className="p-1.5 border border-slate-500 font-black break-words [overflow-wrap:anywhere]"
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
                                                  rrIdx % 2 === 1 ? zebraRowClass : 'bg-white'
                                                }`}
                                              >
                                                {rRow.map((cell, cIdx) => (
                                                  <td
                                                    key={cIdx}
                                                    className={`p-1.5 border border-slate-400 align-top break-words [overflow-wrap:anywhere] leading-snug ${
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
                                  <span className="font-bold text-slate-950 block text-[10.5px] uppercase tracking-wide">
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
                                    className={`border ${tipBoxClass} rounded-lg ${
                                      isCompact ? 'p-2 space-y-0.5' : 'p-2.5 space-y-1'
                                    } break-inside-avoid`}
                                  >
                                    <span className="font-bold text-slate-950 flex items-center gap-1 text-[10.5px] uppercase tracking-wide">
                                      <Sparkles className="w-3 h-3 shrink-0" />
                                      Memory Traps &amp; High-Yield Takeaways
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
                                      Learner Notes &amp; Statutory Annotations:
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

            {/* Learner Honor Pledge & Attestation */}
            {includeHonorPledge && (
              <section
                id="print-sec-pledge"
                className={`border ${headingBorderClass} rounded-xl p-4 ${subtleBoxClass} break-inside-avoid space-y-2 mt-4`}
              >
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                    Learner&apos;s Workplace Justice Pledge &amp; Attestation
                  </h3>
                  <span className="text-[10px] font-mono text-slate-600 font-bold">Labor Standards Mastery</span>
                </div>
                <p className="text-[11px] text-slate-800 italic leading-relaxed">
                  &ldquo;I hereby affirm that I have studied and committed to understanding the provisions, exceptions, wage computations, and Supreme Court doctrines of Philippine Labor Standards codified herein, with integrity and respect for fair workplace rights.&rdquo;
                </p>
                <div className="pt-4 flex flex-wrap items-end justify-between gap-4 text-[11px] text-slate-900">
                  <div className="space-y-1">
                    <div className="border-b-2 border-slate-950 w-64 pb-1">
                      <span className="font-bold text-xs">{candidateName || playerName || 'Learner Full Name & Signature'}</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Learner Signature</span>
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
              <span>Created by Matthew · Super Mario Labor Standards Guide (Worlds 1–6)</span>
              <span>Complete Six-World Reviewer</span>
            </footer>
          </div>
          )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
