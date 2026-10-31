/**
 * Pure Ballistic Trajectory, Non-Blocking Radial Lane Geometry, and Aim-Assist Solver
 * for Yoshi's Statutory Egg Toss.
 *
 * Guarantees mathematically separated angular firing corridors from Yoshi's cannon
 * so front decoy clouds NEVER block parabolic throws aimed at further clouds.
 */

export const YOSHI_LAUNCH_X = 84;
export const YOSHI_LAUNCH_Y = 362;
export const YOSHI_EGG_SPEED = 780;
export const YOSHI_EGG_GRAVITY = 320;
export const YOSHI_MIN_AIM_DEG = 10;
export const YOSHI_MAX_AIM_DEG = 75;

export interface YoshiCloudSlotGeometry {
  slot: number;
  x: number;
  baseY: number;
  bobAmplitude: number;
  bobFrequency: number;
  phaseOffset: number;
}

/**
 * Four staggered radial fan corridors arranged from steep-near (Slot 0) to shallow-far (Slot 3).
 * Every trajectory aimed at Slot k clears all earlier slots j < k by > 110px vertically!
 */
export const YOSHI_RADIAL_CLOUD_SLOTS: readonly YoshiCloudSlotGeometry[] = [
  { slot: 0, x: 245, baseY: 74, bobAmplitude: 8, bobFrequency: 1.35, phaseOffset: 0.0 },
  { slot: 1, x: 385, baseY: 96, bobAmplitude: 8, bobFrequency: 1.35, phaseOffset: 1.4 },
  { slot: 2, x: 530, baseY: 148, bobAmplitude: 8, bobFrequency: 1.35, phaseOffset: 2.8 },
  { slot: 3, x: 668, baseY: 256, bobAmplitude: 8, bobFrequency: 1.35, phaseOffset: 4.2 },
];

export interface YoshiTargetState {
  slot: number;
  x: number;
  baseY: number;
  y: number;
  bobAmplitude: number;
  bobFrequency: number;
  phase: number;
  label: string;
  isCorrect: boolean;
}

export function computeYoshiCloudY(
  baseY: number,
  phase: number,
  bobAmplitude: number = 8
): number {
  return baseY + Math.sin(phase) * bobAmplitude;
}

/**
 * Solves the low-arc ballistic launch angle (in degrees) from (launchX, launchY)
 * to hit (targetX, targetY) under downward canvas gravity (+Y is down).
 */
export function solveYoshiBallisticAngleDeg(
  targetX: number,
  targetY: number,
  launchX: number = YOSHI_LAUNCH_X,
  launchY: number = YOSHI_LAUNCH_Y,
  speed: number = YOSHI_EGG_SPEED,
  gravity: number = YOSHI_EGG_GRAVITY
): number {
  const dx = Math.max(24, targetX - launchX);
  const dyUp = launchY - targetY; // positive when target is above launcher

  // Standard projectile formula: tan(theta) = (v^2 - sqrt(v^4 - g*(g*dx^2 + 2*dyUp*v^2))) / (g*dx)
  const v2 = speed * speed;
  const v4 = v2 * v2;
  const discriminant = v4 - gravity * (gravity * dx * dx + 2 * dyUp * v2);

  if (discriminant >= 0) {
    const tanLowArc = (v2 - Math.sqrt(discriminant)) / (gravity * dx);
    if (tanLowArc > 0) {
      const deg = (Math.atan2(tanLowArc, 1) * 180) / Math.PI;
      return Math.max(YOSHI_MIN_AIM_DEG, Math.min(YOSHI_MAX_AIM_DEG, deg));
    }
  }

  // Fallback direct line-of-sight angle
  const directDeg = (Math.atan2(Math.max(10, dyUp), dx) * 180) / Math.PI;
  return Math.max(YOSHI_MIN_AIM_DEG, Math.min(YOSHI_MAX_AIM_DEG, directDeg));
}

/**
 * Solves the ballistic launch angle accounting for the cloud's gentle vertical motion
 * over the egg's flight duration (`tFlight ≈ dx / vx`), so clicking/aiming at a cloud
 * hits its exact future center when the egg arrives!
 */
export function solveMovingCloudAimDeg(
  target: Pick<YoshiTargetState, 'x' | 'baseY' | 'y' | 'phase' | 'bobAmplitude' | 'bobFrequency'>
): number {
  let angleDeg = solveYoshiBallisticAngleDeg(target.x, target.y);
  // 2-step fixed-point refinement for moving cloud position at arrival time
  for (let iter = 0; iter < 2; iter++) {
    const rad = (angleDeg * Math.PI) / 180;
    const vx = Math.max(80, Math.cos(rad) * YOSHI_EGG_SPEED);
    const flightTime = (target.x - YOSHI_LAUNCH_X) / vx;
    const futurePhase = target.phase + flightTime * target.bobFrequency;
    const futureY = computeYoshiCloudY(target.baseY, futurePhase, target.bobAmplitude);
    angleDeg = solveYoshiBallisticAngleDeg(target.x, futureY);
  }
  return Math.round(angleDeg * 10) / 10;
}

/**
 * Elliptical cloud hitbox check.
 * Clouds are 86x50 rounded pills; if `intendedSlot` is locked onto a different cloud,
 * non-intended clouds use a compact core hitbox so grazing near an edge never steals the egg.
 */
export function checkEggHitsCloud(
  eggX: number,
  eggY: number,
  cloud: Pick<YoshiTargetState, 'slot' | 'x' | 'y'>,
  intendedSlot: number | null = null
): boolean {
  const isIntended = intendedSlot === null || intendedSlot === cloud.slot;
  const rx = isIntended ? 44 : 28;
  const ry = isIntended ? 27 : 17;
  const nx = (eggX - cloud.x) / rx;
  const ny = (eggY - cloud.y) / ry;
  return nx * nx + ny * ny <= 1;
}

/**
 * Predicts which target slot (0..3) the current `aimRad` trajectory will intersect first,
 * accounting for each cloud's phase advance as the egg flies!
 */
export function predictLockedCloudSlot(
  aimRad: number,
  targets: readonly YoshiTargetState[]
): number | null {
  const vx = Math.cos(aimRad) * YOSHI_EGG_SPEED;
  const vy0 = -Math.sin(aimRad) * YOSHI_EGG_SPEED;
  if (vx <= 10) return null;

  for (let tSec = 0.02; tSec <= 1.35; tSec += 0.015) {
    const ex = YOSHI_LAUNCH_X + vx * tSec;
    const ey = YOSHI_LAUNCH_Y + vy0 * tSec + 0.5 * YOSHI_EGG_GRAVITY * tSec * tSec;
    if (ex > 765 || ey > 400 || ey < -30) break;

    for (const cloud of targets) {
      const futureY = computeYoshiCloudY(
        cloud.baseY,
        cloud.phase + tSec * cloud.bobFrequency,
        cloud.bobAmplitude
      );
      const nx = (ex - cloud.x) / 42;
      const ny = (ey - futureY) / 26;
      if (nx * nx + ny * ny <= 1) {
        return cloud.slot;
      }
    }
  }
  return null;
}
