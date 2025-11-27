// waterSystem.js
// water shader program, mesh creation, and render pass.

import { ShaderProgram } from './shader.js';
import { loadShaderSources } from './shaderLoader.js';
import { createWaterMesh, renderWater } from './water.js';
import { getSunriseProgress, getGlobalTimeSeconds } from './time.js';

export class WaterSystem {
  constructor(gl, sunrise) {
    this.gl = gl;
    this.sunrise = sunrise;
    this.program = null;
    this.mesh = null;
  }

  loadProgram() {
    const gl = this.gl;
    return loadShaderSources('shaders/water.vert', 'shaders/water.frag').then(sources => {
      this.program = new ShaderProgram(gl, sources.vertexSource, sources.fragmentSource);
    });
  }

  buildMeshFromTerrain(terrainModel, terrainScale, margin) {
    if (!terrainModel || !terrainModel.loaded) return;
    const gl = this.gl;
    const bb = terrainModel.boundingBox;
    const s = (terrainScale == null) ? 1.0 : terrainScale;
    const m = (margin == null) ? 0.0 : margin;
    const minX = bb.min[0] * s - m;
    const maxX = bb.max[0] * s + m;
    const minZ = bb.min[2] * s - m;
    const maxZ = bb.max[2] * s + m;
    this.mesh = createWaterMesh(gl, {
      minX, maxX, minZ, maxZ,
      y: 0.0,
      divisions: 200
    });
  }

  computeLightingSnapshot() {
    const t = Math.min(1.0, Math.max(0.0, getSunriseProgress()));
    const smooth = t * t * (3.0 - 2.0 * t);

    // Direction
    const dirStart = [-0.30,  0.50, -0.10];
    const dirEnd   = [-0.30, -0.80, -0.10];
    let dir = [
      dirStart[0] + (dirEnd[0] - dirStart[0]) * smooth,
      dirStart[1] + (dirEnd[1] - dirStart[1]) * smooth,
      dirStart[2] + (dirEnd[2] - dirStart[2]) * smooth
    ];
    const len = Math.hypot(dir[0], dir[1], dir[2]) || 1.0;
    dir[0] /= len; dir[1] /= len; dir[2] /= len;

    // Directional color
    const sunStart = [0.10, 0.09, 0.08];
    const sunPeak  = [1.00, 0.68, 0.28];
    const sunDay   = [1.00, 0.95, 0.85];
    let dirCol;
    if (t < 0.6) {
      const k1 = (t / 0.6);
      const s1 = k1 * k1 * (3.0 - 2.0 * k1);
      dirCol = [
        sunStart[0] + (sunPeak[0] - sunStart[0]) * s1,
        sunStart[1] + (sunPeak[1] - sunStart[1]) * s1,
        sunStart[2] + (sunPeak[2] - sunStart[2]) * s1
      ];
    } else {
      const k2 = ((t - 0.6) / 0.4);
      const s2 = k2 * k2 * (3.0 - 2.0 * k2);
      dirCol = [
        sunPeak[0] + (sunDay[0] - sunPeak[0]) * s2,
        sunPeak[1] + (sunDay[1] - sunPeak[1]) * s2,
        sunPeak[2] + (sunDay[2] - sunPeak[2]) * s2
      ];
    }

    // Ambient
    const ambStart = [0.05, 0.06, 0.09];
    const ambEnd   = [0.35, 0.42, 0.50];
    const amb = [
      ambStart[0] + (ambEnd[0] - ambStart[0]) * smooth,
      ambStart[1] + (ambEnd[1] - ambStart[1]) * smooth,
      ambStart[2] + (ambEnd[2] - ambStart[2]) * smooth
    ];

    return {
      direction: dir,
      mainColor: dirCol,
      ambientColor: amb
    };
  }

  render(renderer, camera, options) {
    if (!this.program || !this.mesh) return;
    const gl = this.gl;
    const wave = options || {};

    // Set program and camera
    renderer.useProgram(this.program);
    renderer.setCamera(camera);

    // Blending for water
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);  // Ensure water is visible regardless of triangle winding

    const sky = this.sunrise ? this.sunrise.getSkyColor() : [0.12, 0.14, 0.22];
    const lit = this.computeLightingSnapshot();

    renderWater(gl, this.program, this.mesh, {
      time: ('time' in wave) ? wave.time : getGlobalTimeSeconds(),
      waveFreq: ('waveFreq' in wave) ? wave.waveFreq : 0.05,
      waveAmp: ('waveAmp' in wave) ? wave.waveAmp : 3,
      waveSpeed: ('waveSpeed' in wave) ? wave.waveSpeed : 1.0,
      waterColor: ('waterColor' in wave) ? wave.waterColor : [0.35, 0.60, 0.85],
      shininess: ('shininess' in wave) ? wave.shininess : 192.0,
      skyColor: sky,
      mainLightDirection: lit.direction,
      mainLightColor: lit.mainColor,
      ambientLightColor: lit.ambientColor,
      specularLightColor: [0.30, 0.32, 0.40]
    });

    gl.disable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
  }
}


