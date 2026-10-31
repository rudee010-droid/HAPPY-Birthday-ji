uniform float uVelocity;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vNormal = normalMatrix * normal;

  vec3 pos = position;
  // Subtle vertical stretch with scroll velocity
  pos.y += sin(pos.x * 2.0) * uVelocity * 0.05;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

