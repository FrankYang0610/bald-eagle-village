// sunrise.js
// Drives sky color and sun/ambient lighting over 30 seconds

import { getSunriseProgress } from './time.js';

export class Sunrise {
  constructor(gl, shaderProgram) {
    this.gl = gl;
    this.shader = shaderProgram;
  }

  static smoothstep(t) {
    t = Math.min(1, Math.max(0, t));
    return t * t * (3.0 - 2.0 * t);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  lerp3(a, b, t) {
    return [
      this.lerp(a[0], b[0], t),
      this.lerp(a[1], b[1], t),
      this.lerp(a[2], b[2], t)
    ];
  }

  getSkyColor() {
    // 4-stop gradient: deep blue -> purple -> orange -> light blue
    const t = getSunriseProgress();
    const stops = [
      { t: 0.00, c: [0.12, 0.14, 0.22] }, // deep blue
      { t: 0.33, c: [0.22, 0.18, 0.28] }, // purple
      { t: 0.66, c: [0.95, 0.53, 0.15] }, // orange glow
      { t: 1.00, c: [0.62, 0.78, 0.92] }  // morning light blue
    ];
    let i = 0;
    for (; i < stops.length - 1; i++) {
      if (t <= stops[i + 1].t) break;
    }
    const a = stops[i];
    const b = stops[Math.min(i + 1, stops.length - 1)];
    if (b.t === a.t) return a.c;
    const k = (t - a.t) / (b.t - a.t);
    const s = Sunrise.smoothstep(k);
    return this.lerp3(a.c, b.c, s);
  }

  update() {
    if (!this.shader || !this.shader.uniformLocations || !this.gl) return;
    const gl = this.gl;
    const u = this.shader.uniformLocations;

    const t = Sunrise.smoothstep(getSunriseProgress());

    // Sun direction: from below horizon to above
    const dirStart = [-0.30,  0.50, -0.10];
    const dirEnd   = [-0.30, -0.80, -0.10];
    let dir = [
      this.lerp(dirStart[0], dirEnd[0], t),
      this.lerp(dirStart[1], dirEnd[1], t),
      this.lerp(dirStart[2], dirEnd[2], t)
    ];
    const len = Math.hypot(dir[0], dir[1], dir[2]) || 1.0;
    dir[0] /= len; dir[1] /= len; dir[2] /= len;
    if (u.uMainLightDirection) {
      gl.uniform3fv(u.uMainLightDirection, new Float32Array(dir));
    }

    // Directional light color: dim to warm to daylight
    const sunStart = [0.10, 0.09, 0.08];
    const sunPeak  = [1.00, 0.68, 0.28];
    const sunDay   = [1.00, 0.95, 0.85];
    let sunColor;
    if (t < 0.6) {
      const k = Sunrise.smoothstep(t / 0.6);
      sunColor = this.lerp3(sunStart, sunPeak, k);
    } else {
      const k = Sunrise.smoothstep((t - 0.6) / 0.4);
      sunColor = this.lerp3(sunPeak, sunDay, k);
    }
    if (u.uMainLightColor) {
      gl.uniform3fv(u.uMainLightColor, new Float32Array(sunColor));
    }

    // Ambient light: night blue-gray -> brighter blue-gray
    const ambStart = [0.05, 0.06, 0.09];
    const ambEnd   = [0.35, 0.42, 0.50];
    const amb = this.lerp3(ambStart, ambEnd, t);
    if (u.uAmbientLightColor) {
      gl.uniform3fv(u.uAmbientLightColor, new Float32Array(amb));
    }
  }
}


