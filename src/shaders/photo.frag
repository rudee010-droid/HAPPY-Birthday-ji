precision highp float;

uniform sampler2D uTexture;
uniform float uHasTexture; // 1.0 = valid image, 0.0 = fallback placeholder
uniform float uTime;
uniform float uVelocity;
uniform vec2 uTouchPos; // Ripple origin
uniform float uTouchTime; // Time elapsed since touch
uniform float uAspectRatio;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec2 uv = vUv;

  // Touch ripple displacement
  float distToTouch = distance(uv, uTouchPos);
  float rippleAge = uTime - uTouchTime;
  if (rippleAge > 0.0 && rippleAge < 2.0) {
    float wave = sin(distToTouch * 25.0 - rippleAge * 8.0) * exp(-distToTouch * 4.0 - rippleAge * 2.0);
    uv += normalize(uv - uTouchPos + 0.0001) * wave * 0.035;
  }

  // Chromatic aberration linked to scroll velocity
  float chroma = clamp(abs(uVelocity) * 0.025, 0.0, 0.04);
  vec2 dir = vec2(1.0, 0.5) * chroma;

  vec4 col;
  if (uHasTexture > 0.5) {
    float r = texture2D(uTexture, uv + dir).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - dir).b;
    float a = texture2D(uTexture, uv).a;
    col = vec4(r, g, b, a);
  } else {
    // Procedural pastel gradient placeholder
    vec3 grad = mix(vec3(1.0, 0.85, 0.91), vec3(0.72, 0.61, 1.0), uv.y);
    // Grid / camera placeholder icon shape
    float icon = step(0.4, uv.x) * step(uv.x, 0.6) * step(0.4, uv.y) * step(uv.y, 0.6);
    col = vec4(mix(grad, vec3(1.0, 0.31, 0.525), icon * 0.5), 1.0);
  }

  // Soft rim glow (fresnel)
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float rim = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
  rim = pow(rim, 2.5);
  vec3 rimColor = vec3(1.0, 0.8, 0.9); // Warm blush glow
  col.rgb += rimColor * rim * 0.45;

  // Rounded corner mask in shader
  vec2 d = abs(vUv - 0.5) * 2.0;
  float cornerDist = length(max(d - vec2(0.85), 0.0));
  float alpha = 1.0 - smoothstep(0.12, 0.15, cornerDist);

  gl_FragColor = vec4(col.rgb, col.a * alpha);
}

