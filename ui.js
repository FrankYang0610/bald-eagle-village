// ui.js

import { Vec3 } from './math.js';
import { getSceneTimeSeconds, getSunriseDurationSeconds, isPaused, getTimeScale } from './time.js';

export function createUI(options) {
  const getControlMode = options && options.getControlMode;
  const setControlMode = options && options.setControlMode;
  const resetCamera = options && options.resetCamera;
  const onFogReload = options && options.onFogReload;
  const onTimeReset = options && options.onTimeReset;
  const onPauseToggle = options && options.onPauseToggle;
  const onSpeedToggle = options && options.onSpeedToggle;

  const cameraInfoEl = document.getElementById('camera-info');
  const cameraModeBoxEl = document.getElementById('camera-mode-box');
  const fogReloadBtn = document.getElementById('fog-reload-btn');
  const clockEl = document.getElementById('clock-now');
  const timeResetBtn = document.getElementById('time-reset-btn');
  const pauseToggleBtn = document.getElementById('pause-toggle-btn');
  const speedToggleBtn = document.getElementById('speed-toggle-btn');

  function updateCameraInfo(camera) {
    if (!cameraInfoEl || !camera) return;
    const pos = camera.getPosition();
    const center = (typeof camera.getCenter === 'function') ? camera.getCenter() : camera.center;
    cameraInfoEl.textContent = 'Camera: ' + Vec3.format(pos, 2) + '   LookAt: ' + Vec3.format(center, 2);
  }

  function updateCameraModeBox() {
    if (!cameraModeBoxEl || !getControlMode) return;
    const mode = getControlMode();
    const label = (mode === 'fixed') ? 'Fixed-Position Camera' : 'User-Controlled Camera';
    cameraModeBoxEl.textContent = 'Current mode: ' + label;
  }

  function updateClockNow() {
    if (!clockEl) return;
    const t = getSceneTimeSeconds();
    const dur = getSunriseDurationSeconds();
    clockEl.textContent = 'Animation Time: ' + t.toFixed(1) + 's / ' + dur.toFixed(0) + 's';
  }
  function updateTransportButtons() {
    if (pauseToggleBtn) {
      pauseToggleBtn.textContent = isPaused() ? 'Play' : 'Pause';
    }
    if (speedToggleBtn) {
      const fast = getTimeScale() > 1.0;
      speedToggleBtn.textContent = fast ? 'Normal speed' : 'Fast-forward';
    }
  }

  // Start clock when present
  if (clockEl) {
    updateClockNow();
    setInterval(updateClockNow, 100);
  }
  // Initialize transport button labels
  updateTransportButtons();

  // Bind click on camera mode box to toggle modes
  if (cameraModeBoxEl && setControlMode) {
    cameraModeBoxEl.addEventListener('click', () => {
      const mode = getControlMode ? getControlMode() : 'user';
      setControlMode(mode === 'fixed' ? 'user' : 'fixed');
      if (typeof resetCamera === 'function') resetCamera();
      updateCameraModeBox();
    });
  }

  // Bind keyboard: '1' fixed, '2' user
  if (setControlMode) {
    window.addEventListener('keydown', (e) => {
      if (e.key === '1') {
        setControlMode('fixed');
        if (typeof resetCamera === 'function') resetCamera();
        updateCameraModeBox();
      } else if (e.key === '2') {
        setControlMode('user');
        if (typeof resetCamera === 'function') resetCamera();
        updateCameraModeBox();
      }
    });
  }

  // Bind reload fog
  if (fogReloadBtn && typeof onFogReload === 'function') {
    fogReloadBtn.addEventListener('click', () => {
      onFogReload();
    });
  }
  // Bind time reset
  if (timeResetBtn && typeof onTimeReset === 'function') {
    timeResetBtn.addEventListener('click', () => {
      onTimeReset();
      updateTransportButtons();
      updateClockNow();
    });
  }
  // Bind pause toggle
  if (pauseToggleBtn && typeof onPauseToggle === 'function') {
    pauseToggleBtn.addEventListener('click', () => {
      onPauseToggle();
      updateTransportButtons();
    });
  }
  // Bind speed toggle
  if (speedToggleBtn && typeof onSpeedToggle === 'function') {
    speedToggleBtn.addEventListener('click', () => {
      onSpeedToggle();
      updateTransportButtons();
    });
  }

  // Public API
  return {
    updateCameraInfo,
    updateCameraModeBox,
  };
}


