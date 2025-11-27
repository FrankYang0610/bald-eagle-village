// water.js
// water plane mesh and renderer

import { Mat4 } from './math.js';

export function createWaterMesh(gl, opts) {
  const minX = opts && opts.minX != null ? opts.minX : -1000;
  const maxX = opts && opts.maxX != null ? opts.maxX :  1000;
  const minZ = opts && opts.minZ != null ? opts.minZ : -1000;
  const maxZ = opts && opts.maxZ != null ? opts.maxZ :  1000;
  const y = opts && opts.y != null ? opts.y : 0.0;
  const divisions = Math.max(2, Math.min(512, (opts && opts.divisions) || 200));

  const cols = divisions + 1;
  const rows = divisions + 1;
  const vertexCount = cols * rows;
  const positions = new Float32Array(vertexCount * 3);

  let p = 0;
  for (let j = 0; j < rows; j++) {
    const v = j / divisions;
    const z = minZ + (maxZ - minZ) * v;
    for (let i = 0; i < cols; i++) {
      const u = i / divisions;
      const x = minX + (maxX - minX) * u;
      positions[p++] = x;
      positions[p++] = y;
      positions[p++] = z;
    }
  }

  const quadCount = divisions * divisions;
  const indices = new Uint32Array(quadCount * 6);
  let t = 0;
  for (let j = 0; j < divisions; j++) {
    for (let i = 0; i < divisions; i++) {
      const i0 = j * cols + i;
      const i1 = i0 + 1;
      const i2 = i0 + cols;
      const i3 = i2 + 1;
      // Two triangles per quad
      indices[t++] = i0; indices[t++] = i2; indices[t++] = i1;
      indices[t++] = i1; indices[t++] = i2; indices[t++] = i3;
    }
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  // Use 32-bit indices if supported, else fallback
  const ext = gl.getExtension('OES_element_index_uint');
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  let indexType = gl.UNSIGNED_INT;
  if (ext) {
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  } else {
    // Fallback to 16-bit indices by reducing divisions if needed
    const shortIdx = new Uint16Array(indices.length);
    for (let k = 0; k < shortIdx.length; k++) shortIdx[k] = indices[k] & 0xFFFF;
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shortIdx, gl.STATIC_DRAW);
    indexType = gl.UNSIGNED_SHORT;
  }

  const modelMatrix = Mat4.create();
  Mat4.identity(modelMatrix);

  return {
    positionBuffer,
    indexBuffer,
    indexCount: indices.length,
    indexType,
    modelMatrix
  };
}

export function renderWater(gl, shaderProgram, waterMesh, params) {
  if (!gl || !shaderProgram || !waterMesh) return;
  const attribs = shaderProgram.attributeLocations;
  const uniforms = shaderProgram.uniformLocations;

  // Matrices
  gl.uniformMatrix4fv(uniforms.uModel, false, waterMesh.modelMatrix);

  // Attributes
  gl.bindBuffer(gl.ARRAY_BUFFER, waterMesh.positionBuffer);
  if (attribs.aPosition >= 0) {
    gl.enableVertexAttribArray(attribs.aPosition);
    gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, waterMesh.indexBuffer);

  // Water uniforms
  if (uniforms.uTime) gl.uniform1f(uniforms.uTime, params.time || 0.0);
  if (uniforms.uWaveFreq) gl.uniform1f(uniforms.uWaveFreq, params.waveFreq || 0.08);
  if (uniforms.uWaveAmp) gl.uniform1f(uniforms.uWaveAmp, params.waveAmp || 0.6);
  if (uniforms.uWaveSpeed) gl.uniform1f(uniforms.uWaveSpeed, params.waveSpeed || 1.2);

  // Appearance
  if (uniforms.uWaterColor) gl.uniform3fv(uniforms.uWaterColor, new Float32Array(params.waterColor || [0.06, 0.22, 0.30]));
  if (uniforms.uSkyColor && params.skyColor) gl.uniform3fv(uniforms.uSkyColor, new Float32Array(params.skyColor));
  if (uniforms.uShininess) gl.uniform1f(uniforms.uShininess, params.shininess || 128.0);

  // Lighting (directional)
  if (params.mainLightDirection && uniforms.uMainLightDirection) {
    gl.uniform3fv(uniforms.uMainLightDirection, new Float32Array(params.mainLightDirection));
  }
  if (params.mainLightColor && uniforms.uMainLightColor) {
    gl.uniform3fv(uniforms.uMainLightColor, new Float32Array(params.mainLightColor));
  }
  if (params.ambientLightColor && uniforms.uAmbientLightColor) {
    gl.uniform3fv(uniforms.uAmbientLightColor, new Float32Array(params.ambientLightColor));
  }
  if (uniforms.uSpecularLightColor) {
    gl.uniform3fv(uniforms.uSpecularLightColor, new Float32Array(params.specularLightColor || [0.30, 0.32, 0.40]));
  }

  // Draw
  gl.drawElements(gl.TRIANGLES, waterMesh.indexCount, waterMesh.indexType || gl.UNSIGNED_INT, 0);
}


