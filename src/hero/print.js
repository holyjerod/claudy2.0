// The signature: "Joshua" printed layer by layer on a build plate.
// One driver value (print fraction) controls the clip height, the hot layer, the nozzle path and the readout.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Mesh, ShaderMaterial, Color, Vector3, DoubleSide, PlaneGeometry,
  CylinderGeometry, BoxGeometry, MeshBasicMaterial, Group, SRGBColorSpace, Sprite, SpriteMaterial, CanvasTexture,
  AdditiveBlending, MathUtils,
} from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import fontData from './gloock-joshua.json';

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
uniform float uW, uDone; uniform vec3 uHot, uNozzle;
varying vec3 vPos;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  float grain = hash(floor(vPos.xz * 700.0));
  vec2 gq = abs(fract(vPos.xz * 2.0) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.01, min(gq.x, gq.y));
  float fade = exp(-length(vPos.xz * vec2(0.42, 0.7)));
  vec3 col = vec3(0.0041, 0.0037, 0.0034) * (0.85 + 0.3 * grain) + vec3(0.022, 0.020, 0.018) * grid * fade;
  float sh = exp(-pow(vPos.z / 0.34, 2.0)) * (1.0 - smoothstep(uW * 0.5, uW * 0.5 + 0.3, abs(vPos.x)));
  col *= 1.0 - 0.7 * sh;
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

export function createPrint(host, { layers = 120, onLayer } = {}) {
  const touch = matchMedia('(pointer: coarse)').matches;
  const renderer = new WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' });
  // adaptive resolution: start near the device ratio, step down when frames run slow, back up when there is room
  const maxDpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 1.75);
  let dpr = maxDpr, slow = 0, quick = 0, ema = 16;
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(new Color('#0d0c0b'), 1);
  host.append(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(24, 1, 0.1, 80);

  // ---- the part
  const font = new FontLoader().parse(fontData);
  const DEPTH = 0.34;
  const geo = new TextGeometry('Joshua', { font, size: 1, depth: DEPTH, curveSegments: touch ? 7 : 11, bevelEnabled: false });
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const W = bb.max.x - bb.min.x, H = bb.max.y - bb.min.y;
  const ox = -(bb.min.x + W / 2), oy = -bb.min.y, oz = -DEPTH / 2;
  geo.translate(ox, oy, oz);
  const layerH = H / layers;

  const uniforms = {
    uCut: { value: 0 }, uLayerH: { value: layerH }, uDone: { value: 0 },
    uHot: { value: new Color('#ff6a1f') }, uInk: { value: new Color('#eeeae3') }, uDark: { value: new Color('#1b1815') },
    uLight: { value: new Vector3(-0.5, 0.72, 0.6).normalize() }, uNozzle: { value: new Vector3(0, -1, 0) },
  };
  scene.add(new Mesh(geo, new ShaderMaterial({ uniforms, side: DoubleSide, vertexShader: VERT, fragmentShader: FRAG })));

  const plate = new Mesh(new PlaneGeometry(16, 9), new ShaderMaterial({
    uniforms: { uW: { value: W }, uDone: uniforms.uDone, uHot: uniforms.uHot, uNozzle: uniforms.uNozzle },
    vertexShader: PLATE_VERT, fragmentShader: PLATE_FRAG,
  }));
  plate.rotation.x = -Math.PI / 2; plate.position.y = -0.0006;
  scene.add(plate);

  // ---- the hot end
  const nozzle = new Group();
  const tip = new Mesh(new CylinderGeometry(0.006, 0.04, 0.07, 24), new MeshBasicMaterial({ color: '#4a4038' }));
  tip.position.y = 0.035; nozzle.add(tip);
  const block = new Mesh(new BoxGeometry(0.2, 0.09, 0.15), new MeshBasicMaterial({ color: '#1f1b18' }));
  block.position.y = 0.115; nozzle.add(block);
  const glow = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#ff6a1f', blending: AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.setScalar(0.24); nozzle.add(glow);
  scene.add(nozzle);

  // ---- slicing: the real outline of each layer, from the glyph contours
  const contours = [];
  for (const s of font.generateShapes('Joshua', 1)) {
    const { shape, holes } = s.extractPoints(14);
    contours.push(shape.map((p) => [p.x + ox, p.y + oy]));
    for (const h of holes) contours.push(h.map((p) => [p.x + ox, p.y + oy]));
  }
  function slice(y) {
    const xs = [];
    for (const c of contours) {
      for (let i = 0; i < c.length; i++) {
        const a = c[i], b = c[(i + 1) % c.length];
        if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
    }
    xs.sort((p, q) => p - q);
    const pts = [];
    const zf = DEPTH / 2, zb = -DEPTH / 2;
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = xs[i], x1 = xs[i + 1];
      pts.push([x0, zf], [x1, zf], [x1, zb], [x0, zb], [x0, zf]);   // perimeter first
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

  // ---- state
  const st = { layer: -1, path: null, s: 0, done: false, park: 0, p: 0, px: 0, py: 0, tx: 0, ty: 0, dist: 8, t: 0 };
  const target = new Vector3();

  function setLayer(layer) {
    layer = Math.max(0, Math.min(layers, layer));
    if (layer === st.layer) return;
    st.layer = layer;
    const done = layer >= layers;
    uniforms.uCut.value = done ? H + 1 : layer * layerH;
    if (!done) st.path = slice(Math.max(layer - 0.5, 0.5) * layerH);
    if (done !== st.done) st.done = done;
    onLayer?.(layer, done);
  }

  function frame() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fit = w < 640 ? 0.92 : w < 1024 ? 0.84 : 0.72;
    const tanV = Math.tan(MathUtils.degToRad(camera.fov / 2));
    st.dist = Math.max((W / fit) / (2 * tanV * camera.aspect), (H / 0.42) / (2 * tanV));
    camera.updateProjectionMatrix();
  }
  frame();
  const ro = new ResizeObserver(frame); ro.observe(host);

  function adapt(dt) {
    if (!dt) return;
    ema += (dt * 1000 - ema) * 0.1;
    if (ema > 22) { slow++; quick = 0; } else if (ema < 12) { quick++; slow = 0; } else { slow = quick = 0; }
    if (slow > 20 && dpr > 0.5) { dpr = Math.max(0.5, dpr * 0.8); renderer.setPixelRatio(dpr); frame(); slow = 0; }
    if (quick > 120 && dpr < maxDpr) { dpr = Math.min(maxDpr, dpr * 1.15); renderer.setPixelRatio(dpr); frame(); quick = 0; }
  }

  function tick(time, dt) {
    st.t = time;
    adapt(dt);
    // the nozzle traces the current layer, perimeter first; when the print is done it parks
    const live = uniforms.uDone.value < 1;
    if (!st.done && st.path) {
      st.s += dt * 1.9;
      const p = pointOn(st.path, st.s);
      if (p) nozzle.position.set(p[0], uniforms.uCut.value, p[1]);
      st.park = 0;
    } else {
      st.park = Math.min(1, st.park + dt * 0.8);
      const k = 1 - Math.pow(1 - st.park, 3);
      nozzle.position.lerp(new Vector3(W * 0.5 + 0.35, H + 0.45 + Math.sin(time * 0.8) * 0.01, 0), 0.06 * (0.5 + k));
    }
    uniforms.uNozzle.value.copy(nozzle.position);
    glow.material.opacity = live ? 0.9 + Math.sin(time * 9.0) * 0.08 : Math.max(0, glow.material.opacity - dt * 1.5);

    // camera: scroll lifts it, the pointer leans it, and it drifts a little at rest
    st.px += (st.tx - st.px) * 0.05; st.py += (st.ty - st.py) * 0.05;
    // portrait phones look down at the plate more, so the name sits higher and the plate fills the screen
    const tall = camera.aspect < 0.8;
    const el = MathUtils.degToRad((tall ? 24 : 11) + st.p * 12 + st.py * 2.5);
    const az = MathUtils.degToRad(-7 + st.p * 12 + st.px * 4 + Math.sin(time * 0.17) * 0.8);
    target.set(0, H * ((tall ? 0.05 : 0.36) - st.p * 0.06), tall ? 0.35 : 0);
    camera.position.set(
      target.x + st.dist * Math.sin(az) * Math.cos(el),
      target.y + st.dist * Math.sin(el),
      target.z + st.dist * Math.cos(az) * Math.cos(el),
    );
    camera.lookAt(target);
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
    dispose() { ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
