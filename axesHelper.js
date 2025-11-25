// axesHelper.js

import { Mat4 } from './math.js';

export class AxesHelper {
  constructor(gl, length) {
    this.gl = gl;
    this.length = length || 10.0;

    this._colorX = new Float32Array([1, 0, 0]);
    this._colorY = new Float32Array([0, 1, 0]);
    this._colorZ = new Float32Array([0, 0, 1]);
    this._colorOrigin = new Float32Array([1, 1, 1]);

    this._modelMatrix = Mat4.create();

    this.xBuffer = this._createLineBuffer([0, 0, 0], [this.length, 0, 0]);
    this.yBuffer = this._createLineBuffer([0, 0, 0], [0, this.length, 0]);
    this.zBuffer = this._createLineBuffer([0, 0, 0], [0, 0, this.length]);

    this.normalBuffer = this._createArrayBuffer(new Float32Array([0, 1, 0, 0, 1, 0]));
    this.texCoordBuffer = this._createArrayBuffer(new Float32Array([0, 0, 0, 0]));

    const s = 0.3;
    this.originBuffer = this._createArrayBuffer(new Float32Array([
      -s, 0, 0,  s, 0, 0,
      0,-s, 0,  0, s, 0,
      0, 0,-s,  0, 0, s
    ]));

    // Reusable temp values
    this._mvp = Mat4.create();
    this._vec = [0, 0, 0, 1];
  }

  _createLineBuffer(a, b) {
    return this._createArrayBuffer(new Float32Array([
      a[0], a[1], a[2],
      b[0], b[1], b[2]
    ]));
  }

  _createArrayBuffer(data) {
    const gl = this.gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buf;
  }

  render(shaderProgram) {
    const gl = this.gl;
    const attribs = shaderProgram.attributeLocations;
    const uniforms = shaderProgram.uniformLocations;

    Mat4.identity(this._modelMatrix);
    gl.uniformMatrix4fv(uniforms.uModel, false, this._modelMatrix);
    gl.uniform1i(uniforms.uUseTexture, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.enableVertexAttribArray(attribs.aNormal);
    gl.vertexAttribPointer(attribs.aNormal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(attribs.aTexCoord);
    gl.vertexAttribPointer(attribs.aTexCoord, 2, gl.FLOAT, false, 0, 0);

    const depthEnabled = gl.isEnabled(gl.DEPTH_TEST);
    gl.disable(gl.DEPTH_TEST);

    gl.enableVertexAttribArray(attribs.aPosition);

    this._drawAxis(this.xBuffer, this._colorX, attribs, uniforms);
    this._drawAxis(this.yBuffer, this._colorY, attribs, uniforms);
    this._drawAxis(this.zBuffer, this._colorZ, attribs, uniforms);

    this._drawOrigin(shaderProgram);

    if (depthEnabled) gl.enable(gl.DEPTH_TEST);
  }

  _drawAxis(buffer, color, attribs, uniforms) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(uniforms.uColor, color);
    gl.drawArrays(gl.LINES, 0, 2);
  }

  _drawOrigin(shaderProgram) {
    const gl = this.gl;
    const attribs = shaderProgram.attributeLocations;
    const uniforms = shaderProgram.uniformLocations;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.originBuffer);
    gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(uniforms.uColor, this._colorOrigin);
    gl.drawArrays(gl.LINES, 0, 6);
  }

  projectToScreen(worldPos, camera, canvas) {
    const proj = camera.getProjectionMatrix();
    const view = camera.getViewMatrix();

    Mat4.multiply(this._mvp, proj, view);

    this._vec[0] = worldPos[0];
    this._vec[1] = worldPos[1];
    this._vec[2] = worldPos[2];
    this._vec[3] = 1.0;

    Mat4.transformVec4(this._vec, this._mvp, this._vec);

    const w = this._vec[3];
    if (Math.abs(w) < 1e-4) return null;

    let x = this._vec[0] / w;
    let y = this._vec[1] / w;
    let z = this._vec[2] / w;

    if (x < -1 || x > 1 || y < -1 || y > 1 || z < -1 || z > 1)
      return { x: 0, y: 0, visible: false };

    return {
      x: (x + 1) * 0.5 * canvas.width,
      y: (1 - y) * 0.5 * canvas.height,
      visible: true
    };
  }

  updateLabels(camera, canvas) {
    const len = this.length * 1.2;

    const xEnd = this.projectToScreen([len, 0, 0], camera, canvas);
    const yEnd = this.projectToScreen([0, len, 0], camera, canvas);
    const zEnd = this.projectToScreen([0, 0, len], camera, canvas);
    const origin = this.projectToScreen([0, 0, 0], camera, canvas);

    const lx = document.getElementById('label-x');
    const ly = document.getElementById('label-y');
    const lz = document.getElementById('label-z');
    const lo = document.getElementById('label-origin');

    const upd = (el, p) => {
      if (!el || !p) return;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.style.display = p.visible ? 'block' : 'none';
    };

    upd(lx, xEnd);
    upd(ly, yEnd);
    upd(lz, zEnd);
    upd(lo, origin);
  }
}
