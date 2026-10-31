precision highp float;

uniform float uTime;
uniform float uScroll; // 0.0 to 1.0
uniform vec2 uResolution;

varying vec2 vUv;

// Simple 2D hash & noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.05;

  // Key Colors from Art Direction Palette
  vec3 cBlush = vec3(1.0, 0.85, 0.91);      // #FFD9E8
  vec3 cHotPink = vec3(1.0, 0.31, 0.525);   // #FF4F86
  vec3 cLavender = vec3(0.718, 0.612, 1.0); // #B79CFF
  vec3 cPeach = vec3(1.0, 0.788, 0.659);    // #FFC9A8
  vec3 cCream = vec3(1.0, 0.953, 0.769);    // #FFF3C4
  vec3 cPlum = vec3(0.239, 0.114, 0.227);   // #3D1D3A
  vec3 cMidnight = vec3(0.078, 0.063, 0.18);// #14102E
  vec3 cDeepNight = vec3(0.03, 0.02, 0.08); // Deep Void
  vec3 cAntares = vec3(1.0, 0.239, 0.431);  // #FF3D6E

  // Scroll Chapters Color Gradients:
  // Phase 1: Sunset (0.0 to 0.15)
  vec3 sunsetSky = mix(cHotPink, cBlush, uv.y);
  sunsetSky = mix(sunsetSky, cPeach, (1.0 - uv.y) * 0.6);

  // Phase 2: Twilight (0.15 to 0.35)
  vec3 twilightSky = mix(cMidnight, cPlum, uv.y);
  twilightSky = mix(twilightSky, cLavender * 0.6, pow(1.0 - uv.y, 2.0));

  // Phase 3: Scorpio Night & Galaxy (0.35 to 0.75)
  vec3 nightSky = mix(cDeepNight, cMidnight, uv.y);
  // Warm Antares nebula cloud in center-right
  float nebulaDist = length(uv - vec2(0.65, 0.7));
  float nebula = exp(-nebulaDist * 4.0) * 0.35;
  nightSky += cAntares * nebula;

  // Soft Aurora ribbons in night chapters
  float auroraY = sin(uv.x * 3.5 + t * 2.0) * 0.15 + 0.65;
  float auroraGlow = exp(-abs(uv.y - auroraY) * 12.0) * 0.22;
  vec3 auroraColor = mix(cLavender, vec3(0.4, 0.9, 0.8), sin(uv.x * 2.0 + t) * 0.5 + 0.5);
  nightSky += auroraColor * auroraGlow;

  // Phase 4: Golden Sunrise Dawn (0.75 to 1.0)
  vec3 dawnSky = mix(cLavender * 0.8, cCream, 1.0 - uv.y);
  dawnSky = mix(dawnSky, cPeach, pow(1.0 - uv.y, 1.5) * 0.7);
  dawnSky = mix(dawnSky, cHotPink, pow(1.0 - uv.y, 3.0) * 0.5);

  // Smooth blending across scroll progress
  vec3 finalColor = sunsetSky;

  if (uScroll < 0.25) {
    float f = smoothstep(0.05, 0.25, uScroll);
    finalColor = mix(sunsetSky, twilightSky, f);
  } else if (uScroll < 0.75) {
    float f = smoothstep(0.25, 0.5, uScroll);
    finalColor = mix(twilightSky, nightSky, f);
  } else {
    float f = smoothstep(0.75, 0.98, uScroll);
    finalColor = mix(nightSky, dawnSky, f);
  }

  // Soft drifting clouds via FBM noise
  vec2 cloudUV = uv * 2.0 + vec2(t * 0.2, t * 0.05);
  float cloudDensity = fbm(cloudUV);
  cloudDensity = smoothstep(0.45, 0.85, cloudDensity) * 0.15;
  
  // Clouds catch ambient sky illumination
  vec3 cloudColor = mix(cCream, cBlush, uv.y);
  if (uScroll > 0.3 && uScroll < 0.75) {
    cloudColor = mix(cLavender * 0.3, cPlum * 0.4, uv.y);
  }
  finalColor = mix(finalColor, cloudColor, cloudDensity);

  gl_FragColor = vec4(finalColor, 1.0);
}

