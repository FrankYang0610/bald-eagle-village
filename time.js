// time.js
// Simple scene time with 30s clamp for sunrise

let sceneStartMs = 0;
let sceneTimeSeconds = 0;
let frozen = false;
const SUNRISE_DURATION_SECONDS = 30.0;

export function initSceneTime(nowMs) {
  sceneStartMs = (nowMs == null) ? performance.now() : nowMs;
  sceneTimeSeconds = 0;
  frozen = false;
}

export function updateSceneTime(nowMs) {
  if (frozen) return;
  const now = (nowMs == null) ? performance.now() : nowMs;
  sceneTimeSeconds = Math.max(0, (now - sceneStartMs) * 0.001);
  if (sceneTimeSeconds >= SUNRISE_DURATION_SECONDS) {
    sceneTimeSeconds = SUNRISE_DURATION_SECONDS;
    frozen = true;
  }
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


