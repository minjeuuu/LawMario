import { jsPDF } from 'jspdf';
import {
  ONE_PAGE_LEGAL_FORMULAS,
  ONE_PAGE_LEGAL_DEADLINES,
  ONE_PAGE_STATUTORY_LEAVE_CAPS,
} from './onePageSummaryData';
import { WORLDS_METADATA, ALL_LAW_TOPICS } from '../data/laborLawData';
import { LABOR_BENEFITS_MULTIPLIER_LIST } from '../data/multiplierTable';
import { REGIONAL_MINIMUM_WAGES, KASAMBAHAY_MINIMUM_WAGES } from '../data/regionalWages';
import { GROUP_MEMBERS, StudyNoteItem } from './engagementFeatures';
import { cleanRuleText } from './moduleFormatter';
import { LawTopic } from '../types/laborLaw';

export type PdfColorThemeId =
  | 'executive_navy'
  | 'ink_saver_bw'
  | 'supreme_court_crimson'
  | 'forest_dole_emerald'
  | 'vintage_parchment'
  | 'mario_mushroom_red'
  | 'starlight_cobalt'
  | 'royal_amethyst'
  | 'yoshi_jade_lime'
  | 'teal_tribunal'
  | 'terracotta_codal'
  | 'bowser_obsidian_gold';

export type PdfFontStyleId =
  | 'editorial_serif'
  | 'modern_sans'
  | 'classic_monospace'
  | 'academic_times'
  | 'clean_inter'
  | 'formal_georgia'
  | 'warm_charter'
  | 'condensed_narrow'
  | 'retro_mario_mono'
  | 'dyslexic_sans'
  | 'playfair_royal'
  | 'space_grotesk';

type RgbTuple = [number, number, number];

export interface ResolvedPdfPalette {
  id: PdfColorThemeId;
  fontFamily: 'helvetica' | 'times' | 'courier';
  pageBg: RgbTuple;
  primary: RgbTuple;
  primaryText: RgbTuple;
  kickerText: RgbTuple;
  accent: RgbTuple;
  accentTextOnFill: RgbTuple;
  secondaryAccent: RgbTuple;
  badgeFill: RgbTuple;
  badgeBorder: RgbTuple;
  badgeText: RgbTuple;
  zebraFill: RgbTuple;
  cardTintFill: RgbTuple;
  borderStrong: RgbTuple;
  borderMuted: RgbTuple;
  bodyText: RgbTuple;
  mutedText: RgbTuple;
  formulaText: RgbTuple;
  isInkSaver: boolean;
}

export function resolvePdfThemeAndFont(
  colorAccent?: string,
  fontStyle?: string
): ResolvedPdfPalette {
  const fontFamily: 'helvetica' | 'times' | 'courier' =
    fontStyle === 'editorial_serif' ||
    fontStyle === 'playfair_royal' ||
    fontStyle === 'academic_times' ||
    fontStyle === 'formal_georgia' ||
    fontStyle === 'warm_charter'
      ? 'times'
      : fontStyle === 'classic_monospace' || fontStyle === 'retro_mario_mono'
      ? 'courier'
      : 'helvetica';

  switch (colorAccent) {
    case 'ink_saver_bw':
      return {
        id: 'ink_saver_bw',
        fontFamily,
        pageBg: [255, 255, 255],
        primary: [24, 24, 27],
        primaryText: [255, 255, 255],
        kickerText: [228, 228, 231],
        accent: [63, 63, 70],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [82, 82, 91],
        badgeFill: [244, 244, 245],
        badgeBorder: [39, 39, 42],
        badgeText: [24, 24, 27],
        zebraFill: [250, 250, 250],
        cardTintFill: [252, 252, 253],
        borderStrong: [24, 24, 27],
        borderMuted: [161, 161, 170],
        bodyText: [24, 24, 27],
        mutedText: [82, 82, 91],
        formulaText: [24, 24, 27],
        isInkSaver: true,
      };
    case 'supreme_court_crimson':
      return {
        id: 'supreme_court_crimson',
        fontFamily,
        pageBg: [255, 253, 252],
        primary: [127, 29, 29],
        primaryText: [255, 255, 255],
        kickerText: [253, 224, 71],
        accent: [185, 28, 28],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [180, 83, 9],
        badgeFill: [254, 242, 242],
        badgeBorder: [185, 28, 28],
        badgeText: [127, 29, 29],
        zebraFill: [255, 247, 247],
        cardTintFill: [255, 250, 245],
        borderStrong: [127, 29, 29],
        borderMuted: [226, 198, 198],
        bodyText: [30, 20, 20],
        mutedText: [100, 65, 65],
        formulaText: [153, 27, 27],
        isInkSaver: false,
      };
    case 'forest_dole_emerald':
      return {
        id: 'forest_dole_emerald',
        fontFamily,
        pageBg: [252, 255, 253],
        primary: [6, 78, 59],
        primaryText: [255, 255, 255],
        kickerText: [253, 224, 71],
        accent: [5, 150, 105],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [13, 148, 136],
        badgeFill: [236, 253, 245],
        badgeBorder: [5, 150, 105],
        badgeText: [6, 78, 59],
        zebraFill: [243, 251, 247],
        cardTintFill: [240, 253, 244],
        borderStrong: [6, 78, 59],
        borderMuted: [167, 218, 199],
        bodyText: [15, 35, 28],
        mutedText: [55, 92, 79],
        formulaText: [6, 95, 70],
        isInkSaver: false,
      };
    case 'vintage_parchment':
      return {
        id: 'vintage_parchment',
        fontFamily,
        pageBg: [253, 248, 235],
        primary: [92, 45, 12],
        primaryText: [255, 251, 235],
        kickerText: [253, 224, 71],
        accent: [180, 83, 9],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [146, 64, 14],
        badgeFill: [254, 243, 199],
        badgeBorder: [180, 83, 9],
        badgeText: [92, 45, 12],
        zebraFill: [250, 241, 220],
        cardTintFill: [254, 246, 226],
        borderStrong: [120, 53, 15],
        borderMuted: [214, 190, 156],
        bodyText: [48, 28, 12],
        mutedText: [108, 74, 45],
        formulaText: [146, 64, 14],
        isInkSaver: false,
      };
    case 'mario_mushroom_red':
      return {
        id: 'mario_mushroom_red',
        fontFamily,
        pageBg: [255, 253, 249],
        primary: [185, 28, 28],
        primaryText: [255, 255, 255],
        kickerText: [254, 240, 138],
        accent: [217, 119, 6],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [22, 163, 74],
        badgeFill: [254, 243, 199],
        badgeBorder: [185, 28, 28],
        badgeText: [153, 27, 27],
        zebraFill: [255, 247, 237],
        cardTintFill: [254, 249, 195],
        borderStrong: [153, 27, 27],
        borderMuted: [252, 165, 165],
        bodyText: [28, 25, 23],
        mutedText: [87, 83, 78],
        formulaText: [185, 28, 28],
        isInkSaver: false,
      };
    case 'starlight_cobalt':
      return {
        id: 'starlight_cobalt',
        fontFamily,
        pageBg: [248, 251, 255],
        primary: [30, 58, 138],
        primaryText: [255, 255, 255],
        kickerText: [186, 230, 253],
        accent: [2, 132, 199],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [79, 70, 229],
        badgeFill: [224, 242, 254],
        badgeBorder: [2, 132, 199],
        badgeText: [30, 58, 138],
        zebraFill: [240, 249, 255],
        cardTintFill: [239, 246, 255],
        borderStrong: [30, 58, 138],
        borderMuted: [186, 230, 253],
        bodyText: [15, 23, 42],
        mutedText: [51, 65, 85],
        formulaText: [3, 105, 161],
        isInkSaver: false,
      };
    case 'royal_amethyst':
      return {
        id: 'royal_amethyst',
        fontFamily,
        pageBg: [253, 250, 255],
        primary: [88, 28, 135],
        primaryText: [255, 255, 255],
        kickerText: [253, 224, 71],
        accent: [147, 51, 234],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [190, 24, 93],
        badgeFill: [243, 232, 255],
        badgeBorder: [147, 51, 234],
        badgeText: [88, 28, 135],
        zebraFill: [250, 245, 255],
        cardTintFill: [253, 244, 255],
        borderStrong: [88, 28, 135],
        borderMuted: [216, 180, 254],
        bodyText: [30, 16, 48],
        mutedText: [88, 62, 114],
        formulaText: [107, 33, 168],
        isInkSaver: false,
      };
    case 'yoshi_jade_lime':
      return {
        id: 'yoshi_jade_lime',
        fontFamily,
        pageBg: [250, 255, 248],
        primary: [20, 83, 45],
        primaryText: [255, 255, 255],
        kickerText: [217, 249, 157],
        accent: [22, 163, 74],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [101, 163, 13],
        badgeFill: [236, 252, 203],
        badgeBorder: [22, 163, 74],
        badgeText: [20, 83, 45],
        zebraFill: [240, 253, 244],
        cardTintFill: [247, 254, 231],
        borderStrong: [20, 83, 45],
        borderMuted: [187, 247, 208],
        bodyText: [16, 36, 22],
        mutedText: [54, 88, 63],
        formulaText: [21, 128, 61],
        isInkSaver: false,
      };
    case 'teal_tribunal':
      return {
        id: 'teal_tribunal',
        fontFamily,
        pageBg: [247, 255, 254],
        primary: [19, 78, 74],
        primaryText: [255, 255, 255],
        kickerText: [153, 246, 228],
        accent: [13, 148, 136],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [2, 132, 199],
        badgeFill: [204, 251, 241],
        badgeBorder: [13, 148, 136],
        badgeText: [19, 78, 74],
        zebraFill: [240, 253, 250],
        cardTintFill: [236, 254, 255],
        borderStrong: [19, 78, 74],
        borderMuted: [153, 246, 228],
        bodyText: [15, 34, 34],
        mutedText: [55, 92, 90],
        formulaText: [15, 118, 110],
        isInkSaver: false,
      };
    case 'terracotta_codal':
      return {
        id: 'terracotta_codal',
        fontFamily,
        pageBg: [255, 250, 245],
        primary: [124, 45, 18],
        primaryText: [255, 255, 255],
        kickerText: [254, 215, 170],
        accent: [234, 88, 12],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [180, 83, 9],
        badgeFill: [255, 237, 213],
        badgeBorder: [234, 88, 12],
        badgeText: [124, 45, 18],
        zebraFill: [255, 247, 237],
        cardTintFill: [254, 243, 199],
        borderStrong: [124, 45, 18],
        borderMuted: [253, 186, 116],
        bodyText: [41, 24, 15],
        mutedText: [104, 68, 48],
        formulaText: [154, 52, 18],
        isInkSaver: false,
      };
    case 'bowser_obsidian_gold':
      return {
        id: 'bowser_obsidian_gold',
        fontFamily,
        pageBg: [252, 252, 250],
        primary: [24, 24, 27],
        primaryText: [254, 240, 138],
        kickerText: [250, 204, 21],
        accent: [180, 83, 9],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [185, 28, 28],
        badgeFill: [254, 249, 195],
        badgeBorder: [161, 98, 7],
        badgeText: [24, 24, 27],
        zebraFill: [244, 244, 245],
        cardTintFill: [254, 252, 232],
        borderStrong: [24, 24, 27],
        borderMuted: [161, 161, 170],
        bodyText: [24, 24, 27],
        mutedText: [82, 82, 91],
        formulaText: [161, 98, 7],
        isInkSaver: false,
      };
    case 'executive_navy':
    default:
      return {
        id: 'executive_navy',
        fontFamily,
        pageBg: [255, 255, 255],
        primary: [15, 23, 42],
        primaryText: [255, 255, 255],
        kickerText: [251, 191, 36],
        accent: [217, 119, 6],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [5, 150, 105],
        badgeFill: [254, 243, 199],
        badgeBorder: [217, 119, 6],
        badgeText: [146, 64, 14],
        zebraFill: [248, 250, 252],
        cardTintFill: [255, 251, 235],
        borderStrong: [15, 23, 42],
        borderMuted: [203, 213, 225],
        bodyText: [15, 23, 42],
        mutedText: [71, 85, 105],
        formulaText: [6, 95, 70],
        isInkSaver: false,
      };
  }
}

/**
 * Normalizes Unicode symbols into clean Latin-1 / WinAnsi text so built-in PDF
 * fonts (Helvetica, Times, Courier) render 100% crisp text with zero garbled glyphs.
 */
export function sanitizePdfText(raw: string | undefined | null): string {
  if (!raw) return '';
  return String(raw)
    .replace(/₱/g, 'PHP ')
    .replace(/[—–]/g, ' - ')
    .replace(/[•·]/g, '-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/×/g, 'x')
    .replace(/÷/g, '/')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/→/g, '->')
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Triggers a direct client-side file download of PDF bytes without opening
 * window.print() or redirecting away from the app.
 */
export function triggerPdfDownloadFromBytes(bytes: Uint8Array, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

function docToUint8Array(doc: jsPDF): Uint8Array {
  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}

function paintPageBackground(doc: jsPDF, pageW: number, pageH: number, bg: RgbTuple): void {
  if (bg[0] === 255 && bg[1] === 255 && bg[2] === 255) return;
  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.rect(0, 0, pageW, pageH, 'F');
}

export interface OnePageSummaryPdfOptions {
  candidateName?: string;
  dateLabel?: string;
  colorAccent?: string;
  fontStyle?: string;
  includeWatermark?: boolean;
  watermarkText?: string;
}

/**
 * Builds an exact 1-page A4 Portrait PDF (210mm x 297mm) containing all key
 * Philippine Labor Law formulas, multipliers, statutory deadlines, prescriptive periods,
 * and leave caps on a single printer-friendly sheet — applying the user's selected
 * color theme and font family with zero overlaps or cropping.
 */
export function buildOnePageSummaryPdfBytes(options: OnePageSummaryPdfOptions = {}): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const theme = resolvePdfThemeAndFont(options.colorAccent, options.fontStyle);
  const ff = theme.fontFamily;

  const pageW = 210;
  const pageH = 297;
  const marginX = 8;
  const contentW = pageW - marginX * 2; // 194mm
  const colGap = 4;
  const colW = (contentW - colGap) / 2; // 95mm each
  const leftX = marginX;
  const rightX = marginX + colW + colGap;

  paintPageBackground(doc, pageW, pageH, theme.pageBg);

  const dateStr = sanitizePdfText(
    options.dateLabel ||
      new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
  );
  const candidate = sanitizePdfText(options.candidateName);

  // Outer precision border frame
  doc.setDrawColor(...theme.borderStrong);
  doc.setLineWidth(0.45);
  doc.rect(5.5, 5.5, pageW - 11, pageH - 11);

  // Header Banner (y = 7.8 to 23.0)
  if (theme.isInkSaver) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...theme.borderStrong);
    doc.setLineWidth(0.5);
    doc.rect(marginX, 7.8, contentW, 15.2, 'FD');
    doc.setTextColor(...theme.bodyText);
  } else {
    doc.setFillColor(...theme.primary);
    doc.rect(marginX, 7.8, contentW, 15.2, 'F');
    doc.setTextColor(...theme.kickerText);
  }

  doc.setFont(ff, 'bold');
  doc.setFontSize(6.3);
  doc.text(
    'PHILIPPINE LABOR CODE (P.D. 442 AS AMENDED) - DOLE BWC HANDBOOK - RAPID STUDY REFERENCE',
    pageW / 2,
    11.5,
    { align: 'center' }
  );

  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, 'bold');
  doc.setFontSize(11.2);
  doc.text('ONE-PAGE STATUTORY FORMULAS & DEADLINES MASTER SHEET (A4)', pageW / 2, 16.9, {
    align: 'center',
  });

  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : ([226, 232, 240] as RgbTuple)));
  doc.setFont(ff, 'normal');
  doc.setFontSize(6.3);
  const watermarkSuffix =
    options.includeWatermark && options.watermarkText
      ? `  |  ${sanitizePdfText(options.watermarkText)}`
      : '';
  const subMeta = candidate
    ? `Prepared for: ${candidate}  |  Generated: ${dateStr}  |  Curated by Matthew Cesar Corpuz${watermarkSuffix}`
    : `Generated: ${dateStr}  |  Philippine Labor Standards Memory Aid  |  Curated by Matthew Cesar Corpuz${watermarkSuffix}`;
  const clampedSubMeta = doc.splitTextToSize(subMeta, contentW - 6)[0] || subMeta;
  doc.text(clampedSubMeta, pageW / 2, 21.1, { align: 'center' });

  // ==================== LEFT COLUMN: PART I - FORMULAS ====================
  let leftY = 25.0;
  doc.setFillColor(...theme.accent);
  doc.rect(leftX, leftY, colW, 5.4, 'F');
  doc.setTextColor(...theme.accentTextOnFill);
  doc.setFont(ff, 'bold');
  doc.setFontSize(7.1);
  doc.text('I. KEY STATUTORY WAGE, LEAVE & SEPARATION FORMULAS', leftX + 2, leftY + 3.7);
  leftY += 6.5;

  ONE_PAGE_LEGAL_FORMULAS.forEach((item, idx) => {
    const rowH = 15.1;
    if (idx % 2 === 0) {
      doc.setFillColor(...theme.zebraFill);
      doc.rect(leftX, leftY, colW, rowH, 'F');
    }
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.18);
    doc.rect(leftX, leftY, colW, rowH);

    // Rate badge on top-right (19mm wide, never overlapping left title)
    const badgeW = 19;
    doc.setFillColor(...theme.badgeFill);
    doc.setDrawColor(...theme.badgeBorder);
    doc.roundedRect(leftX + colW - badgeW - 1.2, leftY + 0.9, badgeW, 3.9, 0.7, 0.7, 'FD');
    doc.setTextColor(...theme.badgeText);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.9);
    const rateText = doc.splitTextToSize(sanitizePdfText(item.rateBadge), badgeW - 1.5)[0] || '';
    doc.text(rateText, leftX + colW - badgeW / 2 - 1.2, leftY + 3.5, {
      align: 'center',
    });

    // Title safely clamped to left of badge
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, 'bold');
    doc.setFontSize(6.5);
    const safeTitle =
      doc.splitTextToSize(sanitizePdfText(`${idx + 1}. ${item.title}`), colW - badgeW - 4)[0] || '';
    doc.text(safeTitle, leftX + 1.5, leftY + 3.7);

    // Formula line
    doc.setTextColor(...theme.formulaText);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.95);
    const formulaLines = doc.splitTextToSize(sanitizePdfText(item.formula), colW - 3);
    doc.text(formulaLines[0] || '', leftX + 1.5, leftY + 7.5);

    // Note + Legal Basis (max 2 lines)
    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, 'normal');
    doc.setFontSize(5.55);
    const noteStr = `${sanitizePdfText(item.note)} [${sanitizePdfText(item.citation)}]`;
    const noteLines = doc.splitTextToSize(noteStr, colW - 3).slice(0, 2);
    doc.text(noteLines, leftX + 1.5, leftY + 10.9);

    leftY += rowH + 0.52;
  });

  // ==================== RIGHT COLUMN: PART II - DEADLINES & PRESCRIPTION ====================
  let rightY = 25.0;
  doc.setFillColor(...theme.secondaryAccent);
  doc.rect(rightX, rightY, colW, 5.4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(ff, 'bold');
  doc.setFontSize(7.1);
  doc.text('II. STATUTORY DEADLINES & PRESCRIPTIVE PERIODS', rightX + 2, rightY + 3.7);
  rightY += 6.5;

  ONE_PAGE_LEGAL_DEADLINES.forEach((item, idx) => {
    const rowH = 14.0;
    if (idx % 2 === 0) {
      doc.setFillColor(...theme.zebraFill);
      doc.rect(rightX, rightY, colW, rowH, 'F');
    }
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.18);
    doc.rect(rightX, rightY, colW, rowH);

    // Deadline badge on top-right
    const dlBadgeW = 24;
    doc.setFillColor(...theme.badgeFill);
    doc.setDrawColor(...theme.badgeBorder);
    doc.roundedRect(rightX + colW - dlBadgeW - 1.2, rightY + 0.9, dlBadgeW, 3.9, 0.7, 0.7, 'FD');
    doc.setTextColor(...theme.badgeText);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.65);
    const dlText = doc.splitTextToSize(sanitizePdfText(item.deadline), dlBadgeW - 1.5)[0] || '';
    doc.text(dlText, rightX + colW - dlBadgeW / 2 - 1.2, rightY + 3.5, {
      align: 'center',
    });

    // Claim / Action title safely clamped to left of deadline badge
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, 'bold');
    doc.setFontSize(6.35);
    const titleLines = doc.splitTextToSize(
      sanitizePdfText(`${idx + 1}. ${item.claimOrAction}`),
      colW - dlBadgeW - 4
    );
    doc.text(titleLines[0] || '', rightX + 1.5, rightY + 3.7);

    // Reckoning rule + citation
    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, 'normal');
    doc.setFontSize(5.6);
    const ruleText = `${sanitizePdfText(item.reckoningRule)} (${sanitizePdfText(item.citation)})`;
    const ruleLines = doc.splitTextToSize(ruleText, colW - 3).slice(0, 2);
    doc.text(ruleLines, rightX + 1.5, rightY + 8.0);

    rightY += rowH + 0.52;
  });

  // ==================== PART III: BOTTOM FULL-WIDTH WORLD 6 LEAVES & DOCTRINAL CHECKPOINTS ====================
  const bottomY = Math.max(leftY, rightY) + 1.0;
  doc.setFillColor(...theme.primary);
  doc.rect(marginX, bottomY, contentW, 5.1, 'F');
  doc.setTextColor(...(theme.isInkSaver ? ([255, 255, 255] as RgbTuple) : theme.kickerText));
  doc.setFont(ff, 'bold');
  doc.setFontSize(6.9);
  doc.text(
    'III. STATUTORY LEAVES QUICK MATRIX (WORLD 6) & CORE WORKPLACE CHECKPOINTS',
    marginX + 2,
    bottomY + 3.5
  );

  const gridY = bottomY + 6.0;
  const leaveCardW = (contentW - 4) / 3;
  const leaveCardH = 12.2;

  ONE_PAGE_STATUTORY_LEAVE_CAPS.forEach((lv, idx) => {
    const colIdx = idx % 3;
    const rowIdx = Math.floor(idx / 3);
    const cx = marginX + colIdx * (leaveCardW + 2);
    const cy = gridY + rowIdx * (leaveCardH + 1.1);

    doc.setFillColor(...theme.cardTintFill);
    doc.setDrawColor(...theme.badgeBorder);
    doc.setLineWidth(0.18);
    doc.rect(cx, cy, leaveCardW, leaveCardH, 'FD');

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, 'bold');
    doc.setFontSize(6.1);
    const lvTitle =
      doc.splitTextToSize(sanitizePdfText(`${lv.leaveName} (${lv.citation})`), leaveCardW - 2.6)[0] ||
      '';
    doc.text(lvTitle, cx + 1.3, cy + 3.4);

    doc.setTextColor(...theme.badgeText);
    doc.setFont('courier', 'bold');
    doc.setFontSize(5.9);
    const lvCap = doc.splitTextToSize(sanitizePdfText(lv.cap), leaveCardW - 2.6)[0] || '';
    doc.text(lvCap, cx + 1.3, cy + 6.6);

    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, 'normal');
    doc.setFontSize(5.3);
    const lvRule = doc.splitTextToSize(sanitizePdfText(lv.rule), leaveCardW - 2.6).slice(0, 2);
    doc.text(lvRule, cx + 1.3, cy + 9.4);
  });

  const checkY = gridY + 2 * (leaveCardH + 1.1) + 0.7;
  doc.setFillColor(...theme.zebraFill);
  doc.setDrawColor(...theme.borderStrong);
  doc.setLineWidth(0.22);
  doc.rect(marginX, checkY, contentW, 10.2, 'FD');
  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, 'bold');
  doc.setFontSize(5.75);
  doc.text(
    'FOUR-FOLD CONTROL TEST: (1) Selection/Engagement, (2) Payment of Wages, (3) Power of Dismissal, (4) Power of Control over means & methods (Most Crucial).',
    marginX + 1.8,
    checkY + 3.8
  );
  doc.text(
    'NOMINAL DAMAGES (AGABON / JAKA DOCTRINE): Valid Just Cause + defective Twin-Notice = PHP 30,000  |  Valid Authorized Cause + defective 30d Notice = PHP 50,000.',
    marginX + 1.8,
    checkY + 7.8
  );

  // Footer strictly inside single A4 sheet
  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, 'normal');
  doc.setFontSize(5.9);
  doc.text(
    'Super Mario Labor Adventure - Philippine Labor Standards A4 One-Page Summary (Page 1 of 1)',
    marginX,
    288.4
  );
  doc.text('Created by Matthew (Matthew Cesar Corpuz - Main Creator)', pageW - marginX, 288.4, {
    align: 'right',
  });

  return docToUint8Array(doc);
}

export function downloadOnePageSummaryA4Pdf(options: OnePageSummaryPdfOptions = {}): Uint8Array {
  const bytes = buildOnePageSummaryPdfBytes(options);
  triggerPdfDownloadFromBytes(bytes, 'One-Page-Labor-Formulas-Deadlines-A4.pdf');
  return bytes;
}

export interface CertificatePdfParams {
  recipientName?: string;
  honors?: string;
  completedCount: number;
  totalCount: number;
  dateLabel?: string;
  certificateId?: string;
  colorAccent?: string;
  fontStyle?: string;
}

/**
 * Builds an Official A4 Landscape Certificate of Statutory Mastery PDF (297mm x 210mm)
 * styled dynamically with the user's selected color theme and font family, with
 * balanced landscape geometry and zero overflows.
 */
export function buildCertificateLandscapePdfBytes(params: CertificatePdfParams): Uint8Array {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const theme = resolvePdfThemeAndFont(params.colorAccent, params.fontStyle || 'editorial_serif');
  const ff = theme.fontFamily;
  const W = 297;
  const H = 210;

  const recipient =
    sanitizePdfText(params.recipientName) || 'Distinguished Labor Standards Scholar';
  const honors =
    sanitizePdfText(params.honors) || 'Summa Cum Laude - Super Star Mastery Rank';
  const dateStr = sanitizePdfText(
    params.dateLabel ||
      new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
  );
  const certId =
    sanitizePdfText(params.certificateId) ||
    `PH-LAW-${Math.abs(params.completedCount * 137 + 442)
      .toString(16)
      .toUpperCase()}`;

  // Diploma background tinted to selected theme
  const certBg: RgbTuple = theme.isInkSaver
    ? [255, 255, 255]
    : theme.id === 'vintage_parchment'
    ? [253, 247, 232]
    : theme.pageBg[0] === 255 && theme.pageBg[1] === 255 && theme.pageBg[2] === 255
    ? [255, 253, 248]
    : theme.pageBg;
  doc.setFillColor(...certBg);
  doc.rect(0, 0, W, H, 'F');

  // Double diplomatic frame in theme colors
  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(2.2);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.75);
  doc.rect(13.5, 13.5, W - 27, H - 27);

  // Subtle inner hairline
  doc.setDrawColor(...theme.borderMuted);
  doc.setLineWidth(0.25);
  doc.rect(15.5, 15.5, W - 31, H - 31);

  // Corner ornaments
  const corners = [
    [18, 18],
    [W - 18, 18],
    [18, H - 18],
    [W - 18, H - 18],
  ];
  doc.setFillColor(...theme.accent);
  corners.forEach(([cx, cy]) => {
    doc.circle(cx, cy, 2.1, 'F');
  });

  // Top Academy Crest Header
  doc.setTextColor(...theme.primary);
  doc.setFont(ff, 'bold');
  doc.setFontSize(9.5);
  doc.text(
    'REPUBLIC OF THE PHILIPPINES  -  ACADEMY OF LABOR STANDARDS & SOCIAL LEGISLATION',
    W / 2,
    26.5,
    { align: 'center' }
  );

  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, 'bold');
  doc.setFontSize(7.8);
  doc.text(
    'PRESIDENTIAL DECREE NO. 442 (LABOR CODE OF THE PHILIPPINES)  -  WORLDS 1 TO 6 SYLLABUS',
    W / 2,
    32.2,
    { align: 'center' }
  );

  // Main Certificate Title with Accent Rules
  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(0.6);
  doc.line(40, 37, W - 40, 37);
  doc.line(40, 52, W - 40, 52);

  doc.setTextColor(...theme.primary);
  doc.setFont(ff, 'bold');
  doc.setFontSize(25.5);
  doc.text('CERTIFICATE OF STATUTORY MASTERY', W / 2, 47, { align: 'center' });

  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, ff === 'courier' ? 'normal' : 'italic');
  doc.setFontSize(11.5);
  doc.text('This Official Diploma is Proudly Conferred Upon', W / 2, 60.5, { align: 'center' });

  // Recipient Name (dynamically scaled so long names never overflow)
  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, 'bold');
  const recipientFontSize = recipient.length > 36 ? 19 : recipient.length > 26 ? 22 : 25.5;
  doc.setFontSize(recipientFontSize);
  const clampedRecipient = doc.splitTextToSize(recipient, W - 70)[0] || recipient;
  doc.text(clampedRecipient, W / 2, 74.5, { align: 'center' });

  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.5);
  doc.line(64, 78.2, W - 64, 78.2);

  // Honors line
  doc.setTextColor(...theme.badgeText);
  doc.setFont(ff, 'bold');
  doc.setFontSize(10);
  const clampedHonors = doc.splitTextToSize(honors.toUpperCase(), W - 70)[0] || honors.toUpperCase();
  doc.text(clampedHonors, W / 2, 85.8, { align: 'center' });

  // Citation Paragraph
  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, 'normal');
  doc.setFontSize(10.8);
  const citationBody =
    'for demonstrating comprehensive mastery and practical command across all Six Worlds of Philippine Labor Standards (Presidential Decree No. 442, as amended), encompassing Hours of Work & Overtime Rules, Rest Days & Holidays, Wages & D.O. 174 Subcontracting, Special Groups of Employees, Protective Workplace Statutes, and World 6 Statutory Leaves.';
  const bodyLines = doc.splitTextToSize(citationBody, W - 74).slice(0, 4);
  doc.text(bodyLines, W / 2, 95.5, { align: 'center' });

  // 6 Worlds Mastery Strip
  const boxY = 120;
  const totalBoxes = WORLDS_METADATA.length;
  const gap = 3.5;
  const stripW = W - 56;
  const boxW = (stripW - gap * (totalBoxes - 1)) / totalBoxes;
  const startX = 28;

  WORLDS_METADATA.forEach((w, idx) => {
    const bx = startX + idx * (boxW + gap);
    doc.setFillColor(...theme.badgeFill);
    doc.setDrawColor(...theme.badgeBorder);
    doc.setLineWidth(0.35);
    doc.roundedRect(bx, boxY, boxW, 16, 2, 2, 'FD');

    doc.setTextColor(...theme.badgeText);
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.2);
    doc.text(`WORLD ${w.worldNumber}`, bx + boxW / 2, boxY + 6.2, { align: 'center' });

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, 'bold');
    doc.setFontSize(7.1);
    const shortTitle = doc.splitTextToSize(sanitizePdfText(w.shortTitle), boxW - 2)[0] || '';
    doc.text(shortTitle, bx + boxW / 2, boxY + 12.2, { align: 'center' });
  });

  // Signatures & Official Seal Row
  const sigLineY = 170;

  // Left Signature
  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, ff === 'courier' ? 'bold' : 'bolditalic');
  doc.setFontSize(12);
  doc.text('Matthew Cesar Corpuz', 74, sigLineY - 3, { align: 'center' });
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.4);
  doc.line(36, sigLineY, 112, sigLineY);
  doc.setFont(ff, 'bold');
  doc.setFontSize(8.0);
  doc.text('MATTHEW CESAR CORPUZ', 74, sigLineY + 5, { align: 'center' });
  doc.setFont(ff, 'normal');
  doc.setFontSize(7.0);
  doc.setTextColor(...theme.mutedText);
  doc.text('Main Creator & Lead Author of Memory Aid', 74, sigLineY + 9.2, { align: 'center' });

  // Center Medallion Seal
  doc.setFillColor(...theme.accent);
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(1.0);
  doc.circle(W / 2, sigLineY - 4, 13.2, 'FD');
  doc.setDrawColor(...theme.badgeFill);
  doc.setLineWidth(0.4);
  doc.circle(W / 2, sigLineY - 4, 10.6, 'S');
  doc.setTextColor(...theme.accentTextOnFill);
  doc.setFont(ff, 'bold');
  doc.setFontSize(7.2);
  doc.text('OFFICIAL', W / 2, sigLineY - 5.2, { align: 'center' });
  doc.text('SEAL', W / 2, sigLineY - 1.2, { align: 'center' });

  doc.setTextColor(...theme.mutedText);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.2);
  doc.text(`ISSUED: ${dateStr}`, W / 2, sigLineY + 14.2, { align: 'center' });
  doc.setFontSize(6.6);
  doc.text(
    `ID: ${certId}  |  MODULES COMPLETED: ${params.completedCount}/${Math.max(1, params.totalCount)}`,
    W / 2,
    sigLineY + 18.4,
    { align: 'center' }
  );

  // Right Signature
  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, ff === 'courier' ? 'bold' : 'bolditalic');
  doc.setFontSize(12);
  doc.text('Academic Standards Council', W - 74, sigLineY - 3, { align: 'center' });
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.4);
  doc.line(W - 112, sigLineY, W - 36, sigLineY);
  doc.setFont(ff, 'bold');
  doc.setFontSize(8.0);
  doc.text('PHILIPPINE LABOR STANDARDS BOARD', W - 74, sigLineY + 5, { align: 'center' });
  doc.setFont(ff, 'normal');
  doc.setFontSize(7.0);
  doc.setTextColor(...theme.mutedText);
  doc.text('Workplace Rights & Statutory Education', W - 74, sigLineY + 9.2, { align: 'center' });

  return docToUint8Array(doc);
}

export function downloadCertificateLandscapePdf(params: CertificatePdfParams): Uint8Array {
  const bytes = buildCertificateLandscapePdfBytes(params);
  triggerPdfDownloadFromBytes(bytes, 'Official-Labor-Mastery-Certificate-Landscape-A4.pdf');
  return bytes;
}

export interface StudyGuideReviewerPdfParams {
  orientation?: 'portrait' | 'landscape';
  candidateName?: string;
  completedTopicIds: string[];
  topics: LawTopic[];
  selectedWorlds: string[];
  includeGroupMembers?: boolean;
  includeProgress?: boolean;
  includeMultipliers?: boolean;
  includeRegionalWages?: boolean;
  includeLeavesMatrix?: boolean;
  includePersonalNotes?: boolean;
  includeBarTips?: boolean;
  includeLegalCitations?: boolean;
  matricesOnlyMode?: boolean;
  studyNotes?: StudyNoteItem[];
  colorAccent?: string;
  fontStyle?: string;
  paperMargins?: 'compact' | 'standard' | 'spacious';
  fontSizeScale?: 'small' | 'normal' | 'large';
  includeCheckboxes?: boolean;
  includeWatermark?: boolean;
  watermarkText?: string;
  includeFormulasCheatSheet?: boolean;
  includeFourFoldControlTest?: boolean;
  includeTwoNoticeChecklist?: boolean;
  includeRetirementFormulaBox?: boolean;
  includeHonorPledge?: boolean;
  blankNoteLinesCount?: number;
}

/**
 * Generates a complete, multi-page A4 Study Guide Reviewer PDF respecting the
 * user's chosen orientation, color theme, font family, margins, font scale,
 * selected worlds, multi-line wrapped tables, and study notes — with zero overlaps or cropping.
 */
export function buildStudyGuideReviewerPdfBytes(
  params: StudyGuideReviewerPdfParams
): Uint8Array {
  const orientation = params.orientation || 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const theme = resolvePdfThemeAndFont(params.colorAccent, params.fontStyle);
  const ff = theme.fontFamily;

  const pageW = orientation === 'landscape' ? 297 : 210;
  const pageH = orientation === 'landscape' ? 210 : 297;
  const marginX =
    params.paperMargins === 'compact' ? 9 : params.paperMargins === 'spacious' ? 16 : 12;
  const marginTop = params.paperMargins === 'compact' ? 11 : 14;
  const marginBottom = 15;
  const contentW = pageW - marginX * 2;
  const scale =
    params.fontSizeScale === 'small' ? 0.9 : params.fontSizeScale === 'large' ? 1.1 : 1.0;

  paintPageBackground(doc, pageW, pageH, theme.pageBg);
  let y = marginTop;

  const addThemedPage = () => {
    doc.addPage('a4', orientation);
    paintPageBackground(doc, pageW, pageH, theme.pageBg);
    y = marginTop;
  };

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageH - marginBottom) {
      addThemedPage();
    }
  };

  const writeSectionHeading = (title: string, rightTag?: string) => {
    ensureSpace(12);
    if (theme.isInkSaver) {
      doc.setFillColor(244, 244, 245);
      doc.setDrawColor(...theme.borderStrong);
      doc.setLineWidth(0.35);
      doc.rect(marginX, y, contentW, 7.2, 'FD');
      doc.setTextColor(...theme.bodyText);
    } else {
      doc.setFillColor(...theme.primary);
      doc.rect(marginX, y, contentW, 7.2, 'F');
      doc.setTextColor(...theme.kickerText);
    }
    doc.setFont(ff, 'bold');
    doc.setFontSize(8.3 * scale);
    const maxTitleW = rightTag ? contentW - 42 : contentW - 5;
    const clampedTitle = doc.splitTextToSize(sanitizePdfText(title), maxTitleW)[0] || '';
    doc.text(clampedTitle, marginX + 2.5, y + 4.9);
    if (rightTag) {
      doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : ([226, 232, 240] as RgbTuple)));
      doc.setFont('courier', 'bold');
      doc.setFontSize(6.8 * scale);
      doc.text(sanitizePdfText(rightTag), pageW - marginX - 2.5, y + 4.9, { align: 'right' });
    }
    y += 9.8;
  };

  /**
   * Draws a clean, multi-line wrapped table where every cell wraps strictly inside
   * its own column width and row height expands automatically so text never overlaps.
   */
  const drawWrappedTable = (
    headers: string[],
    rows: string[][],
    colFractions?: number[]
  ) => {
    if (headers.length === 0) return;
    const colCount = headers.length;
    const fractions =
      colFractions && colFractions.length === colCount
        ? colFractions
        : colCount === 2
        ? [0.34, 0.66]
        : colCount === 3
        ? [0.28, 0.36, 0.36]
        : colCount === 4
        ? [0.25, 0.2, 0.27, 0.28]
        : Array.from({ length: colCount }, () => 1 / colCount);

    const colWidths = fractions.map((f) => f * contentW);
    const cellPadX = 1.6;
    const cellPadY = 1.4;
    const fontSz = 6.7 * scale;
    const lineH = 3.2 * scale;

    const renderRow = (cells: string[], isHeader: boolean, rowIdx: number) => {
      doc.setFont(isHeader ? ff : ff, isHeader ? 'bold' : 'normal');
      doc.setFontSize(fontSz);

      const wrappedCells = colWidths.map((cw, cIdx) => {
        const txt = sanitizePdfText(cells[cIdx] || '');
        return doc.splitTextToSize(txt, Math.max(10, cw - cellPadX * 2));
      });
      const maxLines = Math.max(1, ...wrappedCells.map((lines) => lines.length));
      const rowH = maxLines * lineH + cellPadY * 2;

      ensureSpace(rowH + 1);

      if (isHeader) {
        doc.setFillColor(...theme.badgeFill);
      } else if (rowIdx % 2 === 0) {
        doc.setFillColor(...theme.zebraFill);
      } else {
        doc.setFillColor(...theme.pageBg);
      }
      doc.setDrawColor(...theme.borderMuted);
      doc.setLineWidth(0.18);
      doc.rect(marginX, y, contentW, rowH, 'FD');

      let curX = marginX;
      colWidths.forEach((cw, cIdx) => {
        if (cIdx > 0) {
          doc.line(curX, y, curX, y + rowH);
        }
        doc.setTextColor(...(isHeader ? theme.badgeText : theme.bodyText));
        doc.setFont(ff, isHeader ? 'bold' : cIdx === 0 ? 'bold' : 'normal');
        doc.setFontSize(fontSz);
        doc.text(wrappedCells[cIdx], curX + cellPadX, y + cellPadY + lineH * 0.78);
        curX += cw;
      });

      y += rowH;
    };

    renderRow(headers, true, 0);
    rows.forEach((r, idx) => renderRow(r, false, idx));
    y += 2.5;
  };

  // Masthead
  if (theme.isInkSaver) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...theme.borderStrong);
    doc.setLineWidth(0.6);
    doc.rect(marginX, y, contentW, 20.5, 'FD');
    doc.setTextColor(...theme.bodyText);
  } else {
    doc.setFillColor(...theme.primary);
    doc.rect(marginX, y, contentW, 20.5, 'F');
    doc.setTextColor(...theme.kickerText);
  }

  doc.setFont(ff, 'bold');
  doc.setFontSize(7.3);
  doc.text(
    'PHILIPPINE LABOR CODE (P.D. NO. 442 AS AMENDED) - UNABRIDGED STUDY REVIEWER',
    pageW / 2,
    y + 5.4,
    { align: 'center' }
  );

  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, 'bold');
  doc.setFontSize(13.2);
  doc.text('Philippine Labor Standards & Workplace Rights Study Guide', pageW / 2, y + 12, {
    align: 'center',
  });

  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : ([226, 232, 240] as RgbTuple)));
  doc.setFont(ff, 'normal');
  doc.setFontSize(7.2);
  const coverSub = params.candidateName
    ? `Prepared for: ${sanitizePdfText(params.candidateName)}  |  Modules Included: ${params.topics.length}  |  Created by Matthew Cesar Corpuz`
    : `Modules Included: ${params.topics.length}  |  Mastered: ${params.completedTopicIds.length}/${ALL_LAW_TOPICS.length}  |  Created by Matthew Cesar Corpuz`;
  const clampedCoverSub = doc.splitTextToSize(coverSub, contentW - 8)[0] || coverSub;
  doc.text(clampedCoverSub, pageW / 2, y + 17.4, { align: 'center' });
  y += 24;

  // Group Members Attribution
  if (params.includeGroupMembers !== false) {
    const membersLine = sanitizePdfText(GROUP_MEMBERS.join('  |  '));
    doc.setFont(ff, 'normal');
    doc.setFontSize(6.9 * scale);
    const wrappedMembers = doc.splitTextToSize(membersLine, contentW - 6);
    const boxH = 8.5 + wrappedMembers.length * (3.5 * scale);
    ensureSpace(boxH + 3);
    doc.setDrawColor(...theme.borderMuted);
    doc.setFillColor(...theme.zebraFill);
    doc.rect(marginX, y, contentW, boxH, 'FD');
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, 'bold');
    doc.setFontSize(7.6 * scale);
    doc.text(
      'MEMORY AID ATTRIBUTION & RESEARCH COHORT (MAIN CREATOR: MATTHEW CESAR CORPUZ)',
      marginX + 3,
      y + 4.8
    );
    doc.setFont(ff, 'normal');
    doc.setFontSize(6.9 * scale);
    doc.setTextColor(...theme.mutedText);
    doc.text(wrappedMembers, marginX + 3, y + 9.2);
    y += boxH + 3;
  }

  // Mastery Progress Summary
  if (params.includeProgress !== false) {
    writeSectionHeading(
      'SIX-WORLD STATUTORY MASTERY PROGRESS',
      `${params.completedTopicIds.length}/${ALL_LAW_TOPICS.length} COMPLETED`
    );
    WORLDS_METADATA.forEach((w) => {
      ensureSpace(5.5);
      const wTopics = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
      const done = wTopics.filter((t) => params.completedTopicIds.includes(t.id)).length;
      const boxMark = params.includeCheckboxes !== false ? (done === wTopics.length && wTopics.length > 0 ? '[x] ' : '[ ] ') : '';
      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, 'bold');
      doc.setFontSize(7.5 * scale);
      doc.text(
        sanitizePdfText(
          `${boxMark}World ${w.worldNumber}: ${w.shortTitle} - ${done}/${wTopics.length} Modules Mastered`
        ),
        marginX + 2,
        y
      );
      y += 4.6 * scale;
    });
    y += 2;
  }

  // Optional Quick Formulas & Checkpoints Summary Box
  if (
    params.includeFormulasCheatSheet ||
    params.includeFourFoldControlTest ||
    params.includeTwoNoticeChecklist ||
    params.includeRetirementFormulaBox
  ) {
    writeSectionHeading('CORE STATUTORY FORMULAS & DUE PROCESS CHECKPOINTS');
    const quickBullets: string[] = [];
    if (params.includeFormulasCheatSheet) {
      quickBullets.push(
        '13th Month Pay (P.D. 851): Total Basic Salary Earned / 12 (Payable on or before Dec 24; min 1 month service).'
      );
      quickBullets.push(
        'Overtime & NSD: Ordinary OT = 125% | Rest/Special OT = 169% | Regular Holiday OT = 260% | Night Shift Diff (10PM-6AM) = +10%.'
      );
    }
    if (params.includeRetirementFormulaBox) {
      quickBullets.push(
        'Retirement Pay (R.A. 7641): 22.5 Days x Daily Rate x Years of Service (15d + 5d SIL + 2.5d 13th month; age 60-65, >=5 yrs).'
      );
    }
    if (params.includeFourFoldControlTest) {
      quickBullets.push(
        'Four-Fold Control Test: (1) Selection & Engagement, (2) Payment of Wages, (3) Power of Dismissal, (4) Power of Control over means & methods.'
      );
    }
    if (params.includeTwoNoticeChecklist) {
      quickBullets.push(
        'Procedural Due Process: Just Cause = Twin Written Notices (min 5 calendar days to answer) + Hearing | Authorized Cause = 30-Day Advance Notice to Worker & DOLE.'
      );
    }
    quickBullets.forEach((b) => {
      doc.setFont(ff, 'normal');
      doc.setFontSize(7.1 * scale);
      const lines = doc.splitTextToSize(sanitizePdfText(`- ${b}`), contentW - 6);
      ensureSpace(lines.length * (3.5 * scale) + 1.2);
      doc.setTextColor(...theme.bodyText);
      doc.text(lines, marginX + 2.5, y);
      y += lines.length * (3.5 * scale) + 1.0;
    });
    y += 2;
  }

  // Personal Study Notes
  if (params.includePersonalNotes !== false && params.studyNotes && params.studyNotes.length > 0) {
    writeSectionHeading(`PERSONAL STUDY NOTES & MNEMONICS (${params.studyNotes.length})`);
    params.studyNotes.forEach((n) => {
      doc.setFont(ff, 'normal');
      doc.setFontSize(7.2 * scale);
      const noteBody = doc.splitTextToSize(sanitizePdfText(n.content), contentW - 6);
      const boxH = 8 + noteBody.length * (3.7 * scale);
      ensureSpace(boxH + 3);
      doc.setFillColor(...theme.cardTintFill);
      doc.setDrawColor(...theme.badgeBorder);
      doc.rect(marginX, y, contentW, boxH, 'FD');
      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, 'bold');
      doc.setFontSize(7.8 * scale);
      const noteHeader = doc.splitTextToSize(
        sanitizePdfText(`${n.title} [${n.worldTag}]`),
        contentW - 6
      )[0] || '';
      doc.text(noteHeader, marginX + 3, y + 4.8);
      doc.setFont(ff, 'normal');
      doc.setFontSize(7.2 * scale);
      doc.setTextColor(...theme.mutedText);
      doc.text(noteBody, marginX + 3, y + 9.2);
      y += boxH + 2.5;
    });
  }

  // I. Statutory Pay Multiplier Matrix (Multi-line wrapped table — zero overlap!)
  if (params.includeMultipliers !== false) {
    writeSectionHeading('I. STATUTORY PAY MULTIPLIER MATRIX (DOLE BWC)', 'Arts. 86, 87, 93-94');
    const multRows = LABOR_BENEFITS_MULTIPLIER_LIST.map((row) => {
      const pct = `${(row.multiplierDecimal * 100).toFixed(1).replace(/\.0$/, '')}%`;
      return [row.benefit, pct, `${row.scenario} (${row.formula})`];
    });
    drawWrappedTable(['Benefit / Day Type', 'Rate', 'Applicable Scenario & Formula'], multRows, [
      0.3,
      0.13,
      0.57,
    ]);
  }

  // II. 17 Regions Minimum Wage Matrix (Multi-line wrapped table — zero overlap!)
  if (params.includeRegionalWages !== false) {
    writeSectionHeading('II. 17 REGIONS MINIMUM WAGE & KASAMBAHAY MATRIX', 'R.A. 6727 & R.A. 10361');
    const wageRows = REGIONAL_MINIMUM_WAGES.map((rw, idx) => {
      const kas = KASAMBAHAY_MINIMUM_WAGES[idx];
      return [rw.region, rw.nonAgri, rw.agri, kas ? kas.minimumWage : '-'];
    });
    drawWrappedTable(
      ['Region', 'Non-Agriculture Daily', 'Agriculture Daily', 'Kasambahay Monthly'],
      wageRows,
      [0.32, 0.24, 0.22, 0.22]
    );
  }

  // III. World 6 Statutory Leaves Matrix
  if (params.includeLeavesMatrix !== false) {
    writeSectionHeading('III. WORLD 6 STATUTORY LEAVES COMPARISON MATRIX', 'Art. 95 & Special Laws');
    const leaveRows = ONE_PAGE_STATUTORY_LEAVE_CAPS.map((lv) => [
      `${lv.leaveName} (${lv.citation})`,
      lv.cap,
      lv.rule,
    ]);
    drawWrappedTable(['Statutory Leave & Basis', 'Paid Cap', 'Key Eligibility & Commutability Rule'], leaveRows, [
      0.3,
      0.2,
      0.5,
    ]);
  }

  // IV. Unabridged Modules Breakdown
  WORLDS_METADATA.filter((w) => params.selectedWorlds.includes(w.id)).forEach((world) => {
    const worldTopics = params.topics.filter((t) => t.worldId === world.id);
    if (worldTopics.length === 0) return;

    writeSectionHeading(
      `WORLD ${world.worldNumber}: ${world.title.replace(/^WORLD \d+:\s*/i, '')}`,
      `${worldTopics.length} MODULES`
    );

    worldTopics.forEach((topic) => {
      ensureSpace(16);
      const isDone = params.completedTopicIds.includes(topic.id);

      doc.setDrawColor(...theme.borderStrong);
      doc.setLineWidth(0.3);
      doc.line(marginX, y, pageW - marginX, y);
      y += 4.5;

      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, 'bold');
      doc.setFontSize(8.8 * scale);
      const checkPrefix =
        params.includeCheckboxes !== false ? (isDone ? '[x] ' : '[ ] ') : '';
      const headerLabel =
        params.includeLegalCitations !== false
          ? `${checkPrefix}${topic.title} [${topic.badge}]`
          : `${checkPrefix}${topic.title}`;
      const titleLines = doc.splitTextToSize(sanitizePdfText(headerLabel), contentW - 28);
      doc.text(titleLines, marginX, y);
      doc.setFont('courier', 'bold');
      doc.setFontSize(6.8 * scale);
      doc.setTextColor(...(isDone ? theme.secondaryAccent : theme.mutedText));
      doc.text(isDone ? '[COMPLETED]' : '[TO STUDY]', pageW - marginX, y, { align: 'right' });
      y += titleLines.length * (4.1 * scale) + 1;

      if (!params.matricesOnlyMode) {
        doc.setFont(ff, 'normal');
        doc.setFontSize(7.2 * scale);
        const sumLines = doc.splitTextToSize(
          sanitizePdfText(`Core Summary: ${cleanRuleText(topic.summary)}`),
          contentW - 2
        );
        ensureSpace(sumLines.length * (3.6 * scale) + 2);
        doc.setTextColor(...theme.bodyText);
        doc.text(sumLines, marginX + 1, y);
        y += sumLines.length * (3.6 * scale) + 1.5;
      }

      const rules = params.matricesOnlyMode
        ? topic.rules.filter((r) => Boolean(r.tableData))
        : topic.rules;

      rules.forEach((rule, rIdx) => {
        ensureSpace(8);
        doc.setTextColor(...theme.primary);
        doc.setFont(ff, 'bold');
        doc.setFontSize(7.5 * scale);
        const rHead = doc.splitTextToSize(
          sanitizePdfText(`${rIdx + 1}. ${cleanRuleText(rule.heading)}`),
          contentW - 4
        );
        doc.text(rHead, marginX + 2, y);
        y += rHead.length * (3.7 * scale);

        if (!params.matricesOnlyMode && rule.description) {
          doc.setFont(ff, 'normal');
          doc.setFontSize(7.0 * scale);
          const descLines = doc.splitTextToSize(
            sanitizePdfText(cleanRuleText(rule.description)),
            contentW - 8
          );
          ensureSpace(descLines.length * (3.4 * scale) + 1);
          doc.setTextColor(...theme.bodyText);
          doc.text(descLines, marginX + 5, y);
          y += descLines.length * (3.4 * scale) + 1;
        }

        if (!params.matricesOnlyMode && rule.items && rule.items.length > 0) {
          rule.items.forEach((it) => {
            doc.setFont(ff, 'normal');
            doc.setFontSize(6.9 * scale);
            const itLines = doc.splitTextToSize(
              sanitizePdfText(`- ${cleanRuleText(it)}`),
              contentW - 10
            );
            ensureSpace(itLines.length * (3.4 * scale) + 0.8);
            doc.setTextColor(...theme.mutedText);
            doc.text(itLines, marginX + 6, y);
            y += itLines.length * (3.4 * scale) + 0.6;
          });
        }

        if (rule.tableData) {
          drawWrappedTable(rule.tableData.headers, rule.tableData.rows);
        }
      });

      if (!params.matricesOnlyMode && params.includeBarTips !== false) {
        const tips = [...(topic.keyTips || []), ...(topic.barTips || [])];
        if (tips.length > 0) {
          tips.slice(0, 3).forEach((tip) => {
            doc.setFont(ff, ff === 'courier' ? 'bold' : 'bolditalic');
            doc.setFontSize(6.9 * scale);
            const tipLines = doc.splitTextToSize(
              sanitizePdfText(`Key Study Checkpoint: ${cleanRuleText(tip)}`),
              contentW - 8
            );
            ensureSpace(tipLines.length * (3.4 * scale) + 1);
            doc.setTextColor(...theme.badgeText);
            doc.text(tipLines, marginX + 4, y);
            y += tipLines.length * (3.4 * scale) + 0.8;
          });
        }
      }

      if (params.blankNoteLinesCount && params.blankNoteLinesCount > 0) {
        const linesCount = Math.min(10, params.blankNoteLinesCount);
        ensureSpace(linesCount * 5.2 + 4);
        doc.setFont(ff, 'bold');
        doc.setFontSize(6.5 * scale);
        doc.setTextColor(...theme.mutedText);
        doc.text('Handwritten Study Notes:', marginX + 2, y);
        y += 3.5;
        doc.setDrawColor(...theme.borderMuted);
        doc.setLineWidth(0.18);
        for (let ln = 0; ln < linesCount; ln++) {
          doc.line(marginX + 2, y + 3, pageW - marginX - 2, y + 3);
          y += 5;
        }
      }

      y += 2.5;
    });
  });

  // Optional Personal Commitment / Honor Pledge Box at end
  if (params.includeHonorPledge) {
    ensureSpace(18);
    doc.setFillColor(...theme.cardTintFill);
    doc.setDrawColor(...theme.badgeBorder);
    doc.setLineWidth(0.3);
    doc.rect(marginX, y, contentW, 14, 'FD');
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, 'bold');
    doc.setFontSize(7.4 * scale);
    doc.text('LEARNER COMMITMENT & WORKPLACE JUSTICE PLEDGE', marginX + 3, y + 4.8);
    doc.setFont(ff, ff === 'courier' ? 'normal' : 'italic');
    doc.setFontSize(6.8 * scale);
    doc.setTextColor(...theme.mutedText);
    const pledgeLines = doc.splitTextToSize(
      '"I commit to mastering Philippine Labor Standards with integrity, accuracy, and respect for human dignity and fair workplace rights."',
      contentW - 6
    );
    doc.text(pledgeLines, marginX + 3, y + 9.2);
    y += 16;
  }

  // Page numbering + optional subtle header/footer watermark across all pages
  const totalPages = doc.getNumberOfPages();
  const wmLabel =
    params.includeWatermark && params.watermarkText
      ? `  |  ${sanitizePdfText(params.watermarkText)}`
      : '';
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageH - 10, pageW - marginX, pageH - 10);
    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, 'normal');
    doc.setFontSize(6.6);
    doc.text(
      `Super Mario Labor Adventure - Philippine Labor Standards Guide (Created by Matthew)${wmLabel}`,
      marginX,
      pageH - 6.2
    );
    doc.text(`Page ${p} of ${totalPages}`, pageW - marginX, pageH - 6.2, { align: 'right' });
  }

  return docToUint8Array(doc);
}

export function downloadStudyGuideReviewerPdf(params: StudyGuideReviewerPdfParams): Uint8Array {
  const bytes = buildStudyGuideReviewerPdfBytes(params);
  const suffix = params.orientation === 'landscape' ? 'Landscape' : 'Portrait';
  triggerPdfDownloadFromBytes(bytes, `Philippine-Labor-Standards-Reviewer-${suffix}-A4.pdf`);
  return bytes;
}

export interface ScoreCardPdfParams {
  playerName: string;
  heroName: string;
  heroRank: string;
  completedCount: number;
  totalTopics: number;
  coins: number;
  loginStreak: number;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  quizRunsCompleted: number;
  studyDurationFormatted: string;
  worldBreakdown: {
    worldNumber: number;
    shortTitle: string;
    completed: number;
    total: number;
    percent: number;
  }[];
}

/**
 * Builds a single-page A4 Landscape Hero Score Card PDF (297mm x 210mm)
 * for direct download from ExportProgressModal.
 */
export function buildScoreCardLandscapePdfBytes(params: ScoreCardPdfParams): Uint8Array {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const W = 297;
  const H = 210;
  const pct = Math.min(
    100,
    Math.round((params.completedCount / Math.max(1, params.totalTopics)) * 100)
  );

  // Deep slate canvas
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, H, 'F');

  // Gold border frame
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, W - 20, H - 20);

  // Header
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SUPER MARIO LABOR ADVENTURE  -  OFFICIAL HERO SCORE CARD', 18, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  const clampedPlayer =
    doc.splitTextToSize(sanitizePdfText(params.playerName || 'Labor Scholar Hero'), W - 115)[0] ||
    'Labor Scholar Hero';
  doc.text(clampedPlayer, 18, 33);

  doc.setTextColor(52, 211, 153);
  doc.setFontSize(11);
  doc.text(
    sanitizePdfText(`${params.heroRank}  |  Equipped Hero: ${params.heroName}`),
    18,
    41
  );

  // Overall Mastery Badge on Top Right
  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(W - 82, 16, 64, 28, 3, 3, 'FD');
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(20);
  doc.text(`${pct}%`, W - 50, 29, { align: 'center' });
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(8);
  doc.text(
    `${params.completedCount} / ${params.totalTopics} Modules Completed`,
    W - 50,
    37,
    { align: 'center' }
  );

  // 5 Stat Tiles Row
  const stats = [
    { label: 'STUDY TIME', val: sanitizePdfText(params.studyDurationFormatted) },
    { label: 'GOLD COINS', val: `x${params.coins}` },
    { label: 'DAILY STREAK', val: `${params.loginStreak} Days` },
    {
      label: 'BADGES EARNED',
      val: `${params.unlockedAchievementsCount}/${params.totalAchievementsCount}`,
    },
    { label: 'QUIZ RUNS', val: `${params.quizRunsCompleted} Completed` },
  ];
  const tileGap = 4;
  const tileW = (W - 36 - tileGap * 4) / 5;
  stats.forEach((st, idx) => {
    const tx = 18 + idx * (tileW + tileGap);
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(71, 85, 105);
    doc.roundedRect(tx, 52, tileW, 24, 2.5, 2.5, 'FD');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.text(st.label, tx + 4, 60);
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(13.5);
    doc.text(st.val, tx + 4, 70);
  });

  // Six-World Breakdown Grid (2 columns x 3 rows)
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(10);
  doc.text('SIX-WORLD LABOR STANDARDS BREAKDOWN', 18, 88);

  const wColW = (W - 36 - 6) / 2;
  const wRowH = 24;
  params.worldBreakdown.forEach((wb, idx) => {
    const c = idx % 2;
    const r = Math.floor(idx / 2);
    const bx = 18 + c * (wColW + 6);
    const by = 93 + r * (wRowH + 4);

    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(71, 85, 105);
    doc.roundedRect(bx, by, wColW, wRowH, 2.5, 2.5, 'FD');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(sanitizePdfText(`World ${wb.worldNumber}: ${wb.shortTitle}`), bx + 4, by + 8.5);

    doc.setTextColor(52, 211, 153);
    doc.text(`${wb.percent}% (${wb.completed}/${wb.total})`, bx + wColW - 4, by + 8.5, {
      align: 'right',
    });

    // Progress track
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(bx + 4, by + 13.5, wColW - 8, 5, 1.5, 1.5, 'F');
    if (wb.percent > 0) {
      doc.setFillColor(
        wb.percent === 100 ? 16 : 245,
        wb.percent === 100 ? 185 : 158,
        wb.percent === 100 ? 129 : 11
      );
      const fillW = Math.max(4, ((wColW - 8) * wb.percent) / 100);
      doc.roundedRect(bx + 4, by + 13.5, fillW, 5, 1.5, 1.5, 'F');
    }
  });

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    'Super Mario Labor Adventure  -  Philippine Labor Standards Guide  |  Created by Matthew (Main Creator)',
    W / 2,
    H - 15,
    { align: 'center' }
  );

  return docToUint8Array(doc);
}

export function downloadScoreCardLandscapePdf(params: ScoreCardPdfParams): Uint8Array {
  const bytes = buildScoreCardLandscapePdfBytes(params);
  triggerPdfDownloadFromBytes(bytes, 'Mario-Labor-Hero-Score-Card-A4.pdf');
  return bytes;
}
