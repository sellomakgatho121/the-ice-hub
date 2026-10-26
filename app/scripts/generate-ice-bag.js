/**
 * generate-ice-bag.js
 *
 * Procedurally generates an ice-cube-bag 3D model for THE ICE HUB
 * and exports it as GLB (glTF) for direct use in Three.js / React Three Fiber.
 *
 * Run:  node scripts/generate-ice-bag.js
 * Output: app/public/models/ice-bag.glb
 *
 * Built with three.js + a minimal custom GLB exporter.
 *
 * The model includes:
 *   - Translucent plastic bag body with gathered neck
 *   * Visible ice cubes inside the bag
 *   * A dark label panel on the front (texture to be added separately)
 *   * Contact shadow beneath the bag
 *
 * Notes:
 * - The label panel has no baked texture. Add a texture map for
 *   "THE ICE HUB / ICE CUBE BAG / PURE · CLEAN · FRESH" in a 3D editor.
 * - Origin at bag base center, ready for rotation and close-up viewing.
 */

import * as THREE from "three";
import * as fs from "fs";

const OUT_PATH = "public/models/ice-bag.glb";

/* ------------------------------------------------------------------ */
/* 1. Minimal GLB exporter                                            */
/* ------------------------------------------------------------------ */

function buildGLB(scene) {
  const buffers = [];       // ArrayBuffer chunks
  const byteOffsets = [];   // byteOffset per buffer
  const accessors = [];     // glTF accessor entries
  const bufferViews = [];   // glTF bufferView entries
  const materials = [];     // glTF material entries
  const meshes = [];        // glTF mesh entries
  const nodes = [];         // glTF node entries
  const meshesById = new Map(); // mesh -> glTF mesh index

  // Collect all meshes from the scene
  const meshesList = [];
  scene.traverse((object) => {
    if (object.isMesh) {
      meshesList.push(object);
    }
  });

  function appendBuffer(buffer) {
    const byteOffset = buffers.reduce((sum, b) => sum + b.byteLength, 0);
    buffers.push(buffer);
    return byteOffset;
  }

  function createBufferView(buffer, byteOffset, byteLength, target) {
    return {
      buffer: 0,
      byteOffset,
      byteLength,
      ...(target !== undefined ? { target } : {}),
    };
  }

  function createAccessor(bufferView, componentType, count, type, min, max, normalized = false) {
    return {
      bufferView,
      componentType,
      count,
      type,
      ...(min !== undefined ? { min } : {}),
      ...(max !== undefined ? { max } : {}),
      ...(normalized ? { normalized } : {}),
    };
  }

  // Process each mesh
  for (const mesh of meshesList) {
    const geometry = mesh.geometry;
    const material = mesh.material;

    // Get or create material index
    let matIndex = materials.findIndex((m) => m === material);
    if (matIndex === -1) {
      matIndex = materials.length;
      const matEntry = {
        name: material.name || "material",
        pbrMetallicRoughness: {
          baseColorFactor: [
            material.color.r,
            material.color.g,
            material.color.b,
            material.opacity,
          ],
          metallicFactor: material.metalness,
          roughnessFactor: material.roughness,
        },
        ...(material.transparent ? { alphaMode: "BLEND" } : {}),
        ...(material.emissive && material.emissive.getHex() !== 0
          ? { emissiveFactor: [material.emissive.r, material.emissive.g, material.emissive.b] }
          : {}),
        doubleSided: material.side === THREE.DoubleSide,
      };
      materials.push(matEntry);
    }

    // Process geometry attributes
    const attributes = {};
    const primitive = {
      attributes,
      material: matIndex,
    };

    const positionAttribute = geometry.attributes.position;
    const normalAttribute = geometry.attributes.normal;
    const uvAttribute = geometry.attributes.uv;

    // POSITION
    {
      const data = positionAttribute.array;
      const byteOffset = appendBuffer(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
      bufferViews.push(createBufferView(0, byteOffset, data.byteLength, 34962)); // ARRAY_BUFFER
      // Compute min/max manually
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      for (let i = 0; i < data.length; i += 3) {
        if (data[i] < minX) minX = data[i];
        if (data[i] > maxX) maxX = data[i];
        if (data[i + 1] < minY) minY = data[i + 1];
        if (data[i + 1] > maxY) maxY = data[i + 1];
        if (data[i + 2] < minZ) minZ = data[i + 2];
        if (data[i + 2] > maxZ) maxZ = data[i + 2];
      }
      attributes.POSITION = createAccessor(
        bufferViews.length - 1,
        5126, // FLOAT
        positionAttribute.count,
        "VEC3",
        [minX, minY, minZ],
        [maxX, maxY, maxZ]
      );
    }

    // NORMAL
    if (normalAttribute) {
      const data = normalAttribute.array;
      const byteOffset = appendBuffer(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
      bufferViews.push(createBufferView(0, byteOffset, data.byteLength, 34962));
      attributes.NORMAL = createAccessor(
        bufferViews.length - 1,
        5126,
        normalAttribute.count,
        "VEC3"
      );
    }

    // TEXCOORD_0
    if (uvAttribute) {
      const data = uvAttribute.array;
      const byteOffset = appendBuffer(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
      bufferViews.push(createBufferView(0, byteOffset, data.byteLength, 34962));
      attributes.TEXCOORD_0 = createAccessor(
        bufferViews.length - 1,
        5126,
        uvAttribute.count,
        "VEC2"
      );
    }

    // INDICES
    const index = geometry.index;
    if (index) {
      const data = index.array;
      const byteOffset = appendBuffer(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
      bufferViews.push(createBufferView(0, byteOffset, data.byteLength, 34963)); // ELEMENT_ARRAY_BUFFER
      // Compute min/max for indices
      let minIdx = Infinity, maxIdx = -Infinity;
      for (let i = 0; i < data.length; i++) {
        if (data[i] < minIdx) minIdx = data[i];
        if (data[i] > maxIdx) maxIdx = data[i];
      }
      primitive.indices = createAccessor(
        bufferViews.length - 1,
        5126,
        index.count,
        "SCALAR",
        [minIdx],
        [maxIdx],
        true
      );
    }

    meshes.push({
      name: mesh.name || "mesh",
      primitives: [primitive],
    });
  }

  // Build nodes
  for (const mesh of meshesList) {
    nodes.push({
      name: mesh.name || "mesh",
      mesh: meshesList.indexOf(mesh),
      translation: [mesh.position.x, mesh.position.y, mesh.position.z],
      rotation: [mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w],
      scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
    });
  }

  // Build glTF JSON
  const gltf = {
    asset: {
      version: "2.0",
      generator: "the-ice-hub generate-ice-bag.js",
    },
    scene: 0,
    scenes: [
      {
        name: "Scene",
        nodes: nodes.map((_, i) => i),
      },
    ],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [
      {
        byteLength: buffers.reduce((sum, b) => sum + b.byteLength, 0),
      },
    ],
  };

  // Concatenate all buffers
  const totalLength = buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    combined.set(buf, offset);
    offset += buf.byteLength;
  }

  // JSON chunk
  const jsonBytes = new TextEncoder().encode(JSON.stringify(gltf));
  const jsonPaddedLength = Math.ceil(jsonBytes.length / 4) * 4;
  const jsonPadded = new Uint8Array(jsonPaddedLength);
  jsonPadded.set(jsonBytes);

  // BIN chunk
  const binChunk = combined;

  // Calculate total GLB size
  const totalLengthGLB = 12 + (8 + jsonPaddedLength) + (8 + binChunk.byteLength);

  // GLB header - build with correct length from the start
  const header = new Uint8Array(12);
  header[0] = 0x67; // 'g'
  header[1] = 0x6C; // 'l'
  header[2] = 0x74; // 't'
  header[3] = 0x46; // 'F'
  header[4] = 0x02; // version 2
  header[5] = 0x00;
  header[6] = 0x00;
  header[7] = 0x00;
  header[8] = totalLengthGLB & 0xff;
  header[9] = (totalLengthGLB >> 8) & 0xff;
  header[10] = (totalLengthGLB >> 16) & 0xff;
  header[11] = (totalLengthGLB >> 24) & 0xff;

  // Build final GLB
  const glb = new Uint8Array(totalLengthGLB);
  glb.set(header, 0);
  glb.set(jsonPadded, 12);
  glb.set(binChunk, 12 + 8 + jsonPaddedLength);

  return glb;
}

/* ------------------------------------------------------------------ */
/* 2. Bag body geometry: deformed sphere (pillow shape)               */
/* ------------------------------------------------------------------ */
function buildBagGeometry() {
  const geo = new THREE.SphereGeometry(1, 48, 32);
  const pos = geo.attributes.position;
  const tmp = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    const { x, y, z } = tmp;
    const lat = Math.asin(Math.max(-1, Math.min(1, y)));
    const bulge = Math.cos(lat);
    const s = 0.8 + 0.35 * bulge;
    tmp.x = x * s;
    tmp.z = z * s;
    if (y < -0.55) {
      tmp.y = -0.55 + (y + 0.55) * 0.5;
      tmp.x *= 0.92;
      tmp.z *= 0.92;
    }
    tmp.x += Math.sin(lat * 2) * 0.03;
    pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/* 3. Neck geometry: gathered cylinder                                */
/* ------------------------------------------------------------------ */
function buildNeckGeometry() {
  return new THREE.CylinderGeometry(0.24, 0.16, 0.34, 24, 1);
}

/* ------------------------------------------------------------------ */
/* 4. Build the complete scene                                        */
/* ------------------------------------------------------------------ */
function buildScene() {
  const scene = new THREE.Scene();

  // ---- Materials ----
  const bagMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.06,
    roughness: 0.22,
    transmission: 0.85,
    transparent: true,
    opacity: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.10,
    envMapIntensity: 1.0,
    side: THREE.DoubleSide,
  });

  const neckMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.12,
    roughness: 0.2,
    transmission: 0.9,
    transparent: true,
    opacity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  const labelMat = new THREE.MeshStandardMaterial({
    color: 0x1a2e3c,
    roughness: 0.8,
    metalness: 0.1,
  });

  const iceMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8f5ff,
    metalness: 0.04,
    roughness: 0.14,
    transmission: 0.97,
    transparent: true,
    opacity: 0.96,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  });

  const shadowMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
  });

  // ---- Bag body ----
  const bodyGeo = buildBagGeometry();
  const body = new THREE.Mesh(bodyGeo, bagMat);
  body.position.set(0, -0.06, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  body.name = "bag-body";
  scene.add(body);

  // ---- Neck ----
  const neckGeo = buildNeckGeometry();
  const neck = new THREE.Mesh(neckGeo, neckMat);
  neck.position.set(0, 0.72, 0);
  neck.castShadow = true;
  neck.receiveShadow = true;
  neck.name = "bag-neck";
  scene.add(neck);

  // ---- Label panel ----
  const labelGeo = new THREE.PlaneGeometry(0.78, 0.52, 6, 6);
  const lp = labelGeo.attributes.position;
  for (let i = 0; i < lp.count; i++) {
    const x = lp.getX(i);
    const z = lp.getZ(i);
    const d = Math.sqrt(x * x + z * z);
    if (d > 0.34) {
      const f = 0.34 / d;
      lp.setX(i, x * f);
      lp.setZ(i, z * f);
    }
  }
  lp.needsUpdate = true;
  labelGeo.computeVertexNormals();
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0, -0.30, 0.436);
  label.rotation.x = -0.12;
  label.name = "bag-label";
  scene.add(label);

  // ---- Ice cubes inside the bag ----
  const cubeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
  const rawPositions = [
    [-0.28, -0.20, 0.10], [0.22, -0.12, 0.08], [-0.10, 0.05, 0.14],
    [0.18, 0.02, -0.06], [-0.24, 0.18, -0.02], [0.04, -0.28, 0.02],
    [0.12, 0.22, 0.06], [-0.16, -0.10, -0.12], [0.26, 0.08, 0.04],
    [-0.10, -0.24, -0.08], [0.02, 0.16, -0.14], [-0.22, 0.00, 0.08],
    [0.14, -0.04, 0.16], [-0.06, 0.24, -0.04],
  ];
  const cubes = rawPositions.map(([x, y, z], i) => ({
    x, y, z,
    s: 0.7 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    index: i,
  }));

  cubes.forEach(({ x, y, z, s, phase, index }, i) => {
    const cube = new THREE.Mesh(cubeGeo, iceMat);
    cube.position.set(x, y, z);
    cube.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    cube.scale.set(s, s, s);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.name = `ice-cube-${i}`;
    cube.userData = { phase, index, baseY: y };
    scene.add(cube);
  });

  // ---- Contact shadow plane ----
  const shadowGeo = new THREE.PlaneGeometry(2.2, 2.2, 32, 32);
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.set(0, -0.62, 0);
  shadow.rotation.x = -Math.PI / 2;
  shadow.receiveShadow = true;
  shadow.name = "contact-shadow";
  scene.add(shadow);

  return scene;
}

/* ------------------------------------------------------------------ */
/* 5. Export to GLB                                                   */
/* ------------------------------------------------------------------ */
async function main() {
  console.log("[ice-bag] Building scene...");
  const scene = buildScene();

  console.log("[ice-bag] Exporting to GLB...");
  const glb = buildGLB(scene);

  fs.mkdirSync("public/models", { recursive: true });
  fs.writeFileSync(OUT_PATH, glb);
  console.log(`[ice-bag] Exported ${OUT_PATH}`);
  console.log(`[ice-bag] Size: ${(glb.byteLength / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("[ice-bag] Fatal:", err);
  process.exit(1);
});
