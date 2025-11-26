import { sceneObjects, addSceneObject, renderSceneObjects } from './scene.js';
import { loadAllModels } from './loadAllModels.js';
import { setupControls, updateCameraByKeys, setControlMode, getControlMode } from './controls.js';
import { initLighting, rebuildScenePointLightsForLamptrees } from './lighting.js';
import { buildVillage } from './buildVillage.js';
import { ShaderProgram } from './shader.js';
import { loadShaderSources } from './shaderLoader.js';
import { Camera } from './camera.js';
import { AxesHelper } from './axesHelper.js';
import { Renderer } from './renderer.js';
import { Effects } from './effects.js';
import { createUI } from './ui.js';
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_CENTER, DEFAULT_CONTROL_MODE } from './sceneConfig.js';
import { initSceneTime, updateSceneTime, togglePaused, toggleFastForward, resetGlobalTimeToZero } from './time.js';
import { Sunrise } from './sunrise.js';

var glContext;
var shaderProgram;
var camera;
var groundModel;
var houseModel;
var lamptreeModel;
var lamptreeScale = 5.0;
var glCanvas;
var keys = {};
var renderer;
var effects;
var ui;
var sunrise;

// Coordinate axes visualization
var axesHelper = null;

// Camera time: unscaled delta (independent of pause/time scale)
var lastUnscaledTimeMs = 0;
var unscaledTimeInitialized = false;

window.addEventListener('load', initializeApplication);

function initializeApplication() {
  initWebGL();
  initCoreSystems().then(function() {
    // Start scene time so sunrise can run 30s then stop
    initSceneTime(performance.now());
    initSceneContent();
    // Initialize UI after core systems so callbacks are ready
    ui = createUI({
      getControlMode: getControlMode,
      setControlMode: setControlMode,
      resetCamera: resetCameraToPreset,
      onFogReload: function() {
        if (effects) effects.reloadFog(performance.now());
      },
      onTimeReset: function() {
        resetGlobalTimeToZero(performance.now());
        if (effects) effects.reloadFog(performance.now());
      },
      onPauseToggle: function() {
        togglePaused();
      },
      onSpeedToggle: function() {
        toggleFastForward();
      }
    });
    ui.updateCameraModeBox();
    requestAnimationFrame(animate);
  }).catch(function(err) {
    console.error('Failed to initialize core systems:', err);
    alert('Failed to initialize core systems');
  });
}

function handleResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  glCanvas.width = width;
  glCanvas.height = height;
  if (renderer) {
    renderer.resize(width, height);
  } else {
    glContext.viewport(0, 0, width, height);
  }

  var fieldOfView = 60 * Math.PI / 180;
  var aspectRatio = width / height;

  if (camera) {
    camera.updateProjectionMatrix(fieldOfView, aspectRatio, 0.1, 1000.0);
  }
}

function updateCameraMatrix() {
  if (camera) {
    camera.setPosition(DEFAULT_CAMERA_POSITION[0], DEFAULT_CAMERA_POSITION[1], DEFAULT_CAMERA_POSITION[2]);
    camera.updateViewMatrix();
  }
}

function resetCameraToPreset() {
  if (!camera) return;
  camera.setPosition(DEFAULT_CAMERA_POSITION[0], DEFAULT_CAMERA_POSITION[1], DEFAULT_CAMERA_POSITION[2]);
  // Look at default center
  camera.center = [DEFAULT_CAMERA_CENTER[0], DEFAULT_CAMERA_CENTER[1], DEFAULT_CAMERA_CENTER[2]];
  camera.updateViewMatrix();
}

function animate(currentTime) {
  if (!unscaledTimeInitialized) {
    unscaledTimeInitialized = true;
    lastUnscaledTimeMs = currentTime;
  }
  var unscaledDeltaSeconds = Math.max(0, (currentTime - lastUnscaledTimeMs) * 0.001);
  lastUnscaledTimeMs = currentTime;

  // Advance all timelines (pause/speed applied); returns scaled delta seconds
  var deltaTime = updateSceneTime(currentTime) || 0;

  updateCameraByKeys(unscaledDeltaSeconds);

  if (!shaderProgram) return;
  renderer.useProgram(shaderProgram);
  // Dynamic sky during sunrise
  if (sunrise) {
    const sky = sunrise.getSkyColor();
    renderer.beginFrame(sky[0], sky[1], sky[2], 1.0);
    sunrise.update();
  } else {
    renderer.beginFrame(0.12, 0.14, 0.22, 1.0);
  }
  renderer.setCamera(camera);
  // Update scene effects (fog fade, time uniform, lamptree flicker)
  effects.update(currentTime);

  // Render all scene objects
  renderSceneObjects(shaderProgram);

  // Render coordinate axes
  renderer.renderAxes(axesHelper, camera, glCanvas);

  if (ui) ui.updateCameraInfo(camera);

  requestAnimationFrame(animate);
}



// -------- Initialization steps split into a 3-part structure --------

function initWebGL() {
  glCanvas = document.getElementById('glcanvas');
  glContext = glCanvas.getContext('webgl');
  if (!glContext) {
    alert('Your browser does not support WebGL');
    throw new Error('WebGL context not available');
  }
  glContext.enable(glContext.DEPTH_TEST);
  glContext.depthFunc(glContext.LEQUAL);
  glContext.enable(glContext.CULL_FACE);
  glContext.cullFace(glContext.BACK);
}

function initCoreSystems() {
  return loadShaderSources('shaders/standard.vert', 'shaders/standard.frag').then(function(sources) {
    shaderProgram = new ShaderProgram(glContext, sources.vertexSource, sources.fragmentSource);
    shaderProgram.use();

    // Initialize renderer and effects once shader is ready
    renderer = new Renderer(glContext);
    renderer.initializeDefaultState();
    renderer.useProgram(shaderProgram);
    effects = new Effects(glContext, shaderProgram);
    sunrise = new Sunrise(glContext, shaderProgram);

    camera = new Camera([0, 0, 0], [0, 0, 0], [0, 1, 0]);

    handleResize();
    window.addEventListener('resize', handleResize);

    setupControls(glCanvas, camera, keys);

    updateCameraMatrix();

    // axesHelper = new AxesHelper(glContext, 30.0);

    // Default control mode from scene config
    setControlMode(DEFAULT_CONTROL_MODE);
    resetCameraToPreset();
  });
}

function initSceneContent() {
  var loaded = loadAllModels(glContext);
  groundModel = loaded.groundModel;
  houseModel = loaded.houseModel;
  lamptreeModel = loaded.lamptreeModel;

  initLighting(glContext, shaderProgram);

  loaded.allLoaded.then(function() {
    buildVillage(sceneObjects, groundModel, houseModel, lamptreeModel, lamptreeScale);
    rebuildScenePointLightsForLamptrees(sceneObjects, lamptreeModel);
  });
}
