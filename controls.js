// controls.js
// keyboard and mouse controls for the camera

let keysRef = null;
let cameraRef = null;

let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
const mouseSensitivity = 0.005;

// 'user' enables keyboard/mouse control; 'fixed' disables them
let controlMode = 'user';

export function setupControls(canvas, camera, keys) {
  keysRef = keys;
  cameraRef = camera;

  // Keyboard
  window.addEventListener('keydown', e => { keysRef[e.key] = true; });
  window.addEventListener('keyup',   e => { keysRef[e.key] = false; });

  // Mouse
  canvas.addEventListener('mousedown', e => {
    if (controlMode !== 'user') return;
    isMouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('mousemove', e => {
    if (controlMode !== 'user' || !isMouseDown || !cameraRef) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    const horizontalAngle = -dx * mouseSensitivity;
    const verticalAngle   = -dy * mouseSensitivity;
    cameraRef.rotateAroundCenter(horizontalAngle, verticalAngle);
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  canvas.style.cursor = 'grab';
}

export function updateCameraByKeys(deltaTime) {
  if (controlMode !== 'user' || !cameraRef || !keysRef || deltaTime <= 0) return;
  const speed = 20 * deltaTime;

  if (keysRef['w'] || keysRef['W']) cameraRef.moveForward(speed);
  if (keysRef['s'] || keysRef['S']) cameraRef.moveForward(-speed);
  if (keysRef['ArrowUp'])           cameraRef.moveUp(speed);
  if (keysRef['ArrowDown'])         cameraRef.moveUp(-speed);
  if (keysRef['ArrowLeft'] || keysRef['a'] || keysRef['A']) cameraRef.moveRight(-speed);
  if (keysRef['ArrowRight'] || keysRef['d'] || keysRef['D']) cameraRef.moveRight(speed);
}

export function setControlMode(mode) {
  if (mode !== 'user' && mode !== 'fixed') return;
  controlMode = mode;
  // Stop any ongoing drag when switching away from user mode
  if (controlMode !== 'user') {
    isMouseDown = false;
  }
}

export function getControlMode() {
  return controlMode;
}


