varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

void main() {
  vPosition = position;
  vUv = uv;
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}