import { addSceneObject } from './scene.js';

export function buildVillage(sceneObjects, terrainModel, houseModel, lamptreeModel, lamptreeScale = 5.0) {
  // Terrain (single large terrain model instead of tiled grass)
  addSceneObject(
    terrainModel,
    [0, 0, 0],
    0,
    20,
    [0.45, 0.65, 0.45],
    false
  );

  // Houses
  addSceneObject(houseModel, [-70, 25, -80], 30, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [-70, 25, -50], 30, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [-70, 25, -20], 30, 1, [0.9, 0.3, 0.25], true);

  addSceneObject(houseModel, [70, 25, 0], -30, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [70, 25, 30], -30, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [70, 25, 60], -30, 1, [0.9, 0.3, 0.25], true);

  // One lamptree at [-80, 25, -50]
  addSceneObject(lamptreeModel, [-90, 28, -50], 0, lamptreeScale, [0.85, 0.85, 0.85], true);
  addSceneObject(lamptreeModel, [120, 58, 45], 0, lamptreeScale, [0.85, 0.85, 0.85], true);
}


