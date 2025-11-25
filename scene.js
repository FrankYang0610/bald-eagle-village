import { Mat4 } from './math.js';

var sceneObjects = [];

class SceneObject {
  constructor(model, position, rotationY, scale, color, useModelCenterPivot) {
    this.model = model;
    this.position = position || [0, 0, 0];
    this.rotationY = rotationY || 0;
    this.scale = (scale == null) ? 1 : scale;
    this.color = color || [1, 1, 1];
    this.useModelCenterPivot = (useModelCenterPivot == null) ? true : useModelCenterPivot;
  }

  render(shaderProgram) {
    if (!this.model || !this.model.loaded) return;
    var m = Mat4.create();
    Mat4.identity(m);
    Mat4.translate(m, m, this.position);

    if (this.rotationY !== 0 || this.useModelCenterPivot) {
      var cx = this.model.center[0];
      var cz = this.model.center[2];
      if (this.useModelCenterPivot) Mat4.translate(m, m, [cx, 0, cz]);
      if (this.rotationY !== 0) Mat4.rotateY(m, m, this.rotationY);
      if (this.useModelCenterPivot) Mat4.translate(m, m, [-cx, 0, -cz]);
    }

    if (this.scale !== 1) {
      Mat4.scale(m, m, [this.scale, this.scale, this.scale]);
    }
    this.model.render(shaderProgram, m, new Float32Array(this.color));
  }
}

function addSceneObject(model, position, rotationY, scale, color, useModelCenterPivot) {
  var obj = new SceneObject(model, position, rotationY, scale, color, useModelCenterPivot);
  sceneObjects.push(obj);
  return obj;
}

function renderSceneObjects(shaderProgram) {
  for (var i = 0; i < sceneObjects.length; i++) {
    sceneObjects[i].render(shaderProgram);
  }
}

export { sceneObjects, SceneObject, addSceneObject, renderSceneObjects };


