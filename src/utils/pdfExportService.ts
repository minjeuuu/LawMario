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
import { getPdfFontProfile, PdfFontProfile } from './round11Features';
import {
  EXTENDED_PRINT_COLOR_THEMES,
  ExtendedPrintThemeSpec,
  resolveExtendedPrintTheme,
} from './round12Features';

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
  | 'bowser_obsidian_gold'
  | 'peach_blossom_rose'
  | 'luigi_mansion_jade'
  | 'rosalina_cosmic_ice'
  | 'golden_crown_ivory'
  | 'sakura_editorial'
  | 'midnight_espresso'
  | 'arctic_glacier'
  | 'solarized_amber'
  | 'mint_dole_ledger'
  | 'sunset_coral'
  | 'indigo_jurisprudence'
  | 'wario_royal_gold';

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
  | 'space_grotesk'
  | 'libre_baskerville'
  | 'cormorant_chancery'
  | 'crimson_juris'
  | 'source_serif_codal'
  | 'dm_sans_clean'
  | 'outfit_geometric'
  | 'bricolage_editorial'
  | 'ibm_plex_docket';

type RgbTuple = [number, number, number];

export interface ResolvedPdfPalette {
  id: PdfColorThemeId;
  fontFamily: 'helvetica' | 'times' | 'courier';
  fontProfile: PdfFontProfile;
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

function hexToRgb(hex: string | undefined, fallback: RgbTuple = [15, 23, 42]): RgbTuple {
  if (!hex || typeof hex !== 'string') return fallback;
  const clean = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return fallback;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function buildPaletteFromExtendedTheme(
  ext: ExtendedPrintThemeSpec,
  fontFamily: 'helvetica' | 'times' | 'courier',
  resolvedId?: string
): Omit<ResolvedPdfPalette, 'fontProfile'> {
  const isInkSaver =
    ext.id === 'ink_saver_bw' ||
    ext.id === 'minimal_slate' ||
    ext.headerBgHex.toUpperCase() === '#FFFFFF';
  const isParchment =
    ext.id === 'royal_parchment' ||
    ext.id === 'vintage_parchment' ||
    resolvedId === 'vintage_parchment' ||
    ext.id === 'golden_crown_ivory';
  const primary = hexToRgb(ext.headerBgHex, [15, 23, 42]);
  const primaryText = hexToRgb(ext.headerTextHex, [255, 255, 255]);
  const accent = hexToRgb(ext.accentHex, [217, 119, 6]);
  const secondaryAccent = hexToRgb(ext.tableHeadBgHex, primary);
  const badgeFill = hexToRgb(ext.accentSoftBgHex, [248, 250, 252]);
  const borderStrong = hexToRgb(ext.borderHex, primary);
  const zebraFill = hexToRgb(ext.tableStripeBgHex, [248, 250, 252]);
  const bodyText = hexToRgb(ext.bodyTextHex, [15, 23, 42]);
  const mutedText = hexToRgb(ext.mutedTextHex, [71, 85, 105]);
  const pageBg: RgbTuple = isInkSaver
    ? [255, 255, 255]
    : isParchment
    ? [253, 248, 235]
    : [
        Math.min(255, Math.round(255 * 0.88 + zebraFill[0] * 0.12)),
        Math.min(255, Math.round(255 * 0.88 + zebraFill[1] * 0.12)),
        Math.min(255, Math.round(255 * 0.88 + zebraFill[2] * 0.12)),
      ];
  const borderMuted: RgbTuple = [
    Math.min(238, Math.round(255 * 0.65 + borderStrong[0] * 0.35)),
    Math.min(238, Math.round(255 * 0.65 + borderStrong[1] * 0.35)),
    Math.min(238, Math.round(255 * 0.65 + borderStrong[2] * 0.35)),
  ];

  const kickerText: RgbTuple = isInkSaver
    ? mutedText
    : ext.headerTextHex.toUpperCase() !== '#FFFFFF'
    ? hexToRgb(ext.headerTextHex, [253, 224, 71])
    : [253, 224, 71];

  return {
    id: (resolvedId || ext.id) as PdfColorThemeId,
    fontFamily,
    pageBg,
    primary,
    primaryText,
    kickerText,
    accent,
    accentTextOnFill: [255, 255, 255],
    secondaryAccent,
    badgeFill,
    badgeBorder: borderStrong,
    badgeText: isInkSaver ? bodyText : (secondaryAccent || primary),
    zebraFill,
    cardTintFill: badgeFill,
    borderStrong,
    borderMuted,
    bodyText,
    mutedText,
    formulaText: isInkSaver ? bodyText : accent,
    isInkSaver,
  };
}

function applyPdfCharSpace(doc: jsPDF, charSpace: number): void {
  const maybe = doc as unknown as { setCharSpace?: (v: number) => void };
  if (typeof maybe.setCharSpace === 'function') {
    maybe.setCharSpace(charSpace);
  }
}

function applyPdfDocumentMeta(
  doc: jsPDF,
  title: string,
  colorAccent: string | undefined,
  fp: PdfFontProfile
): void {
  const extTheme = resolveExtendedPrintTheme(colorAccent);
  const maybe = doc as unknown as {
    setProperties?: (props: Record<string, string>) => void;
  };
  if (typeof maybe.setProperties === 'function') {
    maybe.setProperties({
      title: sanitizePdfText(title),
      subject: sanitizePdfText(
        `Philippine Labor Code Guide - Theme: ${extTheme.name} - Font: ${fp.displayLabel}`
      ),
      author: 'Super Mario Labor Adventure',
      keywords: sanitizePdfText(
        `${colorAccent || extTheme.id}, ${fp.displayLabel}, P.D. 442`
      ),
    });
  }
}

export function resolvePdfThemeAndFont(
  colorAccent?: string,
  fontStyle?: string
): ResolvedPdfPalette {
  const fontProfile = getPdfFontProfile(fontStyle);
  const raw = resolveRawPdfPalette(colorAccent, fontProfile.fontFamily);
  return {
    ...raw,
    fontProfile,
  };
}

function resolveRawPdfPalette(
  colorAccent: string | undefined,
  fontFamily: 'helvetica' | 'times' | 'courier'
): Omit<ResolvedPdfPalette, 'fontProfile'> {
  const extTheme = resolveExtendedPrintTheme(colorAccent);
  if (extTheme) {
    return buildPaletteFromExtendedTheme(extTheme, fontFamily, colorAccent || extTheme.id);
  }

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
    case 'peach_blossom_rose':
      return {
        id: 'peach_blossom_rose',
        fontFamily,
        pageBg: [255, 250, 252],
        primary: [157, 23, 77],
        primaryText: [255, 255, 255],
        kickerText: [251, 207, 232],
        accent: [219, 39, 119],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [190, 24, 93],
        badgeFill: [252, 231, 243],
        badgeBorder: [219, 39, 119],
        badgeText: [131, 24, 67],
        zebraFill: [253, 242, 248],
        cardTintFill: [255, 245, 250],
        borderStrong: [157, 23, 77],
        borderMuted: [249, 168, 212],
        bodyText: [36, 15, 26],
        mutedText: [112, 60, 84],
        formulaText: [157, 23, 77],
        isInkSaver: false,
      };
    case 'luigi_mansion_jade':
      return {
        id: 'luigi_mansion_jade',
        fontFamily,
        pageBg: [248, 255, 249],
        primary: [21, 128, 61],
        primaryText: [255, 255, 255],
        kickerText: [220, 252, 231],
        accent: [22, 163, 74],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [5, 150, 105],
        badgeFill: [220, 252, 231],
        badgeBorder: [21, 128, 61],
        badgeText: [20, 83, 45],
        zebraFill: [240, 253, 244],
        cardTintFill: [236, 253, 245],
        borderStrong: [21, 128, 61],
        borderMuted: [134, 239, 172],
        bodyText: [15, 36, 23],
        mutedText: [52, 92, 66],
        formulaText: [21, 128, 61],
        isInkSaver: false,
      };
    case 'rosalina_cosmic_ice':
      return {
        id: 'rosalina_cosmic_ice',
        fontFamily,
        pageBg: [246, 253, 255],
        primary: [14, 116, 144],
        primaryText: [255, 255, 255],
        kickerText: [207, 250, 254],
        accent: [8, 145, 178],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [2, 132, 199],
        badgeFill: [207, 250, 254],
        badgeBorder: [14, 116, 144],
        badgeText: [22, 78, 99],
        zebraFill: [236, 254, 255],
        cardTintFill: [240, 249, 255],
        borderStrong: [14, 116, 144],
        borderMuted: [103, 232, 249],
        bodyText: [15, 32, 43],
        mutedText: [56, 90, 108],
        formulaText: [14, 116, 144],
        isInkSaver: false,
      };
    case 'golden_crown_ivory':
      return {
        id: 'golden_crown_ivory',
        fontFamily,
        pageBg: [255, 254, 247],
        primary: [133, 77, 14],
        primaryText: [255, 255, 255],
        kickerText: [254, 240, 138],
        accent: [161, 98, 7],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [180, 83, 9],
        badgeFill: [254, 249, 195],
        badgeBorder: [161, 98, 7],
        badgeText: [113, 63, 18],
        zebraFill: [254, 252, 232],
        cardTintFill: [255, 251, 235],
        borderStrong: [133, 77, 14],
        borderMuted: [253, 224, 71],
        bodyText: [40, 28, 12],
        mutedText: [105, 82, 42],
        formulaText: [133, 77, 14],
        isInkSaver: false,
      };
    case 'sakura_editorial':
      return {
        id: 'sakura_editorial',
        fontFamily,
        pageBg: [255, 248, 249],
        primary: [190, 18, 60],
        primaryText: [255, 255, 255],
        kickerText: [254, 205, 211],
        accent: [225, 29, 72],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [159, 18, 57],
        badgeFill: [255, 228, 230],
        badgeBorder: [190, 18, 60],
        badgeText: [136, 19, 55],
        zebraFill: [255, 241, 242],
        cardTintFill: [255, 245, 246],
        borderStrong: [190, 18, 60],
        borderMuted: [253, 164, 175],
        bodyText: [38, 16, 22],
        mutedText: [110, 62, 74],
        formulaText: [190, 18, 60],
        isInkSaver: false,
      };
    case 'midnight_espresso':
      return {
        id: 'midnight_espresso',
        fontFamily,
        pageBg: [250, 250, 249],
        primary: [41, 37, 36],
        primaryText: [254, 243, 199],
        kickerText: [253, 230, 138],
        accent: [87, 83, 78],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [120, 53, 15],
        badgeFill: [245, 245, 244],
        badgeBorder: [68, 64, 60],
        badgeText: [28, 25, 23],
        zebraFill: [245, 245, 244],
        cardTintFill: [250, 248, 245],
        borderStrong: [41, 37, 36],
        borderMuted: [168, 162, 158],
        bodyText: [28, 25, 23],
        mutedText: [87, 83, 78],
        formulaText: [68, 64, 60],
        isInkSaver: false,
      };
    case 'arctic_glacier':
      return {
        id: 'arctic_glacier',
        fontFamily,
        pageBg: [248, 252, 255],
        primary: [3, 105, 161],
        primaryText: [255, 255, 255],
        kickerText: [186, 230, 253],
        accent: [2, 132, 199],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [14, 116, 144],
        badgeFill: [224, 242, 254],
        badgeBorder: [3, 105, 161],
        badgeText: [12, 74, 110],
        zebraFill: [240, 249, 255],
        cardTintFill: [245, 251, 255],
        borderStrong: [3, 105, 161],
        borderMuted: [125, 211, 252],
        bodyText: [12, 34, 52],
        mutedText: [56, 89, 115],
        formulaText: [3, 105, 161],
        isInkSaver: false,
      };
    case 'solarized_amber':
      return {
        id: 'solarized_amber',
        fontFamily,
        pageBg: [253, 246, 227],
        primary: [7, 54, 66],
        primaryText: [253, 246, 227],
        kickerText: [251, 191, 36],
        accent: [181, 137, 0],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [203, 75, 22],
        badgeFill: [238, 232, 213],
        badgeBorder: [181, 137, 0],
        badgeText: [7, 54, 66],
        zebraFill: [238, 232, 213],
        cardTintFill: [250, 242, 220],
        borderStrong: [7, 54, 66],
        borderMuted: [147, 161, 161],
        bodyText: [7, 54, 66],
        mutedText: [88, 110, 117],
        formulaText: [181, 137, 0],
        isInkSaver: false,
      };
    case 'mint_dole_ledger':
      return {
        id: 'mint_dole_ledger',
        fontFamily,
        pageBg: [246, 254, 249],
        primary: [4, 120, 87],
        primaryText: [255, 255, 255],
        kickerText: [167, 243, 208],
        accent: [16, 185, 129],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [13, 148, 136],
        badgeFill: [209, 250, 229],
        badgeBorder: [4, 120, 87],
        badgeText: [6, 78, 59],
        zebraFill: [236, 253, 245],
        cardTintFill: [240, 253, 244],
        borderStrong: [4, 120, 87],
        borderMuted: [110, 231, 183],
        bodyText: [14, 38, 30],
        mutedText: [52, 95, 80],
        formulaText: [4, 120, 87],
        isInkSaver: false,
      };
    case 'sunset_coral':
      return {
        id: 'sunset_coral',
        fontFamily,
        pageBg: [255, 250, 248],
        primary: [225, 29, 72],
        primaryText: [255, 255, 255],
        kickerText: [254, 215, 170],
        accent: [234, 88, 12],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [190, 18, 60],
        badgeFill: [255, 237, 213],
        badgeBorder: [225, 29, 72],
        badgeText: [159, 18, 57],
        zebraFill: [255, 244, 238],
        cardTintFill: [255, 247, 237],
        borderStrong: [225, 29, 72],
        borderMuted: [253, 164, 175],
        bodyText: [38, 18, 22],
        mutedText: [112, 64, 68],
        formulaText: [194, 65, 12],
        isInkSaver: false,
      };
    case 'indigo_jurisprudence':
      return {
        id: 'indigo_jurisprudence',
        fontFamily,
        pageBg: [249, 249, 255],
        primary: [49, 46, 129],
        primaryText: [255, 255, 255],
        kickerText: [199, 210, 254],
        accent: [67, 56, 202],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [99, 102, 241],
        badgeFill: [224, 231, 255],
        badgeBorder: [55, 48, 163],
        badgeText: [30, 27, 75],
        zebraFill: [238, 242, 255],
        cardTintFill: [245, 247, 255],
        borderStrong: [49, 46, 129],
        borderMuted: [165, 180, 252],
        bodyText: [22, 20, 56],
        mutedText: [68, 66, 118],
        formulaText: [55, 48, 163],
        isInkSaver: false,
      };
    case 'wario_royal_gold':
      return {
        id: 'wario_royal_gold',
        fontFamily,
        pageBg: [255, 254, 249],
        primary: [76, 29, 149],
        primaryText: [253, 224, 71],
        kickerText: [254, 240, 138],
        accent: [202, 138, 4],
        accentTextOnFill: [255, 255, 255],
        secondaryAccent: [109, 40, 217],
        badgeFill: [254, 249, 195],
        badgeBorder: [91, 33, 182],
        badgeText: [76, 29, 149],
        zebraFill: [250, 245, 255],
        cardTintFill: [254, 252, 232],
        borderStrong: [76, 29, 149],
        borderMuted: [196, 181, 253],
        bodyText: [30, 16, 52],
        mutedText: [88, 62, 124],
        formulaText: [161, 98, 7],
        isInkSaver: false,
      };
    case 'executive_navy':
    default: {
      if (colorAccent && colorAccent !== 'executive_navy') {
        const fallbackExt = resolveExtendedPrintTheme(colorAccent);
        if (fallbackExt) {
          return buildPaletteFromExtendedTheme(fallbackExt, fontFamily, colorAccent);
        }
      }
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
  const fp = theme.fontProfile;
  const fScale = Math.min(1.06, Math.max(0.84, fp.sizeScale));
  applyPdfCharSpace(doc, fp.charSpace);
  applyPdfDocumentMeta(
    doc,
    'One-Page Statutory Formulas & Deadlines Master Sheet (A4)',
    options.colorAccent,
    fp
  );

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

  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(6.3 * fScale);
  doc.text(
    'PHILIPPINE LABOR CODE (P.D. 442 AS AMENDED) - DOLE BWC HANDBOOK - RAPID STUDY REFERENCE',
    pageW / 2,
    11.5,
    { align: 'center' }
  );

  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(11.2 * fScale);
  doc.text('ONE-PAGE STATUTORY FORMULAS & DEADLINES MASTER SHEET (A4)', pageW / 2, 16.9, {
    align: 'center',
  });

  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.primaryText));
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(6.1 * fScale);
  const watermarkSuffix =
    options.includeWatermark && options.watermarkText
      ? `  |  ${sanitizePdfText(options.watermarkText)}`
      : '';
  const subMeta = candidate
    ? `Prepared for: ${candidate}  |  Generated: ${dateStr}  |  Font: ${fp.displayLabel}${watermarkSuffix}`
    : `Generated: ${dateStr}  |  Philippine Labor Standards  |  Font: ${fp.displayLabel}${watermarkSuffix}`;
  const clampedSubMeta = doc.splitTextToSize(subMeta, contentW - 6)[0] || subMeta;
  doc.text(clampedSubMeta, pageW / 2, 21.1, { align: 'center' });

  // ==================== LEFT COLUMN: PART I - FORMULAS ====================
  let leftY = 24.5;
  doc.setFillColor(...theme.accent);
  doc.rect(leftX, leftY, colW, 5.2, 'F');
  doc.setTextColor(...theme.accentTextOnFill);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(7.1 * fScale);
  doc.text('I. KEY STATUTORY WAGE, LEAVE & SEPARATION FORMULAS', leftX + 2, leftY + 3.6);
  leftY += 5.8;

  ONE_PAGE_LEGAL_FORMULAS.forEach((item, idx) => {
    const rowH = 15.35;
    if (idx % 2 === 0) {
      doc.setFillColor(...theme.zebraFill);
      doc.rect(leftX, leftY, colW, rowH, 'F');
    }
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.18);
    doc.rect(leftX, leftY, colW, rowH);

    const badgeW = 20;
    doc.setFillColor(...theme.badgeFill);
    doc.setDrawColor(...theme.badgeBorder);
    doc.roundedRect(leftX + colW - badgeW - 1.2, leftY + 0.8, badgeW, 3.8, 0.7, 0.7, 'FD');
    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(5.85 * fScale);
    const rateText = doc.splitTextToSize(sanitizePdfText(item.rateBadge), badgeW - 1.5)[0] || '';
    doc.text(rateText, leftX + colW - badgeW / 2 - 1.2, leftY + 3.4, {
      align: 'center',
    });

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(6.4 * fScale);
    const safeTitle =
      doc.splitTextToSize(sanitizePdfText(`${idx + 1}. ${item.title}`), colW - badgeW - 3.5)[0] || '';
    doc.text(safeTitle, leftX + 1.5, leftY + 3.4);

    doc.setTextColor(...theme.formulaText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(5.9 * fScale);
    const formulaLines = doc.splitTextToSize(sanitizePdfText(item.formula), colW - 3);
    doc.text(formulaLines, leftX + 1.5, leftY + 6.9);

    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(5.2 * fScale);
    const noteStr = `${sanitizePdfText(item.note)} [${sanitizePdfText(item.citation)}]`;
    const noteLines = doc.splitTextToSize(noteStr, colW - 3);
    const noteStartY = formulaLines.length > 1 ? leftY + 10.5 : leftY + 10.1;
    doc.text(noteLines, leftX + 1.5, noteStartY);

    leftY += rowH + 0.52;
  });

  // ==================== RIGHT COLUMN: PART II - DEADLINES & PRESCRIPTION ====================
  let rightY = 24.5;
  doc.setFillColor(...theme.secondaryAccent);
  doc.rect(rightX, rightY, colW, 5.2, 'F');
  doc.setTextColor(...theme.primaryText);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(7.1 * fScale);
  doc.text('II. STATUTORY DEADLINES & PRESCRIPTIVE PERIODS', rightX + 2, rightY + 3.6);
  rightY += 5.8;

  ONE_PAGE_LEGAL_DEADLINES.forEach((item, idx) => {
    const rowH = 14.25;
    if (idx % 2 === 0) {
      doc.setFillColor(...theme.zebraFill);
      doc.rect(rightX, rightY, colW, rowH, 'F');
    }
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.18);
    doc.rect(rightX, rightY, colW, rowH);

    const dlBadgeW = 24;
    doc.setFillColor(...theme.badgeFill);
    doc.setDrawColor(...theme.badgeBorder);
    doc.roundedRect(rightX + colW - dlBadgeW - 1.2, rightY + 0.8, dlBadgeW, 3.8, 0.7, 0.7, 'FD');
    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(5.65 * fScale);
    const dlText = doc.splitTextToSize(sanitizePdfText(item.deadline), dlBadgeW - 1.5)[0] || '';
    doc.text(dlText, rightX + colW - dlBadgeW / 2 - 1.2, rightY + 3.4, {
      align: 'center',
    });

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(6.25 * fScale);
    const titleLines = doc.splitTextToSize(
      sanitizePdfText(`${idx + 1}. ${item.claimOrAction}`),
      colW - dlBadgeW - 3.5
    );
    doc.text(titleLines, rightX + 1.5, rightY + 3.4);

    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(5.3 * fScale);
    const ruleText = `${sanitizePdfText(item.reckoningRule)} (${sanitizePdfText(item.citation)})`;
    const ruleLines = doc.splitTextToSize(ruleText, colW - 3);
    const ruleStartY = titleLines.length > 1 ? rightY + 7.8 : rightY + 7.2;
    doc.text(ruleLines, rightX + 1.5, ruleStartY);

    rightY += rowH + 0.52;
  });

  // ==================== PART III: BOTTOM FULL-WIDTH WORLD 6 LEAVES & DOCTRINAL CHECKPOINTS ====================
  const bottomY = Math.max(leftY, rightY) + 1.4;
  doc.setFillColor(...theme.primary);
  doc.rect(marginX, bottomY, contentW, 5.0, 'F');
  doc.setTextColor(...(theme.isInkSaver ? ([255, 255, 255] as RgbTuple) : theme.kickerText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(6.9 * fScale);
  doc.text(
    'III. STATUTORY LEAVES QUICK MATRIX (WORLD 6) & CORE WORKPLACE CHECKPOINTS',
    marginX + 2,
    bottomY + 3.4
  );

  const gridY = bottomY + 5.8;
  const leaveCardW = (contentW - 4) / 3;
  const leaveCardH = 14.0;

  ONE_PAGE_STATUTORY_LEAVE_CAPS.forEach((lv, idx) => {
    const colIdx = idx % 3;
    const rowIdx = Math.floor(idx / 3);
    const cx = marginX + colIdx * (leaveCardW + 2);
    const cy = gridY + rowIdx * (leaveCardH + 1.0);

    doc.setFillColor(...theme.cardTintFill);
    doc.setDrawColor(...theme.badgeBorder);
    doc.setLineWidth(0.18);
    doc.rect(cx, cy, leaveCardW, leaveCardH, 'FD');

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(5.95 * fScale);
    const lvTitle =
      doc.splitTextToSize(sanitizePdfText(`${lv.leaveName} (${lv.citation})`), leaveCardW - 2.6)[0] ||
      '';
    doc.text(lvTitle, cx + 1.3, cy + 3.2);

    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(5.75 * fScale);
    const lvCap = doc.splitTextToSize(sanitizePdfText(lv.cap), leaveCardW - 2.6)[0] || '';
    doc.text(lvCap, cx + 1.3, cy + 6.6);

    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(5.15 * fScale);
    const lvRule = doc.splitTextToSize(sanitizePdfText(lv.rule), leaveCardW - 2.6);
    doc.text(lvRule, cx + 1.3, cy + 9.5);
  });

  const checkY = gridY + 2 * (leaveCardH + 1.0) + 1.0;
  doc.setFillColor(...theme.zebraFill);
  doc.setDrawColor(...theme.borderStrong);
  doc.setLineWidth(0.22);
  doc.rect(marginX, checkY, contentW, 9.8, 'FD');
  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(5.65 * fScale);
  doc.text(
    'FOUR-FOLD CONTROL TEST: (1) Selection/Engagement, (2) Payment of Wages, (3) Power of Dismissal, (4) Power of Control over means & methods (Most Crucial).',
    marginX + 1.8,
    checkY + 3.7
  );
  doc.text(
    'NOMINAL DAMAGES (AGABON / JAKA DOCTRINE): Valid Just Cause + defective Twin-Notice = PHP 30,000  |  Valid Authorized Cause + defective 30d Notice = PHP 50,000.',
    marginX + 1.8,
    checkY + 7.5
  );

  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(5.8 * fScale);
  doc.text(
    `Super Mario Labor Adventure - A4 Master Sheet (${fp.displayLabel})`,
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
  orientation?: 'landscape' | 'portrait';
}

/**
 * Builds an Official A4 Executive Certificate of Statutory Completion PDF
 * in either Landscape (297x210mm) or Portrait (210x297mm) with zero overflows.
 */
export function buildCertificatePdfBytes(params: CertificatePdfParams): Uint8Array {
  const orient = params.orientation === 'portrait' ? 'portrait' : 'landscape';
  const doc = new jsPDF({
    orientation: orient,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const theme = resolvePdfThemeAndFont(
    params.colorAccent,
    params.fontStyle || 'editorial_serif'
  );
  const ff = theme.fontFamily;
  const fp = theme.fontProfile;
  const cScale = Math.min(1.08, Math.max(0.85, fp.sizeScale));
  applyPdfCharSpace(doc, fp.charSpace);
  applyPdfDocumentMeta(
    doc,
    'Certificate of Statutory Completion - Philippine Labor Code',
    params.colorAccent,
    fp
  );
  const W = orient === 'portrait' ? 210 : 297;
  const H = orient === 'portrait' ? 297 : 210;

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

  const certBg: RgbTuple = theme.isInkSaver
    ? [255, 255, 255]
    : theme.id === 'vintage_parchment' ||
      theme.id === 'royal_parchment' ||
      String(theme.id).includes('parchment')
    ? [253, 248, 235]
    : theme.pageBg;
  doc.setFillColor(...certBg);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(2.2);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.75);
  doc.rect(13.5, 13.5, W - 27, H - 27);

  doc.setDrawColor(...theme.borderMuted);
  doc.setLineWidth(0.25);
  doc.rect(15.5, 15.5, W - 31, H - 31);

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

  if (orient === 'portrait') {
    doc.setTextColor(...theme.primary);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(8.8 * cScale);
    doc.text(
      'REPUBLIC OF THE PHILIPPINES  -  PHILIPPINE LABOR STANDARDS GUIDE',
      W / 2,
      28,
      { align: 'center' }
    );

    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(7.5 * cScale);
    doc.text(
      'PRESIDENTIAL DECREE NO. 442 (LABOR CODE OF THE PHILIPPINES)  -  WORLDS 1 TO 6',
      W / 2,
      34,
      { align: 'center' }
    );

    doc.setDrawColor(...theme.accent);
    doc.setLineWidth(0.6);
    doc.line(24, 41, W - 24, 41);
    doc.line(24, 62, W - 24, 62);

    doc.setTextColor(...theme.primary);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(19.5 * cScale);
    doc.text('CERTIFICATE OF', W / 2, 50, { align: 'center' });
    doc.text('STATUTORY COMPLETION', W / 2, 58.5, { align: 'center' });

    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(11 * cScale);
    doc.text('This Executive Honor Certificate is Conferred Upon', W / 2, 74, {
      align: 'center',
    });

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    const recSize = (recipient.length > 30 ? 17.5 : 21) * cScale;
    doc.setFontSize(recSize);
    const clampedRec = doc.splitTextToSize(recipient, W - 44)[0] || recipient;
    doc.text(clampedRec, W / 2, 91, { align: 'center' });

    doc.setDrawColor(...theme.primary);
    doc.setLineWidth(0.5);
    doc.line(34, 95, W - 34, 95);

    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(9.5 * cScale);
    const clampedHonors =
      doc.splitTextToSize(honors.toUpperCase(), W - 44)[0] || honors.toUpperCase();
    doc.text(clampedHonors, W / 2, 104, { align: 'center' });

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(10.0 * cScale);
    const citationBody =
      'for demonstrating comprehensive statutory mastery and practical command across all Six Worlds of Philippine Labor Standards (Presidential Decree No. 442, as amended), encompassing Hours of Work & Overtime Rules, Rest Days & Holidays, Minimum Wages & D.O. 174 Subcontracting, Special Groups of Employees, Protective Workplace Statutes, and World 6 Statutory Leaves.';
    const bodyLines = doc.splitTextToSize(citationBody, W - 48);
    doc.text(bodyLines, W / 2, 116, { align: 'center', lineHeightFactor: 1.25 });

    const gridStartY = 156;
    const cols = 2;
    const gapX = 5;
    const gapY = 4.5;
    const cardW = (W - 48 - gapX) / cols;
    const cardH = 17;
    WORLDS_METADATA.forEach((w, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const bx = 24 + col * (cardW + gapX);
      const by = gridStartY + row * (cardH + gapY);
      doc.setFillColor(...theme.badgeFill);
      doc.setDrawColor(...theme.badgeBorder);
      doc.setLineWidth(0.35);
      doc.roundedRect(bx, by, cardW, cardH, 2, 2, 'FD');

      doc.setTextColor(...theme.badgeText);
      doc.setFont(ff, fp.subHeadingStyle);
      doc.setFontSize(8.2 * cScale);
      doc.text(`WORLD ${w.worldNumber}`, bx + cardW / 2, by + 6.5, { align: 'center' });

      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, fp.headingStyle);
      doc.setFontSize(7.6 * cScale);
      const st = doc.splitTextToSize(sanitizePdfText(w.shortTitle), cardW - 4)[0] || '';
      doc.text(st, bx + cardW / 2, by + 13, { align: 'center' });
    });

    const sealY = 234;
    doc.setFillColor(...theme.accent);
    doc.setDrawColor(...theme.primary);
    doc.setLineWidth(1.0);
    doc.circle(W / 2, sealY, 12.5, 'FD');
    doc.setTextColor(...theme.accentTextOnFill);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(7 * cScale);
    doc.text('VERIFIED', W / 2, sealY - 1.5, { align: 'center' });
    doc.text('SEAL', W / 2, sealY + 2.5, { align: 'center' });

    const sigY = 266;
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(10.5 * cScale);
    doc.text('Matthew Cesar Corpuz', 56, sigY - 2.5, { align: 'center' });
    doc.text('Academic Standards Council', W - 56, sigY - 2.5, { align: 'center' });
    doc.setDrawColor(...theme.primary);
    doc.setLineWidth(0.4);
    doc.line(24, sigY, 88, sigY);
    doc.line(W - 88, sigY, W - 24, sigY);

    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(7.4 * cScale);
    doc.text('MATTHEW CESAR CORPUZ', 56, sigY + 4.5, { align: 'center' });
    doc.text('LABOR STANDARDS BOARD', W - 56, sigY + 4.5, { align: 'center' });

    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(6.6 * cScale);
    doc.text(
      `ISSUED: ${dateStr}  |  ID: ${certId}  |  FONT: ${fp.displayLabel}  |  MODULES: ${params.completedCount}/${Math.max(
        1,
        params.totalCount
      )}`,
      W / 2,
      280,
      { align: 'center' }
    );

    return docToUint8Array(doc);
  }

  // Landscape Executive Certificate Geometry (297mm x 210mm)
  doc.setTextColor(...theme.primary);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(9.5 * cScale);
  doc.text(
    'REPUBLIC OF THE PHILIPPINES  -  ACADEMY OF LABOR STANDARDS & SOCIAL LEGISLATION',
    W / 2,
    26.5,
    { align: 'center' }
  );

  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(7.8 * cScale);
  doc.text(
    'PRESIDENTIAL DECREE NO. 442 (LABOR CODE OF THE PHILIPPINES)  -  WORLDS 1 TO 6 SYLLABUS',
    W / 2,
    32.2,
    { align: 'center' }
  );

  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(0.6);
  doc.line(40, 37, W - 40, 37);
  doc.line(40, 52, W - 40, 52);

  doc.setTextColor(...theme.primary);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(24.5 * cScale);
  doc.text('CERTIFICATE OF STATUTORY COMPLETION', W / 2, 47, { align: 'center' });

  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(11.5 * cScale);
  doc.text('This Executive Honor Certificate is Conferred Upon', W / 2, 60.5, {
    align: 'center',
  });

  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, fp.headingStyle);
  const recipientFontSize = (recipient.length > 36 ? 19 : recipient.length > 26 ? 22 : 25) * cScale;
  doc.setFontSize(recipientFontSize);
  const clampedRecipient = doc.splitTextToSize(recipient, W - 70)[0] || recipient;
  doc.text(clampedRecipient, W / 2, 74.5, { align: 'center' });

  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.5);
  doc.line(64, 78.2, W - 64, 78.2);

  doc.setTextColor(...theme.badgeText);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(10 * cScale);
  const clampedHonors =
    doc.splitTextToSize(honors.toUpperCase(), W - 70)[0] || honors.toUpperCase();
  doc.text(clampedHonors, W / 2, 85.8, { align: 'center' });

  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(10.0 * cScale);
  const citationBody =
    'for demonstrating comprehensive mastery and practical command across all Six Worlds of Philippine Labor Standards (Presidential Decree No. 442, as amended), encompassing Hours of Work & Overtime Rules, Rest Days & Holidays, Wages & D.O. 174 Subcontracting, Special Groups of Employees, Protective Workplace Statutes, and World 6 Statutory Leaves.';
  const bodyLines = doc.splitTextToSize(citationBody, W - 74);
  doc.text(bodyLines, W / 2, 94.5, { align: 'center', lineHeightFactor: 1.25 });

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
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(8.2 * cScale);
    doc.text(`WORLD ${w.worldNumber}`, bx + boxW / 2, boxY + 6.2, { align: 'center' });

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(7.1 * cScale);
    const shortTitle = doc.splitTextToSize(sanitizePdfText(w.shortTitle), boxW - 2)[0] || '';
    doc.text(shortTitle, bx + boxW / 2, boxY + 12.2, { align: 'center' });
  });

  const sigLineY = 170;

  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(12 * cScale);
  doc.text('Matthew Cesar Corpuz', 74, sigLineY - 3, { align: 'center' });
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.4);
  doc.line(36, sigLineY, 112, sigLineY);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(8.0 * cScale);
  doc.text('MATTHEW CESAR CORPUZ', 74, sigLineY + 5, { align: 'center' });
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(7.0 * cScale);
  doc.setTextColor(...theme.mutedText);
  doc.text('Main Creator & Lead Author of Memory Aid', 74, sigLineY + 9.2, { align: 'center' });

  doc.setFillColor(...theme.accent);
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(1.0);
  doc.circle(W / 2, sigLineY - 4, 13.2, 'FD');
  doc.setDrawColor(...theme.badgeFill);
  doc.setLineWidth(0.4);
  doc.circle(W / 2, sigLineY - 4, 10.6, 'S');
  doc.setTextColor(...theme.accentTextOnFill);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(7.2 * cScale);
  doc.text('OFFICIAL', W / 2, sigLineY - 5.2, { align: 'center' });
  doc.text('SEAL', W / 2, sigLineY - 1.2, { align: 'center' });

  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(7.0 * cScale);
  doc.text(`ISSUED: ${dateStr} (${fp.displayLabel})`, W / 2, sigLineY + 14.2, { align: 'center' });
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(6.5 * cScale);
  doc.text(
    `ID: ${certId}  |  MODULES COMPLETED: ${params.completedCount}/${Math.max(1, params.totalCount)}`,
    W / 2,
    sigLineY + 18.4,
    { align: 'center' }
  );

  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(12 * cScale);
  doc.text('Academic Standards Council', W - 74, sigLineY - 3, { align: 'center' });
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.4);
  doc.line(W - 112, sigLineY, W - 36, sigLineY);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(8.0 * cScale);
  doc.text('PHILIPPINE LABOR STANDARDS BOARD', W - 74, sigLineY + 5, { align: 'center' });
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(7.0 * cScale);
  doc.setTextColor(...theme.mutedText);
  doc.text('Workplace Rights & Statutory Education', W - 74, sigLineY + 9.2, { align: 'center' });

  return docToUint8Array(doc);
}

export function buildCertificateLandscapePdfBytes(params: CertificatePdfParams): Uint8Array {
  return buildCertificatePdfBytes(params);
}

export function downloadCertificatePdf(params: CertificatePdfParams): Uint8Array {
  const orient = params.orientation === 'portrait' ? 'Portrait' : 'Landscape';
  const bytes = buildCertificatePdfBytes(params);
  triggerPdfDownloadFromBytes(
    bytes,
    `Official-Labor-Mastery-Certificate-${orient}-A4.pdf`
  );
  return bytes;
}

export function downloadCertificateLandscapePdf(params: CertificatePdfParams): Uint8Array {
  return downloadCertificatePdf(params);
}

/**
 * Builds Toad's Shop's Distinct ROYAL GRAND MASTER JURIS DIPLOMA & 6-WORLD TRANSCRIPT CHARTER
 */
export function buildMasterDiplomaPdfBytes(params: CertificatePdfParams): Uint8Array {
  const orient = params.orientation === 'portrait' ? 'portrait' : 'landscape';
  const doc = new jsPDF({
    orientation: orient,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const dipTheme = resolvePdfThemeAndFont(
    params.colorAccent || 'supreme_court_crimson',
    params.fontStyle || 'playfair_royal'
  );
  const dff = dipTheme.fontFamily;
  const dipFont = dipTheme.fontProfile;
  const dScale = Math.min(1.08, Math.max(0.85, dipFont.sizeScale));
  applyPdfCharSpace(doc, dipFont.charSpace);
  applyPdfDocumentMeta(
    doc,
    'Grand Master Juris Diploma - Philippine Labor Standards',
    params.colorAccent || 'supreme_court_crimson',
    dipFont
  );
  const W = orient === 'portrait' ? 210 : 297;
  const H = orient === 'portrait' ? 297 : 210;

  const recipient =
    sanitizePdfText(params.recipientName) || 'Mario Bar Candidate';
  const dateStr = sanitizePdfText(
    params.dateLabel ||
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
  );
  const charterNo =
    sanitizePdfText(params.certificateId) ||
    `MK-CHARTER-${Math.abs(params.completedCount * 211 + 777)
      .toString(16)
      .toUpperCase()}`;

  doc.setFillColor(...dipTheme.pageBg);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(...dipTheme.primary);
  doc.setLineWidth(2.8);
  doc.rect(8, 8, W - 16, H - 16);

  doc.setDrawColor(...dipTheme.accent);
  doc.setLineWidth(1.1);
  doc.rect(12, 12, W - 24, H - 24);

  doc.setDrawColor(...dipTheme.borderStrong);
  doc.setLineWidth(0.35);
  doc.rect(14.2, 14.2, W - 28.4, H - 28.4);

  const bannerW = W - 40;
  doc.setFillColor(...dipTheme.primary);
  doc.roundedRect(20, 18, bannerW, 18, 2.5, 2.5, 'F');
  doc.setTextColor(...dipTheme.kickerText);
  doc.setFont(dff, dipFont.headingStyle);
  doc.setFontSize((orient === 'portrait' ? 9.2 : 10.5) * dScale);
  doc.text(
    'ROYAL MUSHROOM ACADEMY  -  SENATE OF SOCIAL LEGISLATION & JURISPRUDENCE',
    W / 2,
    25.2,
    { align: 'center' }
  );
  doc.setTextColor(...dipTheme.primaryText);
  doc.setFont(dff, dipFont.subHeadingStyle);
  doc.setFontSize(8 * dScale);
  doc.text(
    `"Iustitia Laboris  -  Six-World Statutory Charter (${dipFont.displayLabel})"`,
    W / 2,
    31.8,
    { align: 'center' }
  );

  const regY = 39.5;
  doc.setFillColor(...dipTheme.badgeFill);
  doc.setDrawColor(...dipTheme.badgeBorder);
  doc.setLineWidth(0.35);
  doc.roundedRect(20, regY, bannerW, 8, 1.5, 1.5, 'FD');
  doc.setTextColor(...dipTheme.badgeText);
  doc.setFont(dff, dipFont.subHeadingStyle);
  doc.setFontSize(7.1 * dScale);
  doc.text(
    `CHARTER REGISTRY: ${charterNo}   |   TRANSCRIPT: 6/6 WORLDS SEALED   |   CONFERRED: ${dateStr.toUpperCase()}`,
    W / 2,
    regY + 5.2,
    { align: 'center' }
  );

  const pillars = [
    { w: 'WORLD I', t: 'Hours & Overtime', s: 'Arts. 82-90 | 8h | +25% OT | +10% NSD' },
    { w: 'WORLD II', t: 'Holidays & 13th Mo.', s: '200% Reg | 130% Spec | P.D. 851 | R.A. 11360' },
    { w: 'WORLD III', t: 'Wages & D.O. 174', s: 'R.A. 6727 | Pineda Formula | P5M Capital' },
    { w: 'WORLD IV', t: 'Special Groups', s: 'R.A. 10361 Kasambahay | R.A. 9231 | R.A. 7277' },
    { w: 'WORLD V', t: 'Tenure & Retirement', s: 'Arts. 294-302 | Twin-Notice | R.A. 7641 22.5d' },
    { w: 'WORLD VI', t: 'Statutory Leaves', s: 'R.A. 11210 (105d) | R.A. 8187 | 9262 | 9710' },
  ];

  if (orient === 'portrait') {
    doc.setTextColor(...dipTheme.primary);
    doc.setFont(dff, dipFont.headingStyle);
    doc.setFontSize(21.5 * dScale);
    doc.text('GRAND MASTER JURIS DIPLOMA', W / 2, 60, { align: 'center' });

    doc.setTextColor(...dipTheme.mutedText);
    doc.setFont(dff, dipFont.subHeadingStyle);
    doc.setFontSize(10.5 * dScale);
    doc.text(
      'By Authority of the High Academy Senate, Know All Persons That',
      W / 2,
      68,
      { align: 'center' }
    );

    doc.setTextColor(...dipTheme.bodyText);
    doc.setFont(dff, dipFont.headingStyle);
    doc.setFontSize((recipient.length > 28 ? 19 : 23) * dScale);
    const recLine = doc.splitTextToSize(recipient, W - 46)[0] || recipient;
    doc.text(recLine, W / 2, 82, { align: 'center' });
    doc.setDrawColor(...dipTheme.accent);
    doc.setLineWidth(0.6);
    doc.line(32, 85.5, W - 32, 85.5);

    doc.setTextColor(...dipTheme.badgeText);
    doc.setFont(dff, dipFont.headingStyle);
    doc.setFontSize(9.5 * dScale);
    doc.text(
      'GRAND MASTER OF PHILIPPINE LABOR STANDARDS  -  SUMMA CUM CODAL',
      W / 2,
      93,
      { align: 'center' }
    );

    const pStartY = 103;
    const cols = 2;
    const gapX = 5;
    const gapY = 5;
    const cardW = (W - 40 - gapX) / cols;
    const cardH = 26;
    pillars.forEach((p, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const bx = 20 + c * (cardW + gapX);
      const by = pStartY + r * (cardH + gapY);
      doc.setFillColor(...dipTheme.zebraFill);
      doc.setDrawColor(...dipTheme.badgeBorder);
      doc.setLineWidth(0.4);
      doc.roundedRect(bx, by, cardW, cardH, 2, 2, 'FD');

      doc.setTextColor(...dipTheme.badgeText);
      doc.setFont(dff, dipFont.subHeadingStyle);
      doc.setFontSize(7.4 * dScale);
      doc.text(`${p.w}  [SUMMA SEALED]`, bx + 3.5, by + 6);

      doc.setTextColor(...dipTheme.bodyText);
      doc.setFont(dff, dipFont.headingStyle);
      doc.setFontSize(9.5 * dScale);
      doc.text(p.t, bx + 3.5, by + 13.5);

      doc.setTextColor(...dipTheme.mutedText);
      doc.setFont(dff, dipFont.bodyStyle);
      doc.setFontSize(7.0 * dScale);
      const sl = doc.splitTextToSize(p.s, cardW - 7)[0] || p.s;
      doc.text(sl, bx + 3.5, by + 20.5);
    });

    const sealY = 216;
    doc.setFillColor(...dipTheme.primary);
    doc.triangle(W / 2 - 8, sealY + 6, W / 2 - 2, sealY + 6, W / 2 - 11, sealY + 24, 'F');
    doc.triangle(W / 2 + 2, sealY + 6, W / 2 + 8, sealY + 6, W / 2 + 11, sealY + 24, 'F');
    doc.setFillColor(...dipTheme.accent);
    doc.setDrawColor(...dipTheme.primary);
    doc.setLineWidth(1.2);
    doc.circle(W / 2, sealY, 13.5, 'FD');
    doc.setTextColor(...dipTheme.accentTextOnFill);
    doc.setFont(dff, dipFont.headingStyle);
    doc.setFontSize(7.2 * dScale);
    doc.text('HIGH SENATE', W / 2, sealY - 1.5, { align: 'center' });
    doc.text('GOLD SEAL', W / 2, sealY + 2.8, { align: 'center' });

    const sigY = 266;
    const colW = (W - 44) / 3;
    const sigs = [
      { s: 'Chancellor Toadsworth', r: 'CHANCELLOR OF LEGISLATION' },
      { s: 'Matthew Cesar Corpuz', r: 'MAIN CREATOR & ARCHITECT' },
      { s: 'Chief Arbiter Rosalina', r: 'SUPREME BAR EXAMINER' },
    ];
    sigs.forEach((sg, idx) => {
      const cx = 22 + colW * idx + colW / 2;
      doc.setTextColor(...dipTheme.bodyText);
      doc.setFont(dff, dipFont.subHeadingStyle);
      doc.setFontSize(9.2 * dScale);
      doc.text(sg.s, cx, sigY - 2.5, { align: 'center' });
      doc.setDrawColor(...dipTheme.primary);
      doc.setLineWidth(0.4);
      doc.line(cx - colW * 0.42, sigY, cx + colW * 0.42, sigY);
      doc.setFont(dff, dipFont.headingStyle);
      doc.setFontSize(6.2 * dScale);
      doc.setTextColor(...dipTheme.mutedText);
      doc.text(sg.r, cx, sigY + 4.5, { align: 'center' });
    });

    return docToUint8Array(doc);
  }

  doc.setTextColor(...dipTheme.primary);
  doc.setFont(dff, dipFont.headingStyle);
  doc.setFontSize(23.5 * dScale);
  doc.text('GRAND MASTER JURIS DIPLOMA', W / 2, 58, { align: 'center' });

  doc.setTextColor(...dipTheme.mutedText);
  doc.setFont(dff, dipFont.subHeadingStyle);
  doc.setFontSize(10.5 * dScale);
  doc.text(
    'By Authority of the Royal Mushroom Academy Senate, This Sovereign Charter Is Conferred Upon',
    W / 2,
    65.5,
    { align: 'center' }
  );

  doc.setTextColor(...dipTheme.bodyText);
  doc.setFont(dff, dipFont.headingStyle);
  doc.setFontSize((recipient.length > 32 ? 20 : 24) * dScale);
  const recLand = doc.splitTextToSize(recipient, W - 70)[0] || recipient;
  doc.text(recLand, W / 2, 77.5, { align: 'center' });
  doc.setDrawColor(...dipTheme.accent);
  doc.setLineWidth(0.6);
  doc.line(58, 80.5, W - 58, 80.5);

  doc.setTextColor(...dipTheme.badgeText);
  doc.setFont(dff, dipFont.headingStyle);
  doc.setFontSize(9.5 * dScale);
  doc.text(
    'GRAND MASTER OF PHILIPPINE LABOR STANDARDS  -  SUMMA CUM CODAL HONORS',
    W / 2,
    87,
    { align: 'center' }
  );

  const lStartY = 93;
  const lCols = 3;
  const lGapX = 4.5;
  const lGapY = 4;
  const lCardW = (W - 40 - lGapX * 2) / lCols;
  const lCardH = 21;
  pillars.forEach((p, idx) => {
    const c = idx % lCols;
    const r = Math.floor(idx / lCols);
    const bx = 20 + c * (lCardW + lGapX);
    const by = lStartY + r * (lCardH + lGapY);
    doc.setFillColor(...dipTheme.zebraFill);
    doc.setDrawColor(...dipTheme.badgeBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(bx, by, lCardW, lCardH, 2, 2, 'FD');

    doc.setTextColor(...dipTheme.badgeText);
    doc.setFont(dff, dipFont.subHeadingStyle);
    doc.setFontSize(7.2 * dScale);
    doc.text(`${p.w}  [SUMMA SEALED]`, bx + 3.5, by + 5.5);

    doc.setTextColor(...dipTheme.bodyText);
    doc.setFont(dff, dipFont.headingStyle);
    doc.setFontSize(9.5 * dScale);
    doc.text(p.t, bx + 3.5, by + 12);

    doc.setTextColor(...dipTheme.mutedText);
    doc.setFont(dff, dipFont.bodyStyle);
    doc.setFontSize(7.0 * dScale);
    const sl = doc.splitTextToSize(p.s, lCardW - 7)[0] || p.s;
    doc.text(sl, bx + 3.5, by + 17.5);
  });

  const lSigY = 176;
  doc.setTextColor(...dipTheme.bodyText);
  doc.setFont(dff, dipFont.subHeadingStyle);
  doc.setFontSize(11 * dScale);
  doc.text('Chancellor Toadsworth', 62, lSigY - 3, { align: 'center' });
  doc.text('Matthew Cesar Corpuz', W - 62, lSigY - 3, { align: 'center' });

  doc.setDrawColor(...dipTheme.primary);
  doc.setLineWidth(0.45);
  doc.line(26, lSigY, 98, lSigY);
  doc.line(W - 98, lSigY, W - 26, lSigY);

  doc.setFont(dff, dipFont.headingStyle);
  doc.setFontSize(7.2 * dScale);
  doc.setTextColor(...dipTheme.mutedText);
  doc.text('CHANCELLOR OF SOCIAL LEGISLATION', 62, lSigY + 5, { align: 'center' });
  doc.text('MATTHEW  -  MAIN CREATOR & CURATOR', W - 62, lSigY + 5, {
    align: 'center',
  });

  const sealX = W / 2;
  const sealY = 165;
  doc.setFillColor(...dipTheme.primary);
  doc.triangle(sealX - 7, sealY + 6, sealX - 1.5, sealY + 6, sealX - 10, sealY + 23, 'F');
  doc.triangle(sealX + 1.5, sealY + 6, sealX + 7, sealY + 6, sealX + 10, sealY + 23, 'F');
  doc.setFillColor(...dipTheme.accent);
  doc.setDrawColor(...dipTheme.primary);
  doc.setLineWidth(1.2);
  doc.circle(sealX, sealY, 12.8, 'FD');
  doc.setTextColor(...dipTheme.accentTextOnFill);
  doc.setFont(dff, dipFont.headingStyle);
  doc.setFontSize(7.2 * dScale);
  doc.text('ROYAL SENATE', sealX, sealY - 1.5, { align: 'center' });
  doc.text('CHARTER SEAL', sealX, sealY + 2.8, { align: 'center' });

  return docToUint8Array(doc);
}

export function downloadMasterDiplomaPdf(params: CertificatePdfParams): Uint8Array {
  const orient = params.orientation === 'portrait' ? 'Portrait' : 'Landscape';
  const bytes = buildMasterDiplomaPdfBytes(params);
  triggerPdfDownloadFromBytes(
    bytes,
    `Royal-Grand-Master-Juris-Diploma-${orient}-A4.pdf`
  );
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
  const fp = theme.fontProfile;
  applyPdfCharSpace(doc, fp.charSpace);
  applyPdfDocumentMeta(
    doc,
    'Philippine Labor Standards & Workplace Rights Study Guide',
    params.colorAccent,
    fp
  );

  const pageW = orientation === 'landscape' ? 297 : 210;
  const pageH = orientation === 'landscape' ? 210 : 297;
  const marginX =
    params.paperMargins === 'compact' ? 9 : params.paperMargins === 'spacious' ? 16 : 12;
  const marginTop = params.paperMargins === 'compact' ? 11 : 14;
  const marginBottom = 15;
  const contentW = pageW - marginX * 2;
  const baseScale =
    params.fontSizeScale === 'small' ? 0.9 : params.fontSizeScale === 'large' ? 1.1 : 1.0;
  const scale = Number((baseScale * fp.sizeScale).toFixed(3));

  paintPageBackground(doc, pageW, pageH, theme.pageBg);
  let y = marginTop;

  const addThemedPage = () => {
    doc.addPage('a4', orientation);
    paintPageBackground(doc, pageW, pageH, theme.pageBg);
    applyPdfCharSpace(doc, fp.charSpace);
    y = marginTop;
  };

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageH - marginBottom) {
      addThemedPage();
    }
  };

  const writeSectionHeading = (title: string, rightTag?: string) => {
    ensureSpace(20);
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
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(8.3 * scale);
    const maxTitleW = rightTag ? contentW - 42 : contentW - 5;
    const clampedTitle = doc.splitTextToSize(sanitizePdfText(title), maxTitleW)[0] || '';
    doc.text(clampedTitle, marginX + 2.5, y + 4.9);
    if (rightTag) {
      doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.primaryText));
      doc.setFont(ff, fp.subHeadingStyle);
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
      doc.setFont(ff, isHeader ? fp.headingStyle : fp.bodyStyle);
      doc.setFontSize(fontSz);

      const wrappedCells = colWidths.map((cw, cIdx) => {
        const txt = sanitizePdfText(cells[cIdx] || '');
        return doc.splitTextToSize(txt, Math.max(10, cw - cellPadX * 2));
      });
      const maxLines = Math.max(1, ...wrappedCells.map((lines) => lines.length));
      const rowH = maxLines * lineH + cellPadY * 2;

      if (y + rowH + 1 > pageH - marginBottom) {
        addThemedPage();
        if (!isHeader) {
          renderRow(headers, true, 0);
        }
      }

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
        doc.setFont(
          ff,
          isHeader ? fp.headingStyle : cIdx === 0 ? fp.subHeadingStyle : fp.bodyStyle
        );
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

  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(7.3);
  doc.text(
    'PHILIPPINE LABOR CODE (P.D. NO. 442 AS AMENDED) - UNABRIDGED STUDY REVIEWER',
    pageW / 2,
    y + 5.4,
    { align: 'center' }
  );

  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(13.2 * fp.sizeScale);
  doc.text('Philippine Labor Standards & Workplace Rights Study Guide', pageW / 2, y + 12, {
    align: 'center',
  });

  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : ([226, 232, 240] as RgbTuple)));
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(7.0);
  const coverSub = params.candidateName
    ? `Prepared for: ${sanitizePdfText(params.candidateName)}  |  Modules: ${params.topics.length}  |  Typeface: ${fp.displayLabel}  |  Matthew Cesar Corpuz`
    : `Modules: ${params.topics.length}  |  Mastered: ${params.completedTopicIds.length}/${ALL_LAW_TOPICS.length}  |  Typeface: ${fp.displayLabel}  |  Matthew Cesar Corpuz`;
  const clampedCoverSub = doc.splitTextToSize(coverSub, contentW - 8)[0] || coverSub;
  doc.text(clampedCoverSub, pageW / 2, y + 17.4, { align: 'center' });
  y += 24;

  // Group Members Attribution
  if (params.includeGroupMembers !== false) {
    const membersLine = sanitizePdfText(GROUP_MEMBERS.join('  |  '));
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(6.9 * scale);
    const wrappedMembers = doc.splitTextToSize(membersLine, contentW - 6);
    const boxH = 8.5 + wrappedMembers.length * (3.5 * scale);
    ensureSpace(boxH + 3);
    doc.setDrawColor(...theme.borderMuted);
    doc.setFillColor(...theme.zebraFill);
    doc.rect(marginX, y, contentW, boxH, 'FD');
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(7.6 * scale);
    doc.text(
      'MEMORY AID ATTRIBUTION & RESEARCH COHORT (MAIN CREATOR: MATTHEW CESAR CORPUZ)',
      marginX + 3,
      y + 4.8
    );
    doc.setFont(ff, fp.bodyStyle);
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
      doc.setFont(ff, fp.headingStyle);
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
      doc.setFont(ff, fp.bodyStyle);
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
      doc.setFont(ff, fp.bodyStyle);
      doc.setFontSize(7.2 * scale);
      const noteBody = doc.splitTextToSize(sanitizePdfText(n.content), contentW - 6);
      const boxH = 8 + noteBody.length * (3.7 * scale);
      ensureSpace(boxH + 3);
      doc.setFillColor(...theme.cardTintFill);
      doc.setDrawColor(...theme.badgeBorder);
      doc.rect(marginX, y, contentW, boxH, 'FD');
      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, fp.headingStyle);
      doc.setFontSize(7.8 * scale);
      const noteHeader = doc.splitTextToSize(
        sanitizePdfText(`${n.title} [${n.worldTag}]`),
        contentW - 6
      )[0] || '';
      doc.text(noteHeader, marginX + 3, y + 4.8);
      doc.setFont(ff, fp.bodyStyle);
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
      ensureSpace(24);
      const isDone = params.completedTopicIds.includes(topic.id);

      doc.setDrawColor(...theme.borderStrong);
      doc.setLineWidth(0.3);
      doc.line(marginX, y, pageW - marginX, y);
      y += 4.5;

      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, fp.headingStyle);
      doc.setFontSize(8.8 * scale);
      const checkPrefix =
        params.includeCheckboxes !== false ? (isDone ? '[x] ' : '[ ] ') : '';
      const headerLabel =
        params.includeLegalCitations !== false
          ? `${checkPrefix}${topic.title} [${topic.badge}]`
          : `${checkPrefix}${topic.title}`;
      const titleLines = doc.splitTextToSize(sanitizePdfText(headerLabel), contentW - 32);
      doc.text(titleLines, marginX, y);
      doc.setFont(ff, fp.subHeadingStyle);
      doc.setFontSize(6.8 * scale);
      doc.setTextColor(...(isDone ? theme.secondaryAccent : theme.mutedText));
      doc.text(isDone ? '[COMPLETED]' : '[TO STUDY]', pageW - marginX, y, { align: 'right' });
      y += titleLines.length * (4.1 * scale * fp.lineHeightMultiplier) + 1.2;

      if (!params.matricesOnlyMode) {
        doc.setFont(ff, fp.bodyStyle);
        doc.setFontSize(7.2 * scale);
        const sumLines = doc.splitTextToSize(
          sanitizePdfText(`Core Summary: ${cleanRuleText(topic.summary)}`),
          contentW - 2
        );
        ensureSpace(sumLines.length * (3.6 * scale * fp.lineHeightMultiplier) + 2);
        doc.setTextColor(...theme.bodyText);
        doc.text(sumLines, marginX + 1, y);
        y += sumLines.length * (3.6 * scale * fp.lineHeightMultiplier) + 1.5;
      }

      const rules = params.matricesOnlyMode
        ? topic.rules.filter((r) => Boolean(r.tableData))
        : topic.rules;

      rules.forEach((rule, rIdx) => {
        ensureSpace(16);
        doc.setTextColor(...theme.primary);
        doc.setFont(ff, fp.subHeadingStyle);
        doc.setFontSize(7.5 * scale);
        const rHead = doc.splitTextToSize(
          sanitizePdfText(`${rIdx + 1}. ${cleanRuleText(rule.heading)}`),
          contentW - 4
        );
        doc.text(rHead, marginX + 2, y);
        y += rHead.length * (3.7 * scale * fp.lineHeightMultiplier);

        if (!params.matricesOnlyMode && rule.description) {
          doc.setFont(ff, fp.bodyStyle);
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
            doc.setFont(ff, fp.bodyStyle);
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
            doc.setFont(ff, fp.subHeadingStyle);
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
        doc.setFont(ff, fp.headingStyle);
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
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(7.4 * scale);
    doc.text('LEARNER COMMITMENT & WORKPLACE JUSTICE PLEDGE', marginX + 3, y + 4.8);
    doc.setFont(ff, ff === 'courier' ? fp.bodyStyle : 'italic');
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
    doc.setFont(ff, fp.bodyStyle);
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
  colorAccent?: string;
  fontStyle?: string;
  worldBreakdown: {
    worldNumber: number;
    shortTitle: string;
    completed: number;
    total: number;
    percent: number;
  }[];
}

export function countPdfPagesFromBytes(bytes: Uint8Array): number {
  if (!bytes || bytes.length === 0) return 1;
  let ascii = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, Math.min(bytes.length, i + chunkSize));
    ascii += String.fromCharCode(...sub);
  }
  const matches = ascii.match(/\/Type\s*\/Page\b/g);
  return matches && matches.length > 0 ? matches.length : 1;
}

/**
 * Builds a single-page A4 Landscape Hero Score Card PDF (297mm x 210mm)
 * for direct download from ExportProgressModal and PrintStudyGuideModal.
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

  const theme = resolvePdfThemeAndFont(
    params.colorAccent || 'executive_navy',
    params.fontStyle || 'modern_sans'
  );
  const ff = theme.fontFamily;
  const fp = theme.fontProfile;
  const sScale = Math.min(1.08, Math.max(0.85, fp.sizeScale));
  applyPdfDocumentMeta(
    doc,
    `Official Hero Score Card - ${params.playerName || 'Labor Scholar Hero'}`,
    params.colorAccent,
    fp
  );
  applyPdfCharSpace(doc, fp.charSpace);

  doc.setFillColor(...theme.pageBg);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(...theme.accent);
  doc.setLineWidth(1.8);
  doc.rect(9.5, 9.5, W - 19, H - 19);

  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.55);
  doc.rect(12, 12, W - 24, H - 24);

  if (theme.isInkSaver) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...theme.borderStrong);
    doc.setLineWidth(0.5);
    doc.rect(16, 15.5, W - 32, 30, 'FD');
  } else {
    doc.setFillColor(...theme.primary);
    doc.rect(16, 15.5, W - 32, 30, 'F');
  }

  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.kickerText));
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(8.5 * sScale);
  doc.text('SUPER MARIO LABOR ADVENTURE  -  OFFICIAL HERO SCORE CARD & DOSSIER', 21, 22.5);

  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(20 * sScale);
  const clampedPlayer =
    doc.splitTextToSize(
      sanitizePdfText(params.playerName || 'Labor Scholar Hero'),
      W - 120
    )[0] || 'Labor Scholar Hero';
  doc.text(clampedPlayer, 21, 33);

  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.primaryText));
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(9.5 * sScale);
  doc.text(
    sanitizePdfText(`${params.heroRank}  |  Equipped Hero: ${params.heroName}  |  Font: ${fp.displayLabel}`),
    21,
    40.8
  );

  doc.setFillColor(...theme.badgeFill);
  doc.setDrawColor(...theme.badgeBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(W - 84, 18, 64, 25, 2.5, 2.5, 'FD');
  doc.setTextColor(...theme.badgeText);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(18 * sScale);
  doc.text(`${pct}%`, W - 52, 29.5, { align: 'center' });
  doc.setTextColor(...theme.bodyText);
  doc.setFontSize(7.5 * sScale);
  doc.text(
    `${params.completedCount} / ${params.totalTopics} Modules Mastered`,
    W - 52,
    37.5,
    { align: 'center' }
  );

  const stats = [
    { label: 'STUDY TIME', val: sanitizePdfText(params.studyDurationFormatted) },
    { label: 'GOLD COINS', val: `x${params.coins}` },
    { label: 'DAILY STREAK', val: `${params.loginStreak} Days` },
    {
      label: 'BADGES EARNED',
      val: `${params.unlockedAchievementsCount}/${params.totalAchievementsCount}`,
    },
    { label: 'QUIZ RUNS', val: `${params.quizRunsCompleted} Cleared` },
  ];
  const tileGap = 4;
  const tileW = (W - 32 - tileGap * 4) / 5;
  stats.forEach((st, idx) => {
    const tx = 16 + idx * (tileW + tileGap);
    doc.setFillColor(...theme.zebraFill);
    doc.setDrawColor(...theme.borderStrong);
    doc.setLineWidth(0.3);
    doc.roundedRect(tx, 51, tileW, 23, 2, 2, 'FD');
    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(7.2 * sScale);
    doc.text(st.label, tx + 3.5, 58.5);
    doc.setTextColor(...theme.formulaText);
    doc.setFont(ff, fp.headingStyle);
    let valFontSize = 12.2 * sScale;
    doc.setFontSize(valFontSize);
    const maxValW = tileW - 7;
    while (valFontSize > 7 && doc.getTextWidth(st.val) > maxValW) {
      valFontSize -= 0.5;
      doc.setFontSize(valFontSize);
    }
    doc.text(st.val, tx + 3.5, 68.5);
  });

  doc.setTextColor(...theme.primary);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(9.5 * sScale);
  doc.text('SIX-WORLD LABOR STANDARDS MASTERY BREAKDOWN', 16, 84.5);

  const wColW = (W - 32 - 6) / 2;
  const wRowH = 24;
  params.worldBreakdown.forEach((wb, idx) => {
    const c = idx % 2;
    const r = Math.floor(idx / 2);
    const bx = 16 + c * (wColW + 6);
    const by = 89.5 + r * (wRowH + 4);

    doc.setFillColor(...theme.cardTintFill);
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, by, wColW, wRowH, 2.5, 2.5, 'FD');

    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(9.8 * sScale);
    doc.text(sanitizePdfText(`World ${wb.worldNumber}: ${wb.shortTitle}`), bx + 4, by + 8.5);

    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(9.2 * sScale);
    doc.text(`${wb.percent}% (${wb.completed}/${wb.total})`, bx + wColW - 4, by + 8.5, {
      align: 'right',
    });

    doc.setFillColor(226, 232, 240);
    const trackW = wColW - 8;
    doc.roundedRect(bx + 4, by + 13.5, trackW, 5, 1.5, 1.5, 'F');
    if (wb.percent > 0) {
      doc.setFillColor(...(wb.percent === 100 ? theme.accent : theme.primary));
      const fillW = Math.min(trackW, Math.max(3, (trackW * Math.min(100, wb.percent)) / 100));
      doc.roundedRect(bx + 4, by + 13.5, fillW, 5, 1.5, 1.5, 'F');
    }
  });

  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(7.8 * sScale);
  doc.text(
    `Super Mario Labor Adventure  -  Philippine Labor Standards Guide (${fp.displayLabel})  |  Created by Matthew`,
    W / 2,
    H - 15.5,
    { align: 'center' }
  );

  return docToUint8Array(doc);
}

export function downloadScoreCardLandscapePdf(params: ScoreCardPdfParams): Uint8Array {
  const bytes = buildScoreCardLandscapePdfBytes(params);
  triggerPdfDownloadFromBytes(bytes, 'Mario-Labor-Hero-Score-Card-A4.pdf');
  return bytes;
}
