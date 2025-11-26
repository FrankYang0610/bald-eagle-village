import { Mat4 } from './math.js';
import { getGlobalTimeSeconds } from './time.js';

export function createAnimatedBaldEagle(model, options) {
  const cfg = Object.assign({
    position: [0, 0, 0],
    rotationY: 0,
    scale: 1,
    color: [1, 1, 1],
    parts: { body: 'body', left: 'left-wing', right: 'right-wing' },
    flap: { amplitudeRad: 0.5, frequencyHz: 0.8, xCompressRatio: 0.85 },
    cycleSeconds: 30,
    fixedParts: ['body', 'beak', 'head', 'eyes', 'pupils', 'eye-socket']
  }, options || {});

  return {
    model: model,
    position: cfg.position,
    rotationY: cfg.rotationY,
    scale: cfg.scale,
    color: cfg.color,
    parts: cfg.parts,
    flap: cfg.flap,
    cycleSeconds: cfg.cycleSeconds,
    fixedParts: cfg.fixedParts,

    render: function(shaderProgram) {
      if (!this.model || !this.model.loaded) return;

      // Parent: root/body transform
      var parentM = Mat4.create();
      Mat4.identity(parentM);
      Mat4.translate(parentM, parentM, this.position);

      if (this.rotationY !== 0) {
        Mat4.rotateY(parentM, parentM, this.rotationY);
      }

      if (this.scale !== 1) {
        Mat4.scale(parentM, parentM, [this.scale, this.scale, this.scale]);
      }

      const t = getGlobalTimeSeconds() % this.cycleSeconds;
      const isFlapping = (t < 10) || (t >= 20 && t < 30);
      const angle = isFlapping ? (this.flap.amplitudeRad * Math.sin(2 * Math.PI * this.flap.frequencyHz * t)) : 0;
      const xCompress = isFlapping ? ((this.flap && this.flap.xCompressRatio != null) ? this.flap.xCompressRatio : 0.9) : 1;

      // Child: fixed parts under parent (body/face), no local transform
      var childFixedParts = [];
      for (var i = 0; i < this.fixedParts.length; i++) {
        var name = this.fixedParts[i];
        if (Object.prototype.hasOwnProperty.call(this.model.meshes, name)) {
          childFixedParts.push(name);
        }
      }
      if (childFixedParts.length > 0) {
        this.model.renderOnly(shaderProgram, parentM, new Float32Array(this.color), childFixedParts);
      }

      // Child: left wing (inherits parent), local flap
      var leftWingChildM = new Float32Array(parentM);
      if (angle !== 0) Mat4.rotateZ(leftWingChildM, leftWingChildM, +angle);
      if (xCompress !== 1) Mat4.scale(leftWingChildM, leftWingChildM, [xCompress, 1, 1]);
      this.model.renderOnly(shaderProgram, leftWingChildM, new Float32Array(this.color), this.parts.left);

      // Child: right wing (inherits parent), local flap
      var rightWingChildM = new Float32Array(parentM);
      if (angle !== 0) Mat4.rotateZ(rightWingChildM, rightWingChildM, -angle);
      if (xCompress !== 1) Mat4.scale(rightWingChildM, rightWingChildM, [xCompress, 1, 1]);
      this.model.renderOnly(shaderProgram, rightWingChildM, new Float32Array(this.color), this.parts.right);

    }
  };
}



