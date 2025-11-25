// ui.js

import { Vec3 } from './math.js';

export function createUI(options) {
  const getControlMode = options && options.getControlMode;
  const setControlMode = options && options.setControlMode;
  const resetCamera = options && options.resetCamera;
  const onFogReload = options && options.onFogReload;

  const cameraInfoEl = document.getElementById('camera-info');
  const cameraModeBoxEl = document.getElementById('camera-mode-box');
  const fogReloadBtn = document.getElementById('fog-reload-btn');

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

  // Public API
  return {
    updateCameraInfo,
    updateCameraModeBox,
  };
}


