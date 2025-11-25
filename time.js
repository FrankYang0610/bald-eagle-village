// time.js
// Global time controls (pause, speed) + sunrise timeline (30s clamp)

let sceneStartMs = 0;
let sceneTimeSeconds = 0;
let frozen = false;
const SUNRISE_DURATION_SECONDS = 30.0;
// Global animation timeline (affects all animations except sunrise clamp)
let globalAnimSeconds = 0;
let lastRawNowMs = 0;
let initialized = false;
// Sunrise clamp flag (separate from global pause)
let sunriseFrozen = false;
// Transport controls
let globalPaused = false;
let globalTimeScale = 1.0;
//
function computeScaledDeltaSeconds(nowMs) {
  const now = (nowMs == null) ? performance.now() : nowMs;
  if (!initialized) {
    initialized = true;
    lastRawNowMs = now;
    return 0;
  }
  const dtRaw = Math.max(0, (now - lastRawNowMs) * 0.001);
  lastRawNowMs = now;
  if (globalPaused) return 0;
  return dtRaw * globalTimeScale;
}

export function initSceneTime(nowMs) {
  // Reset both timelines; used at startup
  globalAnimSeconds = 0;
  sceneTimeSeconds = 0;
  frozen = false;
  sunriseFrozen = false;
  initialized = true;
  lastRawNowMs = (nowMs == null) ? performance.now() : nowMs;
  sceneStartMs = lastRawNowMs;
}

export function updateSceneTime(nowMs) {
  const dtScaled = computeScaledDeltaSeconds(nowMs);
  // Always advance global animation time (subject to pause/scale)
  globalAnimSeconds += dtScaled;
  // Advance sunrise unless it has reached its clamp
  if (!sunriseFrozen) {
    sceneTimeSeconds += dtScaled;
    if (sceneTimeSeconds >= SUNRISE_DURATION_SECONDS) {
      sceneTimeSeconds = SUNRISE_DURATION_SECONDS;
      sunriseFrozen = true;
    }
  }
  return dtScaled;
}

export function getSceneTimeSeconds() {
  return sceneTimeSeconds;
}

export function getSunriseProgress() {
  return Math.min(1.0, sceneTimeSeconds / SUNRISE_DURATION_SECONDS);
}

export function getSunriseDurationSeconds() {
  return SUNRISE_DURATION_SECONDS;
}

// Global animation time (for fog noise, flicker, etc.)
export function getGlobalTimeSeconds() {
  return globalAnimSeconds;
}

// Transport control API
export function setPaused(paused) {
  globalPaused = !!paused;
}
export function togglePaused() {
  globalPaused = !globalPaused;
}
export function isPaused() {
  return globalPaused;
}
export function setTimeScale(scale) {
  const s = Number(scale);
  globalTimeScale = isFinite(s) && s > 0 ? s : 1.0;
}
export function toggleFastForward() {
  globalTimeScale = (globalTimeScale === 2.0) ? 1.0 : 2.0;
}
export function getTimeScale() {
  return globalTimeScale;
}

// Reset both timelines back to zero and clear sunrise clamp
export function resetGlobalTimeToZero(nowMs) {
  globalAnimSeconds = 0;
  sceneTimeSeconds = 0;
  frozen = false;
  sunriseFrozen = false;
  initialized = true;
  lastRawNowMs = (nowMs == null) ? performance.now() : nowMs;
  sceneStartMs = lastRawNowMs;
}


