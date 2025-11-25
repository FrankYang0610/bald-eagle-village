import { parseOBJ } from './objLoader.js';

export class Model {
  constructor(gl) {
    this.gl = gl;

    // Multi-material data:
    // meshes[materialName] = {
    //   vertexCount,
    //   positionBuffer,
    //   normalBuffer,
    //   texCoordBuffer
    // }
    this.meshes = {};

    // Textures
    this.texture = null;            // global fallback texture
    this.materialTextures = {};     // materialName -> texture

    // Bounding box
    this.boundingBox = { min: [0, 0, 0], max: [0, 0, 0] };
    this.center = [0, 0, 0];
    this.totalVertexCount = 0;

    this.loaded = false;
  }

  // Load OBJ file and parse with parseOBJ (which returns per-material meshes)
  loadFromUrl(url) {
    return fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load OBJ: ' + res.statusText);
        return res.text();
      })
      .then(objFileContent => {
        const parsedMeshes = parseOBJ(objFileContent);
        this.bufferData(parsedMeshes);
        this.loaded = true;
      })
      .catch(err => {
        console.error(err);
      });
  }

  // Buffer per-material data from parseOBJ:
  // data = { matName: { positions, normals, texCoords, vertexCount }, ... }
  bufferData(data) {
    const gl = this.gl;

    this.meshes = {};
    this.totalVertexCount = 0;

    const allPositions = [];

    for (const matName in data) {
      if (!Object.prototype.hasOwnProperty.call(data, matName)) continue;

      const src = data[matName];

      const mesh = {
        vertexCount: src.vertexCount,
        positionBuffer: gl.createBuffer(),
        normalBuffer: gl.createBuffer(),
        texCoordBuffer: gl.createBuffer()
      };

      // Positions
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, src.positions, gl.STATIC_DRAW);

      // Normals
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, src.normals, gl.STATIC_DRAW);

      // TexCoords
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, src.texCoords, gl.STATIC_DRAW);

      this.meshes[matName] = mesh;
      this.totalVertexCount += mesh.vertexCount;

      // Collect positions for global bounding box
      for (let i = 0; i < src.positions.length; i++) {
        allPositions.push(src.positions[i]);
      }
    }

    this.computeBoundingBox(allPositions);
  }

  // Compute bounding box from a flat positions array [x0,y0,z0,x1,y1,z1,...]
  computeBoundingBox(positions) {
    if (!positions || positions.length < 3) return;

    let minX = positions[0], minY = positions[1], minZ = positions[2];
    let maxX = positions[0], maxY = positions[1], maxZ = positions[2];

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;

      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }

    this.boundingBox = {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ]
    };

    this.center = [
      (minX + maxX) * 0.5,
      (minY + maxY) * 0.5,
      (minZ + maxZ) * 0.5
    ];
  }

  // Texture APIs
  setTexture(texture) {
    this.texture = texture;
  }

  setMaterialTexture(materialName, texture) {
    this.materialTextures[materialName] = texture;
  }

  // Render all material meshes
  render(shaderProgram, modelMatrix, color) {
    if (!this.loaded) return;

    const gl = this.gl;
    const attribs = shaderProgram.attributeLocations;
    const uniforms = shaderProgram.uniformLocations;

    // Model matrix
    gl.uniformMatrix4fv(uniforms.uModel, false, modelMatrix);

    const baseColor = color || new Float32Array([1.0, 1.0, 1.0]);

    for (const matName in this.meshes) {
      if (!Object.prototype.hasOwnProperty.call(this.meshes, matName)) continue;

      const mesh = this.meshes[matName];

      // Positions
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
      gl.enableVertexAttribArray(attribs.aPosition);
      gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0);

      // Normals
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
      gl.enableVertexAttribArray(attribs.aNormal);
      gl.vertexAttribPointer(attribs.aNormal, 3, gl.FLOAT, false, 0, 0);

      // TexCoords
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.texCoordBuffer);
      gl.enableVertexAttribArray(attribs.aTexCoord);
      gl.vertexAttribPointer(attribs.aTexCoord, 2, gl.FLOAT, false, 0, 0);

      // Texture: per-material first, then fallback to global texture
      const tex = this.materialTextures[matName] || this.texture;
      if (tex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(uniforms.uTexture, 0);
        gl.uniform1i(uniforms.uUseTexture, 1);
        gl.uniform3fv(uniforms.uColor, new Float32Array([1.0, 1.0, 1.0]));
      } else {
        gl.uniform1i(uniforms.uUseTexture, 0);
        gl.uniform3fv(uniforms.uColor, baseColor);
      }

      gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
    }
  }
}

