import {
  OnePageSummaryPdfOptions,
  CertificatePdfParams,
  StudyGuideReviewerPdfParams,
  ScoreCardPdfParams,
  buildOnePageSummaryPdfBytes,
  buildCertificatePdfBytes,
  buildMasterDiplomaPdfBytes,
  buildStudyGuideReviewerPdfBytes,
  buildScoreCardLandscapePdfBytes,
} from './pdfExportService';
import {
  resolveExtendedPrintFont,
  ExtendedPrintFontSpec,
} from './round12Features';

function triggerPdfDownloadFromBytes(bytes: Uint8Array, filename: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const fontTtfBase64Cache = new Map<string, string>();

/**
 * Loads the TrueType (.ttf) font data for the user's chosen font style from Google Fonts
 * and encodes it as base64 so jsPDF can embed the exact font vectors into the PDF.
 */
export async function fetchGoogleFontTtfBase64ForStyle(
  fontStyle?: string
): Promise<{ fontName: string; base64: string } | null> {
  const spec = resolveExtendedPrintFont(fontStyle);
  const primaryFamily = spec.primaryFamily.replace(/['"]/g, '').trim();
  const safeFontName = primaryFamily.replace(/[^a-zA-Z0-9]/g, '');

  if (fontTtfBase64Cache.has(safeFontName)) {
    return { fontName: safeFontName, base64: fontTtfBase64Cache.get(safeFontName)! };
  }

  const systemFamilies = [
    'helvetica',
    'times',
    'courier',
    'arial',
    'georgia',
    'times new roman',
    'sans-serif',
    'serif',
    'monospace',
  ];
  if (systemFamilies.includes(primaryFamily.toLowerCase())) {
    return null;
  }

  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(primaryFamily)}`;
    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const ttfMatch = css.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^\)]+\.ttf)\)/);
    if (!ttfMatch) return null;

    const ttfRes = await fetch(ttfMatch[1]);
    if (!ttfRes.ok) return null;
    const ttfBuffer = await ttfRes.arrayBuffer();

    const bytes = new Uint8Array(ttfBuffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 8192) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + 8192, len))));
    }
    const base64 = btoa(binary);
    fontTtfBase64Cache.set(safeFontName, base64);
    return { fontName: safeFontName, base64 };
  } catch (err) {
    console.warn(`Could not load TTF font for ${primaryFamily}:`, err);
    return null;
  }
}

export async function ensurePrintFontLoadedInBrowser(fontStyle?: string): Promise<ExtendedPrintFontSpec> {
  const spec = resolveExtendedPrintFont(fontStyle);
  if (typeof document === 'undefined' || !('fonts' in document) || !document.fonts?.load) {
    return spec;
  }
  try {
    const familyQuoted = `"${spec.primaryFamily.replace(/"/g, '')}"`;
    await Promise.race([
      Promise.allSettled([
        document.fonts.load(`400 16px ${familyQuoted}`),
        document.fonts.load(`600 16px ${familyQuoted}`),
        document.fonts.load(`700 18px ${familyQuoted}`),
        document.fonts.load(`800 20px ${familyQuoted}`),
      ]),
      new Promise((resolve) => setTimeout(resolve, 350)),
    ]);
  } catch {
    // Proceed gracefully if offline or system font
  }
  return spec;
}

/**
 * 1. Multi-Page Unabridged Reviewer PDF rendered as 100% Vector PDF with exact chosen font.
 */
export async function buildTrueFontStudyReviewerPdfBytesAsync(
  params: StudyGuideReviewerPdfParams
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const fontData = await fetchGoogleFontTtfBase64ForStyle(params.fontStyle);
  return buildStudyGuideReviewerPdfBytes({
    ...params,
    loadedFont: fontData?.fontName,
    ttfBase64: fontData?.base64,
  });
}

/**
 * 2. Exact 1-Page A4 Summary Sheet rendered as 100% Vector PDF with exact chosen font.
 */
export async function buildTrueFontOnePageSummaryPdfBytesAsync(
  options: OnePageSummaryPdfOptions = {}
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(options.fontStyle);
  const fontData = await fetchGoogleFontTtfBase64ForStyle(options.fontStyle);
  return buildOnePageSummaryPdfBytes({
    ...options,
    loadedFont: fontData?.fontName,
    ttfBase64: fontData?.base64,
  });
}

/**
 * 3. Executive Mastery Certificate OR Royal Grand Master Diploma rendered with exact chosen font.
 */
export async function buildTrueFontCertificateOrDiplomaPdfBytesAsync(
  params: CertificatePdfParams,
  isMasterDiploma: boolean = false
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const fontData = await fetchGoogleFontTtfBase64ForStyle(params.fontStyle);
  const enriched = {
    ...params,
    loadedFont: fontData?.fontName,
    ttfBase64: fontData?.base64,
  };
  return isMasterDiploma
    ? buildMasterDiplomaPdfBytes(enriched)
    : buildCertificatePdfBytes(enriched);
}

/**
 * 4. Official Hero Score Card Landscape PDF rendered with exact chosen font.
 */
export async function buildTrueFontScoreCardPdfBytesAsync(
  params: ScoreCardPdfParams
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const fontData = await fetchGoogleFontTtfBase64ForStyle(params.fontStyle);
  return buildScoreCardLandscapePdfBytes({
    ...params,
    loadedFont: fontData?.fontName,
    ttfBase64: fontData?.base64,
  });
}

export async function downloadTrueFontStudyReviewerPdfAsync(
  params: StudyGuideReviewerPdfParams
): Promise<Uint8Array> {
  const bytes = await buildTrueFontStudyReviewerPdfBytesAsync(params);
  const suffix = params.orientation === 'landscape' ? 'Landscape' : 'Portrait';
  triggerPdfDownloadFromBytes(bytes, `Philippine-Labor-Standards-Reviewer-${suffix}-A4.pdf`);
  return bytes;
}

export async function downloadTrueFontOnePageSummaryPdfAsync(
  options: OnePageSummaryPdfOptions = {}
): Promise<Uint8Array> {
  const bytes = await buildTrueFontOnePageSummaryPdfBytesAsync(options);
  triggerPdfDownloadFromBytes(bytes, 'One-Page-Labor-Formulas-Deadlines-A4.pdf');
  return bytes;
}

export async function downloadTrueFontCertificatePdfAsync(
  params: CertificatePdfParams
): Promise<Uint8Array> {
  const orient = params.orientation === 'portrait' ? 'Portrait' : 'Landscape';
  const bytes = await buildTrueFontCertificateOrDiplomaPdfBytesAsync(params, false);
  triggerPdfDownloadFromBytes(bytes, `Official-Labor-Mastery-Certificate-${orient}-A4.pdf`);
  return bytes;
}

export async function downloadTrueFontMasterDiplomaPdfAsync(
  params: CertificatePdfParams
): Promise<Uint8Array> {
  const orient = params.orientation === 'portrait' ? 'Portrait' : 'Landscape';
  const bytes = await buildTrueFontCertificateOrDiplomaPdfBytesAsync(params, true);
  triggerPdfDownloadFromBytes(bytes, `Royal-Master-Juris-Diploma-${orient}-A4.pdf`);
  return bytes;
}

export async function downloadTrueFontScoreCardPdfAsync(
  params: ScoreCardPdfParams
): Promise<Uint8Array> {
  const bytes = await buildTrueFontScoreCardPdfBytesAsync(params);
  triggerPdfDownloadFromBytes(bytes, 'Mario-Labor-Hero-Score-Card-A4.pdf');
  return bytes;
}
