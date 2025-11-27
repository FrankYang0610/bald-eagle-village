precision mediump float;

varying vec3 vWorldPos;
varying vec3 vNormal;

// Lighting and view
uniform vec3 uViewPos;
uniform vec3 uMainLightDirection; // from light toward the scene
uniform vec3 uMainLightColor;
uniform vec3 uAmbientLightColor;
uniform vec3 uSpecularLightColor;
uniform float uShininess;

// Water appearance
uniform vec3 uWaterColor;
uniform vec3 uSkyColor;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uViewPos - vWorldPos);
  vec3 Ld = normalize(-uMainLightDirection);
  vec3 H = normalize(Ld + V);

  float diff = max(dot(N, Ld), 0.0);
  float spec = pow(max(dot(N, H), 0.0), uShininess);

  vec3 diffuseTerm  = uWaterColor * uMainLightColor * diff;
  vec3 specularTerm = uSpecularLightColor * spec;

  // Base water shading
  vec3 waterBase = uAmbientLightColor * uWaterColor + diffuseTerm + specularTerm;
  // Fresnel-like sky reflection
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 finalColor = mix(waterBase, uSkyColor, fresnel * 0.5);

  gl_FragColor = vec4(finalColor, 0.9);
}


