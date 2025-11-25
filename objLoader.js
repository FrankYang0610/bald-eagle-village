// objLoader.js

export function parseOBJ(objFileContent) {
  // Raw data from the OBJ file
  var positions = [];
  var normals = [];
  var texCoords = [];

  // Per-material meshes
  // meshes[materialName] = {
  //   positions: Float32Array,
  //   normals: Float32Array,
  //   texCoords: Float32Array,
  //   vertexCount: number
  // }
  var meshes = {};

  var fileLines = objFileContent.split('\n');

  // Track current material; if no usemtl appears, everything goes into "default"
  var currentMaterial = "default";
  meshes[currentMaterial] = {
    positions: [],
    normals: [],
    texCoords: [],
    vertexCount: 0
  };

  for (var i = 0; i < fileLines.length; i++) {
    var line = fileLines[i].trim();
    if (line === '' || line.startsWith('#')) continue;

    var tokens = line.split(/\s+/);
    var command = tokens[0];

    // Vertex position
    if (command === 'v') {
      positions.push([
        parseFloat(tokens[1]),
        parseFloat(tokens[2]),
        parseFloat(tokens[3])
      ]);
    }
    // Vertex normal
    else if (command === 'vn') {
      normals.push([
        parseFloat(tokens[1]),
        parseFloat(tokens[2]),
        parseFloat(tokens[3])
      ]);
    }
    // Texture coordinate
    else if (command === 'vt') {
      texCoords.push([
        parseFloat(tokens[1]),
        parseFloat(tokens[2])
      ]);
    }
    // Material change
    else if (command === 'usemtl') {
      currentMaterial = tokens[1];

      if (!meshes[currentMaterial]) {
        meshes[currentMaterial] = {
          positions: [],
          normals: [],
          texCoords: [],
          vertexCount: 0
        };
      }
    }
    // Faces
    else if (command === 'f') {
      var mesh = meshes[currentMaterial];
      if (!mesh) {
        // Fallback, should not happen if we initialized correctly
        currentMaterial = "default";
        mesh = meshes[currentMaterial];
      }

      // Fan triangulation for polygons (f v1 v2 v3 v4 ... -> triangles)
      var faceVertices = tokens.slice(1);
      if (faceVertices.length < 3) continue;

      for (var j = 1; j < faceVertices.length - 1; j++) {
        // Triangles: (0, j, j+1)
        var vertexIndices = [0, j, j + 1];

        for (var k = 0; k < 3; k++) {
          var vert = faceVertices[vertexIndices[k]];
          var vertexData = vert.split('/');

          // Position index (required)
          var posIdx = parseInt(vertexData[0], 10) - 1;
          if (posIdx >= 0 && posIdx < positions.length) {
            var pos = positions[posIdx];
            mesh.positions.push(pos[0], pos[1], pos[2]);
          } else {
            // Should not happen, but keep data aligned
            mesh.positions.push(0, 0, 0);
          }

          // Texture coordinate index (optional)
          var texIdx =
            vertexData.length > 1 && vertexData[1] !== ''
              ? parseInt(vertexData[1], 10) - 1
              : -1;

          if (texIdx >= 0 && texIdx < texCoords.length) {
            var tex = texCoords[texIdx];
            // Flip Y for WebGL
            mesh.texCoords.push(tex[0], 1.0 - tex[1]);
          } else {
            mesh.texCoords.push(0, 0);
          }

          // Normal index (optional)
          var normIdx =
            vertexData.length > 2 && vertexData[2] !== ''
              ? parseInt(vertexData[2], 10) - 1
              : -1;

          if (normIdx >= 0 && normIdx < normals.length) {
            var norm = normals[normIdx];
            mesh.normals.push(norm[0], norm[1], norm[2]);
          } else {
            // Default normal pointing up
            mesh.normals.push(0, 1, 0);
          }

          mesh.vertexCount += 1;
        }
      }
    }
    // Ignore "o", "g" and other commands
  }

  // Convert all per-material arrays to Float32Array
  for (var matName in meshes) {
    if (!meshes.hasOwnProperty(matName)) continue;
    var m = meshes[matName];

    m.positions = new Float32Array(m.positions);
    m.normals = new Float32Array(m.normals);
    m.texCoords = new Float32Array(m.texCoords);
    // m.vertexCount is already set
  }

  // Return an object keyed by material name
  // Example keys in your OBJ: "Material" (house), "Material.002" (chimney)
  return meshes;
}
