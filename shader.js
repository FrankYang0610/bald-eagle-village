export class ShaderProgram {
  constructor(gl, vertexSource, fragmentSource) {
    this.gl = gl;
    this.program = this.createProgram(vertexSource, fragmentSource);
    this.attributeLocations = {};
    this.uniformLocations = {};
    
    if (this.program) {
      this.detectAttributesAndUniforms();
    }
  }

  createProgram(vertexSource, fragmentSource) {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) return null;

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  detectAttributesAndUniforms() {
    // Detect common attributes
    this.attributeLocations.aPosition = this.gl.getAttribLocation(this.program, 'aPosition');
    this.attributeLocations.aNormal = this.gl.getAttribLocation(this.program, 'aNormal');
    this.attributeLocations.aTexCoord = this.gl.getAttribLocation(this.program, 'aTexCoord');

    // Detect common uniforms
    const uniforms = [
      'uProjection', 'uView', 'uModel',
      // Generalized lighting uniforms
      'uMainLightDirection', 'uMainLightColor', 'uAmbientLightColor', 'uSpecularLightColor', 'uViewPos',
      'uColor', 'uShininess', 'uTexture', 'uUseTexture',
      // Fog
      'uFogColor', 'uFogDensity', 'uFogFade', 'uTime',
      'uFogBaseHeight', 'uFogHeightFalloff',
      'uFogNoiseScale', 'uFogNoiseStrength', 'uFogWind'
    ];

    uniforms.forEach(name => {
      this.uniformLocations[name] = this.gl.getUniformLocation(this.program, name);
    });
    // Optional: point light count (arrays are set via [0] locations directly)
    this.uniformLocations.uNumPointLights = this.gl.getUniformLocation(this.program, 'uNumPointLights');
    // Cache array-base uniform locations to avoid per-frame lookups
    this.uniformLocations.uPointLightPositions_0 = this.gl.getUniformLocation(this.program, 'uPointLightPositions[0]');
    this.uniformLocations.uPointLightColors_0 = this.gl.getUniformLocation(this.program, 'uPointLightColors[0]');
    this.uniformLocations.uPointLightIntensities_0 = this.gl.getUniformLocation(this.program, 'uPointLightIntensities[0]');
    this.uniformLocations.uPointLightAttenuations_0 = this.gl.getUniformLocation(this.program, 'uPointLightAttenuations[0]');
  }

  use() {
    if (this.program) {
      this.gl.useProgram(this.program);
    }
  }

  // Getters for locations
  getAttrib(name) {
    return this.attributeLocations[name];
  }

  getUniform(name) {
    return this.uniformLocations[name];
  }
}
