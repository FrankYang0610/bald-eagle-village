attribute vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

uniform float uTime;
uniform float uWaveFreq;
uniform float uWaveAmp;
uniform float uWaveSpeed;

varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  float phase = uTime * uWaveSpeed;
  float sx = sin(aPosition.x * uWaveFreq + phase);
  float cz = cos(aPosition.z * uWaveFreq + phase);
  float wave = sx * cz * uWaveAmp;

  vec3 displacedPos = aPosition + vec3(0.0, wave, 0.0);

  // Approximate normal from analytical partial derivatives
  float dx = uWaveFreq * uWaveAmp * cos(aPosition.x * uWaveFreq + phase) * cz;
  float dz = -uWaveFreq * uWaveAmp * sx * sin(aPosition.z * uWaveFreq + phase);
  vec3 n = normalize(vec3(-dx, 1.0, -dz));

  vec4 worldPos = uModel * vec4(displacedPos, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = mat3(uModel) * n;
  gl_Position = uProjection * uView * worldPos;
}


