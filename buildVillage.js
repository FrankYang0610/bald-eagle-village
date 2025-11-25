import { addSceneObject } from './scene.js';

export function buildVillage(sceneObjects, groundModel, houseModel, lamptreeModel, lamptreeScale = 5.0) {
  // Ground tiling
  var step = 2;
  for (var i = -30; i <= 30; i++) {
    for (var j = -30; j <= 30; j++) {
      addSceneObject(
        groundModel,
        [i * step, 0, j * step],
        0,
        1,
        [0.45, 0.65, 0.45],
        false
      );
    }
  }

  // Houses
  addSceneObject(houseModel, [0, 0, -10], 0, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [-50, 0, -10], 0, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [-25, 0, -10], 0, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [50, 0, -10], 0, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [25, 0, -10], 0, 1, [0.9, 0.3, 0.25], true);

  addSceneObject(houseModel, [0, 0, 30], Math.PI, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [-50, 0, 30], Math.PI, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [-25, 0, 30], Math.PI, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [50, 0, 30], Math.PI, 1, [0.9, 0.3, 0.25], true);
  addSceneObject(houseModel, [25, 0, 30], Math.PI, 1, [0.9, 0.3, 0.25], true);

  // One lamptree at origin
  addSceneObject(lamptreeModel, [0, 0, 0], 0, lamptreeScale, [0.85, 0.85, 0.85], true);
}


