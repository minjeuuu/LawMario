/**
 * Verbatim Statutory Codification Formatter & Cloze Recitation Engine
 * 
 * Provides courtroom-grade parsing, semantic classification,
 * line numbering, Markdown digest generation, and Bar Recitation (Cloze Recall)
 * for Philippine statutory provisions, Republic Acts, and Supreme Court doctrines.
 */

export type VerbatimBlockType =
  | 'article-header'
  | 'subsection'
  | 'admin-directive'
  | 'case-precedent'
  | 'doctrine-note'
  | 'statute-body';

export interface VerbatimBlock {
  type: VerbatimBlockType;
  rawText: string;
  leadLabel?: string;
  bodyText: string;
}

export interface NumberedLine {
  lineNumber: number;
  text: string;
}

/**
 * High-yield statutory terms, numeric thresholds, and doctrine keywords
 * targeted for active recall codal recitation (cloze deletion).
 * Supports legal style: word (digit) format e.g. "eight (8) hours", "twenty-five percent (25%)".
 */
export const HIGH_YIELD_CLOZE_PATTERNS: RegExp[] = [
  /\b(?:twenty-four|24)(?:\s*\(\s*24\s*\))?\s+consecutive hours\b/gi,
  /\b(?:eight|8)(?:\s*\(\s*8\s*\))?\s+hours(?:\s+a\s+day)?\b/gi,
  /\b(?:forty|40)(?:\s*\(\s*40\s*\))?\s+hours(?:\s+a\s+week)?\b/gi,
  /\b(?:forty-eight|48)(?:\s*\(\s*48\s*\))?\s+hours\b/gi,
  /\b(?:twenty-five percent|25%)(?:\s*\(\s*25%\s*\))?\b/gi,
  /\b(?:thirty percent|30%)(?:\s*\(\s*30%\s*\))?\b/gi,
  /\b(?:fifty percent|50%)(?:\s*\(\s*50%\s*\))?\b/gi,
  /\b(?:one hundred percent|100%)(?:\s*\(\s*100%\s*\))?\b/gi,
  /\b(?:two hundred percent|200%)(?:\s*\(\s*200%\s*\))?\b/gi,
  /\b(?:ten percent|10%)(?:\s*\(\s*10%\s*\))?\b/gi,
  /\b(?:sixty|60)(?:\s*\(\s*60\s*\))?\s+minutes\b/gi,
  /\b(?:twenty|20)(?:\s*\(\s*20\s*\))?\s+minutes\b/gi,
  /\b(?:forty|40)(?:\s*\(\s*40\s*\))?\s+minutes\b/gi,
  /\b(?:five|5)(?:\s*\(\s*5\s*\))?\s+days\b/gi,
  /\b(?:seven|7)(?:\s*\(\s*7\s*\))?\s+working days\b/gi,
  /\b(?:105|one hundred five)(?:\s*\(\s*105\s*\))?\s+days\b/gi,
  /\b(?:ten|10)(?:\s*\(\s*10\s*\))?\s+days\b/gi,
  /\b(?:two|2)(?:\s*\(\s*2\s*\))?\s+months\b/gi,
  /\b(?:three|3)(?:\s*\(\s*3\s*\))?\s+years\b/gi,
  /\b(?:four|4)(?:\s*\(\s*4\s*\))?\s+years\b/gi,
  /\b(?:one|1)(?:\s*\(\s*1\s*\))?\s+year\b/gi,
  /\b(?:six|6)(?:\s*\(\s*6\s*\))?\s+months\b/gi,
  /\b(?:one|1)(?:\s*\(\s*1\s*\))?\s+month\b/gi,
  /\b(?:P5,000,000\.00|Five Million Pesos)\b/gi,
  /\b(?:P5,000\.00|Five thousand pesos)\b/gi,
  /\bDecember 24\b/gi,
  /\b10:00 PM and 6:00 AM\b/gi,
  /\b8:00 PM and 6:00 AM\b/gi,
  /\b10 o'clock in the evening and 6 o'clock in the morning\b/gi,
  /\bmanagerial employees\b/gi,
  /\bfield personnel\b/gi,
  /\bgovernment employees\b/gi,
  /\blabor-only contracting\b/gi,
  /\bsubstantial capital\b/gi,
  /\bfacilities\b/gi,
  /\bsupplements\b/gi,
  /\bstipulation against marriage\b/gi,
  /\bundertime\s+(?:work\s+)?on any particular day shall not be offset by overtime\b/gi,
];

/**
 * Splits statutory verbatim text into semantic blocks for structured courtroom layout.
 */
export function parseVerbatimStatute(text: string): VerbatimBlock[] {
  if (!text || typeof text !== 'string') return [];

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').trim();
  const rawParagraphs = normalized.split(/\n{2,}/);
  const blocks: VerbatimBlock[] = [];

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check for Administrative / Implementing Rules directive tag
    if (/^\[(Implementing Rules|DOLE|IRR|BWC|Rule|Book|Advisory).*?\]/i.test(trimmed)) {
      const match = trimmed.match(/^(\[(?:Implementing Rules|DOLE|IRR|BWC|Rule|Book|Advisory).*?\]:?)\s*([\s\S]*)$/i);
      blocks.push({
        type: 'admin-directive',
        rawText: trimmed,
        leadLabel: match ? match[1] : '[Implementing Directive]',
        bodyText: match && match[2] ? match[2].trim() : trimmed,
      });
      continue;
    }

    // Check for Landmark Case Precedent tag
    if (/^\[(.*?v\.|.*?vs\.|.*?G\.R\.|.*?Supreme Court|.*?Court of Appeals).*?\]/i.test(trimmed)) {
      const match = trimmed.match(/^(\[.*?\]:?)\s*([\s\S]*)$/);
      blocks.push({
        type: 'case-precedent',
        rawText: trimmed,
        leadLabel: match ? match[1] : '[Supreme Court Landmark Precedent]',
        bodyText: match && match[2] ? match[2].trim() : trimmed,
      });
      continue;
    }

    // Check for Doctrine / Prescription note
    if (/^\[(Comprehensive|Important|Note|Prescription|R\.A\.\s*9231|General Exception).*?\]/i.test(trimmed)) {
      const match = trimmed.match(/^(\[.*?\]:?)\s*([\s\S]*)$/);
      blocks.push({
        type: 'doctrine-note',
        rawText: trimmed,
        leadLabel: match ? match[1] : '[Doctrinal Note]',
        bodyText: match && match[2] ? match[2].trim() : trimmed,
      });
      continue;
    }

    // Check if the paragraph consists of multiple subsection lines like "(a)... \n (b)..."
    const lines = trimmed.split('\n');
    const hasMultipleSubsections =
      lines.length > 1 &&
      lines.every((l) => /^(\([a-z0-9]+\)|\d+[\.\)])\s+/i.test(l.trim()));

    if (hasMultipleSubsections) {
      for (const line of lines) {
        const subMatch = line.trim().match(/^(\([a-z0-9]+\)|\d+[\.\)])\s+([\s\S]+)$/i);
        if (subMatch) {
          blocks.push({
            type: 'subsection',
            rawText: line.trim(),
            leadLabel: subMatch[1],
            bodyText: subMatch[2].trim(),
          });
        }
      }
      continue;
    }

    // Check for statutory Article / Section / Republic Act Header
    const articleMatch = trimmed.match(
      /^(ART(?:ICLE|\.)?\s*\d+[A-Z0-9\s\[\]]*\.[^—\n]+—?|SECTION\s*\d+\.?|SEC\.\s*\d+\.[^—\n]+—?|REPUBLIC ACT NO\.[^:\n]+:?|PRESIDENTIAL DECREE NO\.[^:\n]+:?|EXECUTIVE ORDER NO\.[^:\n]+:?|DOLE DEPARTMENT ORDER NO\.[^:\n]+:?|BATAS PAMBANSA BLG\.[^:\n]+:?)\s*([\s\S]*)$/i
    );

    if (articleMatch) {
      blocks.push({
        type: 'article-header',
        rawText: trimmed,
        leadLabel: articleMatch[1].trim(),
        bodyText: articleMatch[2] ? articleMatch[2].trim() : '',
      });
      continue;
    }

    // Check if single paragraph starts with subsection marker
    const singleSubMatch = trimmed.match(/^(\([a-z0-9]+\)|\d+[\.\)])\s+([\s\S]+)$/i);
    if (singleSubMatch) {
      blocks.push({
        type: 'subsection',
        rawText: trimmed,
        leadLabel: singleSubMatch[1],
        bodyText: singleSubMatch[2].trim(),
      });
      continue;
    }

    // Default to statute-body
    blocks.push({
      type: 'statute-body',
      rawText: trimmed,
      bodyText: trimmed,
    });
  }

  return blocks;
}

/**
 * Extracts high-yield cloze targets present in the given text for Bar Recitation mode.
 */
export function getVerbatimClozeTerms(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();

  for (const pattern of HIGH_YIELD_CLOZE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const term = match[0].trim();
      if (term.length >= 2) {
        found.add(term);
      }
    }
  }

  return Array.from(found);
}

/**
 * Formats a single statute into an exportable, courtroom-quality Markdown slip.
 */
export function formatVerbatimMarkdown(
  citation: string,
  title: string,
  verbatim: string,
  summary?: string,
  keyRule?: string
): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const lines: string[] = [
    `# Philippine Labor Standards Codification`,
    `**Statutory Citation:** ${citation}`,
    `**Title / Subject:** ${title}`,
    `**Codal Extraction Date:** ${timestamp}`,
    `**Legal Authority:** Republic of the Philippines / Department of Labor and Employment (DOLE)`,
    ``,
  ];

  if (summary) {
    lines.push(`## Doctrinal Overview & Syllabus Reference`);
    lines.push(summary);
    lines.push(``);
  }

  if (keyRule) {
    lines.push(`## Controlling Statutory Rule`);
    lines.push(`> ${keyRule}`);
    lines.push(``);
  }

  lines.push(`## Exact Verbatim Codal Provision`);
  lines.push(`\`\`\`law`);
  lines.push(verbatim.trim());
  lines.push(`\`\`\``);
  lines.push(``);
  lines.push(
    `*Generated via Super Mario Labor Law Bar Memory Aid — Courtroom-Grade Codal Repertory.*`
  );

  return lines.join('\n');
}

/**
 * Splits statutory text into numbered lines for SCRA/Codal margin line references.
 */
export function splitVerbatimIntoNumberedLines(text: string): NumberedLine[] {
  if (!text) return [];
  const rawLines = text.split('\n');
  return rawLines.map((line, idx) => ({
    lineNumber: idx + 1,
    text: line,
  }));
}
