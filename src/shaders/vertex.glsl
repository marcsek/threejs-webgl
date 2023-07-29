varying vec3 vPosition;
varying vec2 vUv;
varying vec4 vNormal;
varying float vDot;

uniform float uTime;

void main() {
  vPosition = position;
  vec3 fPos = vec3(position.x, position.y, position.z);

  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(fPos, 1.0);
}