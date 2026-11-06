import html2canvas from 'html2canvas';
import { toCanvas as htmlToImageCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
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

export interface RecordedTextItem {
  text: string;
  x: number;
  y: number;
  sizePt?: number;
}

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
      new Promise((resolve) => setTimeout(resolve, 650)),
    ]);
    if (document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]);
    }
  } catch {
    // Proceed gracefully if offline or system font
  }
  return spec;
}

const targetedFontEmbedCssCache = new Map<string, string>();

/**
 * Fetches targeted, self-contained @font-face CSS for only the active Google Web Font family,
 * converting external font URLs into base64 data URIs so html-to-image renders instantly
 * without network stalls, cross-origin security blocking, or parsing hundreds of unused fonts.
 */
export async function getTargetedFontEmbedCss(fontFamily: string): Promise<string> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return '';
  }
  const cleanFamily = fontFamily.replace(/['"]/g, '').trim();
  if (
    !cleanFamily ||
    cleanFamily.toLowerCase().includes('system') ||
    cleanFamily.toLowerCase().includes('sans-serif') ||
    cleanFamily.toLowerCase().includes('serif') ||
    cleanFamily.toLowerCase().includes('monospace') ||
    cleanFamily.toLowerCase() === 'georgia' ||
    cleanFamily.toLowerCase() === 'arial' ||
    cleanFamily.toLowerCase() === 'courier'
  ) {
    return '';
  }

  if (targetedFontEmbedCssCache.has(cleanFamily)) {
    return targetedFontEmbedCssCache.get(cleanFamily)!;
  }

  try {
    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      cleanFamily
    )}:wght@400;600;700;800&display=swap`;

    let res = await fetch(googleFontUrl);
    if (!res.ok) {
      res = await fetch(
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFamily)}&display=swap`
      );
    }

    if (!res.ok) return '';

    let cssText = await res.text();

    // Regex matches URLs with single quotes, double quotes, or no quotes
    const regex = /url\(['"]?\s*(https:\/\/fonts\.gstatic\.com\/[^'"\s)]+)\s*['"]?\)/g;
    const urlMatches = Array.from(cssText.matchAll(regex));
    const uniqueUrls = Array.from(new Set(urlMatches.map((m) => m[1])));

    const fontReplacements = await Promise.all(
      uniqueUrls.map(async (url) => {
        try {
          const fontRes = await fetch(url);
          if (!fontRes.ok) return { url, dataUri: url };
          const blob = await fontRes.blob();
          const dataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          return { url, dataUri };
        } catch {
          return { url, dataUri: url };
        }
      })
    );

    for (const { url, dataUri } of fontReplacements) {
      if (dataUri && dataUri.startsWith('data:')) {
        cssText = cssText.replaceAll(url, dataUri);
      }
    }

    targetedFontEmbedCssCache.set(cleanFamily, cssText);
    return cssText;
  } catch (err) {
    console.warn(`Could not embed web font "${cleanFamily}":`, err);
    return '';
  }
}

/**
 * Captures live DOM preview element at crisp Master Print resolution (2.4x pixelRatio)
 * embedding the true selected web font, exact CSS card layouts, alignments, and Mario SVG elements
 * into a standard A4 PDF document. Includes module boundary-aware slicing so cards are never severed.
 */
export async function captureDomElementToPdfBytesAsync(
  elementId: string | string[],
  orientation: 'portrait' | 'landscape',
  fontStyle?: string
): Promise<Uint8Array | null> {
  if (typeof document === 'undefined') return null;
  const ids = Array.isArray(elementId) ? elementId : [elementId];
  let el: HTMLElement | null = null;
  for (const id of ids) {
    el = document.getElementById(id);
    if (el) break;
  }
  if (!el) return null;

  const fontSpec = await ensurePrintFontLoadedInBrowser(fontStyle);
  const resolvedFontStack = fontSpec.cssFontFamily;

  // Pre-fetch targeted self-contained fontEmbedCSS for this specific active family
  const fontEmbedCSS = await getTargetedFontEmbedCss(fontSpec.primaryFamily);

  const targetW = orientation === 'portrait' ? 794 : 1122;
  const pageW = orientation === 'portrait' ? 210 : 297;
  const pageH = orientation === 'portrait' ? 297 : 210;
  const pageAspect = pageH / pageW;

  const singlePageElementIds = [
    'one-page-summary-sheet',
    'official-labor-certificate',
    'official-scorecard-sheet',
    'official-player-scorecard',
    'master-diploma-printable',
    'royal-juris-diploma-sheet',
  ];
  const isSinglePage = ids.some((id) => singlePageElementIds.includes(id));

  // Create isolated off-screen sandbox inside visible viewport coordinates to prevent WebKit clipping
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.top = '0';
  sandbox.style.left = '0';
  sandbox.style.width = `${targetW}px`;
  sandbox.style.margin = '0';
  sandbox.style.padding = '0';
  sandbox.style.border = 'none';
  sandbox.style.zIndex = '-9999';
  sandbox.style.opacity = '1';
  sandbox.style.visibility = 'visible';
  sandbox.style.pointerEvents = 'none';
  sandbox.style.backgroundColor = '#ffffff';
  sandbox.style.overflow = 'visible';

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.width = `${targetW}px`;
  clone.style.maxWidth = `${targetW}px`;
  clone.style.margin = '0';
  clone.style.transform = 'none';
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';
  clone.style.position = 'relative';
  clone.style.boxSizing = 'border-box';
  clone.style.display = 'block';
  clone.style.setProperty('font-family', resolvedFontStack, 'important');
  clone.style.setProperty('--print-active-font', resolvedFontStack, 'important');

  // Hide interactive elements that have print:hidden
  const printHiddens = clone.querySelectorAll('.print\\:hidden');
  printHiddens.forEach((e) => ((e as HTMLElement).style.display = 'none'));

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    if ('fonts' in document && document.fonts?.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 350)),
        ]);
      } catch {}
    }
    await new Promise((resolve) => setTimeout(resolve, 60));

    const targetH = clone.scrollHeight || (orientation === 'portrait' ? 1123 : 794);
    const renderPixelRatio = 2.4; // Crisp 230 DPI master standard, safe on mobile GPU memory

    let canvas: HTMLCanvasElement | null = null;

    // PRIMARY RENDER ENGINE: html-to-image with targeted fontEmbedCSS
    try {
      canvas = await htmlToImageCanvas(clone, {
        width: targetW,
        height: targetH,
        canvasWidth: targetW,
        canvasHeight: targetH,
        pixelRatio: renderPixelRatio,
        backgroundColor: '#ffffff',
        fontEmbedCSS: fontEmbedCSS || undefined,
      });
    } catch (primaryErr) {
      console.warn('html-to-image with fontEmbedCSS failed, retrying without fontEmbedCSS:', primaryErr);
      try {
        canvas = await htmlToImageCanvas(clone, {
          width: targetW,
          height: targetH,
          canvasWidth: targetW,
          canvasHeight: targetH,
          pixelRatio: renderPixelRatio,
          backgroundColor: '#ffffff',
        });
      } catch (secondaryErr) {
        console.warn('Secondary html-to-image failed, falling back to html2canvas:', secondaryErr);
      }
    }

    // SECONDARY FALLBACK: High-DPI html2canvas
    if (!canvas) {
      canvas = await html2canvas(clone, {
        scale: renderPixelRatio,
        width: targetW,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: targetW,
        scrollX: 0,
        scrollY: 0,
      });
    }

    if (!canvas) return null;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    if (isSinglePage) {
      // Guaranteed Single-Page Fit with Aspect Ratio Preservation:
      const imgData = canvas.toDataURL('image/png');
      const canvasRatio = canvas.width / canvas.height;
      const pageRatio = pageW / pageH;

      let renderW: number;
      let renderH: number;

      if (canvasRatio >= pageRatio) {
        // Canvas is proportionally wider/shorter than page: fit to page width
        renderW = pageW;
        renderH = pageW / canvasRatio;
      } else {
        // Canvas is proportionally taller than page: fit to page height
        renderH = pageH;
        renderW = pageH * canvasRatio;
      }

      // Center the sheet on the page with zero crop and zero overflow
      const xOffset = Math.max(0, (pageW - renderW) / 2);
      const yOffset = Math.max(0, (pageH - renderH) / 2);

      doc.addImage(imgData, 'PNG', xOffset, yOffset, renderW, renderH, undefined, 'SLOW');
    } else {
      // Multi-Page Module Boundary-Aware Slicing:
      // Reads exact DOM block positions so no topic module or card is severed mid-text.
      const breakBlocks = Array.from(
        clone.querySelectorAll(
          '#print-sec-masthead, #printable-study-guide > section, #print-sec-matrices > section, .print-topic-module, footer, [data-testid="print-matrix-multipliers"], [data-testid="print-matrix-regional-wages"], [data-testid="print-matrix-statutory-leaves"], .break-inside-avoid'
        )
      ) as HTMLElement[];

      const blockBoundaries = breakBlocks
        .map((b) => {
          let top = 0;
          let curr: HTMLElement | null = b;
          while (curr && curr !== clone) {
            top += curr.offsetTop;
            curr = curr.offsetParent as HTMLElement | null;
          }
          return {
            topPx: Math.round(top * renderPixelRatio),
            bottomPx: Math.round((top + b.offsetHeight) * renderPixelRatio),
          };
        })
        .filter((b) => b.bottomPx > b.topPx)
        .sort((a, b) => a.topPx - b.topPx);

      const nominalSliceHeightPx = Math.floor(canvas.width * pageAspect);
      let currentY = 0;
      let pageIndex = 0;

      while (currentY < canvas.height) {
        const remainingH = canvas.height - currentY;
        if (remainingH <= nominalSliceHeightPx) {
          // Last page slice fits completely
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = remainingH;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(canvas, 0, currentY, canvas.width, remainingH, 0, 0, canvas.width, remainingH);
          }
          const sliceImgData = sliceCanvas.toDataURL('image/png');
          if (pageIndex > 0) doc.addPage('a4', orientation);
          const renderH = (remainingH / nominalSliceHeightPx) * pageH;
          doc.addImage(sliceImgData, 'PNG', 0, 0, pageW, renderH, undefined, 'SLOW');
          break;
        }

        const maxPageY = currentY + nominalSliceHeightPx;
        const minAllowedCutY = currentY + Math.floor(nominalSliceHeightPx * 0.55);

        // Find clean cut point:
        // Priority 1: A module boundary between minAllowedCutY and maxPageY
        let bestCutY = -1;

        const crossingBlock = blockBoundaries.find(
          (b) => b.topPx >= minAllowedCutY && b.topPx < maxPageY && b.bottomPx > maxPageY
        );

        if (crossingBlock) {
          bestCutY = crossingBlock.topPx;
        } else {
          const candidateBlocks = blockBoundaries.filter(
            (b) => b.topPx >= minAllowedCutY && b.topPx <= maxPageY
          );
          if (candidateBlocks.length > 0) {
            bestCutY = candidateBlocks[candidateBlocks.length - 1].topPx;
          }
        }

        // Priority 2: If no DOM block boundary found in range, use whitespace pixel scanner
        if (bestCutY <= currentY) {
          bestCutY = maxPageY;
          try {
            const sampleCtx = canvas.getContext('2d');
            if (sampleCtx) {
              const scanW = Math.min(canvas.width, 240);
              const scanStartX = Math.floor((canvas.width - scanW) / 2);
              for (let testY = maxPageY - 8; testY >= minAllowedCutY; testY -= 4) {
                const pixelData = sampleCtx.getImageData(scanStartX, testY, scanW, 1).data;
                let isWhitespace = true;
                for (let px = 0; px < pixelData.length; px += 16) {
                  const r = pixelData[px];
                  const g = pixelData[px + 1];
                  const b = pixelData[px + 2];
                  if (r < 240 || g < 240 || b < 240) {
                    isWhitespace = false;
                    break;
                  }
                }
                if (isWhitespace) {
                  bestCutY = testY;
                  break;
                }
              }
            }
          } catch {}
        }

        const sliceH = Math.max(1, bestCutY - currentY);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceH;
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, currentY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        }
        const sliceImgData = sliceCanvas.toDataURL('image/png');
        if (pageIndex > 0) doc.addPage('a4', orientation);
        const renderH = (sliceH / nominalSliceHeightPx) * pageH;
        doc.addImage(sliceImgData, 'PNG', 0, 0, pageW, renderH, undefined, 'SLOW');

        currentY = bestCutY;
        pageIndex++;
      }
    }

    const arrayBuffer = doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    console.error('True font DOM canvas snapshot failed:', err);
    return null;
  } finally {
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}

/**
 * 1. Multi-Page Unabridged Reviewer PDF rendered as 100% Vector PDF (real PDF, zero images).
 */
export async function buildTrueFontStudyReviewerPdfBytesAsync(
  params: StudyGuideReviewerPdfParams
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  return buildStudyGuideReviewerPdfBytes(params);
}

/**
 * 2. Exact 1-Page A4 Summary Sheet rendered as 100% Vector PDF (real PDF, zero images).
 */
export async function buildTrueFontOnePageSummaryPdfBytesAsync(
  options: OnePageSummaryPdfOptions = {}
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(options.fontStyle);
  return buildOnePageSummaryPdfBytes(options);
}

/**
 * 3. Executive Mastery Certificate OR Royal Grand Master Diploma rendered as 100% Vector PDF (real PDF, zero images).
 */
export async function buildTrueFontCertificateOrDiplomaPdfBytesAsync(
  params: CertificatePdfParams,
  isMasterDiploma: boolean = false
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  return isMasterDiploma
    ? buildMasterDiplomaPdfBytes(params)
    : buildCertificatePdfBytes(params);
}

/**
 * 4. Official Hero Score Card Landscape PDF rendered as 100% Vector PDF (real PDF, zero images).
 */
export async function buildTrueFontScoreCardPdfBytesAsync(
  params: ScoreCardPdfParams
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  return buildScoreCardLandscapePdfBytes(params);
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
