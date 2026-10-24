"use client";

import { useEffect, useRef } from "react";

/**
 * Effect for the hero image (no reduced-motion). Desktop with a mouse: it plays on hover. Touch devices (and narrow
 * windows, where the image is the full-bleed hero background): it plays on tap, and another tap puts it away.
 * What it does: the image shatters from the cursor
 * into glass shards that fly around the page, snap together into a sphere and spin on its axis. After half a turn
 * the same surface morphs (vertex by vertex, so the picture stays glued on) into a cube, then a tetrahedron, then an
 * octahedron, then a sphere again, looping while the pointer stays on the image. Moving the pointer
 * off the image plays the whole thing in reverse. One timeline value T drives every shard, so reversing is exact.
 *
 * ponytail: no three.js, no new dependency. Desktop draws an affine texture per triangle on a plain 2D canvas (~840
 * triangles, fine with a GPU-backed 2D canvas). Phones draw the triangles with a tiny WebGL program instead: iOS Safari
 * crawls on ~1500 clip()+drawImage() calls per frame. The 2D canvas still draws the overlays (shadow, rim, tag) on top,
 * and is the fallback when WebGL is missing. Ceiling: affine texturing, edge glints are shader-side only.
 */

const COLS = 16;
const ROWS = 22;
// Shard irregularity as a fraction of a cell. The solids are mapped from the un-jittered lattice, so this is also how much
// the picture is warped on the orb: more looks more like glass, less keeps straight edges straight.
const JITTER = 0.3;
const ROWS_TOUCH = 16; // lighter mesh on phones
const COPIES = 3; // the image is wrapped around the sphere this many times, which keeps its proportions sane
const T_EXPLODE = 0.75; // per-shard travel time
const T_HOLD = 1.7; // gathering starts here
const T_GATHER = 0.9;
const T_END = 2.9;
const FOCAL = 1200;
const SPIN = 1.0; // rad/s around the axis (about 10 rpm, gentle on the eyes)
const HOLD_SHAPE = Math.PI / SPIN; // half a turn per shape
const MORPH = 1.6;
// Shapes as convex solids {x : n.x <= h}; a surface point is the sphere direction projected radially onto the solid.
// h is the inradius (as a fraction of the orb radius), tuned so every shape has a similar visual size.
const r3 = (x: number, y: number, z: number) => { const l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; };
const signs = [-1, 1];
const SHAPES: { h: number; n: number[][] }[] = [
  { h: 1, n: [] }, // sphere
  { h: 0.72, n: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] }, // cube
  { h: 0.42, n: [r3(1, 1, 1), r3(1, -1, -1), r3(-1, 1, -1), r3(-1, -1, 1)] }, // tetrahedron
  { h: 0.75, n: signs.flatMap((a) => signs.flatMap((b) => signs.map((c) => r3(a, b, c)))) }, // octahedron
];
const radii = (d: number[]) =>
  SHAPES.map(({ h, n }) => (n.length ? h / Math.max(...n.map((v) => v[0] * d[0] + v[1] * d[1] + v[2] * d[2])) : h));
const LIGHT = (() => {
  const l = [-0.35, -0.45, 0.82];
  const n = Math.hypot(l[0], l[1], l[2]);
  return l.map((v) => v / n);
})();

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2);

type Inst = {
  copy: number;
  sx: number[]; sy: number[]; // flat triangle in image space (css px)
  lx: number[]; ly: number[]; // flat triangle relative to its centroid
  fc: [number, number]; // flat centroid relative to the image centre
  sc: [number, number, number]; // scattered centre
  axis: [number, number, number];
  th0: number; om: number; ph: number;
  d: number; gd: number; // explode / gather delays
  dir: number[][]; // unit-sphere direction per vertex
  rad: number[][]; // radius per vertex for each shape
  flat: number; // sign of the flat winding
  box: [number, number, number, number]; // source bbox
  // per-frame output
  px: number[]; py: number[]; z: number; alpha: number; dark: number; edge: number; skip: boolean;
};

function build(w: number, h: number, ox: number, oy: number, vw: number, vh: number, left: number, top: number, rows: number) {
  const gx = w / COLS, gy = h / rows;
  const pts: [number, number, number, number][] = []; // jittered x,y (shard shapes) + regular-lattice x,y (solid mapping)
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= COLS; i++) {
      let x = i * gx, y = j * gy;
      if (i > 0 && i < COLS) x += (Math.random() - 0.5) * gx * JITTER;
      if (j > 0 && j < rows) y += (Math.random() - 0.5) * gy * JITTER;
      pts.push([x, y, i * gx, j * gy]);
    }
  const at = (i: number, j: number) => pts[j * (COLS + 1) + i];
  const tris: [number, number, number, number][][] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < COLS; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
      if (Math.random() < 0.5) tris.push([a, b, d], [a, d, c]);
      else tris.push([a, b, c], [b, d, c]);
    }
  const maxDist = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy));
  const insts: Inst[] = [];
  for (let copy = 0; copy < COPIES; copy++)
    for (const t of tris) {
      const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
      const dist = Math.hypot(cx - ox, cy - oy);
      const ang = Math.atan2(cy - oy, cx - ox) + (Math.random() - 0.5) * 0.9;
      const throwD = 150 + Math.random() * 1100;
      // Scatter target: thrown away from the cursor, then reflected back into the viewport (not clamped, which piles shards on the edges)
      const fold = (v: number, min: number, max: number) => {
        const range = max - min, m = (((v - min) % (2 * range)) + 2 * range) % (2 * range);
        return min + (m <= range ? m : 2 * range - m);
      };
      const sx = fold(cx - w / 2 + Math.cos(ang) * throwD, -left - w / 2 + 30, vw - left - w / 2 - 30);
      const sy = fold(cy - h / 2 + Math.sin(ang) * throwD, -top - h / 2 + 30, vh - top - h / 2 - 30);
      let ax = Math.random() - 0.5, ay = Math.random() - 0.5, az = Math.random() - 0.5;
      const al = Math.hypot(ax, ay, az) || 1; ax /= al; ay /= al; az /= al;
      const xs = t.map((p) => p[0]), ys = t.map((p) => p[1]);
      const x0 = Math.max(0, Math.floor(Math.min(...xs)) - 1), y0 = Math.max(0, Math.floor(Math.min(...ys)) - 1);
      const x1 = Math.min(w, Math.ceil(Math.max(...xs)) + 1), y1 = Math.min(h, Math.ceil(Math.max(...ys)) + 1);
      // The solids are mapped from the un-jittered lattice so their edges stay crisp; the texture is simply warped
      // by the (small) jitter, which is invisible but keeps cube and pyramid edges straight.
      const dirs = t.map((p) => {
        const lon = ((copy + p[2] / w) / COPIES) * Math.PI * 2, lat = (p[3] / h - 0.5) * Math.PI;
        return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
      });
      insts.push({
        copy, sx: xs, sy: ys, lx: xs.map((x) => x - cx), ly: ys.map((y) => y - cy),
        fc: [cx - w / 2, cy - h / 2],
        sc: [sx, sy, (Math.random() - 0.5) * 700],
        axis: [ax, ay, az], th0: (Math.random() - 0.5) * 6, om: (Math.random() - 0.5) * 3, ph: Math.random() * 6.28,
        d: (dist / maxDist) * 0.35, gd: Math.random() * 0.3,
        dir: dirs,
        rad: dirs.map(radii),
        flat: Math.sign((xs[1] - xs[0]) * (ys[2] - ys[0]) - (ys[1] - ys[0]) * (xs[2] - xs[0])) || 1,
        box: [x0, y0, x1 - x0, y1 - y0],
        px: [0, 0, 0], py: [0, 0, 0], z: 0, alpha: 1, dark: 0, edge: 0, skip: false,
      });
    }
  return insts;
}

const VERT = `attribute vec2 p;attribute vec2 u;attribute vec3 c;attribute vec3 b;uniform vec2 r;
varying vec2 vu;varying vec3 vc;varying vec3 vb;
void main(){gl_Position=vec4(p.x/r.x*2.-1.,1.-p.y/r.y*2.,0.,1.);vu=u;vc=c;vb=b;}`;
// c = (darkness, alpha, edge glint); b = barycentric coords, so min(b) is the distance to the nearest triangle edge
const FRAG = `precision highp float;uniform sampler2D t;varying vec2 vu;varying vec3 vc;varying vec3 vb;
void main(){vec3 s=texture2D(t,vu).rgb*(1.-vc.x);float m=min(vb.x,min(vb.y,vb.z));
s=mix(s,vec3(1.),(1.-smoothstep(0.,.07,m))*vc.z*.4);gl_FragColor=vec4(s*vc.y,vc.y);}`;

/** Uploads the texture and returns a draw(vertices, count, viewportW, viewportH) fn (10 floats per vertex), or null. */
function makeGL(gl: WebGLRenderingContext, tex: HTMLCanvasElement) {
  const pr = gl.createProgram()!;
  for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]] as const) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src); gl.compileShader(sh); gl.attachShader(pr, sh);
  }
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // required for non-power-of-two textures
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  [["p", 2, 0], ["u", 2, 8], ["c", 3, 16], ["b", 3, 28]].forEach(([n, size, off]) => {
    const loc = gl.getAttribLocation(pr, n as string);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size as number, gl.FLOAT, false, 40, off as number);
  });
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied
  const r = gl.getUniformLocation(pr, "r");
  return (buf: Float32Array, n: number, vw: number, vh: number) => {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(r, vw, vh);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bufferData(gl.ARRAY_BUFFER, buf, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  };
}

export function Shatter({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    let canvas: HTMLCanvasElement | null = null, glCanvas: HTMLCanvasElement | null = null;
    let raf = 0, dwell = 0;
    let active = false, dir = 1, T = 0, clock = 0, spin = 0, shapeClock = 0;
    let ptr = { x: 0, y: 0 };
    let shiftEl: HTMLElement | null = null, shiftPx = 0; // name block that slides below the orb on small screens

    const hoverMode = () => matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches;
    const enabled = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let down: { x: number; y: number; t: number } | null = null;
    const monoFont = () => getComputedStyle(wrap!).getPropertyValue("--font-mono").trim() || "ui-monospace, Menlo, monospace";

    function end() {
      cancelAnimationFrame(raf);
      canvas?.remove();
      canvas = null;
      glCanvas?.getContext("webgl")?.getExtension("WEBGL_lose_context")?.loseContext();
      glCanvas?.remove();
      glCanvas = null;
      wrap!.style.visibility = "";
      if (shiftEl) shiftEl.style.transform = "";
      shiftEl = null;
      active = false;
      T = 0;
    }

    function start() {
      dwell = 0;
      const img = wrap!.querySelector("img");
      if (active || !enabled() || !img || !img.complete || !img.naturalWidth) return;
      const r = wrap!.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      const tapMode = !hoverMode();
      const vw = innerWidth, vh = innerHeight;
      glCanvas = tapMode ? document.createElement("canvas") : null;
      const glx = glCanvas?.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true }) ?? null;
      const dpr = Math.min(glx ? 2 : tapMode ? 1.5 : 2, devicePixelRatio || 1);

      // Texture: the image as it is displayed (object-fit: cover), at device resolution
      const tex = document.createElement("canvas");
      tex.width = w * dpr; tex.height = h * dpr;
      const tc = tex.getContext("2d")!;
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      tc.drawImage(img, ((w - dw) / 2) * dpr, ((h - dh) / 2) * dpr, dw * dpr, dh * dpr);

      const draw = glx && makeGL(glx, tex);
      const insts = build(w, h, ptr.x, ptr.y, vw, vh, r.left, r.top, tapMode ? ROWS_TOUCH : ROWS);
      // Size in px from innerWidth/innerHeight, not 100vw/100vh: on iOS 100vh is taller than the visible area, which stretched the orb into an egg
      const layer = { position: "fixed", left: "0", top: "0", width: `${vw}px`, height: `${vh}px`, pointerEvents: "none", zIndex: "60" };
      if (glCanvas && draw) {
        glCanvas.width = vw * dpr; glCanvas.height = vh * dpr;
        Object.assign(glCanvas.style, layer);
        document.body.appendChild(glCanvas); // before the overlay canvas, so the overlay draws on top
      }
      canvas = document.createElement("canvas");
      canvas.width = vw * dpr; canvas.height = vh * dpr;
      Object.assign(canvas.style, layer);
      document.body.appendChild(canvas);
      const buf = new Float32Array(insts.length * 30);
      const ctx = canvas.getContext("2d")!;
      // Full-bleed hero (below lg): the orb moves to the top of the hero and the name block slides down beneath it
      const overlay = !matchMedia("(min-width: 1024px)").matches;
      // Phones split the hero in half: the orb (with its tag above and shadow below) lives in the top half, the name block
      // slides down so it starts just below the middle, with a clear gap in between. Desktop: orb in the image column.
      const section = wrap!.closest("section");
      let zoneTop = 0, zoneBottom = 0;
      if (overlay && section) {
        const block = section.querySelector<HTMLElement>("[data-orb-shift]");
        const ps = block?.querySelectorAll("p");
        const icons = section.querySelector<HTMLElement>("[data-orb-icons]");
        const coords = block?.previousElementSibling as HTMLElement | null; // location row at the top
        if (block && ps && ps.length && coords) {
          const top = ps[0].getBoundingClientRect().top - r.top, bottom = ps[ps.length - 1].getBoundingClientRect().bottom - r.top;
          const room = icons ? icons.getBoundingClientRect().top - r.top - 12 - bottom : Infinity;
          shiftPx = Math.max(0, Math.min(h * 0.5 + 28 - top, room)); // name block starts just under the middle, unless the icon row is in the way
          shiftEl = block;
          zoneTop = coords.getBoundingClientRect().bottom - r.top + 10;
          zoneBottom = top + shiftPx - 24; // 24px of air between the orb's shadow and the name
          // Inline styles on purpose: they don't depend on any stylesheet being up to date
          block.style.transition = "transform 900ms cubic-bezier(0.2, 0.7, 0.2, 1)";
        }
      }
      const zoned = zoneBottom - zoneTop > 120;
      // tag (1.5R above the centre) + orb + shadow (1.5R below) must fit the zone
      const R = zoned ? Math.min((zoneBottom - zoneTop) / 3, w * 0.34) : Math.min(w, h) * (overlay ? 0.3 : 0.37);
      const soff = zoned ? (zoneTop + zoneBottom) / 2 - h / 2 : overlay ? 64 + R * 1.55 - h / 2 : -h * 0.14; // offset of the orb from the image centre; desktop sits a little high so it clears the text and panels
      active = true; dir = 1; T = 0; spin = 0; shapeClock = 0;
      wrap!.style.visibility = "hidden";
      const font = `500 11px ${monoFont()}`;
      let last = performance.now();

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now; clock += dt;
        T = Math.min(T_END, T + dir * dt * (dir > 0 ? 1 : 1.5));
        const rr = wrap!.getBoundingClientRect();
        if ((dir < 0 && T <= 0) || Math.abs(rr.width - w) > 2 || rr.bottom < 0 || rr.top > vh) return end();
        const cx = rr.left + rr.width / 2, cy = rr.top + rr.height / 2, ocy = cy + soff;
        if (shiftEl) shiftEl.style.transform = dir > 0 ? `translateY(${shiftPx}px)` : "";

        spin += SPIN * dt;
        if (T >= T_END) shapeClock += dt; // the shape sequence only advances while the orb is fully formed
        const seg = HOLD_SHAPE + MORPH, k = Math.floor(shapeClock / seg), loc = shapeClock - k * seg;
        const from = k % SHAPES.length, to = (k + 1) % SHAPES.length;
        const mx0 = clamp01((loc - HOLD_SHAPE) / MORPH);
        const morph = mx0 < 0.5 ? 4 * mx0 ** 3 : 1 - Math.pow(-2 * mx0 + 2, 3) / 2;
        const pulse = 1 + 0.1 * Math.sin(Math.PI * morph);
        const roundness = (from === 0 ? 1 - morph : 0) + (to === 0 ? morph : 0);
        const cs = Math.cos(spin), sn = Math.sin(spin), tilt = 0.3 + 0.2 * Math.sin(clock * 0.7), ct = Math.cos(tilt), st = Math.sin(tilt);
        let gSum = 0;
        for (const q of insts) {
          const e = easeOut(clamp01((T - q.d) / T_EXPLODE));
          const g = easeInOut(clamp01((T - T_HOLD - q.gd) / T_GATHER));
          gSum += g;
          const th = q.th0 * e + q.om * clamp01((T - 1.1) / 3) * 3 * e;
          const c = Math.cos(th), sI = Math.sin(th), [kx, ky, kz] = q.axis;
          const mx = q.fc[0] + (q.sc[0] - q.fc[0]) * e + Math.sin(clock * 0.9 + q.ph) * 12 * e;
          const my = q.fc[1] + (q.sc[1] - q.fc[1]) * e + Math.cos(clock * 0.8 + q.ph) * 12 * e;
          const mz = q.sc[2] * e;
          const V: number[][] = [];
          for (let i = 0; i < 3; i++) {
            // Rodrigues rotation of the shard-local vertex, then to the sphere
            const vx = q.lx[i], vy = q.ly[i], vz = 0;
            const dot = kx * vx + ky * vy + kz * vz;
            const rx = vx * c + (ky * vz - kz * vy) * sI + kx * dot * (1 - c);
            const ry = vy * c + (kz * vx - kx * vz) * sI + ky * dot * (1 - c);
            const rz = vz * c + (kx * vy - ky * vx) * sI + kz * dot * (1 - c);
            const [ux, uy, uz] = q.dir[i];
            const rad = (q.rad[i][from] * (1 - morph) + q.rad[i][to] * morph) * R * pulse;
            const x1 = (ux * cs + uz * sn) * rad, z1 = (-ux * sn + uz * cs) * rad, y1 = uy * rad;
            const sy2 = y1 * ct - z1 * st + soff, sz2 = y1 * st + z1 * ct;
            V.push([mx + rx + (x1 - mx - rx) * g, my + ry + (sy2 - my - ry) * g, mz + rz + (sz2 - mz - rz) * g]);
          }
          const nx = (V[1][1] - V[0][1]) * (V[2][2] - V[0][2]) - (V[1][2] - V[0][2]) * (V[2][1] - V[0][1]);
          const ny = (V[1][2] - V[0][2]) * (V[2][0] - V[0][0]) - (V[1][0] - V[0][0]) * (V[2][2] - V[0][2]);
          const nz = ((V[1][0] - V[0][0]) * (V[2][1] - V[0][1]) - (V[1][1] - V[0][1]) * (V[2][0] - V[0][0])) * q.flat;
          const nl = Math.hypot(nx, ny, nz) || 1;
          const nd = [nx * q.flat / nl, ny * q.flat / nl, nz / nl];
          const lit = nd[0] * LIGHT[0] + nd[1] * LIGHT[1] + nd[2] * LIGHT[2];
          q.dark = (0.3 * (1 - Math.abs(lit))) * (1 - g) + 0.4 * (1 - lit) * g;
          q.edge = e * (1 - g);
          q.alpha = q.copy === 0 ? 1 : clamp01(e * 3);
          q.skip = q.alpha < 0.01 || (g > 0.97 && nd[2] < 0);
          q.z = (V[0][2] + V[1][2] + V[2][2]) / 3;
          for (let i = 0; i < 3; i++) {
            const k = FOCAL / (FOCAL - V[i][2]);
            q.px[i] = cx + V[i][0] * k;
            q.py[i] = cy + soff * g + (V[i][1] - soff * g) * k; // perspective around the orb centre as it forms
          }
        }
        const sphere = clamp01(gSum / insts.length); // how assembled the orb is

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);
        if (sphere > 0.01) {
          // soft ground shadow under the orb
          ctx.save();
          ctx.globalAlpha = sphere ** 2 * 0.45;
          ctx.translate(cx, ocy + R * 1.3); ctx.scale(1, 0.18);
          const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
          sg.addColorStop(0, "rgba(0,0,0,0.8)"); sg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
          ctx.restore();
        }
        // flash at the impact point, fading as the first shards leave
        const ft = 1 - T / 0.4;
        if (ft > 0) {
          const ix = rr.left + ptr.x, iy = rr.top + ptr.y;
          const fg = ctx.createRadialGradient(ix, iy, 0, ix, iy, 140);
          fg.addColorStop(0, `rgba(255,255,255,${0.55 * ft})`); fg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = fg; ctx.fillRect(ix - 140, iy - 140, 280, 280);
        }

        insts.sort((a, b) => a.z - b.z);
        if (draw) {
          let o = 0;
          for (const q of insts) {
            if (q.skip) continue;
            const mx = (q.px[0] + q.px[1] + q.px[2]) / 3, my = (q.py[0] + q.py[1] + q.py[2]) / 3;
            for (let i = 0; i < 3; i++) {
              const vx = q.px[i] - mx, vy = q.py[i] - my, l = Math.hypot(vx, vy) || 1;
              buf[o++] = q.px[i] + (vx / l) * 0.7; buf[o++] = q.py[i] + (vy / l) * 0.7; // pushed out so neighbours overlap, no seams
              buf[o++] = q.sx[i] / w; buf[o++] = q.sy[i] / h;
              buf[o++] = q.dark; buf[o++] = q.alpha; buf[o++] = q.edge;
              buf[o++] = i === 0 ? 1 : 0; buf[o++] = i === 1 ? 1 : 0; buf[o++] = i === 2 ? 1 : 0;
            }
          }
          draw(buf, o / 10, vw, vh);
        }
        for (const q of insts) {
          if (draw || q.skip) continue;
          const [s0x, s0y] = [q.sx[0], q.sy[0]];
          const det = (q.sx[1] - s0x) * (q.sy[2] - s0y) - (q.sx[2] - s0x) * (q.sy[1] - s0y);
          if (Math.abs(det) < 1e-6) continue;
          const dx1 = q.px[1] - q.px[0], dy1 = q.py[1] - q.py[0], dx2 = q.px[2] - q.px[0], dy2 = q.py[2] - q.py[0];
          const sx1 = q.sx[1] - s0x, sy1 = q.sy[1] - s0y, sx2 = q.sx[2] - s0x, sy2 = q.sy[2] - s0y;
          const a = (dx1 * sy2 - dx2 * sy1) / det, b = (dy1 * sy2 - dy2 * sy1) / det;
          const cc = (dx2 * sx1 - dx1 * sx2) / det, d = (dy2 * sx1 - dy1 * sx2) / det;
          const e = q.px[0] - a * s0x - cc * s0y, f = q.py[0] - b * s0x - d * s0y;

          // Destination triangle, pushed out 0.7px so neighbouring facets overlap instead of leaving seams
          const mx = (q.px[0] + q.px[1] + q.px[2]) / 3, my = (q.py[0] + q.py[1] + q.py[2]) / 3;
          ctx.save();
          ctx.globalAlpha = q.alpha;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const vx = q.px[i] - mx, vy = q.py[i] - my, l = Math.hypot(vx, vy) || 1;
            const X = q.px[i] + (vx / l) * 0.7, Y = q.py[i] + (vy / l) * 0.7;
            if (i) ctx.lineTo(X, Y);
            else ctx.moveTo(X, Y);
          }
          ctx.closePath();
          ctx.clip();
          ctx.setTransform(dpr * a, dpr * b, dpr * cc, dpr * d, dpr * e, dpr * f);
          const [bx, by, bw, bh] = q.box;
          ctx.drawImage(tex, bx * dpr, by * dpr, bw * dpr, bh * dpr, bx, by, bw, bh);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          if (q.dark > 0.005) {
            ctx.fillStyle = `rgba(0,0,0,${q.dark})`;
            ctx.fill();
          }
          if (q.edge > 0.02) {
            ctx.strokeStyle = `rgba(255,255,255,${0.4 * q.edge})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          ctx.restore();
        }

        if (sphere > 0.6 && roundness > 0.05) {
          // rim darkening and a specular highlight over the finished orb
          ctx.save();
          ctx.globalAlpha = (clamp01((sphere - 0.6) / 0.4) * roundness) ** 2;
          ctx.beginPath(); ctx.arc(cx, ocy, R * 1.03, 0, 7); ctx.clip();
          const rim = ctx.createRadialGradient(cx, ocy, R * 0.5, cx, ocy, R * 1.03);
          rim.addColorStop(0, "rgba(0,0,0,0)"); rim.addColorStop(1, "rgba(0,0,0,0.5)");
          ctx.fillStyle = rim; ctx.fillRect(cx - R * 1.1, ocy - R * 1.1, R * 2.2, R * 2.2);
          const hi = ctx.createRadialGradient(cx - R * 0.38, ocy - R * 0.42, 0, cx - R * 0.38, ocy - R * 0.42, R * 0.75);
          hi.addColorStop(0, "rgba(255,255,255,0.3)"); hi.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = hi; ctx.fillRect(cx - R * 1.1, ocy - R * 1.1, R * 2.2, R * 2.2);
          ctx.restore();
        }

        const tagA = clamp01((sphere - 0.85) / 0.15);
        if (tagA > 0.01) {
          // Small floating tag above the object
          const label = "CLAUDE BLOODED";
          const c2 = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
          ctx.save();
          ctx.globalAlpha = tagA;
          ctx.font = font;
          c2.letterSpacing = "1.5px";
          const tw = ctx.measureText(label).width, bw = tw + 38, bh = 26;
          const tx = cx - bw / 2, ty = Math.max(16, ocy - R * 1.5 + Math.sin(clock * 1.6) * 3);
          ctx.strokeStyle = "rgba(240,100,40,0.8)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx, ty + bh); ctx.lineTo(cx, Math.max(ty + bh + 8, ocy - R * 1.25)); ctx.stroke();
          ctx.fillStyle = "rgba(17,17,17,0.92)";
          ctx.beginPath(); ctx.rect(tx, ty, bw, bh); ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.stroke();
          ctx.fillStyle = "#f06428"; ctx.fillRect(tx + 11, ty + bh / 2 - 3, 6, 6);
          ctx.fillStyle = "#f5f3ed"; ctx.textBaseline = "middle";
          ctx.fillText(label, tx + 24, ty + bh / 2 + 0.5);
          ctx.restore();
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType !== "mouse" || !hoverMode()) return;
      const r = wrap.getBoundingClientRect();
      const inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
      if (inside) {
        if (!active) ptr = { x: ev.clientX - r.left, y: ev.clientY - r.top };
        if (active) dir = 1;
        else if (!dwell) dwell = window.setTimeout(start, 120); // short dwell so a pass-through doesn't trigger it
      } else {
        clearTimeout(dwell); dwell = 0;
        if (active) dir = -1;
      }
    };
    const onLeaveDoc = () => { clearTimeout(dwell); dwell = 0; if (active && hoverMode()) dir = -1; };
    // Tap mode: a tap (not a scroll or drag) on the hero starts it; any later tap toggles it back
    const onDown = (ev: PointerEvent) => { down = { x: ev.clientX, y: ev.clientY, t: performance.now() }; };
    const onUp = (ev: PointerEvent) => {
      const d = down; down = null;
      if (hoverMode() || !d || Math.hypot(ev.clientX - d.x, ev.clientY - d.y) > 10 || performance.now() - d.t > 600) return;
      if ((ev.target as Element).closest?.("a, button, input, textarea")) return;
      if (active) { dir = dir > 0 ? -1 : 1; return; }
      const r = wrap.getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return;
      ptr = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      start();
    };
    const onCancel = () => { down = null; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onCancel, { passive: true });
    document.addEventListener("mouseleave", onLeaveDoc);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      document.removeEventListener("mouseleave", onLeaveDoc);
      clearTimeout(dwell);
      end();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
