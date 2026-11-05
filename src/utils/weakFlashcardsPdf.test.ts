import test from 'node:test';
import assert from 'node:assert/strict';
import { FLASHCARDS_DATA } from '../data/flashcardsData';
import {
  sanitizePdfText,
  wrapPdfLines,
  generateNeedsImprovementPdfBytes,
} from './weakFlashcardsPdf';

test('sanitizePdfText normalizes peso signs and smart punctuation for PDF Type1 fonts', () => {
  const cleaned = sanitizePdfText('Wage is ₱645/day — “Regular” • Sec. §94');
  assert.equal(cleaned, 'Wage is PHP 645/day - "Regular" - Sec. Sec. 94');
});

test('wrapPdfLines splits long statutory provisions cleanly within maxCharsPerLine', () => {
  const sample =
    'Every employer shall give his employees a rest period of not less than twenty-four consecutive hours after every six consecutive normal work days.';
  const lines = wrapPdfLines(sample, 45);
  assert.ok(lines.length >= 3);
  for (const line of lines) {
    assert.ok(line.length <= 45, `Line exceeded 45 chars: "${line}"`);
  }
});

test('generateNeedsImprovementPdfBytes emits valid multi-page PDF 1.4 binary with card contents', () => {
  const sampleCards = FLASHCARDS_DATA.slice(0, 10);
  const bytes = generateNeedsImprovementPdfBytes({
    cards: sampleCards,
    playerName: 'Bar Scholar',
    generatedDateLabel: 'Oct 27, 2026',
  });

  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.byteLength > 1200);

  const decoded = new TextDecoder().decode(bytes);
  assert.ok(decoded.startsWith('%PDF-1.4\n'));
  assert.ok(decoded.endsWith('%%EOF'));
  assert.ok(decoded.includes('PHILIPPINE LABOR STANDARDS - NEEDS IMPROVEMENT FLASHCARDS'));
  assert.ok(decoded.includes('Bar Scholar'));
  assert.ok(decoded.includes('/Count 2') || decoded.includes('/Count 3'));
});
