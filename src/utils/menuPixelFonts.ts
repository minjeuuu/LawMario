/**
 * Menu Pixel Font System for Super Mario Philippine Labor Law Guide
 *
 * Provides specialized retro pixel fonts (Silkscreen, Pixelify Sans, VT323,
 * Press Start 2P) tailored for UI navigation and menu buttons, particularly
 * longer titles like '17 Regions', 'Calculator', and 'Toad\'s Shop' that
 * benefit from compact, high-legibility bitmap typography rather than generic sans.
 */

export type MenuPixelFontId =
  | 'adaptive'
  | 'silkscreen'
  | 'pixelify'
  | 'vt323'
  | 'press2p'
  | 'clean_sans';

export interface MenuPixelFontCatalogItem {
  readonly id: MenuPixelFontId;
  readonly label: string;
  readonly shortLabel: string;
  readonly badge: string;
  readonly subtitle: string;
  readonly sampleText: string;
  readonly cssClass: string;
}

export const MENU_PIXEL_FONT_STORAGE_KEY = 'mario_menu_pixel_font_v1';

export const MENU_PIXEL_FONTS: readonly MenuPixelFontCatalogItem[] = [
  {
    id: 'adaptive',
    label: 'Smart Pixel (Silkscreen + Press 2P)',
    shortLabel: 'Smart Pixel',
    badge: 'RECOMMENDED',
    subtitle: 'Silkscreen for Regions, Calc & Shop; Press 2P for short tabs',
    sampleText: '17 REGIONS · CALC',
    cssClass: 'font-pixel-silkscreen',
  },
  {
    id: 'silkscreen',
    label: 'Silkscreen 8-Bit (All Menu Buttons)',
    shortLabel: 'Silkscreen',
    badge: '8-BIT UI',
    subtitle: 'Ultra-crisp 8-bit UI bitmap font by Gunnar Vilhjalmsson',
    sampleText: 'REGIONS · CALCULATOR',
    cssClass: 'font-pixel-silkscreen',
  },
  {
    id: 'pixelify',
    label: 'Pixelify Sans (Proportional Retro)',
    shortLabel: 'Pixelify',
    badge: 'RETRO SANS',
    subtitle: 'Proportional retro curves with superior mobile legibility',
    sampleText: '17 Regions · Calculator',
    cssClass: 'font-pixel-pixelify',
  },
  {
    id: 'vt323',
    label: 'VT323 Arcade CRT (Terminal Pixel)',
    shortLabel: 'VT323 CRT',
    badge: 'CRT TERMINAL',
    subtitle: 'Classic green-screen and arcade cabinet terminal pixel font',
    sampleText: 'REGIONS · CALCULATOR',
    cssClass: 'font-pixel-vt323',
  },
  {
    id: 'press2p',
    label: 'Press Start 2P Classic (All Buttons)',
    shortLabel: 'Press Start 2P',
    badge: 'NES CLASSIC',
    subtitle: 'Authentic 8-bit Mario arcade font with auto-scaling',
    sampleText: 'WAGES · CALC',
    cssClass: 'font-mario',
  },
  {
    id: 'clean_sans',
    label: 'Clean Sans (High Contrast)',
    shortLabel: 'Clean Sans',
    badge: 'SANS CONTRAST',
    subtitle: 'Standard bold sans-serif for maximum reading clarity',
    sampleText: '17 Regions · Calculator',
    cssClass: 'font-sans',
  },
] as const;

export function loadMenuPixelFont(storage?: Storage): MenuPixelFontId {
  if (!storage && typeof window === 'undefined') return 'adaptive';
  const store = storage || window.localStorage;
  try {
    const raw = store.getItem(MENU_PIXEL_FONT_STORAGE_KEY) as MenuPixelFontId | null;
    if (raw && MENU_PIXEL_FONTS.some((f) => f.id === raw)) {
      return raw;
    }
  } catch {
    // Fallback to default
  }
  return 'adaptive';
}

export function saveMenuPixelFont(font: MenuPixelFontId, storage?: Storage): void {
  if (!storage && typeof window === 'undefined') return;
  const store = storage || window.localStorage;
  try {
    store.setItem(MENU_PIXEL_FONT_STORAGE_KEY, font);
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Returns the optimal typography styling for desktop navigation tabs.
 * In adaptive mode (default), longer tabs (wages_matrix, calculator, shop, citations)
 * use Silkscreen pixel font for crisp readability without clipping.
 */
export function getMenuButtonTypography(
  itemId: string,
  fontSetting: MenuPixelFontId = 'adaptive'
): { className: string; fontTag: string; isPixel: boolean } {
  const isWideTab =
    itemId === 'wages_matrix' ||
    itemId === 'calculator' ||
    itemId === 'shop' ||
    itemId === 'citations';

  if (fontSetting === 'silkscreen') {
    return {
      className:
        'font-pixel-silkscreen font-bold text-[8px] min-[1180px]:text-[9px] xl:text-[10px] tracking-tight uppercase',
      fontTag: 'silkscreen',
      isPixel: true,
    };
  }

  if (fontSetting === 'pixelify') {
    return {
      className:
        'font-pixel-pixelify font-bold text-[9.5px] min-[1180px]:text-[10.5px] xl:text-xs tracking-tight',
      fontTag: 'pixelify',
      isPixel: true,
    };
  }

  if (fontSetting === 'vt323') {
    return {
      className:
        'font-pixel-vt323 font-normal text-[11px] min-[1180px]:text-xs xl:text-sm tracking-wide uppercase',
      fontTag: 'vt323',
      isPixel: true,
    };
  }

  if (fontSetting === 'press2p') {
    return {
      className: isWideTab
        ? 'font-mario font-bold text-[6px] min-[1180px]:text-[6.5px] xl:text-[7.5px] 2xl:text-[8px] tracking-tighter'
        : 'font-mario font-bold text-[7px] min-[1180px]:text-[7.5px] xl:text-[8.5px] 2xl:text-[9.5px] tracking-tighter',
      fontTag: 'press2p',
      isPixel: true,
    };
  }

  if (fontSetting === 'clean_sans') {
    return {
      className:
        'font-sans font-black text-[9.5px] min-[1180px]:text-[10.5px] xl:text-xs tracking-tight',
      fontTag: 'sans',
      isPixel: false,
    };
  }

  // Default 'adaptive':
  // Wide buttons (17 Regions, Calculator, Shop, Citations) use crisp Silkscreen pixel font
  // Shorter buttons use classic Press Start 2P Mario font
  if (isWideTab) {
    return {
      className:
        'font-pixel-silkscreen font-bold text-[8px] min-[1180px]:text-[8.5px] xl:text-[9.5px] tracking-tight uppercase',
      fontTag: 'silkscreen-adaptive',
      isPixel: true,
    };
  }

  return {
    className:
      'font-mario font-bold text-[7px] min-[1180px]:text-[7.5px] xl:text-[8.5px] 2xl:text-[9.5px] tracking-tighter',
    fontTag: 'press2p-adaptive',
    isPixel: true,
  };
}

/**
 * Returns typography styling for mobile full menu drawer items.
 */
export function getMobileDrawerButtonTypography(
  itemId: string,
  fontSetting: MenuPixelFontId = 'adaptive'
): { className: string; fontTag: string; isPixel: boolean } {
  const isWideTab =
    itemId === 'wages_matrix' ||
    itemId === 'calculator' ||
    itemId === 'shop' ||
    itemId === 'citations';

  if (fontSetting === 'silkscreen') {
    return {
      className: 'font-pixel-silkscreen font-bold text-[10px] tracking-tight uppercase',
      fontTag: 'silkscreen',
      isPixel: true,
    };
  }

  if (fontSetting === 'pixelify') {
    return {
      className: 'font-pixel-pixelify font-bold text-xs tracking-tight',
      fontTag: 'pixelify',
      isPixel: true,
    };
  }

  if (fontSetting === 'vt323') {
    return {
      className: 'font-pixel-vt323 font-normal text-sm tracking-wide uppercase',
      fontTag: 'vt323',
      isPixel: true,
    };
  }

  if (fontSetting === 'press2p') {
    return {
      className: isWideTab
        ? 'font-mario font-bold text-[8px] tracking-tighter'
        : 'font-mario font-bold text-[9.5px] tracking-tight',
      fontTag: 'press2p',
      isPixel: true,
    };
  }

  if (fontSetting === 'clean_sans') {
    return {
      className: 'font-sans font-black text-xs',
      fontTag: 'sans',
      isPixel: false,
    };
  }

  // Default 'adaptive':
  if (isWideTab) {
    return {
      className: 'font-pixel-silkscreen font-bold text-[10px] tracking-tight uppercase',
      fontTag: 'silkscreen-adaptive',
      isPixel: true,
    };
  }

  return {
    className: 'font-mario font-bold text-[9.5px] tracking-tight',
    fontTag: 'press2p-adaptive',
    isPixel: true,
  };
}

/**
 * Returns typography styling for mobile utility nav buttons (Menu, Search, Print, Calculator, Shop).
 */
export function getMobileUtilityButtonTypography(
  _buttonId: string,
  fontSetting: MenuPixelFontId = 'adaptive'
): { className: string; fontTag: string; isPixel: boolean } {
  if (fontSetting === 'silkscreen' || fontSetting === 'adaptive') {
    return {
      className:
        'font-pixel-silkscreen font-bold text-[8.5px] min-[360px]:text-[9.5px] min-[420px]:text-[10.5px] sm:text-xs tracking-tight uppercase',
      fontTag: 'silkscreen',
      isPixel: true,
    };
  }

  if (fontSetting === 'pixelify') {
    return {
      className:
        'font-pixel-pixelify font-bold text-[9.5px] min-[360px]:text-[10.5px] min-[420px]:text-[11.5px] sm:text-xs tracking-tight',
      fontTag: 'pixelify',
      isPixel: true,
    };
  }

  if (fontSetting === 'vt323') {
    return {
      className:
        'font-pixel-vt323 font-normal text-[11px] min-[360px]:text-xs min-[420px]:text-sm sm:text-base tracking-wide uppercase',
      fontTag: 'vt323',
      isPixel: true,
    };
  }

  if (fontSetting === 'press2p') {
    return {
      className:
        'font-mario font-bold text-[7px] min-[360px]:text-[7.5px] min-[420px]:text-[8.5px] sm:text-[9.5px] tracking-tighter',
      fontTag: 'press2p',
      isPixel: true,
    };
  }

  return {
    className:
      'font-sans font-black text-[9px] min-[360px]:text-[10px] min-[420px]:text-[11px] sm:text-xs',
    fontTag: 'sans',
    isPixel: false,
  };
}
