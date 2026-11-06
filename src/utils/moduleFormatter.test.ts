import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatModuleRuleItems,
  extractInlineSubClauses,
  cleanRuleText,
  parseListEntry,
} from './moduleFormatter';

describe('Smart Module Rule Formatter', () => {
  it('never numbers definitions and classifies them as unnumbered definition blocks', () => {
    const items = [
      'Definition: Work exceeding eight (8) hours within the worker’s 24-hour workday.',
      'Working Conditions Definition: The terms and circumstances affecting the employment of an employee.',
      'Premium Pay Definition: Additional compensation required by law for work performed within eight (8) hours on non-working days.',
      'Child Definition: Any person under eighteen (18) years of age.',
    ];

    const formatted = formatModuleRuleItems(items);
    assert.equal(formatted.length, 4);
    for (const item of formatted) {
      assert.equal(item.kind, 'definition');
      assert.equal(item.number, undefined);
      assert.equal(item.badgeLabel, 'DEFINITION');
    }
    assert.equal(formatted[0].title, 'Statutory Definition');
    assert.equal(formatted[1].title, 'Working Conditions');
    assert.equal(formatted[3].title, 'Child');
  });

  it('preserves exact numbering after group headers without shifting item numbers', () => {
    const items = [
      'Core Doctrine: Persons who work with substantially equal qualifications should be paid similar salaries.',
      '5 Exclusions from Equal Work for Equal Pay:',
      '1. Farm tenancy or leasehold.',
      '2. Household or domestic helpers.',
      'Note on BMBE: Workers in registered BMBEs are exempt ONLY from the Minimum Wage Law.',
    ];

    const formatted = formatModuleRuleItems(items);
    assert.equal(formatted[0].kind, 'callout');
    assert.equal(formatted[0].number, undefined);

    assert.equal(formatted[1].kind, 'group_header');
    assert.equal(formatted[1].number, undefined);
    assert.equal(formatted[1].body, '5 Exclusions from Equal Work for Equal Pay');

    assert.equal(formatted[2].kind, 'numbered');
    assert.equal(formatted[2].number, 1);

    assert.equal(formatted[3].kind, 'numbered');
    assert.equal(formatted[3].number, 2);

    assert.equal(formatted[4].kind, 'callout');
    assert.equal(formatted[4].tone, 'note');
    assert.equal(formatted[4].number, undefined);
  });

  it('decomposes inline (1)/(2) and (a)/(b) sub-clauses cleanly', () => {
    const raw =
      'Lectures/Meetings/Trainings are NOT counted as working time if ALL 3 conditions are met: (a) Attendance is outside regular working hours; (b) Attendance is in fact voluntary; AND (c) The employee does not perform any productive work during attendance.';

    const parsed = extractInlineSubClauses(raw);
    assert.ok(parsed);
    assert.equal(parsed.subClauses.length, 3);
    assert.equal(parsed.subClauses[0].marker, 'a');
    assert.equal(parsed.subClauses[2].marker, 'c');
  });

  it('eliminates duplicate bullet-number combinations like - 1. or • 1.', () => {
    // Dash before numbering: "- 1. Overtime Pay"
    const parsed1 = parseListEntry('- 1. Overtime Pay');
    assert.equal(parsed1.isNumbered, true);
    assert.equal(parsed1.marker, '1.');
    assert.equal(parsed1.text, 'Overtime Pay');

    // Bullet before numbering: "• 2. Meal Break"
    const parsed2 = parseListEntry('• 2. Meal Break');
    assert.equal(parsed2.isNumbered, true);
    assert.equal(parsed2.marker, '2.');
    assert.equal(parsed2.text, 'Meal Break');

    // Numbering with parenthesis: "- (a) First ground"
    const parsed3 = parseListEntry('- (a) First ground');
    assert.equal(parsed3.isNumbered, true);
    assert.equal(parsed3.marker, '(a)');
    assert.equal(parsed3.text, 'First ground');

    // Plain bullet item without numbering
    const parsed4 = parseListEntry('Government employees and GOCCs');
    assert.equal(parsed4.isNumbered, false);
    assert.equal(parsed4.marker, '•');
    assert.equal(parsed4.text, 'Government employees and GOCCs');

    // Plain item with leading dash
    const parsed5 = parseListEntry('- Field personnel and unsupervised');
    assert.equal(parsed5.isNumbered, false);
    assert.equal(parsed5.marker, '•');
    assert.equal(parsed5.text, 'Field personnel and unsupervised');
  });
});
