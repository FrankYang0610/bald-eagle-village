// effects.js
// scene effects animation and related uniforms (fog fade, time, lamptree flicker).

import { updateLamptreeFlicker } from './lighting.js';

export class Effects {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shader = shaderProgram;
    this.fogStartTimeMs = null;
    this.fogDurationSeconds = 10.0;
  }

  reloadFog(nowMs) {
    this.fogStartTimeMs = nowMs != null ? nowMs : performance.now();
  }

  update(currentTimeMs) {
    if (!this.shader || !this.shader.uniformLocations) return;
    const gl = this.gl;
    const uniforms = this.shader.uniformLocations;

    // Drive lamptree light flicker
    updateLamptreeFlicker(currentTimeMs * 0.001);

    // Pass time for any time-based noise in shader
    if (uniforms.uTime) {
      gl.uniform1f(uniforms.uTime, currentTimeMs * 0.001);
    }

    // Fog fade-out animation (1 -> 0 over fogDurationSeconds) with smoothstep
    if (this.fogStartTimeMs == null) this.fogStartTimeMs = currentTimeMs;
    const elapsedSec = Math.max(0, (currentTimeMs - this.fogStartTimeMs) * 0.001);
    const t = Math.min(1.0, elapsedSec / this.fogDurationSeconds);
    const smooth = t * t * (3.0 - 2.0 * t);
    const fogFade = 1.0 - smooth;
    if (uniforms.uFogFade) {
      gl.uniform1f(uniforms.uFogFade, fogFade);
    }
  }
}


