// loadAllModels.js
// Load all models used in the scene and set up their default textures/materials.

import { Model } from './model.js';
import { TextureUtils } from './texture.js';

export function loadAllModels(gl) {
  // Terrain
  const terrainModel = new Model(gl);
  const terrainPromise = terrainModel.loadFromUrl('assets/terrain/terrain.obj').then(() => {
    // Color-code by height: water (y<0) blue, land (y>=0) green, snow gap (y>30) white
    terrainModel.setMaterialColor('water', [0.35, 0.60, 0.85]);
    terrainModel.setMaterialColor('land', [0.0, 0.4, 0.0]);
    terrainModel.setMaterialColor('snow', [1.0, 1.0, 1.0]);

    const waterTex = TextureUtils.loadTexture(gl, 'assets/textures/water-or-cloud.jpeg');
    const landTex = TextureUtils.loadTexture(gl, 'assets/textures/grass-or-plain.jpeg');
    const snowTex = TextureUtils.loadTexture(gl, 'assets/textures/snow-mountain.jpeg');
    terrainModel.setMaterialTexture('water', waterTex);
    terrainModel.setMaterialTexture('land', landTex);
    terrainModel.setMaterialTexture('snow', snowTex);
  });

  // House
  const houseModel = new Model(gl);
  const housePromise = houseModel.loadFromUrl('assets/american-house/US-House.obj').then(() => {
    const brickTex = TextureUtils.loadTexture(gl, 'assets/textures/wood.jpg');
    for (let matName in houseModel.meshes) {
      houseModel.setMaterialTexture(matName, brickTex);
    }
  });

  // Lamptree
  const lamptreeModel = new Model(gl);
  const lamptreePromise = lamptreeModel.loadFromUrl('assets/lamptree/lamptree.obj').then(() => {
    const treeTex = TextureUtils.loadTexture(gl, 'assets/textures/tree.jpg');
    lamptreeModel.setTexture(treeTex);
  });

  // Grass Lawn
  const grassModel = new Model(gl);
  const grassPromise = grassModel.loadFromUrl('assets/grass/grass.obj').then(() => {
    const grassTex = TextureUtils.loadTexture(gl, 'assets/textures/grass-or-plain.jpeg');
    grassModel.setTexture(grassTex);
  });

  // Bald Eagle
  const baldEagleModel = new Model(gl);
  const baldEaglePromise = baldEagleModel
    .loadFromUrl('assets/bald-eagle-three-parts/bald-eagle-three-parts.obj')
    .then(() => {
      // Assign solid colors by group name
      const bodyColor = [0.45, 0.38, 0.32];
      baldEagleModel.setMaterialColor('body', bodyColor);               // gray-brown
      baldEagleModel.setMaterialColor('left-wing', bodyColor);          // same as body
      baldEagleModel.setMaterialColor('right-wing', bodyColor);         // same as body
      baldEagleModel.setMaterialColor('beak', [1.0, 1.0, 0.0]);         // pure yellow
      baldEagleModel.setMaterialColor('head', [1.0, 1.0, 1.0]);         // pure white (head)
      baldEagleModel.setMaterialColor('eyes', [1.0, 1.0, 1.0]);         // white
      baldEagleModel.setMaterialColor('pupils', [0.0, 0.0, 0.0]);       // black
      baldEagleModel.setMaterialColor('eye-socket', [0.0, 0.0, 0.0]);   // black
    });

  const allLoaded = Promise.all([terrainPromise, housePromise, lamptreePromise, grassPromise, baldEaglePromise]).then(() => {
    // Log vertex counts
    const counts = {
      Terrain: terrainModel.totalVertexCount || 0,
      House: houseModel.totalVertexCount || 0,
      Lamptree: lamptreeModel.totalVertexCount || 0,
      Grass: grassModel.totalVertexCount || 0,
      BaldEagle: baldEagleModel.totalVertexCount || 0
    };
    const total =
      counts.Terrain + counts.House + counts.Lamptree + counts.Grass + counts.BaldEagle;
    console.log('Model vertex counts:');
    console.log(`  Terrain: ${counts.Terrain} vertices`);
    console.log(`  House: ${counts.House} vertices`);
    console.log(`  Lamptree: ${counts.Lamptree} vertices`);
    console.log(`  Grass: ${counts.Grass} vertices`);
    console.log(`  Bald Eagle: ${counts.BaldEagle} vertices`);
    console.log(`  Total: ${total} vertices`);
  });

  return {
    terrainModel,
    houseModel,
    lamptreeModel,
    grassModel,
    baldEagleModel,
    allLoaded
  };
}


