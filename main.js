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
import { initSceneTime, updateSceneTime, togglePaused, toggleFastForward, resetGlobalTimeToZero, getGlobalTimeSeconds } from './time.js';
import { Sunrise } from './sunrise.js';
import { createAnimatedBaldEagle } from './baldEagle.js';
import { WaterSystem } from './waterSystem.js';
import { makeKeyframeController } from './baldEagleAnimations.js';

var glContext;
var shaderProgram;
var camera;
var terrainModel;
var houseModel;
var lamptreeModel;
var baldEagleModel;
var grassModel;
var lamptreeScale = 5.0;
var glCanvas;
var keys = {};
var renderer;
var effects;
var ui;
var sunrise;
var waterSystem = null;

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

  // Water pass (after terrain)
  if (waterSystem) {
    waterSystem.render(renderer, camera, { time: getGlobalTimeSeconds() });
    renderer.useProgram(shaderProgram);
  }

  if (ui) ui.updateCameraInfo(camera);

  // Stop after 30s total animation time
  if (getGlobalTimeSeconds() < 35.0) {  // More five seconds for a more smooth ending
    requestAnimationFrame(animate);
  }
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

    // Water system (loads its own program)
    waterSystem = new WaterSystem(glContext, sunrise);
    waterSystem.loadProgram();

    camera = new Camera([0, 0, 0], [0, 0, 0], [0, 1, 0]);

    handleResize();
    window.addEventListener('resize', handleResize);

    setupControls(glCanvas, camera, keys);

    updateCameraMatrix();

    axesHelper = new AxesHelper(glContext, 30.0);

    // Default control mode from scene config
    setControlMode(DEFAULT_CONTROL_MODE);
    resetCameraToPreset();
  });
}

function initSceneContent() {
  var loaded = loadAllModels(glContext);
  terrainModel = loaded.terrainModel;
  houseModel = loaded.houseModel;
  grassModel = loaded.grassModel;
  lamptreeModel = loaded.lamptreeModel;
  baldEagleModel = loaded.baldEagleModel;

  initLighting(glContext, shaderProgram);

  loaded.allLoaded.then(function() {
    buildVillage(sceneObjects, terrainModel, houseModel, grassModel, lamptreeModel, lamptreeScale);
    rebuildScenePointLightsForLamptrees(sceneObjects, lamptreeModel);

    // Bald eagles: rewrite paths to A/B with specified waypoints
    var eagleScale = 20;
    // Eagle A: 30s loop per spec (0–7 fog glide, 7–22 chase, 22–30 parallel fly-away)
    var eagleA = createAnimatedBaldEagle(baldEagleModel, {
      position: [0, 30, 400],
      rotationY: 0.0,
      alwaysTiltXRad: (20 * Math.PI / 180),
      scale: eagleScale,
      color: [1.0, 1.0, 1.0],
      flightMode: 'flapping',
      movement: {
        controller: makeKeyframeController({
          keyframes: [
            // 0–7s: Flies in fog. Keeps head up.
            { position: [0, 30, 400],    durationSeconds: 7,    pose: { flightMode: 'gliding', rotationX: (2 * Math.PI / 180) } },
            { position: [40, 26, 280] },
            // 7–9s: Goes to the outside place.
            { position: [40, 26, 280],   durationSeconds: 2,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [180, 22, 40] },
            // 9–11s: Goes up.
            { position: [180, 22, 40],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
            { position: [60, 36, 160] },
            { position: [60, 36, 160],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (7 * Math.PI / 180) } },
            { position: [0, 42, 40] },
            // 11–13s: Goes down through the center. Goes up at the back.
            { position: [0, 42, 40],     durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (-10 * Math.PI / 180) } },
            { position: [0, 20, 10] },
            { position: [0, 20, 10],     durationSeconds: 0.6,  pose: { flightMode: 'flapping', rotationX: (-8 * Math.PI / 180) } },
            { position: [0, 12, 0] },
            { position: [0, 12, 0],      durationSeconds: 0.6,  pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [-50, 15, -60] },
            // 13–15s: Flies low.
            { position: [-50, 15, -60],  durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: (-2 * Math.PI / 180) } },
            { position: [0, 10, -180] },
            { position: [0, 10, -180],   durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [100, 14, -80] },
            // 15–17s: Goes up to the middle.
            { position: [100, 14, -80],  durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [40, 26, 0] },
            { position: [40, 26, 0],     durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [0, 30, 60] },
            // 17–19s: Makes a small circle. Flies slowly.
            { position: [0, 30, 60],     durationSeconds: 0.7,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [-80, 26, 40] },
            { position: [-80, 26, 40],   durationSeconds: 0.7,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [-120, 24, -40] },
            { position: [-120, 24, -40], durationSeconds: 0.6,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [0, 26, -100] },
            // 19–21s: Goes through again. Goes up to leave.
            { position: [0, 26, -100],   durationSeconds: 1.2,  pose: { flightMode: 'flapping', rotationX: (-9 * Math.PI / 180) } },
            { position: [0, 18, 0] },
            { position: [0, 18, 0],      durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
            { position: [60, 32, 40] },
            // 21–28s: Keeps following.
            { position: [60, 32, 40],    durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [20, 28, -40] },
            { position: [20, 28, -40],   durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [0, 24, -120] },
            { position: [0, 24, -120],   durationSeconds: 0.9,  pose: { flightMode: 'flapping', rotationX: (-9 * Math.PI / 180) } },
            { position: [0, 16, 0] },
            { position: [0, 16, 0],      durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
            { position: [-60, 22, 60] },
            { position: [-60, 22, 60],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [0, 30, 80] },
            { position: [0, 30, 80],     durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [40, 28, 40] },
            { position: [40, 28, 40],    durationSeconds: 0.5,  pose: { flightMode: 'flapping', rotationX: (2 * Math.PI / 180) } },
            { position: [-20, 24, -200] },
            // 28–30s: Flies away.
            { position: [-20, 24, -200], durationSeconds: 1.2,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [-20, 24, -320] },
            { position: [-20, 24, -320], durationSeconds: 0.8,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [-20, 24, -380], durationSeconds: 0 }
          ],
          loop: false,
          heading: 'path'
        })
      }
    });
    // Eagle B: inner line chase, slightly time-lagged, with two brief sprints
    var eagleB = createAnimatedBaldEagle(baldEagleModel, {
      position: [-20, 34, 420],
      rotationY: 0.0,
      alwaysTiltXRad: (20 * Math.PI / 180),
      scale: eagleScale,
      color: [1.0, 1.0, 1.0],
      flightMode: 'flapping',
      movement: {
        controller: makeKeyframeController({
          keyframes: [
            // 0–7s: Flies in fog.
            { position: [-20, 34, 420],  durationSeconds: 7,    pose: { flightMode: 'gliding',  rotationX: (2 * Math.PI / 180) } },
            { position: [10, 28, 300] },
            // 7–9s: Goes to the inside place.
            { position: [10, 28, 300],   durationSeconds: 2,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [150, 24, 60] },
            // 9–11s: Goes up.
            { position: [150, 24, 60],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [40, 34, 150] },
            { position: [40, 34, 150],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
            { position: [0, 38, 60] },
            // 11–13s: Goes down fast.
            { position: [0, 38, 60],     durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (-12 * Math.PI / 180) } },
            { position: [0, 18, 15] },
            { position: [0, 18, 15],     durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (-9 * Math.PI / 180) } },
            { position: [-20, 14, -20] },
            // 13–15s: Flies low inside.
            { position: [-20, 14, -20],  durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: (-2 * Math.PI / 180) } },
            { position: [0, 9, -160] },
            { position: [0, 9, -160],    durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [80, 13, -60] },
            // 15–17s: Goes up to the middle.
            { position: [80, 13, -60],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [20, 24, -10] },
            { position: [20, 24, -10],   durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [0, 28, 50] },
            // 17–19s: Makes a small inside circle. Flies slowly.
            { position: [0, 28, 50],     durationSeconds: 0.7,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [-60, 25, 30] },
            { position: [-60, 25, 30],   durationSeconds: 0.7,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [-100, 24, -30] },
            { position: [-100, 24, -30], durationSeconds: 0.6,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [0, 25, -90] },
            // 19–21s: Goes through again. Goes up.
            { position: [0, 25, -90],    durationSeconds: 1.2,  pose: { flightMode: 'flapping', rotationX: (-10 * Math.PI / 180) } },
            { position: [0, 17, 0] },
            { position: [0, 17, 0],      durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
            { position: [40, 30, 50] },
            // 21–28s: Keeps following.
            { position: [40, 30, 50],    durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [10, 26, -30] },
            { position: [10, 26, -30],   durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [0, 24, -110] },
            { position: [0, 24, -110],   durationSeconds: 0.9,  pose: { flightMode: 'flapping', rotationX: (-10 * Math.PI / 180) } },
            { position: [0, 15, 0] },
            { position: [0, 15, 0],      durationSeconds: 0.8,  pose: { flightMode: 'flapping', rotationX: (6 * Math.PI / 180) } },
            { position: [20, 26, 60] },
            { position: [20, 26, 60],    durationSeconds: 1,    pose: { flightMode: 'flapping', rotationX: (5 * Math.PI / 180) } },
            { position: [0, 28, 70] },
            { position: [0, 28, 70],     durationSeconds: 1,    pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [10, 26, 30] },
            { position: [10, 26, 30],    durationSeconds: 0.5,  pose: { flightMode: 'flapping', rotationX: (2 * Math.PI / 180) } },
            { position: [20, 24, -200] },
            // 28–30s: Flies away.
            { position: [20, 24, -200],  durationSeconds: 1.2,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [20, 24, -320] },
            { position: [20, 24, -320],  durationSeconds: 0.8,  pose: { flightMode: 'gliding',  rotationX: 0 } },
            { position: [20, 24, -380],  durationSeconds: 0 }
          ],
          loop: false,
          heading: 'path',
          startTimeOffsetSeconds: 0.5 // slight behind Eagle A
        })
      }
    });

    sceneObjects.push(eagleA);
    sceneObjects.push(eagleB);

    // Water mesh covering terrain bounds on y=0
    if (waterSystem) {
      waterSystem.buildMeshFromTerrain(terrainModel, 20, 20);
    }
  });
}

