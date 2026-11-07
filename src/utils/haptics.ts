// Native App Tactile Haptics Controller for Super Mario Law Memory Aid
// Provides subtle, hardware-accelerated vibration patterns for mobile devices.

class HapticsManager {
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_haptics_enabled');
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      } catch {
        this.enabled = true;
      }
    }
  }

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator &&
      typeof navigator.vibrate === 'function'
    );
  }

  public isEnabled(): boolean {
    return this.enabled && this.isSupported();
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mario_haptics_enabled', String(enabled));
      } catch {
        // Ignore storage errors in private browsing modes
      }
    }
  }

  public toggle(): boolean {
    const next = !this.enabled;
    this.setEnabled(next);
    if (next) {
      this.light();
    }
    return next;
  }

  private trigger(pattern: number | number[]): boolean {
    if (!this.enabled || !this.isSupported()) {
      return false;
    }
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }

  /** Subtle tick for tab switches, filter chips, radio choices */
  public light(): boolean {
    return this.trigger(10);
  }

  /** Standard tap for buttons, modal openers, checkboxes */
  public medium(): boolean {
    return this.trigger(22);
  }

  /** Heavy impact for primary actions, boss actions, resets */
  public heavy(): boolean {
    return this.trigger(48);
  }

  /** Bouncy Mario Coin vibration */
  public coin(): boolean {
    return this.trigger([14, 28, 20]);
  }

  /** Mario Jump bounce vibration */
  public jump(): boolean {
    return this.trigger([12, 22, 16]);
  }

  /** Warp pipe slide vibration */
  public pipe(): boolean {
    return this.trigger([25, 25, 25, 25]);
  }

  /** Stomp impact vibration */
  public stomp(): boolean {
    return this.trigger([35, 25, 15]);
  }

  /** Power-up ascending vibration */
  public powerUp(): boolean {
    return this.trigger([15, 20, 20, 20, 30]);
  }

  /** Celebratory fanfare / correct answer */
  public success(): boolean {
    return this.trigger([18, 35, 18, 35, 28]);
  }

  /** Warning alert */
  public warning(): boolean {
    return this.trigger([30, 45, 30]);
  }

  /** Error / wrong answer */
  public error(): boolean {
    return this.trigger([42, 55, 42]);
  }

  /** Custom vibration pattern */
  public custom(pattern: number | number[]): boolean {
    return this.trigger(pattern);
  }
}

export const haptics = new HapticsManager();
