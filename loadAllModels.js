// loadAllModels.js
// Load all models used in the scene and set up their default textures/materials.

import { Model } from './model.js';
import { TextureUtils } from './texture.js';

export function loadAllModels(gl) {
  // Ground
  const groundModel = new Model(gl);
  const groundPromise = groundModel.loadFromUrl('assets/terrain/terrain.obj').then(() => {
    // TODO: texture
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
    .loadFromUrl('assets/bald-eagle/bald-eagle-1m-center-decimate-0dot1-beak-head-body-eye-pupil-socket.obj')
    .then(() => {
      // Assign solid colors by group name
      baldEagleModel.setMaterialColor('beak', [1.0, 1.0, 0.0]);         // pure yellow
      baldEagleModel.setMaterialColor('head', [1.0, 1.0, 1.0]);         // pure white (head)
      baldEagleModel.setMaterialColor('body', [0.45, 0.38, 0.32]);      // gray-brown
      // Eyes
      baldEagleModel.setMaterialColor('pupils', [0.0, 0.0, 0.0]);       // black
      baldEagleModel.setMaterialColor('eye', [1.0, 1.0, 1.0]);          // white
      baldEagleModel.setMaterialColor('eye-socket', [0.0, 0.0, 0.0]);   // black
    });

  const allLoaded = Promise.all([groundPromise, housePromise, lamptreePromise, baldEaglePromise]);

  return {
    groundModel,
    houseModel,
    lamptreeModel,
    baldEagleModel,
    allLoaded
  };
}


