export type PrintIsolationMode =
  | 'certificate'
  | 'scorecard'
  | 'weak-flashcards'
  | 'study-guide';

export type PrintOrientation = 'landscape' | 'portrait';

const DYNAMIC_PRINT_STYLE_ID = 'mario-dynamic-print-page';

const MODE_BODY_CLASS: Record<PrintIsolationMode, string> = {
  certificate: 'printing-certificate-only',
  scorecard: 'printing-scorecard-only',
  'weak-flashcards': 'printing-weak-flashcards-only',
  'study-guide': 'printing-study-guide-only',
};

const ALL_PRINT_BODY_CLASSES = Object.values(MODE_BODY_CLASS);

/**
 * Pure helper generating an unnamed @page rule inside @media print.
 * Overriding the unnamed @page rule ensures Chromium/Firefox/Safari apply the
 * exact orientation (especially A4 landscape for Certificates) even to fixed/portaled blocks.
 * Also injects the user's selected font-family stack so paper and PDF print dialogs
 * apply the exact typeface cleanly.
 */
export function buildDynamicPrintPageCss(
  orientation: PrintOrientation,
  marginCss?: string,
  fontStack?: string
): string {
  const resolvedMargin =
    marginCss ?? (orientation === 'landscape' ? '6mm' : '10mm 12mm');
  const pageSize = orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait';
  const cleanFont = fontStack ? fontStack.trim() : '';
  const fontOverride = cleanFont
    ? `
:root {
  --print-active-font: ${cleanFont};
}
body {
  --print-active-font: ${cleanFont};
}
#printable-study-guide,
#printable-study-guide *:not(.font-preserve),
#one-page-summary-sheet,
#one-page-summary-sheet *:not(.font-preserve),
#official-labor-certificate,
#official-labor-certificate *:not(.font-preserve),
#official-scorecard-sheet,
#official-scorecard-sheet *:not(.font-preserve),
#official-player-scorecard,
#official-player-scorecard *:not(.font-preserve),
#master-diploma-printable,
#master-diploma-printable *:not(.font-preserve),
#royal-juris-diploma-sheet,
#royal-juris-diploma-sheet *:not(.font-preserve),
.dynamic-print-font-target,
.dynamic-print-font-target *:not(.font-preserve) {
  font-family: ${cleanFont} !important;
}
`
    : '';

  return `${fontOverride}
@media print {
  @page {
    size: ${pageSize};
    margin: ${resolvedMargin};
  }
${fontOverride}}`;
}

/**
 * Injects or updates the <style id="mario-dynamic-print-page"> tag at the end of document.head
 * so both button-triggered prints, screen previews, html2canvas, and keyboard Ctrl+P / Cmd+P
 * use the right page orientation and the user's selected typography with 100% cascade fidelity.
 */
export function applyPrintPageRule(
  orientation: PrintOrientation,
  marginCss?: string,
  fontStack?: string
): void {
  if (typeof document === 'undefined') return;
  let styleEl = document.getElementById(DYNAMIC_PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = DYNAMIC_PRINT_STYLE_ID;
  }
  styleEl.textContent = buildDynamicPrintPageCss(orientation, marginCss, fontStack);
  document.head.appendChild(styleEl);
  document.body.setAttribute('data-print-orientation', orientation);
  if (fontStack) {
    document.documentElement.style.setProperty('--print-active-font', fontStack);
    document.body.style.setProperty('--print-active-font', fontStack);
  }
}

export function clearPrintPageRule(): void {
  if (typeof document === 'undefined') return;
  const styleEl = document.getElementById(DYNAMIC_PRINT_STYLE_ID);
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
  document.body.removeAttribute('data-print-orientation');
  document.body.style.removeProperty('--print-active-font');
  document.documentElement.style.removeProperty('--print-active-font');
}

export interface TriggerCleanPrintOptions {
  mode: PrintIsolationMode;
  orientation: PrintOrientation;
  marginCss?: string;
  fontStack?: string;
  restoreOrientationOnFinish?: {
    orientation: PrintOrientation;
    marginCss?: string;
    fontStack?: string;
  } | null;
}

/**
 * Applies print page orientation rule without invoking window.print(),
 * ensuring mobile/desktop buttons never redirect to the native phone print dialog.
 */
export function triggerCleanPrint(options: TriggerCleanPrintOptions): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const { mode, orientation, marginCss, fontStack, restoreOrientationOnFinish = null } = options;
  const targetBodyClass = MODE_BODY_CLASS[mode];

  ALL_PRINT_BODY_CLASSES.forEach((cls) => document.body.classList.remove(cls));
  document.body.classList.add(targetBodyClass);
  applyPrintPageRule(orientation, marginCss, fontStack);

  window.setTimeout(() => {
    document.body.classList.remove(targetBodyClass);
    if (restoreOrientationOnFinish) {
      applyPrintPageRule(
        restoreOrientationOnFinish.orientation,
        restoreOrientationOnFinish.marginCss,
        restoreOrientationOnFinish.fontStack
      );
    } else {
      clearPrintPageRule();
    }
  }, 400);
}

/**
 * Triggers native system browser printing (Ctrl+P / Cmd+P) while strictly applying
 * the document's selected orientation and active font stack.
 */
export function invokeBrowserPrint(options?: {
  orientation?: PrintOrientation;
  marginCss?: string;
  fontStack?: string;
  beforePrint?: () => void;
  afterPrint?: () => void;
}): void {
  if (typeof window === 'undefined') return;
  if (options?.orientation) {
    applyPrintPageRule(options.orientation, options.marginCss, options.fontStack);
  }
  if (options?.beforePrint) {
    options.beforePrint();
  }
  window.setTimeout(() => {
    window.print();
    if (options?.afterPrint) {
      options.afterPrint();
    }
  }, 60);
}

