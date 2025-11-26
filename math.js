// math.js

// 4x4 Matrix
// Minimal Mat4 utilities (column-major)
export const Mat4 = {

  // Create identity matrix
  create: function () {
    var out = new Float32Array(16);
    out[0] = out[5] = out[10] = out[15] = 1;
    return out;
  },

  // Reset matrix to identity
  identity: function (out) {
    for (var i = 0; i < 16; i++) out[i] = 0;
    out[0] = out[5] = out[10] = out[15] = 1;
    return out;
  },

  // Perspective projection matrix
  perspective: function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy * 0.5);
    var nf = 1 / (near - far);

    out[0] = f / aspect;
    out[1] = out[2] = out[3] =
      out[4] = out[6] = out[7] =
        out[8] = out[9] = 0;

    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;

    out[12] = out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;

    return out;
  },

  // Build look-at view matrix (normalize & cross products inside)
  lookAt: function (out, eye, center, up) {
    var ex = eye[0], ey = eye[1], ez = eye[2];
    var cx = center[0], cy = center[1], cz = center[2];
    var ux = up[0], uy = up[1], uz = up[2];

    // Forward (z axis)
    var zx = ex - cx, zy = ey - cy, zz = ez - cz;
    var len = Math.hypot(zx, zy, zz) || 1;
    zx /= len; zy /= len; zz /= len;

    // Right = up × forward
    var xx = uy * zz - uz * zy;
    var xy = uz * zx - ux * zz;
    var xz = ux * zy - uy * zx;
    len = Math.hypot(xx, xy, xz) || 1;
    xx /= len; xy /= len; xz /= len;

    // True up = forward × right
    var yx = zy * xz - zz * xy;
    var yy = zz * xx - zx * xz;
    var yz = zx * xy - zy * xx;
    len = Math.hypot(yx, yy, yz) || 1;
    yx /= len; yy /= len; yz /= len;

    // Rotation
    out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
    out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
    out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;

    // Translation
    out[12] = -(xx*ex + xy*ey + xz*ez);
    out[13] = -(yx*ex + yy*ey + yz*ez);
    out[14] = -(zx*ex + zy*ey + zz*ez);
    out[15] = 1;

    return out;
  },

  // Matrix multiplication: out = a * b
  multiply: function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],  a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6],  a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    var b00 = b[0], b01 = b[1], b02 = b[2],  b03 = b[3];
    var b10 = b[4], b11 = b[5], b12 = b[6],  b13 = b[7];
    var b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
    var b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

    out[0] = a00*b00 + a01*b10 + a02*b20 + a03*b30;
    out[1] = a00*b01 + a01*b11 + a02*b21 + a03*b31;
    out[2] = a00*b02 + a01*b12 + a02*b22 + a03*b32;
    out[3] = a00*b03 + a01*b13 + a02*b23 + a03*b33;

    out[4] = a10*b00 + a11*b10 + a12*b20 + a13*b30;
    out[5] = a10*b01 + a11*b11 + a12*b21 + a13*b31;
    out[6] = a10*b02 + a11*b12 + a12*b22 + a13*b32;
    out[7] = a10*b03 + a11*b13 + a12*b23 + a13*b33;

    out[8]  = a20*b00 + a21*b10 + a22*b20 + a23*b30;
    out[9]  = a20*b01 + a21*b11 + a22*b21 + a23*b31;
    out[10] = a20*b02 + a21*b12 + a22*b22 + a23*b32;
    out[11] = a20*b03 + a21*b13 + a22*b23 + a23*b33;

    out[12] = a30*b00 + a31*b10 + a32*b20 + a33*b30;
    out[13] = a30*b01 + a31*b11 + a32*b21 + a33*b31;
    out[14] = a30*b02 + a31*b12 + a32*b22 + a33*b32;
    out[15] = a30*b03 + a31*b13 + a32*b23 + a33*b33;

    return out;
  },

  // Translate (post-multiply)
  translate: function (out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    if (a !== out) {
      out[0]=a[0]; out[1]=a[1]; out[2]=a[2]; out[3]=a[3];
      out[4]=a[4]; out[5]=a[5]; out[6]=a[6]; out[7]=a[7];
      out[8]=a[8]; out[9]=a[9]; out[10]=a[10]; out[11]=a[11];
    }

    out[12] = a[0]*x + a[4]*y + a[8]*z + a[12];
    out[13] = a[1]*x + a[5]*y + a[9]*z + a[13];
    out[14] = a[2]*x + a[6]*y + a[10]*z + a[14];
    out[15] = a[3]*x + a[7]*y + a[11]*z + a[15];

    return out;
  },

  // Scale (post-multiply)
  scale: function (out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    // First column
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;

    // Second column
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;

    // Third column
    out[8]  = a[8]  * z;
    out[9]  = a[9]  * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;

    // Translation (fourth column) unchanged
    if (a !== out) {
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }

    return out;
  },

  // Rotate around Y axis (post-multiply)
  rotateY: function (out, a, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);

    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

    // X column
    out[0] = a00*c + a20*s;
    out[1] = a01*c + a21*s;
    out[2] = a02*c + a22*s;
    out[3] = a03*c + a23*s;

    // Z column
    out[8]  = a20*c - a00*s;
    out[9]  = a21*c - a01*s;
    out[10] = a22*c - a02*s;
    out[11] = a23*c - a03*s;

    if (a !== out) {
      out[4]=a[4]; out[5]=a[5]; out[6]=a[6]; out[7]=a[7];
      out[12]=a[12]; out[13]=a[13]; out[14]=a[14]; out[15]=a[15];
    }

    return out;
  },

  // Rotate around Z axis (post-multiply)
  rotateZ: function (out, a, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);

    var a00 = a[0], a01 = a[1], a02 = a[2],  a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6],  a13 = a[7];

    // X column
    out[0] = a00*c + a10*s;
    out[1] = a01*c + a11*s;
    out[2] = a02*c + a12*s;
    out[3] = a03*c + a13*s;

    // Y column
    out[4] = a10*c - a00*s;
    out[5] = a11*c - a01*s;
    out[6] = a12*c - a02*s;
    out[7] = a13*c - a03*s;

    if (a !== out) {
      out[8]=a[8]; out[9]=a[9]; out[10]=a[10]; out[11]=a[11];
      out[12]=a[12]; out[13]=a[13]; out[14]=a[14]; out[15]=a[15];
    }

    return out;
  },

  // Multiply matrix by vec4
  transformVec4: function (out, m, v) {
    var x=v[0], y=v[1], z=v[2], w=v[3];
    out[0] = m[0]*x + m[4]*y + m[8]*z  + m[12]*w;
    out[1] = m[1]*x + m[5]*y + m[9]*z  + m[13]*w;
    out[2] = m[2]*x + m[6]*y + m[10]*z + m[14]*w;
    out[3] = m[3]*x + m[7]*y + m[11]*z + m[15]*w;
    return out;
  }
};


// Vector tools
export const Vec3 = {

  normalize: function (out, v) {
    var x = v[0], y = v[1], z = v[2];
    var len = Math.hypot(x, y, z);
    if (len === 0) { out[0] = 0; out[1] = 0; out[2] = 0; }
    else { out[0] = x / len; out[1] = y / len; out[2] = z / len; }
    return out;
  },

  add: function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  },

  subtract: function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  },

  scale: function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
  },

  cross: function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2];
    var bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  },

  // Utility: format a 3D vector as "(x, y, z)" with fixed decimals
  format: function(v, decimals) {
    var d = (decimals == null) ? 2 : decimals;
    if (!v || v.length < 3) return '(0.00, 0.00, 0.00)';
    var x = Number(v[0]) || 0;
    var y = Number(v[1]) || 0;
    var z = Number(v[2]) || 0;
    return '(' + x.toFixed(d) + ', ' + y.toFixed(d) + ', ' + z.toFixed(d) + ')';
  }
};
