import { LawTopic } from '../types/laborLaw';
import {
  LAW_CHAMBERS_UPGRADE_ITEMS,
  RELICS_AND_NAMEPLATES_ITEMS,
} from './round10Features';

// ============================================================================
// 1. EXPANDED PRINT COLOR THEMES (44 THEMES) & PRINTABLE FONTS (36 FONTS)
// ============================================================================

export interface ExtendedPrintThemeSpec {
  id: string;
  name: string;
  badge: string;
  category: 'Legal & Classic' | 'Mario Kingdom' | 'Editorial & Luxury' | 'Pastel & Ink-Saver';
  headerBgHex: string;
  headerTextHex: string;
  accentHex: string;
  accentSoftBgHex: string;
  borderHex: string;
  tableHeadBgHex: string;
  tableStripeBgHex: string;
  bodyTextHex: string;
  mutedTextHex: string;
  swatchHexes: [string, string, string];
}

export const EXTENDED_PRINT_COLOR_THEMES: readonly ExtendedPrintThemeSpec[] = [
  // Original 20 (preserved IDs & enriched metadata)
  {
    id: 'classic_navy',
    name: 'Supreme Court Navy',
    badge: 'Default',
    category: 'Legal & Classic',
    headerBgHex: '#0F172A',
    headerTextHex: '#FBBF24',
    accentHex: '#1E3A8A',
    accentSoftBgHex: '#EFF6FF',
    borderHex: '#1E293B',
    tableHeadBgHex: '#1E293B',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#0F172A', '#1E3A8A', '#FBBF24'],
  },
  {
    id: 'ink_saver_bw',
    name: 'Crisp Ink-Saver B&W',
    badge: 'Eco Print',
    category: 'Pastel & Ink-Saver',
    headerBgHex: '#FFFFFF',
    headerTextHex: '#000000',
    accentHex: '#111827',
    accentSoftBgHex: '#F9FAFB',
    borderHex: '#111827',
    tableHeadBgHex: '#F3F4F6',
    tableStripeBgHex: '#FFFFFF',
    bodyTextHex: '#000000',
    mutedTextHex: '#374151',
    swatchHexes: ['#000000', '#6B7280', '#FFFFFF'],
  },
  {
    id: 'mario_crimson',
    name: 'Mario Red & Gold',
    badge: 'Heroic',
    category: 'Mario Kingdom',
    headerBgHex: '#991B1B',
    headerTextHex: '#FEF08A',
    accentHex: '#B91C1C',
    accentSoftBgHex: '#FEF2F2',
    borderHex: '#7F1D1D',
    tableHeadBgHex: '#7F1D1D',
    tableStripeBgHex: '#FFFBEB',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#991B1B', '#DC2626', '#FACC15'],
  },
  {
    id: 'emerald_counsel',
    name: 'Luigi Emerald Counsel',
    badge: 'Fresh',
    category: 'Mario Kingdom',
    headerBgHex: '#064E3B',
    headerTextHex: '#A7F3D0',
    accentHex: '#047857',
    accentSoftBgHex: '#ECFDF5',
    borderHex: '#065F46',
    tableHeadBgHex: '#065F46',
    tableStripeBgHex: '#F0FDF4',
    bodyTextHex: '#064E3B',
    mutedTextHex: '#374151',
    swatchHexes: ['#064E3B', '#059669', '#A7F3D0'],
  },
  {
    id: 'royal_parchment',
    name: 'Royal Amber Jurisprudence',
    badge: 'Warm',
    category: 'Legal & Classic',
    headerBgHex: '#451A03',
    headerTextHex: '#FDE68A',
    accentHex: '#92400E',
    accentSoftBgHex: '#FFFBEB',
    borderHex: '#78350F',
    tableHeadBgHex: '#78350F',
    tableStripeBgHex: '#FEFCE8',
    bodyTextHex: '#292524',
    mutedTextHex: '#57534E',
    swatchHexes: ['#451A03', '#B45309', '#FDE68A'],
  },
  {
    id: 'rosalina_cobalt',
    name: 'Rosalina Cosmic Cobalt',
    badge: 'Observatory',
    category: 'Mario Kingdom',
    headerBgHex: '#0C4A6E',
    headerTextHex: '#BAE6FD',
    accentHex: '#0369A1',
    accentSoftBgHex: '#F0F9FF',
    borderHex: '#075985',
    tableHeadBgHex: '#075985',
    tableStripeBgHex: '#F0F9FF',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#0C4A6E', '#0284C7', '#7DD3FC'],
  },
  {
    id: 'peach_rosewood',
    name: 'Peach Royal Rosewood',
    badge: 'Regal',
    category: 'Mario Kingdom',
    headerBgHex: '#831843',
    headerTextHex: '#FBCFE8',
    accentHex: '#BE185D',
    accentSoftBgHex: '#FDF2F8',
    borderHex: '#9D174D',
    tableHeadBgHex: '#9D174D',
    tableStripeBgHex: '#FDF2F8',
    bodyTextHex: '#1F2937',
    mutedTextHex: '#4B5563',
    swatchHexes: ['#831843', '#DB2777', '#FBCFE8'],
  },
  {
    id: 'waluigi_amethyst',
    name: 'Amethyst Appellate',
    badge: ' Dignified',
    category: 'Editorial & Luxury',
    headerBgHex: '#3B0764',
    headerTextHex: '#E9D5FF',
    accentHex: '#6B21A8',
    accentSoftBgHex: '#FAF5FF',
    borderHex: '#581C87',
    tableHeadBgHex: '#581C87',
    tableStripeBgHex: '#FAF5FF',
    bodyTextHex: '#1E1B4B',
    mutedTextHex: '#4B5563',
    swatchHexes: ['#3B0764', '#7E22CE', '#E9D5FF'],
  },
  {
    id: 'dole_teal',
    name: 'DOLE Bureau Teal',
    badge: 'Statutory',
    category: 'Legal & Classic',
    headerBgHex: '#134E4A',
    headerTextHex: '#99F6E4',
    accentHex: '#0F766E',
    accentSoftBgHex: '#F0FDFA',
    borderHex: '#115E59',
    tableHeadBgHex: '#115E59',
    tableStripeBgHex: '#F0FDFA',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#134E4A', '#0D9488', '#99F6E4'],
  },
  {
    id: 'nlrc_burgundy',
    name: 'NLRC En Banc Burgundy',
    badge: 'Tribunal',
    category: 'Legal & Classic',
    headerBgHex: '#4C0519',
    headerTextHex: '#FECDD3',
    accentHex: '#9F1239',
    accentSoftBgHex: '#FFF1F2',
    borderHex: '#881337',
    tableHeadBgHex: '#881337',
    tableStripeBgHex: '#FFF1F2',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#4C0519', '#BE123C', '#FDA4AF'],
  },
  {
    id: 'oxford_indigo',
    name: 'Oxford Law Review Indigo',
    badge: 'Academic',
    category: 'Legal & Classic',
    headerBgHex: '#1E1B4B',
    headerTextHex: '#C7D2FE',
    accentHex: '#3730A3',
    accentSoftBgHex: '#EEF2FF',
    borderHex: '#312E81',
    tableHeadBgHex: '#312E81',
    tableStripeBgHex: '#EEF2FF',
    bodyTextHex: '#111827',
    mutedTextHex: '#4B5563',
    swatchHexes: ['#1E1B4B', '#4338CA', '#C7D2FE'],
  },
  {
    id: 'mahogany_bench',
    name: 'Mahogany Supreme Bench',
    badge: 'Heritage',
    category: 'Legal & Classic',
    headerBgHex: '#3E1F14',
    headerTextHex: '#FED7AA',
    accentHex: '#9A3412',
    accentSoftBgHex: '#FFF7ED',
    borderHex: '#7C2D12',
    tableHeadBgHex: '#7C2D12',
    tableStripeBgHex: '#FFF7ED',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#3E1F14', '#C2410C', '#FED7AA'],
  },
  {
    id: 'olive_chancery',
    name: 'Chancery Olive & Brass',
    badge: 'Archival',
    category: 'Editorial & Luxury',
    headerBgHex: '#1A2E05',
    headerTextHex: '#D9F99D',
    accentHex: '#3F6212',
    accentSoftBgHex: '#F7FEE7',
    borderHex: '#365314',
    tableHeadBgHex: '#365314',
    tableStripeBgHex: '#F7FEE7',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#4B5563',
    swatchHexes: ['#1A2E05', '#4D7C0F', '#BEF264'],
  },
  {
    id: 'charcoal_gold',
    name: 'Obsidian & Gold Foil',
    badge: 'Executive',
    category: 'Editorial & Luxury',
    headerBgHex: '#18181B',
    headerTextHex: '#FDE047',
    accentHex: '#A16207',
    accentSoftBgHex: '#FEFCE8',
    borderHex: '#27272A',
    tableHeadBgHex: '#27272A',
    tableStripeBgHex: '#FAFAFA',
    bodyTextHex: '#18181B',
    mutedTextHex: '#52525B',
    swatchHexes: ['#18181B', '#CA8A04', '#FDE047'],
  },
  {
    id: 'cobalt_blueprint',
    name: 'Statutory Blueprint',
    badge: 'Precision',
    category: 'Editorial & Luxury',
    headerBgHex: '#172554',
    headerTextHex: '#93C5FD',
    accentHex: '#1D4ED8',
    accentSoftBgHex: '#EFF6FF',
    borderHex: '#1E40AF',
    tableHeadBgHex: '#1E3A8A',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#172554', '#2563EB', '#93C5FD'],
  },
  {
    id: 'terracotta_codal',
    name: 'Manila Terracotta Codal',
    badge: 'Warm Earth',
    category: 'Editorial & Luxury',
    headerBgHex: '#7C2D12',
    headerTextHex: '#FFEDD5',
    accentHex: '#C2410C',
    accentSoftBgHex: '#FFF7ED',
    borderHex: '#9A3412',
    tableHeadBgHex: '#9A3412',
    tableStripeBgHex: '#FFFBEB',
    bodyTextHex: '#292524',
    mutedTextHex: '#57534E',
    swatchHexes: ['#7C2D12', '#EA580C', '#FED7AA'],
  },
  {
    id: 'pine_solicitor',
    name: 'Solicitor General Pine',
    badge: 'Republic',
    category: 'Legal & Classic',
    headerBgHex: '#052E16',
    headerTextHex: '#86EFAC',
    accentHex: '#15803D',
    accentSoftBgHex: '#F0FDF4',
    borderHex: '#166534',
    tableHeadBgHex: '#14532D',
    tableStripeBgHex: '#F0FDF4',
    bodyTextHex: '#052E16',
    mutedTextHex: '#374151',
    swatchHexes: ['#052E16', '#16A34A', '#86EFAC'],
  },
  {
    id: 'plum_magistrate',
    name: 'Magistrate Imperial Plum',
    badge: 'Bench',
    category: 'Legal & Classic',
    headerBgHex: '#4A044E',
    headerTextHex: '#F5D0FE',
    accentHex: '#86198F',
    accentSoftBgHex: '#FDF4FF',
    borderHex: '#701A75',
    tableHeadBgHex: '#701A75',
    tableStripeBgHex: '#FDF4FF',
    bodyTextHex: '#1E1B4B',
    mutedTextHex: '#4B5563',
    swatchHexes: ['#4A044E', '#A21CAF', '#F5D0FE'],
  },
  {
    id: 'arctic_slate',
    name: 'Minimalist Steel & Slate',
    badge: 'Low Ink',
    category: 'Pastel & Ink-Saver',
    headerBgHex: '#334155',
    headerTextHex: '#F8FAFC',
    accentHex: '#475569',
    accentSoftBgHex: '#F8FAFC',
    borderHex: '#475569',
    tableHeadBgHex: '#334155',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#64748B',
    swatchHexes: ['#334155', '#64748B', '#F1F5F9'],
  },
  {
    id: 'starlight_bronze',
    name: 'Star Road Antique Bronze',
    badge: 'Prestige',
    category: 'Mario Kingdom',
    headerBgHex: '#27272A',
    headerTextHex: '#FCD34D',
    accentHex: '#B45309',
    accentSoftBgHex: '#FFFBEB',
    borderHex: '#52525B',
    tableHeadBgHex: '#3F3F46',
    tableStripeBgHex: '#FAFAF9',
    bodyTextHex: '#18181B',
    mutedTextHex: '#52525B',
    swatchHexes: ['#27272A', '#D97706', '#FCD34D'],
  },

  // 24 Brand-New Print Color Themes (21 through 44)
  {
    id: 'yoshi_island_jade',
    name: 'Yoshi Island Jade & Sun',
    badge: 'World 1',
    category: 'Mario Kingdom',
    headerBgHex: '#14532D',
    headerTextHex: '#FEF08A',
    accentHex: '#16A34A',
    accentSoftBgHex: '#F0FDF4',
    borderHex: '#15803D',
    tableHeadBgHex: '#166534',
    tableStripeBgHex: '#F7FEE7',
    bodyTextHex: '#14532D',
    mutedTextHex: '#3F6212',
    swatchHexes: ['#14532D', '#22C55E', '#FEF08A'],
  },
  {
    id: 'donut_plains_ochre',
    name: 'Donut Plains Golden Ochre',
    badge: 'World 2',
    category: 'Mario Kingdom',
    headerBgHex: '#713F12',
    headerTextHex: '#FEF9C3',
    accentHex: '#CA8A04',
    accentSoftBgHex: '#FEFCE8',
    borderHex: '#854D0E',
    tableHeadBgHex: '#713F12',
    tableStripeBgHex: '#FEFCE8',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#713F12', '#EAB308', '#FEF9C3'],
  },
  {
    id: 'vanilla_dome_sapphire',
    name: 'Vanilla Dome Crystal Sapphire',
    badge: 'World 3',
    category: 'Mario Kingdom',
    headerBgHex: '#1E3A8A',
    headerTextHex: '#E0F2FE',
    accentHex: '#2563EB',
    accentSoftBgHex: '#EFF6FF',
    borderHex: '#1D4ED8',
    tableHeadBgHex: '#1E40AF',
    tableStripeBgHex: '#F0F9FF',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#1E3A8A', '#3B82F6', '#E0F2FE'],
  },
  {
    id: 'forest_illusion_moss',
    name: 'Forest of Illusion Canopy',
    badge: 'World 4',
    category: 'Mario Kingdom',
    headerBgHex: '#115E59',
    headerTextHex: '#CCFBF1',
    accentHex: '#0D9488',
    accentSoftBgHex: '#F0FDFA',
    borderHex: '#0F766E',
    tableHeadBgHex: '#134E4A',
    tableStripeBgHex: '#ECFDF5',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#115E59', '#14B8A6', '#CCFBF1'],
  },
  {
    id: 'bowser_fortress_ember',
    name: 'Bowser Keep Molten Ember',
    badge: 'World 5',
    category: 'Mario Kingdom',
    headerBgHex: '#450A0A',
    headerTextHex: '#FDBA74',
    accentHex: '#DC2626',
    accentSoftBgHex: '#FEF2F2',
    borderHex: '#7F1D1D',
    tableHeadBgHex: '#7F1D1D',
    tableStripeBgHex: '#FFF7ED',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#450A0A', '#EA580C', '#FDBA74'],
  },
  {
    id: 'peach_sky_sanctuary',
    name: 'Peach Castle Blush & Gold',
    badge: 'World 6',
    category: 'Mario Kingdom',
    headerBgHex: '#9D174D',
    headerTextHex: '#FEF3C7',
    accentHex: '#DB2777',
    accentSoftBgHex: '#FDF2F8',
    borderHex: '#BE185D',
    tableHeadBgHex: '#831843',
    tableStripeBgHex: '#FFFBEB',
    bodyTextHex: '#1F2937',
    mutedTextHex: '#4B5563',
    swatchHexes: ['#9D174D', '#EC4899', '#FEF3C7'],
  },
  {
    id: 'toad_bazaar_vermilion',
    name: 'Toad Bazaar Vermilion',
    badge: 'Toad Shop',
    category: 'Mario Kingdom',
    headerBgHex: '#9A3412',
    headerTextHex: '#FEF08A',
    accentHex: '#EA580C',
    accentSoftBgHex: '#FFF7ED',
    borderHex: '#C2410C',
    tableHeadBgHex: '#7C2D12',
    tableStripeBgHex: '#FFF7ED',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#9A3412', '#F97316', '#FEF08A'],
  },
  {
    id: 'daisy_sarasaland_amber',
    name: 'Princess Daisy Sarasaland',
    badge: 'Solar',
    category: 'Mario Kingdom',
    headerBgHex: '#92400E',
    headerTextHex: '#FEF9C3',
    accentHex: '#D97706',
    accentSoftBgHex: '#FFFBEB',
    borderHex: '#B45309',
    tableHeadBgHex: '#78350F',
    tableStripeBgHex: '#FEFCE8',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#92400E', '#F59E0B', '#FEF9C3'],
  },
  {
    id: 'wario_bullion_vault',
    name: 'Wario Bullion Gold & Violet',
    badge: 'Treasury',
    category: 'Mario Kingdom',
    headerBgHex: '#4C1D95',
    headerTextHex: '#FDE047',
    accentHex: '#7C3AED',
    accentSoftBgHex: '#F5F3FF',
    borderHex: '#5B21B6',
    tableHeadBgHex: '#4C1D95',
    tableStripeBgHex: '#FEFCE8',
    bodyTextHex: '#1E1B4B',
    mutedTextHex: '#4B5563',
    swatchHexes: ['#4C1D95', '#CA8A04', '#FDE047'],
  },
  {
    id: 'koopa_paratroopa_cyan',
    name: 'Koopa Troopa Cerulean',
    badge: 'Crisp',
    category: 'Mario Kingdom',
    headerBgHex: '#155E75',
    headerTextHex: '#FEF08A',
    accentHex: '#0891B2',
    accentSoftBgHex: '#ECFEFF',
    borderHex: '#0E7490',
    tableHeadBgHex: '#164E63',
    tableStripeBgHex: '#ECFEFF',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#155E75', '#06B6D4', '#FEF08A'],
  },
  {
    id: 'padre_faura_maroon',
    name: 'Padre Faura En Banc Maroon',
    badge: 'Bar Classic',
    category: 'Legal & Classic',
    headerBgHex: '#5B0E1E',
    headerTextHex: '#FDE68A',
    accentHex: '#881337',
    accentSoftBgHex: '#FFF1F2',
    borderHex: '#6B1226',
    tableHeadBgHex: '#5B0E1E',
    tableStripeBgHex: '#FFFBEB',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#5B0E1E', '#9F1239', '#FDE68A'],
  },
  {
    id: 'intramuros_stone_sepia',
    name: 'Intramuros Archival Sepia',
    badge: 'Codal',
    category: 'Legal & Classic',
    headerBgHex: '#44403C',
    headerTextHex: '#FDE68A',
    accentHex: '#78716C',
    accentSoftBgHex: '#FAFAF9',
    borderHex: '#57534E',
    tableHeadBgHex: '#292524',
    tableStripeBgHex: '#F5F5F4',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#292524', '#78716C', '#FDE68A'],
  },
  {
    id: 'malacanang_presidential_blue',
    name: 'Presidential Decree Ultramarine',
    badge: 'P.D. 442',
    category: 'Legal & Classic',
    headerBgHex: '#0A2540',
    headerTextHex: '#FCD34D',
    accentHex: '#1D4ED8',
    accentSoftBgHex: '#EFF6FF',
    borderHex: '#1E3A8A',
    tableHeadBgHex: '#0A2540',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#0A2540', '#1D4ED8', '#FCD34D'],
  },
  {
    id: 'sandigan_forest_gold',
    name: 'Tribunal Cypress & Gold',
    badge: 'Formal',
    category: 'Legal & Classic',
    headerBgHex: '#0F291E',
    headerTextHex: '#FDE68A',
    accentHex: '#166534',
    accentSoftBgHex: '#F0FDF4',
    borderHex: '#14532D',
    tableHeadBgHex: '#0F291E',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#0F291E', '#15803D', '#FDE68A'],
  },
  {
    id: 'geneva_ilo_azure',
    name: 'ILO Convention Azure',
    badge: 'Treaty',
    category: 'Legal & Classic',
    headerBgHex: '#0369A1',
    headerTextHex: '#FFFFFF',
    accentHex: '#0284C7',
    accentSoftBgHex: '#F0F9FF',
    borderHex: '#0369A1',
    tableHeadBgHex: '#075985',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#075985', '#0284C7', '#E0F2FE'],
  },
  {
    id: 'harvard_crimson_ivory',
    name: 'Law Journal Crimson & Ivory',
    badge: 'Review',
    category: 'Editorial & Luxury',
    headerBgHex: '#7F1D1D',
    headerTextHex: '#FFFBEB',
    accentHex: '#991B1B',
    accentSoftBgHex: '#FEF2F2',
    borderHex: '#7F1D1D',
    tableHeadBgHex: '#881337',
    tableStripeBgHex: '#FAFAF9',
    bodyTextHex: '#18181B',
    mutedTextHex: '#52525B',
    swatchHexes: ['#7F1D1D', '#B91C1C', '#FFFBEB'],
  },
  {
    id: 'nordic_fjord_petrol',
    name: 'Nordic Fjord Petrol',
    badge: 'Modern',
    category: 'Editorial & Luxury',
    headerBgHex: '#164E63',
    headerTextHex: '#E0F2FE',
    accentHex: '#0E7490',
    accentSoftBgHex: '#F0F9FF',
    borderHex: '#155E75',
    tableHeadBgHex: '#164E63',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#164E63', '#0891B2', '#BAE6FD'],
  },
  {
    id: 'kyoto_matcha_ink',
    name: 'Kyoto Matcha & Sumi Ink',
    badge: 'Calm',
    category: 'Editorial & Luxury',
    headerBgHex: '#273B2C',
    headerTextHex: '#ECFCCB',
    accentHex: '#3F6212',
    accentSoftBgHex: '#F7FEE7',
    borderHex: '#365314',
    tableHeadBgHex: '#273B2C',
    tableStripeBgHex: '#FAFAF9',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#273B2C', '#4D7C0F', '#ECFCCB'],
  },
  {
    id: 'espresso_roast_linen',
    name: 'Barista Espresso & Linen',
    badge: 'Late Night',
    category: 'Editorial & Luxury',
    headerBgHex: '#2E1A12',
    headerTextHex: '#FDE68A',
    accentHex: '#78350F',
    accentSoftBgHex: '#FFFBEB',
    borderHex: '#451A03',
    tableHeadBgHex: '#2E1A12',
    tableStripeBgHex: '#FAFAF9',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#2E1A12', '#92400E', '#FDE68A'],
  },
  {
    id: 'midnight_indigo_copper',
    name: 'Midnight Copper Plate',
    badge: 'Engraved',
    category: 'Editorial & Luxury',
    headerBgHex: '#1E293B',
    headerTextHex: '#FDBA74',
    accentHex: '#C2410C',
    accentSoftBgHex: '#FFF7ED',
    borderHex: '#334155',
    tableHeadBgHex: '#1E293B',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#1E293B', '#EA580C', '#FDBA74'],
  },
  {
    id: 'pastel_mint_highlighter',
    name: 'Pastel Mint Study Highlighter',
    badge: 'Soft Ink',
    category: 'Pastel & Ink-Saver',
    headerBgHex: '#DCFCE7',
    headerTextHex: '#064E3B',
    accentHex: '#059669',
    accentSoftBgHex: '#F0FDF4',
    borderHex: '#10B981',
    tableHeadBgHex: '#D1FAE5',
    tableStripeBgHex: '#FFFFFF',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#DCFCE7', '#10B981', '#064E3B'],
  },
  {
    id: 'pastel_sky_highlighter',
    name: 'Pastel Sky Margin Notes',
    badge: 'Soft Ink',
    category: 'Pastel & Ink-Saver',
    headerBgHex: '#E0F2FE',
    headerTextHex: '#0C4A6E',
    accentHex: '#0284C7',
    accentSoftBgHex: '#F0F9FF',
    borderHex: '#38BDF8',
    tableHeadBgHex: '#E0F2FE',
    tableStripeBgHex: '#FFFFFF',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#E0F2FE', '#0284C7', '#0C4A6E'],
  },
  {
    id: 'pastel_lavender_codex',
    name: 'Pastel Lavender Bar Binder',
    badge: 'Soft Ink',
    category: 'Pastel & Ink-Saver',
    headerBgHex: '#F3E8FF',
    headerTextHex: '#3B0764',
    accentHex: '#7E22CE',
    accentSoftBgHex: '#FAF5FF',
    borderHex: '#A855F7',
    tableHeadBgHex: '#F3E8FF',
    tableStripeBgHex: '#FFFFFF',
    bodyTextHex: '#1E1B4B',
    mutedTextHex: '#4B5563',
    swatchHexes: ['#F3E8FF', '#9333EA', '#3B0764'],
  },
  {
    id: 'pastel_butter_legalpad',
    name: 'Classic Yellow Legal Pad',
    badge: 'Soft Ink',
    category: 'Pastel & Ink-Saver',
    headerBgHex: '#FEF9C3',
    headerTextHex: '#713F12',
    accentHex: '#B45309',
    accentSoftBgHex: '#FEFCE8',
    borderHex: '#EAB308',
    tableHeadBgHex: '#FEF08A',
    tableStripeBgHex: '#FFFFFF',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#57534E',
    swatchHexes: ['#FEF9C3', '#D97706', '#713F12'],
  },
  {
    id: 'rainbow_road_aurora',
    name: 'Rainbow Road Aurora Prism',
    badge: 'Star World',
    category: 'Mario Kingdom',
    headerBgHex: '#3B0764',
    headerTextHex: '#FDE047',
    accentHex: '#9333EA',
    accentSoftBgHex: '#FAF5FF',
    borderHex: '#581C87',
    tableHeadBgHex: '#581C87',
    tableStripeBgHex: '#FAF5FF',
    bodyTextHex: '#1E1B4B',
    mutedTextHex: '#4C1D95',
    swatchHexes: ['#3B0764', '#9333EA', '#FDE047'],
  },
  {
    id: 'chocolate_island_mocha',
    name: 'Chocolate Island Rich Mocha',
    badge: 'World 5',
    category: 'Mario Kingdom',
    headerBgHex: '#451A03',
    headerTextHex: '#FEF3C7',
    accentHex: '#92400E',
    accentSoftBgHex: '#FFFBEB',
    borderHex: '#78350F',
    tableHeadBgHex: '#78350F',
    tableStripeBgHex: '#FFFBEB',
    bodyTextHex: '#292524',
    mutedTextHex: '#57534E',
    swatchHexes: ['#451A03', '#92400E', '#FEF3C7'],
  },
  {
    id: 'sunken_ship_abyss',
    name: 'Sunken Ghost Ship Abyss',
    badge: 'World 6',
    category: 'Mario Kingdom',
    headerBgHex: '#020617',
    headerTextHex: '#2DD4BF',
    accentHex: '#0F766E',
    accentSoftBgHex: '#F0FDFA',
    borderHex: '#0F172A',
    tableHeadBgHex: '#0F172A',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#334155',
    swatchHexes: ['#020617', '#0F766E', '#2DD4BF'],
  },
  {
    id: 'senate_session_hall',
    name: 'Senate Session Hall Crimson & Oak',
    badge: 'Legislative',
    category: 'Legal & Classic',
    headerBgHex: '#4C0519',
    headerTextHex: '#FEE2E2',
    accentHex: '#881337',
    accentSoftBgHex: '#FFF1F2',
    borderHex: '#4C0519',
    tableHeadBgHex: '#4C0519',
    tableStripeBgHex: '#FFF1F2',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#44403C',
    swatchHexes: ['#4C0519', '#881337', '#B45309'],
  },
  {
    id: 'bar_examiner_emerald',
    name: '1987 Constitution Emerald & Seal Gold',
    badge: 'Supreme Seal',
    category: 'Legal & Classic',
    headerBgHex: '#064E3B',
    headerTextHex: '#ECFDF5',
    accentHex: '#047857',
    accentSoftBgHex: '#ECFDF5',
    borderHex: '#064E3B',
    tableHeadBgHex: '#064E3B',
    tableStripeBgHex: '#F0FDF4',
    bodyTextHex: '#064E3B',
    mutedTextHex: '#065F46',
    swatchHexes: ['#064E3B', '#047857', '#EAB308'],
  },
  {
    id: 'cambridge_claret_vellum',
    name: 'Cambridge Claret & Royal Vellum',
    badge: 'Oxbridge',
    category: 'Editorial & Luxury',
    headerBgHex: '#491217',
    headerTextHex: '#FFF8E7',
    accentHex: '#721C24',
    accentSoftBgHex: '#FCF8F2',
    borderHex: '#491217',
    tableHeadBgHex: '#491217',
    tableStripeBgHex: '#FFFDF9',
    bodyTextHex: '#1F1A18',
    mutedTextHex: '#4F443E',
    swatchHexes: ['#491217', '#721C24', '#C5A059'],
  },
  {
    id: 'tokyo_ginza_slate',
    name: 'Ginza Monolith Platinum & Carbon',
    badge: 'Precision',
    category: 'Editorial & Luxury',
    headerBgHex: '#0F172A',
    headerTextHex: '#F8FAFC',
    accentHex: '#334155',
    accentSoftBgHex: '#F1F5F9',
    borderHex: '#1E293B',
    tableHeadBgHex: '#1E293B',
    tableStripeBgHex: '#F8FAFC',
    bodyTextHex: '#0F172A',
    mutedTextHex: '#475569',
    swatchHexes: ['#0F172A', '#334155', '#94A3B8'],
  },
  {
    id: 'pastel_rose_quartz',
    name: 'Pastel Rose Quartz Digest',
    badge: 'Soft Rose',
    category: 'Pastel & Ink-Saver',
    headerBgHex: '#FFF1F2',
    headerTextHex: '#881337',
    accentHex: '#FB7185',
    accentSoftBgHex: '#FFF1F2',
    borderHex: '#FDA4AF',
    tableHeadBgHex: '#FFE4E6',
    tableStripeBgHex: '#FFFFFF',
    bodyTextHex: '#1C1917',
    mutedTextHex: '#4C0519',
    swatchHexes: ['#FFF1F2', '#FB7185', '#881337'],
  },
];

export interface ExtendedPrintFontSpec {
  id: string;
  name: string;
  badge: string;
  category: 'Sans-Serif' | 'Legal Serif' | 'Display & Mario' | 'Tabular Mono';
  primaryFamily: string;
  cssFontFamily: string;
  pdfBaseFamily: 'helvetica' | 'times' | 'courier';
  sizeScale: number;
  lineHeightScale: number;
  sampleText: string;
}

export const EXTENDED_PRINT_FONT_CATALOG: readonly ExtendedPrintFontSpec[] = [
  // Original 20 IDs preserved with genuine Google Font mappings
  {
    id: 'jakarta_sans',
    name: 'Plus Jakarta Sans',
    badge: 'Default',
    category: 'Sans-Serif',
    primaryFamily: 'Plus Jakarta Sans',
    cssFontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.0,
    lineHeightScale: 1.0,
    sampleText: 'Art. 87 Overtime (+25% / +30%)',
  },
  {
    id: 'classic_serif',
    name: 'Source Serif 4 (SCRA)',
    badge: 'Supreme Court',
    category: 'Legal Serif',
    primaryFamily: 'Source Serif 4',
    cssFontFamily: "'Source Serif 4', Georgia, serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.01,
    lineHeightScale: 1.03,
    sampleText: 'WHEREFORE, petition is GRANTED.',
  },
  {
    id: 'tabular_mono',
    name: 'IBM Plex Mono',
    badge: 'Audit Code',
    category: 'Tabular Mono',
    primaryFamily: 'IBM Plex Mono',
    cssFontFamily: "'IBM Plex Mono', monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 0.93,
    lineHeightScale: 1.02,
    sampleText: '200% × 1.30 = 260% Holiday OT',
  },
  {
    id: 'editorial_garamond',
    name: 'Cormorant Garamond',
    badge: 'Law Review',
    category: 'Legal Serif',
    primaryFamily: 'Cormorant Garamond',
    cssFontFamily: "'Cormorant Garamond', Garamond, serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.08,
    lineHeightScale: 1.02,
    sampleText: 'Republic of the Philippines',
  },
  {
    id: 'humanist_sans',
    name: 'Public Sans (Gov/DOLE)',
    badge: 'Official',
    category: 'Sans-Serif',
    primaryFamily: 'Public Sans',
    cssFontFamily: "'Public Sans', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.99,
    lineHeightScale: 1.0,
    sampleText: 'DOLE Department Order No. 174-17',
  },
  {
    id: 'georgia_bench',
    name: 'Georgia Judicial',
    badge: 'Bench',
    category: 'Legal Serif',
    primaryFamily: 'Georgia',
    cssFontFamily: "Georgia, 'Times New Roman', serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.0,
    lineHeightScale: 1.03,
    sampleText: 'Art. 297 Twin-Notice Due Process',
  },
  {
    id: 'palatino_chancery',
    name: 'Crimson Pro Chancery',
    badge: 'Treatise',
    category: 'Legal Serif',
    primaryFamily: 'Crimson Pro',
    cssFontFamily: "'Crimson Pro', 'Palatino Linotype', serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.05,
    lineHeightScale: 1.02,
    sampleText: 'Labor Standards & Welfare Statutes',
  },
  {
    id: 'baskerville_law',
    name: 'Libre Baskerville',
    badge: 'Codal',
    category: 'Legal Serif',
    primaryFamily: 'Libre Baskerville',
    cssFontFamily: "'Libre Baskerville', Baskerville, serif",
    pdfBaseFamily: 'times',
    sizeScale: 0.96,
    lineHeightScale: 1.05,
    sampleText: 'Presidential Decree No. 442',
  },
  {
    id: 'cambria_statute',
    name: 'Lora Contemporary Serif',
    badge: 'Readable',
    category: 'Legal Serif',
    primaryFamily: 'Lora',
    cssFontFamily: "'Lora', Cambria, Georgia, serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.0,
    lineHeightScale: 1.03,
    sampleText: 'R.A. 11210 · 105-Day Maternity Leave',
  },
  {
    id: 'playfair_diploma',
    name: 'Playfair Display',
    badge: 'Diploma',
    category: 'Display & Mario',
    primaryFamily: 'Playfair Display',
    cssFontFamily: "'Playfair Display', Georgia, serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.0,
    lineHeightScale: 1.04,
    sampleText: 'Grand Bar Reviewer Compendium',
  },
  {
    id: 'dm_sans_clean',
    name: 'DM Sans',
    badge: 'Crisp Sans',
    category: 'Sans-Serif',
    primaryFamily: 'DM Sans',
    cssFontFamily: "'DM Sans', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.0,
    lineHeightScale: 1.0,
    sampleText: '5-Day Commutable Service Incentive Leave',
  },
  {
    id: 'outfit_geometric',
    name: 'Outfit Geometric',
    badge: 'Modern',
    category: 'Sans-Serif',
    primaryFamily: 'Outfit',
    cssFontFamily: "'Outfit', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.0,
    lineHeightScale: 1.0,
    sampleText: '17 Regional Wage Boards Matrix',
  },
  {
    id: 'bricolage_editorial',
    name: 'Bricolage Grotesque',
    badge: 'Expressive',
    category: 'Display & Mario',
    primaryFamily: 'Bricolage Grotesque',
    cssFontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.99,
    lineHeightScale: 1.01,
    sampleText: 'R.A. 11360 · 100% Service Charges',
  },
  {
    id: 'trebuchet_syllabus',
    name: 'Manrope Syllabus Sans',
    badge: 'Balanced',
    category: 'Sans-Serif',
    primaryFamily: 'Manrope',
    cssFontFamily: "'Manrope', 'Trebuchet MS', sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.99,
    lineHeightScale: 1.01,
    sampleText: 'Auto Bus v. Bautista (G.R. 156367)',
  },
  {
    id: 'verdana_accessible',
    name: 'Verdana High-Legibility',
    badge: 'Wide Sans',
    category: 'Sans-Serif',
    primaryFamily: 'Verdana',
    cssFontFamily: 'Verdana, Geneva, sans-serif',
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.93,
    lineHeightScale: 1.04,
    sampleText: 'Clear Wide Spacing for Night Study',
  },
  {
    id: 'lexend_dyslexia_friendly',
    name: 'Lexend Ultra-Readable',
    badge: 'Eye-Friendly',
    category: 'Sans-Serif',
    primaryFamily: 'Lexend',
    cssFontFamily: "'Lexend', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.96,
    lineHeightScale: 1.04,
    sampleText: 'Zero Visual Crowding · Fast Recall',
  },
  {
    id: 'merriweather_digest',
    name: 'Merriweather Case Digest',
    badge: 'Casebook',
    category: 'Legal Serif',
    primaryFamily: 'Merriweather',
    cssFontFamily: "'Merriweather', Georgia, serif",
    pdfBaseFamily: 'times',
    sizeScale: 0.95,
    lineHeightScale: 1.05,
    sampleText: 'Asian Transmission v. CA (300%)',
  },
  {
    id: 'jetbrains_tabular',
    name: 'JetBrains Mono',
    badge: 'Developer',
    category: 'Tabular Mono',
    primaryFamily: 'JetBrains Mono',
    cssFontFamily: "'JetBrains Mono', monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 0.92,
    lineHeightScale: 1.03,
    sampleText: 'Pineda: (MinWage / Salary) × Increase',
  },
  {
    id: 'fira_code_audit',
    name: 'Fira Code',
    badge: 'Technical',
    category: 'Tabular Mono',
    primaryFamily: 'Fira Code',
    cssFontFamily: "'Fira Code', monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 0.92,
    lineHeightScale: 1.03,
    sampleText: 'R.A. 7641 = 22.5 Days / Year',
  },
  {
    id: 'courier_docket',
    name: 'Courier Prime Docket',
    badge: 'Typewriter',
    category: 'Tabular Mono',
    primaryFamily: 'Courier New',
    cssFontFamily: "'Courier New', Courier, monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 0.94,
    lineHeightScale: 1.03,
    sampleText: 'NLRC RAB CASE NO. 04-2025',
  },

  // 16 Brand-New Printable Fonts (21 through 36)
  {
    id: 'press_start_mario',
    name: 'Press Start 2P (Mario Pixel)',
    badge: '8-Bit Retro',
    category: 'Display & Mario',
    primaryFamily: 'Press Start 2P',
    cssFontFamily: "'Press Start 2P', monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 0.68,
    lineHeightScale: 1.32,
    sampleText: 'WORLD 1-1 LABOR QUEST',
  },
  {
    id: 'cinzel_supreme',
    name: 'Cinzel Roman Engraved',
    badge: 'Imperial',
    category: 'Display & Mario',
    primaryFamily: 'Cinzel',
    cssFontFamily: "'Cinzel', Georgia, serif",
    pdfBaseFamily: 'times',
    sizeScale: 0.96,
    lineHeightScale: 1.05,
    sampleText: 'SUPREME COURT JURISPRUDENCE',
  },
  {
    id: 'fraunces_editorial',
    name: 'Fraunces Old-Style',
    badge: 'Bookish',
    category: 'Legal Serif',
    primaryFamily: 'Fraunces',
    cssFontFamily: "'Fraunces', Georgia, serif",
    pdfBaseFamily: 'times',
    sizeScale: 0.99,
    lineHeightScale: 1.03,
    sampleText: 'Social Justice & Protection to Labor',
  },
  {
    id: 'eb_garamond_codex',
    name: 'EB Garamond Classical',
    badge: '16th Cent.',
    category: 'Legal Serif',
    primaryFamily: 'EB Garamond',
    cssFontFamily: "'EB Garamond', Garamond, serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.06,
    lineHeightScale: 1.02,
    sampleText: 'In dubio pro operario · Art. 4',
  },
  {
    id: 'spectral_scra',
    name: 'Spectral Law Reports',
    badge: 'Crisp Print',
    category: 'Legal Serif',
    primaryFamily: 'Spectral',
    cssFontFamily: "'Spectral', Georgia, serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.0,
    lineHeightScale: 1.03,
    sampleText: 'Sime Darby v. NLRC · Meal Periods',
  },
  {
    id: 'pt_serif_gazette',
    name: 'PT Serif Official Gazette',
    badge: 'Gazette',
    category: 'Legal Serif',
    primaryFamily: 'PT Serif',
    cssFontFamily: "'PT Serif', Georgia, serif",
    pdfBaseFamily: 'times',
    sizeScale: 0.98,
    lineHeightScale: 1.03,
    sampleText: 'Published in the Official Gazette',
  },
  {
    id: 'archivo_grotesque',
    name: 'Archivo Neo-Grotesque',
    badge: 'Headline',
    category: 'Sans-Serif',
    primaryFamily: 'Archivo',
    cssFontFamily: "'Archivo', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.99,
    lineHeightScale: 1.01,
    sampleText: 'Mandatory 13th-Month Pay (P.D. 851)',
  },
  {
    id: 'oswald_condensed',
    name: 'Oswald Condensed Brief',
    badge: 'Compact',
    category: 'Display & Mario',
    primaryFamily: 'Oswald',
    cssFontFamily: "'Oswald', Arial, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.98,
    lineHeightScale: 1.04,
    sampleText: 'HIGH-DENSITY BAR MEMORY CAPSULE',
  },
  {
    id: 'urbanist_clean',
    name: 'Urbanist Architectural',
    badge: 'Geometric',
    category: 'Sans-Serif',
    primaryFamily: 'Urbanist',
    cssFontFamily: "'Urbanist', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.01,
    lineHeightScale: 1.0,
    sampleText: 'Telecommuting Act (R.A. No. 11165)',
  },
  {
    id: 'quicksand_friendly',
    name: 'Quicksand Rounded Study',
    badge: 'Friendly',
    category: 'Sans-Serif',
    primaryFamily: 'Quicksand',
    cssFontFamily: "'Quicksand', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.0,
    lineHeightScale: 1.02,
    sampleText: 'Kasambahay Rights under R.A. 10361',
  },
  {
    id: 'josefin_vintage',
    name: 'Josefin Sans Art-Deco',
    badge: 'Art Deco',
    category: 'Display & Mario',
    primaryFamily: 'Josefin Sans',
    cssFontFamily: "'Josefin Sans', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.02,
    lineHeightScale: 1.03,
    sampleText: 'Safe Spaces Act · CODI Mandate',
  },
  {
    id: 'orbitron_starroad',
    name: 'Orbitron Star-Road',
    badge: 'Sci-Fi Mario',
    category: 'Display & Mario',
    primaryFamily: 'Orbitron',
    cssFontFamily: "'Orbitron', sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.88,
    lineHeightScale: 1.12,
    sampleText: 'STAR ROAD WAGE MATRIX 2026',
  },
  {
    id: 'space_mono_ledger',
    name: 'Space Mono Payroll Ledger',
    badge: 'Payroll',
    category: 'Tabular Mono',
    primaryFamily: 'Space Mono',
    cssFontFamily: "'Space Mono', monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 0.9,
    lineHeightScale: 1.06,
    sampleText: 'Daily: P645.00 | OT: P100.78/hr',
  },
  {
    id: 'inconsolata_codal',
    name: 'Inconsolata Clean Mono',
    badge: 'Slim Mono',
    category: 'Tabular Mono',
    primaryFamily: 'Inconsolata',
    cssFontFamily: "'Inconsolata', monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 1.02,
    lineHeightScale: 1.01,
    sampleText: 'Art. 306: 3Y Money · 4Y Dismissal',
  },
  {
    id: 'caveat_handwritten',
    name: 'Caveat Margin Handwritten',
    badge: 'Handwritten',
    category: 'Display & Mario',
    primaryFamily: 'Caveat',
    cssFontFamily: "'Caveat', cursive, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.16,
    lineHeightScale: 1.02,
    sampleText: 'Remember: Undertime never offsets OT!',
  },
  {
    id: 'times_new_roman_trad',
    name: 'Times New Roman Pleading',
    badge: 'Pleading',
    category: 'Legal Serif',
    primaryFamily: 'Times New Roman',
    cssFontFamily: "'Times New Roman', Times, serif",
    pdfBaseFamily: 'times',
    sizeScale: 1.02,
    lineHeightScale: 1.02,
    sampleText: 'RESPECTFULLY SUBMITTED. Manila, PH.',
  },
  {
    id: 'inter_clean',
    name: 'Inter Clean Juris',
    badge: 'Ultra Clear',
    category: 'Sans-Serif',
    primaryFamily: 'Inter',
    cssFontFamily: "'Inter', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.98,
    lineHeightScale: 1.0,
    sampleText: 'Art. 297 Just Causes for Termination',
  },
  {
    id: 'noto_sans_universal',
    name: 'Noto Sans Universal',
    badge: 'DOLE Global',
    category: 'Sans-Serif',
    primaryFamily: 'Noto Sans',
    cssFontFamily: "'Noto Sans', system-ui, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.99,
    lineHeightScale: 1.0,
    sampleText: 'Labor Standards Code of the Philippines',
  },
  {
    id: 'fredoka_bubble',
    name: 'Fredoka Mario Friendly',
    badge: 'Mario Bubble',
    category: 'Display & Mario',
    primaryFamily: 'Fredoka',
    cssFontFamily: "'Fredoka', cursive, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.04,
    lineHeightScale: 1.02,
    sampleText: 'Super Mario Labor Law Power-Up!',
  },
  {
    id: 'pixelify_retro',
    name: 'Pixelify 16-Bit Arcade',
    badge: '16-Bit Retro',
    category: 'Display & Mario',
    primaryFamily: 'Pixelify Sans',
    cssFontFamily: "'Pixelify Sans', cursive, sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 1.06,
    lineHeightScale: 1.04,
    sampleText: 'WORLD 1-1 STATUTORY WAGES CLEAR!',
  },
  {
    id: 'silkscreen_nes',
    name: 'Silkscreen NES Micro',
    badge: 'NES Pixel',
    category: 'Display & Mario',
    primaryFamily: 'Silkscreen',
    cssFontFamily: "'Silkscreen', monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 0.92,
    lineHeightScale: 1.08,
    sampleText: '100 COINS = 1 13TH MONTH PAY',
  },
  {
    id: 'dotgothic_arcade',
    name: 'DotGothic Arcade Matrix',
    badge: 'Retro CRT',
    category: 'Display & Mario',
    primaryFamily: 'DotGothic16',
    cssFontFamily: "'DotGothic16', sans-serif",
    pdfBaseFamily: 'courier',
    sizeScale: 1.02,
    lineHeightScale: 1.02,
    sampleText: 'BAR EXAM STATUTORY SPEED DRILL',
  },
  {
    id: 'space_grotesk_modern',
    name: 'Space Grotesk Tech Juris',
    badge: 'Cyber Law',
    category: 'Sans-Serif',
    primaryFamily: 'Space Grotesk',
    cssFontFamily: "'Space Grotesk', sans-serif",
    pdfBaseFamily: 'helvetica',
    sizeScale: 0.98,
    lineHeightScale: 1.02,
    sampleText: 'Four-Fold Control Test Matrix 2026',
  },
  {
    id: 'vt323_docket_terminal',
    name: 'VT323 Docket Terminal',
    badge: 'Green Screen',
    category: 'Tabular Mono',
    primaryFamily: 'VT323',
    cssFontFamily: "'VT323', monospace",
    pdfBaseFamily: 'courier',
    sizeScale: 1.25,
    lineHeightScale: 1.0,
    sampleText: 'G.R. No. L-12345 DOCKET ENTRY OK',
  },
];

export const LEGACY_PRINT_THEME_ALIASES: Record<string, string> = {
  // All 24 IDs from original PRINT_COLOR_THEMES
  executive_navy: 'classic_navy',
  supreme_court_crimson: 'nlrc_burgundy',
  forest_dole_emerald: 'emerald_counsel',
  vintage_parchment: 'royal_parchment',
  mario_mushroom_red: 'mario_crimson',
  starlight_cobalt: 'rosalina_cobalt',
  royal_amethyst: 'waluigi_amethyst',
  yoshi_jade_lime: 'yoshi_island_jade',
  teal_tribunal: 'dole_teal',
  terracotta_codal: 'terracotta_codal',
  bowser_obsidian_gold: 'bowser_fortress_ember',
  peach_blossom_rose: 'peach_rosewood',
  luigi_mansion_jade: 'forest_illusion_moss',
  rosalina_cosmic_ice: 'rosalina_cobalt',
  golden_crown_ivory: 'charcoal_gold',
  sakura_editorial: 'peach_rosewood',
  midnight_espresso: 'espresso_roast_linen',
  arctic_glacier: 'arctic_slate',
  solarized_amber: 'daisy_sarasaland_amber',
  mint_dole_ledger: 'dole_teal',
  sunset_coral: 'toad_bazaar_vermilion',
  indigo_jurisprudence: 'oxford_indigo',
  wario_royal_gold: 'wario_bullion_vault',
  ink_saver_bw: 'ink_saver_bw',

  // Mario Kingdom & Law Review aliases
  royal_parchment_gold: 'royal_parchment',
  rosalina_cosmic_teal: 'rosalina_cobalt',
  rosalina_comet: 'rosalina_cobalt',
  peach_royal_blossom: 'peach_rosewood',
  peach_blossom: 'peach_rosewood',
  luigi_emerald_manor: 'forest_illusion_moss',
  luigi_mansion: 'forest_illusion_moss',
  bowser_obsidian_flame: 'bowser_fortress_ember',
  bowser_lava: 'bowser_fortress_ember',
  yoshi_spring_meadow: 'yoshi_island_jade',
  yoshi_meadow: 'yoshi_island_jade',
  toad_royal_sapphire: 'vanilla_dome_sapphire',
  sapphire_counsel: 'vanilla_dome_sapphire',
  star_cup_amber: 'daisy_sarasaland_amber',
  daisy_sunflower_ochre: 'daisy_sarasaland_amber',
  daisy_sarasaland: 'daisy_sarasaland_amber',
  waluigi_amethyst_court: 'waluigi_amethyst',
  waluigi_velvet: 'waluigi_amethyst',
  wario_bullion_vault: 'wario_bullion_vault',
  wario_treasury: 'wario_bullion_vault',
  arctic_sherbet_slate: 'arctic_slate',
  ice_flower_frost: 'arctic_slate',
  mahogany_law_journal: 'mahogany_bench',
  espresso_roast: 'espresso_roast_linen',
  slate_minimalist_pro: 'ink_saver_bw',
  minimal_slate: 'ink_saver_bw',
  midnight_indigo_brief: 'midnight_indigo_copper',
  indigo_tribunal: 'midnight_indigo_copper',
};

const LEGACY_PRINT_FONT_ALIASES: Record<string, string> = {
  modern_sans: 'jakarta_sans',
  editorial_serif: 'merriweather_digest',
  classic_garamond: 'editorial_garamond',
  cormorant_chancery: 'editorial_garamond',
  humanist_lexend: 'lexend_dyslexia_friendly',
  dyslexic_sans: 'lexend_dyslexia_friendly',
  lexend_dyslexia: 'lexend_dyslexia_friendly',
  playfair_royal: 'playfair_diploma',
  source_serif_pro: 'classic_serif',
  source_serif_codal: 'classic_serif',
  crimson_codal: 'classic_serif',
  crimson_juris: 'classic_serif',
  baskerville_bench: 'baskerville_law',
  libre_baskerville: 'baskerville_law',
  baskerville_court: 'baskerville_law',
  lora_contemporary: 'pt_serif_gazette',
  warm_charter: 'pt_serif_gazette',
  lora_scholar: 'pt_serif_gazette',
  dm_sans: 'dm_sans_clean',
  dm_sans_clean: 'dm_sans_clean',
  dm_sans_modern: 'dm_sans_clean',
  public_sans_gov: 'humanist_sans',
  clean_inter: 'humanist_sans',
  outfit_geometric: 'outfit_geometric',
  outfit_executive: 'outfit_geometric',
  bricolage_display: 'bricolage_editorial',
  space_grotesk: 'bricolage_editorial',
  condensed_narrow: 'oswald_condensed',
  ibm_plex_mono_audit: 'tabular_mono',
  ibm_plex_docket: 'tabular_mono',
  jetbrains_tabular: 'jetbrains_tabular',
  jetbrains_code: 'jetbrains_tabular',
  classic_monospace: 'jetbrains_tabular',
  fira_code_matrix: 'fira_code_audit',
  fira_code_statute: 'fira_code_audit',
  retro_mario_mono: 'press_start_mario',
  georgia_chambers: 'georgia_bench',
  formal_georgia: 'georgia_bench',
  times_supreme: 'times_new_roman_trad',
  academic_times: 'times_new_roman_trad',
  courier_docket: 'courier_docket',
  courier_typewriter: 'courier_docket',
  press_start_retro: 'press_start_mario',
};

export function resolveExtendedPrintTheme(themeId?: string): ExtendedPrintThemeSpec {
  if (!themeId) return EXTENDED_PRINT_COLOR_THEMES[0];
  const directMatch = EXTENDED_PRINT_COLOR_THEMES.find((t) => t.id === themeId);
  if (directMatch) return directMatch;
  const mappedId = LEGACY_PRINT_THEME_ALIASES[themeId];
  if (mappedId) {
    const aliasMatch = EXTENDED_PRINT_COLOR_THEMES.find((t) => t.id === mappedId);
    if (aliasMatch) return aliasMatch;
  }
  return EXTENDED_PRINT_COLOR_THEMES[0];
}

export function resolveExtendedPrintFont(fontId?: string): ExtendedPrintFontSpec {
  if (!fontId) return EXTENDED_PRINT_FONT_CATALOG[0];
  const directMatch = EXTENDED_PRINT_FONT_CATALOG.find((f) => f.id === fontId);
  if (directMatch) return directMatch;
  const mappedId = LEGACY_PRINT_FONT_ALIASES[fontId];
  if (mappedId) {
    const aliasMatch = EXTENDED_PRINT_FONT_CATALOG.find((f) => f.id === mappedId);
    if (aliasMatch) return aliasMatch;
  }
  return EXTENDED_PRINT_FONT_CATALOG[0];
}

export function buildCanvasFontString(
  fontSpec: ExtendedPrintFontSpec,
  weight: 400 | 600 | 700 | 800,
  basePx: number,
  italic: boolean = false
): string {
  const scaledPx = Math.max(10, Math.round(basePx * fontSpec.sizeScale));
  const actualWeight =
    fontSpec.id === 'press_start_mario' || fontSpec.id === 'caveat_handwritten'
      ? 400
      : weight;
  const stylePrefix = italic ? 'italic ' : '';
  return `${stylePrefix}${actualWeight} ${scaledPx}px ${fontSpec.cssFontFamily}`;
}

// ============================================================================
// 2. NAVBAR MARIO STUDY AMBIENCE SOUNDSCAPES
// ============================================================================

export type MarioNavbarAmbienceId =
  | 'off'
  | 'overworld_breeze'
  | 'underground_echoes'
  | 'peach_castle_rain'
  | 'rosalina_starlight'
  | 'yoshi_tropic_waves'
  | 'koopa_library_hearth'
  | 'forest'
  | 'underwater'
  | 'castle'
  | 'rainy_library'
  | 'starry_night';

export interface MarioNavbarAmbienceOption {
  id: MarioNavbarAmbienceId;
  label: string;
  shortLabel: string;
  worldTag: string;
  subtitle: string;
}

export const MARIO_NAVBAR_AMBIENCE_OPTIONS: readonly MarioNavbarAmbienceOption[] = [
  {
    id: 'off',
    label: 'Ambience: Off',
    shortLabel: 'Off',
    worldTag: 'Silent',
    subtitle: 'Quiet study room without background soundscape',
  },
  {
    id: 'overworld_breeze',
    label: 'Overworld Breeze',
    shortLabel: 'Overworld Breeze',
    worldTag: 'World 1',
    subtitle: 'Gentle Mushroom Kingdom meadow wind & soft coin-chime harmonics',
  },
  {
    id: 'underground_echoes',
    label: 'Underground Echoes',
    shortLabel: 'Underground Echoes',
    worldTag: 'World 3',
    subtitle: 'Vanilla Dome crystal cavern resonance & subterranean water droplets',
  },
  {
    id: 'peach_castle_rain',
    label: 'Peach Castle Rain',
    shortLabel: 'Castle Rain',
    worldTag: 'World 6',
    subtitle: 'Warm stained-glass library rain pattering for deep codal reading',
  },
  {
    id: 'rosalina_starlight',
    label: 'Starlight Observatory',
    shortLabel: 'Starlight',
    worldTag: 'Star Road',
    subtitle: 'Celestial Luma synth pads & calm zero-gravity shimmer',
  },
  {
    id: 'yoshi_tropic_waves',
    label: 'Yoshi Tropic Shore',
    shortLabel: 'Tropic Waves',
    worldTag: 'World 2',
    subtitle: 'Calm tropical lagoon surf & warm island marimba breeze',
  },
  {
    id: 'koopa_library_hearth',
    label: 'Koopa Keep Hearth',
    shortLabel: 'Keep Hearth',
    worldTag: 'World 5',
    subtitle: 'Crackling fireplace embers & low amber study hall drone',
  },
] as const;

// ============================================================================
// 3. OVERALL LABOR LAW VISUAL PROGRESS BAR (MODULES VIEW TOP BANNER)
// ============================================================================

export interface OverallLaborLawWorldStat {
  worldId: string;
  shortLabel: string;
  completed: number;
  total: number;
  percent: number;
}

export interface OverallLaborLawMilestone {
  thresholdPct: number;
  title: string;
  marioItem: 'mushroom' | 'flower' | 'star' | 'crown';
  reached: boolean;
}

export interface OverallLaborLawProgressSummary {
  completedTopics: number;
  totalTopics: number;
  topicPercent: number;
  masteredSubSections: number;
  totalSubSections: number;
  combinedExperiencePercent: number;
  remainingTopics: number;
  rankTitle: string;
  milestones: OverallLaborLawMilestone[];
  worldBreakdown: OverallLaborLawWorldStat[];
}

const WORLD_ORDER_META: readonly { id: string; shortLabel: string }[] = [
  { id: 'world1', shortLabel: 'W1 Hours' },
  { id: 'world2', shortLabel: 'W2 Rest/13th' },
  { id: 'world3', shortLabel: 'W3 Wages' },
  { id: 'world4', shortLabel: 'W4 Groups' },
  { id: 'world5', shortLabel: 'W5 Protective' },
  { id: 'world6', shortLabel: 'W6 Leaves' },
];

export function computeOverallLaborLawProgress(params: {
  allTopics: readonly Pick<LawTopic, 'id' | 'worldId' | 'rules'>[];
  completedTopicIds: readonly string[];
  masteredRuleKeysByTopic?: Record<string, readonly string[]>;
}): OverallLaborLawProgressSummary {
  const totalTopics = params.allTopics.length;
  const completedSet = new Set(params.completedTopicIds);
  const completedTopics = params.allTopics.filter((t) => completedSet.has(t.id)).length;
  const topicPercent =
    totalTopics > 0 ? Math.min(100, Math.round((completedTopics / totalTopics) * 100)) : 0;

  let totalSubSections = 0;
  let masteredSubSections = 0;

  for (const topic of params.allTopics) {
    const ruleCount = Math.max(1, topic.rules?.length || 1);
    totalSubSections += ruleCount;
    if (completedSet.has(topic.id)) {
      masteredSubSections += ruleCount;
    } else {
      const customMastered = params.masteredRuleKeysByTopic?.[topic.id]?.length || 0;
      masteredSubSections += Math.min(ruleCount, customMastered);
    }
  }

  const combinedExperiencePercent =
    totalSubSections > 0
      ? Math.min(100, Math.round((masteredSubSections / totalSubSections) * 100))
      : topicPercent;

  const effectivePct = Math.max(topicPercent, combinedExperiencePercent);

  const rankTitle =
    topicPercent >= 100
      ? 'Grand Star Counsel · 100% Mastered'
      : effectivePct >= 75
      ? 'Super Star Litigator · Final Stretch'
      : effectivePct >= 50
      ? 'Fire Flower Advocate · Halfway Cleared'
      : effectivePct >= 25
      ? 'Super Mushroom Scholar · Building Momentum'
      : '1-1 Apprentice · Start Mastering Stages';

  const milestones: OverallLaborLawMilestone[] = [
    {
      thresholdPct: 25,
      title: 'Super Mushroom (25%)',
      marioItem: 'mushroom',
      reached: effectivePct >= 25,
    },
    {
      thresholdPct: 50,
      title: 'Fire Flower (50%)',
      marioItem: 'flower',
      reached: effectivePct >= 50,
    },
    {
      thresholdPct: 75,
      title: 'Super Star (75%)',
      marioItem: 'star',
      reached: effectivePct >= 75,
    },
    {
      thresholdPct: 100,
      title: 'Royal Crown Clear (100%)',
      marioItem: 'crown',
      reached: topicPercent >= 100,
    },
  ];

  const worldBreakdown: OverallLaborLawWorldStat[] = WORLD_ORDER_META.map((wm) => {
    const worldTopics = params.allTopics.filter((t) => t.worldId === wm.id);
    const done = worldTopics.filter((t) => completedSet.has(t.id)).length;
    const tot = worldTopics.length;
    return {
      worldId: wm.id,
      shortLabel: wm.shortLabel,
      completed: done,
      total: tot,
      percent: tot > 0 ? Math.round((done / tot) * 100) : 0,
    };
  });

  return {
    completedTopics,
    totalTopics,
    topicPercent,
    masteredSubSections,
    totalSubSections,
    combinedExperiencePercent,
    remainingTopics: Math.max(0, totalTopics - completedTopics),
    rankTitle,
    milestones,
    worldBreakdown,
  };
}

// ============================================================================
// 4. FAVORITE TOPICS TOGGLE & WORLD MAP 'FAVORITES' VIEW FILTER
// ============================================================================

export const FAVORITE_TOPICS_STORAGE_KEY = 'mario_bookmarked_topics';

export function toggleFavoriteTopicId(
  currentIds: readonly string[],
  topicId: string
): { nextIds: string[]; isNowFavorite: boolean } {
  const clean = (topicId || '').trim();
  if (!clean) {
    return { nextIds: [...currentIds], isNowFavorite: false };
  }
  const exists = currentIds.includes(clean);
  if (exists) {
    return {
      nextIds: currentIds.filter((id) => id !== clean),
      isNowFavorite: false,
    };
  }
  return {
    nextIds: [clean, ...currentIds.filter((id) => id !== clean)],
    isNowFavorite: true,
  };
}

export function filterFavoriteTopics<T extends { id: string }>(
  allTopics: readonly T[],
  favoriteIds: readonly string[]
): T[] {
  if (!favoriteIds.length) return [];
  const favOrder = new Map<string, number>();
  favoriteIds.forEach((id, idx) => favOrder.set(id, idx));
  return allTopics
    .filter((t) => favOrder.has(t.id))
    .sort((a, b) => (favOrder.get(a.id) ?? 999) - (favOrder.get(b.id) ?? 999));
}

// ============================================================================
// 5. ARCADE SPEED NORMALIZATION, REAL PINBALL CENTER DRAIN & PASS THRESHOLDS
// ============================================================================

export const PINBALL_LEFT_FLIPPER_MIN_X = 76;
export const PINBALL_LEFT_FLIPPER_MAX_X = 212;
export const PINBALL_RIGHT_FLIPPER_MIN_X = 308;
export const PINBALL_RIGHT_FLIPPER_MAX_X = 444;
export const PINBALL_FLIPPER_Y = 302;
export const PINBALL_DRAIN_Y = 338;
export const PINBALL_PASS_SCORE = 1800;
export const PINBALL_JACKPOT_SCORE = 2600;

export interface KoopaPinballStepInput {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rawDt: number;
  leftFlip: boolean;
  rightFlip: boolean;
  ballsLeft: number;
  score: number;
}

export interface KoopaPinballStepResult {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ballsLeft: number;
  drainedThisStep: boolean;
  bouncedFlipper: 'left' | 'right' | null;
  gameOver: boolean;
  passed: boolean;
}

/**
 * Pure simulation step for Koopa Pinball Arena:
 * - Enforces a genuine 96px center drain gap (x in 212..308) between flippers!
 * - Flippers ONLY kick the ball upward strongly when the player actively holds/presses
 *   that flipper (`leftFlip` / `rightFlip`); passive unpressed flippers let the shell
 *   roll down toward the center drain trough so neglect causes real shell loss!
 */
export function stepKoopaPinballBall(input: KoopaPinballStepInput): KoopaPinballStepResult {
  const dt = Math.min(Math.max(0, input.rawDt), 0.05);
  let { x, y, vx, vy, ballsLeft } = input;

  const gravity = 460;
  vy += gravity * dt;
  x += vx * dt;
  y += vy * dt;

  // Arena walls (width 520)
  if (x < 28) {
    x = 28;
    vx = Math.abs(vx) * 0.9;
  } else if (x > 492) {
    x = 492;
    vx = -Math.abs(vx) * 0.9;
  }
  if (y < 24) {
    y = 24;
    vy = Math.abs(vy) * 0.88;
  }

  let bouncedFlipper: 'left' | 'right' | null = null;

  // Left flipper collision (x: 76..212 — leaves 212..308 open center drain!)
  if (
    vy > 0 &&
    y >= PINBALL_FLIPPER_Y - 9 &&
    y <= PINBALL_FLIPPER_Y + 13 &&
    x >= PINBALL_LEFT_FLIPPER_MIN_X &&
    x <= PINBALL_LEFT_FLIPPER_MAX_X
  ) {
    if (input.leftFlip) {
      y = PINBALL_FLIPPER_Y - 10;
      vy = -425;
      const offsetRatio =
        (x - PINBALL_LEFT_FLIPPER_MIN_X) /
        (PINBALL_LEFT_FLIPPER_MAX_X - PINBALL_LEFT_FLIPPER_MIN_X);
      vx += (offsetRatio - 0.35) * 190;
      bouncedFlipper = 'left';
    } else {
      // Unpressed resting flipper slopes steeply down toward center drain (x=212+)!
      vx = Math.max(vx + 95 * dt * 60 * 0.18, 120);
      vy = Math.max(75, vy * 0.75);
    }
  }

  // Right flipper collision (x: 308..444)
  if (
    vy > 0 &&
    y >= PINBALL_FLIPPER_Y - 9 &&
    y <= PINBALL_FLIPPER_Y + 13 &&
    x >= PINBALL_RIGHT_FLIPPER_MIN_X &&
    x <= PINBALL_RIGHT_FLIPPER_MAX_X
  ) {
    if (input.rightFlip) {
      y = PINBALL_FLIPPER_Y - 10;
      vy = -425;
      const offsetRatio =
        (PINBALL_RIGHT_FLIPPER_MAX_X - x) /
        (PINBALL_RIGHT_FLIPPER_MAX_X - PINBALL_RIGHT_FLIPPER_MIN_X);
      vx -= (offsetRatio - 0.35) * 190;
      bouncedFlipper = 'right';
    } else {
      // Unpressed resting flipper slopes steeply down toward center drain (x=308-)!
      vx = Math.min(vx - 95 * dt * 60 * 0.18, -120);
      vy = Math.max(75, vy * 0.75);
    }
  }

  // Clamp horizontal speed for fair playability
  vx = Math.max(-360, Math.min(360, vx));

  let drainedThisStep = false;
  let gameOver = false;
  if (y > PINBALL_DRAIN_Y) {
    drainedThisStep = true;
    ballsLeft = Math.max(0, ballsLeft - 1);
    if (ballsLeft <= 0) {
      gameOver = true;
    } else {
      x = 260;
      y = 35;
      vx = (Math.random() > 0.5 ? 1 : -1) * 35;
      vy = 25;
    }
  }

  const passed = input.score >= PINBALL_PASS_SCORE;

  return {
    x,
    y,
    vx,
    vy,
    ballsLeft,
    drainedThisStep,
    bouncedFlipper,
    gameOver,
    passed,
  };
}

export const LAW_CATCHER_PASS_SCORE = 220;

/**
 * Computes calm, classic frame-rate-independent fall distance for LawCatcher & Catching games.
 */
export function computeCatcherFallDelta(speedPxPerSec: number, rawDt: number): number {
  const dt = Math.min(Math.max(0, rawDt), 0.05);
  const clampedSpeed = Math.max(60, Math.min(165, speedPxPerSec));
  return clampedSpeed * dt;
}

export function evaluateArcadePassOutcome(params: {
  score: number;
  passScore: number;
  jackpotScore?: number;
  passCoins: number;
  jackpotCoins?: number;
}): { passed: boolean; isJackpot: boolean; coinsEarned: number } {
  if (params.score < params.passScore) {
    return { passed: false, isJackpot: false, coinsEarned: 0 };
  }
  const jackpotTarget = params.jackpotScore ?? Math.round(params.passScore * 1.45);
  if (params.score >= jackpotTarget) {
    return {
      passed: true,
      isJackpot: true,
      coinsEarned: params.jackpotCoins ?? Math.round(params.passCoins * 1.6),
    };
  }
  return {
    passed: true,
    isJackpot: false,
    coinsEarned: params.passCoins,
  };
}

// ============================================================================
// 6. UNIVERSAL TOAD'S SHOP ITEM RESOLVERS (FRAMES, PETS, NAMEPLATES, MYSTERY [?])
// ============================================================================

export interface UniversalCardFrameStyle {
  id: string;
  label: string;
  borderClasses: string;
  badgeText: string | null;
  badgeClasses: string;
}

export function resolveUniversalCardFrame(frameId?: string): UniversalCardFrameStyle {
  switch (frameId) {
    case 'frame_royal_gold':
      return {
        id: 'frame_royal_gold',
        label: 'Royal Gold Frame',
        borderClasses:
          'border-amber-400 ring-4 ring-yellow-300/80 shadow-[0_8px_0_#92400E,0_0_22px_rgba(250,204,21,0.38)]',
        badgeText: 'ROYAL GOLD FRAME',
        badgeClasses: 'bg-amber-400 text-slate-950 border-amber-700',
      };
    case 'frame_emerald_pipe':
      return {
        id: 'frame_emerald_pipe',
        label: 'Warp Pipe Emerald Frame',
        borderClasses:
          'border-emerald-500 ring-4 ring-emerald-300/80 shadow-[0_8px_0_#064E3B,0_0_20px_rgba(16,185,129,0.34)]',
        badgeText: 'WARP PIPE FRAME',
        badgeClasses: 'bg-emerald-400 text-slate-950 border-emerald-800',
      };
    case 'frame_bowser_lava':
      return {
        id: 'frame_bowser_lava',
        label: 'Bowser Magma Frame',
        borderClasses:
          'border-red-600 ring-4 ring-orange-500/80 shadow-[0_8px_0_#450A0A,0_0_22px_rgba(239,68,68,0.4)]',
        badgeText: 'BOWSER MAGMA FRAME',
        badgeClasses: 'bg-red-600 text-amber-200 border-red-950',
      };
    case 'frame_cosmic_star':
      return {
        id: 'frame_cosmic_star',
        label: 'Cosmic Starlight Frame',
        borderClasses:
          'border-cyan-400 ring-4 ring-indigo-400/80 shadow-[0_8px_0_#1E1B4B,0_0_22px_rgba(56,189,248,0.4)]',
        badgeText: 'STARLIGHT FRAME',
        badgeClasses: 'bg-cyan-400 text-slate-950 border-indigo-900',
      };
    case 'frame_koopa_sovereign':
      return {
        id: 'frame_koopa_sovereign',
        label: 'Koopa Sovereign Boss Frame',
        borderClasses:
          'border-rose-500 ring-4 ring-amber-400/85 shadow-[0_8px_0_#4C0519,0_0_24px_rgba(244,63,94,0.42)]',
        badgeText: 'KOOPA SOVEREIGN',
        badgeClasses: 'bg-rose-600 text-amber-200 border-black',
      };
    case 'frame_retro_brick':
      return {
        id: 'frame_retro_brick',
        label: '1985 Heritage Brick Frame',
        borderClasses:
          'border-amber-700 ring-4 ring-orange-400/85 shadow-[0_8px_0_#431407,0_0_18px_rgba(234,88,12,0.34)]',
        badgeText: '1985 RETRO BRICK',
        badgeClasses: 'bg-amber-700 text-amber-100 border-black',
      };
    case 'frame_starlight_prism':
      return {
        id: frameId,
        label: 'Starlight Observatory Frame',
        borderClasses:
          'border-cyan-400 ring-4 ring-indigo-400/85 shadow-[0_8px_0_#1E1B4B,0_0_22px_rgba(56,189,248,0.42)]',
        badgeText: 'STARLIGHT OBSERVATORY',
        badgeClasses: 'bg-cyan-400 text-slate-950 border-indigo-900',
      };
    case 'frame_supreme_crimson':
    case 'gear_frame_supreme_crimson':
      return {
        id: frameId,
        label: 'Supreme Court Crimson Frame',
        borderClasses:
          'border-rose-700 ring-4 ring-amber-300/85 shadow-[0_8px_0_#4C0519,0_0_20px_rgba(190,18,60,0.38)]',
        badgeText: 'SUPREME CRIMSON',
        badgeClasses: 'bg-rose-800 text-amber-200 border-black',
      };
    case 'frame_peach_stained_glass':
    case 'gear_frame_sakura_blossom':
      return {
        id: frameId,
        label: 'Peach Stained-Glass Frame',
        borderClasses:
          'border-pink-400 ring-4 ring-rose-300/85 shadow-[0_8px_0_#831843,0_0_20px_rgba(244,114,182,0.36)]',
        badgeText: 'PEACH CATHEDRAL',
        badgeClasses: 'bg-pink-400 text-slate-950 border-rose-900',
      };
    case 'frame_bowser_obsidian':
      return {
        id: frameId,
        label: 'Bowser Keep Obsidian Frame',
        borderClasses:
          'border-red-600 ring-4 ring-orange-500/85 shadow-[0_8px_0_#450A0A,0_0_22px_rgba(239,68,68,0.42)]',
        badgeText: 'BOWSER OBSIDIAN',
        badgeClasses: 'bg-red-600 text-amber-200 border-red-950',
      };
    case 'frame_yoshi_botanical':
      return {
        id: 'frame_yoshi_botanical',
        label: 'Yoshi Island Botanical Frame',
        borderClasses:
          'border-lime-500 ring-4 ring-emerald-300/85 shadow-[0_8px_0_#14532D,0_0_18px_rgba(132,204,22,0.35)]',
        badgeText: 'YOSHI BOTANICAL',
        badgeClasses: 'bg-lime-400 text-slate-950 border-emerald-900',
      };
    case 'frame_boo_ethereal':
      return {
        id: 'frame_boo_ethereal',
        label: 'Boo Mansion Violet Frame',
        borderClasses:
          'border-violet-500 ring-4 ring-purple-300/85 shadow-[0_8px_0_#2E1065,0_0_20px_rgba(139,92,246,0.38)]',
        badgeText: 'SPECTRAL BOO',
        badgeClasses: 'bg-violet-500 text-white border-purple-950',
      };
    case 'frame_rainbow_prism':
    case 'gear_frame_cyber_neon':
      return {
        id: frameId,
        label: 'Rainbow Road Prism Frame',
        borderClasses:
          'border-fuchsia-500 ring-4 ring-cyan-300/85 shadow-[0_8px_0_#3B0764,0_0_24px_rgba(217,70,239,0.42)]',
        badgeText: 'RAINBOW PRISM',
        badgeClasses: 'bg-fuchsia-500 text-white border-black',
      };
    case 'gear_frame_mahogany_gavel':
      return {
        id: 'gear_frame_mahogany_gavel',
        label: 'Narra Gavel Bench Frame',
        borderClasses:
          'border-amber-800 ring-4 ring-amber-500/80 shadow-[0_8px_0_#292524]',
        badgeText: 'NARRA BENCH',
        badgeClasses: 'bg-amber-800 text-amber-100 border-black',
      };
    case 'gear_frame_ivory_parchment':
      return {
        id: 'gear_frame_ivory_parchment',
        label: 'Archival Vellum Frame',
        borderClasses:
          'border-stone-600 ring-4 ring-amber-200/90 shadow-[0_8px_0_#44403C]',
        badgeText: 'ARCHIVAL VELLUM',
        badgeClasses: 'bg-stone-700 text-amber-200 border-black',
      };
    case 'gear_frame_diamond_platinum':
      return {
        id: 'gear_frame_diamond_platinum',
        label: 'Platinum Bar Topnotcher Frame',
        borderClasses:
          'border-sky-300 ring-4 ring-slate-200/90 shadow-[0_8px_0_#0F172A,0_0_24px_rgba(125,211,252,0.45)]',
        badgeText: 'TOPNOTCHER PLATINUM',
        badgeClasses: 'bg-sky-300 text-slate-950 border-slate-900',
      };
    case 'frame_juris_doctor':
    case 'gear_frame_juris_doctor':
      return {
        id: 'frame_juris_doctor',
        label: 'Grand Monarch Juris Doctor Frame',
        borderClasses:
          'border-amber-400 ring-4 ring-blue-500/90 shadow-[0_8px_0_#1E3A8A,0_0_26px_rgba(251,191,36,0.5)]',
        badgeText: 'JURIS DOCTOR MONARCH',
        badgeClasses: 'bg-gradient-to-r from-amber-400 to-amber-200 text-slate-950 border-blue-900',
      };
    case 'frame_supernova_mastery':
    case 'gear_frame_supernova':
      return {
        id: 'frame_supernova_mastery',
        label: 'Supernova 100% Bar Mastery Frame',
        borderClasses:
          'border-orange-500 ring-4 ring-yellow-400/90 shadow-[0_8px_0_#7C2D12,0_0_28px_rgba(249,115,22,0.52)]',
        badgeText: 'SUPERNOVA MASTER',
        badgeClasses: 'bg-gradient-to-r from-amber-500 to-red-600 text-white border-black',
      };
    default:
      if (frameId && frameId !== 'frame_default') {
        return {
          id: frameId,
          label: 'Custom Shop Frame',
          borderClasses:
            'border-amber-500 ring-4 ring-amber-300/80 shadow-[0_8px_0_#78350F]',
          badgeText: 'CUSTOM SHOP FRAME',
          badgeClasses: 'bg-amber-400 text-slate-950 border-black',
        };
      }
      return {
        id: 'frame_default',
        label: 'Standard Stage Frame',
        borderClasses: 'border-slate-950',
        badgeText: null,
        badgeClasses: '',
      };
  }
}

export interface CompanionPetMeta {
  id: string;
  name: string;
  bonusCoinsPerTopic: number;
  tips: readonly string[];
}

const COMPANION_CATALOG: Record<string, CompanionPetMeta> = {
  comp_luma: {
    id: 'comp_luma',
    name: 'Starlight Luma Scholar',
    bonusCoinsPerTopic: 1,
    tips: [
      'Luma Tip: Regular Holiday worked = 200%, plus +30% if it falls on your Rest Day (260%)!',
      'Luma Tip: Night Shift Differential (+10%) covers every hour worked between 10:00 PM and 6:00 AM!',
      'Luma Tip: Auto Bus v. Bautista — SIL 3-year prescription starts upon employer refusal or separation!',
    ],
  },
  companion_luma: {
    id: 'companion_luma',
    name: 'Starlight Luma Scholar',
    bonusCoinsPerTopic: 1,
    tips: [
      'Luma Tip: Regular Holiday worked = 200%, plus +30% if it falls on your Rest Day (260%)!',
      'Luma Tip: Night Shift Differential (+10%) covers every hour worked between 10:00 PM and 6:00 AM!',
    ],
  },
  comp_baby_yoshi: {
    id: 'comp_baby_yoshi',
    name: 'Golden Baby Yoshi',
    bonusCoinsPerTopic: 1,
    tips: [
      'Yoshi Tip: Short rest/coffee breaks of 5 to 20 minutes are ALWAYS compensable hours worked!',
      'Yoshi Tip: R.A. 11210 grants 105 paid maternity days (+15 for Solo Parents; 60 for miscarriage)!',
      'Yoshi Tip: Undertime on Monday can NEVER be offset by overtime rendered on Wednesday (Art. 88)!',
    ],
  },
  companion_yoshi: {
    id: 'companion_yoshi',
    name: 'Golden Baby Yoshi',
    bonusCoinsPerTopic: 1,
    tips: [
      'Yoshi Tip: Short rest/coffee breaks of 5 to 20 minutes are ALWAYS compensable hours worked!',
      'Yoshi Tip: R.A. 11210 grants 105 paid maternity days (+15 for Solo Parents; 60 for miscarriage)!',
    ],
  },
  comp_counsel_toad: {
    id: 'comp_counsel_toad',
    name: 'Counsel Toad Esq.',
    bonusCoinsPerTopic: 2,
    tips: [
      'Counsel Toad: Four-Fold Test — Selection, Wage Payment, Power of Dismissal, and Control (most important)!',
      'Counsel Toad: P.D. 851 13th-Month Pay must be paid on or before December 24 to rank-and-file with >=1 mo service!',
    ],
  },
  comp_polterpup: {
    id: 'comp_polterpup',
    name: 'Polterpup Night-Shift Hound',
    bonusCoinsPerTopic: 2,
    tips: [
      'Polterpup: Retail/service establishments with <=5 regular workers are exempt from Night Shift Differential!',
      'Polterpup: Retail/service establishments with <10 regular workers are exempt from Holiday Pay & SIL!',
    ],
  },
  comp_lakitu: {
    id: 'comp_lakitu',
    name: 'Lakitu Cloud Broadcast',
    bonusCoinsPerTopic: 2,
    tips: [
      'Lakitu Alert: Double Regular Holiday worked = 300% of basic wage (390% if also scheduled Rest Day)!',
      'Lakitu Alert: First Notice to Explain must give at least 5 calendar days to prepare a written defense!',
    ],
  },
  comp_chain_chomp: {
    id: 'comp_chain_chomp',
    name: 'Royal Gold Chain Chomp',
    bonusCoinsPerTopic: 2,
    tips: [
      'Chain Chomp: In Labor-Only Contracting, the principal is deemed the DIRECT EMPLOYER for all purposes!',
      'Chain Chomp: Wage distortion is NEVER a lawful ground for a strike or lockout (Art. 124)!',
    ],
  },
  comp_toadsworth: {
    id: 'comp_toadsworth',
    name: 'Chancellor Toadsworth Dean',
    bonusCoinsPerTopic: 2,
    tips: [
      'Dean Toadsworth: In case of doubt, all labor legislation and contracts are construed in favor of labor (Art. 4)!',
      'Dean Toadsworth: Valid Just Cause lacking Twin Notices = valid dismissal + ₱30,000 Agabon nominal damages!',
    ],
  },
  comp_captain_toad: {
    id: 'comp_captain_toad',
    name: 'Captain Toad Headlamp Scout',
    bonusCoinsPerTopic: 1,
    tips: [
      'Captain Toad: R.A. 11360 mandates 100% of collected service charges go to rank-and-file & supervisors!',
      'Captain Toad: D.O. 174-17 substantial capital benchmark is at least ₱5,000,000 paid-up capital/net worth!',
    ],
  },
  companion_toad: {
    id: 'companion_toad',
    name: 'Captain Toad',
    bonusCoinsPerTopic: 1,
    tips: [
      'Captain Toad: R.A. 11360 mandates 100% of collected service charges go to rank-and-file & supervisors!',
    ],
  },
  comp_pauline: {
    id: 'comp_pauline',
    name: 'Mayor Pauline Metro Counsel',
    bonusCoinsPerTopic: 2,
    tips: [
      'Mayor Pauline: Under R.A. 11165 (Telecommuting Act), remote workers enjoy fair treatment & equal OT/NSD pay!',
      'Mayor Pauline: Under R.A. 11058, workers have the right to refuse unsafe work in case of imminent danger!',
    ],
  },
  comp_dry_bones: {
    id: 'comp_dry_bones',
    name: 'Dry Bones Precedent Keeper',
    bonusCoinsPerTopic: 1,
    tips: [
      'Dry Bones: Illegal dismissal prescribes in 4 years (Art. 1146 Civil Code); money claims in 3 years (Art. 306)!',
      'Dry Bones: ULP complaints prescribe in 1 year from accrual of the unfair labor practice!',
    ],
  },
  comp_shy_guy: {
    id: 'comp_shy_guy',
    name: 'Shy Guy Payroll Auditor',
    bonusCoinsPerTopic: 1,
    tips: [
      'Shy Guy: Special Non-Working Day follows "No Work, No Pay" unless worked (+30% = 130%)!',
      'Shy Guy: Paternity Leave (R.A. 8187) = 7 days full pay for the first 4 deliveries of the legitimate spouse!',
    ],
  },
  comp_birdo: {
    id: 'comp_birdo',
    name: 'Birdo Ribbon Advocate',
    bonusCoinsPerTopic: 2,
    tips: [
      'Birdo: Safe Spaces Act (R.A. 11313) punishes peer-to-peer and subordinate-to-superior harassment!',
      'Birdo: Magna Carta of Women (R.A. 9710) grants up to 2 months special leave with full pay after gynecological surgery!',
    ],
  },
  comp_dk: {
    id: 'comp_dk',
    name: 'Donkey Kong Union Steward',
    bonusCoinsPerTopic: 2,
    tips: [
      'DK Steward: Loss/breakage wage deductions cannot exceed 20% of the employee weekly wage!',
      'DK Steward: Wages must be paid in legal tender at least once every 2 weeks or twice a month (<=16-day intervals)!',
    ],
  },
  comp_diddy: {
    id: 'comp_diddy',
    name: 'Diddy Kong Sprint Runner',
    bonusCoinsPerTopic: 1,
    tips: [
      'Diddy Sprint: Meal periods must be at least 60 minutes time-off; shorter compensable meals count as hours worked!',
      'Diddy Sprint: Waiting time is compensable whenever waiting is an integral part of work ("engaged to wait")!',
    ],
  },
  comp_kamek: {
    id: 'comp_kamek',
    name: 'Kamek Magikoopa Codifier',
    bonusCoinsPerTopic: 2,
    tips: [
      'Kamek Spell: R.A. 7641 statutory retirement pay = 22.5 days per year of service (15d + 5d SIL + 2.5d 13th mo.)!',
      'Kamek Spell: Valid Authorized Cause lacking 30-day DOLE/worker notice = ₱50,000 Jaka nominal damages!',
    ],
  },
  comp_nabbit: {
    id: 'comp_nabbit',
    name: 'Nabbit High-Yield Collector',
    bonusCoinsPerTopic: 2,
    tips: [
      'Nabbit Loot: Watch the Bar trap! Kasambahay 5-day SIL (R.A. 10361) is NOT convertible to cash and NOT cumulative!',
      'Nabbit Loot: Solo Parent Leave (R.A. 11861) requires only 6 months of service (unlike 12 months for Art. 95 SIL)!',
    ],
  },
  companion_boo: {
    id: 'companion_boo',
    name: 'Scholarly King Boo',
    bonusCoinsPerTopic: 1,
    tips: [
      'King Boo: Watch the trap! Kasambahay 5-day SIL (R.A. 10361) is NOT convertible to cash if unused!',
    ],
  },
  gear_comp_owl_clerk: {
    id: 'gear_comp_owl_clerk',
    name: 'Hoot-Hoot SCRA Clerk',
    bonusCoinsPerTopic: 2,
    tips: [
      'SCRA Owl: Illegal dismissal prescribes in 4 years (Art. 1146 Civil Code); money claims in 3 years (Art. 306)!',
    ],
  },
  gear_comp_lakitu_reporter: {
    id: 'gear_comp_lakitu_reporter',
    name: 'Lakitu Cloud Stenographer',
    bonusCoinsPerTopic: 2,
    tips: [
      'Lakitu Alert: Double Regular Holiday worked = 300% of basic wage (390% if also scheduled Rest Day)!',
    ],
  },
  gear_comp_chain_chomp: {
    id: 'gear_comp_chain_chomp',
    name: 'Golden Bailiff Chomp',
    bonusCoinsPerTopic: 2,
    tips: [
      'Bailiff Chomp: Wage distortion is NEVER a lawful ground for a strike or lockout (Art. 124)!',
    ],
  },
  gear_comp_shyguy_scribe: {
    id: 'gear_comp_shyguy_scribe',
    name: 'Shy Guy Codal Scribe',
    bonusCoinsPerTopic: 1,
    tips: [
      'Codal Scribe: VAWC Leave (R.A. 9262) = up to 10 paid days, extendable as specified in the Protection Order!',
    ],
  },
  gear_comp_polterpup: {
    id: 'gear_comp_polterpup',
    name: 'Polterpup Night-Shift Buddy',
    bonusCoinsPerTopic: 2,
    tips: [
      'Polterpup: Retail/service establishments with <=5 regular workers are exempt from Night Shift Differential!',
    ],
  },
  gear_comp_cappy_counsel: {
    id: 'gear_comp_cappy_counsel',
    name: 'Cappy Senior Counsel',
    bonusCoinsPerTopic: 2,
    tips: [
      'Cappy Counsel: In Labor-Only Contracting, the principal is deemed the DIRECT EMPLOYER for all purposes!',
    ],
  },
};

const EXTRA_NAMEPLATE_LOOKUP: Record<string, { name: string; badge: string; colorHex: string }> = {
  plate_koopa_slayer_counsel: {
    name: 'Koopa Boss Conqueror Esq.',
    badge: 'HUD Nameplate',
    colorHex: '#FB7185',
  },
  plate_summa_cum_codal: {
    name: 'Summa Cum Codal Laureate',
    badge: 'HUD Nameplate',
    colorHex: '#FBBF24',
  },
  plate_chief_wage_architect: {
    name: 'Chief Wage & Multiplier Architect',
    badge: 'HUD Nameplate',
    colorHex: '#34D399',
  },
  plate_protector_of_workers: {
    name: 'Tribune of Protective Legislation',
    badge: 'HUD Nameplate',
    colorHex: '#38BDF8',
  },
};

const EXTRA_CHAMBER_NAMES: Record<string, { name: string; bonusPct: number }> = {
  chamber_narra_gavel_podium: { name: 'Supreme Court Narra Lectern', bonusPct: 2 },
  chamber_stained_glass_lamp: { name: 'Peach Cathedral Banker Lamp', bonusPct: 2 },
  chamber_scra_annals_wall: { name: 'Complete SCRA Labor Vault', bonusPct: 3 },
  chamber_brass_scales_justice: { name: '24K Brass Scales of Social Justice', bonusPct: 2 },
  chamber_warp_espresso_bar: { name: 'Toadstool Espresso & Matcha Bar', bonusPct: 2 },
  chamber_star_observatory_dome: { name: 'Rosalina Skylight Observatory Dome', bonusPct: 4 },
  chamber_dole_wage_ticker: { name: 'Live RTWPB 17-Region Brass Ticker', bonusPct: 2 },
  chamber_imperial_seal_carpet: { name: 'Crimson Senate Medallion Carpet', bonusPct: 3 },
};

const EXTRA_RELIC_NAMES: Record<string, string> = {
  relic_pd442_first_edition: '1974 P.D. 442 Original Promulgation Scroll',
  relic_calamba_control_compass: 'Four-Fold Control Test Brass Compass',
  relic_capitol_wireless_abacus: '22.5-Day Retirement Jade Abacus',
  relic_do174_trilateral_seal: 'D.O. 174-17 Trilateral Wax Seal',
};

function mapCompanionAvatarKey(companionId: string): string {
  if (companionId.includes('yoshi')) return 'goldenyoshi';
  if (companionId.includes('luma')) return 'cosmicrosalina';
  if (companionId.includes('counsel_toad') || companionId.includes('toadsworth')) return 'lawyertoad';
  if (companionId.includes('toad')) return 'toad';
  if (companionId.includes('pauline')) return 'pauline';
  if (companionId.includes('polterpup') || companionId.includes('boo')) return 'boo';
  if (companionId.includes('lakitu') || companionId.includes('dry_bones')) return 'koopatroopa';
  if (companionId.includes('shy')) return 'shyguy';
  if (companionId.includes('birdo')) return 'birdo';
  if (companionId === 'comp_dk') return 'donkeykong';
  if (companionId === 'comp_diddy') return 'diddykong';
  if (companionId.includes('kamek')) return 'kamek';
  return 'bowserjr';
}

export function resolveCompanionInteraction(
  companionId: string | undefined,
  tapIndex: number = 0
): {
  active: boolean;
  name: string;
  speech: string;
  bonusCoinsPerTopic: number;
  avatarKey: string;
} {
  if (!companionId || companionId === 'companion_none' || companionId === 'comp_none') {
    return {
      active: false,
      name: '',
      speech: '',
      bonusCoinsPerTopic: 0,
      avatarKey: 'mario',
    };
  }
  const meta = COMPANION_CATALOG[companionId] || {
    id: companionId,
    name: 'Mushroom Study Pet',
    bonusCoinsPerTopic: 1,
    tips: [
      'Study Buddy: Master every statutory multiplier and prescriptive period to ace the Bar!',
    ],
  };
  const speech = meta.tips[Math.abs(tapIndex) % meta.tips.length];
  return {
    active: true,
    name: meta.name,
    speech,
    bonusCoinsPerTopic: meta.bonusCoinsPerTopic,
    avatarKey: mapCompanionAvatarKey(companionId),
  };
}

export function resolveEquippedNameplate(nameplateId?: string): {
  id: string;
  name: string;
  badge: string;
  colorHex: string;
  badgeClasses: string;
} | null {
  if (!nameplateId || nameplateId === 'plate_none') return null;
  const found = RELICS_AND_NAMEPLATES_ITEMS.find(
    (item) => item.subType === 'hud_nameplate' && item.id === nameplateId
  );
  if (found) {
    return {
      id: found.id,
      name: found.name,
      badge: found.badge,
      colorHex: found.fxColorHex || '#FBBF24',
      badgeClasses: 'bg-amber-400/20 text-amber-200 border-amber-400',
    };
  }
  const extra = EXTRA_NAMEPLATE_LOOKUP[nameplateId];
  if (extra) {
    return {
      id: nameplateId,
      name: extra.name,
      badge: extra.badge,
      colorHex: extra.colorHex,
      badgeClasses: 'bg-amber-400/20 text-amber-200 border-amber-400',
    };
  }
  return null;
}

export function computeOwnedChambersAndRelicsSummary(unlockedIds: readonly string[]): {
  ownedChambersCount: number;
  totalChambersCount: number;
  chambersBonusPct: number;
  ownedRelicsCount: number;
  totalRelicsCount: number;
  ownedChamberNames: string[];
  ownedRelicNames: string[];
} {
  const set = new Set(unlockedIds);
  const statutoryRelicItems = RELICS_AND_NAMEPLATES_ITEMS.filter(
    (i) => i.subType === 'statutory_relic'
  );
  const ownedChambers = LAW_CHAMBERS_UPGRADE_ITEMS.filter((i) => set.has(i.id));
  const ownedExtraChambers = Object.entries(EXTRA_CHAMBER_NAMES).filter(([id]) => set.has(id));
  const ownedRelics = statutoryRelicItems.filter((i) => set.has(i.id));
  const ownedExtraRelics = Object.entries(EXTRA_RELIC_NAMES).filter(
    ([id]) => set.has(id) && !ownedRelics.some((r) => r.id === id)
  );
  const chambersBonusPct =
    ownedChambers.reduce((sum, item) => sum + (item.chambersBonusPct || 1), 0) +
    ownedExtraChambers.reduce((sum, [, meta]) => sum + meta.bonusPct, 0);
  return {
    ownedChambersCount: ownedChambers.length + ownedExtraChambers.length,
    totalChambersCount:
      LAW_CHAMBERS_UPGRADE_ITEMS.length + Object.keys(EXTRA_CHAMBER_NAMES).length,
    chambersBonusPct,
    ownedRelicsCount: ownedRelics.length + ownedExtraRelics.length,
    totalRelicsCount:
      statutoryRelicItems.length +
      Object.keys(EXTRA_RELIC_NAMES).filter((id) => !statutoryRelicItems.some((r) => r.id === id))
        .length,
    ownedChamberNames: [
      ...ownedChambers.map((c) => c.name),
      ...ownedExtraChambers.map(([, meta]) => meta.name),
    ],
    ownedRelicNames: [
      ...ownedRelics.map((r) => r.name),
      ...ownedExtraRelics.map(([, name]) => name),
    ],
  };
}

// ============================================================================
// 7. MARIO [?] MYSTERY LAW BLOCK (INTERACTIVE BAR MNEMONIC + DAILY COIN REWARD)
// ============================================================================

export interface MarioMysteryBlockDrop {
  id: string;
  powerUpType: 'Super Star' | 'Fire Flower' | '1-UP Mushroom' | 'Golden Coin';
  mnemonicTitle: string;
  statutoryRule: string;
  examTrapNote: string;
}

export const MARIO_MYSTERY_LAW_DROPS: readonly MarioMysteryBlockDrop[] = [
  {
    id: 'qblock_retail_5_10',
    powerUpType: 'Super Star',
    mnemonicTitle: '5 vs. <10 vs. <=10 Retail Exemption Rule',
    statutoryRule:
      'NSD (Art. 86): <= 5 workers exempt · Holiday & SIL (Arts. 94–95): < 10 workers (1–9) exempt · Retirement (R.A. 7641): <= 10 workers exempt.',
    examTrapNote: 'Bar Trap: An establishment with exactly 10 workers MUST pay Holiday Pay & SIL, but is still exempt from R.A. 7641 Retirement Pay!',
  },
  {
    id: 'qblock_prescription_1_3_4',
    powerUpType: 'Fire Flower',
    mnemonicTitle: '1–3–4–20 Prescription Ladder',
    statutoryRule:
      '1 Year: Unfair Labor Practice (ULP) · 3 Years: Labor Standards Money Claims · 4 Years: Illegal Dismissal · 20 Years: Unremitted SSS Contributions.',
    examTrapNote: 'Bar Trap: Backwages prayed for inside an Illegal Dismissal complaint follow the 4-year injury-to-rights period (Callanta v. Carnation)!',
  },
  {
    id: 'qblock_agabon_jaka',
    powerUpType: '1-UP Mushroom',
    mnemonicTitle: '₱30k Agabon vs. ₱50k Jaka Nominal Damages',
    statutoryRule:
      'Valid substantive cause + defective procedure = Dismissal stays VALID, but employer pays ₱30,000 (Just Cause / Agabon) or ₱50,000 (Authorized Cause / Jaka).',
    examTrapNote: 'Bar Trap: Twin Notices apply to Art. 297 Just Causes (5 calendar days to explain); 30-day DOLE + Worker advance notice applies to Art. 298 Authorized Causes!',
  },
  {
    id: 'qblock_double_holiday',
    powerUpType: 'Golden Coin',
    mnemonicTitle: 'Double Regular Holiday Multiplier (200% / 300% / 390%)',
    statutoryRule:
      'When 2 Regular Holidays fall on the same date: Unworked = 200% · Worked (8h) = 300% · Worked on Scheduled Rest Day = 390% · Overtime = 300% × 1.30 = 390%/hr.',
    examTrapNote: 'Asian Transmission v. CA: Workers are entitled to both statutory holiday benefits even when both holidays coincide on a single calendar day.',
  },
  {
    id: 'qblock_leaves_matrix',
    powerUpType: 'Super Star',
    mnemonicTitle: 'Statutory Leave Cash-Conversion Matrix',
    statutoryRule:
      'Commutable to Cash if Unused: Art. 95 Regular 5-Day SIL ONLY! Non-Convertible: Paternity (7d), Solo Parent (7d), VAWC (10d), Magna Carta Women (60d), Kasambahay SIL (5d).',
    examTrapNote: 'Bar Trap: Solo Parent Leave (R.A. 11861) requires only 6 months of service, whereas Regular SIL (Art. 95) requires 12 months!',
  },
  {
    id: 'qblock_retirement_225',
    powerUpType: 'Fire Flower',
    mnemonicTitle: '22.5-Day Statutory Retirement Formula (R.A. 7641)',
    statutoryRule:
      '1/2 Month Salary per Year of Service = 15 days + 5 days SIL + 2.5 days (1/12 of 13th Month Pay) = 22.5 Days × Daily Rate × Years of Service.',
    examTrapNote: 'Elegir v. PAL: A fraction of at least 6 months of service is rounded up as 1 full year! Underground/surface miners retire at 50–60.',
  },
];

export const MYSTERY_BLOCK_DAILY_COIN_CAP = 5;
export const MYSTERY_BLOCK_COINS_PER_HIT = 2;

export function hitMarioMysteryLawBlock(params: {
  hitCountToday: number;
  dropCursor: number;
}): {
  drop: MarioMysteryBlockDrop;
  coinsAwarded: number;
  nextHitCountToday: number;
  nextDropCursor: number;
  dailyCoinCapReached: boolean;
} {
  const idx = Math.abs(params.dropCursor) % MARIO_MYSTERY_LAW_DROPS.length;
  const drop = MARIO_MYSTERY_LAW_DROPS[idx];
  const canEarnCoins = params.hitCountToday < MYSTERY_BLOCK_DAILY_COIN_CAP;
  const coinsAwarded = canEarnCoins ? MYSTERY_BLOCK_COINS_PER_HIT : 0;
  const nextHitCountToday = params.hitCountToday + 1;
  return {
    drop,
    coinsAwarded,
    nextHitCountToday,
    nextDropCursor: idx + 1,
    dailyCoinCapReached: nextHitCountToday >= MYSTERY_BLOCK_DAILY_COIN_CAP,
  };
}

// ============================================================================
// 8. TOAD'S TREASURE VAULT: EQUIPPABLE RELIC RINGS
// ============================================================================

export type MarioEquippedRing =
  | 'ring_none'
  | 'ring_curatorial_gold'
  | 'ring_one_up'
  | 'ring_star_immunity'
  | 'ring_speed_boot'
  | 'ring_scholar_ruby';

export interface MarioRingMeta {
  id: MarioEquippedRing;
  name: string;
  badge: string;
  price: number;
  description: string;
  perkEffect: string;
  iconName: 'ring' | 'crown' | 'heart' | 'star' | 'zap' | 'gem';
  colorClass: string;
  badgeClasses: string;
}

export const MARIO_RINGS_CATALOG: Record<MarioEquippedRing, MarioRingMeta> = {
  ring_none: {
    id: 'ring_none',
    name: 'No Ring Equipped',
    badge: 'Empty Slot',
    price: 0,
    description: 'No active relic ring equipped.',
    perkEffect: 'No passive buff active.',
    iconName: 'ring',
    colorClass: 'text-slate-400 border-slate-700 bg-slate-900',
    badgeClasses: 'bg-slate-800 text-slate-400 border-slate-700',
  },
  ring_curatorial_gold: {
    id: 'ring_curatorial_gold',
    name: 'Matthew’s Curatorial Gold Signet Ring',
    badge: 'Curator Relic',
    price: 95,
    description: 'Commemorative curatorial signet honoring craftsmanship and relentless diligence in Philippine legal education.',
    perkEffect: '+25% Gold Coins earned across all modules, quizzes, and games!',
    iconName: 'crown',
    colorClass: 'text-amber-300 border-amber-400 bg-amber-950/80',
    badgeClasses: 'bg-amber-400 text-slate-950 border-black',
  },
  ring_one_up: {
    id: 'ring_one_up',
    name: '1-Up Life Ring of Resilience',
    badge: 'Boss Defense',
    price: 80,
    description: 'Infused with the green essence of 1-Up Mushrooms, preventing fatal failure on difficult codal questions.',
    perkEffect: 'Adds +1 Extra Heart / Mistake Shield in Castle Quests & Boss Battles!',
    iconName: 'heart',
    colorClass: 'text-emerald-300 border-emerald-400 bg-emerald-950/80',
    badgeClasses: 'bg-emerald-500 text-slate-950 border-black',
  },
  ring_star_immunity: {
    id: 'ring_star_immunity',
    name: 'Invincible Star Road Signet',
    badge: 'Daily Shield',
    price: 85,
    description: 'Blessed by Star Road arpeggios, granting divine immunity on tricky Bar Exam trap questions.',
    perkEffect: 'Free retry protection against tough Bar exam traps!',
    iconName: 'star',
    colorClass: 'text-yellow-300 border-yellow-400 bg-yellow-950/80',
    badgeClasses: 'bg-yellow-400 text-slate-950 border-black',
  },
  ring_speed_boot: {
    id: 'ring_speed_boot',
    name: 'Koopa Swift-Feet Sprint Ring',
    badge: 'Focus Sprint',
    price: 60,
    description: 'Lightweight enchanted silver ring that accelerates Pomodoro study blocks and speed tests.',
    perkEffect: '+30 Bonus Coins on completing 25-Minute Focus Pomodoro sprints!',
    iconName: 'zap',
    colorClass: 'text-sky-300 border-sky-400 bg-sky-950/80',
    badgeClasses: 'bg-sky-400 text-slate-950 border-black',
  },
  ring_scholar_ruby: {
    id: 'ring_scholar_ruby',
    name: 'Bar Laureate Ruby Signet Ring',
    badge: 'Mastery XP',
    price: 90,
    description: 'Crimson gemstone worn by high-ranking labor law scholars preparing for the Bar Exams.',
    perkEffect: '+15% XP multiplier on all quizzes and stage completions!',
    iconName: 'gem',
    colorClass: 'text-rose-300 border-rose-400 bg-rose-950/80',
    badgeClasses: 'bg-rose-500 text-white border-black',
  },
};

export function resolveEquippedRing(ringId?: string): MarioRingMeta {
  if (ringId && ringId in MARIO_RINGS_CATALOG) {
    return MARIO_RINGS_CATALOG[ringId as MarioEquippedRing];
  }
  return MARIO_RINGS_CATALOG.ring_none;
}
