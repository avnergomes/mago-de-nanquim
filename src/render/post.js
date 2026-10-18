import * as THREE from 'three';

// Passe de "tinta sobre papel": contorno por descontinuidade de profundidade e de cor,
// hachura de lápis nas sombras, grão de papel e linhas que "fervem" a ~8 quadros/s como desenho animado à mão.
const frag = /* glsl */ `
precision highp float;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 res;
uniform float near, far, time, px;
uniform vec3 tint;
varying vec2 vUv;

// hash sem sin(): sin com argumentos grandes perde precisão na GPU e gera blocos visíveis
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float linDepth(vec2 uv){
  float z = texture2D(tDepth, uv).x * 2.0 - 1.0;
  return (2.0 * near * far) / (far + near - z * (far - near));
}
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
// o alvo guarda cor linear; tudo aqui trabalha em sRGB e escreve direto na tela
vec3 tex(vec2 uv){ return pow(max(texture2D(tColor, uv).rgb, 0.0), vec3(0.4545)); }

// salto de profundidade para fora em 8 direções: positivo só quando o vizinho está mais longe,
// então a linha cai inteira dentro do objeto da frente e não dobra de espessura
float silhouette(vec2 uv, float d, vec2 r){
  float s = 0.0;
  s = max(s, linDepth(uv + vec2( r.x, 0.0)) - d);
  s = max(s, linDepth(uv + vec2(-r.x, 0.0)) - d);
  s = max(s, linDepth(uv + vec2(0.0,  r.y)) - d);
  s = max(s, linDepth(uv + vec2(0.0, -r.y)) - d);
  s = max(s, linDepth(uv + r * 0.7) - d);
  s = max(s, linDepth(uv - r * 0.7) - d);
  s = max(s, linDepth(uv + vec2(r.x, -r.y) * 0.7) - d);
  s = max(s, linDepth(uv + vec2(-r.x, r.y) * 0.7) - d);
  // vista de cima: um espírito de 1 m sobre o chão a ~30 m dá só ~2% de salto relativo
  return smoothstep(0.009, 0.022, s / d);
}

void main(){
  // tempo quantizado: o traço muda de forma em passos, como animação desenhada quadro a quadro
  float step8 = floor(time * 8.0);
  vec2 wob = vec2(noise(vUv * 38.0 + step8 * 1.7), noise(vUv * 38.0 - step8 * 2.3)) - 0.5;
  vec2 uv = vUv + wob * 1.6 / res;
  vec2 o = px / res;

  vec3 col = tex(uv);
  float d = linDepth(uv);

  // 1) contorno externo: só do lado do objeto mais próximo, espessura maior de perto (pena mais grossa)
  float thick = clamp(34.0 / d, 0.9, 2.2);
  float sil = silhouette(uv, d, o * thick);
  // 2) traço de esboço: segunda passada da pena, levemente deslocada, que às vezes sobra para fora
  vec2 wob2 = vec2(noise(vUv * 23.0 - step8 * 1.3), noise(vUv * 23.0 + step8 * 0.9)) - 0.5;
  vec2 uv2 = vUv + wob2 * 3.2 / res;
  float sil2 = silhouette(uv2, linDepth(uv2), o * thick * 0.8);

  // 3) dobras internas finas: segunda derivada da profundidade inversa (plano = 0, só dobras acendem)
  float w = 1.0 / d;
  float wl = 1.0 / linDepth(uv - vec2(o.x,0.0)), wr = 1.0 / linDepth(uv + vec2(o.x,0.0));
  float wu = 1.0 / linDepth(uv + vec2(0.0,o.y)), wd = 1.0 / linDepth(uv - vec2(0.0,o.y));
  float crease = max(abs(wl + wr - 2.0 * w), abs(wu + wd - 2.0 * w)) / w;
  float creaseEdge = smoothstep(0.012, 0.035, crease) * 0.55;

  // 4) mudanças de cor viram linha fina (desenhos no piso, núcleos dos espíritos)
  float cl = lum(tex(uv - vec2(o.x,0.0))), cr = lum(tex(uv + vec2(o.x,0.0)));
  float cu = lum(tex(uv + vec2(0.0,o.y))), cd = lum(tex(uv - vec2(0.0,o.y)));
  float cEdge = abs(cl - cr) + abs(cu - cd);
  float colEdge = smoothstep(0.2, 0.4, cEdge) * 0.7;

  float edge = max(max(sil, sil2 * 0.55), max(creaseEdge, colEdge));
  // pressão da pena: o traço engrossa e falha ao longo do comprimento
  edge *= 0.7 + 0.45 * noise(gl_FragCoord.xy * 0.22 + step8 * 3.1);

  // hachura de lápis em screen-space, densidade pela sombra
  vec2 fc = gl_FragCoord.xy / px;
  float L = lum(col);
  float jitter = noise(fc * 0.05 + step8 * 0.3) * 3.0;
  float h1 = smoothstep(0.55, 0.0, abs(fract((fc.x + fc.y + jitter) / 7.0) - 0.5) * 7.0);
  float h2 = smoothstep(0.55, 0.0, abs(fract((fc.x - fc.y + jitter) / 6.0) - 0.5) * 6.0);
  float hatch = h1 * smoothstep(0.42, 0.22, L) * 0.3 + h2 * smoothstep(0.22, 0.08, L) * 0.3;
  hatch *= 0.6 + 0.4 * noise(fc * 0.08);

  // papel: grão fino + manchas largas de aquarela
  float grain = noise(gl_FragCoord.xy * 0.9) * 0.08 + noise(gl_FragCoord.xy * 0.012) * 0.10;
  vec3 paper = vec3(0.97, 0.93, 0.84);
  col = col * (0.94 + grain * 0.7) * mix(vec3(1.0), paper, 0.06);
  col = mix(col, col * vec3(0.30, 0.26, 0.24), hatch);


  // nanquim sépia; em magia brilhante a linha vira um tom escuro da própria cor (tinta colorida)
  vec3 base = tex(uv);
  float glow = smoothstep(0.65, 0.95, max(base.r, max(base.g, base.b))) * smoothstep(0.15, 0.4, max(base.r, max(base.g, base.b)) - min(base.r, min(base.g, base.b)));
  vec3 ink = mix(vec3(0.13, 0.10, 0.09), base * 0.38, glow);
  col = mix(col, ink, clamp(edge, 0.0, 1.0));
  // vinheta leve de folha
  vec2 v = vUv - 0.5;
  col *= 1.0 - dot(v, v) * 0.45;
  col *= tint;
  gl_FragColor = vec4(col, 1.0);
}`;

export function createInkPass(renderer) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(size.x, size.y, {
    depthTexture: new THREE.DepthTexture(size.x, size.y, THREE.UnsignedIntType),
  });

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: target.texture }, tDepth: { value: target.depthTexture },
      res: { value: new THREE.Vector2(size.x, size.y) },
      near: { value: 1 }, far: { value: 200 }, time: { value: 0 }, px: { value: 1 }, tint: { value: new THREE.Vector3(1, 1, 1) },
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: frag,
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const postScene = new THREE.Scene();
  postScene.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    resize() {
      renderer.getDrawingBufferSize(size);
      target.setSize(size.x, size.y);
      mat.uniforms.res.value.set(size.x, size.y);
      // traço um pouco mais grosso em telas densas
      mat.uniforms.px.value = Math.max(1, renderer.getPixelRatio() * 0.9);
    },
    render(scene, camera, time, tint = [1, 1, 1]) {
      mat.uniforms.tint.value.set(...tint);
      mat.uniforms.near.value = camera.near;
      mat.uniforms.far.value = camera.far;
      mat.uniforms.time.value = time;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
    },
  };
}
