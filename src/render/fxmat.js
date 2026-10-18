import * as THREE from 'three';

// Material das magias: núcleo incandescente em degraus (combina com a rampa toon), borda saturada,
// energia correndo pela superfície e, nos discos de chão, anéis rúnicos girando.
// Um uniform de tempo compartilhado anima todos os lotes de uma vez.
export const fxTime = { value: 0 };

const vert = /* glsl */ `
varying vec3 vCol, vN, vV, vP;
varying vec2 vUv;
void main(){
  vCol = instanceColor;
  mat4 m = modelMatrix * instanceMatrix;
  vec4 wp = m * vec4(position, 1.0);
  vN = normalize(mat3(m) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vP = position; vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const frag = /* glsl */ `
uniform float time;
varying vec3 vCol, vN, vV, vP;
varying vec2 vUv;
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
// degraus duros, como o sombreamento toon
float steps(float x, float n){ return floor(x * n + 0.5) / n; }

void main(){
  vec3 c = clamp(vCol, 0.0, 1.6);
  vec3 hot = mix(c, vec3(1.0), 0.6);
#if defined(GLOW)
  // poça de luz no chão: queda radial em 3 degraus
  float r = length(vUv - 0.5) * 2.0;
  vec3 col = c;
  float alpha = steps(pow(max(0.0, 1.0 - r), 1.5), 3.0) * 0.55;
#elif defined(FLAT)
  // disco de chão: borda brilhante, anéis concêntricos girando e marcas rúnicas
  vec2 q = vUv - 0.5;
  float r = length(q) * 2.0, a = atan(q.y, q.x);
  float rim = smoothstep(0.82, 0.93, r) * (1.0 - smoothstep(0.97, 1.0, r));
  float ring2 = smoothstep(0.03, 0.0, abs(r - 0.62)) * 0.8;
  float ticks = step(0.75, fract(a * 3.8197 + time * 0.4)) * smoothstep(0.66, 0.7, r) * (1.0 - smoothstep(0.78, 0.82, r));
  float swirl = noise(vec2(a * 3.0 - time * 1.5, r * 6.0 - time * 2.0));
  float body = (1.0 - r * 0.55) * (0.35 + 0.4 * steps(swirl, 3.0));
  float k = clamp(body + rim + ring2 + ticks * 0.9, 0.0, 1.4);
  vec3 col = mix(c * 0.8, hot, steps(clamp(rim + ring2 + ticks, 0.0, 1.0), 2.0));
  float alpha = k;
#else
  float facing = abs(dot(normalize(vN), normalize(vV)));
  // energia escorrendo pela superfície (coordenadas do objeto, então cada forma tem seu padrão)
  float flow = noise(vec2(vP.x * 5.0 + vP.z * 3.0, vP.y * 5.0 - time * 4.0));
  float core = steps(pow(facing, 1.6) * 0.8 + flow * 0.35, 3.0);
  vec3 col = mix(c * 0.55, hot, core);
  float alpha = 1.0;
#ifdef SOFT
  // volumes macios: bordas somem, miolo mais denso; nada de disco chapado
  alpha = smoothstep(0.0, 0.7, facing) * (0.55 + 0.45 * flow);
#endif
#endif
  // aditivo do three usa SRC_ALPHA, ONE: o alfa já dosa o brilho somado
  gl_FragColor = vec4(col, alpha * 0.6);
}`;

export function fxMaterial(kind, soft) {
  const flat = kind === 'disk';
  const defines = {};
  if (soft) defines.SOFT = '';
  if (flat) defines.FLAT = '';
  if (kind === 'glow') defines.GLOW = '';
  const add = soft || flat || kind === 'glow';
  return new THREE.ShaderMaterial({
    uniforms: { time: fxTime }, vertexShader: vert, fragmentShader: frag, defines,
    transparent: add, depthWrite: !add, side: THREE.DoubleSide,
    blending: add ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}
