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

    const targetW = orientation === 'portrait' ? 794 : 1123;

    const canvas = await html2canvas(el, {
      scale: 2.5,
      width: targetW,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1280,
      onclone: (clonedDoc) => {
        // 1. Inject full Google Fonts stylesheet directly into clone head for instant 1:1 font resolution
        try {
          const gfLink = clonedDoc.createElement('link');
          gfLink.rel = 'stylesheet';
          gfLink.href =
            'https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&family=Bricolage+Grotesque:wght@400;500;700;800&family=Caveat:wght@400;600;700&family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;700&family=DotGothic16&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Fira+Code:wght@400;600;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Fredoka:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600;700&family=Inconsolata:wght@400;600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&family=Josefin+Sans:wght@400;600;700&family=Lexend:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@400;600;700;800&family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&family=Noto+Sans:wght@400;500;600;700;800&family=Orbitron:wght@400;600;700;800&family=Oswald:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Pixelify+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Press+Start+2P&family=Public+Sans:wght@400;600;700;800&family=Quicksand:wght@500;600;700&family=Silkscreen:wght@400;700&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@500;700&family=Space+Mono:wght@400;700&family=Spectral:ital,wght@0,400;0,600;0,700;1,400&family=Urbanist:wght@400;600;700;800&family=VT323&display=swap';
          clonedDoc.head.appendChild(gfLink);
        } catch {}

        // 2. Clone all stylesheets and link tags from main document
        try {
          const fontLinks = document.querySelectorAll('link[rel="stylesheet"], link[href*="fonts"]');
          fontLinks.forEach((link) => {
            const cloneLink = link.cloneNode(true);
            clonedDoc.head.appendChild(cloneLink);
          });
        } catch {}

        // 3. Transfer loaded FontFace objects if document.fonts is accessible
        if (typeof document !== 'undefined' && document.fonts && (clonedDoc as any).fonts) {
          try {
            document.fonts.forEach((fontFace) => {
              try {
                (clonedDoc as any).fonts.add(fontFace);
              } catch {}
            });
          } catch {}
        }

        // 4. Force clone stage & target elements to natural unscaled A4 dimensions (794px portrait / 1123px landscape)
        const scaledOuter = clonedDoc.querySelector('[data-testid="print-scaled-stage-outer"]') as HTMLElement | null;
        if (scaledOuter) {
          scaledOuter.style.position = 'relative';
          scaledOuter.style.left = '0';
          scaledOuter.style.top = '0';
          scaledOuter.style.width = `${targetW}px`;
          scaledOuter.style.maxWidth = `${targetW}px`;
          scaledOuter.style.minWidth = `${targetW}px`;
          scaledOuter.style.height = 'auto';
          scaledOuter.style.transform = 'none';
          scaledOuter.style.opacity = '1';
          scaledOuter.style.visibility = 'visible';
          scaledOuter.style.pointerEvents = 'auto';
          scaledOuter.style.zIndex = '1';
          scaledOuter.style.margin = '0 auto';
        }

        const scaledStage = clonedDoc.querySelector('[data-testid="print-scaled-stage-inner"]') as HTMLElement | null;
        if (scaledStage) {
          scaledStage.style.transform = 'none';
          scaledStage.style.width = `${targetW}px`;
          scaledStage.style.maxWidth = `${targetW}px`;
          scaledStage.style.minWidth = `${targetW}px`;
          scaledStage.style.height = 'auto';
          scaledStage.style.margin = '0 auto';
        }

        const clonedTarget = clonedDoc.getElementById(el.id);
        if (clonedTarget) {
          clonedTarget.style.width = `${targetW}px`;
          clonedTarget.style.maxWidth = `${targetW}px`;
          clonedTarget.style.minWidth = `${targetW}px`;
          clonedTarget.style.transform = 'none';
          clonedTarget.style.margin = '0 auto';
        }

        // 5. Explicitly set CSS custom property and inject high-priority font-family override
        clonedDoc.documentElement.style.setProperty('--print-active-font', resolvedFontStack, 'important');
        if (clonedDoc.body) {
          clonedDoc.body.style.setProperty('--print-active-font', resolvedFontStack, 'important');
        }

        const styleEl = clonedDoc.createElement('style');
        styleEl.textContent = `
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          :root {
            --print-active-font: ${resolvedFontStack} !important;
          }
          #one-page-summary-sheet,
          #one-page-summary-sheet *,
          #official-labor-certificate,
          #official-labor-certificate *,
          #official-scorecard-sheet,
          #official-scorecard-sheet *,
          #official-player-scorecard,
          #official-player-scorecard *,
          #master-diploma-printable,
          #master-diploma-printable *,
          #royal-juris-diploma-sheet,
          #royal-juris-diploma-sheet *,
          #printable-study-guide,
          #printable-study-guide *,
          .dynamic-print-font-target,
          .dynamic-print-font-target * {
            font-family: ${resolvedFontStack} !important;
          }
        `;
        clonedDoc.head.appendChild(styleEl);

        // 6. Ensure all elements in the target sheet explicitly receive the exact font family via setProperty important
        const activeSheets = clonedDoc.querySelectorAll(
          '#one-page-summary-sheet, #official-labor-certificate, #official-scorecard-sheet, #official-player-scorecard, #master-diploma-printable, #royal-juris-diploma-sheet, #printable-study-guide'
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
      },
    });

    const pageW = orientation === 'portrait' ? 210 : 297;
    const pageH = orientation === 'portrait' ? 297 : 210;
    const pageAspect = pageH / pageW;
    const canvasAspect = canvas.height / canvas.width;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Single-page fit with small 8% tolerance to prevent unintentional blank pages
    if (canvasAspect <= pageAspect * 1.08) {
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      doc.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
    } else {
      // Multi-page slicing: cleanly divide tall canvas into crisp A4 pages
      const sliceHeightPx = Math.floor(canvas.width * pageAspect);
      const totalPages = Math.ceil(canvas.height / sliceHeightPx);

      for (let i = 0; i < totalPages; i++) {
        const yOffset = i * sliceHeightPx;
        const currentSliceH = Math.min(sliceHeightPx, canvas.height - yOffset);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            yOffset,
            canvas.width,
            currentSliceH,
            0,
            0,
            canvas.width,
            currentSliceH
          );
        }

        const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          doc.addPage('a4', orientation);
        }
        doc.addImage(sliceImgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
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
