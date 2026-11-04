import { jsPDF } from 'jspdf';
import { ALL_LAW_TOPICS, WORLDS_METADATA } from '../data/laborLawData';
import { LABOR_BENEFITS_MULTIPLIER_LIST } from '../data/multiplierTable';
import { REGIONAL_MINIMUM_WAGES, KASAMBAHAY_MINIMUM_WAGES } from '../data/regionalWages';
import { GROUP_MEMBERS } from './engagementFeatures';
import {
  ONE_PAGE_LEGAL_FORMULAS,
  ONE_PAGE_LEGAL_DEADLINES,
  ONE_PAGE_STATUTORY_LEAVE_CAPS,
} from './onePageSummaryData';
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
import {
  resolveExtendedPrintTheme,
  resolveExtendedPrintFont,
  buildCanvasFontString,
  ExtendedPrintFontSpec,
  ExtendedPrintThemeSpec,
} from './round12Features';

function cleanInlineMarkup(raw: string): string {
  return (raw || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
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
        document.fonts.load(`700 18px ${familyQuoted}`),
      ]),
      new Promise((resolve) => setTimeout(resolve, 650)),
    ]);
  } catch {
    // Proceed gracefully if offline or system font
  }
  return spec;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const normalized = (text || '').replace(/\r/g, '');
  if (!normalized.trim()) return [''];
  const paragraphs = normalized.split('\n');
  const lines: string[] = [];
  const safeMaxW = Math.max(40, maxWidth);

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let currentLine = '';

    for (const word of words) {
      // Break ultra-long unbroken tokens so they can NEVER overflow horizontally
      if (ctx.measureText(word).width > safeMaxW) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        let chunk = '';
        for (const ch of word) {
          const nextChunk = chunk + ch;
          if (ctx.measureText(nextChunk).width > safeMaxW && chunk.length > 0) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk = nextChunk;
          }
        }
        currentLine = chunk;
        continue;
      }

      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= safeMaxW) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function canvasesToPdfBytes(
  canvases: HTMLCanvasElement[],
  orientation: 'portrait' | 'landscape',
  docTitle: string
): Uint8Array {
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  doc.setProperties({
    title: docTitle,
    creator: 'Super Mario Labor Adventure — Philippine Labor Standards Guide',
  });

  const pageW = orientation === 'landscape' ? 297 : 210;
  const pageH = orientation === 'landscape' ? 210 : 297;

  canvases.forEach((canvas, idx) => {
    if (idx > 0) {
      doc.addPage('a4', orientation);
    }
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    doc.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
  });

  return new Uint8Array(doc.output('arraybuffer'));
}

class TrueFontPageBuilder {
  public pages: HTMLCanvasElement[] = [];
  public ctx!: CanvasRenderingContext2D;
  public currentCanvas!: HTMLCanvasElement;
  public y: number = 0;
  public readonly pageW: number;
  public readonly pageH: number;
  public readonly marginX: number;
  public readonly marginTop: number;
  public readonly marginBottom: number;
  public readonly contentW: number;
  public readonly theme: ExtendedPrintThemeSpec;
  public readonly font: ExtendedPrintFontSpec;
  public readonly userScale: number;

  constructor(opts: {
    orientation: 'portrait' | 'landscape';
    theme: ExtendedPrintThemeSpec;
    font: ExtendedPrintFontSpec;
    marginPreset?: 'compact' | 'normal' | 'spacious';
    fontSizeScale?: 'small' | 'normal' | 'large';
  }) {
    this.pageW = opts.orientation === 'landscape' ? 1754 : 1240;
    this.pageH = opts.orientation === 'landscape' ? 1240 : 1754;
    this.marginX =
      opts.marginPreset === 'compact' ? 56 : opts.marginPreset === 'spacious' ? 92 : 72;
    this.marginTop = opts.marginPreset === 'compact' ? 58 : 72;
    this.marginBottom = 86;
    this.contentW = this.pageW - this.marginX * 2;
    this.theme = opts.theme;
    this.font = opts.font;
    this.userScale =
      opts.fontSizeScale === 'small' ? 0.9 : opts.fontSizeScale === 'large' ? 1.1 : 1.0;
    this.addPage();
  }

  public addPage(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.pageW;
    canvas.height = this.pageH;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.pageW, this.pageH);

    // Subtle outer border frame
    ctx.strokeStyle = this.theme.borderHex;
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, this.pageW - 56, this.pageH - 56);

    this.pages.push(canvas);
    this.currentCanvas = canvas;
    this.ctx = ctx;
    this.y = this.marginTop;
  }

  public ensureSpace(neededPx: number): void {
    if (this.y + neededPx > this.pageH - this.marginBottom) {
      this.addPage();
    }
  }

  public setFont(weight: 400 | 600 | 700 | 800, basePx: number, italic = false): number {
    const px = Math.round(basePx * this.userScale);
    this.ctx.font = buildCanvasFontString(this.font, weight, px, italic);
    this.ctx.textBaseline = 'top';
    const actualPx = Math.max(10, Math.round(px * this.font.sizeScale));
    return Math.round(actualPx * 1.42 * this.font.lineHeightScale);
  }

  public drawSectionBanner(title: string, rightTag?: string): void {
    this.ensureSpace(64);
    const bannerH = 44;
    drawRoundedRect(this.ctx, this.marginX, this.y, this.contentW, bannerH, 8);
    this.ctx.fillStyle = this.theme.headerBgHex;
    this.ctx.fill();
    this.ctx.strokeStyle = this.theme.borderHex;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.setFont(700, 18);
    this.ctx.fillStyle = this.theme.headerTextHex;
    const maxLeftW = rightTag ? this.contentW - 250 : this.contentW - 32;
    const titleLine = wrapCanvasText(this.ctx, title, maxLeftW)[0] || title;
    this.ctx.fillText(titleLine, this.marginX + 16, this.y + 12);

    if (rightTag) {
      this.setFont(700, 14);
      const tagLine = wrapCanvasText(this.ctx, rightTag, 220)[0] || rightTag;
      const tw = this.ctx.measureText(tagLine).width;
      this.ctx.fillText(tagLine, this.marginX + this.contentW - 16 - tw, this.y + 14);
    }

    this.y += bannerH + 14;
  }

  public drawWrappedTable(
    headers: string[],
    rows: string[][],
    colFractions?: number[]
  ): void {
    if (!headers.length) return;
    const cols = headers.length;
    const fracs =
      colFractions && colFractions.length === cols
        ? colFractions
        : Array(cols).fill(1 / cols);
    const colWidths = fracs.map((f) => Math.floor(this.contentW * f));
    const padX = 12;
    const padY = 9;

    const renderTableHeader = () => {
      const headLineH = this.setFont(700, 14.5);
      const cellLines = headers.map((h, i) =>
        wrapCanvasText(this.ctx, cleanInlineMarkup(h), colWidths[i] - padX * 2)
      );
      const maxLines = Math.max(1, ...cellLines.map((cl) => cl.length));
      const rowH = maxLines * headLineH + padY * 2;
      this.ensureSpace(rowH + 34);

      this.ctx.fillStyle = this.theme.tableHeadBgHex;
      this.ctx.fillRect(this.marginX, this.y, this.contentW, rowH);
      this.ctx.strokeStyle = this.theme.borderHex;
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(this.marginX, this.y, this.contentW, rowH);

      let cx = this.marginX;
      this.setFont(700, 14.5);
      const headIsLight =
        this.theme.id === 'ink_saver_bw' || this.theme.category === 'Pastel & Ink-Saver';
      this.ctx.fillStyle = headIsLight ? this.theme.bodyTextHex : '#FFFFFF';
      cellLines.forEach((lines, cIdx) => {
        lines.forEach((ln, lIdx) => {
          this.ctx.fillText(ln, cx + padX, this.y + padY + lIdx * headLineH);
        });
        cx += colWidths[cIdx];
        if (cIdx < cols - 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(cx, this.y);
          this.ctx.lineTo(cx, this.y + rowH);
          this.ctx.stroke();
        }
      });
      this.y += rowH;
    };

    renderTableHeader();

    rows.forEach((row, rIdx) => {
      const bodyLineH = this.setFont(400, 14);
      const wrappedCells = headers.map((_, cIdx) =>
        wrapCanvasText(
          this.ctx,
          cleanInlineMarkup(row[cIdx] || ''),
          colWidths[cIdx] - padX * 2
        )
      );
      const maxLines = Math.max(1, ...wrappedCells.map((cl) => cl.length));
      const rowH = maxLines * bodyLineH + padY * 2;

      if (this.y + rowH > this.pageH - this.marginBottom) {
        this.addPage();
        renderTableHeader();
      }

      this.ctx.fillStyle = rIdx % 2 === 1 ? this.theme.tableStripeBgHex : '#FFFFFF';
      this.ctx.fillRect(this.marginX, this.y, this.contentW, rowH);
      this.ctx.strokeStyle = '#CBD5E1';
      this.ctx.lineWidth = 1.2;
      this.ctx.strokeRect(this.marginX, this.y, this.contentW, rowH);

      let cx = this.marginX;
      wrappedCells.forEach((lines, cIdx) => {
        this.setFont(cIdx === 0 ? 700 : 400, 14);
        this.ctx.fillStyle = cIdx === 0 ? this.theme.accentHex : this.theme.bodyTextHex;
        lines.forEach((ln, lIdx) => {
          this.ctx.fillText(ln, cx + padX, this.y + padY + lIdx * bodyLineH);
        });
        cx += colWidths[cIdx];
        if (cIdx < cols - 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(cx, this.y);
          this.ctx.lineTo(cx, this.y + rowH);
          this.ctx.stroke();
        }
      });

      this.y += rowH;
    });

    this.y += 16;
  }

  public stampFooters(watermarkText?: string): void {
    const total = this.pages.length;
    this.pages.forEach((canvas, idx) => {
      const ctx = canvas.getContext('2d')!;
      const fy = this.pageH - 58;
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.marginX, fy - 10);
      ctx.lineTo(this.pageW - this.marginX, fy - 10);
      ctx.stroke();

      ctx.font = buildCanvasFontString(this.font, 600, 13);
      ctx.textBaseline = 'top';
      ctx.fillStyle = this.theme.mutedTextHex;

      const wmSuffix = watermarkText ? ` · ${watermarkText}` : '';
      const leftFooter = `Super Mario Labor Adventure · Font: ${this.font.name} · Theme: ${this.theme.name}${wmSuffix}`;
      const clampedLeft = wrapCanvasText(ctx, leftFooter, this.contentW - 160)[0] || leftFooter;
      ctx.fillText(clampedLeft, this.marginX, fy);

      const pageTag = `Page ${idx + 1} of ${total}`;
      const pw = ctx.measureText(pageTag).width;
      ctx.fillText(pageTag, this.pageW - this.marginX - pw, fy);
    });
  }
}

/**
 * 1. Multi-Page Unabridged Reviewer PDF rendered with the exact chosen Google Font.
 */
export async function buildTrueFontStudyReviewerPdfBytesAsync(
  params: StudyGuideReviewerPdfParams
): Promise<Uint8Array> {
  if (typeof document === 'undefined') {
    return buildStudyGuideReviewerPdfBytes(params);
  }
  const font = await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const theme = resolveExtendedPrintTheme(params.colorAccent);
  const orientation = params.orientation || 'portrait';

  const builder = new TrueFontPageBuilder({
    orientation,
    theme,
    font,
    marginPreset: params.paperMargins === 'standard' ? 'normal' : params.paperMargins,
    fontSizeScale: params.fontSizeScale,
  });

  // Cover Masthead
  const coverH = 128;
  drawRoundedRect(builder.ctx, builder.marginX, builder.y, builder.contentW, coverH, 12);
  builder.ctx.fillStyle = theme.headerBgHex;
  builder.ctx.fill();
  builder.ctx.strokeStyle = theme.borderHex;
  builder.ctx.lineWidth = 2.5;
  builder.ctx.stroke();

  builder.setFont(700, 14);
  builder.ctx.fillStyle = theme.headerTextHex;
  const kicker = 'REPUBLIC OF THE PHILIPPINES · LABOR CODE (P.D. 442 AS AMENDED) · UNABRIDGED REVIEWER';
  const kLine = wrapCanvasText(builder.ctx, kicker, builder.contentW - 40)[0] || kicker;
  builder.ctx.fillText(kLine, builder.marginX + 20, builder.y + 18);

  builder.setFont(800, 27);
  builder.ctx.fillStyle =
    theme.id === 'ink_saver_bw' || theme.category === 'Pastel & Ink-Saver'
      ? theme.bodyTextHex
      : '#FFFFFF';
  const mainTitle = 'PHILIPPINE LABOR STANDARDS MASTER COMPENDIUM';
  const mLine = wrapCanvasText(builder.ctx, mainTitle, builder.contentW - 40)[0] || mainTitle;
  builder.ctx.fillText(mLine, builder.marginX + 20, builder.y + 46);

  builder.setFont(600, 14);
  builder.ctx.fillStyle = theme.headerTextHex;
  const metaSub = params.candidateName
    ? `Prepared for: ${params.candidateName}  |  Typeface: ${font.name}  |  Theme: ${theme.name}  |  Curated by Matthew Cesar Corpuz`
    : `Modules: ${params.topics.length}  |  Mastered: ${params.completedTopicIds.length}/${ALL_LAW_TOPICS.length}  |  Typeface: ${font.name}  |  Matthew Cesar Corpuz`;
  const subLine = wrapCanvasText(builder.ctx, metaSub, builder.contentW - 40)[0] || metaSub;
  builder.ctx.fillText(subLine, builder.marginX + 20, builder.y + 92);
  builder.y += coverH + 20;

  // Group Cohort Box
  if (params.includeGroupMembers !== false) {
    const membersStr = GROUP_MEMBERS.join('  ·  ');
    const lineH = builder.setFont(400, 14);
    const mLines = wrapCanvasText(builder.ctx, membersStr, builder.contentW - 32);
    const boxH = 44 + mLines.length * lineH;
    builder.ensureSpace(boxH + 16);
    drawRoundedRect(builder.ctx, builder.marginX, builder.y, builder.contentW, boxH, 8);
    builder.ctx.fillStyle = theme.accentSoftBgHex;
    builder.ctx.fill();
    builder.ctx.strokeStyle = theme.borderHex;
    builder.ctx.lineWidth = 1.5;
    builder.ctx.stroke();

    builder.setFont(700, 14.5);
    builder.ctx.fillStyle = theme.accentHex;
    builder.ctx.fillText(
      'MEMORY AID ATTRIBUTION & RESEARCH COHORT (MAIN CREATOR: MATTHEW CESAR CORPUZ)',
      builder.marginX + 16,
      builder.y + 12
    );

    builder.setFont(400, 14);
    builder.ctx.fillStyle = theme.bodyTextHex;
    mLines.forEach((ln, idx) => {
      builder.ctx.fillText(ln, builder.marginX + 16, builder.y + 36 + idx * lineH);
    });
    builder.y += boxH + 18;
  }

  // Progress Summary
  if (params.includeProgress !== false) {
    builder.drawSectionBanner(
      'SIX-WORLD STATUTORY MASTERY PROGRESS',
      `${params.completedTopicIds.length}/${ALL_LAW_TOPICS.length} MASTERED`
    );
    const rows = WORLDS_METADATA.map((w) => {
      const wTopics = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
      const done = wTopics.filter((t) => params.completedTopicIds.includes(t.id)).length;
      const pct = wTopics.length > 0 ? Math.round((done / wTopics.length) * 100) : 0;
      return [
        `World ${w.worldNumber}: ${w.shortTitle}`,
        `${done} / ${wTopics.length} Modules`,
        `${pct}% Complete`,
      ];
    });
    builder.drawWrappedTable(['Syllabus Stage', 'Modules Mastered', 'Status'], rows, [
      0.5,
      0.25,
      0.25,
    ]);
  }

  // Optional Quick Formulas & Checkpoints
  if (
    params.includeFormulasCheatSheet ||
    params.includeFourFoldControlTest ||
    params.includeTwoNoticeChecklist ||
    params.includeRetirementFormulaBox
  ) {
    builder.drawSectionBanner('CORE STATUTORY FORMULAS & DUE PROCESS CHECKPOINTS');
    const bullets: string[] = [];
    if (params.includeFormulasCheatSheet) {
      bullets.push(
        '13th-Month Pay (P.D. 851): Total Basic Salary Earned ÷ 12 (Payable on or before December 24; minimum 1 month service).'
      );
      bullets.push(
        'Overtime & NSD: Ordinary OT = 125% | Rest/Special OT = 169% | Regular Holiday OT = 260% | Night Shift Diff (10PM–6AM) = +10%.'
      );
    }
    if (params.includeRetirementFormulaBox) {
      bullets.push(
        'Retirement Pay (R.A. 7641): 22.5 Days × Daily Rate × Years of Service (15d + 5d SIL + 2.5d 13th month; age 60–65, >=5 yrs).'
      );
    }
    if (params.includeFourFoldControlTest) {
      bullets.push(
        'Four-Fold Control Test: (1) Selection & Engagement, (2) Payment of Wages, (3) Power of Dismissal, (4) Power of Control over means & methods.'
      );
    }
    if (params.includeTwoNoticeChecklist) {
      bullets.push(
        'Procedural Due Process: Just Cause = Twin Written Notices (at least 5 calendar days to answer) + Hearing | Authorized Cause = 30-Day Advance Notice to Worker & DOLE.'
      );
    }
    for (const b of bullets) {
      const lh = builder.setFont(400, 15);
      const lines = wrapCanvasText(builder.ctx, `• ${b}`, builder.contentW - 20);
      builder.ensureSpace(lines.length * lh + 8);
      builder.ctx.fillStyle = theme.bodyTextHex;
      lines.forEach((ln, idx) => {
        builder.ctx.fillText(ln, builder.marginX + 10, builder.y + idx * lh);
      });
      builder.y += lines.length * lh + 8;
    }
    builder.y += 8;
  }

  // Personal Study Notes
  if (params.includePersonalNotes !== false && params.studyNotes && params.studyNotes.length > 0) {
    builder.drawSectionBanner(`PERSONAL STUDY NOTES & MNEMONICS (${params.studyNotes.length})`);
    for (const n of params.studyNotes) {
      const bodyLh = builder.setFont(400, 14.5);
      const bodyLines = wrapCanvasText(builder.ctx, n.content, builder.contentW - 32);
      const boxH = 44 + bodyLines.length * bodyLh;
      builder.ensureSpace(boxH + 14);
      drawRoundedRect(builder.ctx, builder.marginX, builder.y, builder.contentW, boxH, 8);
      builder.ctx.fillStyle = theme.accentSoftBgHex;
      builder.ctx.fill();
      builder.ctx.strokeStyle = theme.accentHex;
      builder.ctx.lineWidth = 1.5;
      builder.ctx.stroke();

      builder.setFont(700, 15.5);
      builder.ctx.fillStyle = theme.accentHex;
      const head = wrapCanvasText(
        builder.ctx,
        `${n.title} [${n.worldTag}]`,
        builder.contentW - 32
      )[0];
      builder.ctx.fillText(head, builder.marginX + 16, builder.y + 12);

      builder.setFont(400, 14.5);
      builder.ctx.fillStyle = theme.bodyTextHex;
      bodyLines.forEach((ln, idx) => {
        builder.ctx.fillText(ln, builder.marginX + 16, builder.y + 36 + idx * bodyLh);
      });
      builder.y += boxH + 12;
    }
  }

  // I. Multiplier Matrix
  if (params.includeMultipliers !== false) {
    builder.drawSectionBanner(
      'I. STATUTORY PAY MULTIPLIER MATRIX (DOLE BWC)',
      'Arts. 86, 87, 93–94'
    );
    const multRows = LABOR_BENEFITS_MULTIPLIER_LIST.map((row) => [
      row.benefit,
      `${(row.multiplierDecimal * 100).toFixed(1).replace(/\.0$/, '')}%`,
      `${row.scenario} (${row.formula})`,
    ]);
    builder.drawWrappedTable(
      ['Benefit / Day Type', 'Rate', 'Applicable Scenario & Statutory Formula'],
      multRows,
      [0.3, 0.14, 0.56]
    );
  }

  // II. 17 Regions Minimum Wages
  if (params.includeRegionalWages !== false) {
    builder.drawSectionBanner(
      'II. 17 REGIONS MINIMUM WAGE & KASAMBAHAY MATRIX',
      'R.A. 6727 & R.A. 10361'
    );
    const wageRows = REGIONAL_MINIMUM_WAGES.map((rw, idx) => {
      const kas = KASAMBAHAY_MINIMUM_WAGES[idx];
      return [rw.region, rw.nonAgri, rw.agri, kas ? kas.minimumWage : '—'];
    });
    builder.drawWrappedTable(
      ['Region', 'Non-Agriculture Daily', 'Agriculture Daily', 'Kasambahay Monthly'],
      wageRows,
      [0.32, 0.24, 0.22, 0.22]
    );
  }

  // III. World 6 Leaves Matrix
  if (params.includeLeavesMatrix !== false) {
    builder.drawSectionBanner(
      'III. WORLD 6 STATUTORY LEAVES COMPARISON MATRIX',
      'Art. 95 & Special Laws'
    );
    const leaveRows = ONE_PAGE_STATUTORY_LEAVE_CAPS.map((lv) => [
      `${lv.leaveName} (${lv.citation})`,
      lv.cap,
      lv.rule,
    ]);
    builder.drawWrappedTable(
      ['Statutory Leave & Basis', 'Paid Cap', 'Eligibility & Cash Conversion Rule'],
      leaveRows,
      [0.31, 0.2, 0.49]
    );
  }

  // IV. Unabridged Modules
  for (const world of WORLDS_METADATA.filter((w) => params.selectedWorlds.includes(w.id))) {
    const worldTopics = params.topics.filter((t) => t.worldId === world.id);
    if (worldTopics.length === 0) continue;

    builder.drawSectionBanner(
      `WORLD ${world.worldNumber}: ${world.title.replace(/^WORLD \d+:\s*/i, '')}`,
      `${worldTopics.length} MODULES`
    );

    for (const topic of worldTopics) {
      builder.ensureSpace(95);
      const isDone = params.completedTopicIds.includes(topic.id);

      // Divider rule
      builder.ctx.strokeStyle = theme.accentHex;
      builder.ctx.lineWidth = 2;
      builder.ctx.beginPath();
      builder.ctx.moveTo(builder.marginX, builder.y);
      builder.ctx.lineTo(builder.marginX + builder.contentW, builder.y);
      builder.ctx.stroke();
      builder.y += 12;

      const checkPrefix =
        params.includeCheckboxes !== false ? (isDone ? '[x] ' : '[ ] ') : '';
      const headingStr =
        params.includeLegalCitations !== false
          ? `${checkPrefix}${topic.title} [${topic.badge}]`
          : `${checkPrefix}${topic.title}`;

      const titleLh = builder.setFont(800, 19);
      const titleLines = wrapCanvasText(builder.ctx, headingStr, builder.contentW - 150);
      builder.ensureSpace(titleLines.length * titleLh + 14);
      builder.ctx.fillStyle = theme.bodyTextHex;
      titleLines.forEach((ln, idx) => {
        builder.ctx.fillText(ln, builder.marginX, builder.y + idx * titleLh);
      });

      builder.setFont(700, 13.5);
      const statusText = isDone ? 'MASTERED' : 'TO STUDY';
      const stW = builder.ctx.measureText(statusText).width;
      builder.ctx.fillStyle = isDone ? theme.accentHex : theme.mutedTextHex;
      builder.ctx.fillText(statusText, builder.marginX + builder.contentW - stW, builder.y + 3);
      builder.y += titleLines.length * titleLh + 8;

      if (!params.matricesOnlyMode) {
        const sumLh = builder.setFont(600, 15);
        const sumLines = wrapCanvasText(
          builder.ctx,
          `Core Summary: ${cleanInlineMarkup(topic.summary)}`,
          builder.contentW - 12
        );
        builder.ensureSpace(sumLines.length * sumLh + 10);
        builder.ctx.fillStyle = theme.bodyTextHex;
        sumLines.forEach((ln, idx) => {
          builder.ctx.fillText(ln, builder.marginX + 6, builder.y + idx * sumLh);
        });
        builder.y += sumLines.length * sumLh + 10;
      }

      const rules = params.matricesOnlyMode
        ? topic.rules.filter((r) => Boolean(r.tableData))
        : topic.rules;

      for (let rIdx = 0; rIdx < rules.length; rIdx++) {
        const rule = rules[rIdx];
        const rHeadLh = builder.setFont(700, 16);
        const rHeadLines = wrapCanvasText(
          builder.ctx,
          `${rIdx + 1}. ${cleanInlineMarkup(rule.heading)}`,
          builder.contentW - 16
        );
        builder.ensureSpace(rHeadLines.length * rHeadLh + 16);
        builder.ctx.fillStyle = theme.accentHex;
        rHeadLines.forEach((ln, idx) => {
          builder.ctx.fillText(ln, builder.marginX + 10, builder.y + idx * rHeadLh);
        });
        builder.y += rHeadLines.length * rHeadLh + 5;

        if (!params.matricesOnlyMode && rule.description) {
          const descLh = builder.setFont(400, 14.5);
          const descLines = wrapCanvasText(
            builder.ctx,
            cleanInlineMarkup(rule.description),
            builder.contentW - 28
          );
          builder.ensureSpace(descLines.length * descLh + 8);
          builder.ctx.fillStyle = theme.bodyTextHex;
          descLines.forEach((ln, idx) => {
            builder.ctx.fillText(ln, builder.marginX + 20, builder.y + idx * descLh);
          });
          builder.y += descLines.length * descLh + 6;
        }

        if (!params.matricesOnlyMode && rule.items && rule.items.length > 0) {
          for (const item of rule.items) {
            const itemLh = builder.setFont(400, 14);
            const itemLines = wrapCanvasText(
              builder.ctx,
              `• ${cleanInlineMarkup(item)}`,
              builder.contentW - 38
            );
            builder.ensureSpace(itemLines.length * itemLh + 6);
            builder.ctx.fillStyle = theme.mutedTextHex;
            itemLines.forEach((ln, idx) => {
              builder.ctx.fillText(ln, builder.marginX + 28, builder.y + idx * itemLh);
            });
            builder.y += itemLines.length * itemLh + 4;
          }
        }

        if (rule.tableData) {
          builder.y += 4;
          builder.drawWrappedTable(rule.tableData.headers, rule.tableData.rows);
        }
      }

      if (!params.matricesOnlyMode && params.includeBarTips !== false) {
        const tips = [...(topic.keyTips || []), ...(topic.barTips || [])].slice(0, 3);
        for (const tip of tips) {
          const tipLh = builder.setFont(700, 14, true);
          const tipLines = wrapCanvasText(
            builder.ctx,
            `Bar Checkpoint: ${cleanInlineMarkup(tip)}`,
            builder.contentW - 32
          );
          builder.ensureSpace(tipLines.length * tipLh + 12);
          builder.ctx.fillStyle = theme.accentHex;
          tipLines.forEach((ln, idx) => {
            builder.ctx.fillText(ln, builder.marginX + 18, builder.y + idx * tipLh);
          });
          builder.y += tipLines.length * tipLh + 6;
        }
      }

      if (params.blankNoteLinesCount && params.blankNoteLinesCount > 0) {
        const count = Math.min(10, params.blankNoteLinesCount);
        builder.ensureSpace(count * 32 + 36);
        builder.setFont(700, 13.5);
        builder.ctx.fillStyle = theme.mutedTextHex;
        builder.ctx.fillText('Handwritten Margin Notes:', builder.marginX + 10, builder.y);
        builder.y += 24;
        builder.ctx.strokeStyle = '#CBD5E1';
        builder.ctx.lineWidth = 1.2;
        for (let ln = 0; ln < count; ln++) {
          builder.ctx.beginPath();
          builder.ctx.moveTo(builder.marginX + 10, builder.y + 18);
          builder.ctx.lineTo(builder.marginX + builder.contentW - 10, builder.y + 18);
          builder.ctx.stroke();
          builder.y += 28;
        }
      }

      builder.y += 16;
    }
  }

  if (params.includeHonorPledge) {
    const pledgeText =
      '"I commit to mastering Philippine Labor Standards with integrity, accuracy, and fidelity to social justice and fair workplace rights."';
    const pLh = builder.setFont(600, 14.5, true);
    const pLines = wrapCanvasText(builder.ctx, pledgeText, builder.contentW - 36);
    const boxH = 50 + pLines.length * pLh;
    builder.ensureSpace(boxH + 16);
    drawRoundedRect(builder.ctx, builder.marginX, builder.y, builder.contentW, boxH, 10);
    builder.ctx.fillStyle = theme.accentSoftBgHex;
    builder.ctx.fill();
    builder.ctx.strokeStyle = theme.accentHex;
    builder.ctx.lineWidth = 2;
    builder.ctx.stroke();

    builder.setFont(700, 15);
    builder.ctx.fillStyle = theme.accentHex;
    builder.ctx.fillText(
      'LEARNER COMMITMENT & WORKPLACE JUSTICE PLEDGE',
      builder.marginX + 18,
      builder.y + 14
    );
    builder.setFont(600, 14.5, true);
    builder.ctx.fillStyle = theme.bodyTextHex;
    pLines.forEach((ln, idx) => {
      builder.ctx.fillText(ln, builder.marginX + 18, builder.y + 40 + idx * pLh);
    });
    builder.y += boxH + 14;
  }

  builder.stampFooters(params.includeWatermark ? params.watermarkText : undefined);
  return canvasesToPdfBytes(
    builder.pages,
    orientation,
    `Philippine Labor Standards Reviewer (${font.name})`
  );
}

/**
 * 2. Exact 1-Page A4 Summary Sheet rendered with the exact chosen Google Font.
 */
export async function buildTrueFontOnePageSummaryPdfBytesAsync(
  options: OnePageSummaryPdfOptions = {}
): Promise<Uint8Array> {
  if (typeof document === 'undefined') {
    return buildOnePageSummaryPdfBytes(options);
  }
  const font = await ensurePrintFontLoadedInBrowser(options.fontStyle);
  const theme = resolveExtendedPrintTheme(options.colorAccent);

  const canvas = document.createElement('canvas');
  const W = 1240;
  const H = 1754;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = theme.borderHex;
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  const mx = 48;
  const contentW = W - mx * 2;

  // Top Header
  drawRoundedRect(ctx, mx, 46, contentW, 96, 10);
  ctx.fillStyle = theme.headerBgHex;
  ctx.fill();
  ctx.strokeStyle = theme.borderHex;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textBaseline = 'top';
  ctx.font = buildCanvasFontString(font, 700, 13);
  ctx.fillStyle = theme.headerTextHex;
  const k = 'PHILIPPINE LABOR CODE (P.D. 442) · DOLE BWC HANDBOOK · ONE-PAGE RAPID FORMULA SHEET';
  const kLine = wrapCanvasText(ctx, k, contentW - 32)[0] || k;
  ctx.fillText(kLine, mx + 18, 60);

  ctx.font = buildCanvasFontString(font, 800, 23);
  ctx.fillStyle =
    theme.id === 'ink_saver_bw' || theme.category === 'Pastel & Ink-Saver'
      ? theme.bodyTextHex
      : '#FFFFFF';
  const hLine =
    wrapCanvasText(
      ctx,
      'STATUTORY FORMULAS, DEADLINES & LEAVES MASTER SHEET (A4)',
      contentW - 32
    )[0] || '';
  ctx.fillText(hLine, mx + 18, 82);

  ctx.font = buildCanvasFontString(font, 600, 12.5);
  ctx.fillStyle = theme.headerTextHex;
  const dateStr =
    options.dateLabel ||
    new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  const sub = options.candidateName
    ? `Prepared for: ${options.candidateName}  |  Font: ${font.name}  |  Generated: ${dateStr}  |  Matthew Cesar Corpuz`
    : `Font: ${font.name}  |  Theme: ${theme.name}  |  Generated: ${dateStr}  |  Matthew Cesar Corpuz`;
  const sLine = wrapCanvasText(ctx, sub, contentW - 32)[0] || sub;
  ctx.fillText(sLine, mx + 18, 116);

  // Two Columns
  const colGap = 24;
  const colW = Math.floor((contentW - colGap) / 2);
  const leftX = mx;
  const rightX = mx + colW + colGap;

  // Left Column: Formulas
  let ly = 156;
  drawRoundedRect(ctx, leftX, ly, colW, 34, 6);
  ctx.fillStyle = theme.accentHex;
  ctx.fill();
  ctx.font = buildCanvasFontString(font, 700, 14);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(
    wrapCanvasText(ctx, 'I. STATUTORY WAGE & SEPARATION FORMULAS', colW - 20)[0],
    leftX + 12,
    ly + 9
  );
  ly += 42;

  ONE_PAGE_LEGAL_FORMULAS.slice(0, 11).forEach((item, idx) => {
    const rowH = 92;
    ctx.fillStyle = idx % 2 === 0 ? theme.tableStripeBgHex : '#FFFFFF';
    ctx.fillRect(leftX, ly, colW, rowH);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(leftX, ly, colW, rowH);

    // Rate badge
    const bw = 114;
    drawRoundedRect(ctx, leftX + colW - bw - 8, ly + 7, bw, 24, 5);
    ctx.fillStyle = theme.accentSoftBgHex;
    ctx.fill();
    ctx.strokeStyle = theme.accentHex;
    ctx.stroke();
    ctx.font = buildCanvasFontString(font, 700, 11.5);
    ctx.fillStyle = theme.accentHex;
    const rt = wrapCanvasText(ctx, item.rateBadge, bw - 10)[0] || item.rateBadge;
    ctx.fillText(rt, leftX + colW - bw - 2, ly + 12);

    ctx.font = buildCanvasFontString(font, 700, 13.5);
    ctx.fillStyle = theme.bodyTextHex;
    const tLine =
      wrapCanvasText(ctx, `${idx + 1}. ${item.title}`, colW - bw - 24)[0] || item.title;
    ctx.fillText(tLine, leftX + 10, ly + 9);

    ctx.font = buildCanvasFontString(font, 700, 12.5);
    ctx.fillStyle = theme.accentHex;
    const fLine = wrapCanvasText(ctx, item.formula, colW - 20)[0] || item.formula;
    ctx.fillText(fLine, leftX + 10, ly + 33);

    ctx.font = buildCanvasFontString(font, 400, 11.5);
    ctx.fillStyle = theme.mutedTextHex;
    const nLines = wrapCanvasText(ctx, `${item.note} [${item.citation}]`, colW - 20).slice(0, 2);
    nLines.forEach((nl, ni) => ctx.fillText(nl, leftX + 10, ly + 54 + ni * 16));

    ly += rowH + 4;
  });

  // Right Column: Deadlines
  let ry = 156;
  drawRoundedRect(ctx, rightX, ry, colW, 34, 6);
  ctx.fillStyle = theme.headerBgHex;
  ctx.fill();
  ctx.font = buildCanvasFontString(font, 700, 14);
  ctx.fillStyle = theme.headerTextHex;
  ctx.fillText(
    wrapCanvasText(ctx, 'II. DEADLINES & PRESCRIPTIVE PERIODS', colW - 20)[0],
    rightX + 12,
    ry + 9
  );
  ry += 42;

  ONE_PAGE_LEGAL_DEADLINES.slice(0, 12).forEach((item, idx) => {
    const rowH = 84;
    ctx.fillStyle = idx % 2 === 0 ? theme.tableStripeBgHex : '#FFFFFF';
    ctx.fillRect(rightX, ry, colW, rowH);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(rightX, ry, colW, rowH);

    const bw = 138;
    drawRoundedRect(ctx, rightX + colW - bw - 8, ry + 7, bw, 24, 5);
    ctx.fillStyle = theme.accentSoftBgHex;
    ctx.fill();
    ctx.strokeStyle = theme.accentHex;
    ctx.stroke();
    ctx.font = buildCanvasFontString(font, 700, 11);
    ctx.fillStyle = theme.accentHex;
    const dl = wrapCanvasText(ctx, item.deadline, bw - 10)[0] || item.deadline;
    ctx.fillText(dl, rightX + colW - bw - 2, ry + 12);

    ctx.font = buildCanvasFontString(font, 700, 13);
    ctx.fillStyle = theme.bodyTextHex;
    const tLine =
      wrapCanvasText(ctx, `${idx + 1}. ${item.claimOrAction}`, colW - bw - 22)[0] || '';
    ctx.fillText(tLine, rightX + 10, ry + 9);

    ctx.font = buildCanvasFontString(font, 400, 11.5);
    ctx.fillStyle = theme.mutedTextHex;
    const rLines = wrapCanvasText(
      ctx,
      `${item.reckoningRule} (${item.citation})`,
      colW - 20
    ).slice(0, 2);
    rLines.forEach((rl, ri) => ctx.fillText(rl, rightX + 10, ry + 38 + ri * 17));

    ry += rowH + 4;
  });

  // Bottom World 6 Leaves Matrix
  const by = Math.max(ly, ry) + 8;
  drawRoundedRect(ctx, mx, by, contentW, 32, 6);
  ctx.fillStyle = theme.headerBgHex;
  ctx.fill();
  ctx.font = buildCanvasFontString(font, 700, 13.5);
  ctx.fillStyle = theme.headerTextHex;
  ctx.fillText(
    'III. WORLD 6 STATUTORY LEAVES QUICK MATRIX & DUE PROCESS DAMAGES',
    mx + 14,
    by + 8
  );

  const lCardW = Math.floor((contentW - 24) / 3);
  const lCardH = 74;
  const gridY = by + 40;
  ONE_PAGE_STATUTORY_LEAVE_CAPS.slice(0, 6).forEach((lv, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cx = mx + col * (lCardW + 12);
    const cy = gridY + row * (lCardH + 8);
    drawRoundedRect(ctx, cx, cy, lCardW, lCardH, 6);
    ctx.fillStyle = theme.accentSoftBgHex;
    ctx.fill();
    ctx.strokeStyle = theme.accentHex;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = buildCanvasFontString(font, 700, 12.5);
    ctx.fillStyle = theme.bodyTextHex;
    ctx.fillText(
      wrapCanvasText(ctx, `${lv.leaveName} (${lv.citation})`, lCardW - 16)[0] || lv.leaveName,
      cx + 8,
      cy + 8
    );

    ctx.font = buildCanvasFontString(font, 700, 12);
    ctx.fillStyle = theme.accentHex;
    ctx.fillText(wrapCanvasText(ctx, lv.cap, lCardW - 16)[0] || lv.cap, cx + 8, cy + 27);

    ctx.font = buildCanvasFontString(font, 400, 11);
    ctx.fillStyle = theme.mutedTextHex;
    ctx.fillText(wrapCanvasText(ctx, lv.rule, lCardW - 16)[0] || lv.rule, cx + 8, cy + 47);
  });

  // Footer
  ctx.font = buildCanvasFontString(font, 600, 12.5);
  ctx.fillStyle = theme.mutedTextHex;
  ctx.fillText(
    `Super Mario Labor Adventure · A4 One-Page Summary · Font: ${font.name} · Page 1 of 1`,
    mx,
    H - 54
  );

  return canvasesToPdfBytes([canvas], 'portrait', `One-Page Formulas (${font.name})`);
}

/**
 * 3. Executive Mastery Certificate OR Royal Grand Master Diploma rendered in True Chosen Font.
 */
export async function buildTrueFontCertificateOrDiplomaPdfBytesAsync(
  params: CertificatePdfParams,
  isMasterDiploma: boolean = false
): Promise<Uint8Array> {
  if (typeof document === 'undefined') {
    return isMasterDiploma ? buildMasterDiplomaPdfBytes(params) : buildCertificatePdfBytes(params);
  }
  const font = await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const theme = resolveExtendedPrintTheme(
    isMasterDiploma ? params.colorAccent || 'mario_crimson' : params.colorAccent
  );
  const orient = params.orientation === 'portrait' ? 'portrait' : 'landscape';

  const W = orient === 'portrait' ? 1240 : 1754;
  const H = orient === 'portrait' ? 1754 : 1240;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isMasterDiploma ? '#FEFBF3' : '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Ornamental triple border
  ctx.strokeStyle = isMasterDiploma ? '#7F1D1D' : theme.accentHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.strokeStyle = isMasterDiploma ? '#D97706' : theme.borderHex;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(68, 68, W - 136, H - 136);

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, 80, W - 160, H - 160);

  ctx.textBaseline = 'top';
  const drawCentered = (
    text: string,
    y: number,
    weight: 400 | 600 | 700 | 800,
    sizePx: number,
    color: string,
    maxW: number = W - 220,
    italic = false
  ): number => {
    const lh = Math.round(
      Math.max(10, Math.round(sizePx * font.sizeScale)) * 1.38 * font.lineHeightScale
    );
    ctx.font = buildCanvasFontString(font, weight, sizePx, italic);
    ctx.fillStyle = color;
    const lines = wrapCanvasText(ctx, text, maxW);
    lines.forEach((ln, idx) => {
      const lw = ctx.measureText(ln).width;
      ctx.fillText(ln, (W - lw) / 2, y + idx * lh);
    });
    return y + lines.length * lh;
  };

  const recipient = params.recipientName?.trim() || 'Distinguished Labor Standards Scholar';
  const honors = params.honors?.trim() || 'Summa Cum Laude · Super Star Mastery Rank';
  const dateStr =
    params.dateLabel ||
    new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId =
    params.certificateId ||
    `${isMasterDiploma ? 'MK-CHARTER' : 'PH-LAW'}-${Math.abs(params.completedCount * 137 + 442)
      .toString(16)
      .toUpperCase()}`;

  let cy = orient === 'portrait' ? 118 : 102;

  if (isMasterDiploma) {
    drawRoundedRect(ctx, 110, cy, W - 220, 92, 12);
    ctx.fillStyle = '#7F1D1D';
    ctx.fill();
    drawCentered(
      'ROYAL MUSHROOM ACADEMY · SENATE OF SOCIAL LEGISLATION & JURISPRUDENCE',
      cy + 18,
      700,
      orient === 'portrait' ? 16 : 19,
      '#FDE047',
      W - 260
    );
    drawCentered(
      'Iustitia Laboris · Six-World Unabridged Statutory Charter',
      cy + 52,
      600,
      14,
      '#FEF3C7',
      W - 260,
      true
    );
    cy += 116;
  } else {
    cy = drawCentered(
      'REPUBLIC OF THE PHILIPPINES · ACADEMY OF LABOR STANDARDS & SOCIAL LEGISLATION',
      cy,
      700,
      orient === 'portrait' ? 16 : 18,
      theme.accentHex
    );
    cy = drawCentered(
      'PRESIDENTIAL DECREE NO. 442 (LABOR CODE OF THE PHILIPPINES) · WORLDS 1 TO 6',
      cy + 8,
      600,
      14,
      theme.mutedTextHex
    );
    cy += 24;
  }

  cy = drawCentered(
    isMasterDiploma
      ? 'GRAND MASTER JURIS DIPLOMA'
      : 'CERTIFICATE OF STATUTORY COMPLETION',
    cy,
    800,
    orient === 'portrait' ? 36 : 42,
    isMasterDiploma ? '#7F1D1D' : theme.headerBgHex === '#FFFFFF' ? '#111827' : theme.accentHex
  );

  cy = drawCentered(
    isMasterDiploma
      ? 'By Authority of the High Academy Senate, Know All Persons That'
      : 'This Executive Honor Certificate is Proudly Conferred Upon',
    cy + 16,
    600,
    18,
    theme.mutedTextHex,
    W - 240,
    true
  );

  cy = drawCentered(
    recipient,
    cy + 20,
    800,
    orient === 'portrait' ? 40 : 46,
    theme.bodyTextHex,
    W - 240
  );

  ctx.strokeStyle = isMasterDiploma ? '#D97706' : theme.accentHex;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.22, cy + 6);
  ctx.lineTo(W * 0.78, cy + 6);
  ctx.stroke();
  cy += 22;

  cy = drawCentered(
    isMasterDiploma
      ? 'GRAND MASTER OF PHILIPPINE LABOR STANDARDS · SUMMA CUM CODAL'
      : honors.toUpperCase(),
    cy,
    700,
    17,
    isMasterDiploma ? '#991B1B' : theme.accentHex
  );

  cy = drawCentered(
    'for demonstrating comprehensive statutory mastery and practical command across all Six Worlds of Philippine Labor Standards (P.D. 442, as amended): Hours of Work & Overtime, Rest Days & Holidays, Wages & D.O. 174, Special Groups, Protective Laws, and Statutory Leaves.',
    cy + 16,
    400,
    16,
    theme.bodyTextHex,
    W - 260
  );

  // 6-World Grid
  cy += 28;
  const cols = orient === 'portrait' ? 2 : 6;
  const gap = 16;
  const gridW = W - 220;
  const cardW = Math.floor((gridW - gap * (cols - 1)) / cols);
  const cardH = orient === 'portrait' ? 92 : 96;

  WORLDS_METADATA.forEach((w, idx) => {
    const c = idx % cols;
    const r = Math.floor(idx / cols);
    const bx = 110 + c * (cardW + gap);
    const by = cy + r * (cardH + gap);
    drawRoundedRect(ctx, bx, by, cardW, cardH, 10);
    ctx.fillStyle = isMasterDiploma ? '#FFFBEB' : theme.accentSoftBgHex;
    ctx.fill();
    ctx.strokeStyle = isMasterDiploma ? '#D97706' : theme.accentHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = buildCanvasFontString(font, 700, 14);
    ctx.fillStyle = isMasterDiploma ? '#991B1B' : theme.accentHex;
    const wTag = `WORLD ${w.worldNumber}`;
    ctx.fillText(wTag, bx + (cardW - ctx.measureText(wTag).width) / 2, by + 16);

    ctx.font = buildCanvasFontString(font, 700, 14);
    ctx.fillStyle = theme.bodyTextHex;
    const st = wrapCanvasText(ctx, w.shortTitle, cardW - 18)[0] || w.shortTitle;
    ctx.fillText(st, bx + (cardW - ctx.measureText(st).width) / 2, by + 46);
  });

  // Signatures & Official Seal at Bottom
  const sigY = H - 185;
  ctx.strokeStyle = theme.borderHex;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, sigY);
  ctx.lineTo(480, sigY);
  ctx.moveTo(W - 480, sigY);
  ctx.lineTo(W - 140, sigY);
  ctx.stroke();

  ctx.font = buildCanvasFontString(font, 700, 18, true);
  ctx.fillStyle = theme.bodyTextHex;
  const s1 = 'Matthew Cesar Corpuz';
  ctx.fillText(s1, 310 - ctx.measureText(s1).width / 2, sigY - 32);
  const s2 = 'Academic Standards Council';
  ctx.fillText(s2, W - 310 - ctx.measureText(s2).width / 2, sigY - 32);

  ctx.font = buildCanvasFontString(font, 700, 13);
  ctx.fillStyle = theme.mutedTextHex;
  const r1 = 'MAIN CREATOR & LEAD AUTHOR';
  ctx.fillText(r1, 310 - ctx.measureText(r1).width / 2, sigY + 10);
  const r2 = 'PHILIPPINE LABOR STANDARDS BOARD';
  ctx.fillText(r2, W - 310 - ctx.measureText(r2).width / 2, sigY + 10);

  // Center Gold Seal
  ctx.beginPath();
  ctx.arc(W / 2, sigY - 14, 52, 0, Math.PI * 2);
  ctx.fillStyle = isMasterDiploma ? '#F59E0B' : theme.accentHex;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = isMasterDiploma ? '#7F1D1D' : theme.borderHex;
  ctx.stroke();

  ctx.font = buildCanvasFontString(font, 800, 13);
  ctx.fillStyle = isMasterDiploma ? '#0F172A' : '#FFFFFF';
  const sealTxt = isMasterDiploma ? 'SENATE SEAL' : 'VERIFIED';
  ctx.fillText(sealTxt, W / 2 - ctx.measureText(sealTxt).width / 2, sigY - 22);

  drawCentered(
    `ISSUED: ${dateStr}  |  ID: ${certId}  |  MODULES: ${params.completedCount}/${Math.max(
      1,
      params.totalCount
    )}  |  FONT: ${font.name}`,
    H - 118,
    600,
    12.5,
    theme.mutedTextHex
  );

  return canvasesToPdfBytes(
    [canvas],
    orient,
    isMasterDiploma ? `Grand Master Diploma (${font.name})` : `Mastery Certificate (${font.name})`
  );
}

/**
 * 4. Official Hero Score Card Landscape PDF rendered in True Chosen Font.
 */
export async function buildTrueFontScoreCardPdfBytesAsync(
  params: ScoreCardPdfParams
): Promise<Uint8Array> {
  if (typeof document === 'undefined') {
    return buildScoreCardLandscapePdfBytes(params);
  }
  const font = await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const theme = resolveExtendedPrintTheme(params.colorAccent);

  const W = 1754;
  const H = 1240;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = theme.accentHex;
  ctx.lineWidth = 8;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  const mx = 84;
  const contentW = W - mx * 2;
  const pct = Math.min(
    100,
    Math.round((params.completedCount / Math.max(1, params.totalTopics)) * 100)
  );

  // Header Banner
  drawRoundedRect(ctx, mx, 78, contentW, 175, 16);
  ctx.fillStyle = theme.headerBgHex;
  ctx.fill();
  ctx.strokeStyle = theme.borderHex;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.textBaseline = 'top';
  ctx.font = buildCanvasFontString(font, 700, 16);
  ctx.fillStyle = theme.headerTextHex;
  ctx.fillText(
    'SUPER MARIO LABOR ADVENTURE · OFFICIAL HERO SCORE CARD & MASTERY DOSSIER',
    mx + 28,
    102
  );

  ctx.font = buildCanvasFontString(font, 800, 40);
  ctx.fillStyle =
    theme.id === 'ink_saver_bw' || theme.category === 'Pastel & Ink-Saver'
      ? theme.bodyTextHex
      : '#FFFFFF';
  const pName =
    wrapCanvasText(ctx, params.playerName || 'Labor Scholar Hero', contentW - 420)[0] ||
    'Labor Scholar Hero';
  ctx.fillText(pName, mx + 28, 136);

  ctx.font = buildCanvasFontString(font, 600, 19);
  ctx.fillStyle = theme.headerTextHex;
  ctx.fillText(
    `${params.heroRank}  ·  Equipped Hero: ${params.heroName}`,
    mx + 28,
    202
  );

  // Right Mastery Box
  drawRoundedRect(ctx, mx + contentW - 340, 100, 312, 130, 14);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = theme.accentHex;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = buildCanvasFontString(font, 800, 44);
  ctx.fillStyle = theme.accentHex;
  const pctStr = `${pct}%`;
  ctx.fillText(pctStr, mx + contentW - 184 - ctx.measureText(pctStr).width / 2, 118);

  ctx.font = buildCanvasFontString(font, 700, 15);
  ctx.fillStyle = theme.bodyTextHex;
  const mSub = `${params.completedCount}/${params.totalTopics} Modules Mastered`;
  ctx.fillText(mSub, mx + contentW - 184 - ctx.measureText(mSub).width / 2, 184);

  // 5 KPI Tiles
  const stats = [
    { label: 'STUDY TIME', val: params.studyDurationFormatted },
    { label: 'GOLD COINS', val: `x${params.coins}` },
    { label: 'DAILY STREAK', val: `${params.loginStreak} Days` },
    {
      label: 'BADGES EARNED',
      val: `${params.unlockedAchievementsCount}/${params.totalAchievementsCount}`,
    },
    { label: 'QUIZ RUNS', val: `${params.quizRunsCompleted} Cleared` },
  ];
  const gap = 20;
  const tileW = Math.floor((contentW - gap * 4) / 5);
  stats.forEach((st, idx) => {
    const tx = mx + idx * (tileW + gap);
    drawRoundedRect(ctx, tx, 282, tileW, 132, 12);
    ctx.fillStyle = theme.tableStripeBgHex;
    ctx.fill();
    ctx.strokeStyle = theme.borderHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = buildCanvasFontString(font, 700, 14);
    ctx.fillStyle = theme.mutedTextHex;
    ctx.fillText(st.label, tx + 20, 304);

    ctx.font = buildCanvasFontString(font, 800, 26);
    ctx.fillStyle = theme.accentHex;
    const vLine = wrapCanvasText(ctx, st.val, tileW - 36)[0] || st.val;
    ctx.fillText(vLine, tx + 20, 344);
  });

  // 6-World Breakdown
  ctx.font = buildCanvasFontString(font, 800, 20);
  ctx.fillStyle = theme.accentHex;
  ctx.fillText('SIX-WORLD LABOR STANDARDS MASTERY BREAKDOWN', mx, 448);

  const wColW = Math.floor((contentW - 28) / 2);
  const wRowH = 172;
  params.worldBreakdown.forEach((wb, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const bx = mx + col * (wColW + 28);
    const by = 492 + row * (wRowH + 22);

    drawRoundedRect(ctx, bx, by, wColW, wRowH, 14);
    ctx.fillStyle = theme.accentSoftBgHex;
    ctx.fill();
    ctx.strokeStyle = theme.borderHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = buildCanvasFontString(font, 700, 20);
    ctx.fillStyle = theme.bodyTextHex;
    const wTitle =
      wrapCanvasText(ctx, `World ${wb.worldNumber}: ${wb.shortTitle}`, wColW - 220)[0] || '';
    ctx.fillText(wTitle, bx + 24, by + 26);

    ctx.font = buildCanvasFontString(font, 800, 19);
    ctx.fillStyle = theme.accentHex;
    const pRight = `${wb.percent}% (${wb.completed}/${wb.total})`;
    ctx.fillText(pRight, bx + wColW - 24 - ctx.measureText(pRight).width, by + 26);

    drawRoundedRect(ctx, bx + 24, by + 92, wColW - 48, 34, 10);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    if (wb.percent > 0) {
      const fillW = Math.max(24, Math.floor(((wColW - 48) * wb.percent) / 100));
      drawRoundedRect(ctx, bx + 24, by + 92, fillW, 34, 10);
      ctx.fillStyle = theme.accentHex;
      ctx.fill();
    }
  });

  ctx.font = buildCanvasFontString(font, 600, 15);
  ctx.fillStyle = theme.mutedTextHex;
  const foot = `Super Mario Labor Adventure · Font: ${font.name} · Theme: ${theme.name} · Created by Matthew Cesar Corpuz`;
  ctx.fillText(foot, (W - ctx.measureText(foot).width) / 2, H - 86);

  return canvasesToPdfBytes([canvas], 'landscape', `Hero Score Card (${font.name})`);
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
