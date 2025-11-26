// terrainClassifier.js
// Split terrain meshes into two groups based on vertex Y:
// - "water": all three vertices of a triangle have y < 0
// - "land": otherwise
//
// Input: meshes = { name: { positions: Float32Array, normals: Float32Array, texCoords: Float32Array, vertexCount: number }, ... }
// Output: { water: { ... }, land: { ... } }
export function classifyTerrainMeshes(meshes, thresholdY = 0) {
  const accumulators = {
    water: { positions: [], normals: [], texCoords: [], vertexCount: 0 },
    land:  { positions: [], normals: [], texCoords: [], vertexCount: 0 }
  };

  for (const matName in meshes) {
    if (!Object.prototype.hasOwnProperty.call(meshes, matName)) continue;
    const src = meshes[matName];
    const pos = src.positions;
    const nor = src.normals;
    const tex = src.texCoords;

    // Iterate triangles (3 vertices per triangle)
    for (let v = 0; v < src.vertexCount; v += 3) {
      const baseP = v * 3;   // 3 floats per vertex
      const baseT = v * 2;   // 2 floats per vertex

      const y0 = pos[baseP + 1];
      const y1 = pos[baseP + 4];
      const y2 = pos[baseP + 7];

      const isWater = (y0 < thresholdY) && (y1 < thresholdY) && (y2 < thresholdY);
      const target = isWater ? accumulators.water : accumulators.land;

      // Positions (9 floats)
      target.positions.push(
        pos[baseP],     pos[baseP + 1],     pos[baseP + 2],
        pos[baseP + 3], pos[baseP + 4],     pos[baseP + 5],
        pos[baseP + 6], pos[baseP + 7],     pos[baseP + 8]
      );

      // Normals (9 floats)
      target.normals.push(
        nor[baseP],     nor[baseP + 1],     nor[baseP + 2],
        nor[baseP + 3], nor[baseP + 4],     nor[baseP + 5],
        nor[baseP + 6], nor[baseP + 7],     nor[baseP + 8]
      );

      // TexCoords (6 floats)
      target.texCoords.push(
        tex[baseT],     tex[baseT + 1],
        tex[baseT + 2], tex[baseT + 3],
        tex[baseT + 4], tex[baseT + 5]
      );

      target.vertexCount += 3;
    }
  }

  return {
    water: {
      positions: new Float32Array(accumulators.water.positions),
      normals: new Float32Array(accumulators.water.normals),
      texCoords: new Float32Array(accumulators.water.texCoords),
      vertexCount: accumulators.water.vertexCount
    },
    land: {
      positions: new Float32Array(accumulators.land.positions),
      normals: new Float32Array(accumulators.land.normals),
      texCoords: new Float32Array(accumulators.land.texCoords),
      vertexCount: accumulators.land.vertexCount
    }
  };
}


