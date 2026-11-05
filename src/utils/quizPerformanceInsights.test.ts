import test from 'node:test';
import assert from 'node:assert/strict';
import {
  determineHeatmapCategory,
  buildLaborLawSectionHeatmap,
  recordSectionQuestionAnswer,
  loadSectionAttemptLog,
  SectionQuestionAttempt,
} from './quizPerformanceInsights';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

test('quizPerformanceInsights: categorizes heatmap accuracy appropriately', () => {
  assert.equal(determineHeatmapCategory(0, 0, 0), 'untested');
  assert.equal(determineHeatmapCategory(6, 33, 4), 'critical'); // missed >= 3 or < 50%
  assert.equal(determineHeatmapCategory(10, 60, 4), 'critical'); // missed 4 is critical
  assert.equal(determineHeatmapCategory(3, 66, 1), 'needs_review'); // 50-69%
  assert.equal(determineHeatmapCategory(4, 75, 1), 'competent'); // 70-84%
  assert.equal(determineHeatmapCategory(10, 90, 1), 'mastered'); // >= 85%
});

test('quizPerformanceInsights: builds complete 30-day heatmap with most missed sections', () => {
  const attempts: SectionQuestionAttempt[] = [
    { topicId: 'm1-fwa-cww-meals-ot', isCorrect: false, dateKey: '2026-11-04', timestamp: Date.now() - 3600000 },
    { topicId: 'm1-fwa-cww-meals-ot', isCorrect: false, dateKey: '2026-11-04', timestamp: Date.now() - 3500000 },
    { topicId: 'm1-fwa-cww-meals-ot', isCorrect: true, dateKey: '2026-11-04', timestamp: Date.now() - 3400000 },
    { topicId: 'm6-maternity-leave', isCorrect: true, dateKey: '2026-11-04', timestamp: Date.now() - 3300000 },
  ];

  const report = buildLaborLawSectionHeatmap({
    timeWindowDays: 30,
    attemptsLog: attempts,
  });

  assert.ok(report.items.length > 10, 'Should include all statutory labor topics');
  assert.ok(report.barReadinessIndex > 0 && report.barReadinessIndex <= 100);
  assert.ok(report.mostMissed.length > 0, 'Should calculate most missed topics');
  
  // Overtime section
  const otSection = report.items.find((i) => i.topicId === 'm1-fwa-cww-meals-ot');
  assert.ok(otSection, 'Meals and OT section must exist');
  assert.equal(otSection?.correct, 1);
  assert.equal(otSection?.missed, 2);
});

test('quizPerformanceInsights: records new question answer and persists up to 500 records', () => {
  const storage = new MemoryStorage();
  let log: SectionQuestionAttempt[] = [];

  log = recordSectionQuestionAnswer(log, 'm2-service-charge', false, Date.now(), storage);
  assert.equal(log.length, 1);
  assert.equal(log[0].topicId, 'm2-service-charge');
  assert.equal(log[0].isCorrect, false);

  const restored = loadSectionAttemptLog(storage);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].topicId, 'm2-service-charge');
});
