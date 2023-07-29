varying vec3 vPosition;
varying vec4 vNormal;
varying float vDot;
varying vec2 vUv;

void main() {
  vec2 mid = vec2(0.5);
  vec2 dist = mid - vUv;

  gl_FragColor = vec4(vec3(smoothstep(0.4, 0.6, length(dist * 2.0))), 1.0 );
}