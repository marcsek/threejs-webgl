varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDot;

uniform float uTime;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}


void main() {
  vec3 fPos = vec3(position.x, position.y,  position.z + noise(vec2(position.xy) + uTime));
  vPosition = fPos;

  vUv = uv;
  vec4 nN = vec4(normal, 1.) * 1.;
  vNormal = vec3(nN.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(fPos, 1.0);
}