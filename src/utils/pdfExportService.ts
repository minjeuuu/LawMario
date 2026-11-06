import { jsPDF } from 'jspdf';
import {
  ONE_PAGE_LEGAL_FORMULAS,
  ONE_PAGE_LEGAL_DEADLINES,
  ONE_PAGE_STATUTORY_LEAVE_CAPS,
} from './onePageSummaryData';
import { WORLDS_METADATA, ALL_LAW_TOPICS, STATUTORY_LEAVES_MASTER_ROWS } from '../data/laborLawData';
import { LABOR_BENEFITS_MULTIPLIER_LIST } from '../data/multiplierTable';
import { REGIONAL_MINIMUM_WAGES, KASAMBAHAY_MINIMUM_WAGES } from '../data/regionalWages';
import { GROUP_MEMBERS, StudyNoteItem } from './engagementFeatures';
import { cleanRuleText, parseListEntry } from './moduleFormatter';
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

/**
 * Draws a Mario 8-Bit Question Mark Coin Block in pure vector geometry (zero emoji)
 */
export function drawVectorMarioCoinBlock(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  primaryColor: RgbTuple,
  accentColor: RgbTuple
): void {
  doc.setFillColor(...accentColor);
  doc.rect(x, y, size, size, 'F');
  const inset = size * 0.12;
  doc.setFillColor(...primaryColor);
  doc.rect(x + inset, y + inset, size - inset * 2, size - inset * 2, 'F');
  doc.setFillColor(255, 255, 255);
  const boltR = Math.max(0.2, size * 0.05);
  doc.circle(x + inset * 1.5, y + inset * 1.5, boltR, 'F');
  doc.circle(x + size - inset * 1.5, y + inset * 1.5, boltR, 'F');
  doc.circle(x + inset * 1.5, y + size - inset * 1.5, boltR, 'F');
  doc.circle(x + size - inset * 1.5, y + size - inset * 1.5, boltR, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size * 2.2);
  doc.text('?', x + size / 2, y + size * 0.74, { align: 'center' });
}

/**
 * Draws a Mario Warp Pipe section divider in pure vector geometry (zero emoji)
 */
export function drawVectorMarioPipe(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  pipeRgb: RgbTuple = [34, 197, 94],
  rimRgb: RgbTuple = [22, 101, 52]
): void {
  const rimH = Math.min(2.8, h * 0.4);
  const overhang = 1.2;
  doc.setFillColor(...pipeRgb);
  doc.setDrawColor(...rimRgb);
  doc.setLineWidth(0.3);
  doc.rect(x - overhang, y, w + overhang * 2, rimH, 'FD');
  doc.rect(x, y + rimH, w, h - rimH, 'FD');
  doc.setFillColor(255, 255, 255);
  doc.rect(x + w * 0.18, y + 0.3, w * 0.12, h - 0.6, 'F');
}

/**
 * Draws a Mario Super Star emblem in pure vector geometry (zero emoji)
 */
export function drawVectorMarioStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  starRgb: RgbTuple = [253, 224, 71],
  borderRgb: RgbTuple = [180, 83, 9]
): void {
  const spikes = 5;
  const innerR = r * 0.42;
  doc.setFillColor(...starRgb);
  doc.setDrawColor(...borderRgb);
  doc.setLineWidth(0.25);

  // Fill star polygon using triangles from center
  for (let i = 0; i < spikes * 2; i++) {
    const angle1 = (i * Math.PI) / spikes - Math.PI / 2;
    const angle2 = ((i + 1) * Math.PI) / spikes - Math.PI / 2;
    const r1 = i % 2 === 0 ? r : innerR;
    const r2 = (i + 1) % 2 === 0 ? r : innerR;
    const x1 = cx + Math.cos(angle1) * r1;
    const y1 = cy + Math.sin(angle1) * r1;
    const x2 = cx + Math.cos(angle2) * r2;
    const y2 = cy + Math.sin(angle2) * r2;
    doc.triangle(cx, cy, x1, y1, x2, y2, 'F');
    doc.line(x1, y1, x2, y2);
  }

  // Draw iconic vertical Mario Star eyes
  doc.setFillColor(15, 23, 42);
  const eyeW = Math.max(0.25, r * 0.12);
  const eyeH = Math.max(0.6, r * 0.35);
  doc.rect(cx - r * 0.22, cy - eyeH * 0.45, eyeW, eyeH, 'F');
  doc.rect(cx + r * 0.1, cy - eyeH * 0.45, eyeW, eyeH, 'F');
}

/**
 * Draws a Mario Gold Coin in pure vector geometry (zero emoji)
 */
export function drawVectorMarioCoin(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number
): void {
  doc.setFillColor(250, 204, 21);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.2);
  doc.circle(cx, cy, r, 'FD');
  doc.setFillColor(234, 179, 8);
  doc.circle(cx, cy, r * 0.72, 'F');
  doc.setFillColor(254, 240, 138);
  doc.rect(cx - r * 0.16, cy - r * 0.52, r * 0.32, r * 1.04, 'F');
}

/**
 * Draws a Mario 1-Up / Super Mushroom in pure vector geometry (zero emoji)
 */
export function drawVectorMarioMushroom(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  capRgb: RgbTuple = [34, 197, 94],
  borderRgb: RgbTuple = [20, 83, 45]
): void {
  // Cap dome
  doc.setFillColor(...capRgb);
  doc.setDrawColor(...borderRgb);
  doc.setLineWidth(0.22);
  doc.circle(cx, cy - r * 0.15, r, 'FD');

  // Stem
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(...borderRgb);
  doc.rect(cx - r * 0.45, cy, r * 0.9, r * 0.65, 'FD');

  // Spots
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy - r * 0.3, r * 0.35, 'F');
  doc.circle(cx - r * 0.72, cy - r * 0.1, r * 0.22, 'F');
  doc.circle(cx + r * 0.72, cy - r * 0.1, r * 0.22, 'F');

  // Eyes
  doc.setFillColor(15, 23, 42);
  const eyeW = Math.max(0.2, r * 0.12);
  const eyeH = Math.max(0.4, r * 0.3);
  doc.rect(cx - r * 0.22, cy + r * 0.12, eyeW, eyeH, 'F');
  doc.rect(cx + r * 0.1, cy + r * 0.12, eyeW, eyeH, 'F');
}

/**
 * Draws a Mario Brick Strip header border in pure vector geometry (zero emoji)
 */
export function drawVectorMarioBrickStrip(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number = 2.0,
  brickRgb: RgbTuple = [185, 28, 28],
  mortarRgb: RgbTuple = [30, 20, 20]
): void {
  doc.setFillColor(...mortarRgb);
  doc.rect(x, y, w, h, 'F');
  const brickW = 6.0;
  const brickH = (h - 0.35) / 2;
  const numBricks = Math.ceil(w / brickW);
  doc.setFillColor(...brickRgb);
  for (let b = 0; b < numBricks; b++) {
    const bx = x + b * brickW;
    const bw = Math.min(brickW - 0.35, x + w - bx);
    if (bw > 0) doc.rect(bx, y, bw, brickH, 'F');
  }
  for (let b = -1; b < numBricks; b++) {
    const bx = x + b * brickW + brickW / 2;
    const startX = Math.max(x, bx);
    const endX = Math.min(x + w, bx + brickW - 0.35);
    if (endX > startX) doc.rect(startX, y + brickH + 0.35, endX - startX, brickH, 'F');
  }
}

export interface OnePageSummaryPdfOptions {
  candidateName?: string;
  dateLabel?: string;
  colorAccent?: string;
  fontStyle?: string;
  includeWatermark?: boolean;
  watermarkText?: string;
  loadedFont?: string;
  ttfBase64?: string;
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
  let ff = theme.fontFamily;
  if (options.ttfBase64 && options.loadedFont) {
    try {
      const vfsName = `${options.loadedFont}-Regular.ttf`;
      doc.addFileToVFS(vfsName, options.ttfBase64);
      doc.addFont(vfsName, options.loadedFont, 'normal');
      doc.addFont(vfsName, options.loadedFont, 'bold');
      doc.addFont(vfsName, options.loadedFont, 'italic');
      doc.addFont(vfsName, options.loadedFont, 'bolditalic');
      ff = options.loadedFont;
    } catch (e) {
      console.warn('Failed to embed TTF font in jsPDF:', e);
    }
  }
  const fp = theme.fontProfile;
  const fScale = Math.min(1.05, Math.max(0.85, fp.sizeScale));
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

  // Outer precision rounded card frame mirroring the preview's rounded-2xl border-2
  doc.setDrawColor(...theme.borderStrong);
  doc.setLineWidth(0.35);
  doc.roundedRect(marginX - 1.2, 5.5, contentW + 2.4, 285.0, 3.0, 3.0, 'D');

  // Header Box (y = 7.0 to 23.5, h = 16.5mm)
  if (theme.isInkSaver) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...theme.borderStrong);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginX, 7.0, contentW, 16.5, 2.0, 2.0, 'FD');
  } else {
    doc.setFillColor(...theme.primary);
    doc.roundedRect(marginX, 7.0, contentW, 16.5, 2.0, 2.0, 'F');
  }

  // Left: Gold square box with black border and Mario Super Star
  const goldBoxX = marginX + 2.5;
  const goldBoxY = 8.5;
  const goldBoxSize = 13.0;
  doc.setFillColor(251, 191, 36); // amber-400
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.roundedRect(goldBoxX, goldBoxY, goldBoxSize, goldBoxSize, 1.5, 1.5, 'FD');
  drawVectorMarioStar(doc, goldBoxX + goldBoxSize / 2, goldBoxY + goldBoxSize / 2, 4.5);

  // Next to gold box: 3-line editorial title exactly mirroring the preview
  const headTextX = goldBoxX + goldBoxSize + 3.5;
  const headTextMaxW = contentW - goldBoxSize - 58;

  // Kicker line
  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.kickerText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(6.0 * fScale);
  const kickerLabel = `PHILIPPINE LABOR STANDARDS · ONE-PAGE A4 MASTER SUMMARY · ${theme.id.toUpperCase().replace(/_/g, ' ')}`;
  doc.text(doc.splitTextToSize(kickerLabel, headTextMaxW)[0] || '', headTextX, 11.2);

  // Main Title
  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(10.2 * fScale);
  doc.text('KEY LEGAL FORMULAS, MULTIPLIERS & STATUTORY DEADLINES', headTextX, 15.8);

  // Subtitle / Statute list
  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : ([226, 232, 240] as RgbTuple)));
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(5.4 * fScale);
  const statuteSub = 'P.D. No. 442 (Labor Code, as amended), DOLE D.O. 174-17, R.A. 10361, R.A. 11210, R.A. 11360 & R.A. 11861';
  doc.text(doc.splitTextToSize(statuteSub, headTextMaxW)[0] || '', headTextX, 20.0);

  // Right Block: Candidate Name, Format & Updated date
  const rightMetaX = pageW - marginX - 3.0;
  let curMetaY = 11.2;
  if (candidate) {
    doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(6.8 * fScale);
    doc.text(candidate, rightMetaX, curMetaY, { align: 'right' });
    curMetaY += 4.0;
  }
  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : ([226, 232, 240] as RgbTuple)));
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(5.4 * fScale);
  doc.text(`Format: Single-Page A4 · ${fp.displayLabel}`, rightMetaX, curMetaY, { align: 'right' });
  curMetaY += 4.0;
  doc.text(`Updated: ${dateStr}`, rightMetaX, curMetaY, { align: 'right' });

  // ==================== TWO-COLUMN CORE GRID ====================
  const colStartY = 25.5;
  const colHeaderH = 6.2;
  const numFormulas = ONE_PAGE_LEGAL_FORMULAS.length;
  const numDeadlines = ONE_PAGE_LEGAL_DEADLINES.length;
  const rowH = 13.0;
  const colTotalItemsH = numFormulas * rowH;

  // Col 1 Header Banner
  doc.setFillColor(...theme.primary);
  doc.roundedRect(leftX, colStartY, colW, colHeaderH, 1.2, 1.2, 'F');
  drawVectorMarioCoinBlock(doc, leftX + 1.8, colStartY + 1.2, 3.8, theme.accent, theme.secondaryAccent);
  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(7.2 * fScale);
  doc.text(`I. KEY STATUTORY PAY FORMULAS (${numFormulas})`, leftX + 7.2, colStartY + 4.2);
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(5.8 * fScale);
  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.kickerText));
  doc.text('Arts. 87–97 · 302', leftX + colW - 2.0, colStartY + 4.2, { align: 'right' });

  // Col 1 Outer Rounded Container Box
  doc.setDrawColor(...theme.borderMuted);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftX, colStartY + colHeaderH + 0.4, colW, colTotalItemsH, 1.5, 1.5);

  let leftY = colStartY + colHeaderH + 0.4;
  ONE_PAGE_LEGAL_FORMULAS.forEach((item, idx) => {
    // Alternating zebra fill
    if (idx % 2 === 1) {
      doc.setFillColor(...theme.zebraFill);
      doc.rect(leftX + 0.2, leftY, colW - 0.4, rowH, 'F');
    }
    // Thin divider line between rows
    if (idx > 0) {
      doc.setDrawColor(...theme.borderMuted);
      doc.setLineWidth(0.15);
      doc.line(leftX, leftY, leftX + colW, leftY);
    }

    // Line 1: Title (bold) on left + Rate Badge on right
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(6.8 * fScale);
    const titleText = `${idx + 1}. ${item.title}`;
    const rBadge = item.rateBadge || item.citation;
    doc.text(titleText, leftX + 2.0, leftY + 3.8);
    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(6.4 * fScale);
    doc.text(rBadge, leftX + colW - 2.0, leftY + 3.8, { align: 'right' });

    // Line 2: Formula (accent bold text)
    doc.setTextColor(...theme.formulaText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(7.4 * fScale);
    const formulaLines = doc.splitTextToSize(sanitizePdfText(item.formula), colW - 4.0);
    doc.text(formulaLines[0] || '', leftX + 2.0, leftY + 7.6);

    // Line 3: Note (muted text)
    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(5.6 * fScale);
    const noteLines = doc.splitTextToSize(sanitizePdfText(item.note), colW - 4.0);
    doc.text(noteLines[0] || '', leftX + 2.0, leftY + 11.4);

    leftY += rowH;
  });

  // ==================== RIGHT COLUMN: PART II - DEADLINES ====================
  // Col 2 Header Banner
  doc.setFillColor(...theme.secondaryAccent);
  doc.roundedRect(rightX, colStartY, colW, colHeaderH, 1.2, 1.2, 'F');
  drawVectorMarioPipe(doc, rightX + 1.8, colStartY + 1.0, 4.4, 4.0);
  doc.setTextColor(...theme.primaryText);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(7.2 * fScale);
  doc.text(`II. PRESCRIPTIVE & PROCEDURAL DEADLINES (${numDeadlines})`, rightX + 7.4, colStartY + 4.2);
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(5.8 * fScale);
  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.kickerText));
  doc.text('Arts. 297–306', rightX + colW - 2.0, colStartY + 4.2, { align: 'right' });

  // Col 2 Outer Rounded Container Box
  doc.setDrawColor(...theme.borderMuted);
  doc.setLineWidth(0.25);
  doc.roundedRect(rightX, colStartY + colHeaderH + 0.4, colW, colTotalItemsH, 1.5, 1.5);

  let rightY = colStartY + colHeaderH + 0.4;
  ONE_PAGE_LEGAL_DEADLINES.forEach((item, idx) => {
    // Alternating zebra fill
    if (idx % 2 === 1) {
      doc.setFillColor(...theme.zebraFill);
      doc.rect(rightX + 0.2, rightY, colW - 0.4, rowH, 'F');
    }
    // Thin divider line between rows
    if (idx > 0) {
      doc.setDrawColor(...theme.borderMuted);
      doc.setLineWidth(0.15);
      doc.line(rightX, rightY, rightX + colW, rightY);
    }

    // Line 1: Claim/Action (bold) on left + Deadline on right
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(6.8 * fScale);
    const claimText = `${idx + 1}. ${item.claimOrAction}`;
    doc.text(claimText, rightX + 2.0, rightY + 3.8);
    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(6.4 * fScale);
    doc.text(item.deadline, rightX + colW - 2.0, rightY + 3.8, { align: 'right' });

    // Line 2 & 3: Citation + Reckoning Rule
    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(5.6 * fScale);
    const ruleLine = `${item.citation}: ${item.reckoningRule}`;
    const ruleLines = doc.splitTextToSize(sanitizePdfText(ruleLine), colW - 4.0);
    doc.text(ruleLines[0] || '', rightX + 2.0, rightY + 7.6);
    if (ruleLines[1]) {
      doc.text(ruleLines[1], rightX + 2.0, rightY + 11.4);
    }

    rightY += rowH;
  });

  // ==================== MARIO BRICK DIVIDER STRIP ====================
  const brickY = colStartY + colHeaderH + colTotalItemsH + 2.0;
  drawVectorMarioBrickStrip(doc, marginX, brickY, contentW, 1.8, theme.accent, theme.borderStrong);

  // ==================== PART III: BOTTOM WORLD 6 LEAVES & CORE CHECKPOINTS ====================
  const bottomY = brickY + 3.5;
  const bottomBoxH = 68.0;

  // Outer container card
  doc.setFillColor(...theme.cardTintFill);
  doc.setDrawColor(...theme.borderMuted);
  doc.setLineWidth(0.25);
  doc.roundedRect(marginX, bottomY, contentW, bottomBoxH, 1.8, 1.8, 'FD');

  // Header Banner
  doc.setFillColor(...theme.primary);
  doc.roundedRect(marginX, bottomY, contentW, 5.8, 1.2, 1.2, 'F');
  drawVectorMarioMushroom(doc, marginX + 3.5, bottomY + 2.9, 2.0);
  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(7.2 * fScale);
  doc.text('III. WORLD 6 STATUTORY LEAVE CAPS & CORE TESTS', marginX + 7.5, bottomY + 4.1);
  doc.setFont(ff, fp.subHeadingStyle);
  doc.setFontSize(5.8 * fScale);
  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.kickerText));
  doc.text('Arts. 95, 1146 · R.A. 11210', pageW - marginX - 2.5, bottomY + 4.1, { align: 'right' });

  // 6 Leave Cards in 3 Columns x 2 Rows
  const gridStartY = bottomY + 7.0;
  const leaveCardW = (contentW - 6.0) / 3; // ~62.6mm
  const leaveCardH = 17.0;

  ONE_PAGE_STATUTORY_LEAVE_CAPS.forEach((lv, idx) => {
    const colIdx = idx % 3;
    const rowIdx = Math.floor(idx / 3);
    const cx = marginX + 1.2 + colIdx * (leaveCardW + 1.8);
    const cy = gridStartY + rowIdx * (leaveCardH + 2.5);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.18);
    doc.roundedRect(cx, cy, leaveCardW, leaveCardH, 1.2, 1.2, 'FD');

    // Line 1: Leave Name (bold) on left + Cap in theme.badgeText on right
    doc.setTextColor(...theme.bodyText);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(6.8 * fScale);
    doc.text(lv.leaveName, cx + 2.0, cy + 4.5);

    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(6.8 * fScale);
    doc.text(lv.cap, cx + leaveCardW - 2.0, cy + 4.5, { align: 'right' });

    // Line 2 & 3: Citation · Rule
    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.bodyStyle);
    doc.setFontSize(5.8 * fScale);
    const lvInfo = `${lv.citation} · ${lv.rule}`;
    const lvLines = doc.splitTextToSize(sanitizePdfText(lvInfo), leaveCardW - 4.0);
    doc.text(lvLines[0] || '', cx + 2.0, cy + 8.8);
    if (lvLines[1]) {
      doc.text(lvLines[1], cx + 2.0, cy + 13.2);
    }
  });

  // Core Workplace Checkpoints (Four-Fold Test + Nominal Damages + In Dubio Pro Operario)
  const checkY = gridStartY + 2 * (leaveCardH + 2.5) + 1.5;
  doc.setFillColor(...theme.zebraFill);
  doc.setDrawColor(...theme.borderStrong);
  doc.setLineWidth(0.22);
  doc.roundedRect(marginX + 1.2, checkY, contentW - 2.4, 18.0, 1.2, 1.2, 'FD');

  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(6.2 * fScale);
  doc.text(
    'FOUR-FOLD CONTROL TEST: (1) Selection/Engagement, (2) Payment of Wages, (3) Power of Dismissal, (4) Power of Control over means & methods (Most Crucial).',
    marginX + 2.8,
    checkY + 4.8
  );
  doc.text(
    'NOMINAL DAMAGES (AGABON / JAKA DOCTRINE): Valid Just Cause + defective Twin-Notice = PHP 30,000  |  Valid Authorized Cause + defective 30d Notice = PHP 50,000.',
    marginX + 2.8,
    checkY + 9.8
  );
  doc.setFont(ff, ff === 'courier' ? fp.bodyStyle : 'italic');
  doc.setFontSize(6.0 * fScale);
  doc.setTextColor(...theme.mutedText);
  doc.text(
    'IN DUBIO PRO OPERARIO: All doubts in statutory interpretation are resolved in favor of the working class (Art. 4, Labor Code).',
    marginX + 2.8,
    checkY + 14.8
  );

  // ==================== RESEARCH COHORT ATTRIBUTION BAR ====================
  const footerY = bottomY + bottomBoxH + 3.0;
  doc.setFillColor(...theme.cardTintFill);
  doc.setDrawColor(...theme.borderMuted);
  doc.setLineWidth(0.22);
  doc.roundedRect(marginX, footerY, contentW, 16.0, 1.4, 1.4, 'FD');

  // Top sub-line: Gold star badge + Typeface on right
  doc.setFillColor(251, 191, 36); // amber-400
  doc.setDrawColor(217, 119, 6);
  doc.roundedRect(marginX + 2.2, footerY + 1.5, 42, 4.5, 0.8, 0.8, 'FD');
  drawVectorMarioStar(doc, marginX + 4.2, footerY + 3.8, 1.4);
  doc.setTextColor(120, 53, 15);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(6.4 * fScale);
  doc.text('Research Cohort · 9 Members', marginX + 6.8, footerY + 4.6);

  doc.setTextColor(...theme.mutedText);
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(6.2 * fScale);
  doc.text(`P.D. No. 442 Master Summary · ${fp.displayLabel}`, pageW - marginX - 2.8, footerY + 4.6, { align: 'right' });

  // Bottom sub-line: 9 members list
  doc.setTextColor(...theme.bodyText);
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(6.8 * fScale);
  doc.text('CORPUZ (Main Creator)', marginX + 2.8, footerY + 11.2);

  doc.setFont(ff, fp.bodyStyle);
  doc.setTextColor(...theme.mutedText);
  doc.setFontSize(6.6 * fScale);
  const cohortRest = '· CRUZ · FANGED · FERNANDEZ · GARCIA · GARVIDA · MAÑALAC · UNTALAN · VILA';
  doc.text(cohortRest, marginX + 38.0, footerY + 11.2);

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
  loadedFont?: string;
  ttfBase64?: string;
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
  let ff = theme.fontFamily;
  if (params.ttfBase64 && params.loadedFont) {
    try {
      const vfsName = `${params.loadedFont}-Regular.ttf`;
      doc.addFileToVFS(vfsName, params.ttfBase64);
      doc.addFont(vfsName, params.loadedFont, 'normal');
      doc.addFont(vfsName, params.loadedFont, 'bold');
      doc.addFont(vfsName, params.loadedFont, 'italic');
      doc.addFont(vfsName, params.loadedFont, 'bolditalic');
      ff = params.loadedFont;
    } catch (e) {
      console.warn('Failed to embed TTF in jsPDF:', e);
    }
  }
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
  corners.forEach(([cx, cy]) => {
    drawVectorMarioStar(doc, cx, cy, 3.8, [253, 224, 71], [180, 83, 9]);
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
    let recSize = (recipient.length > 36 ? 16 : recipient.length > 24 ? 18.5 : 21.5) * cScale;
    doc.setFontSize(recSize);
    while (doc.getTextWidth(recipient) > (W - 46) && recSize > 12) {
      recSize -= 0.6;
      doc.setFontSize(recSize);
    }
    const recLines = doc.splitTextToSize(recipient, W - 46);
    const recStartY = recLines.length > 1 ? 88.5 : 91;
    doc.text(recLines, W / 2, recStartY, { align: 'center', lineHeightFactor: 1.18 });

    doc.setDrawColor(...theme.primary);
    doc.setLineWidth(0.5);
    doc.line(34, 95.5, W - 34, 95.5);

    doc.setTextColor(...theme.badgeText);
    doc.setFont(ff, fp.headingStyle);
    let honorsSize = 9.5 * cScale;
    doc.setFontSize(honorsSize);
    while (doc.getTextWidth(honors.toUpperCase()) > (W - 46) && honorsSize > 7.0) {
      honorsSize -= 0.4;
      doc.setFontSize(honorsSize);
    }
    const honorsLines = doc.splitTextToSize(honors.toUpperCase(), W - 46);
    doc.text(honorsLines, W / 2, 104, { align: 'center', lineHeightFactor: 1.15 });

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
  let recLandSize = (recipient.length > 40 ? 17 : recipient.length > 26 ? 20.5 : 24) * cScale;
  doc.setFontSize(recLandSize);
  while (doc.getTextWidth(recipient) > (W - 68) && recLandSize > 13) {
    recLandSize -= 0.6;
    doc.setFontSize(recLandSize);
  }
  const recLandLines = doc.splitTextToSize(recipient, W - 68);
  const startLandY = recLandLines.length > 1 ? 72.0 : 74.5;
  doc.text(recLandLines, W / 2, startLandY, { align: 'center', lineHeightFactor: 1.18 });

  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.5);
  doc.line(64, 78.5, W - 64, 78.5);

  doc.setTextColor(...theme.badgeText);
  doc.setFont(ff, fp.headingStyle);
  let honorsLandSize = 10 * cScale;
  doc.setFontSize(honorsLandSize);
  while (doc.getTextWidth(honors.toUpperCase()) > (W - 68) && honorsLandSize > 7.2) {
    honorsLandSize -= 0.4;
    doc.setFontSize(honorsLandSize);
  }
  const honorsLandLines = doc.splitTextToSize(honors.toUpperCase(), W - 68);
  doc.text(honorsLandLines, W / 2, 85.8, { align: 'center', lineHeightFactor: 1.15 });

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
  let dff = dipTheme.fontFamily;
  if (params.ttfBase64 && params.loadedFont) {
    try {
      const vfsName = `${params.loadedFont}-Regular.ttf`;
      doc.addFileToVFS(vfsName, params.ttfBase64);
      doc.addFont(vfsName, params.loadedFont, 'normal');
      doc.addFont(vfsName, params.loadedFont, 'bold');
      doc.addFont(vfsName, params.loadedFont, 'italic');
      doc.addFont(vfsName, params.loadedFont, 'bolditalic');
      dff = params.loadedFont;
    } catch (e) {
      console.warn('Failed to embed TTF in jsPDF:', e);
    }
  }
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
    let dRecSize = (recipient.length > 36 ? 16 : recipient.length > 24 ? 19 : 23) * dScale;
    doc.setFontSize(dRecSize);
    while (doc.getTextWidth(recipient) > (W - 46) && dRecSize > 12) {
      dRecSize -= 0.5;
      doc.setFontSize(dRecSize);
    }
    const recLines = doc.splitTextToSize(recipient, W - 46);
    const recY = recLines.length > 1 ? 79.5 : 82;
    doc.text(recLines, W / 2, recY, { align: 'center', lineHeightFactor: 1.15 });
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
  let dLandSize = (recipient.length > 38 ? 17 : recipient.length > 26 ? 20.5 : 24) * dScale;
  doc.setFontSize(dLandSize);
  while (doc.getTextWidth(recipient) > (W - 68) && dLandSize > 13) {
    dLandSize -= 0.5;
    doc.setFontSize(dLandSize);
  }
  const recLandLines = doc.splitTextToSize(recipient, W - 68);
  const recLandY = recLandLines.length > 1 ? 75.0 : 77.5;
  doc.text(recLandLines, W / 2, recLandY, { align: 'center', lineHeightFactor: 1.15 });
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
  includeExecutiveMarioSummary?: boolean;
  includeLatinMaxims?: boolean;
  loadedFont?: string;
  ttfBase64?: string;
}

/**
 * Calculates the exact height (in millimeters) needed to render a topic module card
 * so we can determine whether it fits on the current page before starting to draw.
 */
function computeTopicModuleHeight(
  doc: jsPDF,
  topic: LawTopic,
  ff: string,
  fp: PdfFontProfile,
  scale: number,
  contentW: number,
  params: StudyGuideReviewerPdfParams
): number {
  const cardPadX = 2.5;
  const innerW = contentW - cardPadX * 2;
  let h = 5.2; // card top & bottom padding

  // 1. Header: statutory basis + title + status
  if (params.includeLegalCitations !== false && topic.badge) {
    h += 3.6;
  }
  const titleW = innerW - 28;
  const checkPrefix = params.includeCheckboxes !== false ? '[ ] ' : '';
  const fullTitleStr = `${checkPrefix}${topic.title}`;
  const tLines = doc.splitTextToSize(sanitizePdfText(fullTitleStr), titleW);
  h += tLines.length * (4.6 * scale) + 1.4;
  h += 2.2; // divider line

  // 2. Mario Executive Takeaway
  if (!params.matricesOnlyMode && params.includeExecutiveMarioSummary !== false && topic.beginnerSummary) {
    const takeText = `MARIO EXECUTIVE TAKEAWAY: ${cleanRuleText(topic.beginnerSummary)}`;
    const takeLines = doc.splitTextToSize(sanitizePdfText(takeText), innerW - 8.0);
    h += takeLines.length * (3.9 * scale) + 4.5 + 2.2;
  }

  // 3. Core Rule Summary
  if (!params.matricesOnlyMode && topic.summary) {
    const sumLines = doc.splitTextToSize(sanitizePdfText(cleanRuleText(topic.summary)), innerW - 18);
    h += sumLines.length * (3.9 * scale) + 2.4;
  }

  // 4. Controlling Jurisprudence
  if (
    !params.matricesOnlyMode &&
    params.includeLegalCitations !== false &&
    topic.keyDoctrines &&
    topic.keyDoctrines.length > 0
  ) {
    let jurLinesCount = 0;
    topic.keyDoctrines.forEach((d) => {
      jurLinesCount += doc.splitTextToSize(sanitizePdfText(`• ${cleanRuleText(d)}`), innerW - 6.0).length;
    });
    h += 5.6 + jurLinesCount * (3.8 * scale) + 2.2;
  }

  // 5. Codified Rules
  const rules = params.matricesOnlyMode
    ? topic.rules.filter((r) => Boolean(r.tableData))
    : topic.rules;

  rules.forEach((rule, rIdx) => {
    const rHead = doc.splitTextToSize(
      sanitizePdfText(`${rIdx + 1}. ${cleanRuleText(rule.heading)}`),
      innerW
    );
    h += rHead.length * (4.2 * scale) + 1.2;

    if (!params.matricesOnlyMode && rule.description) {
      const descLines = doc.splitTextToSize(
        sanitizePdfText(cleanRuleText(rule.description)),
        innerW - 4.0
      );
      h += descLines.length * (3.9 * scale) + 1.2;
    }

    if (!params.matricesOnlyMode && rule.items && rule.items.length > 0) {
      rule.items.forEach((it) => {
        const entry = parseListEntry(it);
        const itStr = entry.isNumbered ? `${entry.marker} ${entry.text}` : `• ${entry.text}`;
        const itLines = doc.splitTextToSize(
          sanitizePdfText(itStr),
          innerW - 6.0
        );
        h += itLines.length * (3.8 * scale) + 0.8;
      });
    }

    if (!params.matricesOnlyMode && rule.subSections && rule.subSections.length > 0) {
      rule.subSections.forEach((sub) => {
        const subTitle = doc.splitTextToSize(sanitizePdfText(cleanRuleText(sub.title)), innerW - 6.0);
        h += subTitle.length * (4.0 * scale) + 1.0;
        sub.items.forEach((si) => {
          const entry = parseListEntry(si);
          const siStr = entry.isNumbered ? `${entry.marker} ${entry.text}` : `• ${entry.text}`;
          const siLines = doc.splitTextToSize(sanitizePdfText(siStr), innerW - 8.0);
          h += siLines.length * (3.8 * scale) + 0.6;
        });
      });
    }

    if (rule.tableData) {
      const cellPadY = 1.8;
      const lineH = 3.8 * scale;
      // Budget for wrapped multi-line cells in embedded tables
      h += (rule.tableData.rows.length + 1) * (lineH * 2.2 + cellPadY * 2) + 4.0;
    }
  });

  // 6. Statutory Exceptions
  if (!params.matricesOnlyMode && topic.exceptions && topic.exceptions.length > 0) {
    let exLinesCount = 0;
    topic.exceptions.forEach((ex) => {
      exLinesCount += doc.splitTextToSize(sanitizePdfText(`General Rule: ${cleanRuleText(ex.generalRule)}`), innerW - 6.0).length;
      ex.exceptions.forEach((eItem) => {
        exLinesCount += doc.splitTextToSize(sanitizePdfText(`• Exception: ${cleanRuleText(eItem)}`), innerW - 8.0).length;
      });
    });
    h += 5.8 + exLinesCount * (3.8 * scale) + 2.2;
  }

  // 7. Memory Traps & High-Yield Takeaways
  if (!params.matricesOnlyMode && params.includeBarTips !== false) {
    const combinedTips = [...(topic.barTips || []), ...(topic.keyTips || [])];
    if (combinedTips.length > 0 || topic.practicalTakeaway) {
      let tipLinesCount = 0;
      combinedTips.slice(0, 4).forEach((t) => {
        tipLinesCount += doc.splitTextToSize(sanitizePdfText(`• ${cleanRuleText(t)}`), innerW - 8.0).length;
      });
      const pLines = topic.practicalTakeaway
        ? doc.splitTextToSize(sanitizePdfText(`Practical Application: ${cleanRuleText(topic.practicalTakeaway)}`), innerW - 8.0)
        : [];
      h += 6.0 + (tipLinesCount + pLines.length) * (3.8 * scale) + (pLines.length > 0 ? 1.5 : 0) + 2.2;
    }
  }

  // 8. Blank Note Lines
  if (params.blankNoteLinesCount && params.blankNoteLinesCount > 0) {
    const linesCount = Math.min(10, params.blankNoteLinesCount);
    h += 4.0 + linesCount * 5.0 + 1.0;
  }

  return h;
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

  const activeTopics: LawTopic[] =
    params.topics && params.topics.length > 0 ? params.topics : ALL_LAW_TOPICS;
  const completedIds: string[] = params.completedTopicIds || [];

  const theme = resolvePdfThemeAndFont(params.colorAccent, params.fontStyle);
  let ff = theme.fontFamily;
  if (params.ttfBase64 && params.loadedFont) {
    try {
      const vfsName = `${params.loadedFont}-Regular.ttf`;
      doc.addFileToVFS(vfsName, params.ttfBase64);
      doc.addFont(vfsName, params.loadedFont, 'normal');
      doc.addFont(vfsName, params.loadedFont, 'bold');
      doc.addFont(vfsName, params.loadedFont, 'italic');
      doc.addFont(vfsName, params.loadedFont, 'bolditalic');
      ff = params.loadedFont;
    } catch (e) {
      console.warn('Failed to embed TTF in jsPDF:', e);
    }
  }
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
    const isWorldBanner = title.toUpperCase().startsWith('WORLD');
    if (isWorldBanner && !theme.isInkSaver) {
      drawVectorMarioStar(doc, marginX + 4.2, y + 3.6, 2.3, [253, 224, 71], [180, 83, 9]);
    }
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(9.6 * scale);
    const maxTitleW = rightTag ? contentW - 46 : contentW - 8;
    const clampedTitle = doc.splitTextToSize(sanitizePdfText(title), maxTitleW)[0] || '';
    const textStartX = isWorldBanner && !theme.isInkSaver ? marginX + 8.2 : marginX + 2.5;
    doc.text(clampedTitle, textStartX, y + 4.9);
    if (rightTag) {
      doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : theme.primaryText));
      doc.setFont(ff, fp.subHeadingStyle);
      doc.setFontSize(7.6 * scale);
      doc.text(sanitizePdfText(rightTag), pageW - marginX - 2.5, y + 4.9, { align: 'right' });
    }
    y += 9.8;
  };

  /**
   * Draws a clean, multi-line wrapped table with exact column proportions,
   * proper alignments, robust word wrapping (no overflow), zebra rows,
   * and clean multi-page continuation.
   * Returns the ending Y coordinate.
   */
  const drawWrappedTable = (
    headers: string[],
    rows: string[][],
    colFractions?: number[],
    startX: number = marginX,
    tableWidth: number = contentW,
    initialY?: number,
    colAlignments?: ('left' | 'center' | 'right')[]
  ): number => {
    if (headers.length === 0) return initialY ?? y;
    let tableY = initialY !== undefined ? initialY : y;
    const colCount = headers.length;
    const fractions =
      colFractions && colFractions.length === colCount
        ? colFractions
        : colCount === 2
        ? [0.34, 0.66]
        : colCount === 3
        ? [0.28, 0.36, 0.36]
        : colCount === 4
        ? [0.24, 0.26, 0.22, 0.28]
        : colCount === 5
        ? [0.24, 0.18, 0.19, 0.19, 0.20]
        : Array.from({ length: colCount }, () => 1 / colCount);

    const colWidths = fractions.map((f) => f * tableWidth);
    const cellPadX = 2.2;
    const cellPadY = 1.8;
    const fontSz = 7.6 * scale;
    const lineH = 3.8 * scale;

    const renderRow = (cells: string[], isHeader: boolean, rowIdx: number) => {
      doc.setFont(ff, isHeader ? fp.headingStyle : fp.bodyStyle);
      doc.setFontSize(fontSz);

      const wrappedCells = colWidths.map((cw, cIdx) => {
        const txt = sanitizePdfText(cells[cIdx] || '');
        const maxW = Math.max(6, cw - cellPadX * 2);
        // Break any unbroken token longer than 18 chars to prevent horizontal clipping
        const safeTxt = txt.replace(/(\S{18})/g, '$1 ');
        return doc.splitTextToSize(safeTxt, maxW);
      });
      const maxLines = Math.max(1, ...wrappedCells.map((lines) => lines.length));
      const rowH = maxLines * lineH + cellPadY * 2;

      if (tableY + rowH + 1 > pageH - marginBottom) {
        addThemedPage();
        tableY = marginTop;
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
      doc.setLineWidth(0.2);
      doc.rect(startX, tableY, tableWidth, rowH, 'FD');

      let curX = startX;
      colWidths.forEach((cw, cIdx) => {
        if (cIdx > 0) {
          doc.line(curX, tableY, curX, tableY + rowH);
        }
        doc.setTextColor(...(isHeader ? theme.badgeText : theme.bodyText));
        doc.setFont(
          ff,
          isHeader ? fp.headingStyle : cIdx === 0 ? fp.subHeadingStyle : fp.bodyStyle
        );
        doc.setFontSize(fontSz);

        const align = isHeader ? 'left' : colAlignments?.[cIdx] || 'left';
        const cellLines = wrappedCells[cIdx];
        cellLines.forEach((cline, lIdx) => {
          const textY = tableY + cellPadY + (lIdx + 0.82) * lineH;
          if (align === 'right') {
            doc.text(cline, curX + cw - cellPadX, textY, { align: 'right' });
          } else if (align === 'center') {
            doc.text(cline, curX + cw / 2, textY, { align: 'center' });
          } else {
            doc.text(cline, curX + cellPadX, textY);
          }
        });
        curX += cw;
      });

      tableY += rowH;
    };

    renderRow(headers, true, 0);
    rows.forEach((r, idx) => renderRow(r, false, idx));
    tableY += 3.0;

    // Sync global y if this was called from the top-level sections
    if (initialY === undefined) {
      y = tableY;
    }
    return tableY;
  };

  // Masthead (y = marginTop to marginTop + 21.0)
  if (theme.isInkSaver) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...theme.borderStrong);
    doc.setLineWidth(0.6);
    doc.roundedRect(marginX, y, contentW, 21.0, 2.0, 2.0, 'FD');
    doc.setTextColor(...theme.bodyText);
  } else {
    doc.setFillColor(...theme.primary);
    doc.roundedRect(marginX, y, contentW, 21.0, 2.0, 2.0, 'F');
    doc.setTextColor(...theme.kickerText);
  }

  // Pure Vector Mario Elements in Reviewer Masthead (Zero Emoji / 100% Vector Art)
  if (!theme.isInkSaver) {
    drawVectorMarioCoinBlock(doc, marginX + 3.0, y + 4.5, 11.5, theme.accent, theme.secondaryAccent);
    drawVectorMarioStar(doc, pageW - marginX - 9.0, y + 10.2, 5.5, [253, 224, 71], [180, 83, 9]);
    drawVectorMarioBrickStrip(doc, marginX, y + 21.0, contentW, 1.8, theme.accent, theme.borderStrong);
  }

  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(7.2 * scale);
  doc.text(
    `PHILIPPINE LABOR CODE • P.D. NO. 442 • ${theme.id.toUpperCase().replace(/_/g, ' ')} • ${fp.displayLabel.toUpperCase()}`,
    pageW / 2,
    y + 5.2,
    { align: 'center' }
  );

  doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
  doc.setFont(ff, fp.headingStyle);
  doc.setFontSize(12.5 * scale);
  doc.text('Philippine Labor Standards & Statutory Welfare Reviewer', pageW / 2, y + 11.5, {
    align: 'center',
  });

  doc.setTextColor(...(theme.isInkSaver ? theme.mutedText : ([226, 232, 240] as RgbTuple)));
  doc.setFont(ff, fp.bodyStyle);
  doc.setFontSize(6.2 * scale);
  const coverSub = params.candidateName
    ? `Prepared for Examinee: ${sanitizePdfText(params.candidateName)}  |  Modules: ${activeTopics.length}  |  Typeface: ${fp.displayLabel}  |  Matthew Cesar Corpuz`
    : `Complete Six-World Memory Aid  |  Modules: ${activeTopics.length}  |  Typeface: ${fp.displayLabel}  |  Matthew Cesar Corpuz`;
  doc.text(doc.splitTextToSize(coverSub, contentW - 28)[0] || '', pageW / 2, y + 16.5, { align: 'center' });
  doc.text(`Created by Matthew (Matthew Cesar Corpuz — Main Creator)  ·  Active Modules: ${activeTopics.length}`, pageW / 2, y + 19.8, { align: 'center' });

  y += 25.0;

  // Group Members Attribution — Pristine 3-Column Roster (Zero Split Names / Never Cropped)
  if (params.includeGroupMembers !== false) {
    const boxH = 26.0;
    ensureSpace(boxH + 4);
    // Outer card
    doc.setFillColor(...theme.cardTintFill);
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.25);
    doc.roundedRect(marginX, y, contentW, boxH, 1.8, 1.8, 'FD');

    // Header strip
    doc.setFillColor(...theme.primary);
    doc.roundedRect(marginX, y, contentW, 5.5, 1.2, 1.2, 'F');
    drawVectorMarioStar(doc, marginX + 3.2, y + 2.8, 1.4);
    doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(7.2 * scale);
    doc.text(
      'SUPER MARIO LABOR STANDARDS AID  -  RESEARCH & DEVELOPMENT COHORT',
      marginX + 6.8,
      y + 3.8
    );
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(6.2 * scale);
    doc.text(
      '9 RESEARCHERS  |  MAIN CREATOR: MATTHEW CESAR CORPUZ',
      pageW - marginX - 3.5,
      y + 3.8,
      { align: 'right' }
    );

    // 3 balanced columns with pills
    const colStepW = (contentW - 6.0) / 3;
    const itemH = 6.0;
    const startRowY = y + 7.2;

    GROUP_MEMBERS.forEach((member, idx) => {
      const colIdx = Math.floor(idx / 3);
      const rowIdx = idx % 3;
      const memX = marginX + 1.5 + colIdx * (colStepW + 1.5);
      const memY = startRowY + rowIdx * itemH;

      // Pill background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...theme.borderMuted);
      doc.setLineWidth(0.18);
      doc.roundedRect(memX, memY, colStepW, 5.2, 1.0, 1.0, 'FD');

      // Gold circle number badge
      doc.setFillColor(251, 191, 36);
      doc.setDrawColor(217, 119, 6);
      doc.circle(memX + 3.2, memY + 2.6, 1.8, 'FD');
      doc.setTextColor(120, 53, 15);
      doc.setFont(ff, fp.headingStyle);
      doc.setFontSize(5.2 * scale);
      doc.text(String(idx + 1), memX + 3.2, memY + 3.3, { align: 'center' });

      // Member name
      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, idx === 0 ? fp.headingStyle : fp.bodyStyle);
      doc.setFontSize(idx === 0 ? 6.8 * scale : 6.4 * scale);
      doc.text(sanitizePdfText(member), memX + 6.2, memY + 3.4);

      // Lead badge for member #1 (CORPUZ)
      if (idx === 0) {
        doc.setFillColor(209, 250, 229);
        doc.setDrawColor(16, 185, 129);
        doc.roundedRect(memX + colStepW - 14.0, memY + 1.0, 12.5, 3.2, 0.6, 0.6, 'FD');
        drawVectorMarioStar(doc, memX + colStepW - 12.5, memY + 2.6, 0.9);
        doc.setTextColor(6, 95, 70);
        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(4.6 * scale);
        doc.text('Lead', memX + colStepW - 10.6, memY + 3.1);
      }
    });

    y += boxH + 3.5;
  }

  // Mastery Progress Summary
  if (params.includeProgress !== false) {
    const checkH = 22.0;
    ensureSpace(checkH + 4);
    doc.setFillColor(...theme.cardTintFill);
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.25);
    doc.roundedRect(marginX, y, contentW, checkH, 1.8, 1.8, 'FD');

    // Header banner
    doc.setFillColor(...theme.primary);
    doc.roundedRect(marginX, y, contentW, 5.5, 1.2, 1.2, 'F');
    drawVectorMarioCoinBlock(doc, marginX + 2.5, y + 1.0, 3.5, theme.accent, theme.secondaryAccent);
    doc.setTextColor(...(theme.isInkSaver ? theme.bodyText : theme.primaryText));
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(7.2 * scale);
    doc.text('SIX-WORLD STATUTORY MASTERY CHECKLIST', marginX + 6.8, y + 3.8);

    const completedRatio = `${completedIds.length} / ${ALL_LAW_TOPICS.length} Modules`;
    const pct = Math.round((completedIds.length / ALL_LAW_TOPICS.length) * 100);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(6.2 * scale);
    doc.text(`Mastered: ${completedRatio} (${pct}%)`, pageW - marginX - 3.5, y + 3.8, { align: 'right' });

    // 6 boxes in 3 columns x 2 rows
    const wBoxW = (contentW - 6.0) / 3;
    const wBoxH = 6.8;
    const wStartY = y + 7.0;

    WORLDS_METADATA.forEach((w, wIdx) => {
      const colIdx = wIdx % 3;
      const rowIdx = Math.floor(wIdx / 3);
      const bx = marginX + 1.5 + colIdx * (wBoxW + 1.5);
      const by = wStartY + rowIdx * (wBoxH + 1.2);

      const wTopics = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
      const done = wTopics.filter((t) => completedIds.includes(t.id)).length;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...theme.borderMuted);
      doc.setLineWidth(0.18);
      doc.roundedRect(bx, by, wBoxW, wBoxH, 1.0, 1.0, 'FD');

      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, fp.headingStyle);
      doc.setFontSize(6.0 * scale);
      doc.text(`W${w.worldNumber}: ${w.shortTitle}`, bx + 2.0, by + 3.0);

      doc.setTextColor(...theme.mutedText);
      doc.setFont(ff, fp.bodyStyle);
      doc.setFontSize(5.2 * scale);
      doc.text(`${done}/${wTopics.length} mastered`, bx + 2.0, by + 5.5);
    });

    y += checkH + 3.5;
  }

  // Optional Quick Formulas & Checkpoints Summary Box
  if (
    params.includeFormulasCheatSheet ||
    params.includeFourFoldControlTest ||
    params.includeTwoNoticeChecklist ||
    params.includeRetirementFormulaBox ||
    params.includeLatinMaxims
  ) {
    writeSectionHeading('CORE STATUTORY FORMULAS & JURISPRUDENCE CHECKPOINTS');
    const panelItems: Array<{ title: string; subtitle: string; content: string[] }> = [];

    if (params.includeFourFoldControlTest) {
      panelItems.push({
        title: 'Four-Fold Employer-Employee Test',
        subtitle: 'Calamba Medical v. CIR',
        content: [
          '1. Selection & Engagement of the worker',
          '2. Payment of Wages or statutory remuneration',
          '3. Power of Dismissal or disciplinary sanction',
          '4. Power of Control over means & methods (Most Critical Test!)',
        ],
      });
    }

    if (params.includeTwoNoticeChecklist) {
      panelItems.push({
        title: 'Two-Notice Rule Statutory Due Process',
        subtitle: 'King of Kings / Agabon Doctrine',
        content: [
          '1st Notice: Specific charges + min 5 calendar days to explain',
          'Hearing / Conference: Ample opportunity to defend with assistance',
          '2nd Notice: Decision stating specific grounds proven for termination',
          'Sanction: P30,000 nominal damages (just cause) / P50,000 (authorized cause)',
        ],
      });
    }

    if (params.includeRetirementFormulaBox) {
      panelItems.push({
        title: 'Art. 302 Retirement 22.5-Day Formula',
        subtitle: 'Capitol Wireless Doctrine',
        content: [
          'Statutory 1/2 month = 15d basic + 5d SIL + 2.5d (1/12th 13th month)',
          '= 22.5 days per year of service (>=6 mos fraction = 1 whole year)',
          'Eligibility: Optional at age 60, compulsory at 65; min 5 years service',
        ],
      });
    }

    if (params.includeLatinMaxims) {
      panelItems.push({
        title: 'Constitutional Doctrines & Latin Maxims',
        subtitle: 'Art. 4, Labor Code',
        content: [
          'In dubio pro operario: Doubts in statutory construction resolved in favor of labor',
          'Principle of Non-Diminution: Vested employer benefits cannot be unilaterally withdrawn',
          'Salus populi est suprema lex: Labor standards are police power social justice protections',
        ],
      });
    }

    // Render panels in 2 columns
    const panW = (contentW - 3.0) / 2;
    for (let pIdx = 0; pIdx < panelItems.length; pIdx += 2) {
      const p1 = panelItems[pIdx];
      const p2 = panelItems[pIdx + 1];
      const p1H = 9.0 + p1.content.length * (3.1 * scale);
      const p2H = p2 ? 9.0 + p2.content.length * (3.1 * scale) : 0;
      const rowBoxH = Math.max(p1H, p2H);
      ensureSpace(rowBoxH + 3.0);

      const renderPanelCard = (p: typeof p1, px: number) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...theme.borderMuted);
        doc.setLineWidth(0.2);
        doc.roundedRect(px, y, panW, rowBoxH, 1.2, 1.2, 'FD');

        doc.setTextColor(...theme.bodyText);
        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(6.8 * scale);
        doc.text(p.title, px + 2.2, y + 3.6);

        doc.setTextColor(...theme.mutedText);
        doc.setFont(ff, fp.subHeadingStyle);
        doc.setFontSize(5.5 * scale);
        doc.text(p.subtitle, px + panW - 2.2, y + 3.6, { align: 'right' });

        doc.setDrawColor(...theme.borderMuted);
        doc.setLineWidth(0.12);
        doc.line(px + 1.5, y + 4.8, px + panW - 1.5, y + 4.8);

        let curPy = y + 7.6;
        p.content.forEach((cLine) => {
          doc.setTextColor(...theme.bodyText);
          doc.setFont(ff, fp.bodyStyle);
          doc.setFontSize(5.8 * scale);
          const cLines = doc.splitTextToSize(sanitizePdfText(cLine), panW - 4.4);
          doc.text(cLines, px + 2.2, curPy);
          curPy += cLines.length * (3.0 * scale);
        });
      };

      renderPanelCard(p1, marginX);
      if (p2) {
        renderPanelCard(p2, marginX + panW + 3.0);
      }
      y += rowBoxH + 3.0;
    }
    y += 2.0;
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

  // I. Statutory Pay Multiplier Matrix (4 columns matching web preview with right-aligned rates)
  if (params.includeMultipliers !== false) {
    writeSectionHeading('I. STATUTORY PAY MULTIPLIER MATRIX (DOLE BWC)', 'Arts. 86, 87, 93-94');
    const multRows = LABOR_BENEFITS_MULTIPLIER_LIST.map((row) => {
      const pct = `${(row.multiplierDecimal * 100).toFixed(1).replace(/\.0$/, '')}%`;
      return [row.benefit, row.scenario, pct, row.formula];
    });
    drawWrappedTable(
      ['Benefit Category', 'Scenario / Day Type', 'Rate', 'Statutory Formula'],
      multRows,
      [0.22, 0.33, 0.13, 0.32],
      marginX,
      contentW,
      undefined,
      ['left', 'left', 'right', 'left']
    );
  }

  // II. 17 Regions Minimum Wage Matrix (5 columns matching web preview with right-aligned rates)
  if (params.includeRegionalWages !== false) {
    writeSectionHeading('II. 17 REGIONS MINIMUM WAGE & KASAMBAHAY MATRIX', 'R.A. 6727 & R.A. 10361');
    const wageRows = REGIONAL_MINIMUM_WAGES.map((rw, idx) => {
      const kas = KASAMBAHAY_MINIMUM_WAGES[idx];
      return [rw.region, rw.effectivity, rw.nonAgri, rw.agri, kas ? kas.minimumWage : '—'];
    });
    drawWrappedTable(
      ['Region', 'Effectivity', 'Non-Agriculture', 'Agriculture', 'Kasambahay / Mo.'],
      wageRows,
      [0.26, 0.18, 0.19, 0.19, 0.18],
      marginX,
      contentW,
      undefined,
      ['left', 'left', 'right', 'right', 'right']
    );
  }

  // III. World 6 Statutory Leaves Master Matrix (5 columns matching web preview)
  if (params.includeLeavesMatrix !== false) {
    writeSectionHeading('III. WORLD 6 STATUTORY LEAVES COMPARISON MATRIX', 'Art. 95 & Special Laws');
    const leaveRows = STATUTORY_LEAVES_MASTER_ROWS.map((lv) => [
      lv.leave,
      params.includeLegalCitations !== false ? lv.basis : 'Statutory',
      lv.duration,
      lv.eligibility,
      lv.conversion,
    ]);
    drawWrappedTable(
      ['Statutory Leave', 'Legal Basis', 'Paid Duration', 'Key Eligibility', 'Cash Commutation & Payor'],
      leaveRows,
      [0.20, 0.15, 0.19, 0.24, 0.22],
      marginX,
      contentW,
      undefined,
      ['left', 'left', 'left', 'left', 'left']
    );
  }

  // IV. Unabridged Modules Breakdown
  const selectedWorldList =
    params.selectedWorlds && params.selectedWorlds.length > 0
      ? params.selectedWorlds
      : WORLDS_METADATA.map((w) => w.id);

  WORLDS_METADATA.filter((w) => selectedWorldList.includes(w.id)).forEach((world) => {
    const worldTopics = activeTopics.filter((t) => t.worldId === world.id);
    if (worldTopics.length === 0) return;

    // World Banner (rounded box with theme accent soft bg and star)
    ensureSpace(16);
    doc.setFillColor(...theme.cardTintFill);
    doc.setDrawColor(...theme.borderMuted);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, y, contentW, 11.5, 1.8, 1.8, 'FD');

    drawVectorMarioStar(doc, marginX + 3.8, y + 3.5, 1.8);
    doc.setTextColor(...theme.primary);
    doc.setFont(ff, fp.headingStyle);
    doc.setFontSize(8.2 * scale);
    doc.text(
      `WORLD ${world.worldNumber}: ${world.title.replace(/^WORLD \d+:\s*/i, '').toUpperCase()}`,
      marginX + 7.5,
      y + 4.6
    );

    doc.setTextColor(...theme.mutedText);
    doc.setFont(ff, fp.subHeadingStyle);
    doc.setFontSize(6.4 * scale);
    doc.text(`${worldTopics.length} MODULES`, pageW - marginX - 3.5, y + 4.6, { align: 'right' });

    if (!params.matricesOnlyMode) {
      doc.setFont(ff, fp.bodyStyle);
      doc.setFontSize(6.0 * scale);
      const descLines = doc.splitTextToSize(world.description, contentW - 8.0);
      doc.text(descLines[0] || '', marginX + 2.5, y + 8.8);
    }
    y += 14.5;

    worldTopics.forEach((topic) => {
      const isDone = completedIds.includes(topic.id);
      const topicCardH = computeTopicModuleHeight(
        doc,
        topic,
        ff,
        fp,
        scale,
        contentW,
        params
      );

      const availablePageSpace = pageH - marginBottom - y;
      const fullPageCapacity = pageH - marginTop - marginBottom;

      // NO CUTS PER MODULE DECISION:
      // If the module can fit entirely on a fresh page and does not fit in remaining space, start on fresh page!
      if (topicCardH <= fullPageCapacity && y + topicCardH > pageH - marginBottom) {
        addThemedPage();
      }

      // TOP HORIZONTAL BORDER ONLY (border-y border-slate-300 bg-white)
      // Strictly ZERO vertical lines on the left or right sides!
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.35);
      doc.line(marginX, y, pageW - marginX, y);

      const cardPadX = 2.0;
      const innerW = contentW - cardPadX * 2;
      let curY = y + 2.5;

      // 1. Module Header
      if (params.includeLegalCitations !== false && topic.badge) {
        doc.setTextColor(71, 85, 105); // slate-600
        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(7.0 * scale);
        doc.text(`STATUTORY BASIS: ${topic.badge.toUpperCase()}`, marginX + cardPadX, curY + 2.2);
        curY += 3.6;
      }

      // Title & Mastered Status
      doc.setTextColor(...theme.bodyText);
      doc.setFont(ff, fp.headingStyle);
      doc.setFontSize(11.2 * scale);
      const checkPrefix = params.includeCheckboxes !== false ? (isDone ? '[x] ' : '[ ] ') : '';
      const fullTitleStr = `${checkPrefix}${topic.title}`;
      const titleLines = doc.splitTextToSize(sanitizePdfText(fullTitleStr), innerW - 28);
      doc.text(titleLines, marginX + cardPadX, curY + 3.4);

      // Status pill on right
      doc.setFont(ff, fp.subHeadingStyle);
      doc.setFontSize(7.4 * scale);
      if (isDone) {
        doc.setTextColor(5, 150, 105); // emerald-600
        doc.text('[MASTERED]', pageW - marginX - cardPadX, curY + 3.4, { align: 'right' });
      } else {
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text('[  TO REVIEW]', pageW - marginX - cardPadX, curY + 3.4, { align: 'right' });
      }
      curY += titleLines.length * (4.6 * scale) + 1.4;

      // Subtle divider line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.18);
      doc.line(marginX + cardPadX, curY, pageW - marginX - cardPadX, curY);
      curY += 2.2;

      // Helper to check page boundaries inside a module
      const checkSubBlockSpace = (subH: number) => {
        if (curY + subH > pageH - marginBottom) {
          addThemedPage();
          curY = marginTop;
        }
      };

      // 2. Mario Executive Takeaway
      if (!params.matricesOnlyMode && params.includeExecutiveMarioSummary !== false && topic.beginnerSummary) {
        const takeText = `MARIO EXECUTIVE TAKEAWAY: ${cleanRuleText(topic.beginnerSummary)}`;
        const takeLines = doc.splitTextToSize(sanitizePdfText(takeText), innerW - 8.0);
        const takeBoxH = takeLines.length * (3.9 * scale) + 4.5;
        checkSubBlockSpace(takeBoxH);

        doc.setFillColor(254, 243, 199); // amber-100
        doc.setDrawColor(245, 158, 11); // amber-500
        doc.setLineWidth(0.22);
        doc.roundedRect(marginX + cardPadX, curY, innerW, takeBoxH, 1.2, 1.2, 'FD');

        drawVectorMarioStar(doc, marginX + cardPadX + 3.5, curY + 3.6, 1.4);
        doc.setTextColor(146, 64, 14); // amber-800
        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(8.2 * scale);
        doc.text(takeLines, marginX + cardPadX + 7.0, curY + 3.6);
        curY += takeBoxH + 2.2;
      }

      // 3. Core Rule Summary
      if (!params.matricesOnlyMode && topic.summary) {
        const sumLines = doc.splitTextToSize(sanitizePdfText(cleanRuleText(topic.summary)), innerW - 18);
        const ruleH = sumLines.length * (3.9 * scale) + 2.2;
        checkSubBlockSpace(ruleH);

        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(8.4 * scale);
        doc.setTextColor(15, 23, 42); // slate-950
        doc.text('Core Rule: ', marginX + cardPadX, curY + 3.0);

        doc.setFont(ff, fp.bodyStyle);
        doc.setFontSize(8.0 * scale);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(sumLines, marginX + cardPadX + 17.5, curY + 3.0);
        curY += ruleH;
      }

      // 4. Controlling Jurisprudence
      if (
        !params.matricesOnlyMode &&
        params.includeLegalCitations !== false &&
        topic.keyDoctrines &&
        topic.keyDoctrines.length > 0
      ) {
        let jurLinesCount = 0;
        const allJurLines = topic.keyDoctrines.map((d) => {
          const l = doc.splitTextToSize(sanitizePdfText(`• ${cleanRuleText(d)}`), innerW - 6.0);
          jurLinesCount += l.length;
          return l;
        });
        const jurBoxH = 5.6 + jurLinesCount * (3.8 * scale);
        checkSubBlockSpace(jurBoxH);

        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.setLineWidth(0.18);
        doc.roundedRect(marginX + cardPadX, curY, innerW, jurBoxH, 1.0, 1.0, 'FD');

        doc.setTextColor(15, 23, 42);
        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(7.8 * scale);
        doc.text('CONTROLLING JURISPRUDENCE & PRECEDENTS', marginX + cardPadX + 2.5, curY + 3.6);

        let curJy = curY + 7.0;
        allJurLines.forEach((lines) => {
          doc.setTextColor(30, 41, 59);
          doc.setFont(ff, fp.bodyStyle);
          doc.setFontSize(7.5 * scale);
          doc.text(lines, marginX + cardPadX + 2.5, curJy);
          curJy += lines.length * (3.8 * scale);
        });
        curY += jurBoxH + 2.2;
      }

      // 5. Codified Rules & Embedded Tables
      const rules = params.matricesOnlyMode
        ? topic.rules.filter((r) => Boolean(r.tableData))
        : topic.rules;

      rules.forEach((rule, rIdx) => {
        // Heading
        const rHead = doc.splitTextToSize(
          sanitizePdfText(`${rIdx + 1}. ${cleanRuleText(rule.heading)}`),
          innerW
        );
        const headingH = rHead.length * (4.2 * scale) + 1.2;
        checkSubBlockSpace(headingH + 6.0);

        doc.setTextColor(15, 23, 42); // slate-950
        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(9.0 * scale);
        doc.text(rHead, marginX + cardPadX, curY + 3.2);
        curY += headingH;

        // Description
        if (!params.matricesOnlyMode && rule.description) {
          const descLines = doc.splitTextToSize(
            sanitizePdfText(cleanRuleText(rule.description)),
            innerW - 4.0
          );
          const descH = descLines.length * (3.9 * scale) + 1.2;
          checkSubBlockSpace(descH);

          doc.setFont(ff, fp.bodyStyle);
          doc.setFontSize(8.0 * scale);
          doc.setTextColor(51, 65, 85); // slate-700
          doc.text(descLines, marginX + cardPadX + 3.0, curY + 3.0);
          curY += descH;
        }

        // Bullet / Numbered Items (cleanly parsed: zero redundant - 1. or • 1.)
        if (!params.matricesOnlyMode && rule.items && rule.items.length > 0) {
          rule.items.forEach((it) => {
            const entry = parseListEntry(it);
            const itStr = entry.isNumbered ? `${entry.marker} ${entry.text}` : `• ${entry.text}`;
            const itLines = doc.splitTextToSize(
              sanitizePdfText(itStr),
              innerW - 6.0
            );
            const itH = itLines.length * (3.8 * scale) + 0.8;
            checkSubBlockSpace(itH);

            doc.setFont(ff, entry.isNumbered ? fp.headingStyle : fp.bodyStyle);
            doc.setFontSize(7.8 * scale);
            doc.setTextColor(51, 65, 85);
            doc.text(itLines, marginX + cardPadX + 4.5, curY + 2.8);
            curY += itH;
          });
        }

        // Subsections (cleanly parsed: zero redundant - 1. or • 1.)
        if (!params.matricesOnlyMode && rule.subSections && rule.subSections.length > 0) {
          rule.subSections.forEach((sub) => {
            const subTitle = doc.splitTextToSize(sanitizePdfText(cleanRuleText(sub.title)), innerW - 6.0);
            const subH = subTitle.length * (4.0 * scale) + 1.0;
            checkSubBlockSpace(subH + 4.0);

            doc.setFont(ff, fp.headingStyle);
            doc.setFontSize(8.0 * scale);
            doc.setTextColor(15, 23, 42);
            doc.text(subTitle, marginX + cardPadX + 4.5, curY + 3.0);
            curY += subH;

            sub.items.forEach((si) => {
              const entry = parseListEntry(si);
              const siStr = entry.isNumbered ? `${entry.marker} ${entry.text}` : `• ${entry.text}`;
              const siLines = doc.splitTextToSize(sanitizePdfText(siStr), innerW - 8.0);
              const siH = siLines.length * (3.8 * scale) + 0.6;
              checkSubBlockSpace(siH);

              doc.setFont(ff, entry.isNumbered ? fp.headingStyle : fp.bodyStyle);
              doc.setFontSize(7.6 * scale);
              doc.setTextColor(51, 65, 85);
              doc.text(siLines, marginX + cardPadX + 7.0, curY + 2.8);
              curY += siH;
            });
          });
        }

        // Embedded Module Table (drawn in-place inside module card without jumping or overlapping!)
        if (rule.tableData) {
          curY = drawWrappedTable(
            rule.tableData.headers,
            rule.tableData.rows,
            undefined,
            marginX + cardPadX,
            innerW,
            curY
          );
          y = curY;
        }
      });

      // 6. Statutory Exceptions
      if (!params.matricesOnlyMode && topic.exceptions && topic.exceptions.length > 0) {
        let exLinesCount = 0;
        topic.exceptions.forEach((ex) => {
          exLinesCount += doc.splitTextToSize(sanitizePdfText(`General Rule: ${cleanRuleText(ex.generalRule)}`), innerW - 6.0).length;
          ex.exceptions.forEach((eItem) => {
            exLinesCount += doc.splitTextToSize(sanitizePdfText(`• Exception: ${cleanRuleText(eItem)}`), innerW - 8.0).length;
          });
        });
        const exBoxH = 5.8 + exLinesCount * (3.8 * scale);
        checkSubBlockSpace(exBoxH);

        doc.setFillColor(255, 241, 242); // rose-50
        doc.setDrawColor(244, 63, 94); // rose-500
        doc.setLineWidth(0.18);
        doc.roundedRect(marginX + cardPadX, curY, innerW, exBoxH, 1.0, 1.0, 'FD');

        doc.setTextColor(159, 18, 57); // rose-900
        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(7.8 * scale);
        doc.text('GENERAL RULE & STATUTORY EXCEPTIONS', marginX + cardPadX + 2.5, curY + 3.6);

        let curEy = curY + 7.0;
        topic.exceptions.forEach((ex) => {
          doc.setTextColor(15, 23, 42);
          doc.setFont(ff, fp.headingStyle);
          doc.setFontSize(7.6 * scale);
          const grLines = doc.splitTextToSize(sanitizePdfText(`General Rule: ${cleanRuleText(ex.generalRule)}`), innerW - 6.0);
          doc.text(grLines, marginX + cardPadX + 2.5, curEy);
          curEy += grLines.length * (3.8 * scale);

          doc.setFont(ff, fp.bodyStyle);
          doc.setTextColor(51, 65, 85);
          ex.exceptions.forEach((eItem) => {
            const entry = parseListEntry(eItem);
            const eStr = entry.isNumbered ? `Exception: ${entry.marker} ${entry.text}` : `• Exception: ${entry.text}`;
            const eLines = doc.splitTextToSize(sanitizePdfText(eStr), innerW - 8.0);
            doc.text(eLines, marginX + cardPadX + 4.5, curEy);
            curEy += eLines.length * (3.6 * scale);
          });
        });
        curY += exBoxH + 2.2;
      }

      // 7. Memory Traps & High-Yield Takeaways
      if (!params.matricesOnlyMode && params.includeBarTips !== false) {
        const combinedTips = [...(topic.barTips || []), ...(topic.keyTips || [])];
        if (combinedTips.length > 0 || topic.practicalTakeaway) {
          let tipLinesCount = 0;
          const allTipLines = combinedTips.slice(0, 4).map((t) => {
            const entry = parseListEntry(t);
            const tStr = entry.isNumbered ? `${entry.marker} ${entry.text}` : `• ${entry.text}`;
            const l = doc.splitTextToSize(sanitizePdfText(tStr), innerW - 8.0);
            tipLinesCount += l.length;
            return l;
          });
          const pLines = topic.practicalTakeaway
            ? doc.splitTextToSize(sanitizePdfText(`Practical Application: ${cleanRuleText(topic.practicalTakeaway)}`), innerW - 8.0)
            : [];
          const tipBoxH = 6.0 + (tipLinesCount + pLines.length) * (3.8 * scale) + (pLines.length > 0 ? 1.5 : 0);
          checkSubBlockSpace(tipBoxH);

          doc.setFillColor(254, 243, 199); // amber-100
          doc.setDrawColor(217, 119, 6); // amber-600
          doc.setLineWidth(0.20);
          doc.roundedRect(marginX + cardPadX, curY, innerW, tipBoxH, 1.2, 1.2, 'FD');

          drawVectorMarioStar(doc, marginX + cardPadX + 3.5, curY + 3.6, 1.4);
          doc.setTextColor(146, 64, 14); // amber-800
          doc.setFont(ff, fp.headingStyle);
          doc.setFontSize(7.8 * scale);
          doc.text('MEMORY TRAPS & HIGH-YIELD TAKEAWAYS', marginX + cardPadX + 7.0, curY + 3.8);

          let curTy = curY + 7.2;
          allTipLines.forEach((lines) => {
            doc.setTextColor(69, 26, 3);
            doc.setFont(ff, fp.bodyStyle);
            doc.setFontSize(7.5 * scale);
            doc.text(lines, marginX + cardPadX + 3.0, curTy);
            curTy += lines.length * (3.7 * scale);
          });

          if (pLines.length > 0) {
            doc.setTextColor(120, 53, 15);
            doc.setFont(ff, fp.headingStyle);
            doc.setFontSize(7.6 * scale);
            doc.text(pLines, marginX + cardPadX + 3.0, curTy);
            curTy += pLines.length * (3.7 * scale);
          }
          curY += tipBoxH + 2.2;
        }
      }

      // 8. Blank Note Lines
      if (params.blankNoteLinesCount && params.blankNoteLinesCount > 0) {
        const linesCount = Math.min(10, params.blankNoteLinesCount);
        checkSubBlockSpace(linesCount * 5.0 + 8.0);

        doc.setFont(ff, fp.headingStyle);
        doc.setFontSize(6.4 * scale);
        doc.setTextColor(100, 116, 139);
        doc.text('Handwritten Study Notes & Statutory Annotations:', marginX + cardPadX, curY + 3.0);
        curY += 4.5;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.18);
        for (let ln = 0; ln < linesCount; ln++) {
          doc.line(marginX + cardPadX, curY + 3.0, pageW - marginX - cardPadX, curY + 3.0);
          curY += 5.0;
        }
      }

      // BOTTOM HORIZONTAL BORDER ONLY (border-y border-slate-300)
      // Strictly ZERO vertical lines on the sides!
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.35);
      doc.line(marginX, curY + 1.2, pageW - marginX, curY + 1.2);

      y = curY + 5.0;
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
  loadedFont?: string;
  ttfBase64?: string;
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
  let ff = theme.fontFamily;
  if (params.ttfBase64 && params.loadedFont) {
    try {
      const vfsName = `${params.loadedFont}-Regular.ttf`;
      doc.addFileToVFS(vfsName, params.ttfBase64);
      doc.addFont(vfsName, params.loadedFont, 'normal');
      doc.addFont(vfsName, params.loadedFont, 'bold');
      doc.addFont(vfsName, params.loadedFont, 'italic');
      doc.addFont(vfsName, params.loadedFont, 'bolditalic');
      ff = params.loadedFont;
    } catch (e) {
      console.warn('Failed to embed TTF in jsPDF:', e);
    }
  }
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
  const safePlayer = sanitizePdfText(params.playerName || 'Labor Scholar Hero');
  let pSize = 20 * sScale;
  doc.setFontSize(pSize);
  while (doc.getTextWidth(safePlayer) > (W - 120) && pSize > 12) {
    pSize -= 0.5;
    doc.setFontSize(pSize);
  }
  const playerLines = doc.splitTextToSize(safePlayer, W - 120);
  doc.text(playerLines, 21, playerLines.length > 1 ? 30.5 : 33);

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

  if (!theme.isInkSaver) {
    drawVectorMarioStar(doc, W - 92, 30.5, 4.5, [253, 224, 71], [180, 83, 9]);
    drawVectorMarioBrickStrip(doc, 16, 45.5, W - 32, 1.8, theme.accent, theme.borderStrong);
  }
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
  const resolvedBreakdown =
    params.worldBreakdown ||
    WORLDS_METADATA.map((w) => ({
      worldNumber: w.worldNumber,
      shortTitle: w.shortTitle,
      completed: 10,
      total: 10,
      pct: 100,
    }));
  resolvedBreakdown.forEach((wb, idx) => {
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
