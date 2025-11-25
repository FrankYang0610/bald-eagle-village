precision mediump float;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vTexCoord;

// Lighting uniforms
uniform vec3 uMainLightDirection;   // Primary directional light direction (from light toward the scene)
uniform vec3 uMainLightColor;       // Primary directional light color
uniform vec3 uAmbientLightColor;    // Ambient light color
uniform vec3 uSpecularLightColor;   // Specular highlight color
uniform vec3 uViewPos;              // Camera world position

uniform vec3 uColor;                // Object color (diffuse color)
uniform float uShininess;           // Shininess

uniform sampler2D uTexture;
uniform bool uUseTexture;

// Multiple point lights
const int MAX_POINT_LIGHTS = 64;
uniform int uNumPointLights;
uniform vec3  uPointLightPositions[MAX_POINT_LIGHTS];
uniform vec3  uPointLightColors[MAX_POINT_LIGHTS];
uniform float uPointLightIntensities[MAX_POINT_LIGHTS];
// Attenuation: x = constant, y = linear, z = quadratic
uniform vec3  uPointLightAttenuations[MAX_POINT_LIGHTS];

// Fog uniforms
uniform vec3 uFogColor;             // Fog color
uniform float uFogDensity;          // Fog density (higher = thicker)
uniform float uFogFade;             // 0.0 (no fog) -> 1.0 (full fog effect)
uniform float uTime;                // Time in seconds for animated fog
uniform float uFogBaseHeight;       // Height where fog is densest (typically ground level)
uniform float uFogHeightFalloff;    // How fast fog thins with height (per unit)
uniform float uFogNoiseScale;       // Spatial scale of noise patches
uniform float uFogNoiseStrength;    // Strength of non-uniformity (0..1)
uniform vec2 uFogWind;              // Wind direction/speed for noise drift (world units/sec)



// ---- Cheap 2D noise (Inigo Quilez style) on XZ plane ----
float hash(vec2 p) {
  // Magic number: 202.5 and 112.7
  // Because the project starts on Nov 27, 2025~!
  // 43758.5453123 is a well-known magic number.
  return fract(sin(dot(p, vec2(202.5, 112.7))) * 43758.5453123);
}

float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm2(vec2 p) {
  float v = 0.0;
  float a = 0.6;
  v += a * noise2D(p); p *= 2.0; a *= 0.5;
  v += a * noise2D(p);
  return v;
}



// ---- Lighting helpers ----
vec3 computeDirectionalLighting(vec3 N, vec3 V, vec3 baseRgb) {
  vec3 Ld = normalize(-uMainLightDirection);
  float diffDir = max(dot(N, Ld), 0.0);
  vec3 Hd = normalize(Ld + V);
  float specDir = pow(max(dot(N, Hd), 0.0), uShininess);
  vec3 diffuse  = diffDir * uMainLightColor * baseRgb;
  vec3 specular = specDir * uSpecularLightColor;
  return diffuse + specular;
}

vec3 computePointLightsLighting(vec3 N, vec3 V, vec3 baseRgb) {
  vec3 diffuseAccum  = vec3(0.0);
  vec3 specularAccum = vec3(0.0);
  for (int i = 0; i < MAX_POINT_LIGHTS; i++) {
    if (i >= uNumPointLights) {
      break;
    }
    vec3 toLight = uPointLightPositions[i] - vWorldPos;
    float distanceToLight = length(toLight);
    vec3 Lp = toLight / max(distanceToLight, 1e-4);
    float attenuation = 1.0 / (
      uPointLightAttenuations[i].x +
      uPointLightAttenuations[i].y * distanceToLight +
      uPointLightAttenuations[i].z * distanceToLight * distanceToLight
    );
    attenuation *= uPointLightIntensities[i];
    float diffP = max(dot(N, Lp), 0.0);
    vec3 Hp = normalize(Lp + V);
    float specP = pow(max(dot(N, Hp), 0.0), uShininess);
    vec3 lightColor = uPointLightColors[i];
    diffuseAccum  += diffP * lightColor * baseRgb * attenuation;
    specularAccum += specP * (uSpecularLightColor * lightColor) * attenuation;
  }
  return diffuseAccum + specularAccum;
}

vec3 computeAmbientLighting(vec3 baseRgb) {
  return uAmbientLightColor * baseRgb;
}



// ---- Fog helpers ----
float computeFogFactor(vec3 worldPos, vec3 viewPos) {
  float dist = length(viewPos - worldPos);
  float hAbove = max(worldPos.y - uFogBaseHeight, 0.0);
  float heightFactor = exp(-uFogHeightFalloff * hAbove);
  vec2 p = (worldPos.xz + uFogWind * uTime) * uFogNoiseScale;
  float n = fbm2(p);
  float n01 = clamp(n, 0.0, 1.0);
  float noiseFactor = 1.0 + (n01 * 2.0 - 1.0) * clamp(uFogNoiseStrength, 0.0, 1.0);
  noiseFactor = max(noiseFactor, 0.0);
  float effectiveDensity = uFogDensity * heightFactor * noiseFactor;
  float fogFactor = exp(-effectiveDensity * dist);
  return clamp(fogFactor, 0.0, 1.0);
}

vec3 applyFog(vec3 color, vec3 worldPos, vec3 viewPos) {
  float fogFactor = computeFogFactor(worldPos, viewPos);
  vec3 foggedColor = mix(uFogColor, color, fogFactor);
  return mix(color, foggedColor, clamp(uFogFade, 0.0, 1.0));
}



void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uViewPos - vWorldPos);
  vec4 baseColor = vec4(uColor, 1.0);
  if (uUseTexture) {
    baseColor = texture2D(uTexture, vTexCoord);
  }
  vec3 ambient = computeAmbientLighting(baseColor.rgb);
  vec3 dirLit  = computeDirectionalLighting(N, V, baseColor.rgb);
  vec3 ptsLit  = computePointLightsLighting(N, V, baseColor.rgb);
  vec3 color   = ambient + dirLit + ptsLit;
  vec3 finalColor = applyFog(color, vWorldPos, uViewPos);
  gl_FragColor = vec4(finalColor, baseColor.a);
}

