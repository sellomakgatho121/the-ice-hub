import * as THREE from "../vendor/three.module.min.js";

const canvas = document.querySelector("[data-crystal]");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const key = new THREE.PointLight(0xc7f3ff, 18, 18);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0x78a9b8, 12, 16);
  rim.position.set(4, -2, 3);
  scene.add(rim);
  const warm = new THREE.PointLight(0xd99e5a, 7, 14);
  warm.position.set(0, -4, 2);
  scene.add(warm);
  scene.add(new THREE.AmbientLight(0x8fb8c4, 1.4));

  const crystal = new THREE.Group();
  scene.add(crystal);
  const shards = [];
  const origins = [
    [-.56, .56, .36], [.56, .56, .18], [-.56, -.56, .1], [.56, -.56, .4],
    [-.38, .3, -.55], [.42, .38, -.5], [-.4, -.42, -.45], [.45, -.35, -.5]
  ];
  const directions = [
    [-1.1, 1.0, .3], [1.2, .9, .45], [-1.2, -.8, .2], [1.1, -.95, .5],
    [-.7, .5, -1], [.8, .75, -.8], [-.85, -.7, -.7], [.9, -.6, -.8]
  ];

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xd8edf3,
    roughness: 0.08,
    metalness: 0,
    transmission: 0.84,
    thickness: 0.9,
    ior: 1.31,
    transparent: true,
    opacity: 0.82,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    side: THREE.DoubleSide
  });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xc7edf5, transparent: true, opacity: 0.28 });

  origins.forEach((origin, index) => {
    const geometry = new THREE.OctahedronGeometry(.86 + (index % 3) * .08, 1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...origin);
    mesh.scale.set(1.05, 1.08, 1.05);
    mesh.rotation.set(index * .31, index * .47, index * .19);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 24), edgeMaterial);
    mesh.add(edges);
    crystal.add(mesh);
    shards.push({ mesh, origin: new THREE.Vector3(...origin), direction: new THREE.Vector3(...directions[index]).normalize(), seed: index + 1 });
  });

  let progress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let visible = true;
  let raf = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(time = 0) {
    raf = 0;
    const wave = Math.sin(Math.min(1, progress) * Math.PI);
    const explosion = Math.pow(wave, 1.5);
    shards.forEach(({ mesh, origin, direction, seed }) => {
      mesh.position.copy(origin).addScaledVector(direction, explosion * 2.2);
      mesh.rotation.x = seed * .31 + explosion * seed * .18;
      mesh.rotation.y = seed * .47 - explosion * seed * .13;
      mesh.rotation.z = seed * .19 + explosion * .4;
    });
    crystal.rotation.y += (pointerX * .18 + progress * 1.5 - crystal.rotation.y) * .055;
    crystal.rotation.x += (pointerY * .12 - .18 + progress * .36 - crystal.rotation.x) * .055;
    crystal.scale.setScalar(.92 + Math.sin(progress * Math.PI) * .08);
    renderer.render(scene, camera);
    if (visible && !reduced) raf = requestAnimationFrame(render);
  }

  function start() { if (!raf) raf = requestAnimationFrame(render); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  window.addEventListener("icehub:crack", (event) => {
    progress = event.detail.progress;
    if (reduced) render();
  });
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / window.innerWidth - .5;
    pointerY = event.clientY / window.innerHeight - .5;
  }, { passive: true });
  window.addEventListener("resize", () => { resize(); render(); }, { passive: true });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }, { rootMargin: "120px" }).observe(canvas);

  resize();
  render();
}
