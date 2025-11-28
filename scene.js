import { Mat4 } from './math.js';

var sceneObjects = [];

class SceneObject {
  constructor(model, position, rotationY, scale, color) {
    this.model = model;
    this.position = position || [0, 0, 0];
    this.rotationY = rotationY || 0;
    this.scale = (scale == null) ? 1 : scale;
    this.color = color || [1, 1, 1];
  }

  render(shaderProgram) {
    if (!this.model || !this.model.loaded) return;
    var m = Mat4.create();
    Mat4.identity(m);
    Mat4.translate(m, m, this.position);

    if (this.rotationY !== 0) Mat4.rotateY(m, m, this.rotationY);

    if (this.scale !== 1) {
      Mat4.scale(m, m, [this.scale, this.scale, this.scale]);
    }
    this.model.render(shaderProgram, m, new Float32Array(this.color));
  }
}

function addSceneObject(model, position, rotationY, scale, color) {
  var obj = new SceneObject(model, position, rotationY, scale, color);
  sceneObjects.push(obj);
  return obj;
}

function renderSceneObjects(shaderProgram) {
  for (var i = 0; i < sceneObjects.length; i++) {
    sceneObjects[i].render(shaderProgram);
  }
}

export { sceneObjects, SceneObject, addSceneObject, renderSceneObjects };


