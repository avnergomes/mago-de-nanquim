import * as THREE from 'three';

// Desenho em modo imediato: a cada frame os sistemas empurram instâncias e end() envia tudo à GPU.
// Um Batch por arquétipo visual mantém o jogo em poucas draw calls mesmo com centenas de inimigos.
export class Batch {
  constructor(scene, geo, mat, cap = 1024) {
    this.cap = cap;
    this.mesh = new THREE.InstancedMesh(geo, mat, cap);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.m = this.mesh.instanceMatrix.array;
    this.c = this.mesh.instanceColor.array;
    this.n = 0;
    scene.add(this.mesh);
  }

  // Rotação só em Y (θ leva +Z local para (sinθ, cosθ)) e escala por eixo.
  push(x, y, z, ry = 0, sx = 1, sy = sx, sz = sx, r = 1, g = 1, b = 1) {
    if (this.n >= this.cap) return;
    const i = this.n * 16, s = Math.sin(ry), c = Math.cos(ry), m = this.m;
    m[i] = c * sx; m[i + 1] = 0; m[i + 2] = -s * sx; m[i + 3] = 0;
    m[i + 4] = 0; m[i + 5] = sy; m[i + 6] = 0; m[i + 7] = 0;
    m[i + 8] = s * sz; m[i + 9] = 0; m[i + 10] = c * sz; m[i + 11] = 0;
    m[i + 12] = x; m[i + 13] = y; m[i + 14] = z; m[i + 15] = 1;
    const k = this.n * 3;
    this.c[k] = r; this.c[k + 1] = g; this.c[k + 2] = b;
    this.n++;
  }

  // Igual a push, com inclinação extra em X (ex.: meteoro caindo, lâminas tombadas).
  pushTilt(x, y, z, ry, rx, s, r = 1, g = 1, b = 1) {
    if (this.n >= this.cap) return;
    const i = this.n * 16, sy = Math.sin(ry), cy = Math.cos(ry), sx = Math.sin(rx), cx = Math.cos(rx), m = this.m;
    // R = Ry * Rx
    m[i] = cy * s; m[i + 1] = 0; m[i + 2] = -sy * s; m[i + 3] = 0;
    m[i + 4] = sy * sx * s; m[i + 5] = cx * s; m[i + 6] = cy * sx * s; m[i + 7] = 0;
    m[i + 8] = sy * cx * s; m[i + 9] = -sx * s; m[i + 10] = cy * cx * s; m[i + 11] = 0;
    m[i + 12] = x; m[i + 13] = y; m[i + 14] = z; m[i + 15] = 1;
    const k = this.n * 3;
    this.c[k] = r; this.c[k + 1] = g; this.c[k + 2] = b;
    this.n++;
  }

  end() {
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
    this.n = 0;
  }
}
