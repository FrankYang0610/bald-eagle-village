// effects.js
// scene effects animation and related uniforms (fog fade, time, lamptree flicker).

import { updateLamptreeFlicker } from './lighting.js';
import { getGlobalTimeSeconds } from './time.js';

export class Effects {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shader = shaderProgram;
    this.fogStartTimeMs = null;
    this.fogDurationSeconds = 10.0;
    this.fogStartSeconds = null;
  }

  reloadFog(nowMs) {
    // Reset using global scaled timeline so pause/speed apply to fade
    this.fogStartSeconds = getGlobalTimeSeconds();
    this.fogStartTimeMs = nowMs != null ? nowMs : performance.now();
  }

  update(currentTimeMs) {
    if (!this.shader || !this.shader.uniformLocations) return;
    const gl = this.gl;
    const uniforms = this.shader.uniformLocations;

    // Drive lamptree light flicker
    const nowSeconds = getGlobalTimeSeconds();
    updateLamptreeFlicker(nowSeconds);

    // Pass time for any time-based noise in shader
    if (uniforms.uTime) {
      gl.uniform1f(uniforms.uTime, nowSeconds);
    }

    // Fog fade-out animation (1 -> 0 over fogDurationSeconds) with smoothstep
    if (this.fogStartSeconds == null) this.fogStartSeconds = nowSeconds;
    const elapsedSec = Math.max(0, nowSeconds - this.fogStartSeconds);
    const t = Math.min(1.0, elapsedSec / this.fogDurationSeconds);
    const smooth = t * t * (3.0 - 2.0 * t);
    const fogFade = 1.0 - smooth;
    if (uniforms.uFogFade) {
      gl.uniform1f(uniforms.uFogFade, fogFade);
    }
  }
}


