import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Modelos procedurais: primitivas com cor por vértice e um leve deslocamento por ruído,
// para a silhueta sair irregular como traço feito à mão (o contorno vem do passe de tinta).

const hash3 = (x, y, z) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

function part(geo, color, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], wobble = 0.03, bend } = {}) {
  let g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.attributes.position;
  if (bend) for (let i = 0; i < pos.count; i++) bend(pos, i);
  g.scale(...s);
  g.rotateX(r[0]); g.rotateY(r[1]); g.rotateZ(r[2]);
  // ruído baseado na posição: vértices coincidentes recebem o mesmo deslocamento, sem rasgar a malha
  if (wobble) {
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const k = (hash3(x * 3.1, y * 3.1, z * 3.1) - 0.5) * wobble;
      pos.setXYZ(i, x * (1 + k), y + k * 0.3, z * (1 + k));
    }
  }
  g.translate(...p);
  const c = new THREE.Color(color), n = pos.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // variação de tom por vértice, como lápis de cor sem uniformidade
    const v = 0.9 + hash3(pos.getX(i) * 9, pos.getY(i) * 9, pos.getZ(i) * 9) * 0.18;
    col[i * 3] = c.r * v; col[i * 3 + 1] = c.g * v; col[i * 3 + 2] = c.b * v;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.deleteAttribute('uv');
  g.computeVertexNormals();
  return g;
}
const merge = (parts) => mergeGeometries(parts);

const sph = (r, w = 12, h = 10) => new THREE.SphereGeometry(r, w, h);
const cone = (r, h, seg = 12) => new THREE.ConeGeometry(r, h, seg);
const cyl = (rt, rb, h, seg = 10) => new THREE.CylinderGeometry(rt, rb, h, seg);
const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);
const PI = Math.PI;

// "Sujeito" do jogo original: silhueta preta de mago, só a gema do cajado e os olhos claros.
export function wizard() {
  const ink = '#1d1a22', ink2 = '#2c2833';
  return merge([
    part(cone(0.5, 1.05, 16), ink, { p: [0, 0.53, 0] }),
    part(sph(0.25), ink2, { p: [0, 1.22, 0] }),
    part(sph(0.04, 6, 5), '#f4f1ea', { p: [-0.09, 1.25, 0.21], wobble: 0 }),
    part(sph(0.04, 6, 5), '#f4f1ea', { p: [0.09, 1.25, 0.21], wobble: 0 }),
    part(cyl(0.56, 0.56, 0.05, 18), ink, { p: [0, 1.4, 0] }),
    part(cone(0.32, 1.0, 14), ink, {
      p: [0, 1.88, 0],
      bend: (pos, i) => { const y = pos.getY(i); if (y > 0.05) pos.setZ(i, pos.getZ(i) - (y - 0.05) ** 2 * 1.1); },
    }),
    part(cyl(0.035, 0.045, 1.8, 6), ink2, { p: [0.46, 0.9, 0.18], r: [0.12, 0, -0.05] }),
    part(new THREE.IcosahedronGeometry(0.12, 0), '#5fe0ff', { p: [0.44, 1.85, 0.3], wobble: 0 }),
  ]);
}

// ----- espíritos mutantes: manchas de nanquim espinhosas com núcleo colorido -----
const CORE = {
  white: '#f6f2e4', toxic: '#c9e235', red: '#ff2b16', pale: '#f3ebc8', crimson: '#ff2a5c', vein: '#e8c63a',
  cyan: '#3df2ff', ember: '#d0161c', moon: '#f4e7b2', star: '#ffffff', yellow: '#ffe9a0', blue: '#2a9bff',
};

function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
function dirOnSphere(rnd, ringOnly) {
  const a = rnd() * Math.PI * 2;
  const y = ringOnly ? (rnd() - 0.5) * 0.7 : rnd() * 2 - 1;
  const r = Math.sqrt(1 - y * y);
  return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
}
const UP = new THREE.Vector3(0, 1, 0);

// clumps: tufos (forma de arbusto do Swarm); spikes: espinhos finos; ring: deixa o topo aberto para o núcleo aparecer
function inkBlob(o) {
  const rnd = seeded(o.seed || 7);
  const ink = '#121016', parts = [];
  const R = o.R ?? 0.5;
  if (!o.ring) parts.push(part(new THREE.IcosahedronGeometry(R * 0.75, 1), ink, { p: [0, R, 0], wobble: 0.25 }));
  for (let i = 0; i < (o.clumps ?? 26); i++) {
    const d = dirOnSphere(rnd, o.ring);
    const rr = R * (0.18 + rnd() * 0.2) * (o.clumpSize ?? 1);
    const dist = R * (o.ring ? 0.85 + rnd() * 0.25 : 0.45 + rnd() * 0.45);
    parts.push(part(new THREE.IcosahedronGeometry(rr, 0), ink, { p: [d.x * dist, R + d.y * dist * 0.9, d.z * dist], wobble: 0.5 }));
  }
  for (let i = 0; i < (o.spikes ?? 22); i++) {
    const d = dirOnSphere(rnd, o.ring || o.flat);
    if (o.flat) { d.y *= 0.25; d.normalize(); }
    const len = R * (o.spikeLen ?? 0.6) * (0.6 + rnd() * 0.8);
    const g = new THREE.ConeGeometry(R * 0.07 * (o.spikeW ?? 1), len, 4);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d));
    const base = R * (o.ring ? 0.95 : 0.6);
    parts.push(part(g, ink, { p: [d.x * base, R + d.y * base, d.z * base], wobble: 0 }));
  }
  if (o.core) {
    const cr = R * (o.coreR ?? 0.8);
    parts.push(part(new THREE.IcosahedronGeometry(cr, 2), CORE[o.core], { p: [0, R, 0], wobble: 0.04 }));
  }
  for (let i = 0; i < (o.speckles ?? 0); i++) {
    const d = dirOnSphere(rnd, false);
    if (d.y < -0.2) d.y = -d.y;
    const dist = R * (0.6 + rnd() * 0.35);
    parts.push(part(new THREE.IcosahedronGeometry(R * (0.06 + rnd() * 0.07), 0), CORE[o.speckleColor], { p: [d.x * dist, R + d.y * dist, d.z * dist], wobble: 0 }));
  }
  return merge(parts);
}

// Colony: estrutura de veias rastejantes no chão com nódulos amarelos
function colony() {
  const rnd = seeded(31), parts = [part(new THREE.IcosahedronGeometry(0.45, 1), '#16241a', { p: [0, 0.3, 0], s: [1, 0.6, 1], wobble: 0.3 })];
  const branch = (x, z, a, len, depth) => {
    const ex = x + Math.cos(a) * len, ez = z + Math.sin(a) * len;
    const g = new THREE.BoxGeometry(0.07 + depth * 0.03, 0.06, len);
    g.rotateY(-a + Math.PI / 2);
    parts.push(part(g, '#101410', { p: [(x + ex) / 2, 0.05, (z + ez) / 2], wobble: 0 }));
    if (rnd() < 0.6) parts.push(part(sph(0.05 + rnd() * 0.04, 5, 4), CORE.vein, { p: [ex, 0.08, ez], wobble: 0 }));
    if (depth > 0) for (let k = 0; k < 2; k++) branch(ex, ez, a + (rnd() - 0.5) * 1.4, len * 0.7, depth - 1);
  };
  for (let i = 0; i < 7; i++) branch(0, 0, (i / 7) * Math.PI * 2, 0.45, 3);
  for (let i = 0; i < 14; i++) parts.push(part(sph(0.06, 5, 4), CORE.vein, { p: [(rnd() - 0.5) * 0.7, 0.4, (rnd() - 0.5) * 0.7], wobble: 0 }));
  return merge(parts);
}

// Citadel: espiral de traços de tinta em anéis concêntricos com estrela branca no centro
function citadel() {
  const rnd = seeded(91), parts = [];
  for (let ring = 0; ring < 4; ring++) {
    const rr = 0.25 + ring * 0.12, n = 10 + ring * 5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.4 + rnd() * 0.2;
      const g = new THREE.BoxGeometry(0.035, 0.05, 0.16 + rnd() * 0.1);
      g.rotateY(-a);
      parts.push(part(g, '#121016', { p: [Math.cos(a) * rr, 0.35 + (rnd() - 0.5) * 0.3, Math.sin(a) * rr], wobble: 0 }));
    }
  }
  parts.push(part(new THREE.IcosahedronGeometry(0.22, 1), '#121016', { p: [0, 0.35, 0], wobble: 0.3 }));
  for (let i = 0; i < 8; i++) {
    const g = new THREE.ConeGeometry(0.03, 0.4, 4).translate(0, 0.2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dirOnSphere(rnd, false)));
    parts.push(part(g, CORE.star, { p: [0, 0.55, 0], wobble: 0 }));
  }
  parts.push(part(new THREE.OctahedronGeometry(0.12, 0), CORE.star, { p: [0, 0.6, 0], wobble: 0 }));
  return merge(parts);
}

// geometria em escala unitária: o tamanho final vem de ENEMIES[k].scale
export const enemyModels = {
  swarm: () => inkBlob({ seed: 3, clumps: 34, spikes: 18, spikeLen: 0.5 }),
  scarab: () => inkBlob({ seed: 5, ring: true, clumps: 22, spikes: 14, core: 'white', coreR: 0.62 }),
  corrupt: () => inkBlob({ seed: 9, clumps: 30, spikes: 14, speckles: 16, speckleColor: 'toxic' }),
  mine: () => inkBlob({ seed: 11, ring: true, clumps: 30, spikes: 30, spikeLen: 0.5, core: 'red', coreR: 0.85 }),
  rampage: () => inkBlob({ seed: 13, clumps: 6, spikes: 12, spikeLen: 1.6, spikeW: 1.8, flat: true, core: 'pale', coreR: 0.32 }),
  hive: () => inkBlob({ seed: 17, clumps: 60, spikes: 30, clumpSize: 0.8, spikeLen: 0.35 }),
  overlord: () => inkBlob({ seed: 19, ring: true, clumps: 34, spikes: 40, spikeLen: 0.7, spikeW: 1.4, core: 'crimson', coreR: 0.9 }),
  colony: () => colony(),
  invader: () => inkBlob({ seed: 23, ring: true, clumps: 20, spikes: 26, spikeLen: 0.8, core: 'cyan', coreR: 0.95 }),
  atlas: () => inkBlob({ seed: 29, clumps: 40, spikes: 22, speckles: 18, speckleColor: 'ember' }),
  terra: () => inkBlob({ seed: 37, ring: true, clumps: 26, spikes: 20, spikeLen: 0.4, core: 'moon', coreR: 0.95 }),
  citadel: () => citadel(),
  interceptor: () => inkBlob({ seed: 41, clumps: 18, spikes: 10, core: 'yellow', coreR: 0.42 }),
  howling: () => inkBlob({ seed: 43, ring: true, clumps: 26, spikes: 18, core: 'blue', coreR: 0.8 }),
};

// ----- formas de magia (cor por instância, material básico) -----
export const fxModels = {
  orb: () => new THREE.IcosahedronGeometry(0.5, 1),
  bolt: () => new THREE.IcosahedronGeometry(0.5, 1).scale(0.7, 0.7, 1.6),
  shard: () => new THREE.OctahedronGeometry(0.5, 0).scale(0.5, 0.5, 1.4),
  ring: () => new THREE.TorusGeometry(1, 0.06, 6, 40).rotateX(PI / 2),
  disk: () => new THREE.CircleGeometry(1, 40).rotateX(-PI / 2),
  beam: () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5),
  wall: () => new THREE.BoxGeometry(1, 1, 1, 6, 2, 1).translate(0, 0.5, 0),
  flame: () => new THREE.ConeGeometry(0.5, 1, 7).rotateX(PI / 2),
  column: () => new THREE.CylinderGeometry(1, 1, 1, 8).translate(0, 0.5, 0),
  zigzag: () => zigzagColumn(),
  blade: () => new THREE.ConeGeometry(0.25, 1.4, 4).rotateX(PI / 2).scale(1, 0.25, 1),
  wave: () => new THREE.CylinderGeometry(1, 1, 1, 24, 1, true, -0.6, 1.2).translate(0, 0.5, 0),
  dome: () => new THREE.SphereGeometry(1, 20, 10, 0, PI * 2, 0, PI / 2),
  cyclone: () => new THREE.CylinderGeometry(1, 0.25, 1, 14, 4, true).translate(0, 0.5, 0),
  rock: () => new THREE.DodecahedronGeometry(0.6, 0),
  star: () => new THREE.OctahedronGeometry(0.5, 0),
  glow: () => new THREE.CircleGeometry(1, 24).rotateX(-PI / 2),
  spark: () => new THREE.OctahedronGeometry(0.5, 0).scale(0.6, 0.6, 1.6),
  shadow: () => new THREE.CircleGeometry(1, 20).rotateX(-PI / 2),
  chest: () => merge([
    part(box(0.9, 0.55, 0.6), '#a8682e', { p: [0, 0.28, 0], wobble: 0.02 }),
    part(cyl(0.3, 0.3, 0.9, 10, 1), '#bf7a38', { p: [0, 0.56, 0], r: [0, 0, PI / 2], s: [1, 1, 1], wobble: 0.02 }),
    part(box(0.95, 0.08, 0.65), '#e8c45a', { p: [0, 0.52, 0], wobble: 0 }),
    part(box(0.14, 0.18, 0.08), '#e8c45a', { p: [0, 0.45, 0.32], wobble: 0 }),
  ]),
};

// raio em zigue-zague para a Tempestade de Raios
function zigzagColumn() {
  const pts = [];
  let x = 0, z = 0;
  for (let i = 0; i <= 8; i++) {
    pts.push(new THREE.Vector3(x, i / 8, z));
    x = (Math.random() - 0.5) * 0.5; z = (Math.random() - 0.5) * 0.5;
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1), 24, 0.12, 5);
}
