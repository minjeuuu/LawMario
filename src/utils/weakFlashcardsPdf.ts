import { Flashcard } from '../types/laborLaw';

/**
 * Sanitizes Unicode punctuation & currency symbols into clean WinAnsi-safe ASCII
 * for Type1 PDF Helvetica/Helvetica-Bold rendering without external font embedding.
 */
export function sanitizePdfText(input: string): string {
  return input
    .replace(/₱/g, 'PHP ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, ' - ')
    .replace(/•|·/g, '-')
    .replace(/…/g, '...')
    .replace(/§/g, 'Sec. ')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapePdfLiteral(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function wrapPdfLines(text: string, maxCharsPerLine: number): string[] {
  const clean = sanitizePdfText(text);
  if (!clean) return [''];
  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxCharsPerLine) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Generates a valid, multi-page PDF 1.4 document (Uint8Array) containing all
 * 'Needs Improvement' flashcards formatted as structured offline study cards.
 */
export function generateNeedsImprovementPdfBytes(params: {
  cards: Flashcard[];
  playerName?: string;
  generatedDateLabel?: string;
}): Uint8Array {
  const {
    cards,
    playerName = 'Counsel Hero',
    generatedDateLabel = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }),
  } = params;

  const pageWidth = 612; // US Letter width in pt
  const pageHeight = 792; // US Letter height in pt
  const marginX = 42;
  const contentWidth = pageWidth - marginX * 2;

  const pagesCommands: string[][] = [];
  let currentCmds: string[] = [];
  let cursorY = pageHeight - 48;

  const startNewPage = (pageNum: number) => {
    if (currentCmds.length > 0) {
      pagesCommands.push(currentCmds);
    }
    currentCmds = [];
    cursorY = pageHeight - 46;

    // Top Header Banner
    currentCmds.push('0.06 0.09 0.16 rg');
    currentCmds.push(`${marginX} ${cursorY - 38} ${contentWidth} 42 re f`);

    // Gold accent rule at bottom of header
    currentCmds.push('0.96 0.62 0.04 rg');
    currentCmds.push(`${marginX} ${cursorY - 40} ${contentWidth} 2.5 re f`);

    // Header Title
    currentCmds.push('BT');
    currentCmds.push('/F2 12 Tf');
    currentCmds.push('1 1 1 rg');
    currentCmds.push(`${marginX + 14} ${cursorY - 16} Td`);
    currentCmds.push(
      `(${escapePdfLiteral('PHILIPPINE LABOR STANDARDS - NEEDS IMPROVEMENT FLASHCARDS')}) Tj`
    );
    currentCmds.push('ET');

    // Header Subtitle
    const subtitle = sanitizePdfText(
      `Scholar: ${playerName}  |  Cards: ${cards.length}  |  Generated: ${generatedDateLabel}  |  Page ${pageNum}`
    );
    currentCmds.push('BT');
    currentCmds.push('/F1 8.5 Tf');
    currentCmds.push('0.98 0.82 0.35 rg');
    currentCmds.push(`${marginX + 14} ${cursorY - 30} Td`);
    currentCmds.push(`(${escapePdfLiteral(subtitle)}) Tj`);
    currentCmds.push('ET');

    cursorY -= 56;
  };

  startNewPage(1);

  cards.forEach((card, index) => {
    const qLines = wrapPdfLines(`Q: ${card.question}`, 78);
    const takeawayLines = wrapPdfLines(`Core Rule: ${card.keyTakeaway}`, 80);
    const ansLines = wrapPdfLines(`Statutory Basis: ${card.answer}`, 84);

    const cardHeight =
      26 + // card header bar
      qLines.length * 13 +
      8 +
      takeawayLines.length * 12 +
      8 +
      ansLines.length * 11.5 +
      16;

    if (cursorY - cardHeight < 46) {
      startNewPage(pagesCommands.length + 2);
    }

    const boxTop = cursorY;
    const boxBottom = cursorY - cardHeight;

    // Card Background & Border
    currentCmds.push('0.985 0.99 0.995 rg');
    currentCmds.push('0.12 0.16 0.23 RG');
    currentCmds.push('1 w');
    currentCmds.push(`${marginX} ${boxBottom.toFixed(1)} ${contentWidth} ${cardHeight.toFixed(1)} re B`);

    // Card Top Strip
    currentCmds.push('0.95 0.96 0.98 rg');
    currentCmds.push(`${marginX + 0.5} ${(boxTop - 21).toFixed(1)} ${contentWidth - 1} 20.5 re f`);

    const metaHeader = sanitizePdfText(
      `CARD #${index + 1}   |   ${card.world.toUpperCase()}   |   DIFFICULTY: ${card.difficulty.toUpperCase()}`
    );
    currentCmds.push('BT');
    currentCmds.push('/F2 8.5 Tf');
    currentCmds.push('0.08 0.12 0.22 rg');
    currentCmds.push(`${marginX + 12} ${(boxTop - 14).toFixed(1)} Td`);
    currentCmds.push(`(${escapePdfLiteral(metaHeader)}) Tj`);
    currentCmds.push('ET');

    let lineY = boxTop - 35;

    // Question lines (Bold)
    for (const line of qLines) {
      currentCmds.push('BT');
      currentCmds.push('/F2 10 Tf');
      currentCmds.push('0.05 0.08 0.15 rg');
      currentCmds.push(`${marginX + 12} ${lineY.toFixed(1)} Td`);
      currentCmds.push(`(${escapePdfLiteral(line)}) Tj`);
      currentCmds.push('ET');
      lineY -= 13;
    }

    lineY -= 3;

    // Core Takeaway lines (Bold Emerald-Slate)
    for (const line of takeawayLines) {
      currentCmds.push('BT');
      currentCmds.push('/F2 9.2 Tf');
      currentCmds.push('0.04 0.42 0.26 rg');
      currentCmds.push(`${marginX + 12} ${lineY.toFixed(1)} Td`);
      currentCmds.push(`(${escapePdfLiteral(line)}) Tj`);
      currentCmds.push('ET');
      lineY -= 12;
    }

    lineY -= 3;

    // Full Statutory Provision lines (Regular)
    for (const line of ansLines) {
      currentCmds.push('BT');
      currentCmds.push('/F1 8.8 Tf');
      currentCmds.push('0.20 0.25 0.33 rg');
      currentCmds.push(`${marginX + 12} ${lineY.toFixed(1)} Td`);
      currentCmds.push(`(${escapePdfLiteral(line)}) Tj`);
      currentCmds.push('ET');
      lineY -= 11.5;
    }

    cursorY = boxBottom - 12;
  });

  if (currentCmds.length > 0) {
    pagesCommands.push(currentCmds);
  }

  // Assemble PDF 1.4 Object Graph
  // Obj 1: Catalog
  // Obj 2: Pages
  // Obj 3: Font F1 (Helvetica)
  // Obj 4: Font F2 (Helvetica-Bold)
  // For each page i (0..N-1):
  //   Page Obj = 5 + i * 2
  //   Stream Obj = 6 + i * 2
  const objects: string[] = [];
  const pageCount = pagesCommands.length;
  const pageObjNums: number[] = [];

  for (let i = 0; i < pageCount; i++) {
    pageObjNums.push(5 + i * 2);
  }

  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageCount} >>\nendobj\n`
  );
  objects.push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');

  for (let i = 0; i < pageCount; i++) {
    const pageObjId = 5 + i * 2;
    const streamObjId = 6 + i * 2;
    const streamBody = pagesCommands[i].join('\n');

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamObjId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${streamObjId} 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream\nendobj\n`
    );
  }

  let pdfText = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(pdfText.length);
    pdfText += obj;
  }

  const xrefStart = pdfText.length;
  const totalObjs = objects.length + 1;
  pdfText += `xref\n0 ${totalObjs}\n`;
  pdfText += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdfText += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdfText += `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const encoder = new TextEncoder();
  return encoder.encode(pdfText);
}
