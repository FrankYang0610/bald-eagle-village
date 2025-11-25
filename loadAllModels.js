// loadAllModels.js
// Load all models used in the scene and set up their default textures/materials.

import { Model } from './model.js';
import { TextureUtils } from './texture.js';

export function loadAllModels(gl) {
  // Ground
  const groundModel = new Model(gl);
  const groundPromise = groundModel.loadFromUrl('assets/grass/grass.obj').then(() => {
    // const tex = TextureUtils.loadTexture(gl, 'assets/Grass004_4K-JPG/Grass004_4K_Color.jpg');
    // groundModel.setTexture(tex);
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

  const allLoaded = Promise.all([groundPromise, housePromise, lamptreePromise]);

  return {
    groundModel,
    houseModel,
    lamptreeModel,
    allLoaded
  };
}


