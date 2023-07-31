varying vec3 vPosition;
varying vec3 vNormal;
varying float vDot;
varying vec2 vUv;

void main() {
  vec3 diffVec = vec3(0.0, 0.0,  0.5);
  float face = clamp(dot(diffVec, vNormal), 0., 1.);

  gl_FragColor = vec4(vec3(mix(1.0, 0.0,vPosition.z)), 1.0);
}