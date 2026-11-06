import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVerbatimStatute,
  getVerbatimClozeTerms,
  formatVerbatimMarkdown,
  splitVerbatimIntoNumberedLines,
} from './verbatimFormatter';

describe('Verbatim Statutory Codification Formatter', () => {
  it('parses statutory article headers, subsections, admin directives, and case precedents', () => {
    const rawStatute = `ART. 82. Coverage. — The provisions of this Title shall apply to employees in all establishments.

(a) All time during which an employee is required to be on duty; and
(b) All time during which an employee is suffered or permitted to work.

[Implementing Rules Book III, Rule I, Sec. 4]:
An employee need not leave the premises of the work place.

[Mabeza v. National Labor Relations Commission (G.R. No. 118506)]:
Facilities include articles or services for the benefit of the employee.

General statutory concluding paragraph on worker protections.`;

    const blocks = parseVerbatimStatute(rawStatute);
    assert.strictEqual(blocks.length, 6);

    assert.strictEqual(blocks[0].type, 'article-header');
    assert.match(blocks[0].leadLabel || '', /ART\. 82\. Coverage/);

    assert.strictEqual(blocks[1].type, 'subsection');
    assert.strictEqual(blocks[1].leadLabel, '(a)');

    assert.strictEqual(blocks[2].type, 'subsection');
    assert.strictEqual(blocks[2].leadLabel, '(b)');

    assert.strictEqual(blocks[3].type, 'admin-directive');
    assert.match(blocks[3].leadLabel || '', /Implementing Rules/);

    assert.strictEqual(blocks[4].type, 'case-precedent');
    assert.match(blocks[4].leadLabel || '', /Mabeza v\. National Labor/);

    assert.strictEqual(blocks[5].type, 'statute-body');
    assert.match(blocks[5].bodyText, /General statutory concluding/);
  });

  it('extracts high-yield statutory cloze terms for Bar Recitation active recall', () => {
    const text = `The normal hours of work of any employee shall not exceed eight (8) hours a day.
Work may be performed beyond eight (8) hours a day provided that the employee is paid an additional compensation of at least twenty-five percent (25%) thereof.
A rest period of not less than twenty-four (24) consecutive hours after every six (6) consecutive normal work days.
Not applicable to managerial employees and field personnel.`;

    const terms = getVerbatimClozeTerms(text);
    assert.ok(terms.length >= 4);

    const lower = terms.map((t) => t.toLowerCase());
    assert.ok(lower.some((t) => t.includes('eight') || t.includes('8 hours')));
    assert.ok(lower.some((t) => t.includes('twenty-five percent') || t.includes('25%')));
    assert.ok(lower.some((t) => t.includes('twenty-four') || t.includes('24')));
    assert.ok(lower.some((t) => t.includes('managerial employees')));
    assert.ok(lower.some((t) => t.includes('field personnel')));
  });

  it('formats a single statute into an exportable, courtroom-quality Markdown slip', () => {
    const citation = 'Article 83, Labor Code of the Philippines';
    const title = 'Normal Hours of Work';
    const verbatim = 'ART. 83. Normal hours of work. — The normal hours of work shall not exceed eight (8) hours a day.';
    const summary = 'Governs regular 8-hour workday and health personnel 40-hour work week.';
    const keyRule = 'Maximum 8 hours daily without overtime.';

    const md = formatVerbatimMarkdown(citation, title, verbatim, summary, keyRule);
    assert.ok(md.includes('# Philippine Labor Standards Codification'));
    assert.ok(md.includes('Article 83, Labor Code of the Philippines'));
    assert.ok(md.includes('Normal Hours of Work'));
    assert.ok(md.includes('Governs regular 8-hour workday'));
    assert.ok(md.includes('```law'));
    assert.ok(md.includes('ART. 83. Normal hours of work'));
  });

  it('splits verbatim text into numbered lines with 1-based index', () => {
    const multiline = 'Line 1: Republic of the Philippines\nLine 2: Department of Labor and Employment\nLine 3: Labor Code PD 442';
    const lines = splitVerbatimIntoNumberedLines(multiline);

    assert.strictEqual(lines.length, 3);
    assert.strictEqual(lines[0].lineNumber, 1);
    assert.strictEqual(lines[0].text, 'Line 1: Republic of the Philippines');
    assert.strictEqual(lines[1].lineNumber, 2);
    assert.strictEqual(lines[2].lineNumber, 3);
  });
});
