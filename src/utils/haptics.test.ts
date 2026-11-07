import test from 'node:test';
import assert from 'node:assert/strict';
import { haptics } from './haptics';

test('haptics manager: safe detection and toggle', () => {
  // Verify default enablement
  const prevEnabled = haptics.isEnabled();
  haptics.setEnabled(true);
  assert.equal(haptics.isEnabled(), haptics.isSupported());

  // Toggle
  const toggled = haptics.toggle();
  assert.equal(toggled, false);
  assert.equal(haptics.isEnabled(), false);

  // Restore
  haptics.setEnabled(prevEnabled);
});

test('haptics manager: patterns execute safely without throwing', () => {
  assert.doesNotThrow(() => {
    haptics.light();
    haptics.medium();
    haptics.heavy();
    haptics.coin();
    haptics.jump();
    haptics.pipe();
    haptics.stomp();
    haptics.powerUp();
    haptics.success();
    haptics.warning();
    haptics.error();
    haptics.custom([10, 20, 30]);
  });
});
