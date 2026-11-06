import html2canvas from 'html2canvas';
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

/**
 * Captures a live DOM element with html2canvas at High-DPI (2.5x retina)
 * embedding the true rendered web font into a standard A4 PDF document.
 * Includes automatic multi-page slicing so tall review sheets are paginated
 * cleanly without vertical squashing or distortion.
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

  try {
    if ('fonts' in document && document.fonts?.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      } catch {}
    }
    await new Promise((resolve) => setTimeout(resolve, 80));

    const targetW = orientation === 'portrait' ? 794 : 1122;

    const canvas = await html2canvas(el, {
      scale: 2,
      width: targetW,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: targetW,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      onclone: async (clonedDoc) => {
        // 1. Force root styling to avoid unclipped canvas or horizontal shifts
        clonedDoc.documentElement.style.margin = '0';
        clonedDoc.documentElement.style.padding = '0';
        clonedDoc.documentElement.style.width = `${targetW}px`;
        clonedDoc.documentElement.style.overflow = 'visible';

        if (clonedDoc.body) {
          clonedDoc.body.style.margin = '0';
          clonedDoc.body.style.padding = '0';
          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.width = `${targetW}px`;
          clonedDoc.body.style.overflow = 'visible';
          clonedDoc.body.style.setProperty('--print-active-font', resolvedFontStack, 'important');
        }

        // 2. Locate cloned target element and isolate it into body so modal dialogs,
        // scrolls, and wrappers cannot crop or offset it!
        const clonedTarget = clonedDoc.getElementById(el.id);
        if (clonedTarget) {
          const allBodyChildren = Array.from(clonedDoc.body.children);
          for (const child of allBodyChildren) {
            if (!child.contains(clonedTarget)) {
              child.remove();
            }
          }
          clonedDoc.body.appendChild(clonedTarget);

          clonedTarget.style.position = 'relative';
          clonedTarget.style.top = '0';
          clonedTarget.style.left = '0';
          clonedTarget.style.width = `${targetW}px`;
          clonedTarget.style.maxWidth = `${targetW}px`;
          clonedTarget.style.minWidth = `${targetW}px`;
          clonedTarget.style.transform = 'none';
          clonedTarget.style.margin = '0';
          clonedTarget.style.boxSizing = 'border-box';
          clonedTarget.style.overflow = 'visible';
          clonedTarget.style.opacity = '1';
          clonedTarget.style.visibility = 'visible';
        }

        // 3. Inject CSS custom property and font-family priority overrides
        clonedDoc.documentElement.style.setProperty('--print-active-font', resolvedFontStack, 'important');
        const styleEl = clonedDoc.createElement('style');
        styleEl.textContent = `
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            box-sizing: border-box;
          }
          :root {
            --print-active-font: ${resolvedFontStack} !important;
          }
          #${el.id},
          #${el.id} *:not(.preserve-system-font) {
            font-family: ${resolvedFontStack} !important;
          }
        `;
        clonedDoc.head.appendChild(styleEl);

        // 4. Ensure all elements in the target sheet receive the active font-family
        const activeSheets = clonedDoc.querySelectorAll(
          `#${el.id}, #one-page-summary-sheet, #official-labor-certificate, #official-scorecard-sheet, #official-player-scorecard, #master-diploma-printable, #royal-juris-diploma-sheet, #printable-study-guide`
        );
        activeSheets.forEach((node) => {
          const sheetNode = node as HTMLElement;
          sheetNode.style.overflow = 'visible';
          sheetNode.style.visibility = 'visible';
          sheetNode.style.opacity = '1';
          sheetNode.style.setProperty('font-family', resolvedFontStack, 'important');
          sheetNode.querySelectorAll('*').forEach((child) => {
            const childEl = child as HTMLElement;
            if (!childEl.classList?.contains('preserve-system-font')) {
              childEl.style.setProperty('font-family', resolvedFontStack, 'important');
            }
          });
        });

        if ((clonedDoc as any).fonts?.ready) {
          try {
            await Promise.race([
              (clonedDoc as any).fonts.ready,
              new Promise((resolve) => setTimeout(resolve, 400)),
            ]);
          } catch {}
        }
      },
    });

    const pageW = orientation === 'portrait' ? 210 : 297;
    const pageH = orientation === 'portrait' ? 297 : 210;
    const pageAspect = pageH / pageW;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const singlePageElementIds = [
      'one-page-summary-sheet',
      'official-labor-certificate',
      'official-scorecard-sheet',
      'official-player-scorecard',
      'master-diploma-printable',
      'royal-juris-diploma-sheet',
    ];
    const isSinglePage = ids.some((id) => singlePageElementIds.includes(id));

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

      doc.addImage(imgData, 'PNG', xOffset, yOffset, renderW, renderH, undefined, 'FAST');
    } else {
      // Multi-Page Slicing: cleanly divide tall reviewer canvas into crisp A4 pages
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
          doc.addImage(sliceImgData, 'PNG', 0, 0, pageW, renderH, undefined, 'FAST');
          break;
        }

        // Search for a clean whitespace gap between 75% and 100% of nominalSliceHeightPx
        let bestCutY = currentY + nominalSliceHeightPx;
        const minScanY = currentY + Math.floor(nominalSliceHeightPx * 0.75);
        const maxScanY = currentY + nominalSliceHeightPx - 8;

        try {
          const sampleCtx = canvas.getContext('2d');
          if (sampleCtx) {
            const scanW = Math.min(canvas.width, 160);
            const scanStartX = Math.floor((canvas.width - scanW) / 2);
            for (let testY = maxScanY; testY >= minScanY; testY -= 4) {
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

        const sliceH = bestCutY - currentY;
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
        doc.addImage(sliceImgData, 'PNG', 0, 0, pageW, renderH, undefined, 'FAST');

        currentY = bestCutY;
        pageIndex++;
      }
    }

    const arrayBuffer = doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    console.warn('True font DOM canvas snapshot failed, falling back to vector renderer:', err);
    return null;
  }
}

/**
 * 1. Multi-Page Unabridged Reviewer PDF rendered with true font fidelity.
 */
export async function buildTrueFontStudyReviewerPdfBytesAsync(
  params: StudyGuideReviewerPdfParams
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const orient = params.orientation === 'landscape' ? 'landscape' : 'portrait';
  const snapBytes = await captureDomElementToPdfBytesAsync(
    'printable-study-guide',
    orient,
    params.fontStyle
  );
  if (snapBytes) return snapBytes;
  return buildStudyGuideReviewerPdfBytes(params);
}

/**
 * 2. Exact 1-Page A4 Summary Sheet rendered with true font fidelity.
 */
export async function buildTrueFontOnePageSummaryPdfBytesAsync(
  options: OnePageSummaryPdfOptions = {}
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(options.fontStyle);
  const snapBytes = await captureDomElementToPdfBytesAsync(
    'one-page-summary-sheet',
    'portrait',
    options.fontStyle
  );
  if (snapBytes) return snapBytes;
  return buildOnePageSummaryPdfBytes(options);
}

/**
 * 3. Executive Mastery Certificate OR Royal Grand Master Diploma rendered with true font fidelity.
 */
export async function buildTrueFontCertificateOrDiplomaPdfBytesAsync(
  params: CertificatePdfParams,
  isMasterDiploma: boolean = false
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const orient = params.orientation === 'portrait' ? 'portrait' : 'landscape';
  const targetIds = isMasterDiploma
    ? ['royal-juris-diploma-sheet', 'master-diploma-printable']
    : ['official-labor-certificate'];
  const snapBytes = await captureDomElementToPdfBytesAsync(
    targetIds,
    orient,
    params.fontStyle
  );
  if (snapBytes) return snapBytes;
  return isMasterDiploma
    ? buildMasterDiplomaPdfBytes(params)
    : buildCertificatePdfBytes(params);
}

/**
 * 4. Official Hero Score Card Landscape PDF rendered with true font fidelity.
 */
export async function buildTrueFontScoreCardPdfBytesAsync(
  params: ScoreCardPdfParams
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const snapBytes = await captureDomElementToPdfBytesAsync(
    ['official-scorecard-sheet', 'official-player-scorecard'],
    'landscape',
    params.fontStyle
  );
  if (snapBytes) return snapBytes;
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
