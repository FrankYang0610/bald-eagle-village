import { Mat4 } from './math.js';
import { getGlobalTimeSeconds } from './time.js';

export function createAnimatedBaldEagle(model, options) {
  const cfg = Object.assign({
    position: [0, 0, 0],
    rotationY: 0,
    rotationX: 0,
    alwaysTiltXRad: 0,        // Correct the pose issues of the model itself
    scale: 1,
    color: [1, 1, 1],
    parts: { body: 'body', left: 'left-wing', right: 'right-wing' },
    flap: { amplitudeRad: 0.5, frequencyHz: 0.8, xCompressRatio: 0.85 },
    cycleSeconds: 30,
    fixedParts: ['body', 'beak', 'head', 'eyes', 'pupils', 'eye-socket'],
    flightMode: 'flapping',   // 'gliding' disables flapping; 'flapping' enables flapping
    movement: null            // { controller: (ctx) => overrides }
  }, options || {});

  return {
    model: model,
    position: cfg.position,
    rotationY: cfg.rotationY,
    rotationX: cfg.rotationX,
    alwaysTiltXRad: cfg.alwaysTiltXRad,
    scale: cfg.scale,
    color: cfg.color,
    parts: cfg.parts,
    flap: cfg.flap,
    cycleSeconds: cfg.cycleSeconds,
    fixedParts: cfg.fixedParts,
    flightMode: cfg.flightMode || 'flapping',
    movement: cfg.movement,
    createdAt: getGlobalTimeSeconds(),

    render: function(shaderProgram) {
      if (!this.model || !this.model.loaded) return;

      // Parent: root/body transform
      var parentM = Mat4.create();
      Mat4.identity(parentM);
      // Base transforms
      var baseX = this.position[0];
      var baseY = this.position[1];
      var baseZ = this.position[2];
      var posX = baseX;
      var posY = baseY;
      var posZ = baseZ;
      var rotY = this.rotationY;
      var rotX = this.rotationX;
      var frameFlap = this.flap;
      var frameFlightMode = this.flightMode || 'flapping';
      const now = getGlobalTimeSeconds();

      // Custom controller (overrides position/orientation/pose)
      if (this.movement && typeof this.movement.controller === 'function') {
        var out = this.movement.controller({
          now: now,
          createdAt: this.createdAt,
          base: {
            position: [baseX, baseY, baseZ],
            rotationY: this.rotationY,
            rotationX: this.rotationX,
            flap: this.flap,
            flightMode: frameFlightMode
          }
        }) || {};
        if (out.position && out.position.length === 3) {
          posX = out.position[0];
          posY = out.position[1];
          posZ = out.position[2];
        }
        if (out.rotationY != null) rotY = out.rotationY;
        if (out.rotationX != null) rotX = out.rotationX;
        if (out.flap) {
          frameFlap = Object.assign({}, frameFlap, out.flap);
        }
        if (out.flightMode) frameFlightMode = out.flightMode;
      }
      
      // Apply constant body tilt around local X
      if (this.alwaysTiltXRad) {
        rotX += this.alwaysTiltXRad;
      }
      Mat4.translate(parentM, parentM, [posX, posY, posZ]);
      if (rotY !== 0) Mat4.rotateY(parentM, parentM, rotY);
      if (rotX !== 0) Mat4.rotateX(parentM, parentM, rotX);

      if (this.scale !== 1) {
        Mat4.scale(parentM, parentM, [this.scale, this.scale, this.scale]);
      }

      // 'gliding' = no flap; 'flapping' = flap
      const isFlapping = (frameFlightMode === 'flapping');
      const amp = (frameFlap && frameFlap.amplitudeRad != null) ? frameFlap.amplitudeRad : this.flap.amplitudeRad;
      const freq = (frameFlap && frameFlap.frequencyHz != null) ? frameFlap.frequencyHz : this.flap.frequencyHz;
      const xComp = (frameFlap && frameFlap.xCompressRatio != null) ? frameFlap.xCompressRatio : this.flap.xCompressRatio;
      const angle = isFlapping ? (amp * Math.sin(2 * Math.PI * freq * now)) : 0;
      const xCompress = isFlapping ? (xComp != null ? xComp : 0.9) : 1;

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



