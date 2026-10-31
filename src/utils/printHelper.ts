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
 */
export function buildDynamicPrintPageCss(
  orientation: PrintOrientation,
  marginCss?: string
): string {
  const resolvedMargin =
    marginCss ?? (orientation === 'landscape' ? '6mm' : '10mm 12mm');
  const pageSize = orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait';
  return `@media print {\n  @page {\n    size: ${pageSize};\n    margin: ${resolvedMargin};\n  }\n}`;
}

/**
 * Injects or updates the <style id="mario-dynamic-print-page"> tag at the end of document.head
 * so both button-triggered prints and keyboard Ctrl+P / Cmd+P use the right page orientation.
 */
export function applyPrintPageRule(
  orientation: PrintOrientation,
  marginCss?: string
): void {
  if (typeof document === 'undefined') return;
  let styleEl = document.getElementById(DYNAMIC_PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = DYNAMIC_PRINT_STYLE_ID;
  }
  styleEl.textContent = buildDynamicPrintPageCss(orientation, marginCss);
  document.head.appendChild(styleEl);
  document.body.setAttribute('data-print-orientation', orientation);
}

export function clearPrintPageRule(): void {
  if (typeof document === 'undefined') return;
  const styleEl = document.getElementById(DYNAMIC_PRINT_STYLE_ID);
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
  document.body.removeAttribute('data-print-orientation');
}

export interface TriggerCleanPrintOptions {
  mode: PrintIsolationMode;
  orientation: PrintOrientation;
  marginCss?: string;
  restoreOrientationOnFinish?: {
    orientation: PrintOrientation;
    marginCss?: string;
  } | null;
}

/**
 * Applies print page orientation rule without invoking window.print(),
 * ensuring mobile/desktop buttons never redirect to the native phone print dialog.
 */
export function triggerCleanPrint(options: TriggerCleanPrintOptions): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const { mode, orientation, marginCss, restoreOrientationOnFinish = null } = options;
  const targetBodyClass = MODE_BODY_CLASS[mode];

  ALL_PRINT_BODY_CLASSES.forEach((cls) => document.body.classList.remove(cls));
  document.body.classList.add(targetBodyClass);
  applyPrintPageRule(orientation, marginCss);

  window.setTimeout(() => {
    document.body.classList.remove(targetBodyClass);
    if (restoreOrientationOnFinish) {
      applyPrintPageRule(
        restoreOrientationOnFinish.orientation,
        restoreOrientationOnFinish.marginCss
      );
    } else {
      clearPrintPageRule();
    }
  }, 400);
}

