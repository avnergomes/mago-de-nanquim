import * as THREE from 'three';

// Pisos dos setores, como no jogo original: cor chapada, rachaduras finas, ladrilhos nos setores internos.
// Gerados em canvas com semente fixa para o tile repetir sem costura.
const FLOORS = {
  arrays:    { base: '#7c805f', tone: ['96,100,72', '110,112,84'], crack: 'rgba(40,42,30,0.45)', tiles: 0 },
  lab:       { base: '#8d8c88', tone: ['120,118,112', '150,148,142'], crack: 'rgba(40,40,40,0.4)', tiles: 4, grout: 'rgba(55,55,55,0.75)' },
  sewage:    { base: '#3c4135', tone: ['50,56,44', '70,76,58'], crack: 'rgba(15,18,12,0.5)', tiles: 4, grout: 'rgba(15,18,12,0.85)', stripe: 'rgba(205,190,70,0.75)' },
  arboretum: { base: '#5d6f4e', tone: ['70,90,60', '95,110,75'], crack: 'rgba(25,35,20,0.45)', tiles: 0 },
  power:     { base: '#5e6577', tone: ['75,82,98', '95,102,118'], crack: 'rgba(25,28,40,0.45)', tiles: 2, grout: 'rgba(30,34,46,0.8)' },
};

export function groundTexture(kind = 'arrays') {
  const F = FLOORS[kind], S = 1024, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  g.fillStyle = F.base;
  g.fillRect(0, 0, S, S);
  // manchas largas e suaves
  for (let i = 0; i < 60; i++) {
    const x = rnd() * S, y = rnd() * S, r = 50 + rnd() * 160, tone = F.tone[i % 2];
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, `rgba(${tone},0.35)`);
    grd.addColorStop(1, `rgba(${tone},0)`);
    wrap(g, S, x, y, r, (ox, oy) => { g.save(); g.translate(ox, oy); g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); });
  }
  // grão
  const img = g.getImageData(0, 0, S, S), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
  // ladrilhos com rejunte e lascas
  if (F.tiles) {
    const t = S / F.tiles;
    g.strokeStyle = F.grout; g.lineWidth = 4;
    for (let i = 0; i <= F.tiles; i++) {
      g.beginPath(); g.moveTo(i * t, 0); g.lineTo(i * t, S); g.stroke();
      g.beginPath(); g.moveTo(0, i * t); g.lineTo(S, i * t); g.stroke();
    }
    for (let i = 0; i < F.tiles * F.tiles; i++) {
      const x = (i % F.tiles) * t, y = Math.floor(i / F.tiles) * t;
      g.fillStyle = `rgba(0,0,0,${0.03 + rnd() * 0.08})`;
      g.fillRect(x + 3, y + 3, t - 6, t - 6);
    }
  }
  if (F.stripe) {
    g.strokeStyle = F.stripe; g.lineWidth = 7;
    for (const y of [S * 0.25, S * 0.75]) { g.beginPath(); g.moveTo(0, y); g.lineTo(S, y); g.stroke(); }
  }
  // rachaduras a nanquim: grossas no meio, afinando nas pontas, com galhos
  g.strokeStyle = F.crack; g.lineCap = 'round';
  const crack = (x, y, a, n, w0) => {
    for (let k = 0; k < n; k++) {
      const t = k / n, w = w0 * Math.sin(Math.PI * (0.15 + t * 0.85)) + 0.3;
      a += (rnd() - 0.5) * 1.1;
      const nx = x + Math.cos(a) * 14, ny = y + Math.sin(a) * 14;
      g.lineWidth = w;
      g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke();
      if (rnd() < 0.18 && n > 4) crack(nx, ny, a + (rnd() < 0.5 ? 0.9 : -0.9), Math.floor(n * 0.4), w * 0.7);
      x = nx; y = ny;
    }
  };
  for (let i = 0; i < 26; i++) crack(rnd() * S, rnd() * S, rnd() * 6.28, 8 + Math.floor(rnd() * 8), 1.4 + rnd() * 1.6);
  // tufos de hachura a lápis: 3 a 6 riscos paralelos curtos, como sombreado feito à mão
  g.strokeStyle = F.crack; g.lineWidth = 1;
  for (let i = 0; i < 70; i++) {
    const x = rnd() * S, y = rnd() * S, a = 0.6 + (rnd() - 0.5) * 0.4, L = 6 + rnd() * 8, n = 3 + Math.floor(rnd() * 4);
    g.globalAlpha = 0.35 + rnd() * 0.3;
    for (let k = 0; k < n; k++) {
      const ox = x - Math.sin(a) * k * 3, oy = y + Math.cos(a) * k * 3;
      g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(a) * L, oy + Math.sin(a) * L); g.stroke();
    }
  }
  g.globalAlpha = 1;
  // pontinhos de poeira
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(255,255,255,${rnd() * 0.12})`;
    g.fillRect(rnd() * S, rnd() * S, 2, 2);
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
export const FLOOR_KINDS = Object.keys(FLOORS);

// desenha também nas bordas opostas para o tile repetir sem emenda
function wrap(g, S, x, y, r, draw) {
  for (const ox of [0, x < r ? S : x > S - r ? -S : null]) {
    if (ox === null) continue;
    for (const oy of [0, y < r ? S : y > S - r ? -S : null]) {
      if (oy === null) continue;
      draw(ox, oy);
    }
  }
}

// Rampa de 4 tons para o MeshToonMaterial (sombra / meio-tom / luz / brilho), em degraus duros
export function toonRamp() {
  const t = new THREE.DataTexture(new Uint8Array([55, 55, 55, 255, 120, 120, 120, 255, 195, 195, 195, 255, 255, 255, 255, 255]), 4, 1);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}
