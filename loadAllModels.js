// loadAllModels.js
// Load all models used in the scene and set up their default textures/materials.

import { Model } from './model.js';
import { TextureUtils } from './texture.js';

export function loadAllModels(gl) {
  // Ground
  const terrainModel = new Model(gl);
  const terrainPromise = terrainModel.loadFromUrl('assets/terrain/terrain.obj').then(() => {
    // Color-code by height: water (y<0) blue, land (y>=0) green
    terrainModel.setMaterialColor('water', [0.0, 0.0, 1.0]);
    terrainModel.setMaterialColor('land', [0.0, 1.0, 0.0]);
  });

  // House
  const houseModel = new Model(gl);
  const housePromise = houseModel.loadFromUrl('assets/american-house/US-House.obj').then(() => {
    const brickTex = TextureUtils.loadTexture(
      gl,
      'assets/textures/Wood062_2K_Color.jpg'
    );
    for (let matName in houseModel.meshes) {
      houseModel.setMaterialTexture(matName, brickTex);
    }
  });

  // Lamptree
  const lamptreeModel = new Model(gl);
  const lamptreePromise = lamptreeModel.loadFromUrl('assets/lamptree/lamptree.obj').then(() => {
    const woodTex = TextureUtils.loadTexture(gl, 'assets/textures/Wood042_2K_Color.jpg');
    lamptreeModel.setTexture(woodTex);
  });

  // Bald Eagle
  const baldEagleModel = new Model(gl);
  const baldEaglePromise = baldEagleModel
    .loadFromUrl('assets/bald-eagle-three-parts/bald-eagle-three-parts.obj')
    .then(() => {
      // Assign solid colors by group name
      const bodyColor = [0.45, 0.38, 0.32];
      baldEagleModel.setMaterialColor('body', bodyColor);                        // gray-brown
      baldEagleModel.setMaterialColor('left-wing', bodyColor);                   // same as body
      baldEagleModel.setMaterialColor('right-wing', bodyColor);                  // same as body
      baldEagleModel.setMaterialColor('beak', [1.0, 1.0, 0.0]);         // pure yellow
      baldEagleModel.setMaterialColor('head', [1.0, 1.0, 1.0]);         // pure white (head)
      baldEagleModel.setMaterialColor('eyes', [1.0, 1.0, 1.0]);         // white
      baldEagleModel.setMaterialColor('pupils', [0.0, 0.0, 0.0]);       // black
      baldEagleModel.setMaterialColor('eye-socket', [0.0, 0.0, 0.0]);   // black
    });

  const allLoaded = Promise.all([terrainPromise, housePromise, lamptreePromise, baldEaglePromise]);

  return {
    terrainModel,
    houseModel,
    lamptreeModel,
    baldEagleModel,
    allLoaded
  };
}


