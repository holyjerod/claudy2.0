// The signature: the name printed layer by layer on a build plate.
// Wide screens print one row. Tall screens print two rows, one behind the other, so the letters stay big.
// Each row stands on a base bar, the way a name sign is printed: the bar first, then the letters on it.
// One driver value (print fraction) controls the clip height, the hot layer, the nozzle path and the readout.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Mesh, ShaderMaterial, Color, Vector3, DoubleSide, PlaneGeometry,
  CylinderGeometry, BoxGeometry, MeshBasicMaterial, Group, SRGBColorSpace, Sprite, SpriteMaterial, CanvasTexture,
  AdditiveBlending, MathUtils, Box3,
} from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import fontData from './gloock-hero.json';

const VERT = /* glsl */ `
varying vec3 vPos; varying vec3 vNormal;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform float uCut, uLayerH, uDone;
uniform vec3 uHot, uInk, uDark, uLight, uNozzle;
varying vec3 vPos; varying vec3 vNormal;
void main() {
  if (vPos.y > uCut) discard;
  float depth = uCut - vPos.y;
  float f = fract(vPos.y / uLayerH);
  float seam = smoothstep(0.0, 0.2, f) * smoothstep(1.0, 0.8, f);
  vec3 col;
  if (gl_FrontFacing) {
    vec3 n = normalize(vNormal);
    float side = 1.0 - abs(n.y);
    n = normalize(n + vec3(0.0, (f - 0.5) * 0.7 * side, 0.0));      // each layer bulges like an extruded bead
    vec3 V = normalize(cameraPosition - vPos);
    float diff = max(dot(n, uLight), 0.0);
    float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0);
    col = uInk * (0.14 + 0.86 * diff) * (0.74 + 0.26 * seam) + uInk * rim * 0.16;
  } else {
    vec2 q = vec2(vPos.x + vPos.z, vPos.x - vPos.z) * 15.0;          // 45 degree rectilinear infill
    vec2 g = abs(fract(q) - 0.5);
    float lines = 1.0 - smoothstep(0.03, 0.07, min(g.x, g.y));
    col = mix(uDark, uInk * 0.55, lines);
  }
  float live = 1.0 - uDone;
  float fresh = live * (1.0 - smoothstep(0.0, uLayerH * 2.4, depth));   // the newest layers are hot
  float warm = live * exp(-depth / (uLayerH * 10.0));
  float near = live * exp(-distance(vPos, uNozzle) * 10.0);
  col = mix(col, uHot * 1.3, clamp(fresh * 0.92 + near * 0.55, 0.0, 1.0));
  col += uHot * warm * 0.16;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const PLATE_VERT = /* glsl */ `
varying vec3 vPos;
void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vPos = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;

const PLATE_FRAG = /* glsl */ `
uniform float uDone; uniform vec3 uHot, uNozzle, uBarA, uBarB;   // bars: centre z, half width, half depth
varying vec3 vPos;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float contact(vec3 b) {
  float dx = max(abs(vPos.x) - b.y, 0.0), dz = max(abs(vPos.z - b.x) - b.z, 0.0);
  return exp(-dx * dx / 0.03) * exp(-dz * dz / 0.02);
}
void main() {
  float grain = hash(floor(vPos.xz * 700.0));
  vec2 gq = abs(fract(vPos.xz * 2.0) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.01, min(gq.x, gq.y));
  float fade = exp(-length(vPos.xz * vec2(0.42, 0.7)));
  vec3 col = vec3(0.0041, 0.0037, 0.0034) * (0.85 + 0.3 * grain) + vec3(0.022, 0.020, 0.018) * grid * fade;
  col *= 1.0 - 0.7 * max(contact(uBarA), contact(uBarB));
  col += uHot * 0.05 * (1.0 - uDone) * exp(-distance(vPos.xz, uNozzle.xz) * 2.6) * exp(-uNozzle.y * 1.2);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

const DEPTH = 0.34;      // letter thickness
const BAR_H = 0.23;      // base bar height: deep enough to hold the tail of the g
const BAR_X = 0.09;      // how far the bar runs past the first and last letter
const BAR_Z = 0.07;      // and past the front and back faces
const LIFT = 0.002;      // letters sit a hair above the bar top, so the two faces never fight
const ROW_GAP = 1.72;    // two rows: at 30 degrees the back row's baseline clears the front row's tallest letter

export function createPrint(host, { layers = 120, split = ['Enginerd'], onLayer } = {}) {
  const touch = matchMedia('(pointer: coarse)').matches;
  const renderer = new WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' });
  // adaptive resolution: start near the device ratio, step down when frames run slow, back up when there is room.
  // Never below 1x, so the letters never turn blocky.
  const maxDpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 1.75);
  const minDpr = Math.min(1, maxDpr);
  let dpr = maxDpr, slow = 0, quick = 0, ema = 16;
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(new Color('#0d0c0b'), 1);
  host.append(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(24, 1, 0.1, 80);
  const font = new FontLoader().parse(fontData);
  const word = split.join('');

  const uniforms = {
    uCut: { value: 0 }, uLayerH: { value: 1 / layers }, uDone: { value: 0 },
    uHot: { value: new Color('#ff6a1f') }, uInk: { value: new Color('#eeeae3') }, uDark: { value: new Color('#1b1815') },
    uLight: { value: new Vector3(-0.5, 0.72, 0.6).normalize() }, uNozzle: { value: new Vector3(0, -1, 0) },
  };
  const material = new ShaderMaterial({ uniforms, side: DoubleSide, vertexShader: VERT, fragmentShader: FRAG });

  const plateU = { uDone: uniforms.uDone, uHot: uniforms.uHot, uNozzle: uniforms.uNozzle, uBarA: { value: new Vector3() }, uBarB: { value: new Vector3() } };
  const plate = new Mesh(new PlaneGeometry(24, 16), new ShaderMaterial({ uniforms: plateU, vertexShader: PLATE_VERT, fragmentShader: PLATE_FRAG }));
  plate.rotation.x = -Math.PI / 2; plate.position.y = -0.0006;
  scene.add(plate);

  // ---- the part: one row ("wide") or two rows ("tall"), each on its own base bar. The first row is the back row.
  function build(rows) {
    const group = new Group(), bars = [], slices = [];
    let W = 0, H = 0;
    rows.forEach((text, r) => {
      const zc = (r - (rows.length - 1) / 2) * ROW_GAP;
      const geo = new TextGeometry(text, { font, size: 1, depth: DEPTH, curveSegments: touch ? 7 : 11, bevelEnabled: false });
      geo.computeBoundingBox();
      const bb = geo.boundingBox, w = bb.max.x - bb.min.x, ox = -(bb.min.x + w / 2), oy = BAR_H + LIFT;
      geo.translate(ox, oy, zc - DEPTH / 2);
      group.add(new Mesh(geo, material));
      const bar = { zc, hw: w / 2 + BAR_X, hd: DEPTH / 2 + BAR_Z };
      const barMesh = new Mesh(new BoxGeometry(bar.hw * 2, BAR_H, bar.hd * 2), material);
      barMesh.position.set(0, BAR_H / 2, zc);
      group.add(barMesh);
      bars.push(bar);
      // contours for slicing, in this row's own plane
      const contours = [];
      for (const s of font.generateShapes(text, 1)) {
        const { shape, holes } = s.extractPoints(14);
        contours.push(shape.map((p) => [p.x + ox, p.y + oy]));
        for (const h of holes) contours.push(h.map((p) => [p.x + ox, p.y + oy]));
      }
      slices.push({ contours, zf: zc + DEPTH / 2, zb: zc - DEPTH / 2 });
      W = Math.max(W, bar.hw * 2);
      H = Math.max(H, bb.max.y + oy);
    });
    return { group, bars, slices, W, H, box: new Box3().setFromObject(group) };
  }

  // ---- slicing: the real outline of each layer. The bar is one rectangle, the letters come from the glyph contours.
  function slice(y) {
    const pts = [];
    const loop = (x0, x1, zf, zb) => pts.push([x0, zf], [x1, zf], [x1, zb], [x0, zb], [x0, zf]);   // perimeter first
    if (y < BAR_H) {
      for (const b of part.bars) loop(-b.hw, b.hw, b.zc + b.hd, b.zc - b.hd);
    } else {
      for (const row of part.slices) {
        const xs = [];
        for (const c of row.contours) {
          for (let i = 0; i < c.length; i++) {
            const a = c[i], b = c[(i + 1) % c.length];
            if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
          }
        }
        xs.sort((p, q) => p - q);
        for (let i = 0; i + 1 < xs.length; i += 2) loop(xs[i], xs[i + 1], row.zf, row.zb);
      }
    }
    const len = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, len, total: len[len.length - 1] || 0 };
  }
  function pointOn(path, s) {
    if (!path.total) return null;
    s = ((s % path.total) + path.total) % path.total;
    let i = 1; while (i < path.len.length && path.len[i] < s) i++;
    const a = path.pts[i - 1], b = path.pts[Math.min(i, path.pts.length - 1)];
    const seg = path.len[i] - path.len[i - 1] || 1;
    const t = (s - path.len[i - 1]) / seg;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  // ---- the hot end
  const nozzle = new Group();
  const tip = new Mesh(new CylinderGeometry(0.006, 0.04, 0.07, 24), new MeshBasicMaterial({ color: '#4a4038' }));
  tip.position.y = 0.035; nozzle.add(tip);
  const block = new Mesh(new BoxGeometry(0.2, 0.09, 0.15), new MeshBasicMaterial({ color: '#1f1b18' }));
  block.position.y = 0.115; nozzle.add(block);
  const glow = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#ff6a1f', blending: AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.setScalar(0.24); nozzle.add(glow);
  scene.add(nozzle);

  // ---- state
  const st = { layer: -1, path: null, s: 0, done: false, park: 0, p: 0, px: 0, py: 0, tx: 0, ty: 0, dist: 10, t: 0 };
  const target = new Vector3(), parkAt = new Vector3();
  const parts = {};
  let part = null;

  function setLayer(layer) {
    layer = Math.max(0, Math.min(layers, layer));
    if (layer === st.layer) return;
    st.layer = layer;
    const done = layer >= layers;
    const layerH = part.H / layers;
    uniforms.uCut.value = done ? part.H + 1 : layer * layerH;
    if (!done) st.path = slice(Math.max(layer - 0.5, 0.5) * layerH);
    st.done = done;
    onLayer?.(layer, done);
  }

  function usePart(kind) {
    if (part?.kind === kind) return;
    if (part) scene.remove(part.group);
    part = parts[kind] ||= { kind, ...build(kind === 'tall' && split.length > 1 ? split : [word]) };
    scene.add(part.group);
    uniforms.uLayerH.value = part.H / layers;
    const a = part.bars[0], b = part.bars[part.bars.length - 1];
    plateU.uBarA.value.set(a.zc, a.hw, a.hd);
    plateU.uBarB.value.set(b.zc, b.hw, b.hd);
    const l = st.layer; st.layer = -1;
    if (l >= 0) setLayer(l);
  }

  // camera: scroll lifts it, the pointer leans it, and it drifts a little at rest.
  // Tall screens look down more, so the back row shows above the front row.
  function place(p, px, py, time) {
    const el = MathUtils.degToRad((part.kind === 'tall' ? 30 : 11) + p * 12 + py * 2.5);
    const az = MathUtils.degToRad(-7 + p * 12 + px * 4 + Math.sin(time * 0.17) * 0.8);
    target.set(0, part.H * (0.5 - p * 0.06), 0);
    camera.position.set(
      target.x + st.dist * Math.sin(az) * Math.cos(el),
      target.y + st.dist * Math.sin(el),
      target.z + st.dist * Math.cos(az) * Math.cos(el),
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }

  // the print's outline on screen, in NDC, from the corners of its bounding box
  const corner = new Vector3();
  function measure() {
    const { min, max } = part.box;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z).project(camera);
      x0 = Math.min(x0, corner.x); x1 = Math.max(x1, corner.x); y0 = Math.min(y0, corner.y); y1 = Math.max(y1, corner.y);
    }
    return { x0, x1, y0, y1 };
  }

  function frame() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    usePart(camera.aspect <= 0.8 ? 'tall' : 'wide');
    // fit: the share of the screen the print may fill, across and down
    const fitW = w < 640 ? 0.9 : w < 1024 ? 0.84 : 0.72;
    const fitH = part.kind === 'tall' ? 0.48 : 0.42;
    for (let k = 0; k < 3; k++) {
      place(0, 0, 0, 0);
      const b = measure();
      st.dist *= Math.max((b.x1 - b.x0) / 2 / fitW, (b.y1 - b.y0) / 2 / fitH);
    }
    place(0, 0, 0, 0);
    // centre the print across, and put it where the static name sits: 47% from the top on wide screens, 40% on tall ones
    const b = measure(), want = part.kind === 'tall' ? 0.2 : 0.06;
    camera.setViewOffset(w, h, ((b.x0 + b.x1) / 4) * w, ((want - (b.y0 + b.y1) / 2) / 2) * h, w, h);
    camera.updateProjectionMatrix();
  }
  frame();
  const ro = new ResizeObserver(frame); ro.observe(host);

  function adapt(dt) {
    if (!dt) return;
    ema += (dt * 1000 - ema) * 0.1;
    if (ema > 22) { slow++; quick = 0; } else if (ema < 12) { quick++; slow = 0; } else { slow = quick = 0; }
    if (slow > 20 && dpr > minDpr) { dpr = Math.max(minDpr, dpr * 0.8); renderer.setPixelRatio(dpr); frame(); slow = 0; }
    if (quick > 120 && dpr < maxDpr) { dpr = Math.min(maxDpr, dpr * 1.15); renderer.setPixelRatio(dpr); frame(); quick = 0; }
  }

  function tick(time, dt) {
    st.t = time;
    adapt(dt);
    // the nozzle traces the current layer, perimeter first; when the print is done it parks above the front row
    const live = uniforms.uDone.value < 1;
    if (!st.done && st.path) {
      st.s += dt * 1.9;
      const p = pointOn(st.path, st.s);
      if (p) nozzle.position.set(p[0], uniforms.uCut.value, p[1]);
      st.park = 0;
    } else {
      st.park = Math.min(1, st.park + dt * 0.8);
      const k = 1 - Math.pow(1 - st.park, 3);
      const fb = part.bars[part.bars.length - 1];
      parkAt.set(fb.hw + 0.3, part.H + 0.45 + Math.sin(time * 0.8) * 0.01, fb.zc);
      nozzle.position.lerp(parkAt, 0.06 * (0.5 + k));
    }
    uniforms.uNozzle.value.copy(nozzle.position);
    glow.material.opacity = live ? 0.9 + Math.sin(time * 9.0) * 0.08 : Math.max(0, glow.material.opacity - dt * 1.5);

    st.px += (st.tx - st.px) * 0.05; st.py += (st.ty - st.py) * 0.05;
    place(st.p, st.px, st.py, time);
    renderer.render(scene, camera);
  }

  return {
    layers, setLayer,
    setProgress(f) { setLayer(Math.round(MathUtils.clamp(f, 0, 1) * layers)); },
    setScroll(p) { st.p = p; },
    setPointer(x, y) { st.tx = x; st.ty = y; },
    get uniforms() { return uniforms; },
    tick, frame,
    render: () => tick(0, 0),
    dispose() {
      ro.disconnect();
      scene.traverse((o) => o.geometry?.dispose());
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}
