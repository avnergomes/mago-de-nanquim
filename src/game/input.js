// Teclado (WASD/setas) + joystick virtual por toque/mouse em qualquer ponto da tela.
const keys = new Set();
const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
let base, knob;

export const input = {
  dir() {
    let x = 0, z = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) z -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) z += 1;
    if (joy.active) {
      const dx = joy.x - joy.ox, dy = joy.y - joy.oy, d = Math.hypot(dx, dy);
      if (d > 8) { x = dx / d; z = dy / d; }
    }
    const L = Math.hypot(x, z);
    return L > 0 ? [x / L, z / L] : [0, 0];
  },
};

export function initInput(onPause) {
  base = document.getElementById('joy-base');
  knob = document.getElementById('joy-knob');
  addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.code === 'Escape' || e.code === 'KeyP') onPause();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  const cv = document.getElementById('game');
  cv.addEventListener('pointerdown', (e) => {
    if (joy.active) return;
    Object.assign(joy, { active: true, id: e.pointerId, ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY });
    base.style.display = knob.style.display = 'block';
    place();
  });
  addEventListener('pointermove', (e) => {
    if (!joy.active || e.pointerId !== joy.id) return;
    joy.x = e.clientX; joy.y = e.clientY;
    place();
  });
  const end = (e) => {
    if (e.pointerId !== joy.id) return;
    joy.active = false;
    base.style.display = knob.style.display = 'none';
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
}

function place() {
  const dx = joy.x - joy.ox, dy = joy.y - joy.oy, d = Math.hypot(dx, dy), m = Math.min(d, 50);
  const kx = d ? (dx / d) * m : 0, ky = d ? (dy / d) * m : 0;
  base.style.transform = `translate(${joy.ox - 60}px, ${joy.oy - 60}px)`;
  knob.style.transform = `translate(${joy.ox + kx - 26}px, ${joy.oy + ky - 26}px)`;
}
