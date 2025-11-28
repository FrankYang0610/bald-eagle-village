// animationMath.js
// math helpers for trajectory calculations

// Linear interpolation between a and b by parameter p (0 = a, 1 = b)
export function lerp(a, b, p) {
  return a + (b - a) * p;
}

export function lerp3(from, to, p) {
  return [
    lerp(Number(from[0]), Number(to[0]), p),
    lerp(Number(from[1]), Number(to[1]), p),
    lerp(Number(from[2]), Number(to[2]), p)
  ];
}

export function yawFromDelta(dx, dz) {
  return Math.atan2(dx, dz);
}

