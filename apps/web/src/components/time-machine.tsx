"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { DeLoreanIcon } from "./icons";

type Three = typeof THREE_NS;

const HOVER_HEIGHT = 0.72; // body underside above the ground, in car units (the car is ~4.2 long)
const BOB = 0.035;
const SECONDS_PER_TURN = 26;
const NEON = 0x3fb8ff;

// Side profiles (x: front → back, y: up), extruded across the car's width
function profile(THREE: Three, points: [number, number][]) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  for (const p of points.slice(1)) shape.lineTo(...p);
  shape.closePath();
  return shape;
}

function extrude(THREE: Three, shape: THREE_NS.Shape, width: number, bevel = 0.035) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 4,
  });
  geometry.translate(0, 0, -width / 2);
  return geometry;
}

function glowTexture(THREE: Three) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(63, 184, 255, 1)");
  gradient.addColorStop(0.45, "rgba(63, 184, 255, 0.55)");
  gradient.addColorStop(1, "rgba(63, 184, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Soft contact shadow: dark in the middle, fading out
function shadowTexture(THREE: Three) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.95)");
  gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.6)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

/** A DMC-12 time machine in hover mode: wheels folded flat, neon underneath. */
function buildDeLorean(THREE: Three) {
  const car = new THREE.Group();

  const stainless = new THREE.MeshPhysicalMaterial({ color: 0xd6d9de, metalness: 1, roughness: 0.34, envMapIntensity: 1.15 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x06090d, metalness: 0.4, roughness: 0.04, clearcoat: 1, envMapIntensity: 1.4 });
  const arch = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x17191c, metalness: 0.2, roughness: 0.65 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.85 });
  const neon = new THREE.MeshStandardMaterial({ color: NEON, emissive: NEON, emissiveIntensity: 2.4 });
  const headlight = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4d6, emissiveIntensity: 1.6 });
  const taillight = new THREE.MeshStandardMaterial({ color: 0xff2d3f, emissive: 0xff2d3f, emissiveIntensity: 1.4 });
  const fusion = new THREE.MeshStandardMaterial({ color: 0xf2f2f0, roughness: 0.4 });

  const add = (geometry: THREE_NS.BufferGeometry, material: THREE_NS.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    car.add(mesh);
    return mesh;
  };

  // Wedge body up to the beltline
  const lower = profile(THREE, [
    [-2.08, 0],
    [-2.12, 0.2],
    [-2.05, 0.31],
    [-0.62, 0.5],
    [1.86, 0.52],
    [2.1, 0.53],
    [2.12, 0],
  ]);
  add(extrude(THREE, lower, 1.82), stainless);

  // Cabin, narrower than the body (tumblehome), stainless with glass laid over it
  const cabin = profile(THREE, [
    [-0.6, 0.5],
    [0.05, 0.82],
    [0.72, 0.82],
    [1.84, 0.53],
  ]);
  add(extrude(THREE, cabin, 1.44, 0.025), stainless);

  // A glass panel lying on a sloped edge of the cabin, from (x1, y1) to (x2, y2)
  const pane = (x1: number, y1: number, x2: number, y2: number, width: number) => {
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const mesh = add(new THREE.BoxGeometry(length, 0.01, width), glass, (x1 + x2) / 2, (y1 + y2) / 2, 0);
    mesh.rotation.z = angle;
    // Lift it off the surface along its normal
    mesh.position.x -= Math.sin(angle) * 0.03;
    mesh.position.y += Math.cos(angle) * 0.03;
    return mesh;
  };
  pane(-0.52, 0.55, 0.0, 0.8, 1.3); // windshield
  pane(0.78, 0.8, 1.78, 0.56, 1.28); // rear glass, under the louvres

  // Gull-wing door windows, with the small "toll booth" pane at the front
  const sideWindow = profile(THREE, [
    [-0.44, 0.56],
    [0.08, 0.79],
    [0.66, 0.79],
    [0.98, 0.66],
    [0.98, 0.56],
  ]);
  for (const side of [-1, 1]) {
    const win = add(new THREE.ShapeGeometry(sideWindow), glass, 0, 0, side * 0.76);
    if (side < 0) win.rotation.y = Math.PI;
    if (side < 0) win.scale.x = -1;
  }

  // Wheel arches: the black openings, empty now the wheels are folded under
  const archShape = new THREE.Shape();
  archShape.absarc(0, 0, 0.36, 0, Math.PI, false);
  archShape.closePath();
  for (const x of [-1.32, 1.36]) {
    for (const side of [-1, 1]) {
      const mesh = add(new THREE.ShapeGeometry(archShape, 16), arch, x, 0.0, side * 0.952);
      if (side < 0) mesh.rotation.y = Math.PI;
      mesh.castShadow = false;
    }
  }

  // Rear window louvres
  const slope = Math.atan2(0.82 - 0.53, 1.84 - 0.72);
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.7) / 7.6;
    const slat = add(new THREE.BoxGeometry(0.07, 0.018, 1.36), trim, 0.72 + t * (1.84 - 0.72), 0.82 - t * (0.82 - 0.53) + 0.025);
    slat.rotation.z = -slope;
  }

  // Black lower band and bumpers
  add(new THREE.BoxGeometry(4.32, 0.14, 1.9), trim, 0.02, 0.07);

  // Front: headlights either side of a black grille
  add(new THREE.BoxGeometry(0.03, 0.075, 0.5), trim, -2.14, 0.235);
  for (const z of [-0.6, 0.6]) add(new THREE.BoxGeometry(0.03, 0.075, 0.34), headlight, -2.135, 0.235, z);

  // Rear: ribbed black tail panel, red lamps, reactor vents
  add(new THREE.BoxGeometry(0.03, 0.22, 1.72), trim, 2.15, 0.3);
  for (const z of [-0.55, 0.55]) add(new THREE.BoxGeometry(0.03, 0.09, 0.52), taillight, 2.165, 0.34, z);
  for (const z of [-0.42, 0.42]) {
    const vent = add(new THREE.CylinderGeometry(0.075, 0.09, 0.22, 16), trim, 2.25, 0.17, z);
    vent.rotation.z = Math.PI / 2;
  }

  // Mr. Fusion on the rear deck
  add(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 20), fusion, 1.98, 0.63);
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), trim, 1.98, 0.755);

  // Gull-wing door seams and the body crease, cut into both sides
  const seam = (x: number, y: number, w: number, h: number) => {
    for (const side of [-1, 1]) add(new THREE.BoxGeometry(w, h, 0.006), trim, x, y, side * 0.948).castShadow = false;
  };
  seam(-0.56, 0.32, 0.014, 0.36); // door front edge
  seam(0.98, 0.33, 0.014, 0.38); // door rear edge
  seam(0.21, 0.15, 1.54, 0.012); // door bottom edge
  seam(0.02, 0.37, 4.05, 0.01); // crease along the body

  // Black side mirrors on the doors
  for (const side of [-1, 1]) add(new THREE.BoxGeometry(0.13, 0.07, 0.12), trim, -0.42, 0.6, side * 0.99);

  // Grille slats between the headlights
  for (const y of [0.215, 0.25]) add(new THREE.BoxGeometry(0.035, 0.008, 0.48), stainless, -2.15, y);

  // Rear licence plate
  add(new THREE.BoxGeometry(0.02, 0.1, 0.32), fusion, 2.17, 0.19);

  // Time-circuit cable runs along the rear deck, banded with coils
  for (const side of [-1, 1]) {
    const cable = add(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 10), trim, 1.55, 0.57, side * 0.64);
    cable.rotation.z = Math.PI / 2;
    for (const x of [1.25, 1.55, 1.85]) {
      const coil = add(new THREE.TorusGeometry(0.045, 0.012, 6, 14), stainless, x, 0.57, side * 0.64);
      coil.rotation.y = Math.PI / 2;
    }
  }

  // Hover conversion: wheels folded flat, glowing underneath
  for (const x of [-1.32, 1.36]) {
    for (const z of [-0.84, 0.84]) {
      add(new THREE.CylinderGeometry(0.33, 0.33, 0.2, 28), rubber, x, -0.1, z);
      add(new THREE.CylinderGeometry(0.2, 0.2, 0.205, 20), stainless, x, -0.1, z);
      const ring = add(new THREE.CircleGeometry(0.26, 28), neon, x, -0.205, z);
      ring.rotation.x = Math.PI / 2;
      ring.castShadow = false;
    }
  }

  // Neon tube along the underside
  const tube = add(new THREE.BoxGeometry(3.4, 0.02, 1.4), neon, 0.02, -0.012);
  tube.castShadow = false;

  return car;
}

export function TimeMachine() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current!;
    let disposed = false;
    let cleanup = () => {};

    // Three.js loads only once the garage comes into view
    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loadObserver.disconnect();
        import("three").then(async (THREE) => {
          if (disposed) return;
          const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
          if (disposed) return;
          try {
            cleanup = start(THREE, RoomEnvironment, host, () => setReady(true));
          } catch {
            // No WebGL: the 2D DeLorean stays
          }
        });
      },
      { rootMargin: "200px" },
    );
    loadObserver.observe(host);

    return () => {
      disposed = true;
      loadObserver.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div ref={hostRef} className="garage__stage" data-ready={ready || undefined}>
      <DeLoreanIcon className="garage__fallback" />
    </div>
  );
}

function start(
  THREE: Three,
  RoomEnvironment: typeof import("three/addons/environments/RoomEnvironment.js").RoomEnvironment,
  host: HTMLElement,
  onReady: () => void,
) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // The canvas is small, so render well above its size to keep the details crisp
  renderer.setPixelRatio(Math.min(window.devicePixelRatio * 2, 4));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = "garage__canvas";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
  camera.position.set(0, 2.9, 8.8);
  camera.lookAt(0, 0.5, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.5));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(1.5, 7, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 7;
  sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -3.2, right: 3.2, top: 3.2, bottom: -3.2, near: 1, far: 15 });
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x7cc8ff, 1.4);
  rim.position.set(-4, 2, -5);
  scene.add(rim);

  // Invisible ground that only shows the shadow
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // The turntable spins the car and its neon pool together
  const turntable = new THREE.Group();
  scene.add(turntable);
  const glowMap = glowTexture(THREE);
  const glowMaterial = new THREE.MeshBasicMaterial({ map: glowMap, transparent: true, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4.2), glowMaterial);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.004;
  turntable.add(glow);
  // The car's shadow sits inside the neon pool, so the gap reads on a black page too
  const shadowMap = shadowTexture(THREE);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false });
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 1.7), shadowMaterial);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.008;
  turntable.add(contactShadow);
  const car = buildDeLorean(THREE);
  turntable.add(car);

  function applyTheme() {
    const light = document.documentElement.dataset.theme === "light";
    groundMaterial.opacity = light ? 0.18 : 0.5;
    glowMaterial.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    glowMaterial.needsUpdate = true;
  }
  applyTheme();
  const themeObserver = new MutationObserver(() => {
    applyTheme();
    if (reducedMotion) render(0);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function resize() {
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (reducedMotion) render(0);
  }

  function render(t: number) {
    const lift = reducedMotion ? 0 : Math.sin(t * 1.4) * BOB;
    car.position.y = HOVER_HEIGHT + lift;
    // Closer to the ground: a brighter pool of light and a tighter, darker shadow
    glowMaterial.opacity = 0.95 - lift * 4;
    shadowMaterial.opacity = 0.6 - lift * 3;
    contactShadow.scale.setScalar(1 + lift * 1.5);
    turntable.rotation.y = reducedMotion ? -0.65 : -0.65 + (t / SECONDS_PER_TURN) * Math.PI * 2;
    renderer.render(scene, camera);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  // Animate only while the garage is on screen
  let frame = 0;
  let elapsed = 0;
  let last = 0;
  function loop(now: number) {
    elapsed += Math.min((now - last) / 1000, 0.1);
    last = now;
    render(elapsed);
    frame = requestAnimationFrame(loop);
  }
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(frame);
    if (entry.isIntersecting && !reducedMotion) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  });
  visibilityObserver.observe(host);

  render(0);
  onReady();

  return () => {
    cancelAnimationFrame(frame);
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => m.dispose());
      }
    });
    glowMap.dispose();
    shadowMap.dispose();
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
