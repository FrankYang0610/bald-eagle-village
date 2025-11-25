// renderer.js
// WebGL render-time operations (clear, camera uniforms, viewport)

export class Renderer {
  constructor(gl) {
    this.gl = gl;
    this.shader = null;
  }

  initializeDefaultState() {
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  useProgram(shaderProgram) {
    this.shader = shaderProgram;
    if (this.shader && typeof this.shader.use === 'function') {
      this.shader.use();
    }
  }

  resize(width, height) {
    this.gl.viewport(0, 0, width, height);
  }

  beginFrame(r, g, b, a) {
    const gl = this.gl;
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  setCamera(camera) {
    if (!this.shader || !this.shader.uniformLocations || !camera) return;
    const gl = this.gl;
    const uniforms = this.shader.uniformLocations;
    gl.uniformMatrix4fv(uniforms.uProjection, false, camera.getProjectionMatrix());
    gl.uniformMatrix4fv(uniforms.uView, false, camera.getViewMatrix());
    gl.uniform3fv(uniforms.uViewPos, new Float32Array(camera.getPosition()));
  }

  renderAxes(axesHelper, camera, canvas) {
    if (!axesHelper || !this.shader) return;
    axesHelper.render(this.shader, camera);
    axesHelper.updateLabels(camera, canvas);
  }
}


