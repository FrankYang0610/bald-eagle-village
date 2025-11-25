// lighting.js
// Lighting setup and point light management

import { Vec3 } from './math.js';

let glRef = null;
let shaderRef = null;

// Internal point light store
let pointLights = []; // { position:[x,y,z], color:[r,g,b], intensity:number, attenuation:[c,l,q] }
// Flicker parameters parallel to pointLights for lamptree lights
let lamptreeFlickerParams = []; // { period:number, phase:number, base:number, amplitude:number }

export function initLighting(gl, shaderProgram) {
  glRef = gl;
  shaderRef = shaderProgram;

  if (!shaderRef || !shaderRef.uniformLocations) return;
  const uniforms = shaderRef.uniformLocations;

  // Pre-dawn primary directional light (low, cool-dim)
  const lightDir = new Float32Array(3);
  Vec3.normalize(lightDir, [-30, -20, -10]);
  gl.uniform3fv(uniforms.uMainLightDirection, lightDir);

  // Scene tone: cooler, dimmer than dawn; subtle ambient; cooler specular
  gl.uniform3fv(uniforms.uMainLightColor,     new Float32Array([0.18, 0.20, 0.30]));
  gl.uniform3fv(uniforms.uAmbientLightColor,  new Float32Array([0.05, 0.06, 0.09]));
  gl.uniform3fv(uniforms.uSpecularLightColor, new Float32Array([0.30, 0.32, 0.40]));
  gl.uniform1f(uniforms.uShininess, 48.0);

  // Fog defaults (night/pre-dawn bluish fog)
  if (uniforms.uFogColor) {
    gl.uniform3fv(uniforms.uFogColor, new Float32Array([0.05, 0.07, 0.10]));
  }
  if (uniforms.uFogDensity) {
    // Slightly stronger base density for thick start
    gl.uniform1f(uniforms.uFogDensity, 1);
  }
  // Start with fog fully enabled; animate to 0 over time elsewhere
  if (uniforms.uFogFade) {
    gl.uniform1f(uniforms.uFogFade, 2.0);
  }
  // Height-based falloff and base height (ground level ~ 0)
  if (uniforms.uFogBaseHeight) {
    gl.uniform1f(uniforms.uFogBaseHeight, 0.0);
  }
  if (uniforms.uFogHeightFalloff) {
    gl.uniform1f(uniforms.uFogHeightFalloff, 0.25);
  }
  // Non-uniform fog settings
  if (uniforms.uFogNoiseScale) {
    gl.uniform1f(uniforms.uFogNoiseScale, 0.07);
  }
  if (uniforms.uFogNoiseStrength) {
    gl.uniform1f(uniforms.uFogNoiseStrength, 0.6);
  }
  if (uniforms.uFogWind) {
    gl.uniform2fv(uniforms.uFogWind, new Float32Array([0.03, 0.01]));
  }
  if (uniforms.uTime) {
    gl.uniform1f(uniforms.uTime, 0.0);
  }
}

export function rebuildScenePointLightsForLamptrees(sceneObjects, lamptreeModel) {
  if (!glRef || !shaderRef) return;

  pointLights = [];
  lamptreeFlickerParams = [];

  // Place a bright point light near the top of each lamptree instance in the scene
  if (lamptreeModel && lamptreeModel.loaded && sceneObjects && sceneObjects.length) {
    const lbb = lamptreeModel.boundingBox;
    const lcenter = lamptreeModel.center;
    const lh = lbb.max[1] - lbb.min[1];
    const lampColor = [1.0, 0.88, 0.55];      // warm glow
    const lampIntensity = 4.0;                // pre-dawn: lamps stand out
    const lampAtten = [1.0, 0.045, 0.0075];   // larger radius

    for (let i = 0; i < sceneObjects.length; i++) {
      const so = sceneObjects[i];
      if (!so.model || so.model !== lamptreeModel) continue;
      const s = so.scale || 1.0;
      const worldPosLamp = [
        so.position[0] + lcenter[0] * s,
        so.position[1] + (lbb.min[1] + 0.92 * lh) * s,
        so.position[2] + lcenter[2] * s
      ];
      pointLights.push({
        position: worldPosLamp,
        color: lampColor,
        intensity: lampIntensity, // will be modulated per-frame
        attenuation: lampAtten
      });
      // Assign a slightly different flicker period and phase per lamptree for natural variation
      const period = 4.0 + Math.random() * 2.0; // 4.0 ~ 6.0 seconds
      const phase = Math.random() * Math.PI * 2.0;
      // Pre-dawn: strong visible lamps
      const base = 3.0;
      const amplitude = 2.0;
      lamptreeFlickerParams.push({ period, phase, base, amplitude });
    }
  }

  updatePointLightsUniforms();
}

// Animate lamptree light intensities with a smooth flicker (1~2s cycle)
export function updateLamptreeFlicker(timeSeconds) {
  if (!shaderRef || !glRef) return;
  if (!pointLights.length || !lamptreeFlickerParams.length) return;

  // Update intensities
  for (let i = 0; i < pointLights.length && i < lamptreeFlickerParams.length; i++) {
    const p = lamptreeFlickerParams[i];
    // Smooth pulse between base-amplitude and base+amplitude
    const pulse = 0.5 * (1.0 + Math.sin((timeSeconds + p.phase) * ((Math.PI * 2.0) / p.period)));
    // Add a subtle quicker shimmer component for realism
    const shimmer = 0.08 * Math.sin((timeSeconds * 9.0 + p.phase * 1.7));
    let intensity = p.base + p.amplitude * pulse + shimmer;

    // Pre-dawn: bright lamps
    if (intensity < 2.0) intensity = 2.0;
    if (intensity > 5.0) intensity = 5.0;
    pointLights[i].intensity = intensity;
  }

  // Push updated intensities to GPU
  updatePointLightsUniforms();
}

function updatePointLightsUniforms() {
  if (!shaderRef || !glRef) return;
  const gl = glRef;
  const uniforms = shaderRef.uniformLocations;

  let count = pointLights.length;
  if (count > 64) count = 64; // cap to shader max

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const intensities = new Float32Array(count);
  const attenuations = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const p = pointLights[i];
    positions[i * 3 + 0] = p.position[0];
    positions[i * 3 + 1] = p.position[1];
    positions[i * 3 + 2] = p.position[2];

    colors[i * 3 + 0] = p.color[0];
    colors[i * 3 + 1] = p.color[1];
    colors[i * 3 + 2] = p.color[2];

    intensities[i] = p.intensity;

    attenuations[i * 3 + 0] = p.attenuation[0];
    attenuations[i * 3 + 1] = p.attenuation[1];
    attenuations[i * 3 + 2] = p.attenuation[2];
  }

  if (uniforms.uNumPointLights) {
    gl.uniform1i(uniforms.uNumPointLights, count);
  }

  const posLoc = uniforms.uPointLightPositions_0 || gl.getUniformLocation(shaderRef.program, 'uPointLightPositions[0]');
  const colLoc = uniforms.uPointLightColors_0 || gl.getUniformLocation(shaderRef.program, 'uPointLightColors[0]');
  const intLoc = uniforms.uPointLightIntensities_0 || gl.getUniformLocation(shaderRef.program, 'uPointLightIntensities[0]');
  const attLoc = uniforms.uPointLightAttenuations_0 || gl.getUniformLocation(shaderRef.program, 'uPointLightAttenuations[0]');

  if (posLoc) gl.uniform3fv(posLoc, positions);
  if (colLoc) gl.uniform3fv(colLoc, colors);
  if (intLoc) gl.uniform1fv(intLoc, intensities);
  if (attLoc) gl.uniform3fv(attLoc, attenuations);
}


