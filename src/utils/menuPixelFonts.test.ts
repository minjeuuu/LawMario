import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MENU_PIXEL_FONTS,
  MENU_PIXEL_FONT_STORAGE_KEY,
  loadMenuPixelFont,
  saveMenuPixelFont,
  getMenuButtonTypography,
  getMobileDrawerButtonTypography,
  getMobileUtilityButtonTypography,
  type MenuPixelFontId,
} from './menuPixelFonts';

describe('Menu Pixel Fonts Catalog & Typography Engine', () => {
  it('exposes all 6 supported menu pixel font options with unique ids', () => {
    assert.equal(MENU_PIXEL_FONTS.length, 6);
    const uniqueIds = new Set(MENU_PIXEL_FONTS.map((f) => f.id));
    assert.equal(uniqueIds.size, 6);

    const expectedIds: MenuPixelFontId[] = [
      'adaptive',
      'silkscreen',
      'pixelify',
      'vt323',
      'press2p',
      'clean_sans',
    ];
    for (const expected of expectedIds) {
      assert.ok(MENU_PIXEL_FONTS.some((f) => f.id === expected));
    }
  });

  it('hydrates and persists menu pixel font preference accurately in storage', () => {
    const memoryStore: Record<string, string> = {};
    const mockStorage: Storage = {
      getItem: (key: string) => memoryStore[key] ?? null,
      setItem: (key: string, val: string) => {
        memoryStore[key] = val;
      },
      removeItem: (key: string) => {
        delete memoryStore[key];
      },
      clear: () => {
        for (const k in memoryStore) delete memoryStore[k];
      },
      key: (_i: number) => null,
      length: 0,
    };

    assert.equal(loadMenuPixelFont(mockStorage), 'adaptive');

    saveMenuPixelFont('pixelify', mockStorage);
    assert.equal(memoryStore[MENU_PIXEL_FONT_STORAGE_KEY], 'pixelify');
    assert.equal(loadMenuPixelFont(mockStorage), 'pixelify');

    saveMenuPixelFont('silkscreen', mockStorage);
    assert.equal(loadMenuPixelFont(mockStorage), 'silkscreen');

    // Invalid storage content falls back to adaptive
    memoryStore[MENU_PIXEL_FONT_STORAGE_KEY] = 'comic_sans_invalid';
    assert.equal(loadMenuPixelFont(mockStorage), 'adaptive');
  });

  it('adaptive mode applies Silkscreen pixel font to regions, calculator, and shop while keeping Press Start 2P for short tabs', () => {
    const wagesTypo = getMenuButtonTypography('wages_matrix', 'adaptive');
    assert.equal(wagesTypo.fontTag, 'silkscreen-adaptive');
    assert.ok(wagesTypo.className.includes('font-pixel-silkscreen'));
    assert.ok(wagesTypo.isPixel);

    const calcTypo = getMenuButtonTypography('calculator', 'adaptive');
    assert.equal(calcTypo.fontTag, 'silkscreen-adaptive');
    assert.ok(calcTypo.className.includes('font-pixel-silkscreen'));
    assert.ok(calcTypo.isPixel);

    const shopTypo = getMenuButtonTypography('shop', 'adaptive');
    assert.equal(shopTypo.fontTag, 'silkscreen-adaptive');
    assert.ok(shopTypo.className.includes('font-pixel-silkscreen'));
    assert.ok(shopTypo.isPixel);

    const modulesTypo = getMenuButtonTypography('modules', 'adaptive');
    assert.equal(modulesTypo.fontTag, 'press2p-adaptive');
    assert.ok(modulesTypo.className.includes('font-mario'));
    assert.ok(modulesTypo.isPixel);

    const arcadeTypo = getMenuButtonTypography('vault', 'adaptive');
    assert.equal(arcadeTypo.fontTag, 'press2p-adaptive');
    assert.ok(arcadeTypo.className.includes('font-mario'));
    assert.ok(arcadeTypo.isPixel);
  });

  it('allows applying silkscreen, pixelify, vt323, and press2p across all menu tabs', () => {
    const silkWages = getMenuButtonTypography('wages_matrix', 'silkscreen');
    assert.ok(silkWages.className.includes('font-pixel-silkscreen'));

    const pixWages = getMenuButtonTypography('wages_matrix', 'pixelify');
    assert.ok(pixWages.className.includes('font-pixel-pixelify'));

    const vtWages = getMenuButtonTypography('wages_matrix', 'vt323');
    assert.ok(vtWages.className.includes('font-pixel-vt323'));

    const p2pWages = getMenuButtonTypography('wages_matrix', 'press2p');
    assert.ok(p2pWages.className.includes('font-mario'));

    const sansWages = getMenuButtonTypography('wages_matrix', 'clean_sans');
    assert.ok(sansWages.className.includes('font-sans'));
    assert.equal(sansWages.isPixel, false);
  });

  it('provides dedicated mobile drawer and utility button typography helpers', () => {
    const drawerWages = getMobileDrawerButtonTypography('wages_matrix', 'adaptive');
    assert.ok(drawerWages.className.includes('font-pixel-silkscreen'));

    const drawerCalc = getMobileDrawerButtonTypography('calculator', 'adaptive');
    assert.ok(drawerCalc.className.includes('font-pixel-silkscreen'));

    const utilityCalc = getMobileUtilityButtonTypography('calculator', 'adaptive');
    assert.ok(utilityCalc.className.includes('font-pixel-silkscreen'));

    const utilityPix = getMobileUtilityButtonTypography('calculator', 'pixelify');
    assert.ok(utilityPix.className.includes('font-pixel-pixelify'));
  });
});
