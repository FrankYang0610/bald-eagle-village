import { Mat4, Vec3 } from './math.js';

export class Camera {
  constructor(position, center, up) {
    this.position = position || [0, 0, 0];
    this.center = center || [0, 0, 0];
    this.up = up || [0, 1, 0];
    
    this.projectionMatrix = Mat4.create();
    this.viewMatrix = Mat4.create();
    
    // Height constraints
    this.minHeight = 0.1; // Minimum height to prevent going underground
    this.maxHeight = 200; // Maximum height
    
    this.updateViewMatrix();
  }

  updateViewMatrix() {
    Mat4.lookAt(this.viewMatrix, this.position, this.center, this.up);
  }

  updateProjectionMatrix(fovRad, aspect, near, far) {
    Mat4.perspective(this.projectionMatrix, fovRad, aspect, near, far);
  }

  setPosition(x, y, z) {
    // Clamp height to prevent going underground or too high
    y = Math.max(this.minHeight, Math.min(this.maxHeight, y));
    this.position = [x, y, z];
    this.updateViewMatrix();
  }
  
  // Clamp camera height to valid range
  clampHeight() {
    if (this.position[1] < this.minHeight) {
      var diff = this.minHeight - this.position[1];
      this.position[1] = this.minHeight;
      this.center[1] += diff; // Adjust center to maintain relative position
    } else if (this.position[1] > this.maxHeight) {
      var diff = this.position[1] - this.maxHeight;
      this.position[1] = this.maxHeight;
      this.center[1] -= diff; // Adjust center to maintain relative position
    }
  }

  getProjectionMatrix() {
    return this.projectionMatrix;
  }

  getViewMatrix() {
    return this.viewMatrix;
  }
  
  getPosition() {
    return this.position;
  }
  
  getCenter() {
    return this.center;
  }

  moveForward(distance) {
    var forward = new Float32Array(3);
    Vec3.subtract(forward, this.center, this.position);
    Vec3.normalize(forward, forward);
    
    var move = new Float32Array(3);
    Vec3.scale(move, forward, distance);

    var newPos = new Float32Array(3);
    Vec3.add(newPos, this.position, move);
    this.position = [newPos[0], newPos[1], newPos[2]];
    
    var newCenter = new Float32Array(3);
    Vec3.add(newCenter, this.center, move);
    this.center = [newCenter[0], newCenter[1], newCenter[2]];
    
    // Clamp height after movement
    this.clampHeight();
    
    this.updateViewMatrix();
  }

  moveRight(distance) {
    var forward = new Float32Array(3);
    Vec3.subtract(forward, this.center, this.position);
    
    var right = new Float32Array(3);
    Vec3.cross(right, forward, this.up);
    Vec3.normalize(right, right);

    var move = new Float32Array(3);
    Vec3.scale(move, right, distance);

    var newPos = new Float32Array(3);
    Vec3.add(newPos, this.position, move);
    this.position = [newPos[0], newPos[1], newPos[2]];
    
    var newCenter = new Float32Array(3);
    Vec3.add(newCenter, this.center, move);
    this.center = [newCenter[0], newCenter[1], newCenter[2]];
    
    // Clamp height after movement
    this.clampHeight();
    
    this.updateViewMatrix();
  }

  // Move camera up or down (adjust height)
  moveUp(distance) {
    var newY = this.position[1] + distance;
    newY = Math.max(this.minHeight, Math.min(this.maxHeight, newY));
    
    var heightDiff = newY - this.position[1];
    this.position[1] = newY;
    this.center[1] += heightDiff; // Adjust center to maintain relative position
    
    this.updateViewMatrix();
  }

  // Rotate camera around center point
  // horizontalAngle: rotation around Y axis (in radians)
  // verticalAngle: rotation around right axis (in radians)
  rotateAroundCenter(horizontalAngle, verticalAngle) {
    // Calculate direction vector from center to position
    var direction = new Float32Array(3);
    Vec3.subtract(direction, this.position, this.center);
    
    var distance = Math.hypot(direction[0], direction[1], direction[2]);
    if (distance === 0) return;
    
    // Normalize direction
    Vec3.normalize(direction, direction);
    
    // Calculate current spherical coordinates
    var radius = distance;
    var theta = Math.atan2(direction[0], direction[2]); // horizontal angle
    var phi = Math.acos(direction[1]); // vertical angle (0 to PI)
    
    // Apply rotations
    theta += horizontalAngle;
    phi += verticalAngle;
    
    // Clamp phi to prevent gimbal lock
    var minPhi = 0.1;
    var maxPhi = Math.PI - 0.1;
    phi = Math.max(minPhi, Math.min(maxPhi, phi));
    
    // Convert back to cartesian coordinates
    var newDirection = new Float32Array(3);
    newDirection[0] = radius * Math.sin(phi) * Math.sin(theta);
    newDirection[1] = radius * Math.cos(phi);
    newDirection[2] = radius * Math.sin(phi) * Math.cos(theta);
    
    // Update position
    var newPos = new Float32Array(3);
    Vec3.add(newPos, this.center, newDirection);
    this.position = [newPos[0], newPos[1], newPos[2]];
    
    // Clamp height after rotation
    this.clampHeight();
    
    this.updateViewMatrix();
  }
}

