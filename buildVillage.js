import { addSceneObject } from './scene.js';

export function buildVillage(sceneObjects, terrainModel, houseModel, grassModel, lamptreeModel, lamptreeScale = 10.0) {
  // Terrain (single large terrain model instead of tiled grass)
  addSceneObject(
    terrainModel,
    [0, 0, 0],
    0,
    20,
    [0.45, 0.65, 0.45]
  );

  // Houses
  addSceneObject(houseModel, [-90, 9, -50], 30, 1, [0.9, 0.3, 0.25]);
  addSceneObject(houseModel, [-95, 9, -20], 30, 1, [0.9, 0.3, 0.25]);
  addSceneObject(houseModel, [-100, 9, 10], 30, 1, [0.9, 0.3, 0.25]);

  addSceneObject(houseModel, [130, 10, 0], -30, 1, [0.9, 0.3, 0.25]);
  addSceneObject(houseModel, [130, 10, 30], -30, 1, [0.9, 0.3, 0.25]);
  addSceneObject(houseModel, [130, 10, 60], -30, 1, [0.9, 0.3, 0.25]);

  // Grass Lawns
  addSceneObject(grassModel, [-110, 7, -20], 0, 40, [0.85, 0.85, 0.85]);
  addSceneObject(grassModel, [-120, 7, -20], 0, 40, [0.85, 0.85, 0.85]);
  addSceneObject(grassModel, [150, 9, 20], 0, 40, [0.85, 0.85, 0.85]);

  // Lamptrees
  addSceneObject(lamptreeModel, [-120, 10, -40], 0, lamptreeScale, [0.85, 0.85, 0.85]);
  addSceneObject(lamptreeModel, [220, 33, 0], 0, lamptreeScale, [0.85, 0.85, 0.85]);
}


